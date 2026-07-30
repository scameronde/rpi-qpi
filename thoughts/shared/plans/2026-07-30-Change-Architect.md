---
date: 2026-07-30
planner: planner-skill
ticket: "Change-Architect"
status: complete
fact-source: "thoughts/shared/facts/2026-07-30-Change-Architect.md"
upstream-artifact: thoughts/shared/features/2026-07-30-Change-Architect.md
---

# Change-Architect Implementation Plan

## Inputs

- Fact report(s) used: `thoughts/shared/facts/2026-07-30-Change-Architect.md`
- Epic / feature brief: `thoughts/shared/features/2026-07-30-Change-Architect.md` (from the fact report's `upstream-artifact:`)
- User request summary: Add `/change-architect` as a fourth entry point so that every route into the pipeline begins with a target artifact, and make it mandatory by refusing to plan without one. Six decisions were settled before planning and are not re-opened here: (1) the gate is a **hard stop in `/planner` Phase 1**, with `planner/SKILL.md:599` explicitly relativized to "once Phase 1 has admitted the run"; (2) the QA exemption attaches to the `### QA Report Detection` block, not to `fact-source:`, because that field is never read; (3) `thoughts/shared/changes/` gets no `AGENTS.md`, matching its target-artifact siblings; (4) `scripts/build-plugin.sh` is not touched; (5) no verification script, no documented cutover date, no retrofitting of existing plans; (6) the V3 presentation deck is in scope, the `.pptx` is not.

A feature brief carries no `## Acceptance Criteria for Planner`, `## Implementation Considerations (For Planner)`, `## Dependencies` or `## Verification Plan (For Implementor)` — those are epic sections. This plan's `## Acceptance Criteria` covers the brief's `## Success Criteria` instead, mapped item by item.

## Verified Current State

- **Fact:** `/planner` Phase 1 distinguishes `upstream-artifact: none` from an absent field, and the two produce opposite permissions on `Glob` and opposite user interaction. Only two artifact kinds and two directories are named.
- **Evidence:** `.claude/skills/planner/SKILL.md:479-482`
- **Excerpt:**
  ```markdown
  3. **Read the work order the fact report was written for.** Take its path from the fact report's `upstream-artifact:` frontmatter field and `Read` that file — an epic in `thoughts/shared/epics/` or a feature brief in `thoughts/shared/features/`.
  ```

- **Fact:** `/planner` Phase 3 opens by requiring the artifact to be written unconditionally, and its only stop is post-write. A pre-write refusal contradicts this line as written.
- **Evidence:** `.claude/skills/planner/SKILL.md:598-599`
- **Excerpt:**
  ```markdown
  ### Phase 3: Decision Gates (NO DEADLOCK)
  - Always write the full plan artifact.
  ```

- **Fact:** The only place `/planner` discriminates a QA input from a fact input inspects the input document's path and `message_type`. `fact-source:` is never read.
- **Evidence:** `.claude/skills/planner/SKILL.md:495-499`
- **Excerpt:**
  ```markdown
  **Detection Methods:**
  1. File path starts with `thoughts/shared/qa/`
  2. YAML frontmatter contains `message_type: QA_REPORT`
  ```

- **Fact:** `/fact-finder` Phase 1 globs two directories and names the greenfield and brownfield paths only.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:567`
- **Excerpt:**
  ```markdown
  2. **Otherwise glob for the work order**: `thoughts/shared/epics/` on the greenfield path, `thoughts/shared/features/` on the brownfield path. Both contain sections written *for you*:
  ```

- **Fact:** `/fact-finder`'s `upstream-artifact` description scopes `none` to a single condition and names only two artifact kinds.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:624`
- **Excerpt:**
  ```markdown
  **The `upstream-artifact` field** holds the **path of the epic or feature brief read in Phase 1**, or the literal `none` when the user named the target directly and no work order was globbed.
  ```

- **Fact:** `/implement`'s acceptance step enumerates the values to skip and cites a sibling skill by line number.
- **Evidence:** `.claude/skills/implement/SKILL.md:238`
- **Excerpt:**
  ```markdown
  3. **If the plan's `upstream-artifact:` frontmatter field names an epic,** read that epic and carry out its `## Verification Plan (For Implementor)` section, then report the result. The literal `upstream-artifact: none` means there is no work order — skip this check, exactly as `/planner` treats the same value (`planner/SKILL.md:481`). A value naming a feature brief in `thoughts/shared/features/` is also a skip: only epics carry that section.
  ```

- **Fact:** Both routing tables send small changes straight to `/fact-finder`, and `feature-architect` carries a quoted redirect sentence saying so.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:21,23`; `.claude/skills/mission-architect/SKILL.md:61`
- **Excerpt:**
  ```markdown
  | Small change or extension to existing functionality | `fact-finder` → `planner` directly |
  ...
  If the user describes something that sounds like a small change (a few files, one function, a minor addition), redirect them: "This sounds like a targeted change — I'd suggest going straight to the Fact-Finder → Planner workflow rather than a full feature brief."
  ```

- **Fact:** `/prototype` names `fact-finder` as a post-"go" entry point in three places and carries a skill blocklist for the worktree at a fourth.
- **Evidence:** `.claude/skills/prototype/SKILL.md:3,11,24,86`
- **Excerpt:**
  ```markdown
  Optional entry point before mission-architect/feature-architect/fact-finder.
  ```

- **Fact:** `thoughts-locator`'s archive map lists nine entries including `features/`, its answer template renders eight sections with no Feature Briefs heading, and the count 9 is stated twice.
- **Evidence:** `.claude/agents/thoughts-locator.md:31,50,99-121,156`
- **Excerpt:**
  ```markdown
     - **Sections Returned:** All 9 categories
  ```

- **Fact:** `CLAUDE.md:92` cites `thoughts/shared/plans/AGENTS.md:118-119` for the frontmatter key-set assertion; that assertion is at lines 120-121, and 118-119 hold the STATE-sibling and checklist rules.
- **Evidence:** `CLAUDE.md:92`; `thoughts/shared/plans/AGENTS.md:118-121`
- **Excerpt:**
  ```markdown
  - Each plan has a sibling `-STATE.md`, and its `**Current Task**` names a task ID present in the plan, or `Complete`
  - Every task in the plan appears exactly once in the STATE checklist, under the wave its `Wave:` field names
  - A valid plan's frontmatter carries all six keys: `date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact` — applies to plans authored 2026-07-30 or later
  ```

- **Fact:** The V3 deck names the chain-starting skills in two places: slide 3's "Ausnahmeregel" names exactly two, and slide 4's third entry row carries no `result-box` while rows 1 and 2 do.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:298,371-377`
- **Excerpt:**
  ```html
          Die <span class="terra">/mission-architect</span> und <span class="terra">/feature-architect</span> Skills lesen kein Artefakt — sie <strong>starten die Kette</strong> aus einem Gespräch mit dem Nutzer.
  ```

- **Fact:** The four entry-point/translator skills share an invariant skeleton: frontmatter is `name` + `description` only, exactly three Prime Directive points, exactly four Non-Negotiables, a `**You do NOT:**` list containing the literal `- Run bash commands.`, an `AskUserQuestion` scope rule stated twice, phases shaped intake → synthesis → write, a `Glob`-first write-once guard, a `- [ ]` pre-write gate list, and a closing `**Remember**:` naming the downstream consumer.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:1-4,25-66,114-125,245-247`
- **Excerpt:**
  ```markdown
  Before writing, `Glob` for the target path. Feature briefs are write-once (`thoughts/shared/AGENTS.md`) and `Write` overwrites silently — if the file exists, stop and ask the user whether to supersede it (set the existing file's `status:` to `superseded`) or pick a different name.
  ```

## Inherited Constraints (Respected)

| Constraint | Source | What it forbids or forces | Status |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked via the Skill tool as `/skill-name` | `CLAUDE.md:23-24` | Forces the same shape as the three sibling entry points; forbids a different invocation mechanism | `fixed — not investigated` |
| Nothing compiles and there is no test suite; verification is reading plus two commands | `CLAUDE.md:11` | Forbids relying on tests as a safety net | `fixed — not investigated` |
| Artifacts are named `YYYY-MM-DD-Topic.md` and are write-once after creation | `CLAUDE.md:70`; `thoughts/shared/AGENTS.md:15,37` | Forces the filename form; forbids later stages editing the artifact | `fixed — not investigated` |
| Three frontmatter conventions hold across all artifacts: a back-pointer naming the artifact upstream, `status:` describing the document, the authoring skill signing its own field | `CLAUDE.md:90-92` | Forces the Change Brief's key set into that shape | `fixed — not investigated` |
| `/planner` copies the fact report's `upstream-artifact:` verbatim rather than re-deriving it | `CLAUDE.md:90`; `planner/SKILL.md:637` | Forces the Change Brief to reach the plan through that existing field; forbids a parallel path | `fixed — not investigated` |
| The pipeline definition is duplicated with no tooling keeping copies in sync | `CLAUDE.md:94-105` | Forces treating a fourth entry point as a multi-file documentation edit | `fixed — not investigated` |
| `.claude/**` is outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and its four children | `CLAUDE.md:225` | Forbids an `AGENTS.md` for the new skill directory | `fixed — not investigated` |
| Never edit a skill or agent file while `/implement` is mid-plan | `CLAUDE.md:12` | Forces wave design to hold the orchestrator's own rules stable — see PLAN-012 and the Approval Gate | `fixed — not investigated` |
| ORBIT has no mission or spec document; `CLAUDE.md` and the `SKILL.md` files are the normative record | `inferred — Glob of thoughts/shared/missions/ and specs/ returned empty; CLAUDE.md fills the role` | Forces constraint citations to `CLAUDE.md` or skill files rather than a spec | `inferred — verified` |

No task in this plan contradicts a row above.

## Goals / Non-Goals

**Goals**

- A fourth entry-point skill, `/change-architect`, writing a typed Change Brief to `thoughts/shared/changes/`.
- The Change Brief reaches `/planner` through the existing `upstream-artifact:` field, with no new mechanism.
- `/planner` refuses, before writing anything, to plan from a `facts/`-sourced report carrying `upstream-artifact: none`; QA-sourced plans are exempt.
- `/fact-finder` redirects early rather than producing research that cannot become a plan, and marks a deliberately exploratory report.
- Every stated copy of the pipeline definition names the same four entry points.

**Non-Goals**

- No verification script and no documented cutover date. The chain property is a process commitment carried by the `/planner` skill, not a re-checkable repository property.
- No retrofitting of the 40+ existing plans.
- No change to the four QA skills. Their `upstream-artifact: none` templates stay as they are; only `/planner` learns to recognise a QA-sourced run as exempt.
- No `## Inherited Constraints` section in the Change Brief.
- No new frontmatter field to mark exploration.
- No edit to `scripts/build-plugin.sh` — skills reach `dist/orbit/` by wholesale copy (`scripts/build-plugin.sh:51`).
- No edit to `presentation/ORBIT.pptx` (binary, contents unverified) and none to `ORBIT-V5-CONCEPT.md` (a draft, per `CLAUDE.md:239-243`).
- `thoughts/shared/changes/` is not created as an empty directory. Its target-artifact siblings `missions/` and `specs/` are likewise empty and untracked; the skill's `Write` creates the directory on first use.

## Approval Gate

Three of the four Phase 3 triggers apply.

**Trigger 1 — changes a contract with more than one reader.** Three contracts widen here:

- `upstream-artifact:` is written by `/fact-finder` and read by both `/planner` (`planner/SKILL.md:479-482`) and `/implement` (`implement/SKILL.md:238`). This plan adds a third legal artifact kind to it and adds a refusal keyed on its value.
- The fact report's frontmatter contract gains a documented exploratory case.
- `thoughts-locator`'s response envelope gains a tenth category, and its `categories_searched` count changes meaning.

> **Question 1:** The `upstream-artifact:` widening lands across PLAN-002 (`/planner`), PLAN-003 (`/fact-finder`) and PLAN-012 (`/implement`), in two different waves. Do you accept that split, or do you want all three in one wave so the contract never exists in a half-changed state between commits?
>
> **Answered 2026-07-30 — split accepted.** The three readers stay in their planned tasks and waves. The half-changed window between commits is accepted, on the reasoning that it harms nothing unless a pipeline run starts inside it, and that moving PLAN-012 into wave 1 would trade this risk for the larger one under Trigger 2.

**Trigger 2 — edits files that define the executing orchestrator's own behaviour.** PLAN-012 edits `.claude/skills/implement/SKILL.md`, which is the running orchestrator's own instruction file. `CLAUDE.md:12` forbids editing a skill file while `/implement` is mid-plan. The task is placed alone in the final wave to minimise the window, but the exposure does not vanish: the orchestrator's instructions are already in context and an edit does not reload them, so the current run is unaffected — a run **interrupted after PLAN-012 and resumed** would read the new rule mid-plan.

> **Question 2:** Do you accept executing PLAN-012 through `/implement` itself, or do you want that one edit made by hand outside the orchestrator, with the plan carrying it as a manual step?
>
> **Answered 2026-07-30 — execute through `/implement`.** PLAN-012 stays a normal task, alone in the final wave. Two things bound the exposure: only PLAN-013 and the acceptance step follow it, and the acceptance step in *this* run still applies the old rule, which for this plan yields the same outcome either way — `upstream-artifact:` names a feature brief, a skip under both the old enumeration and the new positive test.

**Trigger 4 — leaves findings deliberately unaddressed.** Five findings from the fact report are not resolved by this plan:

- **CF-07 residual.** After this change `upstream-artifact: none` carries three meanings: "a target was named directly", "no upstream artifact existed", and "exploratory". PLAN-003 documents the third without collapsing the first two.
- **CF-09, partially.** `thoughts/shared/facts/AGENTS.md` still asserts no frontmatter key set, and `prototypes/AGENTS.md:40` still says "four" against five declared keys. This plan fixes only the `CLAUDE.md:92` citation. The Change Brief itself has no key-set assertion anywhere, because `changes/` gets no `AGENTS.md` — the same hole `features/` already has.
- **CF-01 residual.** `presentation/ORBIT.pptx` and `ORBIT-V5-CONCEPT.md` carry ordering statements and are out of scope by the decisions above.
- **`fact-finder/SKILL.md:117` vs `:636`** — two QA output-path instructions in one file, one with the lens suffix and one without. Untouched.
- **`fact-finder/SKILL.md:376` vs `:336-357`** — the stated category count against a six-section worked example. PLAN-003 updates the count; the worked example stays at six.

> **Question 3:** Are those five acceptable as recorded and deferred, or do any belong in this plan?
>
> **Answered 2026-07-30 — all five stay out of scope, documented here.** No task in this plan addresses any of them, and the five bullets above are their record. The two candidates that were on the table and declined: a key-set assertion for `thoughts/shared/facts/AGENTS.md` plus the `prototypes/AGENTS.md:40` four-against-five count, and the two `fact-finder/SKILL.md` internal duplications (`:117` vs `:636`, `:376` vs `:336-357`). PLAN-003 still updates the `:376` count itself, because `changes/` makes it wrong — it leaves the six-section worked example at `:336-357` untouched, which is the residual recorded above.

## Design Overview

- `/change-architect` is a fifth member of the entry-point skill family, built on the invariant skeleton verified at `feature-architect/SKILL.md`. It holds a short conversation, reads nothing but an optionally-named Soll source, and writes one artifact.
- The Change Brief's `change-type:` switches the shape of one section — `## Target State` — and nothing else. `defect` records Soll + Soll source + Ist; `enhancement` records Soll + today's behaviour marked as reported and unverified; `maintenance` records the invariant + justification + intended structure.
- Control flow gains exactly one new decision, in `/planner` Phase 1: admit the run, or stop before writing. The condition reads two fields of the fact report — `upstream-artifact:` for the value, and the input path for the QA exemption, reusing the discrimination that already exists at `planner/SKILL.md:495-499`.
- Data flow is unchanged in shape: `changes/` joins `epics/` and `features/` as a third source for the same `upstream-artifact:` edge. No new field, no new file format read by more than one skill.
- `/implement`'s acceptance rule inverts from an enumeration of skips to a positive test on `epics/`, so a fourth artifact kind does not require touching it again.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001 … PLAN-011 | `.claude/skills/change-architect/SKILL.md`, `.claude/skills/planner/SKILL.md`, `.claude/skills/fact-finder/SKILL.md`, `.claude/skills/feature-architect/SKILL.md`, `.claude/skills/mission-architect/SKILL.md`, `.claude/skills/prototype/SKILL.md`, `.claude/agents/thoughts-locator.md`, `.claude/hooks/session-start`, `CLAUDE.md`, `README.md`, `AGENTS.md`, `thoughts/shared/AGENTS.md`, `presentation/The_Agentic_Assembly_LineV3.html` | Every path appears in exactly one task; all eleven are independent text edits with no task consuming another's output |
| 2 | PLAN-012, PLAN-013 | `.claude/skills/implement/SKILL.md`, `CHANGELOG.md` | PLAN-012 is held back deliberately (Approval Gate, Trigger 2). PLAN-013 describes the finished change, so it follows the rest |

Tasks in the same wave run concurrently. No path appears twice within a wave, and no path appears in both waves.

## Implementation Instructions (For Implementor)

---

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** opus
- **Change Type:** create
- **File(s):**
  - `.claude/skills/change-architect/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Author a new skill file following the invariant skeleton of the entry-point family. Read `.claude/skills/feature-architect/SKILL.md` in full first — it is the nearest sibling and the newest member of the family, and this file is a *smaller* instance of the same shape, not a new shape.
  2. Frontmatter carries exactly two keys, `name: change-architect` and `description:`. No `model:`, no `context:`, no `allowed-tools:`, no `disable-model-invocation:`. The description follows the family micro-grammar — verb phrase, then `Outputs a change brief to thoughts/shared/changes/.`, then `Use before /fact-finder.`
  3. Include a `## When to use this agent (vs. alternatives)` routing table, following `feature-architect/SKILL.md:14-23`. Add the upward escape: a change belongs to `/feature-architect` as soon as it needs more than one intended outcome, or needs a real non-goals list to keep it from bleeding into existing behaviour. State that test explicitly.
  4. `## Prime Directive:` with exactly three numbered points. The directive is that the target state is *recorded, not invented* — for a defect the Soll has a source, and naming that source is the point of the document.
  5. `## Non-Negotiables (Enforced)` with exactly four bolded items. Item 1 is the input gate: no codebase scan and no deep analysis — `/fact-finder` owns the Ist-Bestimmung, and this skill must not pre-empt it. Item 2 is the abstraction ceiling: no implementation design. Item 3 is typed target state — one of the three `change-type` values must be settled with the user, and the shape of `## Target State` follows from it. Item 4 is proportionality: if eliciting the intent takes more than a handful of questions, the work is not a small change and belongs to `/feature-architect`.
  6. `## Tools & Delegation` listing `Read`, `Glob`, `AskUserQuestion`, `Write` — no `Grep`, because there is no codebase scan. Then `**You do NOT:**` containing the literal line `- Run bash commands.` plus "scan or analyse the codebase (that is `/fact-finder`'s job)" and "delegate to other agents".
  7. The `AskUserQuestion` rule, stated twice — once in Tools & Delegation and once at the point of use — in the family's dialect A: forced-choice moments only (settling the `change-type`, and the convergence check); open-ended elicitation runs as ordinary conversation, because inventing an option set anchors the user to options the skill made up.
  8. `## Execution Protocol` with three phases shaped intake → synthesis → write: Phase 1 *Intake* (read a Soll source if the user names one; do not go looking for one), Phase 2 *Change Discovery (Conversation)* with the questions grouped per `change-type` and closing on a convergence check, Phase 3 *Change Brief Synthesis*.
  9. Phase 3 states the target path `thoughts/shared/changes/YYYY-MM-DD-[Change-Name].md` and then carries the family's write-once guard verbatim in form: `Glob` for the target path first; change briefs are write-once (`thoughts/shared/AGENTS.md`) and `Write` overwrites silently; if the file exists, stop and ask the user whether to supersede it (set the existing file's `status:` to `superseded`) or pick a different name.
  10. Phase 3 carries an inline `**Pre-write checklist (enforced):**` as a `- [ ]` list, following `feature-architect/SKILL.md:118-125`, closing with an explicit instruction for what to do when a box is unchecked.
  11. `## Output Format (STRICT)` with a `File:` line and a fenced template. Frontmatter: `date`, `change-architect: [identifier]`, `change-name`, `change-type: defect | enhancement | maintenance`, `spec-source: "..." | none`, `status: complete | superseded`. Body sections in order: `## Change Type`, `## Trigger`, `## Target State`, `## Non-Goals`, `## Acceptance Criteria`, `## Open Questions for Fact-Finder`, `## Conversation Summary`. There is deliberately **no** `## Inherited Constraints` section — state that in the template as a comment so a later maintainer does not read its absence as an oversight.
  12. `## Target State` in the template shows all three shapes, one per `change-type`, with the instruction to keep only the applicable one. `defect` → `**Soll**`, `**Soll source**` (a spec path with line range, a test file, documented behaviour, or the literal `implicit — user expectation`), `**Ist**`. `enhancement` → `**Soll**`, `**Today**` marked *as reported, unverified*. `maintenance` → `**Invariant**` (what must remain observably identical), `**Justification**`, `**Intended structure**`.
  13. `## Open Questions for Fact-Finder` uses that exact heading, because `/fact-finder` reads it by name.
  14. Close with a `---` rule and a `**Remember**:` paragraph naming `/fact-finder` as the downstream consumer and what it takes from this document.
