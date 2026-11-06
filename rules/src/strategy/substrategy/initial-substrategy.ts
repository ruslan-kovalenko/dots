import BPHelper from '../blank-point-helper';
import ISubstrategy from './ISubstrategy';
import Node from '../../types/node';
import NextNode from './next-node';
import LeftUpSubstrategy from './leftup-substrategy';
import UpRightSubstrategy from './upright-substrategy';
import UpSubstrategy from './up-substrategy';
import RightSubstrategy from './right-substrategy';
import { GeneralDirection } from '../lookup-direction';

class InitialSubstrategy implements ISubstrategy {
  nextNodeFilterSearch(prevNeighbor: Node, storageNodes: Node[]): NextNode[] {
    const { x: prevNeightborX, y: prevNeighborY } = prevNeighbor;
    const result: NextNode[] = [];

    storageNodes.forEach((node: Node) => {
      if (node.x + 1 === prevNeightborX && node.y - 1 === prevNeighborY && 
          !BPHelper.getBlankPointBottomwards(node, storageNodes, true)) 
        result.push({ node, substrategy: new LeftUpSubstrategy() });

      if (node.x - 1 === prevNeightborX && node.y - 1 === prevNeighborY &&
          !BPHelper.getBlankPointBottomwards(node, storageNodes, true))
        result.push({ node, substrategy: new UpRightSubstrategy() });
    });

    if (result.length) return result;

    storageNodes.forEach((node: Node) => {
      if (node.x === prevNeightborX && node.y - 1 === prevNeighborY &&
          !BPHelper.upSubstrategyBlankPoint(node, storageNodes, GeneralDirection.Clockwise))
        result.push({ node, substrategy: new UpSubstrategy() });

      if (node.x - 1 === prevNeightborX && node.y === prevNeighborY &&
          !BPHelper.rightSubstrategyBlankPoint(node, storageNodes, GeneralDirection.Counterclockwise))
        result.push({ node, substrategy: new RightSubstrategy() });
    });

    return result;
  }
}

export default InitialSubstrategy;