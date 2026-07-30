---
date: 2026-07-30
fact-finder: fact-finder-skill
topic: "Change Architect"
status: complete
upstream-artifact: thoughts/shared/features/2026-07-30-Change-Architect.md
coverage:
  - .claude/skills/planner/SKILL.md (Execution Protocol, frontmatter spec, both output templates)
  - .claude/skills/fact-finder/SKILL.md (Phase 1, frontmatter spec, report template, delegation sections)
  - .claude/skills/implement/SKILL.md (After the Final Wave)
  - .claude/skills/feature-architect/SKILL.md, mission-architect/SKILL.md, specifier/SKILL.md, epic-planner/SKILL.md (full structural comparison)
  - .claude/skills/prototype/SKILL.md (entry-point statements)
  - .claude/skills/clean-code|python-qa|typescript-qa|logic-bugs-qa/SKILL.md (report frontmatter templates)
  - .claude/agents/thoughts-locator.md (archive map, scope levels, output template)
  - .claude/hooks/session-start
  - scripts/build-plugin.sh
  - CLAUDE.md, README.md, AGENTS.md (root), thoughts/shared/AGENTS.md + facts|plans|qa|prototypes children
  - presentation/The_Agentic_Assembly_LineV3.html (Entry Points slide)
---

# Research: Change Architect

## Executive Summary

- The pipeline ordering that `CLAUDE.md:96` states lives "in five places" is present in **17 files** at roughly 95 line locations. The five-place list at `CLAUDE.md:98-102` names four files plus the open-ended "the affected `SKILL.md`"; six sibling skills, one child `AGENTS.md`, `CHANGELOG.md`, the V5 draft and two presentation decks carry ordering or routing statements as well.
- `/planner` **never reads or branches on `fact-source:`**. All four mentions are write-side. The only place the skill distinguishes a QA input from a fact input is `planner/SKILL.md:495-499`, which inspects the *input document's* path and `message_type`, not the plan's own frontmatter.
- All four QA skills hard-code `upstream-artifact: none` as a **literal template value**, not as `[path or none]`. No QA report can carry a path in that field as the templates are written.
- `/planner` has **no pre-write abort path**. Its three established refusal shapes are: substitute a Verification Task for a PLAN task, write the artifact and then stop at the `## Approval Gate` (`:599-606`), or name a candidate and require confirmation (`:482`).
- `/fact-finder` Phase 1 is `if (user named a document) … / Otherwise glob …` with **no else branch**; `:582-585` falls through unconditionally to research.
- `upstream-artifact: none` currently denotes two different states under two different rules in the same file: `fact-finder:624` defines it only for "the user named the target directly", while `fact-finder:663` and `facts/AGENTS.md:49` extend it to "there was no upstream artifact".
- The four entry-point/translator skills share an invariant 12-element skeleton; frontmatter is `name` + `description` only in all four, and the `description` follows a fixed micro-grammar naming input directory, output directory and both pipeline neighbours.
- `scripts/build-plugin.sh` copies `.claude/skills/` wholesale (`:51`); a new skill directory requires no edit to it.
- The Entry Points slide of the presentation states that the architects produce the first artifact and every downstream skill reads it, while its own third row shows an entry point with neither an architect nor an artifact.

## Coverage Map

Personally opened and read: `planner/SKILL.md` (lines 474-513, 596-613, 630-671, 890-899), `fact-finder/SKILL.md` (full file, 701 lines), `feature-architect/SKILL.md` (full file, 247 lines), `mission-architect/SKILL.md:47-64`, `implement/SKILL.md:232-245`, all four QA skills' template regions, `scripts/build-plugin.sh:26-57`, `thoughts/shared/AGENTS.md` (full), `thoughts/shared/plans/AGENTS.md:112-122`, `thoughts/shared/facts/AGENTS.md:44-55`, `thoughts/shared/qa/AGENTS.md:43-50`, `thoughts/shared/prototypes/AGENTS.md` (full, 42 lines), `.claude/agents/thoughts-locator.md:44-57,96-123`, `CLAUDE.md:11-12,70,90-105,225`, `README.md:7-56`, `AGENTS.md:55-74`, `.claude/hooks/session-start` (full, 45 lines), `presentation/The_Agentic_Assembly_LineV3.html:345-384`.

**Scope is partial in three named places**, recorded in Open Questions: `presentation/ORBIT.pptx` (binary, not opened), `specifier/SKILL.md` and `epic-planner/SKILL.md` (line-level claims accepted from a sub-agent, not personally re-read beyond the routing question), and `CHANGELOG.md` / `ORBIT-V5-CONCEPT.md` line citations.

## Inherited Constraints (Treated as Fixed)

