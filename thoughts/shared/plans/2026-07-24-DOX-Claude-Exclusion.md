# DOX Claude-Directory-Exclusion Implementation Plan

## Inputs
- Fact report used: `thoughts/shared/facts/2026-07-24-DOX-Claude-Directory-Exclusion.md`
- User request summary: Add `.claude` to the directory-exclusion list used by `dox-init` and `dox-update`, unconditionally, in every project — including this repo (rpiqr/ORBIT), where `.claude` is the framework's own source tree. The user explicitly considered and rejected a self-referential exception (no marker file, no config flag, no per-run prompt). The three existing `AGENTS.md` files under `.claude/` in this repo, and the root `AGENTS.md` Child DOX Index entry referencing `.claude/AGENTS.md`, must be left untouched.

## Verified Current State

- **Fact:** `dox-init/SKILL.md` Phase 1 enumerates directories via a `find` command with a nine-entry exclusion list that does not include `.claude`.
- **Evidence:** `.claude/skills/dox-init/SKILL.md:172-182`
- **Excerpt:**
  ```
  find . -type d \
    -not -path './.git*' \
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

- **Fact:** `dox-update/SKILL.md` Phase 1 enumerates existing `AGENTS.md` files via an identical nine-entry exclusion list that does not include `.claude`.
- **Evidence:** `.claude/skills/dox-update/SKILL.md:52-62`
- **Excerpt:**
  ```
  find . -name "AGENTS.md" \
    -not -path './.git*' \
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

- **Fact:** `dist/orbit/skills/dox-init/SKILL.md` and `dist/orbit/skills/dox-update/SKILL.md` are byte-identical mirrors of the two files above at the same line numbers.
- **Evidence:** `dist/orbit/skills/dox-init/SKILL.md:172-182`, `dist/orbit/skills/dox-update/SKILL.md:52-62` (both directly Read and confirmed identical to their `.claude/` counterparts in this planning session)

- **Fact:** No secondary directory-filtering logic exists elsewhere in either skill — the per-directory/per-file loops (`dox-init` Phase 4, `dox-update` Phase 2) operate only on the list Phase 1 already produced.
- **Evidence:** `.claude/skills/dox-init/SKILL.md:203-213`, `.claude/skills/dox-update/SKILL.md:67-82`

- **Fact:** Three `AGENTS.md` files already exist under `.claude/` in this repo (`.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/agents/AGENTS.md`), and the root `AGENTS.md` Child DOX Index references `.claude/AGENTS.md` directly.
- **Evidence:** `AGENTS.md:70`, `.claude/AGENTS.md:1-34`, `.claude/skills/AGENTS.md:1-46`, `.claude/agents/AGENTS.md:1-44`
- **Excerpt (`AGENTS.md:70`):** `- [.claude/](.claude/AGENTS.md) — Framework infrastructure: skills, agents, hooks, MCP servers`

## Goals / Non-Goals

**Goals:**
- Add `.claude` to the Phase 1 exclusion list in both `.claude/skills/dox-init/SKILL.md` and `.claude/skills/dox-update/SKILL.md`, unconditionally — no project-detection logic, no exception path.
- Apply the identical edit to the `dist/orbit/` mirror copies so both live locations stay in sync.

**Non-Goals:**
- Do not modify, remove, or regenerate `.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, or `.claude/agents/AGENTS.md` — these stay exactly as they are, manually maintained from now on, outside DOX tooling's reach.
- Do not modify the root `AGENTS.md` Child DOX Index entry at line 70 referencing `.claude/AGENTS.md`.
- Do not add a marker file, config flag, or interactive prompt to except this repo (or any repo) from the exclusion. The policy is unconditional in the skill instructions themselves.
- Do not investigate or change whatever process (if any) produces `dist/orbit/` from `.claude/` — this plan edits both copies directly by hand, per the fact report's open question that no sync mechanism was located.

## Design Overview

- Both skills read their exclusion list from a single `find` command in Phase 1. Adding one `-not -path '*/.claude*'` clause to each command (in all four files) is sufficient — no other code path needs touching, per Verified Current State above.
- Placement: insert the new clause in the same position/style as the existing eight `-not -path` lines, immediately after `-not -path './.git*'` (grouping the two dot-directory exclusions together) and before `-not -path '*/node_modules*'`.
- No changes to any other section of any of the four files (Phase 0, Phase 2, Phase 3, Phase 4, Phase 5 in `dox-init`; Phase 2, Phase 3 in `dox-update`; the Staleness Criteria, Child AGENTS.md Schema, or Bundled Assets sections).

## Implementation Instructions (For Implementor)

### PLAN-001: Add `.claude` exclusion to `dox-init/SKILL.md` Phase 1
- **Change Type:** modify
- **File(s):** `.claude/skills/dox-init/SKILL.md`
- **Instruction:** In the Phase 1 `find` command (lines 172-182), add a new line `-not -path '*/.claude*' \` immediately after the `-not -path './.git*' \` line and before the `-not -path '*/node_modules*' \` line. Preserve the existing indentation (2 spaces) and trailing backslash style used by every other line in the chain.
- **Interfaces / Pseudocode:**
  ```
  find . -type d \
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
- **Evidence:** `.claude/skills/dox-init/SKILL.md:172-182`
- **Done When:** The Phase 1 `find` command block in `.claude/skills/dox-init/SKILL.md` contains exactly ten `-not -path` clauses, with `-not -path '*/.claude*'` present, and no other line in the file is changed.

