import socketIOClient from "socket.io-client";

const ENDPOINT = 'http://localhost:8080';
const socket = socketIOClient(ENDPOINT);

export {socketIOClient, socket, ENDPOINT}
