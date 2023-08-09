import BlankPointHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';

class DownSearchSubstrategy implements ISubstrategy {
  properNodeFromMultiple(nodeCandidates: Node[], attemptsToAdd?: number): Node {
    return nodeCandidates.reduce((result, current) => {
      return result.x < current.x ? result : current;
    });
  }

  nextNodeFilterSearch(prevNeighbor: Node, storageItems: Node[]): Node[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    
    return storageItems.filter((node: Node) => {
      const result = 
        (node.x + 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BlankPointHelper.getBlankPointUpwards(node, storageItems)) ||
        (node.x === prevNeightborX && node.y + 1 === prevNeighborY && !BlankPointHelper.getBlankPointLeftwards(node, storageItems)) ||
        (node.x - 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BlankPointHelper.getBlankPointLeftwards(node, storageItems))
      return result;
    });
  }
}

export default DownSearchSubstrategy;