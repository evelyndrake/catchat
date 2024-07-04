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
const dotenv = require('dotenv');
const uuid = require('uuid-by-string');
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

// Endpoint to list smilies
app.get("/smilies", (req, res) => {
const smiliesDir = path.join(__dirname, 'public', 'smilies');
fs.readdir(smiliesDir, (err, files) => {
	if (err) {
	console.error("Failed to list smilies:", err);
	return res.status(500).send("Failed to list smilies.");
	}
	// Filter out non-GIF files if necessary
	const gifFiles = files.filter(file => file.endsWith('.gif'));
	res.json(gifFiles);
});
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


http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

// Serve client/src/fonts
app.use("/fonts", express.static("client/src/fonts"));