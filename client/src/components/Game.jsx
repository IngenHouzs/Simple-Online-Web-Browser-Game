import React from "react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { socket } from "../ClientSocket";

import GameCanvas from "./GameCanvas";
import ChatIcon from "../assets/game-room/chat.png";


import '../index.css';


function PlayerCard(properties){
    return <div className="ingame-player-card" style={{marginRight:'1rem !important'}}>
        <div className="profile-icon"></div>
        <div className='player-status'>
            <p>{properties.player.username}</p>
            <progress className="player-health" value={properties.health} max={100}></progress>
        </div>
    </div>
}

function SkillButton(properties){
    const skillObject = properties.skill;
    return <button className="skill">
        <img src={skillObject.logo} alt="#" onClick={() => properties.decrementMana(skillObject.manaUsage, skillObject.id)}/>
    </button>       
}


export default function Game(props){

    const [playerIndex, setPlayerIndex] = useState(-1);

    const [health, setHealth] = useState(100);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const [enemyList, setEnemyList] = useState([]);
    const [rank, setRank] = useState(-1);

    const [isDead, setIsDead] = useState(false);

    const [totalPoint, setTotalPoint] = useState(0);
    const [endGame, setEndGame] = useState(false);  

    const [mana, setMana] = useState(0);    

    const [row, setRow] = useState(1180);
    const [column, setColumn] = useState(632); 

    const [damage, setDamage] = useState(10);


    const [activeSkill, setActiveSkill] = useState(null); 

    const pointRef = useRef(totalPoint);

    const decrementMana = (weight, id) => {
        if (mana < weight) return;
        setMana(mana => mana - weight); 
        if (mana < 0) setMana(0);
        setActiveSkill(id);
    }
    
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
    
    const setActiveSkillToEmpty = () => setActiveSkill(null);

    const [playerCoordinate, setPlayerCoordinate] = useState({x : 0, y : 0});

    const setHealthHandler = (HP) => setHealth(HP);
    const totalPointHandler = (value) => {  
        if (endGame) return;
        setTotalPoint(totalPoint => totalPoint + value);
    }
    const rankHandler = (value) => setRank(value);  

    const decreaseHealth = (value) => {
        setHealth(health => health - value);
    }

    useEffect(() => { 
        pointRef.current = totalPoint;
    },[totalPoint]) 


    useEffect(() => {   
        setTotalPoint(0);
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
                const findPlayersExceptSelf = gameData.filter(player => player.username !== props.userInfo.username);
                setEnemyList(findPlayersExceptSelf);

                for (let player in gameData){
                    if (gameData[player].username === props.userInfo.username){
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
        });


        const postPlayerPoint = (num) => socket.emit('accumulate-player-point', props.userInfo, num);        
        
        socket.on('end-game', (shooter, quit) => {
            setEndGame(true); 
            if (quit) setTotalPoint(totalPoint => totalPoint + 30);
            if (props.userInfo.username === shooter) postPlayerPoint(pointRef.current + 30); // 30 is for last survivor bonus
            else postPlayerPoint(pointRef.current);

    
          });        

        socket.on('update-player-list', newPlayersData => {
            try{
                const findPlayersExceptSelf = newPlayersData.filter((player) => player.username !== props.userInfo.username);
                setEnemyList(findPlayersExceptSelf);
            }catch(err){}
        });



        return () => {
            socket.off('end-game');
            socket.off('player-death');
            socket.off('update-player-list');

        }
                         
    }, []);

    useEffect(() => {
        const manaRegeneration = setInterval(() => {
            if (mana > 100){
                setMana(100);
                return;
            } 
            setMana(mana => mana + 10);
        }, 2000);

        return () => clearInterval(manaRegeneration);
    }
    , [mana])

   



    return <div id="game">
        <button onClick={props.setCloseChatHandler} className="open-chat">
            <img src={ChatIcon} alt="#"/>
        </button>

        <div className="ingame-player-status-wrapper">
            <div className="not-self-player">
                { enemyList ? (enemyList.map((player) => <PlayerCard player={player} health={player.health} roomInfo={props.roomInfo}/>)) : null}
            </div>
            <div className="self-player">  
                <div className="ingame-player-card self-player-card" style={{flexDirection:'row-reverse', backgroundColor:'grey'}}>
                    <div className="profile-icon"></div>
                    <div className='player-status' style={{textAlign : 'right', justifyContent:'flex-end'}}>
                        <p style={{textAlign:'center'}}>{props.userInfo.username}</p>
                        <progress  className="player-health" value={health} max={100}></progress>
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
                        decrementMana={decrementMana}
                        activeSkill={activeSkill}
                        skills={props.skills}
                        skillList={props.skillList}
                        setActiveSkillToEmpty={setActiveSkillToEmpty} 
                        decreaseHealth={decreaseHealth}
                        />
            <id id="player-utilities">
                <progress id="mana-bar" max={100} value={mana}></progress>
                <div>
                    {props.skillSet.map((skillIndex) => <SkillButton skill={props.skills[skillIndex]} decrementMana={decrementMana} index={skillIndex}/>)} 
                </div>
            </id>
        </div>

    </div>
}