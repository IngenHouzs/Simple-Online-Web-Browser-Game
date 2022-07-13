const PORT = 8080;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

const {database, databaseName, collectionName, roomCollection,usersList} = require('./database');
const appAPI = require('./routes/app');
const loginAPI = require('./routes/login');
const signupAPI = require('./routes/signup');
const onlineUsers = require('./onlineUser');
const {Server} = require('socket.io');
const { on } = require('events');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : '*'
    }
});

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
        } catch (err){console.log("connected : error occured")}
    });     

    socket.on('announce-new-room', async () => {
        try{
            const databasePromise = database();
            const databaseInstance = await databasePromise;
            const findDatabaseName = await databaseInstance.db(databaseName);        
            const getUpdatedRooms = await findDatabaseName.collection(roomCollection).find().toArray();
            io.emit('update-rooms-list-client', getUpdatedRooms);
        }catch(err){console.error(err)}
    });

    socket.on('user-send-message-to-room', (message, room, sender) => {
        socket.to(room).emit('receive-room-message', message, sender);
        console.log(sender, message);
    });

    socket.on('host-start-game', async (roomInfo, callback) => {
        try{
            const databasePromise = database();
            const databaseInstance = await databasePromise;
            const findDatabaseName = await databaseInstance.db(databaseName); 
            const changeInGameRoomStatus = await findDatabaseName.collection(roomCollection).updateOne(
                {roomName : roomInfo.roomName},
                {
                    $set : {
                        inGame : true
                    }
                }
            ) 
            const getUpdatedRooms = await findDatabaseName.collection(roomCollection).find().toArray();
            io.emit('update-rooms-list-client', getUpdatedRooms);
        } catch (err) {console.error(err)}
        io.to(roomInfo.roomName).emit('player-enter-game', callback);
    });

    socket.on('joined-room', async (user, room) => {
        try {
            socket.join(room.roomName);            
            const databasePromise = database();
            const databaseInstance = await databasePromise;
            const findDatabaseName = await databaseInstance.db(databaseName);     
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
            // getRoom.forEach((room) => console.log(JSON.stringify(room, null, 4)))
            
            io.to(room.roomName).emit('update-player-room', getRoom[0].playerList, getRoom[0]);                
            
        } catch (err) {console.error(err, 'WKWKWK')}
    });


    socket.on('leaves-room', async (user, room) => {
        try {
            socket.leave(room.roomName);            
            const databasePromise = database();
            const databaseInstance = await databasePromise;
            const findDatabaseName = await databaseInstance.db(databaseName);              
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
            console.log(getRoom);
            
            socket.to(room.roomName).emit('update-player-room', getRoom[0].playerList, getRoom[0]);            
            
            
        } catch (err) {console.error(err)}
    });

    


    socket.on('disconnect', async () => {
        try{           
            const index = onlineUsers.findIndex((user) => user.id === socket.id);
            console.log(`User ${onlineUsers[index].user.username} logged out`);            
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
                        console.log(playerIsHost, "MAMAMAMAMA");
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
                    console.log(newRoomList);
                    for (let room of newRoomList){
                        if (room.roomName === findRoom[0].roomName){
                            console.log(room.playerList);
                            socket.to(room.roomName).emit('update-player-room', room.playerList, room);
                            break;
                        }
                    }
                    console.log(newRoomList);
                    io.emit('update-rooms-list-client', newRoomList);
                }                

            } catch (err) {console.error(err)}

                
            onlineUsers.splice(index, 1);
            io.emit('update-online-users', onlineUsers);      
        } catch(err){console.log(err)};
   
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