- **Interfaces / Pseudocode:**
  ```
  frontmatter: name, description                    # exactly two keys
  ## When to use this agent (vs. alternatives)      # routing table + upward escape
  ## Prime Directive: Recorded, Not Invented        # 3 numbered points
  ## Non-Negotiables (Enforced)                     # exactly 4 bolded items
  ## Tools & Delegation                             # + **You do NOT:**
  ## Execution Protocol                             # Phase 1/2/3
  ## Output Format (STRICT)                         # File: + fenced template
  ---
  **Remember**: …                                   # names /fact-finder
  ```
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:1-4,14-23,25-66,112-125,127-141,245-247`
- **Excerpt:**
  ```markdown
  ## Tools & Delegation

  - **Read**: Load existing mission, spec, and optionally existing epics.
  - **Glob**: Find existing documents in `thoughts/shared/`.
  - **Grep**: Light codebase scan to identify technology stack and existing patterns (not deep analysis — that's the Fact-Finder's job).
  - **AskUserQuestion**: Forced-choice moments only — prioritising among capabilities, settling a contradictory boundary, and the convergence check.
  ```
- **Done When:** `.claude/skills/change-architect/SKILL.md` exists and instantiates the family skeleton: two frontmatter keys, three Prime Directive points, four Non-Negotiables, a `**You do NOT:**` list containing `- Run bash commands.`, the `AskUserQuestion` rule stated twice, three phases, the `Glob`-first write-once guard, an inline `- [ ]` pre-write checklist, an output template whose frontmatter carries the six keys above and whose body carries the seven sections above with all three `## Target State` shapes, and a closing `**Remember**:` naming `/fact-finder`.
- **Verify:** `none — requires review` — the bar here is prose that reads like its four siblings and elicits intent without ceremony. Every mechanical property above can be satisfied by a file that fails that bar, so a command handed to the implementer in advance would be a bar it clears instead of doing the task.
- **Context:** This is the artifact the whole feature exists for. Today the small-change path starts at `/fact-finder`, which then writes `upstream-artifact: none`, so the intent behind a bug fix or a refactor is never recorded anywhere — it lives only in a chat prompt that vanishes with the session. That breaks the uniform Ziel → Ist → Plan schema the project's presentation claims, and it leaves an auditor reading the artifact trail with code changed against no recorded target state. The three `change-type` values are not one case in different words: a refactoring's target is not a behavioural statement at all, which is why forcing all three into one shape produces a document that says nothing.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** opus
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/planner/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. At `:479`, extend the artifact kinds the work-order read admits: an epic in `thoughts/shared/epics/`, a feature brief in `thoughts/shared/features/`, **or a change brief in `thoughts/shared/changes/`**.
  2. Insert a new sub-bullet under step 3, placed **before** the existing `upstream-artifact: none` bullet at `:481`, carrying the admission gate. It must state both halves of the condition: the fact report's `upstream-artifact:` is the literal `none` **and** the input is not a QA report by the `### QA Report Detection` test below. When both hold: write nothing — no plan file, no STATE file — name `/change-architect`, `/feature-architect` and `/mission-architect`, say which one fits which scope, and offer to run `/change-architect` and resume afterwards.
  3. Rewrite the existing `upstream-artifact: none` bullet at `:481` so it governs only the admitted cases: `none` on a QA-sourced run, and `none` on a report the new gate admitted for another reason. It must no longer read as a blanket permission to plan from `none`, and it must keep its existing point that `none` is an answer rather than a prompt to search.
  4. Leave the absent-field bullet at `:482` untouched in substance. Absent and `none` are different states with opposite `Glob` permissions, and the new gate keys on the value `none`, not on the key's absence. Add one clause making that explicit, so the gate is not read as applying to an old report that predates the field.
  5. In the `### QA Report Detection` block (`:493-511`), add a sentence stating that the same detection is what exempts a run from the Phase 1 admission gate, and why: a QA report is already a Soll-Ist comparison, with the loaded lens skill's ruleset as the Soll. Do **not** key the exemption on `fact-source:` — that field is written in four places and read in none.
  6. At `:599`, relativize `- Always write the full plan artifact.` to `- Always write the full plan artifact **once Phase 1 has admitted the run**.` and add one clause naming the Phase 1 gate as the single exception, so the two rules do not stand against each other.
  7. At `:637`, extend the `upstream-artifact` field definition to name the third artifact kind, keeping the copy-verbatim instruction intact.
  8. At `:667`, change the `## Inputs` template line label from `Epic / feature brief:` to `Epic / feature brief / change brief:`, keeping the `(from the fact report's `upstream-artifact:`)` parenthetical.
