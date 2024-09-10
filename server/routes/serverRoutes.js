const express = require('express');
const router = express.Router();
const Account = require("../models/accountModel");
const ChatMessage = require("../models/messageModel");
const Server = require("../models/serverModel");

// SERVER ENDPOINTS
const getChatHistory = async () => {
	const history = await ChatMessage.find().sort('-timestamp').limit(100); // Get the last 100 messages
	return history.reverse();
};

// Endpoint to get chat history
router.get('/api/chat/history', async (req, res) => {
	try {
	  const history = await getChatHistory();
	  res.json(history);
	} catch (error) {
	  console.error('Failed to get chat history:', error);
	  res.status(500).send('Internal Server Error');
	}
});

// Method to get chat history for a specific server from the database
const getServerChatHistory = async (serverCode) => {
	const history = await ChatMessage.find({ server: serverCode }).sort('-timestamp').limit(100); // Get the last 100 messages
	return history.reverse();
}

// Endpoint to get chat history for a specific server
router.get('/api/servers/:code/history', async (req, res) => {
	const serverCode = req.params.code;
	try {
		const history = await getServerChatHistory(serverCode);
		res.json(history);
	} catch (error) {
		console.error('Failed to get chat history:', error);
		res.status(500).send('Internal Server Error');
	}
});

// Method to generate a random server code
const generateServerCode = () => {
	return Math.random().toString(36).substring(2, 8);
};

// Endpoint to get all servers
router.get('/api/servers', async (req, res) => {
	const servers = await Server.find();
	res.json(servers);
});

// Endpoint to create a new server
router.post('/api/servers', async (req, res) => {
	const server = new Server({
		displayName: req.body.displayName,
		code: generateServerCode(),
		description: req.body.description,
	});
	await server.save();
	res.json(server);
});

// Endpoint to get a server by id
router.get('/api/servers/:code', async (req, res) => {
	const serverCode = req.params.code;
	const server = await Server.findOne
	({ code: serverCode });
	if (!server) {
		return res.status(404).json({
			message: "Server not found",
		});
	}
	res.json(server);
});

// Endpoint to have a user join a server
router.post('/api/servers/:code/join', async (req, res) => {
	const serverCode = req.params.code;
	const accountUsername = req.body.username;
	const account = await Account.findOne({ username: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	const server = await Server.findOne({ code: serverCode });
	if (!server) {
		return res.status(404).json({
			message: "Server not found",
		});
	}
	if (account.servers.includes(serverCode)) {
		return res.status(400).json({
			message: "Already in server",
		});
	}
	account.servers.push(serverCode);
	await account.save();
	res.json(account.servers);
});

// Endpoint to get all usernames of all members in a server
router.get('/api/servers/:code/members', async (req, res) => {
	const serverCode = req.params.code;
	const accounts = await Account.find({ servers: serverCode });
	const usernames = accounts.map(account => account.username);
	res.json(usernames);
});

module.exports = router;