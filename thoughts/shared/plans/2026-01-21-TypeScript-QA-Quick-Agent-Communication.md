# TypeScript-QA-Quick Agent Communication Optimization - Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-21-TypeScript-QA-Quick-Agent-Communication.md`
- User request: "Read the research report and create plan"
- Parallel agent reference: `agent/python-qa-quick.md` (for consistency)

## Verified Current State

### Fact 1: typescript-qa-quick agent lacks thinking/answer separation
- **Evidence:** `agent/typescript-qa-quick.md:136-162`
- **Excerpt:**
  ```markdown
  ## Output Format
  
  Use this exact Markdown structure:
  
  ```markdown
  ## 🚀 Quick TypeScript QA Results
  
  ### ⏱️ Scan Summary
  - Target: [path]
  - Tools: tsc ✓ | eslint ✓ | knip ✓
  - Date: YYYY-MM-DD
  ```
  ```

### Fact 2: python-qa-quick uses thinking/answer pattern with documented structure
- **Evidence:** `agent/python-qa-quick.md:130-218` (thinking section documentation), `agent/python-qa-quick.md:239-301` (output format template)
- **Excerpt:**
  ```markdown
  ### 3. Document Tool Execution (For <thinking> Section)
  
  When executing analysis tools, document the process for the `<thinking>` section to provide transparency and debugging capability:
  
  #### 3.1 Commands Executed
  
  Log each command with:
  - Exact command string (including paths, flags, and arguments)
  - Tool version (e.g., `ruff --version` output)
  - Execution context (working directory if not project root)
  ```

### Fact 3: python-qa-quick output uses YAML frontmatter message envelope
- **Evidence:** `agent/python-qa-quick.md:267-278`
- **Excerpt:**
  ```yaml
  ---
  message_id: python-qa-quick-[YYYY-MM-DD]-[random-4-digit]
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  message_type: QA_RESULT
  target: [path]
  tools_executed: [ruff, pyright, bandit, interrogate]
  critical_count: [N]
  high_count: [N]
  medium_count: [N]
  low_count: [N]
  ---
  ```

### Fact 4: python-qa-quick is documented in AGENTS.md thinking/answer pattern list
- **Evidence:** `AGENTS.md:37`
- **Excerpt:**
  ```markdown
  - **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  ```

### Fact 5: typescript-qa-quick is NOT documented in AGENTS.md thinking/answer pattern list
- **Evidence:** `AGENTS.md:29-39` (complete list, typescript-qa-quick not present)
- **Excerpt:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
  - **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
  - **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
  - **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
  - **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
  - **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning
  - **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  - **python-qa-thorough** (`agent/python-qa-quick.md`): Documents comprehensive Python QA reasoning
  - **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
  ```

### Fact 6: typescript-qa-quick current structure has 6 workflow sections
- **Evidence:** `agent/typescript-qa-quick.md:34-162`
- **Excerpt:**
  ```markdown
  ## Operational Workflow
  
  ### 1. Identify Target Files
  
  ### 2. Execute Analysis Tools (in parallel)
  
  ### 3. Synthesize Findings
  
  ### 4. Prioritize Issues
  
  ### 5. Output Actionable Task List
  
  ## Output Format
  ```

## Goals / Non-Goals

### Goals
1. Add thinking/answer separation to typescript-qa-quick agent output
2. Add YAML frontmatter message envelope consistent with python-qa-quick schema
3. Add thinking section content specification (5 phases) to agent prompt
4. Update AGENTS.md to document typescript-qa-quick in thinking/answer pattern list
5. Achieve cross-agent consistency (typescript-qa-quick matches python-qa-quick structure)

### Non-Goals
- Changing the task list format in the `<answer>` section (maintain existing user-facing output)
- Modifying the tool execution logic or priority hierarchy
- Changing the agent's mode, temperature, or tool permissions
- Testing the agent (this is implementation only, no verification tasks)

## Design Overview

The implementation adds thinking/answer separation to typescript-qa-quick following the exact pattern established by python-qa-quick:

1. **Insert new section** after "### 2. Execute Analysis Tools" to specify thinking section content (5 phases: commands executed, tool outputs, synthesis decisions)
2. **Update output format section** to wrap template in `<thinking>` and `<answer>` tags
3. **Add YAML frontmatter** to `<answer>` section using schema identical to python-qa-quick (aligned field names)
4. **Update AGENTS.md** to add typescript-qa-quick to thinking/answer pattern list

**Data flow:**
- Agent executes tools → logs execution in `<thinking>` section → produces task list in `<answer>` section
- Message envelope in YAML frontmatter enables workflow correlation
- User sees same actionable task list (in `<answer>`), can inspect `<thinking>` for debugging

## Implementation Instructions (For Implementor)

### PLAN-001: Add Thinking Section Content Specification

- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-quick.md`
- **Instruction:**
  1. Locate line 96 (after `## Pattern Search` section, before `### 2. Execute Analysis Tools`)
  2. Insert new section `### 2.5 Document Tool Execution (For <thinking> Section)` before the line `### 3. Synthesize Findings` (currently at line 115)
  3. Copy the thinking section content specification from `agent/python-qa-quick.md:130-218` (sections 3.1, 3.2, 3.3)
  4. Adapt the content for TypeScript tools:
     - Replace `ruff check`, `pyright`, `bandit`, `interrogate` with `npx tsc --noEmit`, `npx eslint . --ext .ts,.tsx`, `npx knip --reporter compact`
     - Update examples to show TypeScript tool outputs (tsc errors, eslint warnings, knip unused exports)
     - Maintain the same 3-part structure: Commands Executed, Tool Outputs, Synthesis Decisions
  5. Add reference to this section in the output format instruction (upcoming PLAN-002)
