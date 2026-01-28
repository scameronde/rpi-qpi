# Agent System Standardization Implementation Plan

## Inputs
- Research report used: `thoughts/shared/research/2026-01-27-Agent-System-Analysis.md`
- User request summary: Standardize agent response formats, harmonize scope parameters, and document evidence citation formats across all agents

## Verified Current State

### Message Envelope Implementation

**Fact:** 8 agents implement YAML frontmatter + thinking/answer separation (codebase-analyzer, codebase-locator, codebase-pattern-finder, thoughts-analyzer, thoughts-locator, web-search-researcher, task-executor, implementation-controller)

**Evidence:** `thoughts/shared/research/2026-01-27-Agent-System-Analysis.md:526-535`

**Excerpt:**
```markdown
**Agents implementing structured responses**:

- codebase-analyzer.md
- codebase-locator.md
- codebase-pattern-finder.md
- thoughts-analyzer.md
- thoughts-locator.md
- web-search-researcher.md
- task-executor.md
- implementation-controller.md
```

**Fact:** 5 primary agents do NOT implement message envelopes (mission-architect, specifier, epic-planner, researcher, planner)

**Evidence:** `thoughts/shared/research/2026-01-27-Agent-System-Analysis.md:74-114`

**Excerpt:**
```markdown
2. **Agents WITHOUT structured output**:
   - **Evidence:** `.opencode/agent/mission-architect.md:136-142` (no YAML frontmatter specification)
   - **Evidence:** `.opencode/agent/specifier.md:123-131` (no message envelope specification)
   - **Evidence:** `.opencode/agent/epic-planner.md:144-151` (no message envelope specification)
```

### Scope Parameter Variance

**Fact:** codebase-locator uses `search_scope` parameter with values: tests_only, paths_only, comprehensive

**Evidence:** `.opencode/agent/codebase-locator.md:48-62`

**Excerpt:**
```markdown
**Valid Values:**

1. **`tests_only`** (~80 tokens, 75% savings)
2. **`paths_only`** (~120 tokens, 62% savings)
3. **`comprehensive`** (~320 tokens, complete atlas)
```

**Fact:** thoughts-locator uses `search_scope` parameter with values: paths_only, focused, comprehensive

**Evidence:** `.opencode/agent/thoughts-locator.md:32-61`

**Excerpt:**
```markdown
**Valid Values:**

1. **`paths_only`** (~180 tokens, 28% savings)
2. **`focused`** (~220 tokens, 15% savings)
3. **`comprehensive`** (~280 tokens, complete results)
```

**Fact:** codebase-analyzer uses `analysis_depth` parameter with values: execution_only, focused, comprehensive

**Evidence:** `.opencode/agent/codebase-analyzer.md:44-63`

**Excerpt:**
```markdown
### Depth Level Semantics

1. **`execution_only`**: Return only Section 1 (Execution Flow)
2. **`focused`**: Return Sections 1 and 3 (Execution Flow + Dependencies)
3. **`comprehensive`**: Return all 4 sections (default)
```

### Evidence Format Standards

**Fact:** Researcher and Planner document file:line evidence format

**Evidence:** `.opencode/agent/researcher.md:43-45`

**Excerpt:**
```markdown
2. **Evidence Required**
   - Any claim about code, config, or docs MUST include evidence (path + line range) and a short excerpt.
```

**Fact:** Web-search-researcher documents URL-based evidence format

**Evidence:** `.opencode/agent/web-search-researcher.md:181-193`

**Excerpt:**
```markdown
**Verified Code Example**:
- **Source URL**: [Direct link to documentation page with code]
- **Language**: [JavaScript, Python, TypeScript, etc.]
- **Excerpt** (lines [X-Y] from docs):
```

**Fact:** Mission-architect, specifier, and epic-planner do NOT explicitly document evidence citation formats

**Evidence:** `.opencode/agent/mission-architect.md:1-282` (full read, no evidence format section found)

## Goals / Non-Goals

**Goals:**
1. All agents use consistent YAML frontmatter + thinking/answer separation
2. Locator and analyzer agents use harmonized parameter naming
3. All agents document evidence citation format standards (dual format: file:line for codebase, URL for web)

**Non-Goals:**
- Changing agent versioning field names (e.g., executor_version vs controller_version) - this is intentional design
- Creating a central registry for message types - agents self-document their formats
- Standardizing message_type values across agents - each agent defines its own response type

## Design Overview

**Phase 1: Message Envelope Standardization**
- Add YAML frontmatter specification to 5 primary agents
- Add thinking/answer separation guidance to agent specifications
- Maintain document frontmatter for file outputs (missions/specs/epics)
- Add message envelope for agent responses (when agents delegate to each other)

