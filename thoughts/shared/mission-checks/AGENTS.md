# mission-checks/ — Mission Check Reports

## Purpose

Stores point-in-time audit reports produced by `/mission-check`. Unlike every sibling directory, a report here does not supersede the one before it — each report is a snapshot of mission tree coverage and fidelity at the time it was run.

No reports exist here yet. That is expected — `/mission-check` is an optional audit tool, and file counts are not a contract.

## Ownership

`/mission-check` is the sole writer. **Reports are not write-once** — a deliberate departure from the general write-once rule, because a drift audit is inherently a repeated snapshot, and multiple runs on the same date belong together.

No skill currently reads this directory. Findings are for human review only.

## Local Contracts

**File naming:** `YYYY-MM-DD-Mission-Check-N.md` where `N` is a run counter starting at 1, incremented per additional same-day run. Count existing files matching the pattern before writing to determine `N`.

This differs from `qa/AGENTS.md`'s semantic lens suffix (`-Python`, `-TypeScript`, etc.) — that pattern exists to distinguish reports from different QA skills covering the same target. Mission Check has only one producing skill, so the counter is generic: a simple repeat-run index.

**Required frontmatter:**
```yaml
---
date: YYYY-MM-DD
message_type: MISSION_CHECK_REPORT
run: N
status: complete
---
```

**Required body sections** (`.claude/skills/mission-check/SKILL.md`'s Output Format is canonical — read it there before writing a report):
- Executive Summary
- Trees & Branches Discovered
- Coverage Findings
- Fidelity Findings
- Unchanged Since Last Run
- References

## Work Guidance

- Reports are read-only after creation
- Findings are always observation plus evidence, never a proposed fix or brief
- When an orphan branch is found, the finding states explicitly that it has no root mission to check against
- Re-running `/mission-check` on the same date creates a new numbered report — never overwrites a prior one

## Verification

- `ls` shows only `YYYY-MM-DD-Mission-Check-N.md` files plus this `AGENTS.md`
- A valid report has all four frontmatter keys (`date`, `message_type`, `run`, `status`) and all six required body sections
- No two files share the same `N` for the same date
