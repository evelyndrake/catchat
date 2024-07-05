import React, { useEffect, useState, useRef } from "react";
import ChatBar from "./ChatBar";
import axios from "axios";

const ProfilePage = ({ socket }) => {

	const [badges, setBadges] = useState([]);
	const [profileBadges, setProfileBadges] = useState([]);
	const [bio, setBio] = useState("");
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

	useEffect(() => {
		fetchBadges();
		fetchProfileBadges();
	}, []);


	return (
		<div className="chat">
			<ChatBar socket={socket} />
			
			<div className="chat__main">
				<header className="chat__mainHeader">
					<p>Customizing your profile!</p>
				</header>
				<h3>User bio:</h3>
				<textarea
					className="chat__bio"
					value={bio}
					onChange={(e) => setBio(e.target.value)}
				/>
				<button onClick={() => updateBio(bio)}>Update bio</button>

                <h3>Your badges:</h3>
				<div className="chat__badges">
					{profileBadges.map((badge, index) => (
						<div key={index} className="badge" onClick={() => removeBadgeFromProfile(badge)}>
							{/* <p>{badge}</p> */}
							<img className="badge" src={`http://localhost:4000/badges/${badge}.gif`} alt={badge} />
						</div>
					))}
				</div>
				<h3>All badges:</h3>
				<div className="chat__badges">
					{currentBadges.map((badge, index) => (
						<div key={index} className="badge" onClick={() => addBadgeToProfile(badge)}>
							{/* <p>{badge}</p> */}
							<img className="badge" src={`http://localhost:4000/badges/${badge}`} alt={badge} />
						</div>
					))}
				</div>
				<div className="pagination">
                    {pageNumbers.map(number => (
                        <button
							key={number}
							onClick={() => paginate(number)}
							className={currentPage === number ? 'selectedPage' : 'page'}
						>
                            {number}
                        </button>
                    ))}
                </div>
				
			</div>
		</div>
	); // TODO: Add a profile viewing page and make the usernames links to view a user's profile
};

export default ProfilePage;
