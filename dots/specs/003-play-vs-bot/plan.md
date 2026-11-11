# Implementation Plan: Play Against the Computer

**Branch**: `003-play-vs-bot` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-play-vs-bot/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

The first person to open an empty game chooses a person or the computer before any dot is placed. Choosing a person keeps the current two-person game, including both confirmations to stop. Choosing the computer seats a second player that is not a socket, and the server places that player's dots with the capture rules already in `rules/`. The computer looks one placement ahead: it takes a capture when one placement imprisons opponent dots, otherwise it fills a cell that would let the person imprison a computer dot next, otherwise it plays beside the latest dot. No search library and no second copy of the chain walk.

## Technical Context

**Language/Version**: TypeScript on Node.js. Client UI is Vue 3 with the Options API already in `client/src/App.vue`.

**Primary Dependencies**: Existing `socket.io` on the server and `socket.io-client` on the client. No new dependency. The computer reuses `ScoreService` and `Lookup` in `rules/`.

**Storage**: In memory in the server process, one match per process. The computer is a player record with a fixed id, not a connection. No database.

**Testing**: Jest. `npx jest` from the git root runs `rules/tests`, `server/tests`, and `client/tests`. This feature adds tests in all three.

**Target Platform**: Local play in a desktop or phone browser. Client at `http://127.0.0.1:8080`, server on port 3000, both from one `npm run dev` at the git root.

**Project Type**: npm workspaces web application: `client`, `server`, and the shared `rules` library.

**Performance Goals**: After the person places a dot, the computer's dot is visible within 2 seconds (SC-002). One human placement today already runs the chain walk once. The computer tries only free cells one step from an existing dot, then restores the board, so the wait stays inside that limit on the current board of about 300 intersections.

**Constraints**:

- Two-person play stays: first connection moves first, one dot per turn, both people must confirm before an early stop.
- The chooser is always order 1 (red) and moves first. The computer is always order 2 (blue).
- The computer uses the same placement and capture rules. It does not skip, and it does not place inside a captured area.
- One match per process. A second person cannot take the computer's seat.
- No new package. The chain walk stays the only loop finder.

**Scale/Scope**: One choice on the waiting screen, one computer player, one one-ply choice function. Difficulty levels, rematch, computer-versus-computer, and playing as the second color are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Before Phase 0 | After Phase 1 |
| --- | --- | --- |
| I. Clean code | Pass, if the computer calls the existing capture path and does not grow a second loop finder. | Pass. [research.md](./research.md) previews a cell by running `ScoreService` and restoring the same static bags. `Lookup` is not rewritten. |
| II. Simple UX | Pass, if the only new controls are the two opponent choices, shown where the score already sits, and a computer game still uses the existing End game control. | Pass. [contracts/game-socket.md](./contracts/game-socket.md) adds `choose-opponent` only. The person does not press anything to make the computer move. |
| III. Responsive design | Pass, if the two choices wrap with the score and do not widen the board. | Pass. The buttons sit in the existing `.score` column, which already wraps under the board. The 800×600 bitmap is unchanged. |
| IV. Minimal dependencies | Pass only if no search library and no model runtime are added. | Pass. Technical Context adds nothing. |
| V. Jest for changed client and server code | Pass, if choice visibility, the computer's cell, the computer's reply, and the two endings are Jest tests. | Pass. `rules/tests/choose-move.test.ts`, `server/tests/computer-game.test.ts`, and `client/tests/opponent-choice.test.ts`. |
| Stack: TypeScript, Node.js, WebSocket, SASS, Vue 3 | Pass. The choice is a Vue 3 control and the computer's move is a socket broadcast. | Pass. No new stack. |
| Structure: npm workspaces, one `npm run dev` | Pass. `rules` stays a library. The computer runs inside the server process. | Pass. `npm run dev` still starts client and server only. |

No unjustified gate failure. Phase 0 and Phase 1 may proceed.

## Project Structure

### Documentation (this feature)

```text
dots/specs/003-play-vs-bot/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-socket.md
└── tasks.md             # /speckit-tasks, not this command
```

### Source Code (repository root)

```text
rules/
├── src/ai/choose-move.ts       # one cell from a read-only view of the board
├── src/ai/preview-capture.ts   # run ScoreService for one pretend dot, then restore
├── src/match.ts                # opponent field; one stop request ends a computer game
└── tests/choose-move.test.ts
server/
├── services/user.service.ts    # seat the computer as order 2
├── server/socket.ts            # choose-opponent, then the computer's place
└── tests/computer-game.test.ts
client/
├── src/App.vue                 # the two choices, the refusal sentence
├── src/opponent-choice.ts      # which controls the waiting screen shows
├── src/services/socketio.service.ts
└── tests/opponent-choice.test.ts
```

**Structure Decision**: The computer is a function in `rules/` plus a seat in the existing server match. The client only sends the choice and draws the broadcast, which is how placements already work.

## Complexity Tracking

No constitution violations.
