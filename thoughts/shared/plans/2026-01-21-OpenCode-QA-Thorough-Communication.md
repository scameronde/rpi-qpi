# OpenCode-QA-Thorough Communication Pattern Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md`
- User request: Implement thinking/answer separation for opencode-qa-thorough agent
- Research findings: Agent lacks `<thinking>`/`<answer>` separation despite being a primary user-facing agent

## Verified Current State

### Fact 1: Agent Output Template Structure
- **Fact:** The opencode-qa-thorough agent uses a fixed template structure without thinking/answer separation
- **Evidence:** `agent/opencode-qa-thorough.md:176-268`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
  
  ````markdown
  ```markdown
  # OpenCode QA Analysis: [Target]
  
  ## Scan Metadata
  - Date: YYYY-MM-DD
  ```
  ```

### Fact 2: Agent Is Primary User-Facing
- **Fact:** Agent has `mode: all` and writes directly to `thoughts/shared/qa/` for user consumption
- **Evidence:** `agent/opencode-qa-thorough.md:3` (mode field) + `agent/opencode-qa-thorough.md:176` (output instruction)
- **Excerpt:**
  ```yaml
  mode: all
  ```

### Fact 3: Agent Not Listed in AGENTS.md Pattern List
- **Fact:** opencode-qa-thorough is not documented in AGENTS.md thinking/answer pattern list despite meeting criteria
- **Evidence:** `AGENTS.md:29-36`
- **Excerpt:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
  - **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
  - **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
  - **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
  - **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
  - **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
  ```

### Fact 4: Five-Phase Workflow Generates Analysis Process
- **Fact:** Agent has operational workflow with phases 1-5 that generate reasoning suitable for `<thinking>` section
- **Evidence:** `agent/opencode-qa-thorough.md:37-163`
- **Excerpt:**
  ```markdown
  ### Phase 1: Target Identification
  
  1. If user provides explicit path (e.g., `agent/planner.md` or `skills/opencode/`), use it
  2. If no path provided, delegate to `codebase-locator` to find agent/*.md or skills/*/SKILL.md files
  ```

## Goals / Non-Goals

**Goals:**
- Add `<thinking>`/`<answer>` separation to QA report output template
- Add YAML frontmatter message envelope for workflow correlation
- Document thinking section content specification (what to log)
- Update AGENTS.md to include opencode-qa-thorough in pattern list
- Maintain backward compatibility (answer section keeps same format)

**Non-Goals:**
- Change QA report findings format or structure
- Modify automated tool execution logic
- Change delegation patterns to subagents
- Implement QA-Planner token stripping functionality (out of scope)

## Design Overview

1. **Thinking Section Content**: Log target discovery, tool execution, file analysis, delegation, prioritization reasoning, and synthesis decisions
2. **Message Envelope**: Add YAML frontmatter with message_id, correlation_id, timestamp, message_type, target metadata, and summary metrics
3. **Answer Section**: Wrap existing template (lines 176-268) in `<answer>` tags, no changes to content
4. **Documentation**: Add entry to AGENTS.md thinking/answer pattern list with description of reasoning logged

## Implementation Instructions (For Implementor)

### PLAN-001: Add Thinking Section Content Specification
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:** 
  1. Insert new section after line 163 (after Phase 4, before Phase 5)
  2. Add heading: `### Phase 4.5: Document Analysis Process (For <thinking> Section)`
  3. Add content specifying 6 information categories to log:
     - Target Discovery: how target identified, files discovered
     - Tool Execution: exact commands, tool outputs, availability
     - File Analysis: files read with line ranges, sections analyzed
     - Delegation Log: subagent invocations with task descriptions and responses
     - Prioritization Reasoning: why each issue categorized as Critical/High/Medium/Low
     - Synthesis Decisions: how findings grouped into QA-XXX tasks, trade-offs
  4. Use numbered list format for clarity
  5. Include brief examples for each category
