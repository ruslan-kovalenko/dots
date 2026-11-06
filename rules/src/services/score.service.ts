import Player from "../players/player";
import Chain from "../types/chain";
import Node from "../types/node";
import NodeStorage from "./node-storage.service";
import Lookup from "../strategy/lookup";
import sort from "../helpers/sort";
import ChainService from "./chain.service";
import CoordinateService from "./coordinate.service";
import { Point, strictlyInside } from "../geometry";

class ScoreService {
  static getPlayerScore(player: Player): [number, Point[][]] {
    const playerStorage = NodeStorage.getActivePlayerUntrappedNodes(player);
    const playerFreeNodes = NodeStorage.getActivePlayerFreeNodes(player);
    const playerHasChains = playerStorage.some((node: Node) => node.partOfChain);

    if (playerFreeNodes.length < 4 && !playerHasChains) return [0, []];

    const rivalStorage = sort(NodeStorage.getRivalNodes(player));

    if (!rivalStorage.length) return [0, []];

    return this.findPlayerChainsAndGetScore(playerStorage, player, rivalStorage);
  }

  static findPlayerChainsAndGetScore(storage: Node[], player: Player, rivalStorage: Node[]): [number, Point[][]] {
    let score = 0;
    const outlines: Point[][] = [];

    storage.forEach((node: Node) => {
      if (node.partOfChain || node.isTrapped) return;

      const chain = new Chain(node, player);
      Lookup.starter(chain, storage);

      if (!chain.chained) {
        NodeStorage.resetNexts();
        return;
      }

      const captured = this.captureChain(chain, rivalStorage);
      NodeStorage.resetNexts();

      if (!captured) return;

      score += captured.score;
      outlines.push(captured.outline);
    });

    return [score, outlines];
  }

  static captureChain(chain: Chain, rivalStorage: Node[]): { score: number; outline: Point[] } | null {
    const outline = chain.points();

    if (outline.length < 4) return null;

    const signature = ChainService.signature(chain);

    if (ChainService.isChainDrawn(signature)) return null;

    const opponents = rivalStorage.filter((node) => !node.isTrapped && strictlyInside(node, outline));

    if (!opponents.length) return null;

    opponents.forEach((node) => {
      node.isTrapped = true;
    });

    (NodeStorage.storage || []).forEach((node) => {
      if (node.player.id === chain.activePlayer.id && strictlyInside(node, outline)) node.isTrapped = true;
    });

    CoordinateService.markAsTrapped(outline, chain.activePlayer);
    ChainService.remember(signature);
    NodeStorage.flagChainNodes(chain);
    return { score: opponents.length, outline };
  }
}

export default ScoreService;
