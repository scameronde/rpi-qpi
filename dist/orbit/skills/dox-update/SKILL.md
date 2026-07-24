---
name: dox-update
description: Detect and repair stale AGENTS.md files in the current project. Reads each existing AGENTS.md, compares it against the current directory contents, and regenerates any file whose content no longer accurately describes its directory. Does not touch AGENTS.md files that are up to date.
---

You are the DOX updater. Your job is to walk every existing AGENTS.md in this project, identify stale files, and repair them — leaving accurate files untouched.

## Child AGENTS.md Schema

Use this template when regenerating a stale `AGENTS.md`. Omit any section that does not apply to the directory.

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

## Staleness Criteria

An AGENTS.md is considered **stale** when any of the following is true:

1. It references specific file names that no longer exist in the directory
2. The directory now contains file types, patterns, or subdirectories that materially change the directory's purpose and are not reflected in the AGENTS.md
3. The AGENTS.md content is clearly generic or placeholder (e.g., contains the text "not yet indexed", is only one or two lines with no domain-specific content)
4. The described ownership or workflow no longer matches the directory's evident role

An AGENTS.md is **current** when its Purpose and Local Contracts sections still accurately describe the directory's actual contents and conventions.

## Execution

### Phase 1 — Find all existing AGENTS.md files

Run:

```bash
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

Store the list.

### Phase 2 — Per-file staleness check and repair

**Note on root `./AGENTS.md`:** Do not apply the child schema heading format (`# <dirname>/`) to the root `./AGENTS.md` — there is no dirname for the repo root. Instead, preserve the existing heading as-is and rewrite only the sections that are stale.

For each path in the list:

1. Determine the governing directory: strip `/AGENTS.md` suffix from the path.
2. `Read` the AGENTS.md.
3. Run `Bash ls -la <governing_dir>` to get the current file listing. Note: this listing is non-recursive. For directories that contain only subdirectories and no files, use the subdirectory names as the primary signal for the staleness judgment.
4. Apply the staleness criteria: is this AGENTS.md still accurate?
5. If **current**: mark as SKIPPED and continue.
6. If **stale**:
   - If a `README.md` or obvious entry-point file is present in the directory, `Read` it (first 60 lines).
   - Regenerate the AGENTS.md using the child schema. Content must be specific to the actual files present — not a copy of what was there before.
   - Write the new content to the same path (overwriting the stale file).
   - Mark as REGENERATED.

### Phase 3 — Summary report

Print a summary table: Path | Action | Reason

Actions: `REGENERATED` / `SKIPPED (current)`

End with counts: "Regenerated: N | Skipped (up to date): M | Total checked: P"
