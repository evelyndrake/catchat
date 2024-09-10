const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

let smileyFiles = [];
// Load all smileys into memory
const smileyDir = path.join(__dirname, '../public', 'smilies');
fs.readdir(smileyDir, (err, files) => {
	if (err) {
		console.error("Failed to list smileys:", err);
		return;
	}
	smileyFiles = files;
	console.log(`Loaded ${smileyFiles.length} smileys`);
});

// Endpoint to list smilies
router.get("/smilies", (req, res) => {
	res.json(smileyFiles);
});

const badgesPerPage = 500;
let badgeFiles = [];
// Load all badges into memory
const badgeDir = path.join(__dirname, '../public', 'badges');
fs.readdir(badgeDir, (err, files) => {
	if (err) {
		console.error("Failed to list badges:", err);
		return;
	}
	badgeFiles = files;
	console.log(`Loaded ${badgeFiles.length} badges`);
});

// Endpoint to get badges (paginated)
router.get("/badges", (req, res) => {
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
router.get("/badges/pages", (req, res) => {
	if (!badgeFiles || badgeFiles.length === 0) {
        return res.status(500).send("No badges loaded.");
    }
    const numPages = Math.ceil(badgeFiles.length / badgesPerPage);
    res.json(numPages);
});

// Endpoint to search for badges matching query
router.get("/badges/search", (req, res) => {
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

module.exports = router;