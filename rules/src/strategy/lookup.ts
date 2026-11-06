import ISubstrategy from "./substrategy/ISubstrategy";
import Chain from "../types/chain";
import Node from "../types/node";
import { GeneralDirection } from "./lookup-direction";
import InitialSubstrategy from "./substrategy/initial-substrategy";
import NextNode from "./substrategy/next-node";
import LeftUpSubstrategy from "./substrategy/leftup-substrategy";
import UpRightSubstrategy from "./substrategy/upright-substrategy";
import RightSubstrategy from "./substrategy/right-substrategy";

class Lookup {
  static starter(chain: Chain, playerStorage: Node[]): void {
    const initialSubstrategy = new InitialSubstrategy();
    const nextNodes = initialSubstrategy.nextNodeFilterSearch(chain.tail!, playerStorage);

    if (!nextNodes.length) return;

    const { node, substrategy } = nextNodes[0];
    const generalDirection =
      substrategy instanceof LeftUpSubstrategy || substrategy instanceof RightSubstrategy
        ? GeneralDirection.Counterclockwise
        : GeneralDirection.Clockwise;
    chain.push(node);
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
      const result = this.facade(substrategy, chain, playerStorage, generalDirection);

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

    const nextNode =
      candidates.length === 1 ? candidates[0] : this.properNodeFromMultiple(candidates, chain.tail!, chain.head!);

    if (!nextNode) return;

    const isChained = chain.checkForCompleteChain(nextNode.node);

    if (isChained) return;

    if (!chain.isNodeInCurrentChain(nextNode.node)) {
      chain.push(nextNode.node);
      return nextNode;
    }
  }

  static properNodeFromMultiple(candidates: NextNode[], tail: Node, head: Node): NextNode {
    const diagonal = candidates.filter((candidate) => {
      const dx = Math.abs(candidate.node.x - tail.x);
      const dy = Math.abs(candidate.node.y - tail.y);
      return dx === 1 && dy === 1;
    });
    const pool = diagonal.length ? diagonal : candidates;
    const { x: headX, y: headY } = head;

    return pool.reduce((chosen, current) => {
      const chosenDistance = Math.abs(headX - chosen.node.x) + Math.abs(headY - chosen.node.y);
      const currentDistance = Math.abs(headX - current.node.x) + Math.abs(headY - current.node.y);
      return chosenDistance < currentDistance ? chosen : current;
    });
  }
}

export default Lookup;
