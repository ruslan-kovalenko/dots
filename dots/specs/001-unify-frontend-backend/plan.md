# Implementation Plan: Unify Client and Server

**Branch**: `001-unify-frontend-backend` | **Date**: 2026-10-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-unify-frontend-backend/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Bring the existing Vue application and the existing game server into one npm workspace repository so a developer prepares both with `npm install` and starts both with `npm run dev` from the git root. The client moves from the git root into `client/`. The server is copied from `/Users/ruslankovalenko/Projects/node-dots` into `server/`. A root `concurrently` script runs both `dev` scripts in parallel, prefixes their output, stops both on interrupt, and exits non-zero if either part fails. Ports and socket events stay unchanged: Vite on 8080, game server on 3000.

## Technical Context

**Language/Version**: TypeScript (client ~4.1, server ^5.2) on Node.js. Client UI remains Vue 2.6.

**Primary Dependencies**: npm workspaces; root `concurrently`. Client keeps Vite 4, `@vitejs/plugin-vue2`, `socket.io-client`. Server keeps Express, `socket.io`, and a declared TypeScript runner (`ts-node`) for `server/server.ts`.

**Storage**: N/A. In-memory game state stays inside the server process.

**Testing**: Existing client Vitest suite via `npm test -w client`. Server `test` script remains an unimplemented stub and is not part of the root start command. Feature validation is the manual flow in [quickstart.md](./quickstart.md).

**Target Platform**: Local developer machine. Client at `http://localhost:8080`, server at `http://localhost:3000`.

**Project Type**: npm workspace with a web client and a websocket server.

**Performance Goals**: After dependencies are already installed, `npm run dev` reaches a playable local game in under 2 minutes (spec SC-002).

**Constraints**: One prepare command and one start command, both from the git root. Stopping the start command stops both parts. A failed or missing part exits non-zero and names `client` or `server`. Game rules and socket events do not change. Vue is not upgraded in this feature.

**Scale/Scope**: Two workspaces. Spec Kit under `dots/` stays documentation and is not a third workspace.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Before Phase 0 | After Phase 1 |
| --- | --- | --- |
| TypeScript and Node.js | Pass. Both parts are already TypeScript on Node. | Pass. The move does not change the language. |
| Websocket | Pass. Client already uses `socket.io-client`; server already uses `socket.io`. | Pass. [socket.md](./contracts/socket.md) preserves the events and port 3000. |
| Vue.js 3 | Pre-existing gap. The client is Vue 2.6. | Still deferred. See Complexity Tracking. This feature does not widen the gap. |
| SASS | Not applicable. This feature does not add styles. | Not applicable. |
| npm workspaces | Pass as the chosen layout. | Pass. Root `package.json` lists `client` and `server`. |
| Single `npm run dev` | Pass as the root start command. | Pass. [dev-command.md](./contracts/dev-command.md) is that command and it launches both parts. |

No unjustified gate failure. Phase 0 and Phase 1 may proceed.

## Project Structure

### Documentation (this feature)

```text
specs/001-unify-frontend-backend/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

Paths above are relative to the Spec Kit directory `dots/`. The runnable repository root is one level above that directory.

### Source Code (repository root)

```text
package.json                 # private workspace root; script "dev"
package-lock.json            # single lockfile for both workspaces
README.md                    # npm install + npm run dev only
.gitignore
client/                      # Vue application moved from the git root
├── package.json             # name "client"; script "dev" runs vite
├── index.html
├── vite.config.js           # port 8080
├── .env                     # VITE_SOCKET_ENDPOINT=http://localhost:3000
├── .env.development
├── src/
├── public/
└── tests/
server/                      # copied from /Users/ruslankovalenko/Projects/node-dots
├── package.json             # name "server"; script "dev" runs server/server.ts
├── tsconfig.json
├── server/                  # listen 3000, socket.io
├── services/
└── types/
dots/                        # Spec Kit only; not a workspace
├── .specify/
└── .cursor/
```

**Structure Decision**: Two workspaces, `client/` and `server/`, at the git root. The client is the current application moved out of the root so the root `package.json` can become the workspace manifest. The server is copied from `/Users/ruslankovalenko/Projects/node-dots`, excluding `.git`, `node_modules`, `.DS_Store`, `.ipynb_checkpoints/`, and `Untitled.ipynb`. Spec Kit remains in `dots/` and is excluded from `workspaces`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution names Vue.js 3; client remains Vue 2.6 | The gap already exists. This feature only moves and launches the current client. | Upgrading Vue during the move would change the player-facing application, which the specification excludes. Track the upgrade as a later feature. |
