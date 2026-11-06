# Research: Align Official Dots Rules

## Decision: Keep the chain walk as the loop finder and move it into a shared `rules` workspace

**Decision**: Move these files from `client/src/` into `rules/src/` with `git mv` and keep their algorithm:

- `strategy/lookup.ts`, `strategy/blank-point-helper.ts`, `strategy/substrategy/*`
- `types/chain.ts`, `types/node.ts`, `types/coordinate.ts`, `types/constants.ts`
- `services/node-storage.service.ts`, `services/coordinate.service.ts`, `services/chain.service.ts`
- the scoring loop of `services/score.service.ts`
- `helpers/sort.ts`, `players/player.ts`

The server calls them after each legal placement for the mover only. The client no longer calls them.

**Rationale**: The user asked to keep the surround algorithms. The walk already meets three of the rules:

- It only steps to a neighbor exactly one cell away vertically, horizontally, or diagonally (FR-008).
- It closes when the chosen candidate is the head.
- It skips imprisoned own dots, because `getActivePlayerUntrappedNodes` filters `isTrapped`.

What ties it to the client is the canvas test for "inside" and the `@/` alias. Neither is part of the walk itself. Running it only on the server stops the two clients from scoring differently and stops the server from trusting a score that a client sends.

**Alternatives considered**:

- Replace the walk with a flood fill from the board edge. Rejected because it discards the algorithm the user asked to keep.
- Keep scoring on each client and add turn checks on the server. Rejected because each client would still compute captures on its own canvas, and the server would still store a client's score.

## Decision: Prefer diagonal candidates, then the existing nearest-to-head rule

**Decision**: In `Lookup.properNodeFromMultiple`, first keep only the candidates whose step from the chain tail is diagonal, if any exist. Then apply the existing Manhattan-distance-to-head choice among the remaining candidates. A straight candidate is chosen only when no diagonal candidate exists.

**Rationale**: FR-009 says the diagonal is the boundary when both a diagonal and a straight step could bound the same opponent dots. Today the walk picks the candidate nearest the head and never prefers a diagonal. Filtering first and keeping the old tie-break changes one method and leaves every substrategy alone.

**Alternatives considered**:

- Reorder the candidate lists inside each substrategy. Rejected because the choice happens in `properNodeFromMultiple`, not in list order.
- Run every possible loop and keep the one with the most diagonals. Rejected because the walk is greedy by design, and a full enumeration is a rewrite.

## Decision: Allow a straight first step when no diagonal start exists

**Decision**: `InitialSubstrategy` keeps its two diagonal-up starts first: up-left gives `LeftUpSubstrategy` and up-right gives `UpRightSubstrategy`. When neither exists for a start node, it may also offer a straight up step (`UpSubstrategy`, clockwise) or a straight right step (`RightSubstrategy`, counterclockwise). `Lookup.starter` keeps taking the first offered start, so a diagonal start still wins whenever one exists.

**Rationale**: FR-010 keeps straight steps valid when no diagonal is available. Today a loop can only start with a diagonal up step. A chain whose lowest dots only have straight neighbors upward can never begin.

**Alternatives considered**: Allow all eight first steps. Rejected because six of them only find the same loops again from a different dot, and they add nothing to the rule.

## Decision: The blank-point check keeps the territory veto and drops the own-dot veto for diagonal steps

**Decision**: `BlankPointHelper` keeps its direction table. Its check against `CoordinateService.getTrappedByCoordinates` stays: a step that would hug captured territory is still refused. Its check for an own dot on that side no longer refuses a **diagonal** candidate. It still applies to straight candidates.

**Rationale**: With the full eight-dot ring around one opponent dot, the diagonal start from the bottom middle dot has an own dot directly beneath it, so today that diagonal is refused. FR-009 and the spec edge case require the inner diamond there. The own-dot veto exists to keep the walk on one side of a straight wall. A diagonal step already cuts that corner, so the veto contradicts diagonal priority only for diagonal steps.

**Alternatives considered**: Delete `BlankPointHelper`. Rejected because its territory check is what stops a later loop from running along an imprisoned area, which FR-014 needs.

## Decision: "Inside" is a pure grid test on the same polygon, strictly inside only

**Decision**:

- Replace `ctx.isPointInPath(path, offsetX, offsetY)` in `ScoreService.detectTrappedRivalsAmount` and in `CoordinateService.markAsTrapped` with a pure even-odd point-in-polygon test. It runs on grid `x, y`, over the chain nodes in walk order.
- An intersection that lies on the polygon boundary is not inside.
- `markAsTrapped` keeps its name and its effect of setting `isTrapped` and `trappedBy` on coordinates. It now takes the chain instead of a `Path2D` and a context.

**Rationale**:

- The algorithm already defines the area as the polygon through the chain dots. Only the test was tied to pixels.
- `isPointInPath` leaves it to the implementation whether a point on the boundary counts as inside. Boundary dots must stay in play (FR-014).
- A pure test runs on the server and in Jest without a DOM.

**Alternatives considered**: Keep `isPointInPath` on the server with a canvas package. Rejected because it adds a native dependency for a check the language can do, and it keeps the boundary ambiguity.

## Decision: An empty loop is not a capture

**Decision**: In `ScoreService.getTrappedFromDrawnChain`, call `markAsTrapped`, record the chain in `ChainService`, and flag the chain nodes with `NodeStorage.flagChainNodes` only when at least one opponent dot is strictly inside. Opponent dots and the mover's own dots strictly inside become `isTrapped`. Only opponent dots add to the score. An empty loop changes nothing: the dot stays and the turn passes.

**Rationale**: Today `markAsTrapped` runs even when nothing was captured. That marks empty territory as taken, blocks clicks there, and counts toward the area-based winner. FR-013 forbids this.

**Alternatives considered**: Refuse the placement that closes an empty loop. Rejected because passing is forbidden and a free intersection must accept a dot.

## Decision: A drawn chain is identified by its dots, not by a timestamp

**Decision**: `ChainService.isChainDrawn` keeps its name and its job. It keys on a stable signature (the sorted `x,y` of the chain dots) instead of `Chain.setId()`'s `Date.now()` value. `Chain.setId` is removed.

**Rationale**:

- The walk runs again from every free own dot after each placement, so the same loop is found again.
- Two chains created in the same millisecond can share a timestamp id.
- A score must not be added twice for the same loop.

**Alternatives considered**: Keep the timestamp and compare outlines elsewhere. Rejected because the check already lives in `ChainService`.

## Decision: Score and winner are imprisoned opponent dots

**Decision**:

- Remove `ScoreService.getWinner`. It declared a winner when a player's trapped area exceeded half the board.
- Remove the static running `userScore` that the client sent to the server.
- The match keeps one score per player, which is the count of opponent dots imprisoned by that player's loops.
- At the end the higher score wins, and equal scores are a tie.

**Rationale**: FR-017 defines the winner by imprisoned opponent dots. Area is not the score.

**Alternatives considered**: None that the spec allows.

## Decision: The server is the authority for turn, placement, and ending

**Decision**:

- `UserService.addUser` is kept. The first connection becomes order 1 and moves first; the second becomes order 2.
- Play starts when both orders exist.
- `send-new-node` now carries only `{x, y}`. The server refuses it, and the turn does not change, when:
  - the game is not playing,
  - the sender is not the active order,
  - the point is not an intersection,
  - the point is occupied,
  - or the point is inside captured territory.
- Otherwise the server adds the node, runs the capture for the mover, switches the turn, ends the game if no free intersection remains, and broadcasts `get-node-storage` with the full state.
- `send-end-game` records one confirmation per order. The second distinct order ends the game.
- `send-player-storage`, the server `ScoreService`, the server `ChainService`, and `get-new-node` are removed.

**Rationale**: Today the server re-broadcasts any node without checks and stores the score a client sends. FR-002 through FR-007 and FR-015 through FR-017 need one place that decides. Keeping the existing event names `send-new-node` and `get-node-storage` keeps the socket surface familiar.

**Alternatives considered**: Have both clients enforce turns. Rejected because two clients can still disagree.

## Decision: A disconnect keeps the match

**Decision**:

- `onDisconnect` no longer wipes storages, scores, or chains.
- `UserService` keeps the user list.
- When a socket reconnects with the `userId` it stored, the existing lookup by that id finds the same order, and that user's socket id is updated.

**Rationale**: The spec edge case keeps the board, the imprisoned dots, and the turn until the player returns. Today a disconnect wipes the match state.

**Alternatives considered**: End the game on disconnect. Rejected because a win by disconnect is out of scope.

## Decision: The client becomes Vue 3 and keeps the Options API and its board methods

**Decision**:

- In `client/src/main.ts`, replace `new Vue(...).$mount` and `Vue.config.productionTip` with `createApp(App).mount("#app")`.
- In `App.vue`, replace `Vue.extend` with `defineComponent` and `beforeDestroy` with `beforeUnmount`.
- Keep these `App.vue` methods:
  - `drawGrid`, which now takes intersections from `rules/board.ts`, the same formula,
  - `getClosestNodeCoordinates`, which now scales the event offset by `canvas.width / canvas.clientWidth`,
  - `handleMouseMove` for the hover dot.
- Remove `newNodeHandler` scoring, `drawChainsForOwnTrappedNodes`, `endgameCheck`, and the `gapi-script` import.
- Update `shims-vue.d.ts` to `DefineComponent`. Delete `shims-tsx.d.ts`, which is Vue 2 JSX typing and unused.
- Replace `@vitejs/plugin-vue2` with `@vitejs/plugin-vue` 4.x in `vite.config.js`.

**Rationale**:

- The constitution requires Vue 3.
- The screen uses no Vue 2-only feature beyond the entry, `Vue.extend`, and `beforeDestroy`: no filters, no `$set`, no event bus, no `.native`.
- `@vitejs/plugin-vue` 5.x requires Vite 5, so the 4.x line matches the installed Vite 4.
- The published Vue 3 types need TypeScript 5.

**Alternatives considered**:

- Rewrite `App.vue` in the Composition API. Rejected because the same behavior does not need a second style.
- Upgrade Vite as well. Rejected because Vite 4 already builds the client.

## Decision: Areas are drawn as black lines through the chain dots

**Decision**:

- `client/src/paint-game.ts` draws each broadcast area as a closed path through its outline dots in walk order.
- The path is stroked in black and filled with the owner's color at reduced opacity, which is the style the current `getTrappedFromDrawnChain` already uses.
- Dots are drawn after the areas.
- Imprisoned dots keep their color.

**Rationale**: FR-011 and FR-012 require visible lines between the loop dots in a color that is neither player's. Black was already the line color.

**Alternatives considered**: Draw only the interior fill. Rejected because the spec requires lines between the loop dots.

## Decision: Jest replaces the broken Vitest setup

**Decision**:

- Add `jest`, `ts-jest`, and `@types/jest` at the root, with one `jest.config.js` that maps `rules` to `rules/src`.
- Port `client/tests/unit/services/chain.service.spec.ts` to `rules/tests/chain.service.test.ts`, because `ChainService` moves into `rules`.
- Turn the commented diamond fixture in `score.service.spec.ts` into a real capture test in `rules/tests`.
- Delete `score.service.spec.ts`, whose live body is `expect(true).toBe(true)`.
- Delete `socketio.service.spec.ts`, which constructs a private constructor and asserts members the class does not have.
- Remove `vitest`, `@vitest/ui`, `vitest-canvas-mock`, `jsdom`, `happy-dom`, `canvas`, `sinon`, `@types/sinon`, and `@vue/test-utils` 1.x, along with their config files.

**Rationale**:

- Constitution Principle V says Jest supersedes every other runner.
- The Vitest suite cannot start today because `@vitejs/plugin-vue2` is missing.
- Its only meaningful test covers a module that moves.

**Alternatives considered**: Keep Vitest beside Jest. Rejected because no remaining test would use it and the constitution names Jest alone.

## Decision: Styles move to SASS, and the canvas scales without changing the bitmap

**Decision**:

- Add `sass` as a client devDependency.
- Move the `App.vue` style block into `client/src/styles/game.scss`.
- The two stacked canvases keep `width` 800 and `height` 600 as attributes and get CSS `width: 100%; max-width: 800px; height: auto`.
- The score row and the end control wrap below the board at narrow width.

**Rationale**:

- The constitution requires SASS and a usable phone layout.
- Changing the bitmap would change the intersection set, which FR-019 forbids.

**Alternatives considered**: Shrink the bitmap on small screens. Rejected because that removes intersections.

## Unused code to delete while moving

- `types/chaining-direction.ts` (`Directions`, `SubDirection`)
- `LookupDirection` in `strategy/lookup-direction.ts`, while `GeneralDirection` stays
- `Node.prev`
- `NodeStorage.hasCompleteChains`, which is always true for `node.player === node.player`
- `NodeStorage.newNode` and `newNodeObserver`, which only served the client-side `get-new-node` path
- the unused imports in `chain.ts` and `lookup.ts`

Principle I says unused code is deleted.