### PLAN-002: Add `.claude` exclusion to `dox-update/SKILL.md` Phase 1
- **Change Type:** modify
- **File(s):** `.claude/skills/dox-update/SKILL.md`
- **Instruction:** In the Phase 1 `find` command (lines 52-62), add a new line `-not -path '*/.claude*' \` immediately after the `-not -path './.git*' \` line and before the `-not -path '*/node_modules*' \` line, matching the same style as PLAN-001.
- **Interfaces / Pseudocode:**
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
- **Evidence:** `.claude/skills/dox-update/SKILL.md:52-62`
- **Done When:** The Phase 1 `find` command block in `.claude/skills/dox-update/SKILL.md` contains exactly ten `-not -path` clauses, with `-not -path '*/.claude*'` present, and no other line in the file is changed.

### PLAN-003: Apply the identical edit to the `dist/orbit/` mirror of `dox-init`
- **Change Type:** modify
- **File(s):** `dist/orbit/skills/dox-init/SKILL.md`
- **Instruction:** This file is byte-identical to `.claude/skills/dox-init/SKILL.md` (verified via `diff`, exit code 0). Apply the exact same edit as PLAN-001 at the same line numbers (172-182).
- **Evidence:** `dist/orbit/skills/dox-init/SKILL.md:172-182` (confirmed identical to `.claude/skills/dox-init/SKILL.md:172-182` in this planning session)
- **Done When:** `diff .claude/skills/dox-init/SKILL.md dist/orbit/skills/dox-init/SKILL.md` produces no output (files remain byte-identical after both edits).

### PLAN-004: Apply the identical edit to the `dist/orbit/` mirror of `dox-update`
- **Change Type:** modify
- **File(s):** `dist/orbit/skills/dox-update/SKILL.md`
- **Instruction:** This file is byte-identical to `.claude/skills/dox-update/SKILL.md` (verified via `diff`, exit code 0). Apply the exact same edit as PLAN-002 at the same line numbers (52-62).
- **Evidence:** `dist/orbit/skills/dox-update/SKILL.md:52-62` (confirmed identical to `.claude/skills/dox-update/SKILL.md:52-62` in this planning session)
- **Done When:** `diff .claude/skills/dox-update/SKILL.md dist/orbit/skills/dox-update/SKILL.md` produces no output (files remain byte-identical after both edits).

## Verification Tasks (If Assumptions Exist)

None — every task above is grounded in files read directly during fact-finding and planning; no assumption-based verification tasks are needed.

## Acceptance Criteria

- `.claude/skills/dox-init/SKILL.md` Phase 1 `find` command excludes `.claude` alongside the existing nine entries.
- `.claude/skills/dox-update/SKILL.md` Phase 1 `find` command excludes `.claude` alongside the existing nine entries.
- `dist/orbit/skills/dox-init/SKILL.md` and `dist/orbit/skills/dox-update/SKILL.md` remain byte-identical to their `.claude/skills/` counterparts after the edit (verified via `diff`).
- `.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/agents/AGENTS.md`, and `AGENTS.md:70` are unchanged (verify via `git diff` showing no hunks in these four files).
- No other line in any of the four edited files changed besides the one new `-not -path '*/.claude*' \` line per file (verify via `git diff` showing exactly one added line per file).

## Implementor Checklist
- [ ] PLAN-001: Add `.claude` exclusion to `dox-init/SKILL.md` Phase 1
- [ ] PLAN-002: Add `.claude` exclusion to `dox-update/SKILL.md` Phase 1
- [ ] PLAN-003: Apply the identical edit to the `dist/orbit/` mirror of `dox-init`
- [ ] PLAN-004: Apply the identical edit to the `dist/orbit/` mirror of `dox-update`
