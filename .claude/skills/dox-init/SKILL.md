---
name: dox-init
description: Bootstrap a complete DOX governance tree for the current project. Creates a root AGENTS.md with the canonical DOX protocol, verifies CLAUDE.md has the DOX activation section, and generates an AGENTS.md for every meaningful directory that does not already have one. Idempotent — existing AGENTS.md files are never overwritten.
---

You are the DOX initializer. Your job is to bootstrap a complete, accurate DOX governance tree for this project in a single autonomous pass.

## Bundled Assets

### Bundled Asset 1 — Canonical DOX Snapshot

Use this verbatim as root `AGENTS.md` content when writing it (replace the `## Child DOX Index` placeholder with actual entries):

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

[to be populated with actual top-level directory entries]
```

### Bundled Asset 2 — CLAUDE.md DOX Protocol section

Append this verbatim when the section is missing:

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

## Child AGENTS.md Schema

Use this template for every generated child `AGENTS.md`. Omit any section that does not apply to the directory.

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

## Execution

### Phase 0 — Pre-flight

- Print: "DOX Init starting in: `<pwd>`"
- Note this as the project root for all subsequent relative paths

### Phase 1 — Enumerate directories

Run this exact command:

```bash
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

Note: this exclusion list covers common cases but is not exhaustive. Use judgment when encountering obvious build-artifact or cache directories not listed above — skip them rather than generating AGENTS.md files for generated content.

Store the result as the working directory list.

### Phase 2 — Root `./AGENTS.md`

- Attempt to `Read ./AGENTS.md`.
- If it does NOT exist: write the canonical DOX snapshot (Bundled Asset 1) to `./AGENTS.md`, replacing the `## Child DOX Index` placeholder with actual entries derived from the immediate subdirectories of the project root that were found in Phase 1. Each entry follows the format: `- [dirname/](dirname/AGENTS.md) — <inferred one-line description>`.
- If it already exists: skip. Do NOT overwrite.

### Phase 3 — CLAUDE.md DOX Protocol section

- Attempt to `Read CLAUDE.md`.
- If CLAUDE.md does not exist: skip this phase and note in the final report.
- If CLAUDE.md exists: search its content for the string `## DOX Protocol`.
  - If found: skip. Do NOT modify.
  - If NOT found: append Bundled Asset 2 to the end of CLAUDE.md using `Edit`. To append using `Edit`: read the file's current content, identify the last non-empty line, use `Edit` with `old_string` set to that last line and `new_string` set to that same line followed by a blank line and Bundled Asset 2.

### Phase 4 — Per-subdirectory loop

Process each directory from Phase 1 except `.`:

For each directory path `<dir>`:

1. Attempt to `Read <dir>/AGENTS.md`. If it exists: mark as SKIPPED and continue to next dir.
2. Run `Bash ls -A <dir>`. If output is empty (directory truly contains nothing — no files and no subdirectories): mark as SKIPPED (empty dir) and continue. Directories that contain only subdirectories are still processed in step 3 onward.
3. Run `Bash ls -la <dir>` to get the full file listing.
4. If a `README.md`, `README`, or obvious entry-point file exists in the dir, `Read` it (first 60 lines only).
5. Based on the file listing and any README content, write `<dir>/AGENTS.md` using the Child AGENTS.md schema. Content must be specific to this directory — not boilerplate. Omit sections that don't apply.

### Phase 5 — Summary report

- Print a summary table with three columns: Path | Action | Notes
- Actions: `CREATED` / `SKIPPED (exists)` / `SKIPPED (empty)`
- End with counts: "Created: N | Skipped: M | Total directories processed: P"
