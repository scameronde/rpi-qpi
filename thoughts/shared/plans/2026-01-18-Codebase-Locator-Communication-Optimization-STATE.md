# State: Codebase-Locator Communication Optimization

**Plan**: thoughts/shared/plans/2026-01-18-Codebase-Locator-Communication-Optimization.md  
**Current Task**: PLAN-001  
**Completed Tasks**: (none yet)

## Quick Verification

After each task, run these commands to verify changes:

### Verify Locator Changes (PLAN-001 to PLAN-005)
```bash
# Check if search_scope parameter documented
grep -A 5 "Input Parameters" agent/codebase-locator.md

# Check if output format shows conditional structure
grep -A 10 "Conditional Output Structure" agent/codebase-locator.md

# Check if role metadata documented
grep -A 5 "Role Metadata" agent/codebase-locator.md

# Check if thinking/answer tags shown in template
grep "<thinking>" agent/codebase-locator.md
grep "<answer>" agent/codebase-locator.md

# Check if YAML frontmatter documented
grep "message_id:" agent/codebase-locator.md
```

### Verify Consumer Agent Updates (PLAN-006 to PLAN-012)
```bash
# Check QA agents have delegation examples
grep -A 3 "search_scope: tests_only" agent/python-qa-thorough.md
grep -A 3 "search_scope: tests_only" agent/typescript-qa-thorough.md

# Check Researcher/Planner have comprehensive examples
grep -A 3 "search_scope: comprehensive" agent/researcher.md
grep -A 3 "search_scope: comprehensive" agent/planner.md
```

### Verify Documentation (PLAN-013)
```bash
# Check AGENTS.md has new section
grep -A 5 "Codebase-Locator Output Format and Scope Levels" AGENTS.md
```

## Notes
- Plan created: 2026-01-18
- Total tasks: 13
- Phases: 
  - Phase 1 (PLAN-001 to PLAN-005): Core locator enhancements
  - Phase 2 (PLAN-006 to PLAN-012): Consumer updates
  - Phase 3 (PLAN-013): Documentation
- Token impact: -76% for QA workflows, +102% for Researcher/Planner (acceptable for debugging value)
- Backward compatible: Defaults to comprehensive scope
