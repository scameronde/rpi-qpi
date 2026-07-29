---
date: 2026-07-29
fact-finder: claude-opus-5
topic: "QA Repair Residue"
status: complete
upstream-artifact: none
coverage:
  - .claude/skills/clean-code/references/code-smells-catalog.md (Summary table)
  - .claude/skills/clean-code/SKILL.md (severity headings, catalog links)
  - .claude/skills/planner/SKILL.md (QA plan template Inputs and References blocks)
  - .claude/skills/fact-finder/SKILL.md (QA naming convention and its citation)
  - thoughts/shared/qa/AGENTS.md (file naming contract)
  - thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md (the claim this report falsifies)
---

# Research: QA Repair Residue

## Executive Summary

- `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md` states as a verified fact that no `references/` file duplicates the report template, the severity tiers or the verification commands. That statement is false: `code-smells-catalog.md:886-900` carries a Priority column populated with P1–P4 across 13 rows.
- After commit `f5cc1d6`, `clean-code/SKILL.md` classifies findings `Critical`/`High`/`Medium`/`Low` at lines 349, 363, 379 and 395, while the catalog it links three times still classifies them P1–P4.
- `planner/SKILL.md`'s QA plan template carries five sites that describe the pre-repair state: two unsuffixed QA report paths, two `[language]-qa` skill labels, and one `Language:` field.
- `fact-finder:94` cites `clean-code/SKILL.md:740-746` for the lens-suffix convention. The section heading is still at 740; the suffixed examples that citation was pointing at are now at 748 and 754, outside the cited range.

## Coverage Map

Fully read: `thoughts/shared/qa/AGENTS.md`; the `## Summary` table of `code-smells-catalog.md` (lines 880-906).

Read in part: `clean-code/SKILL.md` — severity headings, the three `code-smells-catalog` links, and `## Section 8` lines 740-754; `planner/SKILL.md` — the QA plan template's `## Inputs` block (714-721) and `## References` block (851-858); `fact-finder/SKILL.md` — lines 94 and 636.

Grepped: `.claude/skills/*/references/` for `\bP[1-4]\b`; `planner/SKILL.md` for `thoughts/shared/qa/YYYY-MM-DD` and for language-narrowing strings.

**Partial scope, stated explicitly:** the other six `references/` files were re-swept with the broad pattern `\bP[1-4]\b` and returned one file only. Their prose was not read in full, so a P-tier reference phrased without the digits — "the top priority tier", say — would not have been detected by either sweep.

## Inherited Constraints (Treated as Fixed)

None. No epic or feature brief exists for this work; `upstream-artifact:` is `none`.

## Critical Findings (Verified, Planner Attention Required)

### R-01 — The severity relabel is half-landed, and a prior report's verified fact is false

- **Observation:** `code-smells-catalog.md:886-900` is a Summary table whose third column is `Priority`, populated with `P1 if > 100 lines`, `P2`, `P1`, `P3`, `P4` and similar across 13 smell rows. `clean-code/SKILL.md:349,363,379,395` head the four severity tiers `Critical`, `High`, `Medium`, `Low` after commit `f5cc1d6`. `clean-code/SKILL.md:220`, `:242` and `:792` link the catalog, and `:242` directs the auditor to it while classifying smells.
- **Direct consequence:** the two files state different vocabularies for the same classification, and the skill sends the reader from one to the other at the moment of classifying. Nothing parses the catalog — a repo-wide grep finds no reader of it other than those three markdown links — so the divergence is between two prose statements, not between a producer and a parser.
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
- **Evidence:** `.claude/skills/clean-code/SKILL.md:242`
- **Excerpt:**
  ```markdown
    - **Check**: See [references/code-smells-catalog.md](references/code-smells-catalog.md) for full catalog
  ```
- **Second observation — the prior report's claim is falsified.** `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md` carries, under `## Critical Findings` → "Scope boundaries verified during Phase 2", the statement that none of the seven `references/` files duplicates the report template, the severity tiers or the verification commands, and cites its Open Question 6 as closed on that basis.
- **Direct consequence:** that report's scope-boundary fact does not hold, and the six-file change surface it established was one file short. `facts/AGENTS.md:44` states reports are read-only after creation and that a new report is the route for new findings, so the false statement stands in the earlier report and is corrected here rather than there. A reader consulting only the earlier report will conclude the `references/` tree was clear.
- **Evidence:** `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md` (`## Critical Findings`, scope-boundary subsection)
- **Excerpt:**
  ```markdown
  - **Fact:** none of the seven `references/` files duplicates the report template, the severity tiers or the verification commands. The single marker hit is a Python email example using `message_id` as a domain field. This resolves the fact report's Open Question 6 and holds the surface at six files rather than thirteen.
  ```
- **Third observation — why the sweep missed it.** The Phase 2 sweep behind that claim used the pattern `P1 (\|P2 (\|P3 (\|P4 (` — a digit followed by a space and an open parenthesis, which is the form of the tier *headings* (`### P1 (Critical)`). The catalog's cells read `P2` and `P1 if > 100 lines`, neither of which contains that sequence. A re-sweep with `\bP[1-4]\b` returns 13 lines in one file.
- **Direct consequence:** the detection pattern was derived from the form the tiers took in the file being changed, not from the forms they could take elsewhere. The broad pattern `\bP[1-4]\b` returns the same 13 lines and nothing else across all seven files.

### R-02 — Five sites in the QA plan template describe the pre-repair state

