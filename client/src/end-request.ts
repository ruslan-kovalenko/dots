export function endRequestView(
  phase: "waiting" | "playing" | "ended",
  endRequests: (1 | 2)[],
  localOrder: 1 | 2 | null,
  opponent: "person" | "computer" | null = null
): { note: string; canConfirm: boolean } {
  if (phase !== "playing" || localOrder === null) return { note: "", canConfirm: false };
  if (opponent === "computer") return { note: "", canConfirm: true };

  const mine = endRequests.includes(localOrder);
  const other = localOrder === 1 ? 2 : 1;
  const otherAsked = endRequests.includes(other);

  if (mine && !otherAsked) return { note: "Waiting for the other player to confirm", canConfirm: false };
  if (otherAsked && !mine) return { note: `Player ${other} wants to end the game`, canConfirm: true };
  return { note: "", canConfirm: !mine };
}
