import Player from "../players/player";
import Coordinate from "../types/coordinate";
import Node from "../types/node";
import { Point, strictlyInside } from "../geometry";

class CoordinateService {
  static coordinates: Coordinate[] = [];

  static markAsTrapped(polygon: Point[], player: Player): void {
    this.coordinates.forEach((coordinate: Coordinate) => {
      if (!strictlyInside(coordinate, polygon)) return;
      coordinate.isTrapped = true;
      coordinate.trappedBy = player;
    });
  }

  static getTrapped(): Coordinate[] {
    return this.coordinates.filter((coordinate: Coordinate) => coordinate.isTrapped);
  }

  static getTrappedByCoordinates(searchNode: Node): Coordinate | undefined {
    return this.getTrapped().find(
      (coordinate: Coordinate) => coordinate.x === searchNode.x && coordinate.y === searchNode.y
    );
  }

  static trappedBy(player: Player): Coordinate[] {
    return this.getTrapped().filter(
      (coordinate: Coordinate) => coordinate.trappedBy && coordinate.trappedBy.id === player.id
    );
  }
}

export default CoordinateService;
