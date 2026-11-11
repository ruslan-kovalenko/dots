export type OpponentKind = "person" | "computer" | null;

export interface OpponentChoice {
  id: "person" | "computer";
  label: string;
}

export function opponentChoiceView(
  phase: "waiting" | "playing" | "ended",
  opponent: OpponentKind,
  localOrder: 1 | 2 | null,
  refused: boolean
): { choices: OpponentChoice[]; note: string } {
  if (refused) {
    return { choices: [], note: "This game is already being played against the computer." };
  }
  if (phase !== "waiting" || localOrder !== 1) return { choices: [], note: "" };
  if (opponent === null) {
    return {
      choices: [
        { id: "person", label: "Play against a person" },
        { id: "computer", label: "Play against the computer" },
      ],
      note: "",
    };
  }
  if (opponent === "person") {
    return {
      choices: [{ id: "computer", label: "Play against the computer" }],
      note: "Waiting for the other player.",
    };
  }
  return { choices: [], note: "" };
}
