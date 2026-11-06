import { io, Socket } from "socket.io-client";
import type { GameState, Player } from "rules";
import PlayerService from "./player.service";

class SocketioService {
  private static instance: SocketioService;
  private socket: Socket | null = null;

  private constructor() {
    this.socket = null;
  }

  static getInstance(): SocketioService {
    if (!SocketioService.instance) {
      SocketioService.instance = new SocketioService();
    }
    return SocketioService.instance;
  }

  setupSocketConnection(onState: (state: GameState) => void): void {
    if (this.socket) return;

    const storageUserId = sessionStorage.getItem("userId");
    const userPayload = storageUserId
      ? {
          query: {
            userId: storageUserId,
          },
        }
      : {};

    this.socket = io(import.meta.env.VITE_SOCKET_ENDPOINT, userPayload);
    this.socket.on("register-player", (player: Player) => {
      PlayerService.setPlayer(player);
    });
    this.socket.on("users", (users: Player[]) => {
      PlayerService.setRival(users);
    });
    this.socket.on("get-node-storage", (state: GameState) => {
      onState(state);
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  sendNewNode(x: number, y: number): void {
    this.socket?.emit("send-new-node", { x, y });
  }

  sendEndGame(): void {
    this.socket?.emit("send-end-game");
  }
}

export default SocketioService;
