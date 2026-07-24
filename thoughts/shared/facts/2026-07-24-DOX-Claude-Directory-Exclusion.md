---
date: 2026-07-24
fact-finder: fact-finder-skill
topic: "DOX skills: .claude directory exclusion"
status: complete
coverage:
  - .claude/skills/dox-init/SKILL.md (full file, 219 lines)
  - .claude/skills/dox-update/SKILL.md (full file, 90 lines)
  - dist/orbit/skills/dox-init/SKILL.md and dist/orbit/skills/dox-update/SKILL.md (diffed against .claude/ originals)
  - AGENTS.md (root, full file)
  - .claude/AGENTS.md, .claude/skills/AGENTS.md, .claude/agents/AGENTS.md (full files)
  - thoughts/shared/features/2026-06-10-DOX-Skills.md, thoughts/shared/facts/2026-06-10-DOX-Skills.md, thoughts/shared/plans/2026-06-10-DOX-Skills.md (exclusion-list history)
  - codebase-locator sweep across all 8 AGENTS.md files in the repo and all skill SKILL.md files for "dox"/".claude" mentions
---

# Research: DOX Skills — `.claude` Directory Exclusion

## Executive Summary

- The directory-exclusion list used by both DOX skills is defined identically in two places: `dox-init/SKILL.md:172-182` and `dox-update/SKILL.md:52-62`. It currently contains nine entries and does not include `.claude`.
- Byte-identical mirror copies of both SKILL.md files exist under `dist/orbit/skills/`; any edit to the exclusion list made only in `.claude/skills/` would leave the `dist/orbit/` copies stale.
- `.claude/` currently has three existing AGENTS.md files in this repo: `.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/agents/AGENTS.md`. The root `AGENTS.md` Child DOX Index references `.claude/AGENTS.md` directly.
- The original design record for the exclusion list (`thoughts/shared/facts/2026-06-10-DOX-Skills.md:21`) states the skills must work on any project in any language with "no assumptions about `thoughts/`, `.claude/`, or any rpiqr-specific directory structure."
- Neither SKILL.md file contains any other place where directories are filtered besides the two `find` commands identified — no secondary exclusion check exists in the per-directory loops.

## Coverage Map

- `.claude/skills/dox-init/SKILL.md` — read in full (219 lines)
- `.claude/skills/dox-update/SKILL.md` — read in full (90 lines)
- `dist/orbit/skills/dox-init/SKILL.md` and `dist/orbit/skills/dox-update/SKILL.md` — diffed against their `.claude/` counterparts (both diffs empty, exit code 0)
- `AGENTS.md` (repo root) — read in full
- `.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/agents/AGENTS.md` — read in full
- `thoughts/shared/features/2026-06-10-DOX-Skills.md`, `thoughts/shared/facts/2026-06-10-DOX-Skills.md` (excerpt), `thoughts/shared/plans/2026-06-10-DOX-Skills.md` (existence/line count only, not read in full)
- Delegated sweep (codebase-locator, correlation `research-dox-claude-exclusion-2026-07-24`) across every AGENTS.md in the repo and every skill SKILL.md for `.claude`/exclusion-list mentions

## Critical Findings (Verified, Planner Attention Required)

### 1. Two independent, textually-identical exclusion lists must both change