**Phase 2: Scope Parameter Harmonization**
- Rename codebase-analyzer's `analysis_depth` → `output_scope`
- Align value semantics across all three agents
- Update delegation examples in consumer agents (researcher, planner)

**Phase 3: Evidence Format Documentation**
- Add dual evidence format section to all primary agents
- Consolidate format specification (file:line for codebase, URL for web)
- Ensure all agents reference the standard in their evidence requirements

## Implementation Instructions (For Implementor)

### PLAN-001: Add Message Envelope to mission-architect.md

- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `.opencode/agent/mission-architect.md`
- **Instruction:** 
  1. After line 126 (before "## Output Format (STRICT)"), add new section "## Response Format (Structured Output)"
  2. Add YAML frontmatter specification for mission-architect responses (when delegating or responding):
     ```markdown
     ---
     message_id: mission-architect-YYYY-MM-DD-NNN
     correlation_id: [if delegated task]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: MISSION_RESPONSE
     mission_architect_version: "1.0"
     mission_status: complete | in_progress
     ---
     ```
  3. Add thinking/answer separation guidance:
     ```markdown
     <thinking>
     [Document your mission discovery process, questions asked, user responses, convergence decisions]
     </thinking>
     
     <answer>
     [Present the mission statement document OR progress update to user]
     </answer>
     ```
  4. Clarify distinction: "Document frontmatter (in .md files you write) vs. Message envelope (in responses to delegating agents)"
  5. Update example at line 249-266 to show both document and message formats
- **Evidence:** `.opencode/agent/mission-architect.md:136-142` (current document frontmatter exists, need to add message envelope)
- **Done When:** mission-architect.md contains both document frontmatter specification (unchanged) and new message envelope specification (added)
- **Complexity:** simple

### PLAN-002: Add Message Envelope to specifier.md

- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `.opencode/agent/specifier.md`
- **Instruction:**
  1. After line 115 (before "## Output Format (STRICT)"), add new section "## Response Format (Structured Output)"
  2. Add YAML frontmatter specification:
     ```markdown
     ---
     message_id: specifier-YYYY-MM-DD-NNN
     correlation_id: [if delegated task]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: SPECIFICATION_RESPONSE
     specifier_version: "1.0"
     spec_status: complete | in_progress
     ---
     ```
  3. Add thinking/answer separation guidance matching mission-architect pattern
  4. Add distinction note: "Document frontmatter (in spec .md files) vs. Message envelope (in agent responses)"
- **Evidence:** `.opencode/agent/specifier.md:123-131` (current document frontmatter, need message envelope)
- **Done When:** specifier.md has message envelope specification added before Output Format section
- **Complexity:** simple

### PLAN-003: Add Message Envelope to epic-planner.md

- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `.opencode/agent/epic-planner.md`
- **Instruction:**
  1. After line 136 (before "## Output Format (STRICT)"), add new section "## Response Format (Structured Output)"
  2. Add YAML frontmatter specification:
     ```markdown
     ---
     message_id: epic-planner-YYYY-MM-DD-NNN
     correlation_id: [if delegated task]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: EPIC_RESPONSE
     epic_planner_version: "1.0"
     epic_status: ready-for-research | in_progress
     epics_created: N
     ---
     ```
  3. Add thinking/answer separation with note: "<thinking> documents decomposition strategy, dependency analysis; <answer> presents epic documents or progress"
  4. Add distinction: "Document frontmatter (in epic .md files) vs. Message envelope (in agent responses)"
- **Evidence:** `.opencode/agent/epic-planner.md:144-151` (current document frontmatter, need message envelope)
- **Done When:** epic-planner.md contains message envelope specification
- **Complexity:** simple

### PLAN-004: Add Message Envelope to researcher.md

- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `.opencode/agent/researcher.md`
- **Instruction:**
  1. After line 505 (before "## Execution Protocol"), add new section "## Response Format (Structured Output)"
  2. Add YAML frontmatter specification:
     ```markdown
     ---
     message_id: researcher-YYYY-MM-DD-NNN
     correlation_id: [if delegated task]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: RESEARCH_RESPONSE
     researcher_version: "1.0"
     research_status: complete | in_progress
     files_verified: N
     findings_count: N
     ---
     ```
  3. Add thinking/answer separation guidance:
     ```markdown
     <thinking>
     [Document research strategy, delegation decisions, verification process, synthesis logic]
     </thinking>
     
     <answer>
     [Present research report OR progress update with verified findings]
     </answer>
     ```
  4. Note: "Researcher writes .md reports (with document frontmatter) but also responds with message envelopes when delegated to"
