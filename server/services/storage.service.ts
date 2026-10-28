import Node from '../types/node';

class StorageService {
  static storagePlayerOne: Node[] = [];
  static storagePlayerTwo: Node[] = [];
  static nodeStorage: Node[] = [];
  
  static combineStorages(): void {
    this.nodeStorage = [...this.storagePlayerOne, ...this.storagePlayerTwo];
  }
}

export default StorageService;