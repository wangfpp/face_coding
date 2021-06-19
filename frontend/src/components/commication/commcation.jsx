import React from "react";
import "./commcation.scss";

const Commication = props => {
    console.log(props);
    let { date, text, display, local } = props.info;
    return(
        <div className={["commication_item", local ? "me" : null].join(" ")}>
            <div className="date">{date}</div>
            <div className="text">{text}</div>
            <div className="who">{display}</div>
        </div>
    )
}

export default Commication;