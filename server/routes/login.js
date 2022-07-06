const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const cors = require('cors');
const onlineUsers = require('../onlineUser');
const {database, databaseName, collectionName, usersList} = require('../database');

router.put('/', cors(), async (request, response) => {
    try {
        response.set('Content-Type', 'application/json');    
        const databasePromise = database();
        const databaseInstance = await databasePromise;
        const findDatabaseName = await databaseInstance.db(databaseName);

        const users = await findDatabaseName.collection(collectionName).find().toArray();

        usersList.splice(0, usersList.length);
        for (let user of users) usersList.push(user);

        const {username, password} = request.body;

        for (let user of usersList){
            if (user.username === username){          
                const matchPassword = await bcrypt.compare(password, user.password);
                if (matchPassword){
                    const playerIsOnline = onlineUsers.find((player) => user.username === player.user.username);                    
                    console.log(playerIsOnline, "wkkwkwkw");                          
                    if (playerIsOnline){
                        response.status(404).send({
                            status : 'fail',
                            code : 404,
                            message : 'user is online!'
                        });
                        response.end();                        
                        return;
                    }

    
                    const updateUser = await findDatabaseName.collection(collectionName).updateOne(
                        user, 
                        {
                            $set : {
                                isOnline : true
                            }
                        }
                    )

                    response.status(302).send({
                        status : 'success',
                        code : 302,
                        data : {...user, isOnline : true}
                    });
                      
                    response.end();
                    return;
                }  else {
                    response.status(404).send({
                        status : 'fail',
                        code : 404,
                        message : 'data not found'
                    });
                    response.end();
                    
                }
            }
        }

        response.status(404).send({
            status : 'fail',
            code : 404,
            message : 'data not found'
        });
        response.end();        

    } catch (err) {console.error(err)};
});

module.exports = router;