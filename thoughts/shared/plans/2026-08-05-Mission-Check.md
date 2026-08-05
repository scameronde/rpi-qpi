---
date: 2026-08-05
planner: planner-skill
ticket: "Mission-Check"
status: complete
fact-source: "thoughts/shared/facts/2026-08-05-Mission-Check.md"
upstream-artifact: thoughts/shared/features/2026-08-05-Mission-Check.md
---

# Mission-Check Implementation Plan

## Inputs
- Fact report used: `thoughts/shared/facts/2026-08-05-Mission-Check.md`
- Feature brief: `thoughts/shared/features/2026-08-05-Mission-Check.md`
- User request summary: implement the `Mission Check` feature — a new, human-invoked `/mission-check` skill that audits ORBIT's own recorded intent (missions/specs/epics, plus orphan feature/change branches with no mission root) against its actual code, on a repeatable, non-blocking, non-superseding basis.

## Verified Current State

- **Fact:** No `.claude/skills/mission-check/` directory, no `thoughts/shared/mission-checks/` directory, and no prior commit touching "mission check" exist. This is greenfield work.
  - **Evidence:** fact report, Critical Finding 11.
- **Fact:** `dox-update/SKILL.md` ships as a single `SKILL.md` file with no sibling `.md` files, and `scripts/build-plugin.sh` copies the entire `.claude/skills/` tree with `cp -R` and no per-skill enumeration — a new single-file `mission-check/SKILL.md` needs no build-script change.
  - **Evidence:** `scripts/build-plugin.sh:49-53`; fact report, Critical Findings 3 and 12.
  - **Excerpt:**
    ```
    mkdir -p "$OUT/skills"
    cp -R "$SRC/skills/." "$OUT/skills/"
    find "$OUT/skills" -name AGENTS.md -delete
    ```
- **Fact:** `thoughts/shared/prototypes/AGENTS.md` is registered and documents its directory's contract while holding zero content files — direct precedent for registering `mission-checks/`'s `AGENTS.md` before any report exists.
  - **Evidence:** `thoughts/shared/prototypes/AGENTS.md:1-7`.
- **Fact:** `thoughts/shared/qa/AGENTS.md` documents the only existing same-day collision-avoidance convention (`YYYY-MM-DD-<Target>-<Lens>.md`), and its suffix is semantic (names the producing skill among a closed set of four) rather than a generic repeat-run counter — no numeric-counter or timestamp precedent exists anywhere in `thoughts/shared/`.
  - **Evidence:** `thoughts/shared/qa/AGENTS.md:13-15`; fact report, Critical Finding 5.
- **Fact:** `dox-update`'s only staleness mechanism is `Read` + non-recursive `ls -la` content comparison against four textual criteria; no hash-based staleness has a working implementation anywhere in this codebase — content hashing is described only in the unimplemented `ORBIT-V5-CONCEPT.md`.
  - **Evidence:** `.claude/skills/dox-update/SKILL.md:36-43,76-78`; `ORBIT-V5-CONCEPT.md:110,114`; fact report, Critical Finding 8.
- **Fact:** `fact-finder`'s "Two-Step Workflow for Historical Documentation" (locate via `thoughts-locator`, then analyze via `thoughts-analyzer`) is the closest existing precedent for a discover-then-per-target-analyze pattern; `dox-update`'s Phase 1 is a single-context `find`, never delegated to a separate analyzer agent.
  - **Evidence:** `.claude/skills/fact-finder/SKILL.md:282-297`; fact report, Critical Finding 9.
- **Fact:** Three frontmatter shapes already coexist for report-like outputs — fact-finder standard (`date`, `fact-finder`, `topic`, `status`, `upstream-artifact`, `coverage`), fact-finder QA-mode (`date`, `message_type: QA_REPORT`, `target`, `status`, `upstream-artifact`), and `/prototype`'s note (`date`, `message_type: PROTOTYPE_NOTE`, `topic`, `decision`, `status`) — plus `dox-update`, which writes no artifact at all.
  - **Evidence:** `thoughts/shared/facts/AGENTS.md:15-26`; `thoughts/shared/qa/AGENTS.md:17-26`; `thoughts/shared/prototypes/AGENTS.md:24-33`; fact report, Critical Finding 7 and Detailed Technical Analysis table.
