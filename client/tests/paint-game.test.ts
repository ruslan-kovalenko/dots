import { paintGame, PLAYER_COLORS, PaintArea, PaintDot, PaintIntersection } from "../src/paint-game";

function mockContext(): { ctx: CanvasRenderingContext2D; calls: unknown[][] } {
  const calls: unknown[][] = [];
  const ctx = {
    canvas: { width: 800, height: 600 },
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 1,
    clearRect: (...args: unknown[]) => calls.push(["clearRect", ...args]),
    beginPath: () => calls.push(["beginPath"]),
    moveTo: (x: number, y: number) => calls.push(["moveTo", x, y]),
    lineTo: (x: number, y: number) => calls.push(["lineTo", x, y]),
    closePath: () => calls.push(["closePath"]),
    stroke: () => calls.push(["stroke", ctx.strokeStyle, ctx.lineWidth]),
    fill: () => calls.push(["fill", ctx.fillStyle]),
    arc: (...args: unknown[]) => calls.push(["arc", ...args]),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe("paintGame", () => {
  const intersections: PaintIntersection[] = [
    { x: 2, y: 3, offsetX: 70, offsetY: 100 },
    { x: 3, y: 4, offsetX: 105, offsetY: 65 },
    { x: 4, y: 3, offsetX: 140, offsetY: 100 },
    { x: 3, y: 2, offsetX: 105, offsetY: 135 },
    { x: 3, y: 3, offsetX: 105, offsetY: 100 },
  ];

  it("strokes a closed black outline and fills it with the owner color at reduced opacity", () => {
    const { ctx, calls } = mockContext();
    const area: PaintArea = {
      ownerOrder: 1,
      outline: [
        { x: 2, y: 3 },
        { x: 3, y: 4 },
        { x: 4, y: 3 },
        { x: 3, y: 2 },
      ],
    };

    paintGame(ctx, intersections, [], [area]);

    expect(calls).toEqual(
      expect.arrayContaining([
        ["moveTo", 70, 100],
        ["lineTo", 105, 65],
        ["lineTo", 140, 100],
        ["lineTo", 105, 135],
        ["closePath"],
        ["stroke", "black", 2],
        ["fill", PLAYER_COLORS[1].replace(", 1)", ", 0.25)")],
      ])
    );
  });

  it("draws an imprisoned dot in its own color", () => {
    const { ctx, calls } = mockContext();
    const dots: PaintDot[] = [{ x: 3, y: 3, order: 2, isTrapped: true }];

    paintGame(ctx, intersections, dots, []);

    expect(calls).toContainEqual(["fill", PLAYER_COLORS[2]]);
  });
});
