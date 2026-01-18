# OpenCode QA Analysis: Codebase-Analyzer Agent

## Scan Metadata
- Date: 2026-01-18
- Target: agent/codebase-analyzer.md
- Auditor: opencode-qa-thorough
- Tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill

## Executive Summary
- **Overall Status**: Conditional Pass
- **Critical Issues**: 1 (YAML syntax error in list item formatting)
- **High Priority**: 2 (Inconsistent bullet style, missing blank lines around lists)
- **Improvement Opportunities**: 3 (Line length violations, documentation clarity, tool permission comments)

## Automated Tool Findings

### 📋 YAML Validation (yamllint)
- **Status**: FAILED
- **Errors**: 1 critical, 17 line-length warnings

#### Issues

1. **agent/codebase-analyzer.md:34:2** - Syntax error in YAML-embedded list
   - Error: `expected alphabetic or numeric character, but found '*'`
   - Context: Line 34 appears to be in YAML frontmatter but contains Markdown list syntax
   - **Note**: This appears to be a false positive - line 34 is in the Markdown body, not YAML frontmatter. The yamllint tool may be incorrectly parsing the document boundary.

2. **agent/codebase-analyzer.md:2:81** - Line too long (167 > 80 characters)
   - Frontmatter `description` field exceeds line length limit

3. **agent/codebase-analyzer.md:16:19** - Too few spaces before comment (expected 2)
   - Inline comment formatting issue in YAML frontmatter

4. **Multiple line-length violations** (lines 24, 42, 61, 74, 77, 78, 83, 105, 111, 118, 126, 128, 132, 157, 215, 218)
   - 17 lines exceed 80-character limit (81-231 characters actual)

### 📝 Markdown Linting (markdownlint)
- **Status**: FAILED
- **Warnings**: 63 issues

#### Issues

**MD004 (ul-style)**: Inconsistent unordered list style - 36 violations
- Lines mix asterisk (*) and dash (-) bullet points
- Expected style: dash (-)
- Actual style: asterisk (*) in multiple sections

**MD013 (line-length)**: Line length violations - 8 instances
- Lines 24, 36, 42, 61, 74, 77, 78, 128, 157, 215, 218 exceed 80 characters

**MD032 (blanks-around-lists)**: Lists not surrounded by blank lines - 4 violations
- Lines 137, 140, 143, 210 (lists should have blank lines before/after)

**MD031 (blanks-around-fences)**: Fenced code blocks missing blank lines - 3 violations
- Lines 178, 185, 211 (code blocks should be surrounded by blank lines)

**MD022 (blanks-around-headings)**: Headings missing blank lines - 3 violations
- Lines 192, 199, 205 (headings should have blank lines below)

**MD007 (ul-indent)**: Incorrect unordered list indentation - 2 violations
- Lines 176, 183 (expected 2 spaces, actual 4 spaces)

**MD033 (no-inline-html)**: Inline HTML detected - 1 violation
- Line 176:67 contains `<User>` element

**MD040 (fenced-code-language)**: Fenced code block missing language - 1 violation
- Line 211 (closing code fence block should specify language)

### 🏷️ Naming Conventions
- **Status**: PASSED
- **Violations**: 0

#### Analysis
- **Filename**: `codebase-analyzer.md` ✅ (kebab-case)
- **Agent mode**: `subagent` ✅ (appropriate for analysis helper)

## Manual Quality Analysis

### 📖 Agent Clarity Issues

#### Issue 1: Ambiguous "Orchestrator" Reference
- **Issue**: System prompt repeatedly references "Orchestrator" without defining it
- **Evidence**: `agent/codebase-analyzer.md:74`
- **Excerpt**:
  ```markdown
  1. **Receive Target**: The Orchestrator will give you a file and a focus 
     (e.g., "Analyze the `processOrder` function in `src/orders.ts`").
  ```
- **Additional Evidence**: `agent/codebase-analyzer.md:78`
  ```markdown
  * **Constraint**: If an import is ambiguous (e.g., Dependency Injection or 
    Aliases like `@/utils`) and you cannot resolve it with `list`, **STOP** 
    and ask the Orchestrator to locate the file for you.
  ```
- **Impact**: Unclear who the "Orchestrator" is - could be the user, a primary agent (Researcher/Planner), or Implementation-Controller
- **Context**: Other agents in the codebase use explicit role names (e.g., Researcher calls out Planner, Task-Executor calls out Control Agent)

