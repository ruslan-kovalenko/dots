import BlankPointHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';

class RightSearchSubstrategy implements ISubstrategy {
  properNodeFromMultiple(nodeCandidates: Node[], attemptsToAdd: number): Node {
    if (attemptsToAdd === 0) {
      return nodeCandidates.reduce((result, current) => {
        return result.y > current.y ? result : current;
      });
    } else {
      return nodeCandidates.reduce((result, current) => {
        return result.y < current.y ? result : current;
      });
    }
  }

  nextNodeFilterSearch(prevNeighbor: Node, storageItems: Node[]): Node[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    
    return storageItems.filter((node: Node) => {
      const result =   
        (node.x - 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BlankPointHelper.getBlankPointBottomwards(node, storageItems)) ||
        (node.x - 1 === prevNeightborX && node.y === prevNeighborY && !BlankPointHelper.getBlankPointBottomwards(node, storageItems)) || 
        (node.x - 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BlankPointHelper.getBlankPointLeftwards(node, storageItems))
      return result;
    });
  }
}

export default RightSearchSubstrategy;