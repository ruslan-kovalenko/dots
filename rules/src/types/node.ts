import Player from "../players/player";
import Coordinate from "./coordinate";

class Node {
  x: number;
  y: number;
  player: Player;
  next: Node | null;
  coordinate: Coordinate | null;
  partOfChain: boolean;
  isTrapped: boolean;

  constructor(x: number, y: number, player: Player, coordinate: Coordinate) {
    this.x = x;
    this.y = y;
    this.player = player;
    this.next = null;
    this.coordinate = coordinate;
    this.partOfChain = false;
    this.isTrapped = false;
  }
}

export default Node;
