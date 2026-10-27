import Player from '../players/player';
import Coordinate from './Coordinate';

class Node {
  x: number;
  y: number;
  player: Player;
  next: Node | null;
  prev: Node | null;
  coordinate: Coordinate | null;
  partOfChain: boolean;
  isTrapped: boolean;
  
  constructor(x: number, y: number, player: Player, coordinate: Coordinate) {
    this.x = x;
    this.y = y;
    this.player = player;
    this.next = null;
    this.prev = null;
    this.coordinate = coordinate;
    this.partOfChain = false;
    this.isTrapped = false;
  }
}

export default Node;