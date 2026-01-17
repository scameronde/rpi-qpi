# State: OpenCode QA Agent

**Plan**: thoughts/shared/plans/2026-01-17-OpenCode-QA-Agent.md  
**Current Task**: PLAN-008  
**Completed Tasks**: PLAN-001, PLAN-002, PLAN-003, PLAN-004, PLAN-005, PLAN-006, PLAN-007

## Quick Verification

After implementation, verify agent works correctly:

```bash
# Check agent file exists
ls -la agent/opencode-qa-thorough.md

# Validate YAML frontmatter syntax
yamllint agent/opencode-qa-thorough.md

# Check Markdown formatting
markdownlint agent/opencode-qa-thorough.md

# Verify agent can be invoked (test with sample target)
# @opencode-qa-thorough analyze agent/planner.md
```

## Notes

- Plan created: 2026-01-17
- Total tasks: 12
- Phases: File Structure, System Prompt, Operational Workflow (5 phases), Plan Template, Guidelines, Examples, Summary
- Template source: agent/python-qa-thorough.md
- Domain knowledge: .opencode/skills/opencode/
