import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ChatBar = ({ socket }) => {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		socket.on("newUserResponse", (data) => setUsers(data));
	}, [socket, users]);

	return (
		<div className="chat__sidebar">
			<h2>KittyChato</h2>
			<div>
			<h4 className="chat__header">NAVIGATION</h4>
                <div className="chat__navigation">
                    {/* <Link to="/">Home</Link>  */}
					<ul>
						<li>
							<Link to="/chat">Chat</Link>
						</li>
						<li>
							<Link to="/profile">Profile</Link>
						</li>
					</ul>
                </div>
				<h4 className="chat__header">ACTIVE USERS</h4>
				<div className="chat__users">
					{users.map((user) => (
						<p key={user.socketID}>{user.userName}</p>
					))}
				</div>
			</div>
		</div>
	);
};

export default ChatBar;