- **Interfaces / Pseudocode:**
  ```
  Phase 1, step 3 — new sub-bullet, first in the list:
    IF fact report's `upstream-artifact:` == "none"
       AND input is not a QA report (per QA Report Detection)
    THEN stop before writing anything.
         Name the three target skills, offer /change-architect, resume after.
  Phase 3:
    - Always write the full plan artifact **once Phase 1 has admitted the run**.
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:479-482`, `:495-499`, `:598-599`, `:637`, `:667`
- **Excerpt:**
  ```markdown
     - `upstream-artifact: none` means there is no work order. That is the answer, not a prompt to search: plan from the fact report and the user request alone.
     - Only when the field is **absent** — the report predates it — may you `Glob` `thoughts/shared/epics/` and `thoughts/shared/features/`, and then you must name the candidate to the user and get confirmation before relying on it.
  ```
- **Done When:** Phase 1 step 3 carries an admission gate stating both halves of its condition and instructing that nothing be written when they hold; `:481` no longer reads as blanket permission to plan from `none`; the absent-field branch still permits `Glob` and still requires confirmation, with an added clause distinguishing it from `none`; the `### QA Report Detection` block states that it is the exemption test and why; `:599` reads `once Phase 1 has admitted the run` and names the gate as its exception; the `upstream-artifact` definition and the `## Inputs` label both admit a change brief.
- **Verify:** `none — requires review` — this task introduces a control-flow shape the file does not have (a pre-write abort) and must reconcile it with an existing rule that says the opposite. Whether the two now read as one coherent instruction is a judgment a grep cannot make.
- **Context:** This is the gate that turns the Change Brief from an option into a statement. The user's own words: without it, it is not an assertion one can make to a certifier. It sits in `/planner` rather than `/fact-finder` because a fact report changes nothing while a plan is what leads to a change — so "no plan without a recorded target state" is the honest place to enforce, and it is expressible as one property of one field. Two hazards are specific to this file: `fact-source:` looks like the natural hook for the QA exemption and is never read, so keying on it would produce a rule that silently never fires; and `:599` currently forbids exactly what the gate does, so leaving it unrelativized leaves the skill with two contradictory instructions and no way to tell which wins.

