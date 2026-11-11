import { opponentChoiceView } from "../src/opponent-choice";

describe("opponentChoiceView", () => {
  it("offers both opponents to the first player on an empty game", () => {
    const view = opponentChoiceView("waiting", null, 1, false);
    expect(view.choices.map((choice) => choice.label)).toEqual([
      "Play against a person",
      "Play against the computer",
    ]);
    expect(view.note).toBe("");
  });

  it("lets a waiting player switch to the computer", () => {
    const view = opponentChoiceView("waiting", "person", 1, false);
    expect(view.choices.map((choice) => choice.label)).toEqual(["Play against the computer"]);
    expect(view.note).toBe("Waiting for the other player.");
  });

  it("hides the choice once play has started", () => {
    expect(opponentChoiceView("playing", "person", 1, false).choices).toEqual([]);
    expect(opponentChoiceView("playing", "computer", 1, false).choices).toEqual([]);
  });

  it("tells a late arrival that the computer already has the seat", () => {
    const view = opponentChoiceView("waiting", null, null, true);
    expect(view.choices).toEqual([]);
    expect(view.note).toBe("This game is already being played against the computer.");
  });
});
