# Upstream Skills Fixes Implementation Plan

Repairs the three greenfield upstream skills — `/mission-architect`, `/specifier`, `/epic-planner` — following the mission-architect review of 2026-07-29.

## Inputs

- **Fact report(s) used:** none. This plan deviates from the normal `/fact-finder → /planner` gate: the research was done inline in the originating session by direct `Read` of the four skill files plus cross-reference greps. Every claim in **Verified Current State** below carries `path:line` evidence obtained that way, so the plan meets the planner's evidence bar even though no `thoughts/shared/facts/` artifact exists.
- **User request summary:** review `/mission-architect`, then plan the fixes. Four routing forks were put to the user and answered:
  1. **Scope** — all three skills, not mission-architect alone.
  2. **Open Questions hand-off** — wire it up, do not delete the sections.
  3. **`greenfield-feature`** — drop it; `/feature-architect` owns everything with existing code.
  4. **Forbidden terms** — principle-based rule, not a hard word list. The approved replacement text is reproduced verbatim in PLAN-001.

## Verified Current State

- **Fact:** `/mission-architect` routes brownfield work to `fact-finder → planner`, skipping `/feature-architect` entirely. The string `feature-architect` does not occur anywhere in the file.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:46-49`
- **Excerpt:**
  ```
  4. **Greenfield Focus**
     - This agent is for NEW projects or COMPLETELY NEW features.
     - If the user wants to modify/extend existing functionality, redirect them to the Fact-Finder → Planner workflow.
     - How to detect: If they reference existing files, functions, or modules, ask: "Are you adding entirely new functionality, or modifying existing code?"
  ```

- **Fact:** Every other copy of the pipeline routes brownfield through `/feature-architect` first, and `/feature-architect` treats its inherited-constraint capture as a hard requirement that `/fact-finder` and `/planner` depend on.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:19`, `.claude/skills/feature-architect/SKILL.md:44-46`, `.claude/hooks/session-start:20`
- **Excerpt:**
  ```
  | Significant new feature in existing system | **`feature-architect`** → `fact-finder` → `planner` |
  ...
  3. **Explicit constraint capture**
     - Every inherited constraint (existing tech, patterns, data models, API contracts) must be explicitly documented in the feature brief.
     - Do not leave constraints implicit. `/fact-finder` and `/planner` depend on knowing what's fixed.
  ```

- **Fact:** `/mission-architect` mandates `AskUserQuestion` for all Phase 1 discovery, but the Phase 1 questions are open-ended and have no option set.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:54`, `.claude/skills/mission-architect/SKILL.md:86-88`
- **Excerpt:**
  ```
  - **AskUserQuestion**: Your primary tool during Phase 1. Use for all discovery questions.
  ...
     - **Value & Problem**:
       - "What specific problem does this solve?"
       - "Who experiences this problem? (end users, developers, businesses, etc.)"
  ```

- **Fact:** The forbidden-terms list contains three unexpanded template placeholders, so those entries match nothing. The same defect exists in `/specifier` with five placeholders.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:23`, `.claude/skills/specifier/SKILL.md:28`
- **Excerpt:**
  ```
  - Forbidden terms: API, database, frontend, backend, REST, GraphQL, [Framework], [Language], [Database], microservices, containers.
  ...
  - Forbidden terms: [Framework], [Language], [Database], [CloudProvider], [ContainerTech], REST, GraphQL (unless describing abstract interaction patterns, not implementations).
  ```

- **Fact:** `/mission-architect` writes `## Open Questions for Specifier`, but `/specifier`'s intake extracts only four things and Open Questions is not among them. Its validation checklist does not look for the section either.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:226-229`, `.claude/skills/specifier/SKILL.md:88-92`
- **Excerpt:**
  ```
  3. **Extract Key Inputs**
     - Essential capabilities → System components & behaviors
     - Success criteria → Acceptance tests (abstract)
     - Constraints → Non-functional requirements
     - Non-goals → Scope boundaries for the spec
  ```

