import http from "http";
import { Server } from "socket.io";
import { io as connect, Socket } from "socket.io-client";
import Match, { GameState } from "../../rules/src/match";
import SocketServer from "../server/socket";
import UserService from "../services/user.service";

export interface RunningGame {
  url: string;
  close: () => Promise<void>;
}

export function resetMatch(): void {
  Match.reset();
  UserService.users = [];
}

export function listen(): Promise<RunningGame> {
  const httpServer = http.createServer();
  const io = new Server(httpServer, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    SocketServer.getInstance().onConnection(socket, io);
  });

  return new Promise((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => {
      const address = httpServer.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((done) => {
            io.close(() => httpServer.close(() => done()));
          }),
      });
    });
  });
}

export function openSocket(url: string, userId?: string): Socket {
  return connect(url, {
    autoConnect: false,
    transports: ["websocket"],
    query: userId ? { userId } : {},
  });
}

export function once<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve) => socket.once(event, resolve));
}

export function trackStates(socket: Socket): {
  waitFor(predicate: (state: GameState) => boolean): Promise<GameState>;
} {
  const queue: GameState[] = [];
  let waiter: { predicate: (state: GameState) => boolean; resolve: (state: GameState) => void } | null = null;

  const flush = () => {
    if (!waiter) return;
    const index = queue.findIndex(waiter.predicate);
    if (index < 0) return;
    const [state] = queue.splice(index, 1);
    const resolve = waiter.resolve;
    waiter = null;
    resolve(state);
  };

  socket.on("get-node-storage", (state: GameState) => {
    queue.push(state);
    flush();
  });

  return {
    waitFor(predicate) {
      const pending = new Promise<GameState>((resolve) => {
        waiter = { predicate, resolve };
      });
      flush();
      return pending;
    },
  };
}

export async function connectPlayer(url: string, userId?: string): Promise<{ socket: Socket; state: GameState; player: { id: string; order: 1 | 2 } }> {
  const socket = openSocket(url, userId);
  const registered = once<{ id: string; order: 1 | 2 }>(socket, "register-player");
  const state = once<GameState>(socket, "get-node-storage");
  socket.connect();
  return { socket, player: await registered, state: await state };
}
