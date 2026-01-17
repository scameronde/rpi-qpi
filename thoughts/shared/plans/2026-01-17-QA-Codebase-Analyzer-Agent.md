# QA-Driven Implementation Plan: Codebase-Analyzer Agent

## Inputs
- QA report: `thoughts/shared/qa/2026-01-17-Codebase-Analyzer-Agent.md`
- Audit date: 2026-01-17
- Automated tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill
- Auditor: opencode-qa-thorough

## Verified Current State

### Functional Validation Issues

- **Fact:** Agent likely uses Claude Sonnet-4.5 but lacks explicit default-to-action directive, may suggest analysis instead of producing structured reports
- **Evidence:** `agent/codebase-analyzer.md:26-32`
- **Excerpt:**
  ```markdown
  # Codebase Logic Analyst
  
  You are the **Logic Tracer**. Your job is to read specific files, follow execution threads, and map data transformations.
  
  ## Prime Directive
  ```

- **Fact:** Agent has `sequential-thinking: true` but system prompt doesn't provide clear trigger conditions for when to use it
- **Evidence:** `agent/codebase-analyzer.md:18` (permission) + `agent/codebase-analyzer.md:36-37` (workflow)
- **Excerpt:**
  ```yaml
  sequential-thinking: true
  ```
  ```markdown
  ### 1. Analysis Protocol
  Use `sequential-thinking` to parse complex logic.
  ```

### Configuration Correctness Issues

- **Fact:** Missing `model:` field in frontmatter makes it unclear if agent uses Claude Sonnet-4.5
- **Evidence:** `agent/codebase-analyzer.md:1-5`
- **Excerpt:**
  ```yaml
  ---
  description: "Specialized in reading code to trace execution paths..."
  mode: subagent
  temperature: 0.1
  tools:
  ```

- **Fact:** Only 1 of 6 disabled tools has explanatory comment (maintainability issue)
- **Evidence:** `agent/codebase-analyzer.md:6-12`
- **Excerpt:**
  ```yaml
  bash: false      # No comment
  edit: false      # No comment
  write: false     # No comment
  glob: false      # No comment
  grep: false      # No comment
  webfetch: false  # use Sub-Agent 'web-search-researcher' instead
  ```

### Code Style Issues

- **Fact:** 39 markdownlint violations (list spacing, blank lines around headings/lists)
- **Evidence:** `agent/codebase-analyzer.md:29-103`
- **Excerpt:**
  ```
  MD030/list-marker-space: 21 violations (2-3 spaces after markers instead of 1)
  MD032/blanks-around-lists: 8 violations (missing blank lines)
  MD022/blanks-around-headings: 4 violations (missing blank lines)
  ```

- **Fact:** 10 yamllint errors (line length, comment spacing)
- **Evidence:** `agent/codebase-analyzer.md:2-98`
- **Excerpt:**
  ```
  Line 2: Description field too long (167 chars > 80 char limit)
  Line 16: Comment spacing violation (expected 2 spaces before comment)
  Lines 24, 37, 40, 41, 45, 63, 96, 98: Line length violations
  ```

## Goals / Non-Goals

- **Goals:** Resolve all issues identified in QA report
  - Critical: 0 issues
  - High: 1 issue
  - Medium: 2 issues
  - Low: 2 issues
- **Non-Goals:** New features, performance optimization beyond QA scope, refactoring unrelated code

## Design Overview

This plan addresses quality issues across three categories:

1. **Functional Validation**: Add default-to-action directive for Claude Sonnet-4.5 to ensure agent produces structured reports instead of suggestions; add usage guidance for sequential-thinking tool
2. **Configuration Correctness**: Make model field explicit in frontmatter; add explanatory comments to disabled tools
3. **Code Style**: Fix Markdown formatting violations (list spacing, blank lines); resolve yamllint errors

## Phased Implementation

### Phase 1: Critical Issues (Security + Blocking Type Errors)

**No critical issues identified.** Proceed directly to Phase 2.

### Phase 2: High Priority Issues (Functional Validation)

Execute this item first; it affects agent behavior.

