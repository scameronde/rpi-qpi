# OpenCode QA Analysis: Codebase-Pattern-Finder Agent

## Scan Metadata
- Date: 2026-01-18
- Target: `agent/codebase-pattern-finder.md`
- Auditor: opencode-qa-thorough
- Tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill
- OpenCode Skill Version: 1.0 (opencode-agent-dev)

## Executive Summary
- **Overall Status**: Conditional Pass
- **Critical Issues**: 1
- **High Priority**: 2
- **Medium Priority**: 3
- **Low Priority**: Multiple formatting issues

**Key Finding**: Agent is missing required `<default_to_action>` directive for Claude Sonnet-4.5, which may cause the agent to suggest patterns rather than extracting them. Configuration and functionality are otherwise sound.

## Automated Tool Findings

### 📋 YAML Validation (yamllint)
- **Status**: FAILED
- **Errors**: 20

#### Issues
All yamllint errors are related to line-length violations (80 character limit) and formatting, not YAML schema errors:
- Lines 2, 24, 28, 31, 35, 46, 47, 74, 80-82, 85, 87, 90, 126, 159-162: Line length violations
- Line 28: Syntax error due to numbered list formatting (false positive - valid in Markdown section)
- Line 136: Trailing spaces

**Assessment**: These are style violations, not structural YAML errors. The frontmatter (lines 1-20) is valid YAML.

### 📝 Markdown Linting (markdownlint)
- **Status**: FAILED
- **Warnings**: 42

#### Issues
All markdownlint errors are formatting/style issues:
- **MD013 (line-length)**: 11 violations - Lines exceed 80 characters
- **MD030 (list-marker-space)**: 9 violations - Inconsistent spacing after list markers (2-3 spaces instead of 1)
- **MD032 (blanks-around-lists)**: 5 violations - Missing blank lines around lists
- **MD022 (blanks-around-headings)**: 4 violations - Missing blank lines around headings
- **MD031 (blanks-around-fences)**: 4 violations - Missing blank lines around code blocks
- **MD040 (fenced-code-language)**: 1 violation - Code block at line 155 missing language specifier

**Assessment**: These are stylistic issues that don't affect functionality but reduce readability.

### 🏷️ Naming Conventions
- **Status**: PASSED
- **Violations**: 0

#### Analysis
- **Filename**: `codebase-pattern-finder.md` ✓ (kebab-case, matches convention)
- **Agent Name**: "Pattern Librarian" (display name in system prompt)
- **Mode**: `subagent` ✓ (correct for specialized worker agent)

## Manual Quality Analysis

### 📖 Agent Clarity Issues

#### Issue 1: Inconsistent List Formatting Reduces Readability
- **Evidence**: `agent/codebase-pattern-finder.md:29-31`
- **Excerpt:** 
  ```markdown
  1.  You do NOT refactor or improve code.
  2.  You do NOT offer opinions on "best practices" unless explicitly asked to compare legacy vs. modern.
  3.  **Goal**: Provide the Orchestrator with copy-pasteable snippets that prove *how* the code currently works.
  ```
- **Impact**: Numbered lists use 2 spaces after markers instead of standard 1 space; reduces consistency with other agents
- **Category**: Clarity (Minor)

#### Issue 2: Tool Permission Comments Could Be More Specific
- **Evidence**: `agent/codebase-pattern-finder.md:7-8`
- **Excerpt:** 
  ```yaml
  tools:
    bash: true
    edit: false
  ```
- **Impact**: Missing explanatory comments for disabled tools (unlike codebase-analyzer which documents rationale)
- **Comparison**: `codebase-analyzer.md:6-7` shows best practice:
  ```yaml
  bash: false  # analysis only, no command execution
  edit: false  # read-only tracer (no code modifications)
  ```

### 🔧 Configuration Correctness Issues

#### Issue 3: Temperature Setting Appropriate for Task Type
- **Evidence**: `agent/codebase-pattern-finder.md:4`
- **Excerpt:** 
  ```yaml
  temperature: 0.1
  ```
- **Analysis**: ✓ Correct - Agent performs deterministic search/extraction tasks requiring focused, precise responses
- **Reference**: Critical Findings states research/planning = 0.1

#### Issue 4: Agent Mode Correctly Set to Subagent
- **Evidence**: `agent/codebase-pattern-finder.md:3`
- **Excerpt:** 
  ```yaml
  mode: subagent
  ```