---

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** opus
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/fact-finder/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. At `:567`, add `thoughts/shared/changes/` to the glob set as the small-change path, alongside the greenfield and brownfield entries.
  2. In the work-order table at `:569-577`, add two Change brief rows: `## Open Questions for Fact-Finder` → the starting research vectors, and `## Target State` → what the change is meant to achieve, which the research must be able to reach from the current state. Do **not** add an `## Inherited Constraints` row — a change brief deliberately has no such section.
  3. Add a fourth numbered step to Phase 1, after the prototype-note step at `:580`, closing the branch that is currently open: when the user named no document **and** the glob found no work order, stop before delegating any research. Say that a report written without a target artifact cannot become a plan (`/planner` refuses it), offer `/change-architect` — or `/feature-architect` / `/mission-architect` where the scope is larger — and ask whether the user instead wants an explicitly exploratory report. Only on that confirmation does research proceed.
  4. Extend the fall-through at `:582-585` with a clause naming which of the three outcomes produced the research vectors, so a later reader can tell an admitted exploratory run from a work-order run.
  5. At `:624`, rewrite the `upstream-artifact` field description to cover three cases without collapsing them: a path — now including a change brief in `thoughts/shared/changes/`; `none` because the user named the target directly; and `none` because the run is an admitted exploratory one. State that the third case additionally requires the Coverage Map line in step 6 below, and that `/planner` refuses a `facts/` report carrying `none`.
  6. In the report template's `## Coverage Map` section, add a required line for the exploratory case, in these words or equivalent: `Exploratory — no upstream target artifact; not eligible as a plan input.` State that it is required exactly when `upstream-artifact:` is `none` on an exploratory run, so the document explains itself to someone opening it alone.
  7. At `:663`, extend the `None` rule for `## Inherited Constraints (Treated as Fixed)` to cover a third condition: an upstream artifact that carries no such section at all, which is the case for every change brief.
  8. At `:376`, change `All 9 categories` to `All 10 categories` and add `change briefs` to the parenthesised list, matching PLAN-006.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:567`, `:580-585`, `:624`, `:662-663`, `:376`
- **Excerpt:**
  ```markdown
  Then:
  - Read the user request.
  - Decompose into research vectors — seed them from the artifact's questions when you have one, rather than deriving everything from the prose request.
  - Delegate exploration to sub-agents.
  ```
- **Done When:** The glob set names three directories; the work-order table carries two Change brief rows and no Inherited-Constraints row for them; Phase 1 has a step that stops when both branches fail and offers the three target skills plus an explicit exploratory route; the `upstream-artifact` description distinguishes three cases and names `/planner`'s refusal; the Coverage Map section requires the exploratory declaration line; the `None` rule covers an upstream artifact without that section; `:376` reads `All 10 categories` and lists change briefs.
- **Verify:** `none — requires review` — items 5 and 6 add a third meaning to a value that already carries two, in a file where the two existing definitions are written to different conditions. Whether the result is unambiguous is a reading judgment.
- **Context:** Phase 1 today is `if (user named a document) … / Otherwise glob …` with no else, falling straight through to research. So a glob that returned nothing and a glob that never ran are indistinguishable by the time the report is written, and both land on the same literal `none`. This step is economy rather than enforcement — the binding gate is in `/planner` — but without it the researcher spends a full run producing a report that `/planner` will then refuse. The exploratory route stays open on purpose: a rule that forbids undirected research does not stop it happening, it stops it being written down.

---

- **Action ID:** PLAN-004
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/feature-architect/SKILL.md`
  - `.claude/skills/mission-architect/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In `feature-architect/SKILL.md`, replace the last row of the routing table at `:21` so it reads exactly:
     `| Small change, bug fix, or maintenance work | `change-architect` → `fact-finder` → `planner` |`
  2. In `feature-architect/SKILL.md:23`, replace the redirect sentence's quoted script so it names the new skill. The new sentence must read exactly: `If the user describes something that sounds like a small change (a few files, one function, a minor addition), redirect them: "This sounds like a targeted change — I'd suggest `/change-architect`, which records the intent in a short brief before the Fact-Finder maps the code, rather than a full feature brief."`
  3. In `mission-architect/SKILL.md`, replace the last row of the routing table at `:61` so it reads exactly:
     `| Small change or extension to existing functionality | `/change-architect` → `/fact-finder` → `/planner` → `/implement` |`
  4. Change nothing else in either file. Both keep their own table shape — `feature-architect`'s column is `Agent` with four rows, `mission-architect`'s is `Route` with five rows and arrows through `/implement`. Do not harmonise them.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:16-23`; `.claude/skills/mission-architect/SKILL.md:55-61`
