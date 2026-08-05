---
date: 2026-08-05
fact-finder: fact-finder-skill
topic: "Mission Check"
status: complete
upstream-artifact: thoughts/shared/features/2026-08-05-Mission-Check.md
coverage:
  - thoughts/shared/features/2026-08-05-Mission-Check.md (upstream feature brief)
  - .claude/skills/dox-update/SKILL.md
  - .claude/skills/fact-finder/SKILL.md
  - .claude/skills/planner/SKILL.md:470-499
  - .claude/skills/implement/SKILL.md:225-248
  - .claude/skills/specifier/SKILL.md:335-348
  - .claude/skills/epic-planner/SKILL.md:340-353
  - .claude/agents/thoughts-locator.md
  - CLAUDE.md, README.md, .claude/hooks/session-start
  - scripts/build-plugin.sh
  - CHANGELOG.md:1-40
  - thoughts/shared/AGENTS.md and its changes/, facts/, qa/, prototypes/, plans/ children AGENTS.md files
  - thoughts/shared/features/2026-07-31-Just-Do-It.md, thoughts/shared/facts/2026-07-31-Just-Do-It-Route.md
  - ORBIT-V5-CONCEPT.md (grep for "hash")
  - directory listings of every thoughts/shared/ subdirectory and .claude/skills/
  - git log search for prior mission-check work
---

# Research: Mission Check

## Executive Summary

- The feature brief's Integration Points claim — "every place counting '10 categories' (`:31,167,376`) moves to 11" — misattributes all three line numbers to `.claude/agents/thoughts-locator.md`. That file has exactly two such lines (`:31`, `:167`); the third (`:376`) is in `.claude/skills/fact-finder/SKILL.md`, a different file the brief does not separately list as needing the update.
- `dox-update` writes no durable artifact at all — its only output is an in-place `AGENTS.md` rewrite plus a printed summary table, so it supplies no report-frontmatter precedent, only a staleness-check and directory-sweep precedent.
- `scripts/build-plugin.sh` copies the entire `.claude/skills/` tree with a single `cp -R`, with no per-skill enumeration anywhere in the script — confirming the brief's Assumption that no script change is needed for a new skill directory.
- `dox-update`'s directory-exclusion list has 10 entries, not the 8 the brief's Open Question 5 names — it additionally excludes `*/coverage*` and `*/.nyc_output*`.
- Three frontmatter/output shapes already coexist for report-like skill outputs in this codebase — fact-finder's standard 6-key shape, fact-finder's QA-mode 5-key shape, and dox-update's no-artifact shape — none of which Mission Check can adopt unchanged.
- `thoughts/shared/qa/` already has a same-day collision-avoidance convention (`YYYY-MM-DD-<Target>-<Lens>.md`) and `thoughts/shared/prototypes/` already has a precedent for an `AGENTS.md` registered before any content file exists in the directory — both open questions the brief raises have direct, if partial, precedent already on disk.
- `dox-update`'s staleness check is a `Read` + non-recursive `ls -la` content comparison against four textual criteria; no hash-based staleness mechanism is implemented anywhere in this codebase — content hashing exists only as an unimplemented proposal in `ORBIT-V5-CONCEPT.md`.
- No `.claude/skills/mission-check/` directory and no prior commit touching "mission check" exist yet; this is greenfield work inside the brownfield feature.

## Coverage Map

Personally read in full: `thoughts/shared/features/2026-08-05-Mission-Check.md`, `.claude/skills/dox-update/SKILL.md`, `thoughts/shared/AGENTS.md`, `.claude/agents/thoughts-locator.md`, `scripts/build-plugin.sh`, `.claude/skills/fact-finder/SKILL.md`, `CLAUDE.md`, `README.md`, `.claude/hooks/session-start`, `thoughts/shared/changes/AGENTS.md`, `thoughts/shared/facts/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`, `thoughts/shared/prototypes/AGENTS.md`, `thoughts/shared/plans/AGENTS.md`, `CHANGELOG.md:1-40`.

Personally spot-verified by exact line: `.claude/skills/planner/SKILL.md:470-499`, `.claude/skills/implement/SKILL.md:225-248`, `.claude/skills/specifier/SKILL.md:335-348`, `.claude/skills/epic-planner/SKILL.md:340-353`, `thoughts/shared/features/2026-07-31-Just-Do-It.md:1-20`, `thoughts/shared/facts/2026-07-31-Just-Do-It-Route.md:1-40`, `ORBIT-V5-CONCEPT.md:110,114,163,205`.

