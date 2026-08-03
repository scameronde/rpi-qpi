---
date: 2026-08-03
fact-finder: claude-fact-finder
topic: "Structure of implementer-prompt.md and reviewer-prompt.md, and the LSP-guidance style to mirror"
status: complete
upstream-artifact: thoughts/shared/changes/2026-08-03-Implement-LSP-Preference.md
coverage:
  - .claude/skills/implement/implementer-prompt.md (full file)
  - .claude/skills/implement/reviewer-prompt.md (full file)
  - .claude/skills/implement/SKILL.md (full file)
  - .claude/agents/codebase-analyzer.md (LSP-guidance section, lines 61-80)
  - .claude/agents/codebase-pattern-finder.md (LSP-guidance section, lines 42-77)
  - thoughts/shared/facts/2026-08-03-LSP-Usage-Across-Skills-And-Agents.md (reused for agent/skill-level LSP-access findings; not re-verified here)
---

# Research: Structure of implementer-prompt.md and reviewer-prompt.md, and the LSP-guidance style to mirror

## Executive Summary
- Neither `implementer-prompt.md` nor `reviewer-prompt.md` mentions `LSP`, `Read`, or `Grep` as a navigation strategy anywhere in their current text beyond bare tool names in passing — this reconfirms the prior exploratory report's finding for these two specific files.
- `implementer-prompt.md`'s `## Your Responsibilities` section is a 6-step numbered list; step 2 (`Read each file in the task's **File(s)** field to understand current state.`) is the step whose job — building understanding of existing code before changing it — is the same job `codebase-analyzer.md`'s LSP guidance is written for.
- `reviewer-prompt.md`'s `## Your Job` section opens with `Read them with git diff -- [changed files] and by reading the files directly`, and `Part 2 — Code Quality` asks the reviewer to judge naming consistency, duplication, and maintainability against the rest of the codebase — the same "find symbols/usages beyond the file in hand" job `codebase-pattern-finder.md`'s LSP guidance is written for.
- Both target style models exist verbatim in the repo and use consistent operation names: `codebase-analyzer.md:76-80` gives a 4-line "Follow Dependencies" pattern (prefer `goToDefinition`, `callHierarchy`, `hover`; fall back to `Read`); `codebase-pattern-finder.md:46-53` gives a "LSP vs Grep Decision Guide" pattern (`workspaceSymbol`, `findReferences` for symbols; `Grep`/`Bash` for string literals and non-code text).
- `implement/SKILL.md` (Non-Goal, confirmed unmodified in this research) establishes that these two files are filled with placeholders and dispatched verbatim per task/reviewer (`implement/SKILL.md:104-111`, `:178-183`) — there is no other template or intermediate layer where LSP guidance could be injected instead.

## Coverage Map
- Read `.claude/skills/implement/implementer-prompt.md` in full (79 lines).
- Read `.claude/skills/implement/reviewer-prompt.md` in full (77 lines).
- Read `.claude/skills/implement/SKILL.md` in full (285 lines), to confirm how the two prompt templates are consumed and that no other file mediates LSP exposure for `/implement`'s subagents.
- Read `.claude/agents/codebase-analyzer.md` and `.claude/agents/codebase-pattern-finder.md` in full, to extract the exact LSP-preference phrasing and operation names the change brief's Target State asks to mirror.
- Reused (not re-read in this session) `thoughts/shared/facts/2026-08-03-LSP-Usage-Across-Skills-And-Agents.md` for the already-established finding that neither prompt file mentions `LSP` — that report ran `grep -rn "LSP"` across all three files in `.claude/skills/implement/` with zero matches (its Coverage Map, line 29).

## Inherited Constraints (Treated as Fixed)
None — the upstream change brief carries no `## Inherited Constraints` section (change briefs never do).

## Critical Findings (Verified, Planner Attention Required)

