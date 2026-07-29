# plans/ — Implementation Plans and STATE Files

## Purpose

Stores sequenced implementation plans produced by `/planner` and the STATE files `/implement` advances while executing them. A plan is the only input `/implement` accepts; its STATE sibling is what makes an interrupted run resumable.

## Ownership

- `/planner` creates plan files — write-once
- `/implement` creates and updates `*-STATE.md` files; the orchestrator alone writes them, never an implementer or reviewer subagent

## Local Contracts

**File naming:**
- Plans: `YYYY-MM-DD-<Topic>.md`
- STATE files: `YYYY-MM-DD-<Topic>-STATE.md` — same base name as the plan
- Occasional `-TESTS.md` / `-TEST-CASES.md` companions exist from earlier runs; they are plan-scoped notes, not inputs to `/implement`

**Plan document structure** (`.claude/skills/planner/SKILL.md` is the canonical template — read it there before writing a plan):

```markdown
# Plan: <title>

## Inputs                        # fact report(s) used, epic / feature brief (or `none`), user request summary
## Verified Current State        # Fact / Evidence `path:line-line` / Excerpt
## Inherited Constraints (Respected)  # rows from the fact report's `## Inherited Constraints (Treated as Fixed)`; `None` if that read `None`
## Goals / Non-Goals
## Approval Gate                  # which Phase 3 triggers apply + the questions, or `None applied — proceeding.`
## Design Overview
## Execution Waves               # table: Wave | Tasks | Files touched | Rationale
## Implementation Instructions (For Implementor)
## Verification Tasks (If Assumptions Exist)
## Acceptance Criteria
## Implementor Checklist         # grouped by wave
```

**Task field list — a contract with four readers, not a local format.** Every task block carries:

```markdown
- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** [haiku | opus]
- **Change Type:** create/modify/remove
- **File(s):** `path/...` (exhaustive — impl, tests, config, docs)
- **allowedAdjacentEdits:** `path/...` or none
- **Instruction:** exact steps
- **Interfaces / Pseudocode:** minimal
- **Evidence:** `path:line-line` plus a 1-6 line excerpt (why this file / why this approach)
- **Done When:** concrete observable condition
- **Verify:** [`command` → expected result, or `none — requires review`]
- **Context:** why this change is needed
```

`Wave:`, `Model:`, `Verify:`, `File(s):` and `allowedAdjacentEdits:` are consumed by `/implement`; `Instruction`, `Evidence`, `Done When`, `Verify` and `Context` are pasted verbatim into its prompt templates. Renaming a field or changing its allowed values means editing `.claude/skills/planner/SKILL.md`, `.claude/skills/implement/SKILL.md`, and both `implementer-prompt.md` and `reviewer-prompt.md` — a change landing in only some of them fails silently, because the reader simply does not find what it looks for. Older plans in this directory predate `Wave:`, `Model:` and `Verify:`; `/implement` derives waves itself when they are absent.

Two fields are load-bearing:

- **`File(s)` plus `allowedAdjacentEdits` must be exhaustive.** They are the input to the wave-disjointness check, so an omitted path is a path two concurrent implementers can both write.
- **`Verify:` must assert content to be worth having.** A count or existence check passes for the wrong content, and the implementer sees the command before doing the work, so a bar it can see in advance is a bar it can clear without doing the task. Such a task takes `Verify: none — requires review` and is routed to a reviewer instead.

**STATE file format** (`<plan-name>-STATE.md`, kept under ~40 lines):

```markdown
# State: [Ticket Name]

**Plan**: thoughts/shared/plans/YYYY-MM-DD-[Ticket].md
**Current Wave**: 1
**Current Task**: PLAN-001
**Completed Tasks**: (none yet)

## Task Checklist

### Wave 1
- [ ] PLAN-001: [One-line task description]
- [ ] PLAN-002: [One-line task description]

### Wave 2
- [ ] PLAN-003: [One-line task description]

## Notes
- Plan created: YYYY-MM-DD
- Total tasks: N across M waves
```

The checklist is grouped by wave — tasks in one wave have disjoint `File(s)` and run concurrently, but are checked off as each one commits, not together at the end of the wave. `**Current Wave**` is what `/implement` advances between waves; `**Current Task**` names the next unfinished task. Both read `Complete` once every task is checked off. STATE carries no copy of the plan's `Verify:` commands — the plan is the only place they live, so STATE cannot drift from it.

**Update cadence:** `/implement` amends a STATE update into **every** commit it makes, covering exactly the task IDs in that commit — not batched to the wave boundary. This is what lets a run interrupted mid-wave resume without redoing finished work. STATE files written before this rule advance only at wave boundaries; `/implement`'s resume path detects and handles both kinds.

## Work Guidance

- Do not manually edit a plan file while `/implement` is mid-execution — STATE tracking will diverge
- STATE files are the only files here that change after creation
- To resume an interrupted plan: give `/implement` the plan path; it reads the STATE file to find the next unfinished task
- Leave a dead run's uncommitted changes for the user to decide on; `/implement` shows them rather than resetting the tree

## Verification

- A valid plan has at least one task block with an `**Action ID:** PLAN-NNN`
- Every task carries `File(s):`, `Instruction:`, `Done When:` and `Verify:` — these four are required
- Within any one wave, no path appears in more than one task's `File(s)` or `allowedAdjacentEdits`
- Each plan has a sibling `-STATE.md`, and its `**Current Task**` names a task ID present in the plan, or `Complete`
- Every task in the plan appears exactly once in the STATE checklist, under the wave its `Wave:` field names
