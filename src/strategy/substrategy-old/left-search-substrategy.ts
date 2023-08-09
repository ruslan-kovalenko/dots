import BlankPointHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';

class LeftSearchSubstrategy implements ISubstrategy {
  properNodeFromMultiple(nodeCandidates: Node[], attemptsToAdd?: number): Node {
    return nodeCandidates.reduce((result, current) => {
      return result.y > current.y ? result : current;
    });
  }

  nextNodeFilterSearch(prevNeighbor: Node, storageItems: Node[]): Node[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;

    return storageItems.filter((node: Node) => {
      const result =
        (node.x + 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BlankPointHelper.getBlankPointRightwards(node, storageItems)) ||
        (node.x + 1 === prevNeightborX && node.y === prevNeighborY && !BlankPointHelper.getBlankPointUpwards(node, storageItems)) ||
        (node.x + 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BlankPointHelper.getBlankPointUpwards(node, storageItems))
      return result;
    });
  }
}

export default LeftSearchSubstrategy;