- **Observation:** `implementer-prompt.md`'s `## Your Responsibilities` is a flat 6-step numbered list (steps 1–6), with no subsection structure and no existing tool-preference guidance of any kind — every step is a bare instruction sentence or short paragraph.
- **Direct consequence:** Adding LSP-preference guidance means either inserting new numbered content between existing steps (renumbering everything after it) or expanding an existing step's paragraph — there is no existing "Workflow & Tools" or "Search Strategy" subsection here to append to, unlike the two agent files.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:19-32`
- **Excerpt:**
  ```markdown
  1. **Check local governance**: For each path in the task's **File(s)** field, walk from the repository root to that file's directory and read any `AGENTS.md` files found along the route. The nearest `AGENTS.md` is your local contract; parents supply broader rules.
  2. Read each file in the task's **File(s)** field to understand current state.
  3. Implement exactly what the task specifies.
  ```

- **Observation:** Step 2 of `implementer-prompt.md` (`Read each file in the task's File(s) field to understand current state`) is the only step whose purpose — understanding existing code, including how it connects to code outside the assigned files, before modifying it — matches the purpose `codebase-analyzer.md` writes its LSP guidance for.
- **Direct consequence:** This step is the structurally closest existing anchor for inserting or attaching LSP-preference instructions in `implementer-prompt.md`; no other step (governance check, implement, verify, test, self-review) is about code comprehension.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:22`
- **Excerpt:**
  ```markdown
  2. Read each file in the task's **File(s)** field to understand current state.
  ```

- **Observation:** `reviewer-prompt.md`'s `## Your Job` section opens with an explicit statement that the reviewer reads changes via `git diff` and by reading files directly, immediately before the two-part review structure (`Part 1 — Spec Compliance`, `Part 2 — Code Quality`) begins.
- **Direct consequence:** This is the earliest point in the file where a tool-preference instruction would apply to the reviewer's entire review pass, rather than to one specific check inside Part 1 or Part 2.
- **Evidence:** `.claude/skills/implement/reviewer-prompt.md:17-23`
- **Excerpt:**
  ```markdown
  ## Your Job

  **Do not trust the implementer's report** — read the actual code. Run the task's `Verify:` command yourself rather than believing the reported output.

  If the task's `Verify:` is `none — requires review`, there is no command to run and **you are the only check that exists.** The orchestrator routed this task here precisely because its `Done When` cannot be settled mechanically. Judge that condition directly against the code and say how you judged it.

  Concurrent implementers worked on other files in this wave. Review **only** the files listed above; other changes in the working tree are not yours to judge.
  ```

- **Observation:** `reviewer-prompt.md`'s `Part 2 — Code Quality` contains a `Cleanliness` subsection asking whether names are "inconsistent with surrounding code" and a `Maintainability` subsection asking whether a unit "has grown to do several things" — both questions require looking at usages or symbol context beyond the diffed file, which is exactly the "symbol searches" job `codebase-pattern-finder.md`'s LSP-vs-Grep decision guide addresses.
- **Direct consequence:** `Part 2 — Code Quality` is a second viable, narrower insertion point in `reviewer-prompt.md`, in addition to the broader `## Your Job` anchor.
- **Evidence:** `.claude/skills/implement/reviewer-prompt.md:43-52`
- **Excerpt:**
  ```markdown
  **Cleanliness**
  - Names that are unclear, misleading, or inconsistent with surrounding code
  - Duplicated logic that should be extracted
  - Premature abstractions — over-engineered for what the task asked
  - Dead code or unreachable branches

  **Maintainability**
  - Would a future developer understand this without explanatory comments?
  - Is each unit doing one thing, or has it grown to do several?
  ```

