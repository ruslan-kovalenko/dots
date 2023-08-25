<template>
  <div class="container">
    <div
      id="canvas-container"
      style="position: relative; left: 0; top: 0;"
    >
      <canvas
        id="game-level"
        ref="game-level"
        class="gridCanvas"
        :width="width"
        :height="height"
        style="position: absolute; left: 0; top: 0; z-index: 0;"
      />
      <canvas
        id="temp-level"
        ref="temp-level"
        class="gridCanvas"
        :width="width"
        :height="height"
        style="position: absolute; left: 0; top: 0; z-index: 1;"
      />
    </div>
    <div class="score">
      <div
        v-if="winnerLabel"
        class="winner-label"
      >
        {{ winnerLabel }}
      </div>
      <template v-else>
        <div class="player">
          <span>Player1</span>
          <span> {{ activePlayerScore }} </span>
        </div>
        <div class="player">
          <span>Player2</span>
          <span> {{ rivalPlayerScore }} </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Coordinate from '@/types/coordinate';
import Circle from '@/types/circle';
import Player from '@/players/player';
import Node from '@/types/node';
import constants from './types/constants';
import SocketioService from './services/socketio.service';
import NodeStorage from './services/node-storage.service';
import ScoreService from './services/score.service';
import ScoreUpdate from './types/score-update';
import ChainService from './services/chain.service';
import CoordinateService from './services/coordinate.service';
import Chain from './types/chain';