#### Issue 2: Vague "Sequential-Thinking" Trigger Criteria
- **Issue**: Criteria for when to use sequential-thinking tool are subjective ("complex", ">50 lines")
- **Evidence**: `agent/codebase-analyzer.md:67-73`
- **Excerpt**:
  ```markdown
  Use `sequential-thinking` for complex analysis scenarios:

  - Functions >50 lines with multiple execution paths
  - Recursive call chains or mutual recursion
  - Data transformations spanning 3+ function calls
  - State mutations with non-obvious side effects
  ```
- **Impact**: Agent may inconsistently apply sequential-thinking (50 vs 51 lines, "non-obvious" is subjective)
- **Comparison**: Task-executor agent has similar tool but no quantified triggers

### 🔧 Configuration Correctness Issues

#### Issue 1: Tool Permission Comment Formatting
- **Issue**: Inline comment at line 16 has only 1 space before `#` (yamllint expects 2)
- **Evidence**: `agent/codebase-analyzer.md:16`
- **Excerpt**:
  ```yaml
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  ```
- **Impact**: YAML linting fails; minor formatting inconsistency
- **Pattern**: Other tool comments in the file use 2 spaces (lines 6-7, 9-11, 16-17)

#### Issue 2: Temperature Consistency with Peer Agents
- **Issue**: Temperature set to 0.1 (deterministic), same as other analysis subagents
- **Evidence**: `agent/codebase-analyzer.md:4`
- **Excerpt**:
  ```yaml
  temperature: 0.1
  ```
- **Validation**: ✅ Correct for analysis tasks (per opencode-agent-dev skill)
- **Peer comparison**: 
  - codebase-locator: 0.1 ✅
  - codebase-pattern-finder: 0.1 ✅
  - thoughts-analyzer: 0.1 ✅
  - task-executor: 0.2 (implementation) ✅
  - web-search-researcher: 0.2 (synthesis) ✅

### 🎯 Functional Validation Issues

