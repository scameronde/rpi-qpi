---
date: 2026-08-05
feature-architect: feature-architect-skill
mission-source: "none"
spec-source: "none"
feature-name: "Mission Check"
type: "feature-addition"
status: complete
---

# Feature Brief: Mission Check

## System Context

**Project**: rpiqr (ORBIT) — Claude Code Workflow Toolkit

**Core purpose**: A structured agentic development pipeline that takes work from intent to reviewed, committed code through explicit, durable artifacts at every stage — mission → spec → epic → fact report → plan → STATE → code, plus the shorter brownfield and small-change routes that join the same execution path.

**Relevant existing components**:
- The traceability chain described in `CLAUDE.md`, "Artifact Frontmatter — the traceability chain" — every artifact's back-pointer (`mission-source:`, `spec-source:`, `fact-source:`, `plan:`, `upstream-artifact:`) names only its *immediate* predecessor.
- `/implement`'s closing acceptance step (`implement/SKILL.md:232-240`) — reads the plan's own `## Acceptance Criteria`, and, only when `upstream-artifact:` names a path under `epics/`, the epic's `## Verification Plan (For Implementor)`. Plans sourced from `features/` or `changes/` skip this second check entirely, by explicit design (`implement/SKILL.md:238`).
- `specifier`'s `## Traceability Matrix` (`specifier/SKILL.md:339-346`) and `epic-planner`'s `## Traceability` table (`epic-planner/SKILL.md:344-351`) — the only two places in `.claude/skills/**/SKILL.md` that mention mission-tracing at all, and both are one-time self-checks performed by the authoring skill when it writes its own artifact; no downstream `SKILL.md` reads either table back.
- `/dox-update` (`dox-update/SKILL.md`) — the closest existing precedent for a whole-tree, idempotent audit skill: walks every existing `AGENTS.md`, compares each against current reality, and repairs only what is stale, leaving accurate files untouched.
- `thoughts/shared/AGENTS.md`'s directory-assignment table (`:17-32`) and `.claude/agents/thoughts-locator.md`'s "Map of the Archive" (`:46-58`, 10 categories, confirmed at `thoughts-locator.md:31,167,376`) — the closed enumerations of artifact directories that any new directory under `thoughts/shared/` must join.
- ORBIT has no mission or spec document of its own — `thoughts/shared/missions/` and `specs/` are both empty (confirmed by `Glob`). Prior brownfield work on ORBIT itself (`thoughts/shared/features/2026-07-31-Just-Do-It.md`) established the precedent this brief follows: `mission-source: "none"`, `spec-source: "none"`, and `CLAUDE.md` cited as the normative record in place of a spec.

## Feature Vision

ORBIT's traceability chain is real but exclusively *pairwise*: each stage verifies its output against the artifact immediately upstream — a task against its plan entry, a plan against its epic, an epic against its spec — and never against the root intent the chain claims to trace back to. This is deliberate and cheap: it keeps every review context small (one reviewer reads one task, not the whole ancestry). But it also means the pipeline performs *verification* ("was the immediate contract honored?") and never *validation* ("does the result still serve the reason this was built at all?"). Nothing in `.claude/skills/**` — confirmed by exhaustive grep — ever re-opens a mission or spec to check the code that was eventually produced against it.

The gap is not evenly distributed. The greenfield path at least self-checks once, at write time, via the Traceability Matrix and Traceability table. The two routes that never touch a mission at all — `/feature-architect` (brownfield) and `/change-architect` → `/just-do-it` (small changes) — have no such self-check, and their plans are the ones `/implement`'s closing step explicitly exempts from even the one-hop epic verification. These are also, by construction, the routes carrying the largest volume of everyday work on a mature project: one `/just-do-it` change at a time, each locally justified against its own change brief, with no mechanism that ever asks whether the accumulation of many such changes has drifted the system away from what it was originally supposed to do.

`Mission Check` closes that gap the way ORBIT closes every other gap: with a durable artifact, produced by a dedicated skill, rather than a runtime assertion. It does not sit inside `/implement` and does not block anything — Validation of this kind is a judgment a human asks for when they want to ask it, not a mechanical gate that can be satisfied by construction. It is the auditor `/dox-update` already is for `AGENTS.md` staleness, aimed instead at the question "is this project's code still what its recorded intent says it should be" — across every mission tree the project has, and, just as importantly, across the change and feature briefs that were never rooted in one to begin with.

