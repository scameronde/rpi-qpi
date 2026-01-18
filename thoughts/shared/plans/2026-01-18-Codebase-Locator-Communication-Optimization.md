# Codebase-Locator Communication Optimization Implementation Plan

## Metadata
- **Date**: 2026-01-18
- **Ticket**: Codebase-Locator Communication Optimization
- **Type**: Enhancement (Agent Communication Protocol)
- **Priority**: High (76% token savings for QA workflows)

## Inputs
- **Research report**: `thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md`
- **User request**: "Create a plan to improve the situation" (based on research findings)
- **Context**: Multi-agent communication optimization following patterns established in codebase-analyzer optimization

## Verified Current State

### Fact 1: Codebase-Locator Uses Fixed 4-Section Output Template
- **Evidence**: `agent/codebase-locator.md:76-94`
- **Excerpt**:
  ```markdown
  ## Coordinates: [Topic]
  
  ### Primary Implementation
  - `src/features/auth/AuthService.ts`
  - `src/features/auth/AuthController.ts`
  
  ### Related Configuration
  - `config/auth.yaml`
  - `.env.schema`
  
  ### Testing Coordinates
  - `tests/integration/auth.spec.ts`
  
  ### Directory Structure
  `src/features/auth/` contains:
  - 5 Typescript files
  - 1 Sub-directory (`strategies/`)
  ```
- **Implication**: All consumers receive all sections regardless of their needs

### Fact 2: QA Agents Only Need Test File Paths
- **Evidence**: `agent/python-qa-thorough.md:95`
- **Excerpt**:
  ```markdown
  - Delegate to `codebase-locator` to find `test_*.py` or `*_test.py`
  ```
- **Evidence**: `agent/typescript-qa-thorough.md:136`
- **Excerpt**:
  ```markdown
  - Delegate to `codebase-locator` to find `*.test.ts`, `*.spec.ts`, or `__tests__/*.ts`
  ```
- **Implication**: QA agents receive ~83 tokens but only need ~20 tokens (76% waste)

### Fact 3: Researcher/Planner Need Full Topology
- **Evidence**: `agent/researcher.md:50`
- **Excerpt**:
  ```markdown
  - **Find files/Context**: Delegate to `codebase-locator` / `codebase-pattern-finder`.
  ```
- **Evidence**: `agent/planner.md:53`
- **Excerpt**:
  ```markdown
  - **Find files/Context**: Delegate to `codebase-locator` or `codebase-analyzer`.
  ```
- **Implication**: These agents use all 4 sections (0% waste)

### Fact 4: Locator Can Use Read to Identify Entry Points
- **Evidence**: `agent/codebase-locator.md:38`
- **Excerpt**:
  ```markdown
  - **read**: Use ONLY to verify a file's "exports" or identify a main entry point if the filename is ambiguous.
  ```
- **Implication**: Agent has capability to determine primary files but template doesn't signal this

### Fact 5: No Thinking/Answer Separation
- **Evidence**: `agent/codebase-locator.md:76-94` (entire template)
- **Observation**: Template contains only final output, no `<thinking>` or `<answer>` tags
- **Implication**: Cannot inspect search strategy or strip reasoning for token optimization

### Fact 6: No Message Metadata Envelope
- **Evidence**: `agent/codebase-locator.md:76` (template header)
- **Excerpt**:
  ```markdown
  ## Coordinates: [Topic]
  ```
- **Observation**: No YAML frontmatter, correlation IDs, or timestamps
- **Implication**: Difficult to debug multi-step workflows with multiple delegations

### Fact 7: Eight Consumer Agents Rely on Locator
- **Evidence**: Research report verified these agents delegate to codebase-locator:
  - `agent/researcher.md:50` (primary consumer)
  - `agent/planner.md:53` (primary consumer)
  - `agent/python-qa-thorough.md:39,95` (QA consumer)
  - `agent/python-qa-quick.md:39` (QA consumer)
  - `agent/typescript-qa-thorough.md:39,136` (QA consumer)
  - `agent/typescript-qa-quick.md:39` (QA consumer)
  - `agent/opencode-qa-thorough.md:40,277` (QA consumer)
- **Implication**: Changes to locator output format affect 8 agents

## Goals / Non-Goals

### Goals
1. **Reduce token waste for QA workflows** by 76% (primary objective)
2. **Add entry point disambiguation** to eliminate follow-up queries
3. **Enable search strategy debugging** via thinking/answer separation
4. **Support multi-step workflow correlation** via message envelopes
5. **Maintain backward compatibility** (default to comprehensive output)
6. **Align with industry best practices** (Anthropic, Microsoft, academic research)

### Non-Goals
1. **Not changing locator's core responsibility** (still only finds paths, doesn't analyze code)
2. **Not removing any existing sections** (all 4 sections remain available)
3. **Not requiring consumers to change immediately** (comprehensive is default)
4. **Not adding code analysis capabilities** (still boundary with codebase-analyzer)

## Design Overview

### Architecture Pattern
Following the **query-specific depth pattern** established in codebase-analyzer optimization:

```
Consumer Agent
  |
  v
[Delegation with search_scope parameter]
  |
  v
Codebase-Locator
  |
  +--> Parse search_scope parameter
  |
  +--> Execute search (glob/bash/read)
  |
  +--> Generate output based on scope:
       - tests_only → Section 3 only
       - paths_only → Section 1 only
       - comprehensive → All 4 sections
  |
  +--> Wrap in <thinking> and <answer> tags
  |
  +--> Add YAML frontmatter envelope
  |
  v
[Return to consumer]
```

### Data Flow
1. **Consumer** specifies desired scope in task prompt (e.g., "search_scope: tests_only")
2. **Locator** detects scope parameter (defaults to "comprehensive" if absent)
3. **Locator** performs search using glob/bash/read as currently
4. **Locator** filters output sections based on scope
5. **Locator** adds role metadata to file paths (if using read for entry point detection)
6. **Locator** wraps reasoning in `<thinking>` and results in `<answer>`
7. **Locator** prepends YAML frontmatter with metadata
8. **Consumer** receives optimized output

### Scope Level Definitions

| Scope | Sections Included | Token Count | Use Case | Consumers |
|-------|-------------------|-------------|----------|-----------|
| `tests_only` | Section 3 only | ~20 tokens | QA finding test files | All 6 QA agents |
| `paths_only` | Section 1 only | ~25 tokens | Targeted file discovery | Varies |
| `comprehensive` | All 4 sections | ~83 tokens | Full topology mapping | Researcher, Planner |

### Output Structure Evolution

**Before** (current):
```markdown
## Coordinates: [Topic]

### Primary Implementation
- `src/features/auth/AuthService.ts`
- `src/features/auth/AuthController.ts`

### Related Configuration
- `config/auth.yaml`

### Testing Coordinates
- `tests/integration/auth.spec.ts`

### Directory Structure
`src/features/auth/` contains:
- 5 Typescript files
- 1 Sub-directory (`strategies/`)
```

**After** (with all enhancements):
```markdown
---
message_id: locator-2026-01-18-001
correlation_id: qa-task-auth-tests
timestamp: 2026-01-18T12:00:00Z
message_type: LOCATION_RESPONSE
search_scope: tests_only
locator_version: 1.1
query_topic: authentication tests
files_found: 1
directories_scanned: 1
---

<thinking>
Search strategy for authentication test files:
- Used glob pattern: tests/**/*auth*.{spec,test}.ts
- Found 3 matches in tests/integration/
- Filtered to 1 primary test file based on naming convention
- Scope: tests_only (returning Section 3 only)
</thinking>

