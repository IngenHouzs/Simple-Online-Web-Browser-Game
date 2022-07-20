import React from "react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { socket } from "../ClientSocket";
import "../index.css";

import Map from "../assets/game/map.png";
import Player from "../assets/game/segi8.jpg";


export default function GameCanvas(props){

    const mapCanvasRef = useRef();
    const mapCanvasWrapperRef = useRef();
    const [endAnimation, setEndAnimation] = useState(false);
    const [refresher, setRefresher] = useState(false);
    const [gridIsSet, setGridIsSet] = useState(false);



    useEffect(()=>{

  

     
        const animate = () => {
            if(endAnimation) return;
            socket.emit('live-server', props.roomInfo);
            window.requestAnimationFrame(animate);
        }
        
        animate();

        return () => {
            setEndAnimation(true);            
            window.cancelAnimationFrame(animate);          
        }
    },[]);

    useEffect(()=>{
        
        
        
        const movementHandler = (e) => {
            switch(e.key){
                case 'a' :

                    try{   
                        if (props.boundaryGrid[(props.positionX - 2) / 2][props.positionY / 2] === 'b' || 
                            props.boundaryGrid[(props.positionX - 2) / 2][props.positionY / 2] === 'w') break;                        
                    }catch(err){}
                    props.setPositionLeft();   
                    break;
                case 'd' : 
                    try{
                        if (props.boundaryGrid[(props.positionX + 2) / 2][props.positionY / 2] === 'b' ||
                        props.boundaryGrid[(props.positionX + 2) / 2][props.positionY / 2] === 'w') break;     
                    }catch(err){}           
                    props.setPositionRight();                     
                    break;               
                case 's' : 
              
                    try{
                        if (props.boundaryGrid[props.positionX / 2][(props.positionY + 2) / 2] === 'b' || 
                        props.boundaryGrid[props.positionX / 2][(props.positionY + 2) / 2] === 'w') break;
                    }catch(err){}                                 
                    props.setPositionDown();                   
                    break;                
                case 'w' : 
              
                    try{
                        if (props.boundaryGrid[props.positionX / 2][(props.positionY - 2) / 2] === 'b' || 
                        props.boundaryGrid[props.positionX / 2][(props.positionY - 2) / 2] === 'w') break;  
                    }catch(err){}                                  
                    props.setPositionUp();                      
                    break;                
            }
        }
        window.addEventListener('keypress', movementHandler);         

        const canvas = mapCanvasRef.current;
        const map = canvas.getContext('2d');
    
        const mapImage = new Image();
        const playerImage = new Image();
        
        let chosenMap;
        if (props.mapNumber === 0){
            chosenMap = Map;
        } else if (props.mapNumber === 1){
            chosenMap = Map;
        } else if (props.mapNumber === 2){
            chosenMap = Map;
        }

        mapImage.src = chosenMap;
        playerImage.src = Player;        
        mapImage.onload = () => {
            map.drawImage(mapImage, 0,0);               
            map.drawImage(playerImage, props.positionX, props.positionY, 12, 12);            
        }
    

        socket.emit('change-player-stats', props.userInfo, props.roomInfo, {
            positionX : props.positionX,
            positionY : props.positionY,
            playerCoordinate : {
                x : props.positionX / 2,
                y : props.positionY / 2
            },
            health : props.health
        });

        try{
            socket.on('live-game-update', (data) => {                
                for (let player of data){
                    if (player.username === props.userInfo.username) continue;                                     
                    map.drawImage(playerImage, player.positionX, player.positionY, 12, 12);     
                }
            });                 
        } catch(err){}
       

        map.drawImage(mapImage, 0,0);           
        map.drawImage(playerImage, props.positionX, props.positionY, 12, 12);      

        if (props.boundaryGrid[props.positionX/2, props.positionY/2] === 'b'){
            console.log('tembokkkkk', props.boundaryGrid[317][37]);
        }
        return () =>  window.removeEventListener('keypress', movementHandler);  
        
    },[props.positionX, props.positionY, refresher]);

    return <div id="game-canvas" ref={mapCanvasWrapperRef}>
        <canvas id="map-canvas" ref={mapCanvasRef} width={1181} height={632}>
            <img src={Map} alt="#"/>
        </canvas>
    </div>    
}