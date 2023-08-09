import BPHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';
import NextNode from './next-node';
import UpRightSubstrategy from './upright-substrategy';
import UpSubstrategy from './up-substrategy';
import LeftDownSubstrategy from './leftdown-substrategy';
import LeftSubstrategy from './left-substrategy';
import LeftUpSubstrategy from './leftup-substrategy';
import RightSubstrategy from './right-substrategy';
import DownSubstrategy from './down-substrategy';
import { GeneralDirection } from '../lookup-direction';

class RightDownSubstrategy implements ISubstrategy {
  properNodeFromMultiple(nodeCandidates: NextNode[]): NextNode {
    return nodeCandidates.reduce((result, current) => {
      return result.node.y > current.node.y ? result : current; // recheck
    });
  }

  nextNodeFilterSearch(prevNeighbor: Node, storageNodes: Node[], generalDirection: GeneralDirection): NextNode[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    let result: NextNode[] = [];

    storageNodes.forEach((node: Node) => {
      if (node.x - 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BPHelper.rightUpSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new UpRightSubstrategy() });
      if (node.x - 1 === prevNeightborX && node.y === prevNeighborY && !BPHelper.rightSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new RightSubstrategy() });
      if (node.x - 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.rightDownSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new RightDownSubstrategy() });
      if (node.x === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.downSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new DownSubstrategy() });
      if (node.x + 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.leftDownSubstrategyBlankPoint(node, storageNodes, generalDirection)) 
        result.push({ node, substrategy: new LeftDownSubstrategy() });
    });

    return result;
  }
}

export default RightDownSubstrategy;