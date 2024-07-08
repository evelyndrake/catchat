import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"
import { useParams } from "react-router";

const ChatBar = ({ socket }) => {
	const [users, setUsers] = useState([]);
	const [servers, setServers] = useState([]);
	const [inputServerID, setInputServerID] = useState("");
	const { server } = useParams();
	const [currentServer , setCurrentServer] = useState("");
	const [userList, setUserList] = useState([]);
	const catGif = require("../img/cat.gif");
	useEffect(() => {
		socket.on("newUserResponse", (data) => setUsers(data));
	}, [socket, users]);

	// On component load, get servers from api
	useEffect(() => {
		fetchServers();
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [server]);

	async function fetchServers() {
		try {
			const response = await axios.get(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/servers`);
			setServers(response.data);
		} catch (error) {
			console.error("Failed to fetch servers:", error);
		}
	}

	async function fetchUsers() {
		try {
			const response = await axios.get(`http://localhost:4000/api/servers/${server}/members`)
			setUserList(response.data);
			// console.log(response.data);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		}
	
	}

	return (
		<div className="chat__sidebar">
			<Toaster />
			<div className="logo">
				<h2>KittyChat</h2>
				<img src={catGif} alt="cat" style={{ marginLeft: "10px", width: "48px", height: "auto", imageRendering: "pixelated", transform: "scaleX(-1)" }} />
			</div>
			
			<div>
			<h4 className="chat__header">NAVIGATION</h4>
                <div className="chat__navigation">
                    {/* <Link to="/">Home</Link>  */}
					<ul>
						{/* <li>
							<Link to="/chat">Chat</Link>
						</li> */}
						<li>
							<Link to="/profile">Profile</Link>
						</li>
						<li>
							<Link to="/settings">Settings</Link>
						</li>
					</ul>
                </div>
				{/* <h4 className="chat__header">ACTIVE USERS</h4>
				<div className="chat__users">
					{users.map((user) => (
						<p key={user.socketID}>{user.userName}</p>
					))}
				</div> */}
				{ userList.length > 0 && (
					<>
						<h4 className="chat__header">MEMBERS</h4>
						<div className="chat__navigation">
							{userList.map((user) => (
								<p key={user.socketID}>{user}</p>
							))}
						</div>
					</>
				)}
				<h4 className="chat__header">SERVERS</h4>
				<div className="chat__navigation">
					<ul>
						{servers.map((server) => (
							<li key={server.id}>
								<Link to={`/chat/${server.code}`}>{server.displayName}</Link>
							</li>
						))}
					</ul>
				</div>
				<br />
				<p>Join a server:</p>
				<input
					type="text"
					value={inputServerID}
					onChange={(e) => setInputServerID(e.target.value)}
					placeholder="Server Code"
					style={{marginTop: "5px", marginLeft: "10px", marginBottom: "15px"}}
				/>
				<button
					onClick={async () => {
						try {
							await axios.post(`http://localhost:4000/api/servers/${inputServerID}/join`, {
								username: localStorage.getItem("userName"),
							});
							await fetchServers();
							toast.success("Successfully joined server!");
						} catch (error) {
							toast.error("Failed to join server", { icon: "❌" });
						}
						setInputServerID("");
					}}
				>
					Join
				</button>
				<Link to="/create-server">Create a server</Link>
			</div>
		</div>
	);
};

export default ChatBar;
