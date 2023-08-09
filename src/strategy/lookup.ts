import { Directions } from '@/types/chaining-direction';
import constants from '@/types/constants';
import Player from '@/players/player';
import NodeStorage from '@/services/node-storage.service';
import ISubstrategy from '@/strategy/substrategy/ISubstrategy';
import Chain from '@/types/chain';
import Node from '@/types/node';
import { LookupDirection, GeneralDirection } from './lookup-direction';
import InitialSubstrategy from './substrategy/initial-substrategy';
import NextNode from './substrategy/next-node';
import LeftUpSubstrategy from './substrategy/leftup-substrategy';
import UpRightSubstrategy from './substrategy/upright-substrategy';

class Lookup {
  static starter(chain: Chain, playerStorage: Node[]): void {
    const initialSubstrategy = new InitialSubstrategy();
    const nextNodes = initialSubstrategy.nextNodeFilterSearch(chain.tail!, playerStorage);

    if (!nextNodes.length) return;

    const { node, substrategy } = nextNodes[0];

    const generalDirection = substrategy instanceof LeftUpSubstrategy ? 
      GeneralDirection.Counterclockwise : GeneralDirection.Clockwise;

    this.strategyRunner(chain, playerStorage, node, substrategy, generalDirection);
  }

  static strategyRunner(
    chain: Chain,
    playerStorage: Node[],
    starterNode: Node,
    initialSubstrategy: ISubstrategy,
    generalDirection: GeneralDirection
  ): void {
    let nextNode: Node | undefined = starterNode;
    let substrategy = initialSubstrategy;

    while (nextNode) {
      let result = this.facade(substrategy, chain, playerStorage, generalDirection);

      if (!result) nextNode = undefined;
      else {
        substrategy = result.substrategy;
        nextNode = result.node;
      }
    }
  }
  
  static facade(
    directionInstance: ISubstrategy, 
    chain: Chain, 
    playerStorage: Node[],
    generalDirection: GeneralDirection
  ): NextNode | undefined {
    const candidates: NextNode[] = directionInstance.nextNodeFilterSearch(chain.tail!, playerStorage, generalDirection);

    if (!candidates.length) return;

    const nextNode = candidates.length === 1 ? candidates[0] :
      this.properNodeFromMultiple(candidates, chain.head!);

    if (!nextNode) return;

    let isChained = chain.checkForCompleteChain(nextNode.node);

    if (isChained) return;

    if (!chain.isNodeInCurrentChain(nextNode.node)) {
      chain.setId();
      chain.push(nextNode.node);
      return nextNode;
    } else return;
  }
  
  static properNodeFromMultiple(candidates: NextNode[], head: Node): NextNode {
    const { x: headX, y: headY } = head;

    const result = candidates.reduce((res, current) => {
      const { x: resX, y: resY } = res.node;
      const { x: curX, y: curY } = current.node;

      return (Math.abs(headX - resX) + Math.abs(headY - resY) < Math.abs(headX - curX) + Math.abs(headY - curY)) ? res : current;
    })
    
    return result;
  }
}

export default Lookup;