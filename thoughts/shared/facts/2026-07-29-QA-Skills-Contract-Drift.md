---
date: 2026-07-29
fact-finder: claude-opus-5
topic: "QA Skills Contract Drift"
status: complete
upstream-artifact: none
coverage:
  - .claude/skills/clean-code/SKILL.md
  - .claude/skills/python-qa/SKILL.md
  - .claude/skills/typescript-qa/SKILL.md
  - .claude/skills/logic-bugs-qa/SKILL.md
  - .claude/skills/fact-finder/SKILL.md (QA Mode, output format, report template)
  - .claude/skills/planner/SKILL.md (Phase 1, QA Report Detection, QA plan template)
  - .claude/skills/implement/SKILL.md (After the Final Wave, Review Gate)
  - .claude/skills/claude-code-extensions/SKILL.md (frontmatter invocation control)
  - thoughts/shared/qa/AGENTS.md
  - thoughts/shared/facts/AGENTS.md
  - .claude/agents/codebase-locator.md, .claude/agents/codebase-analyzer.md (scope vocabularies)
  - .claude/hooks/session-start, CLAUDE.md, README.md, AGENTS.md (skill inventory copies)
  - .claude/skills/clean-code/references/, .claude/skills/logic-bugs-qa/references/ (link targets)
---

# Research: QA Skills Contract Drift

## Executive Summary

- The four QA skills carry `disable-model-invocation: true`. `.claude/skills/claude-code-extensions/SKILL.md:67-70` documents that value as "Claude auto-invokes: No" with "Context cost: Zero until you invoke". `/fact-finder:83` instructs the model to load one of the four via the `Skill` tool as the first step of QA Mode.
- Three of the four skills instruct writing a report file whose first line is `<thinking>`; the YAML block containing `message_type: QA_REPORT` sits later, inside `<answer>`. `/planner:499` detects a QA report by "YAML frontmatter contains `message_type: QA_REPORT`", and `thoughts/shared/qa/AGENTS.md:15-23` states four required frontmatter fields.
- No QA report template contains an `upstream-artifact:` field. `/planner:479-482` treats that field's absence as authorization to glob `thoughts/shared/epics/` and `thoughts/shared/features/` and ask the user to confirm a candidate.
- No QA report template carries a per-finding `Verify:` field. `/planner:572` states every task gets one; `/implement:167` gates its fast path on the command asserting content.
- `clean-code` contains no `## Improvement Plan (For Implementor)`, no `## Acceptance Criteria` and no `## Implementor Checklist`. `/planner:832` copies the second of those verbatim into a QA plan, and `/implement:236` evaluates the plan's copy before setting STATE to `Complete`.
- `clean-code` classifies findings as P1–P4; the other three use Critical/High/Medium/Low, which is the vocabulary `/planner:505-509` maps to plan phases.
- All four state the report path as `thoughts/shared/qa/YYYY-MM-DD-[Target].md`. `/fact-finder:94,636` and `qa/AGENTS.md:13` state `YYYY-MM-DD-[Target]-[Lens].md`. `clean-code` states both, at :449 and :736-746.
- `/planner:822,828` directs the reader to "the skill's Section 4". One of the four skills has a section so numbered.

## Coverage Map

Fully read: the four QA skill files (`clean-code` 787 lines, `logic-bugs-qa` 579, `typescript-qa` 325, `python-qa` 297); `implement/SKILL.md` (284) and `implement/reviewer-prompt.md` (77); `thoughts/shared/qa/AGENTS.md` and `thoughts/shared/facts/AGENTS.md`.

Read in part: `fact-finder/SKILL.md` lines 55-194 and its output-format section; `planner/SKILL.md` lines 455-600 and 700-859; `claude-code-extensions/SKILL.md` lines 45-77; `codebase-locator.md` and `codebase-analyzer.md` scope declarations.

Directory listings verified: `.claude/skills/`, `.claude/skills/clean-code/references/` (6 files), `.claude/skills/logic-bugs-qa/references/` (1 file), `.claude/skills/python-qa/` and `.claude/skills/typescript-qa/` (SKILL.md only), `thoughts/shared/epics/`, `features/`, `prototypes/`.

Grepped repo-wide for the four skill names across `*.md`, `session-start`, `*.json`, `*.sh`.

**Partial scope, stated explicitly:** the four `references/` files under `clean-code` and the one under `logic-bugs-qa` were confirmed to exist but their contents were not read. No claim below depends on their contents. `/planner` lines 1-454 and 600-700 were not read; the claims about `/planner` are confined to the four passages cited.

## Inherited Constraints (Treated as Fixed)

None. No epic or feature brief exists for this work: `thoughts/shared/epics/` contains only `2026-07-24-Prototype-Skill.md`, `thoughts/shared/features/` contains only `2026-06-10-DOX-Skills.md` and `2026-07-24-Prototype-Skill.md`, and neither concerns the QA skills. `upstream-artifact:` is therefore `none`.

One prior artifact records a deliberate deferral of this scope, though it is a plan rather than a work order:

- **Observation:** `thoughts/shared/plans/2026-07-29-Phase-Two-Skills-Repair.md:81` places the four QA skills in that plan's Non-Goals, naming the same four line numbers this report re-verifies.
- **Direct consequence:** the unsuffixed report path is a known deferral, not a newly discovered divergence. The other findings below appear in no prior artifact.
- **Evidence:** `thoughts/shared/plans/2026-07-29-Phase-Two-Skills-Repair.md:81`
- **Excerpt:**
  ```markdown
  - **The four QA skills keep their unsuffixed report line.** `python-qa:70`, `typescript-qa:68`, `clean-code:449` and `logic-bugs-qa:211` each say `Write to thoughts/shared/qa/YYYY-MM-DD-[Target].md`, which contradicts `clean-code:740-746`'s own suffixed example. This plan fixes the phase-two side (`/fact-finder`, `/planner`, `qa/AGENTS.md`) and adopts the suffix convention. **The four QA skills remain inconsistent with it and are left for a follow-up**
  ```

## Critical Findings (Verified, Planner Attention Required)

### Q-01 — `disable-model-invocation: true` and the QA Mode load step

- **Observation:** each of the four QA skills carries `disable-model-invocation: true` on line 4. No other skill in `.claude/skills/` carries the field. `/fact-finder:83` directs the model to load one of the four through the `Skill` tool as QA Mode's first action.
- **Direct consequence:** per `claude-code-extensions/SKILL.md:67-70`, that frontmatter value sets "Claude auto-invokes: No" and "Context cost: Zero until you invoke". The four skills' descriptions are therefore not loaded into an ordinary session, and QA Mode's first step has no skill to load. `/fact-finder:83` states what follows from that: "without it those phases have nothing to draw on" — Phases 1-4 at `/fact-finder:96-113` each refer to "the loaded skill" for tool commands, prioritization rules and report template.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:1-5`
- **Excerpt:**
  ```yaml
  ---
  name: python-qa
  description: Python code quality analysis using ruff, pyright, bandit, and interrogate. Use when asked to review Python code quality, run a Python QA pass, or audit a .py file or module.
  disable-model-invocation: true
  allowed-tools: Bash, Read, Grep, Glob, Write, Agent   # no Edit — a reviewer must not fix what it reviews
  ```
- **Evidence:** `.claude/skills/claude-code-extensions/SKILL.md:67-70`
- **Excerpt:**
  ```markdown
  | Frontmatter | You invoke | Claude auto-invokes | Context cost |
  |---|---|---|---|
  | (default) | Yes | Yes | Description always loaded |
  | `disable-model-invocation: true` | Yes | No | Zero until you invoke |
  ```
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:83`
- **Excerpt:**
  ```markdown
  **First, load the matching quality skill** via the `Skill` tool. It supplies the automated tool commands, the prioritization rules and the report template that the phases below refer to as "the loaded skill" — without it those phases have nothing to draw on.
  ```
- **Corroborating observation:** the same four names are the only entries of `.claude/skills/` absent from the available-skills list of the session in which this report was written, while `dox-init`, `dox-update` and the eight workflow skills are present. This is a runtime observation, not a file citation, and is recorded as such.
- **Provenance (resolves Open Question 1):** the flag predates the instruction it contradicts by four months.
  - `c6a7e21` (2026-03-16), "ClaudeCode version of my process", introduced `disable-model-invocation` on all four skills as part of a 120-file port; `git log -S "disable-model-invocation"` over the four paths returns this commit alone.
  - `b58138c` (2026-06-09) first introduced the `QA Mode Detection` section, per `git log -S "QA Mode Detection"`.
  - `0d38e63` (2026-07-28), "Name the quality skills that fact-finder's QA mode depends on", introduced the `Skill`-tool load instruction now at `/fact-finder:83`, per `git log -S "load the matching quality skill"`.
  - `git merge-base --is-ancestor c6a7e21 0d38e63` exits 0.
  - **Direct consequence:** the flag was set when no file instructed loading these skills programmatically, and the loading instruction was added later without the frontmatter being revisited. The order establishes that Q-01 is a divergence between two statements written four months apart, not a constraint QA Mode was designed around.

### Q-02 — The written report file has no frontmatter

