# State: Prototype Skill

**Plan**: thoughts/shared/plans/2026-07-24-Prototype-Skill.md
**Current Task**: PLAN-002
**Completed Tasks**: PLAN-001

## Task Checklist

- [x] PLAN-001: Create `.claude/skills/prototype/SKILL.md` implementing the full build/demonstrate/decide/cleanup lifecycle
- [ ] PLAN-002: Add `prototypes/` row + Child DOX Index entry to `thoughts/shared/AGENTS.md`
- [ ] PLAN-003: Create `thoughts/shared/prototypes/AGENTS.md` (mirrors `qa/AGENTS.md` low-rigor pattern)
- [ ] PLAN-004: Add `prototype/` bullet to `.claude/skills/AGENTS.md` Workflow skills list
- [ ] PLAN-005: Document `/prototype` in `CLAUDE.md` (pipeline flow, stage table, skills table, dir structure)
- [ ] PLAN-006: Add "Prototype Learnings" category to `.claude/agents/thoughts-locator.md`
- [ ] PLAN-007: Add `thoughts/shared/prototypes/*.md` Glob line to `feature-architect/SKILL.md` Phase 1

## Quick Verification

- `git worktree list` / `git branch --list 'prototype/*'` — confirm branch naming and cleanup during/after a real `/prototype` run
- Manual end-to-end run: invoke → build → demonstrate → iterate once → decide (go or no-go) → confirm worktree/branch deleted → confirm learnings note exists in `thoughts/shared/prototypes/`
- Re-run `/feature-architect` (or `/fact-finder`) after a "go" run and confirm it surfaces the learnings note

## Notes

- Plan created: 2026-07-24
- Total tasks: 7
- Phases: none (single flat sequence; PLAN-001 is independent, PLAN-002/003 should precede or accompany PLAN-004/005/006/007 but have no strict ordering dependency)
