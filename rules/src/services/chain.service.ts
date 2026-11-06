import Player from "../players/player";
import Chain from "../types/chain";

class ChainService {
  static drawnSignatures: string[] = [];

  static signature(chain: Chain): string {
    return chain
      .points()
      .map((point) => `${point.x},${point.y}`)
      .sort()
      .join("|");
  }

  static remember(signature: string): void {
    if (!this.drawnSignatures.includes(signature)) this.drawnSignatures.push(signature);
  }

  static getRivalChains(chains: Chain[], _activePlayer: Player, rivalPlayer: Player): Chain[] {
    return chains.filter((chain: Chain) => chain.activePlayer.id === rivalPlayer.id);
  }

  static isChainDrawn(signature: string): boolean {
    return this.drawnSignatures.some((drawn) => drawn === signature);
  }
}

export default ChainService;