- **Interfaces / Pseudocode:**
  ```markdown
  ### 2.5 Document Tool Execution (For <thinking> Section)
  
  When executing analysis tools, document the process for the `<thinking>` section to provide transparency and debugging capability:
  
  #### 2.5.1 Commands Executed
  
  Log each command with:
  - Exact command string (including paths, flags, and arguments)
  - Tool version (e.g., `tsc --version` output)
  - Execution context (working directory if not project root)
  
  **Example:**
  ```markdown
  <thinking>
  ## Commands Executed
  
  1. **npx tsc --noEmit**
     - Version: tsc 5.3.3
     - Working directory: /home/user/project
  
  2. **npx eslint . --ext .ts,.tsx**
     - Version: eslint 8.56.0
     - Working directory: /home/user/project
  
  3. **npx knip --reporter compact**
     - Version: knip 3.8.5
     - Working directory: /home/user/project
  ```
  
  #### 2.5.2 Tool Outputs
  
  For each tool, log:
  - Full raw output (if ≤100 lines) or summary statistics (if >100 lines)
  - Exit code (0 = success, non-zero = failures detected)
  - Execution time (if significant)
  
  **Example:**
  ```markdown
  ## Tool Outputs
  
  ### tsc (Exit Code: 1, 2.1s)
  src/auth/login.ts:28:5 - error TS7006: Parameter 'user' implicitly has an 'any' type.
  src/auth/session.ts:56:9 - error TS2454: Variable 'token' is used before being assigned.
  Found 2 errors in 2 files.
  
  ### eslint (Exit Code: 1, 1.8s)
  src/auth/validate.ts:10:1  error  Function 'validateInput' has a complexity of 15  complexity
  src/auth/utils.ts:45:5  warning  'x' is assigned a value but never used  @typescript-eslint/no-unused-vars
  2 problems (1 error, 1 warning)
  
  ### knip (Exit Code: 0, 0.9s)
  ✓ No unused exports, dependencies, or files detected.
  ```
  
  #### 2.5.3 Synthesis Decisions
  
  Document your reasoning for prioritization and grouping:
  - Issue count by tool and priority level
  - Grouping decisions (e.g., "Grouped 8 similar @typescript-eslint/no-unused-vars errors")
  - Prioritization reasoning (why certain issues ranked higher)
  
  **Example:**
  ```markdown
  ## Synthesis Decisions
  
  **Issue Counts:**
  - Critical (eslint-plugin-security): 1
  - High (tsc): 2
  - Medium (eslint + knip): 3
  - Low (eslint): 1
  
  **Grouping:**
  - Grouped 5 @typescript-eslint/no-unused-vars warnings into single item (all in auth/ module)
  - Kept security issues separate (different attack vectors)
  
  **Prioritization:**
  - Unsafe DOM manipulation (eslint-plugin-security) ranked Critical due to XSS risk
  - Type errors (tsc) ranked High as they block compilation
  - Complexity warning (eslint) ranked Medium as it affects maintainability but not correctness
  </thinking>
  ```
  ```
