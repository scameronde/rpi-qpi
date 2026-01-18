# QA-Driven Implementation Plan: Codebase-Pattern-Finder Agent

## Inputs
- QA report: `thoughts/shared/qa/2026-01-18-Codebase-Pattern-Finder-Agent.md`
- Audit date: 2026-01-18
- Automated tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill
- Auditor: opencode-qa-thorough

## Verified Current State

### Functional Validation Issues

**Missing Default-to-Action Directive**
- **Fact**: Agent uses Claude Sonnet-4.5 but lacks explicit tool usage directive, risking suggestion-only behavior instead of pattern extraction
- **Evidence**: `agent/codebase-pattern-finder.md:1-50`
- **Excerpt:**
  ```markdown
  # Pattern Librarian: Code Examples & Conventions
  
  You are the **Pattern Librarian**, a specialized worker agent responsible for finding concrete implementation examples within the codebase.
  
  [No <default_to_action> block present]
  ```

**Undefined External Search Tool Usage**
- **Fact**: `webfetch: true` and `searxng-search: true` are enabled but never referenced in system prompt or workflow
- **Evidence**: `agent/codebase-pattern-finder.md:16-17`
- **Excerpt:**
  ```yaml
  webfetch: true
  searxng-search: true
  ```
  Workflow sections (lines 37-70) only mention: `grep`, `bash`, `read`, `glob`, `todowrite`

**Missing Complete Workflow Example**
- **Fact**: "Search Strategy Guide" provides grep examples but lacks end-to-end workflow example showing all 4 steps (Plan → Search → Extract → Report)
- **Evidence**: `agent/codebase-pattern-finder.md:50-70`
- **Excerpt:**
  ```markdown
  ## Search Strategy Guide
  
  **For Concepts (Architecture)**:
  ```bash
  grep -r "class.*Repository" src/ --include="*.ts"
  ```
  [Shows grep commands but not complete workflow]
  ```

### Configuration Clarity Issues

