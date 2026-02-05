# Deprecated QA Agents (2026-02-05)

These agents were consolidated into the skills-based QA workflow.

**Replacement:**
- Use `researcher` agent in QA mode with appropriate skill (python-qa, typescript-qa, opencode-qa)
- Use `planner` agent with QA report detection (automatic)

**Rationale:**
- Reduced maintenance burden from ~3,582 lines to ~600 lines of skill definitions
- Eliminated duplication of tool commands, prioritization logic, and report templates
- Centralized language-specific QA knowledge in Skills

**Files Archived:**
- python-qa-thorough.md (626 lines)
- python-qa-quick.md (542 lines)
- typescript-qa-thorough.md (707 lines)
- typescript-qa-quick.md (593 lines)
- opencode-qa-thorough.md (568 lines)
- qa-planner.md (552 lines)

**See:** thoughts/shared/plans/2026-02-05-QA-Architecture-Consolidation.md
