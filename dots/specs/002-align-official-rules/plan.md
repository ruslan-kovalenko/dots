# Implementation Plan: Align Official Dots Rules

**Branch**: `002-align-official-rules` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-align-official-rules/spec.md`. Planning instructions: include the client upgrade from Vue 2.6 to Vue 3 in this feature; keep the existing surround (chain walk) algorithms and every other existing method that already fits the constitution, changing them only where the rules require it.

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Make the game follow the confirmed Dots rules on the current board. Diagonal links take priority, straight links still count when no diagonal is available, an empty surround scores nothing, imprisoned dots leave play, turns alternate from the first connected player, and the game ends on a full board or on two confirmations. The existing chain walk stays the loop finder: `Lookup`, the eight direction substrategies, `Chain`, `BlankPointHelper`, `NodeStorage`, `CoordinateService`, `ChainService`, and `sort`. Those files move unchanged in shape into a shared, dependency-free `rules` workspace. Only these changes are made to them:

- Candidate choice prefers a diagonal step.
- The first step may be straight when no diagonal start exists.
- The blank-point check no longer vetoes a diagonal because of an own dot.
- The canvas `isPointInPath` test becomes a pure grid test on the same polygon.
- An empty loop no longer marks territory.

The server runs those rules and becomes the authority for placement, turn, score, and ending. The client stops scoring and draws the broadcast state, keeping its grid, hover, and nearest-intersection methods. The client moves from Vue 2.6 to Vue 3 with the Options API it already uses. Jest replaces the broken Vitest setup, as the constitution requires.

## Technical Context

**Language/Version**: TypeScript on Node.js. Client TypeScript moves from 4.1 to 5.x, the same major the server already uses, because the published Vue 3 types do not typecheck on TypeScript 4.1. The client UI is Vue 3.

**Primary Dependencies**:

- Existing: `socket.io` 4 on the server, `socket.io-client` 4 on the client, `express`, and Vite 4.
- Vue: replace `vue` 2.6 with `vue` 3, and `@vitejs/plugin-vue2` with `@vitejs/plugin-vue` 4.x (the line that supports Vite 4).
- Remove the Vue 2 and dead Vue CLI packages: `vue-template-compiler`, `@vue/cli-plugin-typescript`, `@vue/test-utils` 1.x, `vue-googleapis`, `gapi-script`, and `core-js`.
- New root devDependencies `jest`, `ts-jest`, and `@types/jest`, because the constitution requires Jest and nothing in the repo runs Jest today.
- New client devDependency `sass`, because client styles must be SASS and the client does not declare a compiler.
- No library for loop search or polygon tests.

**Storage**: In memory in the server process, one match per process, for the life of that process. No database.

**Testing**: Root `npx jest` runs `rules/tests`, `server/tests`, and `client/tests`. The Vitest suite and its packages are removed after its one real test is ported to Jest.

**Target Platform**: Local play in a desktop or phone browser. Client at `http://127.0.0.1:8080`, server on port 3000, both from one `npm run dev` at the git root.

**Project Type**: npm workspaces web application: the existing `client` and `server`, plus a dependency-free `rules` workspace that both import.

**Performance Goals**: A placement updates both players before another click is needed. The board stays at 336 intersections. A full loop search after one placement stays within a few milliseconds at that size.

**Constraints**:

- Do not add or remove intersections. The 800×600 bitmap and the 35 px gap stay.
- No skip action.
- An empty surround scores nothing and creates no area.
- A diagonal link wins over a straight link around the same dots.
- Boundary lines are black, which is neither player's color.
- Score is imprisoned opponent dots only.
- Styles are SASS.
- The board and the score must be reachable without horizontal scroll at phone width.

**Scale/Scope**:

- One shared rules workspace built from the existing client algorithm files.
- The server socket handlers that apply it.
- The client screen on Vue 3 that sends a grid point or an end confirmation and draws state.

Rematch, more than two players, and win by disconnect are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Before Phase 0 | After Phase 1 |
| --- | --- | --- |
| I. Clean code | Pass, if one copy of the capture rules exists and unused code is deleted rather than kept. | Pass. `rules/` holds the only copy. [research.md](./research.md) lists the unused enums, fields, and the buggy `hasCompleteChains` to delete. The client scoring path is removed, not commented out. |
| II. Simple UX | Pass, if the only new control is one end confirmation and there is no skip. | Pass. [contracts/game-socket.md](./contracts/game-socket.md) has `send-new-node` and `send-end-game` only. |
| III. Responsive design | Pass, if the board scales to the viewport without changing the bitmap, and the score and end control wrap. | Pass. The canvas keeps its 800×600 bitmap, scales with CSS, and clicks map back through the display scale. |
| IV. Minimal dependencies | Jest, ts-jest, and sass need a one-line reason each. Loop search needs no library. | Pass. Each addition has a reason in Technical Context. Removals reduce the count. |
| V. Jest for changed client and server code | Pass only if the new tests run in Jest, not Vitest. | Pass. Root Jest covers `rules`, `server`, and the changed client modules. The Vitest runner is removed. |
| Stack: TypeScript, Node.js, WebSocket, SASS, Vue 3 | Fails today: client is Vue 2.6 with plain CSS. This feature closes both. | Pass. `createApp`, `defineComponent`, `<style lang="scss">`. Play stays on socket.io. |
| Structure: npm workspaces, one `npm run dev` | Pass, if `rules` does not need a third process. | Pass. `rules` is a library workspace. `npm run dev` still starts client and server only. |

