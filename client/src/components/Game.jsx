import React from "react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { socket } from "../ClientSocket";

import ChatIcon from "../assets/game-room/chat.png";

import '../index.css';


function PlayerCard(properties){

    const ref = useRef();

    const healthBar = {
        width : `${properties.health} !important`,
        height : '100%'
    }


    useEffect(() => {
        ref.current.style.setProperty('width', `${properties.health}%`, 'important');
    }, []);

    return <div className="ingame-player-card" style={{marginRight:'1rem !important'}}>
        <div className="profile-icon"></div>
        <div className='player-status'>
            <p>{properties.player.username}</p>
            <section className="player-health">
                <section className='health-bar' ref={ref} style={healthBar}></section>
            </section>
        </div>
    </div>
}


export default function Game(props){

    const ref = useRef();    

    const [health, setHealth] = useState(90);
    const [enemyList, setEnemyList] = useState(() => props.roomInfo.playerList.filter((player) => player.username !== props.userInfo.username))


    useEffect(() => {
        ref.current.style.setProperty('width', `${health}%`, 'important');
        const tempEnemyList = enemyList;
        tempEnemyList.forEach((player) => player.health = 30);
        setEnemyList(tempEnemyList);
    }, []);

    const healthBar = {
        width : `${health} !important`,
        height : '100%'
    }    

    return <div id="game">
        <button onClick={props.setCloseChatHandler} className="open-chat">
            <img src={ChatIcon} alt="#"/>
        </button>

        <div className="ingame-player-status-wrapper">
            <div className="not-self-player">
                {enemyList.map((player) => <PlayerCard player={player} health={player.health} roomInfo={props.roomInfo}/>)}
            </div>
            <div className="self-player">  
                <div className="ingame-player-card self-player-card" style={{flexDirection:'row-reverse', backgroundColor:'grey'}}>
                    <div className="profile-icon"></div>
                    <div className='player-status' style={{textAlign : 'right', justifyContent:'flex-end'}}>
                        <p style={{textAlign:'center'}}>{props.userInfo.username}</p>
                        <section className="player-health" style={{flexDirection:'row-reverse', clipPath:'polygon(0 0, 75% 0, 100% 100%, 25% 100%)'}}>
                            <section className='health-bar' ref={ref} style={healthBar}></section>
                        </section>
                    </div>
                </div>                         
            </div>
        </div>        

        <div className="game-tools">
            <div id="game-canvas">

            </div>
            <id id="player-utilities">
                <button className="skill">Skill 1</button>
                <button className="skill">Skill 2</button>
            </id>
        </div>

    </div>
}