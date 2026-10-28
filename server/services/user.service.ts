import Player from '../types/player';

class UserService {
  static users: Player[] = [];

  static addUser(socketId: string, localStorageId: string): [Player, Player[]] {
    let user: Player | null = null;
    if (this.users.length < 2) {
      user = { 
        id: socketId,
        order: !this.users.length ? 1 : 2,
        color: !this.users.length ? 'rgba(19, 97, 226, 1)' : 'rgba(228, 23, 71, 1)' 
      };
  
      this.users.push(user);
    }
    else {
      user = this.users.find((user: Player) => user.id === localStorageId);
    }

    return [user, this.users];
  }
}

export default UserService;