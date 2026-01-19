# Task-Executor Communication Optimization Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-18-Task-Executor-Agent-Communication.md`
- User request: "Create a plan to optimize task-executor agent communication based on research findings"

## Verified Current State

### Fact 1: Current Output Format Uses Semi-Structured Markdown
- **Evidence:** `agent/task-executor.md:158-198`
- **Excerpt:**
  ```markdown
  ## Task Execution Report: PLAN-XXX
  
  **Status**: SUCCESS | FAILED | BLOCKED
  
  ### Changes Made
  
  **Modified Files**:
  - `path/to/file1.ts` - [brief description of change]
  ```

### Fact 2: No YAML Frontmatter for Structured Metadata
- **Evidence:** `agent/task-executor.md:158` (template starts with heading, no frontmatter)
- **Excerpt:** Template begins with `## Task Execution Report: PLAN-XXX`

### Fact 3: No Thinking/Answer Separation
- **Evidence:** `agent/task-executor.md:158-198`
- **Excerpt:** Template has no `<thinking>` or `<answer>` tags

### Fact 4: Adaptations Section Lacks Code Excerpts
- **Evidence:** `agent/task-executor.md:178-183`
- **Excerpt:**
  ```markdown
  ### Adaptations Made
  
  If you had to adapt the task due to reality differing from task expectations:
  
  - **Adaptation 1**: Task referenced line 42, but function was at line 38. Adapted and applied change to line 38.
  ```

### Fact 5: Inconsistent Heading Formats Across Templates
- **Evidence:** Three different formats found:
  - Generic: `agent/task-executor.md:158` - `## Task Execution Report: PLAN-XXX`
  - SUCCESS: `agent/task-executor.md:293` - `## ✅ Task Execution: PLAN-XXX - [Task Name]`
  - BLOCKED: `agent/task-executor.md:313` - `## ⚠️ Task Blocked: PLAN-XXX - [Task Name]`

### Fact 6: Implementation-Controller Expects Parsed Status
- **Evidence:** `agent/implementation-controller.md:159-163`
- **Excerpt:**
  ```markdown
  2. **Parse executor response**:
     - Extract status: SUCCESS | BLOCKED | FAILED
     - Extract changes made (file list)
     - Extract adaptations (if any)
     - Extract blockers (if BLOCKED)
  ```

## Goals / Non-Goals

### Goals:
1. Add YAML frontmatter with structured message envelope (correlation IDs, timestamps, status, file counts)
2. Separate reasoning from findings using `<thinking>` and `<answer>` tags
3. Add code excerpts to adaptations section (before/after state)
4. Standardize heading format across all status types
5. Update implementation-controller agent with parsing guidance

### Non-Goals:
- No changes to task-executor's core logic or tool permissions
- No changes to task payload structure (input format remains the same)
- No changes to verification workflow (controller still owns verification)

## Design Overview

### Changes to task-executor.md:
1. Add YAML frontmatter template at line 158 (before heading)
2. Wrap existing template in `<thinking>` (before) and `<answer>` (around template)
3. Enhance adaptations section (lines 178-183) with code excerpt template
4. Standardize all heading examples to consistent emoji format
5. Update example outputs (lines 288-325) with new format

### Changes to implementation-controller.md:
1. Add new section "Parsing Task Executor Response" after line 163
2. Document YAML frontmatter field access
3. Explain thinking/answer tag usage
4. Provide adaptation excerpt parsing examples

### Token Impact:
- +40 tokens (+10%) for YAML frontmatter (all tasks)
- +80 tokens (+20%) for thinking tags (all tasks, but can be stripped)
- +100-150 tokens (+25-35%) for code excerpts (only 20% of tasks with adaptations)
- Net: +13% for typical tasks, eliminates duplicate reads for adapted tasks

## Implementation Instructions (For Implementor)

