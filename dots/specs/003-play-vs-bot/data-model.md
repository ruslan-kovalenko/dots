# Data Model: Play Against the Computer

One match per server process, the same in-memory model as today. This feature adds the opponent and the computer seat. Dots, areas, scores, and the two-person ending are unchanged.

## Match

| Field | Required | Rule |
| --- | --- | --- |
| phase | yes | `waiting`, `playing`, or `ended`. |
| activeOrder | yes | `1` or `2` while playing. Empty while waiting or ended. Order 1 moves first. |
| opponent | yes | `null`, `"person"`, or `"computer"`. |
| players | yes | Order 1 is the person who opened the game. Order 2 is either a person or the computer. |
| endRequests | yes | Orders that have asked to stop. |
| scores | yes | Imprisoned opponent dots, `{ 1, 2 }`. |
| result | yes | Empty until `ended`. Then both scores and `winner` of `1`, `2`, or `"tie"`. |

`snapshot()` adds `opponent` to the broadcast state. Other fields stay as they are.

## Opponent choice

| State | Who is seated | What the first player sees |
| --- | --- | --- |
| `opponent: null`, phase `waiting` | order 1 only | "Play against a person" and "Play against the computer". No dots. |
| `opponent: "person"`, phase `waiting` | order 1 only | Waiting for a person, and "Play against the computer". No dots. |
| `opponent: "person"`, phase `playing` | two people | The board. No choice. |
| `opponent: "computer"`, phase `playing` | person and computer | The board. No choice. |

Transitions:

1. `choose-opponent` `"person"` while `opponent` is `null` and only order 1 is seated sets `opponent` to `"person"` and leaves `phase` as `waiting`.
2. `choose-opponent` `"computer"` while only order 1 is seated sets `opponent` to `"computer"`, seats the computer, sets `phase` to `playing`, and sets `activeOrder` to `1`.
3. A second person connecting while only order 1 is seated sets `opponent` to `"person"`, sets `phase` to `playing`, and sets `activeOrder` to `1`. Any stored waiting choice is replaced by this.
4. After `phase` is `playing` or `ended`, `choose-opponent` changes nothing.

A refresh of order 1 keeps the same seat, the same `opponent`, and the same board. The computer has no window to refresh.

## Computer

| Field | Required | Rule |
| --- | --- | --- |
| id | yes | The fixed string `"computer"`. Not a socket id. |
| order | yes | `2`. |
| color | yes | The second player's color, the same blue the product already uses. |

Validation:

- Seated only from `choose-opponent` `"computer"` when `users` holds order 1 alone.
- Never returned by `orderOf` for a socket.
- A later connection does not replace this record and does not receive `register-player`. That socket receives `seat-refused` instead.

## Computer move

Input is the current dots, the free intersections, and whose latest dot was placed. Output is one `{ x, y }` from [research.md](./research.md).

Validation:

- The cell is an intersection, unoccupied, and not inside a captured area.
- `Match.place(2, x, y)` is the only write. If it returns false, the server does not try a second cell and does not change the turn.
- The person cannot place while `activeOrder` is `2`.

## Ending

| Opponent | Request | Effect |
| --- | --- | --- |
| `"computer"` | order 1 asks to stop | `phase` becomes `ended` at once. `result` is set from the scores. |
| `"computer"` | nobody has asked | Play continues. The computer does not ask. |
| `"person"` | one order asks | `phase` stays `playing`. |
| `"person"` | both orders have asked | `phase` becomes `ended`. |
| either | no free intersection remains | `phase` becomes `ended` from the placement that filled the board. A later stop request does not change `result`. |

## Relationships

- One match has one `opponent` and at most two players.
- The computer, when present, is the order-2 player and has a score of imprisoned dots like a person.
- Dots and captured areas are unchanged: a dot belongs to an order, and an area records `ownerOrder`, outline, and interior.