- **Evidence:** `.opencode/agent/researcher.md:537-584` (Output Format section exists, need Response Format section before Execution Protocol)
- **Done When:** researcher.md contains message envelope specification before Execution Protocol section
- **Complexity:** simple

### PLAN-005: Add Message Envelope to planner.md

- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `.opencode/agent/planner.md`
- **Instruction:**
  1. After line 413 (before "## Execution Protocol"), add new section "## Response Format (Structured Output)"
  2. Add YAML frontmatter specification:
     ```markdown
     ---
     message_id: planner-YYYY-MM-DD-NNN
     correlation_id: [if delegated task]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: PLANNING_RESPONSE
     planner_version: "1.0"
     planning_status: complete | in_progress
     plan_tasks_count: N
     verification_tasks_count: N
     ---
     ```
  3. Add thinking/answer separation:
     ```markdown
     <thinking>
     [Document planning strategy, verification decisions, decomposition logic, assumption tracking]
     </thinking>
     
     <answer>
     [Present implementation plan documents OR planning progress update]
     </answer>
     ```
  4. Note: "Planner writes .md plan files (with different structure) but uses message envelope for agent-to-agent communication"
- **Evidence:** `.opencode/agent/planner.md:441-529` (Output Format section exists, need Response Format before Execution Protocol)
- **Done When:** planner.md contains message envelope specification
- **Complexity:** simple

### PLAN-006: Harmonize Scope Parameters - Rename analysis_depth to output_scope

- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `.opencode/agent/codebase-analyzer.md`
- **Instruction:**
  1. Replace all instances of `analysis_depth` with `output_scope` (approx 12 occurrences)
  2. Update line 44-63 section header from "### Depth Level Semantics" to "### Output Scope Semantics"
  3. Update YAML frontmatter example (line 154-162) field from `analysis_depth:` to `output_scope:`
  4. Keep value names unchanged: execution_only, focused, comprehensive
  5. Update all delegation examples to use `output_scope` parameter
  6. Add migration note: "Note: Previous versions used 'analysis_depth' parameter. Both are supported for backward compatibility, but 'output_scope' is preferred."
- **Evidence:** `.opencode/agent/codebase-analyzer.md:44-63` (current parameter name is analysis_depth)
- **Done When:** All references to analysis_depth are renamed to output_scope, backward compatibility note added
- **Complexity:** simple

### PLAN-007: Update consumer agents to use output_scope for codebase-analyzer

- **Action ID:** PLAN-007
- **Change Type:** modify
- **File(s):** 
  - `.opencode/agent/researcher.md`
  - `.opencode/agent/planner.md`
- **Instruction:**
  1. In researcher.md, update lines 189-207 (delegating to codebase-analyzer section):
     - Replace `analysis_depth: comprehensive` → `output_scope: comprehensive`
     - Replace `Depth Level` → `Output Scope`
     - Update example delegation from `analysis_depth: "focused"` → `output_scope: "focused"`
  2. In planner.md, update lines 199-282 (delegating to codebase-analyzer section):
     - Replace all `analysis_depth` → `output_scope`
     - Update section header "### Analysis Depth Levels" → "### Output Scope Levels"
     - Update all delegation examples
  3. Add note in both files: "For backward compatibility, codebase-analyzer still accepts 'analysis_depth' parameter"
- **Evidence:** `.opencode/agent/researcher.md:189-207` and `.opencode/agent/planner.md:217-221` (current delegation examples use analysis_depth)
- **Done When:** Both researcher.md and planner.md use output_scope in all codebase-analyzer delegation examples
- **Complexity:** simple

### PLAN-008: Harmonize codebase-locator scope values with thoughts-locator

- **Action ID:** PLAN-008
- **Change Type:** modify
- **File(s):** `.opencode/agent/codebase-locator.md`
- **Instruction:**
  1. Update line 48-62 scope values:
     - Keep: `tests_only` (unique to codebase-locator - no equivalent in thoughts-locator)
     - Rename: `paths_only` → `paths_only` (already aligned)
     - Keep: `comprehensive` → `comprehensive` (already aligned)
     - ADD NEW: `focused` value between paths_only and comprehensive
       - Use case: "Planner needs implementation + config files without tests"
       - Sections returned: Primary Implementation + Related Configuration
       - Token estimate: ~200 tokens (37% savings)
  2. Update documentation to show 4 scope values: tests_only, paths_only, focused, comprehensive
  3. Update regex parser to accept all 4 values
  4. Add note: "The 'focused' scope aligns with thoughts-locator's focused scope for consistency"
