import { chooseMove } from "../src/ai/choose-move";
import Match from "../src/match";
import Player from "../src/players/player";
import CoordinateService from "../src/services/coordinate.service";
import NodeStorage from "../src/services/node-storage.service";

const human: Player = { id: "human", order: 1, color: "rgba(228, 23, 71, 1)" };
const computer: Player = { id: "computer", order: 2, color: "rgba(19, 97, 226, 1)" };

function start(): void {
  Match.reset();
  Match.sync([human, computer]);
}

function dot(order: 1 | 2, x: number, y: number): void {
  const player = order === 1 ? human : computer;
  const coordinate = CoordinateService.coordinates.find((cell) => cell.x === x && cell.y === y);
  if (!coordinate) throw new Error(`missing cell ${x},${y}`);
  NodeStorage.add(coordinate, player);
}

describe("chooseMove", () => {
  beforeEach(start);

  it("imprisons the most opponent dots available in one placement", () => {
    dot(1, 3, 3);
    dot(2, 2, 3);
    dot(2, 4, 3);
    dot(2, 3, 4);

    expect(chooseMove(2)).toEqual({ x: 3, y: 2 });
  });

  it("occupies the cell that would let the person imprison a computer dot next", () => {
    dot(1, 7, 8);
    dot(2, 8, 8);
    dot(1, 9, 8);
    dot(2, 1, 1);
    dot(1, 8, 9);

    expect(chooseMove(2)).toEqual({ x: 8, y: 7 });
  });

  it("plays beside the latest dot, nearest the center, when nothing can be imprisoned", () => {
    dot(1, 2, 2);
    dot(2, 10, 8);

    expect(chooseMove(2)).toEqual({ x: 11, y: 8 });
  });

  it("plays the free cell nearest the center when the board is empty", () => {
    expect(chooseMove(2)).toEqual({ x: 11, y: 8 });
  });

  it("restores the board after previewing captures", () => {
    dot(1, 3, 3);
    dot(2, 2, 3);
    dot(2, 4, 3);
    dot(2, 3, 4);
    const before = {
      dots: NodeStorage.storage.map((node) => ({ x: node.x, y: node.y, trapped: node.isTrapped, chain: node.partOfChain })),
      scores: { ...Match.scores },
      turn: Match.activeOrder,
      trappedCells: CoordinateService.coordinates.filter((cell) => cell.isTrapped).length,
    };

    chooseMove(2);

    expect(NodeStorage.storage.map((node) => ({ x: node.x, y: node.y, trapped: node.isTrapped, chain: node.partOfChain }))).toEqual(before.dots);
    expect(Match.scores).toEqual(before.scores);
    expect(Match.activeOrder).toBe(before.turn);
    expect(CoordinateService.coordinates.filter((cell) => cell.isTrapped).length).toBe(before.trappedCells);
  });
});