### PLAN-001: Add YAML Frontmatter Template
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/task-executor.md`
- **Instruction:**
  1. Locate line 158 (heading `## Task Execution Report: PLAN-XXX`)
  2. Insert YAML frontmatter block BEFORE the heading
  3. Add the following template:
     ```yaml
     ---
     message_id: executor-YYYY-MM-DD-NNN
     correlation_id: plan-YYYY-MM-DD-[ticket]-task-XXX
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: EXECUTION_RESPONSE
     task_id: PLAN-XXX
     status: SUCCESS | BLOCKED | FAILED
     executor_version: "1.1"
     files_modified: N
     files_created: N
     files_deleted: N
     adaptations_made: N
     ---
     ```
  4. Add instructional comment before frontmatter: "Generate message_id from timestamp + sequence (executor-2026-01-18-001). Accept correlation_id from caller if provided. Include atomic counts for files and adaptations."
- **Evidence:** `agent/task-executor.md:158` (current template starts here)
- **Done When:** YAML frontmatter appears in template before heading, with all required fields documented
- **Interfaces:** Standard YAML frontmatter syntax compatible with Markdown parsers

### PLAN-002: Wrap Template in Thinking/Answer Tags
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/task-executor.md`
- **Instruction:**
  1. Locate the output template section (lines 158-198)
  2. Insert `<thinking>` section BEFORE the YAML frontmatter with instruction:
     ```markdown
     <thinking>
     Document your reasoning process:
     1. Task payload parsing (taskId, files, instruction)
     2. Evidence verification (check file:line references match reality)
     3. Strategy planning (approach to implementing the task)
     4. Execution steps (what you actually did)
     5. Adaptation reasoning (why you deviated from task if applicable)
     </thinking>
     ```
  3. Wrap the entire output template (YAML frontmatter + Markdown sections) in `<answer>` tags
  4. Ensure closing `</answer>` tag appears after the final section
- **Evidence:** `agent/task-executor.md:158-198` (template currently has no tags)
- **Done When:** Template includes thinking section with instructions, entire output wrapped in answer tags
- **Interfaces:** Standard XML-style tags as used by Anthropic Claude

### PLAN-003: Enhance Adaptations Section with Code Excerpts
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/task-executor.md`
- **Instruction:**
  1. Locate the Adaptations Made section (lines 178-183)
  2. Replace the current template with enhanced version including code excerpts:
     ```markdown
     ### Adaptations Made
     
     If you had to adapt the task due to reality differing from task expectations, document each adaptation with code excerpts:
     
     - **Adaptation 1**: [Description of what differed]
       - **Task Evidence**: `file:line-line` (what task referenced)
       - **Actual Location**: `file:line-line` (where code actually is)
       - **Before Excerpt** (actual code before your changes, 1-6 lines):
         ```language
         # Line numbers
         actual code here
         ```
       - **After Excerpt** (actual code after your changes, 1-6 lines):
         ```language
         # Line numbers
         modified code here
         ```
       - **Reasoning**: Why you made this adaptation
     ```
  3. Add note: "For each adaptation, include concrete line-numbered excerpts showing before/after state. This eliminates the need for Control Agent to re-read files when reporting adaptations."
- **Evidence:** `agent/task-executor.md:178-183` (current template lacks excerpts)
- **Done When:** Adaptations section template includes task evidence, actual location, before/after code excerpts with line numbers, and reasoning fields
- **Interfaces:** Markdown code blocks with language syntax highlighting

### PLAN-004: Standardize Heading Formats
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `agent/task-executor.md`
- **Instruction:**
  1. Update generic template heading (line 158) from `## Task Execution Report: PLAN-XXX` to:
     ```markdown
     ## ✅ Task Execution: PLAN-XXX - [Task Name]  (for SUCCESS)
     ## ⚠️ Task Blocked: PLAN-XXX - [Task Name]     (for BLOCKED)
     ## ❌ Task Failed: PLAN-XXX - [Task Name]      (for FAILED)
     ```
  2. Add instruction: "Use appropriate emoji based on status: ✅ for SUCCESS, ⚠️ for BLOCKED, ❌ for FAILED"
  3. Verify SUCCESS example (line 293) already uses ✅ format
  4. Verify BLOCKED example (line 313) already uses ⚠️ format
  5. Add FAILED example if missing, using ❌ format
- **Evidence:** Three different heading formats currently exist (lines 158, 293, 313)
- **Done When:** All template sections use consistent emoji + task ID + task name heading format, with examples for all three status types
- **Interfaces:** Standard Markdown heading syntax with emoji Unicode characters