- **Observation:** `codebase-analyzer.md`'s LSP-preference guidance is phrased as four bullet points under a "Follow Dependencies" step: prefer `goToDefinition` for jumping to definitions, use `callHierarchy` (`incomingCalls`/`outgoingCalls`) for execution-flow mapping, use `hover` for type signatures, and fall back to `Read` when LSP fails (unresolved import, dynamic code).
- **Direct consequence:** This is the literal style and operation set the change brief's Target State names for `implementer-prompt.md` (`goToDefinition`, `findReferences`, `hover`, `callHierarchy`, `workspaceSymbol`) — three of the five operations (`goToDefinition`, `hover`, `callHierarchy`) already appear here verbatim with usage guidance; `findReferences` and `workspaceSymbol` do not appear in this file.
- **Evidence:** `.claude/agents/codebase-analyzer.md:75-80`
- **Excerpt:**
  ```markdown
  3. **Follow Dependencies**:
      - **Prefer LSP for navigation**: Use `goToDefinition` to jump directly to function/class definitions instead of manually resolving imports.
      - **Use LSP for execution flow**: Use `callHierarchy` (with `incomingCalls` and `outgoingCalls`) to map function call chains.
      - **Use LSP for type info**: Use `hover` to get type signatures without reading type definition files.
      - **Fallback to Read**: If LSP fails (unresolved import, dynamic code), fall back to `Read` on the import path.
  ```

