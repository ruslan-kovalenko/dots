export interface Point {
  x: number;
  y: number;
}

function onSegment(point: Point, start: Point, end: Point): boolean {
  const cross = (end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x);
  if (cross !== 0) return false;
  const dot = (point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y);
  if (dot < 0) return false;
  const length = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
  return dot <= length;
}

export function onBoundary(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 2) return false;
  for (let index = 0; index < polygon.length; index++) {
    const start = polygon[index];
    const end = polygon[(index + 1) % polygon.length];
    if (point.x === start.x && point.y === start.y) return true;
    if (onSegment(point, start, end)) return true;
  }
  return false;
}

export function strictlyInside(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3 || onBoundary(point, polygon)) return false;
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const current = polygon[index];
    const prior = polygon[previous];
    const crosses = (current.y > point.y) !== (prior.y > point.y);
    if (!crosses) continue;
    const xAtY = ((prior.x - current.x) * (point.y - current.y)) / (prior.y - current.y) + current.x;
    if (point.x < xAtY) inside = !inside;
  }
  return inside;
}