| Constraint | Source | What it forbids or forces | Status |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked via the Skill tool as `/skill-name` | `CLAUDE.md:23-24` | Forces the same shape as the three sibling entry points; forbids a different invocation mechanism | fixed — not investigated |
| Nothing compiles and there is no test suite; verification is reading plus two commands | `CLAUDE.md:11` | Forbids relying on tests as a safety net | fixed — not investigated |
| Artifacts are named `YYYY-MM-DD-Topic.md` and are write-once after creation | `CLAUDE.md:70`; `thoughts/shared/AGENTS.md:15,37` | Forces the filename form; forbids later stages editing the artifact | fixed — not investigated |
| Three frontmatter conventions hold across all artifacts: a back-pointer naming the artifact upstream, `status:` describing the document, the authoring skill signing its own field | `CLAUDE.md:90-92` | Forces the Change Brief's key set into that shape | fixed — not investigated |
| `/planner` copies the fact report's `upstream-artifact:` verbatim rather than re-deriving it | `CLAUDE.md:90`; `planner/SKILL.md:637` | Forces the Change Brief to reach the plan through that existing field; forbids a parallel path | fixed — not investigated |
| The pipeline definition is duplicated with no tooling keeping copies in sync | `CLAUDE.md:94-105` | Forces treating a fourth entry point as a multi-file documentation edit | fixed — not investigated |
| `.claude/**` is outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and its four children | `CLAUDE.md:225` | Forbids an `AGENTS.md` for the new skill directory | fixed — not investigated |
| Never edit a skill or agent file while `/implement` is mid-plan | `CLAUDE.md:12` | Forces wave design to hold the orchestrator's own rules stable | fixed — not investigated |
| ORBIT has no mission or spec document; `CLAUDE.md` and the `SKILL.md` files are the normative record | `inferred — Glob of thoughts/shared/missions/ and specs/ returned empty; CLAUDE.md fills the role` | Forces constraint citations to `CLAUDE.md` or skill files rather than a spec | **inferred — verified** (see DT-8) | 

## Critical Findings (Verified, Planner Attention Required)

### CF-01 — The ordering is stated in 17 files, not five

- **Observation:** `CLAUDE.md:96` states the ordering "is stated in five places". The list at `:98-102` names this file, `.claude/hooks/session-start`, `README.md`, root `AGENTS.md`, and item 5 "the affected `SKILL.md`, plus any sibling skill that names the stage before or after it" — an open-ended entry, not a file. The enumeration in DT-7 below locates ordering or routing statements in 17 distinct files.
- **Direct consequence:** A `File(s):` list built from the five-item list at `:98-102` is not exhaustive, because item 5 does not name its members. The enumeration in DT-7 is what a wave-disjointness check can be run against.
- **Evidence:** `CLAUDE.md:94-104`
- **Excerpt:**
  ```markdown
  The ordering above is stated in five places, and no tooling keeps them in sync:

  1. this file
  2. `.claude/hooks/session-start` — the text injected into every session
  3. `README.md`
  4. root `AGENTS.md`
  5. the affected `SKILL.md`, plus any sibling skill that names the stage before or after it
  ```

### CF-02 — The presentation's Entry Points slide asserts a property its own third row lacks

- **Observation:** Slide 4 of the V3 deck lists three entry rows. Rows 1 and 2 each carry a `cmd-box` naming an architect and a `result-box` naming a pipeline. Row 3, `Kleine Änderung / Bug / QA`, carries a `cmd-box` reading `/fact-finder` and **no result-box**. The slide's closing note states that the architects produce the first artifact and that all downstream skills read that artifact as the starting point of their transformation.
- **Direct consequence:** The slide's stated property — every entry point begins the chain with an artifact — does not hold for the row it itself shows, and the row is structurally shorter than the other two in the rendered markup.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:371-382`
- **Excerpt:**
  ```html
        <div class="entry-box">Kleine Änderung / Bug / QA<small>Lokalisierte Anpassung</small></div>
        <div class="arr">→</div>
        <div class="cmd-box">/fact-finder</div>
      </div>
    </div>
    <div class="box-light mt20" style="font-size:0.8rem;">
      <strong>Hinweis zur Kette:</strong> Jeder Einstiegspunkt bestimmt, an welchem Glied der Kette die Arbeit beginnt.
      Die Architekten erzeugen das erste Artefakt ohne Eingabe — alle nachgelagerten Skills lesen dieses Artefakt als Startpunkt ihrer Transformation.
  ```

### CF-03 — `/planner` cannot distinguish a QA-sourced plan via `fact-source:`

- **Observation:** `fact-source` appears four times in `planner/SKILL.md` — `:627` (spec block key), `:636` (definition), `:659` (standard template), `:748` (QA template) — all write-side. No instruction parses, pattern-matches or branches on its value. The single discrimination between QA and fact input is at `:495-499`, and it inspects the input document, not the plan's frontmatter.
- **Direct consequence:** A condition expressed as "exempt plans whose `fact-source:` points into `qa/`" has no existing read site to attach to. The existing read site is the `### QA Report Detection` block, which runs "after reading input file(s) in Phase 1" and already keys on `thoughts/shared/qa/` as a path prefix and on `message_type: QA_REPORT`.
- **Evidence:** `.claude/skills/planner/SKILL.md:495-499`
- **Excerpt:**
  ```markdown
  After reading input file(s) in Phase 1, check if input is a QA report:

  **Detection Methods:**
  1. File path starts with `thoughts/shared/qa/`
  2. YAML frontmatter contains `message_type: QA_REPORT`
  ```

