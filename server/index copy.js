const express = require("express");
const cors = require("cors");
const app = express();
const path = require('path');
const fs = require('fs');
app.use(express.json());
const PORT = 4000;
const http = require("http").Server(app);
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose");
const Account = require("./models/accountModel");
const ChatMessage = require("./models/messageModel");
const Server = require("./models/serverModel");
const dotenv = require('dotenv');
const uuid = require('uuid-by-string');
// const referralCodes = require('referral-codes');
// TODO: SECTION THIS UP INTO MULTIPLE FILES 😭😭
const socketIO = require("socket.io")(http, { // Set up socket.io with CORS
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	},
});
app.use(cors());
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI, { // Set up the MongoDB client
	serverApi: {
	  version: ServerApiVersion.v1,
	  strict: true,
	  deprecationErrors: true,
	}
});

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

let users = [];

socketIO.on("connection", (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);
	socket.on("message", (data) => {
		console.log(data);
		const message = new ChatMessage({
			name: data.name,
			text: data.text,
			timestamp: new Date(),
			server: data.server
		});
		message.save();
		socketIO.emit("messageResponse", data);
	});
	socket.on("typing", (data) =>
		socket.broadcast.emit("typingResponse", data),
	);
	//Listens when a new user joins the server
	socket.on("newUser", (data) => {
		//Adds the new user to the list of users
		users.push(data);
		// console.log(users);
		//Sends the list of users to the client
		socketIO.emit("newUserResponse", users);
	});

	socket.on("disconnect", () => {
		console.log("🔥: A user disconnected");
		//Updates the list of users when a user disconnects from the server
		users = users.filter((user) => user.socketID !== socket.id);
		// console.log(users);
		//Sends the list of users to the client
		socketIO.emit("newUserResponse", users);
		socket.disconnect();
	});
});

// Endpoint to get all connected users
app.get("/api/users", (req, res) => {
	res.json(users);
});

app.get("/api", (req, res) => {
	res.json({
		message: "Hello world",
	});
});
app.use(cors());

// Endpoint to login given a username and password, checking against the UUID
app.post("/api/accounts/login", async (req, res) => {
	// Request contains fields: username, password. Convert these to strings
	const accountUsername = typeof req.body.username === 'string' ? req.body.username : '';
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (!accountUsername || !password) {
		return res.status(400).json({
			message: "Username and password are required",
		});
	}
	const accountID = uuid(accountUsername+password)
	const account = await Account.findOne({ username: accountUsername, UUID: accountID });
	if (account) {
		res.json({
			message: "Login successful",
			account: account,
		});
	} else {
		// Check if there is an account with the same name
		const existingAccount = await Account.findOne({ username:
			accountUsername });
		if (existingAccount) {
			return res.status(400).json({
				message: "Password is incorrect",
			});
		}
		res.status(400).json({
			message: "Account does not exist",
		});
	}
});

app.use(express.static('public'));

let smileyFiles = [];
// Load all smileys into memory
const smileyDir = path.join(__dirname, 'public', 'smilies');
fs.readdir(smileyDir, (err, files) => {
	if (err) {
		console.error("Failed to list smileys:", err);
		return res.status(500).send("Failed to list smileys.");
	}
	smileyFiles = files;
	console.log(`Loaded ${smileyFiles.length} smileys`);
});

// Endpoint to list smilies
app.get("/smilies", (req, res) => {
	res.json(smileyFiles);
});

const badgesPerPage = 500;
let badgeFiles = [];
// Load all badges into memory
const badgeDir = path.join(__dirname, 'public', 'badges');
fs.readdir(badgeDir, (err, files) => {
	if (err) {
		console.error("Failed to list badges:", err);
		return res.status(500).send("Failed to list badges.");
	}
	badgeFiles = files;
	console.log(`Loaded ${badgeFiles.length} badges`);
});

// Endpoint to get badges (paginated)
app.get("/badges", (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const start = (page - 1) * badgesPerPage;
	const end = start + badgesPerPage;
	const paginatedBadgeFiles = badgeFiles.slice(start, end);
    res.json(paginatedBadgeFiles);
	// Example of a query to page 2:
	// http://localhost:4000/badges?page=2
	// Access badge X:
	// http://localhost:4000/badges/X.gif
});

// Endpoint to get number of badge pages
app.get("/badges/pages", (req, res) => {
	if (!badgeFiles || badgeFiles.length === 0) {
        return res.status(500).send("No badges loaded.");
    }
    const numPages = Math.ceil(badgeFiles.length / badgesPerPage);
    res.json(numPages);
});

// Endpoint to search for badges matching query
app.get("/badges/search", (req, res) => {
	const query = req.query.q;
	if (!query) {
		return res.status(400).json({
			message: "Query is required",
		});
	}
	const matchingBadges = badgeFiles.filter(filename =>  // Case insensitive search
        filename.toLowerCase().includes(query.toLowerCase())
    );
	res.json(matchingBadges);
	// Example query:
	// http://localhost:4000/badges/search?q=star
});