- **Observation:** `planner/SKILL.md:717` and `:854` both give the QA report path as `thoughts/shared/qa/YYYY-MM-DD-[Target].md`. `qa/AGENTS.md:13` states the naming contract as `YYYY-MM-DD-<Target>-<Lens>.md`, and `fact-finder:94` and `:636` both give the suffixed form.
- **Direct consequence:** the plan template instructs the planner to record a path in a form the directory's naming contract no longer permits. A QA plan generated from the template cites a filename that will not exist.
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
- **Second observation:** `:720` and `:855` label the source `QA Skill: [language]-qa`, and `:719` carries `Language: [Detected from QA skill]`. `fact-finder:85-90` lists four loadable QA skills, of which `clean-code` and `logic-bugs-qa` are named there as language-agnostic.
- **Direct consequence:** for a plan built from a `clean-code` or `logic-bugs-qa` report, the `QA Skill:` field has no value of the form `[language]-qa` to take and the `Language:` field has no language to detect. The same narrowing was recorded as part of Q-10 in the earlier report for the `Section 4` pointer at `:822,828`, which commit `a1cec17` addressed; these three sites were not part of that finding and were not changed.
- **Evidence:** `.claude/skills/planner/SKILL.md:853-856`
- **Excerpt:**
  ```markdown
  ## References
  - Source QA report: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
  - QA Skill: [language]-qa
  - Automated tools: [list]
  ```
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:89-90`
- **Excerpt:**
  ```markdown
  | `clean-code` | Design, code smells, refactoring opportunities — language-agnostic |
  | `logic-bugs-qa` | Correctness, edge cases, concurrency, algorithmic faults |
  ```

## Detailed Technical Analysis (Verified)

### The citation in fact-finder that shifted

- **Observation:** `fact-finder:94` cites `.claude/skills/clean-code/SKILL.md:740-746` as the location of the lens-suffix convention. In the current file, line 740 is `## Section 8: Integration with QA Workflow` and lines 741-746 are the subsection heading and the opening lines of a bash block; the two suffixed example paths are at `:748` and `:754`.
- **Direct consequence:** the citation names the correct section and an range that no longer contains the two lines it was citing. `clean-code/SKILL.md` grew from 787 to 795 lines in commit `f5cc1d6`.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:740-746`
- **Excerpt:**
  ```markdown
  ## Section 8: Integration with QA Workflow

  ### Usage Pattern

  ```bash
  # Step 1: Run language-specific QA first
  Fact-Finder: "Analyze Python code quality for src/auth/"
  ```

### The remaining six reference files

- **Observation:** `grep -rcE '\bP[1-4]\b' .claude/skills/*/references/` returns a non-zero count for `code-smells-catalog.md` only. The other six files under `clean-code/references/` and the one under `logic-bugs-qa/references/` return zero.
- **Direct consequence:** by the digit-bearing form, the P-tier vocabulary is confined to one file. A P-tier reference phrased without digits would not be caught by this pattern, and the six files' prose was not read in full.

## Verification Log

- `Verified (personally read):`
  - `.claude/skills/clean-code/references/code-smells-catalog.md:880-906`
  - `.claude/skills/clean-code/SKILL.md` — lines 220, 242, 349, 363, 379, 395, 740-754, 792, via line-numbered `Read` and grep
  - `.claude/skills/planner/SKILL.md:714-722`, `:851-858`
  - `.claude/skills/fact-finder/SKILL.md:89-90`, `:94`, `:636`
  - `thoughts/shared/qa/AGENTS.md` (full)
  - `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md` — the scope-boundary subsection quoted above
  - `git log --oneline` and `git show --stat` for commits `f5cc1d6` and `a1cec17`
- `Accepted from sub-agent excerpts (not personally re-read):` none. No sub-agent was dispatched; R-01 originated as a `DONE_WITH_CONCERNS` observation from the PLAN-004 implementer during commit `f5cc1d6`'s execution and was verified directly before being recorded here.
- `Spot-checked excerpts captured:` yes — every excerpt was taken from a file opened in this session, and all line numbers were confirmed by grep with `-n` or line-numbered `Read`.

## Open Questions / Unverified Claims

1. **Whether any of the six clean P-tier-free reference files carries a P-tier reference in words rather than digits.** Tried: `grep -rcE '\bP[1-4]\b'` across all seven files. Missing: a full read of the six, or a pattern covering phrasings like "the top priority tier". The digit-bearing form is confined to one file; the prose form is unverified.

2. **Whether `Language:` at `planner:719` has any reader.** It appears in the QA plan template's `## Inputs`. Tried: grep for `Language:` across `.claude/`. What was not established is whether `/implement` or any prompt template reads the field, as distinct from no reader having been found by that name.

3. **Whether the QA plan template's `## Inputs` should name one report path or several.** `fact-finder:94` states that a full audit produces two reports which `/planner` reads together, while the template's `## Inputs` has a single `QA report:` line. Whether the intended repair is a suffixed single line or a list is not stated in any file.

## References

**Codebase Citations**:
- `.claude/skills/clean-code/references/code-smells-catalog.md:880-906`, especially `:886-900`
- `.claude/skills/clean-code/SKILL.md:220`, `:242`, `:349`, `:363`, `:379`, `:395`, `:740-746`, `:748`, `:754`, `:792`
- `.claude/skills/planner/SKILL.md:714-722`, `:717`, `:719`, `:720`, `:851-858`, `:854`, `:855`
- `.claude/skills/fact-finder/SKILL.md:85-90`, `:94`, `:636`
- `thoughts/shared/qa/AGENTS.md:13`
- `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md` — `## Critical Findings`, scope-boundary subsection; Open Question 6
- `thoughts/shared/facts/AGENTS.md:44`
- Commits `f5cc1d6` (clean-code convergence), `a1cec17` (planner Section 4 pointer)

**Web Research Citations**: none.