- **Fact:** The same break repeats one stage later: `/specifier` writes `## Open Questions for Epic Planner`, and `/epic-planner`'s validation and extraction steps do not read it.
- **Evidence:** `.claude/skills/specifier/SKILL.md:327-330`, `.claude/skills/epic-planner/SKILL.md:78-82`, `.claude/skills/epic-planner/SKILL.md:105-108`
- **Excerpt:**
  ```
  2. **Validate Completeness**
     - Ensure the spec includes:
       - [ ] Architecture (components/workflows)
       - [ ] Data model
       - [ ] Acceptance criteria
  ```

- **Fact:** The chain does *not* break at the epic→fact-finder boundary — `/fact-finder` reads the epic's forward-facing section by name. Only the two upstream hand-offs are broken.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:575`
- **Excerpt:**
  ```
  | Epic | **Research Questions for Fact-Finder** | your starting research vectors, already as a checklist |
  ```

- **Fact:** All three skills carry a `## Response Format (Structured Output)` block claiming an "Agent Delegation (when invoked by other agents)" mode that mandates a "structured message envelope" the files never define. All three are Skills in `.claude/skills/`, not agents in `.claude/agents/`, so no `subagent_type` can reach them. In each file the block's only real content — the document frontmatter — is restated verbatim ~15 lines later inside `## Output Format (STRICT)`.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:123-148`, `.claude/skills/specifier/SKILL.md:112-138`, `.claude/skills/epic-planner/SKILL.md:132-159`
- **Excerpt:**
  ```
  1. **Interactive Discovery (with user)**: Natural conversation flow via AskUserQuestion — no structured format needed during discovery phase
  2. **Agent Delegation (when invoked by other agents)**: Use structured message envelope for machine-readable responses
  ```

- **Fact:** Each skill's document frontmatter carries a self-naming `[identifier]` field whose value is never defined and which no downstream reader consumes — `/specifier` keys off `mission-source`, `/epic-planner` off `spec-source`.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:159`, `.claude/skills/specifier/SKILL.md:150`, `.claude/skills/epic-planner/SKILL.md:170`
- **Excerpt:**
  ```
  mission-architect: [identifier]
  specifier: [identifier]
  epic-planner: [identifier]
  ```

- **Fact:** The `type:` enum admits `greenfield-feature`, overlapping `/feature-architect`'s stated territory. The enum appears exactly four times, all inside the two files this plan touches — nothing in `CLAUDE.md`, `README.md`, `AGENTS.md` or the hook references it.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:139`, `.claude/skills/mission-architect/SKILL.md:161`, `.claude/skills/specifier/SKILL.md:129`, `.claude/skills/specifier/SKILL.md:152`
- **Excerpt:**
  ```
  type: "greenfield-project" | "greenfield-feature"
  ```

- **Fact:** Two skills use `AskUserQuestion` to deliver a message rather than ask one.
- **Evidence:** `.claude/skills/specifier/SKILL.md:86`, `.claude/skills/epic-planner/SKILL.md:82`
- **Excerpt:**
  ```
  - If incomplete, STOP and use AskUserQuestion to inform the user and recommend refinement with the Mission Architect.
  - If incomplete, use AskUserQuestion to STOP and recommend the user refine the spec with the Specifier.
  ```

## Goals / Non-Goals

**Goals**

- `/mission-architect` routes brownfield work to `/feature-architect`, matching the five existing copies of the pipeline.
- The mission → spec → epic Open Questions channel is load-bearing: every question written upstream is read, and either resolved or explicitly carried forward, downstream.
- `/feature-architect` is the single owner of work in an existing codebase; `greenfield-feature` is gone.
- The technology ban is stated as a principle that can be applied, not a word list with unexpanded placeholders.
- `AskUserQuestion` is used only where a 2–4 option set is genuine.
- The dead agent-delegation blocks and dead frontmatter fields are removed from all three files.

