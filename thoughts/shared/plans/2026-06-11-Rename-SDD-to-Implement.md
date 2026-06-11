# Rename skill /subagent-driven-development to /implement

## Inputs
- Research report: `thoughts/shared/research/2026-06-11-Rename-SDD-to-Implement.md`
- User request: Rename the skill `/subagent-driven-development` to `/implement`

## Verified Current State

- **Fact:** The skill directory is `.claude/skills/subagent-driven-development/` and contains exactly 4 files.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:1-4`
- **Excerpt:**
  ```
  ---
  name: subagent-driven-development
  description: Execute an implementation plan task-by-task via fresh subagents...
  ---
  ```

- **Fact:** Claude Code resolves slash commands from the `name:` field in `SKILL.md`, not the directory name. Both must change.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:2`
- **Excerpt:**
  ```
  name: subagent-driven-development
  ```

- **Fact:** The description field contains "Replaces /implement." which becomes inaccurate after the rename.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:3`
- **Excerpt:**
  ```
  description: Execute an implementation plan task-by-task via fresh subagents with spec-compliance and code-quality review after each task. Replaces /implement. Use after /planner has produced a plan in thoughts/shared/plans/.
  ```

- **Fact:** `CLAUDE.md` contains 7 references across pipeline diagrams (lines 13, 18, 23), a workflow stages table (line 36), a workflow skills table (line 50), and the `agents/ vs skills/` section (lines 135×2, 167).
- **Evidence:** `CLAUDE.md:13`, `CLAUDE.md:135`, `CLAUDE.md:167`
- **Excerpts:**
  ```
  /mission-architect → ... → /planner → /subagent-driven-development    (line 13)
  Workflow orchestrators (`/mission-architect` through `/subagent-driven-development`) ...
  The `/subagent-driven-development` skill directory also contains three prompt template files  (line 135)
  `/subagent-driven-development` reads the plan and dispatches one implementer subagent per PLAN-XXX task.  (line 167)
  ```

- **Fact:** Root `AGENTS.md` contains 4 references in the workflow pipeline description (lines 62–66).
- **Evidence:** `AGENTS.md:62-66`
- **Excerpt:**
  ```
  - Greenfield: ... → /planner → `/subagent-driven-development`
  - Brownfield: ... → /planner → `/subagent-driven-development`
  - Small fix: ... → `/subagent-driven-development`
  **Key rule:** ... planner must precede `/subagent-driven-development`
  ```

- **Fact:** `.claude/AGENTS.md:21` contains 1 reference in work guidance.
- **Evidence:** `.claude/AGENTS.md:21`
- **Excerpt:**
  ```
  - Do not modify skill or agent files while `/subagent-driven-development` is mid-execution on a plan
  ```

- **Fact:** `.claude/agents/AGENTS.md:9` contains 1 reference to the skill name AND the old directory path.
- **Evidence:** `.claude/agents/AGENTS.md:9`
- **Excerpt:**
  ```
  `subagent-driven-development` uses the implementer and reviewer prompts (which live in `skills/subagent-driven-development/`, not here).
  ```

- **Fact:** `.claude/skills/AGENTS.md` has 2 occurrences: the directory listing (line 22) and an abbreviation "SDD" (line 39).
- **Evidence:** `.claude/skills/AGENTS.md:22`, `.claude/skills/AGENTS.md:39`
- **Excerpts:**
  ```
  - `subagent-driven-development/` — Execute plan task-by-task via subagents...    (line 22)
  - Workflow ordering is enforced: researcher must precede planner; planner must precede SDD    (line 39)
  ```

- **Fact:** `.claude/skills/planner/SKILL.md` has 2 references: the `description:` field (line 3) and a target audience line (line 412).
- **Evidence:** `.claude/skills/planner/SKILL.md:3`, `.claude/skills/planner/SKILL.md:412`
- **Excerpts:**
  ```
  description: ...Use after /researcher and before /subagent-driven-development.    (line 3)
  **Target Audience**: Claude running the /subagent-driven-development skill.    (line 412)
  ```

- **Fact:** `thoughts/shared/AGENTS.md` has 3 references (lines 10, 26, 33).
- **Evidence:** `thoughts/shared/AGENTS.md:10`, `thoughts/shared/AGENTS.md:26`, `thoughts/shared/AGENTS.md:33`
- **Excerpts:**
  ```
  - Implementer subagents (via `/subagent-driven-development`) update STATE files in `plans/`    (line 10)
  | `plans/` | `/planner` | `/subagent-driven-development` |    (line 26)
  - Never edit research or plan files manually while `/subagent-driven-development` is executing    (line 33)
  ```

- **Fact:** `thoughts/shared/plans/AGENTS.md` has 3 references (lines 5, 10, 56).
- **Evidence:** `thoughts/shared/plans/AGENTS.md:5`, `thoughts/shared/plans/AGENTS.md:10`, `thoughts/shared/plans/AGENTS.md:56`
- **Excerpts:**
  ```
  ...STATE files maintained by `/subagent-driven-development` during execution.    (line 5)
  - `/subagent-driven-development` creates and updates `*-STATE.md` files during execution    (line 10)
  - To resume an interrupted plan: tell `/subagent-driven-development` the plan path...    (line 56)
  ```

## Goals / Non-Goals

- **Goals:**
  - Rename the skill so it is invoked as `/implement`
  - Update all active governance and config files that reference the old name
  - Preserve the 3 secondary prompt template files (content unchanged, path changes only)
- **Non-Goals:**
  - Modifying historical artifact files (`thoughts/shared/research/`, `docs/superpowers/`) — these are frozen records
  - Changing the skill's behavior, logic, or prompt content

## Design Overview

- One filesystem rename (`git mv`) moves the directory and all 4 contained files atomically, preserving git history.
- SKILL.md content needs two targeted edits: `name:` field and removal of the now-inaccurate "Replaces /implement." phrase from the description.
- All other changes are pure string replacements: `/subagent-driven-development` → `/implement` and `subagent-driven-development/` → `implement/` where the directory path appears.
- Tasks PLAN-002 through PLAN-009 are independent of each other and can proceed in any order after PLAN-001.

## Implementation Instructions

### PLAN-001: Rename skill directory and update SKILL.md frontmatter
- **Change Type:** modify (filesystem rename + content edit)
- **File(s):**
  - `.claude/skills/subagent-driven-development/` (directory rename → `.claude/skills/implement/`)
  - `.claude/skills/implement/SKILL.md` (content edit after rename)
- **Instruction:**
  1. Run: `git mv .claude/skills/subagent-driven-development .claude/skills/implement`
  2. In `.claude/skills/implement/SKILL.md` line 2, change `name: subagent-driven-development` to `name: implement`
  3. In `.claude/skills/implement/SKILL.md` line 3, remove the phrase "Replaces /implement. " from the description so it reads: `description: Execute an implementation plan task-by-task via fresh subagents with spec-compliance and code-quality review after each task. Use after /planner has produced a plan in thoughts/shared/plans/.`
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:2-3`
- **Done When:** Directory `.claude/skills/subagent-driven-development/` no longer exists; `.claude/skills/implement/SKILL.md` has `name: implement` and description does not contain "Replaces /implement."

