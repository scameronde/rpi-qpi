# OpenCode QA Analysis: Codebase-Locator Agent

## Scan Metadata
- Date: 2026-01-18
- Target: agent/codebase-locator.md
- Auditor: opencode-qa-thorough
- Tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill

## Executive Summary
- **Overall Status**: Conditional Pass
- **Critical Issues**: 1 (YAML syntax error - false positive likely)
- **High Priority**: 3 (Missing default-to-action directive, unused tool permissions, incomplete tool usage instructions)
- **Improvement Opportunities**: 3 (Line length violations, markdown formatting, list marker spacing)

## Automated Tool Findings

### 📋 YAML Validation (yamllint)
- **Status**: FAILED
- **Errors**: 1 critical syntax error (likely false positive), 27 line-length warnings, 1 trailing space

#### Issues

1. **agent/codebase-locator.md:28:1** - YAML syntax error
   - Error: `syntax error: expected '<document start>', but found '<scalar>'`
   - **Analysis**: This appears to be a false positive - line 28 is in the Markdown body (after the `---` delimiter), not in YAML frontmatter. The yamllint tool may be incorrectly parsing the document boundary.
   - **Recommendation**: Verify YAML frontmatter ends at line 20 (first `---` delimiter). If so, ignore this error.

2. **agent/codebase-locator.md:81:46** - Trailing spaces
   - Location: Line 81 in "Allowed Tools" section
   - Expected: 0 or 2 spaces; Actual: 1 space

3. **Multiple line-length violations** (27 instances)
   - Lines exceed 80-character limit
   - Range: 81-205 characters actual
   - Most violations in documentation sections (not code blocks)

### 📝 Markdown Linting (markdownlint)
- **Status**: FAILED
- **Warnings**: 61 issues

#### Issues

**MD013 (line-length)**: Line length violations - 19 instances
- Lines 24, 28-30, 36, 47, 52, 64, 75, 82-83, 115, 119, 149-150, 155, 181, 276, 280, 289, 316-318 exceed 80 characters
- Range: 81-171 characters actual

**MD031 (blanks-around-fences)**: Fenced code blocks missing blank lines - 6 violations
- Lines 44, 55, 66, 96, 104, 109, 169, 186, 197, 208 (code blocks should be surrounded by blank lines)

**MD032 (blanks-around-lists)**: Lists not surrounded by blank lines - 4 violations
- Lines 80, 86, 162, 288 (lists should have blank lines before/after)

**MD022 (blanks-around-headings)**: Headings missing blank lines - 4 violations
- Lines 79, 85, 94, 100, 114 (headings should have blank lines below)

**MD030 (list-marker-space)**: Incorrect list marker spacing - 6 violations
- Lines 28, 29, 30, 316, 317, 318 (expected 1 space after marker, actual 2 spaces)

**MD040 (fenced-code-language)**: Fenced code block missing language - 3 violations
- Lines 44, 55, 66 (code blocks should specify language)

**MD033 (no-inline-html)**: Inline HTML detected - 2 violations
- Lines 159, 179 (`<thinking>` and `<answer>` tags used in examples)
- **Note**: These are intentional for output format demonstration, not a real issue

**MD024 (no-duplicate-heading)**: Duplicate heading - 1 violation
- Line 179 ("Section" heading appears multiple times)

**MD007 (ul-indent)**: Incorrect unordered list indentation - 1 violation
- Line 82 (expected 2 spaces, actual 4 spaces)

**MD009 (no-trailing-spaces)**: Trailing spaces - 1 violation
- Line 81:46 (expected 0 or 2, actual 1)

### 🏷️ Naming Conventions
- **Status**: PASSED
- **Violations**: 0

#### Analysis
- **Filename**: `codebase-locator.md` ✅ (kebab-case)
- **Agent mode**: `subagent` ✅ (appropriate for specialist helper)

## Manual Quality Analysis

### 📖 Agent Clarity Issues

#### 1. Unclear Scope Parameter Parsing Logic
- **Issue**: Documentation states "Include `search_scope: [value]` anywhere in your task prompt" but doesn't specify exact parsing rules
- **Evidence**: `agent/codebase-locator.md:75`
- **Excerpt**:
  ```markdown
  **How to Specify:** Include `search_scope: [value]` anywhere in your task prompt. 
  The locator will parse it and return only the requested sections.
  ```
