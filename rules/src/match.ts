import { buildIntersections } from "./board";
import { strictlyInside } from "./geometry";
import Player from "./players/player";
import ChainService from "./services/chain.service";
import CoordinateService from "./services/coordinate.service";
import NodeStorage from "./services/node-storage.service";
import ScoreService from "./services/score.service";

export type Phase = "waiting" | "playing" | "ended";
export type Order = 1 | 2;

export interface Area {
  ownerOrder: Order;
  outline: { x: number; y: number }[];
  interior: { x: number; y: number }[];
  imprisoned: { x: number; y: number; order: Order }[];
}

export interface GameResult {
  scores: { 1: number; 2: number };
  winner: 1 | 2 | "tie";
}

export interface GameState {
  phase: Phase;
  activeOrder: Order | null;
  storage: { x: number; y: number; order: Order; isTrapped: boolean }[];
  areas: { ownerOrder: Order; outline: { x: number; y: number }[]; interior: { x: number; y: number }[] }[];
  scores: { 1: number; 2: number };
  endRequests: Order[];
  result: GameResult | null;
}

class Match {
  static phase: Phase = "waiting";
  static activeOrder: Order | null = null;
  static endRequests: Order[] = [];
  static scores: { 1: number; 2: number } = { 1: 0, 2: 0 };
  static areas: Area[] = [];
  static result: GameResult | null = null;
  static players: Player[] = [];

  static reset(): void {
    this.phase = "waiting";
    this.activeOrder = null;
    this.endRequests = [];
    this.scores = { 1: 0, 2: 0 };
    this.areas = [];
    this.result = null;
    this.players = [];
    NodeStorage.storage = [];
    CoordinateService.coordinates = buildIntersections();
    ChainService.drawnSignatures = [];
  }

  static sync(players: Player[]): void {
    this.players = players.filter((player) => player.order === 1 || player.order === 2);
    if (this.phase === "waiting" && this.players.some((player) => player.order === 1) && this.players.some((player) => player.order === 2)) {
      this.phase = "playing";
      this.activeOrder = 1;
    }
  }

  static place(order: Order, x: number, y: number): boolean {
    if (this.phase !== "playing" || order !== this.activeOrder) return false;

    const coordinate = CoordinateService.coordinates.find((item) => item.x === x && item.y === y);
    const player = this.players.find((item) => item.order === order);
    if (!coordinate || coordinate.isTrapped || !player) return false;

    const node = NodeStorage.add(coordinate, player);
    if (!node) return false;

    this.capture(player);

    if (!this.hasFree()) this.finish();
    else this.activeOrder = order === 1 ? 2 : 1;

    return true;
  }

  static requestEnd(order: Order): void {
    if (this.phase !== "playing") return;
    if (!this.endRequests.includes(order)) this.endRequests.push(order);
    if (this.endRequests.includes(1) && this.endRequests.includes(2)) this.finish();
  }

  static snapshot(): GameState {
    return {
      phase: this.phase,
      activeOrder: this.activeOrder,
      storage: (NodeStorage.storage || []).map((node) => ({
        x: node.x,
        y: node.y,
        order: node.player.order,
        isTrapped: node.isTrapped,
      })),
      areas: this.areas.map((area) => ({
        ownerOrder: area.ownerOrder,
        outline: area.outline.map((point) => ({ x: point.x, y: point.y })),
        interior: area.interior.map((point) => ({ x: point.x, y: point.y })),
      })),
      scores: { 1: this.scores[1], 2: this.scores[2] },
      endRequests: [...this.endRequests],
      result: this.result
        ? { scores: { 1: this.result.scores[1], 2: this.result.scores[2] }, winner: this.result.winner }
        : null,
    };
  }

  private static capture(player: Player): void {
    const [added, outlines] = ScoreService.getPlayerScore(player);
    this.scores[player.order] += added;

    outlines.forEach((outline) => {
      const interior = CoordinateService.coordinates
        .filter((coordinate) => strictlyInside(coordinate, outline))
        .map((coordinate) => ({ x: coordinate.x, y: coordinate.y }));
      const imprisoned = (NodeStorage.storage || [])
        .filter((node) => strictlyInside(node, outline))
        .map((node) => ({ x: node.x, y: node.y, order: node.player.order }));
      if (!imprisoned.some((dot) => dot.order !== player.order)) return;
      this.areas.push({ ownerOrder: player.order, outline, interior, imprisoned });
    });
  }

  private static hasFree(): boolean {
    return CoordinateService.coordinates.some((coordinate) => {
      if (coordinate.isTrapped) return false;
      return !(NodeStorage.storage || []).some((node) => node.x === coordinate.x && node.y === coordinate.y);
    });
  }

  private static finish(): void {
    if (this.phase === "ended") return;
    this.phase = "ended";
    this.activeOrder = null;
    const winner = this.scores[1] === this.scores[2] ? "tie" : this.scores[1] > this.scores[2] ? 1 : 2;
    this.result = { scores: { 1: this.scores[1], 2: this.scores[2] }, winner };
  }
}

export default Match;