- **Excerpt:**
  ```markdown
  | Small change or extension to existing functionality | `fact-finder` → `planner` directly |

  If the user describes something that sounds like a small change (a few files, one function, a minor addition), redirect them: "This sounds like a targeted change — I'd suggest going straight to the Fact-Finder → Planner workflow rather than a full feature brief."
  ```
- **Done When:** Neither file routes a small change to `/fact-finder` as the first stage; both name `/change-architect`; both tables otherwise keep their existing shape, column name and row count.
- **Verify:** `grep -q '^| Small change, bug fix, or maintenance work | `change-architect` → `fact-finder` → `planner` |$' .claude/skills/feature-architect/SKILL.md && grep -q 'I.d suggest `/change-architect`, which records the intent in a short brief' .claude/skills/feature-architect/SKILL.md && grep -q '^| Small change or extension to existing functionality | `/change-architect` → `/fact-finder` → `/planner` → `/implement` |$' .claude/skills/mission-architect/SKILL.md && ! grep -q 'going straight to the Fact-Finder → Planner workflow' .claude/skills/feature-architect/SKILL.md` → exit 0
- **Context:** These two lines are the live routing decision — the place where a user arriving with a bug fix is told where to go. `feature-architect/SKILL.md:23` currently says the opposite of what this feature establishes, in a quoted script the skill reads out verbatim, so leaving it would have the brownfield skill actively sending work past the new entry point. The two tables are deliberately different shapes and the negative check in `Verify` exists because replacing the row without replacing the prose sentence is the easy half-edit here.

---

- **Action ID:** PLAN-005
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/prototype/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. At `:3`, change the frontmatter description's closing sentence to `Optional entry point before mission-architect/feature-architect/change-architect.`
  2. At `:11`, change the parenthesised entry-point set from `(`mission-architect`, `feature-architect`, or the direct `fact-finder → planner` path)` to `(`mission-architect`, `feature-architect`, or `change-architect`)`.
  3. At `:24`, add `change-architect` to the blocklist of skills that must never be called from inside the prototype worktree. Insert it next to `feature-architect` so the entry-point skills stay together.
  4. At `:86`, change the post-"go" hand-off sentence so it names `/change-architect` alongside `/feature-architect`. It must read exactly: `Tell the user the note's path. On a "go" decision, additionally tell them: "Next: invoke `/feature-architect` or `/change-architect` and point it at this note for context — the prototype's code itself was discarded; real implementation starts fresh."`
- **Evidence:** `.claude/skills/prototype/SKILL.md:3,11,24,86`
- **Excerpt:**
  ```markdown
  You are the **Prototype** skill. You are the pipeline's pressure-release valve: the fast, isolated, consequence-free way to answer "would this even work, and do I want it at all?" — before any spec, plan, or QA rigor begins. Every other entry point (`mission-architect`, `feature-architect`, or the direct `fact-finder → planner` path) assumes the user has already committed to building something for real.
  ```
- **Done When:** All four locations name `change-architect`; no location still presents `fact-finder` as the entry point reached after a "go" decision; the worktree blocklist includes `change-architect`.
- **Verify:** `grep -q 'Optional entry point before mission-architect/feature-architect/change-architect\.' .claude/skills/prototype/SKILL.md && grep -q 'or `change-architect`) assumes the user has already committed' .claude/skills/prototype/SKILL.md && sed -n '24p' .claude/skills/prototype/SKILL.md | grep -q 'change-architect' && grep -q 'invoke `/feature-architect` or `/change-architect` and point it at this note' .claude/skills/prototype/SKILL.md` → exit 0
- **Context:** `/prototype` is the one skill that names the entry points as a *set* rather than as a chain, and it does so four times, including once in a quoted script it reads out to the user after a go/no-go decision. Line 24 matters for a different reason: it is a hard blocklist protecting the worktree from pipeline gates, and an entry-point skill missing from it is a skill that can be invoked inside a disposable worktree and write a real artifact that the worktree teardown then strands.

---

- **Action ID:** PLAN-006
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/agents/thoughts-locator.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In the Map of the Archive (`:46-56`), add a line for change briefs immediately after the `features/` line, reading exactly:
     `*   `thoughts/shared/changes/` -> Change briefs (`YYYY-MM-DD-[Change-Name].md`)`
  2. In the Answer Section Format template (`:96-122`), add two `###` sections so every mapped category has a heading to be reported under. Add `### Feature Briefs` after `### Specifications`, and `### Change Briefs` after it. Give each an example line in the style of the surrounding sections, e.g. `- `thoughts/shared/features/2026-01-10-CSV-Export.md` - **CSV Export Feature Brief**`.
  3. At `:31` change `All 9 categories` to `All 10 categories`.
  4. At `:156` change `Return all 9 categories (omitting empty ones).` to `Return all 10 categories (omitting empty ones).`
  5. In the Workflow search examples (`:60-67`), add find examples for the two categories that lack one: `*   *Feature Briefs*: `find thoughts/shared/features/ -name "*Export*"`` and `*   *Change Briefs*: `find thoughts/shared/changes/ -name "*Timeout*"``.
- **Evidence:** `.claude/agents/thoughts-locator.md:31,46-56,96-122,156`
- **Excerpt:**
  ```markdown
  *   `thoughts/shared/features/` -> Feature briefs (`YYYY-MM-DD-[Feature-Name].md`)
  ```
- **Done When:** The map lists ten categories including `changes/`; the answer template renders ten `###` sections, including Feature Briefs and Change Briefs; both count statements read 10; the search examples cover `features/` and `changes/`.
- **Verify:** `grep -q '^\*   `thoughts/shared/changes/` -> Change briefs' .claude/agents/thoughts-locator.md && grep -q '^### Feature Briefs$' .claude/agents/thoughts-locator.md && grep -q '^### Change Briefs$' .claude/agents/thoughts-locator.md && [ "$(grep -c 'All 10 categories\|all 10 categories' .claude/agents/thoughts-locator.md)" = 2 ] && ! grep -q '9 categories' .claude/agents/thoughts-locator.md` → exit 0
- **Context:** This agent's map and its output template have drifted apart already: `features/` is mapped at `:50` but has no heading among the eight the template renders, and both count statements say 9 — which counts map entries, not renderable sections. Adding `changes/` to the map alone would inherit that same asymmetry, giving the locator a category it knows about and cannot report. Closing the `features/` gap in the same pass is why the section count moves from 8 to 10 while the category count moves from 9 to 10.

---

- **Action ID:** PLAN-007
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/hooks/session-start`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In the `## Available Workflow Skills` list, insert a `/change-architect` line after the `/feature-architect` line at `:9`. It must state: small changes, bug fixes and maintenance work; output a change brief to `thoughts/shared/changes/`; use before `/fact-finder`; and that a change needing more than one intended outcome belongs to `/feature-architect`.
  2. In the `/fact-finder` line at `:12`, add that it requires a target artifact upstream and that `/planner` refuses a report without one.
  3. In the `## Workflow Ordering` block, replace the `Small fix:` line at `:22` so it reads exactly:
     `Small fix:   /change-architect → /fact-finder → /planner → /implement`
  4. In the same block at `:23`, change `Unsure:      /prototype → then one of the three above, on a 'go' decision` to name four paths instead of three.
  5. In the `## Rules` block, add a rule after `:27`: every route begins with a target artifact — `/planner` refuses a plan built on a `facts/` report whose `upstream-artifact:` is `none`; QA-sourced plans are exempt.
  6. Preserve the shell quoting exactly. The whole context is a single double-quoted bash string passed through `escape_for_json`, so an unescaped double quote or backslash in the new text breaks the hook's JSON output and every session starts blind.
- **Evidence:** `.claude/hooks/session-start:8-31`
- **Excerpt:**
  ```
  Greenfield:  /mission-architect → /specifier → /epic-planner → /fact-finder → /planner → /implement
  Brownfield:  /feature-architect → /fact-finder → /planner → /implement
  Subsystem:   own value proposition AND several parallel streams → take the greenfield path, mission records the host system as a constraint (either condition alone stays brownfield)
  Small fix:   /fact-finder → /planner → /implement
  ```