<answer>
## Coordinates: Authentication Tests

### Testing Coordinates
- `tests/integration/auth.spec.ts`
</answer>
```

**After** (comprehensive scope for Researcher):
```markdown
---
message_id: locator-2026-01-18-002
correlation_id: research-auth-system
timestamp: 2026-01-18T12:05:00Z
message_type: LOCATION_RESPONSE
search_scope: comprehensive
locator_version: 1.1
query_topic: authentication system
files_found: 7
directories_scanned: 2
---

<thinking>
Search strategy for authentication system:
- Used glob pattern: src/**/*auth*.ts
- Found 12 matches, filtered to 2 primary implementation files
- Identified config in config/auth.yaml
- Found 3 test files in tests/integration/
- Scanned directory: src/features/auth/ (5 files, 1 subdir)
- Used read to identify AuthService.ts as entry point (5 exports vs 3 in Controller)
</thinking>

<answer>
## Coordinates: Authentication System

### Primary Implementation
- `src/features/auth/AuthService.ts` [entry-point, exports: 5]
- `src/features/auth/AuthController.ts` [secondary, exports: 3]

### Related Configuration
- `config/auth.yaml` [config]

### Testing Coordinates
- `tests/integration/auth.spec.ts`
- `tests/unit/auth-service.test.ts`

### Directory Structure
`src/features/auth/` contains:
- 5 TypeScript files
- 1 Sub-directory (`strategies/`)
</answer>
```

## Implementation Instructions (For Implementor)

### PLAN-001: Update Locator System Prompt to Accept search_scope Parameter
- **Action ID**: PLAN-001
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md`
- **Instruction**:
  1. After line 31 (Tools & Constraints section), add new section "## Input Parameters"
  2. Document the `search_scope` parameter with 3 valid values:
     - `tests_only`: Return only Testing Coordinates section
     - `paths_only`: Return only Primary Implementation section
     - `comprehensive`: Return all 4 sections (default)
  3. Add examples showing how consumers should specify the parameter in task delegation
  4. Update the "Output Format" section (line 72) to note that sections are conditional based on scope
