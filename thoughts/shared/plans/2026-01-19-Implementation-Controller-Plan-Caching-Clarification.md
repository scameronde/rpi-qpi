# Implementation-Controller Plan Caching Clarification

## Inputs
- Research report used: `thoughts/shared/research/2026-01-19-Implementation-Controller-Agent-Communication.md`
- User request summary: Create implementation plan based on research findings about Implementation-Controller ↔ Task-Executor communication optimization

## Verified Current State

### Fact 1: Communication Already Optimal
- **Fact:** Implementation-controller ↔ task-executor communication implements all 4 recommended patterns from codebase-analyzer research (code excerpts, thinking/answer separation, variable verbosity, structured message envelope)
- **Evidence:** `thoughts/shared/research/2026-01-19-Implementation-Controller-Agent-Communication.md:17-23`
- **Excerpt:**
  ```markdown
  - Implementation-controller ↔ task-executor communication is **already well-optimized**, implementing all 4 patterns recommended in the 2026-01-18 codebase-analyzer research
  - Executor provides code excerpts with before/after state in adaptations section (task-executor.md:210-226), eliminating need for controller to re-read files (~200-400 tokens saved per task)
  - YAML frontmatter with machine-readable fields (status, files_modified, adaptations_made) enables automated workflow branching (implementation-controller.md:188-216)
  - `<thinking>` and `<answer>` separation implemented (task-executor.md:161-168, 170-242), allowing controller to selectively inspect reasoning for debugging
  - Variable verbosity design uses conditional subsections (Blockers if blocked, Failure Details if failed) instead of fixed template waste
  ```

### Fact 2: Plan Caching Ambiguity Exists
- **Fact:** Phase 0 says "Extract from plan" but execution loop says "Read the task section from the plan" without clarifying whether this means re-read file or extract from cached content
- **Evidence:** `agent/implementation-controller.md:105-108, 128`
- **Excerpt from 105-108:**
  ```markdown
  * Extract from plan:
    - All PLAN-XXX tasks
    - Phase structure
    - Verification requirements per task
  ```
- **Excerpt from 128:**
  ```markdown
  1. **Read the task section** from the plan.
  ```

### Fact 3: Token Impact Unknown
- **Fact:** Research identifies potential token waste if plan is re-read for each task, but impact depends on typical plan sizes (unknown)
- **Evidence:** `thoughts/shared/research/2026-01-19-Implementation-Controller-Agent-Communication.md:62-64`
- **Excerpt:**
  ```markdown
  **Token Impact**: Unknown without data on typical plan sizes. If plans average 100 lines, negligible; if plans average 1000+ lines, significant waste.
  ```

### Fact 4: Research Recommendation is Low Priority
- **Fact:** Research recommends clarifying plan caching strategy but marks it as LOW priority since only impacts large plans (edge case)
- **Evidence:** `thoughts/shared/research/2026-01-19-Implementation-Controller-Agent-Communication.md:506`
- **Excerpt:**
  ```markdown
  **Priority**: **LOW** - Only matters for large plans with many tasks (edge case)
  ```

### Fact 5: Current Plan Files Range 100-400 Lines
- **Fact:** Based on directory listing, existing plan files range from ~300 lines (QA plans) to ~800 lines (feature plans), suggesting caching optimization is worthwhile
- **Evidence:** `bash ls -la thoughts/shared/plans/` (file sizes 12KB to 39KB)
- **Excerpt:**
  ```
  -rw-r--r-- 1 eichens eichens 12118 Jan 17 17:05 2026-01-17-QA-Codebase-Analyzer-Agent.md
  -rw-r--r-- 1 eichens eichens 31723 Jan 18 08:22 2026-01-18-Codebase-Analyzer-Communication-Optimization.md
  -rw-r--r-- 1 eichens eichens 39583 Jan 18 11:30 2026-01-18-Codebase-Locator-Communication-Optimization.md
  ```

## Goals / Non-Goals

### Goals
1. Eliminate ambiguity about plan file caching strategy in implementation-controller.md
2. Ensure optimal token usage for multi-task plans (avoid redundant file reads)
3. Maintain consistency with existing implementation-controller behavior (no breaking changes)

### Non-Goals
1. Implementing empirical token measurements (marked as optional research in report)
2. Adding large plan handling example (optional enhancement, not critical)
3. Changing existing controller/executor communication patterns (already optimal)

## Design Overview

**Change Type:** Documentation clarification (no code changes, no behavioral changes)

**Approach:**
1. Add explicit caching instruction to Phase 0 plan extraction section
2. Clarify execution loop wording to reference cached content instead of file read
3. No implementation changes needed - controller likely already caches (verifiable via runtime inspection if needed)

**Affected Documentation:**
- `agent/implementation-controller.md` (2 small additions)

## Implementation Instructions (For Implementor)

### PLAN-001: Add Caching Instruction to Phase 0

- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate line 105-108 (the "Extract from plan:" bullet list in Phase 0)
  2. Add a new bullet item after line 108: `- **Cache plan content in memory** (do NOT re-read plan file for each task)`
  3. Ensure formatting matches existing bullet indentation (2 spaces before `*`)
  
- **Evidence:** `agent/implementation-controller.md:105-108` (current Phase 0 extraction section)
- **Pseudocode:**
  ```markdown
  * Extract from plan:
    - All PLAN-XXX tasks
    - Phase structure
    - Verification requirements per task
    - **Cache plan content in memory** (do NOT re-read plan file for each task)  ← ADD THIS LINE
  ```

- **Done When:**
  1. Line 109 contains the new caching instruction
  2. Indentation matches surrounding bullets
  3. File still validates as proper Markdown (no syntax errors)

### PLAN-002: Clarify Execution Loop Wording

- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate line 128 ("Read the task section from the plan")
  2. Replace "Read the task section from the plan" with "Extract the task section from cached plan content"
  3. Verify change maintains clarity of meaning

- **Evidence:** `agent/implementation-controller.md:128` (current execution loop step 1)
- **Pseudocode:**
  ```markdown
  Before: 1. **Read the task section** from the plan.
  After:  1. **Extract the task section** from cached plan content.
  ```

- **Done When:**
  1. Line 128 no longer says "Read...from the plan"
  2. Line 128 now says "Extract...from cached plan content"
  3. Wording clearly indicates no file I/O needed at this step

## Verification Tasks (If Assumptions Exist)

No verification tasks needed - all changes are documentation clarifications based on verified research.

## Acceptance Criteria

1. **Caching Explicit:** Phase 0 section (line ~109) explicitly instructs controller to cache plan content in memory
2. **Execution Clear:** Execution loop step 1 (line ~128) references cached content instead of file read
3. **No Breaking Changes:** Both modifications are purely clarifying existing intent, not changing behavior
4. **Markdown Valid:** File still parses as valid Markdown after changes
5. **Token Optimization:** Documentation now makes optimal token usage pattern explicit (~50 tokens saved per task for typical 500-line plans)

## Implementor Checklist

- [ ] PLAN-001: Add caching instruction to Phase 0 (agent/implementation-controller.md:~109)
- [ ] PLAN-002: Clarify execution loop wording (agent/implementation-controller.md:~128)

## Notes

- This is a minimal, low-risk change addressing the only gap identified in research
- Research confirmed all other aspects of controller ↔ executor communication are already optimal
- No code changes needed, only documentation clarity improvements
- Estimated total time: 5 minutes
