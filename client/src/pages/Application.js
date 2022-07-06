import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {socketIOClient, socket, ENDPOINT} from "../ClientSocket";
import { webserver } from "../ServerConfig";

import Profile from "../components/Profile";
import DashboardNav from "../components/DashboardNav";
import RoomMenu from "../components/RoomMenu";
import Chat from "../components/Chat";
import CreateRoom from "../subcomponents/CreateRoom";
import Leaderboard from "../subcomponents/Leaderboard";
import Overlay from "../subcomponents/Overlay";

import "../index.css";

export default function Application(props){
    const location = useLocation();
    const userInfo = location.state.data;    

    const [onlinePlayers, setOnlinePlayers] = useState(0);
    const [openCreateRoom, setOpenCreateRoom] = useState(false);
    const [openLeaderboard, setOpenLeaderboard] = useState(false);
    const [rooms, setRooms] = useState([]);


    const updateOpenCreateRoom = () => setOpenCreateRoom(!openCreateRoom);
    const updateOpenLeaderboard = () => setOpenLeaderboard(!openLeaderboard);
    const addNewRoomToClient = (room) => setRooms(() => [...rooms, room]);

      
    socket.on('update-online-users', (onlineUsers) => {
        console.log("User Online : ", onlineUsers.length);
        setOnlinePlayers(onlineUsers.length);
    });      

    useEffect(()=>{
        socket.emit('user-connected', userInfo);      

        const targetAPI = webserver + '/app';
        fetch(targetAPI, {
            method : 'GET',
            mode : 'cors'
        }) 
            .then((res) => res.json())
            .then((res) => {
                setRooms(res.data);
            })
            .catch(err => console.error(err));
    
        setRooms([]);    
    },[]);

    return <div id="app">
        {openCreateRoom ? <CreateRoom updateOpenCreateRoom={updateOpenCreateRoom} userInfo={userInfo} rooms={rooms} addNewRoomToClient={addNewRoomToClient}/> :
         (openLeaderboard ? <Leaderboard updateOpenLeaderboard={updateOpenLeaderboard}/> : null)}
        {openCreateRoom || openLeaderboard ? <Overlay/> : null}    

        <Profile userInfo={userInfo}/>                                                                                           
        <div id="main-dashboard">
            <DashboardNav 
                userInfo={userInfo} 
                updateOpenCreateRoom={updateOpenCreateRoom} 
                updateOpenLeaderboard={updateOpenLeaderboard}/>
            <div id="dashboard-body">
                <RoomMenu userInfo={userInfo} rooms={rooms}/>
                <Chat userInfo={userInfo} onlinePlayers={onlinePlayers}/>
            </div>
        </div>
    </div>
}