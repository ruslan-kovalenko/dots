# Feature Specification: Unify Client and Server

**Feature Branch**: `001-unify-frontend-backend`

**Created**: 2026-10-26

**Status**: Draft

**Input**: User description: "Combine the frontend and backend directories into a single structure (monorepo) using npm workspaces. Configure the root package.json so that both parts can be launched with a single command: npm run dev."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start the whole game from the project root (Priority: P1)

A developer is at the project root and uses one start action. The player-facing application and the game server both start. The developer opens the local game and can play it against that local server without starting anything else.

**Why this priority**: The product is only usable locally when both parts are running. One start action is the outcome this feature exists to deliver.

**Independent Test**: With both parts already present and prepared, use the single start action at the project root, open the local game, and complete a play action that the local server must handle.

**Acceptance Scenarios**:

1. **Given** both parts are present and prepared and nothing is already running, **When** the developer uses the single start action at the project root, **Then** the player-facing application and the game server are both running.
2. **Given** both parts were started by that action, **When** a player opens the local game, **Then** the game is playable against that local server with no further start step.
3. **Given** both parts are running because of that action, **When** the developer stops the start action, **Then** both parts stop.

---

### User Story 2 - Work in one project instead of two (Priority: P2)

A developer obtains one project and finds both the player-facing application and the game server inside it. One prepare action at the project root makes both parts ready. Setup guidance does not send the developer to a second project.

**Why this priority**: Separate projects are why startup takes more than one action. One project is what makes a single prepare step and a single start action possible.

**Independent Test**: From a fresh copy of the project, confirm both parts are present, perform the single prepare action at the root, and follow the setup notes without opening another project.

**Acceptance Scenarios**:

1. **Given** a fresh copy of the project, **When** the developer inspects the project root, **Then** both the player-facing application and the game server are present as distinct parts of that one project.
2. **Given** a fresh copy of the project, **When** the developer performs the single prepare action at the project root, **Then** both parts are ready to start.
3. **Given** the unified project, **When** the developer follows the setup guidance, **Then** that guidance does not require a second project or a second prepare action.

---

### User Story 3 - See which part failed to start (Priority: P3)

A developer uses the single start action when one part cannot start. The outcome names the part that failed and does not report success.

**Why this priority**: A half-started product looks ready and hides the problem. Clear failure matters after the happy path works.

**Independent Test**: Prevent one part from starting, use the single start action, and confirm the outcome names that part and is not a success.

**Acceptance Scenarios**:

1. **Given** the game server cannot start, **When** the developer uses the single start action, **Then** the outcome names the game server as the failed part and does not report success.
2. **Given** the player-facing application cannot start, **When** the developer uses the single start action, **Then** the outcome names the player-facing application as the failed part and does not report success.
3. **Given** one of the two parts is absent from the project, **When** the developer uses the single start action, **Then** the outcome names the missing part and does not report success.

---

### Edge Cases

- One part is already running and holding the address the other part needs. The start action identifies which part could not start and does not report success.
- Preparation succeeded for only one part. The failing prepare or start outcome identifies that part rather than failing with an unidentified error.
- The start action is used outside the project root. It must not start only one part and report that the whole product is running. The supported success path is the project root.
- The developer stops the start action during a local game. Both parts stop, and that local game ends.
- Setup guidance still mentions the old two-project flow. The guidance for this project must describe only the single prepare action and the single start action.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST contain both the existing player-facing application and the existing game server as distinct parts of one project.
- **FR-002**: A developer MUST be able to prepare both parts with one action from the project root.
- **FR-003**: A developer MUST be able to start both parts with one action from the project root.
- **FR-004**: After a successful start, a player MUST be able to play the local game against the local server with no additional start step.
- **FR-005**: Stopping the start action MUST stop both parts.
- **FR-006**: Play behavior that the player-facing application and the game server already provide MUST remain available after they live in the one project. This feature does not add or remove game rules.
- **FR-007**: The two parts MUST stay distinguishable in the project and in start output, so a developer can tell the player-facing application from the game server.
- **FR-008**: If either part is missing or fails to start, the start action MUST end unsuccessfully and MUST identify which part failed or is missing.
- **FR-009**: Setup guidance MUST describe the one prepare action and the one start action at the project root, and MUST NOT require a second project.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer starts both parts with one action from the project root and does not use a second action or a second project.
- **SC-002**: A developer who has already prepared the project reaches a playable local game in under 2 minutes using only the documented start action.
- **SC-003**: Every local play flow that works against the separate server today still completes when both parts are started together from the one project.
- **SC-004**: In each checked case where one part cannot start, the developer can name the failed part from the start outcome alone on the first reading.

## Assumptions

- The player-facing application is the application already in this repository. The game server is the separate project that describes itself as the server for this game. Both are brought into this one project.
- Game rules, scoring, and how a player plays do not change. Only how a developer obtains, prepares, and starts the two parts changes.
- The supported place to prepare and start is the project root.
- The project constitution requires that both parts launch together through the project's single local development command. This specification states that outcome and does not choose a tool.
- Production hosting, release packaging, and publishing either part for other people to install are out of scope.
- Documentation files already stored in the repository are not a third runnable part.
- "Prepare" means the single action that makes both parts ready to start. "Start" means the single action that runs both parts for local play.
