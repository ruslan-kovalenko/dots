import Match from "../../rules/src/match";
import { connectPlayer, listen, once, resetMatch } from "./socket-harness";
import type { GameState } from "../../rules/src/match";

describe("send-new-node", () => {
  beforeEach(resetMatch);

  it("gives the first connection order 1 and ignores a dot before the second player", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    expect(first.player.order).toBe(1);
    expect(first.state.phase).toBe("waiting");

    const next = once<GameState>(first.socket, "get-node-storage");
    first.socket.emit("send-new-node", { x: 1, y: 1 });
    const after = await next;
    expect(after).toEqual(first.state);
    expect(after.storage).toHaveLength(0);

    first.socket.close();
    await game.close();
  });

  it("adds one legal dot and switches the turn", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const playing = once<GameState>(first.socket, "get-node-storage");
    const second = await connectPlayer(game.url);
    expect(second.player.order).toBe(2);
    const started = await playing;
    expect(started.phase).toBe("playing");
    expect(started.activeOrder).toBe(1);

    const placed = once<GameState>(first.socket, "get-node-storage");
    first.socket.emit("send-new-node", { x: 1, y: 1 });
    const after = await placed;
    expect(after.storage).toEqual([{ x: 1, y: 1, order: 1, isTrapped: false }]);
    expect(after.activeOrder).toBe(2);
    expect(Match.snapshot().storage).toHaveLength(1);

    first.socket.close();
    second.socket.close();
    await game.close();
  });

  it("keeps the match and the order when a player reconnects", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const joined = once<GameState>(first.socket, "get-node-storage");
    const second = await connectPlayer(game.url);
    await joined;
    const placed = once<GameState>(first.socket, "get-node-storage");
    first.socket.emit("send-new-node", { x: 2, y: 2 });
    await placed;

    const storedId = first.player.id;
    first.socket.close();
    const returned = await connectPlayer(game.url, storedId);
    expect(returned.player.order).toBe(1);
    expect(returned.state.storage).toEqual([{ x: 2, y: 2, order: 1, isTrapped: false }]);
    expect(returned.state.scores).toEqual({ 1: 0, 2: 0 });

    returned.socket.close();
    second.socket.close();
    await game.close();
  });
});
