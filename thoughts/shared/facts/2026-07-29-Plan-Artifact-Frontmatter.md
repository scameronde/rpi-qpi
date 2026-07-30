---
date: 2026-07-29
fact-finder: claude-opus-5
topic: "Plan Artifact Frontmatter"
status: complete
upstream-artifact: none
coverage:
  - .claude/skills/planner/SKILL.md (plan template, STATE template, Phase 1 ingestion)
  - .claude/skills/implement/SKILL.md, implementer-prompt.md, reviewer-prompt.md (all plan readers)
  - .claude/skills/{mission-architect,specifier,feature-architect,epic-planner,fact-finder,prototype}/SKILL.md (frontmatter templates)
  - .claude/skills/{clean-code,python-qa,typescript-qa,logic-bugs-qa}/SKILL.md (QA report templates)
  - .claude/agents/thoughts-locator.md, thoughts-analyzer.md (document discovery)
  - CLAUDE.md, README.md, thoughts/shared/AGENTS.md, thoughts/shared/plans/AGENTS.md
  - thoughts/shared/{missions,features,specs,epics,facts,plans,qa,prototypes}/ (133 artifact files classified by header style)
  - ORBIT-V4-CONCEPT.md, ORBIT-V4-OKF-CONVENTION.md (draft header and hash model)
---

# Research: Plan Artifact Frontmatter

## Executive Summary

- Plan files carry no YAML frontmatter, and `.claude/skills/planner/SKILL.md:617-621` states that absence as a positive contract under a heading literally named `### Document Frontmatter (In Plan Files)`.
- No reader anywhere parses a plan's document-level metadata. Every read `/implement` performs is a filename operation, a `##` section heading, or a literal task-field string — all of them below the plan's first `#` heading.
- Adding a frontmatter block would therefore break no existing reader, and would be read by none either.
- Every other pipeline artifact template mandates frontmatter carrying `date` and `status`; the plan and its STATE sibling are the only two artifact types where the templates mandate none.
- On disk, 81 of 84 files in `plans/` are headerless (conforming); one plan and its STATE sibling carry a `snake_case` YAML block matching no template.
- Two `/implement` branches currently source information the frontmatter of other artifact types would carry: the QA-plan branch (`implement/SKILL.md:237`) has no stated detection rule at all, and the epic lookup (`:238`) reads a body section rather than a header field, unlike `/planner`, which reads `upstream-artifact:` out of frontmatter (`planner/SKILL.md:479`).
- The plan format is stated in full in two normative places and mirrored in two more; the V4 drafts define no plan header and place plans outside the bundle their frontmatter convention governs.

## Coverage Map

Inspected personally with `Read`:

- `.claude/skills/planner/SKILL.md` — lines 475-486, 605-674, 855-894
- `.claude/skills/implement/SKILL.md` — lines 28-57, 232-245
- `.claude/skills/epic-planner/SKILL.md` — lines 250-259
- `.claude/agents/thoughts-locator.md` — lines 60-74
- `CLAUDE.md` — lines 160-179
- `README.md` — lines 150-177
- `ORBIT-V4-CONCEPT.md` — lines 78-127
- `thoughts/shared/AGENTS.md` — lines 20-49
- `thoughts/shared/plans/AGENTS.md` — full file
- `thoughts/shared/plans/2026-02-06-Generalize-QA-Language-References.md` — lines 1-16

Inspected via sub-agent with excerpts (see Verification Log for the ones not personally re-read): the remaining skill templates, the two `implement/` prompt templates, `ORBIT-V4-OKF-CONVENTION.md`, and the file-by-file header classification of all eight `thoughts/shared/` artifact directories.

Not inspected: `dist/` (absent from the tree per `CLAUDE.md`), `thoughts/projects/`, `presentation/`.

## Inherited Constraints (Treated as Fixed)

None. There was no upstream epic or feature brief — the user named the target directly.

## Critical Findings (Verified, Planner Attention Required)

### 1. The absence of plan frontmatter is a stated contract, not an omission

- **Observation:** `planner/SKILL.md` has a section headed `### Document Frontmatter (In Plan Files)` whose entire content declares that there is none.
- **Direct consequence:** Adding frontmatter to plans is an edit to a positive statement, not the filling of a gap. The heading and its body both change, or the file states two contradictory things.
- **Evidence:** `.claude/skills/planner/SKILL.md:617-621`
- **Excerpt:**
  ```markdown
  ### Document Frontmatter (In Plan Files)

  Plan files use a specific implementation plan format without traditional frontmatter, focusing on verified facts, evidence, and actionable tasks.

  When writing plan files, use the implementation plan structure shown in the Output Format section below.
  ```

