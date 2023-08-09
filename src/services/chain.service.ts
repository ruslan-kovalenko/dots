import Player from '@/players/player';
import Chain from '@/types/chain';
import Node from '@/types/node';

class ChainService {
  static drawnChainIds: number[] = [];

  static getRivalChains(chains: Chain[], activePlayer: Player, rivalPlayer: Player): Chain[] {
    return chains.filter((chain: Chain) => chain.activePlayer.id === rivalPlayer!.id);
  }
  
  static isChainDrawn(id: number) {
    return this.drawnChainIds.some(id_ => id_ === id);
  }
}

export default ChainService;