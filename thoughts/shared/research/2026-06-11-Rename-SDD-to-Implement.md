---
date: 2026-06-11
researcher: researcher-skill
topic: "Rename skill /subagent-driven-development to /implement"
status: complete
coverage:
  - .claude/skills/subagent-driven-development/ (all 4 files)
  - CLAUDE.md
  - AGENTS.md (root)
  - .claude/AGENTS.md
  - .claude/agents/AGENTS.md
  - .claude/skills/AGENTS.md
  - .claude/skills/planner/SKILL.md
  - thoughts/shared/AGENTS.md
  - thoughts/shared/plans/AGENTS.md
  - thoughts/shared/research/ (grep scan)
  - thoughts/shared/plans/ (grep scan)
  - docs/superpowers/ (grep scan)
---

# Research: Rename skill /subagent-driven-development to /implement

## Executive Summary

- The skill is invoked by the `name:` field in its `SKILL.md` frontmatter; renaming the directory alone is not sufficient — the `name:` field must also change.
- The skill directory `.claude/skills/subagent-driven-development/` contains 4 files; the directory must be renamed to `.claude/skills/implement/`.
- 9 active governance/config files reference the old name and must be updated.
- 5 historical artifact files in `docs/superpowers/` and `thoughts/shared/research|plans/` reference the old name; these are frozen records and do not drive runtime behavior.
- The current SKILL.md description contains the phrase "Replaces /implement." — after the rename this phrase becomes inaccurate and must be removed or rewritten.

## Coverage Map

Files personally read:
- `.claude/skills/subagent-driven-development/SKILL.md` (lines 1–10)
- `CLAUDE.md` (lines 1–60, plus lines 130–170 from locator metadata)
- `AGENTS.md` (root, lines 55–72)
- `.claude/AGENTS.md` (full)
- `.claude/agents/AGENTS.md` (lines 1–10)
- `.claude/skills/AGENTS.md` (full)
- `.claude/skills/planner/SKILL.md` (lines 1–5, 408–413)
- `thoughts/shared/AGENTS.md` (full)
- `thoughts/shared/plans/AGENTS.md` (full)

Grep scan results validated by thoughts-locator subagent (102 files scanned in `thoughts/`).

## Critical Findings (Verified, Planner Attention Required)

### 1. Skill invocation name is defined in SKILL.md frontmatter

- **Observation:** Claude Code matches the slash-command name to the `name:` field in `SKILL.md`, not to the directory name.
- **Direct consequence:** Renaming only the directory would leave the skill still registered as `/subagent-driven-development`. Both the directory rename and the `name:` field update are required.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:2`
- **Excerpt:**
  ```
  name: subagent-driven-development
  ```

### 2. SKILL.md description contains the phrase "Replaces /implement."

- **Observation:** The current description field reads: "Execute an implementation plan task-by-task via fresh subagents with spec-compliance and code-quality review after each task. Replaces /implement. Use after /planner has produced a plan in thoughts/shared/plans/."
- **Direct consequence:** After the rename, "Replaces /implement." is no longer accurate — the skill IS `/implement`. This phrase must be removed or rewritten.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:3`
- **Excerpt:**
  ```
  description: Execute an implementation plan task-by-task via fresh subagents with spec-compliance and code-quality review after each task. Replaces /implement. Use after /planner has produced a plan in thoughts/shared/plans/.
  ```

### 3. The skill directory contains 4 files — all must move with the rename

- **Observation:** `.claude/skills/subagent-driven-development/` contains exactly 4 files.
- **Direct consequence:** All 4 must reside under `.claude/skills/implement/` after the rename; none need content changes solely because of the move.
- **Evidence:** codebase-locator enumeration, verified by grep.
- Files:
  - `SKILL.md` (entry point — requires content edits per findings 1 and 2)
  - `implementer-prompt.md` (secondary — content unchanged)
  - `spec-reviewer-prompt.md` (secondary — content unchanged)
  - `code-quality-reviewer-prompt.md` (secondary — content unchanged)

