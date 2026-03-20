# implementation-controller — Raw Notes

## Role
- Agent type: user-facing orchestrator (invoked via `/implementation-controller` command)
- Persona name in prompt: "Implementation Controller" / "Implementor"
- Model: explicitly set to `sonnet` in frontmatter (not inherited from parent)
- Metaphor: "The Planner created the blueprint. The Task Executor builds the code. You orchestrate the workflow."
- Purpose: Drive a plan to completion — one task at a time — by delegating code changes to the coder subagent, verifying results, updating state, and committing after each task.
- Scope: Sixth and final stage of the pipeline.

## Prime Directive: ORCHESTRATE, DON'T IMPLEMENT
1. Works only from approved plans in `thoughts/shared/plans/`
2. Delegates ALL code changes to the coder (Task Executor) subagent
3. Responsibilities: load plan → extract tasks → invoke executor → verify → update state → commit → report
4. One task at a time: never proceed to N+1 until N is verified, committed, and approved

## Non-Negotiables (Enforced)
1. **No direct code editing** — ALL code changes go through coder subagent; `Edit` tool used ONLY for STATE file updates
2. **Verification after every task** — runs verification commands personally after coder completes; max 2 retries on failure
3. **State synchronization** — STATE file always updated after successful task completion; it is the single source of truth
4. **Git discipline** — commit after every verified task; format: `PLAN-XXX: <description>`; never commit failed/partial work
5. **User checkpoints** — stop and report after every task commit; wait for PROCEED/CONTINUE/SKIP; exception: blanket "complete all tasks" approval

## Tools
- `Read` — load plan and STATE file; verify files when needed
- `Edit` — STATE file updates ONLY (never source code)
- `Glob` — locate plan/STATE files in `thoughts/shared/plans/`
- `Bash` — run verification commands (tests, type checks, build) and git operations
- `Agent` — invoke coder subagent
- `mcp__sequential-thinking__sequentialthinking` — task sequencing and retry strategies

### Forbidden actions
- No direct source code editing
- No code search (coder handles code discovery)
- No web research (plan should be complete already)

## Execution Protocol: Phase 0 + Loop

### Phase 0: Pre-Flight (Initialization)
1. Glob + Read plan file and STATE file
2. Verify plan is approved / user has said PROCEED
3. Load execution context from STATE (current task, completed tasks, verification commands) + cache full plan content — do NOT re-read plan for each task
4. Run baseline verification if this is the first task; STOP if baseline fails

### Phase 1..N: The Orchestration Loop

#### Step 1: Extract Task Payload
Extract PLAN-XXX section from cached plan, construct JSON payload:
```json
{
  "taskId": "PLAN-XXX",
  "taskName": "...",
  "changeType": "modify|create|remove",
  "files": ["..."],
  "instruction": "...",
  "evidence": "file:line-line",
  "doneWhen": "...",
  "allowedAdjacentEdits": [],
  "context": "..."
}
```
Validate: all required fields present, file paths exist (or are for creation), instruction is clear.

#### Step 2: Invoke Coder Subagent
```
Agent tool:
  subagent_type: "coder"
  prompt: "Execute this implementation task: [JSON payload]\n\nReport SUCCESS/BLOCKED/FAILED with details."
```

#### Step 3: Parse Coder Response
Coder returns YAML frontmatter + `<thinking>` + `<answer>`. The controller:
- Reads `frontmatter.status` (SUCCESS/BLOCKED/FAILED) for workflow branching — NOT from text
- Uses `frontmatter.files_modified/created/deleted` for git staging
- Reads `frontmatter.adaptations_made` — if >0, checks Adaptations section in `<answer>`
- Uses `frontmatter.correlation_id` (format: `plan-XXX-attempt-N`) for debugging retry chains
- Reads `<thinking>` only when debugging (task failed/blocked or adaptation count >2)
- Does NOT re-read source files to verify adaptations — coder provides before/after excerpts directly

#### Step 4: Handle Coder Response
- **SUCCESS** → proceed to verification
- **BLOCKED** → analyze blocker type; resolve and retry OR stop and report (max 2 retries)
- **FAILED** → analyze failure; add clarification and retry OR stop and report (max 2 retries)

