import BPHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';
import NextNode from './next-node';
import LeftUpSubstrategy from './leftup-substrategy';
import UpRightSubstrategy from './upright-substrategy';

class InitialSubstrategy implements ISubstrategy {
  properNodeFromMultiple(nodeCandidates: NextNode[]): NextNode {
    return {} as NextNode;
  };

  nextNodeFilterSearch(prevNeighbor: Node, storageNodes: Node[]): NextNode[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    let result: NextNode[] = [];

    storageNodes.forEach((node: Node) => {
      if (node.x + 1 === prevNeightborX && node.y - 1 === prevNeighborY && 
          !BPHelper.getBlankPointBottomwards(node, storageNodes)) 
        result.push({ node, substrategy: new LeftUpSubstrategy() });

      if (node.x - 1 === prevNeightborX && node.y - 1 === prevNeighborY &&
          !BPHelper.getBlankPointBottomwards(node, storageNodes))
        result.push({ node, substrategy: new UpRightSubstrategy() });
    });

    return result;
  }
}

export default InitialSubstrategy;