**Non-Goals**

- No change to `/feature-architect`, `/fact-finder`, `/planner`, `/implement`, or the worker agents. The epic → fact-finder hand-off already works (`fact-finder/SKILL.md:575`) and is not touched.
- No change to `CLAUDE.md`, `README.md`, root `AGENTS.md`, or `.claude/hooks/session-start`. The pipeline ordering they state is already correct — this plan brings `/mission-architect` into line with them, not the reverse.
- No `AGENTS.md` work. `.claude/**` is deliberately outside DOX (`CLAUDE.md`, "Scope in this repo"), and `031e491` removed the `AGENTS.md` files that used to live there. Do not create one.
- No rewrite of the output document templates beyond the specific sections named. The mission/spec/epic artifact shapes stay as they are.

## Design Overview

- Three files, three tasks, one per file. Every edit to a given file is merged into that file's single task per the planner's same-file rule — splitting buys no parallelism because two tasks touching one file can never share a wave, and costs one cold subagent context each.
- The three files are disjoint and no task consumes another's output, so all three run concurrently in **Wave 1**.
- Two kinds of edit are interleaved in each task: *deletions* (the dead envelope block, the dead identifier field, `greenfield-feature`) which are mechanical, and *rewrites* (routing, tool scoping, the Open Questions wiring) which are prose. The literal replacement text is supplied in each task so a `haiku` implementer does not have to invent wording.
- **Ordering hazard within each file:** the dead `## Response Format (Structured Output)` block contains a *duplicate* copy of the frontmatter template. Delete that block **first**, then edit the single surviving frontmatter template inside `## Output Format (STRICT)`. Editing frontmatter first leaves the implementer chasing two copies and risks fixing only one. Each task's instruction is already ordered to do this.
- The Open Questions wiring is a three-part contract, and all three parts must land or it fails silently: the *writer* must always emit the section (writing `None` when empty), the *reader* must validate its presence and extract from it, and the reader must record the disposition of each question in its own output. PLAN-001 and PLAN-002 each play both roles.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002, PLAN-003 | `.claude/skills/mission-architect/SKILL.md`, `.claude/skills/specifier/SKILL.md`, `.claude/skills/epic-planner/SKILL.md` | One file each, fully disjoint, no task reads another's output |

Tasks in the same wave run concurrently. No path may appear twice within a wave. **Wave 1 self-check:** three paths, each listed once, no `allowedAdjacentEdits` on any task — disjoint.

## Implementation Instructions (For Implementor)