### CF-04 — All four QA templates hard-code `upstream-artifact: none`

- **Observation:** The value is pre-filled as a literal in every one of the four templates, not left as a `[path or none]` placeholder. The four frontmatter blocks are byte-identical in key set and values. None of the four carries a `fact-source:`, a `spec-source:` or an authoring-skill signature field; provenance appears only as the prose `- Auditor:` line under `## Scan Metadata` and as the `-[Lens]` filename suffix.
- **Direct consequence:** Any QA report produced today asserts `upstream-artifact: none` regardless of whether an epic or brief existed, and the templates give the model no field in which to record a path. A rule that treats `none` as disqualifying, applied without an exemption, applies to every QA report that exists or can be produced.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:449-455`; `.claude/skills/python-qa/SKILL.md:72-78`; `.claude/skills/typescript-qa/SKILL.md:77-83`; `.claude/skills/logic-bugs-qa/SKILL.md:215-221`
- **Excerpt** (`python-qa/SKILL.md:72-78`, the other three identical):
  ```markdown
  ---
  date: YYYY-MM-DD
  message_type: QA_REPORT
  target: "[module or file name]"
  status: complete
  upstream-artifact: none
  ---
  ```

### CF-05 — `/planner` has no pre-write abort idiom

- **Observation:** Phase 3 opens with `- Always write the full plan artifact.` (`:599`) and its stop instruction is post-write (`:605`). The heading itself is `### Phase 3: Decision Gates (NO DEADLOCK)` (`:598`). The only in-flow interaction with the user is `:482`, scoped to the absent-field case. Every other refusal in the file substitutes a Verification Task and continues (`:28`, `:55-57`, `:254`).
- **Direct consequence:** A refusal that stops before the artifact is written is a fourth shape, not an instance of an existing one, and it stands opposite `:599`. The two existing surfaces where a plan records something it declined to do are the `## Approval Gate` section (required in both output templates, `:687-688` and `:794-795`) and the Verification Task substitution.
- **Evidence:** `.claude/skills/planner/SKILL.md:598-606`
- **Excerpt:**
  ```markdown
  ### Phase 3: Decision Gates (NO DEADLOCK)
  - Always write the full plan artifact.
  - Include an **`## Approval Gate`** section in it. Approval is **required** when the plan:
  ```
  and `:605`:
  ```markdown
  - If any of those apply, stop after writing and present only the plan summary + the explicit questions the user must answer.
  ```

### CF-06 — `/fact-finder` Phase 1 has no branch for "no work order found"

- **Observation:** The numbered list is `1. **If the user named a document, read that.**` (`:565`), `2. **Otherwise glob for the work order**` (`:567`), `3. **Then check `thoughts/shared/prototypes/`**` (`:580`), then an unconditional fall-through at `:582-585`. Neither branch has an else. The phrase `when you have one` at `:584` is the only acknowledgement that the state can arise, inside a bullet about seeding research vectors.
- **Direct consequence:** A glob that returns zero files and a glob that was never run reach the same reporting instructions, and nothing in Phase 1 records which occurred. The only two places the file describes the no-upstream state are report-writing instructions (`:624`, `:663`), neither reachable as a Phase 1 decision and neither cross-referenced from it.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:582-585`
- **Excerpt:**
  ```markdown
  Then:
  - Read the user request.
  - Decompose into research vectors — seed them from the artifact's questions when you have one, rather than deriving everything from the prose request.
  - Delegate exploration to sub-agents.
  ```

### CF-07 — `upstream-artifact: none` is defined twice, to two different conditions

