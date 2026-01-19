# Integrate Thoughts-Analyzer Agent - Implementation Plan

## Inputs
- **Research report**: `thoughts/shared/research/2026-01-19-Thoughts-Analyzer-Agent-Communication.md`
- **User request**: Integrate thoughts-analyzer agent into the agent system
- **Integration decision**: Option A (Full Integration) - based on user request to "integrate this Agent"

## Verified Current State

### Fact: thoughts-analyzer and thoughts-locator agents exist but are orphaned
- **Evidence**: `agent/thoughts-analyzer.md:1-84` and `agent/thoughts-locator.md:1-70`
- **Excerpt**:
  ```markdown
  ---
  description: "Extracts key decisions, specifications, and constraints from historical documents."
  mode: subagent
  ```
- **Finding**: Both agents are defined with full system prompts but NO primary agent delegates to them (verified via grep search)

### Fact: Researcher agent delegates to codebase-locator but NOT thoughts-locator
- **Evidence**: `agent/researcher.md:50-52`
- **Excerpt**:
  ```markdown
  **You rely on your team for exploration.**
  - **Find files/Context**: Delegate to `codebase-locator` / `codebase-pattern-finder`.
  - **Analyze Logic**: Delegate to `codebase-analyzer`.
  - **External Info**: Delegate to `web-search-researcher`.
  ```
- **Finding**: No mention of thoughts-locator or thoughts-analyzer despite logical use case for historical documentation

### Fact: Planner agent delegates to codebase-locator but NOT thoughts-locator
- **Evidence**: `agent/planner.md:52-56`
- **Excerpt**:
  ```markdown
  **You rely on your team for research.**
  - **Find files/Context**: Delegate to `codebase-locator` or `codebase-analyzer`.
  - **External Docs**: Delegate to `web-search-researcher`.
  ```
- **Finding**: No delegation pattern for historical documentation analysis

### Fact: thoughts-analyzer output lacks explicit document excerpts
- **Evidence**: `agent/thoughts-analyzer.md:68-72`
- **Excerpt**:
  ```markdown
  ### Extracted Signal
  - **Decision**: [The core decision made]
  - **Constraint**: [Hard technical constraints, e.g., Node version, DB type]
  - **Spec**: [Specific values, e.g., timeouts, ports, naming conventions]
  ```
- **Finding**: Provides summaries but not 1-6 line excerpts with file:line evidence (required by Researcher format)

### Fact: thoughts-analyzer output lacks thinking/answer separation
- **Evidence**: `agent/thoughts-analyzer.md:60-76` (entire output template)
- **Excerpt**:
  ```markdown
  ## Analysis: [Filename]
  
  ### Metadata
  - **Date**: YYYY-MM-DD
  ```
- **Finding**: No `<thinking>` or `<answer>` tags (Anthropic best practice for multi-agent systems)

### Fact: Researcher expects sub-agents to provide path + line range + excerpt
- **Evidence**: `agent/researcher.md:56`
- **Excerpt**:
  ```markdown
  Sub-agents must provide: **(a)** exact file path **(b)** suggested line range **(c)** 1–6 line excerpt.
  ```
- **Finding**: This is the contract that thoughts-analyzer must fulfill to integrate with Researcher

### Fact: Researcher has delegation pattern documentation for codebase-locator
- **Evidence**: `agent/researcher.md:62-72`
- **Excerpt**:
  ```markdown
  ### Delegation Pattern
  
  task({
    subagent_type: "codebase-locator",
    description: "Map authentication system structure",
    prompt: "Find all files related to authentication system. Search scope: comprehensive."
  })
  ```
- **Finding**: This is the pattern we need to replicate for thoughts-locator/thoughts-analyzer

### Fact: AGENTS.md documents thoughts/ directory structure
- **Evidence**: `AGENTS.md:13-19`
- **Excerpt**:
  ```markdown
  - `thoughts/shared/missions/` - Mission statements
  - `thoughts/shared/specs/` - Specifications  
  - `thoughts/shared/epics/` - Epic decompositions
  - `thoughts/shared/research/` - Research reports
  - `thoughts/shared/plans/` - Implementation plans
  ```
