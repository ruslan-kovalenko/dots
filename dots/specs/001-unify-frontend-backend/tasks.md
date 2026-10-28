# Tasks: Unify Client and Server

**Input**: Design documents from `/specs/001-unify-frontend-backend/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in the specification. Validation is the manual flow in quickstart.md. No automated test tasks are included.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths below are relative to the git root (`/Users/ruslankovalenko/Projects/dots`), the parent of the Spec Kit directory `dots/`.
- Runnable workspaces: `client/` and `server/` at that git root.
- Spec Kit stays in `dots/` and is not a workspace.
- Server source to copy: `/Users/ruslankovalenko/Projects/node-dots`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Put the existing client and the existing game server into the workspace directories

- [X] T001 Create directories `client/` and `server/` at the git root
- [X] T002 [P] Move the Vue application from the git root into `client/`: `src/`, `public/`, `tests/`, `index.html`, `vite.config.js`, `vitest.config.ts`, `vitest.setup.ts`, `jest.config.js`, `babel.config.js`, `tsconfig.json`, `.eslintrc.js`, `.browserslistrc`, `.env`, `.env.development`, and `package.json`. Do not move `dots/`, `.git/`, `README.md`, `.gitignore`, or `node_modules/`. Do not leave `package-lock.json` inside `client/`
- [X] T003 [P] Copy the game server from `/Users/ruslankovalenko/Projects/node-dots` into `server/`: `server/`, `services/`, `types/`, `package.json`, and `tsconfig.json`. Do not copy `.git/`, `node_modules/`, `.DS_Store`, `.ipynb_checkpoints/`, or `Untitled.ipynb`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One private npm workspace whose single install prepares both parts

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Set `"name": "client"` and add `"dev": "vite"` in `client/package.json`. Keep the existing `"start": "vite"` script. Do not change the Vue 2.6 dependency or other dependency versions. Constraint from data-model.md: package name is the same as `name`; `dev` script must exist
- [X] T005 [P] Set `"name": "server"` in `server/package.json` and add `ts-node` to `devDependencies` (the current `start` script calls `ts-node`, which is not declared). Do not edit `server/server.ts`. Constraint from data-model.md: package name is the same as `name`
- [X] T006 Create git-root `package.json` with `"name": "dots"`, `"private": true`, and `"workspaces": ["client", "server"]`, and add `concurrently` as a root devDependency. Do not add a `dev` script in this task. Constraint from data-model.md: `client` and `server` are the only two workspaces; `dots/` is not a workspace
- [X] T007 Run `npm install` at the git root and keep a single `package-lock.json` there. Remove `client/package-lock.json` and `server/package-lock.json` if they exist. Constraint from data-model.md: a prepare action at the git root installs dependencies for both names

**Checkpoint**: Foundation ready — `npm install` at the git root exits 0 and both workspace names are installed

---

## Phase 3: User Story 1 - Start the whole game from the project root (Priority: P1) 🎯 MVP

**Goal**: `npm run dev` at the git root starts the player-facing application and the game server together. A player can play the local game. Stopping that command stops both parts.

**Independent Test**: With both parts installed and ports 8080 and 3000 free, run `npm run dev` at the git root. The process stays in the foreground, the client is on `http://localhost:8080`, the server listens on port 3000, one play action is handled by the local server, and Ctrl+C stops both parts.

### Implementation for User Story 1

- [X] T008 [P] [US1] Keep `server.port` at 8080 in `client/vite.config.js`. Keep `VITE_SOCKET_ENDPOINT=http://localhost:3000` in `client/.env` and `client/.env.development`. Constraint from data-model.md: client origin is `http://localhost:8080`; client setting is `VITE_SOCKET_ENDPOINT=http://localhost:3000`
- [X] T009 [P] [US1] Set the `dev` script in `server/package.json` to launch `server/server.ts` with `nodemon` executing `ts-node --esm server/server.ts` (the current `start` entry). Do not edit `server/server.ts`: it mixes `require` and `import`, and `server.listen(3000)` must stay. Constraint from data-model.md: `server` starts `server/server.ts` on port 3000
- [X] T010 [US1] Add a `dev` script to the git-root `package.json` that runs `npm run dev -w client` and `npm run dev -w server` in parallel through `concurrently` with `--names client,server`. Do not add `--kill-others-on-fail` in this task. Constraint from data-model.md: command is `npm run dev` from the git root; both workspaces are started together; each line of child output is prefixed with `client` or `server`. Interrupting the root process stops both children

**Checkpoint**: User Story 1 works on its own — one start command runs both parts, local play uses the local server, and interrupt stops both

---

## Phase 4: User Story 2 - Work in one project instead of two (Priority: P2)