## Target Users

**Primary users of this feature**:
- ORBIT maintainers and users who want to periodically ask, of their own accord, whether a project's accumulated work still matches its recorded intent — the same audience `/dox-update` already serves for documentation health, extended to intent health.

**Impact on other users** (if applicable):
- Everyone else on the existing pipeline is unaffected: `Mission Check` reads artifacts and code, writes its own new report, and touches nothing that `/mission-architect` through `/implement` or `/just-do-it` produce or consume.

## Feature Value Proposition

A project's actual code can be checked against everything that was ever recorded about why it should exist — including the change and feature work that was never traced to a mission in the first place — on demand, without adding cost or ceremony to the pipeline that produced that code.

## Essential Capabilities

1. **Whole-tree topology discovery**
   - **What it enables**: A sweep of the entire `thoughts/shared/` tree that reconstructs the actual forest of intent artifacts present today — every mission and its downstream spec/epic/plan lineage, every feature brief, every change brief and its `-RECORD.md` sibling — rather than being handed one target artifact the way `/fact-finder` is.
   - **Why it's essential**: Without this, `Mission Check` can only audit what a human already knows to point it at. The whole point is to surface drift the human isn't already tracking, which means the skill must find its own targets.

2. **Orphan-branch identification and reporting**
   - **What it enables**: Every feature brief or change brief whose `mission-source:` / equivalent back-pointer is `none` or absent is identified as an orphan branch and reported explicitly — never silently skipped because it lacks a mission to trace to.
   - **Why it's essential**: This is where the highest-volume, least-checked work lives. `/feature-architect` and `/change-architect` → `/just-do-it` are the two routes with no mission-level self-check at write time and no epic-level re-check at `/implement`'s close (`implement/SKILL.md:238`). Treating their absence of a mission as "nothing to check" would exempt exactly the work most likely to have drifted.

3. **Coverage and Fidelity checks, run as distinct passes**
   - **What it enables**: For each mission tree, a *Coverage* pass asks whether every capability the mission promises still has living, traceable code behind it. A *Fidelity* pass asks whether the code that exists still behaves like what its recorded intent describes. For orphan branches, the same Fidelity question is asked against the branch's own recorded intent (its Feature Vision or Change Brief target state) as a weaker, local baseline — paired with an explicit note that this is not a root-mission check, since none exists to check against.
   - **Why it's essential**: Coverage catches silent abandonment (a promised capability whose code was never finished or was later removed); Fidelity catches slow semantic drift accumulated through many small, individually-justified changes. They fail in different ways and finding one says nothing about the other.

4. **Incremental re-analysis, not full recomputation per run**
   - **What it enables**: Following `/dox-update`'s model (`dox-update/SKILL.md`, "Staleness Criteria"), a lightweight pre-check for each discovered tree or orphan branch — has anything relevant changed since the tree/branch was last checked — before spending a full analysis pass on it. Trees with no relevant change since the last run are reported as unchanged, not silently omitted.
   - **Why it's essential**: A whole-project sweep that fully recomputes everything on every invocation does not scale past a small project, and the incentive to actually run the skill regularly disappears if every run is as expensive as the first.

## Explicit Non-Goals

- **A blocking gate in `/implement` or anywhere else in the pipeline**: `Mission Check` is invoked by a human when they choose to ask the question. It does not run automatically, does not block a wave, a task, or a commit, and its findings carry no authority to stop other skills.
- **Proposing next actions in ORBIT vocabulary**: The report is diagnostic only. It does not draft a Change Brief, does not suggest specific wording for a Feature Brief, and does not otherwise reach into the role `/change-architect` or `/feature-architect` already own. A human reads the findings and decides what, if anything, to do about them.
- **Changing pipeline ordering or routing**: `Mission Check` does not sit in the mission→spec→epic→plan→implement sequence and adds no new stage to it. It does not touch any of the five canonical pipeline-ordering prose locations `CLAUDE.md` calls out (`CLAUDE.md`, "The pipeline definition is duplicated") — those describe *routing between* skills, which this feature does not change.
- **Replacing or altering any existing verification step**: `/implement`'s closing acceptance check, the reviewer prompts, `/planner`'s evidence verification, and the specifier/epic-planner self-checks are all untouched. `Mission Check` adds a check that does not exist; it does not modify checks that do.
- **Writing code or committing anything**: Like `/fact-finder` and `/dox-update`, `Mission Check` only reads the codebase and writes its own report artifact. It never edits application files, `.claude/` skill files, or git history.
- **A write-once artifact**: Unlike every other artifact type in `thoughts/shared/`, a `Mission Check` report is a repeatable point-in-time snapshot by design. Each run produces its own new, independently timestamped file; no run supersedes, overwrites, or is superseded by another. This is a deliberate departure from the write-once convention (`thoughts/shared/AGENTS.md`, "Ownership": "All other files are write-once after creation"), and must be documented as such in the new directory's own `AGENTS.md` so a future maintainer does not read repeated, non-superseding files as a violation.

