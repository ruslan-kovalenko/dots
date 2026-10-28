# Quickstart: Unify Client and Server

Validation guide for the local product after the workspace move. Command behavior is defined in [dev-command.md](./contracts/dev-command.md). The play link is defined in [socket.md](./contracts/socket.md). Parts and ports are defined in [data-model.md](./data-model.md).

## Prerequisites

- Node.js and npm available on the path
- Git root contains `client/` and `server/`
- Ports 8080 and 3000 are free

## Setup

From the git root:

```bash
npm install
```

Expected: the command exits 0 and both `client` and `server` are installed. No second install and no second repository.

## Start both parts

From the git root:

```bash
npm run dev
```

Expected:

- The process stays in the foreground
- Output lines are prefixed with `client` or `server`
- `client` serves `http://localhost:8080`
- `server` listens on port 3000
- Opening `http://localhost:8080` loads the game, and a play action is handled by the local server without another command

Stop with Ctrl+C. Expected: both prefixes stop and the ports are free.

## Failure checks

Run these with the root command, one at a time, and restore the project afterward.

1. **Missing part.** Rename `server/` temporarily and run `npm run dev`. Expected: non-zero exit, and the output contains `server`. The command does not report success.
2. **Server address taken.** Start something else on port 3000, then run `npm run dev`. Expected: the `server` prefix shows the address failure, the root command exits non-zero, and `client` does not keep running alone under this command.
3. **Client address taken.** Start something else on port 8080, then run `npm run dev`. Expected: the `client` prefix shows the address failure, and the root command exits non-zero.

## Guidance check

Read the root `README.md`. Expected: it documents `npm install` and `npm run dev` from the git root. It does not document `npm start`, Vue CLI, or a clone of the server repository.

## Regression check

With `npm run dev` running, repeat a local play flow that already works against the separate server today (connect, receive a player, place a node). Expected: the same outcome as before the move. Client unit tests, when needed, still run with `npm test -w client`.
