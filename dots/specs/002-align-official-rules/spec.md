# Feature Specification: Align Official Dots Rules

**Feature Branch**: `002-align-official-rules`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "fixing app's logic according to the official rules of the game" — two players place one dot per turn on a free grid intersection; the player who connected first moves first; passing is forbidden; a closed one-cell loop (vertical, horizontal, or diagonal) imprisons the opponent's dots inside; a diagonal link between ally dots takes priority over a straight link around the same dots; the closed loop is drawn as a captured area; dots inside are out of play; an empty surround is not a capture and scores nothing; the player who imprisoned more opponent dots wins when the board is full or both players agree to stop.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Take turns placing one dot (Priority: P1)

Two players join a game. The player who connected first places the first dot. After that, they alternate. On a turn, the player places one dot of their own color on a free intersection. The turn does not pass until that dot is placed. A player cannot skip.

**Why this priority**: Every later rule depends on whose turn it is and where a single new dot may go. Without this, capture and scoring cannot be judged.

**Independent Test**: With two players joined and an empty board, place three dots. Confirm the first player to connect placed the first dot, the other player placed the second, the first player placed the third, and no turn changed without a new dot.

**Acceptance Scenarios**:

1. **Given** no one has joined, **When** the first player connects and then a second player connects, **Then** the first player is the one who moves first.
2. **Given** both players have joined and it is a player's turn, **When** that player places a dot on a free intersection, **Then** exactly one dot of that player's color appears there and the turn passes to the other player.
3. **Given** it is a player's turn, **When** that player tries to place a dot on an occupied intersection, **Then** the board does not change and it remains that player's turn.
4. **Given** it is a player's turn, **When** that player looks for a way to skip the turn, **Then** no such action exists and the turn stays with that player until a legal dot is placed.
5. **Given** only one player has connected, **When** that player tries to place a dot, **Then** the board does not change.

---

### User Story 2 - Imprison opponent dots with a closed loop (Priority: P2)

A player places a dot that closes an unbroken loop of their own dots around one or more opponent dots. Neighboring dots in that loop touch vertically, horizontally, or diagonally across exactly one grid cell. When both a diagonal step and a straight step could be the boundary around the same opponent dots, the diagonal step is the one that counts and the one that is drawn. The dots inside become imprisoned, the loop is shown as lines joining those dots into a closed area, and those imprisoned opponent dots count toward the capturer's score. A surround with no opponent dot inside is not a capture: it scores nothing and creates no area.

**Why this priority**: Capture is the only way to score. Turn-taking alone does not decide a winner.

**Independent Test**: Place the four own dots that sit on the four straight sides of one opponent dot. Confirm that opponent dot is imprisoned, the drawn boundary is the diamond of four diagonal sides, and the capturer's score increases by one. Then close a loop around empty intersections and confirm the score does not change and no area appears.

**Acceptance Scenarios**:

1. **Given** one opponent dot and three of a player's dots already on three of the four straight-adjacent intersections, **When** that player places the fourth dot on the remaining straight-adjacent intersection, **Then** the opponent dot is imprisoned, the four own dots are joined by their four diagonal sides into a diamond, the score increases by one, and no larger outline is drawn.
2. **Given** a player's dots already include both the four side dots of that diamond and extra own dots on the outer corners, **When** the diamond can be closed, **Then** the drawn boundary is still the four diagonal sides, and the corner dots are not required for the capture and are not part of that drawn loop.
3. **Given** the only way to close a loop around an opponent dot is a chain of one-cell straight steps, **When** the player places the dot that closes that chain, **Then** the opponent dot is imprisoned and the drawn boundary follows those straight steps.
4. **Given** two of a player's dots are two or more grid cells apart, **When** a loop would need that gap to count as a side, **Then** that gap does not count as a connection and no capture is awarded for it.
5. **Given** a player places a dot that would surround only empty intersections, **When** the dot is placed on a free intersection, **Then** the dot stays, the turn passes, the score does not change, and no captured area or boundary lines are created.
6. **Given** a captured area exists, **When** either player tries to place a dot inside it, **Then** the placement is refused and the turn does not pass.
7. **Given** dots are already imprisoned inside a captured area, **When** a later loop would have to use any of those imprisoned dots as part of its boundary, **Then** that loop is not formed and no new capture is awarded from those dots.

---

### User Story 3 - End the game and name the winner (Priority: P3)

The game ends when every intersection is filled, or when both players agree to stop. The result shows how many opponent dots each player imprisoned. The higher total wins. Equal totals are a tie.

**Why this priority**: Players need a shared ending and a winner. Capture can already be checked before the game knows how to stop.

**Independent Test**: Finish a game in which one player has imprisoned more opponent dots than the other, once by filling the board and once by both players agreeing to stop. Both endings name the same winner and the same totals.

**Acceptance Scenarios**:

1. **Given** a game in progress, **When** the last free intersection receives a dot, **Then** the game ends and shows each player's imprisoned-dot total.
2. **Given** both players have confirmed that they want to stop, **When** the second confirmation is given, **Then** the game ends and shows each player's imprisoned-dot total.
3. **Given** only one player has asked to end the game, **When** the other player has not agreed, **Then** play continues.
4. **Given** the game has ended, **When** the totals are compared, **Then** the player with more imprisoned opponent dots is the winner, and equal totals are shown as a tie.

---

### Edge Cases

