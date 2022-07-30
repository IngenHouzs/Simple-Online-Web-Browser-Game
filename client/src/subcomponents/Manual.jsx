import React from "react";
import { useState, useEffect } from "react";

import Keyboard from "../assets/manual/WASD.png";
import Mouse from "../assets/manual/mouse.png";
import GameSimulation from "../assets/manual/game-simulation.png"; 
import Meteor from "../assets/game/meteor.png";
import BoundlessBullet from "../assets/game/boundless-bullet.png";
import Sword from "../assets/game/sword.png";
import Bullet from "../assets/game/bullet.png";


function Page1(properties){
    return <div className="manual-section page-1">
        <h1>Game Tutorial</h1>
        <div className="manual-control">
            <div className="control">
                <p>Movement</p>
                <img src={Keyboard} className="keyboard" alt="#"/>
            </div>
            <div className="control">
                <p>Attack <br/><span>Click on anywhere you are aiming at.</span></p>              
                <img src={Mouse} className="mouse" alt="#"/>
            </div>            
        </div>
    </div>
} 

function Page2(properties){

    const setPosition = (x, y, color) => {
        return {
            top : `${y}px`, 
            left : `${x}px`,
            color, 
            fontWeight : 'bold'
        }   
    }

    return <div className="manual-section page-2"> 
        <img src={GameSimulation} alt="#"/>
        <p className="indicator-text" style={setPosition(120,145, "black")}>Your Character</p>
        <p className="indicator-text" style={setPosition(120,275, "red")}>Enemy</p>        
        <p className="indicator-text" style={setPosition(370,140, "red")}>Enemy</p>       
        <p className="indicator-text" style={setPosition(550,155, "red")}>Enemy</p>          
        <p className="indicator-text" style={setPosition(550,340, "red")}>Enemy</p>         
        <p className="indicator-text" style={setPosition(660, 370, "black")}>Skills</p>        
        <p className="indicator-text" style={setPosition(600, 110, "black")}>Your Mana Point</p>          
        <p className="indicator-text" style={setPosition(610, 30, "black")}>Your Health Point</p>           
        <p className="indicator-text" style={setPosition(300, 30, "red")}>Enemies Stats</p>         
    </div>
}

function Page3(properties){
    return <div className="manual-section page-3">
        <h1>Objective : SURVIVE FOR AS LONG AS POSSIBLE</h1>
        <ul>
            <li>Each damage given grants points.</li>
            <li>Last survivor earns extra 30 rank points.</li>            
        </ul>
        <div className="skill-list">
            {properties.skills.map(skill =>     
                <div className="skill-info">
                    <img src={skill.logo} alt="#"/>
                    <p>{skill.name}</p>
                    <div className="skill-damage-info">
                        <img src={Sword} alt="#"/>
                        <p>{skill.damage}</p>
                    </div>
                </div>                
            )}
        </div>
        <button onClick={properties.setIsOpenManualHandler}>
            I am ready to play!
        </button>
    </div>
}

export default function Manual(props){ 

    const [currentPage, setCurrentPage] = useState(0);

    const renderPage = () => {
        if (currentPage === 0) return <Page1/>
        else if (currentPage === 1) return <Page2/>
        else if (currentPage === 2) return <Page3 {...props}/>
    }

    return <div id="manual">
        <div className="manual-carousel-slider" style={{justifyContent : (currentPage === 0 && "flex-end")}}>
            {currentPage !== 0 ? 
                        <button onClick={()=>setCurrentPage(currentPage => (currentPage - 1) % 3)}>&lt;</button> : null}
            {currentPage !== 2 ? 
                        <button onClick={()=>setCurrentPage(currentPage => (currentPage + 1) % 3)}>&gt;</button> : null}        
        </div>
        {renderPage()}
    </div>
}


