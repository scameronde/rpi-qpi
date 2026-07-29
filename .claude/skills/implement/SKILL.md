---
name: implement
description: Execute an implementation plan wave-by-wave via fresh subagents, with a combined spec-and-quality review gate. Use after /planner has produced a plan in thoughts/shared/plans/.
---

# Subagent-Driven Development

Execute a plan by grouping its tasks into **waves** of file-disjoint work, dispatching a fresh `general-purpose` subagent per task within a wave **concurrently**, then running a single combined review gate over the wave. Only results flow back to your context — each subagent works in a fresh context, keeping your orchestration context lean across many tasks.

## When to Use

After `/planner` has written a plan file to `thoughts/shared/plans/`.

## Cost Model — Read This First

Every subagent dispatch costs a full cold context: this repo's `CLAUDE.md`, the DOX `AGENTS.md` walk, and a re-read of the target files. That cost is **per dispatch, not per line changed**.

But the two kinds of dispatch are no longer priced alike. An implementer runs on `haiku`; a reviewer runs on the session model. So the number that drives cost is not how many subagents you spawn — it is **how many tasks need a reviewer**. Counting dispatches, as this section used to, now optimizes mostly the cheap half.

That reframes the levers:

- **The fast path is the real saving.** Every task it absorbs removes a session-model dispatch. Whether a task qualifies is decided by the *plan*, not by you: it needs a small diff, no logic change, and a `Verify:` that asserts content. A plan with strong `Verify:` commands is cheap to execute; a plan whose `Done When` conditions are prose is expensive, and you cannot repair that at execution time — you can only report it.
- **Batching buys wall-clock, not tokens.** File-disjoint tasks in one wave finish sooner; they do not cost less. Never merge tasks that share a file to make a wave look fuller — that trades a corrupted working tree for no saving at all.
- **Splitting a task is now cheap on the implementer side and dear on the reviewer side.** Two narrow tasks cost two cheap implementers but two expensive reviewers, unless both qualify for the fast path.

Never trade away correctness for speed. Do trade away ceremony.

## Pre-Flight

Before dispatching any subagent:

1. **Check the current branch.** Run `git rev-parse --abbrev-ref HEAD`. If the result is `main` or `master`, stop and ask the user for explicit consent before continuing. Offer to create a branch. Do not start dispatch on main or master without permission.
2. Read the plan file in full.
3. Extract ALL task IDs, names, `File(s)`, `allowedAdjacentEdits`, and (if present) `Wave:` / `Model:` / `Verify:` fields upfront — do not read task-by-task. If the plan has an `## Execution Waves` table, read it instead of deriving waves yourself.
4. Locate the STATE file: same path as the plan file with `.md` replaced by `-STATE.md`
   (per `thoughts/shared/plans/AGENTS.md` naming convention). Read it.
   - If `**Current Task**` is `Complete`: all tasks are already done. Report this to
     the user and stop — do not dispatch anything.
   - If `**Completed Tasks**` lists any PLAN-XXX ids: this is a resumed run. Skip those
     tasks when building waves; start at whatever `**Current Wave**` names (or, on an
     older STATE file with no wave line, the wave containing `**Current Task**`).
     STATE advances with every commit, so `**Completed Tasks**` is accurate to the
     task even for a run that died mid-wave: re-dispatch only the ids it does not
     list. (On a STATE file written before that rule the granularity is per-wave —
     you cannot tell which of that wave's tasks finished, so re-run the entire wave.
     A file whose `**Completed Tasks**` ends on a wave boundary while `**Current
     Task**` names that wave's first task is the older kind.)
     Either way, if the working tree holds leftover uncommitted changes from the dead
     run, show them to the user with `git status --short` and ask whether to discard
     them before re-dispatching; do not silently reset their tree.
   - If no STATE file exists (plan predates STATE tracking): create one now using the
     template in `.claude/skills/planner/SKILL.md` (Current Task = first task ID,
     Completed Tasks = none, checklist populated from the plan's tasks), commit it.
5. **Record a dirty-tree baseline** — the Boundary Check compares against it. Write it
   outside the repo so it does not become a finding itself:
   ```bash
   git status --porcelain -uall | cut -c4- | sort > "${TMPDIR:-/tmp}/wave-baseline.txt"
   ```
   Repos routinely carry dirty or untracked paths that belong to nobody's task — editor
   directories, local dotfiles, build output. Without a baseline every one of them is
   reported on every wave and the check degrades into noise you learn to skip past.
   The `-uall` flag ensures untracked files and directories are fully enumerated; without it git reports a newly created directory as a single trailing-slash path, which matches no `File(s)` entry and turns every create-in-a-new-directory task into a false finding.
   Capture this **after** any resume cleanup in step 4, and refresh it each time a wave
   commits so the next wave measures from a clean start.
6. **Read both prompt templates once** — `./implementer-prompt.md` and
   `./reviewer-prompt.md`. You fill their placeholders per task, but you read the files
   only here; re-reading them per dispatch is pure waste.
7. **Build the wave list** (see Wave Planning below).
8. Create a TodoWrite item per task for tracking (pre-mark items already in
   **Completed Tasks** as done).
9. If anything in the plan is ambiguous, ask now before starting.

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

You read `./implementer-prompt.md` in Pre-Flight step 6. Fill in the placeholders per task and dispatch every task in the wave **in a single message with multiple Agent tool calls** so they run concurrently:

```
Agent tool (one call per task in the wave):
  subagent_type: general-purpose
  model: haiku — unless the task's Model: field says opus (see Model Selection)
  description: "Implement [PLAN-XXX]: [task name]"
  prompt: [full implementer-prompt.md with all placeholders replaced]
```

**Embed** the full task text in the prompt — do NOT tell the subagent to read the plan file itself.

Implementers do **not** commit. You commit the wave in step 5. This is what makes concurrency safe: parallel `git add`/`git commit` calls interleave and produce corrupted or partial commits.

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

### 3. Boundary Check

Confirm the wave touched **only** what it declared — before spending a single reviewer. You are the only party who can do this: each implementer sees just its own file list, and reviewers are told to ignore changes outside theirs, so an undeclared path falls in the gap between them.

```bash
git status --porcelain -uall | cut -c4- | sort | comm -13 "${TMPDIR:-/tmp}/wave-baseline.txt" -
```

That lists every path this wave touched, with the pre-existing dirty paths from the Pre-Flight baseline filtered out. (`cut -c4-` strips the status columns; a rename appears as `old -> new`, so read both halves.)

Build the wave's **declared set** — the union of every task's `File(s)` and `allowedAdjacentEdits` — and compare. The STATE file is not part of the set: you write it in step 5, so it must not appear yet.

Every changed path that is not in the declared set is a finding. Diagnose each one, because the two causes need opposite responses:

**Cause A — the change was genuinely required, and the plan's `File(s)` was incomplete.** Most often an `AGENTS.md`: the implementer followed the DOX rule and updated a governance file the planner forgot to list. Keep the change. Then check whether that path also belongs to another task in this same wave — if it does, the wave was never file-disjoint, two implementers may have overwritten each other, and you must stop and escalate to the user instead of committing. If it does not collide, commit it and report the plan's omission.

**Cause B — scope creep.** The implementer was told to report `NEEDS_CONTEXT` rather than touch an unlisted file, and did not. **Read the change before you throw it away** — `git diff -- <path>` — then discard it: `git checkout -- <path>` for a tracked file, delete an untracked one. Note it in the wave report.

`git checkout --` is unrecoverable, and it discards the file's *whole* working state, not just the part the implementer added. Never aim it at a path you have not just read. If the diff holds anything you cannot attribute to this wave, stop and ask the user before discarding — the same rule the resume path in Pre-Flight step 4 applies to leftover changes.

Never commit a path that no task declared. And never settle a finding by adding the path to the plan after the fact: the declared set is what made the wave safe to run concurrently, so editing it retroactively destroys the evidence that it was wrong.

### 4. Review Gate

Run `git diff` for the wave's files and classify **each** task:

**Fast path — you verify, no subagent.** A task qualifies when **all** hold:
- The diff is under ~20 changed lines, **or** the change is a mechanical mirror/rename of an already-reviewed change.
- No control flow, no error handling, no security-relevant surface, no public interface change.
- The task has a `Verify:` command (not `none — requires review`) **that asserts content**. A bare count (`grep -c … → 10`) or existence check (`test -f …`) does not qualify: it passes for the wrong content, so it corroborates nothing and would leave your diff read as the only check the task ever gets.

For these: run the task's `Verify:` command yourself and confirm it produces the expected result, read the diff, and confirm it matches the `Instruction`. Record the command and its output. Do not dispatch anything.

**The diff read is the load-bearing step, not the command.** The implementer was given that command and ran it before reporting, so a passing `Verify:` tells you only that the implementer cleared a bar it could see in advance. Your independent contribution is comparing the diff against the `Instruction` and `Done When`. If a weak `Verify:` is the only mechanical check available, send the task down the review path instead.

A task whose `Verify:` is `none — requires review`, or that has no `Verify:` field at all (older plans), goes to the review path regardless of size.

**Review path — dispatch a reviewer.** Everything else. You read `./reviewer-prompt.md` in Pre-Flight step 6. Dispatch **one reviewer per task, concurrently across the wave**, in a single message:

```
Agent tool (one call per review-path task):
  subagent_type: general-purpose
  # no model parameter — reviewers always run on the session default
  description: "Review [PLAN-XXX]"
  prompt: [full reviewer-prompt.md with all placeholders replaced]
```

The reviewer returns spec compliance **and** code quality in one report — there is no separate quality stage.

**SPEC ISSUES**, **Critical**, or **Important** must be fixed before the wave commits. Re-dispatch the implementer for that task with the listed issues, then re-run the reviewer for that task only. Repeat until it passes. Once every re-dispatched task passes review, re-run the Boundary Check before proceeding to commit, because a fix round can touch a path the first check never saw.

**Minor** issues may be noted and deferred.

### 5. Commit the Wave and Advance

Do not commit until the most recent Boundary Check ran **after** the last implementer dispatch of the wave. (If fix rounds occurred, you re-ran the check in the Review Gate; use that result. Otherwise, use the check from step 3.)

Commit the wave's work as one commit per task's logical change. When a wave is a set of mechanically identical edits (e.g. the same fix mirrored across four files), commit it as **one** commit listing every task ID:

```bash
git add [specific files only — not git add -A]
git commit -m "[PLAN-001..PLAN-004]: <what the wave accomplished>"
```

Otherwise commit each task separately with its own `[PLAN-XXX]:` prefix.

**Every commit carries its own STATE update** — for exactly the task IDs in that commit. Do not defer the STATE write to the end of the wave: if the run dies after the second of four commits, STATE must already show those two tasks done, or the resumed run redoes finished work.

For **each** commit you make:

1. Open the plan's STATE file.
2. Check the checklist lines matching **this commit's** task IDs exactly (`- [ ] PLAN-XXX: ...` → `- [x] PLAN-XXX: ...`). Do not check any other line.
3. Append this commit's IDs to `**Completed Tasks**`.
4. Set `**Current Task**` to the next unfinished task. Advance `**Current Wave**` only when the wave's last commit lands. After the plan's **final** task, do not write `Complete` yet — `## After the Final Wave` gates it. (Older STATE files have no `**Current Wave**` line; add one.)
5. Amend it into the commit you just made:
   ```bash
   git add [STATE file path]
   git commit --amend --no-edit
   ```

A wave committed as one commit (the mechanically-identical case above) gets one STATE write listing all its IDs. That is the same rule, not an exception.

Verify with `git log --oneline -N` (N = the number of commits this wave produced) that every one of them landed and carries its PLAN IDs. `-1` only proves the last one exists.

**Refresh the Boundary Check baseline** so the next wave measures from here, not from before this wave:

```bash
git status --porcelain -uall | cut -c4- | sort > "${TMPDIR:-/tmp}/wave-baseline.txt"
```

Skip this and every later wave inherits this wave's paths as findings.

Mark the wave's tasks done in your todo list. Move to the next wave.

## After the Final Wave

Once the last wave has committed, the run is not yet closed — perform these acceptance checks:

1. **Read the plan's `## Acceptance Criteria` section.** Confirm each item holds in the working tree. For each criterion, name the evidence (output of a command, a code location, or both). Report any criterion that does not hold rather than closing the run.
2. **If the plan is a QA plan,** run the plan's `## Baseline Verification` command block and report the output.
3. **If the plan's `## Inputs` cites an epic,** carry out the epic's `## Verification Plan (For Implementor)` section and report the result.

Set the STATE file's `**Current Task**` to `Complete` **only after** all applicable checks pass. A plan whose acceptance criteria do not all hold is a plan that did not finish — extend the work or escalate.

## Model Selection

**Implementers run on `haiku`.** This is the baseline, not a per-task judgment call. A plan task arrives pre-specified down to its file list, evidence, `Done When`, and a literal `Verify:` command — that is precisely the shape of work a small model executes reliably.

**The one exception: pass `opus` when the task's `Model:` field says `opus`.** The planner reserves that for architecture, complex refactors, and design decisions. Honor it. An overwhelmed `haiku` does not reliably report `BLOCKED` — it reports `DONE` with a plausible-looking wrong implementation, which is the failure mode the review gate is weakest against.

On plans that predate this contract and carry no `Model:` field, use `haiku` unless the task is architectural.

**Reviewers run on the session default — omit the `model` parameter entirely.** Do not tier reviewers. A `haiku` reviewer checking `haiku` output shares its blind spots, and the gate is the one place where the whole saving can be given back silently. Cheap implementer, capable checker.

Escalation stays reactive, not anticipatory: a `BLOCKED` task gets more context, then a stronger model, then a split (see Handle Implementer Statuses). Do not pre-emptively upgrade a task because it *looks* hard — that is what the planner's `opus` marking is for.

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
- **Never** commit a wave without running the Boundary Check — an undeclared path is invisible to both the implementer and the reviewer, so if you do not catch it, nobody does
- **Never** let a subagent run `git commit` — the orchestrator owns all commits
- **Never** start a wave before the previous wave is reviewed and committed
- **Never** skip the review gate for a task that changes logic, interfaces, or error handling — the fast path is for mechanical edits only
- **Never** proceed past an unresolved BLOCKED status
- **Never** start on main/master without explicit user consent
- **Never** make a commit without amending its STATE update into it — TodoWrite alone
  does not survive a session interruption, and a commit missing its STATE line makes
  the resumed run redo work that is already done
- **Never** report a plan complete without evaluating its `## Acceptance Criteria` — per-task `Verify:` commands check tasks, not the plan
- **Never** edit a skill or agent file under `.claude/` while you are mid-plan, unless a
  task in the plan says to. Your own behaviour is defined by those files; changing them
  under yourself makes the rest of the run unreproducible
- **Never** rename a task field or change its allowed values here alone. The field list is
  a contract shared by `planner/SKILL.md`, this file, and both prompt templates in this
  directory — a half-landed change fails silently, because the reader just does not find
  what it looks for
