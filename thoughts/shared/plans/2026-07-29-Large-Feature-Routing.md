# Large-Feature Routing Implementation Plan

Gives the "feature too large for one stream" case a working entry point, and makes the inherited constraints travel with it. Follows the specifier review of 2026-07-29 (finding 2).

## Inputs

- **Fact report(s) used:** none. As with `2026-07-29-Upstream-Skills-Fixes.md`, the research was done inline by direct `Read` of the four skill files plus targeted greps over the pipeline copies. Every claim in **Verified Current State** carries `path:line` evidence obtained that way.
- **User request summary:** the review of `/specifier` found that the "feature large enough to need epic decomposition" case has no valid entry point. Three resolutions were put to the user, who chose **option 2 — such a feature should have its own mission** — and asked for the consequences to be worked through rather than assumed. The consequence that drove this plan's shape: option 2 alone loses the inherited-constraint capture that `/feature-architect` exists to provide, because `/mission-architect` and `/specifier` are both forbidden from discussing technology and `/fact-finder` does not run until two stages later. The mitigation is therefore **part of the plan, not optional garnish**: the mission must record the host system as a constraint, and the specifier must read that host system's existing spec before settling architecture.

## Verified Current State

- **Fact:** `/feature-architect` routes an oversized feature to `/specifier`.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:12`
- **Excerpt:**
  ```
  A single feature is one stream of work, so brownfield skips `/epic-planner` — epic decomposition exists to cut a whole specification into several parallel streams. If a feature turns out to be large enough to need that, it is really a small project: route it through `/specifier` first.
  ```

- **Fact:** `/specifier` hard-refuses any input that is not a mission statement in `thoughts/shared/missions/`, so the route above dead-ends. A feature routed there has a brief in `thoughts/shared/features/`.
- **Evidence:** `.claude/skills/specifier/SKILL.md:20-24`
- **Excerpt:**
  ```
  1. **Mission Statement Required**
     - You CANNOT proceed without a mission statement from `thoughts/shared/missions/`.
     - If the user asks you to create a spec without a mission, respond:
       - "I need a mission statement first. Please use the Mission Architect agent to create one, or point me to an existing mission document."
  ```

- **Fact:** `/mission-architect` now refuses anything touching an existing codebase, on a binary test applied before discovery begins. Combined with the fact above, the oversized-feature case currently has **no** valid entry point into the spec/epic path.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:47-48`, `.claude/skills/mission-architect/SKILL.md:87`
- **Excerpt:**
  ```
     - This skill is for entirely new projects. Anything that lands in an existing codebase belongs to `/feature-architect`, which captures the constraints inherited from that codebase — constraints `/fact-finder` and `/planner` depend on and that this skill cannot produce.
     - How to detect: if the user references existing files, functions, modules, or a running system, they are not greenfield.
  ...
     - **Routing gate — settle this before any discovery.** Establish whether code already exists. If the user references existing files, modules, or a running system, stop and redirect per the routing table above.
  ```

- **Fact:** `/feature-architect` treats inherited-constraint capture as a hard requirement precisely because the downstream stages depend on it. This is what option 2 must not lose.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:44-46`
- **Excerpt:**
  ```
  3. **Explicit constraint capture**
     - Every inherited constraint (existing tech, patterns, data models, API contracts) must be explicitly documented in the feature brief.
     - Do not leave constraints implicit. `/fact-finder` and `/planner` depend on knowing what's fixed.
  ```

- **Fact:** The mission template already has a `Constraints (Non-Negotiable)` section, so recording the host system needs no new section — only an instruction to use it.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:203-205`
- **Excerpt:**
  ```
  **Constraints (Non-Negotiable)**:
  - [Any hard limits: scale, performance, compatibility, compliance, etc.]
  - [Note: These are "MUST" constraints, not "should" preferences]
  ```

- **Fact:** `/specifier` already holds `Read` and `Glob` and already reads from `thoughts/shared/specs/`, so having it read a host system's spec requires no new tool grant.
- **Evidence:** `.claude/skills/specifier/SKILL.md:49-51`
- **Excerpt:**
  ```
  - **Read**: Read the mission statement and any related context.
  - **Write**: Create the specification document.
  - **Glob**: Find mission statements or related specs.
  ```