- **Observation:** `fact-finder/SKILL.md:624` scopes `none` to one condition: "when the user named the target directly and no work order was globbed". `fact-finder/SKILL.md:663` and `facts/AGENTS.md:49` scope the parallel `None` rule for the constraints table to "when the upstream artifact had none **or when there was no upstream artifact**".
- **Direct consequence:** The value `none` presently carries both "a target was named, so no work order applies" and "no upstream artifact existed". A reading that assigns it a third meaning is additive to two existing ones, not a definition of an unused value.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:624`; `thoughts/shared/facts/AGENTS.md:49`
- **Excerpt** (`facts/AGENTS.md:49`):
  ```markdown
  - The `## Inherited Constraints (Treated as Fixed)` section is required and takes `None` when there are no upstream constraints or no upstream artifact; `upstream-artifact:` takes a file path or the literal `none`
  ```

### CF-08 — `implement/SKILL.md:238` cites `planner/SKILL.md:481` by line number

- **Observation:** The acceptance step's skip rule cross-references a specific line in a sibling skill. It also enumerates the two skip cases by value and by directory.
- **Direct consequence:** An edit that changes line numbering in `planner/SKILL.md` around `:481` leaves the citation pointing at different text, and the enumeration at `:238` names `features/` explicitly rather than testing for `epics/`.
- **Evidence:** `.claude/skills/implement/SKILL.md:238`
- **Excerpt:**
  ```markdown
  3. **If the plan's `upstream-artifact:` frontmatter field names an epic,** read that epic and carry out its `## Verification Plan (For Implementor)` section, then report the result. The literal `upstream-artifact: none` means there is no work order — skip this check, exactly as `/planner` treats the same value (`planner/SKILL.md:481`). A value naming a feature brief in `thoughts/shared/features/` is also a skip: only epics carry that section.
  ```

### CF-09 — The four child `AGENTS.md` files assert frontmatter key sets in four different ways

- **Observation:** `plans/AGENTS.md:120-121` names all six plan keys and all three STATE keys and date-scopes its own applicability. `qa/AGENTS.md:49` names all five keys with no date scope. `prototypes/AGENTS.md:40` asserts "all four required frontmatter fields" against a five-key block declared at `:17-23`. `facts/AGENTS.md:51-54` asserts no key set at all. `CLAUDE.md:92` cites `thoughts/shared/plans/AGENTS.md:118-119` for the assertion; lines 118-119 hold the STATE-sibling and checklist-completeness rules, and the key-set assertions are at 120-121.
- **Direct consequence:** `CLAUDE.md:92` states the `## Verification` list is the only place a key set is asserted; for fact reports that place is empty, for prototype notes the count there disagrees with the declared block, and the citation in `CLAUDE.md` is two lines off its target.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:118-121`; `thoughts/shared/prototypes/AGENTS.md:17-23,40`; `thoughts/shared/facts/AGENTS.md:51-54`
- **Excerpt** (`plans/AGENTS.md:118-121`):
  ```markdown
  - Each plan has a sibling `-STATE.md`, and its `**Current Task**` names a task ID present in the plan, or `Complete`
  - Every task in the plan appears exactly once in the STATE checklist, under the wave its `Wave:` field names
  - A valid plan's frontmatter carries all six keys: `date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact` — applies to plans authored 2026-07-30 or later; earlier plans carry no document frontmatter at all, which is expected, not a defect
  - A valid STATE file's frontmatter carries all three keys: `date`, `plan`, `status`
  ```

### CF-10 — `thoughts-locator` knows 9 map entries but renders 8 output sections; `features/` is the missing one

- **Observation:** The archive map at `:48-56` lists nine entries, including `thoughts/shared/features/` at `:50`. The answer template at `:99-121` renders eight `###` sections — Mission Statements, Specifications, Epics, Implementation Plans, QA Reports, Fact Reports, Prototype Learnings, Project Notes. There is no Feature Briefs section. `features/` currently holds three artifacts on disk.
- **Direct consequence:** A category present in the map but absent from the output template has no heading under which the locator can report it, and the "all 9 categories" figure counts map entries rather than renderable sections. A tenth map entry added without a matching output section inherits the same asymmetry.
- **Evidence:** `.claude/agents/thoughts-locator.md:48-56`, `:99-121`
- **Excerpt** (`:48-51`):
  ```markdown
  *   `thoughts/shared/missions/` -> Mission statements (`YYYY-MM-DD-[Project].md`)
  *   `thoughts/shared/specs/` -> Specifications (`YYYY-MM-DD-[Project].md`)
  *   `thoughts/shared/features/` -> Feature briefs (`YYYY-MM-DD-[Feature-Name].md`)
  *   `thoughts/shared/epics/` -> Epic decompositions (`YYYY-MM-DD-EPIC-NNN-[Epic].md`)
  ```

### CF-11 — `build-plugin.sh` requires no edit for a new skill

- **Observation:** Skills reach `dist/orbit/` via a directory-level recursive copy at `:51`, and the log line counts directories at runtime. No skill name appears anywhere in the script. The name-level enumerations are: the two preserved hand-authored assets (`:34`), the five cleaned output paths (`:41`), and the hooks pair (`:31-32`, `:57`, `:63`).
- **Direct consequence:** Adding `.claude/skills/change-architect/` changes the build output with no change to the build script. Adding a new top-level output directory or a second hook handler would require editing `:41` or the hook lines.
- **Evidence:** `scripts/build-plugin.sh:49-53`
- **Excerpt:**
  ```bash
  # --- skills ------------------------------------------------------------------
  mkdir -p "$OUT/skills"
  cp -R "$SRC/skills/." "$OUT/skills/"
  find "$OUT/skills" -name AGENTS.md -delete
  log "skills/    ($(find "$OUT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ') skills)"
  ```

## Detailed Technical Analysis (Verified)

