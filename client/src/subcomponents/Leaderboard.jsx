import React from "react";
import Overlay from "./Overlay";
import {useState, useEffect} from "react";
import { socket } from "../ClientSocket";

function Card(properties){
    return <div style={{
        backgroundColor : (properties.userInfo.username === properties.name && 'yellow')
    }} className="leaderboard-card">
        <h1>{properties.rank}</h1>
        <div className="profile-rank">
            <div className="rank-badge"></div>
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