- **Analysis**: ✓ Correct - Agent is designed to be invoked by Orchestrator agents (Researcher, Planner)
- **Invocation Context**: Documented in `AGENTS.md` under "When to Use Each Codebase Subagent"

#### Issue 5: Tool Permissions Align with Agent Responsibility
- **Evidence**: `agent/codebase-pattern-finder.md:5-19`
- **Excerpt:** 
  ```yaml
  tools:
    bash: true       # for grep commands
    edit: false      # read-only agent
    read: true       # CRITICAL for extracting code excerpts
    write: false     # returns via chat, not files
    glob: true       # for file type discovery
    grep: true       # for keyword search
    list: true
    patch: false
    todoread: true   # for planning workflow
    todowrite: true  # for search plan creation
    webfetch: true   # potentially for external docs
    searxng-search: true  # potentially for external docs
    sequential-thinking: true
    context7: true
  ```
- **Analysis**: ✓ Permissions match documented workflow (search + extract + plan)
- **Note**: `webfetch` and `searxng-search` enabled but not referenced in system prompt - potentially unnecessary

### 🎯 Functional Validation Issues

#### **CRITICAL ISSUE**: Missing Default-to-Action Directive
- **Issue**: Agent uses Claude Sonnet-4.5 (implied by project default) but lacks explicit tool usage directive
- **Evidence**: `agent/codebase-pattern-finder.md:1-50` (system prompt section)
- **Excerpt (Missing Directive):**
  ```markdown
  # Pattern Librarian: Code Examples & Conventions
  
  You are the **Pattern Librarian**, a specialized worker agent responsible for finding concrete implementation examples within the codebase.
  
  [No <default_to_action> block present]
  ```
- **Comparison**: `codebase-analyzer.md:26-30` shows required pattern:
  ```markdown
  <default_to_action>
  By default, produce the structured analysis report rather than only suggesting
  analysis steps. If file paths are ambiguous, use the list tool to discover the
  correct location instead of asking for clarification.
  </default_to_action>
  ```
- **Impact**: 
  - Agent may suggest search strategies instead of executing them
  - Violates Critical Finding #2 from opencode-agent-dev skill
  - Inconsistent with sibling agent (codebase-analyzer)
- **Severity**: Critical

#### Issue 6: Observable Acceptance Criteria (Verification)
- **Evidence**: `agent/codebase-pattern-finder.md:159-162`
- **Excerpt:** 
  ```markdown
  ## Important Rules
  
  1.  **Read Before Posting**: Never output code you haven't `read` from the file. Grep snippets are often incomplete.
  2.  **Context**: Always include imports or class wrappers in your snippets so the Orchestrator sees the full context.
  3.  **Tests**: If possible, find a test file that *tests* the pattern. This is the ultimate documentation of expected behavior.
  4.  **No Hallucinations**: If you find no examples, state "No examples found matching [criteria]." Do not invent code.
  ```
- **Analysis**: ✓ Rules provide clear, testable guidance for agent behavior
- **Strength**: Rule #1 ("Read Before Posting") prevents grep-only output (a common error pattern)

#### Issue 7: Output Format Completeness
- **Evidence**: `agent/codebase-pattern-finder.md:76-91`
- **Excerpt:** 
  ```markdown
  ### Required Metadata Fields
  
  Include these fields in YAML frontmatter at the start of your response:
  
  - **`message_id`**: Auto-generated identifier in format `pattern-YYYY-MM-DD-NNN` (e.g., `pattern-2026-01-18-001`)
  - **`correlation_id`**: Correlation ID passed from caller, or `"none"` if not provided
  - **`timestamp`**: Current time in ISO 8601 format (e.g., `2026-01-18T12:00:00Z`)
  - **`message_type`**: Always set to `"PATTERN_RESPONSE"`
  - **`finder_version`**: Version of this agent, currently `"1.1"`
  - **`query_topic`**: Short topic extracted from user query (e.g., `"pagination"`, `"authentication"`)
  - **`patterns_found`**: Count of distinct pattern concepts discovered (integer)
  - **`variations_total`**: Count of implementation variations across all patterns (integer)
  - **`files_matched`**: Count of files containing matching code (integer)
  - **`files_scanned`**: Count of total files searched (integer)
  - **`search_keywords`**: Array of search terms/patterns used (e.g., `["usePagination", "Paginator", "page="]`)
  ```
