# State: Agent Language Agnosticism

**Plan**: thoughts/shared/plans/2026-02-06-Agent-Language-Agnosticism.md  
**Current Task**: PLAN-006  
**Completed Tasks**: 
- PLAN-001
- PLAN-002
- PLAN-003
- PLAN-004
- PLAN-005

## Task Checklist

### Phase 1: Critical Changes (Language & Framework Agnosticism)
- [ ] PLAN-001: Make QA trigger file extension reference generic in researcher.md
- [ ] PLAN-002: Make QA skill reference generic in researcher.md
- [ ] PLAN-003: Remove framework mechanics explanation in researcher.md
- [ ] PLAN-004: Make tool example generic in researcher.md
- [ ] PLAN-005: Remove language enumeration in planner.md
- [ ] PLAN-006: Replace language-specific verification templates in planner.md
- [ ] PLAN-007: Remove OpenCode language reference in planner.md verification section

### Phase 2: Documentation Cleanup (Examples)
- [ ] PLAN-008: Make language idiom example generic in task-executor.md
- [ ] PLAN-009: Remove language list from web-search-researcher.md
- [ ] PLAN-010: Replace language names in mission-architect.md forbidden terms
- [ ] PLAN-011: Replace language names in specifier.md forbidden terms

## Quick Verification

After Phase 1:
```bash
grep -i "opencode\|claudecode" agent/*.md  # Should return no results
grep -n "\.py.*\.ts.*\.tsx" agent/researcher.md  # Should return no results (no hardcoded extensions)
grep -n "Python | TypeScript" agent/planner.md  # Should return no results (no language enumeration)
```

After Phase 2:
```bash
grep -n "Python.*TypeScript" agent/task-executor.md agent/web-search-researcher.md  # Should return no results
grep -n "React.*Python" agent/mission-architect.md agent/specifier.md  # Should return no results (replaced with placeholders)
```

## Notes
- Plan created: 2026-02-06
- Total tasks: 11 (reduced from 12 - removed PLAN-006 about skill tool reference)
- Phases: Phase 1 (Critical Changes), Phase 2 (Documentation Cleanup)
- Primary targets: agent/researcher.md (4 changes), agent/planner.md (3 changes)
- Secondary targets: agent/task-executor.md, agent/web-search-researcher.md, agent/mission-architect.md, agent/specifier.md (1 change each)
- Note: "skill tool" references are kept as they are legitimate agent tools, not framework-specific
