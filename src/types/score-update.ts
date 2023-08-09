import Chain from './chain';
import Node from './node';

type ScoreUpdate = {
  storage: Node[];
  playerOneScore: number;
  playerTwoScore: number;
  chains: Chain[];
}

export default ScoreUpdate;