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


    const [canvasPositionX, setCanvasPositionX] = useState(0);
    const [canvasPositionY, setCanvasPositionY] = useState(0);



    const shootHandler = (e) => {
        const targetX = e.clientX - canvasPositionX;
        const targetY = e.clientY - canvasPositionY;
        const posX = props.positionX;
        const posY = props.positionY; 
        socket.emit('player-shoot', {targetX, targetY}, {posX, posY}, props.userInfo.username, props.roomInfo);
    }


    useEffect(()=>{


        setCanvasPositionX(mapCanvasRef.current.offsetLeft);
        setCanvasPositionY(mapCanvasRef.current.offsetTop);

        const animate = () => {
            if(endAnimation) return;
            socket.emit('live-server', props.roomInfo, null);
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
                        if (props.boundaryGrid[Math.floor((props.positionX - 2) / 2)][Math.floor(props.positionY / 2)] === 'b' || 
                            props.boundaryGrid[Math.floor((props.positionX - 2) / 2)][Math.floor(props.positionY / 2)] === 'w') break;                        
                    }catch(err){}
                    props.setPositionLeft();   
                    break;
                case 'd' : 
                    try{
                        if (props.boundaryGrid[Math.floor((props.positionX + 2) / 2)][Math.floor(props.positionY / 2)] === 'b' ||
                        props.boundaryGrid[Math.floor((props.positionX + 2) / 2)][Math.floor(props.positionY / 2)] === 'w') break;     
                    }catch(err){}           
                    props.setPositionRight();                     
                    break;               
                case 's' : 
              
                    try{
                        if (props.boundaryGrid[Math.floor(props.positionX / 2)][Math.floor((props.positionY + 2) / 2)] === 'b' || 
                        props.boundaryGrid[Math.floor(props.positionX / 2)][Math.floor((props.positionY + 2) / 2)] === 'w') break;
                    }catch(err){}                                 
                    props.setPositionDown();                   
                    break;                
                case 'w' : 
              
                    try{
                        if (props.boundaryGrid[Math.floor(props.positionX / 2)][Math.floor((props.positionY - 2) / 2)] === 'b' || 
                        props.boundaryGrid[Math.floor(props.positionX / 2)][Math.floor((props.positionY - 2) / 2)] === 'w') break;  
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
        

        socket.on('create-projectile', (target, position, shooter) => {

            
            const {posX, posY} = position;
            const {targetX, targetY} = target;

            const angle = Math.atan2(
                targetY - posY,
                targetX - posX
            )

            map.fillStyle = 'orange'; 

            const bulletAnimate = (startX, startY,velocityX, velocityY, shooter) => {
                map.fillRect(startX-3, startY-3, 6, 6);
                try{ 
                    const bulletPosition = [Math.floor(startX/2), Math.floor(startY/2)]

                    const offsetX = Math.floor(props.positionX/2) - 3; 
                    const offsetY = Math.floor(props.positionY/2) - 3;
                    
                    const playerBodyArea = [];
                    for (let h = offsetX; h < offsetX + 6; h++){
                        for (let v = offsetY; v < offsetY + 6; v++){
                            playerBodyArea.push([h,v]);
                        }
                    } 
                    
                    const playerIsHit = playerBodyArea.find((position) => position[0] == bulletPosition[0] && position[1] == bulletPosition[1])
                    if (playerIsHit && shooter !== props.userInfo.username){
                        console.log('ketembak luuuu');
                        window.cancelAnimationFrame(bulletAnimate);
                        return;                        
                    }

                    if (props.boundaryGrid[Math.floor(startX/2)][Math.floor(startY/2)] === 'w' ||
                        bulletPosition[0] < 0 || bulletPosition[1] < 0 ||
                        bulletPosition[0] > 1182 || bulletPosition[1] > 682
                    ) {
                        console.log(props.positionX/2, props.positionY/2);
                        console.log(bulletPosition);
                        console.log(playerBodyArea);
                        console.log('nabrak');
                        window.cancelAnimationFrame(bulletAnimate);
                        return;
                    }
                }catch(err){}

                window.requestAnimationFrame(() => bulletAnimate(startX+velocityX, startY+velocityY, velocityX, velocityY, shooter));
            }            


            let startX = posX;
            let startY = posY;

            const velocityX = Math.cos(angle) * 2;
            const velocityY = Math.sin(angle) * 2;

            console.log('shoot');
            bulletAnimate(startX, startY,velocityX, velocityY, shooter);
            // const bulletPeriod = setInterval(() => {
            //     try{                     
            //         if (start === targetX || props.boundaryGrid[start/2][(posY)/2] === 'w' ){
            //             clearInterval(bulletPeriod);
            //         }
            //     } catch(err){}
            //     // map.drawImage(mapImage, 0, 0);  //  
                 
            //     map.fillRect(start, posY, 6, 6);
            //     start += 1;                
            // },10); 
        });        
    

        

      
        mapImage.onload = () => {
            map.drawImage(mapImage, 0,0);               
            map.drawImage(playerImage, props.positionX-6, props.positionY-6, 12, 12);    
            // map.drawImage(playerImage, -6, -6, 12, 12);                       
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
                props.setPlayersStatsHandler(data);
                map.drawImage(mapImage, 0, 0) //    
                map.drawImage(playerImage, props.positionX-6, props.positionY-6, 12, 12);                             
                for (let player of data){
                    if (player.username === props.userInfo.username) continue;  
                    map.drawImage(playerImage, player.positionX-6, player.positionY-6, 12, 12);
                    // map.drawImage(playerImage, -6, -6, 12, 12);                      
                    // map.fillStyle = 'orange';
                    // map.fillRect(0,0,8,8);                       
                }
            });                 
        } catch(err){}
       

        map.drawImage(mapImage, 0,0);           
        map.drawImage(playerImage, props.positionX-6, props.positionY-6, 12, 12);   
        // map.drawImage(playerImage, -6, -6, 12, 12);              

        

        return () =>  {
            window.removeEventListener('keypress', movementHandler);  

        }
        
    },[props.positionX, props.positionY, refresher]);

    return <div id="game-canvas" ref={mapCanvasWrapperRef}>
        <canvas id="map-canvas" ref={mapCanvasRef} width={1181} height={632} onClick={shootHandler}>
            <img src={Map} alt="#"/>
        </canvas>
    </div>    
}