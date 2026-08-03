---
date: 2026-08-03
planner: claude-planner
ticket: "Implement-LSP-Preference"
status: complete
fact-source: "thoughts/shared/facts/2026-08-03-Implement-LSP-Preference-Prompt-Templates.md"
upstream-artifact: thoughts/shared/changes/2026-08-03-Implement-LSP-Preference.md
---

# Implement-LSP-Preference Implementation Plan

## Inputs
- Fact report(s) used: `thoughts/shared/facts/2026-08-03-Implement-LSP-Preference-Prompt-Templates.md`
- Change brief: `thoughts/shared/changes/2026-08-03-Implement-LSP-Preference.md` (from the fact report's `upstream-artifact:`)
- User request summary: Add explicit LSP-preference navigation guidance to `.claude/skills/implement/implementer-prompt.md` and `.claude/skills/implement/reviewer-prompt.md`, mirroring the style already used in `.claude/agents/codebase-analyzer.md` and `.claude/agents/codebase-pattern-finder.md` respectively, so `/implement`'s per-task subagents — the highest-volume subagents in the pipeline — are steered toward the lower-token LSP path instead of defaulting to raw `Read`/`Grep`.

## Verified Current State
- **Fact:** `implementer-prompt.md`'s `## Your Responsibilities` step 2 is the sole code-comprehension step and carries no tool-preference guidance today.
  - **Evidence:** `.claude/skills/implement/implementer-prompt.md:22`
  - **Excerpt:**
    ```markdown
    2. Read each file in the task's **File(s)** field to understand current state.
    ```
- **Fact:** `reviewer-prompt.md`'s `## Your Job` section is the earliest point applying to the reviewer's entire pass (both Part 1 and Part 2), and ends with a wave-scope reminder immediately before `### Part 1 — Spec Compliance` begins.
  - **Evidence:** `.claude/skills/implement/reviewer-prompt.md:17-23`
  - **Excerpt:**
    ```markdown
    ## Your Job

    **Do not trust the implementer's report** — read the actual code. Run the task's `Verify:` command yourself rather than believing the reported output.

    If the task's `Verify:` is `none — requires review`, there is no command to run and **you are the only check that exists.** The orchestrator routed this task here precisely because its `Done When` cannot be settled mechanically. Judge that condition directly against the code and say how you judged it.

    Concurrent implementers worked on other files in this wave. Review **only** the files listed above; other changes in the working tree are not yours to judge.
    ```
- **Fact:** `codebase-analyzer.md`'s "Follow Dependencies" step is the literal style/operation set (`goToDefinition`, `callHierarchy`, `hover`, fallback to `Read`) to mirror in `implementer-prompt.md`.
  - **Evidence:** `.claude/agents/codebase-analyzer.md:75-80`
  - **Excerpt:**
    ```markdown
    3. **Follow Dependencies**:
        - **Prefer LSP for navigation**: Use `goToDefinition` to jump directly to function/class definitions instead of manually resolving imports.
        - **Use LSP for execution flow**: Use `callHierarchy` (with `incomingCalls` and `outgoingCalls`) to map function call chains.
        - **Use LSP for type info**: Use `hover` to get type signatures without reading type definition files.
        - **Fallback to Read**: If LSP fails (unresolved import, dynamic code), fall back to `Read` on the import path.
    ```
- **Fact:** `codebase-pattern-finder.md`'s "LSP vs Grep Decision Guide" is the literal style/operation set (`workspaceSymbol`, `findReferences`, Grep for non-symbol text) to mirror in `reviewer-prompt.md`.
  - **Evidence:** `.claude/agents/codebase-pattern-finder.md:44-53`
  - **Excerpt:**
    ```markdown
    - **LSP**: **PREFER for symbol searches**. Use `workspaceSymbol` to find class/function definitions, `findReferences` to locate all usages of a symbol.
    - **Grep / Bash**: Use for string literal searches, comments, or when LSP doesn't apply (non-code patterns).

    **LSP vs Grep Decision Guide**:
    - **Use LSP** when searching for: class names, function names, type definitions, symbol usages (e.g., "find all usages of UserRepository")
    - **Use Grep** when searching for: string patterns, comments, non-symbol text, regex patterns (e.g., "find files containing TODO comments")
    ```
- **Fact:** `general-purpose` subagents — which is what `/implement` dispatches both `implementer-prompt.md` and `reviewer-prompt.md` to — already have unrestricted tool access (`Tools: *`), so `LSP` is reachable today without any tool-permission change; only steering is missing.
  - **Evidence:** `.claude/skills/implement/SKILL.md:104-111,178-183` (dispatch blocks name `subagent_type: general-purpose` with no tool restriction)

## Inherited Constraints (Respected)
None — the fact report's `## Inherited Constraints (Treated as Fixed)` read `None`, because change briefs carry no `## Inherited Constraints` section.

## Goals / Non-Goals
- **Goals:** Insert explicit, style-consistent LSP-preference guidance into both `implementer-prompt.md` and `reviewer-prompt.md`.
- **Non-Goals:** `.claude/agents/codebase-locator.md` stays untouched. `.claude/skills/implement/SKILL.md` stays untouched. No change to tool permissions/frontmatter of any file (subagents already have LSP access via `general-purpose`).

## Approval Gate

**Trigger 2 applies — this plan edits files that define the executing orchestrator's own behaviour.** `implementer-prompt.md` and `reviewer-prompt.md` are both inside `.claude/skills/implement/**`, which `CLAUDE.md`'s Non-Negotiables and this skill's own Phase 3 name explicitly: `/implement`'s own behavior comes from these files, and editing them mid-run changes the rules under a running plan.

This plan itself does not run `/implement` — it only writes the plan. The gate is on the **next** step, handing this plan to `/implement`. The question for the user:

- **Confirm no `/implement` run is currently mid-plan anywhere in this repository** (i.e., no other plan's `-STATE.md` file currently has `status: in-progress`) before invoking `/implement` on this plan. If one is in progress, wait for it to finish (or reach a safe pause) before executing this plan, since this plan's own tasks rewrite the two prompt templates every concurrent and future `/implement` invocation dispatches to its subagents.

No other Phase 3 trigger applies: this plan does not rename or change the allowed values of the `Wave:`/`Model:`/`Verify:`/`File(s)` task-field contract (trigger 1); it reverses no recorded deferral (trigger 3); and the fact report's `## Open Questions / Unverified Claims` read `None`, so no finding is left unaddressed (trigger 4).

## Design Overview
- Two independent, single-file edits — no shared state, no execution-order dependency between them.
- `implementer-prompt.md`: expand `## Your Responsibilities` step 2 with four sub-bullets, mirroring `codebase-analyzer.md`'s "Follow Dependencies" bullets (`goToDefinition`, `callHierarchy`, `hover`, fallback to `Read`). This is an in-place expansion of an existing step's content, not a new numbered step — no renumbering of steps 3-6 is needed.
- `reviewer-prompt.md`: insert one new paragraph at the end of `## Your Job` (after the wave-scope reminder, before `### Part 1 — Spec Compliance`), mirroring `codebase-pattern-finder.md`'s "LSP vs Grep Decision Guide" (`workspaceSymbol`, `findReferences`, Grep fallback for non-symbol text). Placed at the `## Your Job` level (not inside Part 2 only) because it should steer both Part 1 and Part 2 checks, which the fact report's Critical Finding 3 identifies as the section governing the reviewer's entire pass.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002 | `implementer-prompt.md`, `reviewer-prompt.md` | Independent, disjoint files, no dependency between them |

## Implementation Instructions (For Implementor)

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/implement/implementer-prompt.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Open `.claude/skills/implement/implementer-prompt.md`.
  2. Find step 2 of the `## Your Responsibilities` numbered list, currently reading exactly:
     ```markdown
     2. Read each file in the task's **File(s)** field to understand current state.
     ```
  3. Replace it with this step plus four indented sub-bullets immediately below it (same step number, no renumbering of steps 1 or 3-6):
     ```markdown
     2. Read each file in the task's **File(s)** field to understand current state.
        - **Prefer LSP for navigation**: Use `goToDefinition` to jump directly to function/class definitions instead of manually resolving imports.
        - **Use LSP for execution flow**: Use `callHierarchy` (with `incomingCalls` and `outgoingCalls`) to map function call chains.
        - **Use LSP for type info**: Use `hover` to get type signatures without reading type definition files.
        - **Fallback to Read**: If LSP fails (unresolved import, dynamic code), fall back to `Read` on the import path.
     ```
  4. Do not touch any other step, section, or file.
- **Interfaces / Pseudocode:** N/A — prose/markdown edit only.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:22` (current step 2, shown above) and `.claude/agents/codebase-analyzer.md:75-80` (style/operations mirrored, shown above in Verified Current State).
- **Done When:** Step 2 of `## Your Responsibilities` in `implementer-prompt.md` retains its original sentence and gains the four sub-bullets above, verbatim; no other step is renumbered or altered; no other file is touched.
- **Verify:** `grep -q "Prefer LSP for navigation" .claude/skills/implement/implementer-prompt.md && grep -q "goToDefinition" .claude/skills/implement/implementer-prompt.md && grep -q "callHierarchy" .claude/skills/implement/implementer-prompt.md && grep -q "Fallback to Read" .claude/skills/implement/implementer-prompt.md && echo PASS` → `PASS`
- **Context:** `/implement` dispatches this file verbatim to every implementer subagent, once per task, per wave — the highest-volume subagent in the pipeline. Today it carries no LSP steering even though its `general-purpose` runtime already has LSP access; this task closes that gap for the code-comprehension step, the one step whose job matches `codebase-analyzer.md`'s existing LSP guidance.

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/implement/reviewer-prompt.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Open `.claude/skills/implement/reviewer-prompt.md`.
  2. Find the end of the `## Your Job` section — the line reading exactly:
     ```markdown
     Concurrent implementers worked on other files in this wave. Review **only** the files listed above; other changes in the working tree are not yours to judge.
     ```
     This line is immediately followed by a blank line and then `### Part 1 — Spec Compliance (blocking)`.
  3. Insert the following new paragraph directly after that line (and its blank line), and before `### Part 1 — Spec Compliance (blocking)`:
     ```markdown
     **Prefer LSP for symbol searches** when checking usages, definitions, or cross-file consistency — use `workspaceSymbol` to find where a class or function is defined, and `findReferences` to check whether a symbol the diff touches is used elsewhere in ways that might break. Use `Grep`/`Bash` for string-literal or non-code-text searches, where LSP does not apply.
     ```
  4. Do not touch `## What Was Requested`, `## What the Implementer Reported`, `### Part 1`, `### Part 2`, `## Report`, or any other file.
- **Interfaces / Pseudocode:** N/A — prose/markdown edit only.
- **Evidence:** `.claude/skills/implement/reviewer-prompt.md:17-23` (current `## Your Job` section, shown above) and `.claude/agents/codebase-pattern-finder.md:44-53` (style/operations mirrored, shown above in Verified Current State).
- **Done When:** `## Your Job` in `reviewer-prompt.md` gains the new paragraph above, placed after the existing wave-scope sentence and before `### Part 1 — Spec Compliance (blocking)`; no other section is altered; no other file is touched.
- **Verify:** `grep -q "workspaceSymbol" .claude/skills/implement/reviewer-prompt.md && grep -q "findReferences" .claude/skills/implement/reviewer-prompt.md && grep -q "Prefer LSP for symbol searches" .claude/skills/implement/reviewer-prompt.md && echo PASS` → `PASS`
- **Context:** `/implement` dispatches this file verbatim to every reviewer subagent, once per review-path task, per wave. Reviewing cross-file consistency (naming, duplication, usages) is exactly the "symbol searches" job `codebase-pattern-finder.md`'s LSP-vs-Grep guidance is written for, and the reviewer inherits none of that steering today.

## Verification Tasks (If Assumptions Exist)
None — both tasks are fully evidenced against the current file contents (Phase 2 verification confirmed both files read exactly as the fact report reported), and neither requires an assumption to plan against.

## Acceptance Criteria
- `implementer-prompt.md` contains explicit instructions to prefer LSP operations (`goToDefinition`, `callHierarchy`, `hover`) over `Read`/`Grep` when navigating or understanding code, in a style consistent with `codebase-analyzer.md`'s existing guidance. *(Change brief Acceptance Criterion 1.)*
- `reviewer-prompt.md` contains explicit instructions to prefer LSP operations (`workspaceSymbol`, `findReferences`) over `Read`/`Grep` when reviewing changed code, in a style consistent with `codebase-pattern-finder.md`'s existing guidance. *(Change brief Acceptance Criterion 2.)*
- Neither `.claude/skills/implement/SKILL.md` nor `.claude/agents/codebase-locator.md` has been modified — check with `git diff --name-only` after both tasks land; only `implementer-prompt.md` and `reviewer-prompt.md` should appear. *(Change brief Acceptance Criterion 3.)*

## Implementor Checklist
### Wave 1
- [ ] PLAN-001: Expand `implementer-prompt.md` step 2 with LSP-preference sub-bullets mirroring `codebase-analyzer.md`
- [ ] PLAN-002: Insert LSP-preference paragraph into `reviewer-prompt.md`'s `## Your Job` mirroring `codebase-pattern-finder.md`