- **Impact**: Ambiguous - does agent use regex, exact match, case-sensitive? What if user types "Search Scope: tests_only" vs "search_scope: tests_only"?
- **Recommendation**: Add parsing specification (e.g., "Case-insensitive match of `search_scope:` or `search scope:` followed by scope value")

#### 2. Ambiguous Read Tool Usage Constraint
- **Issue**: Instructions say "Use ONLY when there are multiple files in Primary Implementation section and entry point is ambiguous" but don't define "ambiguous"
- **Evidence**: `agent/codebase-locator.md:83-84`
- **Excerpt**:
  ```markdown
  - **read**: Use ONLY when there are multiple files in Primary Implementation 
    section and entry point is ambiguous. Read the first 50 lines to count exports 
    and determine which file is the main entry point.
  ```
- **Impact**: Agent may over-use or under-use read tool depending on interpretation of "ambiguous"
- **Recommendation**: Define ambiguity criteria: "Ambiguous = multiple files with similar names (e.g., AuthService.ts and AuthController.ts) or when file naming doesn't indicate hierarchy (e.g., all files named index.ts)"

### 🔧 Configuration Correctness Issues

#### 1. Missing Model Field (Implicit Default)
- **Issue**: Agent frontmatter does not specify `model:` field
- **Evidence**: `agent/codebase-locator.md:1-20` (entire frontmatter)
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
- **Impact**: Agent will use system default model (likely Claude Sonnet-4.5), but this is not explicit in configuration
- **Recommendation**: Add `model: anthropic/claude-sonnet-4-20250514` (or current default) for explicit configuration and future-proofing
- **Priority**: Low (implicit default works, but explicit is better for documentation)

#### 2. Temperature Appropriateness
- **Issue**: Temperature set to 0.1 (highly deterministic)
- **Evidence**: `agent/codebase-locator.md:4`
- **Excerpt**:
  ```yaml
  temperature: 0.1
  ```
- **Analysis**: 0.1 is appropriate for this agent's task (file path discovery is deterministic, no creativity needed)
- **Status**: ✅ CORRECT (matches opencode-agent-dev skill guidelines for analysis tasks)

### 🎯 Functional Validation Issues

#### 1. Missing Default-to-Action Directive (High Priority)
- **Issue**: Agent uses Claude Sonnet-4.5 (implicit default) but lacks `<default_to_action>` directive in system prompt
- **Evidence**: `agent/codebase-locator.md:1-319` (full file scan - no default_to_action found)
- **Excerpt**: (No excerpt - directive is absent)
- **Impact**: Per Critical Finding #2 from opencode-agent-dev skill, Claude Sonnet-4.5 may suggest search strategies instead of executing them without explicit tool usage directive
- **Recommendation**: Add default-to-action directive after role definition (around line 26):
  ```xml
  <default_to_action>
  By default, execute file searches and return coordinates rather than only 
  suggesting search strategies. If file paths are ambiguous, use glob and bash 
  tools to discover the correct locations instead of asking for clarification.
  </default_to_action>
  ```