- **Analysis**: ✓ Complete structured metadata specification
- **Strength**: Aligns with AGENTS.md documentation (section "Codebase-Pattern-Finder Output Format and Usage")

#### Issue 8: Workflow Planning Requirement
- **Evidence**: `agent/codebase-pattern-finder.md:37-41`
- **Excerpt:** 
  ```markdown
  ### 1. Plan (Mandatory)
  Before running commands, use `todowrite` to create a search plan:
  -   **Keywords**: What string literals or regex patterns will you look for?
  -   **Scope**: Are you looking in `src/`, `tests/`, or specific modules?
  -   **Variations**: What alternative implementations might exist?
  ```
- **Analysis**: ✓ Enforces structured approach to prevent ad-hoc searches
- **Tool Alignment**: `todoread: true, todowrite: true` permissions support this workflow

### Distribution Analysis vs Codebase-Analyzer Consistency

**Pattern Comparison**: Checking consistency with sibling agent `codebase-analyzer.md`

| Feature | codebase-analyzer | codebase-pattern-finder | Status |
|---------|------------------|------------------------|--------|
| Mode | `subagent` | `subagent` | ✓ Consistent |
| Temperature | `0.1` | `0.1` | ✓ Consistent |
| Default-to-Action | ✓ Present (lines 26-30) | ✗ Missing | ✗ **Inconsistent** |
| YAML Frontmatter Metadata | ✓ Present | ✓ Present | ✓ Consistent |
| Tool Comments | ✓ Extensive | Minimal | △ Minor Inconsistency |
| Output Structure | `<thinking>` + `<answer>` | `<thinking>` + `<answer>` | ✓ Consistent |

**Finding**: Agent is missing critical directive present in sibling agent, creating behavioral inconsistency.

## Improvement Plan (For Implementor)

### QA-001: Add Default-to-Action Directive for Claude Sonnet-4.5
- **Priority**: Critical
- **Category**: Functional Validation
- **File(s)**: `agent/codebase-pattern-finder.md:22-26`
- **Issue**: Agent lacks explicit tool usage directive required by Claude Sonnet-4.5, risking suggestion-only behavior instead of pattern extraction
- **Evidence**: 
  ```markdown
  # Pattern Librarian: Code Examples & Conventions
  
  You are the **Pattern Librarian**, a specialized worker agent responsible for finding concrete implementation examples within the codebase.
  
  ## Prime Directive
  ```
  Missing directive block between role definition (line 24) and Prime Directive (line 26).
- **Recommendation**: 
  1. Add `<default_to_action>` block immediately after line 24 (role definition):
     ```markdown
     You are the **Pattern Librarian**, a specialized worker agent responsible for finding concrete implementation examples within the codebase.
     
     <default_to_action>
     By default, execute the pattern search and return concrete code excerpts rather than 
     only suggesting search strategies. If search scope is ambiguous, use glob to discover 
     relevant directories instead of asking for clarification. Always read files to extract 
     complete code snippets—never rely on grep output alone.
     </default_to_action>
     
     ## Prime Directive
     ```
  2. Reference: Critical Finding #2 (opencode-agent-dev skill)
  3. Pattern follows `codebase-analyzer.md:26-30`
- **Done When**: 
  - `<default_to_action>` block exists between role definition and Prime Directive
  - Block explicitly states "execute" and "return" (action verbs, not "suggest")
  - Agent successfully extracts code snippets in test invocation (no suggestion-only responses)

### QA-002: Add Explanatory Comments to Tool Permission Configuration
- **Priority**: Medium
- **Category**: Configuration Clarity
- **File(s)**: `agent/codebase-pattern-finder.md:5-19`
- **Issue**: Tool permission block lacks explanatory comments for disabled tools, reducing self-documentation
- **Evidence**: 
  ```yaml
  tools:
    bash: true
    edit: false
    read: true
    write: false
  ```
  Compare to `codebase-analyzer.md:6-9`:
  ```yaml
  tools:
    bash: false  # analysis only, no command execution
    edit: false  # read-only tracer (no code modifications)
    read: true
    write: false  # reports returned via chat, not written to files
  ```
- **Recommendation**: 
  Add inline comments following codebase-analyzer pattern:
  ```yaml
  tools:
    bash: true       # for grep/find commands
    edit: false      # read-only agent (no code modifications)
    read: true       # CRITICAL for extracting code excerpts
    write: false     # results returned via chat, not written to files
    glob: true       # for file type discovery
    grep: true       # for keyword search
    list: true
    patch: false     # read-only agent
    todoread: true   # for reading search plan
    todowrite: true  # for creating search plan (workflow step)
    webfetch: true   # potentially for external library docs
    searxng-search: true  # potentially for external API references
    sequential-thinking: true
    context7: true
  ```
