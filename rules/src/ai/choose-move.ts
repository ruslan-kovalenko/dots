import Match, { Order } from "../match";
import Player from "../players/player";
import CoordinateService from "../services/coordinate.service";
import NodeStorage from "../services/node-storage.service";
import { previewCapture } from "./preview-capture";

type Cell = { x: number; y: number };

export function chooseMove(order: Order): Cell | null {
  const me = Match.players.find((player) => player.order === order);
  const rival = Match.players.find((player) => player.order === (order === 1 ? 2 : 1));
  if (!me || !rival) return null;

  const occupied = new Set((NodeStorage.storage || []).map((node) => `${node.x},${node.y}`));
  const free = CoordinateService.coordinates.filter((cell) => !cell.isTrapped && !occupied.has(`${cell.x},${cell.y}`));
  if (!free.length) return null;

  const dots = (NodeStorage.storage || []).map((node) => ({ x: node.x, y: node.y, order: node.player.order }));
  const capturing = bestCapture(me, adjacent(dots.filter((dot) => dot.order === order), free));
  if (capturing) return point(capturing);

  const blocking = bestCapture(rival, adjacent(dots.filter((dot) => dot.order !== order), free));
  if (blocking) return point(blocking);

  const latest = dots[dots.length - 1];
  if (latest) {
    const neighbors = adjacent([latest], free);
    if (neighbors.length) return point(nearest(neighbors));
  }

  return point(nearest(free));
}

function point(cell: Cell): Cell {
  return { x: cell.x, y: cell.y };
}

function adjacent(dots: Cell[], free: Cell[]): Cell[] {
  return free.filter((cell) =>
    dots.some((dot) => {
      const dx = Math.abs(cell.x - dot.x);
      const dy = Math.abs(cell.y - dot.y);
      return dx <= 1 && dy <= 1 && dx + dy > 0;
    })
  );
}

function bestCapture(player: Player, cells: Cell[]): Cell | null {
  const scored = cells
    .map((cell) => ({ cell, score: previewCapture(player, cell.x, cell.y) }))
    .filter((item) => item.score > 0);
  if (!scored.length) return null;
  const top = Math.max(...scored.map((item) => item.score));
  return nearest(scored.filter((item) => item.score === top).map((item) => item.cell));
}

function nearest(cells: Cell[]): Cell {
  const xs = CoordinateService.coordinates.map((cell) => cell.x);
  const ys = CoordinateService.coordinates.map((cell) => cell.y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  return cells.slice().sort((a, b) => {
    const distance = (cell: Cell) => (cell.x - centerX) ** 2 + (cell.y - centerY) ** 2;
    const delta = distance(a) - distance(b);
    if (delta !== 0) return delta;
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  })[0];
}