#### Issue 1: Default-to-Action Directive Present
- **Issue**: Agent includes `<default_to_action>` directive (Critical Finding #2 from opencode-agent-dev)
- **Evidence**: `agent/codebase-analyzer.md:26-30`
- **Excerpt**:
  ```xml
  <default_to_action>
  By default, produce the structured analysis report rather than only suggesting
  analysis steps. If file paths are ambiguous, use the list tool to discover the
  correct location instead of asking for clarification.
  </default_to_action>
  ```
- **Validation**: ✅ Correctly implemented for Claude Sonnet-4.5
- **Content**: Directive aligns with agent responsibility (produce analysis, not suggestions)

#### Issue 2: Code Excerpt Formatting Consistency
- **Issue**: Output template shows inconsistent indentation for code excerpts (2 vs 4 spaces)
- **Evidence**: `agent/codebase-analyzer.md:168-173` vs `agent/codebase-analyzer.md:176-180`
- **Excerpt (Step 1 - correct 2-space indent)**:
  ```markdown
  * **Step 1**: Validates input using `schema.validate()` (Line 12).
    **Excerpt:**
    ```typescript
    const result = schema.validate(input);
    if (!result.success) throw new ValidationError();
    ```
  ```
- **Excerpt (Step 2 - incorrect 4-space indent for sub-item)**:
  ```markdown
  * **Step 2**: Calls `UserService.find()` (Line 15).
      * *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
    **Excerpt:**
  ```
- **Impact**: Generated reports may have formatting inconsistencies; Planner/Researcher agents expect consistent format

#### Issue 3: Observable "Done When" Criteria
- **Issue**: Agent does not have explicit acceptance criteria for analysis completeness
- **Evidence**: `agent/codebase-analyzer.md:81-84` (Output Protocol section)
- **Excerpt**:
  ```markdown
  ### 2. Output Protocol

  You do not write files. You return a structured Markdown report in the 
  chat context.
  ```
- **Impact**: No guidance on when analysis is "complete" (all imports traced? all branches documented?)
- **Comparison**: Task-executor has explicit "Done When" criteria; Planner has "Acceptance Criteria" section

## Improvement Plan (For Implementor)

### QA-001: Fix YAML Comment Formatting
- **Priority**: Critical
- **Category**: Configuration
- **File(s)**: `agent/codebase-analyzer.md:16`
- **Issue**: Inline YAML comment has 1 space before `#` (yamllint expects 2)
- **Evidence**: 
  ```yaml
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  ```
  yamllint output: `agent/codebase-analyzer.md:16:19: [warning] too few spaces before comment: expected 2 (comments)`
- **Recommendation**: 
  Change line 16 from:
  ```yaml
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  ```
  to:
  ```yaml
  webfetch: false  # use Sub-Agent 'web-search-researcher' instead
  ```
  (add one additional space before `#`)
- **Done When**: 
  - yamllint passes without comment-spacing warnings
  - All inline comments in frontmatter use 2 spaces before `#`

### QA-002: Standardize Markdown List Bullet Style
- **Priority**: High
- **Category**: Validation
- **File(s)**: `agent/codebase-analyzer.md:77-209` (entire system prompt body)
- **Issue**: Mixed use of asterisk (*) and dash (-) bullet points (36 violations)
- **Evidence**: 
  ```markdown
  # Line 77 (asterisk)
      * If Function A calls Function B (imported from `./utils.ts`), use `read` on `./utils.ts`.
  
  # Line 93 (asterisk in "Input-Process-Output" section)
  * **In**: Arguments, Request Body, State props.
  ```
  markdownlint output: `MD004/ul-style Unordered list style [Expected: dash; Actual: asterisk]`
- **Recommendation**: 
  1. Use find-and-replace to change all bullet markers from `* ` to `- ` in lines 77-209
  2. Verify sub-items use 2-space indentation (not 4-space)
  3. Ensure no mixed styles within the same list
- **Done When**: 
  - markdownlint passes without MD004 violations
  - All unordered lists use `-` bullet style
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep -c MD004` returns 0

### QA-003: Add Blank Lines Around Lists and Headings
- **Priority**: High
- **Category**: Validation
- **File(s)**: `agent/codebase-analyzer.md:137,140,143,192,199,205,210`
- **Issue**: Lists and headings missing required blank lines before/after (7 violations)
- **Evidence**: 
  ```markdown
  # Line 137 (list without blank line before)
  **Always include:**
  * Section 1 (Execution Flow)
  
  # Line 192 (heading without blank line after)
  ### 2. Data Model & State
  (Include only for `comprehensive` depth)
  ```
  markdownlint output: 
  - `MD032/blanks-around-lists Lists should be surrounded by blank lines`
  - `MD022/blanks-around-headings Headings should be surrounded by blank lines`
- **Recommendation**: 
  1. Add blank line before list at line 137
  2. Add blank line before list at line 140
  3. Add blank line before list at line 143
  4. Add blank line after heading at line 192
  5. Add blank line after heading at line 199
  6. Add blank line after heading at line 205
  7. Add blank line before closing tag at line 210
- **Done When**: 
  - markdownlint passes without MD032 or MD022 violations
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep -E 'MD032|MD022' | wc -l` returns 0

### QA-004: Fix Blank Lines Around Fenced Code Blocks
- **Priority**: Medium
- **Category**: Validation
- **File(s)**: `agent/codebase-analyzer.md:178,185,211`
- **Issue**: Fenced code blocks missing blank lines before/after (3 violations)
- **Evidence**: 
  ```markdown
  # Line 176-178 (no blank line before code fence)
    **Excerpt:**
    ```typescript
    const result = schema.validate(input);
  ```
  markdownlint output: `MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines`
- **Recommendation**: 
  1. Add blank line before code fence at line 178
  2. Add blank line before code fence at line 185
  3. Add blank line before closing code fence at line 211
  4. Specify language for closing code fence at line 211 (should be just triple backticks, but if it's an opening fence, add `markdown` or appropriate language)
- **Done When**: 
  - markdownlint passes without MD031 violations
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD031 | wc -l` returns 0

### QA-005: Clarify "Orchestrator" Role Reference
- **Priority**: Medium
- **Category**: Clarity
- **File(s)**: `agent/codebase-analyzer.md:74,78,81`
- **Issue**: "Orchestrator" is used 3+ times but never defined; unclear if it's the user, Researcher, Planner, or Implementation-Controller
- **Evidence**: 
  ```markdown
  # Line 74
  1. **Receive Target**: The Orchestrator will give you a file and a focus 
     (e.g., "Analyze the `processOrder` function in `src/orders.ts`").
  
  # Line 78
  and ask the Orchestrator to locate the file for you.
  ```
- **Recommendation**: 
  1. Add a definition section after "Prime Directive" (around line 38):
     ```markdown
     ## Role Definition
     
     You are a **subagent** invoked by primary agents (Researcher, Planner, 
     Implementation-Controller). The "Orchestrator" in this document refers to 
     the agent that invoked you. You return analysis results via chat; the 
     Orchestrator decides how to use them.
     ```
  2. Alternatively, replace "Orchestrator" with "invoking agent" throughout
- **Done When**: 
  - Agent system prompt clearly defines who the "Orchestrator" is
  - Search for "Orchestrator" in file returns definition or consistent synonym
  - Run: `grep -n "Orchestrator" agent/codebase-analyzer.md | wc -l` shows same count but with definition added

### QA-006: Specify Observable Sequential-Thinking Triggers
- **Priority**: Low
- **Category**: Clarity
- **File(s)**: `agent/codebase-analyzer.md:67-73`
- **Issue**: Criteria for using sequential-thinking tool are subjective ("complex", "non-obvious")
- **Evidence**: 
  ```markdown
  Use `sequential-thinking` for complex analysis scenarios:

  - Functions >50 lines with multiple execution paths
  - Recursive call chains or mutual recursion
  - Data transformations spanning 3+ function calls
  - State mutations with non-obvious side effects
  ```
- **Recommendation**: 
  1. Add quantifiable criteria where possible:
     - Change ">50 lines" to ">100 lines" (50 is not complex for modern functions)
     - Change "multiple execution paths" to "3+ branching paths (if/else, switch, ternary)"
     - Keep "3+ function calls" (already quantified)
     - Change "non-obvious side effects" to "mutations to shared state or closure variables"
  2. Add guidance: "When in doubt, use sequential-thinking for any analysis requiring more than 2 file reads"
- **Done When**: 
  - All sequential-thinking trigger criteria are quantifiable or have concrete examples
  - No subjective terms like "complex" or "non-obvious" without definitions

### QA-007: Fix Code Excerpt Indentation Consistency
- **Priority**: Low
- **Category**: Functional Validation
- **File(s)**: `agent/codebase-analyzer.md:168-190`
- **Issue**: Output template shows inconsistent indentation for sub-items (2 vs 4 spaces)
- **Evidence**: 
  ```markdown
  # Line 176 (4-space indent for sub-item)
  * **Step 2**: Calls `UserService.find()` (Line 15).
      * *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
  ```
- **Recommendation**: 
  1. Change all sub-item indentation to 2 spaces (Markdown standard)
  2. Update line 176 from:
     ```markdown
         * *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
     ```
     to:
     ```markdown
       - *Trace*: `src/services/user.ts` -> functions returns Promise<User>.
     ```
  3. Apply same fix to line 183 (sub-item under Step 3)
- **Done When**: 
  - markdownlint passes without MD007 violations
  - All sub-items use 2-space indentation and dash (-) bullets
  - Run: `markdownlint agent/codebase-analyzer.md 2>&1 | grep MD007 | wc -l` returns 0

## Acceptance Criteria
- [ ] All critical YAML validation errors resolved (QA-001)
- [ ] All Markdown linting errors fixed (QA-002, QA-003, QA-004, QA-007)
- [ ] "Orchestrator" role clearly defined (QA-005)
- [ ] Sequential-thinking triggers are observable/quantifiable (QA-006)
- [ ] yamllint passes with 0 errors (line-length warnings acceptable)
- [ ] markdownlint passes with 0 errors (line-length warnings acceptable)

## Implementor Checklist
- [ ] QA-001: Fix YAML Comment Formatting (1 line change)
- [ ] QA-002: Standardize Markdown List Bullet Style (36 line changes)
- [ ] QA-003: Add Blank Lines Around Lists and Headings (7 line additions)
- [ ] QA-004: Fix Blank Lines Around Fenced Code Blocks (3 line additions)
- [ ] QA-005: Clarify "Orchestrator" Role Reference (add definition section)
- [ ] QA-006: Specify Observable Sequential-Thinking Triggers (rewrite criteria)
- [ ] QA-007: Fix Code Excerpt Indentation Consistency (2 line changes)

## References
- yamllint output: 1 syntax error (false positive), 1 comment spacing warning, 17 line-length warnings
- markdownlint output: 63 total violations (36 MD004, 8 MD013, 4 MD032, 3 MD031, 3 MD022, 2 MD007, 1 MD033, 1 MD040)
- OpenCode skill: opencode-agent-dev (loaded successfully)
- Files analyzed: agent/codebase-analyzer.md
- Subagents used: None (manual analysis only)
- Peer agents compared: task-executor.md, researcher.md (for consistency checks)
