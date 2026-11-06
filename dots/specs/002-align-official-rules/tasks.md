---

description: "Task list for aligning Dots rules and upgrading the client to Vue 3"
---

# Tasks: Align Official Dots Rules

**Input**: Design documents from `/specs/002-align-official-rules/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/game-socket.md, quickstart.md

**Tests**: Included. Constitution Principle V requires Jest for every client and server behavior this feature changes, and plan.md names the suites. Write a story's tests first and confirm they fail before that story's implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- Paths are relative to the git root, one level above `dots/`

## Path Conventions

- `rules/` — shared rules workspace (new)
- `client/` — Vue application
- `server/` — socket.io server
- `jest.config.js` and root `package.json` live at the git root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the rules workspace, the Jest runner, and the Vue 3 toolchain

- [X] T001 Create `rules/package.json` (package name `rules`, no runtime dependencies, entry `src/index.ts`) and `rules/tsconfig.json`, and add `rules` to the `workspaces` array in `package.json`
- [X] T002 Add `jest`, `ts-jest`, and `@types/jest` to the root `package.json` devDependencies and create `jest.config.js` that maps the module name `rules` to `rules/src` and collects `rules/tests/**/*.test.ts`, `server/tests/**/*.test.ts`, and `client/tests/**/*.test.ts`
- [X] T003 [P] In `client/package.json` and `client/vite.config.js`, replace `vue` 2.6 with Vue 3, `@vitejs/plugin-vue2` with `@vitejs/plugin-vue` 4.x, and TypeScript 4.1 with TypeScript 5.x; add `sass`; remove `vue-template-compiler`, `@vue/cli-plugin-typescript`, `@vue/test-utils`, `vue-googleapis`, `gapi-script`, `core-js`, `vitest`, `@vitest/ui`, `vitest-canvas-mock`, `jsdom`, `happy-dom`, `canvas`, `sinon`, and `@types/sinon`; point the `build` script at `vite build` and delete the `lint` script; delete `client/jest.config.js`, `client/babel.config.js`, `client/vitest.config.ts`, `client/vitest.setup.ts`, and `client/tests/setup.js`
- [X] T004 [P] Delete `client/tests/unit/services/score.service.spec.ts` and `client/tests/unit/services/socketio.service.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Move the existing chain walk into `rules/` so it runs without a browser, and publish the current board

**⚠️ CRITICAL**: No user story work begins until this phase is complete

- [X] T005 Move `client/src/strategy/`, `client/src/types/chain.ts`, `client/src/types/node.ts`, `client/src/types/coordinate.ts`, `client/src/types/constants.ts`, `client/src/services/node-storage.service.ts`, `client/src/services/coordinate.service.ts`, `client/src/services/chain.service.ts`, `client/src/services/score.service.ts`, `client/src/helpers/sort.ts`, and `client/src/players/player.ts` into the matching paths under `rules/src/` with `git mv`
- [X] T006 Replace every `@/` import in the moved files under `rules/src/` with a relative import, and change `./Coordinate` to `./coordinate` in `rules/src/services/coordinate.service.ts`, `rules/src/services/node-storage.service.ts`, and `rules/src/types/node.ts`
- [X] T007 Delete unused code while keeping the walk: remove `client/src/types/chaining-direction.ts` (already moved or left behind — delete `rules/src/types/chaining-direction.ts`), remove `LookupDirection` from `rules/src/strategy/lookup-direction.ts` while keeping `GeneralDirection`, remove `prev` from `rules/src/types/node.ts`, remove `hasCompleteChains`, `newNode`, and `newNodeObserver` from `rules/src/services/node-storage.service.ts`, remove `setId` from `rules/src/types/chain.ts`, and remove unused imports in `rules/src/types/chain.ts` and `rules/src/strategy/lookup.ts`
- [X] T008 Replace `ctx.isPointInPath` in `rules/src/services/score.service.ts` and `rules/src/services/coordinate.service.ts` with an even-odd test on grid `x, y` over the chain nodes in walk order; an intersection on the polygon boundary is not inside; `markAsTrapped` takes the chain and no longer takes a `Path2D` or a canvas context
- [X] T009 [P] Create `rules/src/board.ts` with the intersection formula now in `client/src/App.vue` `drawGrid`: width 800, height 600, gap 35, `nX = floor(800/35) - 2`, `nY = floor(600/35) - 2`, the same padding, `x` starting at 1, and `y` counting down so the top row is the highest `y`
- [X] T010 Create `rules/src/index.ts` exporting the board, `Lookup`, `ScoreService`, `NodeStorage`, `CoordinateService`, `ChainService`, and the player and node types
- [X] T011 Port `client/tests/unit/services/chain.service.spec.ts` to `rules/tests/chain.service.test.ts` against `rules/src/services/chain.service.ts`, then delete the client spec