- **Observation:** `python-qa:70-73`, `typescript-qa:68-71` and `logic-bugs-qa:211-214` each instruct writing a file to `thoughts/shared/qa/` whose template opens with `<thinking>`. The YAML block containing `message_type: QA_REPORT` appears later in each template, after `</thinking>` and inside `<answer>` — at `python-qa:178-195`, `typescript-qa:185-202`, `logic-bugs-qa:318-334`.
- **Direct consequence:** a file whose first line is `<thinking>` has no YAML frontmatter; the later `---` block is body text at that position. Two contracts read what is not there: `/planner:499` names "YAML frontmatter contains `message_type: QA_REPORT`" as detection method 2, and `qa/AGENTS.md:15-23` states four required frontmatter fields (`date`, `message_type`, `target`, `status`) of which the envelope supplies one. `/planner:498` supplies detection method 1 — the `thoughts/shared/qa/` path prefix — which does not depend on frontmatter.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:70-74`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

  ```markdown
  <thinking>
  ## Phase 1: Target Discovery
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:497-499`
- **Excerpt:**
  ```markdown
  **Detection Methods:**
  1. File path starts with `thoughts/shared/qa/`
  2. YAML frontmatter contains `message_type: QA_REPORT`
  ```
- **Evidence:** `thoughts/shared/qa/AGENTS.md:15-23`
- **Excerpt:**
  ```yaml
  **Required frontmatter:**
  ---
  date: YYYY-MM-DD
  message_type: QA_REPORT
  target: "[module or file name]"
  status: complete
  ---
  ```

### Q-03 — `clean-code` emits two `---` blocks, and the outer one omits the detection key

- **Observation:** `clean-code:451-458` places a YAML block before `<thinking>`, giving the written file real frontmatter with fields `date`, `auditor`, `target`, `language`, `status`. A second YAML block at `clean-code:541-554` sits inside `<answer>` and carries `message_type: QA_REPORT` plus `p1_count`…`p4_count`.
- **Direct consequence:** `clean-code` is the one skill of four whose output has frontmatter, and that frontmatter lacks the key `/planner:499` looks for, while the block that carries the key is not in frontmatter position. The field names in the inner block also differ from the other three skills': `p1_count`/`p2_count`/`p3_count`/`p4_count` where `python-qa:189-192` has `critical_issues`/`high_priority_issues`/`medium_priority_issues`/`low_priority_issues`, and `clean-code` has no `overall_status` counterpart to `python-qa:188`.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:451-460`
- **Excerpt:**
  ```markdown
  ```markdown
  ---
  date: YYYY-MM-DD
  auditor: clean-code
  target: [module/package/file]
  language: [python|typescript|go|rust|java|etc.]
  status: complete
  ---

  <thinking>
  ```
- **Evidence:** `.claude/skills/clean-code/SKILL.md:541-553`
- **Excerpt:**
  ```markdown
  <answer>
  ---
  message_id: clean-code-qa-YYYY-MM-DD-NNN
  message_type: QA_REPORT
  target: [target path]
  auditor: clean-code
  language: [language]
  total_issues: X
  p1_count: X
  ```

### Q-04 — No `upstream-artifact:` field in any QA report template

- **Observation:** the field is defined at `fact-finder:613-621` as part of the fact-report frontmatter and is absent from all four QA templates (`clean-code:451-458`, `python-qa:179-195`, `typescript-qa:186-202`, `logic-bugs-qa:319-334`). `/planner:479-482` reads it in Phase 1, which runs before QA Report Detection at `/planner:493`.
- **Direct consequence:** `/planner:482` states that an **absent** field — as distinct from the value `none` — permits globbing `thoughts/shared/epics/` and `thoughts/shared/features/` and requires naming a candidate to the user for confirmation. A QA audit reaching `/planner` therefore triggers a search for a work order, and the user is asked to confirm an epic, before line 493 establishes that the input is a QA report at all.
- **Evidence:** `.claude/skills/planner/SKILL.md:479-482`
- **Excerpt:**
  ```markdown
  3. **Read the work order the fact report was written for.** Take its path from the fact report's `upstream-artifact:` frontmatter field and `Read` that file — an epic in `thoughts/shared/epics/` or a feature brief in `thoughts/shared/features/`.
     - `upstream-artifact: none` means there is no work order. That is the answer, not a prompt to search: plan from the fact report and the user request alone.
     - Only when the field is **absent** — the report predates it — may you `Glob` `thoughts/shared/epics/` and `thoughts/shared/features/`, and then you must name the candidate to the user and get confirmation before relying on it.
  ```
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:613-621`
- **Excerpt:**
  ```yaml
  ---
  date: YYYY-MM-DD
  fact-finder: [identifier]
  topic: "[Topic]"
  status: complete
  upstream-artifact: [path or none]
  ```

### Q-05 — No per-finding `Verify:` field in any QA report template

- **Observation:** the finding templates carry `Recommendation` and `Done When` and no shell command. `python-qa:261-262` and `typescript-qa:290-291` end at `Done When: [Observable condition]`. `logic-bugs-qa:450-451` supplies `Test Case:` as a prose description plus `Done When: All tests pass + new test case added`. `clean-code:598-600` supplies a `Verification:` block split into Quantitative and Qualitative halves.
- **Direct consequence:** `/planner:572` states "Every task gets a `Verify:` field: a literal shell command plus its expected result", and the QA plan template at `/planner:789` carries that field per task. The commands must therefore originate somewhere other than the QA report, while the tool knowledge that produces them is in the QA skills (`python-qa:17-20`, `typescript-qa:17-20`, `clean-code:274-306`). `/implement:22` states the consequence for execution: "A plan with strong `Verify:` commands is cheap to execute; a plan whose `Done When` conditions are prose is expensive, and you cannot repair that at execution time — you can only report it."
- **Evidence:** `.claude/skills/python-qa/SKILL.md:252-263`
- **Excerpt:**
  ```markdown
  ### QA-001: [Issue Title]
  - **Priority**: Critical/High/Medium/Low
  - **Category**: Security/Types/Readability/Maintainability/Testability
  - **File(s)**: `path/to/file.py:line-line`
  - **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
  - **Done When**: [Observable condition]
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:572-578`
- **Excerpt:**
  ```markdown
  **Every task gets a `Verify:` field: a literal shell command plus its expected result.**

  A `Verify:` command is only worth having if it can **fail**. Apply this test to every one you write:

  > Can I imagine a change that makes this command pass while `Done When` is still false?
  ```
