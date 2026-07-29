# QA-Repair-Residue Implementation Plan

## Inputs
- Fact report(s) used: `thoughts/shared/facts/2026-07-29-QA-Repair-Residue.md`
- Epic / feature brief: `none` (from the fact report's `upstream-artifact: none`)
- User request summary: close the two residue items left open after `2026-07-29-QA-Skills-Contract-Repair` — the P-tier vocabulary surviving in `code-smells-catalog.md` (R-01) and the QA plan template's five pre-repair sites in `planner/SKILL.md` (R-02).

## Verified Current State

### R-01 — the catalog still classifies P1–P4

- **Fact:** `code-smells-catalog.md:886-900` is a Summary table with a `Priority` column holding P-tier values across 13 rows, while `clean-code/SKILL.md:349,363,379,395` now head the tiers `Critical`/`High`/`Medium`/`Low`.
- **Evidence:** `.claude/skills/clean-code/references/code-smells-catalog.md:886-891`
- **Excerpt:**
  ```markdown
  | Smell | Detection | Priority | Refactoring |
  |-------|-----------|----------|-------------|
  | Long Method | > 50 lines, CCN > 15 | P1 if > 100 lines | Extract Method |
  | Large Class | > 300 lines, > 10 methods | P2 | Extract Class |
  | Long Parameter List | > 3 params | P2 | Introduce Parameter Object |
  | Primitive Obsession | Strings for status, floats for money | P2 | Replace Data Value with Object |
  ```

- **Fact:** the skill sends the auditor to that catalog at the moment of classifying, so the two vocabularies meet in one workflow step.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:242`
- **Excerpt:**
  ```markdown
    - **Check**: See [references/code-smells-catalog.md](references/code-smells-catalog.md) for full catalog
  ```

- **Fact:** nothing parses the catalog. Its only readers are three markdown links in `clean-code/SKILL.md`, at `:220`, `:242` and `:792`. The divergence is between two prose statements, not between a producer and a parser.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:220`
- **Excerpt:**
  ```markdown
  Evaluate change resistance and code smells. See [references/maintainability-principles.md](references/maintainability-principles.md) and [references/code-smells-catalog.md](references/code-smells-catalog.md) for detailed guidance.
  ```

### R-02 — the QA plan template describes the pre-repair state in five places

- **Fact:** `planner/SKILL.md:717` and `:854` give the QA report path unsuffixed, while `qa/AGENTS.md:13` makes the lens suffix the directory's naming contract and `fact-finder:94,636` both give the suffixed form.
- **Evidence:** `.claude/skills/planner/SKILL.md:716-721`
- **Excerpt:**
  ```markdown
  ## Inputs
  - QA report: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
  - Audit date: YYYY-MM-DD
  - Language: [Detected from QA skill]
  - QA Skill: [language]-qa (loaded via skill tool)
  - Automated tools: [list from QA report]
  ```

- **Fact:** `:720` and `:855` label the source `[language]-qa` and `:719` carries `Language: [Detected from QA skill]`, but two of the four loadable QA skills are language-agnostic.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:89-90`
- **Excerpt:**
  ```markdown
  | `clean-code` | Design, code smells, refactoring opportunities — language-agnostic |
  | `logic-bugs-qa` | Correctness, edge cases, concurrency, algorithmic faults |
  ```

- **Fact:** a full audit produces two reports that `/planner` reads together, while the template's `## Inputs` has a single `QA report:` line.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:94`
- **Excerpt:**
  ```markdown
  Each loaded skill writes its own report. Two skills means two reports in `thoughts/shared/qa/`, which `/planner` then reads together.
  ```

- **Fact:** `/implement` reads the plan's `## Inputs` block, but only to determine whether it cites an epic. No reader was found for the `Language:` field.
- **Evidence:** `.claude/skills/implement/SKILL.md:238`
- **Excerpt:**
  ```markdown
  3. **If the plan's `## Inputs` cites an epic,** carry out the epic's `## Verification Plan (For Implementor)` section and report the result.
  ```

## Inherited Constraints (Respected)

None. The fact report's `## Inherited Constraints (Treated as Fixed)` section reads `None`.

## Goals / Non-Goals

**Goals**
- Bring `code-smells-catalog.md`'s Priority column onto the vocabulary `clean-code/SKILL.md` now uses, so the auditor it sends there reads one classification scheme (R-01).
- Make the QA plan template's `## Inputs` and `## References` blocks describe the reports that now exist: lens-suffixed paths, and a source label that fits a language-agnostic skill (R-02).

**Non-Goals**
- **The stale citation at `fact-finder:94` is not fixed here.** It cites `clean-code/SKILL.md:740-746` for the lens-suffix convention; the section heading is still at 740 but the two suffixed examples moved to 748 and 754. Recorded in the fact report's `## Detailed Technical Analysis`, deliberately left — see `## Approval Gate`.
- **The fact report's Open Question 1 is not resolved.** Whether any of the six P-tier-free reference files carries a P-tier reference in words rather than digits is unverified; this plan changes only the file where the digit-bearing form was found.
- No change to the catalog's 13 smell entries themselves — detection thresholds, refactorings and prose stay as they are. Only the Priority column's vocabulary changes.
- No change to `qa/AGENTS.md`, the four QA skills, `/implement`, or the SessionStart hook.
- Q-18 stays open, as decided during the previous plan.

## Approval Gate

**Two of the four Phase 3 triggers apply.**

**1. Changes a contract with more than one reader.** PLAN-002 edits `planner/SKILL.md`'s QA plan template. The `## Inputs` block it touches is read by `/implement:238`, which inspects it for an epic citation. This plan does not alter that line, but the block is shared surface.
> **Question:** confirm proceeding. Also confirm the design decision in PLAN-002 instruction 1: the template's single `QA report:` line becomes a list accepting one entry per loaded skill, because `fact-finder:94` makes two reports the normal case for a full audit. The fact report records (Open Question 3) that no file states whether one line or several was intended, so this is a choice, not a recovered fact.

**2. Edits files that define the executing orchestrator's own behaviour.** Same as the previous plan: `/implement` reads `planner/SKILL.md` in Pre-Flight step 4's create-STATE branch only, and this plan ships a STATE file, so that branch is dead for this run.
> **Question:** confirm proceeding on that basis.

**4. Leaves a finding deliberately unaddressed** — two of them, both named in Non-Goals: the `fact-finder:94` citation range, and Open Question 1 on prose-form P-tier references.
> **Question:** confirm both stay open. The citation is a two-word range edit if you would rather fold it in; it was excluded because it touches a fifth file for a cosmetic gain.

**Trigger 3 considered and not applicable.** This plan reverses no recorded deferral. The previous plan's Non-Goals deferred these two items to a follow-up; this is that follow-up.

## Design Overview

- **Two tasks, one wave.** The two files are disjoint and neither task consumes the other's output, so both run concurrently.
- **R-01 is a vocabulary substitution inside one table.** `P1 → Critical`, `P2 → High`, `P3 → Medium`, `P4 → Low`, preserving the two conditional cells' structure (`P1 if > 100 lines` → `Critical if > 100 lines`).
- **R-02 replaces two fields with one.** `Language:` has no reader and no value for two of four skills; `QA Skill: [language]-qa` cannot be filled for those same two. One `QA skill / lens:` line carries what both were reaching for, and the lens token is already the closed set `qa/AGENTS.md` now names.
- **After this plan** the classification vocabulary is single-valued across `clean-code/SKILL.md` and every file it links, and a QA plan's `## Inputs` names files that the naming contract permits to exist.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002 | `.claude/skills/clean-code/references/code-smells-catalog.md`, `.claude/skills/planner/SKILL.md` | Two disjoint files, no dependency either way. Two concurrent implementers. |

**Wave self-check.** Wave 1 paths: `code-smells-catalog.md`, `planner/SKILL.md` — two paths, no repeat, both `allowedAdjacentEdits: none`.

## Implementation Instructions (For Implementor)

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `.claude/skills/clean-code/references/code-smells-catalog.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In the `## Summary` table at lines 886-900, replace every P-tier value in the `Priority` column with the word `clean-code/SKILL.md` now uses: `P1` → `Critical`, `P2` → `High`, `P3` → `Medium`, `P4` → `Low`.
  2. Preserve the two conditional cells' structure: `P1 if > 100 lines` becomes `Critical if > 100 lines`, and `P1 if > 10%` becomes `Critical if > 10%`.
  3. Change nothing else in the table — the `Smell`, `Detection` and `Refactoring` columns and all 13 rows stay exactly as they are.
  4. Do not touch the rest of the file. The per-smell sections above the Summary table and the `## Further Reading` block are out of scope.
- **Interfaces / Pseudocode:** the four replacement words are `Critical`, `High`, `Medium`, `Low`, matching `clean-code/SKILL.md:349,363,379,395`. Thirteen rows, each with exactly one Priority cell.
- **Evidence:** `.claude/skills/clean-code/references/code-smells-catalog.md:886-891`
- **Excerpt:**
  ```markdown
  | Smell | Detection | Priority | Refactoring |
  |-------|-----------|----------|-------------|
  | Long Method | > 50 lines, CCN > 15 | P1 if > 100 lines | Extract Method |
  | Large Class | > 300 lines, > 10 methods | P2 | Extract Class |
  | Long Parameter List | > 3 params | P2 | Introduce Parameter Object |
  | Primitive Obsession | Strings for status, floats for money | P2 | Replace Data Value with Object |
  ```
- **Done When:** no `P1`, `P2`, `P3` or `P4` token remains anywhere in the file; all 13 Summary rows carry one of `Critical`, `High`, `Medium`, `Low` in the Priority column; the two conditional cells keep their conditions; and the other three columns are unchanged.
- **Verify:** `! grep -qE '\bP[1-4]\b' .claude/skills/clean-code/references/code-smells-catalog.md && grep -q '^| Long Method | > 50 lines, CCN > 15 | Critical if > 100 lines | Extract Method |$' .claude/skills/clean-code/references/code-smells-catalog.md && grep -q '^| Duplicate Code | > 5% duplication | Critical if > 10% | Extract Method |$' .claude/skills/clean-code/references/code-smells-catalog.md && grep -q '^| Middle Man | All methods delegate | Low | Remove Middle Man |$' .claude/skills/clean-code/references/code-smells-catalog.md && grep -q '^| Message Chains | a.b().c().d() | Medium | Hide Delegate |$' .claude/skills/clean-code/references/code-smells-catalog.md && [ "$(grep -c '^| .* | .* | \(Critical\|High\|Medium\|Low\)\( if [^|]*\)\? | .* |$' .claude/skills/clean-code/references/code-smells-catalog.md)" = 13 ]` → exit 0
- **Context:** R-01 of `thoughts/shared/facts/2026-07-29-QA-Repair-Residue.md`. Commit `f5cc1d6` relabelled `clean-code/SKILL.md`'s tiers to Critical/High/Medium/Low but could not reach this file, which no task in that plan declared — the planning sweep's grep pattern assumed the tier *heading* form (`P1 (Critical)`) and so missed bare `P2` and `P1 if > 100 lines`. `clean-code/SKILL.md:242` sends the auditor here while classifying smells, so until this lands the workflow presents two vocabularies for one classification. Nothing parses this file; its only readers are three markdown links, so this is a prose consistency repair rather than a contract fix.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `.claude/skills/planner/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. At line 717, in the QA plan template's `## Inputs` block, change the `QA report:` line to the lens-suffixed form `thoughts/shared/qa/YYYY-MM-DD-[Target]-[Lens].md`, and state that one entry is listed per loaded QA skill — `fact-finder:94` makes two reports the normal case for a full audit, and the current single line cannot represent that.
  2. At line 854, in the same template's `## References` block, apply the same suffixed form to the `Source QA report:` line, with the same one-entry-per-skill note.
  3. Delete the `Language: [Detected from QA skill]` line at 719. Two of the four loadable QA skills are language-agnostic, so the field has no value to take for them, and no reader for it was found.
  4. At lines 720 and 855, replace `QA Skill: [language]-qa` with a label that fits any of the four — name the skill and its lens token, e.g. `QA skill / lens:`. The four valid pairs are `python-qa` / `-Python`, `typescript-qa` / `-TypeScript`, `clean-code` / `-Design`, `logic-bugs-qa` / `-Bugs`, as `thoughts/shared/qa/AGENTS.md` now states.
  5. Do not change the `## Inputs` block's other lines, and do not touch anything outside these two blocks. In particular leave `Audit date:` and `Automated tools:` as they are.
- **Interfaces / Pseudocode:** the suffixed path literal is `thoughts/shared/qa/YYYY-MM-DD-[Target]-[Lens].md`, appearing exactly twice after this change. The four lens tokens are `-Python`, `-TypeScript`, `-Design`, `-Bugs`.
- **Evidence:** `.claude/skills/planner/SKILL.md:853-856`
- **Excerpt:**
  ```markdown
  ## References
  - Source QA report: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
  - QA Skill: [language]-qa
  - Automated tools: [list]
  ```
- **Done When:** neither `[language]-qa` nor `Language: [Detected` appears anywhere in the file; the unsuffixed `thoughts/shared/qa/YYYY-MM-DD-[Target].md` no longer appears; the suffixed form appears exactly twice; and both sites note one entry per loaded skill.
- **Verify:** `! grep -qE '\[language\]-qa|Language: \[Detected' .claude/skills/planner/SKILL.md && ! grep -q 'thoughts/shared/qa/YYYY-MM-DD-\[Target\]\.md' .claude/skills/planner/SKILL.md && [ "$(grep -c 'thoughts/shared/qa/YYYY-MM-DD-\[Target\]-\[Lens\]\.md' .claude/skills/planner/SKILL.md)" = 2 ]` → exit 0
- **Context:** R-02 of `thoughts/shared/facts/2026-07-29-QA-Repair-Residue.md`. Commit `a1cec17` fixed the same narrowing at `:822,828` — the `Section 4` pointer and its "for the target language" qualifier — but Q-10 in the earlier fact report had recorded only those two sites, so these five were never in scope. The unsuffixed paths matter most: `qa/AGENTS.md:13` makes the lens suffix the naming contract, so the template currently instructs the planner to cite a filename that cannot exist. Note the block you are editing is read by `/implement:238`, which inspects `## Inputs` for an epic citation — that line is not yours to change, and leaving it intact is part of the task.

## Verification Tasks (If Assumptions Exist)

None. Every claim in `## Verified Current State` carries a `Read`-verified citation. The one design choice — one report line versus a list — is raised in `## Approval Gate` rather than assumed.

## Acceptance Criteria

Checkable from the finished tree after wave 1:

- [ ] `! grep -rqE '\bP[1-4]\b' .claude/skills/*/references/` — the P-tier vocabulary is gone from every reference file, not just the one changed.
- [ ] `grep -c '^| .* | .* | \(Critical\|High\|Medium\|Low\)\( if [^|]*\)\? | .* |$' .claude/skills/clean-code/references/code-smells-catalog.md` returns `13` — every Summary row carries a tier word.
- [ ] The catalog's `Smell`, `Detection` and `Refactoring` columns are unchanged: `git diff --stat` on that file shows 13 lines changed and no more, and `git diff` shows no edit outside the Priority column.
- [ ] `! grep -qE '\[language\]-qa|Language: \[Detected' .claude/skills/planner/SKILL.md`
- [ ] `grep -c 'thoughts/shared/qa/YYYY-MM-DD-\[Target\]-\[Lens\]\.md' .claude/skills/planner/SKILL.md` returns `2`, and the unsuffixed form returns 0.
- [ ] `/implement`'s epic-citation line still reads as before: `grep -q 'If the plan.s `## Inputs` cites an epic' .claude/skills/implement/SKILL.md` still holds, and `planner/SKILL.md`'s `## Inputs` block still carries `Audit date:` and `Automated tools:`.
- [ ] The four QA skills are untouched by this plan: `git diff --name-only HEAD~1` lists only the two declared paths plus the STATE file.
- [ ] `.claude/hooks/session-start | python3 -m json.tool` still emits valid JSON.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Relabel the code-smells catalog's Priority column to Critical/High/Medium/Low
- [ ] PLAN-002: Bring the QA plan template's Inputs and References onto the current contract