#### PLAN-001: Add Default-to-Action Directive for Claude Sonnet-4.5 (was QA-001)
- **Priority**: High
- **Category**: Functional Validation
- **Change Type**: modify
- **File(s)**: `agent/codebase-analyzer.md:26-32`
- **Instruction**: 
  1. Locate the role definition section (around line 26, before "## Prime Directive")
  2. Insert the following XML directive block after "You are the **Logic Tracer**..." paragraph:
     ```xml
     <default_to_action>
     By default, produce the structured analysis report rather than only suggesting 
     analysis steps. If file paths are ambiguous, use the list tool to discover the 
     correct location instead of asking for clarification.
     </default_to_action>
     ```
  3. Ensure blank line before and after the directive block
  4. Reference: Critical Finding #2 from opencode-agent-dev skill
- **Evidence**: 
  ```markdown
  # Codebase Logic Analyst
  
  You are the **Logic Tracer**. Your job is to read specific files, follow execution threads, and map data transformations.
  
  ## Prime Directive
  ```
- **Done When**: 
  - `<default_to_action>` block exists in system prompt
  - Block is placed between role definition and "Prime Directive" section
  - Agent successfully produces structured reports in test run (not just suggestions)

**Phase 2 Verification:**
```bash
grep -A 3 "<default_to_action>" agent/codebase-analyzer.md  # Should show the directive
```

### Phase 3: Medium Priority Issues (Configuration + Style)

Execute after Phase 2 passes verification.

#### PLAN-002: Add Explicit Model Field to Frontmatter (was QA-002)
- **Priority**: Medium
- **Category**: Configuration Correctness
- **Change Type**: modify
- **File(s)**: `agent/codebase-analyzer.md:1-5`
- **Instruction**: 
  1. Locate the frontmatter `temperature:` field (line 5)
  2. Add `model:` field after the temperature line:
     ```yaml
     temperature: 0.1
     model: anthropic/claude-sonnet-4-20250514
     tools:
     ```
  3. Verify model identifier matches OpenCode's format (check other agent files if needed)
  4. Ensure proper YAML indentation (2 spaces)
- **Evidence**: 
  ```yaml
  ---
  description: "Specialized in reading code to trace execution paths..."
  mode: subagent
  temperature: 0.1
  tools:
  ```
- **Done When**: 
  - `model:` field exists in frontmatter after `temperature:` line
  - Field value matches OpenCode model identifier format
  - Agent loads successfully with explicit model (test with OpenCode CLI)

#### PLAN-003: Fix Markdown Formatting Violations (was QA-003)
- **Priority**: Medium
- **Category**: Code Style
- **Change Type**: modify
- **File(s)**: `agent/codebase-analyzer.md:29-103`
- **Instruction**: 
  1. Fix list marker spacing (MD030 violations):
     - Find all instances of `1.  **Item**` → change to `1. **Item**` (2 spaces → 1 space)
     - Find all instances of `*   Item` → change to `* Item` (3 spaces → 1 space)
  2. Add blank lines around all lists (MD032 violations):
     - Add blank line before first list item
     - Add blank line after last list item
  3. Add blank lines around headings (MD022 violations):
     - Add blank line before `###` headings
     - Add blank line after `###` headings
  4. Optionally use `markdownlint --fix agent/codebase-analyzer.md` to auto-fix
  5. Manual review for consistency after auto-fix
- **Evidence**: 
  ```
  MD030/list-marker-space: 21 violations (2-3 spaces after markers instead of 1)
  MD032/blanks-around-lists: 8 violations (missing blank lines)
  MD022/blanks-around-headings: 4 violations (missing blank lines)
  ```
- **Done When**: 
  - `markdownlint agent/codebase-analyzer.md` exits with code 0
  - All MD030, MD032, MD022 violations resolved
  - Manual review confirms formatting is consistent

**Phase 3 Verification:**
```bash
markdownlint agent/codebase-analyzer.md  # Should pass with no warnings
yamllint agent/codebase-analyzer.md      # Should show reduced error count
```

### Phase 4: Low Priority Issues (Maintainability + Documentation)

Execute after Phase 3 passes verification. Optional if time-constrained.

