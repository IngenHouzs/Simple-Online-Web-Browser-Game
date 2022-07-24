import React from "react";
import { useState, useEffect } from "react";
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

    const [playersStats, setPlayersStats] = useState(props.gameData);

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

    const setPlayersStatsHandler = (data) => setPlayersStats(data);
    const setHealthHandler = (HP) => setHealth(HP);
    const setEnemyListHandler = (data) => setEnemyList([...data]);
    

    const renderEnemyList = () => {
        try{
        return enemyList.map((player) => <PlayerCard player={player} health={player.health} roomInfo={props.roomInfo}/>)        
        }catch(err){console.error(err)}
    }


    useEffect(() => {   
        setEnemyList(props.gameData);
        
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
            // only run at the first game initialization (first render) OR whenever user leaves / disconnect.
            // for constant changes throughout the game, will be done with another socket call
            //      by accessing its index directly (don't have to go through loop).
            try{
                const gameData = data.gameData;
                // setEnemyList(data.gameData);
                for (let player in gameData){
                    if (gameData[player].username === props.userInfo.username){
                        setHealth(100);   
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


        ref.current.style.setProperty('width', `100%`, 'important');

        // socket.on('update-player-stats', (data) => {
        //     setPlayersStats(data);
        //     setEnemyList(data);
        //     console.log('data', data);
        //     console.log(enemyList, 'huhuhu');
        // });


        // setInterval(() => console.log(enemyList,'----'), 3000);

                         
    }, []);




    useEffect(() => { 
        // setEnemyList(() => props.roomInfo.playerList.filter((player) => player.username !== props.userInfo.username));
        
        setPlayersStats(props.roomInfo.gameData);
    },[props.roomInfo])


    useEffect(()=> {
        // console.log(enemyList, 'els');
    }, [enemyList])


    return <div id="game">
        <button onClick={props.setCloseChatHandler} className="open-chat">
            <img src={ChatIcon} alt="#"/>
        </button>

        <div className="ingame-player-status-wrapper">
            <div className="not-self-player">
                {renderEnemyList()}
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
                        setPlayersStatsHandler={setPlayersStatsHandler}
                        playersStats={playersStats}
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
                        setEnemyListHandler={setEnemyListHandler}
                        damage={damage}/>
            <id id="player-utilities">
                <button className="skill">Skill 1</button>
                <button className="skill">Skill 2</button>
            </id>
        </div>

    </div>
}