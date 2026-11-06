import type { Player } from "rules";

class PlayerService {
  static player: Player | null = null;
  static rival: Player | null = null;
  static pendingUsers: Player[] | null = null;
  static playerObserver: ((player: Player) => void) | null = null;
  static rivalObserver: ((rival: Player | null) => void) | null = null;

  static setPlayer(player: Player): void {
    this.player = player;
    sessionStorage.setItem("userId", player.id.toString());
    this.playerObserver?.(player);
    if (this.pendingUsers) this.setRival(this.pendingUsers);
  }

  static setRival(users: Player[]): void {
    this.pendingUsers = users;
    if (!this.player) return;
    this.rival = users.find((user) => user.id !== this.player?.id) || null;
    this.rivalObserver?.(this.rival);
  }

  static addPlayerObserver(observer: (player: Player) => void): void {
    this.playerObserver = observer;
  }

  static addRivalObserver(observer: (rival: Player | null) => void): void {
    this.rivalObserver = observer;
  }
}

export default PlayerService;
