# Contract: Game Socket

Transport is socket.io between the client at `http://127.0.0.1:8080` and the server on port 3000. The server decides every placement, capture, turn, and ending. The client sends intent and draws what the server broadcasts.

## Client → server

| Event | Payload | Effect |
| --- | --- | --- |
| `send-new-node` | `{ x: number, y: number }` (grid position) | The server places a dot for the sender's order if the placement is legal (see [data-model.md](../data-model.md)). Otherwise nothing changes. |
| `send-end-game` | none | The server records one confirmation for the sender's order. The second distinct order ends the game. |

The connection query keeps `userId`, which is the id the client stored, so a returning player keeps their order.

## Server → client

| Event | Payload | When |
| --- | --- | --- |
| `register-player` | `{ id, order, color }` | To the connecting socket. |
| `users` | the two players | To everyone when the player list changes. |
| `get-node-storage` | `GameState` | To everyone after a connection, after every accepted placement, and after every end request. |

`GameState`:

| Field | Meaning |
| --- | --- |
| `phase` | `waiting`, `playing`, or `ended`. |
| `activeOrder` | `1`, `2`, or empty. |
| `storage` | Every dot as `{ x, y, order, isTrapped }`. |
| `areas` | Each area as `{ ownerOrder, outline: [{x, y}], interior: [{x, y}] }`. The outline is in walk order. |
| `scores` | `{ 1: number, 2: number }`, the imprisoned opponent dots per order. |
| `endRequests` | Orders that have confirmed. |
| `result` | Empty, or `{ scores, winner: 1 | 2 | "tie" }`. |

## Removed

- `send-player-storage`: the client no longer reports a score or chains.
- `get-new-node`: replaced by the full `get-node-storage` state.

## Client drawing rules

- Draw dots and areas only from `get-node-storage`.
- Each area is a black line closed through `outline`, with the owner's color filled inside at reduced opacity.
- Imprisoned dots keep their own color.
- The client never decides whether a loop scores.
