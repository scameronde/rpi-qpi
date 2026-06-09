# Workflow Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Commands+Agent orchestration pairs and the broken IC/Coder delegation with Skills + SDD, and add a SessionStart hook for skill discovery.

**Architecture:** Workflow orchestrators become Skills (instructions for Claude in the main loop). Context isolation is preserved via Agent tool calls inside those Skills. The IC/Coder pair is replaced by the Subagent-Driven Development (SDD) skill, which dispatches fresh `general-purpose` agents per task with two review stages. A SessionStart hook bootstraps skill awareness on every session open.

**Tech Stack:** Markdown (skill/hook files), Bash (hook script), no build step required.

---

## File Structure

### Deleted
- `.claude/commands/` (entire directory — 7 files)
- `.claude/agents/mission-architect.md`
- `.claude/agents/feature-architect.md`
- `.claude/agents/specifier.md`
- `.claude/agents/epic-planner.md`
- `.claude/agents/researcher.md`
- `.claude/agents/planner.md`
- `.claude/agents/implementation-controller.md`
- `.claude/agents/coder.md`

### Created
- `.claude/skills/mission-architect/SKILL.md`
- `.claude/skills/feature-architect/SKILL.md`
- `.claude/skills/specifier/SKILL.md`
- `.claude/skills/epic-planner/SKILL.md`
- `.claude/skills/researcher/SKILL.md`
- `.claude/skills/planner/SKILL.md`
- `.claude/skills/subagent-driven-development/SKILL.md`
- `.claude/skills/subagent-driven-development/implementer-prompt.md`
- `.claude/skills/subagent-driven-development/spec-reviewer-prompt.md`
- `.claude/skills/subagent-driven-development/code-quality-reviewer-prompt.md`
- `.claude/hooks/hooks.json`
- `.claude/hooks/session-start`

### Modified
- `CLAUDE.md`

---

## Phase 1: Cleanup

### Task 1: Delete Commands and Replaced Agents

**Files:**
- Delete: `.claude/commands/` (all contents)
- Delete: `.claude/agents/mission-architect.md`
- Delete: `.claude/agents/feature-architect.md`
- Delete: `.claude/agents/specifier.md`
- Delete: `.claude/agents/epic-planner.md`
- Delete: `.claude/agents/researcher.md`
- Delete: `.claude/agents/planner.md`
- Delete: `.claude/agents/implementation-controller.md`
- Delete: `.claude/agents/coder.md`

- [ ] **Step 1: Delete commands/ directory**

```bash
rm -rf .claude/commands/
```

Expected: directory gone, no output.

- [ ] **Step 2: Delete replaced agent files**

```bash
rm .claude/agents/mission-architect.md \
   .claude/agents/feature-architect.md \
   .claude/agents/specifier.md \
   .claude/agents/epic-planner.md \
   .claude/agents/researcher.md \
   .claude/agents/planner.md \
   .claude/agents/implementation-controller.md \
   .claude/agents/coder.md
```

Expected: all 8 files removed.

- [ ] **Step 3: Verify only worker agents remain**

```bash
ls .claude/agents/
```

Expected output (6 files only):
```
codebase-analyzer.md
codebase-locator.md
codebase-pattern-finder.md
thoughts-analyzer.md
thoughts-locator.md
web-search-researcher.md
```

- [ ] **Step 4: Commit**

```bash
git add -A .claude/commands/ .claude/agents/
git commit -m "chore: remove commands/ dir and replaced agent files (mission-architect, feature-architect, specifier, epic-planner, researcher, planner, IC, coder)"
```

---

## Phase 2: Convert Agents to Skills

Each skill is created from the corresponding agent file. The conversion rule is identical for all six:

1. New frontmatter: `name` + `description` only (no `tools:`, no `model:`)
2. Copy agent body verbatim
3. Remove the "### Message Envelope (Agent-to-Agent Communication)" section and all its contents (from the section heading through the closing code fence and Field Descriptions)
4. Keep everything else

### Task 2: mission-architect Skill

**Files:**
- Create: `.claude/skills/mission-architect/SKILL.md`

Source to convert: `.claude/agents/mission-architect.md` (now deleted — use git if needed, or recreate from the instructions below)

- [ ] **Step 1: Create skill directory and SKILL.md**

