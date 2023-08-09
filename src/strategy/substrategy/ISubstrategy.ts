import Node from '@/types/node';
import { GeneralDirection, LookupDirection } from '../lookup-direction';
import NextNode from './next-node';

export default interface ISubstrategy {
  properNodeFromMultiple(nodeCandidates: NextNode[]): NextNode;
  nextNodeFilterSearch(prevNeighbor: Node, storageItems: Node[], generalDirection?: GeneralDirection): NextNode[];
}