**Goal**: A fresh copy contains both parts. One install at the git root prepares them. Setup guidance does not send the developer to a second project.

**Independent Test**: Inspect a fresh copy and see `client/` and `server/` at the git root. Run `npm install` once at the root. Read `README.md` and confirm it does not require a second repository or a second install.

### Implementation for User Story 2

- [X] T011 [P] [US2] Rewrite `README.md` so the documented prepare action is `npm install` and the documented start action is `npm run dev`, both from the git root. Remove the Vue CLI `npm start` flow and any instruction to clone `node-dots`
- [X] T012 [P] [US2] Remove leftover client files that still sit outside `client/` at the git root: `src/`, `public/`, `tests/`, `index.html`, `vite.config.js`, `vitest.config.ts`, `vitest.setup.ts`, `jest.config.js`, `babel.config.js`, `tsconfig.json`, `.eslintrc.js`, and `.browserslistrc`. Keep `dots/`, `package.json`, `package-lock.json`, `README.md`, `.gitignore`, and `.git/`

**Checkpoint**: User Stories 1 and 2 both work — the product is one project with one install, and the start command from User Story 1 still runs

---

## Phase 5: User Story 3 - See which part failed to start (Priority: P3)

**Goal**: If either part is missing or exits, the root start command exits unsuccessfully and the output names `client` or `server`. The other part does not stay up as a successful start.

**Independent Test**: Temporarily rename `server/` and run `npm run dev` (expect a non-zero exit whose output contains `server`). With `server/` restored, occupy port 3000 and run `npm run dev` (expect the `server` label and a non-zero exit, with `client` not left running). Occupy port 8080 and run `npm run dev` (expect the `client` label and a non-zero exit). Restore the tree and free the ports afterward.

### Implementation for User Story 3

- [X] T013 [US3] Add `--kill-others-on-fail` to the `dev` script in the git-root `package.json`, keeping `--names client,server` and the `-w client` / `-w server` arguments. Constraint from data-model.md: "Success only while both parts stay up. Any child exit, missing part, or address already in use ends the session unsuccessfully." Also: "If either path or `dev` script is missing, start fails and the message contains that workspace name."

**Checkpoint**: All three stories work — a failed or missing part is named and the start command does not report success

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ignore workspace build output and run the feature validation guide

- [X] T014 [P] Update `.gitignore` so `dist/` is ignored in `client/` and `server/` (the current `/dist` rule is anchored to the git root only) and so `node_modules/`, `*.log`, `.env.local`, and `.env.*.local` are present
- [X] T015 Run the validation steps in `dots/specs/001-unify-frontend-backend/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 and User Story 2 can proceed in parallel after Phase 2
  - User Story 3 edits the root `dev` script created in User Story 1, so it starts after T010
- **Polish (Phase 6)**: Depends on the user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — independently testable from User Story 1
- **User Story 3 (P3)**: Can start after T010 — changes the same root `package.json` script User Story 1 adds

### Within Each User Story

- T008 and T009 touch different files and can run together; T010 waits for both
- T011 and T012 touch different files and can run together
- User Story 3 is one task on the root `package.json`

### Parallel Opportunities

- T002 and T003 can run in parallel after T001
- T004 and T005 can run in parallel; T006 waits for both; T007 waits for T006
- After Phase 2, User Story 1 and User Story 2 can run in parallel
- T008 and T009 can run in parallel; T011 and T012 can run in parallel
- T014 can run in parallel with other polish work that does not edit `.gitignore`

---

## Parallel Example: User Story 1

```bash
Task: "Keep server.port 8080 in client/vite.config.js and VITE_SOCKET_ENDPOINT in client/.env and client/.env.development"
Task: "Set server/package.json dev script to nodemon executing ts-node --esm server/server.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Rewrite README.md to document npm install and npm run dev from the git root"
Task: "Remove leftover client files that still sit outside client/ at the git root"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `npm run dev` at the git root, open `http://localhost:8080`, play one action against the local server, then Ctrl+C and confirm both parts stop
5. Demo the single start command if that check passes

### Incremental Delivery

1. Setup + Foundational → `npm install` at the git root prepares `client` and `server`
2. User Story 1 → one command starts both parts (MVP)
3. User Story 2 → the root is only those two parts, and `README.md` describes that one install and one start
4. User Story 3 → a missing or crashed part fails the start command and is named in the output
5. Polish → ignore rules cover workspace output, then run quickstart.md

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. After T010, Developer C: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps a task to a specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate that story on its own
- Do not upgrade Vue in this feature. The constitution names Vue 3; the client stays on Vue 2.6
- Do not rewrite `server/server.ts` or the socket events in `dots/specs/001-unify-frontend-backend/contracts/socket.md`
