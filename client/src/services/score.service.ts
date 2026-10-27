import Player from '@/players/player';
import Chain from '@/types/chain';
import Node from '@/types/node';
import NodeStorage from './node-storage.service';
import Lookup from '@/strategy/lookup';
import sort from '@/helpers/sort';
import ChainService from './chain.service';
import CoordinateService from './coordinate.service';

class ScoreService {
  static userScore: number = 0;
  static scoreUpdate: ScoreUpdate | null = null; 
  static scoreUpdateObserver: Function;

  static setScoreUpdate(scoreUpdate): void {
    this.scoreUpdate = scoreUpdate;
    this.scoreUpdateObserver(scoreUpdate);
  }

  static addScoreUpdateObserver(observer: Function): void {
    this.scoreUpdateObserver = observer;
  }
  
  static getPlayerScore(player: Player, ctx: CanvasRenderingContext2D, isRival: boolean = false): [number, Chain[]] {
    const playerStorage = NodeStorage.getActivePlayerUntrappedNodes(player);
    const playerFreeNodes = NodeStorage.getActivePlayerFreeNodes(player);
    const playerHasChains = playerStorage.some((node: Node) => node.partOfChain);

    if (playerFreeNodes.length < 4 && !playerHasChains && !isRival) return [0, []];

    const rivalStorage = sort(NodeStorage.getRivalNodes(player));

    if (!rivalStorage.length) return [0, []];

    const [score, chains] = this.findPlayerChainsAndGetScore(playerStorage, player, rivalStorage, ctx);

    return [score, chains];
  }

  static getSurroundedRivalNodesAmount(chain: Chain, rivalStorage: Node[], ctx: CanvasRenderingContext2D): number {
    const rivalsSurrounded = this.getTrappedFromDrawnChain(chain, ctx, rivalStorage);

    return rivalsSurrounded;
  }

  static getTrappedFromDrawnChain(chain: Chain, ctx: CanvasRenderingContext2D, rivalStorage: Node[]): number {
    if (!chain.id || chain.id && ChainService.isChainDrawn(chain.id)) return 0;

    let current = chain.head;

    if (!current || !current.coordinate || !chain.head || !chain.head.coordinate) return 0;

    ctx.strokeStyle = 'black';

    ctx.fillStyle = current.player.color.replace(', 1', ', 0.5');
    const path = new Path2D();
    const { offsetX, offsetY } = current.coordinate;
    path.moveTo(offsetX, offsetY);

    while (current) {
      if (current.next && current.next.coordinate) {
        path.lineTo(current.next.coordinate.offsetX, current.next.coordinate.offsetY);
      }
      else {
        path.lineTo(chain.head.coordinate.offsetX, chain.head.coordinate.offsetY);
      }

      current = current.next;
    }

    const trapped = this.detectTrappedRivalsAmount(path, ctx, rivalStorage);

    if (trapped > 0) {
      ctx.stroke(path);
      ctx.fill(path);
    }

    CoordinateService.markAsTrapped(path, ctx, chain.activePlayer);
    ChainService.drawnChainIds.push(chain.id);

    return trapped;
  }
  
  static detectTrappedRivalsAmount(path: Path2D, ctx: CanvasRenderingContext2D, rivalStorage: Node[]): number {
    const rivalsInTrap: Node[] = [];
    rivalStorage.forEach((rivalNode: Node) => {
      if (!rivalNode.coordinate) return;
      
      const isNodeAlreadyTrapped = CoordinateService.getTrappedByCoordinates(rivalNode);

      if (isNodeAlreadyTrapped) return;

      const isRivalNodeTrapped = ctx.isPointInPath(path, rivalNode.coordinate.offsetX, rivalNode.coordinate.offsetY);

      if (isRivalNodeTrapped) {
        rivalNode.isTrapped = true;
        rivalsInTrap.push(rivalNode);
      }
    });

    return rivalsInTrap.length;
  }

  static findPlayerChainsAndGetScore(
    storage: Node[], 
    player: Player, 
    rivalStorage: Node[], 
    ctx: CanvasRenderingContext2D
  ): [number, Chain[]] {
    let result = 0;
    let chains: Chain[] = [];
    storage.forEach((node: Node) => {
      if (node.partOfChain) return;

      const chain = new Chain(node, player);
      Lookup.starter(chain, storage);

      if (!chain.chained) {
        NodeStorage.resetNexts();
        return;
      }

      result += this.getSurroundedRivalNodesAmount(chain, rivalStorage, ctx);
      chains.push(JSON.parse(JSON.stringify(chain)));

      NodeStorage.flagChainNodes(chain);
      NodeStorage.resetNexts();
    });

    this.userScore += result;

    return [this.userScore, chains];
  }

  static getWinner(trappedByActive: number, trappedByRival: number): string | null {
    const allCoordinates = CoordinateService.coordinates.length;
    
    if (trappedByActive > allCoordinates / 2) return 'Active player wins!';
    else if (trappedByRival > allCoordinates / 2) return 'Rival wins!';
    else return null;
  }
}

export default ScoreService;