- **Interfaces / Pseudocode**:
  ```markdown
  ## Input Parameters
  
  Consumers can specify `search_scope` in the task delegation to control output verbosity:
  
  ### Scope Levels
  
  - **tests_only**: Returns only the "Testing Coordinates" section
    - Use case: QA agents finding test files for coverage analysis
    - Token savings: ~76% vs comprehensive
    - Example delegation: "Find test files for src/auth/login.py. Search scope: tests_only"
  
  - **paths_only**: Returns only the "Primary Implementation" section
    - Use case: Targeted file discovery when only source paths are needed
    - Token savings: ~70% vs comprehensive
    - Example delegation: "Find authentication service implementation. Search scope: paths_only"
  
  - **comprehensive**: Returns all 4 sections (Primary Implementation, Related Configuration, Testing Coordinates, Directory Structure)
    - Use case: Researcher/Planner agents needing full topology
    - Token savings: 0% (full output)
    - Example delegation: "Map authentication system structure. Search scope: comprehensive"
    - **Default**: If no scope specified, defaults to comprehensive for backward compatibility
  
  ### How to Detect Scope in Task Prompt
  
  Look for phrases in the task prompt:
  - "Search scope: tests_only" → tests_only
  - "Search scope: paths_only" → paths_only
  - "Search scope: comprehensive" → comprehensive
  - No mention of scope → comprehensive (default)
  ```
- **Evidence**: `agent/codebase-locator.md:1-101` (current file has no parameter documentation)
- **Done When**: 
  - Section "## Input Parameters" exists after line 31
  - Three scope levels documented with use cases and examples
  - Output Format section (line 72) notes conditional sections

### PLAN-002: Implement Conditional Output Logic Based on Scope
- **Action ID**: PLAN-002
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md`
- **Instruction**:
  1. Update the "Output Format" section (lines 72-94) to show conditional structure
  2. Add instructions to the agent on how to filter sections based on detected scope
  3. Provide conditional template showing what to include for each scope level
- **Interfaces / Pseudocode**:
  ```markdown
  ## Output Format
  
  Present your findings as a structured Atlas. The sections included depend on the `search_scope` parameter:
  
  ### Conditional Output Structure
  
  **For scope = tests_only:**
  ```markdown
  ## Coordinates: [Topic]
  
  ### Testing Coordinates
  - `tests/integration/auth.spec.ts`
  - `tests/unit/auth-service.test.ts`
  ```
  
  **For scope = paths_only:**
  ```markdown
  ## Coordinates: [Topic]
  
  ### Primary Implementation
  - `src/features/auth/AuthService.ts`
  - `src/features/auth/AuthController.ts`
  ```
  
  **For scope = comprehensive (default):**
  ```markdown
  ## Coordinates: [Topic]
  
  ### Primary Implementation
  - `src/features/auth/AuthService.ts`
  - `src/features/auth/AuthController.ts`
  
  ### Related Configuration
  - `config/auth.yaml`
  - `.env.schema`
  
  ### Testing Coordinates
  - `tests/integration/auth.spec.ts`
  
  ### Directory Structure
  `src/features/auth/` contains:
  - 5 Typescript files
  - 1 Sub-directory (`strategies/`)
  ```
  
  ### Implementation Logic
  
  1. Parse the task prompt to detect `search_scope` parameter
  2. Execute search as normal (glob/bash/read)
  3. Collect all findings (all 4 sections worth of data)
  4. Filter output based on scope:
     - If `tests_only`: Include only "Testing Coordinates" section
     - If `paths_only`: Include only "Primary Implementation" section
     - If `comprehensive` or no scope specified: Include all 4 sections
  5. Proceed to add thinking tags and message envelope (subsequent tasks)
  ```
- **Evidence**: `agent/codebase-locator.md:72-94` (current template is fixed)
- **Done When**:
  - Output Format section shows three conditional templates
  - Implementation logic documented for scope detection and filtering
  - Agent instructions clearly explain which sections to include for each scope

### PLAN-003: Add Role Metadata to File Paths
- **Action ID**: PLAN-003
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md`
- **Instruction**:
  1. Update the "read" tool usage instruction (line 38) to include export counting
  2. Update output templates to show role metadata in square brackets after each path
  3. Add instructions on how to determine role metadata:
     - `[entry-point]`: File with most exports or main entry (use read to count exports)
     - `[secondary]`: Supporting implementation file
     - `[config]`: Configuration file (in Related Configuration section)
     - `[exports: N]`: Number of public exports detected via read
  4. Note: Only use read when there are multiple files in Primary Implementation section and entry point is ambiguous
- **Interfaces / Pseudocode**:
  ```markdown
  ## Role Metadata for File Paths
  
  When returning file paths, add role metadata in square brackets to help consumers identify file purpose:
  
  ### Metadata Tags
  
  - `[entry-point]`: Main file in a group (most exports, or identified as entry via read)
  - `[secondary]`: Supporting implementation file
  - `[config]`: Configuration file
  - `[exports: N]`: Number of public exports (when read was used)
  
  ### When to Use Read for Entry Point Detection
  
  Only use the `read` tool when:
  1. You find multiple files in the Primary Implementation section (2+ files)
  2. AND the entry point is ambiguous (e.g., both AuthService.ts and AuthController.ts)
  3. Read the first 50 lines of each file to count exports
  4. Mark the file with most exports as `[entry-point, exports: N]`
  5. Mark others as `[secondary, exports: N]`
  
  ### Example with Role Metadata
  
  ```markdown
  ### Primary Implementation
  - `src/features/auth/AuthService.ts` [entry-point, exports: 5]
  - `src/features/auth/AuthController.ts` [secondary, exports: 3]
  
  ### Related Configuration
  - `config/auth.yaml` [config]
  ```
  
  ### Example Without Role Metadata (Single File)
  
  ```markdown
  ### Primary Implementation
  - `src/features/auth/AuthService.ts`
  ```
  
  (No need for metadata when there's only one file - it's obviously the primary)
  ```
