---
name: implement
description: Execute an implementation plan wave-by-wave via fresh subagents, with a combined spec-and-quality review gate. Use after /planner has produced a plan in thoughts/shared/plans/.
---

# Subagent-Driven Development

Execute a plan by grouping its tasks into **waves** of file-disjoint work, dispatching a fresh `general-purpose` subagent per task within a wave **concurrently**, then running a single combined review gate over the wave. Only results flow back to your context — each subagent works in a fresh context, keeping your orchestration context lean across many tasks.

## When to Use

After `/planner` has written a plan file to `thoughts/shared/plans/`.

## Cost Model — Read This First

Every subagent dispatch costs a full cold context: this repo's `CLAUDE.md`, the DOX `AGENTS.md` walk, and a re-read of the target files. That cost is **per dispatch, not per line changed**. A plan of four one-line edits run as four tasks × three dispatches burns twelve cold contexts to produce four lines.

Your job is to minimize dispatches without weakening the gate:

- **Batch** — file-disjoint tasks go in one wave and run concurrently.
- **Skip** — mechanical changes are verified by you with `git diff`, not by a subagent.
- **Merge** — spec compliance and code quality are one reviewer, not two.

Never trade away correctness for speed. Do trade away ceremony.

## Pre-Flight

Before dispatching any subagent:

1. Read the plan file in full.
2. Extract ALL task IDs, names, `File(s)`, `allowedAdjacentEdits`, and (if present) `Wave:` / `Model:` / `Verify:` fields upfront — do not read task-by-task. If the plan has an `## Execution Waves` table, read it instead of deriving waves yourself.
3. Locate the STATE file: same path as the plan file with `.md` replaced by `-STATE.md`
   (per `thoughts/shared/plans/AGENTS.md` naming convention). Read it.
   - If `**Current Task**` is `Complete`: all tasks are already done. Report this to
     the user and stop — do not dispatch anything.
   - If `**Completed Tasks**` lists any PLAN-XXX ids: this is a resumed run. Skip those
     tasks when building waves; start at whatever `**Current Wave**` names (or, on an
     older STATE file with no wave line, the wave containing `**Current Task**`).
     STATE only advances at wave boundaries, so a run that died mid-wave leaves no
     record of which of that wave's tasks finished — and implementers make no commits
     of their own to reveal it. Re-run the **entire** wave. If the working tree holds
     leftover uncommitted changes from the dead run, show them to the user with
     `git status --short` and ask whether to discard them before re-dispatching; do
     not silently reset their tree.
   - If no STATE file exists (plan predates STATE tracking): create one now using the
     template in `.claude/skills/planner/SKILL.md` (Current Task = first task ID,
     Completed Tasks = none, checklist populated from the plan's tasks), commit it.
4. **Build the wave list** (see Wave Planning below).
5. Create a TodoWrite item per task for tracking (pre-mark items already in
   **Completed Tasks** as done).
6. If anything in the plan is ambiguous, ask now before starting.

## Wave Planning

A **wave** is a set of tasks that may run concurrently. Two tasks may share a wave only when **all** of these hold:

- Their `File(s)` sets (plus any `allowedAdjacentEdits`) are **disjoint** — no shared path.
- Neither task's `Instruction` depends on the other's output existing.
- Neither creates a file the other reads or imports.

If the plan supplies `Wave:` numbers, use them — the planner had more context than you do. Verify the disjointness rule still holds and split a wave if it does not.

If the plan has no `Wave:` fields (older plans), derive waves yourself: walk the tasks in order and open a new wave whenever a task's files overlap any file already claimed in the current wave, or whenever it depends on an earlier task in that wave.

**Cap each wave at 5 concurrent implementers.** Split larger waves into consecutive sub-waves.

**Waves of one task are normal — do not treat them as a failure to batch.** Audit-style plans usually concentrate on a single file, so every task collides with every other and the whole plan is a chain of single-task waves. That is the correct outcome. The saving on those plans comes from the planner having merged the edits into fewer, larger tasks, and from the fast path — not from concurrency. Never put two tasks that share a file into one wave to make a wave look fuller.

When in doubt about a dependency, put the task in its own later wave. A wrongly-split wave costs latency; a wrongly-merged wave costs a corrupted working tree.

Report the wave plan to the user before starting:

```
Wave 1 (concurrent): PLAN-001, PLAN-002, PLAN-003, PLAN-004
Wave 2:              PLAN-005  (depends on PLAN-001)
```

## Per-Wave Loop

Repeat for each wave in order. **Waves are strictly sequential — never start a wave before the previous one is committed.**

### 1. Dispatch Implementers (concurrent within the wave)

Read `./implementer-prompt.md` **once, in Pre-Flight** — not per task. Fill in the placeholders per task and dispatch every task in the wave **in a single message with multiple Agent tool calls** so they run concurrently:

```
Agent tool (one call per task in the wave):
  subagent_type: general-purpose
  model: [task's Model: field, or see Model Selection]
  description: "Implement [PLAN-XXX]: [task name]"
  prompt: [full implementer-prompt.md with all placeholders replaced]
```

**Embed** the full task text in the prompt — do NOT tell the subagent to read the plan file itself.

Implementers do **not** commit. You commit the wave in step 4. This is what makes concurrency safe: parallel `git add`/`git commit` calls interleave and produce corrupted or partial commits.

### 2. Handle Implementer Statuses

Collect all reports before acting. Then per task:

**DONE** — proceed.

**DONE_WITH_CONCERNS** — read the concerns. If they affect correctness or scope: resolve before reviewing. If they are observations: note them and proceed.

**NEEDS_CONTEXT** — provide the missing context and re-dispatch that task alone.

**BLOCKED** — try in order:
1. Provide more context and re-dispatch
2. Re-dispatch with a more capable model
3. Break the task into smaller sub-steps and re-dispatch
4. Escalate to user if the plan itself needs revision

Never re-dispatch a BLOCKED task without providing something new.

If any task in the wave is unresolved, do not commit the wave. Resolve it or drop it to a later wave and commit the rest.

### 3. Review Gate

Run `git diff` for the wave's files and classify **each** task:

**Fast path — you verify, no subagent.** A task qualifies when **all** hold:
- The diff is under ~20 changed lines, **or** the change is a mechanical mirror/rename of an already-reviewed change.
- No control flow, no error handling, no security-relevant surface, no public interface change.
- The task has a `Verify:` command (not `none — requires review`).

For these: run the task's `Verify:` command yourself and confirm it produces the expected result, read the diff, and confirm it matches the `Instruction`. Record the command and its output. Do not dispatch anything.

A task whose `Verify:` is `none — requires review`, or that has no `Verify:` field at all (older plans), goes to the review path regardless of size.

**Review path — dispatch a reviewer.** Everything else. Read `./reviewer-prompt.md` (once, in Pre-Flight). Dispatch **one reviewer per task, concurrently across the wave**, in a single message:

```
Agent tool (one call per review-path task):
  subagent_type: general-purpose
  description: "Review [PLAN-XXX]"
  prompt: [full reviewer-prompt.md with all placeholders replaced]
```

The reviewer returns spec compliance **and** code quality in one report — there is no separate quality stage.

**SPEC ISSUES**, **Critical**, or **Important** must be fixed before the wave commits. Re-dispatch the implementer for that task with the listed issues, then re-run the reviewer for that task only. Repeat until it passes.

**Minor** issues may be noted and deferred.

### 4. Commit the Wave and Advance

Commit the wave's work as one commit per task's logical change. When a wave is a set of mechanically identical edits (e.g. the same fix mirrored across four files), commit it as **one** commit listing every task ID:

```bash
git add [specific files only — not git add -A]
git commit -m "[PLAN-001..PLAN-004]: <what the wave accomplished>"
```

Otherwise commit each task separately with its own `[PLAN-XXX]:` prefix.

**Then update the STATE file in the same commit as the wave** — one STATE write per wave, not per task:

1. Open the plan's STATE file.
2. Check every checklist line matching this wave's task IDs exactly (`- [ ] PLAN-XXX: ...` → `- [x] PLAN-XXX: ...`). Do not check any other line.
3. Append all of the wave's IDs to `**Completed Tasks**`.
4. Set `**Current Wave**` to the next wave's number and `**Current Task**` to its first task — or both to `Complete` if this was the last wave. (Older STATE files have no `**Current Wave**` line; add one.)
5. Amend it into the wave's **final** commit (when the wave produced several, only the last one is amended — the STATE update covers the whole wave):
   ```bash
   git add [STATE file path]
   git commit --amend --no-edit
   ```

Verify with `git log --oneline -1` that the commit exists and carries the PLAN IDs.

Mark the wave's tasks done in your todo list. Move to the next wave.

## Model Selection

Use the task's `Model:` field when the plan supplies one. Otherwise:

| Task type | Model parameter |
|---|---|
| 1–2 files, mechanical, clear spec, docs-only | `haiku` |
| Multi-file, integration, judgment calls | omit (inherits session default) |
| Architecture, complex refactor, design decisions | `opus` |

Reviewers follow the same tiering: a fast mechanical change that still needs review gets a `haiku` reviewer.

Do not default to omitting. Most plan tasks are mechanical; picking `haiku` for them is the intended behavior, not a risk.

## Stop Conditions

**Stop only when:**
- All tasks complete
- A BLOCKED status cannot be resolved without user input
- The plan itself is wrong and needs revision before continuing

**Do not stop for:**
- Minor quality issues (note and continue)
- DONE_WITH_CONCERNS that are observations, not correctness issues

## Red Flags

- **Never** put two tasks in the same wave when their `File(s)` sets overlap
- **Never** let a subagent run `git commit` — the orchestrator owns all commits
- **Never** start a wave before the previous wave is reviewed and committed
- **Never** skip the review gate for a task that changes logic, interfaces, or error handling — the fast path is for mechanical edits only
- **Never** proceed past an unresolved BLOCKED status
- **Never** start on main/master without explicit user consent
- **Never** advance to the next wave before the STATE file is updated and committed —
  TodoWrite alone does not survive a session interruption
