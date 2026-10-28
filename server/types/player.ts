enum PlayerOrder {
  FirstPlayer = 1,
  SecondPlayer = 2,
}

type Player = {
  id: string;
  order: PlayerOrder;
  color: string;
}

export default Player;