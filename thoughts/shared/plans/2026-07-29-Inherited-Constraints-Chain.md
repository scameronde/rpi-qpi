# Inherited Constraints Chain Implementation Plan

Carries a host system's fixed constraints from the spec through the epic to `/fact-finder`, so the subsystem route added by `2026-07-29-Large-Feature-Routing.md` does not lose them at the epic boundary. Follows the epic-planner review of 2026-07-29 (finding 1).

## Inputs

- **Fact report(s) used:** none. Research done inline by direct `Read` of the four skill files plus greps establishing which sections have real downstream readers. Every claim in **Verified Current State** carries `path:line` evidence.
- **User request summary:** the epic-planner review found that inherited constraints stop travelling at the epic boundary. The user chose to fix findings 2, 4 and 5 directly (landed in `2e20817`) and to plan this one separately, because it touches more than one file.
- **Scope correction discovered while gathering evidence.** The review reported this as a two-file problem — epic-planner plus fact-finder. It is three. `/specifier` has no dedicated home for inherited constraints either: `2026-07-29-Large-Feature-Routing.md` told it to record what it inherited, but the only vessel available is `Design Decisions`, which the template defines as *"architectural choices made in this spec"* — the precise opposite of a constraint imposed from outside. So the chain lacks a carrier at **two** stages, not one, and the mitigation I landed earlier today is thinner than it looked.

## Verified Current State

- **Fact:** `/fact-finder` reads three sections from a feature brief but only two from an epic. There is no epic equivalent of **Inherited Constraints**, the section whose whole purpose is telling the researcher what not to investigate.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:573-579`
- **Excerpt:**
  ```
  | Artifact | Section | What it gives you |
  |---|---|---|
  | Epic | **Research Questions for Fact-Finder** | your starting research vectors, already as a checklist |
  | Epic | **Dependencies** | which epics must exist first |
  | Feature brief | **Open Questions for Fact-Finder** | your starting research vectors |
  | Feature brief | **Integration Points** | where in the existing system to look |
  | Feature brief | **Inherited Constraints** | what to treat as fixed rather than investigate |
  ```

- **Fact:** The feature brief's section is literally named `## Inherited Constraints`, so reusing that exact name in the spec and epic templates lets one vocabulary serve all three artifacts.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:183`
- **Excerpt:**
  ```
  ## Inherited Constraints
  ```

- **Fact:** `/fact-finder` globs only `epics/` (greenfield) or `features/` (brownfield) for its work order. It never reads a spec directly, so a constraint recorded only in the spec cannot reach it — the epic must carry it forward.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:571`
- **Excerpt:**
  ```
  2. **Otherwise glob for the work order**: `thoughts/shared/epics/` on the greenfield path, `thoughts/shared/features/` on the brownfield path. Both contain sections written *for you*:
  ```

- **Fact:** `/epic-planner`'s only constraint vessel sits inside a section explicitly labelled non-prescriptive, so inherited constraints — which are fixed, not advisory — would arrive flagged as hints.
- **Evidence:** `.claude/skills/epic-planner/SKILL.md:290-299`
- **Excerpt:**
  ```
  ## Implementation Considerations (For Planner)

  [Hints or context that will help the Planner break this into tasks — NOT prescriptive]
  ...
  **Known Constraints**:
  - [Any constraints from mission/spec that the Planner must respect]
  ```

- **Fact:** `/specifier` is told to record what it inherited, but the section it is pointed at is defined as choices the spec itself made. There is no section for constraints imposed from outside.
- **Evidence:** `.claude/skills/specifier/SKILL.md:98`, `:116`, `:302`
- **Excerpt:**
  ```
     - These are **fixed**. Your architecture must fit inside them, not propose alternatives to them. Where you cannot fit, say so in `Design Decisions` and raise it in `Open Questions for Epic Planner` ...
  ...
  When a host system's spec was loaded in Phase 1, these are not open decisions — they are inherited. Record what you inherited and why, not a fresh choice you did not actually get to make.
  ...
  **Design Decisions** (architectural choices made in this spec):
  ```

- **Fact:** The upstream end of the chain is already in place and needs no change: the mission template carries a required `Host system` line, and `/specifier` Phase 1 step 4 reads it and loads the host spec.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:211`, `.claude/skills/specifier/SKILL.md:95-96`
- **Excerpt:**
  ```
  - **Host system** (required when this subsystem lives inside an existing codebase; omit the line entirely when it does not): [Which system it lives in, the path to that system's spec in `thoughts/shared/specs/`, and what it inherits ...]
  ...
  4. **Load the Host System's Spec (when there is one)**
     - If the mission's `Constraints (Non-Negotiable)` section carries a **Host system** line, this subsystem lives inside an existing codebase. `Glob` and `Read` that system's spec from `thoughts/shared/specs/` before Phase 2.
  ```

