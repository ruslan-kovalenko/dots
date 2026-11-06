type Player = {
  id: string;
  order: 1 | 2;
  color: string;
};

export const PLAYER_COLOR: Record<1 | 2, string> = {
  1: "rgba(228, 23, 71, 1)",
  2: "rgba(19, 97, 226, 1)",
};

export default Player;
