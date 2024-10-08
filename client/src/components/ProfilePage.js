import React, { useEffect, useState, useRef } from "react";
import ChatBar from "./ChatBar";
import axios from "axios";
import ProfileCard from "./ProfileCard";
import toast, { Toaster } from "react-hot-toast";

const ProfilePage = ({ socket }) => {

	const [badges, setBadges] = useState([]);
	const [profileBadges, setProfileBadges] = useState([]);
	const [bio, setBio] = useState("");
	const [pronouns, setPronouns] = useState("");
	const [visibleProfile, setVisibleProfile] = useState(false);
	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [badgesPerPage, setBadgesPerPage] = useState(500);
	const indexOfLastBadge = currentPage * badgesPerPage;
	const indexOfFirstBadge = indexOfLastBadge - badgesPerPage;
	const currentBadges = badges.slice(indexOfFirstBadge, indexOfLastBadge);
	const paginate = (pageNumber) => setCurrentPage(pageNumber);
	const pageNumbers = [];
	for (let i = 1; i <= Math.ceil(badges.length / badgesPerPage); i++) {
		pageNumbers.push(i);
	}
	// Search functionality
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const loadingGif = require("../img/loading.gif");

	useEffect(() => {
		setSearchResults([]);
		setIsLoading(true);
		// Clear the previous timeout if the searchTerm changes before the delay is over
		const delayDebounceFn = setTimeout(() => {
			
			if (searchTerm) {
				
				axios.get(`http://localhost:4000/badges/search?q=${searchTerm}`)
					.then(response => {
						setSearchResults(response.data);
						setIsLoading(false);
					})
					.catch(error => {
						console.error("Error fetching search results:", error);
						setSearchResults([]);
						setIsLoading(false);
					});
			} else {
				// Optionally clear search results when there's no search term
				setSearchResults([]);
			}
		}, 1000); // 1000ms delay
	
		// Cleanup function to clear the timeout if the component unmounts
		return () => clearTimeout(delayDebounceFn);
	}, [searchTerm]);

	const fetchBadges = async () => {
		try {
			// Get max number of pages
			const response = await axios.get("http://localhost:4000/badges/pages");
			const numPages = await response.data;
			const badgePromises = [];
			// Fetch all badges
			for (let page = 1; page <= numPages; page++) {
				badgePromises.push(axios.get(`http://localhost:4000/badges?page=${page}`));
			}
			const responses = await Promise.all(badgePromises);
			const data = responses.flatMap((response) => response.data);
			setBadges(data);
		} catch (error) {
			console.error("Failed to fetch badges:", error);
		}
	}

	const fetchProfileBadges = async () => {
		try {
			const response = await axios.get(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/badges`);
			const data = await response.data;
			setProfileBadges(data);
		} catch (error) {
			console.error("Failed to fetch profile badges:", error);
		}
	}

	const fetchBio = async () => {
		try {
			const response = await axios.get(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/bio`);
			const data = await response.data;
			setBio(data);
		} catch (error) {
			console.error("Failed to fetch bio:", error);
		}
	}

	const updateBio = async (newBio) => {
		try {
			const response = await axios.post(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/bio`, { bio: newBio });
			const data = await response.data;
			// setBio(data);
		} catch (error) {
			console.error("Failed to update bio:", error);
		}
	}

	const updatePronouns = async (newPronouns) => {
		try {
			const response = await axios.post(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/pronouns`, { pronouns: newPronouns });
			const data = await response.data;
			// setPronouns(data);
		} catch (error) {
			console.error("Failed to update pronouns:", error);
		}
	}

	const fetchPronouns = async () => {
		try {
			const response = await axios.get(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/pronouns`);
			const data = await response.data;
			setPronouns(data);
		} catch (error) {
			console.error("Failed to fetch pronouns:", error);
		}
	}

	const addBadgeToProfile = async (badgeName) => {
		try {
			// Remove .gif from badge name
			badgeName = badgeName.replace(".gif", "");
			const response = await axios.post(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/badges`, { badge: badgeName });
			const data = await response.data;
			setProfileBadges(data);
			fetchProfileBadges();
		} catch (error) {
			console.error("Failed to add badge to profile:", error);
		}
	};

	const removeBadgeFromProfile = async (badgeName) => {
		try {
			// Remove .gif from badge name
			badgeName = badgeName.replace(".gif", "");
			const response = await axios.delete(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/badges`, { data: { badge: badgeName } });
			const data = await response.data;
			setProfileBadges(data);
			fetchProfileBadges();
		} catch (error) {
			console.error("Failed to remove badge from profile:",
			error);
		}
	};

	const toggleProfileCard = () => {
		setVisibleProfile(!visibleProfile);
	};

	const saveChanges = () => {
		updateBio(bio);
		updatePronouns(pronouns);
		fetchProfileBadges();
		toast.success("Profile updated!");
	}

	useEffect(() => {
		fetchBadges();
		fetchProfileBadges();
		fetchBio();
		fetchPronouns();
	}, []);


	return (
		<div className="chat">
			<Toaster />
			<ChatBar socket={socket} />
			
			<div className="chat-main">
				<header className="chat-mainHeader">
					<div className="chat-serverinfo">
						<h3>{localStorage.getItem("userName")}</h3>
						<p className="subtitle">Modify your profile</p>
					</div>
				</header>
				
				<ProfileCard username={localStorage.getItem("userName")} isVisible={visibleProfile} toggleVisible={toggleProfileCard} />
				<h3 style={{marginBottom: '5px'}}>Your bio:</h3>
				<textarea
					className="chat-bio"
					value={bio}
					onChange={(e) => setBio(e.target.value)}
				/>
				{/* <button onClick={() => updateBio(bio)}>Update bio</button> */}
				<h3 style={{marginTop: '10px', marginBottom: '5px'}}>Your pronouns:</h3>
				<input
					className="chat-bio"
					value={pronouns}
					onChange={(e) => setPronouns(e.target.value)}
				/>
                <h3 style={{marginTop: '10px', marginBottom: '5px'}}>Your badges:</h3>
				<div className="chat-badges">
					{profileBadges.map((badge, index) => (
						<div key={index} className="badge" onClick={() => removeBadgeFromProfile(badge)}>
							{/* <p>{badge}</p> */}
							<img title={badge} className="badge" src={`http://localhost:4000/badges/${badge}.gif`} alt={badge} />
						</div>
					))}
				</div>
				<h3 style={{marginTop: '5px', marginBottom: '5px'}}>All badges:</h3>
				<p style={{textAlign: 'left'}}className="message-timestamp">These badges have been scraped from various websites, and we do not necessarily endorse any content presented.</p>
				<input
					className="chat-bio"
					type="text"
					placeholder="Search badges..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{searchTerm === '' && (
					<div style={{marginTop: "10px"}}>
						<div className="chat-badges">
							{currentBadges.map((badge, index) => (
								<div key={index} className="badge" onClick={() => addBadgeToProfile(badge)}>
									{/* <p>{badge}</p> */}
									<img title={badge.slice(0, -4)} className="badge" src={`http://localhost:4000/badges/${badge}`} alt={badge} />
								</div>
							))}
						</div>
						<div className="pagination">
							{pageNumbers.map(number => (
								<button
									key={number}
									onClick={() => paginate(number)}
									className={currentPage === number ? 'selected-page' : 'page'}
								>
									{number}
								</button>
							))}
						</div>
					</div>
				)}
				{searchTerm !== '' && (
					
					<div>
						{isLoading && (
							<img src={loadingGif} alt="Loading..." style={{width: '50px', height: '50px', marginTop: '5px', marginBottom: '5px'}} />
						)}
						<div className="chat-badges">
							{searchResults.map((badge, index) => (
								<div key={index} className="badge" onClick={() => addBadgeToProfile(badge)}>
									{/* <p>{badge}</p> */}
									<img title={badge.slice(0, -4)} className="badge" src={`http://localhost:4000/badges/${badge}`} alt={badge} />
								</div>
							))}
						</div>
					</div>
				)}
				<div className="profileButtons-container">
					<button onClick={toggleProfileCard} className="smileyPicker-btn">Preview</button>
					<button onClick={saveChanges} className="send-btn" style={{marginLeft: '10px'}}>Save</button>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
