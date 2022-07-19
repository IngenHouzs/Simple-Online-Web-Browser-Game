const {MongoClient} = require('mongodb');

const URI = 'mongodb://localhost:27017';
const databaseName = 'mern-project';
const collectionName = 'users';
const roomCollection = 'rooms';
const gameDatabase = 'game';
const mapDatabase = 'map';

let usersList = [];

const database = async () => {
    try{
        return await MongoClient.connect(URI, {useNewUrlParser : true});
    } catch(err) {console.error(err)}
}

database();

module.exports = {database, databaseName, collectionName, roomCollection, mapDatabase,gameDatabase,usersList}