export default Vue.extend({
  name: 'Dots',
  data() {
    return {
      width: constants.CANVAS_WIDTH,
      height: constants.CANVAS_HEIGHT,
      coordinates: [] as Coordinate[],
      socketServiceInstance: new SocketioService(),
      activePlayer: null as Player | null,
      rivalPlayer: null as Player | null,
      nodeStorage: [] as Node[],
      activePlayerScore: 0 as number,
      rivalPlayerScore: 0 as number,
      winnerLabel: '',
    }
  },
  watch: {
    'socketServiceInstance.playerObserver': {
      handler(player: Player) {
        this.activePlayer = player;
      },
    },
    'socketServiceInstance.rivalObserver': {
      handler(rival: Player) {
        this.rivalPlayer = rival;
      },
    },
    'socketServiceInstance.newNodeObserver': {
      handler(node: Node) {
        this.handleReceivedNewNode(node);

        if (node.player.id !== this.activePlayer?.id) return;

        const gameCanvas = this.$refs['game-level'] as HTMLCanvasElement;
        const ctx = gameCanvas.getContext('2d');

        if (!this.activePlayer || !this.rivalPlayer || !ctx) return;

        const [currentPlayerScore, chains] = ScoreService.getPlayerScore(this.activePlayer, ctx);

        this.socketServiceInstance.sendPlayerStorage(
          this.activePlayer,
          currentPlayerScore,
          chains
        );
      },
      deep: true
    },
    'socketServiceInstance.scoreUpdateObserver': {
      handler(scoreUpdate: ScoreUpdate) {
        const { playerOneScore, playerTwoScore } = scoreUpdate;
        this.activePlayerScore = playerOneScore;
        this.rivalPlayerScore = playerTwoScore;

        this.drawChainsForOwnTrappedNodes(scoreUpdate);
        this.endgameCheck();
      },
      deep: true
    }
  },
  created(): void {
    this.socketServiceInstance.setupSocketConnection();
  },
  mounted(): void {
    this.$refs['temp-level'].addEventListener('mousemove', this.handleMouseMove, false);
    this.$refs['temp-level'].addEventListener('click', this.handleClick, false);
    
    this.drawGrid();
  },
  beforeDestroy() {
    this.socketServiceInstance.disconnect();
  },
  methods: {
    endgameCheck(): void {
      if (!this.activePlayer || !this.rivalPlayer) return;

      const trappedByActive = CoordinateService.trappedBy(this.activePlayer).length;
      const trappedByRival = CoordinateService.trappedBy(this.rivalPlayer).length;
      
      const winnerLabel = ScoreService.getWinner(trappedByActive, trappedByRival);
      
      if (typeof winnerLabel === 'string') {
        this.winnerLabel = winnerLabel;
      }
    },
    drawChainsForOwnTrappedNodes(scoreUpdate: ScoreUpdate): void {
      const { chains } = scoreUpdate;

      if (!chains.length || !this.activePlayer || !this.rivalPlayer) return;

      const rivalChains = ChainService.getRivalChains(chains, this.activePlayer, this.rivalPlayer);
      const myNodes = NodeStorage.getActivePlayerNodes(this.activePlayer);
      const gameCanvas = this.$refs['game-level'] as HTMLCanvasElement;
      const ctx = gameCanvas.getContext('2d');

      rivalChains.forEach((chain: Chain) => {
        if (chain.activePlayer.id === this.activePlayer?.id) return;

        ScoreService.getSurroundedRivalNodesAmount(chain, myNodes, ctx!);
      });
    },
    handleReceivedNewNode(node: Node): void {
      const gameCanvas = this.$refs['game-level'] as HTMLCanvasElement;
      const ctx = gameCanvas.getContext('2d');

      if (!gameCanvas || !ctx || !this.activePlayer || !node.coordinate) return;

      this.drawCircle({
        context: ctx,
        radius: 10,
        fill: node.player.color,
        node: node.coordinate
      });
    },
    drawGrid(): void {
      let ctx = (this.$refs['game-level'] as HTMLCanvasElement).getContext('2d');

      if (!ctx) return;

      let s = constants.PIXEL_GAP;
      let nX = Math.floor(this.width / s) - 2;
      let nY = Math.floor(this.height / s) - 2;
      let pX = this.width - nX * s;
      let pY = this.height - nY * s;
      
      let pL = Math.ceil(pX / 2) - 0.5;
      let pT = Math.ceil(pY / 2) - 0.5;
      let pR = this.width - nX * s - pL;
      let pB = this.height - nY * s - pT;

      ctx.strokeStyle = 'lightgrey';
      ctx.beginPath();

      const xArray: number[] = [];
      const yArray: number[] = [];
      for (let x = pL; x <= this.width - pR; x += s) {
          xArray.push(x);
          ctx.moveTo(x, pT)
          ctx.lineTo(x, this.height - pB)
      }
      for (let y = pT; y <= this.height - pB; y += s) {
          yArray.push(y);
          ctx.moveTo(pL, y)
          ctx.lineTo(this.width - pR, y)
      }

      const coordinates: Coordinate[] = [];

      for (let i = 0; i < xArray.length; i++) {
        let offsetX = xArray[i];
        for (let j = 0, y = yArray.length; j < yArray.length; j++, y--) {
          let offsetY = yArray[j];
          coordinates.push({ offsetX, offsetY, x: i + 1, y, isTrapped: false, trappedBy: null });
        }
      }

      this.coordinates = coordinates;
      CoordinateService.coordinates = coordinates;

      ctx.stroke();
    },
    getClosestNodeCoordinates(offsetX: number, offsetY: number): Coordinate | undefined {
      if (!this.coordinates.length) return;

      const deviation = 15;
      const candidate = this.coordinates.find((coordinate: Coordinate) => {
        if (Math.abs(coordinate.offsetY - offsetY) <= deviation && 
            Math.abs(coordinate.offsetX - offsetX) <= deviation) return coordinate;
      });

      return candidate;
    },
    drawCircle(circle: Circle): void {
      const { node, context, radius, fill } = circle;
      context.beginPath();
      context.arc(node.offsetX, node.offsetY, radius, 0, 2 * Math.PI, false);

      if (fill) {
        context.fillStyle = fill;
        context.fill();
      }
    },
    handleMouseMove(args: MouseEvent): void {
      const { offsetX, offsetY } = args;
      const clothestNodeCoordinates = this.getClosestNodeCoordinates(offsetX, offsetY);
      const tempCanvas = (this.$refs['temp-level'] as HTMLCanvasElement);

      if (!tempCanvas) return;

      let ctx = tempCanvas.getContext('2d');

      if (!clothestNodeCoordinates || !tempCanvas || !ctx || !this.activePlayer) return;

      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      this.drawCircle({
        context: ctx,
        radius: 10,
        fill: this.activePlayer.color.replace('1)', '0.5)'),
        node: clothestNodeCoordinates
      });
    },
    handleClick(args: MouseEvent): void {
      if (!this.activePlayer) return;

      const { offsetX, offsetY } = args;      
      const coordinates = this.getClosestNodeCoordinates(offsetX, offsetY);

      if (!coordinates || coordinates.isTrapped) return;

      const node = NodeStorage.add(coordinates, this.activePlayer);

      if (!node) return;

      this.socketServiceInstance.sendNewNode(node);
    }
  }
})
</script>

<style scoped>
  .container {
    display: flex;
    justify-content: space-between;
    width: 70%;
  }

	.gridCanvas {
		border: lightgrey 1px solid;
		border-radius: 5px;
		box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
	}
  
  .score {
    border: 1px solid rgb(180, 178, 178);
    border-radius: 5px;
    width: 300px;
    height: 150px;
    padding: 25px 0px 0px 25px;
    font-size: 24px;
    font-family: monospace;
  }
  
  .winner-label {
    padding-top: 2.7rem;
  }
  
  .player:first-child {
    padding-bottom: 7px;
    padding-top: 26px;
  }
</style>