Write `.claude/skills/mission-architect/SKILL.md` with this frontmatter, then the body of the former `agents/mission-architect.md` starting from line 12 (`# Mission Architect: Vision Discovery...`) down to the end of the file, **omitting** the "### Message Envelope (Agent-to-Agent Communication)" section (the block spanning from that heading through the Field Descriptions block that ends before "### Document Frontmatter (In Mission Statement Files)").

```markdown
---
name: mission-architect
description: Discover and articulate the vision for greenfield projects or new features via conversation. Produces a mission statement focused on why and what, not how. Use before /specifier. Outputs to thoughts/shared/missions/.
---

[body from agents/mission-architect.md:12 to end, minus Message Envelope section]
```

The removed section spans from:
```
### Message Envelope (Agent-to-Agent Communication)
```
...through the end of the Field Descriptions block (the `mission_status` field descriptions), i.e. stop removing at:
```
### Document Frontmatter (In Mission Statement Files)
```
which should be kept.

- [ ] **Step 2: Verify file exists and has correct frontmatter**

```bash
head -5 .claude/skills/mission-architect/SKILL.md
```

Expected:
```
---
name: mission-architect
description: Discover and articulate the vision for greenfield projects or new features via conversation. Produces a mission statement focused on why and what, not how. Use before /specifier. Outputs to thoughts/shared/missions/.
---
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/mission-architect/
git commit -m "feat: add mission-architect skill (converted from agent)"
```

---

### Task 3: feature-architect Skill

**Files:**
- Create: `.claude/skills/feature-architect/SKILL.md`

- [ ] **Step 1: Create skill directory and SKILL.md**

Write `.claude/skills/feature-architect/SKILL.md` with this frontmatter, followed by the body of the former `agents/feature-architect.md` (the lines after the closing `---` of the agent frontmatter), minus the Message Envelope section:

```markdown
---
name: feature-architect
description: Define a new feature in an existing system via conversation and light codebase scan. Use for brownfield additions — not greenfield projects. Outputs a feature brief to thoughts/shared/features/. Use before /epic-planner.
---

[body from agents/feature-architect.md, minus Message Envelope section]
```

- [ ] **Step 2: Verify**

```bash
head -5 .claude/skills/feature-architect/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/feature-architect/
git commit -m "feat: add feature-architect skill (converted from agent)"
```

---

### Task 4: specifier Skill

**Files:**
- Create: `.claude/skills/specifier/SKILL.md`

- [ ] **Step 1: Create skill directory and SKILL.md**

```markdown
---
name: specifier
description: Transform a mission statement into a technical specification. Reads thoughts/shared/missions/ and outputs a spec to thoughts/shared/specs/. Use after /mission-architect and before /epic-planner.
---

[body from agents/specifier.md, minus Message Envelope section]
```

- [ ] **Step 2: Verify**

```bash
head -5 .claude/skills/specifier/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/specifier/
git commit -m "feat: add specifier skill (converted from agent)"
```

---

### Task 5: epic-planner Skill

**Files:**
- Create: `.claude/skills/epic-planner/SKILL.md`

- [ ] **Step 1: Create skill directory and SKILL.md**

```markdown
---
name: epic-planner
description: Decompose a specification into implementation-ready epics. Reads thoughts/shared/specs/ and outputs one epic file per epic to thoughts/shared/epics/. Use after /specifier and before /researcher.
---

[body from agents/epic-planner.md, minus Message Envelope section]
```

- [ ] **Step 2: Verify**

```bash
head -5 .claude/skills/epic-planner/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/epic-planner/
git commit -m "feat: add epic-planner skill (converted from agent)"
```

---

### Task 6: researcher Skill

**Files:**
- Create: `.claude/skills/researcher/SKILL.md`

Note: researcher has a longer body (~700 lines) with extensive delegation patterns. All delegation patterns remain unchanged — the skill still instructs Claude to spawn `codebase-locator`, `codebase-analyzer`, etc. via the Agent tool.

- [ ] **Step 1: Create skill directory and SKILL.md**

```markdown
---
name: researcher
description: Map the codebase for a spec or question. Spawns codebase agents in isolated contexts — only results return to main context. Outputs a research report to thoughts/shared/research/. Use before /planner.
---

[body from agents/researcher.md starting at line 12 ("# Research Architect: Codebase Mapping & Documentation"), minus the "### Message Envelope (Agent-to-Agent Communication)" section]
```

