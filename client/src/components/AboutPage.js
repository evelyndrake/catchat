import React from "react";
import ChatBar from "./ChatBar";
import CreditCard from "./CreditCard";
const AboutPage = ({socket}) => {

  return (
    <div className="chat">
      <ChatBar socket={socket}/>

      <div className="chat-main">
        <header className="chat-mainHeader">
          <div className="chat-serverinfo">
            <h3>About</h3>
            <p className="subtitle">Information about KittyChat</p>
          </div>
        </header>
        <h3 className="credit-header">Credits</h3>
        <div className="credit-divider" />
        <div className="credit-grid">
          <CreditCard title={"Developer"} name={"Evelyn Drake"} link={"https://evelynsethernet.dev/"} linkText={"Portfolio"} imgLink={"https://avatars.githubusercontent.com/u/128602777?v=4"}/>
        </div>
        {/* <div className="credit-divider" /> */}
        <h3 className="credit-header">Technologies</h3>
        <div className="credit-divider" />
        <div className="credit-grid">
          <CreditCard title={"Frontend"} name={"React.js"} link={"https://reactjs.org/"} linkText={"Documentation"} imgLink={"https://reactjs.org/logo-og.png"}/>
          <CreditCard title={"Backend"} name={"Node.js"} link={"https://nodejs.org/en/"} linkText={"Documentation"} imgLink={"https://media.licdn.com/dms/image/C4D12AQEOs18gPOzWyA/article-cover_image-shrink_720_1280/0/1648300473213?e=2147483647&v=beta&t=E3p_Ncatjw-GXKXEI_tE9PeE80NuBJ9V85sg3EFR0nA"}/>
          <CreditCard title={"Databases"} name={"MongoDB Atlas"} link={"https://www.mongodb.com/docs/atlas"} linkText={"Documentation"} imgLink={"https://www.strongdm.com/hubfs/21126185/Technology%20Images/603c5eb831820c3ce6a8f057_603a1586fa052d17fc2a6929_MongoDBAtlas.png"}/>
          <CreditCard title={"WebSocket"} name={"Socket.io"} link={"https://socket.io/"} linkText={"Documentation"} imgLink={"https://socket.io/images/logo.svg"}/>
        </div>
        {/* <div className="credit-divider" /> */}
        <h3 className="credit-header">Special thanks to</h3>
        <ul className="credit-list">
          <li>
            <a href="https://cyber.dabamos.de/88x31/">cyber.dabamos.de</a> and <a href="https://anlucas.neocities.org/88x31Buttons">A.N. Lucas</a> for the badges
          </li>
          <li>
            My friends for their support and feedback!
          </li>
          <li>
            You for using KittyChat!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;