import Match from "../../rules/src/match";
import UserService from "../services/user.service";
import { connectPlayer, listen, once, openSocket, resetMatch, trackStates } from "./socket-harness";

describe("computer game", () => {
  beforeEach(resetMatch);

  it("waits for a person without starting play", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const states = trackStates(first.socket);
    const pending = states.waitFor((state) => state.opponent === "person");
    first.socket.emit("choose-opponent", { opponent: "person" });
    const state = await pending;

    expect(state.phase).toBe("waiting");
    expect(state.opponent).toBe("person");
    expect(UserService.users).toHaveLength(1);

    first.socket.close();
    await game.close();
  });

  it("seats the computer and lets order 1 move first", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const states = trackStates(first.socket);
    const pending = states.waitFor((state) => state.opponent === "computer");
    first.socket.emit("choose-opponent", { opponent: "computer" });
    const state = await pending;

    expect(state.phase).toBe("playing");
    expect(state.activeOrder).toBe(1);
    expect(UserService.users.find((user) => user.order === 2)?.id).toBe("computer");

    first.socket.close();
    await game.close();
  });

  it("starts a two-person game when a second person joins before a choice", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const second = await connectPlayer(game.url);

    expect(second.player.order).toBe(2);
    expect(second.state.phase).toBe("playing");
    expect(second.state.opponent).toBe("person");
    expect(second.state.activeOrder).toBe(1);
    expect(first.player.order).toBe(1);

    first.socket.close();
    second.socket.close();
    await game.close();
  });

  it("ignores a choice after the game has started or ended", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const second = await connectPlayer(game.url);
    const states = trackStates(first.socket);

    const stillPeople = states.waitFor((state) => state.phase === "playing" && state.opponent === "person");
    first.socket.emit("choose-opponent", { opponent: "computer" });
    const playing = await stillPeople;
    expect(playing.opponent).toBe("person");
    expect(UserService.users.some((user) => user.id === "computer")).toBe(false);

    Match.requestEnd(1);
    Match.requestEnd(2);
    const ended = states.waitFor((state) => state.phase === "ended");
    first.socket.emit("choose-opponent", { opponent: "computer" });
    const after = await ended;
    expect(after.phase).toBe("ended");
    expect(after.opponent).toBe("person");

    first.socket.close();
    second.socket.close();
    await game.close();
  });

  it("refuses a person who arrives after the computer is seated", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const started = trackStates(first.socket).waitFor((state) => state.opponent === "computer");
    first.socket.emit("choose-opponent", { opponent: "computer" });
    await started;

    const late = openSocket(game.url);
    const refused = once<{ reason: string }>(late, "seat-refused");
    let registered = false;
    late.on("register-player", () => {
      registered = true;
    });
    late.connect();

    expect(await refused).toEqual({ reason: "computer" });
    expect(registered).toBe(false);

    late.close();
    first.socket.close();
    await game.close();
  });

  it("answers a legal dot and ignores a dot during the computer's turn", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const states = trackStates(first.socket);
    const started = states.waitFor((state) => state.opponent === "computer");
    first.socket.emit("choose-opponent", { opponent: "computer" });
    await started;

    const answered = states.waitFor((state) => state.storage.length === 2 && state.activeOrder === 1);
    first.socket.emit("send-new-node", { x: 2, y: 3 });
    const reply = await answered;
    expect(reply.storage.filter((dot) => dot.order === 2)).toHaveLength(1);

    Match.place(1, 4, 3);
    const before = Match.snapshot();
    const unchanged = states.waitFor((state) => state.activeOrder === 2 && state.storage.length === before.storage.length);
    first.socket.emit("send-new-node", { x: 5, y: 3 });
    const held = await unchanged;
    expect(held.storage).toHaveLength(before.storage.length);
    expect(held.activeOrder).toBe(2);

    first.socket.close();
    await game.close();
  });

  it("ends a computer game on one request and a two-person game on two", async () => {
    const computerGame = await listen();
    const person = await connectPlayer(computerGame.url);
    const computerStates = trackStates(person.socket);
    const started = computerStates.waitFor((state) => state.opponent === "computer");
    person.socket.emit("choose-opponent", { opponent: "computer" });
    await started;
    const moved = computerStates.waitFor((state) => state.storage.length === 2);
    person.socket.emit("send-new-node", { x: 2, y: 3 });
    await moved;

    const ended = computerStates.waitFor((state) => state.phase === "ended");
    person.socket.emit("send-end-game");
    const result = await ended;
    expect(result.result?.scores).toEqual(result.scores);
    expect([1, 2, "tie"]).toContain(result.result?.winner);
    expect(result.endRequests).not.toContain(2);

    person.socket.close();
    await computerGame.close();

    resetMatch();
    const peopleGame = await listen();
    const first = await connectPlayer(peopleGame.url);
    const firstStates = trackStates(first.socket);
    const second = await connectPlayer(peopleGame.url);
    const secondStates = trackStates(second.socket);

    const waiting = firstStates.waitFor((state) => state.endRequests.includes(1) && state.phase === "playing");
    first.socket.emit("send-end-game");
    expect((await waiting).phase).toBe("playing");

    const both = secondStates.waitFor((state) => state.phase === "ended");
    second.socket.emit("send-end-game");
    expect((await both).phase).toBe("ended");

    first.socket.close();
    second.socket.close();
    await peopleGame.close();
  });
});
