import BPHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';
import NextNode from './next-node';
import { LookupDirection } from '../lookup-direction';
import LeftUpSubstrategy from './leftup-substrategy';
import UpSubstrategy from './up-substrategy';
import RightSubstrategy from './right-substrategy';
import RightDownSubstrategy from './rightdown-substrategy';
import { GeneralDirection } from '../lookup-direction';

class UpRightSubstrategy implements ISubstrategy {
  nextNodeFilterSearch(prevNeighbor: Node, storageNodes: Node[], generalDirection: GeneralDirection): NextNode[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    let result: NextNode[] = [];

    storageNodes.forEach((node: Node) => {
      if (node.x + 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BPHelper.leftUpSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new LeftUpSubstrategy() });
      if (node.x === prevNeightborX && node.y - 1 === prevNeighborY && !BPHelper.upSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new UpSubstrategy() });
      if (node.x - 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BPHelper.rightUpSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new UpRightSubstrategy() });
      if (node.x - 1 === prevNeightborX && node.y === prevNeighborY && !BPHelper.rightSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new RightSubstrategy() });
      if (node.x - 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.rightDownSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new RightDownSubstrategy() });
    });

    return result;
  }
}

export default UpRightSubstrategy;