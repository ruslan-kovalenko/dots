import { buildIntersections } from "../src/board";
import Match from "../src/match";
import Player from "../src/players/player";

const blue: Player = { id: "socket-1", order: 1, color: "rgba(19, 97, 226, 1)" };
const red: Player = { id: "socket-2", order: 2, color: "rgba(228, 23, 71, 1)" };

describe("ending", () => {
  beforeEach(() => {
    Match.reset();
    Match.sync([blue, red]);
  });

  it("ends when every intersection is occupied or imprisoned", () => {
    const board = buildIntersections();
    for (const cell of board) {
      if (Match.phase !== "playing" || !Match.activeOrder) break;
      Match.place(Match.activeOrder, cell.x, cell.y);
    }

    expect(Match.phase).toBe("ended");
    expect(Match.result).not.toBeNull();
    expect([1, 2, "tie"]).toContain(Match.result?.winner);
  }, 30000);

  it("ends on the second distinct confirmation and then ignores further moves", () => {
    expect(Match.place(1, 1, 1)).toBe(true);
    Match.requestEnd(1);
    expect(Match.phase).toBe("playing");
    expect(Match.endRequests).toEqual([1]);

    Match.requestEnd(1);
    expect(Match.phase).toBe("playing");

    Match.requestEnd(2);
    expect(Match.phase).toBe("ended");
    expect(Match.activeOrder).toBeNull();
    expect(Match.result).toEqual({ scores: { 1: 0, 2: 0 }, winner: "tie" });

    const frozen = Match.snapshot().result;
    expect(Match.place(1, 2, 1)).toBe(false);
    expect(Match.place(2, 2, 1)).toBe(false);
    Match.requestEnd(1);
    Match.requestEnd(2);
    expect(Match.snapshot().result).toEqual(frozen);
  });

  it("names the player who imprisoned more opponent dots", () => {
    Match.place(1, 2, 3);
    Match.place(2, 3, 3);
    Match.place(1, 4, 3);
    Match.place(2, 15, 1);
    Match.place(1, 3, 4);
    Match.place(2, 15, 2);
    Match.place(1, 3, 2);

    Match.requestEnd(1);
    Match.requestEnd(2);

    expect(Match.result).toEqual({ scores: { 1: 1, 2: 0 }, winner: 1 });
  });
});
