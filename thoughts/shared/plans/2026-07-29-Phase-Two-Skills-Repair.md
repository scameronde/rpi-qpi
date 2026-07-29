# Phase-Two Skills Repair Implementation Plan

## Inputs

- Fact report used: `thoughts/shared/facts/2026-07-29-Phase-Two-Skills-Defects.md` (findings F-01 … F-25)
- Epic / feature brief: **none** — the user named the five target documents directly, so there is no upstream work order. Recorded per the rule this plan adds to `/planner` in PLAN-002.
- User request summary: repair the 23 defects the fact report records across `/fact-finder`, `/planner`, `/implement` and the two `/implement` prompt templates.

## Verified Current State

Every fact below was confirmed by `Read` of the file named. Findings not restated here are carried by the fact report, which cites each one to `path:line-line` with an excerpt.

- **Fact:** The `## Inherited Constraints` chain reaches `/fact-finder`'s intake table but its report template declares no constraint section, so the chain has no output at its terminus.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:576-580`, `:662-695`
- **Excerpt:**
  ```markdown
   | Epic | **Inherited Constraints** | what to treat as fixed rather than investigate |
  ```

- **Fact:** `/planner` ingests the fact report by three named headings and reads no epic; `epics/` does not appear in the file.
- **Evidence:** `.claude/skills/planner/SKILL.md:19-21`
- **Excerpt:**
  ```markdown
     - Extract, by the report's actual section headings: (a) `## Critical Findings (Verified, Planner Attention Required)`, (b) `## Coverage Map`, (c) `## Open Questions / Unverified Claims`.
  ```

- **Fact:** `git status --porcelain` reports an untracked directory as one trailing-slash path, which no `File(s)` entry can match. Verified empirically this session in a throwaway repository.
- **Evidence:** `.claude/skills/implement/SKILL.md:140-144`
- **Excerpt:**
  ```bash
  git status --porcelain | cut -c4- | sort | comm -13 "$TMPDIR/wave-baseline.txt" -
  ```
- **Command output:**
  ```
  --- porcelain (default) ---   ?? newdir/
  --- porcelain -uall ---       ?? newdir/other.md   ?? newdir/sub/file.md
  ```

- **Fact:** The two-report QA naming convention already exists, documented in `clean-code`, using a lens suffix. `/fact-finder` states "exactly one report", and `qa/AGENTS.md` declares the unsuffixed pattern.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:740-746`
- **Excerpt:**
  ```bash
  → Produces: thoughts/shared/qa/2026-02-05-Auth-Module-Python.md
  → Produces: thoughts/shared/qa/2026-02-05-Auth-Module-Design.md
  ```

- **Fact:** `codebase-analyzer` declares exactly three output scopes; `surface`, which `/fact-finder` documents, is not among them.
- **Evidence:** `.claude/agents/codebase-analyzer.md:44-54`
- **Excerpt:**
  ```markdown
  1. **`execution_only`**: Return only Section 1 (Execution Flow)
  2. **`focused`**: Return Sections 1 and 3 (Execution Flow + Dependencies)
  3. **`comprehensive`**: Return all 4 sections (default)
  ```

