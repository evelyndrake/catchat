import React, { useEffect, useState, useRef } from "react";
import ChatBar from "./ChatBar";
import axios from "axios";
import ProfileCard from "./ProfileCard";
import toast, { Toaster } from "react-hot-toast";

const CreateServerPage = ({socket}) => {

	const [serverName, setServerName] = useState("");
	const [serverDescription, setServerDescription] = useState("");
	
	const createServer = async () => {
		if (serverName === "") {
			toast.error("Server name cannot be empty!");
			return;
		}
		try {
			const response = await axios.post("http://localhost:4000/api/servers", {
				displayName: serverName,
				description: serverDescription
			});
			toast.success("Server created successfully!");
			// Add user to the server
			await axios.post(`http://localhost:4000/api/servers/${response.data.code}/join`, { username: localStorage.getItem("userName") });
			// Redirect to the server
			window.location.href = `/chat/${response.data.code}`;
		} catch (error) {
			console.error("Failed to create server:", error);
			toast.error("Failed to create server!");
		}
	}

	return (
		<div className="chat">
			<Toaster />
			<ChatBar socket={socket} />
			
			<div className="chat-main">
				<header className="chat-mainHeader">
					<div className="chat-serverinfo">
						<h3>Create a server</h3>
						<p className="subtitle">Set up your chatroom</p>
					</div>
				</header>
				<h3 style={{marginBottom: '5px'}}>Name</h3>
				<input type="text" placeholder="Server Name" value={serverName} onChange={(e) => setServerName(e.target.value)} />
				<h3 style={{marginBottom: '5px', marginTop: '10px'}}>Description</h3>
				<input type="text" placeholder="Server Description" value={serverDescription} onChange={(e) => setServerDescription(e.target.value)} />
				<div className="profileButtons-container">
					<button onClick={createServer} className="send-btn" style={{marginTop: '20px'}}>Create!</button>
				</div>
			</div>
		</div>
	);
};

export default CreateServerPage;
