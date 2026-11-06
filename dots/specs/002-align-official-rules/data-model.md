# Data Model: Align Official Dots Rules

The board is the set of 336 intersections produced from width 800, height 600, and gap 35 by the formula in `App.vue` `drawGrid`. This feature does not add or remove intersections. Grid `x` starts at 1 on the left. Grid `y` is 16 on the top row and decreases downward. The Vue 3 upgrade adds no game entity.

## Match

One game between two players, held by the server.

| Field | Required | Rule |
| --- | --- | --- |
| coordinates | yes | The board's intersections (`Coordinate`). |
| storage | yes | All placed dots (`Node`). At most one per intersection. |
| areas | yes | Captured areas. Empty until a loop imprisons at least one opponent dot. |
| activeOrder | yes | `1` or `2` while playing. `1` moves first. Empty while waiting. |
| phase | yes | `waiting`, `playing`, or `ended`. |
| endRequests | yes | The orders that have confirmed they want to stop. |
| result | yes | Empty until `ended`. Then both scores, and `winner` of `1`, `2`, or `tie`. |

**State transitions**:

1. `waiting`: fewer than two players. Placements are refused.
2. `playing`: both orders exist. Order 1 is active.
3. `playing`: a legal placement adds one node, may add one or more areas, and then the other order becomes active.
4. `ended`: no free intersection remains, or both orders are in `endRequests`. Further placements and end requests change nothing.

A disconnect does not change the match.

## Player

| Field | Required | Rule |
| --- | --- | --- |
| id | yes | Socket id, updated when the same user reconnects with the stored `userId`. |
| order | yes | `1` for the first connection, `2` for the second. |
| color | yes | The color already assigned to that order. |
| score | yes | The count of opponent dots this player has imprisoned. |

## Coordinate (intersection)

| Field | Required | Rule |
| --- | --- | --- |
| x, y | yes | Grid position. |
| offsetX, offsetY | yes | Bitmap position for drawing only. Never used to decide a capture. |
| isTrapped | yes | True when strictly inside a captured area. Such a point refuses new dots and vetoes a walk step beside it. |
| trappedBy | yes | The player whose area contains it, or empty. |

## Node (dot)

| Field | Required | Rule |
| --- | --- | --- |
| x, y | yes | One intersection. |
| player | yes | The owner. |
| coordinate | yes | The intersection it sits on. |
| isTrapped | yes | True only when strictly inside a captured area. Boundary nodes stay false. A trapped node is never part of a later chain. |
| partOfChain | yes | True after it bounded a scoring loop. It cannot start a new walk, but it can still be a step in one. |
| next | no | Walk link, reset after each attempt. |

## Chain (loop)

| Field | Required | Rule |
| --- | --- | --- |
| head, tail | yes | The first and last node of the walk. |
| activePlayer | yes | The mover whose dots form it. |
| chained | yes | True when the next chosen candidate equals the head. |
| signature | yes | The sorted `x,y` of its nodes. Used to avoid scoring the same loop twice. |

**Step rule**: Each step goes to an own, untrapped node exactly one cell away. When both kinds are available, a diagonal step is chosen over a straight one. Among steps of the same kind, the one nearest the head wins. A gap of two or more cells is never a step.

## Captured area

| Field | Required | Rule |
| --- | --- | --- |
| ownerOrder | yes | The player whose chain closed it. |
| outline | yes | The chain nodes in walk order. They are drawn as black lines. |
| interior | yes | Intersections strictly inside the outline polygon. |
| imprisoned | yes | Nodes on interior intersections. Opponent nodes among them raise the owner's score by one each, once. |

An area is not created, and no coordinate is marked, when its interior contains no opponent node.

## Placement

| Field | Required | Rule |
| --- | --- | --- |
| sender order | yes | Must equal `activeOrder` while `playing`. |
| x, y | yes | Must be an intersection, unoccupied, and not `isTrapped`. |

Failure leaves storage, areas, scores, and `activeOrder` unchanged.

## End request

| Field | Required | Rule |
| --- | --- | --- |
| sender order | yes | Recorded once. |
| effect | yes | One order does not end the game. The second distinct order ends it at once. |
