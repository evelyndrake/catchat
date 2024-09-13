import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ChatPage from "./components/ChatPage";
import ProfilePage from "./components/ProfilePage";
import AboutPage from "./components/AboutPage";
import socketIO from "socket.io-client";
import CreateServerPage from "./components/CreateServerPage";
import SettingsPage from "./components/SettingsPage";
const socket = socketIO.connect("http://localhost:4000");
function App() {
	return (
		<BrowserRouter>
			<div>
				<Routes>
					<Route path="/" element={<Home socket={socket} />}></Route>
					<Route
						path="/chat/:server"
						element={<ChatPage socket={socket} />}
					></Route>
					<Route
						path="/chat"
						element={<ChatPage socket={socket} />}
					></Route>
					<Route
						path="/profile"
						element={<ProfilePage socket={socket} />}
					></Route>
					<Route
						path="/create-server"
						element={<CreateServerPage socket={socket} />}
					></Route>
					<Route
						path="/settings"
						element={<SettingsPage socket={socket} />}
					></Route>
					<Route
						path="/about"
						element={<AboutPage socket={socket} />}
					></Route>
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