**Checkpoint**: `npx jest rules/tests/chain.service.test.ts` passes, and `rules/` imports with no DOM types

---

## Phase 3: User Story 1 - Take turns placing one dot (Priority: P1) 🎯 MVP

**Goal**: The first player to connect places one dot per turn on a free intersection, the players alternate, and a skip does not exist

**Independent Test**: With two players connected and an empty board, place three dots. The first connection placed the first, the second connection placed the second, and no turn changed without a new dot

### Tests for User Story 1

- [X] T012 [P] [US1] Write a failing Jest test in `rules/tests/turns.test.ts`: order 1 is the first joiner and moves first; a placement is refused while `phase` is `waiting`; `activeOrder` is `1` or `2` while `playing` and empty while `waiting`; a placement by the other order, on an occupied intersection, or off the board leaves `storage`, `activeOrder`, and scores unchanged; 20 legal placements on distinct free intersections alternate and add exactly one node each
- [X] T013 [P] [US1] Write a failing Jest test in `server/tests/place-dot.test.ts` that boots socket.io on a random port: the first connection receives `register-player` with `order: 1`; `send-new-node` with `{ x, y }` before the second connection does not change the broadcast `get-node-storage`; a legal `{ x, y }` adds one dot and switches `activeOrder`
- [X] T014 [P] [US1] Write a failing Jest test in `client/tests/board-point.test.ts` for the nearest-intersection mapping used by `client/src/App.vue`: a click within 15 px of an intersection on a canvas whose display size differs from the 800×600 bitmap maps to that intersection's grid `x, y`, and a click farther away maps to nothing

### Implementation for User Story 1

- [X] T015 [US1] Implement `rules/src/match.ts` for placement only: `phase` is `waiting` until both orders exist, then `playing` with `activeOrder` 1; `place` accepts `{ x, y }` only from `activeOrder`, only on an intersection that is unoccupied and not `isTrapped`, then appends one `Node` and switches `activeOrder`; any failure leaves `storage`, `activeOrder`, and scores unchanged; do not run capture yet
- [X] T016 [US1] In `server/server/socket.ts`, accept `send-new-node` as `{ x, y }` only, apply `rules/src/match.ts`, and broadcast `get-node-storage` with `phase`, `activeOrder`, `storage` as `{ x, y, order, isTrapped }`, `scores`, `endRequests`, and `result`; remove `send-player-storage` and `get-new-node`
- [X] T017 [US1] In `server/services/user.service.ts` and `server/server/socket.ts`, keep connection order 1 then 2; on reconnect with the stored `userId`, update that user's socket id and keep the order; `onDisconnect` must not wipe storage, scores, or chains
- [X] T018 [US1] Upgrade the client shell: `client/src/main.ts` uses `createApp(App).mount("#app")`; `client/src/shims-vue.d.ts` uses `DefineComponent`; delete `client/src/shims-tsx.d.ts`; `client/src/App.vue` uses `defineComponent` and `beforeUnmount`, keeps `drawGrid` and `getClosestNodeCoordinates` fed by `rules/src/board.ts`, removes the `gapi-script` import and every call into `ScoreService`, and draws dots only from `get-node-storage`
- [X] T019 [US1] In `client/src/services/socketio.service.ts`, emit `send-new-node` with `{ x, y }` only, drop `send-player-storage` and the `get-new-node` listener, and keep the `userId` connection query in `client/src/services/player.service.ts`

**Checkpoint**: Two windows can alternate single dots. An illegal click does not change the turn. `npx jest rules/tests/turns.test.ts server/tests/place-dot.test.ts client/tests/board-point.test.ts` passes

---

## Phase 4: User Story 2 - Imprison opponent dots with a closed loop (Priority: P2)

**Goal**: A closed one-cell loop imprisons opponent dots, a diagonal step wins over a straight step, the loop is drawn in black, and an empty surround scores nothing

**Independent Test**: Place the four own dots on the four straight sides of one opponent dot. That dot is imprisoned, the drawn boundary is the four diagonals, and the score is 1. A loop around empty intersections does not change the score or create an area

### Tests for User Story 2

