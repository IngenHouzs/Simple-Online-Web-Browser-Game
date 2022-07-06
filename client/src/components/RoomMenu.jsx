import React from "react";



function RoomButton(properties){
    return <div className="room-button">   
        {properties.roomName}
    </div>
}

export default function RoomMenu(props){
    return <div id="room-menu">
        <h1>Hello, <span>{props.userInfo.username}</span></h1>
        <h1>Let's play some games.</h1>
        <div className="room-list">
            {props.rooms.map((room) => <RoomButton roomName={room.roomName}/>)}                                   
        </div>
    </div>
}