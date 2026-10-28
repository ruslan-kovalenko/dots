import Chain from '../types/chain';

class ChainService {
  static chainsPlayerOne: Chain[] = [];
  static chainsPlayerTwo: Chain[] = [];

  static combineChainsPO(chains: Chain[]): Chain[] {
    return [...this.chainsPlayerOne, ...chains];
  }

  static combineChainsPT(chains: Chain[]): Chain[] {
    return [...this.chainsPlayerTwo, ...chains];
  }

  static getAllChains(): Chain[] {
    return [...this.chainsPlayerOne, ...this.chainsPlayerTwo];
  }
}

export default ChainService;