- [X] T020 [P] [US2] Write a failing Jest test in `rules/tests/capture.test.ts`: a step of two or more cells is not a link; four own dots on the straight sides of one opponent dot imprison it and the outline is the four diagonal sides; the same diamond is the outline when own dots also occupy the four outer corners; a chain of one-cell straight steps imprisons an opponent dot when no diagonal step exists; a loop around no opponent dot leaves scores and `isTrapped` unchanged; the mover's own dot strictly inside is `isTrapped` and does not increase the score; an imprisoned dot cannot be a step of a later chain; each opponent dot is scored once
- [X] T021 [P] [US2] Write a failing Jest test in `client/tests/paint-game.test.ts`: given a `GameState` area, `client/src/paint-game.ts` strokes a closed black path through `outline` in order and fills with the owner's color at reduced opacity, and an imprisoned dot is drawn in its own color
- [X] T022 [P] [US2] Write a failing Jest test in `server/tests/capture.test.ts`: a `send-new-node` that closes the diamond broadcasts `get-node-storage` whose `areas[0]` has `ownerOrder`, `outline` in walk order, and `interior`, and whose score for the mover increased by the number of newly imprisoned opponent dots

### Implementation for User Story 2

- [X] T023 [P] [US2] In `rules/src/strategy/lookup.ts` `properNodeFromMultiple`, when any candidate step from the chain tail is diagonal, discard the straight candidates first, then keep the existing choice of the smallest Manhattan distance to the chain head
- [X] T024 [P] [US2] In `rules/src/strategy/substrategy/initial-substrategy.ts`, keep the diagonal up-left and up-right starts first; when neither exists, also offer a straight up step (`UpSubstrategy`, clockwise) or a straight right step (`RightSubstrategy`, counterclockwise). `Lookup.starter` still takes the first offered start
- [X] T025 [P] [US2] In `rules/src/strategy/blank-point-helper.ts`, keep refusing a step whose checked neighbor is `isTrapped`; stop refusing a diagonal candidate because an own dot occupies that side; keep that own-dot refusal for straight candidates
- [X] T026 [US2] In `rules/src/services/chain.service.ts`, key `isChainDrawn` on the sorted `x,y` of the chain nodes instead of a timestamp, so the same loop is not scored twice
- [X] T027 [US2] In `rules/src/services/score.service.ts`, call `markAsTrapped`, record the chain, and set `partOfChain` only when at least one opponent node is strictly inside; add only those opponent nodes to the score; mark the mover's own nodes strictly inside `isTrapped` without scoring them; remove `getWinner` and the static `userScore`
- [X] T028 [US2] In `rules/src/match.ts`, after a legal placement run capture for the mover only and append an area `{ ownerOrder, outline, interior, imprisoned }` when the interior contains an opponent node; `outline` is the chain nodes in walk order; do not create an area for an empty interior
- [X] T029 [P] [US2] Implement `client/src/paint-game.ts` to draw each area's `outline` as a closed black line with the owner's color filled at reduced opacity, then draw dots, keeping imprisoned dots in their own color
- [X] T030 [US2] In `server/server/socket.ts`, include `areas` as `{ ownerOrder, outline: [{x, y}], interior: [{x, y}] }` on every `get-node-storage` broadcast
- [X] T031 [US2] In `client/src/App.vue`, paint the board through `client/src/paint-game.ts` from `get-node-storage`, and refuse nothing locally beyond sending the clicked intersection

**Checkpoint**: The diamond capture, the empty surround, and the black outline match `rules/tests/capture.test.ts`, `server/tests/capture.test.ts`, and `client/tests/paint-game.test.ts`

---

## Phase 5: User Story 3 - End the game and name the winner (Priority: P3)

**Goal**: The game ends on a full board or when both players confirm, and the higher imprisoned-dot total wins

**Independent Test**: Finish one game by filling the board and one by both players confirming. Both show the same totals and the same winner, or a tie when the totals are equal

### Tests for User Story 3

- [X] T032 [P] [US3] Write a failing Jest test in `rules/tests/ending.test.ts`: `phase` becomes `ended` when no free intersection remains (occupied or `isTrapped`); one order in `endRequests` leaves `phase` as `playing`; the second distinct order sets `phase` to `ended` and `result` to `{ scores, winner }` where `winner` is `1`, `2`, or `tie`; a later placement or end request does not change `result`
- [X] T033 [P] [US3] Write a failing Jest test in `server/tests/end-game.test.ts`: `send-end-game` from one socket leaves `phase` as `playing`; the other socket's `send-end-game` broadcasts `phase: "ended"` and a `result` whose `scores` equal the imprisoned totals
- [X] T034 [P] [US3] Write a failing Jest test in `client/tests/result-label.test.ts`: a missing `result` renders no winner text; `winner: 1` names player 1; `winner: 2` names player 2; `winner: "tie"` states a tie; both scores are shown

