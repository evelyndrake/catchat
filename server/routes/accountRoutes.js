const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const Server = require('../models/serverModel'); // Import the Server model
const uuid = require('uuid-by-string');

// TODO: We should just have a single endpoint to GET an entire account object,
// not separate endpoints for each field (bio, pronouns, etc.) Same for the
// other endpoints and POST/PATCH/DELETE requests Endpoint to return the badges
// array of a user

// Endpoint to login given a username and password, checking against the UUID
router.post("/api/accounts/login", async (req, res) => {
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

// Endpoint to return the badges array of a user
router.get("/api/accounts/:username/badges", async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  res.json(account.badges);
});

// Endpoint to add a badge to a user
router.post("/api/accounts/:username/badges", async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  const badge = req.body.badge;
  // Ensure the badge isn't already in the array
  if (account.badges.includes(badge)) {
    return res
      .status(400)
      .json({message: "Badge already exists"});
  }
  account
    .badges
    .push(badge);
  await account.save();
  res.json(account.badges);
});

// Endpoint to remove a badge from a user
router.delete("/api/accounts/:username/badges", async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  const badge = req.body.badge;
  // Ensure the badge is in the array
  if (!account.badges.includes(badge)) {
    return res
      .status(400)
      .json({message: "Badge does not exist"});
  }
  account.badges = account
    .badges
    .filter(b => b !== badge);
  await account.save();
  res.json(account.badges);
});

// Endpoint to create an account and add to the database
router.post("/api/accounts", async(req, res) => {
  // Request contains fields: username, password. Convert these to strings
  console.log(req.body);
  const accountUsername = typeof req.body.username === 'string'
    ? req.body.username
    : '';
  const password = typeof req.body.password === 'string'
    ? req.body.password
    : '';
  if (!accountUsername || !password) {
    return res
      .status(400)
      .json({message: "Username and password are required"});
  }
  const accountID = uuid(accountUsername + password)
  const account = new Account({username: accountUsername, UUID: accountID});
  // Check to see if the username is unique
  const existingAccount = await Account.findOne({username: accountUsername});
  if (existingAccount) {
    return res
      .status(400)
      .json({message: "Account already exists"});
  }
  await account.save();
  if (account) {
    res.json({message: "Account created", account: account});
  }
});

// Endpoint to set a user's bio
router.post('/api/accounts/:username/bio', async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  const bio = req.body.bio;
  account.bio = bio;
  await account.save();
  res.json(account);
});

// Endpoint to get a user's bio
router.get('/api/accounts/:username/bio', async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  res.json(account.bio);
});

// Endpoint to set a user's pronouns
router.post('/api/accounts/:username/pronouns', async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  const pronouns = req.body.pronouns;
  account.pronouns = pronouns;
  await account.save();
  res.json(account);
});

// Endpoint to get a user's pronouns
router.get('/api/accounts/:username/pronouns', async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  res.json(account.pronouns);
});

// Endpoint to get a user's servers
router.get('/api/accounts/:username/servers', async(req, res) => {
  const accountUsername = req.params.username;
  const account = await Account.findOne({username: accountUsername});
  if (!account) {
    return res
      .status(404)
      .json({message: "Account not found"});
  }
  const ids = account.servers;
  const servers = await Server.find({
    code: {
      $in: ids
    }
  });
  res.json(servers);
});

module.exports = router;