The Message Envelope section to remove runs from:
```
### Message Envelope (Agent-to-Agent Communication)
```
...through the Field Descriptions for `findings_count`, stopping before:
```
### Document Frontmatter (In Research Report Files)
```

- [ ] **Step 2: Verify file size is reasonable (should be ~500+ lines)**

```bash
wc -l .claude/skills/researcher/SKILL.md
```

Expected: 500+ lines (the file is large due to delegation pattern documentation).

- [ ] **Step 3: Verify no mention of "Message Envelope"**

```bash
grep -n "Message Envelope" .claude/skills/researcher/SKILL.md
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/researcher/
git commit -m "feat: add researcher skill (converted from agent)"
```

---

### Task 7: planner Skill

**Files:**
- Create: `.claude/skills/planner/SKILL.md`

Additional changes beyond the standard conversion:
1. Remove the `Complexity:` field from the PLAN-XXX task format in Output Format section (it was for IC/Coder heuristic, not needed by SDD)
2. Remove the "Complexity Override Usage" bullet block below it
3. Change "Target Audience: The Implementor Agent (an AI coder)" to "Target Audience: Claude running the /subagent-driven-development skill"

- [ ] **Step 1: Create skill directory and SKILL.md**

```markdown
---
name: planner
description: Write a sequenced, evidence-based implementation plan from a research report. Spawns codebase agents to verify evidence. Outputs plan + state files to thoughts/shared/plans/. Use after /researcher and before /subagent-driven-development.
---

[body from agents/planner.md, with these changes:
 1. Remove Message Envelope section (standard conversion)
 2. Remove Complexity field + its Usage block from the PLAN-XXX task format
 3. Change "Target Audience: The Implementor Agent (an AI coder)" to
    "Target Audience: Claude running the /subagent-driven-development skill"]
```

Specifically, in the Output Format section, remove this block from the PLAN-XXX task template:

```
- **Complexity:** simple|complex (OPTIONAL - overrides heuristic if specified)

**Complexity Override Usage:**
- Use `simple` to force direct execution (use when heuristic might overestimate complexity)
- Use `complex` to force delegation (use when task appears simple but has hidden complexity)
- Omit field to let Implementation-Controller use automatic heuristic (recommended default)
- Example use case: Single-file task in highly unstable file → mark as `complex` to use adaptation capability
```

- [ ] **Step 2: Verify no Complexity field**

```bash
grep -n "Complexity" .claude/skills/planner/SKILL.md
```

Expected: no output (or only unrelated occurrences).

- [ ] **Step 3: Verify no Message Envelope**

```bash
grep -n "Message Envelope" .claude/skills/planner/SKILL.md
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/planner/
git commit -m "feat: add planner skill (converted from agent, remove IC complexity field)"
```

---

## Phase 3: Subagent-Driven Development Skill

### Task 8: SDD SKILL.md

**Files:**
- Create: `.claude/skills/subagent-driven-development/SKILL.md`

- [ ] **Step 1: Create skill directory and SKILL.md**

```markdown
---
name: subagent-driven-development
description: Execute an implementation plan task-by-task via fresh subagents with spec-compliance and code-quality review after each task. Replaces /implement. Use after /planner has produced a plan in thoughts/shared/plans/.
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
3. Create a TodoWrite item per task for tracking.
4. If anything in the plan is ambiguous, ask now before starting.

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

Confirm the commit includes the PLAN-XXX ID. Mark the task done in your todo list. Move to the next task.

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
```

- [ ] **Step 2: Verify file exists**

```bash
head -10 .claude/skills/subagent-driven-development/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/subagent-driven-development/SKILL.md
git commit -m "feat: add subagent-driven-development SKILL.md"
```

---

### Task 9: implementer-prompt.md

**Files:**
- Create: `.claude/skills/subagent-driven-development/implementer-prompt.md`

This file is the prompt template the SDD skill reads and embeds into each implementer Agent call. Placeholders in `[BRACKETS]` are filled in by the SDD skill before dispatching.

- [ ] **Step 1: Create implementer-prompt.md**

