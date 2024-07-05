import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const ProfileCard = ({username, isVisible, toggleVisible}) => {
    
    const [profileBadges, setProfileBadges] = useState([]);
    const [profileBio, setProfileBio] = useState("");
    const [profilePronouns, setProfilePronouns] = useState("");
    const cardRef = useRef(null);

    

    const fetchProfileBadges = async () => {
		try {
			const response = await axios.get(`http://localhost:4000/api/accounts/${username}/badges`);
			const data = await response.data;
			setProfileBadges(data);
		} catch (error) {
			console.error("Failed to fetch profile badges:", error);
		}
	}

    const fetchProfileBio = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/accounts/${username}/bio`);
            const data = await response.data;
            setProfileBio(data);
        }
        catch (error) {
            console.error("Failed to fetch bio:", error);
        }
    }

    const fetchProfilePronouns = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/accounts/${username}/pronouns`);
            const data = await response.data;
            setProfilePronouns(data);
        }
        catch (error) {
            console.error("Failed to fetch pronouns:", error);
        }
    }

    useEffect(() => {
        fetchProfileBadges();
        fetchProfileBio();
        fetchProfilePronouns();
    }, [username, isVisible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                toggleVisible();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [toggleVisible]);

    // TODO: Don't save changes until a save button is pressed, which also shows a toast on press
    return isVisible ? (
        <div className="profile-card" ref={cardRef}>
            
            {/* close button */}
            <button className="profile-card__close" onClick={toggleVisible}>
                <strong>X</strong>
            </button>

            <div className="profile-card__name">
                <h3>{username}</h3>  
                {profilePronouns !== 'unset' && <i>({profilePronouns})</i>}
            </div>
            
            <div className="profile-card__bio">
                <p>{profileBio}</p>
            </div>

            
            {/* <br /> */}
            <div className="profile-card__badges">
                {profileBadges.map((badge, index) => (
                    <div key={index} className="badge">
                        {/* <p>{badge}</p> */}
                        <img title={badge} className="badge" src={`http://localhost:4000/badges/${badge}.gif`} alt={badge} />
                    </div>
                ))}
            </div>
        </div>
    ) : null;
};

export default ProfileCard;