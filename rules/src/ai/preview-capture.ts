import Player from "../players/player";
import ChainService from "../services/chain.service";
import CoordinateService from "../services/coordinate.service";
import NodeStorage from "../services/node-storage.service";
import ScoreService from "../services/score.service";

export function previewCapture(player: Player, x: number, y: number): number {
  const storage = NodeStorage.storage || [];
  const nodeSnap = storage.map((node) => ({
    node,
    isTrapped: node.isTrapped,
    partOfChain: node.partOfChain,
    next: node.next,
  }));
  const coordSnap = CoordinateService.coordinates.map((coordinate) => ({
    coordinate,
    isTrapped: coordinate.isTrapped,
    trappedBy: coordinate.trappedBy,
  }));
  const signatures = ChainService.drawnSignatures.slice();
  const coordinate = CoordinateService.coordinates.find((cell) => cell.x === x && cell.y === y);
  const added = coordinate ? NodeStorage.add(coordinate, player) : undefined;
  let score = 0;

  try {
    if (added) score = ScoreService.getPlayerScore(player)[0];
  } finally {
    if (added && NodeStorage.storage) {
      const index = NodeStorage.storage.indexOf(added);
      if (index >= 0) NodeStorage.storage.splice(index, 1);
    }
    nodeSnap.forEach((saved) => {
      saved.node.isTrapped = saved.isTrapped;
      saved.node.partOfChain = saved.partOfChain;
      saved.node.next = saved.next;
    });
    coordSnap.forEach((saved) => {
      saved.coordinate.isTrapped = saved.isTrapped;
      saved.coordinate.trappedBy = saved.trappedBy;
    });
    ChainService.drawnSignatures = signatures;
  }

  return score;
}