### 2. Nothing reads a plan's document-level metadata

- **Observation:** `/implement`'s Pre-Flight reads the plan whole, then extracts named task fields and named `##` sections. The plan file's path arrives from the user; there is no glob, no "latest file" rule, and no header parse anywhere in the skill.
- **Direct consequence:** A frontmatter block added at the top of a plan would enter the orchestrator's context (step 2 is a whole-file read) and be consumed by nothing. No instruction in `implement/SKILL.md` is anchored to "the first line" or "before the first heading", so none would misfire.
- **Evidence:** `.claude/skills/implement/SKILL.md:33-36`
- **Excerpt:**
  ```markdown
  2. Read the plan file in full.
  3. Extract ALL task IDs, names, `File(s)`, `allowedAdjacentEdits`, and (if present) `Wave:` / `Model:` / `Verify:` fields upfront — do not read task-by-task. If the plan has an `## Execution Waves` table, read it instead of deriving waves yourself.
  4. Locate the STATE file: same path as the plan file with `.md` replaced by `-STATE.md`
     (per `thoughts/shared/plans/AGENTS.md` naming convention). Read it.
  ```

- **Observation:** No subagent ever opens the plan file; the orchestrator pastes task text into the prompt templates.
- **Direct consequence:** Any header field can reach an implementer or reviewer only if the orchestrator retypes it into a placeholder. Neither template has a placeholder for one.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:11` (sub-agent excerpt)
- **Excerpt:**
  ```markdown
  [PASTE FULL TASK CONTENT HERE — include: Instruction, File(s), Evidence, Done When, Verify, Context, and allowedAdjacentEdits if any. Omitting Verify leaves step 4 below unperformable.]
  ```

### 3. Two `/implement` branches read what other artifact types put in frontmatter