- **Related observation:** `clean-code:308-330` heads a subsection "Qualitative Verifications" whose entries read "Done When: Code review confirms …". `/planner:596` names the literal that expresses that condition in the current vocabulary: "write `Verify: none — requires review` and the orchestrator will route it to a reviewer". The literal does not appear in `clean-code`.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:310-314`
- **Excerpt:**
  ```markdown
  1. **Naming Improved**:
     - Done When: Code review confirms all identifiers are intention-revealing
     - Example: "PLAN-013: Rename variables → Code review confirms names reveal intent"
  ```

### Q-06 — `clean-code` has no Improvement Plan, Acceptance Criteria or Implementor Checklist

- **Observation:** `grep -n "^## Improvement Plan\|^## Acceptance Criteria\|^## Implementor Checklist"` across the four returns six matches — two per skill for `python-qa` (250, 266, 273), `typescript-qa` (279, 295, 302) and `logic-bugs-qa` (436, 455, 462) — and none for `clean-code`. `clean-code` instead carries `## Critical Findings (P1)` at :574 and `## Recommendations for Next Steps` at :703, whose four subsections are Immediate / Short-term / Medium-term / Ignore.
- **Direct consequence:** two contracts read a section a `clean-code` report does not contain. `/planner:830-832` fills the QA plan's `## Acceptance Criteria` by "[Copy verbatim from QA report's "Acceptance Criteria" section]". `/implement:236` then reads the plan's copy of that section and gates run closure on it, and `/implement:240` states "Set the STATE file's `**Current Task**` to `Complete` **only after** all applicable checks pass."
- **Evidence:** `.claude/skills/clean-code/SKILL.md:703-712`
- **Excerpt:**
  ```markdown
  ## Recommendations for Next Steps

  ### Immediate (Current Sprint)
  1. **CLEAN-001**: Refactor `processOrder` (CCN 28 → target < 10)
  2. **CLEAN-002**: Extract error handling in `generateReport`
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:830-832`
- **Excerpt:**
  ```markdown
  ## Acceptance Criteria

  [Copy verbatim from QA report's "Acceptance Criteria" section]
  ```
- **Evidence:** `.claude/skills/implement/SKILL.md:236`
- **Excerpt:**
  ```markdown
  1. **Read the plan's `## Acceptance Criteria` section.** Confirm each item holds in the working tree. For each criterion, name the evidence (output of a command, a code location, or both). Report any criterion that does not hold rather than closing the run.
  ```

### Q-07 — `clean-code` uses P1–P4 where `/planner` maps Critical/High/Medium/Low

- **Observation:** `clean-code:352,366,382,398` head the four tiers `P1 (Critical) - Immediate Action Required`, `P2 (High) - Plan for Next Sprint`, `P3 (Medium) - Address When Touching Code`, `P4 (Low) - Nice to Have`, and its findings carry `CLEAN-XXX` ids. `python-qa:31-34`, `typescript-qa:36-39` and `logic-bugs-qa:161-164` enumerate Critical/High/Medium/Low.
- **Direct consequence:** `/planner:505-509` keys plan phases to the second vocabulary — "Phase 1 = Critical priority items" through "Phase 4 = Low priority items". The parenthesized words in `clean-code`'s own headings supply the correspondence, and no file states it as a mapping. The finding-id prefixes do not collide: `/fact-finder:92` pairs a language skill with `clean-code` or `logic-bugs-qa` for a full audit, which yields `QA-`+`CLEAN-` or `QA-`+`LOGIC-`, and `python-qa` and `typescript-qa` do not both apply to one target.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:352-360`
- **Excerpt:**
  ```markdown
  ### P1 (Critical) - Immediate Action Required

  **Criteria**: Issues causing active maintenance burden or high bug risk

  - **Long Method** with CCN > 20 (unmaintainable complexity, high bug risk)
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:504-509`
- **Excerpt:**
  ```markdown
  1. **Apply QA Planning Template**
     - Map QA-XXX items to PLAN-XXX items (1:1 mapping)
     - Organize into phases by priority:
       - Phase 1 = Critical priority items
       - Phase 2 = High priority items
  ```

### Q-08 — All four state the unsuffixed report path

- **Observation:** `clean-code:449`, `python-qa:70`, `typescript-qa:68` and `logic-bugs-qa:211` each state `thoughts/shared/qa/YYYY-MM-DD-[Target].md`. `/fact-finder:94` and `:636` state the suffixed form, and `qa/AGENTS.md:13` declares it as the directory's naming contract. `clean-code:736-746` states the suffixed form in its own worked example — the passage `/fact-finder:94` cites as the origin of the convention.
- **Direct consequence:** `clean-code` states both forms, 287 lines apart. For the other three the suffixed form is stated only outside the skill, in the caller and the DOX contract.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:449`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this template:
  ```
- **Evidence:** `.claude/skills/clean-code/SKILL.md:737-745`
- **Excerpt:**
  ```markdown
  Fact-Finder: "Analyze Python code quality for src/auth/"
  → Uses python-qa skill
  → Produces: thoughts/shared/qa/2026-02-05-Auth-Module-Python.md
  → Covers: Syntax, types, security (ruff, pyright, bandit)
  ```
- **Evidence:** `thoughts/shared/qa/AGENTS.md:13`
- **Excerpt:**
  ```markdown
  **File naming:** `YYYY-MM-DD-<Target>-<Lens>.md` where `<Target>` is the module or file name (e.g., `Auth-Module`, `TypeScript-Config`) and `<Lens>` names the QA skill that produced the report (e.g., `-Python`, `-Design`, `-Bugs`). A full audit produces one file per loaded skill, requiring the lens suffix to prevent collisions.
  ```

