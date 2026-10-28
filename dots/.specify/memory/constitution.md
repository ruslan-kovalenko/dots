<!--
Sync Impact Report
- Version change: 1.0 → 1.1.0
- Modified principles:
  - Tech Stack → Technology Stack (declarative MUST rules; same stack)
  - Project structure → Project Structure (declarative MUST rules; same layout)
- Added sections:
  - I. Clean Code
  - II. Simple UX
  - III. Responsive Design
  - IV. Minimal Dependencies
  - V. Unit Testing (NON-NEGOTIABLE)
  - Governance
- Removed sections: none
- Follow-up TODOs: none
-->

# Dots Constitution

## Core Principles

### I. Clean Code

Code MUST be readable without a guide: names state the domain concept, functions do one
job, and unused code is deleted rather than commented out. A change MUST NOT add a branch,
layer, or abstraction that the current behavior does not need. Complexity that remains MUST
be justified in the change that introduces it.

Rationale: unclear code hides broken play rules and makes the client and server drift apart.

### II. Simple UX

The primary path MUST be obvious: a player can start a local game and take a turn without
learning a second screen or a hidden control. Labels MUST use plain language. A new control
MUST NOT ship when an existing one already does that job.

Rationale: extra steps and duplicate controls make the board harder to play.

### III. Responsive Design

The client MUST remain usable at phone width and at desktop width. Layout, type, and hit
targets MUST adapt to the viewport. A viewport MUST NOT require horizontal scrolling to
reach the board or the score.

Rationale: the same game is played on small and large screens.

### IV. Minimal Dependencies

A new dependency MUST be refused when the language, the platform, or a dependency already
in the repo can do the job. A second library MUST NOT be added for a job an existing
library already covers. Each added dependency MUST have a one-line reason in the change
that adds it.

Rationale: extra packages increase install cost and the chance of conflicting behavior.

### V. Unit Testing (NON-NEGOTIABLE)

Unit tests MUST use Jest for the client and for the server. A behavior change MUST include
Jest unit tests for the client code it changes and for the server code it changes. This
principle supersedes any other testing guidance, including any other test runner named in
plans, tasks, scripts, or the rest of this constitution.

Rationale: one runner for both parts keeps coverage comparable and stops a second runner
from becoming the real standard.

## Technology Stack

The client and the server MUST be written in TypeScript and MUST run on Node.js. Realtime
play MUST use WebSocket. Client styles MUST be written in SASS. The client UI MUST be
Vue.js 3.

## Project Structure

The repository MUST be one npm workspaces monorepo that contains the client and the server
as separate workspaces. From the repository root, `npm run dev` MUST launch both the client
and the server. A second command MUST NOT be required to start the local product.

## Governance

This constitution supersedes conflicting practice. Principle V supersedes every other
testing instruction, including instructions in this file. An amendment MUST bump the
version, set Last Amended to the amendment date, and record what changed in the Sync
Impact Report before that report is removed for commit. Version policy: MAJOR for a
removed or redefined principle, MINOR for a new or materially expanded principle, PATCH
for wording that does not change a rule. A change that touches stack, structure, UX,
dependencies, or tests MUST be checked against the principles above before it is accepted.

**Version**: 1.1.0 | **Ratified**: 2026-10-26 | **Last Amended**: 2026-10-27
