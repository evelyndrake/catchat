import React, { useEffect, useState, useRef } from "react";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";

const ChatPage = ({ socket }) => {
	const [messages, setMessages] = useState([]);
	const [typingStatus, setTypingStatus] = useState("");
	const lastMessageRef = useRef(null);

	const fetchChatHistory = async () => {
		try {
			const response = await fetch("http://localhost:4000/api/chat/history");
			const data = await response.json();
			setMessages(data);
		} catch (error) {
			console.error("Failed to fetch chat history:", error);
		}
	}

	useEffect(() => {
        fetchChatHistory(); // Load chat history when component mounts
    }, []); // Empty dependency array means this effect runs once on mount

    useEffect(() => {
        const messageListener = (data) => setMessages((prevMessages) => [...prevMessages, data]);
        const typingListener = (data) => setTypingStatus(data);

        socket.on("messageResponse", messageListener);
        socket.on("typingResponse", typingListener);

        // Cleanup listeners on component unmount
        return () => {
            socket.off("messageResponse", messageListener);
            socket.off("typingResponse", typingListener);
        };
    }, [socket]);

	useEffect(() => {
		// 👇️ scroll to bottom every time messages change
		lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="chat">
			<ChatBar socket={socket} />
			<div className="chat__main">
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
