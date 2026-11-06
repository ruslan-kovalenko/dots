import { connectPlayer, listen, resetMatch, trackStates } from "./socket-harness";
import type { GameState } from "../../rules/src/match";
import type { Socket } from "socket.io-client";

function stepIsDiagonal(outline: { x: number; y: number }[]): boolean {
  return outline.every((point, index) => {
    const next = outline[(index + 1) % outline.length];
    return Math.abs(point.x - next.x) === 1 && Math.abs(point.y - next.y) === 1;
  });
}

async function place(
  socket: Socket,
  feed: ReturnType<typeof trackStates>,
  x: number,
  y: number
): Promise<GameState> {
  const pending = feed.waitFor((state) => state.storage.some((dot) => dot.x === x && dot.y === y));
  socket.emit("send-new-node", { x, y });
  return pending;
}

describe("capture broadcast", () => {
  beforeEach(resetMatch);

  it("broadcasts the diamond, its interior, and the imprisoned score", async () => {
    const game = await listen();
    const first = await connectPlayer(game.url);
    const firstStates = trackStates(first.socket);
    const second = await connectPlayer(game.url);
    const secondStates = trackStates(second.socket);

    await place(first.socket, firstStates, 2, 3);
    await place(second.socket, secondStates, 3, 3);
    await place(first.socket, firstStates, 4, 3);
    await place(second.socket, secondStates, 15, 1);
    await place(first.socket, firstStates, 3, 4);
    await place(second.socket, secondStates, 15, 2);
    const closed = await place(first.socket, firstStates, 3, 2);

    expect(closed.areas).toHaveLength(1);
    expect(closed.areas[0].ownerOrder).toBe(1);
    expect(closed.areas[0].outline).toHaveLength(4);
    expect(stepIsDiagonal(closed.areas[0].outline)).toBe(true);
    expect(closed.areas[0].interior).toEqual(expect.arrayContaining([{ x: 3, y: 3 }]));
    expect(closed.scores[1]).toBe(1);
    expect(closed.storage.find((dot) => dot.x === 3 && dot.y === 3)?.isTrapped).toBe(true);

    first.socket.close();
    second.socket.close();
    await game.close();
  });
});
