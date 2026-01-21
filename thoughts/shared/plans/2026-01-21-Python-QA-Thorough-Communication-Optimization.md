# Python-QA-Thorough Communication Optimization Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-21-Python-QA-Thorough-Agent-Communication.md`
- User request: "Add thinking/answer separation to python-qa-thorough agent based on research findings"
- Related research: `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md` (framework baseline)

## Verified Current State

### Fact 1: python-qa-thorough Agent Lacks Thinking/Answer Separation
- **Evidence:** `agent/python-qa-thorough.md:214-223`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
  
  ```markdown
  # Python QA Analysis: [Target]
  
  ## Scan Metadata
  [No <thinking> wrapper visible]
  ```
  ```
- **Implication:** Reports mix reasoning with findings, preventing debugging and token optimization

### Fact 2: python-qa-thorough Not Listed in AGENTS.md Pattern List
- **Evidence:** `AGENTS.md:29-38`
- **Excerpt:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
  - **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
  - **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
  - **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
  - **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
  - **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning
  - **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning
  ```
- **Implication:** python-qa-quick IS listed, python-qa-thorough is NOT (gap in documentation)

### Fact 3: Current Template Has 9 Sections (4 Fixed + 5 Conditional)
- **Evidence:** `agent/python-qa-thorough.md:217-305`
- **Excerpt:**
  ```markdown
  ## Scan Metadata
  - Date: YYYY-MM-DD
  - Target: [path]
  - Auditor: python-qa-thorough
  - Tools: ruff, pyright, bandit, interrogate, manual analysis
  
  ## Executive Summary
  [...]
  
  ## Automated Tool Findings
  [...]
  
  ## Manual Quality Analysis
  [...]
  
  ## Improvement Plan (For Implementor)
  [...]
  ```
- **Implication:** Template is well-structured; adding thinking/answer wrapper will not require content restructuring

### Fact 4: Agent Has 5 Phases in Operational Workflow
- **Evidence:** `agent/python-qa-thorough.md:36-210`
- **Excerpt:**
  ```markdown
  ### Phase 1: Target Identification
  
  ### Phase 2: Automated Tool Execution
  
  ### Phase 3: Manual Quality Analysis (Evidence-Based Only)
  
  ### Phase 4: External Best Practices (Optional)
  
  ### Phase 5: Plan Generation
  ```
- **Implication:** Need to insert Phase 4.5 for documenting analysis process before Plan Generation

### Fact 5: Phase 2 Executes 4 Python Tools in Parallel
- **Evidence:** `agent/python-qa-thorough.md:44-52`
- **Excerpt:**
  ```python
  1. Execute ruff, pyright, bandit, interrogate in parallel using bash tool:
     ```bash
     ruff check [target]
     pyright [target]
     bandit -r [target]
     interrogate --fail-under 80 -vv --omit-covered-files --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
     ```
  2. Capture and categorize automated findings
  3. If tool not found, note in report and skip that tool
  ```
- **Implication:** <thinking> section must log all 4 tool commands + outputs + versions

### Fact 6: Agent Uses Specialized Subagent Delegations
- **Evidence:** `agent/python-qa-thorough.md:107-205`
- **Excerpt:**
  ```markdown
  ## Delegating to codebase-locator for Test Files
  [lines 107-157]
  
  #### Delegating to codebase-analyzer for Testability Tracing
  [lines 162-181]
  
  ## Delegating to codebase-pattern-finder for Code Duplication
  [lines 184-204]
  ```
- **Implication:** <thinking> section must log subagent delegations (which agent, task description, findings summary)

### Fact 7: Prioritization Hierarchy Defined at Lines 318-323
- **Evidence:** `agent/python-qa-thorough.md:318-323`
- **Excerpt:**
  ```markdown
  ### Prioritization
  
  Use this hierarchy:
  1. **Critical**: Security vulnerabilities (bandit HIGH/MEDIUM)
  2. **High**: Type errors blocking type checking (pyright errors)
  3. **Medium**: Testability issues, maintainability risks
  4. **Low**: Readability improvements, style consistency
  ```
- **Implication:** <thinking> section must reference this hierarchy when explaining prioritization reasoning