- **Done When:** The skills list has a `/change-architect` entry; the `Small fix:` ordering line starts with `/change-architect`; the Rules block states the target-artifact requirement and the QA exemption; and the hook still emits valid JSON.
- **Verify:** `.claude/hooks/session-start | python3 -m json.tool > /dev/null && .claude/hooks/session-start | python3 -c "import json,sys; c=json.load(sys.stdin)['hookSpecificOutput']['additionalContext']; assert '/change-architect —' in c; assert 'Small fix:   /change-architect → /fact-finder → /planner → /implement' in c; assert 'upstream-artifact' in c" && echo OK` → prints `OK`, exit 0
- **Context:** This file is the text injected into every session, so it is the copy of the pipeline that actually steers behaviour rather than merely documenting it — a session whose hook still says the small-change path starts at `/fact-finder` will keep routing that way no matter what the other four copies say. It is also the one copy that can fail closed: the content is a single double-quoted bash string, and a stray quote makes `escape_for_json` emit malformed JSON, at which point the session starts with no workflow context at all. That is why the check parses the JSON and asserts against the decoded string rather than grepping the source.

---

- **Action ID:** PLAN-008
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `CLAUDE.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Replace the `**Small change or bug fix:**` block at `:47-49` so the chain reads `/change-architect → /fact-finder → /planner → /implement`, and retitle it `**Small change, bug fix, or maintenance:**`. Add one sentence after the block stating that the change brief is typed — `defect | enhancement | maintenance` — and that a change needing more than one intended outcome belongs to `/feature-architect`.
  2. At `:52-54`, update the explore-first chain to `/prototype → (mission-architect | feature-architect | change-architect)`.
  3. In the stage table at `:59-68`, insert a row after the feature-brief row, reading exactly:
     `| Change brief (small change) | `/change-architect` | `thoughts/shared/changes/` |`
  4. In the chain diagram at `:76-84`, add change briefs as a third source feeding `upstream-artifact`, alongside the epic and the feature brief. Keep the existing edge labels.
  5. At `:90`, replace the closing sentence `` `none`, or a path into `features/`, means skip it — only epics carry that section. `` with a positive statement: the epic verification section applies exactly when the path is under `epics/`; a path into `features/` or `changes/`, and the literal `none`, are skips. This must match the rule PLAN-012 writes into `implement/SKILL.md:238`.
  6. At `:92`, correct the citation `thoughts/shared/plans/AGENTS.md:118-119` to `thoughts/shared/plans/AGENTS.md:120-121`, which is where the two key-set assertions actually sit.
  7. In the Workflow Skills table at `:108-117`, insert a row after the `/feature-architect` row reading exactly:
     `| `/change-architect` | Record the intent of a small change, bug fix, or maintenance work before research begins |`
  8. At `:117`, update the `/prototype` row's parenthetical from `before mission-architect/feature-architect/fact-finder` to `before mission-architect/feature-architect/change-architect`.
  9. Add a short paragraph to the `## Artifact Frontmatter` section stating that a change brief carries no `## Inherited Constraints` section, so `/fact-finder` writes `None` in its own table — deliberate, so a later maintainer does not read the absence as drift.
- **Evidence:** `CLAUDE.md:47-54,59-68,76-84,90-92,106-117`
- **Excerpt:**
  ```markdown
  - **A back-pointer names the artifact upstream** — `mission-source:`, `spec-source:`, `fact-source:`, `plan:`, or the generic `upstream-artifact:` — always a repo-relative path or the literal `none`. ... `none`, or a path into `features/`, means skip it — only epics carry that section.
  - **The authoring skill signs its own field** — `fact-finder:`, `feature-architect:`, `planner:`. The only place a key set is actually asserted is the owning directory's `AGENTS.md` `## Verification` list (e.g. `thoughts/shared/plans/AGENTS.md:118-119`)
  ```
- **Done When:** The small-change chain starts at `/change-architect`; the explore-first chain names it; the stage table and the skills table each carry a `/change-architect` row; the chain diagram shows change briefs as a third source of `upstream-artifact`; `:90` states the `epics/` test positively; the `plans/AGENTS.md` citation reads 120-121; and the deliberate absence of `## Inherited Constraints` in a change brief is recorded.
- **Verify:** `grep -q '^/change-architect → /fact-finder → /planner → /implement$' CLAUDE.md && grep -q '^| Change brief (small change) | `/change-architect` | `thoughts/shared/changes/` |$' CLAUDE.md && grep -q 'thoughts/shared/plans/AGENTS.md:120-121' CLAUDE.md && grep -q 'mission-architect | feature-architect | change-architect' CLAUDE.md && ! grep -q '`none`, or a path into `features/`, means skip it' CLAUDE.md && ! grep -q 'AGENTS.md:118-119' CLAUDE.md` → exit 0
- **Context:** `CLAUDE.md` is the top-level contract every session loads and the document that declares the pipeline duplicated across five places — so a fourth entry point that is not stated here is a fourth entry point the project does not officially have. Two of the nine edits are not about this feature at all but about findings the research turned up in the lines being touched: the `:90` skip rule becomes brittle the moment a third artifact kind exists, which is why it inverts to a positive test rather than gaining a third enumerated exception; and the `:92` citation points two lines above the assertion it names, which matters because that sentence is the rule telling a maintainer where a frontmatter key set gets asserted.

---

- **Action ID:** PLAN-009
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `README.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Replace the `**Small change or bug fix:**` block at `:22-24` so the chain reads `/change-architect → /fact-finder → /planner → /implement`, retitled `**Small change, bug fix, or maintenance:**`, with one sentence naming the three `change-type` values.
  2. At `:27-30`, update the `/prototype` block's follow-on text to name the four paths.
  3. At `:32`, extend the load-bearing-orderings sentence with a third: every route begins with a target artifact, because `/planner` refuses a plan built on a `facts/` report whose `upstream-artifact:` is `none`.
  4. In the stage table at `:36-45`, insert a row after the feature-brief row reading exactly:
     `| Change brief (small change) | `/change-architect` | `thoughts/shared/changes/` |`
  5. In the ASCII chain diagram at `:49-52`, add change briefs as a third source alongside mission-chain and feature brief.
  6. At `:54`, extend the sentence about `/implement` using the copy so it states the positive `epics/` test rather than implying every value names an epic.
  7. In the command table at `:122-131`, insert a row after the `/feature-architect` row reading exactly:
     `| `/change-architect` | Record the intent of a small change, bug fix, or maintenance work — brownfield, before research |`
  8. At `:131`, leave the `/prototype` row's wording alone; it does not name a successor stage.
- **Evidence:** `README.md:22-32,36-52,54,122-131`
- **Excerpt:**
  ```
  mission ──▶ spec ──▶ epic ─┐
  feature brief ─────────────┴──▶ fact report ──▶ plan ──▶ STATE
  ```
- **Done When:** The small-change chain starts at `/change-architect`; the stage table and command table each carry a `/change-architect` row; the chain diagram shows three sources; the load-bearing-orderings sentence names the target-artifact requirement.
- **Verify:** `grep -q '^/change-architect → /fact-finder → /planner → /implement$' README.md && grep -q '^| Change brief (small change) | `/change-architect` | `thoughts/shared/changes/` |$' README.md && grep -q '^| `/change-architect` | Record the intent of a small change, bug fix, or maintenance work — brownfield, before research |$' README.md && grep -q 'change brief' README.md` → exit 0
- **Context:** `README.md` is the copy a reader outside the project sees first, and `CLAUDE.md:104` records that the last pipeline change left exactly this file stale while updating the hook and the skill. Its chain diagram is a second, simpler rendering of the same traceability graph as `CLAUDE.md`'s, so a change brief missing from it makes the two diagrams disagree about how many things can start a chain.

---

- **Action ID:** PLAN-010
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `AGENTS.md`
  - `thoughts/shared/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In root `AGENTS.md`, replace the `- Small fix:` bullet at `:65` so it reads exactly:
     `- Small fix: `/change-architect` → `/fact-finder` → `/planner` → `/implement``
  2. In root `AGENTS.md:66`, update the optional-entry-point bullet to say `one of the four above`.
  3. In root `AGENTS.md:68`, extend the `**Key rule:**` sentence with the third ordering: every route begins with a target artifact; `/planner` refuses a `facts/`-sourced report carrying `upstream-artifact: none`, and QA-sourced plans are exempt.
  4. In `thoughts/shared/AGENTS.md`, insert a row into the directory-assignment table (`:17-27`) immediately after the `features/` row, reading exactly:
     `| `changes/` | `/change-architect` | `/fact-finder` |`
  5. In `thoughts/shared/AGENTS.md:29`, extend the paragraph so it also states that a change brief goes straight to `/fact-finder` for the same reason a feature brief does, and add that a change brief carries no `## Inherited Constraints` section, so `/fact-finder` writes `None` in its own table.
  6. In `thoughts/shared/AGENTS.md:31`, add `changes/` to the `**Empty today:**` list.
  7. In `thoughts/shared/AGENTS.md:52`, add `changes/` to the sentence naming the directories that carry no `AGENTS.md` of their own. Do **not** add a Child DOX Index entry and do **not** create `thoughts/shared/changes/AGENTS.md` — target-artifact directories are governed by this file, which is the verified sibling pattern.
