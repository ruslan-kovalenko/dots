import Player from '@/players/player';
import Coordinate from '@/types/Coordinate';
import Chain from '@/types/chain';
import Node from '@/types/node';

class NodeStorage {
  public static storage: Node[];

  public static add(coordinates: Coordinate, player: Player): Node | undefined {
    if (!this.storage) this.storage = [];

    const { x, y } = coordinates;
    const node = new Node(x, y, player, coordinates);

    const isNodeInStorage = this.storage.find(item => item.x === x && item.y === y);

    if (isNodeInStorage) return;

    this.storage.push(node);
    return node;
  }

  public static setStorage(storage: Node[]): Node[] {
    this.storage = storage;

    return this.storage;
  }

  public static getActivePlayerNodes(player: Player): Node[] {
    if (!this.storage || !this.storage.length) return [];

    return this.storage.filter(node => node.player.id === player.id);
  }
  
  public static getActivePlayerUntrappedNodes(player: Player): Node[] {
    if (!this.storage || !this.storage.length) return [];

    return this.storage.filter(node => node.player.id === player.id && !node.isTrapped);
  }
  
  public static getActivePlayerFreeNodes(player: Player): Node[] {
    if (!this.storage || !this.storage.length) return [];

    return this.storage.filter(node => node.player.id === player.id && !node.partOfChain);
  }

  public static getRivalNodes(player: Player): Node[] {
    if (!this.storage.length) return [];

    return this.storage.filter(node => node.player.id !== player.id);
  }

  public static hasCompleteChains(player: Player): boolean {
    if (!this.storage.length) return false;

    return this.storage.some(node => node.player === node.player && node.partOfChain);
  }
  
  public static flagChainNodes(chain: Chain) {
    let current = chain.head;

    while (current) {
      current.partOfChain = true;
      current = current.next;
    }
  }
  
  public static resetNexts(): void {
    this.storage.forEach((node: Node) => {
      node.next = null;
    });
  }
}

export default NodeStorage;