### Q-09 — `typescript-qa`'s lens token is stated in no file

- **Observation:** the lens values appearing anywhere in the repo are `-Python`, `-Design` and `-Bugs`, at `/fact-finder:94`, `/fact-finder:638` and `qa/AGENTS.md:13`, all as illustrative examples. `-TypeScript` appears in none of them, and no skill states its own lens value.
- **Direct consequence:** three of the four lens tokens are recoverable from examples and the fourth is not. Because each skill writes its own report file (`/fact-finder:94`: "Each loaded skill writes its own report"), the value is needed at the point of writing.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:638`
- **Excerpt:**
  ```markdown
  **Note**: In QA Mode, use the report template structure from the loaded QA skill. Include `message_type: QA_REPORT` in the document's YAML frontmatter. The [Target] should be a descriptive name derived from the file path or module name (e.g., "Auth-Module", "TypeScript-Config"). The [Lens] names the QA skill that produced the report (e.g., `-Python`, `-Design`, `-Bugs`).
  ```

### Q-10 — `/planner`'s "Section 4" pointer resolves in one of four skills

- **Observation:** `/planner:822` reads "Commands from [language]-qa skill Section 4" and `/planner:828` repeats "Refer to the skill's Section 4 for the complete verification command set." The heading names are: `clean-code:265` `## Section 4: Verification Commands for Planner`; `python-qa:288` `## Baseline Verification Commands`; `typescript-qa:316` `## Baseline Verification Commands`; `logic-bugs-qa:475` `## Verification Commands for Planner`.
- **Direct consequence:** the only skill with a section numbered 4 is the one the pointer does not name. `python-qa` and `typescript-qa` — the `[language]-qa` skills the pointer does name — use no section numbers at all. Three heading strings exist across four skills.
- **Evidence:** `.claude/skills/planner/SKILL.md:820-828`
- **Excerpt:**
  ```markdown
  ## Baseline Verification

  Commands from [language]-qa skill Section 4:

  ```bash
  [Insert verification commands from loaded QA skill]
  ```

  **Note:** The specific verification tools and commands are provided by the loaded QA skill for the target language. Refer to the skill's Section 4 for the complete verification command set.
  ```
- **Evidence:** `.claude/skills/python-qa/SKILL.md:288-290`
- **Excerpt:**
  ```markdown
  ## Baseline Verification Commands

  For Planner to include in implementation plans:
  ```

## Detailed Technical Analysis (Verified)

### Baseline Verification blocks

#### Q-11 — Phase annotations contradict the skills' own prioritization tiers, and name a point that is not where the block runs

- **Observation:** `python-qa:292-297` annotates `ruff check [target]` with "# Should pass after Phase 1", while `python-qa:34` classes "ruff style rules E501, N806" as Low priority. `typescript-qa:320-325` annotates `npx tsc --noEmit` with "# Should pass after Phase 1", while `typescript-qa:37` classes "Type errors blocking compilation (tsc errors)" as High. Under `/planner:505-509`, Low is Phase 4 and High is Phase 2.
- **Direct consequence:** two annotations name a phase one or three tiers earlier than the skill's own hierarchy places the finding class. Separately, `/implement:232-238` executes this block once, after the last wave has committed — that is, after every phase — so at its point of execution the per-phase distinctions describe no reachable state.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:292-297`
- **Excerpt:**
  ```bash
  ruff check [target]  # Should pass after Phase 1
  pyright [target]  # Should pass after Phase 2
  bandit -r [target]  # Should pass after Phase 1
  pytest [target] --cov=[target]  # Should pass after Phase 2
  ```
- **Evidence:** `.claude/skills/python-qa/SKILL.md:31-34`
- **Excerpt:**
  ```markdown
  1. **Critical**: Security vulnerabilities (bandit HIGH/MEDIUM severity)
  2. **High**: Type errors blocking type checking (pyright errors)
  3. **Medium**: Testability issues, maintainability risks (ruff complexity rules C901+, interrogate coverage gaps)
  4. **Low**: Readability improvements, style consistency (ruff style rules E501, N806)
  ```
