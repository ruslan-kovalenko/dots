import Player from '@/players/player';

type Coordinate = {
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
  isTrapped: boolean;
  trappedBy: Player | null;
}

export default Coordinate;