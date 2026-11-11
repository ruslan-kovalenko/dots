---

description: "Task list for choosing a person or the computer and playing the computer's turns"
---

# Tasks: Play Against the Computer

**Input**: Design documents from `/specs/003-play-vs-bot/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/game-socket.md, quickstart.md

**Tests**: Included. Constitution Principle V requires Jest for every client and server behavior this feature changes, and plan.md names the suites. Write a story's tests first and confirm they fail before that story's implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- Paths are relative to the git root, one level above `dots/`

## Path Conventions

- `rules/` — shared rules, including the computer's cell choice
- `client/` — Vue application
- `server/` — socket.io server
- Jest is already configured at the git root. This feature adds no package.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep the current toolchain. The computer uses the capture code already in `rules/`.

- [X] T001 Confirm `jest.config.js` already runs `rules/tests/**/*.test.ts`, `server/tests/**/*.test.ts`, and `client/tests/**/*.test.ts`, and leave every `package.json` dependency list unchanged

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the opponent flag and the computer seat that every story reads

**⚠️ CRITICAL**: No user story work begins until this phase is complete

- [X] T002 [P] In `rules/src/match.ts`, add `opponent` as `null | "person" | "computer"`, set it to `null` in `reset()`, and copy it onto `snapshot()`. Do not change `place` or `requestEnd` in this task
- [X] T003 [P] In `server/services/user.service.ts`, add `seatComputer()` that appends `{ id: "computer", order: 2, color: PLAYER_COLOR[2] }` only when `users` holds order 1 alone. `orderOf` must keep matching socket ids only, so `"computer"` is never returned for a socket

**Checkpoint**: A match can name its opponent, and the computer can occupy order 2 without a connection

---

## Phase 3: User Story 1 - Choose a person or the computer (Priority: P1) 🎯 MVP

**Goal**: The first player chooses before any dot is placed. A second person can still join and play under the current rules.

**Independent Test**: Open one window and confirm both choices show and the board accepts no dot. Choose the computer and confirm the game starts with no second person. Separately, choose a person, join from a second window, and confirm the first player moves first.

### Tests for User Story 1

- [X] T004 [P] [US1] Write a failing Jest test in `client/tests/opponent-choice.test.ts`: while `phase` is `waiting`, the local order is 1, and `opponent` is `null`, the view offers "Play against a person" and "Play against the computer"; while `opponent` is `"person"` and `phase` is still `waiting`, the view offers only "Play against the computer" plus the text "Waiting for the other player."; while `phase` is `playing`, it offers neither choice; a `seat-refused` reason `"computer"` produces the sentence "This game is already being played against the computer."
- [X] T005 [P] [US1] Write a failing Jest test in `server/tests/computer-game.test.ts` using `server/tests/socket-harness.ts`: `choose-opponent` `{ opponent: "person" }` while only order 1 is seated sets `opponent` to `"person"` and leaves `phase` as `waiting`; `choose-opponent` `{ opponent: "computer" }` while only order 1 is seated sets `opponent` to `"computer"`, seats id `"computer"` at order 2, sets `phase` to `playing`, and sets `activeOrder` to 1; a second connection while only order 1 is seated sets `opponent` to `"person"`, sets `phase` to `playing`, and sets `activeOrder` to 1; `choose-opponent` after `phase` is `playing` or `ended` changes nothing; a connection while `"computer"` holds order 2 receives `seat-refused` `{ reason: "computer" }` and does not receive `register-player`

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement `client/src/opponent-choice.ts` so it returns the controls described in T004 from `phase`, `opponent`, and the local order
- [X] T007 [P] [US1] In `rules/src/match.ts`, accept a choice only while `phase` is `waiting` and only order 1 is seated: `"person"` sets `opponent` to `"person"` and leaves `phase` as `waiting`; `"computer"` sets `opponent` to `"computer"`. After `phase` is `playing` or `ended`, the choice changes nothing
- [X] T008 [US1] In `server/server/socket.ts`, handle `choose-opponent` with `{ opponent: "person" | "computer" }` from order 1 only. `"computer"` calls `seatComputer()` and then `Match.sync`. A socket that connects while id `"computer"` is seated receives `seat-refused` `{ reason: "computer" }` and no `register-player`. A second person who connects while only order 1 is seated still becomes order 2, and that join sets `opponent` to `"person"`
- [X] T009 [P] [US1] In `client/src/services/socketio.service.ts`, emit `choose-opponent` with `{ opponent: "person" | "computer" }` and listen for `seat-refused`
- [X] T010 [US1] In `client/src/App.vue`, show the controls from `client/src/opponent-choice.ts` in the existing score column, send `choose-opponent` from those buttons, and show the refusal sentence. Hide the choices once `phase` is `playing`

**Checkpoint**: The first player can start a computer game or wait for a person. The computer does not move yet

---

## Phase 4: User Story 2 - Take a turn against the computer (Priority: P2)

**Goal**: After the person places a legal dot, the computer places one legal dot and the turn returns.

**Independent Test**: Start against the computer, place one dot, and confirm a blue dot appears and it is the person's turn again. Then confirm a one-move capture is taken, and a one-move threat is blocked when no capture is available.

### Tests for User Story 2

- [X] T011 [P] [US2] Write a failing Jest test in `rules/tests/choose-move.test.ts`: the computer chooses a free cell that imprisons the most opponent dots when one placement can imprison any; otherwise it occupies the free cell that would let the person imprison the most computer dots on the next turn; otherwise it chooses a free cell one step, including diagonally, from the latest dot and nearest the board center; otherwise it chooses the free cell nearest the center. Restoring the board after a preview leaves dots, trapped flags, scores, and the turn unchanged
- [X] T012 [P] [US2] Extend `server/tests/computer-game.test.ts`: after `choose-opponent` `"computer"`, one legal `send-new-node` broadcasts two dots, the second with order 2, and `activeOrder` 1. A `send-new-node` from the person while it is order 2's turn leaves the board and `activeOrder` unchanged

### Implementation for User Story 2

- [X] T013 [P] [US2] Implement `rules/src/ai/preview-capture.ts` to save `NodeStorage.storage` (including `isTrapped`, `partOfChain`, and `next`), `CoordinateService.coordinates` (`isTrapped`, `trappedBy`), and `ChainService.drawnSignatures`, call `ScoreService.getPlayerScore` for one pretend dot, return how many opponent dots that call reports, and write the saved bags back. It must not call `Match.place`
- [X] T014 [US2] Implement `rules/src/ai/choose-move.ts` with the priority in T011. Preview a capture only for free cells one grid step from a dot of the player who would capture
- [X] T015 [US2] In `server/server/socket.ts`, after a legal `send-new-node`, when `activeOrder` is 2 and that player id is `"computer"`, place the cell from `choose-move` with `Match.place(2, x, y)` once. If `place` returns false, do not try another cell and do not change the turn again. Broadcast `get-node-storage` after the computer's placement
- [X] T016 [P] [US2] In `client/src/App.vue` `handleClick`, do not emit `send-new-node` unless `activeOrder` equals the local player's order

**Checkpoint**: A person can play alternating turns against the computer, including a capture and a block

---

## Phase 5: User Story 3 - Stop a game against the computer (Priority: P3)

**Goal**: One request stops a computer game. A two-person game still needs both people.

**Independent Test**: Imprison one dot against the computer and click End game once. Confirm the game ends and names the winner. In a two-person game, one End game click leaves play going.

### Tests for User Story 3

- [X] T017 [US3] Extend `server/tests/computer-game.test.ts`: one `send-end-game` from the person while `opponent` is `"computer"` broadcasts `phase: "ended"` and a `result` with both scores and a winner of `1`, `2`, or `"tie"`. With two people, one `send-end-game` leaves `phase` as `playing`, and the second distinct order broadcasts `phase: "ended"`

### Implementation for User Story 3

- [X] T018 [P] [US3] In `rules/src/match.ts` `requestEnd`, when `opponent` is `"computer"` and the requester is order 1, set `phase` to `ended` at once and set `result` from the scores. Do not add order 2 to `endRequests`. The computer never calls `requestEnd`. When `opponent` is `"person"`, one order still leaves `phase` as `playing`, and both orders still end the game
- [X] T019 [P] [US3] In `client/src/end-request.ts` and `client/src/App.vue`, keep the existing End game button while `phase` is `playing` for both opponents. Do not add a second confirmation step for `opponent` `"computer"`; a broadcast with `phase` `"ended"` already shows the winner and hides the button

**Checkpoint**: Stopping against the computer takes one click, and stopping against a person still takes two

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Run the feature's own checks

- [X] T020 Run `npx jest rules/tests/choose-move.test.ts server/tests/computer-game.test.ts client/tests/opponent-choice.test.ts` from the git root, then walk through `dots/specs/003-play-vs-bot/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup and blocks every story
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2 or US3
- **User Story 2 (Phase 4)**: Depends on Foundational. Uses the computer seat from US1 when played in the browser; the Jest suite can seat the computer through `seatComputer()` without the Vue buttons
- **User Story 3 (Phase 5)**: Depends on Foundational. Does not need the computer's cell choice
- **Polish (Phase 6)**: Depends on the stories being present

