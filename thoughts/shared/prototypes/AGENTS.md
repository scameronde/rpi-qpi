# prototypes/ — Prototype Learnings Notes

## Purpose

Stores short learnings notes produced by `/prototype` after every prototype session — the durable record of a go/no-go/iterate decision, even though the prototype's code itself is always discarded.

## Ownership

`/prototype` writes (only writer). Notes are write-once after creation. Read by `/feature-architect` and `/fact-finder` on a "go" decision, as additional context.

## Local Contracts

**File naming:** `YYYY-MM-DD-<name>.md`.

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

**Required body sections** (as specified in `.claude/skills/prototype/SKILL.md`'s Output Format):
- Problem
- What Was Built
- Outcome
- Decision

## Work Guidance

- Notes are read-only after creation
- Re-running `/prototype` on a related idea creates a new dated note — never overwrites a prior one
- A note's `decision` field is descriptive record-keeping, not a gate — nothing in the pipeline blocks on it

## Verification

- A valid note has all four required frontmatter fields and all four required body sections
- It never contains or references surviving prototype code (the code is deleted before the note is written)