- **Observation:** `dox-init/SKILL.md` Phase 1 enumerates directories with a `find` command excluding `.git`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`, `coverage`, `.nyc_output`. `dox-update/SKILL.md` Phase 1 enumerates existing `AGENTS.md` files with the identical nine-entry exclusion list.
- **Direct consequence:** Adding `.claude` to the exclusion behavior requires an edit in both files; a change to only one leaves the other skill still scanning `.claude/`.
- **Evidence:** `.claude/skills/dox-init/SKILL.md:172-182`, `.claude/skills/dox-update/SKILL.md:52-62`
- **Excerpt (dox-init):**
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
- **Excerpt (dox-update):**
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

### 2. Both skill files are mirrored byte-for-byte under `dist/orbit/`

- **Observation:** `dist/orbit/skills/dox-init/SKILL.md` and `dist/orbit/skills/dox-update/SKILL.md` are byte-identical to their `.claude/skills/` counterparts (`diff` exit code 0 for both).
- **Direct consequence:** Any change to the exclusion list in `.claude/skills/` will not automatically propagate to `dist/orbit/skills/`; the two `dist/orbit/` files are a separate copy on disk that must be updated independently, or by whatever process last produced them (not identified in this research — no build script referencing `dist/orbit/` was located).
- **Evidence:** `dist/orbit/skills/dox-init/SKILL.md`, `dist/orbit/skills/dox-update/SKILL.md`
- **Excerpt:** `diff` command against `.claude/skills/dox-init/SKILL.md` and `.claude/skills/dox-update/SKILL.md` respectively both returned no output and exit code 0.

### 3. `.claude` is not currently excluded, and three AGENTS.md files already exist inside it in this repo

- **Observation:** Neither exclusion list nor any other line in either SKILL.md contains the string `.claude` (confirmed by direct read of both full files and by delegated grep sweep). Consistent with this, `.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, and `.claude/agents/AGENTS.md` already exist in this repository.
- **Direct consequence:** If `.claude` is added to the exclusion list with no further change, `dox-update`'s Phase 1 `find -name "AGENTS.md"` will no longer locate these three existing files, so they will never be evaluated for staleness or regenerated by `dox-update` going forward. They will also not be freshly created by `dox-init` in a project that doesn't yet have them, since `dox-init`'s Phase 1 directory enumeration would no longer surface any path under `.claude/`.
- **Evidence:** `.claude/AGENTS.md:1-34`, `.claude/skills/AGENTS.md:1-46`, `.claude/agents/AGENTS.md:1-44`

### 4. The root AGENTS.md Child DOX Index directly references `.claude/AGENTS.md`

- **Observation:** The repo root `AGENTS.md` Child DOX Index contains the line `- [.claude/](.claude/AGENTS.md) — Framework infrastructure: skills, agents, hooks, MCP servers`.
- **Direct consequence:** This index entry points at a file (`.claude/AGENTS.md`) that would fall outside the scope of both DOX skills' scanning once `.claude` is excluded; the skills themselves would take no action on this reference either way, since neither skill reads or writes the root AGENTS.md's Child DOX Index except at initial creation (`dox-init` Phase 2, which only runs if `./AGENTS.md` does not yet exist — it already exists in this repo, so `dox-init` would skip Phase 2 entirely here per its own logic).
- **Evidence:** `AGENTS.md:70`, `.claude/skills/dox-init/SKILL.md:189-193`
- **Excerpt (root AGENTS.md:70):** `- [.claude/](.claude/AGENTS.md) — Framework infrastructure: skills, agents, hooks, MCP servers`
- **Excerpt (dox-init Phase 2, SKILL.md:191-193):**
  ```
  - Attempt to `Read ./AGENTS.md`.
  - If it does NOT exist: write the canonical DOX snapshot ...
  - If it already exists: skip. Do NOT overwrite.
  ```

### 5. The exclusion list's original design rationale explicitly avoided Claude-Code-specific assumptions

