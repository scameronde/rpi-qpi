# QA Validation Fixes: Codebase-Analyzer Agent Implementation Plan

## Inputs
- QA report used: `thoughts/shared/qa/2026-01-18-Codebase-Analyzer-Agent.md`
- User request summary: Fix validation errors and documentation clarity issues in agent/codebase-analyzer.md
- Related plan: `thoughts/shared/plans/2026-01-18-Codebase-Analyzer-Communication-Optimization.md` (in progress, different scope)

## Verified Current State

### Fact 1: YAML comment has incorrect spacing (1 space instead of 2)
- **Evidence:** `agent/codebase-analyzer.md:16`
- **Excerpt:**
  ```yaml
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  ```
- **Verification:** yamllint reports "too few spaces before comment: expected 2"

### Fact 2: Mixed bullet styles throughout system prompt (asterisk vs dash)
- **Evidence:** `agent/codebase-analyzer.md:77`
- **Excerpt:**
  ```markdown
      * If Function A calls Function B (imported from `./utils.ts`), use `read` on `./utils.ts`.
  ```
- **Evidence:** `agent/codebase-analyzer.md:93`
- **Excerpt:**
  ```markdown
  * **In**: Arguments, Request Body, State props.
  ```
- **Verification:** markdownlint reports 36 MD004 violations (mixed * and - bullets)

### Fact 3: Lists missing blank lines before/after
- **Evidence:** `agent/codebase-analyzer.md:136-137`
- **Excerpt:**
  ```markdown
  **Always include:**
  * Section 1 (Execution Flow)
  ```
- **Verification:** markdownlint reports MD032 violations at lines 137, 140, 143, 210

### Fact 4: Code blocks missing blank lines around fences
- **Evidence:** `agent/codebase-analyzer.md:176-178`
- **Excerpt:**
  ```markdown
    **Excerpt:**
    ```typescript
    const result = schema.validate(input);
  ```
- **Verification:** markdownlint reports MD031 violations at lines 178, 185, 211

### Fact 5: "Orchestrator" term used without definition
- **Evidence:** `agent/codebase-analyzer.md:74`
- **Excerpt:**
  ```markdown
  1. **Receive Target**: The Orchestrator will give you a file and a focus 
     (e.g., "Analyze the `processOrder` function in `src/orders.ts`").
  ```
- **Evidence:** `agent/codebase-analyzer.md:78`
- **Excerpt:**
  ```markdown
      * **Constraint**: If an import is ambiguous (e.g., Dependency Injection or 
        Aliases like `@/utils`) and you cannot resolve it with `list`, **STOP** 
        and ask the Orchestrator to locate the file for you.
  ```
- **Context:** Used 3+ times but never defined (who is the Orchestrator?)

### Fact 6: Sequential-thinking triggers use subjective criteria
- **Evidence:** `agent/codebase-analyzer.md:67-72`
- **Excerpt:**
  ```markdown
  Use `sequential-thinking` for complex analysis scenarios:

  - Functions >50 lines with multiple execution paths
  - Recursive call chains or mutual recursion
  - Data transformations spanning 3+ function calls
  - State mutations with non-obvious side effects
  ```
- **Context:** "complex" and "non-obvious side effects" are subjective terms

### Fact 7: Code excerpt indentation inconsistent in output template
- **Evidence:** `agent/codebase-analyzer.md:176`
- **Excerpt:**
  ```markdown
  * **Step 2**: Calls `UserService.find()` (Line 15).
      * *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
  ```
- **Verification:** markdownlint reports MD007 violations (4-space indent instead of 2-space)

### Fact 8: Task-executor agent defines "Control Agent" upfront
- **Evidence:** `agent/task-executor.md:26-28`
- **Excerpt:**
  ```markdown
  * The **Control Agent** orchestrates the workflow.
  * **You build the code for one task.**
  * The **Control Agent** verifies and commits your work.
  ```
- **Context:** Comparison example showing clear role definition pattern

## Goals / Non-Goals

**Goals:**
1. Fix all critical YAML validation errors (yamllint)
2. Fix all Markdown linting errors (markdownlint MD004, MD032, MD031, MD022, MD007)
3. Clarify "Orchestrator" role definition
4. Make sequential-thinking trigger criteria observable/quantifiable
5. Ensure codebase-analyzer.md passes automated validation

**Non-Goals:**
- Addressing line-length warnings (acceptable per AGENTS.md)
- Changing core analysis logic or capabilities
- Modifying output format (handled by separate plan: 2026-01-18-Codebase-Analyzer-Communication-Optimization.md)
- Rewriting subjective criteria to objective ones if impractical

## Design Overview

### Fix Categories

1. **YAML Frontmatter** (Critical)
   - Add one space before `#` comment at line 16
   - No other YAML changes needed

