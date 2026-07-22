---
name: implement
description: Execute an implementation plan task-by-task via fresh subagents with spec-compliance and code-quality review after each task. Use after /planner has produced a plan in thoughts/shared/plans/.
---

# Subagent-Driven Development

Execute a plan by dispatching a fresh `general-purpose` subagent per task, followed by two review stages: spec compliance first, then code quality. Only results flow back to your context — each subagent works in a fresh context, keeping your orchestration context lean across many tasks.

## When to Use

After `/planner` has written a plan file to `thoughts/shared/plans/`.

## Why Subagents

Each task runs in isolated context. File reading, analysis, and implementation stay in the subagent. Only the result report returns. This prevents accumulated file-reading tokens from filling your context across many tasks.

## Pre-Flight

Before dispatching any subagent:

1. Read the plan file in full.
2. Extract ALL task IDs and names upfront — do not read task-by-task.
3. Locate the STATE file: same path as the plan file with `.md` replaced by `-STATE.md`
   (per `thoughts/shared/plans/AGENTS.md` naming convention). Read it.
   - If `**Current Task**` is `Complete`: all tasks are already done. Report this to
     the user and stop — do not dispatch anything.
   - If `**Completed Tasks**` lists any PLAN-XXX ids: this is a resumed run. Skip
     dispatching implementers for those tasks; start the Per-Task Loop at whatever
     task `**Current Task**` names.
   - If no STATE file exists (plan predates STATE tracking): create one now using the
     template in `.claude/skills/planner/SKILL.md` (Current Task = first task ID,
     Completed Tasks = none, checklist populated from the plan's tasks), commit it.
4. Create a TodoWrite item per task for tracking (pre-mark items already in
   **Completed Tasks** as done).
5. If anything in the plan is ambiguous, ask now before starting.

## Per-Task Loop (sequential — never parallelize implementation)

Repeat for each task in order:

### 1. Dispatch Implementer

Read `./implementer-prompt.md`. Fill in all placeholders with the full task text and context. Dispatch:

```
Agent tool:
  subagent_type: general-purpose
  model: [see Model Selection]
  description: "Implement [PLAN-XXX]: [task name]"
  prompt: [full implementer-prompt.md with all placeholders replaced]
```

**Embed** the full task text in the prompt — do NOT tell the subagent to read the plan file itself.

### 2. Handle Implementer Status

**DONE** — proceed to spec review.

**DONE_WITH_CONCERNS** — read the concerns. If they affect correctness or scope: resolve before reviewing. If they are observations: note them and proceed.

**NEEDS_CONTEXT** — provide the missing context and re-dispatch.

**BLOCKED** — try in order:
1. Provide more context and re-dispatch
2. Re-dispatch with a more capable model
3. Break the task into smaller sub-steps and re-dispatch
4. Escalate to user if the plan itself needs revision

Never re-dispatch a BLOCKED task without providing something new.

### 3. Dispatch Spec Reviewer

Read `./spec-reviewer-prompt.md`. Fill in placeholders with the task requirements and the implementer's report. Dispatch:

```
Agent tool:
  subagent_type: general-purpose
  description: "Spec compliance review for [PLAN-XXX]"
  prompt: [full spec-reviewer-prompt.md with all placeholders replaced]
```

If issues found: re-dispatch the implementer with the listed issues, then re-run the reviewer. Repeat until spec-compliant.

### 4. Dispatch Quality Reviewer

Read `./code-quality-reviewer-prompt.md`. Fill in placeholders with task context and changed files. Dispatch:

```
Agent tool:
  subagent_type: general-purpose
  description: "Code quality review for [PLAN-XXX]"
  prompt: [full code-quality-reviewer-prompt.md with all placeholders replaced]
```

**Critical** and **Important** issues must be fixed before advancing. Re-dispatch the implementer with the fixes, re-run the reviewer. Repeat until approved.

**Minor** issues may be noted and deferred.

### 5. Verify Commit and Advance

```bash
git log --oneline -1
```

Confirm the commit includes the PLAN-XXX ID.

**Update the STATE file now, before moving on:**
1. Open the plan's STATE file.
2. Find the checklist line matching this task's ID exactly (`- [ ] PLAN-XXX: ...`) and
   check it: `- [x] PLAN-XXX: ...`. Do not check any other line.
3. Append PLAN-XXX to `**Completed Tasks**`.
4. Set `**Current Task**` to the next task's ID, or `Complete` if this was the last one.
5. Commit the STATE file in its own commit — do not fold it into the implementer's commit:
   ```bash
   git add [STATE file path]
   git commit -m "STATE: mark PLAN-XXX complete, advance to PLAN-YYY"
   ```
   (Use `STATE: all tasks complete` when this was the final task.)

Mark the task done in your todo list. Move to the next task.

## Model Selection

| Task type | Model parameter |
|---|---|
| 1–2 files, mechanical, clear spec | `haiku` |
| Multi-file, integration, judgment calls | omit (inherits session default) |
| Architecture, complex refactor, design decisions | `opus` |

When unsure: omit the model parameter.

## Stop Conditions

**Stop only when:**
- All tasks complete
- A BLOCKED status cannot be resolved without user input
- The plan itself is wrong and needs revision before continuing

**Do not stop for:**
- Minor quality issues (note and continue)
- DONE_WITH_CONCERNS that are observations, not correctness issues

## Red Flags

- **Never** dispatch implementation subagents in parallel — they conflict on files
- **Never** skip either review stage (both are required per task)
- **Never** proceed past an unresolved BLOCKED status
- **Never** start on main/master without explicit user consent
- **Never** commit on behalf of the implementer — the implementer commits its own work
- **Never** advance to the next task before the STATE file is updated and committed —
  TodoWrite alone does not survive a session interruption
