import React, { useEffect, useState, useRef } from "react";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import useSound from "use-sound";
import axios from "axios";
import { useParams } from "react-router";
// import meowSFX from "../sounds/meow_notif_send.mp3";

const meowSFX = require("../sounds/meow_notif_recieve.mp3");
const meowSFXSent = require("../sounds/meow_notif_send.mp3");

const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]);
	const [typingStatus, setTypingStatus] = useState("");
	const lastMessageRef = useRef(null);
	const [meowNotifSend] = useSound(meowSFXSent, { volume: 0.1 });
	const [meowNotifRecieve] = useSound(meowSFX, { volume: 0.5 });
	const { server: server } = useParams();

	const fetchChatHistory = async () => {
		try {
			axios.get(`http://localhost:4000/api/servers/${server}/history`)
				.then((response) => {
					if (response.data.length > 0) {
						setMessages(response.data);
					} else {
						setMessages([]);
					}
					
				});
		} catch (error) {
			console.error("Failed to fetch server history:", error);
		}
	}

	useEffect(() => {
		if (server === null) {
			// Join first server in list
			axios.get(`http://localhost:4000/api/accounts/${localStorage.getItem("userName")}/servers`)
				.then((response) => {
					if (response.data.length > 0) {
						window.location.replace(`/chat/${response.data[0].server}`);
					} else {
						// window.location.replace("/chat");
					}
				});
		}
        fetchChatHistory(); // Load chat history when component mounts
    }, []); // Empty dependency array means this effect runs once on mount

	// Reload chat history when url changes
	useEffect(() => {
		fetchChatHistory();
		console.log(server);
	}, [server]);
	
	// Update server when url changes


    useEffect(() => {
		const messageListener = (data) => {
			console.log("messageListener")
			console.log(server);
			console.log("data.server")
			console.log(data.server)
			if (data.server == server) {
				setMessages((prevMessages) => [...prevMessages, data]);
				// Play sound if message is not from current user
				if (data.socketID !== socket.id) {
					meowNotifRecieve();
				} else {
					meowNotifSend();
				}
				console.log(socket);
			}
		};
        const typingListener = (data) => {
			console.log(server);
			// Only set typing status if data.server matches
			if (data.server === server) {
				setTypingStatus(data.message);
			} else {
				setTypingStatus("");
			}

		};

        socket.on("messageResponse", messageListener);
        socket.on("typingResponse", typingListener);

        // Cleanup listeners on component unmount
        return () => {
            socket.off("messageResponse", messageListener);
            socket.off("typingResponse", typingListener);
        };
    }, [socket, meowNotifRecieve, meowNotifSend, server]);

	useEffect(() => {
		// 👇️ scroll to bottom every time messages change
		lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="chat">
			<ChatBar socket={socket} />
			<div className="chat-main">
				<ChatBody
					messages={messages}
					lastMessageRef={lastMessageRef}
					typingStatus={typingStatus}
				/>
				<ChatFooter socket={socket} />
			</div>
		</div>
	);
};

export default ChatPage;
