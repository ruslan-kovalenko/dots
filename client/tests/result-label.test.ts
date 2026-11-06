import { resultLabel } from "../src/result-label";

describe("resultLabel", () => {
  it("renders no winner text when the game has no result", () => {
    expect(resultLabel(null)).toBe("");
  });

  it("names player 1 and shows both scores", () => {
    const text = resultLabel({ scores: { 1: 3, 2: 1 }, winner: 1 });
    expect(text).toContain("Player 1");
    expect(text).toContain("3");
    expect(text).toContain("Player 2");
    expect(text).toContain("1");
    expect(text.toLowerCase()).not.toContain("tie");
  });

  it("names player 2 and shows both scores", () => {
    const text = resultLabel({ scores: { 1: 0, 2: 2 }, winner: 2 });
    expect(text).toContain("Player 2 wins");
    expect(text).toContain("Player 1: 0");
    expect(text).toContain("Player 2: 2");
  });

  it("states a tie and shows both scores", () => {
    const text = resultLabel({ scores: { 1: 4, 2: 4 }, winner: "tie" });
    expect(text.toLowerCase()).toContain("tie");
    expect(text).toContain("Player 1: 4");
    expect(text).toContain("Player 2: 4");
  });
});
