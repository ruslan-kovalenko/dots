import Player from '@/players/player';
import Coordinate from '@/types/Coordinate';
import Chain from '@/types/chain';
import Node from '@/types/node';

class NodeStorage {
  static storage: Node[];
  static newNode: Node | null = null;
  static newNodeObserver: Function;

  static add(coordinates: Coordinate, player: Player): Node | undefined {
    if (!this.storage) this.storage = [];

    const { x, y } = coordinates;
    const node = new Node(x, y, player, coordinates);

    const isNodeInStorage = this.storage.find(item => item.x === x && item.y === y);

    if (isNodeInStorage) return;

    this.storage.push(node);
    return node;
  }
  
  static setNewNode(newNode: Node): void {
    this.newNode = newNode;
    this.newNodeObserver(newNode);
  }

  static addNewNodeObserver(observer: Function): void {
    this.newNodeObserver = observer;
  }

  static setStorage(storage: Node[]): Node[] {
    this.storage = storage;

    return this.storage;
  }

  static getActivePlayerNodes(player: Player): Node[] {
    if (!this.storage || !this.storage.length) return [];

    return this.storage.filter(node => node.player.id === player.id);
  }
  
  static getActivePlayerUntrappedNodes(player: Player): Node[] {
    if (!this.storage || !this.storage.length) return [];

    return this.storage.filter(node => node.player.id === player.id && !node.isTrapped);
  }
  
  static getActivePlayerFreeNodes(player: Player): Node[] {
    if (!this.storage || !this.storage.length) return [];

    return this.storage.filter(node => node.player.id === player.id && !node.partOfChain);
  }

  static getRivalNodes(player: Player): Node[] {
    if (!this.storage.length) return [];

    return this.storage.filter(node => node.player.id !== player.id);
  }

  static hasCompleteChains(player: Player): boolean {
    if (!this.storage.length) return false;

    return this.storage.some(node => node.player === node.player && node.partOfChain);
  }
  
  static flagChainNodes(chain: Chain) {
    let current = chain.head;

    while (current) {
      current.partOfChain = true;
      current = current.next;
    }
  }
  
  static resetNexts(): void {
    this.storage.forEach((node: Node) => {
      node.next = null;
    });
  }
}

export default NodeStorage;