- **Fact:** A host system's spec is itself technology-agnostic — `/specifier` wrote it under a rule forbidding named technologies. So reading one cannot leak a stack name into the new spec, and the mitigation does not breach the specifier's own non-negotiable.
- **Evidence:** `.claude/skills/specifier/SKILL.md:26-32`
- **Excerpt:**
  ```
  2. **No Technology Stack Decisions**
     - Do not name a specific language, framework, database, cloud provider, deployment platform, or vendor, and do not commit to a wire protocol or serialization format. Naming an interaction *pattern* abstractly is fine; naming the technology that implements it is not.
  ```

- **Fact:** `CLAUDE.md` states the route being changed, and cites the very line this plan edits — but that sentence is **not in `HEAD`**. It is part of a 191-line uncommitted rewrite of `CLAUDE.md` already in the working tree, alongside uncommitted changes to `README.md` (134 lines), `AGENTS.md` (8), `thoughts/shared/AGENTS.md` (19) and `thoughts/shared/plans/AGENTS.md` (88).
- **Evidence:** `git diff -- CLAUDE.md` line 46 of the diff; `git show HEAD:CLAUDE.md | grep "really a small project"` returns nothing
- **Excerpt:** (from the working-copy diff, a `+` line)
  ```
  +Brownfield skips `/epic-planner` on purpose: epic decomposition exists to cut a whole specification into several parallel streams. A feature large enough to need that is really a small project — route it through `/specifier` (`.claude/skills/feature-architect/SKILL.md:12`).
  ```
  This is why no task in this plan touches `CLAUDE.md`: an implementer editing it would collide with active work, and the orchestrator committing it would sweep 191 lines of someone else's in-progress rewrite into a commit about routing. See **Deferred** below.

- **Fact:** `README.md`, root `AGENTS.md` and the SessionStart hook describe the brownfield route but do **not** state the oversized-feature escape hatch, so none of them is made wrong by this change — they are merely silent on the new case.
- **Evidence:** `README.md:18`, `AGENTS.md:63`, `.claude/hooks/session-start:9`
- **Excerpt:**
  ```
  Brownfield skips `/epic-planner`: decomposition into epics exists to split a whole specification into parallel streams, and a single feature is a single stream.
  - Brownfield: `/feature-architect` → `/fact-finder` → `/planner` → `/implement` (a single feature is a single stream, so epic decomposition does not apply)
  /feature-architect — Brownfield features: define new feature in existing system, output feature brief to thoughts/shared/features/. Use before /fact-finder — brownfield skips /epic-planner, which exists to cut a whole spec into several streams.
  ```

## Goals / Non-Goals

**Goals**

- The oversized-feature case has exactly one valid entry point: `/mission-architect`, admitted by a stated test rather than by exception.
- `/mission-architect`'s routing gate still fires early and still redirects ordinary features — it gains a carve-out, not a loophole.
- The host system's constraints reach the specifier: the mission records them, and the specifier reads the host system's spec before settling architecture.
- All three skills describe the same test in the same words, so a user gets the same answer whichever one they open first.

**Non-Goals**

- **`/specifier` does not gain `thoughts/shared/features/` as an input source.** That is option 1, which the user considered and did not choose. A mission stays the specifier's only input; `mission-source` remains its only source field. An implementer must not "helpfully" add the second source.
- **No new `type:` enum value.** A subsystem large enough for its own mission *is* a project, so `type: "greenfield-project"` covers it and the host system appears in `Constraints`. Adding a value would re-open the enum sync across `mission-architect` and `specifier` that `2026-07-29-Upstream-Skills-Fixes.md` just closed.
- **No change to `CLAUDE.md`, `README.md`, root `AGENTS.md`, or `.claude/hooks/session-start`.** The first three carry uncommitted work; the hook is clean but editing it alone would half-land a pipeline statement across the five copies `CLAUDE.md` warns about. All four are handled in **Deferred**.
- No change to `/fact-finder`, `/planner`, `/implement`, `/epic-planner`, or the worker agents.
- No `AGENTS.md` work — `.claude/**` is outside DOX.

## Design Overview

**The test, stated once and reused verbatim in all three files.** Work belongs to `/mission-architect` rather than `/feature-architect` when **both** hold:

1. It has its own value proposition — you can say why it should exist without reference to the host system's mission.
2. It is large enough to need epic decomposition — several parallel streams of work, not one.

