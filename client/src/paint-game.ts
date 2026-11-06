import { PLAYER_COLOR } from "rules";

export interface PaintPoint {
  x: number;
  y: number;
}

export interface PaintDot extends PaintPoint {
  order: 1 | 2;
  isTrapped: boolean;
}

export interface PaintArea {
  ownerOrder: 1 | 2;
  outline: PaintPoint[];
}

export interface PaintIntersection extends PaintPoint {
  offsetX: number;
  offsetY: number;
}

export const PLAYER_COLORS = PLAYER_COLOR;

export function paintGame(
  ctx: CanvasRenderingContext2D,
  intersections: PaintIntersection[],
  dots: PaintDot[],
  areas: PaintArea[]
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = "lightgrey";
  ctx.beginPath();
  const xs = [...new Set(intersections.map((point) => point.offsetX))].sort((a, b) => a - b);
  const ys = [...new Set(intersections.map((point) => point.offsetY))].sort((a, b) => a - b);
  if (xs.length && ys.length) {
    const top = ys[0];
    const bottom = ys[ys.length - 1];
    const left = xs[0];
    const right = xs[xs.length - 1];
    xs.forEach((x) => {
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
    });
    ys.forEach((y) => {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    });
  }
  ctx.stroke();

  areas.forEach((area) => {
    if (area.outline.length < 3) return;
    const located = area.outline.map((point) =>
      intersections.find((intersection) => intersection.x === point.x && intersection.y === point.y)
    );
    if (located.some((point) => !point)) return;
    ctx.beginPath();
    located.forEach((point, index) => {
      if (!point) return;
      if (index === 0) ctx.moveTo(point.offsetX, point.offsetY);
      else ctx.lineTo(point.offsetX, point.offsetY);
    });
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PLAYER_COLORS[area.ownerOrder].replace(", 1)", ", 0.25)");
    ctx.fill();
    ctx.lineWidth = 1;
  });

  dots.forEach((dot) => {
    const at = intersections.find((intersection) => intersection.x === dot.x && intersection.y === dot.y);
    if (!at) return;
    ctx.beginPath();
    ctx.arc(at.offsetX, at.offsetY, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = PLAYER_COLORS[dot.order];
    ctx.fill();
  });
}
