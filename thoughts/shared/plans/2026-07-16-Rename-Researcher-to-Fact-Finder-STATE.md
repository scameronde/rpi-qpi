# State: Rename-Researcher-to-Fact-Finder

**Plan**: thoughts/shared/plans/2026-07-16-Rename-Researcher-to-Fact-Finder.md
**Current Task**: Complete
**Completed Tasks**: PLAN-001, PLAN-002, PLAN-003, PLAN-004, PLAN-005, PLAN-006, PLAN-007, PLAN-008, PLAN-009, PLAN-010, PLAN-011, PLAN-012, PLAN-013, PLAN-014, PLAN-015, PLAN-016, PLAN-017, PLAN-018, PLAN-019, PLAN-020, PLAN-021, PLAN-022

## Task Checklist

### Phase 1: Renames (do first — durable moves)
- [x] PLAN-001: Rename .claude/skills/researcher/ -> fact-finder/, rewrite prose
- [x] PLAN-002: git mv thoughts/shared/research -> thoughts/shared/facts

### Phase 2: Governance files
- [x] PLAN-003: Update moved thoughts/shared/facts/AGENTS.md
- [x] PLAN-004: Update thoughts/shared/qa/AGENTS.md line 9 only (qa/ dir NOT moved)
- [x] PLAN-005: Update thoughts/shared/AGENTS.md (table, count, index)
- [x] PLAN-006: Update .claude/skills/AGENTS.md
- [x] PLAN-007: Update .claude/agents/AGENTS.md line 9
- [x] PLAN-008: Update root AGENTS.md pipeline lines

### Phase 3: Agent prose
- [x] PLAN-009: Update .claude/agents/thoughts-locator.md
- [x] PLAN-010: Update .claude/agents/codebase-locator.md line 47
- [x] PLAN-011: Update .claude/agents/codebase-analyzer.md line 35

### Phase 4: Skill prose
- [x] PLAN-012: Update mission-architect/SKILL.md
- [x] PLAN-013: Update feature-architect/SKILL.md
- [x] PLAN-014: Update specifier/SKILL.md
- [x] PLAN-015: Update epic-planner/SKILL.md
- [x] PLAN-016: Update planner/SKILL.md
- [x] PLAN-017: Update clean-code/SKILL.md

### Phase 5: Root docs + hook
- [x] PLAN-018: Update CLAUDE.md
- [x] PLAN-019: Update README.md
- [x] PLAN-020: Update GUIDE.md (incl. ToC anchor fix)
- [x] PLAN-021: Update .claude/hooks/session-start

### Phase 6: Presentation assets
- [x] PLAN-022: Update presentation/The_Agentic_Assembly_LineV3.html
  (presentation/ORBIT.pptx intentionally excluded — user will edit manually)

### Phase 7: Verification
- [x] Run repo-wide grep sweep (excluding intentional exclusions) — clean; only the 3 documented exclusions remain (CLAUDE.md:134 generic prose, settings.local.json:19 inert log, claude-code-extensions example), plus one newly-discovered historical write-once citation in thoughts/shared/features/2026-06-10-DOX-Skills.md left untouched by the same historical-record principle applied to plans/facts/qa/projects
- [x] Confirm thoughts/shared/qa/ untouched
- [x] Confirm .claude/skills/researcher/ gone, fact-finder/ present

## Quick Verification
- `test -d .claude/skills/researcher && echo FAIL || echo OK`
- `test -f .claude/skills/fact-finder/SKILL.md && echo OK`
- `grep -rn "researcher" . --exclude-dir={.git,node_modules,dist,thoughts/shared/plans,thoughts/shared/facts,thoughts/shared/qa,thoughts/projects,doc,docs,.superpowers} | grep -vi web-search-researcher`

## Notes
- Plan created: 2026-07-16
- Total tasks: 22 (PLAN-001..022) + verification
- Phases: Renames, Governance, Agent prose, Skill prose, Root docs+hook, Presentation, Verification
- Non-goals: web-search-researcher.md, ORBIT-V4-CONCEPT.md, doc/, docs/superpowers/, .superpowers/, historical thoughts/ report bodies, settings.local.json:19, claude-code-extensions example, presentation/ORBIT.pptx (user will edit manually)
