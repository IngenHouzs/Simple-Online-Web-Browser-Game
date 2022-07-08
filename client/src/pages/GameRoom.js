import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import {socketIOClient, socket, ENDPOINT} from "../ClientSocket";
import { webserver } from "../ServerConfig";
import "../index.css";


export default function GameRoom(props){
    const location = useLocation();
    const roomInfo = location.state.room;
    const userInfo = location.state.userInformation;

    const playerLeavesRoomListener = async () => {
        // hapus user dari room
        // kalo length player 0 (hapus room)
        const requestDetails = {
            mode : 'cors',
            method : 'DELETE',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(userInfo)
        }

        console.log('leave');
        console.log(userInfo, roomInfo);
        const targetAPI = webserver + `/app/room?Id=${roomInfo.roomID}`;
        fetch(targetAPI, requestDetails)
            .then((res) => {
                res.json();
                return res;
            })
            .then((res) => {
                console.log(res, "ejehehehh");
                socket.emit('announce-new-room');
                socket.emit('leaves-room', userInfo, roomInfo);
                console.log('aaaaaaaaaa')                ;
            })
            .catch((err) => {
                console.error(err);
                socket.emit('announce-new-room');                
            });
    }

    useEffect(() => {
        window.addEventListener('pagehide', () => console.log("wkwkkwkw"));

        return () => playerLeavesRoomListener();
    },[]);

    return <div id="game-room">
    </div>
}
