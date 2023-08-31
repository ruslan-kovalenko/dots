import Player from '@/players/player';

class PlayerService {
  static player: Player | null = null;
  static rival: Player | null = null;
  static playerObserver: Function;
  static rivalObserver: Function;

  static setPlayer(player: Player): void {
    this.player = player;
    localStorage.setItem('userId', player.id.toString());
    this.playerObserver(player);
  }

  static setRival(users: Player[]): void {
    this.rival = users.find(user => user.id !== this.player.id) || null;
    this.rivalObserver(this.rival);
  }
  
  static addPlayerObserver(observer: Function): void {
    this.playerObserver = observer;
  }

  static addRivalObserver(observer: Function): void {
    this.rivalObserver = observer;
  }
}

export default PlayerService;