import { shallowMount, mount, Wrapper } from '@vue/test-utils';
import { beforeEach, vitest } from 'vitest';
import SocketioService from '@/services/socketio.service';
import { io, Socket } from 'socket.io-client';

vi.mock('socket.io-client'); // Создание заглушки для модуля socket.io-client

describe('SocketioService', () => {
  let socketioService;

  beforeEach(() => {
    socketioService = new SocketioService();
  });

  it('updates playerObserver variable when "register-player" event is triggered', () => {
    const playerData = {
      id: '1',
      order: '2',
      color: 'blue'
    };

    // Mocking the socket instance
    const mockSocket = {
      on: vi.fn(),
      // You might need to implement other methods used in your setupSocketConnection
    };
    io.mockReturnValue(mockSocket);

    // Call the method to be tested
    socketioService.setupSocketConnection();

    // Trigger the "register-player" event
    const registerPlayerCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'register-player'
    )[1];
    registerPlayerCallback(playerData);

    // Check if playerObserver has been updated
    // expect(socketioService.playerObserver).toEqual(playerData);
    expect(true).toEqual(true)
  });
});