- **Reference**: `.opencode/skills/opencode/references/critical-findings.md:53-72` (Finding #2)
- **Priority**: High (affects core behavior with Claude Sonnet-4.5)

#### 2. Unused Tool Permissions: webfetch and searxng-search
- **Issue**: Agent has `webfetch: true` and `searxng-search: true` but no instructions reference external data sources
- **Evidence**: `agent/codebase-locator.md:16-17` (permissions) vs full system prompt (no web usage)
- **Excerpt (Permissions)**:
  ```yaml
  webfetch: true
  searxng-search: true
  ```
- **Excerpt (Usage)**:
  ```markdown
  # (No references to webfetch or searxng-search in system prompt)
  ```
- **Impact**: Unnecessary permissions increase attack surface and may confuse agent about its boundaries
- **Recommendation**: Remove webfetch and searxng-search permissions OR add usage instructions if there's a valid use case (e.g., fetching remote dependency manifests)
- **Priority**: Medium (cleanup issue, not blocking)

#### 3. Unused Tool Permissions: context7
- **Issue**: Agent has `context7: true` but no instructions reference context management
- **Evidence**: `agent/codebase-locator.md:19` (permission) vs full system prompt (no context7 usage)
- **Excerpt**:
  ```yaml
  context7: true
  ```
- **Impact**: Unclear why this permission exists - may be legacy or placeholder
- **Recommendation**: Remove context7 permission OR add documentation explaining its purpose
- **Priority**: Low (unclear if actually unused or silently leveraged by OpenCode framework)

#### 4. Incomplete Bash Tool Usage Instructions
- **Issue**: Instructions mention using bash for `find`, `tree`, `ls`, and `grep -l` but don't specify safety constraints
- **Evidence**: `agent/codebase-locator.md:81-83`
- **Excerpt**:
  ```markdown
  - **bash**: Use for `find`, `tree`, and `ls`. 
      - *Constraint:* When using `grep`, you MUST use the `-l` flag 
        (list filenames only). Never output code snippets.
  ```
- **Impact**: Missing guidance on:
  - Excluding `node_modules`, `.git`, `dist`, `build` (mentioned in "Response Protocol" at line 316 but not in tool usage)
  - Maximum depth limits for `find` or `tree`
  - Timeout considerations for large codebases
- **Recommendation**: Move exclusion list from "Response Protocol" (line 316) to "Allowed Tools" section (line 81) for visibility
- **Priority**: Medium (correctness issue - may cause slow/noisy searches)

#### 5. TodoWrite Usage Instruction Without Clear Benefit
- **Issue**: Workflow says "Use `todowrite` to track your search radius" but doesn't explain why or provide examples
- **Evidence**: `agent/codebase-locator.md:92`
- **Excerpt**:
  ```markdown
  ## Workflow
  
  Use `todowrite` to track your search radius.
  ```
- **Impact**: Vague instruction may be ignored by agent or used inconsistently
- **Recommendation**: Either:
  1. Remove this line if todo tracking isn't essential for locator (simple task)
  2. OR expand with example:
     ```markdown
     Use `todowrite` to track your search strategy (optional):
     - [ ] Broad survey (tree/ls)
     - [ ] Targeted search (glob/find)
     - [ ] Entry point verification (read)
     ```
- **Priority**: Low (non-essential feature)

#### 6. Tool Permission Alignment (Minor)
- **Issue**: Agent has `grep: true` permission but instructions say to use bash for grep
- **Evidence**: `agent/codebase-locator.md:11` (permission) vs `agent/codebase-locator.md:81-83` (instruction)
- **Excerpt (Permission)**:
  ```yaml
  grep: true
  ```
- **Excerpt (Instruction)**:
  ```markdown
  - **bash**: Use for `find`, `tree`, and `ls`. 
      - *Constraint:* When using `grep`, you MUST use the `-l` flag...
  ```
- **Analysis**: Having both `grep: true` and bash-based grep is acceptable (grep tool may be structured, bash grep is flexible), but could be confusing
- **Recommendation**: Add comment to clarify:
  ```yaml
  grep: true  # For structured searches
  bash: true  # For grep -l (filename-only mode) and find/tree/ls
  ```
- **Priority**: Low (documentation clarity)

## Improvement Plan (For Implementor)

### QA-001: Add Default-to-Action Directive for Claude Sonnet-4.5
- **Priority**: High
- **Category**: Functional Validation
- **File(s)**: `agent/codebase-locator.md:22-26`
- **Issue**: Agent lacks `<default_to_action>` directive, may suggest strategies instead of executing searches (Critical Finding #2)
- **Evidence**: 
  ```markdown
  # Codebase Locator: The Cartographer
  
  You are the **Cartographer**. Your sole purpose is to provide the 
  **coordinates (file paths)** of code artifacts and the **topology 
  (directory structure)** of the project.
  ```
  (No default_to_action directive present)
- **Recommendation**: 
  1. Insert after line 24 (after role definition, before "Prime Directive"):
     ```xml
     <default_to_action>
     By default, execute file searches and return coordinates rather than only 
     suggesting search strategies. If file paths are ambiguous, use glob and bash 
     tools to discover the correct locations instead of asking for clarification.
     </default_to_action>
     ```
  2. Reference: `.opencode/skills/opencode/references/critical-findings.md:66-71`
- **Done When**: 
  - `<default_to_action>` block exists between role definition (line 24) and Prime Directive (line 26)
  - Agent test run executes glob/bash commands instead of suggesting search strategies

### QA-002: Remove Unused Tool Permissions (webfetch, searxng-search, context7)
- **Priority**: Medium
- **Category**: Configuration Correctness
- **File(s)**: `agent/codebase-locator.md:16-19`
- **Issue**: Three tool permissions (webfetch, searxng-search, context7) are enabled but never referenced in system prompt
- **Evidence**: 
  ```yaml
  webfetch: true
  searxng-search: true
  sequential-thinking: true
  context7: true
  ```
  (System prompt contains zero references to these tools)
- **Recommendation**: 
  1. Remove lines 16, 17, 19 (webfetch, searxng-search, context7)
  2. Keep sequential-thinking (useful for complex search strategies)
  3. OR if there's a valid use case, add usage instructions (e.g., "Use webfetch to retrieve remote package.json for dependency analysis")
- **Done When**: 
  - Frontmatter contains only tools referenced in system prompt
  - OR usage instructions exist for each enabled tool
  - Agent test run does not attempt to use removed tools

### QA-003: Consolidate Exclusion Rules in Tool Usage Section
- **Priority**: Medium
- **Category**: Functional Validation
- **File(s)**: `agent/codebase-locator.md:81-83` and `316-318`
- **Issue**: Critical exclusion rules (node_modules, .git, dist, build) are buried in "Response Protocol" section (line 316) instead of "Allowed Tools" section (line 81)
- **Evidence (Current)**:
  ```markdown
  ### 1. Allowed Tools
  - **bash**: Use for `find`, `tree`, and `ls`. 
      - *Constraint:* When using `grep`, you MUST use the `-l` flag...
  ```
  (300 lines later...)
  ```markdown
  ## Response Protocol
  
  1.  **Check Ignore Lists**: Always exclude `node_modules`, `.git`, `dist`, 
      `build` from your commands.
  ```
- **Recommendation**: 
  1. Move exclusion rules to line 82 (in bash tool constraints):
     ```markdown
     - **bash**: Use for `find`, `tree`, and `ls`.
         - *Constraint:* Always exclude `node_modules`, `.git`, `dist`, `build` 
           from commands (use `--exclude` or `--ignore` flags).
         - *Constraint:* When using `grep`, MUST use `-l` flag (list filenames 
           only). Never output code snippets.
     ```
  2. Remove or shorten line 316 to reference tool section: "See Allowed Tools for exclusion rules."
- **Done When**: 
  - Exclusion rules appear in "Allowed Tools" section (lines 79-84)
  - "Response Protocol" section references tool constraints instead of repeating them
  - Agent test run respects exclusion rules in all bash commands

### QA-004: Clarify Scope Parameter Parsing Rules
- **Priority**: Medium
- **Category**: Agent Clarity
- **File(s)**: `agent/codebase-locator.md:75-76`
- **Issue**: Documentation says "Include `search_scope: [value]` anywhere in your task prompt" without specifying exact parsing logic (case sensitivity, format variants)
- **Evidence**: 
  ```markdown
  **How to Specify:** Include `search_scope: [value]` anywhere in your task 
  prompt. The locator will parse it and return only the requested sections.
  ```
- **Recommendation**: 
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
- **Done When**: 
  - Documentation specifies exact parsing rules (case sensitivity, delimiter flexibility)
  - Implementation logic section (line 262) includes regex pattern
  - Agent test run handles "Search Scope: TESTS_ONLY" and "search_scope:tests_only" identically

### QA-005: Define "Ambiguous Entry Point" Criteria for Read Tool Usage
- **Priority**: Low
- **Category**: Agent Clarity
- **File(s)**: `agent/codebase-locator.md:83-84`
- **Issue**: Read tool usage instruction says "entry point is ambiguous" without defining ambiguity criteria
- **Evidence**: 
  ```markdown
  - **read**: Use ONLY when there are multiple files in Primary Implementation 
    section and entry point is ambiguous. Read the first 50 lines to count 
    exports and determine which file is the main entry point.
  ```
- **Recommendation**: 
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
- **Done When**: 
  - Documentation provides 3+ concrete examples of "ambiguous"
  - Agent test run uses read tool for AuthService.ts + AuthController.ts scenario
  - Agent test run skips read tool when only one file exists

### QA-006: Add Explicit Model Field to Frontmatter
- **Priority**: Low
- **Category**: Configuration Correctness
- **File(s)**: `agent/codebase-locator.md:1-5`
- **Issue**: Frontmatter lacks `model:` field (relies on implicit system default)
- **Evidence**: 
  ```yaml
  ---
  description: "Specialist in file system topology..."
  mode: subagent
  temperature: 0.1
  tools:
  ```
  (No `model:` field present)
- **Recommendation**: 
  1. Add line 5 (after temperature, before tools):
     ```yaml
     model: anthropic/claude-sonnet-4-20250514
     ```
  2. Verify this matches current system default (check other agents or OpenCode config)
- **Done When**: 
  - `model:` field exists in frontmatter
  - Value matches project's default Claude Sonnet-4.5 model identifier
  - Agent loads successfully with explicit model

### QA-007: Simplify or Remove TodoWrite Usage Instruction
- **Priority**: Low
- **Category**: Agent Clarity
- **File(s)**: `agent/codebase-locator.md:92`
- **Issue**: Instruction "Use `todowrite` to track your search radius" is vague and unexplained
- **Evidence**: 
  ```markdown
  ## Workflow
  
  Use `todowrite` to track your search radius.
  ```
- **Recommendation**: 
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
- **Done When**: 
  - Line 92 is removed OR replaced with concrete todo example
  - Agent test run shows consistent todo usage (if expanded) or no todos (if removed)

### QA-008: Add Tool Permission Comments for Grep/Bash Overlap
- **Priority**: Low
- **Category**: Configuration Correctness
- **File(s)**: `agent/codebase-locator.md:6-11`
- **Issue**: Both `grep: true` and `bash: true` (for grep usage) exist without explaining the distinction
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
- **Recommendation**: 
  1. Add inline comments (lines 6, 11):
     ```yaml
     bash: true   # For find/tree/ls and grep -l (filename-only mode)
     edit: false
     read: true
     write: false
     glob: true
     grep: true   # For structured content searches (returns matches with context)
     ```
- **Done When**: 
  - Comments exist on bash and grep permission lines
  - Comments clearly differentiate bash grep vs grep tool usage

### QA-009: Fix Markdown Formatting Issues (Automated Tool Violations)
- **Priority**: Low
- **Category**: Documentation Quality
- **File(s)**: `agent/codebase-locator.md` (multiple locations)
- **Issue**: 61 markdownlint violations (line length, blank lines, list spacing, fenced code blocks)
- **Evidence**: See "Automated Tool Findings" section above
- **Recommendation**: 
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
- **Done When**: 
  - `markdownlint agent/codebase-locator.md` reports 0 errors (excluding MD033)
  - All lines ≤ 80 characters (except code blocks and URLs)
  - All code blocks have language specifiers

## Acceptance Criteria
- [ ] All high-priority issues resolved (QA-001)
- [ ] Default-to-action directive added and tested
- [ ] Unused tool permissions removed or documented
- [ ] Exclusion rules consolidated in "Allowed Tools" section
- [ ] Scope parameter parsing rules specified
- [ ] Model field explicitly set in frontmatter
- [ ] Markdown formatting passes markdownlint (excluding MD033)

## Implementor Checklist
- [ ] QA-001: Add Default-to-Action Directive for Claude Sonnet-4.5
- [ ] QA-002: Remove Unused Tool Permissions (webfetch, searxng-search, context7)
- [ ] QA-003: Consolidate Exclusion Rules in Tool Usage Section
- [ ] QA-004: Clarify Scope Parameter Parsing Rules
- [ ] QA-005: Define "Ambiguous Entry Point" Criteria for Read Tool Usage
- [ ] QA-006: Add Explicit Model Field to Frontmatter
- [ ] QA-007: Simplify or Remove TodoWrite Usage Instruction
- [ ] QA-008: Add Tool Permission Comments for Grep/Bash Overlap
- [ ] QA-009: Fix Markdown Formatting Issues (Automated Tool Violations)

## References
- yamllint output: 1 critical error (likely false positive), 27 line-length warnings, 1 trailing space
- markdownlint output: 61 issues (19 line-length, 6 blanks-around-fences, 6 list-marker-space, 4 blanks-around-lists, 4 blanks-around-headings, 3 fenced-code-language, 2 inline-html, 1 duplicate-heading, 1 ul-indent, 1 trailing-spaces)
- OpenCode skill: opencode-agent-dev (version 1.0)
- Files analyzed: agent/codebase-locator.md (319 lines)
- Subagents used: None (direct analysis)
- Git history: 2 commits (217d65a, af05072)
