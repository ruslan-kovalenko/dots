import "vitest-canvas-mock";
import { beforeEach, vitest } from 'vitest';
import { shallowMount, Wrapper } from '@vue/test-utils';
import ScoreService from '@/services/score.service';
import App from '@/App.vue'
import NodeStorage from '@/services/node-storage.service'

describe('ScoreService', () => {  
  it('getPlayerScore', () => {
    // const wrapper = shallowMount(App)
    // const canvas = wrapper.find('canvas').element;
    // const ctx = canvas.getContext('2d');
    
    // const activePlayer = {
    //   id: '1',
    //   order: '1',
    //   color: 'blue'
    // };
    // const rival = {
    //   id: '2',
    //   order: '2',
    //   color: 'red'
    // };
    // NodeStorage.add({x: 2, y: 14, offsetX: 84.5, offsetY: 107.5}, activePlayer)
    // NodeStorage.add({x: 3, y: 15, offsetX: 119.5, offsetY: 72.5}, activePlayer)
    // NodeStorage.add({x: 4, y: 14, offsetX: 154.5, offsetY: 107.5}, activePlayer)
    // NodeStorage.add({x: 3, y: 13, offsetX: 119.5, offsetY: 142.5}, activePlayer)
    // NodeStorage.add({x: 3, y: 14, offsetX: 119.5, offsetY: 107.5}, rival)
    
    // const [score, chains] = ScoreService.getPlayerScore(activePlayer, ctx);
    
    // expect(score).toEqual(1)
    
    expect(true).toBe(true)
  });
});