## Goals / Non-Goals

### Goals
1. Add `<thinking>` / `<answer>` separation to python-qa-thorough output template
2. Define explicit content specification for `<thinking>` section (Phase 4.5)
3. Add YAML frontmatter message envelope to enable workflow correlation
4. Update AGENTS.md to list python-qa-thorough in thinking/answer pattern section
5. Include tool output verbosity strategy to cap thinking section at ~300 tokens

### Non-Goals
- Modifying the `<answer>` section content (keep existing template structure unchanged)
- Changing agent's analysis logic or quality checks
- Implementing QA-Planner agent (separate effort)
- Testing on live Python code (verification is manual/future)

## Design Overview

The implementation follows the pattern established by opencode-qa-thorough (per research report):

**Data Flow:**
1. Agent performs Phases 1-4 (target identification, tool execution, manual analysis, optional external research)
2. Agent executes **NEW Phase 4.5**: Document analysis process in structured format
3. Agent wraps Phase 4.5 output in `<thinking>` tags
4. Agent executes Phase 5: Generate improvement plan, wrap in `<answer>` tags with YAML frontmatter
5. Both sections written to single file: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`

**Control Flow:**
- Insert Phase 4.5 instructions after line 205 (after Phase 4, before Phase 5)
- Update Phase 5 instruction to reference Phase 4.5 for <thinking> content
- Modify template at line 214 to add YAML frontmatter + `<thinking>` wrapper + `<answer>` wrapper
- Update AGENTS.md line 37 to insert python-qa-thorough entry

**Message Envelope:**
- YAML frontmatter includes: message_id, correlation_id, timestamp, message_type, qa_agent, qa_agent_version, target_path, target_type, overall_status, critical_issues, high_priority_issues, medium_priority_issues, low_priority_issues, tools_used, tools_unavailable

**Thinking Section Content:**
- Phase 1: Target discovery log
- Phase 2: Tool execution log (commands, versions, statuses, summaries with verbosity control)
- Phase 3: Manual analysis log (files read, checks performed, issue counts)
- Phase 4: Subagent delegation log (agent names, tasks, findings summaries)
- Phase 5: Prioritization reasoning + synthesis decisions

## Implementation Instructions (For Implementor)

### PLAN-001: Add Phase 4.5 Documentation Instructions
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/python-qa-thorough.md`
- **Instruction:**
  1. Insert new section after line 205 (after "## Delegating to codebase-pattern-finder for Code Duplication", before "### Phase 5: Plan Generation")
  2. Add heading: `### Phase 4.5: Document Analysis Process (For <thinking> Section)`
  3. Add instruction paragraph: "Log the following information for user debugging and transparency:"
  4. Add 6 numbered subsections:
     - **1. Target Discovery**: How target was identified, files discovered (list with line counts), scope
     - **2. Automated Tool Execution**: Tool versions, exact commands, outputs (status + summary), tool availability, verbosity guideline (see verbosity strategy below)
     - **3. File Analysis**: Which files were read (paths + line ranges), analysis categories performed, issue counts per category
     - **4. Delegation Log**: Subagent invocations (agent name, task description, scope/depth level), subagent responses (summary of findings), specific delegations to codebase-locator (tests_only), codebase-analyzer (execution_only), codebase-pattern-finder, web-search-researcher
     - **5. Prioritization Reasoning**: Why each issue was categorized as Critical/High/Medium/Low, reference to prioritization hierarchy (lines 318-323)
     - **6. Synthesis Decisions**: How findings were grouped into QA-XXX tasks, why specific recommendations were chosen, trade-offs considered
  5. Add **Tool Output Verbosity Strategy** subsection:
     - If tool produces ≤10 issues: Include all in thinking summary
     - If tool produces 11-50 issues: Include first 10 + count ("... and 15 more similar issues")
     - If tool produces >50 issues: Include first 5 + category breakdown + count
     - Include example showing pyright with 150 errors (from research report lines 722-727)
