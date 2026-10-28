import Player from './player';
import Coordinate from './coordinate';

type Node = {
  x: number;
  y: number;
  player: Player;
  next: Node | null;
  prev: Node | null;
  coordinate: Coordinate | null;
  partOfChain: boolean;
  isTrapped: boolean;
}

export default Node;