No unjustified gate failure. Phase 0 and Phase 1 may proceed.

## Project Structure

### Documentation (this feature)

```text
specs/002-align-official-rules/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-socket.md
└── tasks.md             # not created by this command
```

Paths above are relative to the Spec Kit directory `dots/`. The runnable repository root is one level above it.

### Source Code (repository root)

```text
rules/                               # new workspace, name "rules", no runtime dependencies
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                     # public surface for server and client
│   ├── board.ts                     # grid formula extracted from App.vue drawGrid
│   ├── match.ts                     # turn, placement check, capture call, ending
│   ├── capture.ts                   # pure strictly-inside test on the chain polygon
│   ├── strategy/                    # moved from client/src/strategy (Lookup, BlankPointHelper, substrategy/*)
│   ├── services/                    # moved: node-storage, coordinate, chain, score (pure parts)
│   ├── types/                       # moved: chain, node, coordinate, constants
│   ├── players/player.ts            # moved
│   └── helpers/sort.ts              # moved
└── tests/                           # Jest: links, diagonal priority, empty surround, imprisonment, turns, ending
client/
├── src/main.ts                      # createApp(App).mount("#app")
├── src/App.vue                      # defineComponent; keeps drawGrid, getClosestNodeCoordinates, hover
├── src/paint-game.ts                # draws dots and areas from broadcast state
├── src/services/socketio.service.ts # send-new-node {x, y}, send-end-game, get-node-storage
├── src/services/player.service.ts   # kept: local identity and rival
├── src/types/circle.ts              # kept: dot drawing
├── src/styles/game.scss             # board scaling, score row, end control
├── src/shims-vue.d.ts               # DefineComponent
├── vite.config.js                   # @vitejs/plugin-vue
└── tests/                           # Jest: click mapping, painting, result label
server/
├── server/socket.ts                 # validates and applies placements through rules; broadcasts state
├── services/user.service.ts         # kept: connection order gives order 1 and 2
└── tests/                           # Jest over a real socket.io server on a random port
jest.config.js                       # root Jest config; maps "rules" to rules/src
```

**Structure Decision**:

- **New workspace**: add `rules/` at the git root and list it in the root `workspaces` array beside `client` and `server`.
- **Moved files**: move the algorithm files with `git mv` so their history stays. Inside `rules`, replace `@/` imports with relative paths and fix `./Coordinate` to `./coordinate`. Both are required for Node to resolve the files on a case-sensitive filesystem.
- **Kept client files**: the client keeps only what draws and talks to the socket.
- **Removed from the server**: `server/services/score.service.ts`, `chain.service.ts`, and the client-mirrored `server/types/*`, which stored scores and chains sent by the client. They are replaced by imports from `rules`.
- **Client scripts**: point `build` at `vite build`, and remove the `lint` script that calls the missing `vue-cli-service`.
- **Removed client files**: `client/jest.config.js`, `client/babel.config.js`, `client/tests/setup.js`, `client/vitest.config.ts`, and `client/vitest.setup.ts`. Each one points at a Vue CLI or Vitest toolchain that this feature removes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| A third workspace `rules` | Server and client both need the board formula and the rule types. The server must run the existing chain walk without a DOM. | Keeping the algorithm in `client/` would make the server depend on the client package, its Vite aliases, and Vue. Copying it into `server/` would create the two drifting copies the constitution calls a defect. |
| Static, module-level state in the moved services (`NodeStorage`, `CoordinateService`, `ChainService`) | The chain walk reads these statics in every substrategy and in `BlankPointHelper`. Keeping them keeps the algorithm as it is. | Rewriting every substrategy to take an explicit game object would discard most of the kept code. The server holds one match per process, so one static state is sufficient. `match.ts` resets it when a match starts. |
| Drawing moved from `App.vue` into `client/src/paint-game.ts` | Jest must test the changed client drawing without compiling single-file components. | Mounting `App.vue` in Jest would need a Vue SFC transform and a DOM environment that the repo does not have. |
