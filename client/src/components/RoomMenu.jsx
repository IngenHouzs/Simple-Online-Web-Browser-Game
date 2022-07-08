import React from "react";
import queryString from "query-string";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import { webserver } from "../ServerConfig";
import Friend from "../assets/create-room/friends.png"
import Padlock from "../assets/create-room/padlock.png"
import Host from "../assets/room/crown.png";
import { socket } from "../ClientSocket";

function RoomButton(properties){

    const {search} = useLocation();
    // const {roomName} = queryString.parse(search);
    const navigate = useNavigate();
    const userInformation = properties.userInfo;
      

    const joinRoom = async (room) => {

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
        console.log(requestDetail.body, "haha");

        const targetAPI = webserver + '/app';

        fetch(targetAPI, requestDetail)
            .then(res => res.json())
            .then(res => {
                console.log("wkkwkw");
                console.log(res);
                socket.emit('joined-room', properties.userInfo, room);              
                navigate(`/app/room?Id=${room.roomID}`, {state : {room, userInformation}});                
            })
            .catch(err => console.error(err));

    }    

    return <div className="room-button">   
        <h1>{properties.roomName}</h1>
        <div className="horizontal-description room-info">
            <div>
                <img src={Friend} alt="#"/>            
                <h1>{properties.players}/{properties.maxPlayer}</h1>
            </div>
            <div>
            <img src={Host} alt="#"/>                
                <h1>{properties.host}</h1>
            </div>
        </div>
        <button onClick={() => joinRoom(properties.roomObj)}>Join Room</button>  
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
                            host={room.host} 
                            id={room.roomID} 
                            password={room.password}
                            roomObj={room}
                            userInfo={props.userInfo}
                            updateOpenPasswordInput={props.updateOpenPasswordInput}
                            updateTargetRoom={props.updateTargetRoom}  
                            />)}                                   
        </div>
    </div>
}