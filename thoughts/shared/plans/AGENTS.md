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
**Current Task**: PLAN-001
**Completed Tasks**: (none yet)

## Task Checklist
- [ ] PLAN-001: [One-line task description]
- [ ] PLAN-002: [One-line task description]

## Quick Verification
<list verification commands from the plan>

## Notes
- Plan created: YYYY-MM-DD
```
`**Current Task**` becomes `Complete` once every task is checked off.

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
- STATE file `Current` value must match an existing `### PLAN-NNN:` heading in the plan
