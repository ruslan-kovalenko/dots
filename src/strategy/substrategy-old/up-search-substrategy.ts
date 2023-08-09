import BlankPointHelper from '@/strategy/blank-point-helper';
import ISubstrategy from '../substrategy/ISubstrategy';
import Node from '@/types/node';

class UpSearchSubstrategy implements ISubstrategy {
  properNodeFromMultiple(nodeCandidates: Node[], attemptsToAdd?: number): Node {
    const result = nodeCandidates.reduce((result, current) => {
      return result.x > current.x ? result : current;
    });
    
    return result;
  }

  nextNodeFilterSearch(prevNeighbor: Node, storageItems: Node[]): Node[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    
    return storageItems.filter((node: Node) => {
      const result = 
        (node.x - 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BlankPointHelper.getBlankPointBottomwards(node, storageItems)) ||
        (node.x === prevNeightborX && node.y - 1 === prevNeighborY && !BlankPointHelper.getBlankPointRightwards(node, storageItems)) || 
        (node.x + 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BlankPointHelper.getBlankPointRightwards(node, storageItems))
      return result;
    });
  }
}

export default UpSearchSubstrategy;