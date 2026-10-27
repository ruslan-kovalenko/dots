import Node from '@/types/node';
import ISubstrategy from './ISubstrategy';

type NextNode = {
  node: Node, 
  substrategy: ISubstrategy
}

export default NextNode;