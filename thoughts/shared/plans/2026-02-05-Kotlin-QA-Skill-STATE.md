# State: Kotlin QA Skill Implementation

**Plan**: thoughts/shared/plans/2026-02-05-Kotlin-QA-Skill.md  
**Current Task**: PLAN-001  
**Completed Tasks**: (none yet)

## Task Checklist

- [ ] PLAN-001: Create skills/kotlin-qa/ directory
- [ ] PLAN-002: Write SKILL.md with Kotlin-specific tool commands and report template
- [ ] PLAN-003: Verify YAML and Markdown syntax, validate structure

## Quick Verification

```bash
# Verify YAML frontmatter
yamllint -f parsable skills/kotlin-qa/SKILL.md

# Verify Markdown formatting
markdownlint skills/kotlin-qa/SKILL.md

# Verify directory structure
ls -la skills/kotlin-qa/

# Count sections (should be 6)
grep -c "^## " skills/kotlin-qa/SKILL.md
```

## Notes
- Plan created: 2026-02-05
- Total tasks: 3
- Phases: None (sequential execution)
- Key adaptations: Gradle-first approach, detekt consolidation, dual coverage support (Kover/JaCoCo)
