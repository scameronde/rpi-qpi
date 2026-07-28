# plans/ — Implementation Plans and STATE Files

## Purpose

Stores sequenced implementation plans produced by `/planner` and STATE files maintained by `/implement` during execution.

## Ownership

- `/planner` creates plan files (write-once)
- `/implement` creates and updates `*-STATE.md` files during execution

## Local Contracts

**Plan file format:**
```markdown
# Plan: <title>

## Inputs
- Research report(s) used: thoughts/shared/facts/...

## Verified Current State
- **Fact:** ...
- **Evidence:** file:line-line

## Goals / Non-Goals

## Design Overview

## Implementation Instructions

### PLAN-001: <task name>
- changeType: modify|create|remove
- files: [path/to/file]
- instruction: What to do
- evidence: file:line-line
- doneWhen: Verifiable completion criterion
- allowedAdjacentEdits: [optional list]
- context: Why this change is needed
```

**STATE file format** (`<plan-name>-STATE.md`):
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

## Quick Verification
<list verification commands from the plan>

## Notes
- Plan created: YYYY-MM-DD
```

The checklist is grouped by wave — tasks in one wave have disjoint `files` and run concurrently. `**Current Wave**` is what `/implement` advances between waves; `**Current Task**` names the next unfinished task. Both become `Complete` once every task is checked off.

**Update cadence:** `/implement` amends a STATE update into **every** commit it makes, covering exactly the task IDs in that commit — not batched to the wave boundary. This is what lets a run interrupted mid-wave resume without redoing finished work. STATE files written before this rule advance only at wave boundaries, and `/implement`'s resume path detects and handles both.

**File naming:**
- Plans: `YYYY-MM-DD-<Topic>.md`
- STATE files: `YYYY-MM-DD-<Topic>-STATE.md` (same base name as plan)

## Work Guidance

- Do not manually edit plan files while `/implement` is mid-execution — STATE tracking will diverge
- STATE files are the only files in this directory that change after creation
- To resume an interrupted plan: tell `/implement` the plan path; it reads the STATE file to find the next task

## Verification

- A valid plan has at least one `### PLAN-NNN:` task block
- Each task has: `files`, `instruction`, `doneWhen` — these three are required
- STATE file `**Current Task**` value must match an existing `### PLAN-NNN:` heading in the plan, or be `Complete`
- Every task in the plan appears exactly once in the STATE checklist, under the wave its `Wave:` field names