- **Evidence:** `agent/python-qa-thorough.md:205` (insertion point after Phase 4 delegation section)
- **Pseudocode/Example:**
  ```markdown
  ### Phase 4.5: Document Analysis Process (For <thinking> Section)
  
  Log the following information for user debugging and transparency:
  
  1. **Target Discovery**:
     - How target was identified (user-provided path vs codebase-locator delegation)
     - Files discovered (list with line counts)
     - Scope (file/module/package/directory)
  
  2. **Automated Tool Execution**:
     [detailed specification as above]
  
  [... sections 3-6 ...]
  
  **Tool Output Verbosity Strategy**:
  
  - If tool produces ≤10 issues: Include all in thinking summary
  - If tool produces 11-50 issues: Include first 10 + count ("... and 15 more similar issues")
  - If tool produces >50 issues: Include first 5 + category breakdown + count ("... and 200 more issues: 150 code quality, 30 type errors, 20 security")
  
  **Example** (pyright with 150 errors):
  ```
  pyright status: FAILED - 150 errors, 20 warnings
  pyright summary: First 5 errors:
    - src/auth.py:42 - Missing type annotation for parameter 'user'
    [... 4 more ...]
  ... and 145 more errors: 120 missing annotations, 15 type mismatches, 10 import errors
  ```
  ```
- **Done When:**
  - `agent/python-qa-thorough.md` contains new Phase 4.5 section after line 205
  - Phase 4.5 includes all 6 information categories
  - Tool verbosity strategy is documented with concrete thresholds and example
  - `grep "Phase 4.5" agent/python-qa-thorough.md` returns match

