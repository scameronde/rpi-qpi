# DOX Skills Implementation Plan

## Inputs
- Feature brief: `thoughts/shared/features/2026-06-10-DOX-Skills.md`
- Research report: `thoughts/shared/research/2026-06-10-DOX-Skills.md`
- User request: implement `/dox-init` and `/dox-update` as Claude Code skills

## Verified Current State

- **Fact:** No existing skill performs directory enumeration or multi-directory file writes. The pattern is new.
- **Evidence:** `.claude/skills/subagent-driven-development/SKILL.md:27-29`
- **Excerpt:**
  ```markdown
  ## Per-Task Loop (sequential — never parallelize implementation)

  Repeat for each task in order:
  ```

- **Fact:** `CLAUDE.md` already contains a `## DOX Protocol` section at lines 169–177.
- **Evidence:** `CLAUDE.md:169-177`
- **Excerpt:**
  ```markdown
  ## DOX Protocol

  `AGENTS.md` files are local governance contracts for directory subtrees. Claude Code does not
  read them automatically — this section activates the protocol.
  ```

- **Fact:** The root `AGENTS.md` in this repo is project-specific governance, not the verbatim canonical DOX snapshot from GitHub.
- **Evidence:** `AGENTS.md:1-10`
- **Excerpt:**
  ```markdown
  # DOX framework

  - DOX is highly performant AGENTS.md hierarchy installed here
  - Agent must follow DOX instructions across any edits
  ```

- **Fact:** `.claude/skills/AGENTS.md` catalogues all skills under a Local Contracts section. Individual skill directories have no AGENTS.md files of their own.
- **Evidence:** `.claude/skills/AGENTS.md:13-29`
- **Excerpt:**
  ```markdown
  Each skill lives in its own subdirectory with a `SKILL.md` entry point:

  **Workflow skills (pipeline order):**
  - `mission-architect/` — ...
  - `feature-architect/` — ...
  ```

- **Fact:** Skill files use YAML frontmatter (`name`, `description`) followed by Markdown instruction body.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:1-4`
- **Excerpt:**
  ```yaml
  ---
  name: feature-architect
  description: Define a new feature in an existing system via conversation and light codebase scan. ...
  ---
  ```

- **Fact:** Canonical DOX snapshot fetched from `https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md` on 2026-06-10. Full content available — embedded in PLAN-001 below.

## Goals / Non-Goals

**Goals:**
- Create `.claude/skills/dox-init/SKILL.md` — bootstraps a complete DOX tree in any project
- Create `.claude/skills/dox-update/SKILL.md` — detects and repairs stale AGENTS.md files
- Update `.claude/skills/AGENTS.md` to list the two new skills

**Non-Goals:**
- Migrating governance content from `CLAUDE.md` into the DOX hierarchy
- Modifying any existing AGENTS.md files (the new skills do that, not the plan)
- Supporting non-Claude-Code platforms
- Per-directory confirmation prompts (fully autonomous execution)

## Design Overview

### dox-init flow
1. Run `Bash find` to enumerate all non-excluded directories
2. Root `./AGENTS.md`: write from bundled canonical DOX snapshot if missing; if present, skip
3. `CLAUDE.md`: search for `## DOX Protocol`; append the section if not found
4. Each subdirectory (in order): if AGENTS.md missing, `Bash ls` the dir → optional `Read` of README/index → write child AGENTS.md using the six-section schema
5. Print summary table: created / skipped / total

### dox-update flow
1. Run `Bash find . -name "AGENTS.md"` to collect all existing governance files
2. For each (root `./AGENTS.md` excluded): read it + `Bash ls` its parent dir → staleness judgment
3. Stale → regenerate using same analysis method as dox-init; current → skip
4. Print summary table: regenerated / skipped / total

### Shared invariants
- Exclusion list applied consistently via `find` flags (`.git`, `node_modules`, `dist`, `build`, `__pycache__`, `.venv`, `vendor`, `coverage`, `.nyc_output`)
- No subagents spawned for any step — direct `Bash` + `Read` + `Write` only
- Skills are general-purpose; no rpiqr-specific directory assumptions

## Implementation Instructions

---

### PLAN-001: Create `.claude/skills/dox-init/SKILL.md`

