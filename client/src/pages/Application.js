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
import RoomPassword from "../subcomponents/RoomPassword";
import Overlay from "../subcomponents/Overlay";

import "../index.css";

export default function Application(props){
    const location = useLocation();
    const {search} = useLocation();

    const query = new URLSearchParams(search);
    const q = query.get('roomId');

    const navigate = useNavigate();
    const usersInfo = location.state.data;    

    const [onlinePlayers, setOnlinePlayers] = useState(0);
    const [openCreateRoom, setOpenCreateRoom] = useState(false);
    const [openLeaderboard, setOpenLeaderboard] = useState(false);
    const [openPasswordInput, setOpenPasswordInput] = useState(false);
    const [targetRoom, setTargetRoom] = useState(null);
    const [correctRoomPassword, setCorrectRoomPassword] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [userInfo, setUserInfo] = useState(usersInfo);

    const [playerList, setPlayerList] = useState([]);
 

    
    const updateOpenCreateRoom = () => setOpenCreateRoom(!openCreateRoom);
    const updateOpenLeaderboard = () => setOpenLeaderboard(!openLeaderboard);
    const updateTargetRoom = (room) => setTargetRoom(room);
    const updateOpenPasswordInput = () => setOpenPasswordInput(!openPasswordInput);
    const updateCorrectRoomPassword = () => setCorrectRoomPassword(true);
    const addNewRoomToClient = (room) => setRooms(() => [...rooms, room]);

    socket.on('update-online-users', (onlineUsers) => {
        setOnlinePlayers(onlineUsers.length);
    });      

    socket.on('update-rooms-list-client', (newRoomsList) => {
        setRooms(newRoomsList);
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
            .catch(err => {});
    
        setRooms([]);    

        socket.on('refresh-player-profile', playersData => {
            const findUser = playersData.find(user => user.username === userInfo.username);
            setUserInfo(findUser);
        }); 

        socket.emit('request-leaderboard-data');
        socket.on('receive-leaderboard-data', data => {
            setPlayerList(data);
        });        

        socket.emit('request-profile-data', userInfo);

        return () => {
            socket.off('refresh-player-profile');
            socket.off('receive-leaderboard-data');            
        }
    },[]);

    return <div id="app">
        {openCreateRoom ? <CreateRoom updateOpenCreateRoom={updateOpenCreateRoom} 
                                      userInfo={userInfo} 
                                      rooms={rooms} 
                                      addNewRoomToClient={addNewRoomToClient}/> :
         (openLeaderboard ? <Leaderboard updateOpenLeaderboard={updateOpenLeaderboard} userInfo={userInfo} playerList={playerList}/> : null)}
        {openCreateRoom || openLeaderboard || openPasswordInput ? <Overlay/> : null}    

        
        {openPasswordInput ? <RoomPassword updateOpenPasswordInput={updateOpenPasswordInput}
                                           updateTargetRoom={updateTargetRoom}
                                           updateCorrectRoomPassword={updateCorrectRoomPassword}
                                           targetRoom={targetRoom}
                                           userInfo={userInfo}
                                           /> : null}

        <Profile userInfo={userInfo} playerList={playerList}/>                                                                                           
        <div id="main-dashboard">
            <DashboardNav 
                userInfo={userInfo} 
                updateOpenCreateRoom={updateOpenCreateRoom} 
                updateOpenLeaderboard={updateOpenLeaderboard}/>
            <div id="dashboard-body">
                <RoomMenu userInfo={userInfo} 
                          rooms={rooms}
                          updateOpenPasswordInput={updateOpenPasswordInput}
                          updateTargetRoom={updateTargetRoom}                          
                          />
                <Chat userInfo={userInfo} onlinePlayers={onlinePlayers}/>
            </div>
        </div>
    </div>
}