- **Observation:** The post-run acceptance step has a QA-plan branch with no stated detection rule, and sources the epic path from the plan's `## Inputs` body section.
- **Direct consequence:** The only discriminator available to `/implement` for "is this a QA plan" is the presence of the `## Baseline Verification` heading it is about to run. The epic association survives only as prose inside a body section.
- **Evidence:** `.claude/skills/implement/SKILL.md:236-238`
- **Excerpt:**
  ```markdown
  1. **Read the plan's `## Acceptance Criteria` section.** Confirm each item holds in the working tree. For each criterion, name the evidence (output of a command, a code location, or both). Report any criterion that does not hold rather than closing the run.
  2. **If the plan is a QA plan,** run the plan's `## Baseline Verification` command block and report the output.
  3. **If the plan's `## Inputs` cites an epic,** carry out the epic's `## Verification Plan (For Implementor)` section and report the result.
  ```

- **Observation:** The equivalent lookup one stage upstream is a frontmatter read, and the skill states why the filename cannot substitute for it.
- **Direct consequence:** Frontmatter-based upstream lookup already exists in this pipeline; it stops at the fact report.
- **Evidence:** `.claude/skills/planner/SKILL.md:479-481`
- **Excerpt:**
  ```markdown
  3. **Read the work order the fact report was written for.** Take its path from the fact report's `upstream-artifact:` frontmatter field and `Read` that file — an epic in `thoughts/shared/epics/` or a feature brief in `thoughts/shared/features/`.
     - **Do not glob `epics/` to find it.** A fact report is named after its research topic, not after the epic (`epic-planner:228`), so the association cannot be recovered from the filename — a guess silently attaches the wrong epic, and every criterion and constraint you then plan against belongs to a different piece of work.
  ```

### 4. Plan lifecycle state lives outside the plan, in a different notation

- **Observation:** Every other artifact template carries `status:` in frontmatter. A plan's progress lives in its STATE sibling as bold-key prose, and its terminal value is `Complete`.
- **Direct consequence:** The value set that every other artifact shares (`complete`, `superseded`, `ready-for-research`) has no plan counterpart, and `superseded` has no representation for a plan at all. Determining whether a plan is finished requires opening a second file.
- **Evidence:** `.claude/skills/planner/SKILL.md:864-870`
- **Excerpt:**
  ```markdown
  # State: [Ticket Name]

  **Plan**: thoughts/shared/plans/YYYY-MM-DD-[Ticket].md
  **Current Wave**: 1
  **Current Task**: PLAN-001
  **Completed Tasks**: (none yet)
  ```

- **Observation:** The STATE file is explicitly kept free of anything the plan already holds, on a size argument.
- **Direct consequence:** The ~40-line budget is a stated constraint on what STATE may carry.
- **Evidence:** `.claude/skills/planner/SKILL.md:894`
- **Excerpt:**
  ```markdown
  **STATE carries no copy of the `Verify:` commands** — the plan is the only place they live, so STATE cannot drift from it. Nothing reads a copy here: `/implement`'s step 5 opens STATE only to tick checklist lines and advance `Completed Tasks`, `Current Task` and `Current Wave`, and a duplicate would compete for the same ~40-line budget as the checklist, which the resume path does read.
  ```

### 5. Backward compatibility is keyed on field absence, with no version marker

- **Observation:** `/implement` has five branches that detect older plans and STATE files by which fields are missing: `Wave:` (`:83`), `Model:` (`:248`), `Verify:` (`:173`), `**Current Wave**` (`:41`, `:211`), and a heuristic for per-wave STATE granularity.
- **Direct consequence:** There is no field anywhere in either document that names a format version, so every future format change is detected the same way — by absence.
- **Evidence:** `.claude/skills/implement/SKILL.md:44-47`
- **Excerpt:**
  ```markdown
       (On a STATE file written before that rule the granularity is per-wave —
       you cannot tell which of that wave's tasks finished, so re-run the entire wave.
       A file whose `**Completed Tasks**` ends on a wave boundary while `**Current
       Task**` names that wave's first task is the older kind.)
  ```

### 6. The plan format is stated normatively twice and mirrored twice

- **Observation:** `planner/SKILL.md` and `thoughts/shared/plans/AGENTS.md` each state the full contract; `CLAUDE.md` and `README.md` restate the field list. The four-reader rule is itself written down in four places.
- **Direct consequence:** A header change touches at least these four files plus the two `implement/` prompt templates, and no tooling keeps them in sync.
- **Evidence:** `CLAUDE.md:168`
- **Excerpt:**
  ```markdown
  `.claude/skills/planner/SKILL.md` holds the canonical task template — read it there rather than reproducing it. Its field list (`Wave:`, `Model:`, `Change Type:`, `File(s):`, `allowedAdjacentEdits:`, `Instruction:`, `Evidence:`, `Done When:`, `Verify:`, `Context:`) is **a contract with four readers**: `planner/SKILL.md`, `implement/SKILL.md`, and both prompt templates in `.claude/skills/implement/` (`implementer-prompt.md`, `reviewer-prompt.md`).
  ```

- **Observation:** The two normative statements of the plan skeleton already differ in the H1 line.
- **Direct consequence:** `plans/AGENTS.md` prescribes `# Plan: <title>`; `planner/SKILL.md` prescribes `# [Ticket] Implementation Plan`; the newest live plan uses the latter form. The document's first line is already stated two ways.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:21-24` and `.claude/skills/planner/SKILL.md:633-636`
- **Excerpt (AGENTS.md):**
  ```markdown
  # Plan: <title>

  ## Inputs                        # fact report(s) used, epic / feature brief (or `none`), user request summary
  ```
- **Excerpt (planner/SKILL.md):**
  ```markdown
  # [Ticket] Implementation Plan

  ## Inputs
  - Fact report(s) used: `thoughts/shared/facts/...`
  ```

### 7. Globbing `plans/` hits STATE files, and discovery reads only five lines

- **Observation:** `epic-planner/SKILL.md` warns that the natural glob for plans also matches STATE siblings. `thoughts-locator` verifies a document by reading its first five lines.
- **Direct consequence:** Any header placed on plans would be encountered by `thoughts-locator` inside a five-line window, and any directory-wide header convention meets 41 STATE files alongside 43 plans.
- **Evidence:** `.claude/skills/epic-planner/SKILL.md:255`
- **Excerpt:**
  ```markdown
  **Output Expected**: Implementation plan(s) in `thoughts/shared/plans/YYYY-MM-DD-[Topic].md`, each with a `-STATE.md` sibling. Do not glob `-*.md` for plans — that pattern also matches the STATE files.
  ```
- **Evidence:** `.claude/agents/thoughts-locator.md:68`
- **Excerpt:**
  ```markdown
  2.  **Verify**: Use `Read` with a limit of 5 lines to check title/metadata.
  ```

## Detailed Technical Analysis (Verified)

### The mandated frontmatter of every other artifact type

Field lists as the templates state them (sub-agent excerpts, spot-checked against `mission-architect/SKILL.md:149-154`, `specifier/SKILL.md:138-144`, `epic-planner/SKILL.md:157-164`, `fact-finder/SKILL.md:612-622`):

| Artifact | Template location | Fields |
|---|---|---|
| Mission | `mission-architect/SKILL.md:149-154` | `date`, `project-name`, `type`, `status` |
| Spec | `specifier/SKILL.md:138-144` | `date`, `mission-source`, `project-name`, `type`, `status` |
| Feature brief | `feature-architect/SKILL.md:132-140` | `date`, `feature-architect`, `mission-source`, `spec-source`, `feature-name`, `type`, `status` |
| Epic | `epic-planner/SKILL.md:157-164` | `date`, `spec-source`, `epic-name`, `epic-id`, `status`, `dependencies` |
| Fact report | `fact-finder/SKILL.md:612-622` (stated twice; again at `:643-651`) | `date`, `fact-finder`, `topic`, `status`, `upstream-artifact`, `coverage` |
| QA report | `clean-code/SKILL.md:449-455` + 3 siblings | `date`, `message_type`, `target`, `status`, `upstream-artifact` |
| Prototype note | `prototype/SKILL.md:93-99` | `date`, `message_type`, `topic`, `decision`, `status` |
| **Plan** | `planner/SKILL.md:617-621` | **none, by contract** |
| **STATE** | `planner/SKILL.md:864-870` | **none — four bold-key prose lines** |

`status` is the only field present in all eight frontmatter templates; `date` is in all eight. The value vocabulary is not shared: `complete | superseded` (mission, spec, feature), `ready-for-research | superseded` (epic), `complete` (fact, QA, prototype).

The `*-source:` chain as templated runs `mission → spec (mission-source) → epic (spec-source) → fact report (upstream-artifact) → plan (nothing)`. Only `upstream-artifact` is declared a machine-read contract, at `fact-finder/SKILL.md:624` and consumed at `planner/SKILL.md:479`.

Three artifact directories restate their template verbatim in an `AGENTS.md`: `facts/AGENTS.md:15-26`, `qa/AGENTS.md:17-26` (with a five-key validation line at `:47`), `prototypes/AGENTS.md:15-24`. `plans/AGENTS.md:19-35` mirrors the headerless structure instead. `missions/`, `specs/`, `features/` and `epics/` have no `AGENTS.md`.

### Header style of the artifacts on disk

Classification of all 133 non-`AGENTS.md` files in `thoughts/shared/` (sub-agent counts):

| Directory | Artifact files | YAML frontmatter | prose `## Metadata` | no header |
|---|---|---|---|---|
| `missions/` | 0 | 0 | 0 | 0 |
| `features/` | 2 | 2 | 0 | 0 |
| `specs/` | 0 | 0 | 0 | 0 |
| `epics/` | 1 | 1 | 0 | 0 |
| `facts/` | 35 | 25 | 10 | 0 |
| `plans/` | 84 (43 plans + 41 STATE) | 2 | 1 | 81 |
| `qa/` | 4 | 0 | 0 | 4 |
| `prototypes/` | 0 | 0 | 0 | 0 |

The 81 headerless files in `plans/` conform to the current template. Three points bear on a header decision:

- **The prose-`## Metadata` variant is not unique to plans.** Ten fact reports and all four QA reports use a Title-Cased bulleted block instead of YAML; every instance is dated 2026-01-17 → 2026-01-21.
- **`upstream-artifact:` is present in only two of 25 frontmatter fact reports** — `2026-07-29-QA-Repair-Residue.md` and `2026-07-29-QA-Skills-Contract-Drift.md`. The other 23 predate the field. `planner/SKILL.md:482` covers that case explicitly.
- **Nineteen fact reports carry the pre-rename key `researcher:`** where the template now says `fact-finder:`, including the report that documents the rename itself.

### The one plan with YAML

- **Observation:** A single plan/STATE pair carries frontmatter, in `snake_case` keys that appear nowhere else in the repo, with `status: ready` — a value in no template.
- **Direct consequence:** A precedent for plan frontmatter exists on disk, and it matches no current convention.
- **Evidence:** `thoughts/shared/plans/2026-02-06-Generalize-QA-Language-References.md:1-14`
- **Excerpt:**
  ```markdown
  ---
  date: 2026-02-06
  ticket: "GENERALIZE-QA"
  title: "Generalize QA Language References for Full Extensibility"
  status: ready
  target_files:
    - agent/researcher.md
  ```
- Its STATE sibling carries `plan`, `current_phase`, `current_task`, `status`, `last_updated` (sub-agent excerpt, `…-STATE.md:1-7`). One further plan, `2026-01-18-Codebase-Locator-Communication-Optimization.md:1-7`, uses a prose `## Metadata` block carrying a `Priority` key that no template defines.

### What the V4 drafts specify for plans

- **Observation:** V4 places `plans/` under `knowledge/` and classifies it `BRÜCKE`, a third category alongside the normative (`SOLL`) and descriptive (`IST`) split.
- **Direct consequence:** Plans fall outside the normative/descriptive axis that the frontmatter convention governs.
- **Evidence:** `ORBIT-V4-CONCEPT.md:89-92`
- **Excerpt:**
  ```markdown
    epics/                # BRÜCKE · Dekomposition
    plans/                # BRÜCKE · Umsetzungspläne (+ STATE)
    compliance/           # META · Drift-Reports Ist-vs-Soll + Entscheidungsprotokolle
  ```

- **Observation:** `ORBIT-V4-OKF-CONVENTION.md:28-33` scopes itself to Intent, Spec, Rule and ADR nodes only, and the bundle listing at `:44-60` contains no `plans/` directory (sub-agent excerpts).
- **Direct consequence:** No V4 document defines a plan header. The common-field set it does define — `type`, `id`, `status`, `title`, `description`, `timestamp`, `tags`, `supersedes` (`:89-98`) — is stated for node types that exclude plans.

- **Observation:** Content hashes attach to facts, one per cited source location, and the mechanism that consumes them is the plan seal.
- **Direct consequence:** Under V4 a plan references rules and facts by stable `id` and is valid only while those references are current. The hash lives on the fact, not on the plan.
- **Evidence:** `ORBIT-V4-CONCEPT.md:109-114`
- **Excerpt:**
  ```markdown
  - **Quelle** — Datei + Zeilenspanne (`path:line-line`) bzw. URL + Abrufdatum
  - **Content-Hash** der zitierten Code-Stelle zum Erhebungszeitpunkt
  - **Art-Tag** — `architecture` | `design` | `library` | `code` | `quality`
  - **Erhebungszeitpunkt** und **Zuverlässigkeit**

  Ändert sich die Quelle (Hash weicht ab), ist das Faktum automatisch **stale**.
  ```
- **Evidence:** `ORBIT-V4-CONCEPT.md:125`
- **Excerpt:**
  ```markdown
  | Planner | **Planner (Vollständigkeits-Gatekeeper)** | Referenziert konkret die Regeln und Fakten, auf denen der Plan beruht (per ID). Plan ist erst "versiegelt", wenn alle referenzierten Regeln/Fakten aktuell sind. Fehlt/veraltet ein Faktum → Plan ungültig, zurück zum Fact-Finder. |
  ```

- **Observation:** V4 replaces path-valued upstream pointers with `refines`, a list of stable IDs, and states rename-survival as the motive (`ORBIT-V4-OKF-CONVENTION.md:108-114`, sub-agent excerpt). Grep for `mission-source`, `spec-source`, `upstream-artifact`, `feature-source` across both V4 documents returns zero matches.
- **Direct consequence:** The current five-file `*-source:` contract is neither carried forward nor named as deprecated in the drafts; the only migration statement is `ORBIT-V4-OKF-CONVENTION.md:333-334`, a bootstrap extraction of implicit rules.

- **Observation:** The V4 status vocabulary is `draft | active | superseded | deprecated`, mandatory on every node, and a `superseded` node must be the target of an inbound `supersedes` edge (`ORBIT-V4-OKF-CONVENTION.md:93`, `:182-183`, sub-agent excerpts). The plan seal state `versiegelt` is not a member of it.

- **Two internal contradictions in the drafts, as reported by the analyzer and not adjudicated by either document:** `ORBIT-V4-CONCEPT.md:85-88` stores facts under `knowledge/facts/{code,external,quality}/` with persisted hashes, while `ORBIT-V4-OKF-CONVENTION.md:28-33` states code facts are not stored but derived on demand, citing CONCEPT §5 as its authority. Separately, the CONVENTION defines the OKF bundle *as* `knowledge/`, while the CONCEPT puts six further directories inside the same path.

### Where the STATE template is stated

Two copies exist and they differ: `planner/SKILL.md:864-890` includes the "Grouped by wave…" explanatory line and a QA-phase label example; `plans/AGENTS.md:63-83` omits both. `implement/SKILL.md:52` points only at the planner copy.

## Verification Log

- `Verified (personally read):` `.claude/skills/planner/SKILL.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/epic-planner/SKILL.md`, `.claude/agents/thoughts-locator.md`, `CLAUDE.md`, `README.md`, `ORBIT-V4-CONCEPT.md`, `thoughts/shared/AGENTS.md`, `thoughts/shared/plans/AGENTS.md`, `thoughts/shared/plans/2026-02-06-Generalize-QA-Language-References.md`
- `Accepted from sub-agent excerpts (not personally re-read):` `.claude/skills/implement/implementer-prompt.md`, `.claude/skills/implement/reviewer-prompt.md`, `.claude/skills/mission-architect/SKILL.md`, `.claude/skills/specifier/SKILL.md`, `.claude/skills/feature-architect/SKILL.md`, `.claude/skills/fact-finder/SKILL.md`, `.claude/skills/prototype/SKILL.md`, `.claude/skills/{clean-code,python-qa,typescript-qa,logic-bugs-qa}/SKILL.md`, `.claude/agents/thoughts-analyzer.md`, `ORBIT-V4-OKF-CONVENTION.md`, `thoughts/shared/{facts,qa,prototypes}/AGENTS.md`, the per-directory header counts, and the individual artifact files cited in the on-disk tables
- `Spot-checked excerpts captured:` yes — `mission-architect/SKILL.md:150-153`, `specifier/SKILL.md:139-143`, `epic-planner/SKILL.md:158-163` and `fact-finder/SKILL.md:614-621` were confirmed by direct grep before being tabled

## Open Questions / Unverified Claims

- **Whether any consumer outside `.claude/` reads plan files.** `scripts/build-plugin.sh` copies `.claude/agents` and `.claude/skills` verbatim and encodes no plan knowledge (sub-agent report, `:44-53`), and `dist/` is absent from the tree, so the built plugin could not be inspected. No evidence of an external consumer was found; absence of evidence is what is reported, not proof of absence.
- **Which of the 41 STATE files predate per-commit update granularity.** `implement/SKILL.md:44-47` describes a heuristic for detecting them at runtime; no census was run.
- **Whether the 2026-02-06 YAML plan pair was written by `/planner` or by hand.** Its keys match no template of any era in the repo; git history for that file was not examined.
- **The `enforcement` value vocabulary in V4.** The analyzer reports only `mechanical` ever appears across both drafts, despite the field being mandatory for Rule nodes — a gap in the drafts, not a gap in this research.

## References

**Codebase Citations**:
- `.claude/skills/planner/SKILL.md:475-486, 605-674, 855-894`
- `.claude/skills/implement/SKILL.md:28-57, 232-245`
- `.claude/skills/implement/implementer-prompt.md:11`
- `.claude/skills/implement/reviewer-prompt.md:11`
- `.claude/skills/epic-planner/SKILL.md:157-164, 255`
- `.claude/skills/mission-architect/SKILL.md:149-154`
- `.claude/skills/specifier/SKILL.md:138-144`
- `.claude/skills/feature-architect/SKILL.md:132-140`
- `.claude/skills/fact-finder/SKILL.md:612-626, 643-651`
- `.claude/skills/prototype/SKILL.md:93-99`
- `.claude/skills/clean-code/SKILL.md:449-455`
- `.claude/agents/thoughts-locator.md:60-70`
- `CLAUDE.md:166-177`
- `README.md:155-175`
- `thoughts/shared/AGENTS.md:20-49`
- `thoughts/shared/plans/AGENTS.md:12-35, 61-83, 96-103`
- `thoughts/shared/plans/2026-02-06-Generalize-QA-Language-References.md:1-14`
- `thoughts/shared/plans/2026-07-29-QA-Repair-Residue-STATE.md:1-6`
- `ORBIT-V4-CONCEPT.md:78-127`
- `ORBIT-V4-OKF-CONVENTION.md:28-33, 44-60, 89-98, 108-118, 173-183, 333-334`

**Web Research Citations**:
- None. This research is entirely repo-internal.