---

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/mission-architect/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these nine edits, **in this order**:

  1. **Delete the entire `## Response Format (Structured Output)` section** — from the `## Response Format (Structured Output)` heading through the line `When writing mission statement files, use the document frontmatter shown above (see "## Output Format (STRICT)" section below for full file structure).` inclusive (currently lines 123–148). It documents a delegation mode that cannot occur and duplicates the frontmatter template that follows. Do this first: it removes one of the two frontmatter copies, so edit 5 then has a single target.

  2. **Replace the "No Implementation Details" rule** — the block starting `1. **No Implementation Details**` through the `- **Boundary**: "This does NOT include..."` line (currently lines 20–28) — with exactly this text, preserving the surrounding numbered-list indentation:

     ```
     1. **No Implementation Details**
        - Do not name a specific language, framework, database, cloud provider, or vendor, and do not prescribe an architecture (microservices, event bus, containers) or an algorithm.
        - Words like *API* or *database* are allowed only when they name what the user gets — "enable developers to query the catalog programmatically" — never when they name what you will build with.
        - Illustrative, not exhaustive: PostgreSQL, React, Kubernetes, REST, GraphQL, microservices, containers.
        - Allowed framing:
          - **Value**: "Enable users to..."
          - **Capability**: "The system will support..."
          - **Boundary**: "This does NOT include..."
     ```

  3. **Replace the "Greenfield Focus" rule** (currently lines 46–49) with a rule that names `/feature-architect` and a routing table. Use exactly:

     ```
     4. **Greenfield Focus**
        - This skill is for entirely new projects. Anything that lands in an existing codebase belongs to `/feature-architect`, which captures the constraints inherited from that codebase — constraints `/fact-finder` and `/planner` depend on and that this skill cannot produce.
        - How to detect: if the user references existing files, functions, modules, or a running system, they are not greenfield.

     | Scenario | Route |
     |---|---|
     | Entirely new project, no existing code | **this skill** → `/specifier` → `/epic-planner` → `/fact-finder` → `/planner` → `/implement` |
     | Significant new feature in an existing system | `/feature-architect` → `/fact-finder` → `/planner` → `/implement` |
     | Small change or extension to existing functionality | `/fact-finder` → `/planner` → `/implement` |

     When redirecting, say so plainly: "This lands in an existing codebase, so `/feature-architect` is the right entry point — it captures what the existing system already fixes, which a mission statement can't."
     ```

  4. **Rescope the `AskUserQuestion` bullet** (currently line 54). Replace it with:

     ```
     - **AskUserQuestion**: For forced-choice moments only — prioritising among capabilities ("if you could have only one, which?") and the Phase 1 convergence check. Open-ended discovery runs as ordinary conversation: a question like "what problem does this solve?" has no option set, and inventing one anchors the user to options you made up, which is the one thing vision discovery must not do.
     ```

  5. **Edit the surviving frontmatter template** inside `## Output Format (STRICT)` — the one that follows `File: thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md`, appearing in both the fenced template and the required-structure block. Make three changes: delete the `mission-architect: [identifier]` line; change `type: "greenfield-project" | "greenfield-feature"` to `type: "greenfield-project"`; change `status: complete` to `status: draft | complete | superseded`. After edit 1 there is exactly one copy — if you find two, edit 1 was not applied.

  6. **Update the opening description** (currently line 8) so it no longer claims new features in existing applications. Replace `You help users discover, refine, and articulate the vision for greenfield projects (100% new) or greenfield functionalities (completely new features for existing applications).` with `You help users discover, refine, and articulate the vision for greenfield projects — entirely new, with no existing codebase. New features inside an existing system belong to `/feature-architect`.`

  7. **Make `## Open Questions for Specifier` required.** In the output template (currently lines 226–229), replace the `[Optional: ...]` line and its bullet with:

     ```
     Questions that emerged during discovery which the Specifier must resolve or explicitly defer. `/specifier` reads this section by name and records the disposition of every entry, so the section is **required** — write `None` when there are none rather than omitting it.

     - [Question about scope, trade-offs, or clarifications]
     ```

  8. **Add a pre-write existence check** to Phase 2 (currently lines 117–121), after the line naming the output path:

     ```
     Before writing, `Glob` for the target path. Mission statements are write-once (`thoughts/shared/AGENTS.md`) and `Write` overwrites silently — if the file exists, stop and ask the user whether to supersede it (set the existing file's `status:` to `superseded`) or pick a different name.
     ```

  9. **Soften the numeric gates** in the Final Checklist (currently lines 253–263). Change `I can list 3-7 essential capabilities that MUST exist.` to `I can list the essential capabilities that MUST exist — typically 3-7, but a genuinely small project may have fewer.`; change `I can list 3-7 things that are explicitly OUT of scope.` to `I can list what is explicitly OUT of scope — typically 3-7, and at least one.`; change `I have at least 3 measurable success criteria from a user perspective.` to `I have measurable success criteria from a user perspective — at least one per essential capability.` Leave the remaining four checkboxes and the closing `If any checkbox is unchecked, continue the conversation.` untouched: those gates are qualitative and stay hard.

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:8`, `:20-28`, `:46-49`, `:54`, `:123-148`, `:157-163`, `:226-229`, `:253-263`; cross-checked against `.claude/skills/feature-architect/SKILL.md:14-22` (the routing table this mirrors) and `.claude/skills/feature-architect/SKILL.md:44-46` (why the redirect matters). See **Verified Current State** for excerpts.
- **Done When:** All nine edits are applied. Specifically: the file contains no `## Response Format (Structured Output)` heading; no `[Framework]`, `[Language]` or `[Database]` placeholder; no `greenfield-feature`; no `mission-architect: [identifier]`; exactly one frontmatter template; at least one occurrence of `feature-architect`; a routing table with three scenario rows; `status: draft | complete | superseded`; and a `Glob`-before-`Write` instruction in Phase 2.
- **Verify:** `none — requires review` — the deletions are greppable but the six rewrites are prose whose correctness is a judgment call, and the diff is far past the fast path's size bar.
- **Context:** `/mission-architect` is the greenfield entry point, so its stale brownfield redirect is the pipeline's highest-traffic wrong turn: a user with an existing codebase gets sent straight to `/fact-finder` with no feature brief, losing the inherited-constraint capture that `/feature-architect` exists to produce. The remaining edits remove instructions the skill cannot follow (an option-set tool aimed at open questions, a word list of unexpanded placeholders) and dead weight that makes the file look like it has contracts it does not have. Note that `.claude/**` is outside DOX — do **not** create or update an `AGENTS.md` for this change.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/specifier/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these eight edits, **in this order**:

  1. **Delete the entire `## Response Format (Structured Output)` section** — from that heading through the line `When writing specification files, use the document frontmatter shown above (see "## Output Format (STRICT)" section below for full file structure).` inclusive (currently lines 112–138). Same reason and same ordering rule as PLAN-001: it removes the duplicate frontmatter copy so edit 6 has a single target.

  2. **Replace the forbidden-terms line** in the "No Technology Stack Decisions" rule (currently line 28) with:

     ```
        - Do not name a specific language, framework, database, cloud provider, or vendor, and do not commit to a wire protocol or serialization format. Naming an interaction *pattern* abstractly is fine; naming the technology that implements it is not.
     ```

     Leave the surrounding rule heading and the "Allowed abstractions" bullets that follow it unchanged.

  3. **Add Open Questions to the intake validation** (currently lines 79–86). Append a sixth checkbox to the completeness list: `- [ ] Open Questions for Specifier (may read "None", but the section must be present)`.

  4. **Add Open Questions to Extract Key Inputs** (currently lines 88–92). Append a fifth bullet: `- Open Questions for Specifier → items you must resolve in this spec or explicitly defer, recorded in "Mission Open Questions (Resolved / Deferred)"`.

  5. **Fix the AskUserQuestion misuse** at the end of the validation step (currently line 86). Replace `If incomplete, STOP and use AskUserQuestion to inform the user and recommend refinement with the Mission Architect.` with `If incomplete, stop and tell the user which sections are missing, and recommend refinement with /mission-architect. Do not use AskUserQuestion to deliver a message — it is for choosing between options, not for informing.`

  6. **Edit the surviving frontmatter template** inside `## Output Format (STRICT)` — the one following `File: thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md`, in both the fenced template and the required-structure block. Delete the `specifier: [identifier]` line; change `type: "greenfield-project" | "greenfield-feature"` to `type: "greenfield-project"`; change `status: complete` to `status: draft | complete | superseded`. After edit 1 there is exactly one copy.

  7. **Add a new required section to the spec output template**, immediately **before** the existing `## Open Questions for Epic Planner` section (currently at line 327):

     ```
     ## Mission Open Questions (Resolved / Deferred)

     Every entry from the mission's "Open Questions for Specifier", with its disposition. Required — write `None` if the mission listed none.

     | Mission Question | Disposition | Where |
     |---|---|---|
     | [Question as written in the mission] | Resolved / Deferred | [Spec section that answers it, or why it is deferred and to whom] |
     ```

  8. **Make `## Open Questions for Epic Planner` required** (currently lines 327–330). Replace its bracketed description line with:

     ```
     Questions that emerged during specification which the Epic Planner must resolve or carry forward. `/epic-planner` reads this section by name and records the disposition of every entry, so the section is **required** — write `None` when there are none rather than omitting it.
     ```

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/specifier/SKILL.md:28`, `:79-86`, `:88-92`, `:112-138`, `:148-154`, `:327-330`; the upstream section this now reads is `.claude/skills/mission-architect/SKILL.md:226-229`. See **Verified Current State** for excerpts.
- **Done When:** All eight edits are applied. Specifically: the file contains no `## Response Format (Structured Output)` heading; no `[Framework]`, `[Language]`, `[Database]`, `[CloudProvider]` or `[ContainerTech]` placeholder; no `greenfield-feature`; no `specifier: [identifier]`; exactly one frontmatter template; `Open Questions` appears in both the Phase 1 validation checklist and the Extract Key Inputs list; a `## Mission Open Questions (Resolved / Deferred)` section exists in the output template immediately before `## Open Questions for Epic Planner`; and no instruction tells the skill to use AskUserQuestion to inform.
- **Verify:** `none — requires review` — the reader-side wiring is only correct if the new intake steps actually reference the section name the mission writes, which requires reading both files.
- **Context:** `/specifier` is the *reader* half of the mission→spec Open Questions contract that PLAN-001 fixes on the writer side, and simultaneously the *writer* half of the spec→epic contract PLAN-003 fixes. Both halves must land or the channel stays broken: today the mission's hand-off section is written into a void, so ambiguity surfaced during vision discovery is silently dropped at the very next stage. The remaining edits mirror PLAN-001's cleanups in this file — same dead envelope block, same unexpanded placeholders, same dead identifier field. `.claude/**` is outside DOX — do **not** create or update an `AGENTS.md`.

