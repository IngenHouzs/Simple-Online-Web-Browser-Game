import React from "react";
import { useState, useEffect } from "react";
import {socket} from "../ClientSocket"; 
import KingdomCastle from "../assets/game/map.png";

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

    const [maps, setMaps] = useState([KingdomCastle]); // map image list is here

    const renderMapImage = () => {
        return maps[props.map];
    }
    // map length is taken from GameRoom
    return <div id="game-room-body">
        <h1>Choose Map</h1>
        <div className="game-map">
            <button className="map-carousel-left" onClick={props.setMapLeft}>&lt;</button> 
            <img src={renderMapImage()} alt="#"/>
            <button className="map-carousel-right" onClick={props.setMapRight}>&gt;</button>
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