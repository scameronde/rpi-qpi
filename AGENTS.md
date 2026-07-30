# DOX framework

- DOX is a highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products and durable docs must remain understandable from the nearest AGENTS.md plus every parent above it

## Read Before Editing

1. Read the root AGENTS.md (this file)
2. Identify every file and folder you intend to touch
3. Walk the path from the repository root to each target
4. At each level, check for an AGENTS.md file and read it
5. If a parent lists a Child DOX entry whose scope contains your target, read that child and continue
6. Use the nearest AGENTS.md as the local contract; parents supply repo-wide rules

## Update After Editing

Update the closest owning AGENTS.md when a change affects:
- Purpose, scope, or ownership of a component
- Durable structure, contracts, or workflows
- Inputs, outputs, permissions, constraints, or artifacts
- User preferences
- Creation, deletion, or moving of AGENTS.md files

Closeout checklist:
1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and affected parents/children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## Hierarchy

- Root AGENTS.md (this file): project-wide instructions, global preferences, durable workflow rules
- Child AGENTS.md files: domain-specific instructions, their own Child DOX Index
- Proximity rule: the closer a doc is to the work, the more specific and practical it must be
- Conflict rule: closer doc governs local details; no child may weaken DOX or CLAUDE.md

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs, concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across files unless each scope needs a local version
- Delete stale notes instead of explaining history

## User Preferences

*(Record durable behavior changes requested by the user here.)*

## Project: ORBIT — Claude Code Workflow Toolkit

An agentic engineering framework for Claude Code. Provides a full pipeline from project vision to code implementation via specialized skills, subagents, and MCP servers. There is no application code: the product is the prompt set in `.claude/`. The distributable plugin is built on demand into `dist/orbit/` by `scripts/build-plugin.sh` and is not committed.

**Workflow pipeline:**
- Greenfield: `/mission-architect` → `/specifier` → `/epic-planner` → `/fact-finder` → `/planner` → `/implement`
- Brownfield: `/feature-architect` → `/fact-finder` → `/planner` → `/implement` (a single feature is a single stream, so epic decomposition does not apply)
- Brownfield subsystem: work with its own value proposition **and** several parallel streams takes the greenfield path instead, and its mission records the host system as a constraint. Either condition alone stays brownfield.
- Small fix: `/change-architect` → `/fact-finder` → `/planner` → `/implement`
- Optional entry point: `/prototype` → one of the four above, on a "go" decision

**Key rule:** Every route begins with a target artifact. `/fact-finder` must precede `/planner`; `/planner` must precede `/implement`. `/planner` refuses a `facts/`-sourced report carrying `upstream-artifact: none`, and QA-sourced plans are exempt. See `CLAUDE.md` for full documentation.

## Child DOX Index

- [thoughts/shared/](thoughts/shared/AGENTS.md) — Workflow artifact store: facts, plans, QA, and more

`.claude/` is deliberately absent from this index and carries no `AGENTS.md`. `dox-init` and `dox-update` exclude it, so files there were hand-maintainable only and went stale; `031e491` removed all three and moved the load-bearing rules into the skills themselves. Every `SKILL.md` and agent file states its own name, description and contract in frontmatter. Do not re-add DOX files under `.claude/`.