- An opponent dot has own dots on all eight surrounding intersections. The capture is the inner diamond of four diagonal sides. The four corner dots stay outside that area.
- A loop surrounds both opponent dots and the mover's own dots. Opponent dots inside add to the score. Every dot strictly inside the area is out of play, whether or not it added to the score.
- A player indicates a point that is not an intersection. No dot is placed and the turn does not pass.
- The board has no free intersection left at the moment both players would agree to stop. The game has already ended by a full board, and a late agreement does not change the result.
- A player leaves before the game ends. The board, the imprisoned dots, and whose turn it is stay as they were until that player returns. This feature does not award a win because a player left.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST be played by two players, each with a distinct color.
- **FR-002**: The player who connects first MUST move first. The player who connects second MUST move second.
- **FR-003**: Play MUST NOT accept a dot until both players have connected.
- **FR-004**: On a turn, the active player MUST place exactly one dot of their own color on one free intersection.
- **FR-005**: The game MUST NOT offer a way to skip or pass a turn.
- **FR-006**: A placement on an occupied intersection, off the board, or inside an existing captured area MUST be refused and MUST leave the turn unchanged.
- **FR-007**: After a legal placement, the turn MUST pass to the other player.
- **FR-008**: A capturing loop MUST be an unbroken closed chain of the mover's dots in which every step is a vertical, horizontal, or diagonal neighbor exactly one grid cell away. A gap of two or more cells MUST NOT count as a step.
- **FR-009**: When both a one-cell diagonal step and a one-cell straight step could bound the same opponent dots, the diagonal step MUST be the boundary that is drawn and the straight step MUST NOT be that boundary. The smallest such capture is four own dots on the four straight sides of an opponent dot, joined by the four diagonals into a diamond.
- **FR-010**: A straight one-cell step MUST still be a valid boundary when no diagonal step is available around those opponent dots.
- **FR-011**: When a legal placement closes one or more such loops around opponent dots, those opponent dots MUST become imprisoned, the loop dots MUST be joined by visible lines in loop order into a closed area, and the mover's score MUST increase by the number of newly imprisoned opponent dots.
- **FR-012**: The lines of a captured area MUST be a color that is neither player's color, so the area stays distinct from both colors of dots.
- **FR-013**: A placement that surrounds no opponent dot MUST still be legal: the dot MUST stay, the turn MUST pass, the score MUST NOT change, and no captured area or boundary lines MUST be created.
- **FR-014**: Dots strictly inside a captured area MUST stay out of play: no new dot may be placed there, and those dots MUST NOT form part of a later capturing loop. Dots that form the boundary stay in play.
- **FR-015**: The game MUST end when no free intersection remains.
- **FR-016**: The game MUST end when both players confirm that they want to stop. One player's request MUST NOT end the game by itself.
- **FR-017**: At the end, the game MUST show each player's total of imprisoned opponent dots, name the player with the higher total as the winner, and show a tie when the totals are equal.
- **FR-018**: Imprisoned dots MUST remain visible and MUST keep the color they had when captured.
- **FR-019**: The set of intersections MUST remain the board the product already uses. This feature MUST NOT add or remove intersections.

### Key Entities

- **Player**: One of the two participants. Has a connection order, a color, and a score equal to the number of opponent dots they have imprisoned.
- **Dot**: A single mark on one intersection. Belongs to one player. Is either free to be part of future loops or imprisoned inside a captured area.
- **Intersection**: A crossing where a dot may be placed. It is free, occupied, or inside a captured area.
- **Captured area**: A closed loop of one player's dots that contains at least one opponent dot. The loop is drawn as lines between those dots. It records which dots are imprisoned and which player scores them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a checked sequence of 20 legal placements with both players connected, every placement adds exactly one dot and the mover alternates, starting with the player who connected first.
- **SC-002**: In every checked empty surround, the new dot stays, the turn passes, both scores stay unchanged, and no captured area or boundary lines appear.
- **SC-003**: In every checked capture of N opponent dots, the capturer's score increases by N, those N dots are shown as imprisoned, the loop is drawn with lines, and none of those dots can be used as part of a later loop.
- **SC-004**: In every checked case where one opponent dot is surrounded by own dots on its four straight sides, that dot is imprisoned and the drawn boundary is the four diagonal sides, including when extra own dots also sit on the outer corners.
- **SC-005**: In a checked set of illegal placements (occupied point, interior of a captured area, a point that is not an intersection, and a turn skip), 100% leave the board and the active player unchanged.
- **SC-006**: When a checked game ends, a player can see both totals and the winner or the tie without placing another dot. Filling the board and an agreed stop produce the same comparison of totals.

## Assumptions

- The board already used by the product stays the board for this feature. The official range of 20 by 20 to 30 by 30 squares, or a whole page, is satisfied by keeping that existing page rather than replacing it.
- "Connected first" means the first of the two players to enter the game, which is the current way the first mover is chosen. Players do not pick the first mover by a separate agreement.
- No special opening restriction applies. A dot may be placed on any free intersection outside captured areas.
- "Invalid" for an empty surround means the capture does not exist. The placement itself stays legal, because skipping a turn is forbidden and a free intersection must still accept a dot.
- If one placement closes more than one valid loop, each imprisoned opponent dot is scored once.
- A player's own dots strictly inside a scored area are out of play and do not add to the score. Only opponent dots add to the score.
- The boundary lines are neither player's color. Their exact shade is not otherwise specified.
- Agreement to end is an explicit confirmation from each player. The second confirmation ends the game. The game does not infer agreement from inactivity and does not separately search the board to prove that no capture remains; the players make that judgment by agreeing.
- A player leaving, rematches, and play with more than two players are out of scope.
- Colors, sounds, and account names are unchanged except where a result must show who won.
