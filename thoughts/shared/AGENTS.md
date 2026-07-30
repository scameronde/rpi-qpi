# thoughts/shared/ — Workflow Artifact Store

## Purpose

Persistent artifact store for all workflow pipeline outputs. Every stage of the pipeline writes here; downstream stages read from here. Files here represent durable project knowledge — research findings, decisions, implementation plans, and quality reviews.

## Ownership

- Skills write artifacts here; they do not delete or overwrite existing files
- The `/implement` orchestrator updates STATE files in `plans/` as it commits (implementer subagents never touch STATE files directly)
- All other files are write-once after creation

## Local Contracts

**Naming convention:** `YYYY-MM-DD-Topic.md` for all artifact files. Epics carry their ID in the filename — `YYYY-MM-DD-EPIC-NNN-Topic.md`, matching the file's `epic-id:` frontmatter — so a decomposition's sequence is visible from `ls`. Epic files written before that convention lack the segment.

**Directory assignments:**
| Directory | Written by | Read by |
|---|---|---|
| `missions/` | `/mission-architect` | `/specifier` |
| `features/` | `/feature-architect` | `/fact-finder` |
| `changes/` | `/change-architect` | `/fact-finder` |
| `specs/` | `/specifier` | `/epic-planner` |
| `epics/` | `/epic-planner` | `/fact-finder`, `/planner` |
| `facts/` | `/fact-finder` | `/planner` |
| `qa/` | `/fact-finder` (QA mode) | human review, `/planner` (QA plans) |
| `prototypes/` | `/prototype` | `/feature-architect`, `/fact-finder` |
| `plans/` | `/planner` | `/implement` |

A feature brief goes straight to `/fact-finder`: brownfield skips `/epic-planner`, because epic decomposition exists to cut a whole specification into several parallel streams and one feature is one stream. A change brief goes straight to `/fact-finder` for the same reason. A change brief carries no `## Inherited Constraints` section, so `/fact-finder` writes `None` in its own table.

**Populated today:** `plans/`, `facts/`, `qa/`, `features/`, `epics/`. **Empty today:** `missions/`, `specs/`, `prototypes/`, `changes/`. File counts are not a contract — they change with every pipeline run, so `ls` is the authority, not this file.

## Work Guidance

- Never edit facts or plan files manually while `/implement` is executing
- When referencing an artifact in a plan or prompt, use the full relative path from the repo root
- Artifact files are read-only after creation (except STATE files in `plans/`)
- A subdirectory with no `AGENTS.md` of its own inherits this file as its nearest contract

## Verification

- `ls <subdir>` — every file matches `YYYY-MM-DD-*.md`, plus `AGENTS.md` where one exists
- Each plan in `plans/` has a sibling `-STATE.md`; a plan without one predates STATE tracking, and `/implement` creates it on resume

## Child DOX Index

- [plans/](plans/AGENTS.md) — Implementation plans (PLAN-XXX) and STATE tracking files
- [facts/](facts/AGENTS.md) — Codebase fact reports
- [qa/](qa/AGENTS.md) — QA review reports
- [prototypes/](prototypes/AGENTS.md) — Prototype learnings notes (problem/built/outcome/decision)

`missions/`, `specs/`, `epics/`, `features/` and `changes/` carry no `AGENTS.md` — this file is their contract.
