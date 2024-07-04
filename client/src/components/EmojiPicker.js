// EmojiPicker.js
import React, { useState, useEffect, useRef } from 'react';
import "../App.css";

const EmojiPicker = ({ onEmojiSelect }) => {
  const [smilies, setSmilies] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
	fetch('http://localhost:4000/smilies')
    .then(response => response.json())
    .then(smilies => {
        setSmilies(smilies);
    })
    .catch(error => console.error('Error fetching smilies:', error));
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  }

  const filteredSmilies = smilies.filter(smiley => {
    return smiley.includes(searchTerm);
  });

  return (
    <div>
        <input
            type="text"
            placeholder="Search smilies..."
            className="search"
            value={searchTerm}
            onChange={handleSearchChange}
            ref={searchInputRef}
        />
        <div className="emoji-picker">
            {filteredSmilies.map((smiley) => (
            <img
                key={smiley}
                className="emoji"
                src={`http://localhost:4000/smilies/${smiley}`}
                alt={smiley}
                onClick={() => onEmojiSelect(`:${smiley.split('.')[0]}:`)}
            />
            ))}
        </div>
    </div>
  );
};

export { EmojiPicker };