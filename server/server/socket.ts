import { Socket, Server } from "socket.io";
import Chain from "../types/chain";
import Node from "../types/node";
import Player from "../types/player";
import StorageService from "../services/storage.service";
import UserService from "../services/user.service";
import ChainService from "../services/chain.service";
import ScoreService from "../services/score.service";
import ScoreUpdate from "../types/score-update";

class SocketServer {
  private static instance: SocketServer | null = null;

  private constructor() {}

  static getInstance(): SocketServer {
    if (!SocketServer.instance) SocketServer.instance = new SocketServer();

    return SocketServer.instance;
  }

  async onConnection(socket: Socket, io: Server): Promise<void> {
    console.log(`user ${socket.id} is connected.`);

    socket.on("send-player-storage", (data: ScoreUpdate) => {
      this.onSendPlayerStorage(data, io);
    });

    socket.on("send-new-node", (node) => {
      this.onSendNewNode(node, io);
    });

    socket.on("disconnect", this.onDisconnect);

    const queryUserId = socket.handshake.query.userId;
    const localStorageUserId =
      typeof queryUserId === "string"
        ? queryUserId
        : Array.isArray(queryUserId)
          ? queryUserId[0]
          : "";

    const [newUser, users] = UserService.addUser(socket.id, localStorageUserId);
    socket.emit("register-player", newUser);
    io.emit("users", users);
  }

  onSendPlayerStorage(data: ScoreUpdate, io: Server): void {
    const { storage, score, chains } = data;
    const playerOrder = storage[0].player.order;

    if (playerOrder === 1) {
      StorageService.storagePlayerOne = storage;
      ScoreService.playerOneScore = score;
      ChainService.chainsPlayerOne = ChainService.combineChainsPO(chains);
    } else {
      StorageService.storagePlayerTwo = storage;
      ScoreService.playerTwoScore = score;
      ChainService.chainsPlayerTwo = ChainService.combineChainsPT(chains);
    }

    StorageService.combineStorages();

    io.emit("get-node-storage", {
      storage: StorageService.nodeStorage,
      playerOneScore: ScoreService.playerOneScore,
      playerTwoScore: ScoreService.playerTwoScore,
      chains: ChainService.getAllChains(),
    });
  }

  onSendNewNode(node: Node, io: Server): void {
    io.emit("get-new-node", node);
  }

  onDisconnect(): void {
    console.log(`user left.`);
    StorageService.storagePlayerOne = [];
    StorageService.storagePlayerTwo = [];
    ChainService.chainsPlayerOne = [];
    ChainService.chainsPlayerTwo = [];
    ScoreService.playerOneScore = 0;
    ScoreService.playerTwoScore = 0;
    StorageService.nodeStorage = [];
  }

  start(server: any): void {
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      this.onConnection(socket, io);
    });
  }
}

export default SocketServer;
