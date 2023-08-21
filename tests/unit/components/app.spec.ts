import { mount } from '@vue/test-utils';
import SocketioService from '@/services/socketio.service';
import { io, Socket } from 'socket.io-client';

const mockSocketService = {
  setupSocketConnection: vi.fn(),
  playerObserver: null,
  socket: io('http://localhost/3000'),
};

vi.doMock('@/services/socketio.service', () => {
  return {
    default: mockSocketService,
  };
});

import App from '@/App.vue';
describe('App.vue', () => {
  it('updates activePlayer when playerObserver is updated', async () => {
    const wrapper = mount(App, {
      provide: {
        socketServiceInstance: mockSocketService,
      },
    });

    const playerData = {
      id: '1',
      order: '2',
      color: 'blue',
    };
    
  //   mockSocketService.socket = io('http://localhost:3000', {
  //     "query": {
  //         "userId": "EOBV5i9zOX8ZNGeZAAAB"
  //     },
  //     "path": "/socket.io",
  //     "hostname": "localhost",
  //     "secure": false,
  //     "port": "3000"
  // });
    wrapper.vm.$emit('register-player', playerData);
    mockSocketService.playerObserver = playerData;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activePlayer).toEqual(playerData);
  });
});
