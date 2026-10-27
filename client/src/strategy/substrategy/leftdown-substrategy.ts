import BPHelper from '@/strategy/blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '@/types/node';
import NextNode from './next-node';
import UpRightSubstrategy from './upright-substrategy';
import UpSubstrategy from './up-substrategy';
import LeftUpSubstrategy from './leftup-substrategy';
import LeftSubstrategy from './left-substrategy';
import DownSubstrategy from './down-substrategy';
import RightDownSubstrategy from './rightdown-substrategy';
import { GeneralDirection } from '../lookup-direction';

class LeftDownSubstrategy implements ISubstrategy {
  nextNodeFilterSearch(prevNeighbor: Node, storageNodes: Node[], generalDirection: GeneralDirection): NextNode[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    let result: NextNode[] = [];

    storageNodes.forEach((node: Node) => {
      if (node.x + 1 === prevNeightborX && node.y - 1 === prevNeighborY && !BPHelper.leftUpSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new LeftUpSubstrategy() });
      if (node.x + 1 === prevNeightborX && node.y === prevNeighborY && !BPHelper.leftSubstrategyBlankPoint(node, storageNodes, generalDirection)) 
        result.push({ node, substrategy: new LeftSubstrategy() });
      if (node.x + 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.leftDownSubstrategyBlankPoint(node, storageNodes, generalDirection)) 
        result.push({ node, substrategy: new LeftDownSubstrategy() });
      if (node.x === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.downSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new DownSubstrategy() });
      if (node.x - 1 === prevNeightborX && node.y + 1 === prevNeighborY && !BPHelper.rightDownSubstrategyBlankPoint(node, storageNodes, generalDirection))
        result.push({ node, substrategy: new RightDownSubstrategy() });
    });

    return result;
  }
}

export default LeftDownSubstrategy;