## Detailed Technical Analysis (Verified)

### Active Governance Files — Must Update

These files drive runtime behavior (Claude reads them during sessions) and contain the old skill name.

#### CLAUDE.md — 7 occurrences

Three pipeline diagrams (lines 13, 18, 23), the workflow stages table (line 36), the workflow skills table (line 50), and two mentions in the DOX Protocol section (lines 135, 167 per locator).

- **Evidence:** `CLAUDE.md:13`
- **Excerpt:**
  ```
  /mission-architect → /specifier → /epic-planner → /researcher → /planner → /subagent-driven-development
  ```
- **Evidence:** `CLAUDE.md:36`
- **Excerpt:**
  ```
  | Execution | `/subagent-driven-development` | Git commits per task |
  ```
- **Evidence:** `CLAUDE.md:50`
- **Excerpt:**
  ```
  | `/subagent-driven-development` | Execute a plan task-by-task via subagents, with spec + quality review per task |
  ```

#### AGENTS.md (root) — 4 occurrences (lines 62–66)

- **Evidence:** `AGENTS.md:62-66`
- **Excerpt:**
  ```
  - Greenfield: `/mission-architect` → `/specifier` → `/epic-planner` → `/researcher` → `/planner` → `/subagent-driven-development`
  - Brownfield: `/feature-architect` → `/epic-planner` → `/researcher` → `/planner` → `/subagent-driven-development`
  - Small fix: `/researcher` → `/planner` → `/subagent-driven-development`
  **Key rule:** `/researcher` must precede `/planner`; `/planner` must precede `/subagent-driven-development`.
  ```

#### .claude/AGENTS.md — 1 occurrence (line 21)

- **Evidence:** `.claude/AGENTS.md:21`
- **Excerpt:**
  ```
  - Do not modify skill or agent files while `/subagent-driven-development` is mid-execution on a plan
  ```

#### .claude/agents/AGENTS.md — 1 occurrence (line 9)

- **Evidence:** `.claude/agents/AGENTS.md:9`
- **Excerpt:**
  ```
  `subagent-driven-development` uses the implementer and reviewer prompts (which live in `skills/subagent-driven-development/`, not here).
  ```
  Two paths embedded in this sentence: the skill name reference and the directory path `skills/subagent-driven-development/` — both must update.

#### .claude/skills/AGENTS.md — 2 occurrences (lines 22, 39)

- **Evidence:** `.claude/skills/AGENTS.md:22`
- **Excerpt:**
  ```
  - `subagent-driven-development/` — Execute plan task-by-task via subagents; also contains `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`
  ```
- **Evidence:** `.claude/skills/AGENTS.md:39`
- **Excerpt:**
  ```
  - Workflow ordering is enforced: researcher must precede planner; planner must precede SDD
  ```
  Line 39 uses the abbreviation "SDD" — not the full old name. "SDD" will become stale/ambiguous after rename; Planner should decide whether to leave it or update to "implement".

#### thoughts/shared/AGENTS.md — 3 occurrences (lines 10, 26, 33)

- **Evidence:** `thoughts/shared/AGENTS.md:10`
- **Excerpt:**
  ```
  - Implementer subagents (via `/subagent-driven-development`) update STATE files in `plans/`
  ```
- **Evidence:** `thoughts/shared/AGENTS.md:26`
- **Excerpt:**
  ```
  | `plans/` | `/planner` | `/subagent-driven-development` |
  ```
- **Evidence:** `thoughts/shared/AGENTS.md:33`
- **Excerpt:**
  ```
  - Never edit research or plan files manually while `/subagent-driven-development` is executing
  ```

#### thoughts/shared/plans/AGENTS.md — 3 occurrences (lines 5, 10, 56)

