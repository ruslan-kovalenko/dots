# Contract: Root development command

This is the only supported way to prepare and start the local product.

## Prepare

- **Command**: `npm install`
- **Working directory**: git root (the directory that contains `client/` and `server/`)
- **Success**: dependencies for workspaces `client` and `server` are installed, and the command exits 0
- **Failure**: the command exits non-zero and names the workspace that could not be installed

## Start

- **Command**: `npm run dev`
- **Working directory**: git root
- **Children**: `npm run dev -w client` and `npm run dev -w server`, in parallel
- **Labels**: child output is prefixed `client` or `server`
- **Success**: both children keep running. The player-facing application is on `http://localhost:8080`. The game server is on `http://localhost:3000`. The root process has not exited.
- **Stop**: interrupting the root process stops both children. A local game in progress ends.
- **Failure**: the root process exits non-zero when either child exits non-zero, when either workspace is missing, or when either `dev` script is missing. The output includes the name `client` or `server`.

## Out of contract

- `npm start` at the git root is not the start action.
- `npm run dev` inside `client/` or `server/` starts only that part and must not be described as starting the product.
- Cloning `node-dots` is not a setup step.