// Endpoint to return the badges array of a user
app.get("/api/accounts/:username/badges", async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne
	({ username: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	res.json(account.badges);
});

// Endpoint to add a badge to a user
app.post("/api/accounts/:username/badges", async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne
	({ username: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	const badge = req.body.badge;
	// Ensure the badge isn't already in the array
	if (account.badges.includes(badge)) {
		return res.status(400).json({
			message: "Badge already exists",
		});
	}
	account.badges.push(badge);
	await account.save();
	res.json(account.badges);
});

// Endpoint to remove a badge from a user
app.delete("/api/accounts/:username/badges", async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account
	.findOne({ username: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	const badge = req.body.badge;
	// Ensure the badge is in the array
	if (!account.badges.includes(badge)) {
		return res.status(400).json({
			message: "Badge does not exist",
		});
	}
	account.badges = account.badges.filter(b => b !== badge);
	await account.save();
	res.json(account.badges);
});

app.use(cors());
// Endpoint to create an account and add to the database
app.post("/api/accounts", async (req, res) => {
	// Request contains fields: username, password. Convert these to strings
	console.log(req.body);
	const accountUsername = typeof req.body.username === 'string' ? req.body.username : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (!accountUsername || !password) {
        return res.status(400).json({
            message: "Username and password are required",
        });
    }
	const accountID = uuid(accountUsername+password)
	const account = new Account({
		username: accountUsername,
		UUID: accountID,
	});
	// Check to see if the username is unique
	const existingAccount = await Account.findOne({ username:
		accountUsername });
	if (existingAccount) {
		return res.status(400).json({
			message: "Account already exists",
		});
	}
	await account.save();
	if (account) {
		res.json({
			message: "Account created",
			account: account,
		});
	}
});

// Endpoint to set a user's bio
app.post('/api/accounts/:username/bio', async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne({ username
		: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	const bio = req.body.bio;
	account.bio = bio;
	await account.save();
	res.json(account);
});

// Endpoint to get a user's bio
app.get('/api/accounts/:username/bio', async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne({ username
		: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	res.json(account.bio);
}
);

// Endpoint to set a user's pronouns
app.post('/api/accounts/:username/pronouns', async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne({ username
		: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	const pronouns = req.body.pronouns;
	account.pronouns = pronouns;
	await account.save();
	res.json(account);
});

// Endpoint to get a user's pronouns
app.get('/api/accounts/:username/pronouns', async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne({ username
		: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	res.json(account.pronouns);
}
);

// Endpoint to get a user's servers
app.get('/api/accounts/:username/servers', async (req, res) => {
	const accountUsername = req.params.username;
	const account = await Account.findOne
	({ username: accountUsername });
	if (!account) {
		return res.status(404).json({
			message: "Account not found",
		});
	}
	const ids = account.servers;
	const servers = await Server.find({ code: { $in: ids } });
	res.json(servers);
});

const getChatHistory = async () => {
	const history = await ChatMessage.find().sort('-timestamp').limit(100); // Get the last 100 messages
	return history.reverse();
};

app.get('/api/chat/history', async (req, res) => {
	try {
	  const history = await getChatHistory();
	  res.json(history);
	} catch (error) {
	  console.error('Failed to get chat history:', error);
	  res.status(500).send('Internal Server Error');
	}
});

// SERVER ENDPOINTS
const getServerChatHistory = async (serverCode) => {
	const history = await ChatMessage.find({ server: serverCode }).sort('-timestamp').limit(100); // Get the last 100 messages
	return history.reverse();
}

app.get('/api/servers/:code/history', async (req, res) => {
	const serverCode = req.params.code;
	try {
		const history = await getServerChatHistory(serverCode);
		res.json(history);
	} catch (error) {
		console.error('Failed to get chat history:', error);
		res.status(500).send('Internal Server Error');
	}
});

const generateServerCode = () => {
	return Math.random().toString(36).substring(2, 8);
};

app.get('/api/servers', async (req, res) => {
	const servers = await Server.find();
	res.json(servers);
});

app.post('/api/servers', async (req, res) => {
	const server = new Server({
		displayName: req.body.displayName,
		code: generateServerCode(),
		description: req.body.description,
	});
	await server.save();
	res.json(server);
});

// Endpoint to get a server by id
app.get('/api/servers/:code', async (req, res) => {
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
app.post('/api/servers/:code/join', async (req, res) => {
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
app.get('/api/servers/:code/members', async (req, res) => {
	const serverCode = req.params.code;
	const accounts = await Account.find({ servers: serverCode });
	const usernames = accounts.map(account => account.username);
	res.json(usernames);
});

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

// Serve client/src/fonts
app.use("/fonts", express.static("client/src/fonts"));