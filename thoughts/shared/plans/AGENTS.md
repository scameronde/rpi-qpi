# plans/ — Implementation Plans and STATE Files

## Purpose

Stores sequenced implementation plans produced by `/planner` and STATE files maintained by `/subagent-driven-development` during execution.

## Ownership

- `/planner` creates plan files (write-once)
- `/subagent-driven-development` creates and updates `*-STATE.md` files during execution

## Local Contracts

**Plan file format:**
```markdown
# Plan: <title>

## Inputs
- Research report(s) used: thoughts/shared/research/...

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
## STATE
Current: PLAN-001
Status: pending|in_progress|completed|blocked
```

**File naming:**
- Plans: `YYYY-MM-DD-<Topic>.md`
- STATE files: `YYYY-MM-DD-<Topic>-STATE.md` (same base name as plan)

## Work Guidance

- Do not manually edit plan files while SDD is mid-execution — STATE tracking will diverge
- STATE files are the only files in this directory that change after creation
- To resume an interrupted plan: tell `/subagent-driven-development` the plan path; it reads the STATE file to find the next task

## Verification

- A valid plan has at least one `### PLAN-NNN:` task block
- Each task has: `files`, `instruction`, `doneWhen` — these three are required
- STATE file `Current` value must match an existing `### PLAN-NNN:` heading in the plan