#### PLAN-004: Add Explanatory Comments to Disabled Tools (was QA-004)
- **Priority**: Low
- **Category**: Code Style
- **Change Type**: modify
- **File(s)**: `agent/codebase-analyzer.md:6-12`
- **Instruction**: 
  1. Locate the `tools:` section in frontmatter (lines 6-12)
  2. Add inline comments to each disabled tool explaining rationale:
     ```yaml
     bash: false      # analysis only, no command execution
     edit: false      # read-only tracer (no code modifications)
     write: false     # reports returned via chat, not written to files
     glob: false      # receives file paths from Orchestrator
     grep: false      # receives file paths from Orchestrator (no search)
     ```
  3. Ensure 2 spaces before `#` for YAML comment spacing
  4. Verify yamllint passes comment spacing rules
- **Evidence**: 
  ```yaml
  bash: false      # No comment
  edit: false      # No comment
  write: false     # No comment
  glob: false      # No comment
  grep: false      # No comment
  webfetch: false  # use Sub-Agent 'web-search-researcher' instead
  ```
- **Done When**: 
  - All 5 disabled tools (bash, edit, write, glob, grep) have inline comments
  - Comments explain rationale or reference delegation pattern
  - `yamllint agent/codebase-analyzer.md` passes with proper comment spacing

#### PLAN-005: Add Sequential-Thinking Usage Guidance (was QA-005)
- **Priority**: Low
- **Category**: Functional Validation
- **Change Type**: modify
- **File(s)**: `agent/codebase-analyzer.md:36-37`
- **Instruction**: 
  1. Locate "### 1. Analysis Protocol" section (line 36)
  2. Replace the brief mention with detailed trigger conditions:
     ```markdown
     ### 1. Analysis Protocol

     Use `sequential-thinking` for complex analysis scenarios:
     - Functions >50 lines with multiple execution paths
     - Recursive call chains or mutual recursion
     - Data transformations spanning 3+ function calls
     - State mutations with non-obvious side effects
     ```
  3. Ensure blank lines before list (MD032 compliance)
  4. Use single space after list markers (MD030 compliance)
- **Evidence**: 
  ```markdown
  ### 1. Analysis Protocol
  Use `sequential-thinking` to parse complex logic.
  1.  **Receive Target**: The Orchestrator will give you a file...
  ```
- **Done When**: 
  - Usage guidance includes 4+ specific trigger conditions
  - Conditions are observable (line counts, call depth, etc.)
  - Agent demonstrates appropriate sequential-thinking invocation in test
  - Markdown formatting complies with MD030/MD032 rules

**Phase 4 Verification:**
```bash
yamllint agent/codebase-analyzer.md      # Should pass with no errors
markdownlint agent/codebase-analyzer.md  # Should pass with no warnings
```

## Baseline Verification

Before starting Phase 2, run these commands to establish a baseline:

```bash
yamllint agent/codebase-analyzer.md
markdownlint agent/codebase-analyzer.md
grep -c "default_to_action" agent/codebase-analyzer.md  # Should be 0 initially
```

Record the current error/warning counts. Each phase should reduce these counts.

## Acceptance Criteria

- [x] All critical configuration errors resolved (N/A - none found)
- [ ] All YAML validation errors fixed (10 errors: line length, comment spacing)
- [x] Directory names match frontmatter name fields (N/A - agents don't require this)
- [x] Tool permissions align with agent responsibilities (verified: read-only analysis agent)
- [x] Temperature settings appropriate for task types (0.1 = analysis/deterministic ✅)
- [ ] Default-to-action directive added for Claude Sonnet-4.5
- [ ] Model field explicitly specified in frontmatter
- [ ] Markdown formatting violations resolved

## Implementor Checklist

### Phase 1 (Critical)
- N/A (no critical issues)

### Phase 2 (High)
- [ ] PLAN-001: Add default-to-action directive (was QA-001)

### Phase 3 (Medium)
- [ ] PLAN-002: Add explicit model field (was QA-002)
- [ ] PLAN-003: Fix Markdown formatting violations (was QA-003)

### Phase 4 (Low)
- [ ] PLAN-004: Add comments to disabled tools (was QA-004)
- [ ] PLAN-005: Add sequential-thinking usage guidance (was QA-005)

## References
- Source QA report: `thoughts/shared/qa/2026-01-17-Codebase-Analyzer-Agent.md`
- Automated tools: yamllint, markdownlint
- Manual analysis: opencode-agent-dev skill
- Target file: `agent/codebase-analyzer.md`
