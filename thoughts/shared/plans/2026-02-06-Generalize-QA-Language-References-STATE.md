---
plan: 2026-02-06-Generalize-QA-Language-References.md
current_phase: 1
current_task: PLAN-001
status: ready
last_updated: 2026-02-06
---

# STATE: Generalize QA Language References

## Progress Tracking

### Phase 1: Generalize researcher.md QA Mode Triggers
- [ ] PLAN-001: Generalize QA Mode Trigger Conditions

### Phase 2: Generalize AGENTS.md QA Analysis Section
- [ ] PLAN-002: Generalize File Extension → Skill Mapping
- [ ] PLAN-003: Generalize Auditor Name → Skill Mapping

### Phase 3: Generalize Deprecated Agents Section
- [ ] PLAN-004: Generalize Deprecated Agents Documentation

### Phase 4: Update QA Skills Section for Discoverability
- [ ] PLAN-005: Add Skill Discovery Pattern to QA Skills Section

## Current Task

**Task ID**: PLAN-001
**Phase**: 1
**Description**: Generalize QA Mode Trigger Conditions in researcher.md

## Environment Verification

```bash
# Verify target files exist
ls -la agent/researcher.md AGENTS.md

# Verify skills directory structure
ls -la skills/*/SKILL.md | grep -qa
```

## Notes

- All tasks are documentation updates (no code changes)
- Verification commands focus on ensuring no hardcoded language references remain
- Test case: After completion, adding Rust QA should require only creating skills/rust-qa/SKILL.md
