# OpenCode QA Analysis: codebase-analyzer.md

## Scan Metadata
- Date: 2026-01-17
- Target: agent/codebase-analyzer.md
- Auditor: opencode-qa-thorough
- Tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill
- Subagents used: None (direct analysis)

## Executive Summary
- **Overall Status**: Conditional Pass
- **Critical Issues**: 0
- **High Priority**: 1
- **Medium Priority**: 2
- **Improvement Opportunities**: 2
- **Automated Violations**: 10 yamllint errors, 39 markdownlint warnings

**Summary**: The codebase-analyzer agent is functionally sound with appropriate tool permissions, clear role definition, and correct temperature setting for analysis work. However, it suffers from numerous formatting violations (line length, list spacing) and lacks a Claude Sonnet-4.5 default-to-action directive, which may cause the agent to suggest rather than implement analysis reports.

## Automated Tool Findings

### 📋 YAML Validation (yamllint)
- **Status**: FAILED
- **Errors**: 10

#### Issues
1. **Line 2**: Description field too long (167 chars > 80 char limit)
   - `agent/codebase-analyzer.md:2:81`
2. **Line 16**: Comment spacing violation (expected 2 spaces before comment)
   - `agent/codebase-analyzer.md:16:19`
3. **Line 24**: Line too long (121 chars)
   - `agent/codebase-analyzer.md:24:81`
4. **Line 28**: YAML syntax error (found '*' instead of alphanumeric)
   - `agent/codebase-analyzer.md:28:2` (FALSE POSITIVE - this is Markdown content, not YAML)
5. **Lines 37, 40, 41, 45, 63, 96, 98**: Additional line length violations
   - All exceed 80 character limit

### 📝 Markdown Linting (markdownlint)
- **Status**: FAILED
- **Warnings**: 39

#### Issues Summary
- **MD013 (line-length)**: 6 violations - lines exceed 80 character limit
- **MD030 (list-marker-space)**: 21 violations - lists use 2-3 spaces after marker instead of 1
- **MD032 (blanks-around-lists)**: 8 violations - lists not surrounded by blank lines
- **MD022 (blanks-around-headings)**: 4 violations - headings missing blank lines above/below

**Pattern**: The agent uses 2-3 space indentation after list markers (`1.  item`, `*   item`) throughout, which conflicts with standard Markdown style (1 space: `1. item`, `* item`).

### 🏷️ Naming Conventions
- **Status**: PASSED
- **Violations**: 0

