const express = require("express");
const http = require("http");
import SocketServer from "./socket";
import completion from "./ai";

const app = express();
const server = http.createServer(app);

const socketServer = SocketServer.getInstance();
socketServer.start(server);

server.listen(3000, () => {
  console.log("Chat server is running on 3000");
});
