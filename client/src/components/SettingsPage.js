import React, { useEffect, useState } from "react";
import ChatBar from "./ChatBar";
import toast, { Toaster } from "react-hot-toast";
import { useDarkmode } from "../DarkModeContext.js";

const SettingsPage = ({socket}) => {

    const [darkMode, setDarkMode] = useState(() => {
        // Initialize darkMode state based on local storage
        const storedMode = localStorage.getItem("darkMode");
        return storedMode === "true" ? true : false;
    });

    useEffect(() => {
        // Apply dark mode class based on state
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

    const changeDarkMode = (isChecked) => {
        setDarkMode(isChecked);
        // Save value to local storage
        localStorage.setItem("darkMode", isChecked);
    };

    return (
        <div className="chat">
            <Toaster />
            <ChatBar socket={socket} />
            
            <div className="chat-main">
            <header className="chat-mainHeader">
					<div className="chat-serverinfo">
						<h3>Settings</h3>
						<p className="subtitle">Adjust your settings</p>
					</div>
				</header>
                <h3 style={{marginBottom: '5px'}}>Dark Mode</h3>
                <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => changeDarkMode(e.target.checked)}
                />
            </div>
        </div>
    );
};

export default SettingsPage;