import Chain from "../src/types/chain";
import Node from "../src/types/node";
import ChainService from "../src/services/chain.service";
import Player from "../src/players/player";

function player(id: string, order: 1 | 2, color: string): Player {
  return { id, order, color };
}

function node(x: number, y: number, owner: Player): Node {
  return new Node(x, y, owner, {
    offsetX: 0,
    offsetY: 0,
    x,
    y,
    isTrapped: false,
    trappedBy: null,
  });
}

describe("ChainService", () => {
  const blue = player("1", 1, "blue");
  const red = player("2", 2, "red");

  beforeEach(() => {
    ChainService.drawnSignatures = [];
  });

  it("returns chains that belong to the rival", () => {
    const own = new Chain(node(2, 3, blue), blue);
    const rival = new Chain(node(10, 11, red), red);

    const result = ChainService.getRivalChains([own, rival], blue, red);

    expect(result).toEqual([rival]);
  });

  it("treats the same dots as one drawn chain regardless of walk order", () => {
    const first = new Chain(node(2, 3, blue), blue);
    first.push(node(3, 4, blue));
    first.push(node(4, 3, blue));

    const signature = ChainService.signature(first);
    expect(ChainService.isChainDrawn(signature)).toBe(false);

    ChainService.remember(signature);

    const reversed = new Chain(node(4, 3, blue), blue);
    reversed.push(node(2, 3, blue));
    reversed.push(node(3, 4, blue));

    expect(ChainService.isChainDrawn(ChainService.signature(reversed))).toBe(true);
  });
});