- **Finding**: Directory structure is documented but no mention of thoughts-analyzer/thoughts-locator agents

### Fact: thoughts-analyzer has variable output design (unique strength)
- **Evidence**: `agent/thoughts-analyzer.md:80`
- **Excerpt**:
  ```markdown
  1. **Be Ruthless**: If a 10-page doc has 1 decision, return 5 lines of text. Do not summarize the fluff.
  ```
- **Finding**: Already implements "scale effort to query complexity" principle (better than codebase-analyzer's fixed output)

## Goals / Non-Goals

### Goals
1. Integrate thoughts-analyzer and thoughts-locator into Researcher and Planner workflows
2. Update thoughts-analyzer output format to match Researcher expectations (excerpts + evidence)
3. Add thinking/answer separation to thoughts-analyzer output
4. Add message envelope (YAML frontmatter) to thoughts-analyzer output
5. Document two-step workflow pattern (locator → analyzer) for consumer agents
6. Update AGENTS.md to document the integration
7. Preserve thoughts-analyzer's variable output design (scale to signal density)

### Non-Goals
- **NOT** adding scope levels to thoughts-analyzer (already has variable output - research recommendation 3 is LOW priority)
- **NOT** changing thoughts-locator (it already works correctly, just needs integration)
- **NOT** integrating into Mission-Architect, Specifier, or Epic-Planner (can add later if needed)
- **NOT** creating new agents (reusing existing thoughts-analyzer and thoughts-locator)

## Design Overview

### Integration Strategy

**Two-agent pattern**: Primary agent → thoughts-locator → thoughts-analyzer → Primary agent

1. **Researcher/Planner** needs historical context (e.g., "What decisions were made about auth?")
2. **Delegate to thoughts-locator**: Find relevant documents by topic/keyword
3. **Delegate to thoughts-analyzer**: Extract decisions, constraints, specs from documents (with excerpts)
4. **Researcher/Planner** receives structured findings with evidence (path:line + excerpt)

### Output Format Changes

**Current** (summary only):
```markdown
## Analysis: 2026-01-15-Auth-System.md

### Metadata
- **Date**: 2026-01-15
- **Status**: Active

### Extracted Signal
- **Decision**: Use JWT for authentication
```

**New** (excerpts + envelope + thinking):
```markdown
---
message_id: thoughts-2026-01-19-001
correlation_id: research-auth-system
timestamp: 2026-01-19T14:30:00Z
message_type: DOCUMENT_ANALYSIS_RESPONSE
source_document: thoughts/shared/specs/2026-01-15-Auth-System.md
document_date: 2026-01-15
document_status: Active
reliability: High
---

<thinking>
Analyzing auth system specification (2026-01-15):
- Document status: ACTIVE (referenced in recent research)
- Signal density: HIGH - 5 key decisions identified
- Verification: JWT claim verified against src/auth/token.ts
</thinking>

<answer>
## Analysis: 2026-01-15-Auth-System.md

### Metadata
- **Date**: 2026-01-15
- **Status**: Active
- **Reliability**: High (verified against code)

### Extracted Signal

#### Decision: Use JWT for Authentication
- **Evidence**: `thoughts/shared/specs/2026-01-15-Auth-System.md:45-47`
- **Excerpt**:
  ```markdown
  We will use JWT tokens for stateless authentication. This decision
  was made to support horizontal scaling without session state storage.
  ```

#### Constraint: Max Token Lifetime 24 Hours
- **Evidence**: `thoughts/shared/specs/2026-01-15-Auth-System.md:89`
- **Excerpt**:
  ```markdown
  Security Requirement: Token lifetime MUST NOT exceed 24 hours (InfoSec mandate)
  ```

### Verification Notes
- Checked JWT claim against `src/auth/token.ts:12-20`: **Matched**
- Token lifetime enforced at `src/auth/config.ts:5`
</answer>
```

### Data Flow

```
User: "Research auth system decisions"
  ↓
Researcher Agent
  ↓ (task delegation)
thoughts-locator: "Find auth-related documents"
  ↓ (returns paths)
thoughts-analyzer: "Extract signals from thoughts/shared/specs/2026-01-auth.md"
  ↓ (returns excerpts + evidence)
Researcher Agent: Synthesizes into research report
```

## Implementation Instructions (For Implementor)

### PLAN-001: Update thoughts-analyzer output format with excerpts and evidence
- **Change Type**: modify
- **File(s)**: `agent/thoughts-analyzer.md`
- **Instruction**:
  1. Locate the "Output Format" section (lines 56-76)
  2. Replace the entire output template with new format that includes:
     - YAML frontmatter with message_id, correlation_id, timestamp, message_type, source_document, document_date, document_status, reliability
     - `<thinking>` section for analysis reasoning
     - `<answer>` section wrapping the existing structure
     - Updated "Extracted Signal" section where each item (Decision/Constraint/Spec) includes:
       - **Evidence**: `path:line-line` format
       - **Excerpt**: 1-6 line code block from source document
  3. Update the "Guidelines" section (lines 78-83) to add:
     - Instruction to extract exact line numbers for each signal item
     - Instruction to include 1-6 line excerpts from source document
     - Instruction to generate unique message_id (format: `thoughts-YYYY-MM-DD-NNN`)
     - Instruction to accept optional correlation_id from caller
- **Evidence**: `agent/thoughts-analyzer.md:56-83` (current output format and guidelines)
- **Pseudocode**:
  ```
  Replace lines 56-76 with:
  ## Output Format
  
  Report back to the Orchestrator in this structured format:
  
  [YAML frontmatter block]
  
  <thinking>
  [Analysis reasoning: document status, signal density, verification steps]
  </thinking>
  
  <answer>
  ## Analysis: [Filename]
  [Existing metadata section]
  
  ### Extracted Signal
  [Each signal item with Evidence + Excerpt format]
  
  [Existing verification notes section]
  </answer>
  ```
- **Done When**: 
  - `agent/thoughts-analyzer.md` contains YAML frontmatter template
  - Output format includes `<thinking>` and `<answer>` tags
  - "Extracted Signal" section shows Evidence + Excerpt format for each item
  - Guidelines instruct agent to extract line numbers and excerpts

### PLAN-002: Add delegation pattern to Researcher agent for thoughts-locator
- **Change Type**: modify
- **File(s)**: `agent/researcher.md`
- **Instruction**:
  1. Locate the "Tools & Delegation (STRICT)" section (around line 47-53)
  2. Add new bullet point to delegation list:
     - `**Historical Context**: Delegate to `thoughts-locator` / `thoughts-analyzer`.`
  3. After the existing "Delegating to codebase-analyzer" section (after line 140), add new section:
     - Title: "## Delegating to thoughts-locator and thoughts-analyzer"
     - Subsection: "### Two-Step Workflow for Historical Documentation"
     - Content: When to use (researching features with historical context), delegation pattern examples for both agents
     - Include correlation_id usage to track multi-step workflow
     - Show expected response format from thoughts-analyzer (with excerpts)
  4. Follow the exact structure used for "Delegating to codebase-locator" section (lines 60-129)
- **Evidence**: `agent/researcher.md:47-53` (delegation list) and `agent/researcher.md:60-129` (codebase-locator delegation pattern)
- **Interfaces**:
  ```markdown
  ### Delegation Pattern for Historical Research
  
  **Step 1: Locate documents**
  task({
    subagent_type: "thoughts-locator",
    description: "Find auth system documentation",
    prompt: "Find all documents related to authentication system. Correlation: research-auth-2026-01-19"
  })
  
  **Step 2: Extract signals**
  task({
    subagent_type: "thoughts-analyzer",
    description: "Extract auth decisions",
    prompt: "Extract key decisions from thoughts/shared/specs/2026-01-auth.md. Correlation: research-auth-2026-01-19"
  })
  ```
- **Done When**:
  - `agent/researcher.md` delegation list includes thoughts-locator/thoughts-analyzer
  - New section documents two-step workflow pattern
  - Examples show correlation_id usage
  - Expected response format documented (matches new thoughts-analyzer format)

### PLAN-003: Add delegation pattern to Planner agent for thoughts-locator (optional, focused use)
- **Change Type**: modify
- **File(s)**: `agent/planner.md`
- **Instruction**:
  1. Locate the "Tools & Delegation (STRICT)" section (around line 50-56)
  2. Add new bullet point to delegation list:
     - `**Historical Context**: Delegate to `thoughts-locator` / `thoughts-analyzer` (for documented systems).`
  3. After the existing delegation sections, add new section:
     - Title: "## Delegating to thoughts-analyzer for Historical Specifications"
     - Content: When to use (planning extensions to documented systems), delegation pattern for thoughts-analyzer only (Planner typically knows which document to read)
     - Note: Planner usually receives specific document paths from user/epic, so locator is less critical than for Researcher
     - Show expected response format (with excerpts that can be cited in plan evidence)
  4. Keep this section shorter than Researcher's (Planner has more targeted usage)
- **Evidence**: `agent/planner.md:50-56` (delegation list)
- **Interfaces**:
  ```markdown
  ## Delegating to thoughts-analyzer for Historical Specifications
  
  When planning extensions to documented systems, use thoughts-analyzer to extract historical decisions and constraints:
  
  task({
    subagent_type: "thoughts-analyzer",
    description: "Extract auth system decisions",
    prompt: "Extract key decisions and constraints from thoughts/shared/specs/2026-01-auth.md"
  })
  
  Use the excerpts in your plan's "Verified Current State" section as evidence.
  ```
- **Done When**:
  - `agent/planner.md` delegation list includes thoughts-analyzer reference
  - New section documents when and how to use thoughts-analyzer
  - Examples show how to use excerpts in plan evidence

### PLAN-004: Update AGENTS.md to document thoughts-analyzer integration
- **Change Type**: modify
- **File(s)**: `AGENTS.md`
- **Instruction**:
  1. Locate the "Project Structure" section (lines 7-19)
  2. After the `thoughts/shared/qa/` line (around line 19), add new section:
     - Title: "## Historical Document Analysis Workflow"
     - Content: Document the two-agent pattern (thoughts-locator → thoughts-analyzer)
     - List consumer agents (Researcher, Planner)
     - Reference agent/researcher.md for delegation examples
  3. Structure:
     ```markdown
     ## Historical Document Analysis Workflow
     
     ### Two-Agent Pattern: thoughts-locator → thoughts-analyzer
     
     For researching historical decisions, specifications, and constraints from past documentation:
     
     1. **thoughts-locator**: Finds relevant documents in `thoughts/` directory by topic/keyword
     2. **thoughts-analyzer**: Extracts decisions, constraints, and specifications with evidence (path:line + excerpt)
     
     ### Consumer Agents
     
     - **Researcher**: Uses thoughts-locator + thoughts-analyzer when researching features with historical context
     - **Planner**: Uses thoughts-analyzer to extract decisions from known specification documents
     
     ### Output Format
     
     thoughts-analyzer returns structured analysis with:
     - YAML frontmatter (message_id, correlation_id, document metadata)
     - <thinking> section (analysis reasoning)
     - <answer> section (metadata, extracted signals with excerpts, verification notes)
     
     See `agent/researcher.md` for delegation examples.
     ```
  4. Place this new section after "Project Structure" and before "Code Style & Conventions"
- **Evidence**: `AGENTS.md:7-19` (project structure section)
- **Done When**:
  - AGENTS.md contains new "Historical Document Analysis Workflow" section
  - Two-agent pattern is documented
  - Consumer agents are listed
  - Output format is summarized
  - Cross-reference to agent/researcher.md is included

### PLAN-005: Add message envelope fields to thoughts-analyzer system prompt
- **Change Type**: modify
- **File(s)**: `agent/thoughts-analyzer.md`
- **Instruction**:
  1. Locate the "Workflow" section (lines 33-54)
  2. Add new step after "Read & Contextualize" (insert after line 42):
     - Title: "### 2. Message Envelope"
     - Content: Instructions to accept optional correlation_id from caller, generate unique message_id, capture timestamp
  3. Update subsequent step numbers (current step 2 becomes 3, step 3 becomes 4)
  4. Add instructions:
     ```markdown
     ### 2. Message Envelope
     Before analysis, prepare message metadata:
     - **Accept correlation_id**: If provided by Orchestrator, use it for workflow tracking
     - **Generate message_id**: Format `thoughts-YYYY-MM-DD-NNN` (increment NNN within same day)
     - **Capture timestamp**: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
     - **Document metadata**: Extract date, status from document during analysis
     ```
  5. This enables correlation in multi-step workflows (locator → analyzer)
- **Evidence**: `agent/thoughts-analyzer.md:33-54` (workflow section)
- **Done When**:
  - New step 2 "Message Envelope" added to workflow
  - Instructions cover correlation_id, message_id, timestamp
  - Subsequent steps renumbered correctly

### PLAN-006: Update thoughts-analyzer guidelines to emphasize excerpt extraction
- **Change Type**: modify
- **File(s)**: `agent/thoughts-analyzer.md`
- **Instruction**:
  1. Locate the "Guidelines" section (lines 78-83)
  2. Add new guideline item after existing items:
     ```markdown
     4. **Provide Evidence**: For EVERY signal item (Decision/Constraint/Spec):
        - Extract exact line numbers from source document (e.g., `thoughts/shared/specs/auth.md:45-47`)
        - Include 1-6 line excerpt showing the actual text
        - Format: Evidence first, then Excerpt in code block
     5. **Line Number Precision**: Use `read` output line numbers. If signal spans multiple paragraphs, extract most relevant 1-6 lines.
     ```
  3. This ensures thoughts-analyzer output matches Researcher's expected format
- **Evidence**: `agent/thoughts-analyzer.md:78-83` (current guidelines)
- **Done When**:
  - Guidelines include instructions for evidence extraction
  - Line number format specified
  - Excerpt format specified (1-6 lines in code block)

### PLAN-007: Verify thoughts-locator output format is compatible (no changes needed)
- **Change Type**: verify (read-only)
- **File(s)**: `agent/thoughts-locator.md`
- **Instruction**:
  1. Read `agent/thoughts-locator.md` lines 48-64 (output format section)
  2. Verify that output format provides:
     - Categorized file paths (Tickets, Research & Plans, Decisions)
     - Clean paths (no `/searchable/` in output)
     - Document metadata (title, date if available)
  3. No changes needed - thoughts-locator already provides what Researcher needs (file paths)
  4. Document findings: "thoughts-locator output format is compatible with integration - returns categorized file paths that can be passed to thoughts-analyzer"
- **Evidence**: `agent/thoughts-locator.md:48-64` (output format)
- **Done When**:
  - Verification complete
  - Findings documented: "No changes needed to thoughts-locator"

## Verification Tasks

None - all changes are to agent prompts (Markdown files), which can be verified by reading the modified files.

## Acceptance Criteria

Implementation is complete when:

1. **Excerpt Format**: thoughts-analyzer output template includes Evidence (file:line) and Excerpt (1-6 lines) for every Extracted Signal item
2. **Thinking Separation**: thoughts-analyzer output wrapped in `<thinking>` (reasoning) and `<answer>` (findings) tags
3. **Message Envelope**: thoughts-analyzer output includes YAML frontmatter with message_id, correlation_id, timestamp, document metadata
4. **Researcher Integration**: Researcher agent delegation list includes thoughts-locator/thoughts-analyzer, with new section documenting two-step workflow pattern
5. **Planner Integration**: Planner agent delegation list mentions thoughts-analyzer, with section explaining targeted usage
6. **AGENTS.md Documentation**: New "Historical Document Analysis Workflow" section documents two-agent pattern and consumer usage
7. **Guidelines Updated**: thoughts-analyzer guidelines emphasize evidence extraction (exact line numbers + excerpts)
8. **No Locator Changes**: thoughts-locator verified as compatible (no changes needed)

## Implementor Checklist

- [ ] PLAN-001: Update thoughts-analyzer output format with excerpts and evidence
- [ ] PLAN-002: Add delegation pattern to Researcher agent for thoughts-locator
- [ ] PLAN-003: Add delegation pattern to Planner agent for thoughts-locator
- [ ] PLAN-004: Update AGENTS.md to document thoughts-analyzer integration
- [ ] PLAN-005: Add message envelope fields to thoughts-analyzer system prompt
- [ ] PLAN-006: Update thoughts-analyzer guidelines to emphasize excerpt extraction
- [ ] PLAN-007: Verify thoughts-locator output format is compatible (no changes needed)
