import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRef } from "react";
import { socket } from "../ClientSocket";

import GameCanvas from "./GameCanvas";
import ChatIcon from "../assets/game-room/chat.png";


import '../index.css';


function PlayerCard(properties){


    const ref = useRef();

    useEffect(() => {
        ref.current.style.setProperty('width', `${properties.health}%`, 'important');
    }, []);

    return <div className="ingame-player-card" style={{marginRight:'1rem !important'}}>
        <div className="profile-icon"></div>
        <div className='player-status'>
            <p>{properties.player.username}</p>
            <section className="player-health">
                <section className='health-bar' ref={ref} style={{
                    width : `${properties.health}% !important`,
                    height : '100%'                    
                }}></section>
            </section>
        </div>
    </div>
}


export default function Game(props){

    const ref = useRef();    

    const [playerIndex, setPlayerIndex] = useState(-1);

    const [health, setHealth] = useState(100);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const [enemyList, setEnemyList] = useState(props.gameData);
    const [rank, setRank] = useState(-1);

    const [isDead, setIsDead] = useState(false);

    const [totalPoint, setTotalPoint] = useState(0);
    const [endGame, setEndGame] = useState(false);

    // const [playersStats, setPlayersStats] = useState(props.gameData);

    const [row, setRow] = useState(1180);
    const [column, setColumn] = useState(632); 

    const [damage, setDamage] = useState(10);

    
    
    const [boundaryGrid, setBoundaryGrid] = useState(() => {
        let grid = [];
        for (let i = 0; i <= row/2; i += 1){
            grid[i] = new Array(column/2);
        }
        return grid;
    });

    const setPositionLeft = () => setPositionX((positionX) => positionX - 2);
    const setPositionRight = () => setPositionX((positionX) => positionX + 2);
    const setPositionDown = () =>  setPositionY((positionY) => positionY + 2);
    const setPositionUp = () =>   setPositionY((positionY) => positionY - 2);     

    const [playerCoordinate, setPlayerCoordinate] = useState({x : 0, y : 0});

    const setHealthHandler = (HP) => setHealth(HP);
    const totalPointHandler = (value) => {  
        if (endGame) return;
        setTotalPoint(totalPoint => totalPoint + value);
    }
    const rankHandler = (value) => setRank(value); 

    const getPoints = () => {
        return totalPoint;
    }

    useEffect(() => {   
        // setEnemyList(props.gameData);
        console.log("WKKWKWKWKKWKWKKWKKWKWKWKKWKW");
        props.setCloseChatToTrue(); 

        try {
            for (let boundaries of props.mapChoice.boundaries){
                try{
                    boundaryGrid[boundaries[0]][boundaries[1]] = 'b';
                }catch(err){}
            }
            for (let boundaries of props.mapChoice.walls){
                try{
                    boundaryGrid[boundaries[0]][boundaries[1]] = 'w';
                } catch(err){}
            }
           
        }catch(err){}


        socket.emit('initialize-player-ingame-data', props.roomInfo);

        socket.on('transfer-game-player-stats', (data) => {


            try{
                const gameData = data.gameData;
                setEnemyList(gameData);
                // console.log("ehehehheeh", enemyList[1]);
                for (let player in gameData){
                    if (gameData[player].username === props.userInfo.username){
                        // setHealth(100);   
                        setPositionX(props.mapChoice.startingPosition[player][0]);
                        setPositionY(props.mapChoice.startingPosition[player][1]);
                        setPlayerIndex(player);
                        break;
                    }
                }
                setPositionX(props.mapChoice.startingPosition[playerIndex][0]);
                setPositionY(props.mapChoice.startingPosition[playerIndex][1]);
      
                setPlayerCoordinate((playerCoordinate) => ({
                    x : positionX / 2, y : positionY / 2
                }));    
            } catch(err){}

        });


        socket.on('player-death', user => {
            if (user.username !== props.userInfo.username) return;
            setIsDead(true);
            console.log('u deeeed');
        });

        ref.current.style.setProperty('width', `100%`, 'important');

        // socket.on('update-player-stats', (data) => {
        //     setPlayersStats(data);
        //     setEnemyList(data);
        //     console.log('data', data);
        //     console.log(enemyList, 'huhuhu');
        // });


        // setInterval(() => console.log(enemyList,'----'), 3000);

        // socket.on('update-player-stats', data => {

        //     setEnemyListHandler(data.gameData);

        // });      
        const postPlayerPoint = (num) => socket.emit('accumulate-player-point', props.userInfo, num);        
        
        socket.on('end-game', () => {
            setEndGame(true); 
            postPlayerPoint(totalPoint); 
          });        
                         
    }, []);


   
    useEffect(() => { 
        // setPlayersStats(props.roomInfo.gameData);
        console.log(totalPoint, 'mwmw')
    },[totalPoint])


    return <div id="game">
        <button onClick={props.setCloseChatHandler} className="open-chat">
            <img src={ChatIcon} alt="#"/>
        </button>

        <div className="ingame-player-status-wrapper">
            <div className="not-self-player">
                {/* { enemyList ? (enemyList.map((player) => <PlayerCard player={player} health={player.health} roomInfo={props.roomInfo}/>)) : null} */}
            </div>
            <div className="self-player">  
                <div className="ingame-player-card self-player-card" style={{flexDirection:'row-reverse', backgroundColor:'grey'}}>
                    <div className="profile-icon"></div>
                    <div className='player-status' style={{textAlign : 'right', justifyContent:'flex-end'}}>
                        <p style={{textAlign:'center'}}>{props.userInfo.username}</p>
                        <section className="player-health" style={{flexDirection:'row-reverse', clipPath:'polygon(0 0, 75% 0, 100% 100%, 25% 100%)'}}>
                            <section className='health-bar' ref={ref} style={{
                                width : `${health}% !important`,
                                height : '100%'
                            }}></section>
                        </section>
                    </div>
                </div>                         
            </div>
        </div>        

        <div className="game-tools">
            <GameCanvas playerCoordinate={playerCoordinate}  
                        setPlayerCoordinate={setPlayerCoordinate}
                        boundaryGrid={boundaryGrid}
                        mapChoice={props.mapChoice} 
                        mapNumber={props.mapNumber} 
                        positionX={positionX} 
                        positionY={positionY} 
                        setPositionX={setPositionX}
                        setPositionY={setPositionY}
                        setPositionLeft={setPositionLeft}
                        setPositionRight={setPositionRight}
                        setPositionDown={setPositionDown}
                        setPositionUp={setPositionUp}
                        roomInfo={props.roomInfo} 
                        userInfo={props.userInfo} 
                        health={health}
                        setHealthHandler={setHealthHandler}
                        totalPoint={totalPoint}
                        totalPointHandler={totalPointHandler}
                        isDead={isDead}
                        endGame={endGame}
                        rank={rank}
                        rankHandler={rankHandler}
                        damage={damage}
                        returnToRoomLobbyHandler={props.returnToRoomLobbyHandler}
                        />
            <id id="player-utilities">
                <button className="skill">Skill 1</button>
                <button className="skill">Skill 2</button>
            </id>
        </div>

    </div>
}