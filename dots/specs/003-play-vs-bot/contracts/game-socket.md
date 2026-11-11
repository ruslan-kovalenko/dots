# Contract: Game Socket

Transport stays socket.io between the client at `http://127.0.0.1:8080` and the server on port 3000. The server decides the opponent, every placement, the computer's cell, and the ending. The client sends the choice or a grid point and draws the broadcast.

This contract extends [the current game socket](../../002-align-official-rules/contracts/game-socket.md). Events not listed here keep that contract.

## Client → server

| Event | Payload | Effect |
| --- | --- | --- |
| `choose-opponent` | `{ opponent: "person" \| "computer" }` | Accepted only from order 1 while `phase` is `waiting` and only order 1 is seated. `"person"` records the choice. `"computer"` seats the computer and starts the game with `activeOrder` 1. Any other sender or phase changes nothing. |
| `send-new-node` | `{ x: number, y: number }` | Unchanged for a person whose order equals `activeOrder`. After a legal placement, if `activeOrder` is now 2 and that player is the computer, the server places the computer's cell before it broadcasts. A placement from the person during the computer's turn changes nothing. |
| `send-end-game` | none | One confirmation for the sender's order, as today. When `opponent` is `"computer"`, the person's request ends the game at once. When `opponent` is `"person"`, the second distinct order is still required. |

The connection query still carries `userId`, so a returning person keeps their order. The computer has no connection and sends none of these events.

## Server → client

| Event | Payload | When |
| --- | --- | --- |
| `register-player` | `{ id, order, color }` | To a socket that received a seat. Not sent to a socket refused because the computer is seated. |
| `users` | the seated players, including the computer when seated | To seated players when the list changes. |
| `get-node-storage` | `GameState` | To seated players after a connection, after `choose-opponent`, after the person's dot and the computer's reply, and after an end request. |
| `seat-refused` | `{ reason: "computer" }` | To a socket that connected while the computer already holds order 2. No `register-player` and no `get-node-storage` for that socket. |

`GameState` gains one field:

| Field | Meaning |
| --- | --- |
| `opponent` | `null` before a choice and before a second person, `"person"` for a two-person game or while waiting for one, `"computer"` after the computer is seated. |

`phase`, `activeOrder`, `storage`, `areas`, `scores`, `endRequests`, and `result` keep their current meanings.

## Client controls

| Condition | Shown |
| --- | --- |
| `phase` is `waiting`, local order is 1, `opponent` is `null` | "Play against a person" and "Play against the computer". |
| `phase` is `waiting`, local order is 1, `opponent` is `"person"` | "Waiting for the other player." and "Play against the computer". |
| `seat-refused` with reason `"computer"` | "This game is already being played against the computer." |
| `phase` is `playing` and `opponent` is `"computer"` | The existing End game control. One click sends `send-end-game`. |
| `phase` is `playing` and `opponent` is `"person"` | The existing End game control. One click still waits for the other person. |

The client does not send `send-new-node` unless `activeOrder` is the local player's order. The computer's dot is drawn from `storage` like any other dot of order 2.
