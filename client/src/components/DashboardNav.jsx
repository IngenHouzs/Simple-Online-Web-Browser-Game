import React from "react";


export default function DashboardNav(props){
    return <div id="dashboard-nav">
        <button className="nav-button-create-room" onClick={props.updateOpenCreateRoom}>Create Room</button>
        <button className="nav-button-create-room" onClick={props.updateOpenLeaderboard}>Leaderboard</button>        
    </div>
}