# Quickstart: Play Against the Computer

Validation for [spec.md](./spec.md). Rules for the fields are in [data-model.md](./data-model.md). Event names are in [contracts/game-socket.md](./contracts/game-socket.md).

## Prerequisites

From the git root:

```
npm install
npm run dev
```

Open `http://127.0.0.1:8080`. The server listens on port 3000.

## Against the computer

1. Open one window. Confirm the two choices are shown and a click on the board adds no dot.
2. Choose "Play against the computer". Confirm Player 1 is red and bold, Player 2 is blue, and the choices are gone.
3. Place one dot. Confirm a blue dot appears on its own and the turn returns to red, within 2 seconds.
4. Build a diamond the computer can close: three blue dots on three straight sides of one red dot, and leave the fourth side empty. On the computer's turn, confirm that red dot is imprisoned, the boundary is the four diagonals, and the blue score increases by one.
5. Build the mirror: three red dots around one blue dot with one side empty, and no capture available to blue. On the computer's turn, confirm blue occupies that empty side and the red score does not increase.
6. Click End game once. Confirm the game ends and shows both totals and the winner or a tie.

## Against a person

1. Restart `npm run dev` so the match is empty.
2. Open two windows. In the first, choose "Play against a person". Confirm it waits and still offers the computer.
3. Focus the second window. Confirm the choice is gone, red moves first, and three dots alternate colors.
4. Click End game in only one window. Confirm play continues and the other window asks for confirmation.
5. Click End game in the second window. Confirm the game ends with both totals.

## A person who arrives too late

1. Start a computer game in one window and place a dot.
2. Open another window. Confirm it shows "This game is already being played against the computer." and that the first window's board does not change.

## Tests

From the git root:

```
npx jest rules/tests/choose-move.test.ts server/tests/computer-game.test.ts client/tests/opponent-choice.test.ts
```

Expected:

- The computer cell imprisons when one placement can, blocks the person's one-cell imprisonment otherwise, and otherwise neighbors the latest dot.
- One socket, `choose-opponent` `"computer"`, then one `send-new-node`, broadcasts two dots and `activeOrder` 1.
- One `send-end-game` in that game broadcasts `phase: "ended"`.
- Two sockets still need two `send-end-game` events.
- The waiting view lists both choices when `opponent` is empty, and only the computer choice while waiting for a person.
