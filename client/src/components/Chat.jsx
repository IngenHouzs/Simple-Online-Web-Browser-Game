import React from "react";
import { useState } from "react";
import {socketIOClient, socket, ENDPOINT} from "../ClientSocket";

const ChatBox = (properties) => {

    const outerWrapperStyle = {
        alignSelf : (properties.fromMe ? 'flex-end' : 'flex-start'),
        flexDirection : (properties.fromMe ? 'row-reverse' : 'row'),
    }

    const innerInfoWrapperStyle = {
        alignItems : (properties.fromMe ? 'flex-end' : 'flex-start')
    }

    const profilePictureStyle = {
        marginLeft : (properties.fromMe ? '1rem' : '0'),
        marginRight : (properties.fromMe ? '0' : '1rem')        
    }

    const chatBoxStyle = {
        backgroundColor : (properties.fromMe ? 'green' : 'grey')
    }

    return (
        <div className="chat-user-wrapper" style={outerWrapperStyle}>
            <div className="profile-icon chat-profile-icon" style={profilePictureStyle}></div>            
            <div className="chat-detail-wrapper" style={innerInfoWrapperStyle}>
                <h1>{properties.fromMe ? 'You' : properties.sender}</h1>    
                <div className="chat-box" style={chatBoxStyle}>
                    <h1>{properties.message}</h1>    
                </div>                                    
            </div>
        </div>        
    )
}
           

export default function Chat(props){

    const [messageList, setMessageList] = useState([]);
    const [message, setMessage] = useState('');

    socket.on('server-broadcast-user-message', (message, sender) => {
        setMessageList(() => [...messageList, {
            message, sender, fromMe : false}
        ]);
    });

    const sendMessage = () => {
        if (message === '') return;
        socket.emit('user-send-message', message, props.userInfo.username);
        setMessageList(() => [...messageList, {
            message, sender : props.userInfo.username,fromMe : true}
        ]);
        setMessage('');
    }

    const messageHandler = (e) => {
        setMessage(e.target.value);
    }

    return <div id="chat">
        <div className="chat-wrapper">
            <h1>Online User : {props.onlinePlayers}</h1>
            <div className="chat-screen">            
                {messageList.map((detail) => <ChatBox message={detail.message} fromMe={detail.fromMe} sender={detail.sender}/>)}
            </div>
        </div>
        <div className="chat-input-wrapper">
            <input type="text" placeholder="Type your message" name="message" value={message} onChange={messageHandler}></input>
            <button onClick={sendMessage}>Send</button>
        </div>
    </div>
}