## Goals / Non-Goals

**Goals**

- One section name — `## Inherited Constraints` — carries fixed constraints through spec → epic → fact-finder, matching the name the feature brief already uses.
- `/fact-finder` treats an epic's inherited constraints the way it already treats a feature brief's: as fixed, not as something to investigate.
- Each stage's self-audit checks the constraint travelled, so the chain fails loudly rather than silently.
- On a greenfield project with no host system, every new section reads `None` and costs one line.

**Non-Goals**

- No change to `/mission-architect`. Its `Host system` line is the source and is already correct.
- No change to `/feature-architect`. Its `## Inherited Constraints` section is the model being copied, not a target.
- **`Known Constraints` under `## Implementation Considerations (For Planner)` stays.** It legitimately carries advisory constraints from the mission and spec. The new section is for what is *fixed*; do not merge or delete the old one.
- No change to `/planner` or `/implement`. The review's separate finding that `Acceptance Criteria for Planner` has no named reader is a planner-side gap, deliberately out of scope here.
- No change to `CLAUDE.md`, `README.md`, root `AGENTS.md` or the hook. This adds no pipeline route; the stage ordering is unchanged.
- No `AGENTS.md` work — `.claude/**` is outside DOX.

## Design Overview

- **One vocabulary.** `## Inherited Constraints` is reused verbatim in the spec template, the epic template, and `/fact-finder`'s intake table. That is why the fix is worth doing as one plan rather than three drive-by edits: the value is entirely in the name matching at every hop, and a paraphrase at any one of them breaks the chain silently.
- **Where each section lands, and why:**
  - *Spec*: immediately before `## Assumptions & Design Decisions`. It is the "what was fixed for us" counterpart to "what we chose", and putting it adjacent makes the distinction legible.
  - *Epic*: immediately after `## Research Questions for Fact-Finder`. `/fact-finder` reads both, and they are exact opposites — one says what to investigate, the other what not to. Adjacent placement means a researcher reads the pair together.
- **The empty case must be cheap.** Both sections say to write `None` on a greenfield project. A section that feels like overhead on the common path gets skipped on the rare one.
- Three files, three tasks, one per file, per the same-file rule. The files are disjoint and no task consumes another's output at edit time — the shared section name comes from this plan, not from execution order — so all three run concurrently in **Wave 1**.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002, PLAN-003 | `.claude/skills/specifier/SKILL.md`, `.claude/skills/epic-planner/SKILL.md`, `.claude/skills/fact-finder/SKILL.md` | One file each, fully disjoint, no task reads another's output |

Tasks in the same wave run concurrently. No path may appear twice within a wave. **Wave 1 self-check:** three paths, each listed once, no `allowedAdjacentEdits` — disjoint.

## Implementation Instructions (For Implementor)

