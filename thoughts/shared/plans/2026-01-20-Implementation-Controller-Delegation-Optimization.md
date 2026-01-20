# Implementation-Controller Delegation Optimization

## Inputs
- Research report used: `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md`
- User request summary: Implement task complexity heuristic to optimize Implementation-Controller delegation overhead by executing simple tasks directly instead of delegating to Task-Executor

## Verified Current State

### Current Delegation Architecture

- **Fact:** Implementation-Controller unconditionally delegates ALL tasks to Task-Executor subagent
- **Evidence:** `agent/implementation-controller.md:212-220`
- **Excerpt:**
  ```markdown
  #### Step 2: Invoke Task Executor
  
  1. **Call Task Executor** subagent via `task` tool:
  
     ```
     Prompt: "Execute this implementation task: [JSON payload]"
     Subagent: task-executor
     ```
  
  2. **Parse executor response**:
     - Extract status: SUCCESS | BLOCKED | FAILED
  ```

### Controller Edit Permissions

- **Fact:** Implementation-Controller has `edit: true` permission enabled
- **Evidence:** `agent/implementation-controller.md:7`
- **Excerpt:**
  ```markdown
  edit: true # For updating STATE file
  ```

- **Fact:** Controller instructions currently prohibit editing source files
- **Evidence:** `agent/implementation-controller.md:40-43`
- **Excerpt:**
  ```markdown
  1. **No Direct Code Editing**
     - You do NOT edit source code files yourself.
     - You only edit the STATE file to track progress.
     - All code changes go through Task Executor.
  ```

### Task Payload Structure

- **Fact:** Task payload contains all fields needed for complexity assessment
- **Evidence:** `agent/implementation-controller.md:194-205`
- **Excerpt:**
  ```markdown
  {
    "taskId": "PLAN-XXX",
    "taskName": "[Short title from plan]",
    "changeType": "modify|create|remove",
    "files": ["list", "of", "files"],
    "instruction": "Detailed step-by-step instruction from plan",
    "evidence": "file:line-line references from plan",
    "doneWhen": "Observable completion criteria from plan",
    "allowedAdjacentEdits": ["list of allowed adjacent edits if specified"],
    "context": "Phase name and purpose"
  }
  ```

### STATE File Update Location

- **Fact:** Controller updates STATE file after each task completion
- **Evidence:** `agent/implementation-controller.md:481-493`
- **Excerpt:**
  ```markdown
  1. **Update STATE file**:
  
     Use `edit` tool to modify `YYYY-MM-DD-[Ticket]-STATE.md`:
     
     - Add PLAN-XXX to "Completed Tasks" list
     - Update "Current Task" to next PLAN-YYY
     - Optional: Add brief note about what was done (1 line max)
  
     Example edit:
     ```markdown
     **Current Task**: PLAN-006
     **Completed Tasks**: PLAN-001, PLAN-002, PLAN-003, PLAN-004, PLAN-005
     ```
  ```

### Planner Task Format

- **Fact:** Planner task format currently has 7 required fields
- **Evidence:** `agent/planner.md:469-477`
- **Excerpt:**
  ```markdown
  ## Implementation Instructions (For Implementor)
  For each action:
  - **Action ID:** PLAN-001
  - **Change Type:** create/modify/remove
  - **File(s):** `path/...`
  - **Instruction:** exact steps
  - **Interfaces / Pseudocode:** minimal
  - **Evidence:** `path:line-line` (why this file / why this approach)
  - **Done When:** concrete observable condition
  ```

### Measured Delegation Overhead

- **Fact:** Research quantifies delegation overhead for simple tasks at +25% tokens, +100% latency
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:92`
- **Excerpt:**
  ```markdown
  - **Overhead: +25% tokens, +100% latency**
  ```

- **Fact:** Research estimates 40-60% of tasks are simple (single file, clear instructions, no dependencies)
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:24`
- **Excerpt:**
  ```markdown
  - **Expected impact**: 25% token savings and 50% latency reduction for simple tasks (estimated 40-60% of all implementation tasks)
  ```

## Goals / Non-Goals

