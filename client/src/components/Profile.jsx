import React from "react";
import Bronze from "../assets/badge/bronze.png";
import Silver from "../assets/badge/silver.png";
import Gold from "../assets/badge/gold.png";
import Crystal from "../assets/badge/crystal.png";
import Platinum from "../assets/badge/platinum.png";
import Conqueror from "../assets/badge/conqueror.png";
import RankBadge from "../assets/badge/globalrank.png";

export default function Profile(props){

    const playerRank = () => {
        const point = props.userInfo.point;
        if (point <= 150) return 'Bronze III';
        else if (point > 150 && point <= 350) return 'Bronze II';        
        else if (point > 350 && point <= 600) return 'Bronze I';             
        else if (point > 600 && point <= 900) return 'Silver III';             
        else if (point > 900 && point <= 1200) return 'Silver II';             
        else if (point > 1200 && point <= 1500) return 'Silver I';             
        else if (point > 1500 && point <= 1900) return 'Gold III';             
        else if (point > 1900 && point <= 2300) return 'Gold II';          
        else if (point > 2300 && point <= 2700) return 'Gold I';          
        else if (point > 2700 && point <= 3200) return 'Crystal III';          
        else if (point > 3200 && point <= 3700) return 'Crystal II';          
        else if (point > 3700 && point <= 4200) return 'Crystal I';        
        else if (point > 4200 && point <= 5000) return 'Platinum III';        
        else if (point > 5000 && point <= 5800) return 'Platinum II';        
        else if (point > 5800 && point <= 6400) return 'Platinum I';        
        else if (point > 6400) return 'Conqueror';              
    } 

    const playerBadge = () => {
        const point = props.userInfo.point;
        if (point <= 600) return Bronze;
        else if (point > 600 && point <= 1500) return Silver;                         
        else if (point > 1500 && point <= 2700) return Gold;                       
        else if (point > 2700 && point <= 4200) return Crystal;                
        else if (point > 4200 && point <= 6400) return Platinum;               
        else if (point > 6400) return Conqueror;         
    }

    const findUserOnLeaderboard = () => {
        for (let player in props.playerList){
            if (props.playerList[player].username === props.userInfo.username 
                && player <= 10){
                return Number(player);
            }
        }
        return;
    }

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
                <img className="rank-badge" src={playerBadge()} alt="#"/>
                <h1>{playerRank()}</h1>
            </div>
            {Number(findUserOnLeaderboard() + Number(1)) <= 10 ? 
                <div className="profile-leaderboard">
                    <img className="leaderboard-badge" src={RankBadge} alt="#"/>
                    <p>
                            {Number(findUserOnLeaderboard() + Number(1))}
                        </p>
                    <p>Global Rank</p>                
                </div>        
                : null 
            }

        </div> 
        {/* <button className="friend-list">
            <div className="friend-icon"></div>                        
            <h1>Friend List</h1>
        </button>   */}
        <a className="log-out">LOG OUT</a> 
    </div>
} 

// bronze 3
// bronze 2 
// bronze 1
// silver 3
// silver 2 
// silver 1
// gold 3 
// gold 2 
// gold 1 
// crystal 3 
// crystal 2 
// crystal 1 
// platinum 3 
// platinum 2 
// platinum 1
// conqueror 