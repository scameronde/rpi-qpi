# Codebase-Analyzer Agent-to-Agent Communication Optimization Implementation Plan

## Inputs
- Research report(s) used: `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md`
- User request summary: Improve codebase-analyzer agent communication based on research findings

## Verified Current State

### Fact 1: Codebase-analyzer uses inline code descriptions instead of explicit excerpts
- **Evidence:** `agent/codebase-analyzer.md:95-96`
- **Excerpt:**
  ```markdown
  * **Step 1**: Validates input using `schema.validate()` (Line 12).
  * **Step 2**: Calls `UserService.find()` (Line 15).
  ```

### Fact 2: Researcher agent expects explicit code excerpts with 1-6 lines
- **Evidence:** `agent/researcher.md:56`
- **Excerpt:**
  ```markdown
  Sub-agents must provide: **(a)** exact file path **(b)** suggested line range **(c)** 1–6 line excerpt.
  ```

### Fact 3: Planner agent expects explicit code excerpts for evidence
- **Evidence:** `agent/planner.md:101-105`
- **Excerpt:**
  ```markdown
  ## Verified Current State
  For each claim:
  - **Fact:** ...
  - **Evidence:** `path:line-line`
  - **Excerpt:** (1–6 lines)
  ```

### Fact 4: QA agents only need execution path tracing
- **Evidence:** `agent/python-qa-thorough.md:110`
- **Excerpt:**
  ```markdown
  - Use `codebase-analyzer` to trace complex execution paths for testability analysis
  ```

### Fact 5: QA agents cannot use context7 tool
- **Evidence:** `agent/python-qa-thorough.md:19` (and similar in typescript-qa-thorough.md)
- **Excerpt:**
  ```markdown
  context7: false # use Sub-Agent 'codebase-analyzer' instead
  ```

### Fact 6: Codebase-analyzer output has 4 fixed sections
- **Evidence:** `agent/codebase-analyzer.md:88-115`
- **Excerpt:**
  ```markdown
  ### 1. Execution Flow
  [...]
  ### 2. Data Model & State
  [...]
  ### 3. Dependencies
  [...]
  ### 4. Edge Cases Identified
  ```

### Fact 7: Researcher agent cannot use context7 tool
- **Evidence:** `agent/researcher.md:19`
- **Excerpt:**
  ```markdown
  context7: false # use Sub-Agent 'codebase-analyzer' instead
  ```

### Fact 8: No thinking/answer separation in current template
- **Evidence:** `agent/codebase-analyzer.md:84-116` (entire output template has no `<thinking>` tags)
- **Excerpt:**
  ```markdown
  ## Logic Analysis: [Component Name]
  
  ### 1. Execution Flow
  [No thinking/answer separation visible in template]
  ```

## Goals / Non-Goals

**Goals:**
1. Add explicit code excerpts to codebase-analyzer output to match consumer requirements
2. Implement thinking/answer separation for debugging and token optimization
3. Support query-specific output depth to reduce token waste for focused queries
4. Add structured message envelope for workflow debugging and correlation
5. Update consumer agent prompts with delegation examples

**Non-Goals:**
- Changing the core analysis logic or tracing capabilities
- Modifying the Markdown format (already optimal per research)
- Breaking backward compatibility for existing workflows
- Adding search capabilities (out of scope for analyzer)

## Design Overview

### Architecture Changes

1. **Output Template Enhancement** (codebase-analyzer.md):
   - Add `<thinking>` section before analysis for reasoning process
   - Wrap existing template in `<answer>` tags
   - Add YAML frontmatter for message metadata
   - Modify execution flow steps to include code excerpts
   - Make sections 2-4 conditional based on `analysis_depth` parameter

2. **Consumer Prompt Updates** (6 agents):
   - Add delegation examples to researcher.md
   - Add delegation examples to planner.md
   - Add delegation examples with `execution_only` depth to python-qa-thorough.md
   - Add delegation examples with `execution_only` depth to typescript-qa-thorough.md
   - Add delegation examples with `execution_only` depth to opencode-qa-thorough.md
   - Document expected response format and depth levels

3. **Data Flow:**
   ```
   Consumer Agent 
     → Invokes codebase-analyzer with analysis_depth parameter
     → Analyzer reads files, generates <thinking>
     → Analyzer produces <answer> with excerpts + depth-specific sections
     → Consumer receives YAML frontmatter + thinking + structured findings
     → Consumer extracts excerpts directly (no duplicate reads)
   ```