Directory listings inspected directly via `Bash ls`: every subdirectory of `thoughts/shared/`, `.claude/skills/`, `.claude/skills/dox-update/`, `.claude/skills/implement/`.

No sub-agent was delegated to in this research run: the upstream feature brief's own `## Open Questions for Fact-Finder` and `## Integration Points` sections named exact files and (in several cases) exact line numbers, and every claim was checkable by direct `Read`/`Bash`/`Grep` without needing `codebase-locator`/`codebase-analyzer` to first find targets. Scope is accordingly narrower than a full topology sweep: it does not touch `.claude/skills/change-architect/SKILL.md`, `feature-architect/SKILL.md`, or `mission-architect/SKILL.md` beyond what CLAUDE.md quotes from them, since the brief's own questions did not direct research there.

## Inherited Constraints (Treated as Fixed)

| Constraint | Source | What it forbids or forces | Status |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked via the Skill tool as `/skill-name` | `CLAUDE.md`, Claude Code Workflow | Forces `/mission-check` into the same shape as every sibling skill; forbids a different invocation mechanism | fixed — not investigated |
| Nothing compiles and there is no test suite; verification is reading plus two commands | `CLAUDE.md`, What This Repository Is | Forbids "the tests will catch it" for this feature's own implementation — correctness rests on the fact report's evidence and on review, same as every other skill addition | fixed — not investigated |
| `Mission Check` is a Quality and Maintenance skill, not a Workflow skill — it does not appear in any greenfield/brownfield/small-fix routing table | `CLAUDE.md`, Workflow Skills / Quality and Maintenance Skills (`:128,149`) | Forces its listing into the three "Quality and Maintenance" table locations (`CLAUDE.md:149-159`, `README.md`'s "Quality and maintenance skills" table, `.claude/hooks/session-start`'s skills block) rather than the "Workflow Skills" or pipeline-ordering locations; forbids treating this as a routing change | fixed — not investigated |
| Artifacts under `thoughts/shared/` are named `YYYY-MM-DD-Topic.md` and are write-once after creation, with STATE files the one documented exception | `CLAUDE.md`, Workflow Pipeline; `thoughts/shared/AGENTS.md:9-11,15` | Forces a naming scheme precise enough to keep same-day runs distinct (plain `YYYY-MM-DD-Topic.md` collides within a day) and forces the write-once departure to be documented in a new `AGENTS.md`, not silently exempted | fixed — not investigated |
| `.claude/**` is deliberately outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and its `changes/`, `facts/`, `plans/`, `prototypes/`, `qa/` children; `missions/`, `specs/`, `epics/`, `features/` carry none | `CLAUDE.md`, DOX Protocol (`:253`) | Forbids an `AGENTS.md` under `.claude/skills/mission-check/`; forces a new `AGENTS.md` for the new report directory under `thoughts/shared/` (since it holds durable artifacts, unlike `missions/`/`specs/`/`epics/`/`features/`, which inherit the parent contract instead) and forces `thoughts/shared/AGENTS.md`'s Child DOX Index to gain a row for it | fixed — not investigated |
| `thoughts/shared/AGENTS.md`'s directory-assignment table and `.claude/agents/thoughts-locator.md`'s "Map of the Archive" are closed enumerations — 10 categories, confirmed at `thoughts-locator.md:31,167,376` | `thoughts/shared/AGENTS.md:17-32`; `.claude/agents/thoughts-locator.md:46-58` | Forces both tables to gain a row/category for the new report directory; an omission there means `thoughts-locator` never finds a `Mission Check` report even when asked directly | fixed — not investigated (the upstream row's own line-number citation for `:376` is itself inaccurate — see Critical Finding 1 below; the constraint it states is otherwise unaffected) |
| `/planner`'s admission gate and `implement/SKILL.md:238`'s epic-verification test both read `upstream-artifact:` against a closed list of directories fact-finder/planner reports can come from (`fact-finder/SKILL.md:567`; `planner/SKILL.md:479,483`) | `CLAUDE.md`, "The pipeline definition is duplicated" | Forbids `Mission Check` reports from being mistaken for fact/QA reports by these closed lists — its output directory must **not** be added to them, since a `Mission Check` report is never a `/planner` input | fixed — not investigated |
| ORBIT has no mission or spec document; `CLAUDE.md` and the `SKILL.md` files are the normative record | `inferred — Glob of thoughts/shared/missions/ and specs/ both returned empty; CLAUDE.md and the Just-Do-It feature brief precedent fill the role` | Forces this brief's own constraints to cite `CLAUDE.md` or a skill file rather than a spec; forces `Mission Check`'s own eventual coverage/fidelity logic to treat "no mission" as a first-class, expected case rather than an error, since ORBIT's own tree is itself an orphan-only project today | inferred — verified (`ls thoughts/shared/missions/` and `ls thoughts/shared/specs/` both returned empty; see Critical Finding 11 for the full current directory census) |

## Critical Findings (Verified, Planner Attention Required)

### 1. The "10 categories" citation in the feature brief's Inherited Constraints/Integration Points is split across two files, not one

- **Observation:** `thoughts-locator.md` contains exactly two occurrences of the phrase "10 categories" (lines 31 and 167). A repository-wide grep for the same phrase across `.claude/` finds a third occurrence in `.claude/skills/fact-finder/SKILL.md:376`, not in `thoughts-locator.md`.
- **Direct consequence:** A sweep for "every place counting '10 categories'" that only edits `thoughts-locator.md` at three line numbers will miss the actual third occurrence, which lives in a different file.
- **Evidence:** `.claude/agents/thoughts-locator.md:31,167`; `.claude/skills/fact-finder/SKILL.md:376`
- **Excerpt:**
  ```
  # thoughts-locator.md:31
     - **Sections Returned:** All 10 categories
  # thoughts-locator.md:167
  **For scope = comprehensive (default):** Return all 10 categories (omitting empty ones).
  # fact-finder/SKILL.md:376
  - Returns: All 10 categories (missions, specs, feature briefs, change briefs, epics, plans, QA reports, fact reports, prototype learnings, project notes)
  ```

### 2. `dox-update` writes no durable artifact — it edits `AGENTS.md` files in place and prints a summary

- **Observation:** `dox-update/SKILL.md`'s Execution has three phases; Phase 3 reads "Print a summary table: Path | Action | Reason" and "End with counts" — no `Write` call or output file path appears anywhere in the skill file.
- **Direct consequence:** `dox-update` supplies no frontmatter or report-structure precedent for Mission Check's own report; of the three existing output shapes in this codebase (fact-finder standard, fact-finder QA-mode, dox-update), only two are actual files with frontmatter.
- **Evidence:** `.claude/skills/dox-update/SKILL.md:85-91`
- **Excerpt:**
  ```
  ### Phase 3 — Summary report

  Print a summary table: Path | Action | Reason

  Actions: `REGENERATED` / `SKIPPED (current)`

  End with counts: "Regenerated: N | Skipped (up to date): M | Total checked: P"
  ```

### 3. `scripts/build-plugin.sh` copies the entire skills tree with no per-skill enumeration

- **Observation:** The build script's skills step is `cp -R "$SRC/skills/." "$OUT/skills/"` followed by a stray `AGENTS.md`-deletion pass; no skill name appears anywhere in the script.
- **Direct consequence:** A new `.claude/skills/mission-check/SKILL.md` (single file or with siblings) is picked up automatically by the next build with zero change to `build-plugin.sh`, confirming the brief's Assumption/Open Question 6.
- **Evidence:** `scripts/build-plugin.sh:49-53`
- **Excerpt:**
  ```
  mkdir -p "$OUT/skills"
  cp -R "$SRC/skills/." "$OUT/skills/"
  find "$OUT/skills" -name AGENTS.md -delete
  log "skills/    ($(find "$OUT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ') skills)"
  ```

### 4. `dox-update`'s exclusion list has 10 entries, two more than the brief's Open Question 5 names

- **Observation:** The brief's Open Question 5 asks whether "the same exclusion list (`.git`, `.claude`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`)" (8 entries) should carry over. The actual `find` invocation in `dox-update/SKILL.md` excludes those 8 plus `*/coverage*` and `*/.nyc_output*` — 10 entries total.
- **Direct consequence:** Reusing "the same exclusion list" verbatim, if that route is taken, means 10 patterns, not 8.
- **Evidence:** `.claude/skills/dox-update/SKILL.md:51-64`
- **Excerpt:**
  ```
  find . -name "AGENTS.md" \
    -not -path './.git*' \
    -not -path '*/.claude*' \
    -not -path '*/node_modules*' \
    -not -path '*/dist*' \
    -not -path '*/build*' \
    -not -path '*/__pycache__*' \
    -not -path '*/.venv*' \
    -not -path '*/vendor*' \
    -not -path '*/coverage*' \
    -not -path '*/.nyc_output*' \
    | sort
  ```

### 5. A same-day, collision-avoiding naming convention already exists for `thoughts/shared/qa/` reports

- **Observation:** `thoughts/shared/qa/AGENTS.md` documents `YYYY-MM-DD-<Target>-<Lens>.md`, where `<Lens>` is a fixed suffix from a closed set of four tokens (`-Python`, `-TypeScript`, `-Design`, `-Bugs`) naming which QA skill produced the report, explicitly "requiring the lens suffix to prevent collisions" when multiple reports target the same file on the same day.
- **Direct consequence:** A precedent for suffixing `YYYY-MM-DD-Topic.md` to avoid same-day collisions already exists in this codebase, but its suffix values are semantic labels chosen from a small closed set, not a generic run-counter or timestamp — no existing convention anywhere in `thoughts/shared/` uses a numeric counter or time-of-day suffix (confirmed by inspecting every subdirectory's file listing; none contain such a suffix).
- **Evidence:** `thoughts/shared/qa/AGENTS.md:13-15`
- **Excerpt:**
  ```
  **File naming:** `YYYY-MM-DD-<Target>-<Lens>.md` where `<Target>` is the module or file name (e.g., `Auth-Module`, `TypeScript-Config`) and `<Lens>` names the QA skill that produced the report. A full audit produces one file per loaded skill, requiring the lens suffix to prevent collisions.

  **Lens tokens:** `-Python` (`python-qa`), `-TypeScript` (`typescript-qa`), `-Design` (`clean-code`), `-Bugs` (`logic-bugs-qa`). These four are the closed set; a new QA skill must declare its own token.
  ```

### 6. `thoughts/shared/prototypes/` already carries an `AGENTS.md` despite holding zero content files

- **Observation:** `ls thoughts/shared/prototypes/` returns only `AGENTS.md`; the file itself states "No notes exist here yet; the directory holds only this contract. That is expected — `/prototype` is an optional entry point, and file counts are not a contract."
- **Direct consequence:** A precedent exists for registering a `thoughts/shared/` child directory's `AGENTS.md` before any of its intended content files have ever been written — directly on point for the brief's Open Question 1 about whether the new report directory needs its `AGENTS.md` immediately.
- **Evidence:** `thoughts/shared/prototypes/AGENTS.md:1-7`
- **Excerpt:**
  ```
  # prototypes/ — Prototype Learnings Notes

  ## Purpose

  Stores short learnings notes produced by `/prototype` after every prototype session...

  No notes exist here yet; the directory holds only this contract. That is expected — `/prototype` is an optional entry point, and file counts are not a contract.
  ```

### 7. Three divergent frontmatter/output shapes already exist for report-like skill outputs

- **Observation:** fact-finder's standard-mode report frontmatter carries six keys — `date`, `fact-finder`, `topic`, `status`, `upstream-artifact`, `coverage`. Its QA-mode report frontmatter carries five different keys — `date`, `message_type: QA_REPORT`, `target`, `status`, `upstream-artifact` — with no `fact-finder:` signature and no `coverage:` list. `dox-update` produces neither frontmatter nor a file (Critical Finding 2).
- **Direct consequence:** No single existing convention can be adopted unchanged for a Mission Check report; any choice combines or diverges from two already-different YAML shapes plus a third no-artifact case.
- **Evidence:** `thoughts/shared/facts/AGENTS.md:15-26`; `thoughts/shared/qa/AGENTS.md:17-26`
- **Excerpt:**
  ```
  # facts/AGENTS.md:15-26
  ---
  date: YYYY-MM-DD
  fact-finder: [identifier]
  topic: "[Topic]"
  status: complete
  upstream-artifact: [path or none]
  coverage:
    - [directories/modules/tools inspected]
  ---

  # qa/AGENTS.md:17-26
  ---
  date: YYYY-MM-DD
  message_type: QA_REPORT
  target: "[module or file name]"
  status: complete
  upstream-artifact: none
  ---
  ```

### 8. `dox-update`'s staleness check is content comparison, not a hash; hash-based staleness is unimplemented

- **Observation:** `dox-update/SKILL.md`'s Phase 2 runs `Bash ls -la <governing_dir>` (explicitly non-recursive) and applies four textual staleness criteria — referencing file names that no longer exist, new file types/subdirectories not reflected, generic/placeholder content, or ownership mismatch. No hash of any kind is computed. A grep of `ORBIT-V5-CONCEPT.md` for "hash" finds content-hash staleness described only as a *proposed* V5 mechanism ("Ändert sich die Quelle (Hash weicht ab), ist das Faktum automatisch stale" at line 114) — a document `CLAUDE.md` itself labels "Draft, Not Current State... None of it is implemented."
- **Direct consequence:** The only staleness-detection mechanism with a working implementation anywhere in this codebase today is `dox-update`'s content/listing comparison; a hash-based alternative exists solely as prose in an explicitly unimplemented design document.
- **Evidence:** `.claude/skills/dox-update/SKILL.md:36-43,76-78`; `ORBIT-V5-CONCEPT.md:110,114`
- **Excerpt:**
  ```
  # dox-update/SKILL.md:36-43
  An AGENTS.md is considered **stale** when any of the following is true:
  1. It references specific file names that no longer exist in the directory
  2. The directory now contains file types, patterns, or subdirectories that materially change the directory's purpose and are not reflected in the AGENTS.md
  3. The AGENTS.md content is clearly generic or placeholder...
  4. The described ownership or workflow no longer matches the directory's evident role

  # ORBIT-V5-CONCEPT.md:110,114
  - **Content-Hash** der zitierten Code-Stelle zum Erhebungszeitpunkt
  ...
  Ändert sich die Quelle (Hash weicht ab), ist das Faktum automatisch **stale**.
  ```

### 9. fact-finder's own locate-then-analyze two-subagent pattern is the closest existing precedent for discovery-then-per-target-analysis

- **Observation:** `fact-finder/SKILL.md` documents, under the heading "Two-Step Workflow for Historical Documentation," delegating first to `thoughts-locator` (which enumerates matching document paths, up to 10 categories) and then, using the returned paths, to `thoughts-analyzer` for structured per-document extraction — two separate subagent invocation types, one that finds targets and one that analyzes each.
- **Direct consequence:** This two-subagent-type, locate-then-analyze-per-item pattern already exists in `.claude/skills/**`'s delegation conventions, and is structurally distinct from `dox-update`'s single-context (no subagent dispatch) find-then-loop pattern, which never delegates Phase 1's `find` output to a separate analyzer agent.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:282-297`
- **Excerpt:**
  ```
  ### Two-Step Workflow for Historical Documentation

  When researching features with historical context..., use the two-step workflow:

  1. **Step 1**: Use `thoughts-locator` to find relevant historical documents
  2. **Step 2**: Use `thoughts-analyzer` to extract structured insights from those documents
  ```

### 10. `thoughts/shared/AGENTS.md`'s own "Populated today / Empty today" line is already stale, independent of Mission Check

- **Observation:** The line reads "**Populated today:** `plans/`, `facts/`, `qa/`, `features/`, `epics/`. **Empty today:** `missions/`, `specs/`, `prototypes/`, `changes/`." A direct `ls thoughts/shared/changes/` returns `2026-08-03-Implement-LSP-Preference.md` plus `AGENTS.md` — the directory is not empty.
- **Direct consequence:** The exact line the feature brief's Integration Points names for a new-directory addition is not currently accurate for at least one existing entry (`changes/`), a fact independent of whatever change Mission Check itself makes to that line.
- **Evidence:** `thoughts/shared/AGENTS.md:32`; `thoughts/shared/changes/` directory listing
- **Excerpt:**
  ```
  **Populated today:** `plans/`, `facts/`, `qa/`, `features/`, `epics/`. **Empty today:** `missions/`, `specs/`, `prototypes/`, `changes/`.
  ```
  ```
  $ ls thoughts/shared/changes/
  2026-08-03-Implement-LSP-Preference.md
  AGENTS.md
  ```

### 11. No `mission-check` skill directory or prior history exists yet; current `thoughts/shared/` census

- **Observation:** `ls .claude/skills/` lists 17 directories (`change-architect`, `claude-code-extensions`, `clean-code`, `commit`, `dox-init`, `dox-update`, `epic-planner`, `fact-finder`, `feature-architect`, `implement`, `just-do-it`, `logic-bugs-qa`, `mission-architect`, `planner`, `prototype`, `python-qa`, `specifier`, `typescript-qa`), none named `mission-check`. `git log --oneline --all | grep -i "mission.check"` returns no output. Directory census: `missions/` and `specs/` are empty; `prototypes/` holds only `AGENTS.md`; `changes/` holds one brief plus `AGENTS.md`; `epics/`, `features/`, `facts/`, `qa/`, `plans/` are populated.
- **Direct consequence:** Mission Check's skill directory, output directory, and every table/index row the brief names are all yet to be created; there is no partial or abandoned prior implementation to reconcile against.
- **Evidence:** `.claude/skills/` directory listing; `git log --oneline --all` (empty grep match); `thoughts/shared/*/` directory listings

### 12. `dox-update` ships as a single-file skill directory — direct precedent for Mission Check's likely shape

- **Observation:** `ls -la .claude/skills/dox-update/` shows exactly one file, `SKILL.md`. By contrast, `.claude/skills/implement/` has three files (`SKILL.md`, `implementer-prompt.md`, `reviewer-prompt.md`), and both shapes are copied automatically by the same `cp -R` in `build-plugin.sh` (Critical Finding 3).
- **Direct consequence:** A single-file `mission-check/SKILL.md` — the shape the brief's Integration Points already anticipates ("shaped like `/dox-update`... crossed with `/fact-finder`'s multi-subagent dispatch pattern") — follows an existing precedent, and needs no accommodation from `build-plugin.sh` either way.
- **Evidence:** `.claude/skills/dox-update/` directory listing; `.claude/skills/implement/` directory listing

## Detailed Technical Analysis (Verified)

### Report/output conventions surveyed for Open Question 2 (frontmatter key set)

| Skill | Output | Frontmatter keys | Evidence |
|---|---|---|---|
| `/fact-finder` (standard mode) | `thoughts/shared/facts/YYYY-MM-DD-Topic.md` | `date`, `fact-finder`, `topic`, `status`, `upstream-artifact`, `coverage` | `thoughts/shared/facts/AGENTS.md:15-26` |
| `/fact-finder` (QA mode) | `thoughts/shared/qa/YYYY-MM-DD-Target-Lens.md` | `date`, `message_type: QA_REPORT`, `target`, `status`, `upstream-artifact` | `thoughts/shared/qa/AGENTS.md:17-26` |
| `/prototype` | `thoughts/shared/prototypes/YYYY-MM-DD-slug.md` | `date`, `message_type: PROTOTYPE_NOTE`, `topic`, `decision`, `status` | `thoughts/shared/prototypes/AGENTS.md:24-33` |
| `/dox-update` | none (in-place `AGENTS.md` edits + printed summary) | n/a | `.claude/skills/dox-update/SKILL.md:85-91` |

`/prototype`'s note format is a fourth data point not named in the brief's Open Question 2: it, too, uses a `message_type:` key (like QA) rather than a skill-name signature key (like standard fact-finder), and adds a `decision:` field specific to its own domain. Three of the four existing shapes (`fact-finder` QA-mode, `prototype`, and the brief's own precedent search) use `message_type:`; only standard-mode `fact-finder` and `/planner`/`/change-architect`/`/just-do-it` use a skill-name signature key (`fact-finder:`, `planner:`, `change-architect:`, `just-do-it:`).

### Naming precedents surveyed for Open Question 3 (same-day collisions)

Every `thoughts/shared/` subdirectory was listed directly. No existing filename anywhere in the tree uses a numeric run counter or a time-of-day component; the only same-day disambiguation mechanism found is the QA lens suffix (Critical Finding 5), which is semantic (names the producing skill) rather than generic (distinguishing arbitrary repeat runs of the *same* skill on the *same* target).

- **Evidence:** directory listings of `thoughts/shared/changes/`, `facts/`, `qa/`, `plans/`, `epics/`, `features/`, `prototypes/`, `missions/`, `specs/`

### DOX registration precedents surveyed for Open Question 1 (new directory + AGENTS.md)

`thoughts/shared/AGENTS.md`'s Child DOX Index (`:46-53`) lists five children with `AGENTS.md`: `changes/`, `plans/`, `facts/`, `qa/`, `prototypes/`. Of these, `prototypes/` is the only one currently holding zero content files alongside its `AGENTS.md` (Critical Finding 6) — direct precedent that registration does not wait for a first report to exist.

- **Evidence:** `thoughts/shared/AGENTS.md:46-53`; `thoughts/shared/prototypes/AGENTS.md:1-7`

## Verification Log

- **Verified (personally read):** `thoughts/shared/features/2026-08-05-Mission-Check.md`; `.claude/skills/dox-update/SKILL.md`; `thoughts/shared/AGENTS.md`; `.claude/agents/thoughts-locator.md`; `scripts/build-plugin.sh`; `.claude/skills/fact-finder/SKILL.md`; `CLAUDE.md`; `README.md`; `.claude/hooks/session-start`; `thoughts/shared/changes/AGENTS.md`; `thoughts/shared/facts/AGENTS.md`; `thoughts/shared/qa/AGENTS.md`; `thoughts/shared/prototypes/AGENTS.md`; `thoughts/shared/plans/AGENTS.md`; `.claude/skills/planner/SKILL.md:470-499`; `.claude/skills/implement/SKILL.md:225-248`; `CHANGELOG.md:1-40`; `.claude/skills/specifier/SKILL.md:335-348`; `.claude/skills/epic-planner/SKILL.md:340-353`; `thoughts/shared/features/2026-07-31-Just-Do-It.md:1-20`; `thoughts/shared/facts/2026-07-31-Just-Do-It-Route.md:1-40`; `ORBIT-V5-CONCEPT.md` (grep matches at lines 110, 114, 163, 205); directory listings of every `thoughts/shared/` subdirectory, `.claude/skills/`, `.claude/skills/dox-update/`, `.claude/skills/implement/`.
- **Accepted from sub-agent excerpts (not personally re-read):** none — no sub-agent was delegated to in this research run; every citation above was independently confirmed by direct `Read`/`Bash`/`Grep`.
- **Spot-checked excerpts captured:** yes.

## Open Questions / Unverified Claims

- **Exact name of the new report directory** (e.g. `mission-checks/`): no existing naming rule in `thoughts/shared/AGENTS.md` or elsewhere dictates a specific name for a new pipeline-adjacent artifact directory — this is a naming decision the research found no way to derive from precedent, only precedent for *how* to register whichever name is chosen (Critical Finding 6).
- **Exact frontmatter key set for a Mission Check report**: three divergent existing shapes were surveyed (Detailed Technical Analysis, first table) with no single dominant convention; choosing among them (or combining) is a design decision, not a fact this research can settle further.
- **Exact same-day collision-avoidance suffix mechanism**: the QA lens-suffix precedent (Critical Finding 5) is the only same-day disambiguation convention found anywhere in `thoughts/shared/`, and it is semantic rather than generic — whether a generic mechanism (counter, timestamp) should be invented instead has no precedent to confirm or rule out in this codebase.
- **Exact staleness mechanism to adopt**: `dox-update`'s content-comparison approach is documented and implemented (Critical Finding 8); a hash-based alternative is described only in the unimplemented `ORBIT-V5-CONCEPT.md`, so no working hash-based precedent exists anywhere in this codebase to model against — attempting one would be novel work, not adoption of an existing pattern.

## References

**Codebase Citations:**
- `thoughts/shared/features/2026-08-05-Mission-Check.md` (upstream feature brief, full document)
- `.claude/agents/thoughts-locator.md:31,46-58,167`
- `.claude/skills/fact-finder/SKILL.md:282-297,376,567,642-717`
- `.claude/skills/dox-update/SKILL.md:36-43,51-64,76-78,85-91`
- `.claude/skills/planner/SKILL.md:476-483`
- `.claude/skills/implement/SKILL.md:236-238`
- `.claude/skills/specifier/SKILL.md:339-346`
- `.claude/skills/epic-planner/SKILL.md:344-351`
- `scripts/build-plugin.sh:49-53`
- `CLAUDE.md:32,128-159,243-253`
- `thoughts/shared/AGENTS.md:9-32,46-53`
- `thoughts/shared/changes/AGENTS.md:1-19`
- `thoughts/shared/facts/AGENTS.md:15-26`
- `thoughts/shared/qa/AGENTS.md:13-26`
- `thoughts/shared/prototypes/AGENTS.md:1-33`
- `thoughts/shared/plans/AGENTS.md:72-79`
- `thoughts/shared/features/2026-07-31-Just-Do-It.md:1-20`
- `thoughts/shared/facts/2026-07-31-Just-Do-It-Route.md:1-40`
- `ORBIT-V5-CONCEPT.md:110,114,163,205`
- `CHANGELOG.md:14-16`
