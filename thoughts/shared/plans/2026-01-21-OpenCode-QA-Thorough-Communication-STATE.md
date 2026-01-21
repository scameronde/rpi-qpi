# State: OpenCode-QA-Thorough Communication Pattern

**Plan**: thoughts/shared/plans/2026-01-21-OpenCode-QA-Thorough-Communication.md  
**Current Task**: PLAN-001  
**Completed Tasks**: (none yet)

## Quick Verification

After each task:
```bash
# Verify Phase 4.5 section exists
grep -n "Phase 4.5" agent/opencode-qa-thorough.md

# Verify thinking/answer tags in template
grep -n "<thinking>" agent/opencode-qa-thorough.md
grep -n "<answer>" agent/opencode-qa-thorough.md

# Verify YAML frontmatter in template
grep -n "message_id:" agent/opencode-qa-thorough.md

# Verify AGENTS.md entry
grep -n "opencode-qa-thorough" AGENTS.md
```

After all tasks:
```bash
# Read agent definition to verify structure
head -200 agent/opencode-qa-thorough.md | tail -50

# Verify documentation updated
grep -A 2 "opencode-qa-thorough" AGENTS.md
```

## Notes
- Plan created: 2026-01-21
- Total tasks: 5
- Phases: Phase 1 (Content Specification), Phase 2 (Template Modification), Phase 3 (Documentation)
- Research source: thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md
- Token impact: +15-20% per QA report, enables ~15% savings for QA-Planner