#### Results
- Filename `codebase-analyzer.md` follows kebab-case: ✅
- No frontmatter `name:` field required (agents don't use directory matching): ✅

## Manual Quality Analysis

### 📖 Agent/Skill Clarity Issues

#### Clarity-1: Verbose/Redundant Instructions
- **Issue**: Multiple sections repeat the same constraint ("You cannot search")
- **Evidence**: 
  - `agent/codebase-analyzer.md:28-29`
  - `agent/codebase-analyzer.md:102`
- **Excerpt (Lines 28-29)**:
  ```markdown
  1.  **NO Searching**: You cannot use `grep` or `find`. You rely on `import` statements...
  2.  **Trace, Don't Guess**: Follow the code exactly as written.
  ```
- **Excerpt (Line 102)**:
  ```markdown
  *   **Forbidden**: `grep`, `find`, `glob`, `bash`.
  ```
- **Impact**: Low - Redundancy doesn't harm functionality, but increases token usage (~50 tokens)
- **Recommendation**: Consolidate constraint statements into a single "Constraints" section at the top

#### Clarity-2: Ambiguous "You do not write files" Instruction
- **Issue**: Line 45 states "You do not write files" but agent has `write: false` in permissions - instruction is redundant
- **Evidence**: `agent/codebase-analyzer.md:9` (permission) + `agent/codebase-analyzer.md:45` (instruction)
- **Excerpt (Permission)**:
  ```yaml
  write: false
  ```
- **Excerpt (Instruction)**:
  ```markdown
  ### 2. Output Protocol
  You do not write files. You return a structured Markdown report in the chat context.
  ```
- **Impact**: Low - Permission enforces this mechanically, instruction is defensive redundancy
- **Recommendation**: Remove redundant instruction (permission is sufficient enforcement)

### 🔧 Configuration Correctness Issues

#### Config-1: Missing Model Field (Claude Sonnet-4.5 Verification)
- **Issue**: Agent does not specify `model:` field in frontmatter, making it impossible to verify if Claude Sonnet-4.5 default-to-action directive is required
- **Evidence**: `agent/codebase-analyzer.md:1-20` (entire frontmatter)
- **Excerpt**:
  ```yaml
  ---
  description: "Specialized in reading code to trace execution paths..."
  mode: subagent
  temperature: 0.1
  tools:
    bash: false
    # ... (no model field)
  ---
  ```
- **Impact**: Medium - If using Claude Sonnet-4.5 (default), agent may suggest analysis instead of producing reports (Critical Finding #2)
- **Recommendation**: Add `model:` field to frontmatter (explicit is better than implicit)

#### Config-2: Inconsistent Comment Style in Tool Permissions
- **Issue**: Only one tool has an explanatory comment (`webfetch: false # use Sub-Agent 'web-search-researcher' instead`), but multiple other disabled tools lack rationale
- **Evidence**: `agent/codebase-analyzer.md:6-19`
- **Excerpt**:
  ```yaml
  tools:
    bash: false      # No comment - why disabled?
    edit: false      # No comment - why disabled?
    read: true
    write: false     # No comment - why disabled?
    glob: false      # No comment - why disabled?
    grep: false      # No comment - why disabled?
    # ...
    webfetch: false  # use Sub-Agent 'web-search-researcher' instead
  ```
- **Impact**: Low - Permissions are correct, but comments improve maintainability
- **Recommendation**: Add comments for all disabled tools (e.g., `bash: false # analysis only, no execution`, `edit: false # read-only tracer`)

### 🎯 Functional Validation Issues

#### Functional-1: Missing Default-to-Action Directive (High Priority)
- **Issue**: Agent likely uses Claude Sonnet-4.5 (default model) but lacks explicit tool usage directive, may suggest analysis instead of producing reports
- **Evidence**: `agent/codebase-analyzer.md:22-32` (system prompt beginning, no directive found)
- **Excerpt**:
  ```markdown
  # Codebase Logic Analyst
  
  You are the **Logic Tracer**. Your job is to read specific files, follow execution threads, and map data transformations.
  
  ## Prime Directive
  
  **You are a Reader, not a Searcher.**
  ```
- **Impact**: High - Without explicit directive, Claude Sonnet-4.5 may only suggest analysis steps instead of producing the structured report (Critical Finding #2)
- **Expected**: Should include `<default_to_action>` block after role definition
- **Reference**: `.opencode/skills/opencode/references/critical-findings.md:53-71`

#### Functional-2: Tool Permission Alignment Check
- **Issue**: Agent has `sequential-thinking: true` but system prompt doesn't mention when/how to use it
- **Evidence**: `agent/codebase-analyzer.md:18` (permission) + `agent/codebase-analyzer.md:36` (workflow section)
- **Excerpt (Permission)**:
  ```yaml
  sequential-thinking: true
  ```
- **Excerpt (Workflow - Line 36)**:
  ```markdown
  ### 1. Analysis Protocol
  Use `sequential-thinking` to parse complex logic.
  ```
- **Impact**: Low - Tool is mentioned once briefly, but no guidance on threshold for "complex logic"
- **Recommendation**: Add specific trigger condition (e.g., "Use `sequential-thinking` for functions >50 lines or recursive call chains")

#### Functional-3: Observable Acceptance Criteria
- **Issue**: Output template provides format but no guidance on completeness/success criteria
- **Evidence**: `agent/codebase-analyzer.md:65-93` (entire output template)
- **Excerpt**:
  ```markdown
  ## Output Template
  
  Return your findings in this strict format:
  
  ```markdown
  ## Logic Analysis: [Component Name]
  ### 1. Execution Flow
  ### 2. Data Model & State
  ### 3. Dependencies
  ### 4. Edge Cases Identified
  ```
- **Impact**: Low - Template is clear, but no "Done When" criteria (e.g., "Analysis complete when all import chains traced to leaf functions")
- **Recommendation**: Add "Analysis Completeness Checklist" section with observable criteria

## Improvement Plan (For Implementor)

### QA-001: Add Default-to-Action Directive for Claude Sonnet-4.5
- **Priority**: High
- **Category**: Functional Validation
- **File(s)**: `agent/codebase-analyzer.md:26-32`
- **Issue**: Agent likely uses Claude Sonnet-4.5 but lacks explicit tool usage directive, may suggest analysis instead of producing structured reports
- **Evidence**: 
  ```markdown
  # Codebase Logic Analyst
  
  You are the **Logic Tracer**. Your job is to read specific files, follow execution threads, and map data transformations.
  
  ## Prime Directive
  ```
- **Recommendation**: 
  1. Add XML directive after role definition (around line 26, before "Prime Directive"):
     ```xml
     <default_to_action>
     By default, produce the structured analysis report rather than only suggesting 
     analysis steps. If file paths are ambiguous, use the list tool to discover the 
     correct location instead of asking for clarification.
     </default_to_action>
     ```
  2. Reference: Critical Finding #2 from opencode-agent-dev skill
- **Done When**: 
  - `<default_to_action>` block exists in system prompt
  - Block is placed between role definition and "Prime Directive" section
  - Agent successfully produces structured reports in test run (not just suggestions)

### QA-002: Add Explicit Model Field to Frontmatter
- **Priority**: Medium
- **Category**: Configuration Correctness
- **File(s)**: `agent/codebase-analyzer.md:1-5`
- **Issue**: Missing `model:` field makes it unclear if agent uses Claude Sonnet-4.5 (affecting QA-001)
- **Evidence**: 
  ```yaml
  ---
  description: "Specialized in reading code to trace execution paths..."
  mode: subagent
  temperature: 0.1
  tools:
  ```
- **Recommendation**: 
  1. Add `model:` field after `temperature:` line (line 5):
     ```yaml
     temperature: 0.1
     model: anthropic/claude-sonnet-4-20250514  # or appropriate model
     tools:
     ```
  2. Verify default model with OpenCode documentation or existing agents
- **Done When**: 
  - `model:` field exists in frontmatter
  - Field value matches OpenCode model identifier format
  - Agent loads successfully with explicit model

### QA-003: Fix Markdown Formatting Violations
- **Priority**: Medium
- **Category**: Code Style
- **File(s)**: `agent/codebase-analyzer.md:29-103`
- **Issue**: 39 markdownlint violations (list spacing, blank lines around headings)
- **Evidence**: 
  ```
  MD030/list-marker-space: 21 violations (2-3 spaces after markers instead of 1)
  MD032/blanks-around-lists: 8 violations (missing blank lines)
  MD022/blanks-around-headings: 4 violations (missing blank lines)
  ```
- **Recommendation**: 
  1. Fix list marker spacing:
     - Change `1.  **Item**` to `1. **Item**` (2 spaces → 1 space)
     - Change `*   Item` to `* Item` (3 spaces → 1 space)
  2. Add blank lines before/after all lists
  3. Add blank lines before/after all headings (### level)
  4. Run `markdownlint --fix agent/codebase-analyzer.md` to auto-fix
- **Done When**: 
  - `markdownlint agent/codebase-analyzer.md` exits with code 0
  - All MD030, MD032, MD022 violations resolved
  - Manual review confirms formatting is consistent

### QA-004: Add Explanatory Comments to Disabled Tools
- **Priority**: Low
- **Category**: Code Style
- **File(s)**: `agent/codebase-analyzer.md:6-12`
- **Issue**: Only 1 of 6 disabled tools has explanatory comment (maintainability)
- **Evidence**: 
  ```yaml
  bash: false      # No comment
  edit: false      # No comment
  write: false     # No comment
  glob: false      # No comment
  grep: false      # No comment
  webfetch: false  # use Sub-Agent 'web-search-researcher' instead
  ```
- **Recommendation**: 
  Add inline comments explaining why each tool is disabled:
  ```yaml
  bash: false      # analysis only, no command execution
  edit: false      # read-only tracer (no code modifications)
  write: false     # reports returned via chat, not written to files
  glob: false      # receives file paths from Orchestrator
  grep: false      # receives file paths from Orchestrator (no search)
  ```
- **Done When**: 
  - All disabled tools have inline comments
  - Comments explain rationale or reference delegation pattern
  - yamllint passes with proper comment spacing

### QA-005: Add Sequential-Thinking Usage Guidance
- **Priority**: Low
- **Category**: Functional Validation
- **File(s)**: `agent/codebase-analyzer.md:36-37`
- **Issue**: Agent has `sequential-thinking: true` but no clear trigger condition for when to use it
- **Evidence**: 
  ```markdown
  ### 1. Analysis Protocol
  Use `sequential-thinking` to parse complex logic.
  1.  **Receive Target**: The Orchestrator will give you a file...
  ```
- **Recommendation**: 
  Expand line 36 with specific threshold:
  ```markdown
  ### 1. Analysis Protocol

  Use `sequential-thinking` for complex analysis scenarios:
  - Functions >50 lines with multiple execution paths
  - Recursive call chains or mutual recursion
  - Data transformations spanning 3+ function calls
  - State mutations with non-obvious side effects
  ```
- **Done When**: 
  - Usage guidance includes 3+ specific trigger conditions
  - Conditions are observable (line counts, call depth, etc.)
  - Agent demonstrates appropriate sequential-thinking invocation in test

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
- [ ] QA-001: Add default-to-action directive
- [ ] QA-002: Add explicit model field
- [ ] QA-003: Fix Markdown formatting (39 violations)
- [ ] QA-004: Add comments to disabled tools
- [ ] QA-005: Add sequential-thinking usage guidance

## References
- **yamllint output**: 10 errors (line length, comment spacing, false positive on line 28)
- **markdownlint output**: 39 warnings (MD013, MD030, MD032, MD022)
- **OpenCode skill**: opencode-agent-dev (loaded 2026-01-17)
- **Files analyzed**: agent/codebase-analyzer.md
- **Subagents used**: None (direct analysis)
- **Related agents reviewed**: codebase-locator.md, task-executor.md (for pattern comparison)
