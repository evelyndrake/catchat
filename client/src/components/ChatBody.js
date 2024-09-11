import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { stripHtml } from "string-strip-html";
import ProfileCard from "./ProfileCard";
import axios from "axios";
import { useParams } from "react-router";
import toast, { Toaster } from "react-hot-toast";

const ChatBody = ({ messages, lastMessageRef, typingStatus }) => {
	const navigate = useNavigate();
	const [visibleProfile, setVisibleProfile] = useState(false);
	const [selectedUsername, setSelectedUsername] = useState("");
	const [serverName , setServerName] = useState("");
	const { server } = useParams();
	const [serverDescription, setServerDescription] = useState("");
	
	const handleLeaveChat = () => {
		localStorage.removeItem("userName");
		navigate("/");
		window.location.reload();
	};

	const toggleProfileCard = (username) => {
		setVisibleProfile(!visibleProfile);
		setSelectedUsername(username);
	};

	// On server change, set server name
	useEffect(() => {
		axios.get(`http://localhost:4000/api/servers/${server}`)
			.then((response) => {
				setServerName(response.data.displayName);
				if (response.data.description) {
					setServerDescription(response.data.description);
				} else {
					setServerDescription("Chatting with friends!");
				}
			});
	}, [server]);


	const renderMessageWithSmilies = (text) => {

		// Strip and ignore font tags
		text = stripHtml(text).result;
		// Parse markdown and convert to html
		text = text
			.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
			.replace(/\*(.*?)\*/g, "<i>$1</i>")
			.replace(/~(.*?)~/g, "<del>$1</del>")
			.replace(/`(.*?)`/g, "<code>$1</code>")
			.replace(/\n/g, "<br>");
		// Parse [font color="#HEX"]colored text[/font] tags
		const colorRegex = /\[font color="([a-zA-Z0-9#]+)"](.*?)\[\/font]/g;
		text = text.replace(colorRegex, '<font color="$1">$2</font>');
		// Prase [rainbow]rainbow text[rainbow] tags (no closing /)
		const rainbowRegex = /\[rainbow](.*?)\[rainbow]/g;
		text = text.replace(rainbowRegex, '<span class="rainbow">$1</span>');	
		

        const smilieRegex = /:([a-zA-Z0-9_]+):/g;
        return text.replace(smilieRegex, (match, smilieName) => {
            const imageUrl = `http://localhost:4000/smilies/${smilieName}.gif`;
            return `<img src="${imageUrl}" class="emoji" title="${smilieName}" alt="${smilieName}" style="max-width: 100%; max-height: 40px; margin-left: 5px; margin-right: 5px;"/>`;
        });
    };

	const copyInviteCode = () => {
		const code = server;
		navigator.clipboard.writeText(code);
		toast.success("Invite code copied to clipboard!");
	}

	return (
		<>
			<Toaster />
			<header className="chat-mainHeader">
				<div className="chat-serverinfo">
					<h3>{serverName}</h3>
					<p className="subtitle">{serverDescription}</p>
				</div>
				<div className="chat-topButtons">
					<button className="smileyPicker-btn" onClick={copyInviteCode}>SHARE</button>
					<button className="leaveChat-btn" onClick={handleLeaveChat} style={{marginLeft: "15px"}}>
						LOG OUT
					</button>
				</div>
			</header>
			{setVisibleProfile && <ProfileCard username={selectedUsername} isVisible={visibleProfile} toggleVisible={toggleProfileCard}/>}
			<div className="message-container" >
				
                {messages.map((message) =>
                    message.name === localStorage.getItem("userName") ? (
                        <div className="message-chats" title={new Date(message.timestamp).toLocaleString()} style={{textAlign: 'right'}}key={message.id}>
							<a className="message-yourname" onClick={() => toggleProfileCard(message.name)} style={{cursor: 'pointer'}}>
								<b>You</b>
							</a>
							<p className="message-timestamp"> {new Date(message.timestamp).toLocaleTimeString()}</p>
                            <div className="message-sender" dangerouslySetInnerHTML={{ __html: renderMessageWithSmilies(message.text) }} />
                        </div>
                    ) : (
                        <div className="message-chats" title={new Date(message.timestamp).toLocaleString()} key={message.id}>
							<a className="message-username" onClick={() => toggleProfileCard(message.name)} style={{cursor: 'pointer'}}>
								<b>{message.name}</b>
							</a>
							<p className="message-timestamp" style={{textAlign: "left"}}>{new Date(message.timestamp).toLocaleTimeString()}</p>
                            <div className="message-recipient" dangerouslySetInnerHTML={{ __html: renderMessageWithSmilies(message.text) }} />
							
                        </div>
						
                    ),
                )}

				<div className="message-status">
					<p>{typingStatus}</p>
				</div>

				<div ref={lastMessageRef} />
			</div>
		</>
	);
};

export default ChatBody;
