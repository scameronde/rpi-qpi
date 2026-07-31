# prototypes/ — Prototype Learnings Notes

## Purpose

Stores short learnings notes produced by `/prototype` after every prototype session — the durable record of a go/no-go decision, and the only trace the skill ever leaves, since the prototype's code itself is always discarded.

No notes exist here yet; the directory holds only this contract. That is expected — `/prototype` is an optional entry point, and file counts are not a contract.

## Ownership

`/prototype` is the only writer. Notes are write-once after creation.

Readers, on a "go" decision:

- `/feature-architect` and `/change-architect` — the two hand-off targets `/prototype` names in Phase 6; the user points one of them at the note. Only `/feature-architect` reads this directory on its own (`feature-architect/SKILL.md:76`); `/change-architect` runs no codebase scan, so it sees a note only when it is handed the path.
- `/fact-finder` — checks here for a note relevant to its target (`fact-finder/SKILL.md:586`).

Every reader treats the note as **additional context only** — never as a substitute for the mission, epic or brief, and never as verified evidence. The note records what was learned from code that was then thrown away, so its assumptions may no longer hold.

## Local Contracts

**File naming:** `YYYY-MM-DD-<slug>.md`, where `<slug>` is the kebab-case slug `/prototype` derived from the user's idea when it created the worktree.

**Required frontmatter:**
```yaml
---
date: YYYY-MM-DD
message_type: PROTOTYPE_NOTE
topic: "<short name>"
decision: go|no-go
status: complete
---
```

`decision` has no `iterate` value on purpose: "iterate" returns `/prototype` to its coding phase in the same worktree, so no note is written until the session settles on go or no-go.

**Required body sections** (`.claude/skills/prototype/SKILL.md`'s Output Format is canonical — read it there before writing a note):
- Problem
- What Was Built
- Outcome
- Decision

## Work Guidance

- Notes are read-only after creation
- Re-running `/prototype` on a related idea creates a new dated note — never overwrites a prior one
- A note's `decision` field is descriptive record-keeping, not a gate — nothing in the pipeline blocks on it
- Nothing here may reference surviving prototype code: `/prototype` tears the worktree down with `ExitWorktree(action: "remove", discard_changes: true)` before the note is written

## Verification

- `ls` — every file matches `YYYY-MM-DD-*.md`, plus this `AGENTS.md`
- A valid note has all five required frontmatter fields and all four required body sections
- `decision:` reads `go` or `no-go` — never `iterate`
- No note references a path inside a prototype worktree or branch (the code is deleted before the note is written)
