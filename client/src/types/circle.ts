import Coordinate from './Coordinate';

type Circle = {
  context: CanvasRenderingContext2D;
  radius: number;
  fill: string;
  node: Coordinate;
}

export default Circle;