### DT-1: `/planner` Phase 1 — the `none` / absent split

`.claude/skills/planner/SKILL.md:479-482` carries the base instruction plus three sub-bullets. Two of them define opposite permissions:

```markdown
3. **Read the work order the fact report was written for.** Take its path from the fact report's `upstream-artifact:` frontmatter field and `Read` that file — an epic in `thoughts/shared/epics/` or a feature brief in `thoughts/shared/features/`.
   - **Do not glob `epics/` to find it.** A fact report is named after its research topic, not after the epic (`epic-planner:228`), so the association cannot be recovered from the filename — a guess silently attaches the wrong epic, and every criterion and constraint you then plan against belongs to a different piece of work.
   - `upstream-artifact: none` means there is no work order. That is the answer, not a prompt to search: plan from the fact report and the user request alone.
   - Only when the field is **absent** — the report predates it — may you `Glob` `thoughts/shared/epics/` and `thoughts/shared/features/`, and then you must name the candidate to the user and get confirmation before relying on it.
```

The distinction is presence-of-key versus value-of-key, stated in prose with no mechanical test and no ordering between the two checks. `none` forbids `Glob` and requires no user interaction; absent permits `Glob` and requires confirmation. `:479` names exactly two artifact kinds and two directories.

Step 4 (`:483-487`) then reads four named sections from the work order: `## Acceptance Criteria for Planner`, `## Implementation Considerations (For Planner)` (marked advisory), `## Dependencies`, `## Verification Plan (For Implementor)`.

### DT-2: `/planner` frontmatter and templates

Six keys, all owned by this skill, declared at `:622-630` and defined at `:632-637`. The two definitions bearing on the work order:

```markdown
- **`fact-source`** — path of the fact report this plan was built from; for a QA plan, the path of the QA report.
- **`upstream-artifact`** — copied verbatim from the fact report's own `upstream-artifact:` field (the epic or feature brief it names), or the literal `none` when that field read `none`. Copy it; do not re-derive it.
```

The key appears three further times as template text: `:660` (standard), `:749` (QA), and `:628` (spec block). The standard template's `## Inputs` section carries a prose line naming the artifact kinds:

```markdown
## Inputs
- Fact report(s) used: `thoughts/shared/facts/...`
- Epic / feature brief: `thoughts/shared/epics/...` or `none` (from the fact report's `upstream-artifact:`)
- User request summary: ...
```
— `.claude/skills/planner/SKILL.md:665-668`

The QA template's `## Inputs` has no equivalent line. The QA frontmatter note sits after the template's closing fence:

```markdown
In a QA plan the frontmatter fields carry the same meaning as in a standard plan, with `fact-source` holding the QA report path instead of a fact report path, and `upstream-artifact` still copied verbatim from that QA report's own `upstream-artifact:` field.
```
— `.claude/skills/planner/SKILL.md:896`

Read against CF-04: `:896` instructs copying a value from the QA report's field, and the four QA templates fix that value at the literal `none`.

### DT-3: `/fact-finder` Phase 1 and the report contract

Phase 1 begins at `:561`. The three numbered branches are quoted in CF-06. The work-order table at `:569-577` maps artifact sections to what they supply; it carries three Epic rows and three Feature-brief rows, and the Feature-brief rows are `**Open Questions for Fact-Finder**`, `**Integration Points**`, `**Inherited Constraints**`.

The field description:

```markdown
**The `upstream-artifact` field** holds the **path of the epic or feature brief read in Phase 1**, or the literal `none` when the user named the target directly and no work order was globbed. This field is what **`/planner` reads to locate the epic**, so a guess or an omission strands the downstream task. Always fill it in precisely.
```
— `.claude/skills/fact-finder/SKILL.md:624`

The report's constraints section and its `None` rule:

```markdown
## Inherited Constraints (Treated as Fixed)
These rows are carried in from the epic's or feature brief's `## Inherited Constraints` section, which were treated as settled rather than investigated. The section is required — write `None` when the upstream artifact had none or when there was no upstream artifact.
```
— `.claude/skills/fact-finder/SKILL.md:662-663`

The category-count sentence:

```markdown
- Returns: All 9 categories (missions, specs, feature briefs, epics, plans, QA reports, fact reports, prototype learnings, project notes)
```
— `.claude/skills/fact-finder/SKILL.md:376`

The skill's single user-blocking instruction is `:65` (`Use `Bash` to locate files only after asking permission`). `:29`, `:49-51` and `:64` record and continue rather than blocking.

Two internal duplications exist in this file: the frontmatter template appears twice, at `:613-621` and `:643-651`; and the QA output path appears at `:117` without the lens suffix and at `:636` with it.

### DT-4: The entry-point skill skeleton `/change-architect` would instantiate

Four files compared in full: `feature-architect` (247 lines), `mission-architect` (261), `specifier` (406), `epic-planner` (412).

**Invariant across all four:**

| Element | Note |
|---|---|
| Frontmatter is `name` + `description` only | No `model:`, `context:`, `allowed-tools:`, `disable-model-invocation:` in any of the four |
| `description` micro-grammar | `<verb phrase>. [Reads <input dir>.] Outputs <artifact> to thoughts/shared/<dir>/. Use after /X and before /Y.` |
| `# <Name>: <Subtitle>` + role preamble naming the output artifact | |
| `## Prime Directive: <X> Before <Y>` with exactly 3 numbered points | |
| `## Non-Negotiables (Enforced)` with exactly **4** bolded items | Item 1 is always the input gate; item 2 always an abstraction ceiling |
| `## Tools & Delegation` + per-tool bullets + `**You do NOT:**` | The literal line `- Run bash commands.` in all four |
| An `AskUserQuestion` scope rule stated twice — tools section and point of use | |
| `## Execution Protocol` with `### Phase N:` headings | Shape is intake → synthesis → write |
| Target path stated, then the `Glob`-first write-once guard with supersede-or-rename | |
| A `- [ ]` gate list guarding the write, plus an "if unchecked, do X" instruction | |
| `## Output Format (STRICT)` with a `File:` line and a fenced template whose last substantive section is `Open/Research Questions for <next stage>` | |
| `---` rule then a closing `**Remember**:` paragraph naming the downstream consumer | |

**Variation:** a headed `## When to use this agent (vs. alternatives)` section exists only in `feature-architect:14`; `mission-architect` carries the same table unheaded inside Non-Negotiable 4 at `:55-61`, with column `Route` instead of `Agent`, five rows instead of four, and arrows extended through `/implement`. `## Evidence & Citation Standards` and `## How to Write a Good <X>` appear in three of four and are absent from `feature-architect`. `Grep` appears in one tool list (`feature-architect:58`). The inline `**Pre-write checklist (enforced):**` appears in one (`feature-architect:118`); the other three place an equivalent list at document tail under three distinct headings.

The `feature-architect` / `mission-architect` pair share a second dialect distinction: their `AskUserQuestion` rule is "forced-choice only, open-ended discovery is ordinary conversation", both carry a convergence-check script, and both templates close with `## Conversation Summary`. `specifier` / `epic-planner` use "for ambiguity and trade-offs; never to inform".

Verified excerpt of the routing table that names the third path (`mission-architect/SKILL.md:55-61`):

```markdown
| Scenario | Route |
|---|---|
| New codebase, no existing code | **this skill** → `/specifier` → `/epic-planner` → `/fact-finder` → `/planner` → `/implement` |
...
| Small change or extension to existing functionality | `/fact-finder` → `/planner` → `/implement` |
```

`mission-architect:63` supplies verbatim redirect scripts naming which condition failed.

### DT-5: `thoughts/shared/` governance

Directory-assignment table at `thoughts/shared/AGENTS.md:17-27`, eight rows. `features/` reads `| features/ | /feature-architect | /fact-finder |`. The populated/empty sentence at `:31` currently reads `**Populated today:** plans/, facts/, qa/, features/, epics/. **Empty today:** missions/, specs/, prototypes/.` and declares itself non-contractual with `ls` as the authority.

Child DOX Index at `:45-52` lists four children and closes:

```markdown
`missions/`, `specs/`, `epics/` and `features/` carry no `AGENTS.md` — this file is their contract.
```

Inheritance rule at `:38`: `- A subdirectory with no `AGENTS.md` of its own inherits this file as its nearest contract`.

The four child files share an invariant five-section skeleton in identical order with zero variation: H1, `## Purpose`, `## Ownership`, `## Local Contracts`, `## Work Guidance`, `## Verification`. All variation sits at the bold-label level inside `## Local Contracts`. Three of four carry a legacy-artifact caveat paragraph (`facts:28`, `plans:46`, `qa:28`); `prototypes/` does not. Sizes: `prototypes` 42, `qa` 50, `facts` 55, `plans` 122 lines.

**Answering the brief's first open question directly:** the target-artifact directories `missions/`, `specs/`, `epics/`, `features/` carry no `AGENTS.md` and are governed by `thoughts/shared/AGENTS.md`; the four directories that do carry one are all downstream-artifact directories. Read together with CF-09, a target-artifact directory has no place today where its frontmatter key set is asserted.

### DT-6: `/implement` acceptance step

`.claude/skills/implement/SKILL.md:232-240`. Three numbered checks after the final wave; check 2 is the QA-plan baseline block, check 3 is the epic verification (quoted in CF-08). The closing paragraph at `:240` states the STATE flip is the sole writer's action and happens only after all applicable checks pass:

```markdown
Set the STATE file's `**Current Task**` to `Complete` **and** its frontmatter `status:` to `complete` — both **only after** all applicable checks pass. You are the sole writer of that `status:` field
```

### DT-7: Enumeration of ordering and routing statements

The brief asked for an enumeration rather than a count. Verified personally unless marked.