- **Done When**: 
  - All `false` permissions have explanatory comments
  - Comments explain *why* tool is disabled (role boundary or delegation)
  - Comments match style in `codebase-analyzer.md`

### QA-003: Review webfetch and searxng-search Tool Necessity
- **Priority**: Medium
- **Category**: Tool Permission Alignment
- **File(s)**: `agent/codebase-pattern-finder.md:16-17`
- **Issue**: `webfetch: true` and `searxng-search: true` are enabled but never referenced in system prompt or workflow
- **Evidence**: 
  ```yaml
  webfetch: true
  searxng-search: true
  ```
  Workflow sections (lines 37-70) only mention: `grep`, `bash`, `read`, `glob`, `todowrite`
- **Recommendation**: 
  1. **Determine intent**: Are these tools for fetching external library documentation during pattern research?
  2. **If YES**: Add usage guidance to system prompt:
     ```markdown
     ### 4. External Context (Optional)
     If pattern involves external libraries (e.g., React hooks, Django ORM):
     - Use `searxng-search` to find official docs/examples
     - Include external reference in Distribution Notes section
     ```
  3. **If NO**: Disable tools:
     ```yaml
     webfetch: false      # use Sub-Agent 'web-search-researcher' instead
     searxng-search: false  # use Sub-Agent 'web-search-researcher' instead
     ```
- **Done When**: 
  - Tool permissions match documented workflow
  - Either system prompt references external search OR tools are disabled with delegation comment

### QA-004: Fix Markdown Formatting Issues
- **Priority**: Low
- **Category**: Code Style
- **File(s)**: `agent/codebase-pattern-finder.md` (multiple lines)
- **Issue**: 42 markdownlint violations reduce readability and consistency with other agents
- **Evidence**: See "Automated Tool Findings > Markdown Linting" section above
- **Recommendation**: 
  Run automated fixes using markdownlint CLI:
  ```bash
  markdownlint --fix agent/codebase-pattern-finder.md
  ```
  Then manually fix:
  1. **List marker spacing** (lines 29-31, 39-41, 45-47): Change `1.  ` to `1. ` (2 spaces → 1 space)
  2. **Line length** (11 violations): Wrap long lines at 80 characters
  3. **Blank lines**: Add blank lines around headings (lines 37, 43, 49, 143, 151)
  4. **Code block language** (line 155): Change ` ``` ` to ` ```markdown `
- **Done When**: 
  - `markdownlint agent/codebase-pattern-finder.md` exits with 0 warnings
  - File formatting matches style in `codebase-analyzer.md` and `codebase-locator.md`

### QA-005: Fix YAML Line Length Violations
- **Priority**: Low
- **Category**: Code Style
- **File(s)**: `agent/codebase-pattern-finder.md` (frontmatter and content)
- **Issue**: 20 yamllint violations for line length (80 character limit)
- **Evidence**: See "Automated Tool Findings > YAML Validation" section above
- **Recommendation**: 
  1. **Frontmatter description** (line 2): Keep as-is (154 chars) - Description field benefits from completeness over strict line limits
  2. **Content sections**: Wrap at 80 characters where practical
  3. Configure yamllint to ignore line-length in description fields:
     ```yaml
     # .yamllint
     rules:
       line-length:
         max: 80
         allow-non-breakable-inline-mappings: true
     ```
- **Done When**: 
  - `yamllint agent/codebase-pattern-finder.md` reports ≤5 line-length violations (frontmatter only)
  - All content sections (lines 21-163) comply with 80-char limit

