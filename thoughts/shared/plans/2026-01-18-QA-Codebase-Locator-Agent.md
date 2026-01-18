# QA-Driven Implementation Plan: Codebase-Locator Agent

## Inputs
- QA report: `thoughts/shared/qa/2026-01-18-Codebase-Locator-Agent.md`
- Audit date: 2026-01-18
- Automated tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill
- Auditor: opencode-qa-thorough

## Verified Current State

### Functional Validation Issues
- **Fact**: Agent lacks `<default_to_action>` directive for Claude Sonnet-4.5
- **Evidence**: `agent/codebase-locator.md:1-319` (full file scan - no default_to_action found)
- **Excerpt**:
  ```markdown
  # Codebase Locator: The Cartographer
  
  You are the **Cartographer**. Your sole purpose is to provide the 
  **coordinates (file paths)** of code artifacts and the **topology 
  (directory structure)** of the project.
  ```
  (No default_to_action directive present)
- **Impact**: Per Critical Finding #2 from opencode-agent-dev skill, Claude Sonnet-4.5 may suggest search strategies instead of executing them without explicit tool usage directive

---

- **Fact**: Agent has unused tool permissions (webfetch, searxng-search, context7)
- **Evidence**: `agent/codebase-locator.md:16-19` (permissions) vs full system prompt (no web usage)
- **Excerpt (Permissions)**:
  ```yaml
  webfetch: true
  searxng-search: true
  sequential-thinking: true
  context7: true
  ```
- **Excerpt (Usage)**: (No references to webfetch, searxng-search, or context7 in system prompt)
- **Impact**: Unnecessary permissions increase attack surface and may confuse agent about its boundaries

---

- **Fact**: Critical exclusion rules (node_modules, .git, dist, build) are buried in "Response Protocol" section instead of "Allowed Tools" section
- **Evidence**: `agent/codebase-locator.md:81-83` and `316-318`
- **Excerpt (Current - Allowed Tools)**:
  ```markdown
  ### 1. Allowed Tools
  - **bash**: Use for `find`, `tree`, and `ls`. 
      - *Constraint:* When using `grep`, you MUST use the `-l` flag...
  ```
- **Excerpt (Current - Response Protocol, 300 lines later)**:
  ```markdown
  ## Response Protocol
  
  1.  **Check Ignore Lists**: Always exclude `node_modules`, `.git`, `dist`, 
      `build` from your commands.
  ```
- **Impact**: Agent may miss critical exclusion rules when using bash tools, causing slow/noisy searches

### Readability Issues
- **Fact**: Scope parameter parsing logic is unspecified (case sensitivity, format variants unclear)
- **Evidence**: `agent/codebase-locator.md:75-76`
- **Excerpt**:
  ```markdown
  **How to Specify:** Include `search_scope: [value]` anywhere in your task 
  prompt. The locator will parse it and return only the requested sections.
  ```
- **Impact**: Ambiguous - unclear if agent accepts "Search Scope: tests_only" vs "search_scope: tests_only" or case variations

---

- **Fact**: "Ambiguous entry point" criteria for read tool usage is undefined
- **Evidence**: `agent/codebase-locator.md:83-84`
- **Excerpt**:
  ```markdown
  - **read**: Use ONLY when there are multiple files in Primary Implementation 
    section and entry point is ambiguous. Read the first 50 lines to count 
    exports and determine which file is the main entry point.
  ```
- **Impact**: Agent may over-use or under-use read tool depending on interpretation of "ambiguous"

---

- **Fact**: TodoWrite usage instruction is vague and unexplained
- **Evidence**: `agent/codebase-locator.md:92`
- **Excerpt**:
  ```markdown
  ## Workflow
  
  Use `todowrite` to track your search radius.
  ```
- **Impact**: Vague instruction may be ignored by agent or used inconsistently

