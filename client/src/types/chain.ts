import Node from './node';
import { Directions, SubDirection } from './chaining-direction';
import constants from './constants';
import Player from '@/players/player';
import NodeStorage from '@/services/node-storage.service';

class Chain {
  id: number | null;
  head: Node | null;
  tail: Node | null;
  activePlayer: Player;
  chained?: boolean;
  length: number;
  
  constructor(start: Node, activePlayer: Player) {
    this.id = null;
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

    this.chained = this.head?.x === candidate.x && this.head.y === candidate.y;
    return this.chained;
  }
  
  setId() {
    const id = Date.now();
    this.id = id;
  }
}

export default Chain;