2. **Markdown List Formatting** (High Priority)
   - Convert all `* ` bullets to `- ` (dash style)
   - Add blank lines before/after lists
   - Fix sub-item indentation from 4-space to 2-space

3. **Code Block Formatting** (High Priority)
   - Add blank lines before/after fenced code blocks

4. **Documentation Clarity** (Medium Priority)
   - Define "Orchestrator" role at start of system prompt
   - Refine sequential-thinking trigger criteria

### Change Scope

- **File:** `agent/codebase-analyzer.md`
- **Lines affected:** ~50-60 lines (mostly formatting)
- **Risk:** Low (no logic changes, only formatting and clarity)

## Implementation Instructions (For Implementor)

### Phase 1: Critical YAML Fix

#### PLAN-QA-001: Fix YAML Comment Spacing
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 1-20 (YAML frontmatter)
  2. Locate line 16: `webfetch: false # use Sub-Agent 'web-search-researcher' instead`
  3. Change to: `webfetch: false  # use Sub-Agent 'web-search-researcher' instead` (add one space before `#`)
  4. Verify all other inline comments in frontmatter have 2 spaces before `#`
- **Evidence:** QA report QA-001, yamllint output
- **Done When:** 
  - yamllint passes without comment-spacing warnings
  - Run: `yamllint agent/codebase-analyzer.md 2>&1 | grep -i "comment" | wc -l` returns 0

### Phase 2: Markdown List Formatting

#### PLAN-QA-002: Standardize Bullet Style to Dash
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 77-225 (system prompt body)
  2. Replace all unordered list bullets from `* ` to `- ` in the Markdown body (not in code examples)
  3. Apply to lines where markdownlint reports MD004 violations
  4. Preserve indentation levels (don't change 2-space or 4-space indents yet - that's PLAN-QA-006)
  5. Do NOT change bullets inside fenced code blocks or YAML frontmatter
- **Evidence:** QA report QA-002, markdownlint output
- **Done When:** 
  - markdownlint passes without MD004 violations
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD004 | wc -l` returns 0

#### PLAN-QA-003: Add Blank Lines Around Lists
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 135-145 (Section Inclusion Rules)
  2. Add blank line before list at line 137 (after "**Always include:**")
  3. Add blank line before list at line 140 (after "**For `focused` or `comprehensive` depth:**")
  4. Add blank line before list at line 143 (after "**For `comprehensive` depth only:**")
  5. Read lines 208-212 (end of template)
  6. Add blank line before closing tag at line 210 (before `</answer>`)
- **Evidence:** QA report QA-003, markdownlint MD032 violations
- **Done When:** 
  - markdownlint passes without MD032 violations at lines 137, 140, 143, 210
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD032 | wc -l` returns 0

#### PLAN-QA-004: Add Blank Lines Around Code Fences
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 168-190 (Execution Flow examples)
  2. Locate line 176-178 (Step 2 excerpt):
     ```markdown
       **Excerpt:**
       ```typescript
     ```
     Add blank line between "**Excerpt:**" and opening code fence
  3. Locate line 183-185 (Step 3 excerpt) and apply same fix
  4. Read lines 209-212 (end of output template)
  5. Check if line 211 is an opening code fence - if so, add blank line before it
- **Evidence:** QA report QA-004, markdownlint MD031 violations
- **Done When:** 
  - markdownlint passes without MD031 violations
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD031 | wc -l` returns 0

#### PLAN-QA-005: Fix Missing Blank Lines After Headings
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 190-210 (sections 2-4 of output template)
  2. Locate line 192 (`### 2. Data Model & State`) and add blank line after it
  3. Locate line 199 (`### 3. Dependencies`) and add blank line after it
  4. Locate line 205 (`### 4. Edge Cases Identified`) and add blank line after it
