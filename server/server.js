const PORT = 8080;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

const {database, databaseName, collectionName, roomCollection, gameDatabase,mapDatabase,usersList} = require('./database');
const appAPI = require('./routes/app');
const loginAPI = require('./routes/login');
const signupAPI = require('./routes/signup');
const onlineUsers = require('./onlineUser');
const {Server} = require('socket.io');



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : '*'
    }
});



let databasePromise;
let databaseInstance;
let findDatabaseName;

const databaseInit = async () => {
    databasePromise = database();
    databaseInstance = await databasePromise;
    findDatabaseName = await databaseInstance.db(databaseName);
        
}

databaseInit();

io.on('connection', socket => {
    console.log("Someone connected.");

    socket.on('user-send-message', (message, sender) => {
        socket.broadcast.emit('server-broadcast-user-message', message, sender);
    })

    socket.on('user-connected', (user) => {
        try{
            const id = socket.id;
            console.log(`User ${user.username} connected to application`);
            const duplicate = onlineUsers.find(users => users.user.username === user.username);         
            if (duplicate) {
                io.emit('update-online-users', onlineUsers);                
                return;                
            }
            onlineUsers.push({user, id});
            io.emit('update-online-users', onlineUsers);

        } catch (err){}
    });     

    socket.on('announce-new-room', async () => {
        try{
      
            const getUpdatedRooms = await findDatabaseName.collection(roomCollection).find().toArray();
            io.emit('update-rooms-list-client', getUpdatedRooms);
        }catch(err){}
    });

    socket.on('user-send-message-to-room', (message, room, sender) => {
        socket.to(room).emit('receive-room-message', message, sender);
    });


    socket.on('player-shoot', (target, position, shooter, room, boundlessBullet) => {
        io.to(room.roomName).emit('create-projectile',target, position, shooter, boundlessBullet);
    });

    socket.on('host-changed-map', (roomInfo, direction) => {
        socket.to(roomInfo.roomName).emit('announce-map-changes', roomInfo, direction);
    });
    
    socket.on('skill-0', (shooterObject, room, id, target) => {
        io.to(room.roomName).emit('launch-skill-0', shooterObject, id, target);
    });

    // socket.on('initialize-skill', (shooterObject, room, id) => {
    //     io.to(room.roomName).emit('skill-ready', shooterObject, id);
    // });

    socket.on('host-start-game', async (roomInfo, callback) => {
        try{
            const databasePromise = database();
            const databaseInstance = await databasePromise;
            const findDatabaseName = await databaseInstance.db(databaseName); 

            const roomInstance = await findDatabaseName.collection(roomCollection).find({roomName : roomInfo.roomName}).toArray();
             
            const playerListForGameSetup = roomInstance[0].playerList.map(player => 
                ({...player,
                    positionX : 0,
                    positionY : 0,
                    health : 100,
                })
            );  



            const changeInGameRoomStatus = await findDatabaseName.collection(roomCollection).updateOne(
                {roomName : roomInfo.roomName},
                {
                    $set : {
                        inGame : true,
                        gameData : [...playerListForGameSetup]
                    }
                }
            ) 
            
            const usersRoom = await findDatabaseName.collection(roomCollection).find({
                roomName : roomInfo.roomName
            }).toArray();

    
            io.to(roomInfo.roomName).emit('transfer-game-player-stats', usersRoom[0]);
            const getUpdatedRooms = await findDatabaseName.collection(roomCollection).find().toArray();
            io.emit('update-rooms-list-client', getUpdatedRooms);
        } catch (err) {}
        io.to(roomInfo.roomName).emit('player-enter-game', callback);
    });

    socket.on('initialize-player-ingame-data', async (room) => {
        try{
          
            const findRoom = await findDatabaseName.collection(roomCollection).find({
                roomName : room.roomName
            }).toArray();
            io.to(room.roomName).emit('transfer-game-player-stats', findRoom[0]);
        } catch(err){}
    });

    socket.on('change-player-stats', async (user, room, data) => {
        try{
  

            const updateData = await findDatabaseName.collection(roomCollection).updateOne(
                {roomName : room.roomName},
                {   
                    $set : {
                        "gameData.$[users].positionX" : data.positionX,
                        "gameData.$[users].positionY" : data.positionY,
                        "gameData.$[users].playerCoordinate" : data.playerCoordinate,                        
                        "gameData.$[users].health" : data.health                        
                    }
                },
                {
                    arrayFilters : [
                        {"users.username" : user.username}
                    ]
                }
            )

        } catch (err){}
    });

    socket.on('request-map-data', async (room) => {
        const getMapList = await findDatabaseName.collection(mapDatabase).find().toArray();
        io.to(room.roomName).emit('receive-map-data', getMapList);
    });

    socket.on('bullet-hit', async (room, shooter, victimData, damage) => {
        try{
            if (victimData.health <= 0) return;
            const currentData = await findDatabaseName.collection(roomCollection).find({
                roomName : room.roomName
            }).toArray();
            const gameData = currentData[0].gameData;
            const findVictimData = gameData.find((user) => user.username === victimData.username);
            let lastHit = false;
            
            if (findVictimData){
                const findVictim = await findDatabaseName.collection(roomCollection).updateOne(
                    {roomName : room.roomName}, 
                    {
                        $set : {
                            "gameData.$[users].health" : findVictimData.health - damage
                        }
                    }, 
                    {
                        arrayFilters : [
                            {'users.username' : victimData.username}
                        ]
                    }
                ); 
                 
                if (findVictimData.health - 10 <= 0){
                    lastHit = true;
                    const findDeathPlayer = gameData.filter(player => player.username !== findVictimData.username);
                    if (findDeathPlayer){
                        const newData = await findDatabaseName.collection(roomCollection).updateOne(
                            {roomName : room.roomName}, 
                            {
                                $set : {
                                    gameData : [...findDeathPlayer]
                             }
                            }
                        );
                        const playerList = await findDatabaseName.collection(roomCollection).find({
                            roomName : room.roomName
                        }).toArray();
                        const newPlayers = playerList[0].gameData;   
                        io.to(room.roomName).emit('update-player-stats', newData);                        
                        io.to(room.roomName).emit('update-player-list', newPlayers);
                    } 
                    
                    // const findDeathPlayer = await findDatabaseName.collection(roomCollection).


                    io.to(room.roomName).emit('player-death', victimData, shooter, lastHit, damage, findDeathPlayer.length+1);

                    if (findDeathPlayer.length <= 1){
                        io.to(room.roomName).emit('end-game', shooter, false); 
       
                    }

                    return;
                }

                const newData = await findDatabaseName.collection(roomCollection).find({
                    roomName : room.roomName
                }).toArray();
                const newGameData = newData[0].gameData;            
                io.to(room.roomName).emit('update-player-stats', newGameData, victimData, shooter, lastHit, damage);                      
                io.to(room.roomName).emit('update-player-list', newGameData);
                // io.to(room.roomName).emit('announce-player-bullet-hit', newGameData);
            }     
        }catch(err){}
    });

    socket.on('request-profile-data', async userInfo => {
        try{
            const refreshPlayerData = await findDatabaseName.collection(collectionName).find().toArray();
            io.emit('refresh-player-profile', refreshPlayerData);
        }catch(err){}        
    });

    socket.on('return-to-room-lobby', async (roomInfo) => { 
        const resetRoomGameStatus = await findDatabaseName.collection(roomCollection).updateOne(
            {roomName : roomInfo.roomName}, 
            {
                $set : {
                    gameData : null, 
                    inGame : false
                }
            }
        )
        const getUpdatedRooms = await findDatabaseName.collection(roomCollection).find().toArray();
        io.emit('update-rooms-list-client', getUpdatedRooms);                
        io.to(roomInfo.roomName).emit('approve-return-lobby');
    });

    socket.on('request-leaderboard-data', async () => {
        const getPlayers = await findDatabaseName.collection(collectionName).find().sort({point:-1}).toArray();

        io.emit('receive-leaderboard-data', getPlayers);
    });

    socket.on('accumulate-player-point', async (user, value) => {

        const findUser = await findDatabaseName.collection(collectionName).updateOne(
            {username : user.username}, 
            {
                $inc : {
                    point : value
                }
            }
        )

    });

    socket.on('live-server', async (room,bulletInfo) => {
        try{
              
            const getUsers = await findDatabaseName.collection(roomCollection).find(
                {roomName : room.roomName}
            ).toArray();

            try{
                // error klo gk lagi nembak
            } catch(err){}

      
            io.to(room.roomName).emit('live-game-update', getUsers[0].gameData);
        }catch(err){};
    });

    socket.on('joined-room', async (user, room) => {
        try {
            socket.join(room.roomName);               
            const findUser = await findDatabaseName.collection(collectionName).updateOne(
                {username : user.username}, 
                {
                    $set : {
                        currentRoom : room.roomName
                    }
                }
            )

            const getRoom = await findDatabaseName.collection(roomCollection).find({
                roomName : room.roomName
            }).toArray();

            
            io.to(room.roomName).emit('update-player-room', getRoom[0].playerList, getRoom[0]);                          
        } catch (err) {}
    });


    socket.on('leaves-room', async (user, room) => {
        try {
            socket.leave(room.roomName);                   
            const findUser = await findDatabaseName.collection(collectionName).updateOne(
                {username : user.username}, 
                {
                    $set : {
                        currentRoom : null
                    }
                }
            ) 

            const getRoom = await findDatabaseName.collection(roomCollection).find({
                roomName : room.roomName
            }).toArray();
            
            try{
                const {gameData} = getRoom[0];
                const removeUser = gameData.filter((player) => player.username !== user.username);
                if (removeUser.length <= 1){
                    io.to(room.roomName).emit('end-game', removeUser[0].username, true);
                }                
                const updateGameData = await findDatabaseName.collection(roomCollection).updateOne(
                {roomName : room.roomName},
                {
                    $set : {
                        gameData : [...removeUser]
                    }
                });
    
                const updatedRooms = await findDatabaseName.collection(roomCollection).find({
                    roomName : room.roomName
                }).toArray();
    
               io.to(room.roomName).emit('transfer-game-player-stats', updatedRooms[0]);                     
            } catch(err) {}
     
           socket.to(room.roomName).emit('update-player-room', getRoom[0].playerList, getRoom[0]);            
            
            
        } catch (err) {}
    });

    


    socket.on('disconnect', async () => {
        try{           
            const index = onlineUsers.findIndex((user) => user.id === socket.id);
           
            const databasePromise = database();
            const databaseInstance = await databasePromise;
            const findDatabaseName = await databaseInstance.db(databaseName);
            const user = await findDatabaseName.collection(collectionName).find({
                username : onlineUsers[index].user.username,
                password : onlineUsers[index].user.password
            }).toArray();


            const findRoom = await findDatabaseName.collection(roomCollection).find(
                {roomName : user[0].currentRoom}
            ).toArray();
            
            
            const updateOnlineStatus = await findDatabaseName.collection(collectionName).updateOne(
                user[0],
                {
                    $set : {
                        isOnline : false,
                        currentRoom : null
                    }
                }
            );

            const playerIsHost = await findDatabaseName.collection(roomCollection).find({
                host : user[0].username
            }).toArray();

    
            try {
                if (findRoom.length > 0){
                    const roomPlayerList = findRoom[0].playerList;
                    const newRoomPlayerList = roomPlayerList.filter((player) => player.username !== user[0].username);
                    
                    if (newRoomPlayerList.length <= 0){
                        const deleteRoom = await findDatabaseName.collection(roomCollection).deleteOne({
                            roomID : findRoom[0].roomID
                        }); 
                    }
                    else {
                        const updatePlayerStatusOnRoom = await findDatabaseName.collection(roomCollection).updateOne(
                            {roomName : user[0].currentRoom},
                            {
                                $set : {
                                    playerList : [...newRoomPlayerList],
                                    players : newRoomPlayerList.length
                                }
                            }
                        );

                        if (playerIsHost.length > 0){
                            const roomPlayersList = playerIsHost[0].playerList;
                            const filterFromThisUser = roomPlayersList.filter((player) => player.username !== user[0].username); 
                            const newHost = filterFromThisUser[Math.floor(Math.random() * filterFromThisUser.length)];      

                            const updateHost = await findDatabaseName.collection(roomCollection).updateOne(
                                {roomName : user[0].currentRoom},
                                {
                                    $set : {
                                        host : newHost.username
                                    }
                                }
                            )
                        }                    
                    } 
    
                    const newRoomList = await findDatabaseName.collection(roomCollection).find().toArray();

                    for (let room of newRoomList){
                        if (room.roomName === findRoom[0].roomName){
                            try{
      
                                const getRoom = await findDatabaseName.collection(roomCollection).find({
                                    roomName : room.roomName
                                }).toArray();
                    
                                const {gameData} = getRoom[0];

        
                                const removeUser = gameData.filter((player) => player.username !== onlineUsers[index].user.username);
                                const updateGameData = await findDatabaseName.collection(roomCollection).updateOne(
                                {roomName : room.roomName},
                                {
                                    $set : {
                                        gameData : [...removeUser]
                                    }
                                });
                    
                                const updatedRooms = await findDatabaseName.collection(roomCollection).find({
                                    roomName : room.roomName
                                }).toArray();
                    
                               io.to(room.roomName).emit('transfer-game-player-stats', updatedRooms[0]);  
                            }catch(err) {}                             

                           socket.to(room.roomName).emit('update-player-room', room.playerList, room);
                           break;
                        }
                    }
                    io.emit('update-rooms-list-client', newRoomList);
                }                

            } catch (err) {}

                
            onlineUsers.splice(index, 1);
            io.emit('update-online-users', onlineUsers);      
        } catch(err){};
   
    });

});

// const io = socketIO(PORT)


app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());
app.use(cors());

// Constants

// Routes
app.use('/login', loginAPI);
app.use('/signup', signupAPI);
app.use('/app', appAPI);

module.exports = {PORT, io};

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));