### PLAN-002: Update Phase 5 to Reference Phase 4.5
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/python-qa-thorough.md`
- **Instruction:**
  1. Locate Phase 5 heading at line 206 (will be ~250 after PLAN-001)
  2. Update first bullet point from:
     ```
     1. Synthesize all findings (automated + manual) into priority-ranked improvement tasks
     ```
     to:
     ```
     1. Document analysis process from Phase 4.5 in <thinking> section
     2. Synthesize all findings (automated + manual) into priority-ranked improvement tasks in <answer> section
     ```
  3. Update second bullet to specify wrapper structure:
     ```
     2. Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with three-part structure:
        - YAML frontmatter (message envelope)
        - <thinking> section (analysis process log from Phase 4.5)
        - <answer> section (QA report using template below)
     ```
- **Evidence:** `agent/python-qa-thorough.md:206-210` (current Phase 5 content)
- **Done When:**
  - Phase 5 instructions explicitly reference Phase 4.5 for <thinking> content
  - Instructions specify three-part structure (frontmatter + thinking + answer)
  - `grep -A 5 "Phase 5: Plan Generation" agent/python-qa-thorough.md | grep "Phase 4.5"` returns match

### PLAN-003: Add YAML Frontmatter and Wrapper Tags to Template
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/python-qa-thorough.md`
- **Instruction:**
  1. Locate template start at line 214 (will be ~260 after PLAN-001/002)
  2. Replace template introduction:
     ```markdown
     Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
     
     ```markdown
     # Python QA Analysis: [Target]
     ```
  3. With three-part structured template:
     ```markdown
     Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
     
     <thinking>
     Analysis Process Log:
     
     Phase 1 - Target Identification:
     - User provided: [path] OR delegated to codebase-locator
     - Found targets: [list of Python files with line counts]
     - Scope: [file/module/package/directory]
     
     Phase 2 - Automated Tool Execution:
     - ruff version: [X.X.X]
     - ruff command: ruff check [target]
     - ruff status: [PASSED/FAILED - X violations found]
     - ruff summary: [brief summary or "clean"]
     
     - pyright version: [X.X.X]
     - pyright command: pyright [target]
     - pyright status: [PASSED/FAILED - X errors, Y warnings]
     - pyright summary: [brief summary or "clean"]
     
     - bandit version: [X.X.X]
     - bandit command: bandit -r [target]
     - bandit status: [PASSED/FAILED - X issues: Y high, Z medium, W low]
     - bandit summary: [brief summary or "clean"]
     
     - interrogate version: [X.X.X]
     - interrogate command: interrogate --fail-under 80 -vv --omit-covered-files --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
     - interrogate status: [PASSED/FAILED - XX% coverage]
     - interrogate summary: [X missing docstrings]
     
     - Tool availability: [list any tools that were not found]
     
     Phase 3 - Manual Quality Analysis:
     - Files read: [list with line ranges]
     - Readability checks performed: Function length, docstring quality, variable naming, complex conditionals
     - Readability issues found: [count]
     
     - Maintainability checks performed: Code duplication, magic numbers, import organization, module cohesion, hard-coded config
     - Maintainability issues found: [count]
     
     - Testability checks performed: Missing test files, tight coupling, dependency injection, test coverage
     - Testability issues found: [count]
     
     Phase 4 - Subagent Delegations:
     - codebase-locator (tests_only scope): [task description, files found]
     - codebase-analyzer (execution_only depth): [task description, findings summary]
     - codebase-pattern-finder: [task description, patterns found]
     - web-search-researcher: [task description, findings summary]
     
     Phase 5 - Prioritization Reasoning:
     - Critical issues: [count] (reasoning: security vulnerabilities from bandit HIGH/MEDIUM)
     - High issues: [count] (reasoning: type errors blocking pyright, missing test coverage for critical paths)
     - Medium issues: [count] (reasoning: maintainability risks, testability improvements)
     - Low issues: [count] (reasoning: readability improvements, style consistency)
     
     Synthesis Decisions:
     - How QA-XXX tasks were grouped: [by category, by file, by priority]
     - Why specific recommendations were chosen: [brief reasoning]
     - Trade-offs considered: [e.g., fix vs suppress, refactor vs document]
     </thinking>
     
     <answer>
     ---
     message_id: qa-python-YYYY-MM-DD-NNN
     correlation_id: qa-workflow-[target-slug]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: QA_REPORT
     qa_agent: python-qa-thorough
     qa_agent_version: "1.1"
     target_path: [path]
     target_type: python_module
     overall_status: [Pass/Conditional Pass/Fail]
     critical_issues: [count]
     high_priority_issues: [count]
     medium_priority_issues: [count]
     low_priority_issues: [count]
     tools_used: [ruff, pyright, bandit, interrogate]
     tools_unavailable: []
     ---
     
     # Python QA Analysis: [Target]
     
     ## Scan Metadata
     - Date: YYYY-MM-DD
     - Target: [path]
     - Auditor: python-qa-thorough
     - Tools: ruff, pyright, bandit, interrogate, manual analysis
     
     [... rest of existing template unchanged ...]
     ```
  4. Add closing `</answer>` tag after the template end (after References section at line ~305)
- **Evidence:** `agent/python-qa-thorough.md:214-305` (current template without wrappers)
- **Done When:**
  - Template starts with `<thinking>` section containing Phase 1-5 logs
  - Template includes YAML frontmatter after `<answer>` opening tag
  - Template ends with `</answer>` closing tag
  - Existing QA report content (Scan Metadata through References) is wrapped in `<answer>` section unchanged
  - `grep -c "<thinking>" agent/python-qa-thorough.md` returns 1
  - `grep -c "<answer>" agent/python-qa-thorough.md` returns 2 (opening + closing)
  - `grep -c "message_id:" agent/python-qa-thorough.md` returns at least 1

### PLAN-004: Update AGENTS.md to List python-qa-thorough
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate "Agents Using This Pattern" section at line 29
  2. Find the python-qa-quick entry at line 37
  3. Insert new entry immediately after python-qa-quick (before web-search-researcher):
     ```markdown
     - **python-qa-thorough** (`agent/python-qa-thorough.md`): Documents comprehensive Python QA reasoning (tool execution, manual analysis, prioritization decisions)
     ```
  4. Ensure alphabetical ordering is NOT broken (python-qa-quick, python-qa-thorough are adjacent, not sorted)
- **Evidence:** `AGENTS.md:37` (python-qa-quick entry exists, python-qa-thorough missing)
- **Done When:**
  - python-qa-thorough entry exists at line 38 (or nearby after insertion)
  - Entry format matches other entries (bold name, file path in parentheses, colon, description)
  - Description differentiates from python-qa-quick ("comprehensive Python QA" vs "automated tool execution")
  - `grep "python-qa-thorough" AGENTS.md` returns match in "Agents Using This Pattern" section

### PLAN-005: Add Research Reference to AGENTS.md
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate "Research References" section at lines 54-60
  2. Insert new reference after python-qa-quick entry (line 56):
     ```markdown
     - `thoughts/shared/research/2026-01-21-Python-QA-Thorough-Agent-Communication.md` (python-qa-thorough communication pattern analysis)
     ```
  3. Maintain chronological ordering (2026-01-21 is most recent)
- **Evidence:** `AGENTS.md:56` (python-qa-quick reference exists at this location)
- **Done When:**
  - New research reference appears after python-qa-quick reference
  - Reference format matches existing entries (backtick path, parenthetical description)
  - `grep "2026-01-21-Python-QA-Thorough" AGENTS.md` returns match in Research References section

## Verification Tasks

### Verification 1: Template Structure Validation
- **Assumption:** The three-part template (frontmatter + thinking + answer) will render correctly in Markdown viewers
- **Verification Step:** After PLAN-003, manually inspect `agent/python-qa-thorough.md` template section to ensure:
  1. `<thinking>` and `<answer>` tags are outside markdown code fences
  2. YAML frontmatter is inside `<answer>` section, before markdown heading
  3. Template code fences are properly closed
- **Pass Condition:** Template has valid structure: `<thinking>...</thinking>\n\n<answer>\n---\nYAML\n---\n\n# Markdown\n...\n</answer>`

