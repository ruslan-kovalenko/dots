import { Server, Socket } from "socket.io";
import { chooseMove } from "../../rules/src/ai/choose-move";
import Match, { COMPUTER_ID } from "../../rules/src/match";
import UserService from "../services/user.service";

class SocketServer {
  private static instance: SocketServer | null = null;

  private constructor() {}

  static getInstance(): SocketServer {
    if (!SocketServer.instance) SocketServer.instance = new SocketServer();

    return SocketServer.instance;
  }

  async onConnection(socket: Socket, io: Server): Promise<void> {
    console.log(`user ${socket.id} is connected.`);

    socket.on("send-new-node", (point: { x: number; y: number }) => {
      const order = UserService.orderOf(socket.id);
      if (order && point && Match.place(order, point.x, point.y) && Match.activeOrder === 2) {
        const computer = UserService.users.find((user) => user.id === COMPUTER_ID && user.order === 2);
        if (computer) {
          const cell = chooseMove(2);
          if (cell) Match.place(2, cell.x, cell.y);
        }
      }
      io.emit("get-node-storage", Match.snapshot());
    });

    socket.on("choose-opponent", (payload: { opponent?: string }) => {
      const order = UserService.orderOf(socket.id);
      if (order === 1 && Match.phase === "waiting" && payload?.opponent === "person") {
        Match.chooseOpponent("person");
      } else if (order === 1 && Match.phase === "waiting" && payload?.opponent === "computer") {
        const before = UserService.users.length;
        const users = UserService.seatComputer();
        if (users.length > before) {
          Match.chooseOpponent("computer");
          Match.sync(users);
        }
      }
      io.emit("users", UserService.users);
      io.emit("get-node-storage", Match.snapshot());
    });

    socket.on("send-end-game", () => {
      const order = UserService.orderOf(socket.id);
      if (order) Match.requestEnd(order);
      io.emit("get-node-storage", Match.snapshot());
    });

    socket.on("disconnect", () => {
      console.log(`user ${socket.id} left.`);
    });

    const queryUserId = socket.handshake.query.userId;
    const localStorageUserId =
      typeof queryUserId === "string" ? queryUserId : Array.isArray(queryUserId) ? queryUserId[0] : "";

    const [newUser, users] = UserService.addUser(socket.id, localStorageUserId);
    if (!newUser) {
      if (users.some((user) => user.id === COMPUTER_ID)) socket.emit("seat-refused", { reason: "computer" });
      return;
    }

    Match.sync(users);
    socket.emit("register-player", newUser);
    io.emit("users", users);
    io.emit("get-node-storage", Match.snapshot());
  }

  start(server: unknown): void {
    Match.reset();
    const io = new Server(server as never, {
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