- **Pseudocode:**
  ```markdown
  ### Phase 4.5: Document Analysis Process (For <thinking> Section)
  
  Log the following information for user debugging and transparency:
  
  1. **Target Discovery**:
     - How target was identified (user-provided path vs codebase-locator delegation)
     - Files discovered (list with line counts)
  
  2. **Tool Execution**:
     - Exact commands executed (yamllint, markdownlint, custom checks)
     - Tool outputs (summary if passed, full output if failed)
     - Tool availability (note if any tools were unavailable)
  
  [... continue for all 6 categories]
  ```
- **Evidence:** Research recommendation from `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md:659-690` (Recommendation 4)
- **Done When:** 
  - New Phase 4.5 section exists at line ~164
  - All 6 information categories documented
  - Section is between Phase 4 and Phase 5

### PLAN-002: Add YAML Frontmatter Message Envelope to Template
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Locate line 176 (start of template: "Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:")
  2. After the opening triple-backticks (line ~177), insert YAML frontmatter block
  3. Add fields: message_id, correlation_id, timestamp, message_type, qa_agent_version, target_path, target_type, overall_status, critical_issues, high_priority_issues, improvement_opportunities
  4. Use format: `message_id: qa-YYYY-MM-DD-NNN` (auto-generate from timestamp + sequence)
  5. Include instructional comments for dynamic values
  6. Place YAML block BEFORE the `# OpenCode QA Analysis: [Target]` heading
- **Pseudocode:**
  ```markdown
  ````markdown
  ---
  message_id: qa-2026-01-21-001  # Auto-generate: qa-{date}-{sequence}
  correlation_id: qa-workflow-{target-slug}  # From user or auto-generate
  timestamp: 2026-01-21T14:30:00Z  # ISO 8601 format
  message_type: QA_REPORT
  qa_agent_version: "1.0"
  target_path: agent/example.md  # Actual target path
  target_type: agent  # agent|skill
  overall_status: Conditional Pass  # Pass|Conditional Pass|Fail
  critical_issues: 1
  high_priority_issues: 2
  improvement_opportunities: 3
  ---
  
  # OpenCode QA Analysis: [Target]
  ```
- **Evidence:** Research recommendation from `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md:550-608` (Recommendation 2)
- **Done When:**
  - YAML frontmatter exists at start of template
  - All 11 required fields present
  - Fields include comments explaining dynamic value generation

### PLAN-003: Wrap Template in Thinking/Answer Tags
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Locate line 176 (template instruction line)
  2. After "Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:", insert `<thinking>` opening tag
  3. Add thinking section structure with 6 categories from Phase 4.5
  4. Close thinking section with `</thinking>` tag
  5. Insert `<answer>` opening tag before YAML frontmatter (from PLAN-002)
  6. Locate end of template (line ~268, closing triple-backticks)
  7. Insert `</answer>` closing tag before the closing triple-backticks
  8. Update Phase 5 instruction (line ~165) to reference wrapping content in tags
- **Pseudocode:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
  
  <thinking>
  Analysis Process Log:
  
  Phase 1 - Target Identification:
  - User provided: [path] OR delegated to codebase-locator
  - Found targets: [list of files]
  
  Phase 2 - Skill Loading:
  - Loaded: opencode skill (version X.X)
  - Extracted validation rules: [count] rules
  
  Phase 3 - Automated Tool Execution:
  - yamllint command: [exact command]
  - yamllint output: [summary or "PASSED"]
  - markdownlint command: [exact command]
  - markdownlint output: [summary or "PASSED"]
  
  Phase 4 - Manual Analysis:
  - Files read: [list with line ranges]
  - Clarity issues found: [count]
  - Configuration issues found: [count]
  
  Phase 5 - Prioritization Reasoning:
  - Critical issues: [count] (reasoning: configuration errors preventing agent loading)
  - High issues: [count] (reasoning: tool permission misalignment)
  
  Delegations Made:
  - codebase-locator: [task description, files found]
  - codebase-pattern-finder: [task description, patterns found]
  </thinking>
  
  <answer>
  ````markdown
  ---
  [YAML frontmatter from PLAN-002]
  ---
  
  # OpenCode QA Analysis: [Target]
  [... rest of existing template unchanged ...]
  ```
  ````
  </answer>
  ```
