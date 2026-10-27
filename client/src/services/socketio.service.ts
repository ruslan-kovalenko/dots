import Chain from '@/types/chain';
import { io, Socket } from 'socket.io-client';
import NodeStorage from '@/services/node-storage.service';
import Node from '@/types/node';
import Coordinate from '@/types/Coordinate';
import Player from '@/players/player';
import ScoreUpdate from '@/types/score-update';
import CoordinateService from './coordinate.service';
import PlayerService from './player.service';
import ScoreService from './score.service';

class SocketioService {
  private static instance: SocketioService;
  private socket: Socket | null = null;

  private constructor() {
    this.socket = null;
  }

  static getInstance(): SocketioService {
    if (!SocketioService.instance) {
      SocketioService.instance = new SocketioService();
    }
    return SocketioService.instance;
  }

  setupSocketConnection() {
    if (!this.socket) {
      const storageUserId = localStorage.getItem('userId');
      const userPayload = storageUserId ? {
        query: {
          userId: storageUserId
        }
      } : {};

      this.socket = io(import.meta.env.VITE_SOCKET_ENDPOINT, userPayload);
      this.socket.on('register-player', (player: Player) => {
        PlayerService.setPlayer(player);
      })

      this.socket.on('users', (users: Player[]) => {
        PlayerService.setRival(users);
      })

      this.socket.on('get-node-storage', (scoreUpdate: ScoreUpdate) => {
        const { storage } = scoreUpdate;

        NodeStorage.setStorage(storage);
        ScoreService.setScoreUpdate(scoreUpdate);
      })

      this.socket.on('get-new-node', (node: Node) => {
        NodeStorage.setNewNode(node);
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