- **Change Type:** create
- **File(s):** `.claude/skills/dox-init/SKILL.md`
- **Instruction:**

  Create the file with the following structure:

  **Frontmatter:**
  ```yaml
  ---
  name: dox-init
  description: Bootstrap a complete DOX governance tree for the current project. Creates a root AGENTS.md with the canonical DOX protocol, verifies CLAUDE.md has the DOX activation section, and generates an AGENTS.md for every meaningful directory that does not already have one. Idempotent — existing AGENTS.md files are never overwritten.
  ---
  ```

  **Role statement:** One-sentence intro — "You are the DOX initializer. Your job is to bootstrap a complete, accurate DOX governance tree for this project in a single autonomous pass."

  **Bundled Assets section** — embed the following two blocks verbatim inside the SKILL.md so the implementer can copy them into generated files without network calls:

  *Bundled Asset 1 — Canonical DOX Snapshot (use verbatim as root `AGENTS.md` content when writing it):*
  ```
  # DOX framework

  - DOX is highly performant AGENTS.md hierarchy installed here
  - Agent must follow DOX instructions across any edits

  ## Core Contract

  - AGENTS.md files are binding work contracts for their subtrees
  - Work products, source materials, instructions, records, assets, and durable docs must stay
    understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

  ## Read Before Editing

  1. Read the root AGENTS.md
  2. Identify every file or folder you expect to touch
  3. Walk from the repository root to each target path
  4. Read every AGENTS.md found along each route
  5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that
     child and continue from there
  6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
  7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

  Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

  ## Update After Editing

  Every meaningful change requires a DOX pass before the task is done.

  Update the closest owning AGENTS.md when a change affects:

  - purpose, scope, ownership, or responsibilities
  - durable structure, contracts, workflows, or operating rules
  - required inputs, outputs, permissions, constraints, side effects, or artifacts
  - user preferences about behavior, communication, process, organization, or quality
  - AGENTS.md creation, deletion, move, rename, or index contents

  Update parent docs when parent-level structure, ownership, workflow, or child index changes.
  Update child docs when parent changes alter local rules. Remove stale or contradictory text
  immediately. Small edits that do not change behavior or contracts may leave docs unchanged,
  but the DOX pass still must happen.

  ## Hierarchy

  - Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable
    workflow rules, and the top-level Child DOX Index
  - Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
  - Each parent explains what its direct children cover and what stays owned by the parent
  - The closer a doc is to the work, the more specific and practical it must be

  ## Child Doc Shape

  - Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose,
    rules, responsibilities, workflow, materials, or quality standards
  - Work Guidance must reflect the current standards of the project or user instructions;
    if there are no specific standards or instructions yet, leave it empty
  - Verification must reflect an existing check; if no verification framework exists yet,
    leave it empty and update it when one exists

  Default section order:
  - Purpose
  - Ownership
  - Local Contracts
  - Work Guidance
  - Verification
  - Child DOX Index

  ## Style

  - Keep docs concise, current, and operational
  - Document stable contracts, not diary entries
  - Put broad rules in parent docs and concrete details in child docs
  - Prefer direct bullets with explicit names
  - Do not duplicate rules across many files unless each scope needs a local version
  - Delete stale notes instead of explaining history
  - Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no
    longer exist

  ## Closeout

  1. Re-check changed paths against the DOX chain
  2. Update nearest owning docs and any affected parents or children
  3. Refresh every affected Child DOX Index
  4. Remove stale or contradictory text
  5. Run existing verification when relevant
  6. Report any docs intentionally left unchanged and why

  ## User Preferences

  When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

  ## Child DOX Index

  [POPULATE WITH ACTUAL TOP-LEVEL DIRECTORIES WHEN WRITING THIS FILE — see Phase 2 below]
  ```

  *Bundled Asset 2 — CLAUDE.md DOX Protocol section (append verbatim when the section is missing):*
  ```
  ## DOX Protocol

  `AGENTS.md` files are local governance contracts for directory subtrees. Claude Code does
  not read them automatically — this section activates the protocol.

  **Before editing any file:** Walk from the repository root to each target file's directory.
  At each level, check for an `AGENTS.md` and read it. The nearest `AGENTS.md` to the file
  being edited is the local contract; parent `AGENTS.md` files supply broader rules. This
  `CLAUDE.md` is always the top-level contract.

  **After a meaningful change:** If the change affects a directory's purpose, scope, ownership,
  structure, file format contracts, or naming conventions — update the nearest owning
  `AGENTS.md`. If a directory is created or repurposed, also update the parent `AGENTS.md`'s
  Child DOX Index.

  **Conflict rule:** When `AGENTS.md` files conflict, the closer file governs local details.
  No `AGENTS.md` may override this `CLAUDE.md`.
  ```

  **Child AGENTS.md schema** — embed this template in the skill so Claude knows the exact format for every generated child file:
  ```
  # <dirname>/ — <one-line purpose summary>

  ## Purpose
  <What this directory contains and why it exists. 1–3 sentences.>

  ## Ownership
  <Who or what reads and writes this directory — humans, specific skills, agents, CI.>

  ## Local Contracts
  <File naming conventions, required structure, format rules specific to this directory.>

  ## Work Guidance
  <Rules agents must follow when creating or editing files here.>

  ## Verification
  <How to verify the contents are correct — commands, checks, observable outcomes.>

  ## Child DOX Index
  - [subdir/](subdir/AGENTS.md) — short description
  ```
  Note: omit any section that does not apply to the directory.

  **Execution phases — specify these verbatim in the skill body:**

  *Phase 0 — Pre-flight:*
  - Print: "DOX Init starting in: `<pwd>`"
  - Note this as the project root for all subsequent relative paths

  *Phase 1 — Enumerate directories:*
  - Run this exact command:
    ```bash
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
  - Store the result as the working directory list.

  *Phase 2 — Root `./AGENTS.md`:*
  - Attempt to `Read ./AGENTS.md`.
  - If it does NOT exist: write the canonical DOX snapshot (Bundled Asset 1) to `./AGENTS.md`, replacing the `## Child DOX Index` placeholder with actual entries derived from the immediate subdirectories of the project root that were found in Phase 1. Each entry follows the format: `- [dirname/](dirname/AGENTS.md) — <inferred one-line description>`.
  - If it already exists: skip. Do NOT overwrite.

  *Phase 3 — CLAUDE.md DOX Protocol section:*
  - Attempt to `Read CLAUDE.md`.
  - If CLAUDE.md does not exist: skip this phase and note in the final report.
  - If CLAUDE.md exists: search its content for the string `## DOX Protocol`.
    - If found: skip. Do NOT modify.
    - If NOT found: append Bundled Asset 2 to the end of CLAUDE.md using `Edit` (append after the last line).

  *Phase 4 — Per-subdirectory loop (process each dir from Phase 1 except `.`):*
  - For each directory path `<dir>`:
    1. Attempt to `Read <dir>/AGENTS.md`. If it exists: mark as SKIPPED and continue to next dir.
    2. Run `Bash ls -A <dir>`. If output is empty (directory has no files at all): mark as SKIPPED (empty dir) and continue.
    3. Run `Bash ls -la <dir>` to get the full file listing.
    4. If a `README.md`, `README`, or obvious entry-point file exists in the dir, `Read` it (first 60 lines only).
    5. Based on the file listing and any README content, write `<dir>/AGENTS.md` using the Child AGENTS.md schema. Content must be specific to this directory — not boilerplate. Omit sections that don't apply.

  *Phase 5 — Summary report:*
  - Print a summary table with three columns: Path | Action | Notes
  - Actions: `CREATED` / `SKIPPED (exists)` / `SKIPPED (empty)`
  - End with counts: "Created: N | Skipped: M | Total directories processed: P"

