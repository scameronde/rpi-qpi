# thoughts/shared/ — Workflow Artifact Store

## Purpose

Persistent artifact store for all workflow pipeline outputs. Every stage of the pipeline writes here; downstream stages read from here. Files here represent durable project knowledge — research findings, decisions, implementation plans, and quality reviews.

## Ownership

- Skills write artifacts here; they do not delete or overwrite existing files
- The `/implement` orchestrator updates STATE files in `plans/` after each task's reviews pass (implementer subagents never touch STATE files directly)
- All other files are write-once after creation

## Local Contracts

**Naming convention:** `YYYY-MM-DD-Topic.md` for all artifact files.

**Directory assignments:**
| Directory | Written by | Read by |
|---|---|---|
| `missions/` | `/mission-architect` | `/specifier` |
| `features/` | `/feature-architect` | `/epic-planner` |
| `specs/` | `/specifier` | `/epic-planner` |
| `epics/` | `/epic-planner` | `/fact-finder`, `/planner` |
| `facts/` | `/fact-finder` | `/planner` |
| `qa/` | `/fact-finder` (QA mode) | human review |
| `plans/` | `/planner` | `/implement` |

**Currently populated:** `plans/` (66 files, 33 plan/STATE pairs), `facts/` (29 files, including AGENTS.md), `qa/` (4 files), `features/` (1 file).
**Currently empty:** `missions/`, `specs/`, `epics/`.

## Work Guidance

- Never edit facts or plan files manually while `/implement` is executing
- When referencing an artifact in a plan or prompt, use the full relative path from the repo root
- Artifact files are read-only after creation (except STATE files in `plans/`)

## Child DOX Index

- [plans/](plans/AGENTS.md) — Implementation plans (PLAN-XXX) and STATE tracking files
- [facts/](facts/AGENTS.md) — Codebase fact reports
- [qa/](qa/AGENTS.md) — QA review reports
