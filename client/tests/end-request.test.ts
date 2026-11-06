import { endRequestView } from "../src/end-request";

describe("endRequestView", () => {
  it("lets either player ask first and shows nothing until they do", () => {
    expect(endRequestView("playing", [], 1)).toEqual({ note: "", canConfirm: true });
    expect(endRequestView("playing", [], 2)).toEqual({ note: "", canConfirm: true });
  });

  it("keeps the game open after player 1 asks and tells player 2 to confirm", () => {
    expect(endRequestView("playing", [1], 1)).toEqual({
      note: "Waiting for the other player to confirm",
      canConfirm: false,
    });
    expect(endRequestView("playing", [1], 2)).toEqual({
      note: "Player 1 wants to end the game",
      canConfirm: true,
    });
  });

  it("keeps the game open after player 2 asks and tells player 1 to confirm", () => {
    expect(endRequestView("playing", [2], 2)).toEqual({
      note: "Waiting for the other player to confirm",
      canConfirm: false,
    });
    expect(endRequestView("playing", [2], 1)).toEqual({
      note: "Player 2 wants to end the game",
      canConfirm: true,
    });
  });

  it("hides the control once the game is not in play", () => {
    expect(endRequestView("waiting", [], 1).canConfirm).toBe(false);
    expect(endRequestView("ended", [1, 2], 1).canConfirm).toBe(false);
    expect(endRequestView("playing", [], null).canConfirm).toBe(false);
  });
});
