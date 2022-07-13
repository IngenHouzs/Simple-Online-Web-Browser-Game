import React from "react";
import "../index.css";
import {socket} from "../ClientSocket";
import { useState } from "react";

import RoomIcon from "../assets/game-room/room-icon.png";
import Friends from "../assets/game-room/friends.png";

export default function GameRoomNav(props){


    return <div id="game-room-nav">
    
        <img src={RoomIcon} alt="#"/>
        <h1>{props.roomInfo.roomName}</h1>
        <div className="game-multielement-nav-div">
            <button onClick={props.setStartGameHandler}>Start Game</button>
            <button>?</button>
        </div>
        <div className="game-multielement-nav-div">
            <img src={Friends} alt="#"/>
            <p>{props.roomInfo.playerList.length}/{props.roomInfo.maxPlayer}</p>
        </div>  
    </div>
}