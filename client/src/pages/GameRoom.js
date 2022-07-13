import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import {socketIOClient, socket, ENDPOINT} from "../ClientSocket";
import { webserver } from "../ServerConfig";

import GameChat from "../components/GameChat";
import GamePage from "../components/GamePage";
import Game from "../components/Game";
import "../index.css";


export default function GameRoom(props){
    const location = useLocation();
    const RoomInfo = location.state.room;
    const UserInfo = location.state.userInformation;

    const [roomInfo, setRoomInfo] = useState(RoomInfo);
    const [userInfo, setUserInfo] = useState(UserInfo);
    const [startGame, setStartGame] = useState(false);
    const [closeChat, setCloseChat] = useState(false);

    const setStartGameHandler = async () => {
        if (roomInfo.host !== userInfo.username || roomInfo.playerList.length <= 1) return;
        socket.emit('host-start-game', roomInfo, allClientStartGame);
        socket.emit('announce-new-room');
        setStartGame(true);
    }

    const allClientStartGame = () => setStartGame(true);

    const setCloseChatHandler = () => setCloseChat(!closeChat);

    socket.on('update-player-room', (players, room) => {
        setRoomInfo(room);
        console.log(room, "ume");
    });    


    socket.on('player-enter-game', callback => {
        setStartGame(true);
    });
    
    // socket.emit('joined-room', userInfo, roomInfo);
    // socket.emit('announce-new-room');     

    const playerLeavesRoomListener = async () => {
        const requestDetails = {
            mode : 'cors',
            method : 'DELETE',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(userInfo)
        }

        const targetAPI = webserver + `/app/room?Id=${roomInfo.roomID}`;
        fetch(targetAPI, requestDetails)
            .then((res) => {
                res.json();
                return res;
            })
            .then((res) => {

                socket.emit('announce-new-room');
                socket.emit('leaves-room', userInfo, roomInfo);
            })
            .catch((err) => {
                console.error(err);
                socket.emit('announce-new-room');                
            });
    }


    useEffect(() => {
        socket.emit('joined-room', userInfo, roomInfo);
        socket.emit('announce-new-room');       
        return () => playerLeavesRoomListener();
    },[]);

    return <div id="game-room">
        {!startGame ? <GamePage roomInfo={roomInfo} userInfo={userInfo} startGame={startGame} setStartGameHandler={setStartGameHandler}/> : null}
        {!startGame ? <GameChat inGame={false} roomInfo={roomInfo} userInfo={userInfo} startGame={startGame} setStartGameHandler={setStartGameHandler} closeChat={closeChat} setCloseChatHandler={setCloseChatHandler}/>: null}        
        {startGame ? <Game closeChat={closeChat} setCloseChatHandler={setCloseChatHandler} roomInfo={roomInfo} userInfo={userInfo}/> : null}
        {startGame ? <GameChat inGame={true} roomInfo={roomInfo} userInfo={userInfo} startGame={startGame} setStartGameHandler={setStartGameHandler} closeChat={closeChat} setCloseChatHandler={setCloseChatHandler}/> : null}
    </div>
}