---

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/specifier/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these three edits.

  1. **Add the section to the spec output template.** Immediately **before** the `## Assumptions & Design Decisions` heading (currently line 297), insert:

     ````
     ## Inherited Constraints

     What the host system fixes for this subsystem — not choices made here. `/epic-planner` carries the entries that apply to each epic into that epic's own `## Inherited Constraints`, and `/fact-finder` treats them as fixed rather than investigating them. Required — write `None` when there is no host system.

     | Constraint | Source | What it forbids or forces |
     |---|---|---|
     | [Existing component boundary, data model, integration point, or interaction posture] | [`thoughts/shared/specs/...` of the host system, with line range] | [What this rules out for the new subsystem, or what it obliges] |
     ````

  2. **Point Phase 1 step 4 at it.** In the step titled `4. **Load the Host System's Spec (when there is one)**`, replace the bullet beginning `- These are **fixed**.` with:

     ```
        - These are **fixed**. Record each one in `Inherited Constraints` — that section is what `/epic-planner` and `/fact-finder` read, and a constraint recorded anywhere else does not travel. Your architecture must fit inside them, not propose alternatives to them. Where you cannot fit, say so in `Design Decisions` and raise it in `Open Questions for Epic Planner` — do not quietly design a system that contradicts the one it has to live in.
     ```

  3. **Extend the validation checkbox.** Replace the checklist item beginning `- [ ] If the mission named a host system, I read its spec and my architecture fits` with:

     ```
     - [ ] If the mission named a host system, I read its spec, recorded every constraint it fixes in `Inherited Constraints`, and my architecture fits the boundaries, data model and interaction posture established there — or I have recorded the mismatch in `Design Decisions` and raised it for the Epic Planner.
     ```

  Do **not** touch `**Design Decisions**` or `**Deferred Decisions**` — the new section sits alongside them, it does not replace them.

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/specifier/SKILL.md:98`, `:116`, `:297`, `:302`, `:373`; the section name is copied from `.claude/skills/feature-architect/SKILL.md:183`. See **Verified Current State** for excerpts.
- **Done When:** the spec output template contains a `## Inherited Constraints` heading with a three-column table, positioned immediately before `## Assumptions & Design Decisions`; Phase 1 step 4 names `Inherited Constraints` as the recording destination and says a constraint recorded elsewhere does not travel; the host-system checklist item requires the recording; `**Design Decisions**` and `**Deferred Decisions**` are unchanged; the outer template fence is still four backticks and still balanced; YAML frontmatter parses with `name: specifier` intact.
- **Verify:** `none — requires review` — the section must land inside the fenced output template rather than as a top-level heading of the SKILL.md, which only reading the surrounding structure can confirm.
- **Context:** Earlier today `/specifier` was told to record what it inherited from a host system, but the only vessel available was `Design Decisions`, defined as *"architectural choices made in this spec"* — the opposite of a constraint imposed from outside. So the mitigation recorded the constraint in a place whose label contradicts it, and nothing downstream knew where to look. This gives it a home with the same name the feature brief already uses, which is what lets `/fact-finder` read one section name for both routes. **Note the output template is a four-backtick fence containing three-backtick mermaid blocks** — insert inside it without disturbing that. `.claude/**` is outside DOX; do **not** create or update an `AGENTS.md`.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/epic-planner/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these three edits.

  1. **Add the section to the epic output template.** Immediately **after** the `**Output Expected**: Fact report in ...` line that closes `## Research Questions for Fact-Finder` (currently line 215), and before `## Acceptance Criteria for Planner`, insert:

     ```
     ## Inherited Constraints

     What the host system fixes for this epic, copied from the spec's `## Inherited Constraints` and narrowed to what applies here. `/fact-finder` treats these as fixed rather than investigating them, so this section is the counterpart of the research questions above: that one says what to find out, this one says what is already settled. Required — write `None` when there is no host system.

     | Constraint | Source | What it forbids or forces |
     |---|---|---|
     | [Existing component boundary, data model, integration point, or interaction posture] | [Spec section or host-system spec path with line range] | [What this rules out for this epic, or what it obliges] |
     ```

  2. **Extract it in Phase 3.** In `### Phase 3: Epic Creation`, under `1. **Extract from Spec**`, add a bullet immediately after the `- Which acceptance criteria from the spec apply?` line:

     ```
        - Which entries from the spec's `## Inherited Constraints` apply to this epic? Copy each into this epic's own `## Inherited Constraints` with its source. `/fact-finder` reads that section by name and treats what it finds as fixed, so an entry left only in the spec is one the researcher will investigate from scratch. Write `None` when the spec's section reads `None`.
     ```

  3. **Add a validation checkbox.** In `## Validation Checklist (Before Finalizing Epics)`, immediately after the item beginning `- [ ] Every entry from the spec's "Open Questions for Epic Planner"`, insert:

     ```
     - [ ] Every entry from the spec's `## Inherited Constraints` that applies to an epic appears in that epic's own `## Inherited Constraints` with its source — or the spec's section read `None`.
     ```

  Leave `**Known Constraints**` under `## Implementation Considerations (For Planner)` exactly as it is. It carries *advisory* constraints; the new section carries *fixed* ones. Do not merge, move, or delete it.

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/epic-planner/SKILL.md:198-215` (the section this follows), `:217` (the section it precedes), `:106-113` (the Phase 3 extraction list), `:290-299` (the advisory vessel that stays), `:364-375` (the checklist); the reader being served is `.claude/skills/fact-finder/SKILL.md:573-579`. See **Verified Current State** for excerpts.
- **Done When:** the epic output template contains a `## Inherited Constraints` heading with a three-column table, positioned after `## Research Questions for Fact-Finder`'s `**Output Expected**` line and before `## Acceptance Criteria for Planner`; Phase 3's `Extract from Spec` list carries the new bullet naming the spec's section; the Validation Checklist carries the new checkbox; `**Known Constraints**` and the `## Implementation Considerations (For Planner)` heading are unchanged; YAML frontmatter parses with `name: epic-planner` intact.
- **Verify:** `none — requires review` — placement inside the fenced epic template and the survival of the separate advisory section both need the surrounding structure read.
- **Context:** This is the stage where the constraint currently dies. `/fact-finder` globs `epics/` on the greenfield path and never reads a spec, so anything the spec records but the epic omits cannot reach the researcher — which means on the subsystem route added earlier today, `/fact-finder` investigates from scratch what the brownfield route would have handed it as already settled. The epic's existing vessel is no help: it sits under a heading marked *"NOT prescriptive"*, so a fixed constraint placed there arrives labelled as a hint. `.claude/**` is outside DOX; do **not** create or update an `AGENTS.md`.

