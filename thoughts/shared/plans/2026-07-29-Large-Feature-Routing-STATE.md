# State: Large-Feature Routing

**Plan**: thoughts/shared/plans/2026-07-29-Large-Feature-Routing.md
**Current Wave**: 1
**Current Task**: PLAN-001
**Completed Tasks**: (none yet)

## Task Checklist

Grouped by wave. Tasks within a wave run concurrently, but are checked off as each one commits — not together at the end of the wave.

### Wave 1
- [ ] PLAN-001: mission-architect two-condition test + host-system constraint
- [ ] PLAN-002: feature-architect routes oversized features to /mission-architect
- [ ] PLAN-003: specifier reads the host system's spec before Phase 2

## Quick Verification

All three tasks are `Verify: none — requires review` (prose rewrites past the fast-path size bar).

Post-wave acceptance greps:
- `grep -n "entirely new, with no existing codebase" .claude/skills/mission-architect/SKILL.md` → no output
- `grep -n "Greenfield Focus" .claude/skills/mission-architect/SKILL.md` → no output
- `grep -c "^| " .claude/skills/mission-architect/SKILL.md` → routing table has 4 scenario rows + header + separator
- `grep -n "route it through .\`\?/specifier" .claude/skills/feature-architect/SKILL.md` → no output
- `grep -n "Host system" .claude/skills/mission-architect/SKILL.md .claude/skills/specifier/SKILL.md` → hits in both
- `grep -rn "greenfield-feature\|thoughts/shared/features/" .claude/skills/specifier/SKILL.md` → no output
- `grep -n "Mission Architect agent" .claude/skills/specifier/SKILL.md` → no output
- frontmatter parses in all three, each `name:` intact

## Notes

- Plan created: 2026-07-29
- Total tasks: 3 across 1 wave
- No fact report — research done inline, evidence cited in the plan
- `.claude/**` is outside DOX: no `AGENTS.md` may be created
- **CLAUDE.md / README.md / AGENTS.md / hook are OUT OF SCOPE** — see the plan's Deferred
  section. They carry uncommitted work; committing them would sweep an unrelated rewrite.
