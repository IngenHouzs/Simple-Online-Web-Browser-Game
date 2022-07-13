import React from "react";
import queryString from "query-string";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { webserver } from "../ServerConfig";
import Friend from "../assets/create-room/friends.png"
import Padlock from "../assets/create-room/padlock.png"
import Host from "../assets/room/crown.png";
import { socket } from "../ClientSocket";
import { useEffect } from "react";

function RoomButton(properties){

    const {search} = useLocation();
    // const {roomName} = queryString.parse(search);
    const navigate = useNavigate();
    const userInformation = properties.userInfo;
      

    const joinRoom = async (room) => {
        // socket.emit('announce-new-room');
        if (room.playerList.length >= room.maxPlayer || room.inGame){
            return;
        }

        if (room.password){
            properties.updateOpenPasswordInput();
            properties.updateTargetRoom(room);
            return;
        }

        console.log('You joined room', room.roomName);
        
        const requestDetail = {
            mode : 'cors',
            headers : {
                'Content-Type' : 'application/json',
            },
            method : 'PUT',
            body : JSON.stringify({userInformation, room})
        }

        const targetAPI = webserver + '/app';

        fetch(targetAPI, requestDetail)
            .then(res => res.json())
            .then(res => {
                socket.emit('joined-room', properties.userInfo, room);              
                socket.emit('announce-new-room');                
                navigate(`/app/room?Id=${room.roomID}`, {state : {room, userInformation}});                
            })
            .catch(err => console.error(err));

    }    

    return <div className="room-button">   
        <h1>{properties.roomName}</h1>
        <div className="horizontal-description room-info">
            <div>
                <img src={Friend} alt="#"/>            
                <h1 style={{
                    color : (properties.playerList.length >= properties.maxPlayer ? 'red' : 'black')
                }}>{properties.players}/{properties.maxPlayer}</h1>
            </div>
            <div>
            <img src={Host} alt="#"/>                
                <h1>{properties.host}</h1>
            </div>
        </div>
        <button style={{
                disabled : (properties.playerList.length >= properties.maxPlayer ? true : false),
                backgroundColor : properties.inGame ? 'orange' : (properties.playerList.length >= properties.maxPlayer && 'red')
            }} onClick={() => joinRoom(properties.roomObj)}>{properties.inGame ? 'In Game' :
                (properties.playerList.length >= properties.maxPlayer  ? 'FULL' : 'Join Room')
            }</button>  
        {properties.password !== null ? <img src={Padlock} alt="#"/> : null}
    </div>
}

export default function RoomMenu(props){


    return <div id="room-menu">
        <h1>Hello, <span>{props.userInfo.username}</span></h1>
        <h1>Let's play some games.</h1>
        <div className="room-list">
            {props.rooms.map((room) => 
                <RoomButton roomName={room.roomName} 
                            players={room.players}
                            maxPlayer={room.maxPlayer} 
                            playerList={room.playerList}
                            host={room.host} 
                            id={room.roomID} 
                            inGame={room.inGame}
                            password={room.password}
                            roomObj={room}
                            userInfo={props.userInfo}
                            updateOpenPasswordInput={props.updateOpenPasswordInput}
                            updateTargetRoom={props.updateTargetRoom}  
                            />)}                                   
        </div>
    </div>
}