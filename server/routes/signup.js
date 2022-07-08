const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const {database, databaseName, collectionName, usersList} = require('../database');
const { ReturnDocument } = require('mongodb');
const router = express.Router();

router.post('/', async (request, response) => {
    try {
        const databasePromise = database();
        const databaseInstance = await databasePromise
            .then((res) => {
                return res.db(databaseName);
            })
            .catch((err) => {console.error(err)});

        const {username, password} = request.body;
        const usernameIsUsed = await databaseInstance.collection(collectionName).find({username}).toArray();
        if (usernameIsUsed.length > 0){
            response.status(400).send({
                status : 'fail',
                code : 400,
                message : 'username is occupied!'
            });
            response.end();            
            return;
        }

        if (password.length < 8) {
            response.status(400).send("Invalid data format");
            response.end();
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        databaseInstance.collection(collectionName).insertOne(
            {
                username, 
                password : hashedPassword,
                point : 0,
                rank : 1,
                currentRoom : null,
                isOnline : true
            }, (err, res) => {
            if (err) {
                response.status(400).send("Invalid data format");
                throw new Error("Failed to insert data");
            }
            console.log("Successfully added data");
        })

  
        databaseInstance.collection(collectionName).find().toArray((err, res) => {
            if (err) {
                response.status(400).send("Failed to retrieve data");
                throw new Error("Failed to retrieve data");
            }            
            usersList.splice(0, usersList.length);
            for (let user of res) usersList.push(user);
            response.status(201).send(
                {
                    status : 'success',
                    code : 201,
                    data : usersList[usersList.length-1]
                }   
            );
            response.end();            

        });

    } catch (error) { console.error("Error : " + error)}
});




module.exports = router;