## Inherited Constraints

| Constraint | Kind | Source | What it forbids or forces |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked via the Skill tool as `/skill-name` | Technology | `CLAUDE.md`, Claude Code Workflow | Forces `/mission-check` into the same shape as every sibling skill; forbids a different invocation mechanism |
| Nothing compiles and there is no test suite; verification is reading plus two commands | Technology | `CLAUDE.md`, What This Repository Is | Forbids "the tests will catch it" for this feature's own implementation — correctness rests on the fact report's evidence and on review, same as every other skill addition |
| `Mission Check` is a Quality and Maintenance skill, not a Workflow skill — it does not appear in any greenfield/brownfield/small-fix routing table | Architectural | `CLAUDE.md`, Workflow Skills / Quality and Maintenance Skills (`:128,149`) | Forces its listing into the three "Quality and Maintenance" table locations (`CLAUDE.md:149-159`, `README.md`'s "Quality and maintenance skills" table, `.claude/hooks/session-start`'s skills block) rather than the "Workflow Skills" or pipeline-ordering locations; forbids treating this as a routing change |
| Artifacts under `thoughts/shared/` are named `YYYY-MM-DD-Topic.md` and are write-once after creation, with STATE files the one documented exception | Architectural | `CLAUDE.md`, Workflow Pipeline; `thoughts/shared/AGENTS.md:9-11,15` | Forces a naming scheme precise enough to keep same-day runs distinct (plain `YYYY-MM-DD-Topic.md` collides within a day) and forces the write-once departure to be documented in a new `AGENTS.md`, not silently exempted |
| `.claude/**` is deliberately outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and its `changes/`, `facts/`, `plans/`, `prototypes/`, `qa/` children; `missions/`, `specs/`, `epics/`, `features/` carry none | Architectural | `CLAUDE.md`, DOX Protocol (`:253`) | Forbids an `AGENTS.md` under `.claude/skills/mission-check/`; forces a new `AGENTS.md` for the new report directory under `thoughts/shared/` (since it holds durable artifacts, unlike `missions/`/`specs/`/`epics/`/`features/`, which inherit the parent contract instead) and forces `thoughts/shared/AGENTS.md`'s Child DOX Index to gain a row for it |
| `thoughts/shared/AGENTS.md`'s directory-assignment table and `.claude/agents/thoughts-locator.md`'s "Map of the Archive" are closed enumerations — 10 categories, confirmed at `thoughts-locator.md:31,167,376` | Architectural | `thoughts/shared/AGENTS.md:17-32`; `.claude/agents/thoughts-locator.md:46-58` | Forces both tables to gain a row/category for the new report directory; an omission there means `thoughts-locator` never finds a `Mission Check` report even when asked directly |
| `/planner`'s admission gate and `implement/SKILL.md:238`'s epic-verification test both read `upstream-artifact:` against a closed list of directories fact-finder/planner reports can come from (`fact-finder/SKILL.md:567`; `planner/SKILL.md:479,483`) | Architectural | `CLAUDE.md`, "The pipeline definition is duplicated" | Forbids `Mission Check` reports from being mistaken for fact/QA reports by these closed lists — its output directory must **not** be added to them, since a `Mission Check` report is never a `/planner` input |
| ORBIT has no mission or spec document; `CLAUDE.md` and the `SKILL.md` files are the normative record | Architectural | `inferred — Glob of thoughts/shared/missions/ and specs/ both returned empty; CLAUDE.md and the Just-Do-It feature brief precedent fill the role` | Forces this brief's own constraints to cite `CLAUDE.md` or a skill file rather than a spec; forces `Mission Check`'s own eventual coverage/fidelity logic to treat "no mission" as a first-class, expected case rather than an error, since ORBIT's own tree is itself an orphan-only project today |

