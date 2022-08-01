import React from "react";

import Bronze from "../assets/badge/bronze.png";
import Silver from "../assets/badge/silver.png";
import Gold from "../assets/badge/gold.png";
import Crystal from "../assets/badge/crystal.png";
import Platinum from "../assets/badge/platinum.png";
import Conqueror from "../assets/badge/conqueror.png";

function Card(properties){

    const playerBadge = () => {
        const point = properties.point;
        if (point <= 600) return Bronze;
        else if (point > 600 && point <= 1500) return Silver;                         
        else if (point > 1500 && point <= 2700) return Gold;                       
        else if (point > 2700 && point <= 4200) return Crystal;                
        else if (point > 4200 && point <= 6400) return Platinum;               
        else if (point > 6400) return Conqueror;         
    }    

    return <div style={{
        backgroundColor : (properties.userInfo.username === properties.name && 'yellow')
    }} className="leaderboard-card">
        <h1>{properties.rank}</h1>
        <div className="profile-rank">
            <img className="rank-badge leaderboard-player-badge" src={playerBadge()} alt="#"/>
        </div>
        <p>{properties.name}</p> 
        <div className="leaderboard-point-div">
            <p>{properties.point}</p>
            <p>Points</p>
        </div>
    </div>
}




export default function Leaderboard(props){


    return <div className="submenu leaderboard-div">
        <button className="exit-button leaderboard-exit-button" onClick={props.updateOpenLeaderboard}>X</button>

        <h1>Leaderboard</h1>
        <div className="toppers-list">
            {props.playerList.map((user, index) => <Card rank={index+1} name={user.username} point={user.point} userInfo={props.userInfo}/>)}       
        </div>
    </div>
}