## Implementation Instructions (For Implementor)

### Phase 1: High-Impact Core Changes

#### PLAN-001: Add Thinking/Answer Separation to Output Template
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Locate line 84 (start of "## Output Template" section)
  2. Replace the template section (lines 84-116) with the new structure:
     - Add instruction to include `<thinking>` section before the analysis
     - In `<thinking>`, document: file reading strategy, tracing decisions, ambiguity resolution, data flow mapping
     - Wrap existing "## Logic Analysis" template in `<answer>` tags
  3. Keep all 4 existing sections (Execution Flow, Data Model & State, Dependencies, Edge Cases) unchanged for now
- **Interfaces / Pseudocode:**
  ```markdown
  ## Output Template
  
  Return your findings in this strict format:
  
  ```markdown
  <thinking>
  [Document your analysis process:]
  - Files I will read: [list with reasoning]
  - Entry point identified: [file:line with how you found it]
  - Tracing strategy: [which imports to follow, which to skip]
  - Data flow mapping: [how data transforms through the component]
  - Ambiguities encountered: [any unclear imports or DI patterns]
  </thinking>
  
  <answer>
  ## Logic Analysis: [Component Name]
  
  ### 1. Execution Flow
  [existing template content]
  
  ### 2. Data Model & State
  [existing template content]
  
  ### 3. Dependencies
  [existing template content]
  
  ### 4. Edge Cases Identified
  [existing template content]
  </answer>
  ```
  ```
- **Evidence:** Research report lines 85-109 (Finding 2) shows Anthropic recommends thinking/answer separation
- **Done When:** 
  - Lines 84-116 of agent/codebase-analyzer.md contain new template with `<thinking>` and `<answer>` tags
  - Template instructs agent to document reasoning process in thinking section
  - All 4 existing sections remain within `<answer>` tags

#### PLAN-002: Add Code Excerpts to Execution Flow Section
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Within the new template created in PLAN-001, locate the "### 1. Execution Flow" section
  2. Modify the step format to include code excerpts:
     - After each step description, add "**Excerpt:**" field
     - Include 1-6 lines of actual source code in a code block
     - Use appropriate language syntax highlighting (typescript, python, etc.)
  3. Add instruction before the template: "For each execution step, include a 1-6 line code excerpt showing the actual implementation"
- **Interfaces / Pseudocode:**
  ```markdown
  ### 1. Execution Flow
  
  **Entry Point**: `src/path/file.ts:LineNumber`
  
  * **Step 1**: Validates input (Line 12)
    * **Excerpt:**
      ```typescript
      const result = schema.validate(input);
      if (!result.success) throw new ValidationError();
      ```
  * **Step 2**: Calls `UserService.find()` (Line 15)
    * **Trace**: `src/services/user.ts` -> function returns Promise<User>
    * **Excerpt:**
      ```typescript
      const user = await UserService.find(input.userId);
      ```
  * **Step 3**: Transforms data (Line 20-25)
    * **Logic**: Maps `user.id` to `payload.owner_id`
    * **Excerpt:**
      ```typescript
      const payload = {
        owner_id: user.id,
        amount: input.amount
      };
      ```
  ```
- **Evidence:** 
  - Research report lines 56-84 (Finding 1) shows format mismatch
  - `agent/researcher.md:56` requires "(c) 1–6 line excerpt"
  - `agent/planner.md:104` requires "**Excerpt:** (1–6 lines)"
- **Done When:**
  - Execution Flow section template includes "**Excerpt:**" field after each step
  - Template shows code block with syntax highlighting
  - Instruction above template tells agent to include 1-6 line excerpts for each step

#### PLAN-003: Add YAML Frontmatter for Message Envelope
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. In the template created in PLAN-001, add YAML frontmatter before the `<thinking>` tag
  2. Include these metadata fields:
     - `message_id`: auto-generated identifier (format: analysis-YYYY-MM-DD-NNN)
     - `timestamp`: ISO 8601 timestamp
     - `message_type`: fixed value "ANALYSIS_RESPONSE"
     - `analysis_depth`: the depth level used (execution_only/focused/comprehensive)
     - `target_file`: the file being analyzed
     - `target_component`: the function/class/component being analyzed
  3. Add instruction: "Generate a unique message_id using format analysis-YYYY-MM-DD-NNN where NNN is a sequential number"
