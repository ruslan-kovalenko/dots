import Match from "../src/match";
import Player from "../src/players/player";

const blue: Player = { id: "socket-1", order: 1, color: "rgba(19, 97, 226, 1)" };
const red: Player = { id: "socket-2", order: 2, color: "rgba(228, 23, 71, 1)" };

function fresh(): void {
  Match.reset();
}

describe("turns", () => {
  beforeEach(fresh);

  it("keeps the first joiner as order 1 and waits until both players exist", () => {
    expect(Match.phase).toBe("waiting");
    expect(Match.activeOrder).toBeNull();
    expect(Match.place(1, 1, 1)).toBe(false);

    Match.sync([blue]);
    expect(Match.phase).toBe("waiting");
    expect(Match.activeOrder).toBeNull();
    expect(Match.place(1, 1, 1)).toBe(false);

    Match.sync([blue, red]);
    expect(Match.phase).toBe("playing");
    expect(Match.activeOrder).toBe(1);
  });

  it("rejects the wrong player, an occupied intersection, and a point off the board", () => {
    Match.sync([blue, red]);
    expect(Match.place(1, 1, 1)).toBe(true);

    const afterFirst = Match.snapshot();
    expect(Match.place(1, 2, 1)).toBe(false);
    expect(Match.place(2, 1, 1)).toBe(false);
    expect(Match.place(2, 0, 0)).toBe(false);
    expect(Match.place(2, 40, 40)).toBe(false);

    const afterRejections = Match.snapshot();
    expect(afterRejections.storage).toEqual(afterFirst.storage);
    expect(afterRejections.activeOrder).toBe(afterFirst.activeOrder);
    expect(afterRejections.scores).toEqual(afterFirst.scores);
  });

  it("alternates 20 legal placements and adds one dot each time", () => {
    Match.sync([blue, red]);

    for (let index = 0; index < 20; index++) {
      const order = index % 2 === 0 ? 1 : 2;
      const before = Match.snapshot();
      expect(Match.activeOrder).toBe(order);
      expect(Match.place(order, index + 1, 1)).toBe(true);
      const after = Match.snapshot();
      expect(after.storage).toHaveLength(before.storage.length + 1);
      expect(after.activeOrder).toBe(order === 1 ? 2 : 1);
    }
  });
});