- **Evidence:** `.claude/skills/implement/SKILL.md:232-238`
- **Excerpt:**
  ```markdown
  ## After the Final Wave

  Once the last wave has committed, the run is not yet closed — perform these acceptance checks:
  ...
  2. **If the plan is a QA plan,** run the plan's `## Baseline Verification` command block and report the output.
  ```

#### Q-12 — `logic-bugs-qa` carries two verification sections

- **Observation:** `logic-bugs-qa:98` heads `## Baseline Verification Commands` with per-language test runners across six languages; `logic-bugs-qa:475` heads `## Verification Commands for Planner` with a three-phase block over the same commands.
- **Direct consequence:** `/planner:820-828` fills one `## Baseline Verification` block from "the loaded QA skill", and this skill offers two candidate sources whose headings match the two different names used by its three sibling skills (Q-10).
- **Evidence:** `.claude/skills/logic-bugs-qa/SKILL.md:475-488`
- **Excerpt:**
  ```markdown
  ## Verification Commands for Planner

  Since logic bugs are verified through tests, not linters, include these in implementation plans:

  ```bash
  # Phase 1: Establish Baseline
  [language-specific-test-command]  # Should pass (or document failures)
  ```

### Pre-Skills scaffolding

#### Q-13 — Envelope fields with no reader

- **Observation:** the four `<answer>` envelopes carry `message_id` (`python-qa:180`, `typescript-qa:187`, `logic-bugs-qa:320`, `clean-code:543`), `correlation_id: [workflow-id or user-request-id]` (`python-qa:181`, `typescript-qa:188`, `logic-bugs-qa:321`) and `qa_agent_version: "1.0"` (`python-qa:186`, `typescript-qa:192`, `logic-bugs-qa:325`). A repo-wide grep for the four skill names returns readers of `message_type` only — `/planner:499`, `/fact-finder:118,638`, `qa/AGENTS.md:19`. No file reads the other fields, and no workflow id is defined anywhere in the toolkit.
- **Direct consequence:** `message_type: QA_REPORT` has three readers; the remaining envelope fields have none. Two commits removed the counterpart scaffolding from the two skills ahead of these in the pipeline: `2b0fe57` from `/fact-finder` and `9e3eea5` from `/planner`, the latter recording that "the envelope was never specified, so the section spent its length distinguishing the real output format from one that does not exist."
- **Evidence:** `.claude/skills/python-qa/SKILL.md:179-186`
- **Excerpt:**
  ```yaml
  ---
  message_id: qa-thorough-YYYY-MM-DD-NNN
  correlation_id: [workflow-id or user-request-id]
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  message_type: QA_REPORT
  qa_agent: python-qa-thorough
  qa_agent_version: "1.0"
  ```
- **Related observation:** `/fact-finder`'s own artifact template at `:613-621` is plain frontmatter with no `<thinking>`/`<answer>` wrapper. The tags appear elsewhere in `/fact-finder` only where it describes what sub-agents return over the wire (`:141-155`, `:211-237`). The four QA skills are the only place in the repo where those tags are written into a stored artifact.

#### Q-14 — Auditor names that no skill bears

- **Observation:** `python-qa:184` and `:202` name the auditor `python-qa-thorough`; `typescript-qa:191` and `:209` name `typescript-qa-thorough`. The skills' own `name:` fields are `python-qa` (`python-qa:2`) and `typescript-qa` (`typescript-qa:2`). `logic-bugs-qa:324` and `clean-code:546` use their skills' actual names.
- **Direct consequence:** two of four skills stamp reports with an identifier matching no file in `.claude/skills/`. The `-quick`/`-thorough` pair belongs to the pre-Skills agent generation, recorded in `thoughts/shared/facts/2026-01-21-Python-QA-Quick-Agent-Communication.md` and `2026-01-21-Python-QA-Thorough-Agent-Communication.md`.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:199-203`
- **Excerpt:**
  ```markdown
  ## Scan Metadata
  - Date: YYYY-MM-DD
  - Target: [path]
  - Auditor: python-qa-thorough
  - Tools: ruff, pyright, bandit, interrogate, manual analysis
  ```

### Delegation contracts

#### Q-15 — `logic-bugs-qa` leaves a scope alternation unbracketed

- **Observation:** `logic-bugs-qa:174` reads `prompt: "Trace [function] in [file]. Output scope: comprehensive | focused | execution_only."`. The bracketed placeholders in that line are `[function]` and `[file]`; the three scope values are not bracketed. `codebase-analyzer.md:44-54` declares the three accepted `output_scope` values.
- **Direct consequence:** the line as written sends all three values in one prompt. The other scope references across the four skills match their agents' declared vocabularies: `codebase-locator.md:51` accepts `tests_only|paths_only|focused|comprehensive`, matching `python-qa:44` and `typescript-qa:49` (`tests_only`) and `clean-code:435` (`paths_only`); `codebase-analyzer.md:44-54` accepts `execution_only|focused|comprehensive`, matching `python-qa:58` and `typescript-qa:63` (`execution_only`).
- **Evidence:** `.claude/skills/logic-bugs-qa/SKILL.md:170-175`
- **Excerpt:**
  ```markdown
  Agent tool:
    subagent_type: "codebase-analyzer"
    description: "Trace [function]"
    prompt: "Trace [function] in [file]. Output scope: comprehensive | focused | execution_only."
  ```
- **Evidence:** `.claude/agents/codebase-analyzer.md:44-54`
- **Excerpt:**
  ```markdown
  1. **`execution_only`**: Return only Section 1 (Execution Flow)
  2. **`focused`**: Return Sections 1 and 3 (Execution Flow + Dependencies)
  3. **`comprehensive`**: Return all 4 sections (default)
  ```

#### Q-16 — `typescript-qa` logs a delegation it declares no pattern for

- **Observation:** `typescript-qa:41-64` supplies three delegation blocks — `codebase-locator`, `codebase-pattern-finder`, `codebase-analyzer`. Its report template at `:158-161` logs a fourth, `web-search-researcher`. `python-qa:61-66` declares that fourth block; `typescript-qa` does not.
- **Direct consequence:** the Delegation Log section of a `typescript-qa` report has a slot for an agent the skill states no invocation pattern for.
- **Evidence:** `.claude/skills/typescript-qa/SKILL.md:158-161`
- **Excerpt:**
  ```markdown
  4. **web-search-researcher**:
     - Task: Research [topic]
     - Response: [confidence level + sources]
     - Key findings: [summary]
  ```

### DOX and inventory copies

