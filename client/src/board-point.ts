export interface GridPoint {
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
}

export function eventToBitmap(
  offsetX: number,
  offsetY: number,
  canvasWidth: number,
  canvasHeight: number,
  clientWidth: number,
  clientHeight: number
): { x: number; y: number } {
  return {
    x: offsetX * (canvasWidth / clientWidth),
    y: offsetY * (canvasHeight / clientHeight),
  };
}

export function nearestIntersection(bitmapX: number, bitmapY: number, coordinates: GridPoint[]): GridPoint | undefined {
  const deviation = 15;
  return coordinates.find(
    (coordinate) =>
      Math.abs(coordinate.offsetX - bitmapX) <= deviation && Math.abs(coordinate.offsetY - bitmapY) <= deviation
  );
}