- **Fact:** `plans/AGENTS.md` reproduces the plan section list, the task field list and the STATE format; `facts/AGENTS.md` and `qa/AGENTS.md` reproduce their report structures and filename patterns. Each is a file-format contract that the DOX protocol requires updating alongside the skill.
- **Evidence:** `thoughts/shared/plans/AGENTS.md` (Local Contracts), `thoughts/shared/facts/AGENTS.md:27-38`, `thoughts/shared/qa/AGENTS.md` (Local Contracts)
- **Excerpt (`facts/AGENTS.md:27-34`):**
  ```markdown
  **Required sections (in order):**
  1. `## Executive Summary` — 3–7 factual bullets
  2. `## Coverage Map` — what was actually inspected
  3. `## Critical Findings` — planner-attention items with evidence
  ```

## Goals / Non-Goals

**Goals**

- Terminate the inherited-constraints chain in an artifact a downstream reader is directed to read: `/fact-finder`'s report, then the plan (F-01, F-03, F-02).
- Give the epic's three planner- and implementor-addressed sections a reader (F-02, F-04).
- Remove the divergences between what `/fact-finder` documents about its subagents and what those agents declare (F-12, F-13, F-14).
- Resolve the four internal contradictions (F-09, F-10, F-11, F-18) and the two structural errors (F-16, F-17).
- Make `/implement`'s Boundary Check operate on the paths it is meant to compare, in every environment, at every point a wave's tree changes (F-05, F-06, F-07), and give its branch prohibition an evaluation point (F-08).
- Delete the dead pre-Skills scaffolding (F-15, F-19) and settle the four small template inconsistencies (F-20, F-21, F-22, F-23).

**Non-Goals**

- **The chain stops at the plan document.** Neither prompt template gains a constraints block. The planner respects constraints when designing tasks, and each task already carries `Context:`. Extending the chain into `implementer-prompt.md` / `reviewer-prompt.md` would change the four-reader field contract and is not attempted here.
- **No new task field.** F-20 is resolved by amending the `Evidence:` field's description to require the excerpt, not by adding an `Excerpt:` field. Adding a field would mean editing `planner/SKILL.md`, `implement/SKILL.md`, both prompt templates, `plans/AGENTS.md` and `CLAUDE.md`; the requirement is already stated in the Evidence standards and only the template omits it.
- **The four QA skills keep their unsuffixed report line.** `python-qa:70`, `typescript-qa:68`, `clean-code:449` and `logic-bugs-qa:211` each say `Write to thoughts/shared/qa/YYYY-MM-DD-[Target].md`, which contradicts `clean-code:740-746`'s own suffixed example. This plan fixes the phase-two side (`/fact-finder`, `/planner`, `qa/AGENTS.md`) and adopts the suffix convention. **The four QA skills remain inconsistent with it and are left for a follow-up** — they are quality skills, not phase-two workflow skills, and four more files would double this plan's surface.
- **No change to `CLAUDE.md`, `README.md`, root `AGENTS.md`, or `.claude/hooks/session-start`.** No pipeline stage, ordering or task field name changes, so the five-copy pipeline rule is not triggered.
- **No change to the worker agents.** Where `/fact-finder` and an agent disagree (F-12, F-13, F-14), the agent is correct and the skill is corrected to match it.
- **`/prototype`, `/epic-planner`, `/specifier`, `/feature-architect`, `/mission-architect` untouched.** Their side of every seam in this plan already works; F-24 confirms the epic → fact-finder citation resolves correctly.
- No `AGENTS.md` work under `.claude/**` — that subtree is outside DOX.

## Design Overview

- **One section name carries the constraint to its last reader.** `## Inherited Constraints (Treated as Fixed)` is added to `/fact-finder`'s report template as section 3, and to `/planner`'s ingestion contract as heading (d). The plan template gains `## Inherited Constraints (Respected)`. The name is fixed by this plan in every place it appears, so two concurrent implementers copy the literal string from here rather than from each other.
- **The `inferred` marking becomes an instruction, not a label.** `/fact-finder` gains the rule that a row whose upstream `Source` reads `inferred — <what from>` is the one row class it may re-open, and that the outcome is recorded in the new section's `Status` column. That gives `/feature-architect:191`'s stated purpose a reader.
- **The epic reaches `/planner` through Phase 1, not through an optional aside.** Phase 1 gains a step that globs `epics/` and `features/` and reads the four downstream-addressed sections; `## Inputs` gains an `Epic / feature brief:` line that takes `none`, so an absent artifact is recorded rather than inferred.
- **`/implement` gains one terminal step.** "After the Final Wave" evaluates the plan's `## Acceptance Criteria`, runs `## Baseline Verification` when the plan is a QA plan, and reports. This is where F-04's three unread sections acquire their reader.
- **The Boundary Check is corrected in three places and re-armed at one.** `-uall` and `${TMPDIR:-/tmp}` are substituted at all three command sites; the check is additionally re-run after review-path fix rounds, before the commit.
- **Mechanical corrections are separated from composed content, by wave.** Each of the three skill files receives one wave-1 task and one wave-2 task. The wave-2 fact-finder and implement tasks are dictated text with content-asserting greps, so they qualify for the fast path and cost no reviewer.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002, PLAN-003, PLAN-004 | `fact-finder/SKILL.md`, `facts/AGENTS.md`, `planner/SKILL.md`, `plans/AGENTS.md`, `implement/SKILL.md`, `implementer-prompt.md` | Four disjoint file sets. PLAN-001 and PLAN-002 must agree on two literal strings — the `## Inherited Constraints (Treated as Fixed)` heading and the `upstream-artifact:` field name — both fixed by this plan, so each implementer copies from here and neither reads the other's output. |

**PLAN-001 and PLAN-002 are semantically paired: commit both or neither.** PLAN-002 writes an instruction telling `/planner` to read a frontmatter field that PLAN-001 adds to `/fact-finder`. Neither implementer needs the other's file, so they are safe to run concurrently, but `/planner` referencing a field `/fact-finder` does not emit is a half-landed change. The wave rule already prevents it — a wave with an unresolved task is not committed — so no wave split is needed; this note exists so the orchestrator does not resolve a failure in one by committing the other alone.
| 2 | PLAN-005, PLAN-006, PLAN-007 | `fact-finder/SKILL.md`, `qa/AGENTS.md`, `planner/SKILL.md`, `plans/AGENTS.md`, `implement/SKILL.md` | Each task re-enters a file a wave-1 task owns, so none may share wave 1. Disjoint from each other. |

Tasks in the same wave run concurrently. No path appears twice within a wave — verified below.

**Wave self-check.**
Wave 1 paths: `.claude/skills/fact-finder/SKILL.md`, `thoughts/shared/facts/AGENTS.md`, `.claude/skills/planner/SKILL.md`, `thoughts/shared/plans/AGENTS.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/implement/implementer-prompt.md` — six paths, no repeat.
Wave 2 paths: `.claude/skills/fact-finder/SKILL.md`, `thoughts/shared/qa/AGENTS.md`, `.claude/skills/planner/SKILL.md`, `thoughts/shared/plans/AGENTS.md`, `.claude/skills/implement/SKILL.md` — five paths, no repeat. `plans/AGENTS.md` appears in wave 1 (PLAN-002) and wave 2 (PLAN-006); that is two different waves, which the rule permits.

## Approval Gate

**Approval is required before `/implement` runs.** These files define the behaviour of the orchestrator that would execute this plan, and `implement/SKILL.md`'s own Red Flags forbid editing a skill file mid-plan unless a task says to — which every task here does. The user reviews the plan first.

**Resolved with the user on 2026-07-29, before any task was dispatched:**

1. **F-21 — delete `## Quick Verification`, do not keep it with a precedence rule.** Nothing reads it (`/implement` step 5 touches STATE only for the checklist and the three status lines), it duplicates the authoritative plan inside the file rewritten on every commit, and it competes for the ~40-line budget with the checklist that the resume path does read. Reflected in PLAN-006 item 6 and item 8.
2. **The four QA skills stay out of scope**, left inconsistent with the lens-suffix convention this plan adopts. See Non-Goals; a follow-up plan should reconcile `python-qa:70`, `typescript-qa:68`, `clean-code:449` and `logic-bugs-qa:211` with `clean-code:740-746`.
3. **F-02's deferral is reversed** — `Inherited-Constraints-Chain.md:87` scoped the `Acceptance Criteria for Planner` reader gap out on the grounds that it was a planner-side concern and that plan's subject was the constraint chain. That reason does not transfer: planner-side gaps are this plan's subject. The other two epic sections were never raised anywhere.
   - **Design change made while answering this.** PLAN-002 originally had `/planner` glob `epics/` to find the epic behind a fact report. That is not recoverable from the filename — `epic-planner:226` states the fact report is named after the research topic, not the epic — so the glob would silently attach the wrong epic. Corrected: PLAN-001 adds an `upstream-artifact:` frontmatter field to the fact report (`/fact-finder` knows which artifact it read), and PLAN-002 reads that field, with a user-confirmed glob only as the fallback for reports written before the field existed.

## Implementation Instructions (For Implementor)

### PLAN-001

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/fact-finder/SKILL.md`
  - `thoughts/shared/facts/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In `.claude/skills/fact-finder/SKILL.md`, in the `## Output Format (STRICT)` report template (currently lines 650-695), insert a new section **between `## Coverage Map` and `## Critical Findings (Verified, Planner Attention Required)`**. Its heading must read exactly `## Inherited Constraints (Treated as Fixed)`. Body: one sentence stating that these are the rows carried in from the epic's or feature brief's `## Inherited Constraints`, which were treated as settled rather than investigated, and that the section is required — write `None` when the upstream artifact had none or when there was no upstream artifact. Then a four-column table with the header row `| Constraint | Source | What it forbids or forces | Status |`, and one placeholder row whose `Source` cell states that it is copied verbatim from the upstream row and whose `Status` cell reads `fixed — not investigated`.
  2. In the same file, in the Phase 1 step-2 table (currently lines 573-580), leave all six existing rows unchanged and add a sentence directly beneath the table: a row whose `Source` reads `inferred — <what from>` is the one class of constraint you may re-open, because `/feature-architect` marks it precisely so the researcher verifies it instead of trusting it; when you verify one, record the outcome in the report's `## Inherited Constraints (Treated as Fixed)` table as `inferred — verified` or `inferred — not verified`, and leave every other row `fixed — not investigated`.
  3. In the same file, in the `## Verification Log` block of the report template, replace the two existing bullets with three: `Verified (personally read):` listing paths the fact-finder opened itself; `Accepted from sub-agent excerpts (not personally re-read):` listing paths whose evidence came from a sub-agent; and `Spot-checked excerpts captured:` yes/no. Keep the existing wording of the third bullet.
  4. In the same file, add an `upstream-artifact:` field to the report's **document frontmatter** — in both the `### Document Frontmatter (In Research Report Files)` block and the `## Output Format (STRICT)` template, which carry the same YAML and must stay identical. It holds the path of the epic or feature brief read in Phase 1, or `none` when the user named the target directly and no work order was globbed. State that this is the field `/planner` reads to find the epic, so a guess or an omission strands it.
  5. In `thoughts/shared/facts/AGENTS.md`, in **Required sections (in order)**, insert `## Inherited Constraints (Treated as Fixed)` as item 3 and renumber the four items that follow, so the list runs Executive Summary, Coverage Map, Inherited Constraints (Treated as Fixed), Critical Findings, Detailed Technical Analysis, Verification Log, Open Questions, References. Add `upstream-artifact:` to the **Required frontmatter** block. Add one line under **Work Guidance** stating that the section is required and takes `None`, and that `upstream-artifact:` takes `none`.
- **Interfaces / Pseudocode:** the `Status` column takes exactly one of three literals: `fixed — not investigated`, `inferred — verified`, `inferred — not verified`. The frontmatter field is `upstream-artifact:` and takes a path or the literal `none`.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:662-695` (the template this section joins), `:576-580` (the intake rows the new sentence attaches to), `:619-628` (the frontmatter block gaining the field), `:651-658` (its duplicate in the Output Format template), `:680-682` (the Verification Log bullets being replaced), `thoughts/shared/facts/AGENTS.md:15-38` (the frontmatter and numbered list being extended)
- **Excerpt (`fact-finder/SKILL.md:680-682`):**
  ```markdown
  ## Verification Log
  - `Verified:` list each file you personally read (paths only).
  - `Spot-checked excerpts captured:` yes/no
  ```
- **Done When:** the fact report template carries `## Inherited Constraints (Treated as Fixed)` positioned after `## Coverage Map` and before `## Critical Findings`, with a four-column table including a `Status` column; the Phase 1 table is followed by the `inferred` re-opening rule; both copies of the report frontmatter carry `upstream-artifact:`; the Verification Log distinguishes personally-read from sub-agent-sourced paths; and `facts/AGENTS.md` lists the new section as required item 3 of eight and `upstream-artifact:` as required frontmatter.
- **Verify:** `grep -q '^## Inherited Constraints (Treated as Fixed)' .claude/skills/fact-finder/SKILL.md && grep -q 'inferred — verified' .claude/skills/fact-finder/SKILL.md && grep -q 'Accepted from sub-agent excerpts' .claude/skills/fact-finder/SKILL.md && test "$(grep -c '^upstream-artifact:' .claude/skills/fact-finder/SKILL.md)" = 2 && grep -q 'Inherited Constraints (Treated as Fixed)' thoughts/shared/facts/AGENTS.md && grep -q 'upstream-artifact:' thoughts/shared/facts/AGENTS.md` → exit 0
- **Context:** F-01 and F-03. Three plans dated 2026-07-29 routed host-system constraints from the mission through the spec to the epic, and `/fact-finder` was given an intake row for them. Nothing was added to what `/fact-finder` writes, so the constraint reaches the researcher and stops. `/feature-architect:191` separately states that an `inferred` row exists so "the researcher can then verify that one instead of trusting it" — a sentence with no counterpart anywhere in `/fact-finder`. This task gives both the output section and the `inferred` rule their first reader. The `upstream-artifact:` field is what makes PLAN-002 possible: `/fact-finder` knows exactly which epic it read, whereas `/planner` cannot recover it from the report's filename — `epic-planner:226` warns that the fact report is named after the research topic, not the epic.

### PLAN-002

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** opus
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/planner/SKILL.md`
  - `thoughts/shared/plans/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In `.claude/skills/planner/SKILL.md`, extend Non-Negotiable 1 (currently lines 19-21) with a fourth extracted heading: `(d) ## Inherited Constraints (Treated as Fixed)`. State that rows carrying `fixed — not investigated` or `inferred — verified` are settled and the plan must not contain a task that contradicts one, and that a row reading `inferred — not verified` is an open question, not a constraint — route it to `## Verification Tasks`.
  2. In the same file, add a step to Phase 1 (currently lines 375-381), after the fact-report read: **take the epic or feature brief from the fact report's `upstream-artifact:` frontmatter field** (PLAN-001 adds it) and read it. Do **not** glob `epics/` to find it — a fact report is named after its research topic, not after the epic (`epic-planner:226`), so the association cannot be recovered from the filename and a guess silently attaches the wrong epic. When the field reads `none`, there is no work order and that is the answer; when the field is absent, the report predates it, and only then may you glob `thoughts/shared/epics/` and `thoughts/shared/features/` and confirm the candidate with the user before relying on it. From the artifact, read four sections and state what each supplies — `## Acceptance Criteria for Planner` (the criteria the plan's own `## Acceptance Criteria` must cover), `## Implementation Considerations (For Planner)` (suggested phases and known constraints, advisory not prescriptive), `## Dependencies` (which epics must already exist), and `## Verification Plan (For Implementor)` (verification the plan must carry into task `Verify:` fields or its final acceptance criteria).
  3. In the same file, add `- Epic / feature brief: \`thoughts/shared/epics/...\` or \`none\` (from the fact report's \`upstream-artifact:\`)` to the `## Inputs` block of the standard plan template (currently lines 531-533).
  4. In the same file, add a `## Inherited Constraints (Respected)` section to the standard plan template, positioned between `## Verified Current State` and `## Goals / Non-Goals`. It carries the rows from the fact report's section of the same subject, with a sentence stating that the plan contains no task contradicting them, and takes `None`.
  5. In the same file, amend the standard template's `## Acceptance Criteria` line (currently lines 580-581) so it states that where an epic was read, its `## Acceptance Criteria for Planner` entries are covered here, and that `/implement` evaluates this section after the final wave.
  6. In `thoughts/shared/plans/AGENTS.md`, update the **Plan document structure** block so it lists `## Inherited Constraints (Respected)` after `## Verified Current State`, and annotate `## Inputs` to mention the epic / feature brief line. Change nothing else in that file — the task field list and STATE format are PLAN-006's.
- **Interfaces / Pseudocode:** the plan section is `## Inherited Constraints (Respected)`; the fact-report section it draws from is `## Inherited Constraints (Treated as Fixed)`. Both literals are fixed by this plan; do not paraphrase either.
- **Evidence:** `.claude/skills/planner/SKILL.md:19-21` (the three-heading ingestion contract), `:375-381` (Phase 1), `:531-533` (`## Inputs`), `:580-581` (`## Acceptance Criteria`), `thoughts/shared/plans/AGENTS.md` (Plan document structure block)
- **Excerpt (`planner/SKILL.md:375-379`):**
  ```markdown
  ### Phase 1: Context & Ingestion (MANDATORY)
  1. Read the user request.
  2. Use `Glob` + `Read` to find and read the latest relevant Fact-Finder report(s).
  3. Create:
     - **Verified Facts & Constraints** (only items with Evidence)
  ```
- **Excerpt (`planner/SKILL.md:580-581`):**
  ```markdown
  ## Acceptance Criteria
  - Bullet list of externally observable results.
  ```
- **Done When:** Non-Negotiable 1 names four headings including the constraints section and states the three `Status` dispositions; Phase 1 takes the epic from the fact report's `upstream-artifact:` field, forbids globbing as the primary route, and names all four epic sections; the standard plan template carries an `Epic / feature brief:` input line and an `## Inherited Constraints (Respected)` section between Verified Current State and Goals / Non-Goals; `## Acceptance Criteria` references the epic's criteria and the post-wave evaluation; and `plans/AGENTS.md`'s structure block lists the new section.
- **Verify:** `grep -q 'Inherited Constraints (Treated as Fixed)' .claude/skills/planner/SKILL.md && grep -q '^## Inherited Constraints (Respected)' .claude/skills/planner/SKILL.md && grep -q 'upstream-artifact:' .claude/skills/planner/SKILL.md && grep -q 'Acceptance Criteria for Planner' .claude/skills/planner/SKILL.md && grep -q 'Implementation Considerations (For Planner)' .claude/skills/planner/SKILL.md && grep -q 'Epic / feature brief' .claude/skills/planner/SKILL.md && grep -q 'Inherited Constraints (Respected)' thoughts/shared/plans/AGENTS.md` → exit 0
- **Context:** F-02 and the plan-side terminus of F-01. `/epic-planner` writes four sections whose names address `/planner` and `/implement`; the one addressed to `/fact-finder` is read, and these three are not. `epic-planner:253` even states the expected output is a plan, while `planner/SKILL.md` contains no occurrence of `epics/`. One third of this gap — `Acceptance Criteria for Planner` — was a recorded deferral at `Inherited-Constraints-Chain.md:87`; the user has now selected closing it. The remaining two sections appear in no plan in that set. This task is also where the constraint chain acquires its final reader, since the plan is the artifact an implementer acts on.

### PLAN-003

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/implement/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Replace every occurrence of `git status --porcelain` that feeds the Boundary Check with `git status --porcelain -uall`. There are three: Pre-Flight step 4 (line 55), the Boundary Check command (line 141), and the step-5 baseline refresh (line 221). Do **not** change the `git status --short` at line 48 — that one shows a dead run's leftovers to the user and is not compared against a declared set.
  2. Replace every occurrence of `"$TMPDIR/wave-baseline.txt"` with `"${TMPDIR:-/tmp}/wave-baseline.txt"`. There are three, at the same three sites.
  3. In Pre-Flight step 4, add one sentence to the existing prose explaining the `-uall`: without it git reports a newly created directory as a single trailing-slash path, which matches no `File(s)` entry and turns every create-in-a-new-directory task into a false finding.
- **Interfaces / Pseudocode:** the corrected command is `git status --porcelain -uall | cut -c4- | sort`; `cut -c4-` is unchanged, since `-uall` does not alter the two status columns plus space.
- **Evidence:** `.claude/skills/implement/SKILL.md:55-57`, `:141`, `:220-222`
- **Excerpt (`:141`):**
  ```bash
  git status --porcelain | cut -c4- | sort | comm -13 "$TMPDIR/wave-baseline.txt" -
  ```
- **Done When:** all three Boundary Check sites use `--porcelain -uall` and `"${TMPDIR:-/tmp}/wave-baseline.txt"`; no bare `"$TMPDIR/wave-baseline.txt"` remains; `git status --short` at line 48 is untouched; and step 4 states why `-uall` is required.
- **Verify:** `test "$(grep -c -- 'porcelain -uall' .claude/skills/implement/SKILL.md)" = 3 && test "$(grep -c '\${TMPDIR:-/tmp}/wave-baseline.txt' .claude/skills/implement/SKILL.md)" = 3 && ! grep -q '"\$TMPDIR/wave-baseline.txt"' .claude/skills/implement/SKILL.md && grep -q 'git status --short' .claude/skills/implement/SKILL.md` → exit 0
- **Context:** F-05 and F-06. The Boundary Check is the only step that can catch an undeclared path — `implement/SKILL.md:254` says so itself, because implementers see only their own file list and reviewers are told to ignore everything else. Two defects disable it: it compares directory names against file paths for any `create` task in a new directory, and its baseline path has no fallback, so where `TMPDIR` is unset the write fails and `comm` errors on a missing operand, yielding no findings at all. The prescribed response to an unmatched path includes `git checkout --`, so the false-positive case points a destructive command at legitimate new work.

### PLAN-004

- **Action ID:** PLAN-004
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/implement/implementer-prompt.md`
- **allowedAdjacentEdits:** none
- **Instruction:** In Responsibility 5 (**Tests**, currently lines 27-30), add a third bullet stating the precedence when the two rules collide: if the change alters behaviour in executable code and **no** test file appears in the task's `File(s)` or `allowedAdjacentEdits`, report `NEEDS_CONTEXT` naming the test file you would have created — do not create it, and do not skip the test silently. Reference the Constraints section by name so the two passages point at each other. Leave the first two bullets unchanged.
- **Interfaces / Pseudocode:** none.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:27-30` (the test rule), `:37-38` (the constraint it collides with)
- **Excerpt (`:37-38`):**
  ```markdown
  - Only modify files in the task's **File(s)** field (or **allowedAdjacentEdits** if listed)
  - If you need to touch an unlisted file: report `NEEDS_CONTEXT`, do **not** touch it silently
  ```
- **Done When:** Responsibility 5 carries a third bullet naming `NEEDS_CONTEXT` as the action when a behaviour change has no test file in scope, and cross-referencing the Constraints section.
- **Verify:** `grep -A6 '5\. \*\*Tests\*\*' .claude/skills/implement/implementer-prompt.md | grep -q 'NEEDS_CONTEXT'` → exit 0
- **Context:** F-23. Two instructions in the same prompt select different actions for the same situation and neither refers to the other: Responsibility 5 directs the implementer to write a test for a behaviour change, while Constraints forbid touching a file outside `File(s)` and direct a `NEEDS_CONTEXT` report instead. `/planner`'s Phase 2b tells planners to list test files, so this collision only arises when the plan omitted one — exactly the case where a silent choice by a `haiku` implementer is least visible.

### PLAN-005

- **Action ID:** PLAN-005
- **Wave:** 2
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/fact-finder/SKILL.md`
  - `thoughts/shared/qa/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. **F-12** — in the `codebase-analyzer` Output Scope list (line 257), replace the `surface` entry with `execution_only`, described as returning only the execution-flow section. The agent declares exactly `execution_only`, `focused`, `comprehensive`; `surface` is not a value it accepts.
  2. **F-13** — in the `thoughts-locator` scope guidance, change `~70% reduction vs comprehensive` (line 370) to `~28% savings` and `~40% reduction vs comprehensive` (line 375) to `~15% savings`, matching `thoughts-locator.md:22,26`.
  3. **F-14** — in the same guidance (line 379), replace `All 8 categories (missions, specs, epics, plans, QA reports, research, STATE files, related docs)` with the agent's actual set: all 9 categories — missions, specs, feature briefs, epics, plans, QA reports, fact reports, prototype learnings, project notes. Then delete the `### STATE Files` heading and its bullet from the worked response example (lines 358-359); `thoughts-locator.md`'s output template has no such heading.
  4. **F-09** — at line 278 and line 533, keep the token-saving point but stop it contradicting Phase 2: state that the sub-agent's excerpt may be reused verbatim in the report rather than re-derived, **and** that the fact-finder still opens the file to confirm the cited lines exist, recording it under the Verification Log's `Verified (personally read):` bullet — or, where it does not, under `Accepted from sub-agent excerpts`. (PLAN-001 creates those two bullets.)
  5. **F-11** — at line 65, carve QA mode out of the `Bash` restriction: locating files still requires the stated permission, and running the automated tools QA Mode Phase 2 names — linters, type checkers, test runners from the loaded skill — is expected use, not an exception to be asked about.
  6. **F-10** — at line 94, keep the two-report statement and add the naming rule that makes it possible: each report takes a lens suffix, `thoughts/shared/qa/YYYY-MM-DD-[Target]-[Lens].md`, following the convention already documented at `clean-code/SKILL.md:740-746` (`-Python`, `-Design`). At lines 642-646, replace `Write exactly one report to:` with a statement that one report is written **per loaded QA skill**, at the suffixed path, and that two loaded skills produce two files which must not collide.
  7. **F-15** — delete the dead delegation block: the `Fact-Finders work in two communication contexts` list and the `**Key Distinction**` paragraph distinguishing a message envelope from document frontmatter (lines 608-634). Keep the `### Document Frontmatter (In Research Report Files)` heading and its YAML block, and keep the closing sentence pointing at the Output Format section. Nothing invokes `/fact-finder` as a subagent, and the envelope is never specified.
  8. In `thoughts/shared/qa/AGENTS.md`, change **File naming** to `YYYY-MM-DD-<Target>-<Lens>.md`, with `<Lens>` naming the QA skill that produced it, and state that a full audit produces one file per loaded skill. Add one line to **Work Guidance** noting that two skills loaded for one target write two reports, which is why the lens suffix is required.
- **Interfaces / Pseudocode:** the QA path literal is `thoughts/shared/qa/YYYY-MM-DD-[Target]-[Lens].md`.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:65`, `:94`, `:255-257`, `:278`, `:358-359`, `:367-380`, `:533`, `:608-634`, `:642-646`; `.claude/agents/codebase-analyzer.md:44-54`; `.claude/agents/thoughts-locator.md:21-31`, `:96-123`; `.claude/skills/clean-code/SKILL.md:740-746`
- **Excerpt (`fact-finder/SKILL.md:255-257`):**
  ```markdown
     - `comprehensive`: Full analysis with all dependencies, call chains, and technical details (typical for Fact-Finder)
     - `focused`: Component-level analysis with immediate dependencies only
     - `surface`: Quick overview of structure and exports
  ```
- **Excerpt (`fact-finder/SKILL.md:642-644`):**
  ```markdown
  ### QA Mode:

  Write exactly one report to: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
  ```
- **Done When:** `surface` no longer appears; the two `thoughts-locator` percentages read 28% and 15%; the category line names 9 categories including feature briefs and prototype learnings; no `### STATE Files` heading remains; lines 278 and 533 require the file to be opened while permitting excerpt reuse; the `Bash` rule admits QA tool execution; QA mode states one report per loaded skill at the lens-suffixed path; the two-communication-contexts block is gone; and `qa/AGENTS.md` documents the suffixed filename.
- **Verify:** `! grep -q 'surface' .claude/skills/fact-finder/SKILL.md && grep -q '28% savings' .claude/skills/fact-finder/SKILL.md && grep -q '15% savings' .claude/skills/fact-finder/SKILL.md && ! grep -q '### STATE Files' .claude/skills/fact-finder/SKILL.md && ! grep -q 'two communication contexts' .claude/skills/fact-finder/SKILL.md && ! grep -q 'Write exactly one report to' .claude/skills/fact-finder/SKILL.md && grep -q 'Target\]-\[Lens\]' .claude/skills/fact-finder/SKILL.md && grep -q 'Lens' thoughts/shared/qa/AGENTS.md` → exit 0
- **Context:** F-09 through F-15 — every remaining defect confined to this file, plus the QA DOX contract that F-10 depends on. Three are divergences from the agents' own declarations: a scope value `codebase-analyzer` does not accept, savings figures belonging to a different agent, and a category list matching neither of `thoughts-locator`'s two enumerations. Two are internal contradictions: a mandatory `Read` step waived for the two agents supplying most findings, and a `Bash` restriction covering the tools QA mode must run. One is a contradiction with a convention `clean-code` already documents. One is scaffolding for an invocation path that no file performs.

### PLAN-006

- **Action ID:** PLAN-006
- **Wave:** 2
- **Model:** opus
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/planner/SKILL.md`
  - `thoughts/shared/plans/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. **F-17** — move the two orphaned Non-Negotiables. Items `3. No Code Output` and `4. No Tooling Assumptions` (lines 49-54) currently sit below the `## Evidence & Citation Standards (STRICT)` heading. Relocate both so all four numbered items are contiguous under `## Non-Negotiables (Enforced)`, with the Evidence & Citation Standards heading and its three subsections following them intact.
  2. **F-16** — repair the mislabelled section. The block at lines 63-155 is titled "Delegating to web-search-researcher for API Validation" but its body is a `codebase-locator` contract (`The locator returns…`, `message_id: locator-…`, `## Coordinates:`, `files_found`, and the two subsections "Parsing the Response for Implementation Planning" and "Using Locator Output in Your Plan"). Retitle the section to `## Delegating to codebase-locator` and keep that body — it is correct for the locator, and `/planner` has no other locator contract.
  3. **F-16 (continued)** — then add a genuine `## Delegating to web-search-researcher for API Validation` section. Keep the existing delegation example (the Stripe prompt at lines 69-74), and give it the response contract the agent actually declares, from `web-search-researcher.md:148-158`: frontmatter fields `message_id`, `correlation_id`, `timestamp`, `message_type: RESEARCH_RESPONSE`, `query_type` (one of `library_api`, `best_practices`, `error_resolution`, `version_compatibility`), `researcher_version`, `sources_found`, `search_tools_used`, `confidence` (`HIGH | MEDIUM | LOW | NONE`); a `<thinking>` block; and an `<answer>` block carrying Quick Answer, per-source metadata, Confidence Score, Version Compatibility and Warnings. State how it maps onto the plan's Web Research Evidence format — URL + Date + Type + Authority, which the Evidence standards at lines 37-42 require and which no response contract in this file currently supplies.
  4. **F-18** — add `## Approval Gate` to **both** output templates, positioned after `## Goals / Non-Goals` in the standard template and after `## Design Overview` in the QA template. Then make Phase 3 decidable: replace "If user approval is required" with a stated criterion — approval is required when the plan changes a contract with more than one reader, edits files that define the executing orchestrator's own behaviour, reverses a recorded deferral, or leaves a finding deliberately unaddressed; otherwise the section records that none applied and the plan proceeds. Delete the vacuous "Otherwise, proceed to generate implementor-ready tasks" branch, since the preceding bullet already writes the full artifact.
  5. **F-20** — amend the `Evidence:` field description in **both** templates to require the 1-6 line excerpt inline: `**Evidence:** \`path:line-line\` plus a 1-6 line excerpt (why this file / why this approach)`. Do not add an `Excerpt:` field — the QA template's existing `Excerpt:` line stays as it is.
  6. **F-21** — delete the `## Quick Verification` section from the STATE template, leaving `## Task Checklist` followed by `## Notes`. Add one sentence to the STATE template's surrounding prose stating that the plan is the only place `Verify:` commands live, so STATE cannot drift from it. Nothing reads the STATE copy — `/implement`'s step 5 opens STATE only to check checklist lines and advance `Completed Tasks`, `Current Task` and `Current Wave` — and the duplicate competes for the same ~40-line budget as the checklist, which the resume path does read.
  7. **F-22** — replace the two value-menu template lines with placeholders in both templates: `- **Model:** [haiku | opus]` and `- **Verify:** [\`command\` → expected result, or \`none — requires review\`]`. Keep the surrounding prose that explains when each value applies. `/implement` matches `Model:` against two literals and tests `Verify:` against the literal `none — requires review`, so a menu line copied unaltered satisfies neither.
  8. In `thoughts/shared/plans/AGENTS.md`, apply items 4, 5, 6 and 7 to its reproduced copies: add `## Approval Gate` to the plan structure block, amend the `Evidence:` line, replace the `Model:` and `Verify:` menu lines with the same placeholders, and delete `## Quick Verification` from the reproduced STATE format block. Do not touch the `## Inherited Constraints (Respected)` line — PLAN-002 added it.
- **Interfaces / Pseudocode:** placeholders are exactly `[haiku | opus]` and `[\`command\` → expected result, or \`none — requires review\`]`. The section heading is exactly `## Approval Gate`.
- **Evidence:** `.claude/skills/planner/SKILL.md:17-26`, `:37-42`, `:49-54`, `:63-155`, `:488-492`, `:561`, `:569`, `:679`, `:686`, `:767-768`, `:777`; `.claude/agents/web-search-researcher.md:148-158`; `thoughts/shared/plans/AGENTS.md` (Local Contracts)
- **Excerpt (`planner/SKILL.md:76-86` — the mislabelled body):**
  ```markdown
  ### Expected Response Format

  The locator returns YAML frontmatter + thinking + answer with all 4 sections:
  ...
  message_id: locator-2026-01-18-001
  ```
- **Excerpt (`planner/SKILL.md:488-492`):**
  ```markdown
  ### Phase 3: Decision Gates (NO DEADLOCK)
  - Always write the full plan artifact.
  - Include an **Approval Gate** section:
    - If user approval is required, stop after writing and present only the plan summary + explicit questions.
    - Otherwise, proceed to generate implementor-ready tasks.
  ```
- **Done When:** all four Non-Negotiables are contiguous; the locator contract sits under a `codebase-locator` heading; a `web-search-researcher` section exists carrying `RESEARCH_RESPONSE` and the nine envelope fields; `## Approval Gate` appears in both templates and Phase 3 states when it applies; the `Evidence:` line requires an excerpt in both templates; `## Quick Verification` is gone from the STATE template and from `plans/AGENTS.md`; the `Model:` and `Verify:` template lines are bracketed placeholders; and `plans/AGENTS.md` carries the matching changes.
- **Verify:** `test "$(grep -c '^## Approval Gate' .claude/skills/planner/SKILL.md)" = 2 && grep -q '## Delegating to codebase-locator' .claude/skills/planner/SKILL.md && grep -q 'RESEARCH_RESPONSE' .claude/skills/planner/SKILL.md && ! grep -q 'haiku (default) | opus' .claude/skills/planner/SKILL.md && ! grep -rq 'Quick Verification' .claude/skills/planner/SKILL.md thoughts/shared/plans/AGENTS.md && grep -q '\[haiku | opus\]' thoughts/shared/plans/AGENTS.md && grep -q '## Approval Gate' thoughts/shared/plans/AGENTS.md` → exit 0
- **Context:** F-16 through F-22 — every remaining defect in this file plus the DOX copies that duplicate them. Two are outright errors a reader cannot work around: two enforced rules filed under the wrong heading, and a whole section whose title names one subagent while its body documents another, leaving `/planner` with no response contract for the subagent its own Evidence standards require URL-form evidence from. One is a required section absent from both templates it is required in, behind a branch condition the file never states.

### PLAN-007

- **Action ID:** PLAN-007
- **Wave:** 2
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/implement/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. **F-08** — give the branch prohibition an evaluation point. Insert a new **first** Pre-Flight step, renumbering the existing eight to 2-9: run `git rev-parse --abbrev-ref HEAD`; if it is `main` or `master`, stop and ask the user for explicit consent before continuing, offering to branch. Every later cross-reference to a Pre-Flight step number inside this file must be renumbered to match — the Boundary Check's reference to "the Pre-Flight baseline" (step 4 → 5), the reviewer/implementer prompt read (step 5 → 6), and the resume-cleanup reference (step 3 → 4). Leave the Red Flags bullet at line 259 in place; it now has a trigger point.
  2. **F-07** — re-arm the Boundary Check after fix rounds. In the Review Gate (step 4), after the sentence directing re-dispatch for SPEC ISSUES / Critical / Important, add: once every re-dispatched task passes, re-run the Boundary Check from step 3 before committing, because a fix round can touch a path the first check never saw. In step 5, add the commit precondition: do not commit until the most recent Boundary Check ran **after** the last implementer dispatch of the wave.
  3. **F-04** — add a new section `## After the Final Wave`, placed after the Per-Wave Loop and before `## Model Selection`. It directs the orchestrator, once the last wave has committed, to: read the plan's `## Acceptance Criteria` and confirm each item holds, naming the evidence for each; run the plan's `## Baseline Verification` command block when the plan is a QA plan, reporting the output; carry out the epic's `## Verification Plan (For Implementor)` when the plan's `## Inputs` cites an epic; and report any criterion that does not hold rather than closing the run. State that STATE is set to `Complete` only after this section passes, and add one Red Flags bullet: never report a plan complete without evaluating its `## Acceptance Criteria` — per-task `Verify:` commands check tasks, not the plan.
- **Interfaces / Pseudocode:** the new section heading is exactly `## After the Final Wave`. The branch command is `git rev-parse --abbrev-ref HEAD`.
- **Evidence:** `.claude/skills/implement/SKILL.md:28-69` (Pre-Flight, the eight steps being renumbered), `:136-138` (step 3, the check being re-armed), `:185` (the re-dispatch sentence), `:189-226` (step 5), `:228` (`## Model Selection`, the insertion boundary), `:259` (the Red Flag gaining a trigger)
- **Excerpt (`:185`):**
  ```markdown
  **SPEC ISSUES**, **Critical**, or **Important** must be fixed before the wave commits. Re-dispatch the implementer for that task with the listed issues, then re-run the reviewer for that task only. Repeat until it passes.
  ```
- **Excerpt (`:259`):**
  ```markdown
  - **Never** start on main/master without explicit user consent
  ```
- **Done When:** Pre-Flight's first step checks the branch with `git rev-parse --abbrev-ref HEAD` and the following steps are numbered 2-9 with every in-file step cross-reference updated; the Review Gate directs a Boundary Check re-run after fix rounds and step 5 carries the matching commit precondition; and `## After the Final Wave` exists between the Per-Wave Loop and `## Model Selection`, covering acceptance criteria, QA baseline verification, the epic's verification plan, and the `Complete` gating, with a corresponding Red Flags bullet.
- **Verify:** none — requires review. The three edits are prose inserted into a protocol whose correctness is positional: the branch check must precede every dispatch, the re-armed check must fall between the last fix dispatch and the commit, and the renumbering must leave no stale cross-reference. A grep can confirm the strings exist but not that they sit in the right place, and this file governs the orchestrator's own behaviour.
- **Context:** F-04, F-07 and F-08. Each is a rule that exists without a point of execution. The `main`/`master` prohibition is stated in Red Flags and evaluated at no step, the same shape as the defect `0e0639a` repaired for `/mission-architect`. The Boundary Check runs at step 3 and the review gate's fix rounds happen at step 4, so a path introduced by a fix is committed without ever being compared against the declared set. And no step evaluates the plan's own `## Acceptance Criteria`: `Acceptance` appears nowhere in `.claude/skills/implement/`, so a run currently ends when the last wave commits, not when the plan's stated outcomes hold.

## Verification Tasks (If Assumptions Exist)

- **Assumption:** `TMPDIR` may be unset in some environments `/implement` runs in. PLAN-003 adds a fallback rather than relying on the answer, so the fix is correct either way.
  - **Verification Step:** not required for this plan. `${TMPDIR:-/tmp}` is correct whether or not `TMPDIR` is set.
  - **Pass Condition:** n/a — the assumption was removed by design rather than tested.

- **Assumption:** no consumer reads the fact report's `fact-finder:`, `topic:` or `coverage:` frontmatter fields, so PLAN-001 leaves the frontmatter alone.
  - **Verification Step:** `grep -rn "coverage:\|^topic:\|fact-finder:" .claude/skills/ .claude/agents/` and confirm no reader parses them.
  - **Pass Condition:** no skill or agent extracts those fields. If one does, PLAN-001 is unaffected — it adds a body section, not a frontmatter field.

## Acceptance Criteria

Where an epic was read, its `## Acceptance Criteria for Planner` entries are covered here. No epic governs this plan (`## Inputs`), so these derive from the fact report's findings. `/implement` evaluates this section after the final wave.

- A constraint recorded in a spec's or feature brief's `## Inherited Constraints` can be traced through the epic, the fact report and the plan without leaving a named section at any hop.
- A row marked `inferred — <what from>` upstream is a row `/fact-finder` is directed to verify, and the outcome is visible in its report.
- `/planner` reads the epic when one exists, and records `none` when one does not; the epic's acceptance criteria appear in the plan's own. It locates the epic from the fact report's `upstream-artifact:` field rather than by guessing from a filename.
- A `Verify:` command exists in exactly one place — the plan — with no second copy that can drift from it.
- `/implement` reports on the plan's `## Acceptance Criteria` before declaring a run complete.
- Every subagent parameter and figure `/fact-finder` documents matches the agent that implements it — no value the agent would reject, no percentage from a different agent, no category the agent does not emit.
- `/fact-finder` states one rule for `Read` verification, one rule for `Bash`, and one QA report count, each without a contradicting statement elsewhere in the file.
- `/planner`'s four Non-Negotiables sit under their own heading; each delegation section documents the subagent it names; `## Approval Gate` exists in both templates with a stated criterion.
- `/implement`'s Boundary Check compares file paths against file paths, survives an unset `TMPDIR`, and runs after the last implementer dispatch of every wave.
- `/implement` checks the branch before dispatching anything.
- `grep -rn "two communication contexts" .claude/skills/` returns nothing.
- Each of `facts/AGENTS.md`, `plans/AGENTS.md` and `qa/AGENTS.md` describes the format its directory actually holds after this plan.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: fact-finder report gains the inherited-constraints section and the inferred rule (F-01, F-03)
- [ ] PLAN-002: planner ingests the epic and the constraint section; plan template carries both (F-02)
- [ ] PLAN-003: Boundary Check uses `-uall` and a `TMPDIR` fallback (F-05, F-06)
- [ ] PLAN-004: implementer-prompt states test-vs-scope precedence (F-23)

### Wave 2
- [ ] PLAN-005: fact-finder corrections — agent contracts, Read mandate, Bash, QA naming, dead block (F-09…F-15)
- [ ] PLAN-006: planner corrections — non-negotiables, delegation sections, Approval Gate, templates (F-16…F-22)
- [ ] PLAN-007: implement gains a branch check, a re-armed Boundary Check, and a final acceptance gate (F-04, F-07, F-08)

## References

- Source fact report: `thoughts/shared/facts/2026-07-29-Phase-Two-Skills-Defects.md`
- Prior deferral reversed by PLAN-002: `thoughts/shared/plans/2026-07-29-Inherited-Constraints-Chain.md:87`
- Naming convention adopted by PLAN-005: `.claude/skills/clean-code/SKILL.md:740-746`
- Agent contracts treated as authoritative: `.claude/agents/codebase-analyzer.md:44-54`, `.claude/agents/thoughts-locator.md:21-31`, `:96-123`, `.claude/agents/web-search-researcher.md:148-158`