### Verification 2: Phase Numbering Consistency
- **Assumption:** Inserting Phase 4.5 will not break references to existing phases
- **Verification Step:** After PLAN-001, grep for all phase references in agent prompt to ensure no broken links
- **Pass Condition:** All phase references (1, 2, 3, 4, 4.5, 5) exist and are in sequence; no orphaned references to old numbering

### Verification 3: AGENTS.md Entry Formatting
- **Assumption:** Markdown formatting in AGENTS.md list is consistent
- **Verification Step:** After PLAN-004, verify that python-qa-thorough entry uses same bold/parentheses/colon format as adjacent entries
- **Pass Condition:** `grep -A 1 "python-qa-quick" AGENTS.md | grep "python-qa-thorough"` shows consistent formatting

## Acceptance Criteria

**Structural Requirements:**
- [ ] `agent/python-qa-thorough.md` contains Phase 4.5 section with 6 information categories
- [ ] Phase 5 instructions reference Phase 4.5 for <thinking> content
- [ ] Template includes `<thinking>` section with Phase 1-5 logs and synthesis decisions
- [ ] Template includes YAML frontmatter with message_id, correlation_id, timestamp, message_type, target info, summary metrics, tools_used, tools_unavailable
- [ ] Template includes `<answer>` section wrapping existing QA report structure
- [ ] Tool output verbosity strategy documented with thresholds (≤10, 11-50, >50) and example

**Documentation Requirements:**
- [ ] `AGENTS.md` lists python-qa-thorough in "Agents Using This Pattern" section (line ~38)
- [ ] `AGENTS.md` includes research reference for 2026-01-21-Python-QA-Thorough-Agent-Communication.md

**Content Preservation:**
- [ ] Existing QA report template content (Scan Metadata through References) unchanged in `<answer>` section
- [ ] Phase 1-4 instructions unchanged (no modifications to analysis logic)
- [ ] Prioritization hierarchy (lines 318-323) unchanged
- [ ] Examples section (lines 354-421) unchanged

**Quality Gates:**
- [ ] No broken markdown formatting (code fences properly closed)
- [ ] No orphaned phase references (all phases 1-5 + 4.5 exist)
- [ ] YAML frontmatter follows established pattern from other agents (compare with opencode-qa-thorough)
- [ ] Thinking section content specification matches research recommendations (lines 645-687)

## Implementor Checklist
- [ ] PLAN-001: Add Phase 4.5 documentation instructions (6 categories + verbosity strategy)
- [ ] PLAN-002: Update Phase 5 to reference Phase 4.5
- [ ] PLAN-003: Add YAML frontmatter and wrapper tags to template
- [ ] PLAN-004: Update AGENTS.md to list python-qa-thorough
- [ ] PLAN-005: Add research reference to AGENTS.md
