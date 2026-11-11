import Player, { PLAYER_COLOR } from "../../rules/src/players/player";
import { COMPUTER_ID } from "../../rules/src/match";

class UserService {
  static users: Player[] = [];

  static seatComputer(): Player[] {
    const alone = this.users.length === 1 && this.users[0].order === 1;
    if (alone && !this.users.some((user) => user.id === COMPUTER_ID)) {
      this.users.push({ id: COMPUTER_ID, order: 2, color: PLAYER_COLOR[2] });
    }
    return this.users;
  }

  static addUser(socketId: string, storedId: string): [Player | undefined, Player[]] {
    const existing = storedId ? this.users.find((user) => user.id === storedId) : undefined;
    if (existing) {
      existing.id = socketId;
      return [existing, this.users];
    }

    if (this.users.length >= 2) return [undefined, this.users];

    const order = this.users.length === 0 ? 1 : 2;
    const user: Player = {
      id: socketId,
      order,
      color: PLAYER_COLOR[order],
    };
    this.users.push(user);
    return [user, this.users];
  }

  static orderOf(socketId: string): 1 | 2 | undefined {
    return this.users.find((user) => user.id === socketId)?.order;
  }
}

export default UserService;
