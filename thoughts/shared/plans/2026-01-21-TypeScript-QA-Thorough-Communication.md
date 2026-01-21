# TypeScript-QA-Thorough Agent Communication Pattern Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-21-TypeScript-QA-Thorough-Agent-Communication.md`
- User request: Implement thinking/answer separation for typescript-qa-thorough agent based on research findings

## Verified Current State

### Fact 1: Agent definition exists without thinking/answer separation
- **Evidence:** `agent/typescript-qa-thorough.md:256-264`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
  
  ```markdown
  # TypeScript QA Analysis: [Target]
  
  ## Scan Metadata
  - Date: YYYY-MM-DD
  - Target: [path]
  ```
  ```

### Fact 2: Agent uses mode "all" (can be user-facing)
- **Evidence:** `agent/typescript-qa-thorough.md:3`
- **Excerpt:**
  ```yaml
  mode: all
  ```

### Fact 3: AGENTS.md lists typescript-qa-quick but NOT typescript-qa-thorough
- **Evidence:** `AGENTS.md:39` (typescript-qa-quick IS listed)
- **Excerpt:**
  ```markdown
  - **typescript-qa-quick** (`agent/typescript-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  ```
- **Evidence:** `AGENTS.md:29-40` (typescript-qa-thorough is NOT present in this section)
- **Excerpt:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): ...
  - **implementation-controller** (`agent/implementation-controller.md`): ...
  [... other agents listed ...]
  - **typescript-qa-quick** (`agent/typescript-qa-quick.md`): ...
  - **web-search-researcher** (`agent/web-search-researcher.md`): ...
  ```

### Fact 4: Agent has 5-phase operational workflow
- **Evidence:** `agent/typescript-qa-thorough.md:34-247` (Phases 1-5)
- **Excerpt:**
  ```markdown
  ### Phase 1: Target Identification
  ### Phase 2: Automated Tool Execution
  ### Phase 3: Manual Quality Analysis (Evidence-Based Only)
  ### Phase 4: External Best Practices (Optional)
  ### Phase 5: Plan Generation
  ```

### Fact 5: Template structure is 9 sections (4 fixed + 5 conditional)
- **Evidence:** `agent/typescript-qa-thorough.md:256-367` (complete template)
- **Excerpt:**
  ```markdown
  ## Scan Metadata
  ## Executive Summary
  ## Automated Tool Findings
  ## Manual Quality Analysis
  ## Improvement Plan (For Implementor)
  ## Acceptance Criteria
  ## Implementor Checklist
  ## References
  ```

## Goals / Non-Goals

### Goals
1. Add `<thinking>` and `<answer>` separation to QA report output template
2. Add YAML frontmatter message envelope to `<answer>` section
3. Add Phase 4.5 documentation for thinking section content specification
4. Update AGENTS.md to list typescript-qa-thorough in thinking/answer pattern section
5. Maintain backward compatibility (QA report content remains the same inside `<answer>`)

### Non-Goals
- Changing the existing QA report structure or content
- Modifying the 5-phase workflow (only adding thinking documentation)
- Changing agent mode, tools, or temperature settings
- Implementing QA-Planner consumption logic (that's a separate agent)

## Design Overview

The implementation follows the established pattern documented in AGENTS.md:

1. **Wrap template output**: Add `<thinking>` section BEFORE existing template, wrap template in `<answer>` tags
2. **Add message envelope**: Insert YAML frontmatter at start of `<answer>` section
3. **Document thinking content**: Add explicit guidance for what to log during each phase
4. **Update registry**: Add agent to AGENTS.md list

**Data flow:**
```
Phase 1-4 (existing) → Phase 4.5 (NEW: log to thinking) → Phase 5 (wrap in thinking/answer)
```

**Control flow:**
- No change to agent logic
- Only change to output format (wrapper tags + frontmatter)

## Implementation Instructions (For Implementor)

### PLAN-001: Add Phase 4.5 Thinking Section Content Specification
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-thorough.md`
- **Instruction:** 
  1. Locate Phase 4 section ending (line ~246, before "### Phase 5: Plan Generation")
  2. Insert new section "### Phase 4.5: Document Analysis Process (For <thinking> Section)"
  3. Add explicit list of 6 information categories to log:
     - Target Discovery (how target identified, files discovered)
     - Tool Execution (commands, outputs, availability)
     - File Analysis (which files read, which categories checked)
     - Delegation Log (subagent invocations, responses)
     - Prioritization Reasoning (why each priority level chosen)
     - Synthesis Decisions (how findings grouped, why recommendations chosen)
  4. Each category should have 2-3 bullet points describing what to log