- **Evidence:** `thoughts/shared/research/2026-06-10-DOX-Skills.md` (all decisions verified and documented)
- **Done When:** File `.claude/skills/dox-init/SKILL.md` exists, contains the frontmatter, all five execution phases, both bundled assets, and the child schema template.

---

### PLAN-002: Create `.claude/skills/dox-update/SKILL.md`

- **Change Type:** create
- **File(s):** `.claude/skills/dox-update/SKILL.md`
- **Instruction:**

  Create the file with the following structure:

  **Frontmatter:**
  ```yaml
  ---
  name: dox-update
  description: Detect and repair stale AGENTS.md files in the current project. Reads each existing AGENTS.md, compares it against the current directory contents, and regenerates any file whose content no longer accurately describes its directory. Does not touch AGENTS.md files that are up to date.
  ---
  ```

  **Role statement:** "You are the DOX updater. Your job is to walk every existing AGENTS.md in this project, identify stale files, and repair them — leaving accurate files untouched."

  **Child AGENTS.md schema** — embed the same schema template as in PLAN-001 (same six-section format, same omit-if-not-applicable rule).

  **Staleness criteria** — embed these as the definition the skill uses to decide whether to regenerate:
  An AGENTS.md is considered **stale** when any of the following is true:
  1. It references specific file names that no longer exist in the directory
  2. The directory now contains file types, patterns, or subdirectories that materially change the directory's purpose and are not reflected in the AGENTS.md
  3. The AGENTS.md content is clearly generic or placeholder (e.g., contains the text "not yet indexed", is only one or two lines with no domain-specific content)
  4. The described ownership or workflow no longer matches the directory's evident role

  An AGENTS.md is **current** when its Purpose and Local Contracts sections still accurately describe the directory's actual contents and conventions.

  **Execution phases — specify these verbatim in the skill body:**

  *Phase 1 — Find all existing AGENTS.md files:*
  - Run:
    ```bash
    find . -name "AGENTS.md" \
      -not -path './.git*' \
      -not -path '*/node_modules*' \
      | sort
    ```
  - Store the list.

  *Phase 2 — Per-file staleness check and repair:*
  - For each path in the list:
    1. Determine the governing directory: strip `/AGENTS.md` suffix from the path.
    2. `Read` the AGENTS.md.
    3. Run `Bash ls -la <governing_dir>` to get the current file listing.
    4. Apply the staleness criteria: is this AGENTS.md still accurate?
    5. If **current**: mark as SKIPPED and continue.
    6. If **stale**:
       - If a `README.md` or obvious entry-point file is present in the directory, `Read` it (first 60 lines).
       - Regenerate the AGENTS.md using the child schema. Content must be specific to the actual files present — not a copy of what was there before.
       - Write the new content to the same path (overwriting the stale file).
       - Mark as REGENERATED.

  *Phase 3 — Summary report:*
  - Print a summary table: Path | Action | Reason
  - Actions: `REGENERATED` / `SKIPPED (current)`
  - End with counts: "Regenerated: N | Skipped (up to date): M | Total checked: P"