- **Observation:** The prior fact-finder research that produced the current exclusion list states: "The skills are general-purpose and must work on any project in any language; no assumptions about `thoughts/`, `.claude/`, or any rpiqr-specific directory structure are permitted."
- **Direct consequence:** The existing exclusion list (`.git`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`, `coverage`, `.nyc_output`) was deliberately restricted to universal, cross-language, cross-tool directory names; `.claude` was omitted from that list by design rather than by oversight, per this prior research record.
- **Evidence:** `thoughts/shared/facts/2026-06-10-DOX-Skills.md:21`
- **Excerpt:** `The skills are general-purpose and must work on any project in any language; no assumptions about \`thoughts/\`, \`.claude/\`, or any rpiqr-specific directory structure are permitted.`

### 6. No secondary/duplicate filtering logic exists elsewhere in either skill

- **Observation:** Beyond the two `find` commands cited in Finding 1, neither `dox-init/SKILL.md` Phase 4 (per-subdirectory loop, lines 203-213) nor `dox-update/SKILL.md` Phase 2 (per-file staleness check, lines 67-82) contains any additional directory-name filter, allowlist, or denylist. Both phases operate on whatever list Phase 1 already produced.
- **Direct consequence:** A single edit to each Phase 1 `find` command is sufficient to change what these skills scan — there is no second location where `.claude` would need separate exclusion within the same file.
- **Evidence:** `.claude/skills/dox-init/SKILL.md:203-213`, `.claude/skills/dox-update/SKILL.md:67-82`

## Detailed Technical Analysis (Verified)

### Skill catalog entries for dox-init/dox-update

`.claude/skills/AGENTS.md:32-34` lists both skills under a "DOX maintenance skills:" heading with one-line descriptions; this file does not itself contain exclusion-list logic, only a catalog reference. No dedicated `AGENTS.md` exists inside `.claude/skills/dox-init/` or `.claude/skills/dox-update/` (each directory contains only its `SKILL.md`).

- **Evidence:** `.claude/skills/AGENTS.md:32-34`
- **Excerpt:**
  ```
  **DOX maintenance skills:**
  - `dox-init/` — Bootstrap a complete DOX governance tree for any project
  - `dox-update/` — Detect and repair stale AGENTS.md files
  ```

### Historical exclusion-list references (design record, not live code)

`thoughts/shared/features/2026-06-10-DOX-Skills.md:86`, `thoughts/shared/facts/2026-06-10-DOX-Skills.md:25,179-184,213`, and `thoughts/shared/plans/2026-06-10-DOX-Skills.md` (PLAN-001/PLAN-002 task instructions) all repeat the same nine-entry exclusion list that traces forward into the two live SKILL.md files. None of these historical documents mention `.claude` as an excluded path.

- **Evidence:** `thoughts/shared/features/2026-06-10-DOX-Skills.md:86`, `thoughts/shared/facts/2026-06-10-DOX-Skills.md:25`

## Verification Log

- `Verified:` `.claude/skills/dox-init/SKILL.md`, `.claude/skills/dox-update/SKILL.md`, `AGENTS.md`, `.claude/AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/agents/AGENTS.md`, `thoughts/shared/facts/2026-06-10-DOX-Skills.md` (lines 1-40), `dist/orbit/skills/dox-init/SKILL.md` (via diff), `dist/orbit/skills/dox-update/SKILL.md` (via diff)
- `Spot-checked excerpts captured:` yes

## Open Questions / Unverified Claims

- **How `dist/orbit/` is produced/synced from `.claude/`:** No build script, packaging command, or sync mechanism referencing `dist/orbit/` was located during this research. It is unverified whether an edit to `.claude/skills/dox-init/SKILL.md` and `.claude/skills/dox-update/SKILL.md` needs a corresponding manual edit to the `dist/orbit/` mirrors, or whether some other process regenerates `dist/orbit/` from `.claude/` automatically. What was tried: grepped skill directories and repo root for build/sync scripts referencing `dist/orbit`; none found within the scope of this research pass (a repo-wide search for packaging scripts was not performed).
- **Whether `thoughts/shared/plans/2026-06-10-DOX-Skills.md` contains any exclusion-list content beyond what was already located via the codebase-locator sweep:** The file's existence and line count (421 lines) were confirmed, but it was not read in full in this pass; the sweep results cite specific line ranges (91, 272-279, 350) that were not independently re-verified with `Read` in this session.

## References

**Codebase Citations:**
- `.claude/skills/dox-init/SKILL.md:172-213`
- `.claude/skills/dox-update/SKILL.md:52-82`
- `dist/orbit/skills/dox-init/SKILL.md`
- `dist/orbit/skills/dox-update/SKILL.md`
- `AGENTS.md:70`
- `.claude/AGENTS.md:1-34`
- `.claude/skills/AGENTS.md:1-46`
- `.claude/agents/AGENTS.md:1-44`
- `thoughts/shared/facts/2026-06-10-DOX-Skills.md:21`
- `thoughts/shared/features/2026-06-10-DOX-Skills.md:86`
