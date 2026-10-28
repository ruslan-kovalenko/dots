# Research: Unify Client and Server

## Decision: Workspace root is the git repository root

**Decision**: The npm workspace root is the git root of `dots` (`package.json` beside `client/`, `server/`, and `dots/`). Spec Kit stays in `dots/` and is not a workspace.

**Rationale**: The player-facing application already lives in this git repository. The constitution requires one root `package.json` and one `npm run dev`. Spec Kit files are project documentation; moving them would change the active feature path without helping a developer start the game.

**Alternatives considered**: Making `dots/` (the Spec Kit directory) the workspace root. Rejected because the Vue application, git metadata, and README are one level above it. Nesting the runnable product inside the Spec Kit directory would hide the start command.

## Decision: Sources of the two parts

**Decision**:

- Client source is the application currently at the git root: `src/`, `public/`, `tests/`, `index.html`, `vite.config.js`, `vitest.config.ts`, `vitest.setup.ts`, `jest.config.js`, `babel.config.js`, `tsconfig.json`, `tests/unit/tsconfig.json`, `.eslintrc.js`, `.browserslistrc`, `.env`, `.env.development`, and the current `package.json`. These move into `client/`.
- Server source is the sibling project `/Users/ruslankovalenko/Projects/node-dots` (git remote `ruslan-kovalenko/node-dots`, package description "server for dots"). Copy `server/`, `services/`, `types/`, `package.json`, and `tsconfig.json` into `server/`.
- Do not copy `.git`, `node_modules`, `.DS_Store`, `.ipynb_checkpoints/`, or `Untitled.ipynb`. The notebook and its checkpoints are not used by the process that listens on port 3000.

**Rationale**: The client connects to `VITE_SOCKET_ENDPOINT=http://localhost:3000`. The server process calls `server.listen(3000)`. That pair is the existing local game. The notebook is scratch data, not a runtime part.

**Alternatives considered**: Linking `node-dots` with a relative `file:` dependency and leaving it outside this repository. Rejected because the specification requires both parts to be present in one project and forbids setup guidance that sends a developer to a second project.

## Decision: Directory and package names

**Decision**: Workspace directories and package names are `client` and `server`. Root package name stays `dots` and is `"private": true`. Workspaces field is `["client", "server"]`.

**Rationale**: `npm run dev -w client` and `npm run dev -w server` then match the names a developer sees in start output. The current package names `dots` and `node-dots` collide with the repository name and with the Spec Kit directory.

**Alternatives considered**: `apps/client` and `apps/server`. Rejected because this repository has exactly two runnable parts and an extra `apps/` level does not satisfy a requirement. `frontend/` and `backend/` were rejected so the concurrently prefixes can stay `client` and `server`, which match the specification language closely enough to identify the failed part.

## Decision: One root install, one root lockfile

**Decision**: `npm install` at the git root installs both workspaces. Only the root `package-lock.json` is kept. Nested lockfiles from the old client package and from `node-dots` are not carried forward.

**Rationale**: npm workspaces resolve dependencies from the root install. Two lockfiles drift apart and make "one prepare action" ambiguous.

**Alternatives considered**: Running `npm install` inside each workspace after the move. Rejected because that is a second prepare action and violates the specification.

## Decision: Parallel start with named output and a shared failure

**Decision**: Root script `dev` runs both workspace `dev` scripts in parallel through `concurrently`, with names `client` and `server`, and with `--kill-others-on-fail`.

**Rationale**: `npm run dev --workspaces` runs workspace scripts one after another. The first long-running process blocks the second, so the game never comes up as one action. `concurrently` starts both, prefixes each line with the part name, returns non-zero when either child exits non-zero, and on Ctrl+C stops both children. A missing workspace fails before listen with npm text that includes `client` or `server`.

**Alternatives considered**:

- `npm run dev --workspaces`. Rejected because it is sequential.
- A shell pipeline with `&` and `wait`. Rejected because a failure in one background job does not reliably name the part and stop the other.
- Turborepo or Nx. Rejected because the constitution fixes the layout at npm workspaces, and this feature does not need a task graph.

## Decision: Each workspace `dev` script must actually start that part

**Decision**:

- `client` `dev` runs Vite, the same command as today's root `start` (`vite`). The client dev server stays on port 8080 (`vite.config.js`).
- `server` `dev` runs `server/server.ts` on port 3000 through the TypeScript runner. Today's server `dev` script is `nodemon server/server.ts` with no TypeScript loader and no `nodemon.json`. Today's `start` script is `ts-node --esm server/server.ts`, and `ts-node` is not listed in the server package. The workspace `dev` script must declare and use a TypeScript runner. Do not rewrite `server/server.ts`; it mixes `require` and `import`.

**Rationale**: Root `npm run dev` is only successful if both children stay running. A `dev` script that cannot load TypeScript fails the primary scenario. Changing module syntax is a behavior risk the specification excludes.

**Alternatives considered**: Calling the server `start` script from the root and leaving the broken `dev` script in place. Rejected because both workspaces should expose the same script name the root command invokes, and a broken `dev` script would surprise anyone who starts one part on purpose.

## Decision: Keep the existing ports and socket contract

**Decision**: Client remains `http://localhost:8080`. Server remains `http://localhost:3000`. `client/.env` and `client/.env.development` keep `VITE_SOCKET_ENDPOINT=http://localhost:3000`. Socket event names stay as they are today.

**Rationale**: The specification requires existing play behavior to keep working. The client already targets port 3000, and the server already listens there. No new configuration is required for a local game.

**Alternatives considered**: Serving the built client from Express, or proxying the socket through Vite. Rejected because that changes how the two parts meet and is not needed to start both.

## Decision: Do not upgrade Vue in this feature

**Decision**: The client stays on Vue 2 (`vue` 2.6 and `@vitejs/plugin-vue2`). The constitution names Vue 3. That gap is pre-existing and is deferred.

**Rationale**: The specification forbids adding or removing game rules and limits this feature to how a developer obtains, prepares, and starts the two parts. A Vue upgrade changes the player-facing application.

**Alternatives considered**: Upgrading Vue while moving files. Rejected as a separate feature.

## Decision: README is the only setup guide

**Decision**: Rewrite the root `README.md` so the documented prepare action is `npm install` and the documented start action is `npm run dev`, both from the git root. Remove the current `npm start` / Vue CLI flow and any instruction to clone the server repository.

**Rationale**: The current README tells a developer to run `npm start` in what is today a client-only project. Leaving it in place fails the setup-guidance requirement.