Both, not either. Condition 1 alone describes plenty of ordinary features; condition 2 alone describes a sprawling change to existing behaviour, which is still `/feature-architect`'s problem. The two-part form is what keeps the carve-out from becoming a loophole.

**Why the mitigation is load-bearing.** Under option 2 the path is `mission-architect → specifier → epic-planner → fact-finder`. The first two stages are forbidden from naming technology, and `fact-finder` — the stage that actually reads the codebase — does not run until third. So without a mitigation the specifier commits to component boundaries, an event-vs-request posture and a data model in total ignorance of what the host system already fixes, and the mismatch surfaces during planning, on top of a finished spec and a full epic set. Two edits close that: the mission must record the host system in `Constraints (Non-Negotiable)`, and the specifier must read that host system's spec before Phase 2. The second is safe because a host spec is itself technology-agnostic (see **Verified Current State**), so the specifier can inherit boundaries without learning a stack name.

- Three files, three tasks, one per file — every edit to a file merged into that file's single task, per the planner's same-file rule.
- The files are disjoint and no task consumes another's output, so all three run concurrently in **Wave 1**. The consistency requirement between them is satisfied by this plan supplying the shared text verbatim, not by execution order.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002, PLAN-003 | `.claude/skills/mission-architect/SKILL.md`, `.claude/skills/feature-architect/SKILL.md`, `.claude/skills/specifier/SKILL.md` | One file each, fully disjoint, no task reads another's output |

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
- **Instruction:** Apply these six edits.

  1. **Replace the `description:` frontmatter line** (currently line 3) with exactly this single unwrapped line:

     ```
     description: Discover and articulate the vision for a new project — a new codebase, or a new subsystem inside an existing one that carries its own mission — via conversation. Produces a mission statement focused on why and what, not how. Use before /specifier; a single-stream feature in an existing system belongs to /feature-architect instead. Outputs to thoughts/shared/missions/.
     ```

  2. **Replace the intro sentence** (currently line 8) with exactly:

     ```
     You are the **Mission Architect**. You help users discover, refine, and articulate the vision for a new project — a new codebase, or a new subsystem inside an existing one that is large enough to carry its own mission. A single-stream feature in an existing system belongs to `/feature-architect`.
     ```

  3. **Replace the "Greenfield Focus" rule** (currently lines 46–48, the three lines beginning `4. **Greenfield Focus**`) with exactly:

     ```
     4. **Projects, Not Features**
        - This skill is for work that carries its own mission. Work belongs here rather than to `/feature-architect` only when **both** of these hold:
          1. **It has its own value proposition** — you can say why it should exist without reference to the host system's mission.
          2. **It is large enough to need epic decomposition** — several parallel streams of work, not one.
        - Both, not either. Condition 1 alone describes plenty of ordinary features; condition 2 alone describes a sprawling change to existing behaviour. Either on its own is `/feature-architect`'s problem.
        - A new codebase satisfies both trivially. An existing codebase does not disqualify the work — but if only one condition holds, redirect.
        - When the work does land inside an existing system, the host system becomes a **non-negotiable constraint** and must be recorded as one (see Phase 2). This is the constraint capture `/feature-architect` would otherwise have produced, and `/specifier` reads it.
     ```

  4. **Replace the routing table** (currently lines 50–54, the header row through the third scenario row) with exactly:

     ```
     | Scenario | Route |
     |---|---|
     | New codebase, no existing code | **this skill** → `/specifier` → `/epic-planner` → `/fact-finder` → `/planner` → `/implement` |
     | New subsystem in an existing codebase, own value proposition **and** several streams | **this skill** → `/specifier` → `/epic-planner` → `/fact-finder` → `/planner` → `/implement` — record the host system as a constraint |
     | Single-stream new feature in an existing system | `/feature-architect` → `/fact-finder` → `/planner` → `/implement` |
     | Small change or extension to existing functionality | `/fact-finder` → `/planner` → `/implement` |
     ```

  5. **Replace the Intake routing gate** (currently line 87, the bullet beginning `- **Routing gate — settle this before any discovery.**`) with exactly:

     ```
        - **Routing gate — settle this before any discovery.** First: does code already exist? If not, proceed. If it does, apply the two-condition test in "Projects, Not Features" above before going further — own value proposition **and** several parallel streams. If both hold, proceed and note that the host system must be recorded as a constraint in Phase 2. If either fails, stop and redirect per the routing table. Do not open a vision conversation and discover the mismatch halfway through it: by then the user has invested in a discussion this skill cannot finish.
     ```

  6. **Extend the mission template's constraints section.** In the output template, replace the `**Constraints (Non-Negotiable)**:` block (currently lines 203–205, that label plus its two bracketed bullets) with exactly:

     ```
     **Constraints (Non-Negotiable)**:
     - [Any hard limits: scale, performance, compatibility, compliance, etc.]
     - [Note: These are "MUST" constraints, not "should" preferences]
     - **Host system** (required when this subsystem lives inside an existing codebase; omit the line entirely when it does not): [Which system it lives in, the path to that system's spec in `thoughts/shared/specs/`, and what it inherits — existing data model, established patterns, integration points. `/specifier` reads this and then reads that spec before settling architecture, so an omission here is an architecture decided in ignorance of the system it has to fit.]
     ```

  Leave the `type: "greenfield-project"` value alone — a subsystem with its own mission is a project, and adding an enum value would re-open the sync with `/specifier`.

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:3`, `:8`, `:46-48`, `:50-54`, `:87`, `:203-205`; the rationale for the constraint requirement is `.claude/skills/feature-architect/SKILL.md:44-46`. See **Verified Current State** for excerpts.
- **Done When:** All six edits are applied. Specifically: no occurrence of `entirely new, with no existing codebase` remains; the heading `4. **Projects, Not Features**` exists and the string `Greenfield Focus` does not; the two numbered conditions and the phrase `Both, not either` are present; the routing table has **four** scenario rows; the Intake gate references the two-condition test rather than a bare code-exists check; the constraints block carries a `**Host system**` line; `type: "greenfield-project"` still appears exactly once; and the YAML frontmatter still parses with `name: mission-architect` intact.
- **Verify:** `none — requires review` — six prose rewrites whose correctness is a judgment call, well past the fast path's size bar.
- **Context:** This skill's gate currently applies a binary code-exists test, which is what closed the last door on the oversized-feature case. The fix is not to weaken the gate but to give it the right question: whether the work carries its own mission, not whether a repository happens to exist. The host-system constraint line is the load-bearing half — without it the specifier decides architecture blind, which is exactly the failure `/feature-architect` was built to prevent. `.claude/**` is outside DOX — do **not** create or update an `AGENTS.md`.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/feature-architect/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these two edits.

  1. **Replace the oversized-feature paragraph** (currently line 12, the single paragraph beginning `A single feature is one stream of work`) with exactly:

     ```
     A single feature is one stream of work, so brownfield skips `/epic-planner` — epic decomposition exists to cut a whole specification into several parallel streams. If a feature turns out to need that, it is not a feature: it is a subsystem carrying its own mission, and it belongs to `/mission-architect`. The test is both of these at once — it has its own value proposition (you can say why it should exist without reference to this system's mission) **and** it needs several parallel streams. Either alone is still yours. Do not send it to `/specifier` directly: the specifier's only input is a mission, and a brief is not one.
     ```

  2. **Replace the routing table** (currently lines 16–20, the header row through the third scenario row) with exactly:

     ```
     | Scenario | Agent |
     |---|---|
     | Entirely new project (no existing code) | `mission-architect` → `specifier` → `epic-planner` → `fact-finder` → `planner` |
     | New subsystem in this system, own value proposition **and** several streams | `mission-architect` → `specifier` → `epic-planner` → `fact-finder` → `planner` — the mission records this system as a constraint |
     | Significant new feature in existing system | **`feature-architect`** → `fact-finder` → `planner` |
     | Small change or extension to existing functionality | `fact-finder` → `planner` directly |
     ```

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:12`, `:14-22`; the dead end this removes is `.claude/skills/specifier/SKILL.md:20-24`. See **Verified Current State** for excerpts.
- **Done When:** Both edits are applied. Specifically: the file no longer contains `route it through \`/specifier\` first`; line 12's paragraph names `/mission-architect` as the destination and states the two-condition test including the words `Either alone is still yours`; the routing table has **four** scenario rows including the new-subsystem row; the explicit warning that the specifier's only input is a mission is present; and the YAML frontmatter still parses with `name: feature-architect` intact.
- **Verify:** `none — requires review` — two prose rewrites, and the second must stay consistent with the wording PLAN-001 puts in a different file.
- **Context:** This file is the origin of the broken route: it sent oversized features to `/specifier`, which refuses anything that is not a mission. The replacement sends them to `/mission-architect` under the same two-condition test that skill now applies, and says out loud why the old advice failed — so a reader who remembers the previous instruction understands the change rather than treating it as a typo. `.claude/**` is outside DOX — do **not** create or update an `AGENTS.md`.

---

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/skills/specifier/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Apply these four edits.

  1. **Add host-spec ingestion to Phase 1.** In `### Phase 1: Intake & Validation`, after step `3. **Extract Key Inputs**` and its bullet list (the list ending with the `Open Questions for Specifier → ...` bullet), insert a new step 4:

     ```
     4. **Load the Host System's Spec (when there is one)**
        - If the mission's `Constraints (Non-Negotiable)` section carries a **Host system** line, this subsystem lives inside an existing codebase. `Glob` and `Read` that system's spec from `thoughts/shared/specs/` before Phase 2.
        - Extract from it: existing component boundaries, the established data model, integration points, and the interaction posture already chosen (event-driven vs request-driven).
        - These are **fixed**. Your architecture must fit inside them, not propose alternatives to them. Where you cannot fit, say so in `Design Decisions` and raise it in `Open Questions for Epic Planner` — do not quietly design a system that contradicts the one it has to live in.
        - This does not breach the no-technology rule: a host spec is itself technology-agnostic, so it gives you boundaries without naming a stack.
        - If the mission has no **Host system** line, skip this step.
     ```

  2. **Note the constraint in Phase 2.** In `### Phase 2: Specification Synthesis`, immediately after the three-item list of architectural decisions to settle (the list ending `- "What data needs to be shared vs. isolated?"`), insert:

     ```
     When a host system's spec was loaded in Phase 1, these are not open decisions — they are inherited. Record what you inherited and why, not a fresh choice you did not actually get to make.
     ```

  3. **Add a validation checkbox.** In `## Validation Checklist (Before Writing the Spec)`, after the checkbox reading `- [ ] My "Open Questions for Epic Planner" section is present, reading \`None\` if there are none.`, append:

     ```
     - [ ] If the mission named a host system, I read its spec and my architecture fits the boundaries, data model and interaction posture already established there — or I have recorded the mismatch in `Design Decisions` and raised it for the Epic Planner.
     ```

  4. **Fix the stale skill-vs-agent wording** in Non-Negotiable 1 (currently lines 22–24). Replace `"I need a mission statement first. Please use the Mission Architect agent to create one, or point me to an existing mission document."` with `"I need a mission statement first. Run /mission-architect to create one, or point me to an existing mission document."`, and in the following line replace `recommend refinement with the Mission Architect` with `recommend refinement with /mission-architect`.

  Do **not** add `thoughts/shared/features/` as an input source, and do **not** reintroduce a `greenfield-feature` type value. A mission remains this skill's only input — that is a decided non-goal, not an oversight.

- **Interfaces / Pseudocode:** none — every replacement string is given literally above.
- **Evidence:** `.claude/skills/specifier/SKILL.md:20-24`, `:49-51` (the tools are already granted), `:26-32` (why reading a host spec is safe), `:89-94` (the Extract Key Inputs step this follows), `:105-108` (the architectural decisions list), `:353-364` (the checklist); the upstream field this reads is the `**Host system**` line PLAN-001 adds to `.claude/skills/mission-architect/SKILL.md`. See **Verified Current State** for excerpts.
- **Done When:** All four edits are applied. Specifically: Phase 1 has a step 4 that greps for the mission's `Host system` line and reads the host spec from `thoughts/shared/specs/`; Phase 2 carries the inherited-decisions note; the Validation Checklist has a host-system checkbox; no occurrence of `Mission Architect agent` remains; `thoughts/shared/features/` appears nowhere in the file; `greenfield-feature` appears nowhere in the file; and the YAML frontmatter still parses with `name: specifier` intact.
- **Verify:** `none — requires review` — the wiring is only correct if step 4 names the same field PLAN-001 writes into the mission template, which requires cross-reading a file edited concurrently.
- **Context:** This is the mitigation half of the user's chosen option, and without it the option is worse than the alternative it beat. Under the new route the specifier settles architecture two full stages before `/fact-finder` ever reads the codebase, so if it does not read the host system's spec here, nothing stops it committing to boundaries the host system has already ruled out — and the mismatch then surfaces during planning, on top of a finished spec and a full epic set. The tools needed are already granted and a host spec is technology-agnostic, so this costs the skill nothing it was not already allowed to do. `.claude/**` is outside DOX — do **not** create or update an `AGENTS.md`.

---

## Verification Tasks (If Assumptions Exist)

None. Every claim in **Verified Current State** was obtained by direct `Read` at the cited lines; the four cross-file claims (feature-architect's route, the specifier's refusal, the absence of the CLAUDE.md sentence from `HEAD`, and the silence of `README.md`/`AGENTS.md`/hook on the escape hatch) were each confirmed by targeted `git` and `grep` commands.

One caveat for the implementer rather than an assumption: **all line numbers are as of 2026-07-29 and shift as each task's own edits land.** Anchor on the quoted text, not the line number.

## Acceptance Criteria

- A user describing a subsystem inside an existing repo that has its own value proposition and needs several streams is accepted by `/mission-architect` and told the host system will be recorded as a constraint.
- A user describing an ordinary single-stream feature is still redirected to `/feature-architect` — the gate did not become a loophole.
- `/feature-architect` no longer routes anything to `/specifier`; `grep -n "route it through .\`\?/specifier" .claude/skills/feature-architect/SKILL.md` returns nothing.
- All three skills state the same two-condition test, and each names both conditions.
- A mission for a subsystem carries a `**Host system**` line; the resulting spec shows evidence the host spec was read (inherited boundaries recorded in `Design Decisions`, or a mismatch raised for the Epic Planner).
- `grep -rn "greenfield-feature\|thoughts/shared/features/" .claude/skills/specifier/SKILL.md` returns nothing — option 1 was not smuggled in.
- `type: "greenfield-project"` remains the only type value in `mission-architect` and `specifier`.
- All three files' YAML frontmatter still parses, each with its `name:` intact.
- `CLAUDE.md`, `README.md`, root `AGENTS.md`, `.claude/hooks/session-start` and every file under `thoughts/` are untouched by this plan's commits.
- No `AGENTS.md` is created anywhere under `.claude/`.

## Deferred — blocked on uncommitted work, do not fold into this plan

`CLAUDE.md:43` in the **working copy** states the route this plan reverses, and cites the line it edits:

```
Brownfield skips `/epic-planner` on purpose: epic decomposition exists to cut a whole specification into several parallel streams, and one feature is one stream. A feature large enough to need that is really a small project — route it through `/specifier` (`.claude/skills/feature-architect/SKILL.md:12`).
```

That sentence is **not in `HEAD`** — it is part of an in-progress 191-line rewrite of `CLAUDE.md`, alongside uncommitted changes to `README.md`, root `AGENTS.md`, `thoughts/shared/AGENTS.md` and `thoughts/shared/plans/AGENTS.md`. No task here touches those files, because an implementer would collide with live work and the orchestrator would sweep an unrelated rewrite into a routing commit.

Once that doc work is committed, the sentence should become, in substance: *a feature large enough to need epic decomposition is a subsystem with its own mission — route it through `/mission-architect`, which records the host system as a constraint.* At the same time, consider whether the new fourth route deserves a line in `README.md:18`, `AGENTS.md:63` and `.claude/hooks/session-start:9`. Those three are currently **silent** on the case rather than wrong, so they do not block anything — but `CLAUDE.md`'s own warning that the pipeline is duplicated in five places applies, and the four should move together rather than one at a time.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Replace mission-architect's binary gate with the two-condition test, require the host constraint
- [ ] PLAN-002: Route oversized features from feature-architect to /mission-architect
- [ ] PLAN-003: Have the specifier read the host system's spec before settling architecture

## References

- Review of `/specifier`, this session, 2026-07-29 — finding 2, and the consequence analysis that made the mitigation mandatory
- `thoughts/shared/plans/2026-07-29-Upstream-Skills-Fixes.md` — the plan whose `greenfield-feature` drop closed the second of the two doors
- `.claude/skills/feature-architect/SKILL.md:44-46` — the constraint-capture requirement this plan preserves by other means
- `CLAUDE.md`, "The pipeline definition is duplicated — change every copy" — why the four doc copies move together, in **Deferred**
