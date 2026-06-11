# State: Rename skill /subagent-driven-development to /implement

**Plan**: thoughts/shared/plans/2026-06-11-Rename-SDD-to-Implement.md
**Current Task**: COMPLETE
**Completed Tasks**: PLAN-001, PLAN-002, PLAN-003, PLAN-004, PLAN-005, PLAN-006, PLAN-007, PLAN-008, PLAN-009, PLAN-010

## Task Checklist

- [x] PLAN-001: Rename skill directory and update SKILL.md frontmatter (commit 563f3cc)
- [x] PLAN-002: Update CLAUDE.md (7 occurrences) — done as part of PLAN-001
- [x] PLAN-003: Update root AGENTS.md (4 occurrences) — done as part of PLAN-001
- [x] PLAN-004: Update .claude/AGENTS.md (1 occurrence) (commit 85b6c29)
- [x] PLAN-005: Update .claude/agents/AGENTS.md (1 occurrence + directory path) (commit 7f92728)
- [x] PLAN-006: Update .claude/skills/AGENTS.md (2 occurrences + SDD abbreviation) (commit 1fd4edc)
- [x] PLAN-007: Update .claude/skills/planner/SKILL.md (2 occurrences) (commit 3239db2)
- [x] PLAN-008: Update thoughts/shared/AGENTS.md (3 occurrences) (commit 2a6c195)
- [x] PLAN-009: Update thoughts/shared/plans/AGENTS.md (3 occurrences) (commit dbb2349)
- [x] PLAN-010: Update .claude/hooks/session-start (5 occurrences — missed by plan) (commit 86be22b)

## Quick Verification

```bash
# Confirm old directory is gone and new one exists
ls .claude/skills/ | grep -E "implement|subagent"

# Confirm no remaining references in active files
grep -rn subagent-driven-development .claude/ CLAUDE.md AGENTS.md thoughts/shared/AGENTS.md thoughts/shared/plans/AGENTS.md
```

## Notes

- Plan created: 2026-06-11
- Total tasks: 9
- PLAN-001 must complete before PLAN-002–PLAN-009 (directory rename first)
- PLAN-002 through PLAN-009 are independent and can run in any order
- Historical files (thoughts/shared/research/, docs/superpowers/) must NOT be modified
