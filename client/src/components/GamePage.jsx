import React from "react";
import GameRoomBody from "./GameRoomBody";
import GameRoomNav from "./GameRoomNav";
import Game from "./Game";

export default function GamePage(props){
    return <div className="game-page" style={{
        width : (!props.startGame ? '70%' : '100%'),
        margin : (!props.startGame ? null : '0 auto') 
    }}>
        {!props.startGame ? <GameRoomNav roomInfo={props.roomInfo} userInfo={props.userInfo} startGame={props.startGame} setStartGameHandler={props.setStartGameHandler} setIsOpenManualHandler={props.setIsOpenManualHandler}/> : null}
        {!props.startGame ? <GameRoomBody roomInfo={props.roomInfo} userInfo={props.userInfo} startGame={props.startGame} setStartGameHandler={props.setStartGameHandler} map={props.map} mapList={props.mapList} setMapLeft={props.setMapLeft} setMapRight={props.setMapRight}/> : null}
    </div>
}