### Goals
- Implement 5-dimension complexity heuristic to classify tasks as SIMPLE/BORDERLINE/COMPLEX
- Enable Controller to execute SIMPLE tasks (score=0) directly without delegation
- Maintain existing delegation flow for BORDERLINE (score 1-2) and COMPLEX (score ≥3) tasks
- Log complexity score and execution mode in STATE file for observability
- Achieve 25% token savings and 50% latency reduction for simple tasks

### Non-Goals
- NO changes to Task-Executor subagent (unchanged)
- NO breaking changes to existing plan format (complexity override is optional)
- NO changes to verification or commit workflow (same discipline for all edits)
- NO modification to tool permissions (Controller already has `edit: true`)
- NO changes to delegation logic for complex tasks (preserve adaptation capability)

## Design Overview

### Data Flow: Task Classification

1. Controller extracts task payload from plan (existing Step 1)
2. **NEW:** Controller calculates complexity score using 5 dimensions:
   - File count: +3 if files.length > 1
   - Instruction complexity: +2 if tokens ≥ 150
   - Evidence staleness: +2 if specific line numbers in non-template section
   - Dependency tracing: +2 if instruction contains tracing keywords
   - Adjacent edits: +1 if allowedAdjacentEdits.length > 0
3. **NEW:** Controller classifies task:
   - Score = 0: SIMPLE → direct execution
   - Score = 1-2: BORDERLINE → delegate (safety)
   - Score ≥ 3: COMPLEX → delegate
4. Controller branches:
   - SIMPLE → Step 2-ALT (new direct execution path)
   - Others → Step 2 (existing delegation path)

### Control Flow: Direct Execution Path (NEW)

**For SIMPLE tasks only:**
1. Read target file(s)
2. Apply edit following task instruction
3. Run verification commands (same as delegation path)
4. Update STATE with complexity score + "direct" mode
5. Commit (same format as delegation path)
6. Report to user and stop

**For BORDERLINE/COMPLEX tasks:**
- Use existing delegation flow (unchanged)

### Helper Functions (NEW)

- `hasSpecificLineNumbers(evidence)`: Detect patterns like "file:42-48" or "Line 84"
- `isTemplateSection(evidence)`: Check for stable template keywords
- `containsTracingKeywords(instruction)`: Detect "trace", "follow", "find usages", etc.
- `estimateTokens(text)`: Rough approximation (1 token ≈ 4 characters)

## Implementation Instructions (For Implementor)

### Phase 1: Enable Conditional Source Editing

#### PLAN-001: Update Non-Negotiables to Allow Conditional Source Editing
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate line 40 (start of "No Direct Code Editing" rule)
  2. Replace lines 40-43 with conditional editing rule:
     ```markdown
     1. **Conditional Code Editing**
        - For SIMPLE tasks (complexity score = 0): You MAY edit source files directly
        - For BORDERLINE/COMPLEX tasks (score ≥ 1): Delegate to Task Executor
        - You ALWAYS edit the STATE file to track progress (all execution modes)
        - Follow the same verification and commit workflow for all edits
     ```
  3. Preserve the surrounding context (line 39 "## Non-Negotiables (Enforced)" and line 45 "2. **Verification After Each Task**")
- **Interfaces / Pseudocode:**
  ```markdown
  ## Non-Negotiables (Enforced)
  
  1. **Conditional Code Editing**
     - For SIMPLE tasks (complexity score = 0): You MAY edit source files directly
     - For BORDERLINE/COMPLEX tasks (score ≥ 1): Delegate to Task Executor
     - You ALWAYS edit the STATE file to track progress (all execution modes)
     - Follow the same verification and commit workflow for all edits
  
  2. **Verification After Each Task**
  ```
