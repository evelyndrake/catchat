import React from "react";
import { useNavigate } from "react-router-dom";
import { stripHtml } from "string-strip-html";

const ChatBody = ({ messages, lastMessageRef, typingStatus }) => {
	const navigate = useNavigate();

	const handleLeaveChat = () => {
		localStorage.removeItem("userName");
		navigate("/");
		window.location.reload();
	};

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
            return `<img src="${imageUrl}" class="emoji" alt="${smilieName}" style="max-width: 100%; max-height: 40px; margin-left: 5px; margin-right: 5px;"/>`;
        });
    };

	return (
		<>
			<header className="chat__mainHeader">
				<p>Chatting with friends!</p>
				<button className="leaveChat__btn" onClick={handleLeaveChat}>
					LOG OUT
				</button>
			</header>

			<div className="message__container">
                {messages.map((message) =>
                    message.name === localStorage.getItem("userName") ? (
                        <div className="message__chats" key={message.id}>
                            <p className="sender__name">You</p>
							<p className="message__timestamp">{new Date(message.timestamp).toLocaleTimeString()}</p>
                            <div className="message__sender" dangerouslySetInnerHTML={{ __html: renderMessageWithSmilies(message.text) }} />
                        </div>
                    ) : (
                        <div className="message__chats" key={message.id}>
                            <p>{message.name}</p>
							<p className="message__timestamp" style={{textAlign: "left"}}>{new Date(message.timestamp).toLocaleTimeString()}</p>
                            <div className="message__recipient" dangerouslySetInnerHTML={{ __html: renderMessageWithSmilies(message.text) }} />
                        </div>
						
                    ),
                )}

				<div className="message__status">
					<p>{typingStatus}</p>
				</div>

				<div ref={lastMessageRef} />
			</div>
		</>
	);
};

export default ChatBody;