---

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/epic-planner/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these five edits, **in this order**:

  1. **Delete the entire `## Response Format (Structured Output)` section** — from that heading through the line `When writing epic files, use the document frontmatter shown above (see "## Output Format (STRICT)" section below for full file structure).` inclusive (currently lines 132–159). Same reason and ordering rule as PLAN-001.

  2. **Add Open Questions to the intake validation** (currently lines 77–82). Append a fourth checkbox to the completeness list: `- [ ] Open Questions for Epic Planner (may read "None", but the section must be present)`.

  3. **Fix the AskUserQuestion misuse** at the end of that step (currently line 82). Replace `If incomplete, use AskUserQuestion to STOP and recommend the user refine the spec with the Specifier.` with `If incomplete, stop and tell the user which sections are missing, and recommend refinement with /specifier. Do not use AskUserQuestion to deliver a message — it is for choosing between options, not for informing.`

  4. **Wire the spec's open questions into the epic output.** In Phase 3 "Extract from Spec" (currently lines 105–108), append a fourth bullet:

     ```
        - Which entries from the spec's "Open Questions for Epic Planner" fall inside this epic? Each one must be either answered in the epic's own text or carried forward verbatim into that epic's "Research Questions for Fact-Finder" — `/fact-finder` reads that section by name (`.claude/skills/fact-finder/SKILL.md:575`) and it is the only forward channel out of this stage. A question that fits no epic goes in the epic set's coverage note, never dropped.
     ```

  5. **Edit the surviving frontmatter template** inside `## Output Format (STRICT)` — the one following `File: thoughts/shared/epics/YYYY-MM-DD-[Epic-Name].md`. Delete the `epic-planner: [identifier]` line. Leave `status: ready-for-research`, `epic-id:` and `dependencies:` unchanged — those are read downstream. After edit 1 there is exactly one copy.

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/epic-planner/SKILL.md:77-82`, `:105-108`, `:132-159`, `:168-176`; the upstream section this now reads is `.claude/skills/specifier/SKILL.md:327-330`; the forward channel it feeds is `.claude/skills/fact-finder/SKILL.md:575`. See **Verified Current State** for excerpts.
- **Done When:** All five edits are applied. Specifically: the file contains no `## Response Format (Structured Output)` heading; no `epic-planner: [identifier]`; exactly one frontmatter template; `Open Questions` appears in the Phase 1 validation checklist; Phase 3 "Extract from Spec" carries a fourth bullet routing spec open questions into "Research Questions for Fact-Finder"; and no instruction tells the skill to use AskUserQuestion to inform. The file's own `## Open Questions` output section (currently line 329) is a *backward* channel to the user/Specifier and is **left unchanged**.
- **Verify:** `none — requires review` — edit 4 is only correct if the new bullet names the exact section `/fact-finder` greps for, which requires cross-reading `fact-finder/SKILL.md`.
- **Context:** `/epic-planner` is the reader half of the spec→epic Open Questions contract, and the last chance to catch an unresolved question before the pipeline crosses into research. Downstream of here the channel already works — `/fact-finder` reads each epic's "Research Questions for Fact-Finder" by name — so routing spec questions into that section is what connects the whole chain end to end. Note this file's own `## Open Questions` section points *backwards* at the user and Specifier and is deliberately untouched; do not confuse the two. `.claude/**` is outside DOX — do **not** create or update an `AGENTS.md`.

