# KittyChat
## Instant messaging made purr-fect!
A simple chat client. Implemented as a web app using React and Socket.io. Current features include
- Accounts and authentication
- Persistent chat history across devices and windows
- Markdown formatting (bold, italic, strikethrough)
- Color formatting (color selector, animated rainbow text)
- Searchable gif selector (I downloaded an archive of like 600 smileys from super old forums from the 2000s)
- Nice animations
- Notification sounds
- *"User is typing..."* indicators
---
![](docs/demo1.gif)
### Setup Instructions
- Clone this repository
- Create a `.env` file in `server`
  - It contains `MONGODB_URI=YOUR_URI`, where `YOUR_URI` is your MongoDB Atlas URI 
- Open 2 terminal windows
- In window 1:
  - `cd client`
  - `npm install`
  - `npm start`
- In window 2:
  - `cd server`
  - `npm install`
  - `npm start`
- Navigate to `localhost:3000` and create an account
- Have fun!