# Contract: Local game socket

Preserved boundary between `client` and `server`. This feature does not add, remove, or rename events.

## Transport

- Client connects to `VITE_SOCKET_ENDPOINT` (`http://localhost:3000`).
- Server listens on port 3000 and accepts the socket connection with the current CORS allowance.
- Optional handshake query: `userId` (string).

## Client emits

| Event | Payload | When |
| --- | --- | --- |
| `send-player-storage` | storage, score, and chains for the active player | player storage is non-empty |
| `send-new-node` | the new node | a node is created |

## Server emits

| Event | Payload | When |
| --- | --- | --- |
| `register-player` | the player record | a socket connects |
| `users` | the current player list | a socket connects |
| `get-node-storage` | combined storage, both scores, and chains | a player storage update is applied |
| `get-new-node` | the node | a new node is broadcast |

## Validation rule

After both parts start from the root command, a player can open `http://localhost:8080` and complete one play action that the server handles through this contract. No extra process is started by hand.
