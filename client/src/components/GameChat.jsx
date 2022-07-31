import React from "react";
import { useEffect } from "react";
import { useState, useRef} from "react";
import { socket } from "../ClientSocket";

import "../index.css";


function ChatBox(properties){

    const chatBoxStyle = {
        backgroundColor : (properties.fromMe ? 'green' : 'grey')
    }
    const wrapperPositioning = {
        alignSelf : (properties.fromMe ? 'flex-end' : 'flex-start'),
        flexDirection : (properties.fromMe ? 'row-reverse' : 'row'),
    }

    const innerInfoWrapperStyle = {
        alignItems : (properties.fromMe ? 'flex-end' : 'flex-start')
    }    

    return <div className="game-chatbox-wrapper" style={wrapperPositioning}>
        <div className="game-pfp profile-icon chat-profile-icon">
        </div>    
        <div className="game-chatbox-detail-wrapper" style={innerInfoWrapperStyle}>
            <h1 className="gameroom-chat-sender">{properties.sender}</h1>
            <div className="game-player-chat-box" style={chatBoxStyle}>
                <h1>{properties.message}</h1>
            </div>
        </div>
    </div>
}


export default function GameChat(props){

    const chatRef = useRef();

    const [messageList, setMessageList] = useState([]);    
    const [message, setMessage] = useState('');

    const setMessageHandler = (e) => setMessage(e.target.value);

    socket.on('receive-room-message', (msg, sender) => {
        setMessageList(() => [...messageList, {username : sender, message : msg, fromMe : false}]);
        console.log(messageList, "wkwk");
    }); 

    const sendMessage = (e) => {
        if (message === '') return;
        e.preventDefault();
        socket.emit('user-send-message-to-room', message, props.roomInfo.roomName, props.userInfo.username);
        setMessageList(() => [...messageList, {username : props.userInfo.username ,message, fromMe : true}]);
        setMessage('');
    } 

    // useEffect(()=>{
    //     console.log('first-render', 'wkw', props.chatPosition);
    // },[]);

    // useEffect(()=>{
    //     chatRef.current.style.zIndex = props.chatPosition;
    //     console.log('ccpee', props.chatPosition);
    // }, [props.chatPosition]);


    return <div className="game-chat" ref={chatRef} style={{
        position : (props.inGame ? 'absolute' : 'relative'),
        right : (props.inGame && 0),
        bottom : (props.inGame && "-15px"),
        zIndex : (props.chatPosition)
    }}>
        {!props.closeChat ? 
            <div className="game-chat-box">
            <div className="game-chat-header">
                <h1>Room Chat</h1>
                {props.startGame ? <button onClick={props.setCloseChatHandler} className="close-chat">X</button> : null}
            </div>
            <div className="game-chat-screen">
                {messageList.map((msg) => <ChatBox message={msg.message} playerName={props.userInfo.username} fromMe={msg.fromMe} sender={msg.username}/>)}
            </div>
            <div className="game-chat-input-section">
                <form onSubmit={sendMessage}>
                    <input type="text" placeholder="Enter your message" onChange={setMessageHandler} value={message}></input>
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>        
        : null} 
    </div>
}