<template>
  <div class="container">
    <div class="board">
      <canvas
        id="game-level"
        ref="gameLevel"
        class="gridCanvas"
        :width="width"
        :height="height"
      />
      <canvas
        id="temp-level"
        ref="tempLevel"
        class="gridCanvas overlay"
        :width="width"
        :height="height"
        @mousemove="handleMouseMove"
        @click="handleClick"
      />
    </div>
    <div class="score">
      <div
        class="player"
        :class="{ turn: activeOrder === 1 }"
      >
        <span class="swatch red" />
        <span>Player 1</span>
        <span>{{ scores[1] }}</span>
      </div>
      <div
        class="player"
        :class="{ turn: activeOrder === 2 }"
      >
        <span class="swatch blue" />
        <span>Player 2</span>
        <span>{{ scores[2] }}</span>
      </div>
      <div
        v-if="winnerText"
        class="winner-label"
      >
        {{ winnerText }}
      </div>
      <p
        v-if="endStatus.note"
        class="end-note"
      >
        {{ endStatus.note }}
      </p>
      <button
        v-if="endStatus.canConfirm"
        class="end-game"
        type="button"
        @click="endGame"
      >
        End game
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { buildIntersections } from "rules";
import type { GameState, Player } from "rules";
import { eventToBitmap, nearestIntersection } from "./board-point";
import { endRequestView } from "./end-request";
import { paintGame, PLAYER_COLORS } from "./paint-game";
import { resultLabel } from "./result-label";
import SocketioService from "./services/socketio.service";
import PlayerService from "./services/player.service";

export default defineComponent({
  name: "Dots",
  data() {
    return {
      width: 800,
      height: 600,
      coordinates: buildIntersections(),
      socketServiceInstance: SocketioService.getInstance(),
      activePlayer: null as Player | null,
      phase: "waiting" as GameState["phase"],
      activeOrder: null as GameState["activeOrder"],
      scores: { 1: 0, 2: 0 } as GameState["scores"],
      endRequests: [] as GameState["endRequests"],
      areas: [] as GameState["areas"],
      dots: [] as GameState["storage"],
      winnerText: "",
    };
  },
  created(): void {
    PlayerService.addPlayerObserver(this.activePlayerHandler);
    this.socketServiceInstance.setupSocketConnection(this.stateHandler);
  },
  mounted(): void {
    this.drawGrid();
  },
  beforeUnmount(): void {
    this.socketServiceInstance.disconnect();
  },
  computed: {
    endStatus(): { note: string; canConfirm: boolean } {
      return endRequestView(this.phase, this.endRequests, this.activePlayer?.order ?? null);
    },
  },
  methods: {
    activePlayerHandler(player: Player): void {
      this.activePlayer = player;
    },
    stateHandler(state: GameState): void {
      this.phase = state.phase;
      this.activeOrder = state.activeOrder;
      this.scores = state.scores;
      this.endRequests = state.endRequests;
      this.areas = state.areas;
      this.dots = state.storage;
      this.winnerText = resultLabel(state.result);
      this.draw();
    },
    drawGrid(): void {
      this.coordinates = buildIntersections();
      this.draw();
    },
    getClosestNodeCoordinates(bitmapX: number, bitmapY: number) {
      return nearestIntersection(bitmapX, bitmapY, this.coordinates);
    },
    draw(): void {
      const canvas = this.$refs.gameLevel as HTMLCanvasElement | undefined;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      paintGame(ctx, this.coordinates, this.dots, this.areas);
    },
    bitmapPoint(args: MouseEvent): { x: number; y: number } | undefined {
      const canvas = args.currentTarget as HTMLCanvasElement | null;
      if (!canvas || !canvas.clientWidth || !canvas.clientHeight) return;
      return eventToBitmap(args.offsetX, args.offsetY, canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight);
    },
    handleMouseMove(args: MouseEvent): void {
      const tempCanvas = this.$refs.tempLevel as HTMLCanvasElement | undefined;
      const ctx = tempCanvas?.getContext("2d");
      if (!tempCanvas || !ctx) return;
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      const bitmap = this.bitmapPoint(args);
      if (!bitmap || !this.activePlayer || this.phase !== "playing") return;
      const closest = this.getClosestNodeCoordinates(bitmap.x, bitmap.y);
      if (!closest) return;
      ctx.beginPath();
      ctx.arc(closest.offsetX, closest.offsetY, 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = PLAYER_COLORS[this.activePlayer.order].replace(/,\s*[\d.]+\)$/, ", 0.45)");
      ctx.fill();
    },
    handleClick(args: MouseEvent): void {
      const bitmap = this.bitmapPoint(args);
      if (!bitmap) return;
      const closest = this.getClosestNodeCoordinates(bitmap.x, bitmap.y);
      if (!closest) return;
      this.socketServiceInstance.sendNewNode(closest.x, closest.y);
    },
    endGame(): void {
      this.socketServiceInstance.sendEndGame();
    },
  },
});
</script>

<style lang="scss">
@use "./styles/game.scss";

body {
  margin: 8px;
  background: #fff;
  color: #1a1a1a;
}
</style>