- **Evidence:** `.opencode/agent/codebase-locator.md:48-62` (currently only 3 values, missing 'focused')
- **Done When:** codebase-locator supports 4 scope values (tests_only, paths_only, focused, comprehensive) with 'focused' matching thoughts-locator pattern
- **Complexity:** simple

### PLAN-009: Document Evidence Citation Format in mission-architect.md

- **Action ID:** PLAN-009
- **Change Type:** modify
- **File(s):** `.opencode/agent/mission-architect.md`
- **Instruction:**
  1. After line 73 (sequential-thinking section), add new section "## Evidence & Citation Standards"
  2. Add content:
     ```markdown
     ## Evidence & Citation Standards
     
     Mission architects work primarily with user conversations and rarely cite external evidence. However, when referencing existing missions or related documentation:
     
     **For Internal Documents (Codebase/Thoughts):**
     - **Format:** `path/to/file.ext:line-line`
     - **Example:** `thoughts/shared/missions/2025-12-01-Auth.md:45-50`
     - **Include:** 1-6 line excerpt
     
     **For External Sources (Web Research):**
     - **Format:** URL + Date + Type
     - **Example:** https://example.com/guide (Type: blog, Date: 2025-12)
     - **Include:** Brief excerpt or summary
     
     Mission architects typically do NOT need citations (vision comes from user), but these formats apply when referencing prior work.
     ```
- **Evidence:** `.opencode/agent/mission-architect.md:1-282` (no evidence format section exists)
- **Done When:** mission-architect.md contains Evidence & Citation Standards section explaining dual format
- **Complexity:** simple

### PLAN-010: Document Evidence Citation Format in specifier.md

- **Action ID:** PLAN-010
- **Change Type:** modify
- **File(s):** `.opencode/agent/specifier.md`
- **Instruction:**
  1. After line 73 (sequential-thinking section), add new section "## Evidence & Citation Standards"
  2. Add content matching PLAN-009 pattern, but note: "Specifiers primarily cite mission documents and occasionally architectural references"
  3. Include both formats (file:line for missions/specs, URL for external architecture patterns)
- **Evidence:** `.opencode/agent/specifier.md:1-440` (no evidence format section exists)
- **Done When:** specifier.md contains Evidence & Citation Standards section
- **Complexity:** simple

### PLAN-011: Document Evidence Citation Format in epic-planner.md

- **Action ID:** PLAN-011
- **Change Type:** modify
- **File(s):** `.opencode/agent/epic-planner.md`
- **Instruction:**
  1. After line 71 (sequential-thinking section), add new section "## Evidence & Citation Standards"
  2. Add dual format documentation matching PLAN-009 pattern
  3. Note: "Epic planners cite specifications and missions when decomposing into stories"
- **Evidence:** `.opencode/agent/epic-planner.md:1-449` (no evidence format section exists)
- **Done When:** epic-planner.md contains Evidence & Citation Standards section
- **Complexity:** simple

### PLAN-012: Enhance Evidence Format Documentation in researcher.md

- **Action ID:** PLAN-012
- **Change Type:** modify
- **File(s):** `.opencode/agent/researcher.md`
- **Instruction:**
  1. Locate existing evidence requirement at line 43-45
  2. Expand into full subsection "## Evidence & Citation Standards (STRICT)"
  3. Move existing content and expand with dual format specification:
     ```markdown
     ## Evidence & Citation Standards (STRICT)
     
     All factual claims MUST include evidence. Use the appropriate format:
     
     ### Codebase Evidence (File:Line Format)
     - **Format:** `path/to/file.ext:line-line`
     - **Example:** `src/auth/login.ts:45-50`
     - **Required:** 1-6 line excerpt showing the referenced code
     - **When to use:** Code, config files, internal documentation
     
     ### Web Research Evidence (URL Format)
     - **Format:** URL + Date + Type + Authority
     - **Example:** https://docs.stripe.com/api (Type: official_docs, Date: 2025-12, Authority: high)
     - **Required:** 1-6 line excerpt or code sample from source
     - **When to use:** External libraries, APIs, best practices, framework documentation
     - **Delegation:** Obtain via web-search-researcher subagent
     
     ### Unverified Claims
     - If you cannot obtain evidence with `read` or delegation, mark claim as **Unverified**
     - Move to **Open Questions** section of research report
     - Document what you tried and what evidence is missing
     ```
  4. Update line 100-118 (Citing Web Research) to reference this section
