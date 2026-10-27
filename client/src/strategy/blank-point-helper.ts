import Node from '@/types/node';
import { GeneralDirection } from './lookup-direction';
import CoordinateService from '@/services/coordinate.service';

export default class BlankPointHelper {
  static leftUpSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointRightwards(node, storageNodes) : this.getBlankPointBottomwards(node, storageNodes);
  } 

  static leftSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointUpwards(node, storageNodes) : this.getBlankPointBottomwards(node, storageNodes);
  }

  static leftDownSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointUpwards(node, storageNodes) : this.getBlankPointRightwards(node, storageNodes);
  }

  static downSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointLeftwards(node, storageNodes) : this.getBlankPointRightwards(node, storageNodes);
  }

  static rightDownSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointLeftwards(node, storageNodes) : this.getBlankPointUpwards(node, storageNodes);
  }

  static rightSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointBottomwards(node, storageNodes) : this.getBlankPointUpwards(node, storageNodes);
  }

  static rightUpSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointBottomwards(node, storageNodes) : this.getBlankPointLeftwards(node, storageNodes);
  }

  static upSubstrategyBlankPoint(node: Node, storageNodes: Node[], generalDirection: GeneralDirection) {
    return generalDirection === GeneralDirection.Clockwise ? 
      this.getBlankPointRightwards(node, storageNodes) : this.getBlankPointLeftwards(node, storageNodes);
  }

  static getBlankPointLeftwards(nextNode: Node, storageItems: Node[]): boolean {
    const ownNodeNext = storageItems.find((node: Node) => 
      nextNode.x - node.x === 1 &&
      nextNode.y - node.y === 0
    );

    const trappedNodeNext = CoordinateService.getTrappedByCoordinates({x: nextNode.x - 1, y: nextNode.y} as Node);

    return trappedNodeNext || ownNodeNext ? true : false;
  }

  static getBlankPointUpwards(nextNode: Node, storageItems: Node[]): boolean {
    const ownNodeNext = storageItems.find((node: Node) => 
      node.x - nextNode.x === 0 &&
      node.y - nextNode.y === 1
    );

    const trappedNodeNext = CoordinateService.getTrappedByCoordinates({x: nextNode.x, y: nextNode.y + 1} as Node);

    return trappedNodeNext || ownNodeNext ? true : false;
  }

  static getBlankPointRightwards(nextNode: Node, storageItems: Node[]): boolean {
    const ownNodeNext = storageItems.find((node: Node) => 
      node.x - nextNode.x === 1 &&
      node.y - nextNode.y === 0
    );

    const trappedNodeNext = CoordinateService.getTrappedByCoordinates({x: nextNode.x + 1, y: nextNode.y} as Node);

    return trappedNodeNext || ownNodeNext ? true : false;      
  }

  static getBlankPointBottomwards(nextNode: Node, storageItems: Node[]): boolean {
    const ownNodeNext = storageItems.find((node: Node) => 
      nextNode.x - node.x === 0 &&
      nextNode.y - node.y === 1
    );

    const trappedNodeNext = CoordinateService.getTrappedByCoordinates({x: nextNode.x, y: nextNode.y - 1} as Node);

    return trappedNodeNext || ownNodeNext ? true : false;
  }
}