- **Evidence:** `agent/python-qa-quick.md:130-218` (template for thinking section content specification)
- **Done When:** 
  1. New section 2.5 exists in `agent/typescript-qa-quick.md` after section on pattern search
  2. Section contains 3 subsections: Commands Executed, Tool Outputs, Synthesis Decisions
  3. Examples use TypeScript tool commands (tsc, eslint, knip) instead of Python tools
  4. Section numbering is sequential (section 3 becomes section 4, etc.)

### PLAN-002: Update Output Format with Thinking/Answer Wrapper

- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-quick.md`
- **Instruction:**
  1. Locate the `## Output Format` section (currently at line 136)
  2. Replace the current output format with thinking/answer wrapper structure
  3. Copy the complete output format from `agent/python-qa-quick.md:239-301` as reference
  4. Adapt for TypeScript:
     - Keep `<thinking>` section structure identical (same phases as python-qa-quick)
     - Update tool names in YAML frontmatter: `tools_executed: [tsc, eslint, knip]` (or with optional tools)
     - Update message_id prefix to `typescript-qa-quick-[YYYY-MM-DD]-[random-4-digit]`
     - Update message_type to `QA_RESULT_TYPESCRIPT` (or keep as `QA_RESULT` for consistency with python-qa-quick)
     - Keep the task list format in `<answer>` section unchanged (existing emoji-based structure)
  5. Add instruction: "Wrap tool execution log from section 2.5 in `<thinking>` tags before the `<answer>` section"
- **Interfaces / Pseudocode:**
  ```markdown
  ## Output Format
  
  Use this exact structure with <thinking> and <answer> tags:
  
  <thinking>
  Tool Execution Log:
  
  Commands Executed:
  - npx tsc --noEmit (tsc X.Y.Z)
  - npx eslint . --ext .ts,.tsx (eslint X.Y.Z)
  - npx knip --reporter compact (knip X.Y.Z)
  - [Optional: npx eslint . --ext .ts,.tsx --plugin security (if detected)]
  - [Optional: npx eslint . --ext .ts,.tsx --plugin jsdoc (if detected)]
  
  Raw Outputs:
  - tsc: [N] errors found ([breakdown by file])
  - eslint: [N] problems found ([M] errors, [K] warnings)
  - knip: [N] issues found ([breakdown by category: unused exports, files, dependencies])
  - [Optional tools]: [output if executed]
  
  Synthesis Reasoning:
  - Critical ([N] issues): [reasoning for categorization]
  - High ([N] issues): [reasoning]
  - Medium ([N] issues): [reasoning]
  - Low ([N] issues): [reasoning]
  - Grouping: [any summarization applied]
  - Hot spots: [files with multiple issues across categories]
  </thinking>
  
  <answer>
  ---
  message_id: typescript-qa-quick-[YYYY-MM-DD]-[random-4-digit]
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  message_type: QA_RESULT
  target: [path]
  tools_executed: [tsc, eslint, knip]
  critical_count: [N]
  high_count: [N]
  medium_count: [N]
  low_count: [N]
  ---
  
  ## 🚀 Quick TypeScript QA Results
  
  ### ⏱️ Scan Summary
  - Target: [path]
  - Tools: tsc ✓ | eslint ✓ | knip ✓
  - Date: YYYY-MM-DD
  
  ### 🔴 Critical Issues (Fix Immediately)
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### 🟠 High Priority
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### 🟡 Medium Priority
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### 🟢 Low Priority / Style
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### ✅ Next Steps
  [Concrete actions to take]
  </answer>
  ```
- **Evidence:** `agent/python-qa-quick.md:239-301` (complete thinking/answer template)
- **Done When:**
  1. Output format section uses `<thinking>` and `<answer>` tags
  2. `<thinking>` section documents Commands Executed, Raw Outputs, and Synthesis Reasoning
  3. `<answer>` section includes YAML frontmatter with message envelope fields
  4. Task list format in `<answer>` section remains unchanged from current template
  5. YAML schema matches python-qa-quick field names (message_id, timestamp, message_type, target, tools_executed, critical_count, high_count, medium_count, low_count)

### PLAN-003: Update Examples with Thinking/Answer Structure

- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-quick.md`
- **Instruction:**
  1. Locate the `## Examples` section (currently around line 202)
  2. Update all three examples to include `<thinking>` and `<answer>` tags
  3. Use `agent/python-qa-quick.md:332-533` as reference for example structure
  4. For each example:
     - Add `<thinking>` section with Commands Executed, Raw Outputs, Synthesis Reasoning
     - Wrap existing task list in `<answer>` section with YAML frontmatter
     - Adapt tool outputs for TypeScript (tsc, eslint, knip instead of ruff, pyright, bandit)
  5. Ensure examples demonstrate:
     - Example 1: Tool Not Found (eslint missing, show ❌ status and note in frontmatter `tools_failed: [eslint]`)
     - Example 2: No Issues Found (all tools pass, low priority style issue only)
     - Example 3: Multiple Issues (security, type, quality, style issues across all priority levels)
- **Interfaces / Pseudocode:**
  For "Tool Not Found" example:
  ```markdown
  ### Example: Tool Not Found
  
  If eslint is not installed:
  
  ```markdown
  <thinking>
  Tool Execution Log:
  
  Commands Executed:
  - npx tsc --noEmit (tsc 5.3.3)
  - npx eslint . --ext .ts,.tsx (eslint: command not found)
  - npx knip --reporter compact (knip 3.8.5)
  
  Raw Outputs:
  - tsc: 0 errors, 0 warnings
  - eslint: FAILED - command not found (tool not installed)
  - knip: 0 issues found
  
  Synthesis Reasoning:
  - Critical (0 issues): No security vulnerabilities detected (eslint-plugin-security unavailable)
  - High (0 issues): No type errors detected
  - Medium (0 issues): No quality or dead code issues
  - Low (0 issues): No style issues (eslint unavailable)
  - Grouping: N/A
  - Hot spots: None
  - Tool availability: eslint missing but other tools successful
  </thinking>
  
  <answer>
  ---
  message_id: typescript-qa-quick-2026-01-21-1842
  timestamp: 2026-01-21T14:32:15Z
  message_type: QA_RESULT
  target: src/
  tools_executed: [tsc, knip]
  tools_failed: [eslint]
  critical_count: 0
  high_count: 0
  medium_count: 0
  low_count: 0
  ---
  
  ## 🚀 Quick TypeScript QA Results
  
  ### ⏱️ Scan Summary
  - Target: src/
  - Tools: tsc ✓ | eslint ❌ (not found) | knip ✓
  - Date: 2026-01-21
  
  **⚠️ Note**: `eslint` is not installed. Run `npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin` to enable linting checks.
  
  [Continue with available tool results...]
  </answer>
  ```
  ```
- **Evidence:** `agent/python-qa-quick.md:332-533` (complete examples with thinking/answer structure)
- **Done When:**
  1. All three examples use `<thinking>` and `<answer>` tags
  2. Each example includes Commands Executed, Raw Outputs, and Synthesis Reasoning in `<thinking>` section
  3. Each example includes YAML frontmatter in `<answer>` section
  4. Tool outputs adapted for TypeScript (tsc errors, eslint warnings, knip unused exports)
  5. Examples demonstrate proper use of `tools_failed` field when tools are unavailable

### PLAN-004: Renumber Workflow Sections After Insertion

- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-quick.md`
- **Instruction:**
  1. After inserting section 2.5 in PLAN-001, renumber subsequent sections:
     - Old "### 3. Synthesize Findings" becomes "### 4. Synthesize Findings"
     - Old "### 4. Prioritize Issues" becomes "### 5. Prioritize Issues"
     - Old "### 5. Output Actionable Task List" becomes "### 6. Output Actionable Task List"
  2. Ensure all cross-references to section numbers are updated (if any)
  3. Verify the workflow sequence remains logical: 1. Identify Target → 2. Execute Tools → 2.5 Document Execution → 4. Synthesize → 5. Prioritize → 6. Output
- **Evidence:** `agent/typescript-qa-quick.md:115-134` (sections 3-5 that need renumbering)
- **Done When:**
  1. Section numbering is sequential (1, 2, 2.5, 4, 5, 6)
  2. No duplicate section numbers exist
  3. Workflow sequence remains logical

### PLAN-005: Update AGENTS.md Thinking/Answer Pattern List

- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate line 37 in `AGENTS.md` (python-qa-quick entry in thinking/answer pattern list)
  2. Insert new line after line 37 with identical structure:
     - `- **typescript-qa-quick** (`agent/typescript-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)`
  3. Use exact same description as python-qa-quick to emphasize parallel agent consistency
  4. Maintain alphabetical ordering within QA agent subsection (opencode-qa-thorough, python-qa-quick, python-qa-thorough, typescript-qa-quick)
- **Interfaces / Pseudocode:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): Documents task execution reasoning (parsing, verification, strategy, execution, adaptations)
  - **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning (task extraction, delegation, parsing, verification, commit)
  - **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning (implemented per research 2026-01-18)
  - **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning (implemented per research 2026-01-18)
  - **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning (implemented per research 2026-01-18)
  - **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning (tool execution, file reads, prioritization decisions)
  - **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  - **python-qa-thorough** (`agent/python-qa-thorough.md`): Documents comprehensive Python QA reasoning (tool execution, manual analysis, prioritization decisions)
  - **typescript-qa-quick** (`agent/typescript-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  - **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
  ```
- **Evidence:** `AGENTS.md:29-39` (current thinking/answer pattern list)
- **Done When:**
  1. typescript-qa-quick entry added after python-qa-thorough entry
  2. Entry uses identical description as python-qa-quick (parallel agent consistency)
  3. List remains properly formatted with Markdown list syntax

### PLAN-006: Add Research Reference to AGENTS.md

- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate the "#### Research References" section in AGENTS.md (around line 55)
  2. Add new entry after the python-qa-quick research reference (line 57):
     - `- thoughts/shared/research/2026-01-21-TypeScript-QA-Quick-Agent-Communication.md (typescript-qa-quick communication pattern analysis)`
  3. Maintain chronological ordering (newest research first within each date)
- **Interfaces / Pseudocode:**
  ```markdown
  #### Research References
  
  - `thoughts/shared/research/2026-01-21-Python-QA-Quick-Agent-Communication.md` (python-qa-quick communication pattern analysis)
  - `thoughts/shared/research/2026-01-21-TypeScript-QA-Quick-Agent-Communication.md` (typescript-qa-quick communication pattern analysis)
  - `thoughts/shared/research/2026-01-21-Python-QA-Thorough-Agent-Communication.md` (python-qa-thorough communication pattern analysis)
  - `thoughts/shared/research/2026-01-19-Implementation-Controller-User-Communication-Verbosity.md` (implementation-controller analysis)
  - `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (baseline research, industry best practices)
  - `thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md` (locator-specific optimization)
  - `thoughts/shared/research/2026-01-18-Codebase-Pattern-Finder-Agent-Communication.md` (pattern-finder optimization)
  ```
- **Evidence:** `AGENTS.md:55-62` (current research references section)
- **Done When:**
  1. New research reference added to list
  2. Chronological ordering maintained (2026-01-21 entries together)
  3. Reference includes descriptive suffix "(typescript-qa-quick communication pattern analysis)"

## Acceptance Criteria

For implementation to be considered complete:

1. **Section 2.5 Added**: New section "Document Tool Execution (For <thinking> Section)" exists in `agent/typescript-qa-quick.md` with 3 subsections (Commands Executed, Tool Outputs, Synthesis Decisions) and TypeScript-specific examples
2. **Output Format Updated**: Output format section uses `<thinking>` and `<answer>` tags with YAML frontmatter message envelope
3. **Examples Updated**: All three examples (Tool Not Found, No Issues Found, Multiple Issues) use thinking/answer structure with TypeScript tool outputs
4. **Section Renumbering**: Workflow sections properly numbered (1, 2, 2.5, 4, 5, 6) after insertion of section 2.5
5. **AGENTS.md Entry**: typescript-qa-quick listed in AGENTS.md thinking/answer pattern section with identical description as python-qa-quick
6. **Research Reference**: Research report `2026-01-21-TypeScript-QA-Quick-Agent-Communication.md` added to AGENTS.md research references section
7. **Schema Consistency**: YAML frontmatter fields match python-qa-quick schema (message_id, timestamp, message_type, target, tools_executed, critical_count, high_count, medium_count, low_count)
8. **Task List Preserved**: The task list format in `<answer>` section remains unchanged (emoji-based priority sections with checkboxes)

## Implementor Checklist
- [ ] PLAN-001: Add thinking section content specification (section 2.5 with 3 subsections)
- [ ] PLAN-002: Update output format with thinking/answer wrapper and YAML frontmatter
- [ ] PLAN-003: Update all three examples with thinking/answer structure
- [ ] PLAN-004: Renumber workflow sections after insertion (3→4, 4→5, 5→6)
- [ ] PLAN-005: Add typescript-qa-quick to AGENTS.md thinking/answer pattern list
- [ ] PLAN-006: Add research reference to AGENTS.md research references section