### Maintainability Issues
- **Fact**: Agent frontmatter lacks explicit `model:` field (relies on implicit system default)
- **Evidence**: `agent/codebase-locator.md:1-5` (entire frontmatter)
- **Excerpt**:
  ```yaml
  ---
  description: "Specialist in file system topology..."
  mode: subagent
  temperature: 0.1
  tools:
    bash: true
    ...
  ---
  ```
- **Impact**: Agent uses system default model, but this is not explicit in configuration

---

- **Fact**: Both `grep: true` and `bash: true` (for grep usage) exist without explaining the distinction
- **Evidence**: `agent/codebase-locator.md:6-11` (permissions) vs `agent/codebase-locator.md:81-83` (instruction)
- **Excerpt (Permission)**:
  ```yaml
  grep: true
  ```
- **Excerpt (Instruction)**:
  ```markdown
  - **bash**: Use for `find`, `tree`, and `ls`. 
      - *Constraint:* When using `grep`, you MUST use the `-l` flag...
  ```
- **Impact**: Having both grep tool and bash grep without clarification may confuse tool usage strategy

### Documentation Quality Issues
- **Fact**: 61 markdownlint violations (line length, blank lines, list spacing, fenced code blocks)
- **Evidence**: See QA report "Automated Tool Findings" section
- **Breakdown**:
  - MD013 (line-length): 19 violations
  - MD031 (blanks-around-fences): 6 violations
  - MD030 (list-marker-space): 6 violations
  - MD032 (blanks-around-lists): 4 violations
  - MD022 (blanks-around-headings): 4 violations
  - MD040 (fenced-code-language): 3 violations
  - MD033 (inline-html): 2 violations (intentional, can ignore)
  - MD024 (no-duplicate-heading): 1 violation
  - MD007 (ul-indent): 1 violation
  - MD009 (no-trailing-spaces): 1 violation
- **Impact**: Reduced documentation readability and maintainability

## Goals / Non-Goals
- **Goals**: Resolve all issues identified in QA report
  - Critical: 0 issues (YAML syntax error was false positive)
  - High: 1 issue (QA-001)
  - Medium: 3 issues (QA-002, QA-003, QA-004)
  - Low: 5 issues (QA-005, QA-006, QA-007, QA-008, QA-009)
  - **Total**: 9 issues
- **Non-Goals**: Rewriting agent logic, adding new features, changing agent's core purpose

## Design Overview

This plan addresses quality issues across four categories:

1. **Functional Validation**: Add default-to-action directive for Claude Sonnet-4.5, remove unused tool permissions, consolidate exclusion rules
2. **Readability**: Clarify scope parameter parsing rules, define ambiguous entry point criteria, simplify todowrite instruction
3. **Maintainability**: Add explicit model field, add tool permission comments
4. **Documentation Quality**: Fix markdown formatting violations

## Phased Implementation

### Phase 1: Critical Issues (Security + Blocking Type Errors)

No critical issues (YAML syntax error was false positive).

**Phase 1 Verification**: N/A (skip to Phase 2)

### Phase 2: High Priority Issues (Functional Validation)

Execute these items first; they affect core agent behavior with Claude Sonnet-4.5.

#### PLAN-001: Add Default-to-Action Directive for Claude Sonnet-4.5 (was QA-001)
- **Priority**: High
- **Category**: Functional Validation
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:22-26`
- **Instruction**: 
  1. Insert after line 24 (after role definition, before "Prime Directive"):
     ```xml
     <default_to_action>
     By default, execute file searches and return coordinates rather than only 
     suggesting search strategies. If file paths are ambiguous, use glob and bash 
     tools to discover the correct locations instead of asking for clarification.
     </default_to_action>
     ```
  2. Reference: `.opencode/skills/opencode/references/critical-findings.md:66-71`
- **Evidence**: 
  ```markdown
  # Codebase Locator: The Cartographer
  
  You are the **Cartographer**. Your sole purpose is to provide the 
  **coordinates (file paths)** of code artifacts and the **topology 
  (directory structure)** of the project.
  ```
  (No default_to_action directive present)
- **Done When**: 
  - `<default_to_action>` block exists between role definition (line 24) and Prime Directive (line 26)
  - Agent test run executes glob/bash commands instead of suggesting search strategies

**Phase 2 Verification**:
```bash
grep -n "<default_to_action>" agent/codebase-locator.md  # Should show match around line 25
```

### Phase 3: Medium Priority Issues (Configuration + Readability)

Execute after Phase 2 passes verification.

#### PLAN-002: Remove Unused Tool Permissions (webfetch, searxng-search, context7) (was QA-002)
- **Priority**: Medium
- **Category**: Configuration Correctness
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:16-19`
- **Instruction**: 
  1. Remove lines 16, 17, 19 (webfetch, searxng-search, context7)
  2. Keep sequential-thinking (useful for complex search strategies)
  3. OR if there's a valid use case, add usage instructions (e.g., "Use webfetch to retrieve remote package.json for dependency analysis")
