---
date: 2026-06-10
researcher: researcher-skill
topic: "DOX Skills: dox-init and dox-update"
status: complete
coverage:
  - .claude/skills/ — all SKILL.md files reviewed for multi-file write patterns
  - .claude/agents/codebase-locator.md — capability review
  - AGENTS.md (root) — structure and content
  - CLAUDE.md — DOX Protocol section
  - thoughts/shared/features/2026-06-10-DOX-Skills.md — feature brief (source)
  - Full directory tree enumerated via Bash find
---

# Research: DOX Skills — dox-init and dox-update

## Executive Summary

- No existing skill in this framework performs directory enumeration or multi-directory file writes; the DOX skills will set the precedent for this pattern.
- The resolved implementation pattern is: the skill itself enumerates directories via `Bash find`, analyzes each via `Read` + `Bash ls`, and writes each `AGENTS.md` directly — no subagents per directory.
- The skills are general-purpose and must work on any project in any language; no assumptions about `thoughts/`, `.claude/`, or any rpiqr-specific directory structure are permitted.
- The root `AGENTS.md` content (canonical DOX protocol) must be bundled as a snapshot inside the skill to eliminate the network dependency on GitHub at runtime.
- The `CLAUDE.md` DOX Protocol section already has a defined shape (9 lines at `CLAUDE.md:169-177`); `dox-init` must verify this section exists and add it only if absent.
- `codebase-locator` is not appropriate for directory enumeration; it is designed for targeted lookups and would be misused as a general tree traversal tool.
- Default exclusion list confirmed: `.git`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`, `coverage`, `.nyc_output`.

## Coverage Map

- `.claude/skills/` — all 10 SKILL.md files scanned for multi-file write and loop patterns
- `.claude/agents/codebase-locator.md` — lines 70–110 (workflow and output format)
- `AGENTS.md` (root) — full file (72 lines)
- `CLAUDE.md` — DOX Protocol section at lines 169–177
- Full directory tree: `find . -type d -not -path "./.git*"` — 55 directories enumerated

## Critical Findings (Verified, Planner Attention Required)

### 1. No existing multi-directory write pattern — the DOX skills define the precedent

- **Observation:** No skill in `.claude/skills/` enumerates directories or runs a Bash loop over paths. The closest analogue is `subagent-driven-development`, which runs a sequential per-task loop — but it dispatches subagents rather than writing files itself. `epic-planner` writes N files but the count is determined by decomposition logic, not filesystem traversal.
- **Direct consequence:** The DOX skills must introduce the directory-enumeration + direct-write loop pattern from scratch, with no existing model to copy. The implementation decision (resolved via feature brief Q&A) is: `Bash find` to enumerate, `Read`/`Bash ls` to analyze, `Write` to produce each `AGENTS.md`.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:27-29`
  ```markdown
  ## Per-Task Loop (sequential — never parallelize implementation)

  Repeat for each task in order:
  ```
- **Evidence:** `.claude/skills/epic-planner/SKILL.md:102-104`
  ```markdown
  ### Phase 3: Epic Creation

  For each identified epic:
  ```

### 2. CLAUDE.md DOX Protocol section exists and has a defined shape

- **Observation:** `CLAUDE.md` contains a `## DOX Protocol` section at lines 169–177 (9 lines). It describes the pre-edit read traversal and post-edit update obligations. `dox-init` must verify this section exists and add it only if absent.
- **Direct consequence:** `dox-init` must search `CLAUDE.md` for the heading `## DOX Protocol` before writing. If found, skip. If absent, append the section.
- **Evidence:** `CLAUDE.md:169-177`
  ```markdown
  ## DOX Protocol

  `AGENTS.md` files are local governance contracts for directory subtrees. Claude Code does not
  read them automatically — this section activates the protocol.

  **Before editing any file:** Walk from the repository root to each target file's directory.
  At each level, check for an `AGENTS.md` and read it. The nearest `AGENTS.md` to the file
  being edited is the local contract; parent `AGENTS.md` files supply broader rules. This
  `CLAUDE.md` is always the top-level contract.

  **After a meaningful change:** If the change affects a directory's purpose, scope, ownership,
  structure, file format contracts, or naming conventions — update the nearest owning `AGENTS.md`.
  ...

  **Conflict rule:** When `AGENTS.md` files conflict, the closer file governs local details.
  No `AGENTS.md` may override this `CLAUDE.md`.
  ```

### 3. Root AGENTS.md in rpiqr is project-specific governance, not the canonical DOX snapshot

- **Observation:** The root `AGENTS.md` in this repo is a hand-crafted, project-tailored governance document. It contains rpiqr-specific content: the project name, workflow pipeline, and a Child DOX Index pointing to `.claude/` and `thoughts/shared/`. It is NOT the verbatim canonical DOX protocol from `https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md`.
- **Direct consequence:** `dox-init` cannot use the rpiqr root AGENTS.md as the template. The skill must bundle the canonical DOX protocol snapshot as embedded text. For new projects, the root AGENTS.md must be generated from this snapshot, not copied from any existing project's root.
- **Evidence:** `AGENTS.md:1-10`
  ```markdown
  # DOX framework

  - DOX is a highly performant AGENTS.md hierarchy installed here
  - Agent must follow DOX instructions across any edits

  ## Core Contract

  - AGENTS.md files are binding work contracts for their subtrees
  - Work products and durable docs must remain understandable from the nearest AGENTS.md
    plus every parent above it
  ```

### 4. `codebase-locator` is a targeted lookup tool — not a directory enumerator

