# skills/ — Workflow Orchestrators and Quality Skills

## Purpose

Contains all skills loaded by Claude Code via the `Skill` tool. Workflow skills drive the development pipeline; quality skills perform code review and analysis.

## Ownership

Skills are invoked by the user (via `/skill-name`) or by Claude proactively when a trigger condition matches. They read plan/research artifacts and spawn worker agents.

## Local Contracts

Each skill lives in its own subdirectory with a `SKILL.md` entry point:

**Workflow skills (pipeline order):**
- `mission-architect/` — Elicit project vision; output to `thoughts/shared/missions/`
- `feature-architect/` — Define brownfield feature; output to `thoughts/shared/features/`
- `specifier/` — Translate mission to technical spec; output to `thoughts/shared/specs/`
- `epic-planner/` — Decompose spec to epics; output to `thoughts/shared/epics/`
- `researcher/` — Map codebase or research topic; output to `thoughts/shared/research/` or `thoughts/shared/qa/`
- `planner/` — Produce sequenced implementation plan; output to `thoughts/shared/plans/`
- `subagent-driven-development/` — Execute plan task-by-task via subagents; also contains `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`

**Quality skills:**
- `clean-code/` — Language-agnostic code quality review; contains `references/` subdirectory
- `python-qa/` — Python-specific quality review
- `typescript-qa/` — TypeScript-specific quality review
- `logic-bugs-qa/` — Logic and bug analysis; contains `references/` subdirectory
- `claude-code-extensions/` — Reference for extending Claude Code

## Work Guidance

- Skills spawn agents via the `Agent` tool — never invoke agents directly
- Workflow ordering is enforced: researcher must precede planner; planner must precede SDD
- Prompt templates in `subagent-driven-development/` are embedded verbatim into agent calls — they are not skills themselves

## Verification

- Each skill's `SKILL.md` describes its trigger conditions and output contract
- Test a skill by invoking it and verifying the artifact appears in the correct `thoughts/shared/` subdirectory