- **Interfaces / Pseudocode:**
  ```markdown
  ### Phase 4.5: Document Analysis Process (For <thinking> Section)
  
  Log the following information for user debugging and transparency:
  
  1. **Target Discovery**:
     - How target was identified (user-provided path vs codebase-locator delegation)
     - Files discovered (list with line counts)
  
  2. **Tool Execution**:
     - Exact commands executed (tsc, eslint, knip, optional plugins)
     - Tool outputs (summary if passed, full output if failed)
     - Tool availability (note if any tools were unavailable)
  
  [... continue for all 6 categories ...]
  ```
- **Evidence:** Research report recommendation 4 (lines 732-783)
- **Done When:** 
  - New "Phase 4.5" section exists in agent/typescript-qa-thorough.md
  - Section contains all 6 information categories
  - Section is located between Phase 4 and Phase 5

### PLAN-002: Update Phase 5 to Add Thinking/Answer Wrapper
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-thorough.md`
- **Instruction:**
  1. Locate "### Phase 5: Plan Generation" section (line ~247)
  2. Update step 2 to specify thinking/answer structure:
     - OLD: "Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`"
     - NEW: "Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with `<thinking>` and `<answer>` separation (see template below)"
  3. Ensure instruction references Phase 4.5 for thinking content
- **Interfaces / Pseudocode:**
  ```markdown
  ### Phase 5: Plan Generation
  
  1. Synthesize all findings (automated + manual) into priority-ranked improvement tasks
  2. Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with `<thinking>` and `<answer>` separation (see template below)
  3. Return summary with link to plan file
  ```
- **Evidence:** Research report recommendation 1 (lines 556-656)
- **Done When:**
  - Phase 5 step 2 mentions thinking/answer separation
  - Phase 5 references Phase 4.5 for thinking content guidance

### PLAN-003: Update QA Report Template with Thinking Section
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-thorough.md`
- **Instruction:**
  1. Locate "## Plan File Structure" section (line ~253)
  2. Find template start: "Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:" (line ~255)
  3. Replace entire template block (lines 257-367) with new structure:
     - Add `<thinking>` section at top with placeholders for Phase 4.5 categories
     - Add `<answer>` opening tag
     - Add YAML frontmatter with message envelope fields
     - Keep existing template content unchanged (Scan Metadata through References)
     - Add `</answer>` closing tag at end
  4. Ensure thinking section includes explicit placeholders for all 6 categories from Phase 4.5
- **Interfaces / Pseudocode:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:
  
  <thinking>
  Analysis Process Log:
  
  Phase 1 - Target Identification:
  - [Document target discovery from Phase 1]
  
  Phase 2 - Automated Tool Execution:
  - [Document tool commands and outputs from Phase 2]
  
  Phase 3 - Manual Analysis:
  - [Document files read and issues found from Phase 3]
  
  Phase 4 - Best Practices Research:
  - [Document any web-search-researcher delegations from Phase 4]
  
  Phase 4.5 - Prioritization:
  - [Document reasoning for Critical/High/Medium/Low classifications]
  
  Phase 4.5 - Synthesis:
  - [Document how findings were grouped into QA-XXX tasks]
  </thinking>
  
  <answer>
  ---
  message_id: qa-typescript-YYYY-MM-DD-NNN
  correlation_id: qa-workflow-[target-slug]
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  message_type: QA_REPORT
  qa_agent_version: "1.1"
  target_path: [path]
  target_type: typescript
  overall_status: [Pass/Conditional Pass/Fail]
  critical_issues: [count]
  high_priority_issues: [count]
  improvement_opportunities: [count]
  ---
  
  # TypeScript QA Analysis: [Target]
  
  ## Scan Metadata
  [... existing template content unchanged ...]
  
  ## References
  [... existing template content unchanged ...]
  </answer>
  ```
