import React from "react";
import { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';
import { webserver } from "../ServerConfig";
import FriendsLogo from "../assets/create-room/friends.png";
import Padlock from "../assets/create-room/padlock.png";
import { socket } from "../ClientSocket";

export default function CreateRoom(props){

    const {search} = useLocation();
    const {roomId} = queryString.parse(search);

    const userInformation = props.userInfo;    

    const navigate = useNavigate();

    const [roomName, setRoomName] = useState('');
    const [roomPlayerCount, setRoomPlayerCount] = useState(1);
    const [roomPW, setRoomPW] = useState('');

    const [isInvalidName, setIsInvalidName] = useState(false);
    const [isInvalidPlayerCount, setIsInvalidPlayerCount] = useState(false);
    const [enableRoomPassword, setEnableRoomPassword] = useState(false)
    const multiChoiceInput = useRef();

    const maxPlayerChosenAnimation = (e) => {
        const multiChoiceInputElements = multiChoiceInput.current.childNodes;
        for (let buttons of multiChoiceInputElements){        
            if (buttons.value == e.target.value){
                buttons.style.backgroundColor = 'green';
                setRoomPlayerCount(buttons.value);
            } else buttons.style.backgroundColor = '#34306b';    
        }       
    }

    const submitQuery = (e) => {
        e.preventDefault();

        if (roomName === '') setIsInvalidName(true);
        else setIsInvalidName(false);      

        if (roomPlayerCount === 1) setIsInvalidPlayerCount(true);
        else setIsInvalidPlayerCount(false);

        if (isInvalidName || isInvalidPlayerCount || roomName === '' || roomPlayerCount === 1) return;
        // successful

        const requestDetail = {
            mode : 'cors',
            headers : {
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : '*'
            },
            method : 'POST',
            body : JSON.stringify({
                roomName,
                players : 1,
                host : props.userInfo.username,
                maxPlayer : Number(roomPlayerCount),
                password : (enableRoomPassword ? roomPW : null),
                playerList : [props.userInfo]
            })
        }
        const targetAPI = webserver + '/app';
        fetch(targetAPI, requestDetail)
            .then((res) => res.json())
            .then((res) => {
                props.addNewRoomToClient(res.data);
                socket.emit('announce-new-room');
                socket.emit('joined-room', props.userInfo, res.data);
                props.updateOpenCreateRoom();
                const room = res.data;
                navigate(`/app/room?Id=${res.data.roomID}`,{state : {room, userInformation}});
            })
            .catch((err) => console.error(err)); 
    }


    const roomNameHandler = (e) => {  
        setRoomName(e.target.value);
    }

    const setRoomPassword = () => setEnableRoomPassword(!enableRoomPassword);
    const setRoomPasswordString = (e) => setRoomPW(e.target.value);

    const maxPlayerList = [2,3,4,5];

    return <div className="submenu create-room-card" onSubmit={submitQuery}>
        <h1 className="submenu-title">Create Room</h1>
        <form method='POST' onSubmit={null}>
            <input type="text" className="room-name-input" name="roomName"placeholder="Enter room name" value={roomName} onChange={roomNameHandler}></input>
            <label className="error-message error-invalid-name">{isInvalidName ? "Invalid name format" : null}</label>
            <div className="horizontal-create-room-description">
                <img src={FriendsLogo} alt="#"/>
                <label className="submenu-form-label">Max Player Count</label>
            </div>
            <div className="multichoice-input" ref={multiChoiceInput}>
                {maxPlayerList.map((num) => <input type="button" onClick={maxPlayerChosenAnimation} name="maxPlayer" value={num}></input>)}
            </div>
            <label className="error-message error-invalid-player-count">{isInvalidPlayerCount ? "Choose player count limit" : null}</label>            
            <div className="horizontal-create-room-description password-setting-wrapper">
                <img src={Padlock} className="bigger-create-room-icon" alt="#"/>
                <div className="create-room-password">
                    <div>
                        <label>Room Password</label>
                        <input type="checkbox" onClick={setRoomPassword}></input>
                    </div>
                    <input type="text" style={{visibility : (enableRoomPassword ? 'visible' : 'hidden')}} value={roomPW} onChange={setRoomPasswordString}></input>
                </div>
            </div>
            <div className="horizontal-create-room-description endpoint-create-room">
                <button className="exit-button" onClick={props.updateOpenCreateRoom}>Cancel</button>
                <input type="submit" value="Create Room"></input>
            </div>
        </form>
    </div>
}