### PLAN-005: Update Example Outputs with New Format
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `agent/task-executor.md`
- **Instruction:**
  1. Locate SUCCESS example (lines 288-309)
  2. Add YAML frontmatter before the heading
  3. Wrap in `<thinking>` and `<answer>` tags
  4. Update adaptations section to include code excerpts if present
  5. Locate BLOCKED example (lines 311-325)
  6. Apply same updates (frontmatter + tags)
  7. If FAILED example doesn't exist, create one with full format
- **Evidence:** `agent/task-executor.md:288-325` (examples currently lack new format)
- **Done When:** All example outputs demonstrate complete new format (frontmatter + thinking + answer tags + excerpt-enhanced adaptations)
- **Interfaces:** Complete working examples following new template

### PLAN-006: Add Parsing Guidance to Implementation-Controller
- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Insert new section after line 163 (after "Parse executor response")
  2. Add heading: `### Parsing Task Executor Response Structure`
  3. Add subsections:
     - "Accessing YAML Frontmatter Fields" (how to extract status, file counts, etc.)
     - "Using Thinking Section for Debugging" (when to inspect reasoning)
     - "Extracting Answer Sections" (how to parse Markdown sections)
     - "Handling Adaptations with Excerpts" (no need to re-read files)
  4. Include code examples showing field access patterns
  5. Document that `frontmatter.status` should be used instead of text parsing
  6. Explain when to strip `<thinking>` for token optimization
- **Evidence:** `agent/implementation-controller.md:159-163` (current parsing section lacks format details)
- **Done When:** New section provides explicit parsing examples for all frontmatter fields, explains thinking/answer usage, documents adaptation excerpt handling
- **Interfaces:** Pseudocode examples of field access and section parsing

### PLAN-007: Update AGENTS.md Documentation
- **Action ID:** PLAN-007
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate "Implementation Workflow" section (around line 125)
  2. Find subsection describing Task-Executor output
  3. Update to reference new format:
     - YAML frontmatter with message envelope
     - Thinking/answer separation
     - Code excerpts in adaptations
     - Standardized heading formats
  4. Add token impact note: "+10-13% typical tasks, net improvement for adapted tasks due to eliminated duplicate reads"
  5. Update any example task executor responses to use new format
- **Evidence:** `AGENTS.md:125-195` (implementation workflow section)
- **Done When:** AGENTS.md accurately documents new task-executor output format with examples
- **Interfaces:** Documentation markdown with code examples

## Verification Tasks

No unverified assumptions - all claims verified against codebase.

## Acceptance Criteria

1. **YAML Frontmatter**: Task-executor template includes structured message envelope with message_id, correlation_id, timestamp, status, file counts, adaptations_made
2. **Thinking Separation**: All output templates wrapped in `<thinking>` (reasoning) and `<answer>` (findings) tags
3. **Code Excerpts**: Adaptations section template includes task evidence, actual location, before/after code excerpts (1-6 lines), and reasoning
4. **Consistent Headings**: All three status types (SUCCESS, BLOCKED, FAILED) use consistent emoji + PLAN-XXX + task name format
5. **Controller Guidance**: Implementation-controller.md includes parsing section with frontmatter field access, thinking/answer usage, adaptation handling
6. **Documentation Updated**: AGENTS.md reflects new output format with token impact notes
7. **Examples Complete**: At least one complete example for each status type (SUCCESS, BLOCKED, FAILED) demonstrating full format
8. **Backward Compatibility**: executor_version field set to "1.1" to indicate format change

## Implementor Checklist

- [ ] PLAN-001: Add YAML frontmatter template to task-executor output
- [ ] PLAN-002: Wrap template in thinking/answer tags
- [ ] PLAN-003: Enhance adaptations section with code excerpt template
- [ ] PLAN-004: Standardize heading formats across all status types
- [ ] PLAN-005: Update example outputs with complete new format
- [ ] PLAN-006: Add parsing guidance to implementation-controller agent
- [ ] PLAN-007: Update AGENTS.md documentation
