import React from "react";
import "./commcation.scss";

const Commication = props => {
    let { date, msg } = props;
    return(
        <div className="commication_item">
            <div className="date">{date}</div>
            <div className="text">{msg}</div>
        </div>
    )
}

export default Commication;