---

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/fact-finder/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** One edit.

  In `### Phase 1: Context & Mapping`, step 2, the table of upstream sections currently reads:

  ```
  | Artifact | Section | What it gives you |
  |---|---|---|
  | Epic | **Research Questions for Fact-Finder** | your starting research vectors, already as a checklist |
  | Epic | **Dependencies** | which epics must exist first |
  | Feature brief | **Open Questions for Fact-Finder** | your starting research vectors |
  | Feature brief | **Integration Points** | where in the existing system to look |
  | Feature brief | **Inherited Constraints** | what to treat as fixed rather than investigate |
  ```

  Add one row for the epic, directly after the existing `| Epic | **Dependencies** | ... |` row, so the three Epic rows sit together:

  ```
  | Epic | **Inherited Constraints** | what to treat as fixed rather than investigate |
  ```

  The wording of the third column must match the Feature brief row's wording **exactly** — the point is that one section name means one thing on both routes. Change nothing else in the table or the surrounding steps.

- **Interfaces / Pseudocode:** none.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:571-579`. See **Verified Current State** for the excerpt.
- **Done When:** the table has six data rows, three for Epic and three for Feature brief; the new Epic row reads `| Epic | **Inherited Constraints** | what to treat as fixed rather than investigate |`; its third column is byte-identical to the Feature brief `Inherited Constraints` row's third column; nothing else in the file changed; YAML frontmatter parses with `name: fact-finder` intact.
- **Verify:** `grep -c "what to treat as fixed rather than investigate" .claude/skills/fact-finder/SKILL.md` → `2`
- **Context:** `/fact-finder` is the reader this whole chain exists to serve, and its intake table is the only place that decides which upstream sections it looks at. The table already grants a feature brief three channels and an epic two; the missing one is exactly the constraint channel. One row closes it. This task is deliberately tiny and mechanical — it is the hinge the other two tasks depend on, and a `Verify:` command can assert it because the requirement is a literal string appearing twice. `.claude/**` is outside DOX; do **not** create or update an `AGENTS.md`.

---

## Verification Tasks (If Assumptions Exist)

None. Every claim in **Verified Current State** was obtained by direct `Read` at the cited lines. The two claims that matter most were each confirmed by targeted grep: that nothing downstream reads a spec directly (`/fact-finder` globs only `epics/` and `features/`), and that `## Inherited Constraints` is the literal heading the feature brief already uses.

Caveat for the implementer rather than an assumption: **line numbers are as of 2026-07-29 and shift as each task's own edits land.** Anchor on the quoted text.

## Acceptance Criteria

- `grep -rn "^## Inherited Constraints" .claude/skills/` returns three hits — `feature-architect`, `specifier`, `epic-planner`.
- `grep -c "what to treat as fixed rather than investigate" .claude/skills/fact-finder/SKILL.md` returns `2`.
- A spec written for a subsystem carries `## Inherited Constraints` with the host system's fixed boundaries; the epics derived from it each carry the subset that applies; `/fact-finder` reads them and does not re-investigate them.
- A greenfield spec and its epics each carry the section reading `None`, costing one line apiece.
- `**Known Constraints**` still exists under `## Implementation Considerations (For Planner)` in the epic template — the advisory channel was not merged away.
- `/mission-architect` and `/feature-architect` are unmodified.
- All three edited files' YAML frontmatter parses, each `name:` intact.
- No `AGENTS.md` created anywhere under `.claude/`.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Give the spec template an Inherited Constraints section and point step 4 at it
- [ ] PLAN-002: Carry inherited constraints into the epic template and Phase 3 extraction
- [ ] PLAN-003: Add the Epic Inherited Constraints row to fact-finder's intake table

## References

- Review of `/epic-planner`, this session, 2026-07-29 — finding 1
- `2e20817` — findings 2, 4 and 5 from the same review, fixed directly
- `thoughts/shared/plans/2026-07-29-Large-Feature-Routing.md` — the plan that created the subsystem route this one finishes plumbing
- `.claude/skills/feature-architect/SKILL.md:183` — the section name being reused
- `.claude/skills/fact-finder/SKILL.md:571-579` — the intake table that decides what travels