```markdown
# Implementer: Single Task Implementation

You are implementing a single task from an implementation plan. Implement exactly this task — nothing more, nothing less.

## Task

**[PLAN-XXX]: [Task Name]**

[PASTE FULL TASK CONTENT HERE — include: instruction, File(s), evidence, doneWhen, context, allowedAdjacentEdits if any]

## Files Changed by Earlier Tasks

These files were modified by earlier tasks in this plan. Read them before starting if your task touches them.

[LIST FILES FROM PRIOR TASKS, or "None — this is the first task"]

## Your Responsibilities

1. Read each file in the task's **File(s)** field to understand current state
2. Implement exactly what the task specifies
3. Write tests for your changes — write the failing test first when possible
4. Run tests to verify they pass
5. Commit your work:
   ```bash
   git add [specific files only — not git add -A]
   git commit -m "[PLAN-XXX]: [brief description of what you implemented]"
   ```
6. Self-review against the checklist below

## Constraints

- Only modify files in the task's **File(s)** field (or **allowedAdjacentEdits** if listed)
- If you need to touch an unlisted file: report `NEEDS_CONTEXT`, do **not** touch it silently
- No scope creep — implement what is asked, not what seems useful
- Follow existing code conventions in the files you touch
- Use `Edit` and `Write` tools for file changes — not Bash shell commands

## Self-Review Checklist

Before reporting:
- [ ] Everything in the task instruction is implemented
- [ ] Tests verify real behavior (not just existence or mocks)
- [ ] No unrequested features or refactors added
- [ ] Code matches conventions in the surrounding file
- [ ] Commit made with PLAN-XXX in the message

Fix any issues before reporting.

## Report Format

Start with one of:

**DONE** — implementation complete, tests pass, committed.

**DONE_WITH_CONCERNS** — complete and committed, but with observations:
> [list concerns — things that surprised you, edge cases you noticed, things worth the orchestrator knowing]

**NEEDS_CONTEXT** — I need this information before I can proceed:
> [specific question or missing information]

**BLOCKED** — I cannot complete this task:
> [what is blocking me]
> [what I need to be unblocked]

Then provide:
- **Files changed**: path + one-line description of change
- **Tests written**: test names + pass/fail result
- **Commit**: hash + message
- **Adaptations** (if any): what differed from the task's evidence and how you handled it
```

- [ ] **Step 2: Verify file exists**

```bash
wc -l .claude/skills/subagent-driven-development/implementer-prompt.md
```

Expected: ~60 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/subagent-driven-development/implementer-prompt.md
git commit -m "feat: add implementer-prompt.md for SDD skill"
```

---

### Task 10: spec-reviewer-prompt.md

**Files:**
- Create: `.claude/skills/subagent-driven-development/spec-reviewer-prompt.md`

- [ ] **Step 1: Create spec-reviewer-prompt.md**

```markdown
# Spec Compliance Reviewer

You are verifying that an implementation matches its specification.

## What Was Requested

**[PLAN-XXX]: [Task Name]**

[PASTE FULL TASK REQUIREMENTS — instruction, File(s), doneWhen from plan]

## What the Implementer Reported