**Missing Tool Permission Comments**
- **Fact**: Tool permission block lacks explanatory comments for disabled tools, reducing self-documentation compared to sibling agents
- **Evidence**: `agent/codebase-pattern-finder.md:5-19`
- **Excerpt:**
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
  ```

### Readability/Style Issues

**Markdown Formatting Violations**
- **Fact**: 42 markdownlint violations reduce readability and consistency with other agents
- **Evidence**: Entire file `agent/codebase-pattern-finder.md`
- **Violations:**
  - MD013 (line-length): 11 violations
  - MD030 (list-marker-space): 9 violations (2-3 spaces instead of 1)
  - MD032 (blanks-around-lists): 5 violations
  - MD022 (blanks-around-headings): 4 violations
  - MD031 (blanks-around-fences): 4 violations
  - MD040 (fenced-code-language): 1 violation at line 155

**YAML Line Length Violations**
- **Fact**: 20 yamllint line-length violations (80 character limit)
- **Evidence**: Lines 2, 24, 28, 31, 35, 46, 47, 74, 80-82, 85, 87, 90, 126, 159-162
- **Excerpt:** Line 2 (description field): 154 characters

## Goals / Non-Goals
- **Goals**: Resolve all issues identified in QA report
  - Critical: 1 issue
  - High: 0 issues
  - Medium: 3 issues
  - Low: 2 issues
- **Non-Goals**: New features, performance optimization beyond QA scope, refactoring unrelated code

## Design Overview

This plan addresses quality issues across three categories:

1. **Functional Validation**: Add missing `<default_to_action>` directive to ensure Claude Sonnet-4.5 executes pattern searches instead of suggesting them; clarify or remove unused external search tools; add complete workflow example
2. **Configuration Clarity**: Add explanatory comments to tool permission configuration following sibling agent patterns
3. **Readability/Style**: Fix markdown and YAML formatting violations to improve consistency and maintainability

## Phased Implementation

### Phase 1: Critical Issues (Functional Blocking)

Execute these items first; they block correct agent behavior.

#### PLAN-001: Add Default-to-Action Directive for Claude Sonnet-4.5 (was QA-001)
- **Priority**: Critical
- **Category**: Functional Validation
- **Change Type**: modify
- **File(s)**: `agent/codebase-pattern-finder.md:22-26`
- **Instruction**: 
  1. Locate the role definition at line 24: `You are the **Pattern Librarian**...`
  2. Insert a blank line after line 24
  3. Add the following `<default_to_action>` block:
     ```markdown
     <default_to_action>
     By default, execute the pattern search and return concrete code excerpts rather than 
     only suggesting search strategies. If search scope is ambiguous, use glob to discover 
     relevant directories instead of asking for clarification. Always read files to extract 
     complete code snippets—never rely on grep output alone.
     </default_to_action>
     ```
  4. Ensure the block appears between the role definition (line 24) and the "## Prime Directive" heading (line 26)
  5. Reference pattern from `codebase-analyzer.md:26-30`
  6. Reference Critical Finding #2 from opencode-agent-dev skill
- **Evidence**: 
  ```markdown
  # Pattern Librarian: Code Examples & Conventions
  
  You are the **Pattern Librarian**, a specialized worker agent responsible for finding concrete implementation examples within the codebase.
  
  ## Prime Directive
  ```
  Missing directive block between role definition and Prime Directive.
- **Done When**: 
  - `<default_to_action>` block exists between role definition and Prime Directive
  - Block explicitly uses action verbs "execute" and "return" (not "suggest")
  - Verification: Read the modified file and confirm block is present at correct location

**Phase 1 Verification**:
```bash
grep -A 5 "default_to_action" agent/codebase-pattern-finder.md  # Should show the new block
```

### Phase 2: High Priority Issues

No High priority items in this plan.

### Phase 3: Medium Priority Issues (Maintainability)

Execute after Phase 1 passes verification.

#### PLAN-002: Add Explanatory Comments to Tool Permission Configuration (was QA-002)
- **Priority**: Medium
- **Category**: Configuration Clarity
- **Change Type**: modify
- **File(s)**: `agent/codebase-pattern-finder.md:5-19`
- **Instruction**:
  1. Locate the tools section in YAML frontmatter (lines 5-19)
  2. Add inline comments to each tool permission following the codebase-analyzer pattern
  3. Apply these specific comments:
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
  4. Ensure all `false` permissions have explanatory comments
  5. Match comment style from `codebase-analyzer.md:6-9`
- **Evidence**: 
  ```yaml
  tools:
    bash: true
    edit: false
    read: true
    write: false
  ```
  (No comments present)
- **Done When**: 
  - All `false` permissions have explanatory comments
  - Comments explain *why* tool is disabled (role boundary or delegation)
  - Comments match style in `codebase-analyzer.md`

**Phase 3 Verification (after PLAN-002)**:
```bash
grep "# " agent/codebase-pattern-finder.md | grep -E "edit:|write:|patch:"  # Should show comments
```

#### PLAN-003: Review webfetch and searxng-search Tool Necessity (was QA-003)
- **Priority**: Medium
- **Category**: Tool Permission Alignment
- **Change Type**: modify
- **File(s)**: `agent/codebase-pattern-finder.md:16-17` and potentially lines 50-70
- **Instruction**:
  1. Determine intent: Are `webfetch` and `searxng-search` for fetching external library documentation?
  2. **Option A** (If YES - tools are intentionally enabled):
     - Add usage guidance to system prompt after line 70:
       ```markdown
       ### 4. External Context (Optional)
       If pattern involves external libraries (e.g., React hooks, Django ORM):
       - Use `searxng-search` to find official docs/examples
       - Include external reference in Distribution Notes section
       ```
  3. **Option B** (If NO - tools are not needed):
     - Disable tools in YAML frontmatter:
       ```yaml
       webfetch: false      # use Sub-Agent 'web-search-researcher' instead
       searxng-search: false  # use Sub-Agent 'web-search-researcher' instead
       ```
  4. Recommended: Choose Option B (disable) to maintain clear separation of concerns (pattern-finder = codebase only, web-search-researcher = external docs)
- **Evidence**: 
  ```yaml
  webfetch: true
  searxng-search: true
  ```
  Workflow sections (lines 37-70) only mention: `grep`, `bash`, `read`, `glob`, `todowrite`
- **Done When**: 
  - Tool permissions match documented workflow
  - Either system prompt references external search OR tools are disabled with delegation comment

**Phase 3 Verification (after PLAN-003)**:
```bash
grep -E "webfetch|searxng-search" agent/codebase-pattern-finder.md  # Should show either usage docs or "false" with comment
```

#### PLAN-006: Add Usage Examples to System Prompt (was QA-006)
- **Priority**: Medium
- **Category**: Agent Clarity
- **Change Type**: modify
- **File(s)**: `agent/codebase-pattern-finder.md:50-70`
- **Instruction**:
  1. Locate the end of "Search Strategy Guide" section (around line 70)
  2. Add a new section "## Complete Workflow Example"
  3. Insert the following example:
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
  4. Place this section after "Search Strategy Guide" and before "Output Format"
  5. Ensure example demonstrates `todowrite` usage (currently mentioned but not shown)
- **Evidence**: 
  ```markdown
  ## Search Strategy Guide
  
  **For Concepts (Architecture)**:
  ```bash
  grep -r "class.*Repository" src/ --include="*.ts"
  ```
  [Shows grep commands but not complete workflow: plan → search → extract → report]
- **Done When**: 
  - Example shows all 4 workflow steps (Plan → Search → Extract → Report)
  - Example demonstrates `todowrite` usage
  - Example placed after "Search Strategy Guide" (before "Output Format")