### Implementation for User Story 3

- [X] T035 [US3] In `rules/src/match.ts`, end the match when no free intersection remains, and end it when `endRequests` contains both `1` and `2`; set `result.winner` from `scores`, which are imprisoned opponent dots only; ignore further placements and end requests once `phase` is `ended`
- [X] T036 [US3] In `server/server/socket.ts`, handle `send-end-game` with no payload by recording the sender's order once and broadcasting `get-node-storage`
- [X] T037 [US3] In `client/src/App.vue` and `client/src/services/socketio.service.ts`, show both scores, an end control that emits `send-end-game`, and the winner or tie from `result`; hide the end control once `phase` is `ended`

**Checkpoint**: `npx jest rules/tests/ending.test.ts server/tests/end-game.test.ts client/tests/result-label.test.ts` passes, and a full board and two confirmations report the same comparison

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Phone layout, removal of the client-trusted score path, and the quickstart check

- [X] T038 [P] Add `client/src/styles/game.scss` and use it from `client/src/App.vue` (`<style lang="scss">`): canvases keep bitmap attributes 800 and 600, display at `width: 100%`, `max-width: 800px`, `height: auto`, and the score row plus end control wrap so neither needs horizontal scroll; scale `client/src/App.vue` click offsets by `canvas.width / canvas.clientWidth` and the same for height
- [X] T039 [P] Delete `server/services/score.service.ts`, `server/services/chain.service.ts`, and the client-mirrored files in `server/types/` that this feature no longer imports
- [X] T040 Run `npx jest` and `npm run build -w client` from the git root and fix any failure against `dots/specs/002-align-official-rules/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks every user story
- **User Stories (Phases 3–5)**: Depend on Phase 2. US2's server test needs US1's `send-new-node`. US3 needs US1's match and US2's scores
- **Polish (Phase 6)**: Depends on the stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2. No dependency on US2 or US3
- **User Story 2 (P2)**: The rules tests in `rules/tests/capture.test.ts` need only Phase 2. The socket test needs US1's placement event
- **User Story 3 (P3)**: Needs US1's match and US2's imprisoned-dot scores so the totals are meaningful

### Within Each User Story

- Tests are written and fail before that story's implementation
- `rules/` changes before the server handler that calls them
- The server broadcast before the client paint that reads it

### Parallel Opportunities

- T003 and T004 can run alongside T001–T002
- T009 can run alongside T005–T008
- T012, T013, and T014 can run together
- T020, T021, and T022 can run together
- T023, T024, and T025 can run together
- T032, T033, and T034 can run together
- T038 and T039 can run together

---

## Parallel Example: User Story 2

```bash
# Tests together, after Phase 2:
Task: "T020 rules/tests/capture.test.ts"
Task: "T021 client/tests/paint-game.test.ts"
Task: "T022 server/tests/capture.test.ts"

# Walk edits together, after those tests exist and fail:
Task: "T023 rules/src/strategy/lookup.ts"
Task: "T024 rules/src/strategy/substrategy/initial-substrategy.ts"
Task: "T025 rules/src/strategy/blank-point-helper.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3
3. Stop and validate: two connections alternate one dot each, and an illegal click does not pass the turn

### Incremental Delivery

1. Setup + Foundational → the chain walk lives in `rules/` and still finds loops
2. User Story 1 → turns are real (MVP)
3. User Story 2 → diagonal priority, black outlines, empty surrounds score nothing
4. User Story 3 → full board or two confirmations name the winner
5. Polish → phone layout and the quickstart commands

### Parallel Team Strategy

1. Phase 1 and Phase 2 together
2. Then one person on the rules tests and walk edits (US2), one on the Vue 3 client shell (US1), after T015 exists
3. US3 starts once scores exist

---

## Notes

- [P] tasks touch different files and do not depend on an unfinished task
- Commit after each task or a tight group
- The chain walk, substrategies, and blank-point table stay; T023–T027 are the only behavior edits to them
- Do not add or remove intersections; `rules/src/board.ts` is the only grid formula
