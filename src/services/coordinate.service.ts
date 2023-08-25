import Player from '@/players/player';
import Coordinate from '@/types/Coordinate';
import Node from '@/types/node';

class CoordinateService {
  static coordinates: Coordinate[] = [];
  
  static markAsTrapped(path: Path2D, ctx: CanvasRenderingContext2D, player: Player): void {
    this.coordinates.forEach((coordinate: Coordinate) => {
      const isCoordinateTrapped = ctx.isPointInPath(path, coordinate.offsetX, coordinate.offsetY);

      if (isCoordinateTrapped) {
        coordinate.isTrapped = true;
        coordinate.trappedBy = player;
      }
    });
  }
  
  static getTrapped(): Coordinate[] {
    return this.coordinates.filter((coordinate: Coordinate) => coordinate.isTrapped);
  }
  
  static getTrappedByCoordinates(searchNode: Node): Coordinate | undefined {
    return this.getTrapped().find((coordinate: Coordinate) => coordinate.x === searchNode.x && coordinate.y === searchNode.y);
  }
  
  static trappedBy(player: Player): Coordinate[] {
    return this.getTrapped().filter((coordinate: Coordinate) => 
      coordinate.trappedBy && coordinate.trappedBy?.id === player.id);
  }
}

export default CoordinateService;