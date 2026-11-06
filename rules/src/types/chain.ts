import Node from "./node";
import Player from "../players/player";

class Chain {
  head: Node | null;
  tail: Node | null;
  activePlayer: Player;
  chained?: boolean;
  length: number;

  constructor(start: Node, activePlayer: Player) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.chained = false;
    this.activePlayer = activePlayer;
    this.push(start);
  }

  push(node: Node): Chain {
    if (this.length === 0) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }

    this.length++;
    return this;
  }

  points(): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    let current = this.head;
    const seen = new Set<Node>();
    while (current && !seen.has(current)) {
      seen.add(current);
      points.push({ x: current.x, y: current.y });
      current = current.next;
    }
    return points;
  }

  isNodeInCurrentChain(newNode: Node): boolean {
    let current = this.head;

    while (current) {
      if (newNode.x === current.x && newNode.y === current.y) return true;
      current = current.next;
    }

    return false;
  }

  checkForCompleteChain(candidate: Node): boolean {
    if (!this.head) return false;

    this.chained = this.head.x === candidate.x && this.head.y === candidate.y;
    return this.chained;
  }
}

export default Chain;
