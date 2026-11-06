export interface ShownResult {
  scores: { 1: number; 2: number };
  winner: 1 | 2 | "tie";
}

export function resultLabel(result: ShownResult | null): string {
  if (!result) return "";
  const scores = `Player 1: ${result.scores[1]}. Player 2: ${result.scores[2]}.`;
  if (result.winner === "tie") return `Tie. ${scores}`;
  return `Player ${result.winner} wins. ${scores}`;
}