- **Evidence:** `AGENTS.md:61-68`; `thoughts/shared/AGENTS.md:17-31,52`
- **Excerpt:**
  ```markdown
  | `features/` | `/feature-architect` | `/fact-finder` |
  ...
  `missions/`, `specs/`, `epics/` and `features/` carry no `AGENTS.md` — this file is their contract.
  ```
- **Done When:** Root `AGENTS.md` routes small fixes through `/change-architect` and states the target-artifact rule; `thoughts/shared/AGENTS.md` has a `changes/` row in the directory table, lists it as empty today, names it among the directories with no `AGENTS.md`, and records why a change brief has no Inherited Constraints section; no `thoughts/shared/changes/AGENTS.md` exists and no Child DOX Index entry was added.
- **Verify:** `grep -q '^- Small fix: `/change-architect` → `/fact-finder` → `/planner` → `/implement`$' AGENTS.md && grep -q '^| `changes/` | `/change-architect` | `/fact-finder` |$' thoughts/shared/AGENTS.md && grep -q 'and `changes/` carry no `AGENTS.md`\|`features/` and `changes/` carry no `AGENTS.md`' thoughts/shared/AGENTS.md && grep -q 'Empty today:.*changes/' thoughts/shared/AGENTS.md && [ ! -f thoughts/shared/changes/AGENTS.md ]` → exit 0
- **Context:** These are the two governance files, and they are the fourth of the five copies `CLAUDE.md` names. The negative half of item 7 is the load-bearing part: the four target-artifact directories deliberately carry no `AGENTS.md` and are governed by their parent, while the four downstream ones each have their own — so adding one for `changes/` would break the pattern and also change the list at `CLAUDE.md:225` that enumerates every live `AGENTS.md` in the repo. The consequence, recorded in the Approval Gate, is that the Change Brief's frontmatter key set has no place where it is asserted — the same hole `features/` already has.

---

- **Action ID:** PLAN-011
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `presentation/The_Agentic_Assembly_LineV3.html`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. On slide 3, at `:298`, the "Ausnahmeregel" names exactly two chain-starting skills. Add `/change-architect` to that sentence so it names three, keeping the existing `<span class="terra">` markup pattern for each skill name.
  2. On slide 4, at `:371-377`, the third entry row (`Kleine Änderung / Bug / QA`) has a `cmd-box` but no `result-box`, unlike rows 1 and 2. Restructure the entry rows so every row has the same three-part shape. Split the current third row into two:
     - a row for `Kleine Änderung / Bug` with sub-label `Lokalisierte Anpassung`, `cmd-box` `/change-architect`, and `result-box` `Change Pipeline`;
     - a row for `QA / Audit` with sub-label `Qualitätsanalyse`, `cmd-box` `/fact-finder`, and `result-box` `QA Pipeline`.
     Reuse the exact class names and inline styles of the existing rows (`entry-row`, the `Start` label div, `arr`, `entry-box`, `small`, `cmd-box`, `result-box`) so the visual treatment is unchanged.
  3. Leave the closing `box-light` note at `:379-382` as it stands. Its claim — that the architects start the chain and every downstream skill reads that artifact — becomes true once row 3 has an architect, which is the point of the change.
  4. Change nothing on the artifact-chain block at `:306-338`. That diagram lists directories, not entry points, and `changes/` would sit alongside `missions/` rather than in the linear chain; leaving it is deliberate.
  5. Do not touch `presentation/ORBIT.pptx`.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:298,371-382`
- **Excerpt:**
  ```html
        <div class="entry-box">Kleine Änderung / Bug / QA<small>Lokalisierte Anpassung</small></div>
        <div class="arr">→</div>
        <div class="cmd-box">/change-architect</div>
      </div>
  ```
- **Done When:** Slide 3's Ausnahmeregel names three chain-starting skills; slide 4 has four entry rows, each with an `entry-box`, a `cmd-box` and a `result-box`; the QA row is separated from the small-change row; the artifact-chain block and the `.pptx` are untouched.
- **Verify:** `grep -q 'change-architect' presentation/The_Agentic_Assembly_LineV3.html && [ "$(grep -c 'class="entry-row"' presentation/The_Agentic_Assembly_LineV3.html)" = 4 ] && [ "$(sed -n '/id="s4"/,/id="s5"/p' presentation/The_Agentic_Assembly_LineV3.html | grep -c 'class="result-box"')" = 4 ] && sed -n '/Ausnahmeregel/,/box mt12/p' presentation/The_Agentic_Assembly_LineV3.html | grep -q 'change-architect'` → exit 0
- **Context:** This slide is the reason the feature exists. It states, in its own closing note, that the architects produce the first artifact and that every downstream skill reads it — while showing a third entry row that has no architect and, in the markup, no `result-box` either. Splitting QA out of that row is not cosmetic: QA genuinely does start at `/fact-finder` and is genuinely exempt from the new gate, so merging it with small changes would make the slide claim something the implementation does not do. If the `result-box` count check fails, the likely cause is a row edited without adding its third part.

---

- **Action ID:** PLAN-012
- **Wave:** 2
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/implement/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Rewrite check 3 at `:238` to state the condition positively instead of enumerating skips. The epic `## Verification Plan (For Implementor)` section applies **exactly when** the plan's `upstream-artifact:` names a path under `thoughts/shared/epics/`. Every other value — a path under `features/`, a path under `changes/`, or the literal `none` — is a skip, because only epics carry that section.
  2. Keep the cross-reference to `/planner`, but cite it by section rather than by line number: refer to `/planner`'s Phase 1 work-order step instead of `planner/SKILL.md:481`. PLAN-002 inserts a sub-bullet above that line, so the numeric citation would no longer land on the branch it names.
  3. Change nothing else in the file. In particular do not touch the STATE-flip paragraph at `:240`.