### QA-006: Add Usage Examples to System Prompt
- **Priority**: Medium
- **Category**: Agent Clarity
- **File(s)**: `agent/codebase-pattern-finder.md:50-70`
- **Issue**: "Search Strategy Guide" provides grep examples but lacks end-to-end workflow example
- **Evidence**: 
  ```markdown
  ## Search Strategy Guide
  
  **For Concepts (Architecture)**:
  ```bash
  grep -r "class.*Repository" src/ --include="*.ts"
  ```
  [Shows grep commands but not complete workflow: plan → search → extract → report]
- **Recommendation**: 
  Add complete example after line 70:
  ```markdown
  ## Complete Workflow Example
  
  **Query**: "How is pagination implemented?"
  
  **Step 1: Plan** (using todowrite)
  - Keywords: `["pagination", "Paginator", "page=", "limit="]`
  - Scope: `src/`, `lib/`
  - Variations: Offset-based vs cursor-based
  
  **Step 2: Search**
  ```bash
  grep -r "pagination" src/ --include="*.ts" -l  # Find files
  # Output: src/api/PaginationHelper.ts, src/db/QueryBuilder.ts
  ```
  
  **Step 3: Extract** (using read)
  Read `src/api/PaginationHelper.ts` to get full context (imports, types, implementation)
  
  **Step 4: Report** (using output template)
  Return YAML frontmatter + <thinking> + <answer> with code excerpts
  ```
- **Done When**: 
  - Example shows all 4 workflow steps (Plan → Search → Extract → Report)
  - Example demonstrates `todowrite` usage (currently mentioned but not shown)
  - Example placed after "Search Strategy Guide" (before "Output Format")

## Acceptance Criteria
- [x] YAML frontmatter is valid (structural errors only - line length is style)
- [ ] **CRITICAL**: `<default_to_action>` directive added (QA-001)
- [ ] Tool permissions include explanatory comments (QA-002)
- [ ] `webfetch`/`searxng-search` usage documented or tools disabled (QA-003)
- [ ] Markdown formatting passes linting (QA-004)
- [ ] YAML line length violations reduced to frontmatter only (QA-005)
- [ ] Complete workflow example added to system prompt (QA-006)
- [ ] Agent behavior consistent with `codebase-analyzer` sibling

## Implementor Checklist
- [ ] QA-001: Add Default-to-Action Directive for Claude Sonnet-4.5 (CRITICAL)
- [ ] QA-002: Add Explanatory Comments to Tool Permission Configuration
- [ ] QA-003: Review webfetch and searxng-search Tool Necessity
- [ ] QA-004: Fix Markdown Formatting Issues
- [ ] QA-005: Fix YAML Line Length Violations
- [ ] QA-006: Add Usage Examples to System Prompt

## References
- **yamllint output**: 20 violations (primarily line-length style issues)
- **markdownlint output**: 42 violations (formatting/style issues)
- **OpenCode skill**: opencode-agent-dev version 1.0
- **Files analyzed**: `agent/codebase-pattern-finder.md`
- **Comparison agents**: `agent/codebase-analyzer.md`, `agent/codebase-locator.md`
- **Subagents used**: None (direct analysis)
- **Critical Findings Applied**: 
  - Finding #2: Claude Sonnet-4.5 Requires Explicit Tool Usage Instructions (QA-001)
  - Finding #5: Context Engineering (tool permission rationale via comments)

## Additional Notes

### Agent Strengths
1. **Clear Role Boundary**: "Catalog, Don't Judge" directive prevents scope creep
2. **Mandatory Planning**: `todowrite` requirement enforces structured search approach
3. **Evidence Enforcement**: "Read Before Posting" rule prevents grep-only hallucinations
4. **Structured Output**: Comprehensive YAML frontmatter + variable template design
5. **Frequency Metrics**: Quantified format (`Dominant (10/12 files, 83%)`) enables data-driven decisions

### Consistency with AGENTS.md Documentation
- ✓ Output format matches documented template (lines 94-155)
- ✓ Three-part response structure: YAML frontmatter → `<thinking>` → `<answer>`
- ✓ Code excerpts include context (imports, class wrappers)
- ✓ Frequency uses quantified format (not vague "High/Low")
- ✓ Variable template scales naturally with findings

### Risk Assessment
- **Critical Risk**: Missing `<default_to_action>` may cause intermittent suggestion-only responses
- **Medium Risk**: Unclear `webfetch`/`searxng-search` usage may confuse invoking agents
- **Low Risk**: Formatting issues do not affect functionality

### Testing Recommendations
After implementing QA-001:
1. **Test Case 1**: Invoke with query "How is authentication implemented?" - Verify agent executes grep/read, returns code excerpts (not suggestions)
2. **Test Case 2**: Invoke with ambiguous scope "Find pagination code" - Verify agent uses glob to discover scope, doesn't ask for clarification
3. **Test Case 3**: Compare output format with documented template in AGENTS.md - Verify YAML frontmatter completeness
