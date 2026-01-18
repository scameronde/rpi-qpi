# State: QA-Driven Implementation - Codebase-Locator Agent

**Plan**: thoughts/shared/plans/2026-01-18-QA-Codebase-Locator-Agent.md  
**Current Task**: PLAN-001  
**Completed Tasks**: (none yet)

## Quick Verification
```bash
yamllint agent/codebase-locator.md
markdownlint agent/codebase-locator.md
grep -n "<default_to_action>" agent/codebase-locator.md
grep -n "webfetch" agent/codebase-locator.md
grep -n "model:" agent/codebase-locator.md
```

## Notes
- Plan created: 2026-01-18
- Total tasks: 9
- Phases: Phase 1 (Critical: 0), Phase 2 (High: 1), Phase 3 (Medium: 3), Phase 4 (Low: 5)
- QA report: thoughts/shared/qa/2026-01-18-Codebase-Locator-Agent.md
- Target file: agent/codebase-locator.md (319 lines)
- Critical finding: Missing default-to-action directive for Claude Sonnet-4.5