### User Story Dependencies

- **User Story 1 (P1)**: First player chooses, or a second person joins. MVP
- **User Story 2 (P2)**: The computer answers a move. Independently testable by seating the computer and placing one dot
- **User Story 3 (P3)**: One stop request versus two. Independently testable by setting `opponent` and calling `requestEnd`

### Within Each User Story

- Tests are written and fail before that story's implementation
- The choice and the seat exist before the socket handler broadcasts them
- The preview exists before the cell choice
- The cell choice exists before the server places the computer's dot

### Parallel Opportunities

- T002 and T003 touch different files
- T004 and T005 touch different files
- T006, T007, and T009 touch different files after the US1 tests exist
- T011 and T012 touch different files
- T013 and T016 touch different files
- T018 and T019 touch different files

---

## Parallel Example: User Story 1

```bash
# Tests together:
Task: "Write client/tests/opponent-choice.test.ts"
Task: "Write the choice cases in server/tests/computer-game.test.ts"

# Then the view, the match choice, and the socket emit together:
Task: "Implement client/src/opponent-choice.ts"
Task: "Accept the choice in rules/src/match.ts"
Task: "Emit choose-opponent from client/src/services/socketio.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3
3. Stop and check the choice in one window and a two-person join in two windows

### Incremental Delivery

1. Setup and Foundational
2. User Story 1: the choice and the seat
3. User Story 2: the computer's dots
4. User Story 3: one click ends a computer game, two clicks still end a two-person game
5. Phase 6: the named Jest files and the quickstart

### Parallel Team Strategy

1. Finish Setup and Foundational together
2. Then one person can take the client view while another takes the server choice tests
3. The computer's cell choice can start from Foundational without waiting for the Vue buttons

---

## Notes

- [P] tasks use different files and do not need an unfinished task
- [US1], [US2], and [US3] map to the three stories in spec.md
- Two-person rules stay: order 1 moves first, and both people must confirm an early stop
- The computer id is `"computer"`, order 2, and the second player's blue
- Commit after each task or logical group
- Stop at any checkpoint to check that story on its own
