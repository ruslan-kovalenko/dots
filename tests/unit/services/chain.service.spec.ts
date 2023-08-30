import { beforeEach, vitest } from 'vitest';
import ChainService from '@/services/chain.service';

describe('ChainService', () => {  
  it('getRivalChains', () => {
    const chains = [{
      id: 123456,
      head: {
        x: 2,
        y: 3,
      },
      tail: {
        x: 2,
        y: 3,
      },
      activePlayer: {
        id: '1',
        order: '1',
        color: 'blue'
      }
    }, {
      id: 345678,
      head: {
        x: 10,
        y: 11,
      },
      tail: {
        x: 10,
        y: 11,
      },
      activePlayer: {
        id: '2',
        order: '2',
        color: 'red'
      }
    }];
    const player = {
      id: '1',
      order: '1',
      color: 'blue'
    };
    const rival = {
      id: '2',
      order: '2',
      color: 'red'
    }
    
    const result = ChainService.getRivalChains(chains, player, rival);

    expect(result).toEqual([{
      id: 345678,
      head: {
        x: 10,
        y: 11,
      },
      tail: {
        x: 10,
        y: 11,
      },
      activePlayer: {
        id: '2',
        order: '2',
        color: 'red'
      }
    }])
    
  });
  
  it('isChainDrawn', () => {
    ChainService.drawnChainIds = [1, 2, 3, 4];
    
    const result = ChainService.isChainDrawn(3);
    
    expect(result).toBe(true)
  });
});
