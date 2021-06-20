import React from "react";
import "./commcation.scss";

const Commication = props => {
    console.log(props);
    let { text, date, display, local } = props.info;
    return(
        <div className={["commication_item", local ? "me" : null].join(" ")}>
            <div className="date">{display}-{date}</div>
            <div className="text">{text}</div>
        </div>
    )
}

export default Commication;