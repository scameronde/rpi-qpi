# Plan-Artifact-Frontmatter Implementation Plan

## Inputs
- Fact report(s) used: `thoughts/shared/facts/2026-07-29-Plan-Artifact-Frontmatter.md`
- Epic / feature brief: `none` (from the fact report's `upstream-artifact: none`)
- User request summary: Plan artifacts get YAML frontmatter, consistent with mission/spec/epic/fact. The user settled two questions before planning: (1) a six-field, chain-conformant plan header (`date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact`); (2) STATE files get a minimal three-field header (`date`, `plan`, `status`) while the four bold-key lines stay untouched, because the resume path reads them.

## Verified Current State

- **Fact:** `planner/SKILL.md` states the absence of plan frontmatter as a positive contract, under a heading that promises the opposite.
- **Evidence:** `.claude/skills/planner/SKILL.md:617-621`
- **Excerpt:**
  ```markdown
  ### Document Frontmatter (In Plan Files)

  Plan files use a specific implementation plan format without traditional frontmatter, focusing on verified facts, evidence, and actionable tasks.
  ```

- **Fact:** The standard plan template opens directly on an H1.
- **Evidence:** `.claude/skills/planner/SKILL.md:633-639`
- **Excerpt:**
  ```markdown
  # [Ticket] Implementation Plan

  ## Inputs
  - Fact report(s) used: `thoughts/shared/facts/...`
  ```

- **Fact:** The QA plan template is a separate block in the same file and opens the same way.
- **Evidence:** `.claude/skills/planner/SKILL.md:713-717`
- **Excerpt:**
  ```markdown
  # QA Implementation Plan: [Target]

  ## Inputs
  - QA report: `thoughts/shared/qa/YYYY-MM-DD-[Target]-[Lens].md` (one entry per loaded QA skill)
  ```

- **Fact:** The STATE template is four bold-key lines under an H1, and the resume path reads exactly those lines.
- **Evidence:** `.claude/skills/planner/SKILL.md:864-870`
- **Excerpt:**
  ```markdown
  # State: [Ticket Name]

  **Plan**: thoughts/shared/plans/YYYY-MM-DD-[Ticket].md
  **Current Wave**: 1
  **Current Task**: PLAN-001
  **Completed Tasks**: (none yet)
  ```

- **Fact:** `/implement` reads the plan whole, then extracts task fields and `##` headings. No instruction is anchored to the first line or to "before the first heading".
- **Evidence:** `.claude/skills/implement/SKILL.md:33-36`
- **Excerpt:**
  ```markdown
  2. Read the plan file in full.
  3. Extract ALL task IDs, names, `File(s)`, `allowedAdjacentEdits`, and (if present) `Wave:` / `Model:` / `Verify:` fields upfront — do not read task-by-task. If the plan has an `## Execution Waves` table, read it instead of deriving waves yourself.
  4. Locate the STATE file: same path as the plan file with `.md` replaced by `-STATE.md`
  ```

- **Fact:** `/implement` writes the STATE terminal state in one place, and writes only `**Current Task**`.
- **Evidence:** `.claude/skills/implement/SKILL.md:240`
- **Excerpt:**
  ```markdown
  Set the STATE file's `**Current Task**` to `Complete` **only after** all applicable checks pass. A plan whose acceptance criteria do not all hold is a plan that did not finish — extend the work or escalate.
  ```
- **Direct consequence for this plan:** a STATE `status:` field with values `in-progress | complete` has no writer unless this line is extended. Without that, the field is born stale on every run — which is why PLAN-004 is not optional to the STATE half of the user's decision.

- **Fact:** `thoughts/shared/plans/AGENTS.md` is a second full statement of the plan contract, not a pointer, and it prescribes a different H1 than `planner/SKILL.md` does.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:19-24`
- **Excerpt:**
  ```markdown
  **Plan document structure** (`.claude/skills/planner/SKILL.md` is the canonical template — read it there before writing a plan):

  ```markdown
  # Plan: <title>

  ## Inputs                        # fact report(s) used, epic / feature brief (or `none`), user request summary
  ```

- **Fact:** `plans/AGENTS.md` carries the validation rules a plan is checked against.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:96-99`
- **Excerpt:**
  ```markdown
  ## Verification

  - A valid plan has at least one task block with an `**Action ID:** PLAN-NNN`
  - Every task carries `File(s):`, `Instruction:`, `Done When:` and `Verify:` — these four are required
  ```

- **Fact:** `CLAUDE.md` and `README.md` each restate the plan format; the four-reader rule they state is about the **task field list**, not the document header.
- **Evidence:** `CLAUDE.md:168`
- **Excerpt:**
  ```markdown
  Its field list (`Wave:`, `Model:`, `Change Type:`, `File(s):`, `allowedAdjacentEdits:`, `Instruction:`, `Evidence:`, `Done When:`, `Verify:`, `Context:`) is **a contract with four readers**: `planner/SKILL.md`, `implement/SKILL.md`, and both prompt templates in `.claude/skills/implement/` (`implementer-prompt.md`, `reviewer-prompt.md`).
  ```

- **Fact:** Both prompt templates take pasted **task** content and never see the document header.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:11` and `.claude/skills/implement/reviewer-prompt.md:11`
- **Excerpt:**
  ```markdown
  [PASTE FULL TASK CONTENT HERE — include: Instruction, File(s), Evidence, Done When, Verify, Context, and allowedAdjacentEdits if any. Omitting Verify leaves step 4 below unperformable.]
  ```
- **Direct consequence for this plan:** the two prompt templates are **not** in this plan's file set. The four-reader contract governs task fields; a document header adds no placeholder to either template. The fact report listed them as candidates; Phase 2 verification removes them.

- **Fact:** Every implementer subagent is instructed to walk the DOX chain from the repo root, which begins at `CLAUDE.md`.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:21`
- **Excerpt:**
  ```markdown
  1. **Check local governance**: For each path in the task's **File(s)** field, walk from the repository root to that file's directory and read any `AGENTS.md` files found along the route. The nearest `AGENTS.md` is your local contract; parents supply broader rules.
  ```
- **Direct consequence for this plan:** the task that rewrites `CLAUDE.md` must not run in the same wave as any other task, or a concurrent implementer reads its governance contract mid-rewrite. This drives the wave split below; it is a read-collision, which the disjointness rule does not catch.

## Inherited Constraints (Respected)

None. The fact report's `## Inherited Constraints (Treated as Fixed)` section read `None` — there was no upstream epic or feature brief.

## Goals / Non-Goals

**Goals:**
- Plan files carry the six-field header the user settled on; the QA plan variant carries the same fields with QA-appropriate values.
- STATE files carry the three-field header, with the four bold-key lines untouched.
- `/implement` acquires a writer for the new STATE `status:` field, so it cannot be born stale.
- The two normative statements of the plan document structure (`planner/SKILL.md`, `plans/AGENTS.md`) agree on the H1 line as well as the header — the fact report found them contradicting each other at exactly the lines this plan edits.
- `/implement` reads the epic path from the plan's `upstream-artifact:` header field, closing the provenance chain that today stops at the fact report.

**Non-Goals:**
- **No migration of existing artifacts.** The 43 plans and 41 STATE files in `thoughts/shared/plans/` are write-once and stay as they are.
- **No backward compatibility.** Decided by the user at the Approval Gate. This plan adds no tolerance statement for headerless plans, no legacy exemption in the validation rules, and no `## Inputs` fallback when `upstream-artifact:` is absent. **Consequence, accepted knowingly:** the 43 existing plans do not satisfy the new validation rules, and re-running `/implement` against one of them would find no `upstream-artifact:` field at the epic-lookup step. All of them have STATE files and are closed, so this affects re-runs only.
- **`CLAUDE.md` and `README.md` are a deliberate follow-up.** Decided by the user at the Approval Gate. **Consequence, accepted knowingly:** on completion of this plan both files describe a plan format that no longer matches the canonical one — exactly the duplication drift `CLAUDE.md:73-84` warns about. The follow-up edit is specified in this plan's `## Deferred Follow-Up` section so it does not have to be re-derived.
- **No `message_type:` field.** The user chose the six-field set without one, so QA-plan detection stays as it is (see Approval Gate).
- **No change to the task field list.** `Wave:`, `Model:`, `File(s):` and the rest are untouched; this plan adds a document header only.
- **No change to the two `/implement` prompt templates.** Verified in Phase 2 — they never see the document header.
- **No V4 anticipation.** No `id:`, `refines:` or content-hash field. The V4 drafts define no plan header at all and place plans outside the bundle their convention governs (`ORBIT-V4-CONCEPT.md:89-92`).

## Approval Gate

This plan hit **two** of the four triggers. Both were presented to the user on 2026-07-30 and both are **resolved**; the resolutions are recorded here and are already reflected in the tasks below.

**1. It changes a contract with more than one reader.** The plan document format is written by `/planner`, read by `/implement`, stated normatively a second time in `thoughts/shared/plans/AGENTS.md`, and mirrored in `CLAUDE.md` and `README.md`.

> **Question:** The header lands in all five files in one run. Confirm you want the mirrors (`CLAUDE.md`, `README.md`) updated in the same plan rather than left for a follow-up.
>
> **Resolved — follow-up.** The mirrors are out of scope for this plan. The task that carried them was removed and its content preserved in `## Deferred Follow-Up`. Accepted consequence recorded under Non-Goals.

**2. It edits files defining the executing orchestrator's own behaviour.** PLAN-003 edits `.claude/skills/implement/SKILL.md` — the file `/implement` is running from — and PLAN-001 edits `.claude/skills/planner/SKILL.md`, which `/implement` reads during a run whenever a STATE file is missing (`implement/SKILL.md:51-53`). This plan has a STATE file, so that path will not fire, but the trigger is a file-identity rule, not a likelihood judgement.

> **Question:** Confirm the `implement/SKILL.md` task runs — its `status:`-writer half is load-bearing, because without it the new STATE field never changes value.
>
> **Resolved — confirmed.** The task runs, renumbered PLAN-003, in its own wave and last.

**Third question, not a gate trigger but a design fork the fact report left open:**

> `implement/SKILL.md:238` reads the epic path out of the plan's `## Inputs` **body** section, while `/planner` one stage earlier reads `upstream-artifact:` out of **frontmatter** (`planner/SKILL.md:479`).
>
> **Resolved — fold it in.** `:238` switches to the header field. Combined with the user's separate decision that backward compatibility is not required, it reads `upstream-artifact:` outright, with **no** fallback to the `## Inputs` body. This is now step 2 of PLAN-003.

**Fourth decision, volunteered by the user rather than asked for:** backward compatibility is not required. Every tolerance clause this plan originally carried for headerless plans and headerless STATE files is removed — from PLAN-002's validation rules and from PLAN-003's instruction. Accepted consequence recorded under Non-Goals.

`:237` ("If the plan is a QA plan") stays a heuristic on the `## Baseline Verification` heading either way — the chosen field set has no `message_type:`, so there is nothing to detect.

## Design Overview

- One canonical authoring site (`planner/SKILL.md`) gains three header blocks: standard plan, QA plan, STATE.
- One mirror-with-validation site (`plans/AGENTS.md`) gains the same blocks plus two validation bullets, and drops its contradictory H1.
- Two prose mirrors (`CLAUDE.md`, `README.md`) gain a description of the header.
- One consumer (`implement/SKILL.md`) gains a `status:` write at the existing terminal-state line, and a stated tolerance for headerless plans.
- Field semantics, fixed for all writers:
  - `date` — plan creation date, `YYYY-MM-DD`, matching the filename.
  - `planner` — identifier of the model or skill run that wrote it, mirroring `fact-finder:` in fact reports.
  - `ticket` — the `[Ticket]` value used in the filename and the H1.
  - `status` — `complete` on creation; `superseded` when a later plan replaces it. This matches the mission/spec/feature vocabulary. It describes the **document**, not the run; run progress stays in STATE.
  - `fact-source` — path of the fact report the plan was built from; for a QA plan, the QA report path.
  - `upstream-artifact` — copied verbatim from the fact report's own `upstream-artifact:`, or `none`.
- STATE field semantics: `plan` duplicates the `**Plan**:` bold-key line by design, and the header field exists so the file is self-describing to a frontmatter reader. `status` is `in-progress` at creation and flipped to `complete` by `/implement` at the same point it writes `**Current Task**: Complete`.

  > **Corrected during execution (2026-07-30).** This bullet originally justified keeping the bold key by claiming `/implement`'s resume path reads `**Plan**:`. It does not — Pre-Flight step 4 reads `**Current Wave**`, `**Current Task**` and `**Completed Tasks**`, and a repo-wide grep finds no reader of `**Plan**:` at all. PLAN-001's instruction repeated the false rationale; the implementer refused to write it and substituted a true one, which the orchestrator verified and accepted. The rule itself was never in doubt — the bold key stays because it is the back-pointer in the body format `/implement` reads STATE through — only the stated reason was wrong. Recorded here so the error is not mirrored by anyone reading this plan as a template.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002 | `.claude/skills/planner/SKILL.md`, `thoughts/shared/plans/AGENTS.md` | Disjoint files, no dependency. Neither implementer reads a file the other writes. |
| 2 | PLAN-003 | `.claude/skills/implement/SKILL.md` | Runs alone and last. It edits the orchestrator's own instruction file, and `CLAUDE.md` forbids changing the rules under a running plan; keeping it after wave 1 means no implementer is dispatched while its own orchestration contract is being rewritten. |

Tasks in the same wave run concurrently. No path appears twice within a wave.

## Implementation Instructions (For Implementor)

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** opus
- **Change Type:** modify
- **File(s):** `.claude/skills/planner/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. **Invert the frontmatter section at lines 617-621.** The heading `### Document Frontmatter (In Plan Files)` stays. Replace the body so it states that plan files carry YAML frontmatter, shows the six-field block below, and defines each field's meaning per the plan's `## Design Overview`. Delete the sentence beginning "Plan files use a specific implementation plan format without traditional frontmatter" — it must not survive anywhere in the file. Keep the existing pointer to the Output Format section.
  2. **Add the block to the standard plan template.** In the fenced template that currently begins `# [Ticket] Implementation Plan` (line 634), insert the six-field block above that H1, inside the fence.
  3. **Add the block to the QA plan template.** In the fenced template that currently begins `# QA Implementation Plan: [Target]` (line 714), insert the same six fields above that H1, with QA values: `ticket: "[Target]"` and `fact-source: "thoughts/shared/qa/YYYY-MM-DD-[Target]-[Lens].md"`. Add a one-line note that `fact-source` holds the QA report here, and that `upstream-artifact` is copied from that report's own field.
  4. **Add the STATE block.** In the fenced STATE template at line 864, insert the three-field block above `# State: [Ticket Name]`. Immediately after the fence, state that `**Plan**:` is deliberately duplicated by the header's `plan:` field — the bold key stays because `/implement`'s resume path reads it — and that `status:` starts at `in-progress` and is flipped to `complete` by `/implement` after its final-wave acceptance checks.
  5. Do not touch the task field list, the wave rules, or Phase 2b/2c. This change is document-header only.
- **Interfaces / Pseudocode:**
  Standard plan header:
  ```yaml
  ---
  date: YYYY-MM-DD
  planner: [identifier]
  ticket: "[Ticket]"
  status: complete | superseded
  fact-source: "thoughts/shared/facts/YYYY-MM-DD-[Topic].md"
  upstream-artifact: [path or none]
  ---
  ```
  STATE header:
  ```yaml
  ---
  date: YYYY-MM-DD
  plan: "thoughts/shared/plans/YYYY-MM-DD-[Ticket].md"
  status: in-progress | complete
  ---
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:617-621`
- **Excerpt:**
  ```markdown
  ### Document Frontmatter (In Plan Files)

  Plan files use a specific implementation plan format without traditional frontmatter, focusing on verified facts, evidence, and actionable tasks.
  ```
- **Done When:** `planner/SKILL.md` contains no claim that plan files lack frontmatter; the standard plan template, the QA plan template and the STATE template each open with their prescribed YAML block inside the fence; and the section at 617-621 defines all six plan fields and all three STATE fields.
- **Verify:** none — requires review. (Three of the five edits are mechanical block insertions, but edit 1 is new normative prose that must not contradict the rest of a 900-line contract file. A grep would confirm the blocks landed while saying nothing about whether the paragraph still makes sense.)
- **Context:** This file is the canonical authoring site. Everything else in this plan mirrors what lands here, so its wording is what the other three files must be consistent with. The section currently promises frontmatter in its heading and denies it in its body — a reader following the heading finds the opposite of what it names.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `thoughts/shared/plans/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In the **Plan document structure** block (lines 19-35), insert the six-field plan header above the H1 line, inside the fence.
  2. In that same block, change the H1 from `# Plan: <title>` to `# [Ticket] Implementation Plan`, matching `planner/SKILL.md:634`. The two files currently prescribe different first lines; this aligns them.
  3. In the **STATE file format** block (lines 61-83), insert the three-field STATE header above `# State: [Ticket Name]`, inside the fence.
  4. In the **Update cadence** paragraph, add that `/implement` flips the STATE header's `status:` from `in-progress` to `complete` at the same point it writes `**Current Task**: Complete`.
  5. In the **Verification** section, add two bullets: a valid plan's frontmatter carries all six keys (`date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact`); a valid STATE file's frontmatter carries all three (`date`, `plan`, `status`). Add **no** exemption for headerless plans — the user decided backward compatibility is not required, so the rules read as unconditional. Leave the file's existing sentence about older plans predating `Wave:`, `Model:` and `Verify:` untouched: that one is about task fields, not the document header, and is not in this plan's scope.
- **Interfaces / Pseudocode:** the two YAML blocks are given verbatim in PLAN-001's `Interfaces / Pseudocode`. Use them unchanged.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:96-99`
- **Excerpt:**
  ```markdown
  ## Verification

  - A valid plan has at least one task block with an `**Action ID:** PLAN-NNN`
  - Every task carries `File(s):`, `Instruction:`, `Done When:` and `Verify:` — these four are required
  ```
- **Done When:** Both fenced templates in `plans/AGENTS.md` show their YAML header; the plan block's H1 reads `# [Ticket] Implementation Plan`; the Verification section names all six plan keys and all three STATE keys as unconditional requirements; the update-cadence paragraph mentions the `status:` flip.
- **Verify:** `grep -q '^fact-source: "thoughts/shared/facts/' thoughts/shared/plans/AGENTS.md && grep -q '^plan: "thoughts/shared/plans/' thoughts/shared/plans/AGENTS.md && grep -q '^# \[Ticket\] Implementation Plan' thoughts/shared/plans/AGENTS.md && ! grep -q '^# Plan: <title>' thoughts/shared/plans/AGENTS.md` → exit 0
- **Context:** This is the DOX contract an implementer reads before touching anything in `thoughts/shared/plans/`, and it carries the validation rules a plan is checked against. A header that exists in the skill but not here means the governance file certifies plans as valid without ever looking at their header. The H1 divergence is fixed in the same pass because it is the line directly below the block being inserted.

---

- **Action ID:** PLAN-003
- **Wave:** 2
- **Model:** opus
- **Change Type:** modify
- **File(s):** `.claude/skills/implement/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. **Give the STATE `status:` field a writer.** At line 240 — the sentence setting `**Current Task**` to `Complete` after the acceptance checks — extend the instruction so the same write also sets the STATE frontmatter's `status:` to `complete`. Keep the existing precondition intact: both writes happen only after all applicable checks pass.
  2. **Switch the epic lookup to the header field.** Line 238 currently reads the epic path out of the plan's `## Inputs` body section. Change it to read the plan's `upstream-artifact:` frontmatter field instead, and to treat the literal `none` as "there is no epic — skip this check", mirroring how `/planner` handles the same field at `planner/SKILL.md:481`. Write **no** fallback to the `## Inputs` body: the user decided backward compatibility is not required.
  3. Do not change the field-extraction step (line 34), the wave rules, the Boundary Check, or the review gate. **Do not touch line 237** — QA-plan detection stays a heuristic on the `## Baseline Verification` heading, because the chosen header has no `message_type:` field to detect.
- **Evidence:** `.claude/skills/implement/SKILL.md:236-240`
- **Excerpt:**
  ```markdown
  2. **If the plan is a QA plan,** run the plan's `## Baseline Verification` command block and report the output.
  3. **If the plan's `## Inputs` cites an epic,** carry out the epic's `## Verification Plan (For Implementor)` section and report the result.

  Set the STATE file's `**Current Task**` to `Complete` **only after** all applicable checks pass. A plan whose acceptance criteria do not all hold is a plan that did not finish — extend the work or escalate.
  ```
- **Done When:** `implement/SKILL.md` writes the STATE header's `status: complete` alongside `**Current Task**: Complete`; its epic-lookup step reads the plan's `upstream-artifact:` frontmatter field and skips the check on the value `none`; line 237 is unchanged.
- **Verify:** none — requires review. (Prose edits to the orchestrator's own instruction file, where the risk is a sentence contradicting a neighbouring rule rather than a missing string. Two of the three requirements are negative — no fallback written, line 237 untouched — and a grep cannot establish a negative.)
- **Context:** Step 1 is load-bearing: without it the STATE `status:` field has no writer at all, so the planner would stamp `in-progress` at creation and nothing would ever change it — every finished run would leave a STATE file claiming to be in progress. Step 2 closes the provenance chain the fact report found broken at its last link: `/planner` already reads `upstream-artifact:` from frontmatter one stage earlier (`planner/SKILL.md:479`), and after this the same field carries through to `/implement` instead of being re-derived from prose.

## Verification Tasks (If Assumptions Exist)

None. Every task cites a line range read during Phase 2. The two candidate files the fact report flagged but Phase 2 removed — `implementer-prompt.md` and `reviewer-prompt.md` — were both read in full and confirmed to consume pasted task fields only.

## Acceptance Criteria

- `grep -r "without traditional frontmatter" .claude/` returns nothing.
- `.claude/skills/planner/SKILL.md` shows the six-field header in both the standard and the QA plan template, and the three-field header in the STATE template, each inside its fence and above its H1.
- `thoughts/shared/plans/AGENTS.md` shows both headers, prescribes `# [Ticket] Implementation Plan` as the plan H1, and its `## Verification` section requires all six plan keys and all three STATE keys unconditionally.
- The plan H1 prescribed by `planner/SKILL.md` and by `plans/AGENTS.md` is the same string.
- `.claude/skills/implement/SKILL.md` writes the STATE header's `status: complete` at the same point it writes `**Current Task**: Complete`.
- `.claude/skills/implement/SKILL.md`'s epic-lookup step reads `upstream-artifact:` from the plan's frontmatter, with no `## Inputs` body fallback, and skips the check when the value is `none`.
- `.claude/skills/implement/SKILL.md:237` (QA-plan detection) is unchanged.
- `CLAUDE.md` and `README.md` are untouched by this plan — they are the deferred follow-up, and a diff showing changes to either means the scope decision was ignored.
- No file under `thoughts/shared/plans/` other than this plan's own STATE file was modified — existing plans are write-once and this plan migrates nothing.

## Deferred Follow-Up

Not part of this plan. Recorded so the follow-up does not have to be re-derived, and so the gap is visible to the next session rather than being discovered as drift.

`CLAUDE.md` (`## Plan File Format`, section starts at line 166) and `README.md` (`## Plan File Format`, section starts at line 155) each need a short paragraph stating that a plan file opens with YAML frontmatter carrying `date`, `planner`, `ticket`, `status`, `fact-source` and `upstream-artifact`, and that its STATE sibling carries `date`, `plan` and `status`.

One trap to carry forward: **do not add the header fields to the four-reader sentence** (`CLAUDE.md:168`, `README.md:173`). That contract governs the *task field list*, and both `/implement` prompt templates — two of its four readers — never see the document header. Phase 2 of this plan verified that by reading both templates in full.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Invert the frontmatter section and add three header blocks to planner/SKILL.md
- [ ] PLAN-002: Mirror both headers into plans/AGENTS.md, align the H1, add validation rules

### Wave 2
- [ ] PLAN-003: Write the STATE status field and switch the epic lookup to the header in implement/SKILL.md