- **Interfaces / Pseudocode:**
  ```markdown
  ---
  message_id: analysis-2026-01-18-001
  timestamp: 2026-01-18T12:00:00Z
  message_type: ANALYSIS_RESPONSE
  analysis_depth: comprehensive
  target_file: src/auth.ts
  target_component: processLogin
  ---
  
  <thinking>
  [reasoning]
  </thinking>
  
  <answer>
  [structured findings]
  </answer>
  ```
- **Evidence:** Research report lines 146-173 (Finding 4) shows industry standard message envelope pattern
- **Done When:**
  - Template includes YAML frontmatter with all 6 metadata fields
  - Instruction tells agent to generate message_id and populate fields
  - Frontmatter appears before `<thinking>` tag

### Phase 2: Query-Specific Depth Support

#### PLAN-004: Add Analysis Depth Parameter Recognition
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. Locate the "## Prime Directive" section (around line 32)
  2. After the Prime Directive section, add a new section "## Analysis Depth Levels"
  3. Document three depth levels with their semantics:
     - `execution_only`: Return only Section 1 (Execution Flow)
     - `focused`: Return Sections 1 and 3 (Execution Flow + Dependencies)
     - `comprehensive`: Return all 4 sections (default)
  4. Add instruction: "The Orchestrator may specify an `analysis_depth` parameter in the task description. If not specified, default to `comprehensive`."
- **Interfaces / Pseudocode:**
  ```markdown
  ## Analysis Depth Levels
  
  The Orchestrator may request different levels of analysis detail:
  
  - **execution_only**: For QA agents needing testability tracing
    - Include: Section 1 (Execution Flow) only
    - Skip: Data Model, Dependencies, Edge Cases
  
  - **focused**: For Planners needing implementation context
    - Include: Sections 1 (Execution Flow) and 3 (Dependencies)
    - Skip: Data Model, Edge Cases
  
  - **comprehensive**: For Researchers needing complete analysis (DEFAULT)
    - Include: All 4 sections
  
  Look for `analysis_depth: [level]` in the task description. If not specified, use `comprehensive`.
  ```
- **Evidence:** Research report lines 111-144 (Finding 3) shows QA agents waste 60-70% tokens receiving unused sections
- **Done When:**
  - New "## Analysis Depth Levels" section exists after Prime Directive
  - Three depth levels documented with section mappings
  - Instruction tells agent to check task description for analysis_depth parameter
  - Default is comprehensive for backward compatibility

#### PLAN-005: Make Template Sections Conditional Based on Depth
- **Change Type:** modify
- **File(s):** `agent/codebase-analyzer.md`
- **Instruction:**
  1. In the output template (modified in PLAN-001, PLAN-002, PLAN-003), add conditional instructions
  2. Before the template, add guidance:
     - "Always include Section 1 (Execution Flow)"
     - "For `focused` or `comprehensive` depth: include Section 3 (Dependencies)"
     - "For `comprehensive` depth only: include Sections 2 (Data Model & State) and 4 (Edge Cases)"
  3. Update the `analysis_depth` field in YAML frontmatter instruction to say: "Set to the actual depth level used"
- **Interfaces / Pseudocode:**
  ```markdown
  ## Output Template
  
  Based on the `analysis_depth` parameter:
  
  - **Always include**: Section 1 (Execution Flow)
  - **Include for `focused` and `comprehensive`**: Section 3 (Dependencies)
  - **Include for `comprehensive` only**: Sections 2 (Data Model & State) and 4 (Edge Cases)
  
  Return your findings in this strict format:
  
  [YAML frontmatter with analysis_depth field]
  
  <thinking>
  - Analysis depth requested: [execution_only/focused/comprehensive]
  - Sections I will include: [list based on depth]
  [other reasoning]
  </thinking>
  
  <answer>
  ## Logic Analysis: [Component Name]
  
  ### 1. Execution Flow
  [Always include this section]
  
  ### 2. Data Model & State
  [Include only if depth is comprehensive]
  
  ### 3. Dependencies
  [Include if depth is focused or comprehensive]
  
  ### 4. Edge Cases Identified
  [Include only if depth is comprehensive]
  </answer>
  ```
