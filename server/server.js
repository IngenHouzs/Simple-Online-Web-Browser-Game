const PORT = 8080;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

const {database, databaseName, collectionName, usersList} = require('./database');
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
            console.log(user);
            const updateOnlineStatus = await findDatabaseName.collection(collectionName).updateOne(
                user[0],
                {
                    $set : {
                        isOnline : false
                    }
                }
            );
            onlineUsers.splice(index, 1);
            io.emit('update-online-users', onlineUsers);        
        } catch(err){console.log("Disconnect : error occured")};
   
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