---

## Verification Tasks (If Assumptions Exist)

None. Every claim in **Verified Current State** was obtained by direct `Read` of the file at the cited lines, and the two cross-file claims (`greenfield-feature` appearing in exactly four places; `feature-architect` appearing nowhere in `mission-architect/SKILL.md`) were confirmed by repository-wide `grep`. No task in this plan rests on an unverified assumption.

One caveat for the implementer rather than an assumption: **all line numbers in this plan are as of 2026-07-29 and shift as each task's own edits land.** Anchor on the quoted text, not the line number.

## Acceptance Criteria

- Invoking `/mission-architect` with a request that touches an existing codebase produces a redirect to `/feature-architect`, not to `/fact-finder`.
- A mission statement always carries an `## Open Questions for Specifier` section (possibly `None`), and the resulting spec accounts for every entry in a `## Mission Open Questions (Resolved / Deferred)` table.
- A spec always carries an `## Open Questions for Epic Planner` section (possibly `None`), and every entry is either answered in an epic or present in some epic's `## Research Questions for Fact-Finder`.
- `grep -rn "greenfield-feature" .claude/` returns nothing.
- `grep -rn "Response Format (Structured Output)" .claude/skills/mission-architect .claude/skills/specifier .claude/skills/epic-planner` returns nothing.
- `grep -rn "\[Framework\]\|\[Language\]\|\[Database\]\|\[CloudProvider\]\|\[ContainerTech\]" .claude/skills/mission-architect .claude/skills/specifier` returns nothing.
- No skill instructs the use of `AskUserQuestion` to deliver information rather than offer a choice.
- `CLAUDE.md`, `README.md`, root `AGENTS.md` and `.claude/hooks/session-start` are unmodified — the pipeline they describe was already right.
- No `AGENTS.md` file is created anywhere under `.claude/`.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Fix mission-architect routing, tool scope, term ban, and dead blocks
- [ ] PLAN-002: Wire specifier's Open Questions intake and mirror the cleanups
- [ ] PLAN-003: Wire epic-planner's Open Questions intake and mirror the cleanups

## References

- Review of `/mission-architect`, this session, 2026-07-29 — ten findings, four routing forks decided by the user
- `.claude/skills/feature-architect/SKILL.md:14-22` — the routing table PLAN-001 mirrors
- `.claude/skills/fact-finder/SKILL.md:571-581` — the downstream reader that already works
- `CLAUDE.md`, "Scope in this repo" — why `.claude/**` takes no `AGENTS.md`
- `CLAUDE.md`, "The pipeline definition is duplicated" — why this plan changes the skill and not the five pipeline copies
