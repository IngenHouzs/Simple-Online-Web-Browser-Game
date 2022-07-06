import React from "react";
import Overlay from "./Overlay";

export default function Leaderboard(props){
    return <div className="submenu">
        <button className="exit-button" onClick={props.updateOpenLeaderboard}>X</button>
    </div>
}