- **Evidence:** Research report lines 929-933 shows depth-to-section mapping for token savings
- **Done When:**
  - Template includes conditional instructions for sections based on depth
  - Guidance clearly states which sections to include for each depth level
  - `<thinking>` section instructs agent to note the depth level and sections to include

### Phase 3: Consumer Agent Prompt Updates

#### PLAN-006: Add Delegation Examples to Researcher Agent
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:**
  1. After the "## Tools & Delegation (STRICT)" section (around line 59), add a new section "## Delegating to codebase-analyzer"
  2. Include:
     - Instructions for providing target file, component name, and depth level
     - Example delegation with `comprehensive` depth (Researcher's typical use case)
     - Expected response format description
     - Note about extracting excerpts from response (no duplicate reads needed)
  3. Keep the existing sub-agent requirements (line 56) unchanged
- **Interfaces / Pseudocode:**
  ```markdown
  ## Delegating to codebase-analyzer
  
  When delegating logic analysis, provide:
  1. Target file and component name
  2. Analysis depth: `comprehensive` (default for research)
  3. Clear focus for the analysis
  
  Example:
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Analyze the authentication flow in src/auth/login.ts, processLogin function. Analysis depth: comprehensive."
  })
  
  Expected response format:
  - YAML frontmatter with metadata (message_id, timestamp, target info)
  - <thinking> section (inspect if analysis seems incorrect or incomplete)
  - <answer> section with 4 sections:
    1. Execution Flow (with code excerpts for each step)
    2. Data Model & State
    3. Dependencies
    4. Edge Cases
  
  Extract excerpts directly from the response - the analyzer provides 1-6 line code excerpts for each execution step, matching the format required for your research report.
  ```
- **Evidence:** 
  - Research report lines 1003-1029 (Recommendation 5) shows need for delegation examples
  - `agent/researcher.md:56` shows sub-agent requirements
- **Done When:**
  - New section "## Delegating to codebase-analyzer" exists after line 59
  - Section includes delegation example with comprehensive depth
  - Section documents expected response format
  - Section notes that excerpts are provided (no duplicate reads needed)

#### PLAN-007: Add Delegation Examples to Planner Agent
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. After the "## Tools & Delegation (STRICT)" section (around line 57), add a new section "## Delegating to codebase-analyzer"
  2. Include:
     - Instructions for providing target file, component name, and depth level
     - Example delegation with `focused` depth (Planner's typical use case - needs Execution + Dependencies only)
     - Expected response format description
     - Note about using excerpts for Evidence fields in plan
  3. Note that Planner has context7 available as alternative, but analyzer provides structured analysis
- **Interfaces / Pseudocode:**
  ```markdown
  ## Delegating to codebase-analyzer
  
  When delegating logic analysis (alternative to context7), provide:
  1. Target file and component name
  2. Analysis depth: `focused` (for implementation planning - Execution + Dependencies)
  3. Clear focus for the analysis
  
  Example:
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Analyze the authentication middleware in src/auth/middleware.ts, authGuard function. Analysis depth: focused."
  })
  
  Expected response format:
  - YAML frontmatter with metadata
  - <thinking> section (review if analysis is unclear)
  - <answer> section with 2 sections for `focused` depth:
    1. Execution Flow (with code excerpts)
    3. Dependencies
  
  Use the code excerpts directly in your plan's "Evidence" and "Excerpt" fields - the analyzer provides them in the exact format required for implementation instructions.
  ```
- **Evidence:** 
  - Research report lines 1003-1029 (Recommendation 5)
  - `agent/planner.md:104` shows Evidence and Excerpt requirements
  - Research report line 733 shows Planner needs ~350 tokens (sections 1+3)
- **Done When:**
  - New section "## Delegating to codebase-analyzer" exists after line 57
  - Section includes delegation example with `focused` depth
  - Section documents expected response format (2 sections for focused)
  - Section notes excerpts can be used directly in plan Evidence fields

#### PLAN-008: Add Delegation Examples to Python QA Agent
- **Change Type:** modify
- **File(s):** `agent/python-qa-thorough.md`
- **Instruction:**
  1. Locate line 110 where codebase-analyzer is mentioned ("Use `codebase-analyzer` to trace complex execution paths")
  2. Replace that single line with an expanded subsection under "### Phase 4"
  3. Include:
     - When to use codebase-analyzer (complex execution paths for testability)
     - Example delegation with `execution_only` depth (QA only needs execution tracing)
     - Expected response format (only Section 1)
     - Token savings note (saves ~70% by using execution_only)
- **Interfaces / Pseudocode:**
  ```markdown
  ### Phase 4: External Best Practices (Optional)
  
  - If needed, delegate to `web-search-researcher` to verify current Python best practices
  
  #### Using codebase-analyzer for Testability Tracing
  
  For complex execution paths that need testability analysis, use `execution_only` depth:
  
  Example:
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Trace execution path for testability analysis: src/utils/validator.py, validate_input function. Analysis depth: execution_only."
  })
  
  Expected response format:
  - YAML frontmatter with metadata
  - <thinking> section (trace reasoning)
  - <answer> section with only Section 1 (Execution Flow with code excerpts)
  
  This returns only the execution path (~250 tokens instead of ~800), saving approximately 70% tokens while providing the exact information needed for testability analysis.
  ```
- **Evidence:**
  - Research report lines 1031-1044 (Recommendation 5 for QA agents)
  - `agent/python-qa-thorough.md:110` current delegation mention
  - Research report lines 695-699 shows QA saves 69% with execution_only
- **Done When:**
  - Line 110 area expanded into detailed subsection
  - Subsection includes delegation example with `execution_only` depth
  - Subsection documents expected response (Section 1 only)
  - Token savings (~70%) mentioned

#### PLAN-009: Add Delegation Examples to TypeScript QA Agent
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-thorough.md`
- **Instruction:**
  1. Locate line 151 where codebase-analyzer is mentioned ("Use `codebase-analyzer` to trace complex execution paths")
  2. Replace that single line with an expanded subsection under "### Phase 4"
  3. Include identical content to PLAN-008, but adjust for TypeScript context:
     - Example uses `.ts` extension instead of `.py`
     - Example function name appropriate for TypeScript (e.g., validateUser)
     - Same depth (`execution_only`), same token savings (~70%)
- **Interfaces / Pseudocode:**
  ```markdown
  ### Phase 4: External Best Practices (Optional)
  
  - If needed, delegate to `web-search-researcher` to verify current TypeScript best practices
  
  #### Using codebase-analyzer for Testability Tracing
  
  For complex execution paths that need testability analysis, use `execution_only` depth:
  
  Example:
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Trace execution path for testability analysis: src/utils/validator.ts, validateUser function. Analysis depth: execution_only."
  })
  
  Expected response format:
  - YAML frontmatter with metadata
  - <thinking> section (trace reasoning)
  - <answer> section with only Section 1 (Execution Flow with code excerpts)
  
  This returns only the execution path (~250 tokens instead of ~800), saving approximately 70% tokens while providing the exact information needed for testability analysis.
  ```
- **Evidence:**
  - Research report lines 1031-1044 (Recommendation 5)
  - `agent/typescript-qa-thorough.md:151` current delegation mention
  - Research report lines 695-699 shows token savings
- **Done When:**
  - Line 151 area expanded into detailed subsection
  - Subsection includes TypeScript-specific delegation example with `execution_only` depth
  - Subsection documents expected response (Section 1 only)
  - Token savings (~70%) mentioned

#### PLAN-010: Add Delegation Examples to OpenCode QA Agent
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Search for references to codebase-analyzer in the file (research mentions lines 19, 279, 378)
  2. If there's already a delegation pattern documented, enhance it with depth parameter
  3. If not, add a subsection similar to PLAN-008 and PLAN-009 in the appropriate phase
  4. Include:
     - Delegation example with `execution_only` depth for analyzing agent logic
     - Example might reference agent/*.md files for analysis
     - Same token savings (~70%)
- **Interfaces / Pseudocode:**
  ```markdown
  #### Using codebase-analyzer for Agent Logic Tracing
  
  For complex agent logic or tool implementations, use `execution_only` depth:
  
  Example:
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Trace execution path: tool/searxng-search.ts, main tool function. Analysis depth: execution_only."
  })
  
  Expected response format:
  - YAML frontmatter with metadata
  - <thinking> section (trace reasoning)
  - <answer> section with only Section 1 (Execution Flow with code excerpts)
  
  This returns only the execution path, saving approximately 70% tokens while providing the information needed for quality analysis.
  ```
- **Evidence:**
  - Research report lines 1031-1044 (Recommendation 5)
  - Research report lines 34-36 mentions opencode-qa-thorough as consumer
- **Done When:**
  - Delegation example with `execution_only` depth added to appropriate section
  - Example references OpenCode-specific file types (agent/*.md, tool/*.ts)
  - Expected response format documented
  - Token savings mentioned

### Phase 4: Documentation and Verification

#### PLAN-011: Update AGENTS.md Documentation
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate the section about agent communication patterns or subagent usage
  2. Add a new subsection "## Codebase-Analyzer Output Format and Depth Levels"
  3. Document:
     - The three depth levels (execution_only, focused, comprehensive)
     - Use cases for each depth level
     - Output structure (YAML frontmatter + thinking + answer)
     - Token efficiency gains (reference research report findings)
     - How to specify depth in delegation calls
  4. Include a reference to the research report
- **Interfaces / Pseudocode:**
  ```markdown
  ## Codebase-Analyzer Output Format and Depth Levels
  
  The codebase-analyzer subagent supports three analysis depth levels to optimize token usage:
  
  ### Depth Levels
  
  1. **execution_only** (~250 tokens, 70% savings)
     - Use case: QA agents needing testability analysis
     - Sections: Execution Flow only (with code excerpts)
  
  2. **focused** (~350 tokens, 56% savings)
     - Use case: Planner agents needing implementation context
     - Sections: Execution Flow + Dependencies
  
  3. **comprehensive** (~950 tokens, complete analysis)
     - Use case: Researcher agents needing full analysis
     - Sections: All 4 (Execution Flow, Data Model, Dependencies, Edge Cases)
  
  ### Output Structure
  
  All responses include:
  - YAML frontmatter (message_id, timestamp, target info, depth used)
  - `<thinking>` section (reasoning process)
  - `<answer>` section (structured findings with code excerpts)
  
  ### Specifying Depth
  
  Include `Analysis depth: [level]` in the task prompt:
  
  ```
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Analyze processOrder in src/orders.ts. Analysis depth: focused."
  })
  ```
  
  If not specified, defaults to `comprehensive`.
  
  ### Token Efficiency
  
  Based on research (thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md):
  - QA workflows: -35% to -45% token usage
  - Planner workflows: -31% to -41% token usage
  - Researcher workflows: +13% tokens but eliminates duplicate file reads
  
  ### Code Excerpts
  
  All execution steps include 1-6 line code excerpts in the exact format required by Researcher and Planner agents:
  
  ```markdown
  * **Step 1**: Validates input (Line 12)
    * **Excerpt:**
      ```typescript
      const result = schema.validate(input);
      if (!result.success) throw new ValidationError();
      ```
  ```
  
  This eliminates the need for consumer agents to re-read files to extract excerpts.
  ```
- **Evidence:** Research report lines 1061-1092 (Implementation Roadmap and Acceptance Criteria)
- **Done When:**
  - New section exists in AGENTS.md documenting depth levels
  - Section includes use cases, token savings, and delegation syntax
  - Section references research report
  - Code examples show proper delegation format

#### PLAN-012: Create Verification Test Cases Document
- **Change Type:** create
- **File(s):** `thoughts/shared/plans/2026-01-18-Codebase-Analyzer-Communication-Optimization-TESTS.md`
- **Instruction:**
  1. Create a test cases document for manual verification
  2. For each depth level, define:
     - Sample delegation call
     - Expected sections in output
     - Token count verification (approximate)
     - Excerpt format verification
  3. Include checklist items from research report Acceptance Criteria (lines 1093-1105)
- **Interfaces / Pseudocode:**
  ```markdown
  # Codebase-Analyzer Communication Optimization - Verification Test Cases
  
  ## Test Case 1: execution_only Depth
  
  **Delegation:**
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Analyze the searxng-search tool main function. Analysis depth: execution_only."
  })
  
  **Expected Output:**
  - YAML frontmatter with `analysis_depth: execution_only`
  - `<thinking>` section present
  - `<answer>` section with only Section 1 (Execution Flow)
  - Each step has `**Excerpt:**` field with 1-6 lines of code
  - No Section 2 (Data Model), Section 3 (Dependencies), or Section 4 (Edge Cases)
  - Approximate token count: 250-300 tokens
  
  **Verification:**
  - [ ] YAML frontmatter present with all required fields
  - [ ] analysis_depth field shows "execution_only"
  - [ ] Only Section 1 present in answer
  - [ ] Each step includes code excerpt
  - [ ] Token count approximately 250-300
  
  ## Test Case 2: focused Depth
  
  [Similar structure for focused depth - expects Sections 1 and 3]
  
  ## Test Case 3: comprehensive Depth
  
  [Similar structure for comprehensive depth - expects all 4 sections]
  
  ## Test Case 4: Default Depth (No Parameter)
  
  **Delegation:**
  task({
    subagent_type: "codebase-analyzer",
    prompt: "Analyze the researcher agent delegation logic."
  })
  
  **Expected Output:**
  - Should default to `comprehensive` depth
  - All 4 sections present
  
  **Verification:**
  - [ ] YAML frontmatter shows `analysis_depth: comprehensive`
  - [ ] All 4 sections present
  
  ## Acceptance Criteria Checklist
  
  From research report (lines 1093-1105):
  
  - [ ] 1. Excerpt Format: Every execution step includes 1-6 line code excerpt in separate field
  - [ ] 2. Thinking Separation: Output wrapped in `<thinking>` and `<answer>` tags
  - [ ] 3. Depth Levels: Agent accepts and correctly handles execution_only, focused, comprehensive
  - [ ] 4. Message Envelope: YAML frontmatter includes message_id, timestamp, message_type, analysis_depth, target_file, target_component
  - [ ] 5. Consumer Updates: All 6 consumer agents have delegation examples in prompts
  - [ ] 6. Backward Compatibility: Default depth level is comprehensive
  - [ ] 7. Documentation: AGENTS.md updated with new patterns
  - [ ] 8. Verification: Sample delegations tested for each depth level
  ```
- **Evidence:** Research report lines 1093-1105 (Acceptance Criteria section)
- **Done When:**
  - File created: `thoughts/shared/plans/2026-01-18-Codebase-Analyzer-Communication-Optimization-TESTS.md`
  - Document contains test cases for all 3 depth levels plus default
  - Each test case includes delegation example, expected output, and verification checklist
  - Acceptance criteria from research report included as final checklist

## Verification Tasks (If Assumptions Exist)

No unverified assumptions - all claims verified against source files in research report.

## Acceptance Criteria

Implementation is complete when:

1. **Excerpt Format**: `agent/codebase-analyzer.md` template includes `**Excerpt:**` field with 1-6 line code blocks for each execution step
2. **Thinking Separation**: Output template wrapped in `<thinking>` and `<answer>` tags with clear separation
3. **Depth Levels**: Agent recognizes `analysis_depth` parameter and produces appropriate sections (execution_only → Section 1 only, focused → Sections 1+3, comprehensive → all 4 sections)
4. **Message Envelope**: YAML frontmatter includes all 6 fields (message_id, timestamp, message_type, analysis_depth, target_file, target_component)
5. **Consumer Updates**: All 6 consumer agents (researcher, planner, python-qa-thorough, typescript-qa-thorough, opencode-qa-thorough, and implicit others) have delegation examples
6. **Backward Compatibility**: Default depth is `comprehensive` when not specified
7. **Documentation**: `AGENTS.md` has new section documenting depth levels and output format
8. **Test Cases**: Verification test cases document created with checklist

## Implementor Checklist

### Phase 1: High-Impact Core Changes
- [ ] PLAN-001: Add Thinking/Answer Separation to Output Template
- [ ] PLAN-002: Add Code Excerpts to Execution Flow Section  
- [ ] PLAN-003: Add YAML Frontmatter for Message Envelope

### Phase 2: Query-Specific Depth Support
- [ ] PLAN-004: Add Analysis Depth Parameter Recognition
- [ ] PLAN-005: Make Template Sections Conditional Based on Depth

### Phase 3: Consumer Agent Prompt Updates
- [ ] PLAN-006: Add Delegation Examples to Researcher Agent
- [ ] PLAN-007: Add Delegation Examples to Planner Agent
- [ ] PLAN-008: Add Delegation Examples to Python QA Agent
- [ ] PLAN-009: Add Delegation Examples to TypeScript QA Agent
- [ ] PLAN-010: Add Delegation Examples to OpenCode QA Agent

### Phase 4: Documentation and Verification
- [ ] PLAN-011: Update AGENTS.md Documentation
- [ ] PLAN-012: Create Verification Test Cases Document