- **Evidence:** `.opencode/agent/researcher.md:43-45` (brief evidence requirement exists, needs expansion)
- **Done When:** researcher.md has comprehensive Evidence & Citation Standards section with both formats documented
- **Complexity:** simple

### PLAN-013: Enhance Evidence Format Documentation in planner.md

- **Action ID:** PLAN-013
- **Change Type:** modify
- **File(s):** `.opencode/agent/planner.md`
- **Instruction:**
  1. Locate existing verified planning requirement at line 39-42
  2. Expand into full subsection "## Evidence & Citation Standards (STRICT)"
  3. Add dual format specification matching PLAN-012 structure
  4. Emphasize: "Every PLAN-XXX task Evidence field MUST use one of these formats"
  5. Update line 77-92 (Citing in Implementation Plans) to reference this section
- **Evidence:** `.opencode/agent/planner.md:39-42` (brief requirement exists, needs expansion)
- **Done When:** planner.md has comprehensive Evidence & Citation Standards section
- **Complexity:** simple

### PLAN-014: Update thoughts-analyzer delegation docs to use output_scope

- **Action ID:** PLAN-014
- **Change Type:** modify
- **File(s):** 
  - `.opencode/agent/researcher.md`
  - `.opencode/agent/planner.md`
- **Instruction:**
  1. In researcher.md, update line 368-377 (thoughts-analyzer delegation):
     - Change `analysis_depth: comprehensive` → `output_scope: comprehensive`
     - Update example: `Analysis depth: comprehensive` → `Output scope: comprehensive`
  2. In planner.md, update line 307-412 (thoughts-analyzer delegation):
     - Change all `analysis_depth` → `output_scope`
     - Update section references
  3. Add note: "thoughts-analyzer uses 'output_scope' to align with codebase-analyzer"
- **Evidence:** `.opencode/agent/researcher.md:376` and `.opencode/agent/planner.md:326` (currently use analysis_depth for thoughts-analyzer)
- **Done When:** Both files use output_scope for thoughts-analyzer delegations
- **Complexity:** simple

### PLAN-015: Update thoughts-analyzer.md to use output_scope parameter

- **Action ID:** PLAN-015
- **Change Type:** modify
- **File(s):** `.opencode/agent/thoughts-analyzer.md`
- **Instruction:**
  1. Read full file to identify all references to `analysis_depth` (if any exist)
  2. Replace with `output_scope` for consistency
  3. Update YAML frontmatter example to use `output_scope:` field
  4. Update scope value semantics to match codebase-analyzer: execution_only, focused, comprehensive
  5. Add backward compatibility note if needed
- **Evidence:** Research report references thoughts-analyzer but doesn't show its parameter naming (need to verify by reading file)
- **Done When:** thoughts-analyzer.md uses output_scope parameter consistently
- **Complexity:** simple

## Verification Tasks

None - all changes are documentation updates to agent specification files. No runtime behavior changes.

## Acceptance Criteria

- [ ] All 5 primary agents (mission-architect, specifier, epic-planner, researcher, planner) document YAML frontmatter + thinking/answer separation
- [ ] All agents using scope/depth parameters use `output_scope` parameter name (codebase-analyzer, thoughts-analyzer)
- [ ] codebase-locator supports 4 scope values including 'focused' to align with thoughts-locator
- [ ] All consumer agents (researcher, planner) use `output_scope` in delegation examples
- [ ] All primary agents document dual evidence format (file:line for codebase, URL for web)
- [ ] Backward compatibility notes added where parameter names changed

## Implementor Checklist

- [ ] PLAN-001 - Add message envelope to mission-architect.md
- [ ] PLAN-002 - Add message envelope to specifier.md
- [ ] PLAN-003 - Add message envelope to epic-planner.md
- [ ] PLAN-004 - Add message envelope to researcher.md
- [ ] PLAN-005 - Add message envelope to planner.md
- [ ] PLAN-006 - Rename analysis_depth to output_scope in codebase-analyzer.md
- [ ] PLAN-007 - Update researcher.md and planner.md to use output_scope for codebase-analyzer
- [ ] PLAN-008 - Add 'focused' scope value to codebase-locator.md
- [ ] PLAN-009 - Document evidence formats in mission-architect.md
- [ ] PLAN-010 - Document evidence formats in specifier.md
- [ ] PLAN-011 - Document evidence formats in epic-planner.md
- [ ] PLAN-012 - Enhance evidence format docs in researcher.md
- [ ] PLAN-013 - Enhance evidence format docs in planner.md
- [ ] PLAN-014 - Update thoughts-analyzer delegation docs to use output_scope
- [ ] PLAN-015 - Update thoughts-analyzer.md to use output_scope parameter