#### Q-17 — `qa/AGENTS.md` states a finding field no template carries

- **Observation:** `qa/AGENTS.md:29` states "Each finding includes: description, location, severity, and reproduction path". No `reproduction path` field appears in any of the four finding templates (`python-qa:252-263`, `typescript-qa:281-292`, `logic-bugs-qa:438-451`, `clean-code:576-600`). The nearest is `logic-bugs-qa:450` `Test Case: [Specific input that triggers the bug OR new test to add]`.
- **Direct consequence:** the DOX contract for the directory names a fourth per-finding element that the templates writing into that directory do not produce. `qa/AGENTS.md:42` states the validity rule that is met: "A valid QA report has automated tool output AND at least one manual finding".
- **Evidence:** `thoughts/shared/qa/AGENTS.md:25-29`
- **Excerpt:**
  ```markdown
  **Report structure** (follows the loaded QA skill's template):
  - Automated tool output summary (linter warnings, type errors, test results)
  - Issue classification by severity (critical / high / medium / low)
  - Manual analysis findings with file:line evidence
  - Each finding includes: description, location, severity, and reproduction path
  ```

#### Q-18 — The skill inventory exists in two copies; the SessionStart hook holds none

- **Observation:** the four skill names appear in `CLAUDE.md:103-106` and `README.md:120-123`. `grep` for all four names across `.claude/hooks/session-start` returns no match; the hook enumerates the eight workflow skills only. `CLAUDE.md:81-88` states that the *pipeline* definition is duplicated in five places including the hook.
- **Direct consequence:** combined with Q-01's "Zero until you invoke" context cost, no text naming the four skills enters an ordinary session except `CLAUDE.md:103-106`. The two inventory copies agree with each other on all four names and one-line purposes.
- **Evidence:** `CLAUDE.md:103-106`
- **Excerpt:**
  ```markdown
  | `clean-code` | Language-agnostic code quality review (Clean Code, Pragmatic Programmer, etc.) |
  | `python-qa` | Python-specific quality review |
  | `typescript-qa` | TypeScript-specific quality review |
  | `logic-bugs-qa` | Logic and bug analysis across languages |
  ```

### Contracts the four skills currently satisfy

Recorded so the planner does not re-verify them:

- **`allowed-tools` excludes `Edit` in all four**, each with the same inline rationale. Evidence: `clean-code:5`, `python-qa:5`, `typescript-qa:5`, `logic-bugs-qa:5` — `allowed-tools: Bash, Read, Grep, Glob, Write, Agent   # no Edit — a reviewer must not fix what it reviews`.
- **All `references/` links resolve.** `clean-code/references/` holds the six files cited at `clean-code:722-728` and `:780-785`; `logic-bugs-qa/references/common-bug-patterns.md` cited at `:493` exists. `python-qa/` and `typescript-qa/` contain `SKILL.md` only and cite no reference files.
- **The delegation blocks name agents by their own `name:`**, matching `CLAUDE.md:127-137`, and every scope value except Q-15's matches the agent's declared vocabulary.
- **The three severity-tier enumerations in `python-qa:31-34`, `typescript-qa:36-39` and `logic-bugs-qa:161-164`** use the Critical/High/Medium/Low vocabulary `/planner:505-509` maps.
- **`python-qa`, `typescript-qa` and `logic-bugs-qa` each carry `## Improvement Plan (For Implementor)`, `## Acceptance Criteria` and `## Implementor Checklist`** in the order `/planner` reads them.

## Verification Log

- `Verified (personally read):`
  - `.claude/skills/clean-code/SKILL.md` (full, 787 lines)
  - `.claude/skills/python-qa/SKILL.md` (full, 297 lines)
  - `.claude/skills/typescript-qa/SKILL.md` (full, 325 lines)
  - `.claude/skills/logic-bugs-qa/SKILL.md` (full, 579 lines)
  - `.claude/skills/implement/SKILL.md` (full, 284 lines)
  - `.claude/skills/implement/reviewer-prompt.md` (full, 77 lines)
  - `.claude/skills/fact-finder/SKILL.md:55-194`, plus its output-format section via grep-confirmed line numbers 613-651
  - `.claude/skills/planner/SKILL.md:455-484`, `:480-599`, `:700-859`
  - `.claude/skills/claude-code-extensions/SKILL.md:64-77`
  - `thoughts/shared/qa/AGENTS.md` (full, 43 lines)
  - `thoughts/shared/facts/AGENTS.md` (full, 53 lines)
  - `.claude/agents/codebase-locator.md` and `.claude/agents/codebase-analyzer.md` — scope declarations at the cited lines, via grep with line numbers
  - `CLAUDE.md`, `README.md`, `AGENTS.md`, `.claude/hooks/session-start` — the four skill names, via grep with line numbers
  - `git show 9e3eea5` (full commit message and diff)
  - `git log -S` over the four QA skill paths for `disable-model-invocation`, and over `fact-finder/SKILL.md` for `QA Mode Detection` and `load the matching quality skill`; `git merge-base --is-ancestor c6a7e21 0d38e63`; commit dates via `git log --pretty="%h %ad %s"` (Q-01 Provenance)
- `Accepted from sub-agent excerpts (not personally re-read):` none. No sub-agent was dispatched: every target path was known at the outset and had been opened in this session, and `/fact-finder:60` assigns personal `Read` the verification role.
- `Spot-checked excerpts captured:` yes — every excerpt above was taken from a file opened in this session, and all cited line numbers were confirmed by grep with `-n` or by a line-numbered `Read`.

