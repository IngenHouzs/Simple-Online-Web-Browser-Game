import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import {socketIOClient, socket, ENDPOINT} from "../ClientSocket";
import { webserver } from "../ServerConfig";

import GameChat from "../components/GameChat";
import GamePage from "../components/GamePage";
import Game from "../components/Game";
import Overlay from "../subcomponents/Overlay";
import Manual from "../subcomponents/Manual";

import KingdomCastle from "../assets/game/map.png";
import Meteor from "../assets/game/meteor.png";
import BoundlessBullet from "../assets/game/boundless-bullet.png";

import "../index.css";


export default function GameRoom(props){
    const location = useLocation();
    const RoomInfo = location.state.room;
    const UserInfo = location.state.userInformation;

    const [roomInfo, setRoomInfo] = useState(RoomInfo);
    const [userInfo, setUserInfo] = useState(UserInfo);
    const [startGame, setStartGame] = useState(false);
    const [closeChat, setCloseChat] = useState(false);  
    const [isOpenManual, setIsOpenManual] = useState(false);

    const [gameData, setGameData] = useState(false);

    const [mapList, setMapList] = useState([KingdomCastle]);
    const [map, setMap] = useState(0); 

    const [skillSet, setSkillSet] = useState([0,1]); 
    const [skills,setSkills] = useState(
        [
            {
                id : 0, 
                name : "Meteor", 
                manaUsage : 80,
                radius : 16,
                count : 1,
                logo : Meteor,
                delay : 2000, 
                damage : 20
            }, 
            {
                id : 1,
                name : "Boundless Bullet", 
                manaUsage : 60,
                radius : 0,
                count : 5, 
                logo : BoundlessBullet,
                delay : 0,
                damage : 10
            }
        ]
    );

    const setMapLeft = () => {
        if (roomInfo.host !== userInfo.username) return;
        setMap(map => (map - 1) % mapList.length);
        socket.emit("host-changed-map", roomInfo, "left");
    }
    const setMapRight = () => {
        if (roomInfo.host !== userInfo.username) return;
        setMap(map => (map + 1) % mapList.length);
        socket.emit("host-changed-map", roomInfo, "right");
    }

    const setStartGameHandler = async () => {
        if (roomInfo.host !== userInfo.username || roomInfo.playerList.length <= 1) return;
        socket.emit('host-start-game', roomInfo, allClientStartGame);
        socket.emit('announce-new-room');
        setStartGame(true);
    }

    const returnToRoomLobbyHandler = () => {
        setStartGame(false);
        socket.emit('return-to-room-lobby', roomInfo);
    };




    // socket.on('transfer-game-player-stats', data => {
    //     setGameData([...data.gameData]);
    //     // console.log('gameRoom', data.gameData);
    //     // console.log('ganedata', gameData);
    // });    

    const allClientStartGame = () => setStartGame(true);

    const setCloseChatHandler = () => setCloseChat(!closeChat);
    const setCloseChatToTrue = () => setCloseChat(true);
    const setIsOpenManualHandler = () => setIsOpenManual(!isOpenManual);

    socket.on('update-player-room', (players, room) => {
        setRoomInfo(room);
    });    


    socket.on('player-enter-game', callback => {
        setStartGame(true);
    });

    socket.on('receive-map-data', (data) => {
        setMapList(data);
    });
     

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

        socket.emit('request-map-data', (roomInfo));

        socket.on('receive-map-data', (data) => {
            setMapList(data);
        });
        socket.on('transfer-game-player-stats', (data) => {
            setGameData([...data.gameData]);  
            
            // console.log('bucks', data.gameData);
            // console.log('gameRoom', data.gameData);
            // console.log('ganedata', gameData);
        });

        // socket.on('live-game-update', data => {
        //     setGameData([...data]);
        // })

        socket.on('approve-return-lobby', () => {
            setStartGame(false);
            setCloseChat(false);            
        })


        socket.on('announce-map-changes', (roomInfo, direction) => {
            if (direction === 'left'){
                setMap(map => (map - 1) % mapList.length);                
            } else if (direction === 'right'){
                setMap(map => (map + 1) % mapList.length);                 
            }
        });

        return () => {
            playerLeavesRoomListener(); 
            socket.off('announce-map-changes');
        }
    },[]);

    return <div id="game-room"> 
        {isOpenManual ? <Overlay/> : null} 
        {isOpenManual ? <Manual skills={skills} setIsOpenManualHandler={setIsOpenManualHandler}/> : null}
        {!startGame ? <GamePage roomInfo={roomInfo} userInfo={userInfo} startGame={startGame} setStartGameHandler={setStartGameHandler} map={map} mapList={mapList} setMapLeft={setMapLeft} setMapRight={setMapRight} setIsOpenManualHandler={setIsOpenManualHandler}/> : null}
        {!startGame ? <GameChat inGame={false} roomInfo={roomInfo} userInfo={userInfo} startGame={startGame} setStartGameHandler={setStartGameHandler} closeChat={closeChat} setCloseChatHandler={setCloseChatHandler}/>: null}        
        {startGame ? <Game gameData={gameData} closeChat={closeChat} mapChoice={mapList[map]} mapNumber={map} setCloseChatHandler={setCloseChatHandler} setCloseChatToTrue={setCloseChatToTrue} roomInfo={roomInfo} userInfo={userInfo} 
                           returnToRoomLobbyHandler={returnToRoomLobbyHandler}
                           skillSet={skillSet}
                           setSkillSet={setSkillSet}
                           skills={skills}
                           /> : null}
        {startGame ? <GameChat inGame={true} roomInfo={roomInfo} userInfo={userInfo} startGame={startGame} setStartGameHandler={setStartGameHandler} closeChat={closeChat} setCloseChatHandler={setCloseChatHandler}/> : null}
    </div>
}