- **Fact — corrects the feature brief's own Integration Points claim:** `.claude/hooks/session-start` carries no "Quality and Maintenance" skills listing at all today — it has exactly one block, `## Available Workflow Skills`, and none of the eight existing quality/maintenance skills (`clean-code`, `python-qa`, `typescript-qa`, `logic-bugs-qa`, `dox-init`, `dox-update`, `claude-code-extensions`, `commit`) appear in it. `CLAUDE.md`'s own canonical "skills-listing tables in three places" enumeration (the "pipeline definition is duplicated" section) names session-start only for the **Workflow Skills** table, never for Quality and Maintenance. The feature brief's Integration Points bullet ("All three need a `mission-check` row") is therefore inaccurate for session-start specifically: there is no existing row of any quality skill there to imitate, and inventing a new quality-skills section in session-start for `mission-check` alone — while the other eight stay absent — would be a new architectural addition this feature does not call for.
  - **Evidence:** `.claude/hooks/session-start:1-49` (full file; grepped for `dox`, `clean-code`, `python-qa`, `typescript-qa`, `logic-bugs`, `commit` — one incidental match, inside the `/just-do-it` line's prose, not a skills-listing row); `CLAUDE.md:149-160` (Quality and Maintenance Skills table, two-file scope only); `CLAUDE.md`, "The pipeline definition is duplicated" (session-start named only under the Workflow-Skills bullet).
  - **Direct consequence:** This plan updates only `CLAUDE.md` and `README.md`'s Quality and Maintenance tables, and leaves `.claude/hooks/session-start` untouched. See Acceptance Criteria.
- **Fact:** `thoughts/shared/AGENTS.md`'s own "Populated today / Empty today" line already understates `changes/` as empty; `ls thoughts/shared/changes/` returns a change brief plus `AGENTS.md`.
  - **Evidence:** `thoughts/shared/AGENTS.md:32`; fact report, Critical Finding 10.
  - **Direct consequence:** Since this plan edits that exact line to add `mission-checks/`, it also corrects the pre-existing `changes/` inaccuracy in the same edit — the line is already open for this task, not a separate scope expansion.

## Inherited Constraints (Respected)

| Constraint | Source | What it forbids or forces | Status |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked via the Skill tool as `/skill-name` | `CLAUDE.md`, Claude Code Workflow | Forces `/mission-check` into the same shape as every sibling skill; forbids a different invocation mechanism | fixed — not investigated |
| Nothing compiles and there is no test suite; verification is reading plus two commands | `CLAUDE.md`, What This Repository Is | Forbids "the tests will catch it" — correctness rests on evidence and review, same as every other skill addition | fixed — not investigated |
| `Mission Check` is a Quality and Maintenance skill, not a Workflow skill — it does not appear in any greenfield/brownfield/small-fix routing table | `CLAUDE.md`, Workflow Skills / Quality and Maintenance Skills (`:128,149`) | Forces its listing into the "Quality and Maintenance" table locations rather than the "Workflow Skills" or pipeline-ordering locations; forbids treating this as a routing change | fixed — not investigated |
| Artifacts under `thoughts/shared/` are named `YYYY-MM-DD-Topic.md` and are write-once after creation, with STATE files the one documented exception | `CLAUDE.md`, Workflow Pipeline; `thoughts/shared/AGENTS.md:9-11,15` | Forces a naming scheme precise enough to keep same-day runs distinct and forces the write-once departure to be documented in a new `AGENTS.md`, not silently exempted | fixed — not investigated |
| `.claude/**` is deliberately outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and its `changes/`, `facts/`, `plans/`, `prototypes/`, `qa/` children; `missions/`, `specs/`, `epics/`, `features/` carry none | `CLAUDE.md`, DOX Protocol (`:253`) | Forbids an `AGENTS.md` under `.claude/skills/mission-check/`; forces a new `AGENTS.md` for `mission-checks/` and forces `thoughts/shared/AGENTS.md`'s Child DOX Index to gain a row for it | fixed — not investigated |
| `thoughts/shared/AGENTS.md`'s directory-assignment table and `.claude/agents/thoughts-locator.md`'s "Map of the Archive" are closed enumerations — 10 categories | `thoughts/shared/AGENTS.md:17-32`; `.claude/agents/thoughts-locator.md:46-58` | Forces both tables to gain a row/category for `mission-checks/`; an omission means `thoughts-locator` never finds a Mission Check report even when asked directly | fixed — not investigated |
| `/planner`'s admission gate and `implement/SKILL.md:238`'s epic-verification test both read `upstream-artifact:` against a closed list of directories fact-finder/planner reports can come from | `CLAUDE.md`, "The pipeline definition is duplicated" | Forbids `Mission Check` reports from being mistaken for fact/QA reports by these closed lists — `mission-checks/` must **not** be added to them | fixed — not investigated |
| ORBIT has no mission or spec document; `CLAUDE.md` and the `SKILL.md` files are the normative record | `inferred — Glob of thoughts/shared/missions/ and specs/ both returned empty` | Forces `Mission Check`'s own coverage/fidelity logic to treat "no mission" as a first-class expected case, not an error | inferred — verified |

## Goals / Non-Goals

- **Goals:**
  - Ship `.claude/skills/mission-check/SKILL.md`, a whole-tree, staleness-aware audit skill in the shape `/dox-update` (single-context sweep) crossed with `/fact-finder` (locate-then-analyze subagent dispatch per discovered target).
  - Register `thoughts/shared/mission-checks/` as an eleventh DOX-governed, `thoughts-locator`-discoverable artifact directory, with its own `AGENTS.md` documenting the deliberate non-write-once departure.
  - Reflect the new skill in both Quality and Maintenance skill-listing tables (`CLAUDE.md`, `README.md`) and add a `CHANGELOG.md` entry.
- **Non-Goals** (carried from the feature brief verbatim): no blocking gate anywhere in the pipeline; no drafting of Change/Feature Briefs by the new skill; no change to pipeline ordering, routing, or any existing verification step; no code or git-history writes by the new skill itself; no addition of a Quality-and-Maintenance section to `.claude/hooks/session-start` (see Verified Current State — none exists there today for any of the eight sibling skills either).

## Approval Gate

None of the four Phase 3 triggers apply:
1. **Contract with more than one reader** — the new report format has exactly one writer (`/mission-check`) and no downstream skill reader; not yet a shared contract.
2. **Files defining the executing orchestrator's own behaviour** — this plan touches no file under `.claude/skills/implement/**` and no file `/implement` loads while running.
3. **Reverses a recorded deferral** — nothing here undoes a prior explicit "we decided not to do X."
4. **Leaves a finding deliberately unaddressed** — every Critical Finding and Open Question in the fact report is either resolved by an explicit design decision below or carried into a task.

`None applied — proceeding.` One transparency note, not a gate trigger: this plan deliberately does **not** touch `.claude/hooks/session-start`, departing from the feature brief's own Integration Points wording ("all three need a `mission-check` row"). See Verified Current State above for the evidence — session-start has no Quality-and-Maintenance listing to add a row to, for any skill, today.

## Design Overview

The fact report's four Open Questions are architecture decisions the feature brief explicitly left for `/planner` to settle (feature brief, `## Assumptions`: "left open for `/fact-finder` and `/planner` to settle"). Settled here:

1. **Report directory:** `thoughts/shared/mission-checks/` — plural, matching every sibling artifact directory; the name the feature brief itself floated as an example.
2. **Frontmatter shape:** `date`, `message_type: MISSION_CHECK_REPORT`, `run`, `status` — closer to the QA-mode/`prototype` `message_type:` family than to standard fact-finder's signature-key family, because Mission Check is architecturally an audit (like QA), not a single-target research artifact. No `upstream-artifact:` key at all — deliberately, both because no single upstream artifact exists (the report covers many trees/branches at once) and because the key must never let this report be mistaken for a fact/QA report by `/planner`'s or `/implement`'s closed-list checks (Inherited Constraint row 6).
3. **Same-day collision avoidance:** a generic run counter, `YYYY-MM-DD-Mission-Check-N.md` (`N` starting at 1), rather than the QA lens suffix — the QA suffix is semantic (names which of four producing skills wrote the file) and Mission Check has only one producer, so a counter fits better than inventing a second semantic axis.
4. **Staleness/incremental mechanism:** a git-commit-boundary check, not `dox-update`'s content comparison. `dox-update` compares an `AGENTS.md` against current reality because it has no prior-run record to diff against — every run is Phase 1 from scratch. Mission Check *does* have a prior run's own report to read back, so it can record, per tree/branch, the git commit hash examined and diff since it (`git log --oneline <hash>..HEAD -- <paths>`) instead of re-deriving "did anything change" from content alone. This reuses git's own persisted history rather than inventing a database or a content-hash store (the latter being the unimplemented ORBIT-V5-CONCEPT.md proposal, Critical Finding 8) — no new persistence mechanism is introduced.

Two-phase-per-run shape (mirrors fact-finder's locate/analyze split, Critical Finding 9):
- **Discovery** (single context, no subagent, like `dox-update` Phase 1): `Glob` every artifact directory, reconstruct mission trees by walking `mission-source:`/`spec-source:`/`upstream-artifact:` back-pointers forward and backward, and classify any feature/change brief whose chain never reaches a mission as an **orphan branch**.
- **Staleness pre-check** (single context): read the latest prior report(s) in `mission-checks/`, extract each tree/branch's last-examined commit + paths, `git diff`/`git log` since; unseen or changed trees/branches proceed to analysis, unchanged ones are recorded as such without spending a subagent.
- **Per-changed-tree/branch analysis** (subagent dispatch, mirroring fact-finder's two-step workflow): `thoughts-analyzer` on the mission/spec/epic chain (or the orphan branch's own brief) for the Coverage baseline, then `codebase-locator` + `codebase-analyzer` on the implementing code for both Coverage (is the promised capability still there) and Fidelity (does it still behave as documented) — two distinct findings, never merged, each Observation + Direct-consequence + Evidence + a Verdict token, never a suggested fix.

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002, PLAN-003, PLAN-004, PLAN-005 | `.claude/skills/mission-check/SKILL.md`; `thoughts/shared/mission-checks/AGENTS.md`, `thoughts/shared/AGENTS.md`; `.claude/agents/thoughts-locator.md`, `.claude/skills/fact-finder/SKILL.md`; `CLAUDE.md`, `README.md`; `CHANGELOG.md` | All five tasks touch disjoint file sets — no path repeats across the wave — so all run concurrently |

**Wave self-check:** `.claude/skills/mission-check/SKILL.md` (PLAN-001 only); `thoughts/shared/mission-checks/AGENTS.md`, `thoughts/shared/AGENTS.md` (PLAN-002 only); `.claude/agents/thoughts-locator.md`, `.claude/skills/fact-finder/SKILL.md` (PLAN-003 only); `CLAUDE.md`, `README.md` (PLAN-004 only); `CHANGELOG.md` (PLAN-005 only). No path appears twice.

## Implementation Instructions (For Implementor)

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** opus
- **Change Type:** create
- **File(s):** `.claude/skills/mission-check/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Frontmatter: `name: mission-check`, `description:` a one-line summary mirroring sibling skills' style (whole-tree audit of code against recorded mission/spec/epic intent, plus orphan feature/change branches; human-invoked, non-blocking). No `tools:` key (no sibling `SKILL.md` declares one) and no `disable-model-invocation:` (the skill is read-only, like `/fact-finder` and `/dox-update`, neither of which sets it).
  2. Open with a short role statement in the style of `dox-update/SKILL.md:6` / `fact-finder/SKILL.md:7-8` — a one-paragraph "you are the auditor who checks code against recorded intent" framing.
  3. **Non-Negotiables (Enforced)** section, at minimum:
     - No Recommendations / No Opinions — modeled on `fact-finder/SKILL.md:16-21`'s forbidden-terms list, adapted: findings are Observation + Direct consequence + Evidence + Verdict only; never a proposed fix, Change Brief, or Feature Brief.
     - Two distinct passes, never merged — Coverage (does a promised capability still have living code) and Fidelity (does the code still behave as documented) are always reported separately per tree/branch.
     - Never a gate — this skill is invoked by a human on demand; it must never be added to `/implement`, to any routing table, or to any of the five canonical pipeline-ordering prose locations `CLAUDE.md` names.
     - Read-only — never edits application files, `.claude/` skill files, or git history; the only file it ever writes is its own new report.
     - Orphan branches are always reported explicitly, never silently skipped for lacking a mission to trace to.
  4. **Execution Protocol**, four phases:
     - **Phase 1 — Whole-tree discovery** (single context, no subagent, mirroring `dox-update/SKILL.md:47-66`'s Phase 1 style): `Glob` `thoughts/shared/missions/*.md`, `specs/*.md`, `epics/*.md`, `plans/*.md` (excluding `*-STATE.md`), `features/*.md`, `changes/*.md` (excluding `*-RECORD.md`). Reconstruct each mission tree by walking `mission-source:`/`spec-source:`/`upstream-artifact:` frontmatter back-pointers (spec → mission via `mission-source:`; epic → spec via `spec-source:`; plan → epic via `upstream-artifact:`) — read each candidate file's frontmatter and match the back-pointer's path against the candidate tree's own artifact paths. Classify a feature or change brief as an **orphan branch** when its own chain (its `mission-source:` for a feature brief; its `spec-source:` and that spec's own `mission-source:`, if any, for a change brief) never reaches a mission — including the case where the field is absent, `"none"`, or the pointed-to spec itself has no mission.
     - **Phase 2 — Staleness pre-check** (single context): `Glob` `thoughts/shared/mission-checks/*.md`, sort by date and run number, read the most recent report(s). For each tree/branch it already covered, extract the git commit hash and the list of artifact/source paths it was last checked against (this is why Phase 4's report template below must record both). Run `git log --oneline <hash>..HEAD -- <paths...>` for each; empty output means unchanged. A tree/branch with no prior report entry is always treated as changed (first-seen). Note explicitly in the report when the working tree is dirty (`git status --porcelain` non-empty) as a stated limitation, not something this phase tries to resolve.
     - **Phase 3 — Per-changed-tree/branch analysis dispatch** (subagent delegation, mirroring `fact-finder/SKILL.md:282-297`'s two-step workflow): for each tree/branch flagged changed or first-seen, delegate to `thoughts-analyzer` on the mission/spec/epic chain (or, for an orphan branch, on the feature/change brief itself) to extract the promised capabilities/target state, then delegate to `codebase-locator` to find the implementing files and `codebase-analyzer` to trace their current behavior. Produce one Coverage finding (capability present/absent, with evidence) and one Fidelity finding (documented vs. observed behavior, with evidence) per tree/branch, each carrying a Verdict of `Match`, `Partial Drift`, `Diverged`, or `Abandoned`. An orphan branch's Fidelity finding must state explicitly that it is checked against its own recorded intent, not a root mission, since none exists.
     - **Phase 4 — Report assembly and write**: count existing `thoughts/shared/mission-checks/YYYY-MM-DD-Mission-Check-*.md` files for today's date (via the same `Glob` as Phase 2) to derive `N` (existing count + 1). Assemble and `Write` the report per the Output Format below to `thoughts/shared/mission-checks/YYYY-MM-DD-Mission-Check-N.md`.
  5. **Output Format (STRICT)** section, specifying the report's required frontmatter and body sections exactly:
     ```
     ---
     date: YYYY-MM-DD
     message_type: MISSION_CHECK_REPORT
     run: N
     status: complete
     ---

     # Mission Check Report — YYYY-MM-DD (run N)

     ## Executive Summary
     ## Trees & Branches Discovered
     ## Coverage Findings (per tree/branch)
     ## Fidelity Findings (per tree/branch)
     ## Unchanged Since Last Run
     ## References
     ```
     Each Coverage/Fidelity finding follows the Observation / Direct consequence / Evidence / Verdict shape described in Phase 3. State this frontmatter and section list is canonical for `thoughts/shared/mission-checks/AGENTS.md` (written by PLAN-002) to reference rather than restate — the two files must describe the same contract.
  6. Do not add `thoughts/shared/mission-checks/` to any of the closed directory lists at `fact-finder/SKILL.md:567`, `planner/SKILL.md:479,483`, or `implement/SKILL.md:238` — state this explicitly as a one-line note near the top of the new file so a future maintainer does not "complete" the pattern by mistake.
- **Interfaces / Pseudocode:**
  ```
  discover() -> { mission_trees: [...], orphan_branches: [...] }
  staleness_precheck(trees_and_branches, prior_reports) -> { changed: [...], unchanged: [...] }
  analyze(tree_or_branch) -> { coverage_finding, fidelity_finding }   // via thoughts-analyzer + codebase-locator + codebase-analyzer
  assemble_report(discovered, changed_results, unchanged) -> report.md
  ```
- **Evidence:** `.claude/skills/dox-update/SKILL.md:36-92` (staleness criteria + phase structure precedent); `.claude/skills/fact-finder/SKILL.md:282-297` (two-step locate/analyze precedent), `:642-717` (report frontmatter/structure precedent); `thoughts/shared/qa/AGENTS.md:17-26` (message_type frontmatter family).
- **Excerpt:**
  ```
  # dox-update/SKILL.md:47-66 (Phase 1 style to mirror for Mission Check's own Phase 1)
  ### Phase 1 — Find all existing AGENTS.md files
  Run: find . -name "AGENTS.md" -not -path ... | sort
  Store the list.

  # fact-finder/SKILL.md:282-297 (two-step precedent to mirror for Phase 3)
  ### Two-Step Workflow for Historical Documentation
  1. Step 1: Use thoughts-locator to find relevant historical documents
  2. Step 2: Use thoughts-analyzer to extract structured insights from those documents
  ```
- **Done When:** `.claude/skills/mission-check/SKILL.md` exists with `name: mission-check` frontmatter, a Non-Negotiables section enforcing no-recommendations / two-distinct-passes / never-a-gate / read-only / orphan-always-reported, a four-phase Execution Protocol (discovery, git-diff-based staleness pre-check, per-changed-branch Coverage+Fidelity dispatch, report assembly with the `N`-counter naming), and an Output Format section with the exact frontmatter keys (`date`, `message_type: MISSION_CHECK_REPORT`, `run`, `status`) and the six body section headers listed above.
- **Verify:** none — requires review (architecture-level design and prose quality; not mechanically checkable).
- **Context:** This is the core deliverable — the feature brief's whole reason for existing is that ORBIT's traceability chain is pairwise-only and never re-checks finished code against root intent (feature brief, `## Feature Vision`). This file is where that gap actually closes, and it is the one task in this plan carrying real design judgment rather than mechanical bookkeeping.

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** create, modify
- **File(s):**
  - `thoughts/shared/mission-checks/AGENTS.md` (new)
  - `thoughts/shared/AGENTS.md` (modify)
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Create `thoughts/shared/mission-checks/AGENTS.md`, following the template shape of `thoughts/shared/prototypes/AGENTS.md:1-56` (Purpose / Ownership / Local Contracts / Work Guidance / Verification), with this content:
     - **Purpose:** stores point-in-time audit reports produced by `/mission-check`; unlike every sibling directory, a report here does not supersede the one before it — state plainly that no reports exist yet and that is expected, mirroring `prototypes/AGENTS.md:7`'s "That is expected" phrasing.
     - **Ownership:** `/mission-check` is the sole writer. State explicitly, as its own sentence: **"Reports are not write-once"** — a deliberate departure from `thoughts/shared/AGENTS.md`'s "All other files are write-once after creation" rule (`thoughts/shared/AGENTS.md:11`), with the one-sentence rationale that a drift audit is inherently a repeated snapshot. State that no skill currently reads this directory — findings are for human review only.
     - **Local Contracts:** file naming `YYYY-MM-DD-Mission-Check-N.md` where `N` is a run counter starting at 1, incremented per additional same-day run (found by counting existing files matching the pattern before writing) — contrast this one sentence against `qa/AGENTS.md:13-15`'s semantic lens suffix, noting this one is generic (a repeat-run counter) because Mission Check has only one producing skill. Required frontmatter block, verbatim:
       ```yaml
       ---
       date: YYYY-MM-DD
       message_type: MISSION_CHECK_REPORT
       run: N
       status: complete
       ---
       ```
       Required body sections: reference `.claude/skills/mission-check/SKILL.md`'s Output Format as canonical (do not restate it) and list the six section headers: Executive Summary, Trees & Branches Discovered, Coverage Findings, Fidelity Findings, Unchanged Since Last Run, References.
     - **Work Guidance:** reports are read-only after creation; findings are always observation + evidence, never a proposed fix or brief; an orphan branch's finding always states it has no root mission to check against.
     - **Verification:** `ls` shows only `YYYY-MM-DD-Mission-Check-N.md` files plus this `AGENTS.md`; a valid report has all four frontmatter keys and all six body sections; no two files share the same `N` for the same date.
  2. In `thoughts/shared/AGENTS.md`:
     - Add one row to the **Directory assignments** table (`:17-28`), after the `plans/` row: `| \`mission-checks/\` | \`/mission-check\` | human review only — no downstream skill reads this directory |`
     - Replace the **Populated today / Empty today** line (`:32`) with: `**Populated today:** \`plans/\`, \`facts/\`, \`qa/\`, \`features/\`, \`epics/\`, \`changes/\`. **Empty today:** \`missions/\`, \`specs/\`, \`prototypes/\`, \`mission-checks/\`. File counts are not a contract — they change with every pipeline run, so \`ls\` is the authority, not this file.` (this both adds `mission-checks/` and fixes the pre-existing inaccuracy that had `changes/` listed as empty — `ls thoughts/shared/changes/` shows a populated brief.)
     - Add one row to the **Child DOX Index** (`:46-53`): `- [mission-checks/](mission-checks/AGENTS.md) — Mission Check reports (point-in-time drift snapshots; deliberately not write-once)`
- **Evidence:** `thoughts/shared/prototypes/AGENTS.md:1-56`; `thoughts/shared/AGENTS.md:17-32,46-53`; `thoughts/shared/changes/` directory listing (contains `2026-08-03-Implement-LSP-Preference.md` plus `AGENTS.md`).
- **Excerpt:**
  ```
  # thoughts/shared/AGENTS.md:32 (current, to be replaced)
  **Populated today:** `plans/`, `facts/`, `qa/`, `features/`, `epics/`. **Empty today:** `missions/`, `specs/`, `prototypes/`, `changes/`.
  ```
- **Done When:** `thoughts/shared/mission-checks/AGENTS.md` exists with all five sections and the exact required-frontmatter block above; `thoughts/shared/AGENTS.md`'s directory-assignment table, Populated/Empty line, and Child DOX Index all name `mission-checks/`, and the Populated/Empty line now lists `changes/` under Populated.
- **Verify:**
  - `test -f thoughts/shared/mission-checks/AGENTS.md && grep -q "not write-once" thoughts/shared/mission-checks/AGENTS.md` → exit 0
  - `grep -q "mission-checks/.*mission-check" thoughts/shared/AGENTS.md` → exit 0 (directory-assignment row)
  - `grep -q "Populated today.*changes/.*Empty today.*mission-checks/" thoughts/shared/AGENTS.md` → exit 0
  - `grep -q "mission-checks/AGENTS.md" thoughts/shared/AGENTS.md` → exit 0 (Child DOX Index row)
- **Context:** `.claude/**` is outside DOX, but `thoughts/shared/`'s durable-artifact children are inside it (`CLAUDE.md`, DOX Protocol). A new directory holding durable artifacts needs its own contract registered at creation, per the `prototypes/` precedent — and since this same edit touches the Populated/Empty line anyway, it also closes the pre-existing `changes/` inaccuracy the fact report flagged (Critical Finding 10) at no extra cost.

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `.claude/agents/thoughts-locator.md`
  - `.claude/skills/fact-finder/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In `.claude/agents/thoughts-locator.md`:
     - Line 31 (`- **Sections Returned:** All 10 categories`): change `All 10 categories` → `All 11 categories`.
     - Line 167: change `Return all 10 categories (omitting empty ones).` → `Return all 11 categories (omitting empty ones).`
     - In **Map of the Archive** (`:46-58`), add one bullet after the `prototypes/` line (`:56`) and before the `thoughts/projects/` line (`:57`): `*   \`thoughts/shared/mission-checks/\` -> Mission Check reports (\`YYYY-MM-DD-Mission-Check-N.md\`)`
     - In **Workflow** step 1's bulleted examples (`:64-72`), add one line after the *Prototype Notes* example (`:71`): `    *Mission Check Reports*: \`find thoughts/shared/mission-checks/ -name "*Auth*"\``
     - In the **Output Format** example's `<answer>` block (`:101-133`), add one new subsection after `### Prototype Learnings` (`:128-129`) and before `### Project Notes` (`:131-132`):
       ```
       ### Mission Check Reports
       - `thoughts/shared/mission-checks/2026-01-22-Mission-Check-1.md` - **Mission Check Report** (run 1)
       ```
  2. In `.claude/skills/fact-finder/SKILL.md:376`, change:
     `Returns: All 10 categories (missions, specs, feature briefs, change briefs, epics, plans, QA reports, fact reports, prototype learnings, project notes)`
     to:
     `Returns: All 11 categories (missions, specs, feature briefs, change briefs, epics, plans, QA reports, fact reports, prototype learnings, mission check reports, project notes)`
- **Evidence:** `.claude/agents/thoughts-locator.md:31,46-58,64-72,101-133,167`; `.claude/skills/fact-finder/SKILL.md:376`.
- **Excerpt:**
  ```
  # thoughts-locator.md:31
     - **Sections Returned:** All 10 categories
  # thoughts-locator.md:167
  **For scope = comprehensive (default):** Return all 10 categories (omitting empty ones).
  # fact-finder/SKILL.md:376
  - Returns: All 10 categories (missions, specs, feature briefs, change briefs, epics, plans, QA reports, fact reports, prototype learnings, project notes)
  ```
- **Done When:** Both `10 categories` occurrences in `thoughts-locator.md` read `11 categories`; the Map of the Archive, Workflow examples, and Output Format example each carry a `mission-checks/`/"Mission Check Reports" entry; `fact-finder/SKILL.md:376` reads `11 categories` and lists `mission check reports` in its parenthetical.
- **Verify:**
  - `test $(grep -c "11 categories" .claude/agents/thoughts-locator.md) -eq 2` → exit 0
  - `grep -q "mission-checks/" .claude/agents/thoughts-locator.md` → exit 0
  - `grep -q "Mission Check Reports" .claude/agents/thoughts-locator.md` → exit 0
  - `grep -q "11 categories (missions, specs, feature briefs, change briefs, epics, plans, QA reports, fact reports, prototype learnings, mission check reports, project notes)" .claude/skills/fact-finder/SKILL.md` → exit 0
- **Context:** Both files assert a closed count of "10 categories" of historical documentation; the fact report's Critical Finding 1 confirmed the count is split across these exact two files (not, as the feature brief assumed, three occurrences in one file). Adding `mission-checks/` as an eleventh category and not updating both counts would leave `thoughts-locator` unable to ever find a Mission Check report, even directly asked.

- **Action ID:** PLAN-004
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):**
  - `CLAUDE.md`
  - `README.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In `CLAUDE.md`'s **Quality and Maintenance Skills** table (`:149-160`), add one row after the `dox-update` row (`:158`) and before `claude-code-extensions` (`:159`):
     `| \`mission-check\` | Whole-tree audit of code against recorded mission/spec/epic intent, including orphan-branch checks for feature and change work with no mission root |`
  2. In `README.md`'s **Quality and maintenance skills** table (`:151-162`), add the equivalent row in the same relative position, after the `dox-update` row (`:160`) and before `claude-code-extensions` (`:161`):
     `| \`mission-check\` | Audit code against recorded mission/spec/epic intent, including orphan feature and change work with no mission root |`
  Do not touch either file's pipeline-ordering prose (the Workflow Pipeline section in `CLAUDE.md`, the Workflow orchestration table in `README.md`) — `Mission Check` is not a pipeline stage (feature brief, `## Explicit Non-Goals`).
- **Evidence:** `CLAUDE.md:149-160`; `README.md:151-162`.
- **Excerpt:**
  ```
  # CLAUDE.md:157-159
  | `dox-init` | Bootstrap a DOX `AGENTS.md` tree for a project (idempotent — never overwrites) |
  | `dox-update` | Detect and regenerate stale `AGENTS.md` files |
  | `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |

  # README.md:159-161
  | `dox-init` | Bootstrap a DOX `AGENTS.md` governance tree (idempotent) |
  | `dox-update` | Detect and regenerate stale `AGENTS.md` files |
  | `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |
  ```
- **Done When:** Both `CLAUDE.md` and `README.md`'s Quality and Maintenance tables carry a `mission-check` row between `dox-update` and `claude-code-extensions`; neither file's pipeline-ordering prose changed.
- **Verify:**
  - `grep -q '| `mission-check` |' CLAUDE.md` → exit 0
  - `grep -q '| `mission-check` |' README.md` → exit 0
- **Context:** `Mission Check` is a Quality and Maintenance skill (Inherited Constraint row 3), so it belongs in these two tables, not the Workflow Skills tables or the pipeline-ordering prose. Both files need the same one-line addition, so they are one task rather than two per the same-edit-across-files sizing rule.

- **Action ID:** PLAN-005
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `CHANGELOG.md`
- **allowedAdjacentEdits:** none
- **Instruction:** Replace the `## [Unreleased]` section's placeholder line (`:16`, `No commits yet since [V4.1.1](#v411---2026-08-03).`) with an `### Added` subsection:
  ```markdown
  ## [Unreleased]

  ### Added
  - `mission-check` skill — a whole-tree, repeatable audit of the codebase against its recorded mission/spec/epic intent, run only when a human asks for it. Discovers every mission tree and every orphan feature/change branch with no mission root, runs distinct Coverage and Fidelity passes against each, and skips full re-analysis for branches unchanged since the prior run (tracked via git commit boundaries, not a new persistence mechanism). Writes non-superseding, independently timestamped reports to the new `thoughts/shared/mission-checks/` directory.
  ```
- **Evidence:** `CHANGELOG.md:14-16`.
- **Excerpt:**
  ```
  ## [Unreleased]

  No commits yet since [V4.1.1](#v411---2026-08-03).
  ```
- **Done When:** `CHANGELOG.md`'s `## [Unreleased]` section has an `### Added` subsection describing the `mission-check` skill; the old "No commits yet" placeholder line is gone.
- **Verify:** `grep -A5 "## \[Unreleased\]" CHANGELOG.md | grep -q "mission-check"` → exit 0
- **Context:** `CLAUDE.md`'s Release Notes convention requires an `## [Unreleased]` entry for anything merged since the last tag; this feature is exactly that.

## Verification Tasks (If Assumptions Exist)

None — every claim above was directly `Read`/`Bash`-verified in this Planner session (`.claude/hooks/session-start` in full, `CLAUDE.md`/`README.md`/`CHANGELOG.md` at the cited lines, `thoughts/shared/AGENTS.md`, `thoughts/shared/prototypes/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`, `.claude/agents/thoughts-locator.md`, `.claude/skills/fact-finder/SKILL.md`, `.claude/skills/dox-update/SKILL.md`, `.claude/skills/feature-architect/SKILL.md`, `.claude/skills/change-architect/SKILL.md`, `.claude/skills/just-do-it/SKILL.md`), no assumption remains unverified.

## Acceptance Criteria

- `.claude/skills/mission-check/SKILL.md` exists, is a single file (no siblings, matching the `dox-update` precedent), and needs no `scripts/build-plugin.sh` change (already true today — verified, not a task).
- `thoughts/shared/mission-checks/AGENTS.md` exists and documents its report format as non-write-once, with rationale.
- `thoughts/shared/AGENTS.md`, `.claude/agents/thoughts-locator.md`, `CLAUDE.md`, and `README.md` all name the new skill and/or directory; `.claude/hooks/session-start` is unchanged, and correctly so — see Verified Current State's session-start note; this is a deliberate, evidence-backed correction of the feature brief's Integration Points wording, not an omission.
- `CHANGELOG.md`'s `## [Unreleased]` section names the new skill.
- **Requires a live run, not checkable by grep/review — carried forward from the feature brief's own `## Success Criteria`, to be confirmed by the user (or a follow-up session) after merge:**
  - Invoking `/mission-check` on this repository (which has no mission or spec) discovers and reports on every feature brief and change brief as an orphan branch, without erroring or asking the user to supply a target.
  - Running `/mission-check` a second time with no intervening code or artifact changes reports every tree/branch as unchanged since the last run, without re-running a full analysis pass on any of them.
- The new `SKILL.md`'s Non-Negotiables and Output Format, as written, structurally forbid the report from ever proposing a specific Change Brief, Feature Brief, or code edit (reviewable directly from the file's text, without a live run).

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Write `.claude/skills/mission-check/SKILL.md`
- [ ] PLAN-002: Register `mission-checks/` in DOX (new `AGENTS.md` + `thoughts/shared/AGENTS.md` update)
- [ ] PLAN-003: Add the 11th `thoughts-locator`/`fact-finder` category
- [ ] PLAN-004: Add `mission-check` row to `CLAUDE.md` and `README.md`
- [ ] PLAN-005: Add `CHANGELOG.md` Unreleased entry
