import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { DarkModeProvider } from "./DarkModeContext.js"; // Adjust the path as necessary

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <DarkModeProvider>
            <App />
        </DarkModeProvider>
    </React.StrictMode>,
);