**The four named files:**

| File | Locations |
|---|---|
| `CLAUDE.md` | `:36-49` four arrow chains · `:43` brownfield rationale · `:45` escalation test · `:59-68` stage table · `:78` chain diagram · `:90` back-pointer rule with the `features/` skip · `:94-104` the five-place list · `:108-117` skills table incl. prototype's position |
| `.claude/hooks/session-start` | `:8-15` eight per-skill lines each naming a neighbour · `:17-23` the ordering block (Greenfield/Brownfield/Subsystem/Small fix/Unsure) · `:27-28` the two load-bearing orderings · `:30-31` trigger-phrase routing |
| `README.md` | `:9-30` four arrow chains · `:18` brownfield rationale · `:20` escalation test · `:32` load-bearing orderings · `:36-45` stage table · `:47` back-pointer field list · `:50-51` ASCII chain diagram · `:56` `status:` vocabulary · `:124-131` skills table *(last row accepted from sub-agent)* |
| `AGENTS.md` (root) | `:61-66` five-bullet pipeline · `:68` key rule · `:70-74` Child DOX Index |

**Skills with routing tables:**

| File | Locations |
|---|---|
| `feature-architect/SKILL.md` | `:3` frontmatter · `:10` feeds `/fact-finder` · `:12` skip + escalation + "not `/specifier`" · `:16-21` four-row table · `:23` the redirect sentence · `:247` closing Remember |
| `mission-architect/SKILL.md` | `:3` frontmatter · `:47-53` the two-condition test · `:55-61` five-row table · `:63` redirect scripts · `:94` routing gate *(accepted from sub-agent)* · `:261` closing Remember |

**Skills naming an adjacent stage** (frontmatter plus in-body): `specifier/SKILL.md:3,23,103,106,393,401` *(accepted from sub-agent except `:3`)*; `epic-planner/SKILL.md:3,10,23,85-86,406` *(accepted from sub-agent except `:3`)*; `fact-finder/SKILL.md:3,13,563,574,624`; `planner/SKILL.md:3,479-482`; `implement/SKILL.md:3,12,238`; `prototype/SKILL.md:3,11,24,86`.

**Governance and record files:** `thoughts/shared/AGENTS.md:5,17-27,29`; `thoughts/shared/facts/AGENTS.md:9`; `thoughts/shared/qa/AGENTS.md:9`; `thoughts/shared/prototypes/AGENTS.md:9`; `thoughts/shared/plans/AGENTS.md:104,110` *(last two accepted from sub-agent)*.

`thoughts/shared/prototypes/AGENTS.md:9` states an ordering edge that appears in no other governance file:

```markdown
`/prototype` writes (only writer). Notes are write-once after creation. Read by `/feature-architect` and `/fact-finder` on a "go" decision, as additional context.
```

**Outside the sync set:** `CHANGELOG.md:38,39,46` *(accepted from sub-agent)*; `ORBIT-V5-CONCEPT.md:125,185` *(accepted from sub-agent, and marked *Entwurf* per `CLAUDE.md:239-243`)*; `presentation/The_Agentic_Assembly_LineV3.html:298,308-336,347-382`; `presentation/ORBIT.pptx` — 11 slides reported to contain stage names *(not personally verified, binary)*.

Also verified: `.claude/agents/` contains six worker agents and none states pipeline ordering; `implement/implementer-prompt.md` and `reviewer-prompt.md` state none *(both accepted from sub-agent)*.

### DT-8: The `inferred` constraint row, verified

The brief's one `inferred` row asserted that ORBIT has no mission or spec document and that `CLAUDE.md` fills that role. `Glob` of `thoughts/shared/missions/` and `thoughts/shared/specs/` returns zero artifact files in each. `thoughts/shared/AGENTS.md:31` independently records both as empty and names `ls` as the authority. `CLAUDE.md:11` states verification in this repo is reading plus two commands, and `AGENTS.md:59` states there is no application code and the product is the prompt set. Status recorded as `inferred — verified`.

## Verification Log

