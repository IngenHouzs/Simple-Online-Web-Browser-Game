import React from "react";

export default function Profile(props){
    return <div id="profile">
        <div className="profile-badge">
            <div className="profile-icon"></div>
            <div className="profile-info">
                <h1>{props.userInfo.username}</h1>
                <div className="profile-trophies">
                    <div className="trophies"></div>
                    <h1>{props.userInfo.point}</h1>                            
                </div>        
            </div>
        </div> 
        <div className="profile-achievement">
            <div className="profile-rank">
                <div className="rank-badge"></div>
                <h1>Master</h1>
            </div>
            <div className="profile-leaderboard">
                <div className="leaderboard-badge">
                </div>
            </div>
        </div> 
        <button className="friend-list">
            <div className="friend-icon"></div>                        
            <h1>Friend List</h1>
        </button>  
        <a className="log-out">LOG OUT</a> 
    </div>
}