- **Evidence:** `thoughts/shared/plans/AGENTS.md:5`
- **Excerpt:**
  ```
  Stores sequenced implementation plans produced by `/planner` and STATE files maintained by `/subagent-driven-development` during execution.
  ```
- **Evidence:** `thoughts/shared/plans/AGENTS.md:10`
- **Excerpt:**
  ```
  - `/subagent-driven-development` creates and updates `*-STATE.md` files during execution
  ```
- **Evidence:** `thoughts/shared/plans/AGENTS.md:56`
- **Excerpt:**
  ```
  - To resume an interrupted plan: tell `/subagent-driven-development` the plan path; it reads the STATE file to find the next task
  ```

#### .claude/skills/planner/SKILL.md — 2 occurrences (lines 3, 412)

- **Evidence:** `.claude/skills/planner/SKILL.md:3`
- **Excerpt:**
  ```
  description: Write a sequenced, evidence-based implementation plan from a research report. Spawns codebase agents to verify evidence. Outputs plan + state files to thoughts/shared/plans/. Use after /researcher and before /subagent-driven-development.
  ```
- **Evidence:** `.claude/skills/planner/SKILL.md:412`
- **Excerpt:**
  ```
  **Target Audience**: Claude running the /subagent-driven-development skill.
  ```

### Historical Artifact Files — Do NOT Update

These files are frozen records (research reports, specs, archived plans). Updating them would corrupt historical accuracy. They do not drive runtime behavior.

| File | Occurrences | Classification |
|---|---|---|
| `thoughts/shared/research/2026-06-09-DOX-Framework-Integration.md` | 3 | Historical research report — frozen |
| `thoughts/shared/research/2026-06-10-DOX-Skills.md` | 4 | Historical research report — frozen |
| `thoughts/shared/plans/2026-06-10-DOX-Skills.md` | 1 | Historical plan artifact — frozen |
| `docs/superpowers/plans/2026-06-09-workflow-restructure.md` | ~38 | Archived plan — frozen |
| `docs/superpowers/specs/2026-06-09-workflow-restructure-design.md` | 6 | Archived spec — frozen |

## Verification Log

- `Verified:` `.claude/skills/subagent-driven-development/SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `.claude/AGENTS.md`, `.claude/agents/AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/skills/planner/SKILL.md`, `thoughts/shared/AGENTS.md`, `thoughts/shared/plans/AGENTS.md`
- `Spot-checked excerpts captured:` yes

## Open Questions / Unverified Claims

- **CLAUDE.md lines 135 and 167**: Locator reported these but they were not read directly. They appear in the DOX Protocol section beyond the 60-line read window. The Planner should read these lines before editing to confirm exact surrounding context.
- **"SDD" abbreviation in `.claude/skills/AGENTS.md:39`**: The locator's grep only matched the full string `subagent-driven-development`; this "SDD" occurrence was found via manual read. The Planner must decide whether to update "SDD" to "implement" or leave it as a legacy abbreviation.

## References

**Codebase Citations**:
- `.claude/skills/subagent-driven-development/SKILL.md:2-3`
- `CLAUDE.md:13`, `CLAUDE.md:18`, `CLAUDE.md:23`, `CLAUDE.md:36`, `CLAUDE.md:50`
- `AGENTS.md:62-66`
- `.claude/AGENTS.md:21`
- `.claude/agents/AGENTS.md:9`
- `.claude/skills/AGENTS.md:22`, `.claude/skills/AGENTS.md:39`
- `.claude/skills/planner/SKILL.md:3`, `.claude/skills/planner/SKILL.md:412`
- `thoughts/shared/AGENTS.md:10`, `thoughts/shared/AGENTS.md:26`, `thoughts/shared/AGENTS.md:33`
- `thoughts/shared/plans/AGENTS.md:5`, `thoughts/shared/plans/AGENTS.md:10`, `thoughts/shared/plans/AGENTS.md:56`