- **Evidence**: 
  ```yaml
  webfetch: true
  searxng-search: true
  sequential-thinking: true
  context7: true
  ```
  (System prompt contains zero references to these tools)
- **Done When**: 
  - Frontmatter contains only tools referenced in system prompt
  - OR usage instructions exist for each enabled tool
  - Agent test run does not attempt to use removed tools

#### PLAN-003: Consolidate Exclusion Rules in Tool Usage Section (was QA-003)
- **Priority**: Medium
- **Category**: Functional Validation
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:81-83` and `316-318`
- **Instruction**: 
  1. Move exclusion rules to line 82 (in bash tool constraints):
     ```markdown
     - **bash**: Use for `find`, `tree`, and `ls`.
         - *Constraint:* Always exclude `node_modules`, `.git`, `dist`, `build` 
           from commands (use `--exclude` or `--ignore` flags).
         - *Constraint:* When using `grep`, MUST use `-l` flag (list filenames 
           only). Never output code snippets.
     ```
  2. Remove or shorten line 316 to reference tool section: "See Allowed Tools for exclusion rules."
- **Evidence (Current - Allowed Tools)**: 
  ```markdown
  ### 1. Allowed Tools
  - **bash**: Use for `find`, `tree`, and `ls`. 
      - *Constraint:* When using `grep`, you MUST use the `-l` flag...
  ```
- **Evidence (Current - Response Protocol, 300 lines later)**: 
  ```markdown
  ## Response Protocol
  
  1.  **Check Ignore Lists**: Always exclude `node_modules`, `.git`, `dist`, 
      `build` from your commands.
  ```
- **Done When**: 
  - Exclusion rules appear in "Allowed Tools" section (lines 79-84)
  - "Response Protocol" section references tool constraints instead of repeating them
  - Agent test run respects exclusion rules in all bash commands

#### PLAN-004: Clarify Scope Parameter Parsing Rules (was QA-004)
- **Priority**: Medium
- **Category**: Agent Clarity
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:75-76`
- **Instruction**: 
  1. Replace line 75-76 with:
     ```markdown
     **How to Specify:** Include `search_scope: [value]` or `Search scope: [value]` 
     (case-insensitive) anywhere in your task prompt. The locator will parse it 
     using regex `(?i)search.?scope:\s*(tests_only|paths_only|comprehensive)` and 
     return only the requested sections.
     ```
  2. Add implementation note in line 262:
     ```markdown
     1. Parse the task prompt using regex: `(?i)search.?scope:\s*(\w+)`
     2. Match against valid scopes: tests_only, paths_only, comprehensive
     3. Default to comprehensive if no match or invalid value
     ```
- **Evidence**: 
  ```markdown
  **How to Specify:** Include `search_scope: [value]` anywhere in your task 
  prompt. The locator will parse it and return only the requested sections.
  ```
- **Done When**: 
  - Documentation specifies exact parsing rules (case sensitivity, delimiter flexibility)
  - Implementation logic section (line 262) includes regex pattern
  - Agent test run handles "Search Scope: TESTS_ONLY" and "search_scope:tests_only" identically