- **Evidence:** `.claude/skills/implement/SKILL.md:238`
- **Excerpt:**
  ```markdown
  3. **If the plan's `upstream-artifact:` frontmatter field names an epic,** read that epic and carry out its `## Verification Plan (For Implementor)` section, then report the result. The literal `upstream-artifact: none` means there is no work order — skip this check, exactly as `/planner` treats the same value (`planner/SKILL.md:481`). A value naming a feature brief in `thoughts/shared/features/` is also a skip: only epics carry that section.
  ```
- **Done When:** Check 3 tests positively for a path under `thoughts/shared/epics/`, names `features/`, `changes/` and `none` as skips, and no longer cites `planner/SKILL.md` by line number.
- **Verify:** `sed -n '230,242p' .claude/skills/implement/SKILL.md | grep -q 'thoughts/shared/epics/' && sed -n '230,242p' .claude/skills/implement/SKILL.md | grep -q 'changes/' && ! grep -q 'planner/SKILL.md:481' .claude/skills/implement/SKILL.md && grep -q 'Set the STATE file' .claude/skills/implement/SKILL.md` → exit 0
- **Context:** This is the third reader of the `upstream-artifact:` contract and the reason the rule inverts: an enumeration of exceptions needs editing every time an artifact kind is added, while a positive test on `epics/` does not. The task is alone in the final wave on purpose — `CLAUDE.md:12` forbids editing a skill file while `/implement` is mid-plan, and this is the orchestrator's own instruction file. The current run is not affected, because the orchestrator's instructions are already in context and a file edit does not reload them; the exposure is a run interrupted after this commit and then resumed, which would read the new rule mid-plan. The `Verify` command's last clause checks that `:240` survived, since that paragraph is the sole writer of the STATE `status:` flip.

---

- **Action ID:** PLAN-013
- **Wave:** 2
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `CHANGELOG.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Under the existing `## [Unreleased]` section's `### Added` subsection, add an entry for `/change-architect`: a fourth entry point writing a typed change brief (`defect | enhancement | maintenance`) to `thoughts/shared/changes/`, so every route into the pipeline begins with a recorded target state.
  2. Add a second `### Added` entry for the `/planner` admission gate: it now refuses, before writing anything, to plan from a `facts/`-sourced report whose `upstream-artifact:` is `none`; QA-sourced plans are exempt because a QA report is already a Soll-Ist comparison.
  3. Under `### Changed`, add entries for: `/implement`'s acceptance check now testing positively for `epics/` instead of enumerating skips; `/fact-finder` gaining a Phase 1 redirect and an explicit exploratory route; and the V3 presentation deck's entry-point slide gaining the fourth row.
  4. Under `### Fixed`, add entries for the two incidental corrections: the `CLAUDE.md` citation of `thoughts/shared/plans/AGENTS.md` moving from 118-119 to 120-121, and `thoughts-locator` gaining output sections for `features/` and `changes/` so its map and its answer template agree.
  5. Do not create a new version section and do not touch any existing `## [Vx.y.z]` section — this work is unreleased.
- **Evidence:** `CHANGELOG.md:14-21`
- **Excerpt:**
  ```markdown
  ## [Unreleased]

  ### Added
  - `CHANGELOG.md`, backfilled from git tag history, plus a Release Notes section in `CLAUDE.md` documenting the convention.
  ```
- **Done When:** `## [Unreleased]` carries entries under `Added`, `Changed` and `Fixed` covering the new skill, the planner gate, the `/implement` inversion, the fact-finder redirect, the presentation slide, and the two incidental corrections; no new version section exists.
- **Verify:** `sed -n '/## \[Unreleased\]/,/## \[V4.0.1\]/p' CHANGELOG.md | grep -q 'change-architect' && sed -n '/## \[Unreleased\]/,/## \[V4.0.1\]/p' CHANGELOG.md | grep -q 'upstream-artifact' && sed -n '/## \[Unreleased\]/,/## \[V4.0.1\]/p' CHANGELOG.md | grep -q '### Changed' && sed -n '/## \[Unreleased\]/,/## \[V4.0.1\]/p' CHANGELOG.md | grep -q '120-121' && grep -c '^## \[' CHANGELOG.md` → the four greps exit 0 and the section count is unchanged from before the edit
- **Context:** `CLAUDE.md`'s Release Notes section makes `## [Unreleased]` the holding area for anything merged since the last tag, so an entry here is what keeps the next tag's section from having to be reconstructed from git log. It runs in wave 2 because it describes the finished change rather than producing it.

---

## Verification Tasks

- **Assumption:** `.claude/skills/specifier/SKILL.md` and `.claude/skills/epic-planner/SKILL.md` contain no statement that routes a small change, so neither needs an edit. Their frontmatter `description:` lines were verified by grep to name only mission/spec/epic neighbours; their in-body routing lines were reported by a sub-agent and not personally re-read.
- **Verification Step:** `Read` both files and search for any mention of the small-change path, `fact-finder` as a first stage, or a routing table.
- **Pass Condition:** Neither file presents `/fact-finder` as an entry point or routes a small change. If either does, it becomes an additional wave-1 task alongside PLAN-004.

- **Assumption:** `.claude/skills/implement/implementer-prompt.md` and `reviewer-prompt.md` state no pipeline ordering and name no entry point, so neither needs an edit. Reported by a sub-agent; not personally read.
- **Verification Step:** `Read` both files and search for entry-point names and for `upstream-artifact`.
- **Pass Condition:** Neither file names an entry point nor reads `upstream-artifact:`. If either reads that field, it is a fifth reader of the contract and belongs in wave 2 with PLAN-012.

- **Assumption:** `presentation/ORBIT.pptx` is out of scope. A sub-agent reported 11 slides containing stage names; the file is binary and was not opened.
- **Verification Step:** Extract `ppt/slides/slide4.xml` and any slide reported to carry routing, and check whether an entry-point list appears.
- **Pass Condition:** Either the deck carries no entry-point routing, or the user confirms it stays out of scope. This does not block execution — it records what was not covered.

## Acceptance Criteria

Mapped to the feature brief's `## Success Criteria`, in its order.

- [ ] **(Brief 1)** `.claude/skills/change-architect/SKILL.md` specifies a conversation that reaches a Change Brief, and its output template requires a `**Soll source**` entry for `change-type: defect`. *Exercisable end-to-end only by running the skill; what is checkable from the tree is the contract.*
- [ ] **(Brief 2)** `/fact-finder`'s Phase 1 glob set includes `thoughts/shared/changes/` and its work-order table has Change brief rows, so a brief is found without the user naming it. Its `upstream-artifact` description admits a `changes/` path.
- [ ] **(Brief 3)** `/planner` Phase 1 carries a step that stops before writing when `upstream-artifact:` is `none` and the input is not a QA report, and it names `/change-architect`. `:599` reads `once Phase 1 has admitted the run`.
- [ ] **(Brief 4)** The same step exempts QA-sourced runs, keyed on the `### QA Report Detection` test and not on `fact-source:`.
- [ ] **(Brief 5)** All five pipeline-definition locations state the same four entry points and the same small-change ordering. Checkable side by side: `CLAUDE.md`, `.claude/hooks/session-start`, `README.md`, root `AGENTS.md`, and the two routing-table skills.
- [ ] **(Brief 6)** `/implement`'s check 3 tests positively for `thoughts/shared/epics/`, so a plan whose `upstream-artifact:` names a change brief closes out without the epic check and without treating the value as an error.
- [ ] No `thoughts/shared/changes/AGENTS.md` exists, and `thoughts/shared/AGENTS.md` names `changes/` among the directories it governs directly.
- [ ] `thoughts-locator`'s map and answer template both cover ten categories, with headings for `features/` and `changes/`.
- [ ] `CLAUDE.md` cites `thoughts/shared/plans/AGENTS.md:120-121`.
- [ ] `.claude/hooks/session-start` emits valid JSON and its decoded context names `/change-architect`.
- [ ] Slide 4 of `presentation/The_Agentic_Assembly_LineV3.html` has four entry rows, each with an architect and a result box, and slide 3's Ausnahmeregel names three chain-starting skills.
- [ ] `CHANGELOG.md`'s `## [Unreleased]` section records the change; no new version section was created.

A cross-cutting check for Brief 5, runnable from the finished tree:

```bash
for f in CLAUDE.md README.md AGENTS.md .claude/hooks/session-start; do
  printf '%s: ' "$f"; grep -c 'change-architect' "$f"
done
```
Every file must report a non-zero count.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Author the `/change-architect` skill on the entry-point family skeleton
- [ ] PLAN-002: Add the `/planner` Phase 1 admission gate and relativize the always-write rule
- [ ] PLAN-003: Add `changes/` to `/fact-finder`'s work-order set and close the no-work-order branch
- [ ] PLAN-004: Repoint both routing tables and the brownfield redirect script
- [ ] PLAN-005: Update `/prototype`'s four entry-point references and its worktree blocklist
- [ ] PLAN-006: Give `thoughts-locator` ten categories and matching output sections
- [ ] PLAN-007: Add the fourth entry point to the SessionStart hook
- [ ] PLAN-008: Update `CLAUDE.md` pipeline, tables, chain diagram and two citations
- [ ] PLAN-009: Update `README.md` pipeline, tables and chain diagram
- [ ] PLAN-010: Register `changes/` in both governance files, without an `AGENTS.md`
- [ ] PLAN-011: Give the presentation a fourth entry row and split QA out

### Wave 2
- [ ] PLAN-012: Invert `/implement`'s acceptance check to a positive `epics/` test
- [ ] PLAN-013: Record the change under `CHANGELOG.md`'s Unreleased section
