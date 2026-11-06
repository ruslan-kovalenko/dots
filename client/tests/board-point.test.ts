import { buildIntersections } from "rules";
import { eventToBitmap, nearestIntersection } from "../src/board-point";

describe("nearest intersection", () => {
  const coordinates = buildIntersections();
  const target = coordinates.find((point) => point.x === 3 && point.y === 3);

  it("maps a click within 15 bitmap pixels", () => {
    expect(target).toBeDefined();
    const hit = nearestIntersection(target!.offsetX + 10, target!.offsetY - 10, coordinates);
    expect(hit).toMatchObject({ x: 3, y: 3 });
  });

  it("maps a click on a canvas displayed at a different size than the 800×600 bitmap", () => {
    const displayed = eventToBitmap(target!.offsetX / 2, target!.offsetY / 2, 800, 600, 400, 300);
    const hit = nearestIntersection(displayed.x, displayed.y, coordinates);
    expect(hit).toMatchObject({ x: 3, y: 3 });
  });

  it("maps a farther click to nothing", () => {
    expect(nearestIntersection(1, 1, coordinates)).toBeUndefined();
  });
});
