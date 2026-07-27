# skills/ — Workflow Orchestrators and Quality Skills

## Purpose

Contains all skills loaded by Claude Code via the `Skill` tool. Workflow skills drive the development pipeline; quality skills perform code review and analysis.

## Ownership

Skills are invoked by the user (via `/skill-name`) or by Claude proactively when a trigger condition matches. They read plan/research artifacts and spawn worker agents.

## Local Contracts

Each skill lives in its own subdirectory with a `SKILL.md` entry point:

**Workflow skills (pipeline order):**
- `prototype/` — Spike an idea into disposable, isolated code and reach a go/no-go/iterate decision; optional entry point before mission-architect/feature-architect/fact-finder; output to `thoughts/shared/prototypes/`. Pinned to `model: opus` — it works without a spec, and its durable outputs are the go/no-go call and the learnings note, both pure judgment. Never add `context: fork`: the skill is interactive (AskUserQuestion) and owns a worktree lifecycle, neither of which survives running in a subagent
- `mission-architect/` — Elicit project vision; output to `thoughts/shared/missions/`
- `feature-architect/` — Define brownfield feature; output to `thoughts/shared/features/`
- `specifier/` — Translate mission to technical spec; output to `thoughts/shared/specs/`
- `epic-planner/` — Decompose spec to epics; output to `thoughts/shared/epics/`
- `fact-finder/` — Map codebase or research topic; output to `thoughts/shared/facts/` or `thoughts/shared/qa/`
- `planner/` — Produce sequenced implementation plan; output to `thoughts/shared/plans/`
- `implement/` — Execute plan wave-by-wave via concurrent subagents; also contains `implementer-prompt.md` and `reviewer-prompt.md` (one combined spec + quality reviewer)

**Quality skills:**
- `clean-code/` — Language-agnostic code quality review; contains `references/` subdirectory
- `python-qa/` — Python-specific quality review
- `typescript-qa/` — TypeScript-specific quality review
- `logic-bugs-qa/` — Logic and bug analysis; contains `references/` subdirectory
- `claude-code-extensions/` — Reference for extending Claude Code

**DOX maintenance skills:**
- `dox-init/` — Bootstrap a complete DOX governance tree for any project
- `dox-update/` — Detect and repair stale AGENTS.md files

## Work Guidance

- Skills spawn agents via the `Agent` tool — never invoke agents directly
- Workflow ordering is enforced: fact-finder must precede planner; planner must precede /implement
- Prompt templates in `implement/` are embedded verbatim into agent calls — they are not skills themselves
- `/implement` subagents never run `git commit`; the orchestrator owns all commits so concurrent implementers cannot corrupt each other's work
- `/prototype` must never invoke `/implement` — its Phase 5 deletes the worktree unconditionally, so a real plan executed there is destroyed and its STATE file left un-advanced
- Plan tasks carry `Wave:`, `Model:`, `Verify:`, and `allowedAdjacentEdits` fields set by `/planner`; `/implement` reads all four. Changing any field's contract requires updating both skills, both `implement/` prompt templates, and `CLAUDE.md`
- `Wave:` groups are only as safe as `File(s)` is exhaustive — an omitted path can put two concurrent implementers in one file
- STATE files track `**Current Wave**` and are updated once per wave, not per task

## Verification

- Each skill's `SKILL.md` describes its trigger conditions and output contract
- Test a skill by invoking it and verifying the artifact appears in the correct `thoughts/shared/` subdirectory
