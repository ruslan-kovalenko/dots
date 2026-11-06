import Coordinate from "./types/coordinate";
import constants from "./types/constants";

export function buildIntersections(
  width = constants.CANVAS_WIDTH,
  height = constants.CANVAS_HEIGHT,
  gap = constants.PIXEL_GAP,
): Coordinate[] {
  const nX = Math.floor(width / gap) - 2;
  const nY = Math.floor(height / gap) - 2;
  const pX = width - nX * gap;
  const pY = height - nY * gap;
  const pL = Math.ceil(pX / 2) - 0.5;
  const pT = Math.ceil(pY / 2) - 0.5;
  const pR = width - nX * gap - pL;
  const pB = height - nY * gap - pT;

  const xArray: number[] = [];
  const yArray: number[] = [];
  for (let x = pL; x <= width - pR; x += gap) xArray.push(x);
  for (let y = pT; y <= height - pB; y += gap) yArray.push(y);

  const coordinates: Coordinate[] = [];
  for (let i = 0; i < xArray.length; i++) {
    const offsetX = xArray[i];
    for (let j = 0, y = yArray.length; j < yArray.length; j++, y--) {
      coordinates.push({
        offsetX,
        offsetY: yArray[j],
        x: i + 1,
        y,
        isTrapped: false,
        trappedBy: null,
      });
    }
  }
  return coordinates;
}
