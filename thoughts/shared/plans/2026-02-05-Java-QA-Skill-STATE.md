# State: Java QA Skill

**Plan**: thoughts/shared/plans/2026-02-05-Java-QA-Skill.md  
**Current Task**: PLAN-001  
**Completed Tasks**: (none yet)

## Task Checklist

- [ ] PLAN-001: Create java-qa skill directory
- [ ] PLAN-002: Create SKILL.md with YAML frontmatter
- [ ] PLAN-003: Add Section 1 - QA Tool Commands (Maven)
- [ ] PLAN-004: Add Section 1 - QA Tool Commands (Gradle)
- [ ] PLAN-005: Add Section 2 - Prioritization Hierarchy
- [ ] PLAN-006: Add Section 3 - Report Template (Thinking Section)
- [ ] PLAN-007: Add Section 3 - Report Template (Answer Section with YAML Frontmatter)
- [ ] PLAN-008: Add Section 3 - Report Template (Automated Tool Findings)
- [ ] PLAN-009: Add Section 3 - Report Template (Manual Analysis and Improvement Plan)
- [ ] PLAN-010: Add Section 4 - Baseline Verification Commands

## Quick Verification

```bash
# Verify directory structure
ls -la skills/java-qa/

# Verify YAML frontmatter validity
yamllint skills/java-qa/SKILL.md

# Verify skill name matches directory
grep "^name:" skills/java-qa/SKILL.md
# Should output: name: java-qa

# Verify all sections present
grep "^## " skills/java-qa/SKILL.md
# Should show: QA Tool Commands, Prioritization Hierarchy, Report Template, Baseline Verification Commands
```

## Notes
- Plan created: 2026-02-05
- Total tasks: 10
- No phases (linear implementation)
- Research source: thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md