---

### PLAN-002: Update CLAUDE.md (7 occurrences)
- **Change Type:** modify
- **File(s):** `CLAUDE.md`
- **Instruction:** Replace all 7 occurrences of `/subagent-driven-development` with `/implement`. The occurrences are at:
  - Line 13: pipeline diagram (Greenfield)
  - Line 18: pipeline diagram (Brownfield)
  - Line 23: pipeline diagram (Small fix)
  - Line 36: workflow stages table (`Execution` row)
  - Line 50: workflow skills table (skill name column)
  - Line 135 (first occurrence): `Workflow orchestrators (\`/mission-architect\` through \`/subagent-driven-development\`)` → `through \`/implement\`)`
  - Line 135 (second occurrence): `The \`/subagent-driven-development\` skill directory` → `The \`/implement\` skill directory`
  - Line 167: `` `/subagent-driven-development` reads the plan `` → `` `/implement` reads the plan ``
- **Evidence:** `CLAUDE.md:13`, `CLAUDE.md:135`, `CLAUDE.md:167`
- **Done When:** `grep -n subagent-driven-development CLAUDE.md` returns no results.

---

### PLAN-003: Update root AGENTS.md (4 occurrences)
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:** Replace all 4 occurrences of `/subagent-driven-development` with `/implement` at lines 62, 63, 64, and 66. The final sentence at line 66 should read: `**Key rule:** \`/researcher\` must precede \`/planner\`; \`/planner\` must precede \`/implement\`.`
- **Evidence:** `AGENTS.md:62-66`
- **Done When:** `grep -n subagent-driven-development AGENTS.md` returns no results.

---

### PLAN-004: Update .claude/AGENTS.md (1 occurrence)
- **Change Type:** modify
- **File(s):** `.claude/AGENTS.md`
- **Instruction:** At line 21, replace `/subagent-driven-development` with `/implement`. The line should read: `- Do not modify skill or agent files while \`/implement\` is mid-execution on a plan`
- **Evidence:** `.claude/AGENTS.md:21`
- **Done When:** `grep -n subagent-driven-development .claude/AGENTS.md` returns no results.

---

### PLAN-005: Update .claude/agents/AGENTS.md (1 occurrence + directory path)
- **Change Type:** modify
- **File(s):** `.claude/agents/AGENTS.md`
- **Instruction:** At line 9, replace both the skill name and the directory path. The line should read: `` `implement` uses the implementer and reviewer prompts (which live in `skills/implement/`, not here). ``
- **Evidence:** `.claude/agents/AGENTS.md:9`
- **Done When:** `grep -n subagent-driven-development .claude/agents/AGENTS.md` returns no results.

