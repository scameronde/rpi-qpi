# thoughts/shared/ — Workflow Artifact Store

## Purpose

Persistent artifact store for all workflow pipeline outputs. Every stage of the pipeline writes here; downstream stages read from here. Files here represent durable project knowledge — research findings, decisions, implementation plans, and quality reviews.

## Ownership

- Skills write artifacts here; they do not delete or overwrite existing files
- Implementer subagents (via `/subagent-driven-development`) update STATE files in `plans/`
- All other files are write-once after creation

## Local Contracts

**Naming convention:** `YYYY-MM-DD-Topic.md` for all artifact files.

**Directory assignments:**
| Directory | Written by | Read by |
|---|---|---|
| `missions/` | `/mission-architect` | `/specifier` |
| `features/` | `/feature-architect` | `/epic-planner` |
| `specs/` | `/specifier` | `/epic-planner` |
| `epics/` | `/epic-planner` | `/researcher`, `/planner` |
| `research/` | `/researcher` | `/planner` |
| `qa/` | `/researcher` (QA mode) | human review |
| `plans/` | `/planner` | `/subagent-driven-development` |

**Currently populated:** `plans/` (34 files), `research/` (25 files), `qa/` (4 files), `features/` (1 file).
**Currently empty:** `missions/`, `specs/`, `epics/`.

## Work Guidance

- Never edit research or plan files manually while `/subagent-driven-development` is executing
- When referencing an artifact in a plan or prompt, use the full relative path from the repo root
- Artifact files are read-only after creation (except STATE files in `plans/`)

## Child DOX Index

- [plans/](plans/AGENTS.md) — Implementation plans (PLAN-XXX) and STATE tracking files
- [research/](research/AGENTS.md) — Codebase research reports
- [qa/](qa/AGENTS.md) — QA review reports
