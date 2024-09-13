import React, {useEffect, useState} from "react";
import ChatBar from "./ChatBar";

const CreditCard = ({title, name, link, linkText, imgLink}) => {

  return (
    <div className="credit-card">
        <div className="left-column">
            <h3>{title}</h3>
            <p>{name}</p>
            <ul>
                <li>
                <a href={link}>{linkText}</a>
                </li>
            </ul>
        </div>
        <div className="right-column">
            <img className="credit-card-img" src={imgLink} />
        </div>
    </div>
  );
};

export default CreditCard;