- **Evidence:** Research report recommendation 1 (lines 573-639)
- **Done When:**
  - Template starts with `<thinking>` section
  - Template includes all 6 Phase 4.5 categories in thinking section
  - Template has `<answer>` wrapper around existing content
  - YAML frontmatter contains all 10 required fields (message_id, correlation_id, timestamp, message_type, qa_agent_version, target_path, target_type, overall_status, critical_issues, high_priority_issues, improvement_opportunities)
  - Existing template content (Scan Metadata through References) unchanged

### PLAN-004: Update AGENTS.md Thinking/Answer Pattern List
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate "#### Agents Using This Pattern" section (line ~29)
  2. Find the line for typescript-qa-quick (line ~39)
  3. Insert new line AFTER typescript-qa-quick line:
     - Format: `- **typescript-qa-thorough** (`agent/typescript-qa-thorough.md`): Documents comprehensive TypeScript QA reasoning (tool execution, manual analysis, prioritization decisions)`
  4. Maintain alphabetical/logical grouping (thorough after quick)
- **Interfaces / Pseudocode:**
  ```markdown
  #### Agents Using This Pattern
  
  [... existing entries ...]
  - **typescript-qa-quick** (`agent/typescript-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  - **typescript-qa-thorough** (`agent/typescript-qa-thorough.md`): Documents comprehensive TypeScript QA reasoning (tool execution, manual analysis, prioritization decisions)
  - **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
  ```
- **Evidence:** Research report recommendation 3 (lines 682-730)
- **Done When:**
  - New line exists in AGENTS.md after typescript-qa-quick entry
  - Entry follows same format as other agents
  - Entry mentions "tool execution, manual analysis, prioritization decisions"

### PLAN-005: Update Research References in AGENTS.md
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate "#### Research References" section (line ~56)
  2. Find the list of research reports
  3. Insert new line at appropriate position (after TypeScript-QA-Quick reference):
     - Format: `- thoughts/shared/research/2026-01-21-TypeScript-QA-Thorough-Agent-Communication.md (typescript-qa-thorough communication pattern analysis)`
  4. Maintain chronological order by date
- **Interfaces / Pseudocode:**
  ```markdown
  #### Research References
  
  - `thoughts/shared/research/2026-01-21-Python-QA-Quick-Agent-Communication.md` (python-qa-quick communication pattern analysis)
  - `thoughts/shared/research/2026-01-21-TypeScript-QA-Quick-Agent-Communication.md` (typescript-qa-quick communication pattern analysis)
  - `thoughts/shared/research/2026-01-21-TypeScript-QA-Thorough-Agent-Communication.md` (typescript-qa-thorough communication pattern analysis)
  - `thoughts/shared/research/2026-01-21-Python-QA-Thorough-Agent-Communication.md` (python-qa-thorough communication pattern analysis)
  [... other entries ...]
  ```
- **Evidence:** Pattern consistency with existing research references at AGENTS.md:56-64
- **Done When:**
  - New research reference line exists in AGENTS.md
  - Entry follows same format as other research references
  - Chronological ordering maintained

## Verification Tasks

None. All changes are template/documentation updates with clear observable conditions.

## Acceptance Criteria

- [ ] Phase 4.5 section added to agent/typescript-qa-thorough.md with all 6 information categories
- [ ] Phase 5 updated to reference thinking/answer separation
- [ ] QA report template wrapped in `<thinking>` and `<answer>` tags
- [ ] YAML frontmatter added to template with all 10 required fields
- [ ] Existing template content (Scan Metadata through References) unchanged
- [ ] AGENTS.md thinking/answer pattern list includes typescript-qa-thorough entry
- [ ] AGENTS.md research references section includes 2026-01-21-TypeScript-QA-Thorough research report
- [ ] All file modifications use exact line numbers and preserve existing content

## Implementor Checklist
- [ ] PLAN-001: Add Phase 4.5 thinking section content specification
- [ ] PLAN-002: Update Phase 5 to reference thinking/answer wrapper
- [ ] PLAN-003: Update QA report template with thinking/answer structure
- [ ] PLAN-004: Add typescript-qa-thorough to AGENTS.md pattern list
- [ ] PLAN-005: Add research reference to AGENTS.md
