# Data Model: Unify Client and Server

This feature does not add game records. The model is the two runnable parts and the local session that starts them.

## Workspace

A distinct runnable part of the one project.

| Field | Required | Rule |
| --- | --- | --- |
| name | yes | `client` or `server`. These are the only two workspaces. |
| path | yes | `client/` or `server/` at the git root. |
| package name | yes | Same as `name`, so the root command can address the part. |
| dev script | yes | Must exist and must start that part. `client` starts Vite on port 8080. `server` starts `server/server.ts` on port 3000. |
| source identity | yes | `client` is the Vue application moved from the git root. `server` is the application copied from `node-dots`. |

**Relationships**: The root package owns exactly these two workspaces. Spec Kit under `dots/` is not a workspace.

**Validation**:

- A prepare action at the git root installs dependencies for both names.
- If either path or `dev` script is missing, start fails and the message contains that workspace name.

## Dev session

One invocation of the root start command.

| Field | Required | Rule |
| --- | --- | --- |
| command | yes | `npm run dev` from the git root. |
| parts | yes | Both workspaces, started together. |
| output label | yes | Each line of child output is prefixed with `client` or `server`. |
| result | yes | Success only while both parts stay up. Any child exit, missing part, or address already in use ends the session unsuccessfully. |

**State transitions**:

1. `idle` — nothing started by this command.
2. `starting` — root command has launched both children.
3. `running` — Vite is accepting players on port 8080 and the game server is listening on port 3000.
4. `failed` — one child has exited or never launched. The other child is stopped. The process exit code is non-zero. The failed name is visible.
5. `stopped` — the developer stopped the root command. Both children are gone.

There is no successful state in which only one part is running under this command.

## Play connection

The existing link the player-facing application uses to reach the local game server. Preserved, not redesigned.

| Field | Required | Rule |
| --- | --- | --- |
| client origin | yes | `http://localhost:8080` |
| server origin | yes | `http://localhost:3000` |
| client setting | yes | `VITE_SOCKET_ENDPOINT=http://localhost:3000` in the client env files |
| events | yes | Unchanged. See [socket contract](./contracts/socket.md). |

**Relationship**: A `running` dev session is what makes this connection usable. The session does not create a new event or a new port.