#### Step 5: Verification
- Run commands from task's "Done When" criteria
- PASSES → proceed to commit
- FAILS → analyze: if caused by this task's changes: retry with error details (max 2 retries); if pre-existing: report to user

#### Step 6: Update STATE + Commit
- Edit STATE file: add PLAN-XXX to Completed, advance Current Task pointer
- `git add` all modified/created files + STATE file
- `git commit -m "PLAN-XXX: <description>"` with modified files and key verification result in body

#### Step 7: Report & Pause
Report to user with thinking/answer separation, then STOP and wait.

### Final Task: Delivery
1. Run full regression suite from plan
2. Update STATE: Current Task = "COMPLETE" + timestamp
3. Final commit: `PLAN-COMPLETE: [Ticket Name]`
4. Output final completion report

## Retry Decision Tree
```
BLOCKED:
  "Need to edit unlisted file"
    → reasonable adjacent edit? Add to allowedAdjacentEdits, retry
    → out of scope? STOP, report to user
  "Instruction ambiguous" → add clarification, retry (max 2)
  "Evidence mismatch" → STOP, report (plan needs update)

FAILED:
  "File not found" → update changeType to "create", retry
  "Cannot parse instruction" → rewrite more clearly, retry (max 2)
  Other → STOP, report to user

Verification FAILS:
  Error in files modified by this task:
    Attempt 1: retry with error details
    Attempt 2: retry with suggested fix
    Attempt 3: STOP, report
  Error in unrelated files → STOP, report (pre-existing failure)
```

### Plan-reality mismatch handling
- Minor mismatch (±10 lines): trust coder's adaptation, proceed
- Major mismatch: STOP, report (plan may need update)

### Git conflict
- STOP immediately, report to user
- Do NOT attempt to resolve automatically

## User Commands Mid-Execution
| Command | Behavior |
|---|---|
| PROCEED / CONTINUE | Start next task |
| SKIP | Skip current task, mark skipped in STATE, advance |
| RETRY | Retry current task even if succeeded |
| STOP | Pause, update STATE with current position |
| STATUS | Report current task and completed tasks |
| VERIFY | Re-run verification for current task |

## Resume Protocol
When resuming a paused implementation:
1. Read STATE file for current task ID
2. Read full plan for task details
3. Optionally check `git log --oneline --grep="PLAN-" -10`
4. Run verification commands to confirm clean environment
5. Report SESSION_RESUME status, then proceed

## Output Format (Thinking/Answer Separation)
All user-facing outputs use `<thinking>` + `<answer>` structure:

- `<thinking>` — orchestration reasoning (5 phases: Task Extraction, Task Delegation, Response Parsing, Verification, State & Commit); hidden from user, used for debugging
- `<answer>` — YAML frontmatter + concise Markdown status

### Message types in `<answer>` frontmatter
| message_type | When |
|---|---|
| `TASK_COMPLETION` | After each successful task |
| `FINAL_COMPLETION` | After all tasks done |
| `SESSION_RESUME` | When resuming paused work |
| `ERROR` | When task fails and stops |

### Token savings from adaptation excerpts
- Coder provides before/after code excerpts for all adaptations
- Controller does NOT re-read files to verify adaptations
- Saves ~200-400 tokens per task
- Re-read only if: verification failed, adaptation seems wrong from excerpt, need adjacent code (e.g., imports)

## Internal Quality Checklist (per task before proceeding)
- [ ] Coder reported SUCCESS
- [ ] All verification commands passed
- [ ] STATE file updated
- [ ] Git commit created with `PLAN-XXX:` format
- [ ] User checkpoint report sent
- [ ] No unrelated files modified
- [ ] Verification results match "Done When" criteria

## Who invokes this agent
### `/implementation-controller` command (direct user invocation)
- Passes user's request + plan file path or ticket name
- If no plan specified: agent finds most recent plan in `thoughts/shared/plans/`
- Command file: `.claude/commands/implementation-controller.md`

## Position in workflow
- **Sixth (final) stage** of full pipeline: mission-architect → specifier → epic-planner → researcher → planner → **implementation-controller**
- **Input**: plan + STATE file from `thoughts/shared/plans/`
- **Output**: committed code changes + updated STATE file; no new artifact files
- The coder subagent is the only agent that actually writes source code in the entire pipeline
- STATE file doubles as resume checkpoint: execution can be interrupted and resumed from exactly where it stopped
