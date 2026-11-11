# Feature Specification: Play Against the Computer

**Feature Branch**: `003-play-vs-bot`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "implement play against a bot; player-versus-player must remain; when the first player opens the game they choose to play against the bot or against a player"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a person or the computer (Priority: P1)

The first player to open an empty game chooses the opponent before any dot is placed. They can wait for another person, or start at once against the computer. A game between two people stays available and follows the rules the product already uses.

**Why this priority**: Without the choice, a person cannot decide whom they are playing, and adding the computer could accidentally remove the two-person game.

**Independent Test**: Open an empty game as the first player. Confirm both choices are shown and no dot can be placed yet. Choose a person, then join from a second window and place three dots that alternate, starting with the first player. Separately, open an empty game, choose the computer, and place a dot with no second person present.

**Acceptance Scenarios**:

1. **Given** an empty game and no opponent yet, **When** the first player opens it, **Then** they are offered two plain choices, "Play against a person" and "Play against the computer", and no dot can be placed.
2. **Given** the first player has chosen to play against a person and is still waiting, **When** a second person joins, **Then** the choice disappears, the second person does not see it, the first player moves first, and play follows the existing two-person rules.
3. **Given** the first player has chosen to play against a person and nobody has joined, **When** they switch to the computer, **Then** the computer takes the second seat and the first player may place a dot.
4. **Given** the first player has chosen the computer, **When** another person opens the game, **Then** that person is told the game is already being played against the computer and they do not become a player.
5. **Given** a second person joins before the first player has chosen, **When** that join happens, **Then** the match is person versus person, the choice is no longer shown, and the first player moves first.

---

### User Story 2 - Take a turn against the computer (Priority: P2)

The person who chose the computer is the first player and moves first. The computer is the second player and uses the second player's color. After the person places a legal dot, the computer places one legal dot of its own without anyone else acting. Capture, scoring, imprisoned dots, and illegal placements stay the same as in a two-person game.

**Why this priority**: The choice has no value until the computer actually answers a move under the same rules.

**Independent Test**: Start against the computer and place one dot. Confirm a second dot of the computer's color appears and the turn returns to the person. Then set up a diamond that the computer can close in one move, and confirm it imprisons the person's dot. Then set up a diamond the person could close on the next move, and confirm the computer occupies that cell instead.

**Acceptance Scenarios**:

1. **Given** a game against the computer, **When** the first player places a dot on a free intersection, **Then** exactly one dot of the computer's color appears on another free intersection and it is the person's turn again.
2. **Given** it is the computer's turn, **When** the person tries to place a dot, **Then** the board does not change and it remains the computer's turn until the computer has placed its dot.
3. **Given** the computer can imprison one or more of the person's dots with a single legal placement, **When** its turn arrives, **Then** it makes such a placement, those dots are imprisoned, and its score increases by that number.
4. **Given** the computer cannot imprison a dot this turn, and the person could imprison a computer dot on their next turn by filling one free intersection, **When** the computer's turn arrives, **Then** the computer occupies that intersection.
5. **Given** the computer can neither imprison nor block an immediate imprisonment, **When** its turn arrives, **Then** it places one dot on a free intersection next to the most recently placed dot, or on the free intersection nearest the center of the board when no such neighbor is free.
6. **Given** a placement the rules already refuse (occupied, inside a captured area, or not an intersection), **When** the person attempts it against the computer, **Then** the board and the turn stay unchanged.

---

### User Story 3 - Stop a game against the computer (Priority: P3)

A game against the computer ends when the board is full, or when the person asks to stop. The computer cannot click to agree, so the person's single request is enough. A game between two people still ends only when both people agree, or when the board is full. The result still shows both imprisoned-dot totals and the winner or a tie.

**Why this priority**: Players need a way to finish a computer game before the board is full. That ending must not weaken the two-person agreement rule.

**Independent Test**: Start against the computer, imprison one dot, and ask to stop. Confirm the game ends on that single request and names the person the winner. Separately, start a two-person game, have only one person ask to stop, and confirm play continues until the other agrees.

**Acceptance Scenarios**:

1. **Given** a game against the computer, **When** the person asks to stop, **Then** the game ends at once and shows both totals and the winner or a tie.
2. **Given** a game against the computer, **When** the computer has just moved and the person has not asked to stop, **Then** the game continues.
3. **Given** a game between two people, **When** only one person asks to stop, **Then** play continues until the other person agrees.
4. **Given** either kind of game, **When** the last free intersection receives a dot, **Then** the game ends and shows both totals and the winner or a tie.

---

### Edge Cases

