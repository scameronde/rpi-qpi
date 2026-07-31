# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version
numbers up to `V3.3.0` predate the project's current naming (it was renamed `ORBIT` at
`V3.3.0`, having started life as `RPIQR`/`RPIQPI`) and were not applied under a strict
[SemVer](https://semver.org/) discipline — several early tags (`V2.0.0`, `V2.0.1`) were cut
*after* the `V3-Agents-*` line while that earlier naming scheme was still being settled. They
are listed here in actual chronological order rather than sorted by version string.

Entries are backfilled from git history; each links to its tag on GitHub.

## [Unreleased]

### Added
- `CHANGELOG.md`, backfilled from git tag history, plus a Release Notes section in `CLAUDE.md` documenting the convention.
- `/change-architect` as a fourth pipeline entry point, recording the intended target state of small changes, bug fixes, and maintenance work in change briefs (typed as `defect`, `enhancement`, or `maintenance`) written to `thoughts/shared/changes/`, before `/fact-finder` maps the code — closing the gap where a bug fix's intent lived only in a chat prompt that vanishes with the session.
- `/planner`'s admission gate: it now refuses to plan from fact reports with `upstream-artifact: none`, unless they are QA reports (which already encode their own Soll-Ist comparison). This ensures every plan targets a recorded state instead of an unexamined prompt.
- `/just-do-it` as the change path's second exit, taking a `route: direct` brief directly to one reviewer and commit (with a Change Record), bypassing `/fact-finder` and `/planner` — closing the gap where small changes previously cost roughly twenty cold contexts and so people abandoned the pipeline for chat.
- `thoughts/shared/changes/AGENTS.md` as the directory's first local contract, asserting both the change brief's key set (including the new `route:` field) and the Change Record's — completing the governance chain for small work.

### Changed
- `/fact-finder` now loads the change brief work order from `thoughts/shared/changes/` alongside epics and feature briefs, and offers an explicitly exploratory report option when no target artifact is found, with a declaration line in the coverage map so exploratory runs distinguish themselves from directed ones.
- `/implement`'s wave acceptance check now tests positively for `thoughts/shared/epics/` sourced plans rather than enumerating every non-epic type, simplifying the schema.
- The V3 presentation deck's entry-point slide gained a fourth row for `/change-architect`, separating small changes and bug fixes from the QA pipeline.
- `/change-architect` now settles `route: direct | full` in its pre-write checklist, with the decision branching whether the brief routes to `/just-do-it` or the full `/fact-finder → /planner → /implement` pipeline.
- `/fact-finder` and `thoughts-locator` now exclude `-RECORD.md` Change Records from their work-order and brief-discovery globs, keeping completed small changes from resurfacing in new work.
- `CLAUDE.md`'s pipeline-duplication section no longer implies that five prose copies are the whole surface. It now names the three families of table the fifth item hid, and the four closed enumerations that skills consume mechanically — where a missing directory produces no error at all, just an artifact nobody ever finds.

### Fixed
- The CLAUDE.md citation of the plan key-set assertion in `thoughts/shared/plans/AGENTS.md` was corrected from the wrong lines (118-119, STATE task checklist rules) to the right ones (120-121, the actual frontmatter key-set definitions).
- `thoughts-locator` now returns all 10 artifact categories. Feature briefs had been in its archive map with no answer-template section to report them under — a pre-existing gap, now closed alongside the new change-brief section.

## [V4.0.1] - 2026-07-30

### Changed
- Externalized the MCP server URLs (`CRAWL4AI_MCP_URL`, `SEARXNG_MCP_URL`) into a gitignored `.env`, so a clone without one now starts with no working MCP server instead of a hardcoded endpoint.
- Updated the ORBIT presentation for version 4.

## [V4.0.0] - 2026-07-30

The largest release to date: reworks `/implement`'s execution model, threads an inherited-constraints
and frontmatter traceability chain across the whole pipeline, and repairs the QA skills.

### Added
- A `/commit` skill for grouping outstanding changes into logically-scoped commits.
- A Boundary Check after each `/implement` wave, so a path no task declared is caught instead of silently landing.
- Plan and STATE file frontmatter (`fact-source`, `upstream-artifact`, `plan:`, etc.), completing the artifact traceability chain described in `CLAUDE.md`.
- A two-condition test (own value proposition **and** several parallel streams) for routing an oversized brownfield feature to `/mission-architect` instead of `/feature-architect`.
- An inherited-constraints chain carried from spec → epic → fact-finder → plan, so downstream skills see constraints the upstream artifact recorded.
- Real frontmatter and a `Verify:` section for the `python-qa`, `typescript-qa`, `logic-bugs-qa`, and `clean-code` skills' reports.

### Changed
- `/implement`'s implementer subagents now run on `haiku` (reviewers stay on the session model).
- `Verify:` commands in a plan must assert content, not just quantity or existence.
- STATE files advance per commit rather than per task.
- Brownfield routing goes `/feature-architect` → `/fact-finder`, skipping `/epic-planner` (which exists to split a whole spec into parallel streams — a single feature is a single stream).
- `/fact-finder` now loads its upstream artifact directly instead of relying only on the prose request.
- Consolidated the tool permission allowlist, dropping one-off entries.

### Removed
- The sequential-thinking MCP server and every call site referencing it.
- The load-bearing DOX rules out of `.claude/**/AGENTS.md` — moved into the skills' own frontmatter, since those files couldn't be kept in sync automatically.
- The superseded `doc/`, `dist/`, and scratch working trees.

## [V3.6.0] - 2026-07-27

### Changed
- `/implement` now executes a plan wave-by-wave (concurrent, disjoint-file tasks per wave) instead of task-by-task.
- `/planner` emits the wave/model/verify contract that `/implement` now consumes.
- `/prototype` is pinned to the `opus` model and is now explicitly forbidden from invoking `/implement`.

## [V3.5.0] - 2026-07-24

### Added
- A `/prototype` skill: spikes a rough idea into disposable code inside an isolated git worktree and reaches an explicit go/no-go/iterate decision, writing a learnings note to `thoughts/shared/prototypes/` regardless of outcome.
- A hook from `/feature-architect`'s Phase 1 into prior prototype learnings notes.

### Fixed
- STATE files now get updated after each task, not just at plan completion.
- `dox-init` and `dox-update` now exclude `.claude` from their directory scans (and the fix was mirrored into the `dist/orbit` copies).

## [V3.4.0] - 2026-07-16

### Changed
- Renamed the `/researcher` skill to `/fact-finder` and its output directory `thoughts/shared/research/` to `thoughts/shared/facts/`, across every skill, agent, doc, and presentation that referenced either name.

### Added
- First draft of the ORBIT V4 concept document.

## [V3.3.0] - 2026-06-12

### Changed
- Renamed the project to **ORBIT** and packaged it as an installable Claude Code plugin.
- Replaced the built-in MCP servers with hosted VIER MCP servers.
- Context7's API key is now referenced via an environment variable rather than hardcoded.

### Added
- `scripts/build-plugin.sh`, generating `dist/orbit/` from `.claude/` + `.mcp.json`.

## [V3.2.0] - 2026-06-11

### Changed
- Renamed the `subagent-driven-development` skill directory to `implement`, and updated every cross-reference to it (`.claude/AGENTS.md`, `.claude/agents/AGENTS.md`, `.claude/skills/AGENTS.md`, the planner skill, `thoughts/shared/AGENTS.md`, and the SessionStart hook).

### Added
- ORBIT Agentic Assembly Line presentation (V3), including a DOX framework slide and a partial German translation.

## [V3.1.0] - 2026-06-10

### Added
- `dox-init` skill: bootstraps a DOX `AGENTS.md` governance tree.
- `dox-update` skill: detects and regenerates stale `AGENTS.md` files.

## [V3.0.1] - 2026-06-09

### Added
- DOX framework integration (directory-scoped `AGENTS.md` governance contracts).

## [V3.0.0] - 2026-06-09

A full rework from Commands+Agent pairs onto Skills, matching the shift to Claude Code as the
target harness.

### Added
- Skills converted from the former OpenCode agents: `mission-architect`, `feature-architect`, `specifier`, `epic-planner`, `researcher`, `planner`.
- `subagent-driven-development` skill (SKILL.md + 3 prompt templates).
- A SessionStart hook injecting workflow-skill awareness into every session.
- Workflow restructure design spec and Superpowers reference documents.

### Removed
- The old `commands/` directory and the standalone Implementation-Controller / Coder agent files it replaced.

## [V2.0.1] - 2026-03-23

### Changed
- Updated presentations and `README.md`.

## [V2.0.0] - 2026-03-20

### Added
- Experimental LSP tool enabled for code analysis agents.
- `feature-architect` agent, for brownfield (existing-system) feature work.
- User-facing documentation.

## [V3-Agents-1.5] - 2026-02-13

### Fixed
- Missing `context` command.

## [V3-Agents-1.4] - 2026-02-13

### Added
- `small_model` config; normalized JSON formatting across configs.

## [V3-Agents-1.3] - 2026-02-13

### Added
- `todos` command for tracking open tasks.
- `context-usage` plugin for token analysis.

## [V3-Agents-1.2] - 2026-02-07

### Changed
- Removed backward-compatibility mappings and language enumerations from `planner`/`researcher`, making them generic across target languages instead of listing Python/TypeScript explicitly.

### Removed
- Deprecated agents superseded by the V3 skill consolidation.

## [V3-Agents-1.1] - 2026-02-06

### Changed
- Switched the toolkit's own development workflow onto its own agents.

## [V3-Agents] - 2026-02-05

### Added
- `python-qa`, `typescript-qa`, and `opencode-qa` skills, consolidating the prior QA agent variants.
- Java and Kotlin QA skills.
- `clean-code` and `logic-bugs-qa` skills.

### Removed
- The six superseded QA agents, moved to `deprecated/` and then removed.

## [V2-Agents] - 2026-02-05

### Added
- crawl4ai tool integration for the web-search-researcher agent, including a decision tree for when to use it over SearXNG.

### Changed
- Unified and simplified the agent set (merged overlapping agents, simplified the implementation-controller).
- Planners now list tasks explicitly in the STATE file.
- Refreshed README, including corrected install-step documentation.

## [after-optimization-hope-so] - 2026-01-21

A large agent-to-agent communication optimization pass across essentially every agent.

### Added
- Structured YAML frontmatter and thinking/answer separation to `codebase-analyzer`, `codebase-locator`, `codebase-pattern-finder`, `thoughts-analyzer`, `thoughts-locator`, `web-search-researcher`, `implementation-controller`, and the QA agent variants.
- Query-specific depth support and delegation examples across consumer agents.
- A task-complexity heuristic driving conditional delegation in the implementation-controller.

### Changed
- Renamed skills to concise kebab-case names.

## [before-optimization] - 2026-01-17

Initial state of the agent framework, then named RPIQR/RPIQPI.

### Added
- Python and TypeScript QA agent variants (quick/thorough), and a QA-Planner bridge agent.
- Greenfield workflow agents: Mission-Architect, Specifier, Epic-Planner.
- Controller-Executor architecture, replacing the original Implementor agent.
- STATE-based progress tracking for the planning workflow.
- A `dify-reference` skill (alpha) and an OpenCode agent/skill development skill.

### Changed
- Renamed the project from RPIQR to RPIQPI.
- Promoted `qa-planner` from subagent to primary agent.

### Removed
- The deprecated `python-qa-auditor` agent and all references to it.

[Unreleased]: https://github.com/scameronde/rpi-qpi/compare/V4.0.1...HEAD
[V4.0.1]: https://github.com/scameronde/rpi-qpi/compare/V4.0.0...V4.0.1
[V4.0.0]: https://github.com/scameronde/rpi-qpi/compare/V3.6.0...V4.0.0
[V3.6.0]: https://github.com/scameronde/rpi-qpi/compare/V3.5.0...V3.6.0
[V3.5.0]: https://github.com/scameronde/rpi-qpi/compare/V3.4.0...V3.5.0
[V3.4.0]: https://github.com/scameronde/rpi-qpi/compare/V3.3.0...V3.4.0
[V3.3.0]: https://github.com/scameronde/rpi-qpi/compare/V3.2.0...V3.3.0
[V3.2.0]: https://github.com/scameronde/rpi-qpi/compare/V3.1.0...V3.2.0
[V3.1.0]: https://github.com/scameronde/rpi-qpi/compare/V3.0.1...V3.1.0
[V3.0.1]: https://github.com/scameronde/rpi-qpi/compare/V3.0.0...V3.0.1
[V3.0.0]: https://github.com/scameronde/rpi-qpi/compare/V2.0.1...V3.0.0
[V2.0.1]: https://github.com/scameronde/rpi-qpi/compare/V2.0.0...V2.0.1
[V2.0.0]: https://github.com/scameronde/rpi-qpi/compare/V3-Agents-1.5...V2.0.0
[V3-Agents-1.5]: https://github.com/scameronde/rpi-qpi/compare/V3-Agents-1.4...V3-Agents-1.5
[V3-Agents-1.4]: https://github.com/scameronde/rpi-qpi/compare/V3-Agents-1.3...V3-Agents-1.4
[V3-Agents-1.3]: https://github.com/scameronde/rpi-qpi/compare/V3-Agents-1.2...V3-Agents-1.3
[V3-Agents-1.2]: https://github.com/scameronde/rpi-qpi/compare/V3-Agents-1.1...V3-Agents-1.2
[V3-Agents-1.1]: https://github.com/scameronde/rpi-qpi/compare/V3-Agents...V3-Agents-1.1
[V3-Agents]: https://github.com/scameronde/rpi-qpi/compare/V2-Agents...V3-Agents
[V2-Agents]: https://github.com/scameronde/rpi-qpi/compare/after-optimization-hope-so...V2-Agents
[after-optimization-hope-so]: https://github.com/scameronde/rpi-qpi/compare/before-optimization...after-optimization-hope-so
[before-optimization]: https://github.com/scameronde/rpi-qpi/releases/tag/before-optimization