**Phase 3 Verification (after PLAN-006)**:
```bash
grep -A 20 "Complete Workflow Example" agent/codebase-pattern-finder.md  # Should show new section
```

### Phase 4: Low Priority Issues (Style + Polish)

Execute after Phase 3 passes verification. Optional if time-constrained.

#### PLAN-004: Fix Markdown Formatting Issues (was QA-004)
- **Priority**: Low
- **Category**: Code Style
- **Change Type**: modify
- **File(s)**: `agent/codebase-pattern-finder.md` (multiple lines)
- **Instruction**:
  1. Run automated fixes:
     ```bash
     markdownlint --fix agent/codebase-pattern-finder.md
     ```
  2. Manually fix remaining issues:
     - **List marker spacing** (lines 29-31, 39-41, 45-47): Change `1.  ` to `1. ` (2 spaces → 1 space)
     - **Line length** (11 violations): Wrap long lines at 80 characters
     - **Blank lines**: Add blank lines around headings (lines 37, 43, 49, 143, 151)
     - **Code block language** (line 155): Change ` ``` ` to ` ```markdown `
  3. Verify all fixes preserve functionality
- **Evidence**: 42 markdownlint violations across file
- **Done When**: 
  - `markdownlint agent/codebase-pattern-finder.md` exits with 0 warnings
  - File formatting matches style in `codebase-analyzer.md` and `codebase-locator.md`

**Phase 4 Verification (after PLAN-004)**:
```bash
markdownlint agent/codebase-pattern-finder.md  # Should exit 0 with no warnings
```

#### PLAN-005: Fix YAML Line Length Violations (was QA-005)
- **Priority**: Low
- **Category**: Code Style
- **Change Type**: modify
- **File(s)**: `agent/codebase-pattern-finder.md` (frontmatter and content)
- **Instruction**:
  1. **Frontmatter description** (line 2): Keep as-is (154 chars) - Description field benefits from completeness over strict line limits
  2. **Content sections**: Wrap at 80 characters where practical
  3. Configure yamllint to ignore line-length in description fields:
     ```yaml
     # .yamllint (or inline config)
     rules:
       line-length:
         max: 80
         allow-non-breakable-inline-mappings: true
     ```
  4. Target: Reduce violations to ≤5 (frontmatter only acceptable)
- **Evidence**: 20 yamllint violations for line length at lines 2, 24, 28, 31, 35, 46, 47, 74, 80-82, 85, 87, 90, 126, 159-162
- **Done When**: 
  - `yamllint agent/codebase-pattern-finder.md` reports ≤5 line-length violations (frontmatter only)
  - All content sections (lines 21-163) comply with 80-char limit

**Phase 4 Verification (after PLAN-005)**:
```bash
yamllint agent/codebase-pattern-finder.md  # Should show ≤5 line-length violations
```

## Baseline Verification

Before starting Phase 1, run these commands to establish a baseline:

```bash
yamllint agent/codebase-pattern-finder.md
markdownlint agent/codebase-pattern-finder.md
grep -c "default_to_action" agent/codebase-pattern-finder.md  # Should output 0
```

Record the current error/warning counts. Each phase should reduce these counts.

## Acceptance Criteria

- [x] YAML frontmatter is valid (structural errors only - line length is style)
- [ ] **CRITICAL**: `<default_to_action>` directive added (PLAN-001)
- [ ] Tool permissions include explanatory comments (PLAN-002)
- [ ] `webfetch`/`searxng-search` usage documented or tools disabled (PLAN-003)
- [ ] Complete workflow example added to system prompt (PLAN-006)
- [ ] Markdown formatting passes linting (PLAN-004)
- [ ] YAML line length violations reduced to frontmatter only (PLAN-005)
- [ ] Agent behavior consistent with `codebase-analyzer` sibling

## Implementor Checklist

### Phase 1 (Critical)
- [ ] PLAN-001: Add Default-to-Action Directive for Claude Sonnet-4.5 (was QA-001)

### Phase 2 (High)
(No items)

### Phase 3 (Medium)
- [ ] PLAN-002: Add Explanatory Comments to Tool Permission Configuration (was QA-002)
- [ ] PLAN-003: Review webfetch and searxng-search Tool Necessity (was QA-003)
- [ ] PLAN-006: Add Usage Examples to System Prompt (was QA-006)

### Phase 4 (Low)
- [ ] PLAN-004: Fix Markdown Formatting Issues (was QA-004)
- [ ] PLAN-005: Fix YAML Line Length Violations (was QA-005)

## References
- Source QA report: `thoughts/shared/qa/2026-01-18-Codebase-Pattern-Finder-Agent.md`
- Automated tools: yamllint, markdownlint, manual analysis
- OpenCode skill: opencode-agent-dev version 1.0
- Comparison agents: `agent/codebase-analyzer.md`, `agent/codebase-locator.md`
- Critical Finding #2: Claude Sonnet-4.5 Requires Explicit Tool Usage Instructions
