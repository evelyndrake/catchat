import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = ({ socket }) => {
	const navigate = useNavigate();
	const [userName, setUserName] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");
	const [inSignup , setInSignup] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
            // Make a POST request to the login endpoint
            const response = await axios.post('http://localhost:4000/api/accounts/login', { username: userName, password: password });
            // TODO: Add auth token to local storage
            // const { token } = response.data.uuid;
            // localStorage.setItem("authToken", token); // Store the token
            localStorage.setItem("userName", userName); // Store the userName
            socket.emit("newUser", { userName, socketID: socket.id });
            navigate("/chat");
        } catch (error) {
            // Handle login errors (e.g., invalid credentials)
            setLoginError(error.response ? error.response.data.message : "Login failed");
			console.error(loginError);
        }
	};

	const handleSubmitSignup = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('http://localhost:4000/api/accounts/', { username: userName, password: password
			});
			localStorage.setItem("userName", userName);
			socket.emit("newUser", { userName, socketID: socket.id });
			navigate("/chat");
		} catch (error) {
			setLoginError(error.response ? error.response.data.message : "Signup failed");
			console.error(loginError);
		}
	};

	return (
		<>
		{!inSignup && (
			<form className="home__container" onSubmit={handleSubmit}>
				<h2 className="home__header">Sign in to CatChat</h2>
				<label htmlFor="username">Username</label>
				<input
					type="text"
					name="username"
					id="username"
					className="username__input"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
				/>
				<label htmlFor="password">Password</label>
				<input
					type="password"
					name="password"
					id="password"
					className="password__input"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button className="home__cta">SIGN IN</button>
				<button className="home__cta" onClick={() => setInSignup(true)}>SIGN UP</button>
			</form>
		)}
		{
			inSignup && (
				<form className="home__container" onSubmit={handleSubmitSignup}>
					<h2 className="home__header">Sign up to CatChat</h2>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						name="username"
						id="username"
						className="username__input"
						value={userName}
						onChange={(e) => setUserName(e.target.value)}
					/>
					<label htmlFor="password">Password</label>
					<input
						type="password"
						name="password"
						id="password"
						className="password__input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button className="home__cta">SIGN UP</button>
					<button className="home__cta" onClick={() => setInSignup(false)}>SIGN IN</button>
				</form>
			)
		}
		</>
	);
};

export default Home;