[PASTE IMPLEMENTER'S REPORT — status, files changed, tests, commit hash]

## Your Job

Verify the implementation matches the spec. **Do not trust the implementer's report alone** — read the actual code.

Steps:
1. Get the list of changed files from the implementer's report
2. Read each changed file
3. Compare what you see against what was requested

Check for:

**Missing** — Did they implement everything requested? Any requirements from the task instruction that were skipped?

**Extra** — Did they build things not requested? Scope creep? Features not in the task?

**Misunderstood** — Did they implement something different from what was specified?

**Not committed** — Is there a commit with the PLAN-XXX ID?

## Report

If compliant:

```
✅ SPEC COMPLIANT
Verified: [brief list of what you confirmed]
Commit: [hash]
```

If issues found:

```
❌ SPEC ISSUES
- [Issue 1: what was requested vs what was built — include file:line reference]
- [Issue 2: ...]
```

Be specific. Vague feedback like "missing tests" is not actionable. Write "test for the error case in `src/auth.ts:handleExpired` was not written" instead.
```

- [ ] **Step 2: Verify file exists**

```bash
wc -l .claude/skills/subagent-driven-development/spec-reviewer-prompt.md
```

Expected: ~50 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/subagent-driven-development/spec-reviewer-prompt.md
git commit -m "feat: add spec-reviewer-prompt.md for SDD skill"
```

---

### Task 11: code-quality-reviewer-prompt.md

**Files:**
- Create: `.claude/skills/subagent-driven-development/code-quality-reviewer-prompt.md`

- [ ] **Step 1: Create code-quality-reviewer-prompt.md**

```markdown
# Code Quality Reviewer

You are reviewing code quality for a recently implemented task. Only dispatch after spec compliance review has passed.

## Task Context

**[PLAN-XXX]: [Task Name]**

[Brief description: what this task implemented and why]

## Changed Files

[List files changed, from the implementer's report. Include commit hash.]

## Your Job

Read the changed files, then review for:

### Correctness
- Logic errors or edge cases not handled by the implementation
- Tests that only mock dependencies without verifying real behavior
- Assertions that pass trivially without exercising the requirement

### Cleanliness
- Names that are unclear, misleading, or inconsistent with surrounding code
- Duplicated logic that should be extracted
- Premature abstractions — over-engineered for what the task asked
- Dead code or unreachable branches

### Maintainability
- Would a future developer understand this without explanatory comments?
- Is each unit doing one thing, or has it grown to do several?
- Are files growing unwieldy (mixed concerns, unclear responsibilities)?

## Report

```
Strengths: [what is well done]

Issues:
- Critical (must fix before advancing): [description] — [file:line]
- Important (should fix): [description] — [file:line]
- Minor (nice to have): [description] — [file:line]

Assessment: APPROVED | NEEDS FIXES
```

If no issues found:
```
Strengths: [what is well done]
Issues: none
Assessment: APPROVED
```

Be specific with file:line references. "Could be cleaner" is not actionable feedback.
```

- [ ] **Step 2: Verify file exists**

```bash
wc -l .claude/skills/subagent-driven-development/code-quality-reviewer-prompt.md
```

Expected: ~55 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/subagent-driven-development/code-quality-reviewer-prompt.md
git commit -m "feat: add code-quality-reviewer-prompt.md for SDD skill"
```

---

## Phase 4: Session Bootstrap Hook

### Task 12: hooks.json

**Files:**
- Create: `.claude/hooks/hooks.json`

The `matcher` field uses a regex matched against the session trigger. `startup|clear|compact` matches session open, `/clear`, and context compaction — the same pattern used by Superpowers.

- [ ] **Step 1: Create hooks directory and hooks.json**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Verify valid JSON**

```bash
python3 -c "import json; json.load(open('.claude/hooks/hooks.json')); print('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add .claude/hooks/hooks.json
git commit -m "feat: add hooks.json for SessionStart skill bootstrap"
```

---

### Task 13: session-start Script

**Files:**
- Create: `.claude/hooks/session-start`

The script outputs JSON with `hookSpecificOutput.additionalContext` — the format Claude Code reads for SessionStart hooks. The context string injects skill awareness as active instructions (not passive documentation).

- [ ] **Step 1: Create session-start script**

```bash
#!/usr/bin/env bash
set -euo pipefail

context="You have workflow skills for software development available in this project.

## Available Workflow Skills

/mission-architect — Greenfield projects: discover vision, output mission statement to thoughts/shared/missions/. Use before /specifier.
/feature-architect — Brownfield features: define new feature in existing system, output feature brief to thoughts/shared/features/. Use before /epic-planner.
/specifier — Transform mission statement into technical spec. Output to thoughts/shared/specs/. Use after /mission-architect.
/epic-planner — Decompose spec into epics. Output to thoughts/shared/epics/. Use after /specifier.
/researcher — Map the codebase for a spec or question. Spawns codebase agents for isolation. Output to thoughts/shared/research/. Use before /planner.
/planner — Write a sequenced, evidence-based implementation plan. Output to thoughts/shared/plans/. Use after /researcher.
/subagent-driven-development — Execute plan task-by-task via subagents with spec and quality review after each. Use after /planner.

## Workflow Ordering

Greenfield:  /mission-architect → /specifier → /epic-planner → /researcher → /planner → /subagent-driven-development
Brownfield:  /feature-architect → /epic-planner → /researcher → /planner → /subagent-driven-development
Small fix:   /researcher → /planner → /subagent-driven-development

## Rules

- Always run /researcher before /planner — planner needs a verified research report.
- Always run /planner before /subagent-driven-development — SDD needs a plan file.
- Invoke skills proactively when the user's request matches the trigger condition.
- When the user says 'research X', 'understand X', or 'investigate X' → invoke /researcher.
- When the user says 'implement', 'build', or 'execute the plan' → invoke /subagent-driven-development."

escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

escaped=$(escape_for_json "$context")

printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$escaped"
```

- [ ] **Step 2: Make script executable**

```bash
chmod +x .claude/hooks/session-start
```

- [ ] **Step 3: Test script output**

```bash
.claude/hooks/session-start | python3 -c "import json,sys; d=json.load(sys.stdin); print('valid'); print(d['hookSpecificOutput']['hookEventName'])"
```

Expected:
```
valid
SessionStart
```

- [ ] **Step 4: Commit**

```bash
git add .claude/hooks/session-start
git commit -m "feat: add session-start hook to inject workflow skill awareness"
```

---

## Phase 5: Update Documentation

### Task 14: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

CLAUDE.md needs to reflect the new structure. Key changes:
1. Opening paragraph: skills-based, not commands-based
2. Workflow Pipeline: `/implement` → `/subagent-driven-development`
3. Development Commands section: replace Commands table with Skills table, add SDD to skills list
4. Subagents table: remove `coder.md` row
5. Directory Structure: remove `commands/` entry, add `hooks/` entry, update `skills/` comment
6. `commands/ vs agents/ vs skills/` section: remove commands/ bullet, update agents/ description

- [ ] **Step 1: Write updated CLAUDE.md**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Code Workflow

This project uses a structured agentic workflow for software development. Workflow orchestrators are Skills in `.claude/skills/` and invoked via `/skill-name`. Worker agents are in `.claude/agents/` and spawned by Skills via the Agent tool.

## Workflow Pipeline

**Greenfield (new project):**
```
/mission-architect → /specifier → /epic-planner → /researcher → /planner → /subagent-driven-development
```

**Brownfield (new feature in existing system):**
```
/feature-architect → /epic-planner → /researcher → /planner → /subagent-driven-development
```

**Small change or bug fix:**
```
/researcher → /planner → /subagent-driven-development
```

Each stage produces artifacts written to `thoughts/shared/`:

| Stage | Skill | Output directory |
|---|---|---|
| Vision (greenfield) | `/mission-architect` | `thoughts/shared/missions/` |
| Feature brief (brownfield) | `/feature-architect` | `thoughts/shared/features/` |
| Spec | `/specifier` | `thoughts/shared/specs/` |
| Epics | `/epic-planner` | `thoughts/shared/epics/` |
| Research | `/researcher` | `thoughts/shared/research/` or `thoughts/shared/qa/` |
| Plan | `/planner` | `thoughts/shared/plans/` |
| Execution | `/subagent-driven-development` | Git commits per task |

## Workflow Skills

All workflow orchestration is done via Skills (invoked with `/skill-name` or proactively by Claude):

| Skill | Purpose |
|---|---|
| `/mission-architect` | Discover project vision and goals via conversation (greenfield) |
| `/feature-architect` | Define a new feature within an existing system (brownfield) |
| `/specifier` | Translate a mission into a technical specification |
| `/epic-planner` | Decompose a spec into epics and user stories |
| `/researcher` | Map the codebase relevant to a spec or question |
| `/planner` | Produce a sequenced, evidence-based implementation plan |
| `/subagent-driven-development` | Execute a plan task-by-task via subagents, with spec + quality review per task |

## Quality Skills

| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic code quality review (Clean Code, Pragmatic Programmer, etc.) |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |

## Worker Agents (used internally by Skills)

These live in `.claude/agents/` and are spawned by Skills via the `Agent` tool — never invoked directly.

| File | Role | Agent type |
|---|---|---|
| `codebase-locator.md` | Find files by purpose/pattern | Explore |
| `codebase-analyzer.md` | Trace logic and data flow | Explore |
| `codebase-pattern-finder.md` | Find recurring patterns | Explore |
| `thoughts-locator.md` | Find docs in `thoughts/` directory | Explore |
| `thoughts-analyzer.md` | Extract signal from docs | Explore |
| `web-search-researcher.md` | External knowledge and docs | general-purpose |

## MCP Servers

Servers live in `.claude/mcp/` and are auto-enabled via `"enableAllProjectMcpServers": true` in `.claude/settings.json`. Build before first use:

```bash
cd .claude/mcp/crawl4ai && npm install && npm run build
cd .claude/mcp/searxng  && npm install && npm run build
```

| Server | Tool | Description |
|---|---|---|
| `crawl4ai` | `crawl4ai` | Web crawling with 3 modes: crawl, markdown, screenshot |
| `searxng` | `searxng_search` | Web search via self-hosted SearXNG |

### crawl4ai tool parameters
- `url` (required): URL to crawl
- `mode`: `crawl` | `markdown` | `screenshot` (default: `crawl`)
- `cache_mode`: `enabled` | `disabled` | `bypass` | `read_only` | `write_only`
- `css_selector`: Extract specific content (crawl mode)
- `markdown_filter`: `raw` | `fit` | `bm25` | `llm` (default: `fit`)
- `filter_query`: Query for bm25/llm filters

### searxng_search tool parameters
- `query` (required): Search query
- `categories`: Comma-separated categories (e.g., `general,social media`)
- `language`: Language code (e.g., `en`, `de`)
- `time_range`: `day` | `month` | `year`
- `pageno`: Page number (default: 1)

## Directory Structure

```
.claude/
  agents/         # Worker agents (spawned by Skills via Agent tool)
  skills/         # All skills — workflow orchestrators + quality reviewers
  hooks/          # SessionStart hook for skill bootstrap
  mcp/
    crawl4ai/     # MCP server wrapping Crawl4AI
    searxng/      # MCP server wrapping SearXNG
  settings.json          # enableAllProjectMcpServers: true
  settings.local.json    # permissions (WebSearch, WebFetch, Bash allowlist)

thoughts/
  shared/
    missions/     # Vision artifacts from /mission-architect
    features/     # Feature briefs from /feature-architect
    specs/        # Technical specs from /specifier
    epics/        # Epics from /epic-planner
    research/     # Codebase research from /researcher
    qa/           # QA research from /researcher
    plans/        # Plans + STATE files from /planner

agent/            # Original opencode agent definitions (reference only)
skills/           # Original opencode skill definitions (reference only)
tool/             # Original opencode tool source files (crawl4ai.ts, searxng-search.ts)
```

### agents/ vs skills/

- **`agents/`** — Worker agents, never invoked directly. Skills embed their path in `Agent` tool `subagent_type` parameters. Each file defines a specialized read-only or search role (Explore type) or a web researcher (general-purpose type). Context isolation comes from the Agent tool call, not from file type.
- **`skills/`** — Skills loaded via the `Skill` tool. Workflow orchestrators (`/mission-architect` through `/subagent-driven-development`) plus quality tools. The `/subagent-driven-development` skill directory also contains three prompt template files used to build implementer and reviewer prompts.

## Plan File Format

Plans produced by `/planner` follow this structure:

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
- allowedAdjacentEdits: [optional]
- context: Why this change is needed
```

`/subagent-driven-development` reads the plan and dispatches one implementer subagent per PLAN-XXX task.
```

- [ ] **Step 2: Verify workflow pipeline mentions subagent-driven-development**

```bash
grep "subagent-driven-development" CLAUDE.md | wc -l
```

Expected: 4+ occurrences.

- [ ] **Step 3: Verify no mention of /implement or commands/**

```bash
grep -E "commands/|/implement\b" CLAUDE.md
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for skills-based workflow (remove commands/, update to SDD)"
```

---

## Self-Review

- [x] **Spec coverage**: All items from the design spec are covered:
  - `commands/` deleted ✓
  - 9 agent files deleted ✓
  - 6 orchestrators converted to Skills ✓
  - SDD skill with 3 prompt templates ✓
  - `hooks/hooks.json` + `hooks/session-start` ✓
  - `CLAUDE.md` updated ✓

- [x] **Placeholder scan**: No TBD/TODO/placeholder entries in file content tasks.

- [x] **Type consistency**: No functions or types defined across tasks — this is a file operations plan.

- [x] **Ordering dependency**: Phase 1 (cleanup) must run first, but the git history is preserved if agent files are needed during skill creation.

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-06-09-workflow-restructure.md`.

**Note on Phase 2 (skill conversions):** The agent files are deleted in Task 1. Before running Task 1, use `git show HEAD:<path>` or ensure the agent files are read/saved first if you want to reference them during skill creation. Alternatively, run Tasks 2–7 before Task 1 (clean up last).

**Two execution options:**

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