- **Evidence:** QA report QA-003, markdownlint MD022 violations
- **Done When:** 
  - markdownlint passes without MD022 violations at lines 192, 199, 205
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD022 | wc -l` returns 0

#### PLAN-QA-006: Fix Sub-Item Indentation
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 174-190 (execution flow steps with sub-items)
  2. Locate line 176 (4-space indented sub-item):
     ```markdown
     - **Step 2**: Calls `UserService.find()` (Line 15).
         - *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
     ```
     Change 4-space indent to 2-space:
     ```markdown
     - **Step 2**: Calls `UserService.find()` (Line 15).
       - *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
     ```
  3. Apply same fix to line 183 (sub-item under Step 3)
  4. Verify all sub-list items use 2-space indentation
- **Evidence:** QA report QA-007, markdownlint MD007 violations
- **Done When:** 
  - markdownlint passes without MD007 violations
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD007 | wc -l` returns 0

### Phase 3: Documentation Clarity

#### PLAN-QA-007: Define "Orchestrator" Role
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 32-39 (Prime Directive section)
  2. After line 38 (end of numbered list), add new section:
     ```markdown
     
     ## Role Context
     
     You are a **subagent** invoked by primary agents (Researcher, Planner, 
     Implementation-Controller) or all-mode QA agents. Throughout this document, 
     "Orchestrator" refers to the agent that invoked you. You return analysis 
     results via chat; the Orchestrator decides how to use them.
     ```
  3. This clarifies the relationship without changing existing references to "Orchestrator"
- **Evidence:** QA report QA-005
- **Done When:** 
  - File contains explicit definition of "Orchestrator" role
  - Definition appears before first use of term (currently line 74)
  - Run: `grep -n "Role Context" agent/codebase-analyzer.md` returns a match

#### PLAN-QA-008: Refine Sequential-Thinking Trigger Criteria
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Read `agent/codebase-analyzer.md` lines 63-73 (Workflow & Tools section)
  2. Locate lines 67-72 (sequential-thinking criteria)
  3. Replace with more quantifiable criteria:
     ```markdown
     Use `sequential-thinking` for complex analysis scenarios:
     
     - Functions >100 lines with 3+ branching paths (if/else, switch, ternary)
     - Recursive call chains or mutual recursion between 2+ functions
     - Data transformations spanning 3+ function calls with intermediate state
     - Mutations to shared state or closure variables accessed by multiple functions
     - Any analysis requiring more than 2 file reads to trace execution
     ```
  4. Remove subjective terms ("complex", "non-obvious")
  5. Add quantifiable thresholds where possible
- **Evidence:** QA report QA-006
- **Done When:** 
  - All trigger criteria are either quantifiable or have concrete examples
  - No use of "complex" or "non-obvious" without definition
  - Run: `grep -E "(complex|non-obvious)" agent/codebase-analyzer.md | grep -v "complex analysis scenarios" | wc -l` returns 0

## Verification Tasks (If Assumptions Exist)

No assumptions requiring verification - all changes are based on verifiable QA report findings.

## Acceptance Criteria

- [ ] yamllint passes with 0 critical errors (line-length warnings acceptable)
- [ ] markdownlint passes with 0 MD004, MD032, MD031, MD022, MD007 errors (line-length warnings acceptable)
- [ ] "Orchestrator" role is explicitly defined before first use
- [ ] Sequential-thinking trigger criteria use quantifiable thresholds
- [ ] All bullet lists use consistent dash (-) style
- [ ] All lists have blank lines before/after
- [ ] All code blocks have blank lines before/after
- [ ] All headings have blank lines after
- [ ] Run validation: `yamllint agent/codebase-analyzer.md && markdownlint agent/codebase-analyzer.md`

## Implementor Checklist

- [ ] PLAN-QA-001: Fix YAML Comment Spacing (1 character change)
- [ ] PLAN-QA-002: Standardize Bullet Style to Dash (~36 line changes)
- [ ] PLAN-QA-003: Add Blank Lines Around Lists (4 line additions)
- [ ] PLAN-QA-004: Add Blank Lines Around Code Fences (3 line additions)
- [ ] PLAN-QA-005: Fix Missing Blank Lines After Headings (3 line additions)
- [ ] PLAN-QA-006: Fix Sub-Item Indentation (2 line changes)
- [ ] PLAN-QA-007: Define "Orchestrator" Role (1 section addition, ~6 lines)
- [ ] PLAN-QA-008: Refine Sequential-Thinking Trigger Criteria (1 section rewrite, ~7 lines)
