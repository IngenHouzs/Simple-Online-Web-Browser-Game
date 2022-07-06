const express = require('express');
const router = express.Router();
const cors = require('cors');
const {nanoid} = require('nanoid');

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

        const {roomName, players, host, maxPlayer, password} = request.body;
        const data = {roomName, players, host, maxPlayer, password};

        const roomID = nanoid(16);
        const hashedPassword = (password === null ? null : await bcrypt.hash(password, 10));        

        databaseInstance.collection(roomCollection).insertOne(
            {...data, roomID, password : hashedPassword}, (err, res) => {
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


module.exports = router;