- **Evidence:** Research recommendation from `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md:464-531` (Recommendation 1)
- **Done When:**
  - `<thinking>` section exists before `<answer>` section
  - Thinking section includes all 6 Phase categories (Target, Skill, Tools, Manual, Prioritization, Delegations)
  - `<answer>` section wraps entire existing template
  - Template content unchanged inside `<answer>` tags

### PLAN-004: Update Phase 5 Instruction to Reference Thinking/Answer Structure
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Locate Phase 5: Plan Generation section (line ~164)
  2. Update instruction #1 to mention logging analysis process in `<thinking>` section
  3. Add bullet point: "Document analysis process log from Phase 4.5 in `<thinking>` section"
  4. Update instruction #2 to mention wrapping template in `<answer>` tags
- **Pseudocode:**
  ```markdown
  ### Phase 5: Plan Generation
  
  1. Synthesize all findings (automated + manual) into priority-ranked improvement tasks
  2. **Document analysis process**: Log information from Phase 4.5 in `<thinking>` section
  3. Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
     - For agents: Use agent filename (e.g., `2026-01-17-Planner-Agent.md`)
     - For skills: Use skill name (e.g., `2026-01-17-OpenCode-Skill.md`)
     - Wrap QA report in `<thinking>` and `<answer>` tags per template
  4. Return summary with link to plan file
  ```
- **Evidence:** Logical connection between Phase 4.5 content specification and Phase 5 output generation
- **Done When:**
  - Phase 5 instruction explicitly mentions `<thinking>` section
  - Phase 5 instruction references Phase 4.5 content
  - Instruction mentions wrapping output in tags

### PLAN-005: Add opencode-qa-thorough to AGENTS.md Thinking/Answer Pattern List
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate line 29 (start of "Agents Using This Pattern" list)
  2. Find last entry in list (web-search-researcher, line ~36)
  3. Add new list item after web-search-researcher entry
  4. Format: `- **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning (tool execution, file reads, prioritization decisions)`
  5. Maintain alphabetical ordering if list is sorted (add after "implementation-controller", before "task-executor")
  6. Ensure consistent formatting with other entries (bold agent name, file path in parentheses, colon, description)
- **Pseudocode:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): Documents task execution reasoning (parsing, verification, strategy, execution, adaptations)
  - **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning (task extraction, delegation, parsing, verification, commit)
  - **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning (implemented per research 2026-01-18)
  - **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning (implemented per research 2026-01-18)
  - **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning (implemented per research 2026-01-18)
  - **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
  - **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning (tool execution, file reads, prioritization decisions)
  ```
- **Evidence:** Research recommendation from `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md:613-651` (Recommendation 3)
- **Done When:**
  - New list item exists in AGENTS.md at line ~37
  - Entry follows same format as other entries
  - Description mentions key reasoning types (tool execution, file reads, prioritization)

## Verification Tasks

None - all claims verified against live code.

## Acceptance Criteria

- [ ] Phase 4.5 section exists in agent definition with 6 information categories documented
- [ ] QA report template includes YAML frontmatter with 11 required fields
- [ ] QA report template wrapped in `<thinking>` and `<answer>` tags
- [ ] Thinking section includes all 6 Phase categories (Target, Skill, Tools, Manual, Prioritization, Delegations)
- [ ] Answer section contains existing template content unchanged
- [ ] Phase 5 instruction references Phase 4.5 and mentions wrapping output in tags
- [ ] AGENTS.md thinking/answer pattern list includes opencode-qa-thorough entry
- [ ] All changes maintain backward compatibility (answer section format unchanged)

## Implementor Checklist

- [ ] PLAN-001: Add Thinking Section Content Specification
- [ ] PLAN-002: Add YAML Frontmatter Message Envelope to Template
- [ ] PLAN-003: Wrap Template in Thinking/Answer Tags
- [ ] PLAN-004: Update Phase 5 Instruction to Reference Thinking/Answer Structure
- [ ] PLAN-005: Add opencode-qa-thorough to AGENTS.md Thinking/Answer Pattern List
