# changes/ — Change Briefs and Change Records

## Purpose

Stores change briefs produced by `/change-architect` and Change Records produced by `/just-do-it`. A change brief is the only input `/just-do-it` accepts; it also feeds into the pipeline for changes routed to the full workflow path via `/fact-finder`. A Change Record is the execution trace of what happened when the change was applied.

## Ownership

- `/change-architect` creates change briefs — write-once
- `/just-do-it` creates Change Records — also write-once, unlike a plan's STATE file which `/implement` updates throughout execution

The Record's write-once nature is deliberate: each Record documents one execution attempt (success or abandonment). A brief that already has a Record is not re-executed — `/just-do-it` refuses it (Non-Negotiable 2 in its skill) — and a further attempt is routed on what the Record says: a `complete` Record means the intent is spent and further work is a new change for `/change-architect`; an `abandoned` Record is resumed on the same brief via `/fact-finder`. This differs from `-STATE.md` files in `plans/`, which are mutated by `/implement` as it progresses through a plan.

## Local Contracts

**File naming:**
- Change briefs: `YYYY-MM-DD-<Change-Name>.md`
- Change Records: `YYYY-MM-DD-<Change-Name>-RECORD.md` — same base name as the brief
- The parent contract's glob (`thoughts/shared/AGENTS.md:43`, `YYYY-MM-DD-*.md`) accepts both, so this `-RECORD` suffix rule is the only thing distinguishing a Record from a brief — the same relationship `plans/AGENTS.md:16` has to `-STATE.md`

**Change brief document structure** (`.claude/skills/change-architect/SKILL.md` is the canonical template — read it there before writing a brief):

```yaml
---
date: YYYY-MM-DD
change-architect: [identifier]
change-name: "[Change Name]"
change-type: defect | enhancement | maintenance
route: direct | full
spec-source: "thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md"   # or "none"
status: complete | superseded
---
```

**Change Record document structure** (`.claude/skills/just-do-it/SKILL.md` is the canonical template — read it there before writing a record):

```yaml
---
date: YYYY-MM-DD
just-do-it: [identifier]
change-brief: "thoughts/shared/changes/YYYY-MM-DD-[Change-Name].md"
status: complete | abandoned
review: passed | passed-after-fix | failed | not-reached
---
```

**Change Record body:** Four required sections — `## Outcome`, `## Files Changed`, `## Acceptance Criterion`, `## Review Verdict` — plus a fifth section `## Abandonment` required only when `status: abandoned`.

**Routing rule:**
- `route: full` sends the change to `/fact-finder` for research before implementation
- `route: direct` sends the change directly to `/just-do-it` for immediate implementation, bypassing research
- Taking the full path from a `route: direct` brief is always permitted — escalating to more rigour is never an error

**`route: direct` conditions:** A brief carries `route: direct` only when both of these hold:
1. Its `## Open Questions for Fact-Finder` section contains the literal text `none — nothing must be established before the change`
2. Its `## Acceptance Criteria` section contains exactly one entry

## Work Guidance

- A change brief is never edited after creation, including by the skill executing it
- A Change Record is written once per execution attempt, capturing either success (`status: complete`) or abandonment (`status: abandoned`); do not amend a Record after creation
- `status: abandoned` accumulating across Records in this directory is the signal that the admission gate (the `route: direct` conditions) is mis-calibrated and needs review

## Verification

- A valid change brief's frontmatter carries all seven keys: `date`, `change-architect`, `change-name`, `change-type`, `route`, `spec-source`, `status` — applies to briefs authored 2026-07-31 or later
- A valid Change Record's frontmatter carries all five keys: `date`, `just-do-it`, `change-brief`, `status`, `review`
- Every `-RECORD.md` file has a corresponding brief with the same base name in this directory
- Every brief with `route: direct` has `## Open Questions for Fact-Finder` reading exactly `none — nothing must be established before the change` and `## Acceptance Criteria` containing exactly one entry
- `status:` in a Record describes the execution attempt, not the document — `complete` means the implementation succeeded, `abandoned` means the attempt was halted; this mirrors the `/implement` STATE file convention where `status:` also tracks execution state, not document maturity
