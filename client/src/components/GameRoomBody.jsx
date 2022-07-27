import React from "react";
import { useState, useEffect } from "react";
import {socket} from "../ClientSocket"; 
import KingdomCastle from "../assets/game/map.png"

import "../index.css";

import Crown from "../assets/game-room/crown.png";

function PlayerCard(properties){
    return <div className="player-card">
        <div className="player-profile-picture" style={{
            backgroundColor : (properties.playerName ? 'white' : 'grey')
        }}>
            {properties.playerName ? (
                <div className="game-profile-picture">
                    {properties.roomInfo.host === properties.playerName ? 
                        <img src={Crown} alt="#"/>                    
                    : null}
                    <div className="profile-picture-head">
                    </div>
                    <div className="profile-picture-body">
                    </div>                    
                </div>
            ) : "Player"}
        </div>
        <p>        {properties.playerName ? properties.playerName : ''}</p>
    </div>
}


export default function GameRoomBody(props){

    const [maps, setMaps] = useState([KingdomCastle]); // map image disini

    const renderMapImage = () => {
        return maps[props.map];
    }

    return <div id="game-room-body">
        <h1>Choose Map</h1>
        <div className="game-map">
            <img src={renderMapImage()} alt="#"/>
        </div>
        <div className="room-player-list">
            {props.roomInfo.playerList.map((player) => 
                    <PlayerCard 
                        playerName={player.username}
                        roomInfo={props.roomInfo}
                    />
            )}
        </div>
    </div>
}