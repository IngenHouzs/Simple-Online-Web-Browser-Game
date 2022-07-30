import React from "react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { socket } from "../ClientSocket";
import "../index.css";

import GameDeathOverlay from "../subcomponents/GameDeathOverlay";

import Map from "../assets/game/map.png";
import Player from "../assets/game/player.png";
import Enemy from "../assets/game/enemy.png";


export default function GameCanvas(props){

    const mapCanvasRef = useRef();
    const mapCanvasWrapperRef = useRef();
    const [endAnimation, setEndAnimation] = useState(false);
    const [refresher, setRefresher] = useState(false);
    const [gridIsSet, setGridIsSet] = useState(false);

    const [mapsList, setMapsList] = useState([Map]);


    const [canvasPositionX, setCanvasPositionX] = useState(0);
    const [canvasPositionY, setCanvasPositionY] = useState(0);

    const [countBoundlessBullet, setCountBoundlessBullet] = useState(0);



    const shootHandler = (e) => {
        if (props.isDead) return;

        const targetX = e.clientX - canvasPositionX;
        const targetY = e.clientY - canvasPositionY;

        const posX = props.positionX;
        const posY = props.positionY;
        
        console.log(canvasPositionX, canvasPositionY, "|||", mapCanvasRef.current.getBoundingClientRect().x, mapCanvasRef.current.getBoundingClientRect().y);

        // disini tentuin skillnya 
        if (props.activeSkill !== null){

            // meteor
            if (props.activeSkill === 0){
                socket.emit('skill-0', props.userInfo, props.roomInfo, 0, {targetX, targetY});
            } 
            // boundless bullet
            else if (props.activeSkill === 1){

                if (countBoundlessBullet < props.skills[1].count) {
                    setCountBoundlessBullet(countBoundlessBullet => countBoundlessBullet + 1);
                    socket.emit('player-shoot', {targetX, targetY}, {posX, posY}, props.userInfo.username, props.roomInfo, true);                     
                } else {                
                    props.setActiveSkillToEmpty();
                    setCountBoundlessBullet(0);
                    socket.emit('player-shoot', {targetX, targetY}, {posX, posY}, props.userInfo.username, props.roomInfo, false);                        
                }
            }
            return;
        }

        socket.emit('player-shoot', {targetX, targetY}, {posX, posY}, props.userInfo.username, props.roomInfo, false);
    }


    useEffect(()=>{


        setCanvasPositionX(Math.floor(mapCanvasRef.current.getBoundingClientRect().x));
        setCanvasPositionY(Math.floor(mapCanvasRef.current.getBoundingClientRect().y));

        const animate = () => {
            if(endAnimation) return; 
            setCanvasPositionX(Math.floor(mapCanvasRef.current.getBoundingClientRect().x));
            setCanvasPositionY(Math.floor(mapCanvasRef.current.getBoundingClientRect().y));            
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

        socket.on('player-death', (data, shooter, lastHit, damage, ranking) => {
            if (data.username !== props.userInfo.username){
                if (props.userInfo.username === shooter){  
                    if (lastHit) props.totalPointHandler(15);
                    else props.totalPointHandler(Math.floor(damage/4));
                    return;
                }                    
                return;
            }  
            props.rankHandler(ranking);
            window.removeEventListener('keypress', movementHandler);
        });

        const canvas = mapCanvasRef.current;
        const map = canvas.getContext('2d');

        const mapImage = new Image();
        const playerImage = new Image();        
        const enemyImage = new Image();

        mapImage.src = mapsList[props.mapNumber];
        playerImage.src = Player; 
        enemyImage.src = Enemy;
        

        socket.on('create-projectile', (target, position, shooter, boundlessBullet) => {

            
            const {posX, posY} = position;
            const {targetX, targetY} = target;

            const angle = Math.atan2(
                targetY - posY,
                targetX - posX
            )

            map.fillStyle = 'orange'; 

            const bulletAnimate = (startX, startY,velocityX, velocityY, shooter, damage) => {
                // map.fillRect(startX-3, startY-3, 6, 6);
                // map.arc(startX-3, startY-3, 6, Math.PI * 2);

                map.beginPath();
                map.arc(startX-3, startY-3, 4, 0,Math.PI * 2);                
                map.fill();

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
                        socket.emit('bullet-hit', props.roomInfo, shooter, props.userInfo, props.damage);
                        props.decreaseHealth(props.damage);                        
                        window.cancelAnimationFrame(bulletAnimate);
                        return;                        
                    } 


                    if ((props.boundaryGrid[Math.floor(startX/2)][Math.floor(startY/2)] === 'w' ||
                        bulletPosition[0] < 0 || bulletPosition[1] < 0 ||
                        bulletPosition[0] > 1182 || bulletPosition[1] > 682
                    ) && !boundlessBullet) {
                        window.cancelAnimationFrame(bulletAnimate);
                        return;
                    }
                }catch(err){}

                window.requestAnimationFrame(() => bulletAnimate(startX+velocityX, startY+velocityY, velocityX, velocityY, shooter, damage));
            }            


            let startX = posX;
            let startY = posY;

            const velocityX = Math.cos(angle) * 2;
            const velocityY = Math.sin(angle) * 2;


            bulletAnimate(startX, startY,velocityX, velocityY, shooter, props.damage);

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
    

        socket.on('launch-skill-0', (shooterObject, ID, target)=> {
            props.setActiveSkillToEmpty();            
            const animationDuration = 30; //fps
            const renderSkill = () => {
                if (props.isDead) return;
                const skillDelay = setTimeout(() => {
                    const {targetX, targetY} = target;                    
                    const offsetX = Math.floor(targetX/2 - props.skills[ID].radius/2); 
                    const offsetY = Math.floor(targetY/2 - props.skills[ID].radius/2);
              
                    const impactArea = [];
                    for (let h = offsetX; h < offsetX + props.skills[ID].radius; h++){
                        for (let v = offsetY; v < offsetY + props.skills[ID].radius; v++){
                            impactArea.push([h,v]);     
                        }
                    }  
                    

                    const PlayerOffsetX = Math.floor(props.positionX/2) - 3; 
                    const PlayerOffsetY = Math.floor(props.positionY/2) - 3;
                    
                    const playerBodyArea = [];
                    for (let h = PlayerOffsetX; h < PlayerOffsetX + 6; h++){
                        for (let v = PlayerOffsetY; v < PlayerOffsetY + 6; v++){
                            playerBodyArea.push([h,v]);
                        }
                    } 

                    console.log(playerBodyArea, '2wlw');
                    console.log(impactArea, 'wejeje');

                    // const playerInImpactArea = playerBodyArea.filter((coordinate, idx) => coordinate[0] === impactArea[idx][0] && coordinate[1] === impactArea[idx][1]);                          
                    let playerIsHit = false;
                    for (let impact of impactArea){
                        for (let self of playerBodyArea){
                            if (self[0] === impact[0] && self[1] === impact[1]){
                                playerIsHit = true;
                                break;
                            }
                        }
                    }

                    // const playerIsHit = impactArea.find((position) => position[0] == Math.floor(props.positionX/2) && position[1] == Math.floor(props.positionY/2)); 

                    if (playerIsHit && shooterObject.username !== props.userInfo.username){
                        console.log('hit');
                        socket.emit('bullet-hit', props.roomInfo, shooterObject.username, props.userInfo, props.skills[ID].damage);
                        props.decreaseHealth(props.skills[ID].damage);
                    }                    
                    
                    // check if anyone hit
                    
                    map.fillStyle = 'red';
                    let animationCounter = 0
                    const nukeAnimate = () => {
                        // for (let i of impactArea){
                        //     map.fillRect(i[0] * 2, i[1]*2, 2, 2 );
                        // }
                        map.fillRect(impactArea[0][0] * 2, impactArea[0][1] * 2, props.skills[ID].radius * 2, props.skills[ID].radius * 2);
                        animationCounter++;
                        if (animationCounter >= animationDuration) {
                            window.cancelAnimationFrame(nukeAnimate);
                            return;
                        }
                        window.requestAnimationFrame(nukeAnimate);
                    }

                    nukeAnimate();


                }, props.skills[ID].delay);
            }

            renderSkill();
        });

        

      
        mapImage.onload = () => { 
            if (props.isDead) return;
            map.drawImage(mapImage, 0,0);               
            map.drawImage(playerImage, props.positionX-6, props.positionY-6, 12, 12);    
            // map.drawImage(playerImage, -6, -6, 12, 12);                       
        }
    

        if (!props.isDead) socket.emit('change-player-stats', props.userInfo, props.roomInfo, {
            positionX : props.positionX,
            positionY : props.positionY,
            playerCoordinate : {
                x : props.positionX / 2,
                y : props.positionY / 2
            },
            health : props.health
        });

        try{ 
            socket.on('update-player-stats', (data, victimData, shooter, lastHit, damage) => {
                if (props.userInfo.username === shooter){  
                    if (lastHit) props.totalPointHandler(30);
                    else props.totalPointHandler(Math.floor(damage/2));
                    return;
                }    
                // props.setEnemyListHandler(data);
                
                // console.log("IINI GAME DATA", data);                
                // console.log("beruba", props.enemyList);
                
            });
            socket.on('live-game-update', (data) => {  
                // props.setPlayersStatsHandler(data);
                // const tempData = data;
                // props.setEnemyListHandler(tempData);
                // console.log(data[0].health, data[1].health);
                // try{
                // console.log(props.enemyList[0].health, props.enemyList[1].health, 'hehe')
                // }catch(err){}
                // console.log(data, 'hehehe');
                map.drawImage(mapImage, 0, 0) //    
                map.drawImage(playerImage, props.positionX-6, props.positionY-6, 12, 12);                             
                for (let player of data){
                    if (player.username === props.userInfo.username) continue;  
                    map.drawImage(enemyImage, player.positionX-6, player.positionY-6, 12, 12);
                    // map.drawImage(playerImage, -6, -6, 12, 12);                      
                    // map.fillStyle = 'orange';
                    // map.fillRect(0,0,8,8);                       
                }
            });                 
        } catch(err){}
       
        if (!props.isDead){
            map.drawImage(mapImage, 0,0);           
            map.drawImage(playerImage, props.positionX-6, props.positionY-6, 12, 12);   
        }
        // map.drawImage(playerImage, -6, -6, 12, 12);              

        return () =>  {
            window.removeEventListener('keypress', movementHandler);  
            socket.off('update-player-stats');
            socket.off('live-game-update');
            socket.off('create-projectile');
            socket.off('skill-ready');
        }
        

    },[props.positionX, props.positionY, refresher]);

    return <div id="game-canvas" ref={mapCanvasWrapperRef}>
        {props.isDead || props.endGame ? <GameDeathOverlay/> : null}
        {props.isDead ? 
            <div className="game-end player-dead">              
                <h1 style={
                    {
                        color : 'red', 
                        textShadow : '0px 0px 3px black'
                    }
                }>You were killed.</h1>
            </div>
        : 
            props.endGame ?
            <div className="game-end player-dead">              
                <h1 style={
                    {
                        color : '#31d622', 
                        textShadow : '0px 0px 3px black'                        
                    }
                }>You are the last survivor!</h1>
            </div>        
            : null
        }
        {
            props.endGame ? 
            <div className="game-end last-survivor"> 
                <h1>Point gained : {props.totalPoint}</h1> 
                {props.roomInfo.host === props.userInfo.username ? <button onClick={props.returnToRoomLobbyHandler} className="return-button">RETURN</button> : null}               
            </div>
            : null
        }
        <canvas id="map-canvas" ref={mapCanvasRef} width={1181} height={632} onClick={shootHandler}>
            <img src={Map} alt="#"/>
        </canvas>
    </div>    
}