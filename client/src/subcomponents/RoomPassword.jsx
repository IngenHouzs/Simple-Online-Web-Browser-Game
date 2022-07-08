import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {socket} from "../ClientSocket";
import { webserver } from "../ServerConfig";
// const bcrypt = require('bcrypt');

import Padlock from "../assets/create-room/padlock.png"
import "../index.css";

export default function RoomPassword(props){

    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [wrongPassword, setWrongPassword] = useState(false);

    const setPasswordHandler = (e) => setPassword(e.target.value);

    const validateRoomPassword = (e) => {
        e.preventDefault();

        const room = props.targetRoom;
        const userInformation = props.userInfo;
        
        const requestDetail = {
            mode : 'cors',
            headers : {
                'Content-Type' : 'application/json',
            },
            method : 'PUT',
            body : JSON.stringify({userInformation, room, password})
        }
        const targetAPI = webserver + '/app';

        fetch(targetAPI, requestDetail)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success' && res.code === 200){
                    socket.emit('joined-room', props.userInfo, room);              
                    navigate(`/app/room?Id=${room.roomID}`, {state : {room, userInformation}});      
                } else setWrongPassword(true);
                          
            })
            .catch(err => console.error(err));        

    }

    return <div className="submenu room-password-input-card">
        <img src={Padlock} className="password-input-img" alt="#"/>
        <form onSubmit={validateRoomPassword} className="password-form">
            <input type="password" 
                   placeholder="Enter room password" 
                   value={password} 
                   onChange={setPasswordHandler}></input>
            {wrongPassword ? 
                <div className="wrong-password">
                    <p>Incorrect password.</p>
                </div> : null}
            <button type="submit">Enter Room</button>
        </form>
    </div>
}

