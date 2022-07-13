const express = require('express');
const router = express.Router();
const cors = require('cors');
const {nanoid} = require('nanoid');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const {database, databaseName, collectionName, roomCollection, usersList} = require('../database');


router.get('/', cors(), async (request, response) => {
    try{
        const databasePromise = database();
        const databaseInstance = await databasePromise
            .then((res) => {
                return res.db(databaseName);
            })
            .catch((err) => {console.error(err)});

        const roomList = await databaseInstance.collection(roomCollection).find().toArray();

        response.status(200).send({
            status : 'success',
            code : 200,
            message : 'successfully fetched available rooms',
            data : roomList
        });
    } catch(err){console.error(err)}
});

router.post('/', cors(), async (request, response) => {
    try{
        const databasePromise = database();
        const databaseInstance = await databasePromise
            .then((res) => {
                return res.db(databaseName);
            })
            .catch((err) => {console.error(err)});

        const {roomName, players, host, maxPlayer, password, playerList} = request.body;
        const data = {roomName, players, host, maxPlayer, password, playerList};

        const roomID = nanoid(16);
        const hashedPassword = (password === null ? null : await bcrypt.hash(password, 10));        

        databaseInstance.collection(roomCollection).insertOne(
            {...data, roomID, inGame : false,password : hashedPassword}, (err, res) => {
                if (err) {
                    response.status(400).send("Invalid data format");
                    response.end();
                    throw new Error('Failed to insert to database');
                }
            }
        )

        response.status(201).send(
            {
                status : 'success',
                code : 201,
                message : 'successfully created room',
                data : {...data, roomID, password : hashedPassword}
            }
        )

    } catch(err){console.error(err)}
});

router.put('/', cors(), async (request, response) => {
    try{
        const {userInformation, room, password} = request.body;
        const databasePromise = database();
        const databaseInstance = await databasePromise
            .then((res) => {
                return res.db(databaseName);
            })
            .catch((err) => {console.error(err)});  
        
        const roomPlayerList = room.playerList;
        const roomPlayers = room.players;
        
        if (password && room.password){
            const passwordMatched = await bcrypt.compare(password, room.password);
            if (!passwordMatched){
                response.status(404).send({
                    status : 'fail',
                    code : 404,
                    message : 'incorrect password'
                })
                response.end();
                return;
            }
        }
            
        const insertUserToRoom = await databaseInstance.collection(roomCollection).updateOne(
            {roomID : room.roomID},
            {
                $set : {
                    playerList : [...roomPlayerList, userInformation],
                    players : roomPlayers + 1
                }
            }
        )
        
        response.status(400).send({
            status : 'success',
            code : 200,
            message : 'user successfully inserted into room'
        })

    }catch(err){
        response.status(400).send({
            status : 'error'
        })
        console.error(err);
    }
    });

router.delete('/room', cors(), async (request, response) => {
    try{
        const {Id} = request.query;
        const databasePromise = database();
        const databaseInstance = await databasePromise
            .then((res) => {
                return res.db(databaseName);
            })
            .catch((err) => {console.error(err)});  

        const findRoom = await databaseInstance.collection(roomCollection).find({
            roomID : Id
        }).toArray();

        if (!findRoom){
            response.status(404).send({
                status :'fail',
                code : 404,
                message : 'data not found'
            });
            response.end();
            return;
        }


        if (findRoom[0].players <= 1 && findRoom[0].playerList.length <= 1){
            // apus ruangan

            const {roomID} = findRoom[0];
            const deleteRoom = await databaseInstance.collection(roomCollection).deleteOne({roomID});
    
            response.status(204).send({
                status : 'success',
                code : 204,
                message : 'resource updated successfully'
            })
            response.end();                

            return;
        } else if (findRoom[0].players > 1 && findRoom[0].playerList.length > 1) {
            // apus playernya aja
       
            const Player = request.body;
            const {playerList, players} = findRoom[0]; 
            console.log(findRoom[0].host, Player.username);            
            const newRoomPlayerList = playerList.filter((player) => player._id !== Player._id); 
            if (findRoom[0].host === Player.username){
                const findRandomHost = newRoomPlayerList[Math.floor(Math.random() * newRoomPlayerList.length)];                     
                const updateNewHost = await databaseInstance.collection(roomCollection).updateOne(
                    {host : Player.username},
                    {
                        $set : {
                            host : findRandomHost.username
                        }
                    }
                );
                findRoom[0].host = findRandomHost.username;
            }             
            const decreasePlayerAmount = newRoomPlayerList.length;           
            const updateRoomDataOnDatabase = await databaseInstance.collection(roomCollection).updateOne(
                findRoom[0],
                {
                    $set : {
                        players : decreasePlayerAmount,
                        playerList : [...newRoomPlayerList]
                    }
                }
            )
            response.status(204).send({
                status : 'success',
                code : 204,
                message : 'resource updated successfully'
            })
            response.end();                          

            // const findUserInRoom = await databaseInstance.collection(roomCollection).f

            return;
        }
        response.status(200).send({
            status : 'success'
        })
        response.end();        
    } catch(err){console.error(err)}

});


module.exports = router;