- **Evidence**: `agent/codebase-locator.md:38` (read usage instruction exists)
- **Evidence**: `agent/codebase-locator.md:79-85` (current templates have no metadata)
- **Done When**:
  - Section "## Role Metadata for File Paths" added
  - Instructions specify when to use read for entry point detection
  - Templates updated to show examples with metadata
  - Agent understands to only add metadata when multiple files exist

### PLAN-004: Add Thinking/Answer Separation
- **Action ID**: PLAN-004
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md`
- **Instruction**:
  1. Update "Output Format" section to wrap output in `<thinking>` and `<answer>` tags
  2. Add instructions on what to include in thinking section:
     - Search commands used (glob patterns, find arguments)
     - Number of matches found
     - Filtering decisions made
     - Entry point detection reasoning (if read was used)
     - Scope level being applied
  3. Show examples of thinking content for each scope level
- **Interfaces / Pseudocode**:
  ```markdown
  ## Output Format with Thinking/Answer Separation
  
  Wrap your response in two sections:
  
  ### <thinking> Section
  
  Document your search strategy and decision-making process:
  - Glob patterns or bash commands used
  - Number of matches found
  - Filtering logic applied
  - Entry point detection reasoning (if applicable)
  - Scope level applied
  
  Example:
  ```markdown
  <thinking>
  Search strategy for authentication test files:
  - Used glob pattern: tests/**/*auth*.{spec,test}.ts
  - Found 3 matches in tests/integration/
  - Filtered to 1 primary test file based on naming convention
  - Scope: tests_only (returning Section 3 only)
  </thinking>
  ```
  
  ### <answer> Section
  
  Wrap your Coordinates report in answer tags:
  ```markdown
  <answer>
  ## Coordinates: [Topic]
  
  [Sections based on scope...]
  </answer>
  ```
  
  ### Complete Example (tests_only scope)
  
  ```markdown
  <thinking>
  Search strategy for Python test files:
  - Used find command: find . -name "test_*.py" -o -name "*_test.py"
  - Found 5 matches across tests/ directory
  - Scope: tests_only (returning Section 3 only)
  </thinking>
  
  <answer>
  ## Coordinates: Python Test Files
  
  ### Testing Coordinates
  - `tests/unit/test_auth.py`
  - `tests/integration/test_api.py`
  - `tests/e2e/test_workflow.py`
  </answer>
  ```
  ```
- **Evidence**: `agent/codebase-locator.md:74-94` (current template has no thinking/answer tags)
- **Done When**:
  - Output Format section includes thinking/answer tag instructions
  - Examples show what content belongs in each section
  - Agent understands to document search strategy in thinking

### PLAN-005: Add Message Envelope with YAML Frontmatter
- **Action ID**: PLAN-005
- **Change Type**: modify
- **File(s)**: `agent/codebase-locator.md`
- **Instruction**:
  1. Update "Output Format" section to prepend YAML frontmatter before thinking tags
  2. Document required frontmatter fields:
     - `message_id`: Auto-generated as "locator-YYYY-MM-DD-NNN" (increment NNN per session)
     - `correlation_id`: Extracted from task prompt if provided (e.g., "Search for auth files. Correlation: research-auth-2026-01-18")
     - `timestamp`: Current timestamp in ISO 8601 format
     - `message_type`: Always "LOCATION_RESPONSE"
     - `search_scope`: The scope level applied (tests_only, paths_only, comprehensive)
     - `locator_version`: "1.1" (to track template evolution)
     - `query_topic`: Brief description of what was searched
     - `files_found`: Total number of files across all sections
     - `directories_scanned`: Number of directories searched
  3. Show complete example with frontmatter + thinking + answer
- **Interfaces / Pseudocode**:
  ```markdown
  ## Complete Output Format with Message Envelope
  
  Every response must include YAML frontmatter, thinking section, and answer section:
  
  ### Structure
  
  ```markdown
  ---
  message_id: locator-YYYY-MM-DD-NNN
  correlation_id: [extracted from task prompt or "none"]
  timestamp: [ISO 8601 timestamp]
  message_type: LOCATION_RESPONSE
  search_scope: [tests_only|paths_only|comprehensive]
  locator_version: "1.1"
  query_topic: [brief description]
  files_found: [total count]
  directories_scanned: [count]
  ---
  
  <thinking>
  [Search strategy documentation]
  </thinking>
  
  <answer>
  ## Coordinates: [Topic]
  
  [Sections based on scope...]
  </answer>
  ```
  
  ### Frontmatter Field Instructions
  
  - **message_id**: Generate as "locator-YYYY-MM-DD-001" (increment 001, 002, 003 per session)
  - **correlation_id**: Look for "Correlation: XXX" or "correlation_id: XXX" in task prompt; use "none" if absent
  - **timestamp**: Current time in format "2026-01-18T12:00:00Z"
  - **message_type**: Always use "LOCATION_RESPONSE"
  - **search_scope**: The scope level you detected and applied
  - **locator_version**: Use "1.1" (version of this template)
  - **query_topic**: Short description extracted from task (e.g., "authentication tests", "database models")
  - **files_found**: Count of all file paths returned across all sections
  - **directories_scanned**: Count of unique directories searched
  
  ### Complete Example
  
  ```markdown
  ---
  message_id: locator-2026-01-18-001
  correlation_id: qa-auth-coverage
  timestamp: 2026-01-18T14:30:00Z
  message_type: LOCATION_RESPONSE
  search_scope: tests_only
  locator_version: "1.1"
  query_topic: authentication test files
  files_found: 2
  directories_scanned: 1
  ---
  
  <thinking>
  Search strategy for authentication test files:
  - Used glob pattern: tests/**/*auth*.spec.ts
  - Found 2 matches in tests/integration/
  - Scope: tests_only (returning Section 3 only)
  </thinking>
  
  <answer>
  ## Coordinates: Authentication Tests
  
  ### Testing Coordinates
  - `tests/integration/auth.spec.ts`
  - `tests/integration/auth-permissions.spec.ts`
  </answer>
  ```
  ```
- **Evidence**: `agent/codebase-locator.md:74-94` (current template has no frontmatter)
- **Done When**:
  - Output Format section includes YAML frontmatter instructions
  - All 9 required fields documented with generation instructions
  - Complete example shows frontmatter + thinking + answer integration

### PLAN-006: Update Python-QA-Thorough Delegation Pattern
- **Action ID**: PLAN-006
- **Change Type**: modify
- **File(s)**: `agent/python-qa-thorough.md`
- **Instruction**:
  1. Locate the delegation instruction at line 95
  2. After the existing delegation instruction, add a new subsection "## Delegating to codebase-locator for Test Files"
  3. Provide explicit delegation example with `search_scope: tests_only`
  4. Explain the token savings benefit (76% reduction)
  5. Show expected response format consumers should parse
- **Interfaces / Pseudocode**:
  ```markdown
  ## Delegating to codebase-locator for Test Files
  
  When finding test files for coverage analysis, use `tests_only` scope to receive only test file paths:
  
  ### Delegation Pattern
  
  ```
  task({
    subagent_type: "codebase-locator",
    description: "Find Python test files",
    prompt: "Find test files for src/auth/login.py. Search scope: tests_only"
  })
  ```
  
  ### Benefits
  
  - **Token savings**: ~76% reduction vs comprehensive output
  - **Faster response**: Only relevant section returned
  - **Clear intent**: Explicitly requests test coordinates
  
  ### Expected Response Format
  
  The locator will return YAML frontmatter + thinking + answer with only Testing Coordinates section:
  
  ```markdown
  ---
  message_id: locator-2026-01-18-001
  search_scope: tests_only
  files_found: 2
  ---
  
  <thinking>
  [Search strategy]
  </thinking>
  
  <answer>
  ## Coordinates: Python Test Files
  
  ### Testing Coordinates
  - `tests/unit/test_auth.py`
  - `tests/integration/test_login.py`
  </answer>
  ```
  
  ### Parsing the Response
  
  1. Extract frontmatter to verify `search_scope: tests_only` was applied
  2. Check `files_found` count to know how many test files exist
  3. Parse `<answer>` section for test file paths
  4. Ignore `<thinking>` section (can be stripped for token optimization)
  ```
- **Evidence**: `agent/python-qa-thorough.md:95` (current delegation instruction exists)
- **Done When**:
  - New section "## Delegating to codebase-locator for Test Files" added after line 95
  - Delegation example shows `search_scope: tests_only`
  - Expected response format documented
  - Parsing instructions provided

### PLAN-007: Update Python-QA-Quick Delegation Pattern
- **Action ID**: PLAN-007
- **Change Type**: modify
- **File(s)**: `agent/python-qa-quick.md`
- **Instruction**: 
  - Same as PLAN-006 but for python-qa-quick.md
  - Locate delegation at line 39 and add delegation pattern section
- **Evidence**: `agent/python-qa-quick.md:39` (delegation instruction exists)
- **Done When**: Same as PLAN-006 (delegation section added with tests_only example)

### PLAN-008: Update TypeScript-QA-Thorough Delegation Pattern
- **Action ID**: PLAN-008
- **Change Type**: modify
- **File(s)**: `agent/typescript-qa-thorough.md`
- **Instruction**:
  - Same as PLAN-006 but for typescript-qa-thorough.md
  - Locate delegation at line 136
  - Update test file patterns to TypeScript (*.test.ts, *.spec.ts)
- **Evidence**: `agent/typescript-qa-thorough.md:136` (delegation instruction exists)
- **Done When**: Delegation section added with tests_only example and TypeScript file patterns

### PLAN-009: Update TypeScript-QA-Quick Delegation Pattern
- **Action ID**: PLAN-009
- **Change Type**: modify
- **File(s)**: `agent/typescript-qa-quick.md`
- **Instruction**:
  - Same as PLAN-006 but for typescript-qa-quick.md
  - Locate delegation at line 39
  - Update test file patterns to TypeScript
- **Evidence**: `agent/typescript-qa-quick.md:39` (delegation instruction exists)
- **Done When**: Delegation section added with tests_only example and TypeScript file patterns

### PLAN-010: Update OpenCode-QA-Thorough Delegation Pattern
- **Action ID**: PLAN-010
- **Change Type**: modify
- **File(s)**: `agent/opencode-qa-thorough.md`
- **Instruction**:
  1. Locate delegation instructions at line 40 and 277
  2. Add new section "## Delegating to codebase-locator for Agent/Skill Files"
  3. For OpenCode files, recommend `paths_only` scope (needs agent/*.md and skills/*/SKILL.md paths, not tests)
  4. Provide delegation example with `search_scope: paths_only`
- **Interfaces / Pseudocode**:
  ```markdown
  ## Delegating to codebase-locator for Agent/Skill Files
  
  When finding agent or skill definition files, use `paths_only` scope:
  
  ### Delegation Pattern
  
  ```
  task({
    subagent_type: "codebase-locator",
    description: "Find OpenCode agent definitions",
    prompt: "Find agent/*.md files. Search scope: paths_only"
  })
  ```
  
  ### Benefits
  
  - **Token savings**: ~70% reduction vs comprehensive output
  - **Targeted results**: Only Primary Implementation section (agent/skill files)
  - **No unnecessary sections**: Skips config, tests, directory structure
  
  ### Expected Response
  
  ```markdown
  ---
  search_scope: paths_only
  files_found: 15
  ---
  
  <answer>
  ## Coordinates: Agent Definitions
  
  ### Primary Implementation
  - `agent/researcher.md`
  - `agent/planner.md`
  - `agent/python-qa-thorough.md`
  [...]
  </answer>
  ```
  ```
- **Evidence**: `agent/opencode-qa-thorough.md:40,277` (delegation instructions exist)
- **Done When**: Delegation section added with paths_only example for OpenCode files

### PLAN-011: Update Researcher Delegation Pattern
- **Action ID**: PLAN-011
- **Change Type**: modify
- **File(s)**: `agent/researcher.md`
- **Instruction**:
  1. Locate delegation instruction at line 50
  2. Add new section "## Delegating to codebase-locator"
  3. Recommend `comprehensive` scope for Researcher (needs full topology)
  4. Provide delegation example with explicit scope
  5. Document how to parse response with frontmatter and thinking/answer tags
- **Interfaces / Pseudocode**:
  ```markdown
  ## Delegating to codebase-locator
  
  When delegating file discovery to map codebase structure, use `comprehensive` scope:
  
  ### Delegation Pattern
  
  ```
  task({
    subagent_type: "codebase-locator",
    description: "Map authentication system structure",
    prompt: "Find all files related to authentication system. Search scope: comprehensive. Correlation: research-auth-2026-01-18"
  })
  ```
  
  ### Benefits of Comprehensive Scope
  
  - **Complete topology**: All 4 sections (implementation, config, tests, directory structure)
  - **Entry point detection**: Role metadata identifies primary vs secondary files
  - **Configuration awareness**: Related config files discovered
  - **Test coverage insight**: Test files included for coverage analysis
  
  ### Expected Response Format
  
  The locator returns YAML frontmatter + thinking + answer with all sections:
  
  ```markdown
  ---
  message_id: locator-2026-01-18-001
  correlation_id: research-auth-2026-01-18
  search_scope: comprehensive
  files_found: 7
  ---
  
  <thinking>
  Search strategy for authentication system:
  - Used glob pattern: src/**/*auth*.ts
  - Found 12 matches, filtered to 2 primary files
  - Identified entry point via read (AuthService.ts has 5 exports)
  - Found config in config/auth.yaml
  - Found 3 test files
  </thinking>
  
  <answer>
  ## Coordinates: Authentication System
  
  ### Primary Implementation
  - `src/features/auth/AuthService.ts` [entry-point, exports: 5]
  - `src/features/auth/AuthController.ts` [secondary, exports: 3]
  
  ### Related Configuration
  - `config/auth.yaml` [config]
  
  ### Testing Coordinates
  - `tests/integration/auth.spec.ts`
  
  ### Directory Structure
  `src/features/auth/` contains:
  - 5 TypeScript files
  - 1 Sub-directory (`strategies/`)
  </answer>
  ```
  
  ### Parsing the Response for Research Report
  
  1. **Frontmatter**: Use correlation_id to track which research task this responds to
  2. **Thinking**: Include in research notes if search strategy is relevant to findings
  3. **Answer**: Extract all 4 sections for complete coverage map
  4. **Role metadata**: Use [entry-point] tags to identify files for deeper analysis with codebase-analyzer
  5. **Files count**: Use files_found to validate completeness
  ```
- **Evidence**: `agent/researcher.md:50` (delegation instruction exists)
- **Done When**: 
  - Delegation section added with comprehensive scope example
  - Benefits of comprehensive scope documented
  - Response parsing instructions provided
  - Correlation ID pattern shown

### PLAN-012: Update Planner Delegation Pattern
- **Action ID**: PLAN-012
- **Change Type**: modify
- **File(s)**: `agent/planner.md`
- **Instruction**:
  - Same as PLAN-011 but for planner.md
  - Locate delegation at line 53
  - Emphasize Planner's need for full topology to plan implementation changes
- **Evidence**: `agent/planner.md:53` (delegation instruction exists)
- **Done When**: Delegation section added with comprehensive scope example for planning use cases

### PLAN-013: Update AGENTS.md with Communication Protocol
- **Action ID**: PLAN-013
- **Change Type**: modify
- **File(s)**: `AGENTS.md`
- **Instruction**:
  1. Locate the "Codebase-Analyzer Output Format and Depth Levels" section (around line 900)
  2. After that section, add new section "## Codebase-Locator Output Format and Scope Levels"
  3. Document the three scope levels (tests_only, paths_only, comprehensive)
  4. Show output structure with frontmatter + thinking + answer
  5. Provide token efficiency comparison table
  6. Show delegation examples for each consumer type
- **Interfaces / Pseudocode**:
  ```markdown
  ## Codebase-Locator Output Format and Scope Levels
  
  The codebase-locator subagent supports three scope levels to optimize token usage:
  
  ### Scope Levels
  
  1. **tests_only** (~20 tokens, 76% savings)
     - Use case: QA agents needing test file paths for coverage analysis
     - Sections: Testing Coordinates only
  
  2. **paths_only** (~25 tokens, 70% savings)
     - Use case: Targeted file discovery (agent/skill files, source files only)
     - Sections: Primary Implementation only
  
  3. **comprehensive** (~83 tokens, complete topology)
     - Use case: Researcher/Planner agents needing full system map
     - Sections: All 4 (Primary Implementation, Related Configuration, Testing Coordinates, Directory Structure)
  
  ### Output Structure
  
  All responses include:
  - YAML frontmatter (message_id, correlation_id, timestamp, search_scope, files_found, etc.)
  - `<thinking>` section (search strategy and reasoning)
  - `<answer>` section (structured findings with file paths)
  - Role metadata on file paths ([entry-point], [secondary], [config], [exports: N])
  
  ### Specifying Scope
  
  Include `Search scope: [level]` in the task prompt:
  
  ```
  task({
    subagent_type: "codebase-locator",
    description: "Find test files",
    prompt: "Find test files for src/auth/login.py. Search scope: tests_only"
  })
  ```
  
  If not specified, defaults to `comprehensive`.
  
  ### Token Efficiency
  
  Based on research (thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md):
  - QA workflows: -76% token usage with tests_only scope
  - Targeted discovery: -70% token usage with paths_only scope
  - Researcher/Planner workflows: 0% change with comprehensive scope (but gains entry point detection and debugging)
  
  ### Role Metadata
  
  File paths include role metadata to eliminate ambiguity:
  
  ```markdown
  ### Primary Implementation
  - `src/features/auth/AuthService.ts` [entry-point, exports: 5]
  - `src/features/auth/AuthController.ts` [secondary, exports: 3]
  
  ### Related Configuration
  - `config/auth.yaml` [config]
  ```
  
  This eliminates the need for follow-up queries to determine which file is the "main" entry point.
  
  ### Complete Example (tests_only scope)
  
  ```markdown
  ---
  message_id: locator-2026-01-18-001
  correlation_id: qa-auth-coverage
  timestamp: 2026-01-18T14:30:00Z
  message_type: LOCATION_RESPONSE
  search_scope: tests_only
  locator_version: "1.1"
  query_topic: authentication test files
  files_found: 2
  directories_scanned: 1
  ---
  
  <thinking>
  Search strategy for authentication test files:
  - Used glob pattern: tests/**/*auth*.spec.ts
  - Found 2 matches in tests/integration/
  - Scope: tests_only (returning Section 3 only)
  </thinking>
  
  <answer>
  ## Coordinates: Authentication Tests
  
  ### Testing Coordinates
  - `tests/integration/auth.spec.ts`
  - `tests/integration/auth-permissions.spec.ts`
  </answer>
  ```
  ```
- **Evidence**: `AGENTS.md` (codebase-analyzer section exists around line 900)
- **Done When**:
  - New section added after codebase-analyzer section
  - All three scope levels documented
  - Output structure explained with examples
  - Token efficiency table included
  - Delegation examples provided

## Verification Tasks

No verification tasks needed - all implementation steps are based on verified facts from the research report.

## Acceptance Criteria

Implementation is complete when:

1. **Scope Parameter Support**: Codebase-locator accepts and correctly handles `tests_only`, `paths_only`, `comprehensive` parameters
2. **Conditional Output**: Agent returns only requested sections based on scope (verified by manual test delegations)
3. **Role Metadata**: File paths include `[entry-point]`, `[secondary]`, `[config]`, `[exports: N]` tags when applicable
4. **Thinking/Answer Separation**: All responses wrapped in `<thinking>` and `<answer>` tags
5. **Message Envelope**: YAML frontmatter includes all 9 required fields (message_id, correlation_id, timestamp, message_type, search_scope, locator_version, query_topic, files_found, directories_scanned)
6. **Consumer Updates**: All 8 consumer agents (Researcher, Planner, 6 QA agents) have delegation examples in their prompts
7. **Backward Compatibility**: Default scope is `comprehensive` (no breaking changes for existing workflows)
8. **Documentation**: AGENTS.md includes new section documenting scope levels and output format
9. **Token Efficiency**: Manual test confirms ~76% token reduction for tests_only scope vs comprehensive
10. **Entry Point Detection**: When multiple files exist in Primary Implementation, agent uses read to identify and mark entry point

## Implementor Checklist

- [ ] PLAN-001: Update locator system prompt to accept search_scope parameter
- [ ] PLAN-002: Implement conditional output logic based on scope
- [ ] PLAN-003: Add role metadata to file paths
- [ ] PLAN-004: Add thinking/answer separation
- [ ] PLAN-005: Add message envelope with YAML frontmatter
- [ ] PLAN-006: Update Python-QA-Thorough delegation pattern
- [ ] PLAN-007: Update Python-QA-Quick delegation pattern
- [ ] PLAN-008: Update TypeScript-QA-Thorough delegation pattern
- [ ] PLAN-009: Update TypeScript-QA-Quick delegation pattern
- [ ] PLAN-010: Update OpenCode-QA-Thorough delegation pattern
- [ ] PLAN-011: Update Researcher delegation pattern
- [ ] PLAN-012: Update Planner delegation pattern
- [ ] PLAN-013: Update AGENTS.md with communication protocol

## Phase Breakdown

### Phase 1: Core Locator Enhancements (PLAN-001 to PLAN-005)
- **Focus**: Implement new output format in codebase-locator agent
- **Files**: `agent/codebase-locator.md` only
- **Estimated effort**: 2-3 hours
- **Verification**: Manual test delegation with each scope level

### Phase 2: Consumer Updates (PLAN-006 to PLAN-012)
- **Focus**: Update all 8 consumer agents with delegation examples
- **Files**: All consumer agent definitions
- **Estimated effort**: 3-4 hours (repetitive but needs customization per agent)
- **Verification**: Spot-check each agent file for delegation section

### Phase 3: Documentation (PLAN-013)
- **Focus**: Update AGENTS.md with new protocol
- **Files**: `AGENTS.md`
- **Estimated effort**: 1 hour
- **Verification**: Review documentation for completeness

## Dependencies

- **No external dependencies**: All changes are to agent definitions (Markdown files)
- **No code changes**: No TypeScript/JavaScript modifications required
- **No breaking changes**: Default scope is comprehensive (backward compatible)

## Risks & Mitigations

### Risk 1: Agents Don't Parse Scope Parameter Correctly
- **Mitigation**: Provide clear examples in system prompt with exact phrase matching ("Search scope: tests_only")
- **Fallback**: Default to comprehensive if scope not detected

### Risk 2: Token Overhead from Frontmatter Negates Savings
- **Analysis**: Frontmatter adds ~30 tokens, but tests_only saves ~63 tokens, net savings still ~33 tokens (40%)
- **Mitigation**: Acceptable trade-off for debugging capability

### Risk 3: Consumers Don't Adopt New Scope Parameter
- **Mitigation**: Backward compatible (comprehensive is default), consumers can adopt incrementally
- **Mitigation**: Clear documentation in AGENTS.md and delegation examples in each agent

### Risk 4: Role Metadata Adds Complexity
- **Mitigation**: Only use read for entry point detection when multiple files exist
- **Mitigation**: Simple logic: count exports, mark highest as entry-point

## Success Metrics

Post-implementation, measure:

1. **Token reduction**: Compare before/after token counts for QA agent delegations (target: -76% for tests_only)
2. **Adoption rate**: Track how many consumer agents use explicit scope parameters
3. **Follow-up query reduction**: Measure if entry point metadata eliminates secondary delegations
4. **Debugging value**: Subjective assessment of whether thinking section helps diagnose search issues

## References

- **Research report**: `thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md`
- **Industry best practices**: Anthropic Multi-Agent Research System, Microsoft Token Efficiency Study
- **Related work**: `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (similar optimization pattern)
- **Codebase-analyzer plan**: `thoughts/shared/plans/2026-01-18-Codebase-Analyzer-Communication-Optimization.md` (parallel effort)
