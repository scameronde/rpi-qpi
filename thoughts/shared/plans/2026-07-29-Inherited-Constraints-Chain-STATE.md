# State: Inherited Constraints Chain

**Plan**: thoughts/shared/plans/2026-07-29-Inherited-Constraints-Chain.md
**Current Wave**: 1
**Current Task**: PLAN-003
**Completed Tasks**: PLAN-001, PLAN-002

## Task Checklist

Grouped by wave. Tasks within a wave run concurrently, but are checked off as each one commits — not together at the end of the wave.

### Wave 1
- [x] PLAN-001: specifier gains an Inherited Constraints section, step 4 points at it
- [x] PLAN-002: epic template carries inherited constraints, Phase 3 extracts them
- [ ] PLAN-003: fact-finder's intake table gains the Epic Inherited Constraints row

## Quick Verification

PLAN-003 has a real `Verify:`; PLAN-001 and PLAN-002 are `none — requires review`
(section placement inside a fenced template needs the structure read).

Post-wave acceptance greps:
- `grep -rn "^## Inherited Constraints" .claude/skills/` → 3 hits (feature-architect, specifier, epic-planner)
- `grep -c "what to treat as fixed rather than investigate" .claude/skills/fact-finder/SKILL.md` → 2
- `grep -n "Known Constraints" .claude/skills/epic-planner/SKILL.md` → still present (advisory channel kept)
- `git diff --stat` → mission-architect and feature-architect untouched
- frontmatter parses in all three edited files

## Notes

- Plan created: 2026-07-29
- Total tasks: 3 across 1 wave
- No fact report — research done inline, evidence cited in the plan
- Scope is 3 files, not the 2 the review estimated: `/specifier` also lacks a home for
  inherited constraints, since `Design Decisions` means choices made *here*
- `.claude/**` is outside DOX: no `AGENTS.md` may be created
- Docs (CLAUDE.md, README.md, AGENTS.md, hook) need no change — no route is added