**Phase 3 Verification**:
```bash
grep -n "webfetch" agent/codebase-locator.md  # Should show no matches
grep -n "search.?scope" agent/codebase-locator.md  # Should show regex pattern
grep -n "node_modules" agent/codebase-locator.md | head -1  # Should show line in "Allowed Tools" section
```

### Phase 4: Low Priority Issues (Polish + Documentation)

Execute after Phase 3 passes verification. Optional if time-constrained.

#### PLAN-005: Define "Ambiguous Entry Point" Criteria for Read Tool Usage (was QA-005)
- **Priority**: Low
- **Category**: Agent Clarity
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:83-84`
- **Instruction**: 
  1. Expand line 84 with concrete examples:
     ```markdown
     - **read**: Use ONLY when:
       1. Multiple files in Primary Implementation section (2+ files)
       2. AND entry point is ambiguous:
          - Similar names (AuthService.ts + AuthController.ts)
          - Generic names (index.ts + main.ts)
          - No naming hierarchy (all files at same depth)
       3. Read first 50 lines to count exports, mark file with most exports as 
          `[entry-point, exports: N]`
     ```
- **Evidence**: 
  ```markdown
  - **read**: Use ONLY when there are multiple files in Primary Implementation 
    section and entry point is ambiguous. Read the first 50 lines to count 
    exports and determine which file is the main entry point.
  ```
- **Done When**: 
  - Documentation provides 3+ concrete examples of "ambiguous"
  - Agent test run uses read tool for AuthService.ts + AuthController.ts scenario
  - Agent test run skips read tool when only one file exists

#### PLAN-006: Add Explicit Model Field to Frontmatter (was QA-006)
- **Priority**: Low
- **Category**: Configuration Correctness
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:1-5`
- **Instruction**: 
  1. Add line 5 (after temperature, before tools):
     ```yaml
     model: anthropic/claude-sonnet-4-20250514
     ```
  2. Verify this matches current system default (check other agents or OpenCode config)
- **Evidence**: 
  ```yaml
  ---
  description: "Specialist in file system topology..."
  mode: subagent
  temperature: 0.1
  tools:
  ```
  (No `model:` field present)
- **Done When**: 
  - `model:` field exists in frontmatter
  - Value matches project's default Claude Sonnet-4.5 model identifier
  - Agent loads successfully with explicit model

#### PLAN-007: Simplify or Remove TodoWrite Usage Instruction (was QA-007)
- **Priority**: Low
- **Category**: Agent Clarity
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:92`
- **Instruction**: 
  Option A (Simplify):
  1. Remove line 92 entirely (codebase-locator is simple, doesn't need todos)
  
  Option B (Expand):
  1. Replace line 92 with:
     ```markdown
     Use `todowrite` to track your search strategy (optional for complex queries):
     - [ ] Broad survey (tree/ls to visualize structure)
     - [ ] Targeted search (glob/find for specific patterns)
     - [ ] Entry point verification (read first 50 lines if ambiguous)
     ```
- **Evidence**: 
  ```markdown
  ## Workflow
  
  Use `todowrite` to track your search radius.
  ```
- **Done When**: 
  - Line 92 is removed OR replaced with concrete todo example
  - Agent test run shows consistent todo usage (if expanded) or no todos (if removed)

#### PLAN-008: Add Tool Permission Comments for Grep/Bash Overlap (was QA-008)
- **Priority**: Low
- **Category**: Configuration Correctness
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md:6-11`
- **Instruction**: 
  1. Add inline comments (lines 6, 11):
     ```yaml
     bash: true   # For find/tree/ls and grep -l (filename-only mode)
     edit: false
     read: true
     write: false
     glob: true
     grep: true   # For structured content searches (returns matches with context)
     ```
- **Evidence**: 
  ```yaml
  bash: true
  edit: false
  read: true
  write: false
  glob: true
  grep: true
  ```
  (No comments explaining why grep appears twice)