- **Evidence:** `agent/implementation-controller.md:40-43` (current prohibition), `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:799-836` (research recommendation #2)
- **Done When:** `grep -A 4 "## Non-Negotiables" agent/implementation-controller.md | grep "Conditional Code Editing"` returns match AND `grep -A 4 "Conditional Code Editing" agent/implementation-controller.md | grep "complexity score = 0"` returns match

#### PLAN-002: Update Forbidden Actions to Clarify Conditional Editing
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate line 76 (start of "### Forbidden Actions" section)
  2. Replace line 78 ("* No direct code editing (use Task Executor)") with:
     ```markdown
     * No direct code editing for BORDERLINE/COMPLEX tasks (use Task Executor for score ≥ 1)
     ```
  3. Keep lines 79-80 unchanged
- **Interfaces / Pseudocode:**
  ```markdown
  ### Forbidden Actions
  
  * No direct code editing for BORDERLINE/COMPLEX tasks (use Task Executor for score ≥ 1)
  * No grep/glob (Task Executor handles code discovery)
  * No web research (plan should be complete)
  ```
- **Evidence:** `agent/implementation-controller.md:76-80` (current prohibition)
- **Done When:** `grep -A 3 "### Forbidden Actions" agent/implementation-controller.md | grep "BORDERLINE/COMPLEX tasks"` returns match

### Phase 2: Implement Complexity Heuristic

#### PLAN-003: Add Helper Functions Section
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate line 184 (start of "### Phase 1..N: The Orchestration Loop")
  2. Insert a new section BEFORE line 184 with this content:
     ```markdown
     ### Helper Functions: Task Complexity Assessment
     
     Use these functions to calculate task complexity scores:
     
     #### hasSpecificLineNumbers(evidence)
     - **Purpose:** Detect if evidence contains specific line number references
     - **Pattern:** Check for "file:NN-NN" or "Line NN" patterns
     - **Returns:** true if specific line numbers found, false otherwise
     - **Example:** "src/auth.ts:42-48" → true, "template section" → false
     
     #### isTemplateSection(evidence)
     - **Purpose:** Determine if evidence references a stable template section
     - **Stable keywords:** "## Output Template", "### 1. Execution Flow", "## Prime Directive", "## Non-Negotiables"
     - **Returns:** true if evidence contains template keywords, false otherwise
     - **Rationale:** Template sections have stable structure (low staleness risk)
     
     #### containsTracingKeywords(instruction)
     - **Purpose:** Detect if instruction requires dependency tracing
     - **Keywords:** "trace", "follow", "find usages", "update callers", "import", "dependent"
     - **Returns:** true if any keyword found (case-insensitive), false otherwise
     - **Rationale:** Tracing requires multi-file reads and call graph analysis
     
     #### estimateTokens(text)
     - **Purpose:** Rough token count estimation for instruction complexity
     - **Formula:** text.length / 4 (approximation: 1 token ≈ 4 characters)
     - **Returns:** Estimated token count
     - **Usage:** If estimateTokens(instruction) ≥ 150 → complex instruction (+2 score)
     
     ```
  3. Ensure proper spacing (blank line before and after the new section)
- **Interfaces / Pseudocode:** (provided in instruction above)
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:580-599` (helper function pseudocode)
- **Done When:** `sed -n '/### Helper Functions: Task Complexity Assessment/,/### Phase 1/p' agent/implementation-controller.md | grep -E "(hasSpecificLineNumbers|isTemplateSection|containsTracingKeywords|estimateTokens)" | wc -l` returns 4

#### PLAN-004: Add Complexity Assessment Logic (Step 1.5)
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate the end of "#### Step 1: Extract Task Payload" section (after line 211 "- Instruction is clear and actionable")
  2. Insert a new step AFTER Step 1 and BEFORE "#### Step 2: Invoke Task Executor":
     ```markdown
     
     #### Step 1.5: Assess Task Complexity
     
     After extracting the task payload, calculate complexity score to determine execution mode:
     
     1. **Calculate Complexity Score:**
     
        ```
        score = 0
        
        // Dimension 1: File count (weight: 3)
        if (taskPayload.files.length > 1):
          score += 3
        
        // Dimension 2: Instruction complexity (weight: 2)
        instructionTokens = estimateTokens(taskPayload.instruction)
        if (instructionTokens >= 150):
          score += 2
        
        // Dimension 3: Evidence staleness (weight: 2)
        if (hasSpecificLineNumbers(taskPayload.evidence) && !isTemplateSection(taskPayload.evidence)):
          score += 2
        
        // Dimension 4: Dependency tracing (weight: 2)
        if (containsTracingKeywords(taskPayload.instruction)):
          score += 2
        
        // Dimension 5: Adjacent edits (weight: 1)
        if (taskPayload.allowedAdjacentEdits && taskPayload.allowedAdjacentEdits.length > 0):
          score += 1
        ```
     
     2. **Classify Task:**
     
        - **Score = 0**: SIMPLE → Execute directly (proceed to Step 2-ALT)
        - **Score = 1-2**: BORDERLINE → Delegate for safety (proceed to Step 2)
        - **Score ≥ 3**: COMPLEX → Delegate (proceed to Step 2)
     
     3. **Branch Decision:**
     
        - If SIMPLE: Skip to "Step 2-ALT: Execute Task Directly"
        - Else: Continue to "Step 2: Invoke Task Executor" (existing flow)
     
     **Rationale:** Simple tasks (score=0) have clear instructions, single file, no staleness risk, no tracing, no adjacent edits. Delegation overhead (25% tokens, 2× latency) is not justified. Borderline tasks default to delegation for safety (adaptation capability may be needed).
     
     ```
  3. Preserve the existing "#### Step 2: Invoke Task Executor" section (starts at current line 212)
- **Interfaces / Pseudocode:** (provided in instruction above)
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:542-578` (decision algorithm)
- **Done When:** `grep "#### Step 1.5: Assess Task Complexity" agent/implementation-controller.md` returns match AND `sed -n '/#### Step 1.5/,/#### Step 2:/p' agent/implementation-controller.md | grep -E "(score = 0|SIMPLE|BORDERLINE|COMPLEX)" | wc -l` returns at least 6

#### PLAN-005: Add Direct Execution Path (Step 2-ALT)
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate "#### Step 2: Invoke Task Executor" section (after the newly added Step 1.5)
  2. Insert a new section BEFORE "#### Step 2: Invoke Task Executor":
     ```markdown
     
     #### Step 2-ALT: Execute Task Directly (SIMPLE Tasks Only)
     
     **Use this path ONLY when Step 1.5 classified task as SIMPLE (score = 0).**
     
     1. **Read Target File(s):**
     
        Use `read` tool to load the file(s) specified in `taskPayload.files`.
        
        - Verify file exists (or is intended for creation if changeType="create")
        - Note current line numbers for evidence verification
     
     2. **Apply Edit:**
     
        Use `edit` tool to modify the target file following `taskPayload.instruction`:
        
        - Follow instruction step-by-step (no interpretation needed for SIMPLE tasks)
        - If evidence references specific lines, adapt if line numbers shifted (document in commit)
        - For create operations: Use `write` tool instead
        - For remove operations: Use `bash` tool with `rm` command
     
     3. **Verification:**
     
        Run verification commands from `taskPayload.doneWhen`:
        
        - Use `bash` tool to execute verification commands
        - If verification fails: Analyze output, fix issue, re-verify
        - Maximum 2 retry attempts (same as delegation path)
        - If still failing after 2 retries: STOP and report to user
     
     4. **Record Complexity:**
     
        Store for STATE update:
        
        - Complexity score: 0
        - Execution mode: "direct"
     
     5. **Proceed to Step 5:**
     
        Skip Steps 2-4 (delegation flow) and jump directly to "Step 5: Update State & Commit"
     
     **Important:** This path is ONLY for SIMPLE tasks. If you encounter any ambiguity, dependency tracing needs, or multi-file coordination during execution, STOP and report (the complexity heuristic may have misclassified the task).
     
     ```
  3. Ensure the existing "#### Step 2: Invoke Task Executor" section follows immediately after
- **Interfaces / Pseudocode:** (provided in instruction above)
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:818-834` (research recommendation #2 "Step 2-ALT workflow")
- **Done When:** `grep "#### Step 2-ALT: Execute Task Directly" agent/implementation-controller.md` returns match AND `sed -n '/#### Step 2-ALT/,/#### Step 2: Invoke/p' agent/implementation-controller.md | grep -E "(SIMPLE Tasks Only|Complexity score: 0|Execution mode: \"direct\")" | wc -l` returns 3

### Phase 3: Add Observability

#### PLAN-006: Update STATE File Format to Track Complexity
- **Change Type:** modify
- **File(s):** `agent/implementation-controller.md`
- **Instruction:**
  1. Locate "#### Step 5: Update State & Commit" section (around line 479)
  2. Find the subsection "1. **Update STATE file**:" (around line 481)
  3. Update the instruction to include complexity tracking:
     - After "- Add PLAN-XXX to 'Completed Tasks' list", add:
       "- Include complexity score and execution mode in format: `PLAN-XXX (score: N, mode: direct|delegated)`"
     - Update the example edit (lines 490-493) to:
       ```markdown
       Example edit:
       ```markdown
       **Current Task**: PLAN-006
       **Completed Tasks**: 
       - PLAN-001 (score: 0, mode: direct)
       - PLAN-002 (score: 2, mode: delegated)
       - PLAN-003 (score: 0, mode: direct)
       - PLAN-004 (score: 5, mode: delegated)
       - PLAN-005 (score: 3, mode: delegated)
       ```
       ```
  4. Add a note after the example explaining the purpose:
     ```markdown
     
     **Purpose of Complexity Tracking:**
     - Enables post-mortem analysis of heuristic accuracy
     - Provides data for threshold tuning (identify misclassifications)
     - Minimal overhead: one additional field per task
     ```
- **Interfaces / Pseudocode:** (provided in instruction above)
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:839-881` (research recommendation #3)
- **Done When:** `sed -n '/#### Step 5: Update State/,/#### Step 6/p' agent/implementation-controller.md | grep "score:" | wc -l` returns at least 5 (5 tasks in example)

### Phase 4: Optional Enhancement (Low Priority)

#### PLAN-007: Add Complexity Override to Planner Task Format (Optional)
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. Locate the task format specification (lines 469-477)
  2. Add a new optional field after "Done When":
     ```markdown
     - **Complexity:** simple|complex (OPTIONAL - overrides heuristic if specified)
     ```
  3. Add a note explaining the override:
     ```markdown
     
     **Complexity Override Usage:**
     - Use `simple` to force direct execution (use when heuristic might overestimate complexity)
     - Use `complex` to force delegation (use when task appears simple but has hidden complexity)
     - Omit field to let Implementation-Controller use automatic heuristic (recommended default)
     - Example use case: Single-file task in highly unstable file → mark as `complex` to use adaptation capability
     ```
- **Interfaces / Pseudocode:** (provided in instruction above)
- **Evidence:** `thoughts/shared/research/2026-01-20-Implementation-Controller-Delegation-Overhead-Analysis.md:883-913` (research recommendation #4)
- **Done When:** `grep -A 10 "## Implementation Instructions" agent/planner.md | grep "Complexity:"` returns match
- **Note:** This task is OPTIONAL (low priority). Can be deferred or skipped if user wants faster deployment.

## Verification Tasks (If Assumptions Exist)

No assumptions requiring verification. All changes are based on verified evidence from research report and file reads.

## Acceptance Criteria

1. **Heuristic Implemented:** `agent/implementation-controller.md` contains complexity scoring function with 5 dimensions (file count, instruction tokens, evidence staleness, dependency tracing, adjacent edits)
2. **Helper Functions Present:** `hasSpecificLineNumbers`, `isTemplateSection`, `containsTracingKeywords`, `estimateTokens` documented in Helper Functions section
3. **Branching Logic:** Step 1.5 calculates score and branches to Step 2-ALT (SIMPLE) or Step 2 (BORDERLINE/COMPLEX)
4. **Direct Execution Path:** Step 2-ALT documents complete workflow for executing simple tasks without delegation
5. **Conditional Editing Permission:** Non-Negotiables section allows source editing for SIMPLE tasks (score=0)
6. **STATE Logging:** STATE file format includes complexity score and execution mode per task
7. **No Regression:** BORDERLINE/COMPLEX tasks still use delegation path (Steps 2-4 unchanged)
8. **Threshold Conservative:** Borderline tasks (score 1-2) default to delegation for safety
9. **Optional Override:** Planner task format includes optional `Complexity` field (if PLAN-007 executed)

## Implementor Checklist

- [ ] PLAN-001: Update Non-Negotiables to allow conditional source editing
- [ ] PLAN-002: Update Forbidden Actions to clarify conditional editing
- [ ] PLAN-003: Add Helper Functions section with 4 functions
- [ ] PLAN-004: Add Step 1.5 complexity assessment logic
- [ ] PLAN-005: Add Step 2-ALT direct execution path
- [ ] PLAN-006: Update STATE file format to track complexity
- [ ] PLAN-007: (Optional) Add complexity override to Planner task format