---

### PLAN-006: Update .claude/skills/AGENTS.md (2 occurrences + SDD abbreviation)
- **Change Type:** modify
- **File(s):** `.claude/skills/AGENTS.md`
- **Instruction:**
  1. At line 22, replace `subagent-driven-development/` with `implement/`. The line should read: `- \`implement/\` — Execute plan task-by-task via subagents; also contains \`implementer-prompt.md\`, \`spec-reviewer-prompt.md\`, \`code-quality-reviewer-prompt.md\``
  2. At line 39, replace `SDD` with `/implement`. The line should read: `- Workflow ordering is enforced: researcher must precede planner; planner must precede /implement`
- **Evidence:** `.claude/skills/AGENTS.md:22`, `.claude/skills/AGENTS.md:39`
- **Done When:** `grep -n "subagent-driven-development\|SDD" .claude/skills/AGENTS.md` returns no results.

---

### PLAN-007: Update .claude/skills/planner/SKILL.md (2 occurrences)
- **Change Type:** modify
- **File(s):** `.claude/skills/planner/SKILL.md`
- **Instruction:**
  1. At line 3, replace `/subagent-driven-development` with `/implement` in the `description:` field. The end of the description should read: `...Use after /researcher and before /implement.`
  2. At line 412, replace `/subagent-driven-development` with `/implement`. The line should read: `**Target Audience**: Claude running the /implement skill.`
- **Evidence:** `.claude/skills/planner/SKILL.md:3`, `.claude/skills/planner/SKILL.md:412`
- **Done When:** `grep -n subagent-driven-development .claude/skills/planner/SKILL.md` returns no results.

---

### PLAN-008: Update thoughts/shared/AGENTS.md (3 occurrences)
- **Change Type:** modify
- **File(s):** `thoughts/shared/AGENTS.md`
- **Instruction:** Replace all 3 occurrences of `/subagent-driven-development` with `/implement` at lines 10, 26, and 33:
  - Line 10: `Implementer subagents (via \`/implement\`) update STATE files in \`plans/\``
  - Line 26: `| \`plans/\` | \`/planner\` | \`/implement\` |`
  - Line 33: `Never edit research or plan files manually while \`/implement\` is executing`
- **Evidence:** `thoughts/shared/AGENTS.md:10`, `thoughts/shared/AGENTS.md:26`, `thoughts/shared/AGENTS.md:33`
- **Done When:** `grep -n subagent-driven-development thoughts/shared/AGENTS.md` returns no results.

---

### PLAN-009: Update thoughts/shared/plans/AGENTS.md (3 occurrences)
- **Change Type:** modify
- **File(s):** `thoughts/shared/plans/AGENTS.md`
- **Instruction:** Replace all 3 occurrences of `/subagent-driven-development` with `/implement` at lines 5, 10, and 56:
  - Line 5: `...STATE files maintained by \`/implement\` during execution.`
  - Line 10: `- \`/implement\` creates and updates \`*-STATE.md\` files during execution`
  - Line 56: `- To resume an interrupted plan: tell \`/implement\` the plan path; it reads the STATE file to find the next task`
- **Evidence:** `thoughts/shared/plans/AGENTS.md:5`, `thoughts/shared/plans/AGENTS.md:10`, `thoughts/shared/plans/AGENTS.md:56`
- **Done When:** `grep -n subagent-driven-development thoughts/shared/plans/AGENTS.md` returns no results.

---

## Acceptance Criteria

- `ls .claude/skills/` shows `implement/` and does NOT show `subagent-driven-development/`
- `/implement` can be invoked as a skill (the `name:` field in `.claude/skills/implement/SKILL.md` is `implement`)
- `grep -r subagent-driven-development .claude/ CLAUDE.md AGENTS.md thoughts/shared/AGENTS.md thoughts/shared/plans/AGENTS.md` returns no results
- The 3 secondary prompt template files (`implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`) are present and unmodified under `.claude/skills/implement/`
- Historical artifact files (`thoughts/shared/research/`, `docs/superpowers/`) are untouched

## Implementor Checklist

- [ ] PLAN-001: Rename skill directory and update SKILL.md frontmatter
- [ ] PLAN-002: Update CLAUDE.md (7 occurrences)
- [ ] PLAN-003: Update root AGENTS.md (4 occurrences)
- [ ] PLAN-004: Update .claude/AGENTS.md (1 occurrence)
- [ ] PLAN-005: Update .claude/agents/AGENTS.md (1 occurrence + directory path)
- [ ] PLAN-006: Update .claude/skills/AGENTS.md (2 occurrences + SDD abbreviation)
- [ ] PLAN-007: Update .claude/skills/planner/SKILL.md (2 occurrences)
- [ ] PLAN-008: Update thoughts/shared/AGENTS.md (3 occurrences)
- [ ] PLAN-009: Update thoughts/shared/plans/AGENTS.md (3 occurrences)
