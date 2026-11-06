import Match from "../src/match";
import NodeStorage from "../src/services/node-storage.service";
import Player from "../src/players/player";

const blue: Player = { id: "socket-1", order: 1, color: "rgba(19, 97, 226, 1)" };
const red: Player = { id: "socket-2", order: 2, color: "rgba(228, 23, 71, 1)" };

function start(): void {
  Match.reset();
  Match.sync([blue, red]);
}

function play(order: 1 | 2, x: number, y: number): void {
  expect(Match.activeOrder).toBe(order);
  expect(Match.place(order, x, y)).toBe(true);
}

function stepKind(outline: { x: number; y: number }[]): { diagonal: number; straight: number; far: number } {
  let diagonal = 0;
  let straight = 0;
  let far = 0;
  outline.forEach((point, index) => {
    const next = outline[(index + 1) % outline.length];
    const dx = Math.abs(point.x - next.x);
    const dy = Math.abs(point.y - next.y);
    if (dx === 1 && dy === 1) diagonal += 1;
    else if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) straight += 1;
    else far += 1;
  });
  return { diagonal, straight, far };
}

describe("capture", () => {
  beforeEach(start);

  it("does not link dots two or more cells apart", () => {
    play(1, 3, 3);
    play(2, 2, 2);
    play(1, 10, 1);
    play(2, 4, 2);
    play(1, 10, 2);
    play(2, 4, 4);
    play(1, 10, 3);
    play(2, 2, 4);

    expect(Match.scores).toEqual({ 1: 0, 2: 0 });
    expect(Match.areas).toHaveLength(0);
    expect(NodeStorage.storage.find((node) => node.x === 3 && node.y === 3)?.isTrapped).toBe(false);
  });

  it("imprisons an opponent dot with the four diagonal sides", () => {
    play(1, 2, 3);
    play(2, 3, 3);
    play(1, 4, 3);
    play(2, 15, 1);
    play(1, 3, 4);
    play(2, 15, 2);
    play(1, 3, 2);

    expect(Match.scores[1]).toBe(1);
    expect(Match.scores[2]).toBe(0);
    expect(Match.areas).toHaveLength(1);
    expect(Match.areas[0].ownerOrder).toBe(1);
    expect(stepKind(Match.areas[0].outline)).toEqual({ diagonal: 4, straight: 0, far: 0 });
    expect(Match.areas[0].outline).toHaveLength(4);
    expect(Match.areas[0].interior).toEqual(expect.arrayContaining([{ x: 3, y: 3 }]));
    expect(NodeStorage.storage.find((node) => node.x === 3 && node.y === 3)?.isTrapped).toBe(true);
  });

  it("draws the inner diamond when the four corners are filled too", () => {
    const corners = [
      [2, 4],
      [4, 4],
      [4, 2],
      [2, 2],
    ];
    play(1, 2, 3);
    play(2, 3, 3);
    play(1, 4, 3);
    play(2, 15, 1);
    play(1, 3, 4);
    play(2, 15, 2);
    corners.forEach(([x, y], index) => {
      play(1, x, y);
      play(2, 16, index + 1);
    });
    play(1, 3, 2);

    expect(Match.scores[1]).toBe(1);
    expect(Match.areas).toHaveLength(1);
    const outline = Match.areas[0].outline.map((point) => `${point.x},${point.y}`).sort();
    expect(outline).toEqual(["2,3", "3,2", "3,4", "4,3"]);
    expect(stepKind(Match.areas[0].outline).diagonal).toBe(4);
  });

  it("imprisons with one-cell steps, using a straight step when the side is longer than one cell", () => {
    const own = [
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [5, 3],
      [5, 4],
      [4, 4],
      [3, 4],
      [2, 4],
      [2, 3],
    ];
    play(1, own[0][0], own[0][1]);
    play(2, 3, 3);
    own.slice(1, -1).forEach(([x, y], index) => {
      play(1, x, y);
      if (index === 0) play(2, 4, 3);
      else play(2, 15, index);
    });
    play(1, own[own.length - 1][0], own[own.length - 1][1]);

    expect(Match.scores[1]).toBeGreaterThanOrEqual(1);
    expect(Match.areas.length).toBeGreaterThan(0);
    const steps = stepKind(Match.areas[0].outline);
    expect(steps.far).toBe(0);
    expect(steps.straight).toBeGreaterThan(0);
    expect(steps.straight + steps.diagonal).toBe(Match.areas[0].outline.length);
    expect(NodeStorage.storage.find((node) => node.x === 3 && node.y === 3)?.isTrapped).toBe(true);
  });

  it("leaves an empty surround unscored and still in play", () => {
    play(1, 2, 3);
    play(2, 15, 1);
    play(1, 4, 3);
    play(2, 15, 2);
    play(1, 3, 4);
    play(2, 15, 3);
    play(1, 3, 2);

    expect(Match.scores).toEqual({ 1: 0, 2: 0 });
    expect(Match.areas).toHaveLength(0);
    expect(NodeStorage.storage.every((node) => !node.isTrapped)).toBe(true);
    expect(Match.phase).toBe("playing");
    expect(Match.activeOrder).toBe(2);
  });

  it("traps the mover's own interior dot without scoring it, and will not walk through it later", () => {
    const outline = [
      [5, 7],
      [6, 6],
      [7, 5],
      [6, 4],
      [5, 3],
      [4, 4],
      [3, 5],
      [4, 6],
    ];
    play(1, 4, 5);
    play(2, 5, 5);
    outline.slice(0, -1).forEach(([x, y], index) => {
      play(1, x, y);
      play(2, 18, index + 1);
    });
    play(1, 4, 6);

    const own = NodeStorage.storage.find((node) => node.x === 4 && node.y === 5);
    const enemy = NodeStorage.storage.find((node) => node.x === 5 && node.y === 5);
    expect(own?.isTrapped).toBe(true);
    expect(enemy?.isTrapped).toBe(true);
    expect(Match.scores).toEqual({ 1: 1, 2: 0 });

    const trappedOwn = { x: 4, y: 5 };
    expect(
      Match.areas.every((area) => area.outline.every((point) => point.x !== trappedOwn.x || point.y !== trappedOwn.y))
    ).toBe(true);

    play(2, 18, 10);
    play(1, 8, 8);
    expect(
      Match.areas.every((area) => area.outline.every((point) => point.x !== trappedOwn.x || point.y !== trappedOwn.y))
    ).toBe(true);
  });

  it("scores each imprisoned opponent once", () => {
    play(1, 2, 3);
    play(2, 3, 3);
    play(1, 4, 3);
    play(2, 15, 1);
    play(1, 3, 4);
    play(2, 15, 2);
    play(1, 3, 2);
    expect(Match.scores[1]).toBe(1);

    play(2, 15, 3);
    play(1, 8, 8);
    expect(Match.scores[1]).toBe(1);
  });
});
