import { shallowMount, mount, Wrapper } from '@vue/test-utils';
import { beforeEach, vitest } from 'vitest';
import SocketioService from '@/services/socketio.service';
import { io, Socket } from 'socket.io-client';

vi.mock('socket.io-client');

describe('SocketioService', () => {
  let socketioService;
  let mockSocket;

  beforeEach(() => {
    socketioService = new SocketioService();
    
    mockSocket = {
      on: vi.fn(),
    };
    io.mockReturnValue(mockSocket);

    socketioService.setupSocketConnection();
  });

  it('updates playerObserver variable when "register-player" event is triggered', () => {
    const playerData = {
      id: '1',
      order: '1',
      color: 'blue'
    };

    const registerPlayerCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'register-player'
    )[1];
    registerPlayerCallback(playerData);

    expect(socketioService.playerObserver).toEqual(playerData);
  });
  
  it('updates rivalObserver variable when "users" event is triggered', () => {
    const users = [{
      id: '1',
      order: '1',
      color: 'blue'
    }, {
      id: '2',
      order: '2',
      color: 'red'
    }];
    
    const rival = {
      id: '2',
      order: '2',
      color: 'red'
    };

    socketioService.playerObserver = {
      id: '1',
      order: '1',
      color: 'blue'
    };

    const registerRivalCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'users'
    )[1];
    registerRivalCallback(users);

    expect(socketioService.rivalObserver).toEqual(rival);
  });
  
  it('updates scoreUpdateObserver variable when "get-node-storage" event is triggered', () => {
    const score = {
      storage: [expect.objectContaining({
        x: 2,
        y: 3,
      })],
      playerOneScore: 1,
      playerTwoScore: 0,
      chains: [expect.objectContaining({
        id: new Date(),
        head: expect.objectContaining({
          x: 2,
          y: 3,
        }),
        tail: expect.objectContaining({
          x: 2,
          y: 3,
        })
      })]
    }

    const registerGetNodeStorageCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'get-node-storage'
    )[1];
    registerGetNodeStorageCallback(score);

    expect(socketioService.scoreUpdateObserver).toEqual(score);
  });
  
  it('updates newNodeObserver variable when "get-new-node" event is triggered', () => {
    const newNodeObserver = expect.objectContaining({
      x: 2,
      y: 3,
      player: expect.objectContaining({
        id: '1',
        order: '1',
        color: 'blue'
      }),
      coordinate: expect.objectContaining({
        offsetX: 30,
        offsetY: 45,
        x: 2,
        y: 3,
      })
    })

    const registerGetNewNodeCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'get-new-node'
    )[1];
    registerGetNewNodeCallback(newNodeObserver);

    expect(socketioService.newNodeObserver).toEqual(newNodeObserver);
  });    
});
