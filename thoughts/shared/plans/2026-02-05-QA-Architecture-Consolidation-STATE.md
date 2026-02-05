# State: QA Architecture Consolidation

**Plan**: thoughts/shared/plans/2026-02-05-QA-Architecture-Consolidation.md  
**Current Task**: PLAN-006  
**Completed Tasks**: 
- PLAN-001
- PLAN-002
- PLAN-003
- PLAN-004
- PLAN-005

## Task Checklist

### Phase 1: Create QA Skills
- [x] PLAN-001: Create skills/python-qa/SKILL.md with 4 sections
- [x] PLAN-002: Create skills/typescript-qa/SKILL.md with 4 sections
- [x] PLAN-003: Create skills/opencode-qa/SKILL.md with 4 sections

### Phase 2: Extend Researcher and Planner
- [x] PLAN-004: Add QA mode detection to agent/researcher.md
- [x] PLAN-005: Add QA report detection to agent/planner.md

### Phase 3: Update Documentation
- [ ] PLAN-006: Update AGENTS.md with QA workflow and deprecation notice

### Phase 4: Deprecate Agents
- [ ] PLAN-007: Move 6 QA agents to deprecated/ with README

## Quick Verification

After each phase:

```bash
# After Phase 1
ls -la skills/python-qa/SKILL.md skills/typescript-qa/SKILL.md skills/opencode-qa/SKILL.md

# After Phase 2
grep -n "QA Mode Detection" agent/researcher.md
grep -n "QA Report Detection" agent/planner.md

# After Phase 3
grep -n "QA Workflow" AGENTS.md
grep -n "Deprecated Agents" AGENTS.md

# After Phase 4
ls -la agent/deprecated/2026-02-05-qa-consolidation/
ls agent/ | grep -E "(python-qa|typescript-qa|opencode-qa|qa-planner)" | wc -l  # Should be 0
```

## Notes
- Plan created: 2026-02-05
- Total tasks: 7
- Phases: 4
- Target reduction: ~3,582 lines → ~600 lines (~83% reduction)
