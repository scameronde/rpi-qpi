# State: Upstream Skills Fixes

**Plan**: thoughts/shared/plans/2026-07-29-Upstream-Skills-Fixes.md
**Current Wave**: 1
**Current Task**: PLAN-002
**Completed Tasks**: PLAN-001

## Task Checklist

Grouped by wave. Tasks within a wave run concurrently, but are checked off as each one commits — not together at the end of the wave.

### Wave 1
- [x] PLAN-001: Fix mission-architect routing, tool scope, term ban, dead blocks
- [ ] PLAN-002: Wire specifier Open Questions intake, mirror cleanups
- [ ] PLAN-003: Wire epic-planner Open Questions intake, mirror cleanups

## Quick Verification

All three tasks are `Verify: none — requires review` (prose rewrites past the fast-path size bar).

Post-wave acceptance greps:
- `grep -rn "greenfield-feature" .claude/` → no output
- `grep -rn "Response Format (Structured Output)" .claude/skills/{mission-architect,specifier,epic-planner}` → no output
- `grep -rn "\[Framework\]\|\[Language\]\|\[Database\]\|\[CloudProvider\]\|\[ContainerTech\]" .claude/skills/{mission-architect,specifier}` → no output
- `grep -c "feature-architect" .claude/skills/mission-architect/SKILL.md` → ≥1

## Notes

- Plan created: 2026-07-29
- Total tasks: 3 across 1 wave
- No fact report — research done inline, evidence cited in the plan
- `.claude/**` is outside DOX: no `AGENTS.md` may be created by this plan
