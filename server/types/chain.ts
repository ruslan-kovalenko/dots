type Chain = {  
  id: number | null;
  head: Node | null;
  tail: Node | null;
  activePlayer: Player;
  chained?: boolean;
  length: number;
}

export default Chain;