## Integration Points

- **`.claude/skills/mission-check/SKILL.md`** (new) — the skill itself, shaped like `/dox-update` (whole-tree sweep, staleness-aware) crossed with `/fact-finder`'s multi-subagent dispatch pattern (per discovered tree/branch, an analysis pass) rather than either alone.
- **`thoughts/shared/<new-directory>/`** (new, name TBD — e.g. `mission-checks/`) — holds one report per run, each independently timestamped and never superseding another. Needs its own `AGENTS.md` documenting the deliberate departure from write-once.
- **`thoughts/shared/AGENTS.md`** — directory-assignment table (`:17-32`) gains a row; "Populated today / Empty today" line (`:32`) and Child DOX Index (`:46-53`) both gain the new directory.
- **`.claude/agents/thoughts-locator.md`** — "Map of the Archive" (`:46-58`) gains an eleventh category; every place counting "10 categories" (`:31,167,376`) moves to 11, and any count quoted elsewhere (e.g. `fact-finder/SKILL.md`, which references thoughts-locator's comprehensive scope) should be checked for the same stale count.
- **Skills-listing tables, three places** — `CLAUDE.md`'s "Quality and Maintenance Skills" table (`:149-159`), `README.md`'s "Quality and maintenance skills" table, `.claude/hooks/session-start`'s skills block. All three need a `mission-check` row; none of the pipeline-ordering prose blocks in the same three files need to change.
- **`scripts/build-plugin.sh`** — should be checked for whether it enumerates skill directories explicitly or discovers them automatically (the `/change-architect` and `/just-do-it` runs both concluded no change was needed for a plain new skill directory; confirm that conclusion still holds).
- **`CHANGELOG.md`** — an entry under `## [Unreleased]`.

## Success Criteria

- [ ] Invoking `/mission-check` on this repository (which has no mission or spec) discovers and reports on every feature brief and change brief as an orphan branch, without erroring or asking the user to supply a target.
- [ ] Running `/mission-check` a second time with no intervening code or artifact changes reports every tree/branch as unchanged since the last run, without re-running a full analysis pass on any of them.
- [ ] Each invocation produces its own new file under the new report directory; no existing report file is edited, overwritten, or marked superseded by a later run.
- [ ] The report never proposes a specific Change Brief, Feature Brief, or code edit — findings are stated as observations, not instructions.
- [ ] `thoughts/shared/AGENTS.md`, `thoughts-locator.md`, and all three skills-listing table locations reflect the new skill and directory; none of the pipeline-ordering prose blocks in `CLAUDE.md`, `README.md`, or `.claude/hooks/session-start` are touched.

## Assumptions

**About the existing system**:
- ORBIT has no mission or spec document of its own; both `thoughts/shared/missions/` and `specs/` are empty, confirmed by `Glob`. `mission-source:` and `spec-source:` above read `none`, following the precedent set by `thoughts/shared/features/2026-07-31-Just-Do-It.md`.
- The new report directory's exact name and the report's exact frontmatter field set (whether it needs its own `mission-check:` signature field analogous to `fact-finder:`/`planner:`) are left open for `/fact-finder` and `/planner` to settle, following the same pattern the Just-Do-It brief used for its Record file's naming and key set.
- The mechanism for "has anything relevant changed since the last run" (content hashes, git diff since the prior run's timestamp, or something else) is left open — `/dox-update`'s own staleness criteria (`dox-update/SKILL.md`, "Staleness Criteria") are content-comparison based rather than hash-based, and whether that pattern transfers is a fact-finding question, not a design decision this brief needs to settle.

**About users**:
- A user who runs `Mission Check` wants a diagnostic they can act on themselves, not a tool that starts drafting new pipeline artifacts on their behalf — this is the premise behind the "rein diagnostisch" decision above. If it's wrong, the report becomes a to-do list nobody trusts because it was written by a skill with no stake in getting the follow-up right.

## Open Questions for Fact-Finder

- [ ] What exact name should the new report directory carry, and does it need its own `AGENTS.md` immediately (per the DOX rule that `thoughts/shared/`'s durable-artifact children — unlike `missions/`/`specs/`/`epics/`/`features/` — carry one), or can it inherit the parent's contract until the first report is written, mirroring how `thoughts/shared/changes/` was registered before it held a file?
- [ ] What frontmatter key set should a `Mission Check` report carry? Compare against `fact-finder`'s and `dox-update`'s own report/output conventions (if `dox-update` produces any artifact at all, versus editing `AGENTS.md` files in place) to decide whether a `mission-check:` signature field, an `upstream-artifact:`-style pointer to every tree/branch it covered, or something else is the right shape.
- [ ] Exactly how should same-day repeated runs be named so they never collide under the `YYYY-MM-DD-Topic.md` convention — a time-of-day suffix, a run counter, or something else — and does this pattern already exist anywhere else in the codebase (e.g., QA reports) that could be reused rather than invented?
- [ ] What staleness-detection mechanism should the incremental re-analysis pass use? Compare `/dox-update`'s content-comparison approach against content-hash-based staleness (the mechanism `ORBIT-V5-CONCEPT.md` proposes for facts) and establish which is feasible with the tools available to a Claude Code skill (no persistent process, no database).
- [ ] How exactly does `/dox-update`'s "Phase 1 — Find all existing AGENTS.md files" `find` invocation exclude paths, and does the same exclusion list (`.git`, `.claude`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`) need to carry over to `Mission Check`'s topology sweep, or does sweeping `thoughts/shared/` only make exclusions moot?
- [ ] Does `scripts/build-plugin.sh` require any change for a new skill directory with only a single `SKILL.md` file (no sibling `.md` files, unlike `implement/`)? The `/change-architect` and `/just-do-it` runs both concluded no change was needed; confirm this still holds.
- [ ] What is the established pattern (if any) elsewhere in ORBIT for a subagent that must first discover a whole set of targets before dispatching per-target analysis — is there a closer precedent than `/dox-update`'s single-phase walk, e.g. anything in `/fact-finder`'s multi-agent dispatch that already separates a locate phase from an analyze phase?

## Conversation Summary

- **Initial idea**: Raised as a brainstorming question — does ORBIT's traceability chain (mission → ... → code) close the loop by checking the finished code against the original intent, or is verification purely pairwise between adjacent stages? Investigated via a dedicated research agent, which confirmed the chain is strictly pairwise: no `SKILL.md` ever re-opens a mission or spec to check finished code against it, and the two "traceability" mechanisms that exist (`specifier`'s Traceability Matrix, `epic-planner`'s Traceability table) are one-time author self-checks, never re-verified downstream.
- **Refinements**: The missing piece was named as *validation* (does the result still serve the mission) versus *verification* (was the immediate contract honored) — a judgment call, not a mechanical check, which argued against embedding it as a gate inside `/implement`. The mechanism was settled as a separately, manually invoked skill in the shape of `/prototype` or `/dox-update` rather than a blocking step. Scope was then set to whole-project automatic discovery rather than a single-target tool like `/fact-finder`, specifically because the routes that never touch a mission (`/feature-architect`, `/change-architect` → `/just-do-it`) are where real drift is expected to accumulate, and a tool that only checks what it's handed would never find them unprompted. The user explicitly required orphan-branch handling as a core capability, not an edge case. Two forced-choice decisions closed remaining scope ambiguity: the report stays purely diagnostic (no proposed Change/Feature Briefs), and orphan branches get checked against their own recorded intent (Feature Vision / Change Brief target state) as a weaker local baseline, alongside an explicit "no root mission" note — rather than being reported as unmeasurable and left at that.
- **Key boundary decisions**: Not a gate — the whole design deliberately trades "always enforced" for "cheap enough that a human actually runs it," the same trade `/just-do-it` made in the opposite direction for execution cost. Every run is its own artifact rather than write-once, because a drift check is inherently a repeated snapshot and forcing it into the write-once convention would mean either losing history on every re-run or awkwardly "superseding" reports that didn't actually become wrong, just older. Coverage and Fidelity were kept as two distinct passes rather than merged, because they fail in independently informative ways (dropped work vs. drifted meaning).
