import { connectPlayer, listen, resetMatch, trackStates } from "./socket-harness";
import type { GameState } from "../../rules/src/match";

describe("send-end-game", () => {
  beforeEach(resetMatch);

  it("ends only after both orders confirm and reports the imprisoned totals", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const firstStates = trackStates(first.socket);
    const second = await connectPlayer(game.url);
    const secondStates = trackStates(second.socket);

    const moves: [typeof first.socket, ReturnType<typeof trackStates>, number, number][] = [
      [first.socket, firstStates, 2, 3],
      [second.socket, secondStates, 3, 3],
      [first.socket, firstStates, 4, 3],
      [second.socket, secondStates, 15, 1],
      [first.socket, firstStates, 3, 4],
      [second.socket, secondStates, 15, 2],
      [first.socket, firstStates, 3, 2],
    ];
    for (const [socket, feed, x, y] of moves) {
      const pending = feed.waitFor((state) => state.storage.some((dot) => dot.x === x && dot.y === y));
      socket.emit("send-new-node", { x, y });
      await pending;
    }

    const stillPlaying = firstStates.waitFor((state) => state.endRequests.includes(1));
    first.socket.emit("send-end-game");
    const one = await stillPlaying;
    expect(one.phase).toBe("playing");
    expect(one.scores).toEqual({ 1: 1, 2: 0 });

    const ended = firstStates.waitFor((state) => state.phase === "ended");
    second.socket.emit("send-end-game");
    const two = await ended;
    expect(two.phase).toBe("ended");
    expect(two.result).toEqual({ scores: { 1: 1, 2: 0 }, winner: 1 });

    first.socket.close();
    second.socket.close();
    await game.close();
  });
});