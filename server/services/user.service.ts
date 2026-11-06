import Player, { PLAYER_COLOR } from "../../rules/src/players/player";

class UserService {
  static users: Player[] = [];

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