- **Observation:** `codebase-locator` uses `tree src -L 2 -d` and `find`/`grep` internally, but it is designed to answer directed queries ("find auth logic", "where is User defined?"). It requires a subject-area input and returns role-annotated file coordinates. It is not designed to enumerate an entire project tree indiscriminately.
- **Direct consequence:** The DOX skills must use `Bash find` directly for directory traversal. `codebase-locator` is not to be spawned for this purpose.
- **Evidence:** `.claude/agents/codebase-locator.md:79-101`
  ```markdown
  ### Step 1: Broad Survey (Orientation)

  If the request is vague ("Find auth logic"), start with directory listing:

  ```bash
  tree src -L 2 -d  # Visualize structure
  ```

  ### Step 2: Targeted Search (Coordinates)

  Use `Glob` or `Bash` to find specific paths.

  **Strategy A: By Filename** (Best for known conventions)
  ```bash
  find src -name "*Controller.ts"
  ```
  ```

## Detailed Technical Analysis

### Skill File Structure (Integration Point)

Each skill lives in `.claude/skills/<name>/SKILL.md`. The `dox-init` and `dox-update` skills follow the same layout: `.claude/skills/dox-init/SKILL.md` and `.claude/skills/dox-update/SKILL.md`. The `.claude/skills/AGENTS.md` Child DOX Index must be updated to reference these two new skill directories after creation.

- **Evidence:** `.claude/skills/AGENTS.md:13-14`
  ```markdown
  Each skill lives in its own subdirectory with a `SKILL.md` entry point:
  ```

### Available Tools Within Skills

Skills may use: `Read`, `Write`, `Edit`, `Bash`, `Agent` (to spawn codebase analysis agents), `AskUserQuestion`. No external package dependencies are available. `WebFetch` is available for network access but the decision was made to bundle the DOX snapshot rather than fetch at runtime.

- **Evidence:** `thoughts/shared/features/2026-06-10-DOX-Skills.md:75`
  ```markdown
  Skills may use: `Read`, `Write`, `Edit`, `Bash` (for directory traversal and file listing),
  `Agent` (to spawn codebase analysis agents), `AskUserQuestion` (for pre-flight scope
  clarification if needed)
  ```

### AGENTS.md Child Schema (Fixed Contract)

The DOX child AGENTS.md schema is fixed and must be followed for all generated files. Sections not applicable to a given directory are omitted.

- **Evidence:** `thoughts/shared/features/2026-06-10-DOX-Skills.md:79`
  ```markdown
  The DOX child AGENTS.md schema is fixed: Purpose → Ownership → Local Contracts →
  Work Guidance → Verification → Child DOX Index (omit sections that don't apply)
  ```

### DOX Tree State in rpiqr (Reference Only — Skills Are General-Purpose)

The following is documented as reference context for the framework maintainer. The DOX skills do not assume this structure.

**Directories with AGENTS.md (8):**
- `/` (root)
- `.claude/`
- `.claude/agents/`
- `.claude/skills/`
- `thoughts/shared/`
- `thoughts/shared/research/`
- `thoughts/shared/plans/`
- `thoughts/shared/qa/`

**Representative directories without AGENTS.md:**
- All 12 individual skill subdirs under `.claude/skills/` (each has a `SKILL.md`)
- `thoughts/shared/epics/`, `features/`, `missions/`, `specs/`
- `.claude/hooks/`
- `.claude/mcp/` and its subdirs (MCP server TypeScript source)

### Default Exclusion List

Confirmed by user as the default for any project:

| Directory | Reason |
|---|---|
| `.git/` | VCS internals |
| `node_modules/` | Package dependencies |
| `dist/`, `build/` | Compiled output |
| `__pycache__/` | Python bytecache |
| `.venv/` | Python virtual environment |
| `vendor/` | Vendored dependencies |
| `coverage/`, `.nyc_output/` | Test coverage artifacts |

The skill should match these as prefix/name patterns so they are excluded regardless of depth in the tree.

### "Meaningful directory" heuristic

A directory merits an `AGENTS.md` only if it contains files that are not auto-generated. The Planner must define the staleness and "meaningful" heuristics precisely. No existing skill has a prior art for this check.

## Verification Log

- `Verified:` `.claude/skills/subagent-driven-development/SKILL.md` (lines 20–70)
- `Verified:` `.claude/skills/epic-planner/SKILL.md` (lines 95–124)
- `Verified:` `AGENTS.md` (full file, 72 lines)
- `Verified:` `CLAUDE.md` (lines 169–177, DOX Protocol section)
- `Verified:` `.claude/skills/AGENTS.md` (full file, 41 lines)
- `Verified:` `.claude/agents/codebase-locator.md` (lines 70–110)
- `Spot-checked excerpts captured:` yes

## Open Questions / Unverified Claims

None — all five open questions from the feature brief have been resolved via user Q&A.

**Resolved decisions (not requiring Planner investigation):**

| Decision | Resolution |
|---|---|
| Multi-directory loop pattern | Skill loops directly: `Bash find` + `Read`/`ls` + `Write` per file |
| Scope of skills | General-purpose — works on any project and language |
| Root AGENTS.md content source | Bundle canonical DOX snapshot as embedded text in skill |
| Default exclusion list | `.git`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`, `coverage`, `.nyc_output` |
| Per-directory analysis method | Direct `Read` + `Bash ls` — no subagents |

## References

**Codebase Citations:**
- `.claude/skills/subagent-driven-development/SKILL.md:27-29`
- `.claude/skills/epic-planner/SKILL.md:102-124`
- `.claude/agents/codebase-locator.md:79-101`
- `.claude/skills/AGENTS.md:1-41`
- `AGENTS.md:1-72`
- `CLAUDE.md:169-177`
- `thoughts/shared/features/2026-06-10-DOX-Skills.md:75-95`
