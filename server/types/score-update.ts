import Chain from './chain';
import Node from './node';

type ScoreUpdate = {
  storage: Node[];
  score: number;
  chains: Chain[];
}

export default ScoreUpdate;