- `Verified (personally read):` `.claude/skills/planner/SKILL.md` · `.claude/skills/fact-finder/SKILL.md` · `.claude/skills/feature-architect/SKILL.md` · `.claude/skills/mission-architect/SKILL.md` (`:47-64`) · `.claude/skills/implement/SKILL.md` (`:232-245`) · `.claude/skills/clean-code/SKILL.md` (`:444-465`) · `.claude/skills/python-qa/SKILL.md` (`:67-88`) · `.claude/skills/typescript-qa/SKILL.md` (`:72-93`) · `.claude/skills/logic-bugs-qa/SKILL.md` (`:210-231`) · `.claude/agents/thoughts-locator.md` (`:44-57`, `:96-123`) · `.claude/hooks/session-start` · `scripts/build-plugin.sh` (`:26-57`) · `CLAUDE.md` (`:11-12`, `:70`, `:90-105`, `:225`) · `README.md` (`:7-56`) · `AGENTS.md` (`:55-74`) · `thoughts/shared/AGENTS.md` · `thoughts/shared/plans/AGENTS.md` (`:112-122`) · `thoughts/shared/facts/AGENTS.md` (`:44-55`) · `thoughts/shared/qa/AGENTS.md` (`:43-50`) · `thoughts/shared/prototypes/AGENTS.md` · `presentation/The_Agentic_Assembly_LineV3.html` (`:345-384`) · `thoughts/shared/features/2026-07-24-Prototype-Skill.md`
- `Accepted from sub-agent excerpts (not personally re-read):` `.claude/skills/specifier/SKILL.md` · `.claude/skills/epic-planner/SKILL.md` · `.claude/skills/prototype/SKILL.md` (line numbers only; the four statements were located by grep in this session) · `.claude/skills/implement/implementer-prompt.md` · `.claude/skills/implement/reviewer-prompt.md` · `CHANGELOG.md` · `ORBIT-V5-CONCEPT.md` · `README.md:124-131` · `mission-architect/SKILL.md:94` · `thoughts/shared/plans/AGENTS.md:104,110`
- `Spot-checked excerpts captured:` yes — every excerpt above was captured from a file opened in this session, except those listed on the accepted-from-sub-agent line.

## Open Questions / Unverified Claims

- **`presentation/ORBIT.pptx` slide contents.** A sub-agent reports 11 slides containing stage names, located via zipfile XML extraction of `ppt/slides/slide{3,4,5,6,8,9,14,17,19,20,22}.xml`. Not personally verified: the file is binary and `Read` does not render it. Missing evidence: which of those slides state an entry point or an ordering, and whether the file is generated from the HTML deck or maintained separately.
- **Whether the `-STATE.md` naming and the plans directory hold any change-brief-specific assumption.** Not investigated; no evidence sought.
- **`specifier/SKILL.md` and `epic-planner/SKILL.md` line numbers.** Their routing-relevant lines are reported by a sub-agent with excerpts, and the frontmatter line `:3` was verified by grep in this session. The in-body line numbers (`specifier:23,103,106,393,401`; `epic-planner:10,23,85-86,406`) were not re-read. Missing evidence: a personal `Read` of each range.
- **`CHANGELOG.md:38,39,46` and `ORBIT-V5-CONCEPT.md:125,185`.** Reported by sub-agent with quoted fragments; not personally opened. Missing evidence: a personal `Read`.
- **Whether any consumer parses `thoughts/shared/AGENTS.md:31`'s populated/empty sentence.** Not investigated. The line declares itself non-contractual, and no skill was found citing it, but no exhaustive search for readers of that line was run.
- **`mission-architect/SKILL.md:94` ("Routing gate — settle this before any discovery").** Reported by sub-agent; the surrounding Phase text was not read. Missing evidence: the full Phase 1 context around `:94`.

## References

**Codebase Citations**

- `.claude/skills/planner/SKILL.md:474-513`, `:495-499`, `:598-606`, `:622-641`, `:654-668`, `:890-899`
- `.claude/skills/fact-finder/SKILL.md:3`, `:29`, `:49-51`, `:64-65`, `:117`, `:376`, `:561-585`, `:613-621`, `:624`, `:636`, `:643-651`, `:662-667`
- `.claude/skills/feature-architect/SKILL.md:3`, `:10`, `:12`, `:14-23`, `:35-39`, `:54-66`, `:68-125`, `:114-116`, `:118-125`, `:127-243`, `:245-247`
- `.claude/skills/mission-architect/SKILL.md:3`, `:47-63`
- `.claude/skills/implement/SKILL.md:3`, `:232-240`
- `.claude/skills/clean-code/SKILL.md:444-465`
- `.claude/skills/python-qa/SKILL.md:67-88`
- `.claude/skills/typescript-qa/SKILL.md:72-93`
- `.claude/skills/logic-bugs-qa/SKILL.md:210-231`
- `.claude/agents/thoughts-locator.md:44-57`, `:96-123`
- `.claude/hooks/session-start:8-31`
- `scripts/build-plugin.sh:26-57`
- `CLAUDE.md:11-12`, `:23-24`, `:70`, `:90-92`, `:94-105`, `:225`
- `README.md:7-56`
- `AGENTS.md:57-74`
- `thoughts/shared/AGENTS.md:5`, `:15`, `:17-31`, `:37-38`, `:45-52`
- `thoughts/shared/plans/AGENTS.md:112-122`
- `thoughts/shared/facts/AGENTS.md:44-55`
- `thoughts/shared/qa/AGENTS.md:43-50`
- `thoughts/shared/prototypes/AGENTS.md:1-42`
- `presentation/The_Agentic_Assembly_LineV3.html:345-384`
- `thoughts/shared/features/2026-07-30-Change-Architect.md` (the work order)

**Web Research Citations**

- None. No external research was required for this report.