- **Evidence:** `thoughts/shared/research/2026-06-10-DOX-Skills.md`
- **Done When:** File `.claude/skills/dox-update/SKILL.md` exists, contains the frontmatter, the three execution phases, the staleness criteria block, and the child schema template.

---

### PLAN-003: Update `.claude/skills/AGENTS.md`

- **Change Type:** modify
- **File(s):** `.claude/skills/AGENTS.md`
- **Instruction:**

  Add the two new skills to the **Local Contracts** section. After the existing "Quality skills:" block (which ends with `claude-code-extensions/`), add a new group:

  ```markdown
  **DOX maintenance skills:**
  - `dox-init/` — Bootstrap a complete DOX governance tree for any project
  - `dox-update/` — Detect and repair stale AGENTS.md files
  ```

  No other changes. There is no Child DOX Index in this file (individual skill directories have no AGENTS.md), so no index update is needed.

- **Evidence:** `.claude/skills/AGENTS.md:24-29`
- **Excerpt:**
  ```markdown
  **Quality skills:**
  - `clean-code/` — Language-agnostic code quality review; contains `references/` subdirectory
  - `python-qa/` — Python-specific quality review
  - `typescript-qa/` — TypeScript-specific quality review
  - `logic-bugs-qa/` — Logic and bug analysis; contains `references/` subdirectory
  - `claude-code-extensions/` — Reference for extending Claude Code
  ```
- **Done When:** `.claude/skills/AGENTS.md` contains a "DOX maintenance skills:" group listing both `dox-init/` and `dox-update/`.

---

## Acceptance Criteria

- [ ] Running `/dox-init` in a project with no AGENTS.md files produces a root `AGENTS.md` containing the DOX protocol, a `CLAUDE.md` DOX reference section (if missing), and an `AGENTS.md` in every meaningful directory in the project tree.
- [ ] Running `/dox-init` in a project that already has some AGENTS.md files leaves existing files unchanged (idempotent) and only creates the missing ones.
- [ ] Running `/dox-update` identifies all AGENTS.md files that no longer accurately describe their directory and regenerates only those files; accurate files are untouched.
- [ ] Generated AGENTS.md content per directory is specific and accurate — it describes that directory's actual files, purpose, and conventions.
- [ ] Both skills print a summary report at completion listing which directories were created/regenerated/skipped.
- [ ] `.claude/skills/AGENTS.md` lists both new skills.

## Implementor Checklist

- [ ] PLAN-001: Create `.claude/skills/dox-init/SKILL.md`
- [ ] PLAN-002: Create `.claude/skills/dox-update/SKILL.md`
- [ ] PLAN-003: Update `.claude/skills/AGENTS.md` with new skill entries
