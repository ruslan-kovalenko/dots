import Chain from '@/types/chain';
import { io, Socket } from 'socket.io-client';
import NodeStorage from '@/services/node-storage.service';
import Node from '@/types/node';
import Coordinate from '@/types/Coordinate';
import Player from '@/players/player';
import ScoreUpdate from '@/types/score-update';
import CoordinateService from './coordinate.service';

class SocketioService {
  socket: Socket | null;
  playerObserver: Player | null;
  rivalObserver: Player | null;
  nodeStorageObserver: Node[];
  newNodeObserver: Node | null;
  scoreUpdateObserver: ScoreUpdate | null;

  constructor() {
    this.socket = null;
    this.playerObserver = null;
    this.rivalObserver = null;
    this.nodeStorageObserver = [];
    this.newNodeObserver = null;
    this.scoreUpdateObserver = null;
  }

  setupSocketConnection() {
    if (!this.socket) {
      const storageUserId = localStorage.getItem('userId');
      const userPayload = storageUserId ? {
        query: {
          userId: storageUserId
        }
      } : {};

      this.socket = io(process.env.VUE_APP_SOCKET_ENDPOINT, userPayload);

      this.socket.on('register-player', (player: Player) => {
        this.playerObserver = player;
        localStorage.setItem('userId', player.id.toString());
      })

      this.socket.on('users', (users: Player[]) => {
        if (!this.playerObserver) return;

        this.rivalObserver = users.find(user => user.id !== this.playerObserver?.id) || null;
      })

      this.socket.on('get-node-storage', (scoreUpdate: ScoreUpdate) => {
        const { storage } = scoreUpdate;

        NodeStorage.setStorage(storage);
        this.scoreUpdateObserver = scoreUpdate;
      })

      this.socket.on('get-new-node', (node: Node) => {
        this.newNodeObserver = node;
      })
    }
  }

  disconnect() {
    if (!this.socket) return; 

    this.socket.disconnect();
  }

  sendPlayerStorage(player: Player, score: number, chains: Chain[]) {
    const storage = NodeStorage.getActivePlayerNodes(player);

    if (!storage.length || !this.socket) return;

    this.socket.emit('send-player-storage', { storage, score, chains });
  }
  
  sendNewNode(node: Node) {
    if (!this.socket) return;

    this.socket.emit('send-new-node', node);
  }
}

export default SocketioService;