import React, { useState, useRef } from "react";
import { EmojiPicker } from "./EmojiPicker";
import { GithubPicker } from "react-color";
import { useParams } from "react-router";

const ColorPicker = ({ onColorSelect }) => {
	const [color, setColor] = useState("#000000");
	const colorPickerRef = useRef(null);
	return (
		<div>
			<GithubPicker 
				onChangeComplete={(color) => onColorSelect(color.hex)}
				colors={['#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#417505', '#A50055', '#81007F', '#1E3A94', '#000000', '#4A4A4A', '#9B9B9B']}
			/>
		</div>
	)
}

const ChatFooter = ({ socket }) => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const messageInputRef = useRef(null);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const { server } = useParams();

	const toggleEmojiPicker = (e) => {
		e.preventDefault();
		setShowEmojiPicker(!showEmojiPicker);
	}

	const toggleColorPicker = (e) => {
		e.preventDefault();
		setShowColorPicker(!showColorPicker);
	}

	const handleEmojiSelect = (emoji) => {
		// Append to message
		setMessage(message + emoji);
		console.log(emoji);
	}

	const moveCursorBack = (spacesBack) => {
		setTimeout(() => {
			messageInputRef.current.focus();
			messageInputRef.current.setSelectionRange(
				messageInputRef.current.value.length - spacesBack,
				messageInputRef.current.value.length - spacesBack,
			);
		}, 0);
	}

	const formatText = (tags, e) => {
		e.preventDefault();
		const start = messageInputRef.current.selectionStart;
		const end = messageInputRef.current.selectionEnd;
		const selectedText = messageInputRef.current.value.substring(start, end);
		if (selectedText) {
			setMessage(
				message.substring(0, start) + tags + selectedText + tags + message.substring(end),
			);
			moveCursorBack(-tags.length * 2);
			return;
		}
		setMessage(message + tags + tags);
		moveCursorBack(tags.length);
	}

	const handleBoldClick = (e) => {
		formatText("**", e);
	}

	const handleItalicClick = (e) => {
		formatText("*", e);
	}

	const handleStrikethroughClick = (e) => {
		formatText("~", e);
	}

	const handleColorClick = (e) => {
		// Open color picker
		toggleColorPicker(e);
		// formatText("<color='red'>", e);
	}

	const handleRainbowClick = (e) => {
		formatText("[rainbow]", e);
	}

	const handleColorSelect = (color) => {
		// console.log(color);
		// setMessage(message + `<font color="${color}">` + `</font>`);
		const start = messageInputRef.current.selectionStart;
		const end = messageInputRef.current.selectionEnd;
		const selectedText = messageInputRef.current.value.substring(start, end);
		if (selectedText) {
			setMessage(
				message.substring(0, start) + `[font color="${color}"]` + selectedText + "[/font]" + message.substring(end),
			);
			moveCursorBack(-23);
			return;
		}
		setMessage(message + `[font color="${color}"]`+ "[/font]");
		moveCursorBack(7);
	}

	const handleTyping = () => {
			const userName = localStorage.getItem("userName");
			socket.emit("typing", { user: userName, message: `${userName}: ${message}`, server: server });
		setTimeout(() => {
			socket.emit("typing", { user: userName, message: "", server: server });
		}, 2000);
	}

	const handleSendMessage = (e) => {
		e.preventDefault();
		// Close color picker if open
		if (showColorPicker) {
			toggleColorPicker(e);
		}
		if (message.trim() && localStorage.getItem("userName")) {
			socket.emit("message", {
				text: message,
				name: localStorage.getItem("userName"),
				timestamp: new Date(),
				id: `${socket.id}${Math.random()}`,
				server: server,
				socketID: socket.id
			});
		}
		setMessage("");
	};
	return (
		<div className="chat__footer">
			<button className="formatting-btn" onClick={handleBoldClick}>
				<strong>B</strong>
			</button>
			<button className="formatting-btn" onClick={handleItalicClick}>
				<i>i</i>
			</button>
			<button className="formatting-btn" onClick={handleStrikethroughClick}>
				<del>s</del>
			</button>
			<button className="formatting-btn" onClick={handleColorClick}>
				🎨
			</button>
			<button className="formatting-btn" onClick={handleRainbowClick}>
				🌈
			</button>
			<button className="formatting-btn" onClick={toggleEmojiPicker}>
				😀
			</button>
			<form className="form" onSubmit={handleSendMessage} id="message-footer">
				<input
					type="text"
					placeholder="Write message"
					className="message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleTyping}
					ref={messageInputRef}
				/>
				{showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}
				<div className="buttons-container">
					<button type="submit" className="sendBtn">SEND</button>
					{/* <button className="smileyPicker__btn" onClick={toggleEmojiPicker}>
						{showEmojiPicker ? 'HIDE SMILEYS' : 'SHOW SMILEYS'}
					</button> */}
				</div>
				{showColorPicker && <ColorPicker onColorSelect={handleColorSelect}/>}
			</form>
		</div>
	);
};

export default ChatFooter;