- The first player refreshes while waiting for a person. They are still the first player, the board is still empty, and the choice is shown again.
- The first player refreshes after choosing the computer and after dots have been placed. The same game continues, including the computer's seat and whose turn it is.
- The person leaves a computer game before it ends. The board stays as it was until that person returns. Leaving does not award a win.
- The computer never leaves and never asks to stop on its own.
- The board fills on the computer's turn. The game ends because no free intersection remains, and the computer does not place a further dot.
- One placement by the computer could imprison more than one of the person's dots. Each imprisoned dot counts once, as in a two-person game.
- The person asks to stop at the same moment the board becomes full. The result is the result of the full board and does not change afterward.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the first player opens an empty game and no second participant has joined, the game MUST offer exactly two choices: play against a person, and play against the computer. No dot MUST be accepted until one of those outcomes is settled.
- **FR-002**: Choosing a person MUST leave the game waiting until a second person joins. While that wait lasts, the first player MUST be able to switch to the computer.
- **FR-003**: When a second person joins a game that is waiting for a person, the choice MUST disappear, that person MUST be the second player, and play MUST follow the existing two-person rules, including who moves first and how the game ends.
- **FR-004**: If a second person joins before the first player chooses, the game MUST become a two-person game and MUST NOT keep showing the choice.
- **FR-005**: Choosing the computer MUST start play immediately. The person who chose MUST be the first player and MUST move first. The computer MUST be the second player and MUST use the second player's color.
- **FR-006**: After the computer has taken the second seat, another person MUST NOT become a player in that game and MUST be told that the game is already being played against the computer.
- **FR-007**: On the computer's turn, the computer MUST place exactly one dot on one free intersection, under the same placement and capture rules as a person. The person MUST NOT be able to place a dot during that turn.
- **FR-008**: When the computer can imprison one or more opponent dots with one legal placement, it MUST do so. When it cannot, and the person could imprison a computer dot on the next turn by filling one free intersection, the computer MUST occupy that intersection. Otherwise it MUST place beside the most recently placed dot, or on the free intersection nearest the center when no adjacent free intersection remains.
- **FR-009**: The computer's dot MUST appear in time for the person to continue without treating the game as stuck.
- **FR-010**: A game against the computer MUST end when no free intersection remains, or when the person asks to stop. That single request MUST end the game. The computer MUST NOT end the game on its own.
- **FR-011**: A game between two people MUST still end only when both people confirm they want to stop, or when no free intersection remains. One person's request MUST NOT end that game by itself.
- **FR-012**: At the end of either kind of game, the game MUST show each side's total of imprisoned opponent dots, name the higher total as the winner, and show a tie when the totals are equal.
- **FR-013**: This feature MUST NOT change the board, the capture rules, the colors, or the scoring of a two-person game.

### Key Entities

- **Opponent choice**: The first player's selection on an empty game: waiting for a person, or playing the computer. It is unset until the first player chooses or a second person joins.
- **Computer**: The second participant when the computer was chosen. It has the second player's color and a score of imprisoned opponent dots. It is not a separate person and does not join or leave.
- **Player**: A person in the game. In a computer game there is one person, who is first. In a two-person game there are two, and the one who entered first moves first.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first player can choose the computer and place their first dot with no second person present.
- **SC-002**: In a checked computer game, every computer turn adds exactly one legal dot, and the person's next turn is available within 2 seconds of their own placement.
- **SC-003**: In every checked position where the computer can imprison N opponent dots in one placement, it does so and its score increases by N.
- **SC-004**: In every checked position where the person could imprison a computer dot on the next turn by filling one cell, and the computer cannot imprison anything this turn, the computer occupies that cell.
- **SC-005**: A two-person game still accepts the second person, alternates turns from the first player, and continues after only one person asks to stop.
- **SC-006**: Asking to stop once ends a computer game and shows both totals and the winner or a tie. The same single request does not end a two-person game.

## Assumptions

- One game is in progress at a time, as the product works today. This feature does not add a second simultaneous game.
- The person who opens an empty game is the first player, uses the first player's color, and moves first. The computer, when chosen, is always the second player. The person cannot choose to play as the second color.
- "Play against a person" uses the current two-person rules unchanged: the first person to enter moves first, one dot per turn, the same captures and scores, and both people must agree before the game stops early.
- The first player's choice stays available until a second participant exists. Choosing the computer, or a second person joining, settles it. After that it cannot be changed, and there is no rematch control in this feature.
- The computer follows the capture rules already in the product. It does not search ahead several moves, and it does not offer difficulty levels.
- The computer answers on its own turn. The person does not press a separate control to make the computer move.
- Labels on the choice are plain English, matching the current screen: "Play against a person" and "Play against the computer".
- A person who cannot join a computer game is told so in one sentence. They are not given a way to watch or to take over.
- Leaving a game still does not award a win. Difficulty settings, computer-versus-computer, more than two participants, and accounts are out of scope.
