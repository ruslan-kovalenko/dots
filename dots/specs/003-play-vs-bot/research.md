# Research: Play Against the Computer

## Decision: The computer is a one-ply rule over the existing capture, not a search and not a model

**Decision**: `rules/src/ai/choose-move.ts` returns one free cell for order 2. It does not learn, and it does not look more than one placement ahead. Priority, from [spec.md](./spec.md) FR-008:

1. A free cell where one computer placement imprisons one or more of the person's dots. Among those, the cell that imprisons the most, then the cell nearest the center of the board.
2. Otherwise a free cell the person could use on the next turn to imprison one or more computer dots. Among those, the cell that would imprison the most, then nearest the center.
3. Otherwise a free cell one step (including diagonally) from the latest dot. Among those, nearest the center.
4. Otherwise the free cell nearest the center.

A cell can close a loop only when it is one grid step from a dot of the player who would capture. Cells farther away are not previewed for priorities 1 and 2.

**Rationale**: The board has about 300 intersections, so a deep search is a poor first computer, and the spec forbids difficulty levels and several-move search. The required behavior is fully decided by one imaginary placement. A language model does not know which cell is legal. A neural net has no recorded games to train on.

**Alternatives considered**:

- Minimax or Monte Carlo search. Rejected because the spec stops at one placement, and each trial mutates the shared rules state.
- A model served from an API. Rejected because it adds a dependency, a network hop, and no guarantee the cell is a legal intersection.
- Random legal cell. Rejected because FR-008 requires the capture and the block.

## Decision: Preview a cell by running ScoreService, then restore the static bags

**Decision**: `rules/src/ai/preview-capture.ts` answers "how many opponent dots would this one cell imprison?" It saves `NodeStorage.storage` (including `isTrapped`, `partOfChain`, and `next` on each node), `CoordinateService.coordinates` (`isTrapped`, `trappedBy`), and `ChainService.drawnSignatures`. It adds the pretend dot, calls `ScoreService.getPlayerScore` for that player, reads the returned count, and writes the saved bags back. It does not call `Match.place`, so phase, turn, scores, and areas stay as they were.

**Rationale**: `ScoreService.captureChain` is the capture the product already uses, and it writes those bags as it goes. Calling it is the only way to honor a loop the chain walk would really draw, including a straight rectangle, without a second loop finder. Restoring the bags keeps the preview from becoming a real move. Constitution I forbids a parallel implementation of the walk.

**Alternatives considered**:

- Detect only the four-side diamond. Rejected because FR-008 is any one-placement imprisonment, and a straight loop is a legal capture today.
- Clone `Match` into a pure value. Rejected because `Lookup`, `NodeStorage`, `CoordinateService`, and `ChainService` are process-wide statics. A clone would be a rewrite of the walk.
- Call `Match.place` and then undo the turn. Rejected because `place` also switches `activeOrder`, appends areas, and finishes a full board. A failed undo would corrupt the person's game.

## Decision: The computer is a player record, not a connection

**Decision**: `UserService` grows `seatComputer()`. It appends `{ id: "computer", order: 2, color: PLAYER_COLOR[2] }` when `users.length === 1` and the only user is order 1. `orderOf` keeps matching socket ids only, so a browser cannot act as the computer. `users.length >= 2` still rejects a later person. The computer is not removed on disconnect.

**Rationale**: `Match.sync` already starts play when both orders exist, and `Match.place` already checks the active order. Seating the computer as order 2 reuses both. A fixed id survives the person's refresh, because a refresh only replaces the person's socket id.

**Alternatives considered**:

- A second socket.io client inside the server. Rejected because it is a second connection for a participant that never has a window.
- Let the browser compute the computer's cell. Rejected because the server is the authority for placement and the two browsers would be able to disagree.

## Decision: The choice is one event, and a second person still joins the old way

**Decision**: The first player sends `choose-opponent` with `{ opponent: "person" | "computer" }` only while the phase is `waiting` and only order 1 is seated. `"person"` stores the choice and leaves the phase waiting. `"computer"` calls `seatComputer()` and `Match.sync`. A second connection, while only order 1 exists, still becomes order 2 and starts a two-person game, whether or not a choice was stored. That is the current join, and it covers FR-004.

**Rationale**: The product already starts a two-person game when the second socket connects. The choice is an extra path, not a replacement. Keeping the join path means two windows still work if the second person arrives before the first clicks.

**Alternatives considered**:

- Require the first player to click "Play against a person" before the second window can sit. Rejected because FR-004 says a second person who arrives first settles the match as two people.
- Start the computer by default. Rejected because the spec requires the choice, and two-person play must remain.

## Decision: One stop request ends a computer game inside Match.requestEnd

**Decision**: `Match` records `opponent: "person" | "computer" | null`. `requestEnd` from the seated person finishes immediately when `opponent === "computer"`. It still records that person's order. It does not add order 2. Two people still need both orders in `endRequests`. The computer never calls `requestEnd`.

**Rationale**: FR-010 and FR-011 differ only by who the opponent is. The end screen already reads `result`, so the client does not need a second ending path.

**Alternatives considered**:

- Have the server emit a second `send-end-game` for the computer. Rejected because the computer would appear to ask to stop on its own, which FR-010 forbids.
- End a computer game from the client without the server. Rejected because the server is the authority for ending.
