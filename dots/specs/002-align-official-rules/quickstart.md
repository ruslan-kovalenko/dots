# Quickstart: Align Official Dots Rules

All commands run from the git root (one level above `dots/`).

## Prerequisites

- Node.js and npm.
- `npm install` at the git root after the workspace and dependency changes in [plan.md](./plan.md).

## Automated checks

```bash
npx jest
```

Expected: the suites in `rules/tests`, `server/tests`, and `client/tests` pass. Together they cover:

- turn order from the first connection, and a refused placement leaving the turn unchanged;
- a gap of two cells not linking;
- the four-dot diamond capturing one opponent dot, with a diagonal outline;
- the full eight-dot ring around one opponent dot drawing the inner diamond, not the ring;
- a loop around two adjacent opponent dots using straight steps where no diagonal exists;
- an empty surround leaving scores and areas unchanged;
- imprisoned dots not forming a later loop;
- the mover's own dot inside a scored area becoming imprisoned without adding to the score;
- a full board and two end confirmations both ending the game with the same totals and winner, or a tie;
- the client mapping a click on a scaled canvas to the right intersection, and painting areas with black lines.

```bash
npm run build -w client
```

Expected: Vite builds the Vue 3 client with no Vue 2 packages installed.

## Manual run

```bash
npm run dev
```

Open `http://127.0.0.1:8080` in two browser windows.

1. The first window to connect places the first dot. The second window cannot place until it is its turn.
2. With the blue player, place dots on the four straight neighbors of a red dot. The red dot is imprisoned, a black diamond joins the four blue dots, and blue's score becomes 1.
3. Close a loop around empty intersections. The score does not change and no area appears. Both players can still place dots inside it.
4. Click inside the diamond. Nothing is placed and the turn does not pass.
5. Press the end control in one window. Play continues. Press it in the other window. The game ends and shows both totals and the winner or a tie.
6. Narrow one window to phone width. The board scales down, a click still hits the nearest intersection, and the score and end control are reachable without horizontal scroll.