- **Done When**: 
  - Comments exist on bash and grep permission lines
  - Comments clearly differentiate bash grep vs grep tool usage

#### PLAN-009: Fix Markdown Formatting Issues (Automated Tool Violations) (was QA-009)
- **Priority**: Low
- **Category**: Documentation Quality
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md` (multiple locations)
- **Instruction**: 
  1. Run `markdownlint --fix agent/codebase-locator.md` to auto-fix:
     - MD031 (blanks-around-fences): Add blank lines before/after code blocks
     - MD032 (blanks-around-lists): Add blank lines before/after lists
     - MD022 (blanks-around-headings): Add blank lines below headings
     - MD030 (list-marker-space): Fix double-space after list markers (lines 28-30, 316-318)
     - MD009 (no-trailing-spaces): Remove trailing space on line 81
  2. Manually fix remaining issues:
     - MD013 (line-length): Wrap long lines to 80 characters (19 instances)
     - MD040 (fenced-code-language): Add language specifiers to code blocks (lines 44, 55, 66)
     - MD024 (no-duplicate-heading): Rename duplicate "Section" headings
  3. Ignore MD033 (inline HTML) - `<thinking>` and `<answer>` tags are intentional
- **Evidence**: See "Automated Tool Findings" section in QA report
- **Done When**: 
  - `markdownlint agent/codebase-locator.md` reports 0 errors (excluding MD033)
  - All lines ≤ 80 characters (except code blocks and URLs)
  - All code blocks have language specifiers

**Phase 4 Verification**:
```bash
markdownlint agent/codebase-locator.md  # Should pass (excluding MD033)
yamllint agent/codebase-locator.md  # Should show 0 syntax errors
grep -n "model:" agent/codebase-locator.md  # Should show explicit model field
```

## Baseline Verification

Before starting Phase 2, run these commands to establish a baseline:

```bash
yamllint agent/codebase-locator.md
markdownlint agent/codebase-locator.md
grep -n "<default_to_action>" agent/codebase-locator.md  # Should show no matches initially
```

Record the current error/warning counts. Each phase should reduce these counts.

## Acceptance Criteria

- [ ] All high-priority issues resolved (QA-001)
- [ ] Default-to-action directive added and tested
- [ ] Unused tool permissions removed or documented
- [ ] Exclusion rules consolidated in "Allowed Tools" section
- [ ] Scope parameter parsing rules specified
- [ ] Model field explicitly set in frontmatter
- [ ] Markdown formatting passes markdownlint (excluding MD033)

## Implementor Checklist

### Phase 2 (High)
- [ ] PLAN-001: Add Default-to-Action Directive for Claude Sonnet-4.5 (was QA-001)

### Phase 3 (Medium)
- [ ] PLAN-002: Remove Unused Tool Permissions (webfetch, searxng-search, context7) (was QA-002)
- [ ] PLAN-003: Consolidate Exclusion Rules in Tool Usage Section (was QA-003)
- [ ] PLAN-004: Clarify Scope Parameter Parsing Rules (was QA-004)

### Phase 4 (Low)
- [ ] PLAN-005: Define "Ambiguous Entry Point" Criteria for Read Tool Usage (was QA-005)
- [ ] PLAN-006: Add Explicit Model Field to Frontmatter (was QA-006)
- [ ] PLAN-007: Simplify or Remove TodoWrite Usage Instruction (was QA-007)
- [ ] PLAN-008: Add Tool Permission Comments for Grep/Bash Overlap (was QA-008)
- [ ] PLAN-009: Fix Markdown Formatting Issues (Automated Tool Violations) (was QA-009)

## References
- Source QA report: `thoughts/shared/qa/2026-01-18-Codebase-Locator-Agent.md`
- Automated tools: yamllint, markdownlint
- Manual analysis: opencode-agent-dev skill
- Critical Finding Reference: `.opencode/skills/opencode/references/critical-findings.md:53-72` (Finding #2)