- **Observation:** `codebase-pattern-finder.md`'s LSP-preference guidance is phrased as a labeled "LSP vs Grep Decision Guide": use `LSP` (`workspaceSymbol` for definitions, `findReferences` for usages) for symbol searches, and `Grep`/`Bash` for string-literal or non-code-text searches.
- **Direct consequence:** This is the literal style and operation set the change brief's Target State names for `reviewer-prompt.md`; both `findReferences` and `workspaceSymbol` — the two operations absent from `codebase-analyzer.md` — appear here verbatim with usage guidance.
- **Evidence:** `.claude/agents/codebase-pattern-finder.md:44-53`
- **Excerpt:**
  ```markdown
  - **LSP**: **PREFER for symbol searches**. Use `workspaceSymbol` to find class/function definitions, `findReferences` to locate all usages of a symbol.
  - **Grep / Bash**: Use for string literal searches, comments, or when LSP doesn't apply (non-code patterns).
  - **Read**: **CRITICAL**. You must read the actual file to extract the snippet. Do not rely on Grep or LSP output alone.
  - **Glob**: To find file types (e.g., `**/*.test.ts` to find testing patterns).

  **LSP vs Grep Decision Guide**:
  - **Use LSP** when searching for: class names, function names, type definitions, symbol usages (e.g., "find all usages of UserRepository")
  - **Use Grep** when searching for: string patterns, comments, non-symbol text, regex patterns (e.g., "find files containing TODO comments")
  ```

- **Observation:** `implement/SKILL.md` fills `implementer-prompt.md`'s placeholders and dispatches it verbatim to a `general-purpose` subagent at the implementer-dispatch step, and fills `reviewer-prompt.md`'s placeholders and dispatches it verbatim to a `general-purpose` subagent at the review-gate step; both dispatch blocks are the only places either file's content reaches a subagent.
- **Direct consequence:** No third file or intermediate prompt layer mediates what an implementer or reviewer subagent is told about LSP — editing the two prompt templates is sufficient and necessary; `implement/SKILL.md` itself carries none of this instruction text and (per the change brief's Non-Goals) is not a candidate to carry it.
- **Evidence:** `.claude/skills/implement/SKILL.md:104-111`, `:178-183`
- **Excerpt:**
  ```markdown
  Agent tool (one call per task in the wave):
    subagent_type: general-purpose
    model: haiku — unless the task's Model: field says opus (see Model Selection)
    description: "Implement [PLAN-XXX]: [task name]"
    prompt: [full implementer-prompt.md with all placeholders replaced]
  ```
  ```markdown
  Agent tool (one call per review-path task):
    subagent_type: general-purpose
    # no model parameter — reviewers always run on the session default
    description: "Review [PLAN-XXX]"
    prompt: [full reviewer-prompt.md with all placeholders replaced]
  ```

## Detailed Technical Analysis (Verified)

### `implementer-prompt.md` — full section structure
| Section | Lines | Content |
|---|---|---|
| Title + framing | 1-5 | States single-task scope, concurrency warning |
| `## Task` | 7-11 | Placeholder for pasted task content |
| `## Files Changed by Earlier Waves` | 13-17 | Placeholder for prior-wave file list |
| `## Your Responsibilities` | 19-32 | 6 numbered steps: governance check, read files, implement, verify, tests, self-review |
| `## Constraints` | 36-42 | 5 bullets on file scope and tool use (`Edit`/`Write`, not Bash) |
| `## Self-Review Checklist` | 44-56 | 8-item checklist |
| `## Report Format` | 58-79 | Status vocabulary (`DONE`/`DONE_WITH_CONCERNS`/`NEEDS_CONTEXT`/`BLOCKED`) plus report fields |

**Evidence:** `.claude/skills/implement/implementer-prompt.md:1-79` (full file, read directly).

### `reviewer-prompt.md` — full section structure
| Section | Lines | Content |
|---|---|---|
| Title + framing | 1-5 | States combined spec+quality scope, `git diff` instruction |
| `## What Was Requested` | 7-11 | Placeholder for pasted task requirements |
| `## What the Implementer Reported` | 13-15 | Placeholder for pasted implementer report |
| `## Your Job` | 17-23 | Do-not-trust-the-report framing, `Verify: none` handling, wave-scope limit |
| `### Part 1 — Spec Compliance (blocking)` | 25-32 | Missing/Extra/Misunderstood/Out-of-bounds/Verify/Done-When checks |
| `### Part 2 — Code Quality` | 34-52 | Correctness, Cleanliness, Maintainability subsections |
| `## Report` | 54-77 | Fixed report template, `APPROVED`/`NEEDS FIXES` criteria |

**Evidence:** `.claude/skills/implement/reviewer-prompt.md:1-77` (full file, read directly).

### Constraints sections already govern tool choice, but not LSP
Both files already constrain *which* tools may be used for **writing** — `implementer-prompt.md`'s `## Constraints` says "Use `Edit` and `Write` tools for file changes — not Bash shell commands" (line 42) — but neither file's existing constraints say anything about **reading/navigating** tool choice, which is the gap the change brief targets.
**Evidence:** `.claude/skills/implement/implementer-prompt.md:36-42`

## Verification Log
- `Verified (personally read):` `.claude/skills/implement/implementer-prompt.md`, `.claude/skills/implement/reviewer-prompt.md`, `.claude/skills/implement/SKILL.md`, `.claude/agents/codebase-analyzer.md`, `.claude/agents/codebase-pattern-finder.md`, `thoughts/shared/changes/2026-08-03-Implement-LSP-Preference.md`
- `Accepted from sub-agent excerpts (not personally re-read):` none — no sub-agents were delegated to for this research; the scope (7 known files, all directly readable) did not require exploratory delegation.
- `Spot-checked excerpts captured:` yes

## Open Questions / Unverified Claims
None. Every claim above was confirmed by directly reading the cited file and line range.

## References

**Codebase Citations**:
- `.claude/skills/implement/implementer-prompt.md:1-79`
- `.claude/skills/implement/reviewer-prompt.md:1-77`
- `.claude/skills/implement/SKILL.md:104-111,178-183`
- `.claude/agents/codebase-analyzer.md:75-80`
- `.claude/agents/codebase-pattern-finder.md:44-53`
- `thoughts/shared/changes/2026-08-03-Implement-LSP-Preference.md`

**Reused (not re-verified this session)**:
- `thoughts/shared/facts/2026-08-03-LSP-Usage-Across-Skills-And-Agents.md` (Coverage Map line 29: zero `LSP` matches across all three `.claude/skills/implement/` files)