## Open Questions / Unverified Claims

1. ~~**Whether `disable-model-invocation: true` was set on the four QA skills deliberately.**~~ **Resolved** during the same research session by `git log -S` over the four skill paths and `git merge-base --is-ancestor`; the commit chain is recorded under Q-01 as **Provenance**. The flag (`c6a7e21`, 2026-03-16) predates both the QA Mode section (`b58138c`, 2026-06-09) and the load instruction it contradicts (`0d38e63`, 2026-07-28). `claude-code-extensions:73` states the field's intended use — "for actions with side effects (`/deploy`, `/commit`)" — and a QA skill's side effect is one written report, so the original setting is consistent with that guidance; what the ordering establishes is that the guidance was applied before any file required programmatic loading.

2. **Which of the two dispositions for Q-01 the user intends.** Removing the flag makes `/fact-finder:83` executable as written; keeping it requires QA Mode to be entered by explicit user invocation of a QA skill. Both are consistent with the evidence gathered; nothing in the repo states which is intended. Not resolvable by reading.

3. **Which of the two dispositions for Q-06 and Q-07 the user intends** — aligning `clean-code`'s report sections and severity vocabulary with its three siblings, or extending `/planner` to read a second QA report dialect. `/planner:493-511` is written for one shape; no file records a decision. Not resolvable by reading.

4. **Whether `qa/AGENTS.md:29`'s "reproduction path" was intended as a required field or as prose.** The line sits under "**Report structure** (follows the loaded QA skill's template)", which defers to the skill; the sentence itself reads as a requirement. Tried: reading the full `qa/AGENTS.md` and all four templates. Missing: any other statement of the field, in any file.

5. **Whether `timestamp:` in the three envelopes has a reader.** It is listed alongside the dead fields of Q-13 but is also the only field expressing time-of-scan, and `qa/AGENTS.md:18` requires `date:`. Tried: grep for `timestamp` across `.claude/`. What was not established is whether any consumer distinguishes the two.

6. **The contents of the seven `references/` files.** Confirmed to exist; not read. Whether they contain their own copies of the report template, the severity tiers or the verification commands — any of which would add files to the change surface of Q-05, Q-07 or Q-10 — is unverified.

## References

**Codebase Citations**:
- `.claude/skills/clean-code/SKILL.md:5`, `:265`, `:274-306`, `:308-330`, `:352-360`, `:366`, `:382`, `:398`, `:435`, `:449`, `:451-460`, `:541-553`, `:574`, `:576-600`, `:598-600`, `:703-712`, `:722-728`, `:737-745`, `:780-785`
- `.claude/skills/python-qa/SKILL.md:1-5`, `:17-20`, `:31-34`, `:44`, `:58`, `:61-66`, `:70-74`, `:179-186`, `:189-192`, `:199-203`, `:250`, `:252-263`, `:266`, `:273`, `:288-290`, `:292-297`
- `.claude/skills/typescript-qa/SKILL.md:2`, `:5`, `:17-20`, `:36-39`, `:41-64`, `:49`, `:63`, `:68-71`, `:158-161`, `:185-202`, `:191`, `:209`, `:279`, `:281-292`, `:295`, `:302`, `:316`, `:320-325`
- `.claude/skills/logic-bugs-qa/SKILL.md:5`, `:98`, `:161-164`, `:170-175`, `:211-214`, `:318-334`, `:324`, `:436`, `:438-451`, `:450-451`, `:455`, `:462`, `:475-488`, `:493`
- `.claude/skills/fact-finder/SKILL.md:60`, `:83`, `:92`, `:94`, `:96-113`, `:118`, `:141-155`, `:211-237`, `:613-621`, `:636`, `:638`
- `.claude/skills/planner/SKILL.md:479-482`, `:493`, `:497-499`, `:504-509`, `:572-578`, `:596`, `:789`, `:820-828`, `:830-832`
- `.claude/skills/implement/SKILL.md:22`, `:167`, `:232-238`, `:236`, `:240`
- `.claude/skills/claude-code-extensions/SKILL.md:67-70`, `:73`
- `.claude/agents/codebase-analyzer.md:44-54`; `.claude/agents/codebase-locator.md:51`
- `thoughts/shared/qa/AGENTS.md:13`, `:15-23`, `:19`, `:25-29`, `:42`
- `thoughts/shared/facts/AGENTS.md` (full)
- `thoughts/shared/plans/2026-07-29-Phase-Two-Skills-Repair.md:81`
- `CLAUDE.md:81-88`, `:103-106`, `:127-137`; `README.md:120-123`
- Commits `2b0fe57`, `9e3eea5` (message-envelope removal from `/fact-finder` and `/planner`)
- Commits `c6a7e21` (2026-03-16, introduced `disable-model-invocation` on the four QA skills), `b58138c` (2026-06-09, introduced the QA Mode section), `0d38e63` (2026-07-28, introduced the `Skill`-tool load instruction) — Q-01 Provenance

**Web Research Citations**: none. The one external fact required — the semantics of `disable-model-invocation: true` — was verified from the in-repo reference skill at `.claude/skills/claude-code-extensions/SKILL.md:67-70` rather than by web search.
