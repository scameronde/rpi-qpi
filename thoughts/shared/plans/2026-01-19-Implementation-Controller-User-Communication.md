# Implementation-Controller User Communication Verbosity Implementation Plan

## Inputs

- **Research report**: `thoughts/shared/research/2026-01-19-Implementation-Controller-User-Communication-Verbosity.md`
- **User request**: Create implementation plan from research report on Implementation-Controller verbosity
- **Baseline research**: `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (validates same pattern)

## Verified Current State

### Fact 1: Three Output Templates Lack Thinking/Answer Separation

**Evidence**: `agent/implementation-controller.md:452-478` (Task Completion Report template)

**Excerpt**:
```markdown
Output the task completion report:

```markdown
## ✅ Task Complete: PLAN-XXX - [Task Name]

**Changes Made**:
- Modified: `path/to/file1.ts` ([brief description])
- Created: `path/to/file2.test.ts`

**Verification**:
- Build: PASSED
- Tests: 5/5 passed
```
```

**Analysis**: Template outputs plain Markdown without `<thinking>` or `<answer>` tags. All operational reasoning (parsing executor response, running verification, updating state) is either omitted or mixed inline with user-facing status.

---

**Evidence**: `agent/implementation-controller.md:503-516` (Final Completion Report template)

**Excerpt**:
```markdown
4. **Output final completion report**:

   ```markdown
   ## 🎉 Implementation Complete: [Ticket Name]

   **Total Tasks Completed**: N/N
   **All Verification**: PASSED
   **Final Commit**: `<commit hash>` - "PLAN-COMPLETE: [Ticket Name]"

   **Summary**:
   [Brief 2-3 line summary of what was implemented]

   The implementation is complete and ready for review.
   ```
```

**Analysis**: Same issue - no separation of reasoning from results.

---

**Evidence**: `agent/implementation-controller.md:633-644` (Resume Status Report template)

**Excerpt**:
```markdown
5. **Report status**:
   ```markdown
   ## 🔄 Session Resumed: [Ticket Name]

   **Current Position**: PLAN-XXX - [Task Name]
   **Completed Tasks**: PLAN-001, PLAN-002, ...
   **Verification**: All checks passed ✅

   **Next Action**: Execute PLAN-XXX

   Ready to begin PLAN-XXX.
   ```
```

**Analysis**: Third template also lacks thinking/answer separation.

### Fact 2: Task-Executor Demonstrates Correct Pattern

**Evidence**: `agent/task-executor.md:158-243` (verified via research report)

**Excerpt** (from research report lines 156-191):
```markdown
Output a structured report for the Control Agent:

```markdown
<!-- Generate message_id from timestamp + sequence (executor-2026-01-18-001). Accept correlation_id from caller if provided. Include atomic counts for files and adaptations. -->

<thinking>
Document your reasoning process:
1. Task payload parsing (taskId, files, instruction)
2. Evidence verification (check file:line references match reality)
3. Strategy planning (approach to implementing the task)
4. Execution steps (what you actually did)
5. Adaptation reasoning (why you deviated from task if applicable)
</thinking>

<answer>
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
```

**Analysis**: Task-executor uses YAML frontmatter + `<thinking>` + `<answer>` structure. Implementation-controller should reciprocate this pattern.

### Fact 3: Agent Has Sequential-Thinking Tool Enabled

**Evidence**: `agent/implementation-controller.md:18`

**Excerpt**:
```yaml
sequential-thinking: true
```

**Analysis**: The sequential-thinking tool is available but the output templates (lines 452-478, 503-516, 633-644) don't reference its output format, suggesting user-facing outputs are generated independently.

### Fact 4: Prior Research Validates This Pattern

**Evidence**: `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md:85-109, 853-895` (validated via research report)

**Analysis**: Identical issue documented for codebase-analyzer agent with validated solutions:
- Anthropic official recommendation (Multi-Agent Research System, June 2025)
- Token impact: +10% for thinking overhead, but -33% visible text to users
- Industry best practice for agent communication

## Goals / Non-Goals

### Goals

1. **Apply thinking/answer separation** to all three Implementation-Controller output templates
2. **Add YAML frontmatter** metadata envelope following task-executor pattern
3. **Document the pattern** in agent definition for maintainability
4. **Update AGENTS.md** with cross-agent pattern documentation for consistency

### Non-Goals

1. **NOT changing operational logic**: Orchestration workflow (load plan, invoke executor, verify, commit) remains unchanged
2. **NOT modifying task-executor**: Task-executor already implements the pattern correctly
3. **NOT adding new features**: Only restructuring existing output format
4. **NOT changing tool permissions**: No changes to enabled/disabled tools

## Design Overview

### Problem

Implementation-controller mixes operational reasoning (parsing executor responses, analyzing verification output, planning retries) with actionable user information (task status, changes made, next action). This creates:
- **User friction**: ~18-50 lines of mixed content, actionable information buried
- **Token waste**: ~10% unnecessary tokens when reasoning is not needed
- **Debugging difficulty**: No structured reasoning trail to inspect when things go wrong

### Solution

Apply the three-part structured output pattern that task-executor already uses:

1. **YAML frontmatter**: Machine-readable metadata (message_id, correlation_id, status counts)
2. **`<thinking>` section**: Orchestration reasoning (5 phases: extraction, delegation, parsing, verification, commit)
3. **`<answer>` section**: User-facing status update (~12 lines)

### Control Flow

**Before** (current):
```
User sees: [Mixed reasoning + status] (~18-50 lines)
```

**After** (recommended):
```
<thinking>
  [Orchestration reasoning] (~30 lines, hidden by default)
</thinking>

<answer>
  ---
  [YAML metadata] (~8 lines)
  ---
  [User-facing status] (~12 lines)
</answer>

User sees: Only <answer> section (~20 lines total, -33% to -60% reduction)
```

### Data Flow

1. **Task extraction**: Read plan file → Extract PLAN-XXX → Create task payload → [Log to thinking]
2. **Task delegation**: Invoke task-executor → Receive response → [Log to thinking]
3. **Response parsing**: Parse YAML frontmatter → Extract changes → Extract adaptations → [Log to thinking]
4. **Verification**: Run commands → Analyze output → PASS/FAIL → [Log to thinking]
5. **State & Commit**: Update STATE → Stage files → Create commit → [Log to thinking]
6. **Output**: Emit YAML frontmatter + concise status in `<answer>`

## Implementation Instructions (For Implementor)

### PLAN-001: Update Task Completion Report Template

**Action ID**: PLAN-001

**Change Type**: modify

**File(s)**: `agent/implementation-controller.md`

**Instruction**:

Replace the Task Completion Report template (lines 452-478) with a version that includes `<thinking>` and `<answer>` separation plus YAML frontmatter.

**Steps**:

1. Locate the template starting at line 452: `Output the task completion report:`
2. Replace lines 452-478 with the new template structure
3. New template must include:
   - Opening instruction: `Output the task completion report with thinking/answer separation:`
   - `<thinking>` section documenting 5 orchestration phases (extraction, delegation, parsing, verification, commit)
   - `<answer>` section with:
     - YAML frontmatter with fields: message_id, correlation_id, timestamp, message_type, controller_version, task_completed, tasks_remaining, verification_status
     - User-facing status: heading, changes made, verification result, executor notes, next task, action required

**Template Structure** (pseudocode):

```markdown
Output the task completion report with thinking/answer separation:

```markdown
<thinking>
Task orchestration reasoning:

Phase 1: Task Extraction
- Read plan file: [path]
- Extracted task [PLAN-XXX] from plan
- Files: [list]
- Instruction: [summary]

Phase 2: Task Delegation
- Created task payload
- Invoked task-executor subagent
- Correlation ID: [id]

Phase 3: Executor Response Parsing
- Received response with status: [SUCCESS/BLOCKED/FAILED]
- Frontmatter: files_modified=[N], adaptations_made=[N]
- Parsed changes: [file list]
- Parsed adaptations: [list with reasoning]

Phase 4: Verification
- Running: [command list]
- Output: [summary]
- Result: [PASSED/FAILED]

Phase 5: State & Commit
- Updated STATE file: completed=[list], current=[next task]
- Staged files: [list]
- Created commit: [hash] - "[message]"
</thinking>

<answer>
---
message_id: controller-YYYY-MM-DD-NNN
correlation_id: plan-YYYY-MM-DD-[ticket]
timestamp: YYYY-MM-DDTHH:MM:SSZ
message_type: TASK_COMPLETION
controller_version: "1.1"
task_completed: PLAN-XXX
tasks_remaining: N
verification_status: PASSED | FAILED
---

## ✅ Task Complete: PLAN-XXX - [Task Name]

**Changes Made**:
- Modified: `path/to/file1.ts` ([brief description])
- Created: `path/to/file2.test.ts` ([brief description])

**Verification**: ✅ All checks passed
(or)
**Verification**: ❌ [Specific failure message]

**Executor Notes**:
- [List any adaptations made by task-executor]
- [Or: "No adaptations needed"]

**Next**: PLAN-YYY

**Action Required**: Reply "PROCEED" or "CONTINUE" to start PLAN-YYY, or "SKIP" to skip it.
</answer>
```
```

**Evidence**: `agent/implementation-controller.md:452-478` (current template location)

**Evidence**: Research report lines 640-693 (recommended template structure)

**Done When**:
1. Lines 452-478 replaced with new template
2. Template contains `<thinking>` tag with 5 phases
3. Template contains `<answer>` tag with YAML frontmatter (8 required fields)
4. Template contains user-facing status section (~12 lines)
5. Grep for `<thinking>` and `<answer>` in the file shows new tags appear in this section

**Verification Command**:
```bash
# Verify thinking/answer tags exist in template
grep -A 5 "Output the task completion report" agent/implementation-controller.md | grep -E "(<thinking>|<answer>)"

# Verify YAML frontmatter fields exist
grep -A 50 "Output the task completion report" agent/implementation-controller.md | grep -E "(message_id:|correlation_id:|verification_status:)"

# Count lines of new template (should be ~60-70 lines vs original 26 lines)
sed -n '452,/^### Final Task: Delivery/p' agent/implementation-controller.md | wc -l
```

---

### PLAN-002: Update Final Completion Report Template

**Action ID**: PLAN-002

**Change Type**: modify

**File(s)**: `agent/implementation-controller.md`

**Instruction**:

Replace the Final Completion Report template (lines 503-516) with a version that includes `<thinking>` and `<answer>` separation plus YAML frontmatter.

**Steps**:

1. Locate line 503: `4. **Output final completion report**:`
2. Replace lines 503-516 with new template structure
3. New template must include:
   - Opening instruction: `4. **Output final completion report with thinking/answer separation**:`
   - `<thinking>` section documenting final verification reasoning
   - `<answer>` section with YAML frontmatter and concise completion status

**Template Structure** (pseudocode):

```markdown
4. **Output final completion report with thinking/answer separation**:

   ```markdown
   <thinking>
   Final delivery reasoning:
   
   Phase 1: Plan Review
   - Total tasks in plan: N
   - Tasks completed: [list]
   - All tasks verified: [Yes/No]
   
   Phase 2: Full Regression Suite
   - Running: [command list]
   - Output: [summary]
   - Result: [PASSED/FAILED]
   
   Phase 3: STATE File Update
   - Set current task: COMPLETE
   - Added completion timestamp: [timestamp]
   
   Phase 4: Final Commit
   - Staged: STATE file
   - Created commit: [hash] - "PLAN-COMPLETE: [Ticket Name]"
   </thinking>
   
   <answer>
   ---
   message_id: controller-YYYY-MM-DD-NNN
   correlation_id: plan-YYYY-MM-DD-[ticket]
   timestamp: YYYY-MM-DDTHH:MM:SSZ
   message_type: FINAL_COMPLETION
   controller_version: "1.1"
   total_tasks: N
   verification_status: PASSED
   ---
   
   ## 🎉 Implementation Complete: [Ticket Name]
   
   **Total Tasks Completed**: N/N
   **All Verification**: PASSED
   **Final Commit**: `<commit hash>` - "PLAN-COMPLETE: [Ticket Name]"
   
   **Summary**:
   [Brief 2-3 line summary of what was implemented]
   
   The implementation is complete and ready for review.
   </answer>
   ```
```

**Evidence**: `agent/implementation-controller.md:503-516` (current template location)

**Done When**:
1. Lines 503-516 replaced with new template
2. Template contains `<thinking>` tag with 4 phases
3. Template contains `<answer>` tag with YAML frontmatter (6 required fields)
4. Final completion message preserved (~6 lines)

**Verification Command**:
```bash
# Verify thinking/answer tags in final completion template
grep -A 5 "Output final completion report" agent/implementation-controller.md | grep -E "(<thinking>|<answer>)"

# Verify YAML frontmatter for final completion
grep -A 40 "Output final completion report" agent/implementation-controller.md | grep -E "(message_type: FINAL_COMPLETION|total_tasks:)"
```

---

### PLAN-003: Update Resume Status Report Template

**Action ID**: PLAN-003

**Change Type**: modify

**File(s)**: `agent/implementation-controller.md`

**Instruction**:

Replace the Resume Status Report template (lines 633-644) with a version that includes `<thinking>` and `<answer>` separation plus YAML frontmatter.

**Steps**:

1. Locate line 633: `5. **Report status**:`
2. Replace lines 633-644 with new template structure
3. New template must include:
   - Opening instruction: `5. **Report status with thinking/answer separation**:`
   - `<thinking>` section documenting session resume reasoning
   - `<answer>` section with YAML frontmatter and resume status

**Template Structure** (pseudocode):

```markdown
5. **Report status with thinking/answer separation**:

   ```markdown
   <thinking>
   Session resume reasoning:
   
   Phase 1: STATE File Analysis
   - Read STATE file: [path]
   - Current task: [PLAN-XXX]
   - Completed tasks: [list]
   - Tasks remaining: N
   
   Phase 2: Environment Verification
   - Ran verification commands: [list]
   - Results: [summary]
   - Environment status: [CLEAN/ISSUES]
   
   Phase 3: Plan Context Load
   - Read plan file: [path]
   - Extracted task [PLAN-XXX] details
   - Files: [list]
   - Instruction: [summary]
   
   Phase 4: Resume Strategy
   - Next action: Execute [PLAN-XXX]
   - Correlation ID: [id]
   </thinking>
   
   <answer>
   ---
   message_id: controller-YYYY-MM-DD-NNN
   correlation_id: plan-YYYY-MM-DD-[ticket]
   timestamp: YYYY-MM-DDTHH:MM:SSZ
   message_type: SESSION_RESUME
   controller_version: "1.1"
   current_task: PLAN-XXX
   completed_tasks: N
   tasks_remaining: N
   verification_status: PASSED
   ---
   
   ## 🔄 Session Resumed: [Ticket Name]
   
   **Current Position**: PLAN-XXX - [Task Name]
   **Progress**: N/M tasks completed
   **Verification**: All checks passed ✅
   
   **Next Action**: Execute PLAN-XXX
   
   Ready to begin PLAN-XXX.
   </answer>
   ```
```

**Evidence**: `agent/implementation-controller.md:633-644` (current template location)

**Done When**:
1. Lines 633-644 replaced with new template
2. Template contains `<thinking>` tag with 4 phases
3. Template contains `<answer>` tag with YAML frontmatter (8 required fields)
4. Resume status message preserved (~8 lines)

**Verification Command**:
```bash
# Verify thinking/answer tags in resume template
grep -A 5 "Report status" agent/implementation-controller.md | grep -E "(<thinking>|<answer>)"

# Verify YAML frontmatter for resume
grep -A 40 "Report status" agent/implementation-controller.md | grep -E "(message_type: SESSION_RESUME|current_task:)"
```

---

### PLAN-004: Add Thinking/Answer Pattern Documentation

**Action ID**: PLAN-004

**Change Type**: create

**File(s)**: `agent/implementation-controller.md`

**Instruction**:

Insert a new documentation section after line 82 (after "## Execution Protocol" heading) explaining the thinking/answer separation pattern.

**Steps**:

1. Locate line 82: `## Execution Protocol`
2. Insert new section BEFORE the "### Phase 0: Pre-Flight (Initialization)" subsection
3. New section title: `### Output Format: Thinking/Answer Separation`
4. Content must explain:
   - When to use the pattern (ALL user-facing outputs)
   - What to include in `<thinking>` (5 orchestration phases)
   - What to include in `<answer>` (YAML frontmatter + concise status)
   - Why this pattern exists (user experience, debugging, token efficiency)

**Section Content** (exact text to insert):

```markdown
### Output Format: Thinking/Answer Separation

When communicating with users, separate your orchestration reasoning from actionable results using a three-part structure:

#### `<thinking>` Section Content

Document your orchestration process in phases:

1. **Task Extraction**: Reading plan file, extracting task payload, parsing requirements
2. **Task Delegation**: Creating executor payload, invoking task-executor, correlation ID assignment
3. **Response Parsing**: Extracting status from frontmatter, parsing changes/adaptations, reading excerpts
4. **Verification**: Running commands, analyzing output, determining pass/fail
5. **State & Commit**: Updating STATE file, staging files, creating commit, recording hash

**Purpose**: Provides debugging trail and transparency into orchestration decisions. Hidden from user by default but available for troubleshooting.

#### `<answer>` Section Content

Provide user-facing status update in this order:

1. **YAML Frontmatter** (machine-readable metadata):
   - `message_id`: Auto-generate from timestamp + sequence (controller-YYYY-MM-DD-NNN)
   - `correlation_id`: Extract from plan filename or generate (plan-YYYY-MM-DD-[ticket])
   - `timestamp`: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
   - `message_type`: TASK_COMPLETION | FINAL_COMPLETION | SESSION_RESUME | ERROR
   - `controller_version`: "1.1"
   - Status fields: `task_completed`, `tasks_remaining`, `verification_status`, etc.

2. **User-Facing Status** (concise Markdown):
   - Status heading with emoji and task ID
   - Changes made (file list with brief descriptions)
   - Verification result (can be brief: "✅ All checks passed")
   - Executor notes (adaptations made, if any)
   - Next action
   - User prompt

**Purpose**: Concise, actionable information for user decision-making. This is what users see by default.

#### When to Use

Apply thinking/answer separation to ALL user-facing outputs:

- **Task completion reports** (after each task)
- **Final completion reports** (after all tasks)
- **Resume status reports** (when resuming session)
- **Error reports** (when task fails or blocks)

Do NOT use for:

- Internal reasoning during orchestration (use sequential-thinking tool)
- Parsing task-executor responses (internal operation)
- File reads or verification command execution (internal operation)

#### Benefits

- **User experience**: ~30-70% reduction in visible text, actionable information more prominent
- **Debugging**: Full reasoning trail preserved in `<thinking>` section
- **Consistency**: Matches task-executor pattern (agent/task-executor.md)
- **Token efficiency**: Consumers can strip `<thinking>` when not needed
- **Workflow correlation**: YAML frontmatter enables linking outputs across agents

```

**Evidence**: `agent/implementation-controller.md:82` (insertion point - "## Execution Protocol" heading)

**Evidence**: Research report lines 761-823 (recommended documentation content)

**Done When**:
1. New section exists after line 82
2. Section heading is `### Output Format: Thinking/Answer Separation`
3. Section explains `<thinking>` content (5 phases listed)
4. Section explains `<answer>` content (YAML frontmatter + status)
5. Section explains when to use the pattern (4 output types listed)
6. Section explains benefits (5 bullet points)

**Verification Command**:
```bash
# Verify new section exists after "Execution Protocol"
sed -n '/## Execution Protocol/,/### Phase 0/p' agent/implementation-controller.md | grep -E "(### Output Format:|<thinking>|<answer>)"

# Count subsections in new documentation (should be 4: thinking content, answer content, when to use, benefits)
sed -n '/### Output Format/,/### Phase 0/p' agent/implementation-controller.md | grep "^#### " | wc -l
```

---

### PLAN-005: Update AGENTS.md with Cross-Agent Pattern Documentation

**Action ID**: PLAN-005

**Change Type**: modify

**File(s)**: `AGENTS.md`

**Instruction**:

Add a new section to AGENTS.md documenting the thinking/answer separation pattern as a project-wide convention for all primary agents.

**Steps**:

1. Locate the section `## Agent Guidelines for RPIQPI Project` near the top of AGENTS.md
2. After the `## Build/Lint/Test Commands` section, insert new section: `## Agent Communication Patterns`
3. New section must explain:
   - The three-part structure (YAML frontmatter, thinking, answer)
   - Which agents use this pattern
   - Benefits and token impact
   - Cross-references to relevant research reports

**Section Content** (exact text to insert):

```markdown
## Agent Communication Patterns

### Thinking/Answer Separation for User-Facing Outputs

Primary agents that communicate directly with users should separate operational reasoning from actionable results using a structured three-part format:

#### Pattern Structure

```markdown
<thinking>
[Document decision-making process, file reads, parsing, analysis, verification reasoning]
</thinking>

<answer>
---
[YAML frontmatter with message_id, correlation_id, status fields]
---

[User-facing status and actionable information]
</answer>
```

#### Agents Using This Pattern

- **task-executor** (`agent/task-executor.md`): Documents task execution reasoning (parsing, verification, strategy, execution, adaptations)
- **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning (task extraction, delegation, parsing, verification, commit)
- **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning (implemented per research 2026-01-18)
- **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning (implemented per research 2026-01-18)
- **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning (implemented per research 2026-01-18)
- **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning

#### Benefits

- **Users see only actionable information**: ~30-70% reduction in visible text depending on agent type
- **Full reasoning trail available for debugging**: Inspect `<thinking>` section when outputs are unexpected
- **Consistent structure across agent outputs**: All primary agents use same format
- **Workflow correlation via YAML frontmatter**: `message_id` and `correlation_id` enable tracing outputs across agents
- **Token optimization**: Consumers can strip `<thinking>` section when passing results downstream (~10% savings)

#### Token Impact

- **Cost**: +10-16% tokens per output (thinking overhead + frontmatter metadata)
- **Benefit**: User experience improvement, debugging capability, cross-agent consistency
- **Trade-off**: Accept modest token cost for significant UX and maintainability benefits

#### Research References

- `thoughts/shared/research/2026-01-19-Implementation-Controller-User-Communication-Verbosity.md` (implementation-controller analysis)
- `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (baseline research, industry best practices)
- `thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md` (locator-specific optimization)
- `thoughts/shared/research/2026-01-18-Codebase-Pattern-Finder-Agent-Communication.md` (pattern-finder optimization)

Industry sources:
- Anthropic Multi-Agent Research System (June 2025): "Use `<thinking>` tags for reasoning"
- Anthropic Chain-of-Thought Documentation (Current): "Structured CoT with XML tags most efficient for agent communication"
```

**Evidence**: `AGENTS.md` (target file for cross-agent documentation)

**Evidence**: Research report lines 825-878 (recommended AGENTS.md content)

**Done When**:
1. New section `## Agent Communication Patterns` exists in AGENTS.md
2. Section explains three-part structure (YAML + thinking + answer)
3. Section lists 6 agents using this pattern
4. Section lists 5 benefits
5. Section includes token impact analysis
6. Section cross-references 4 research reports

**Verification Command**:
```bash
# Verify new section exists in AGENTS.md
grep -A 2 "## Agent Communication Patterns" AGENTS.md

# Verify agents list (should mention task-executor, implementation-controller, etc.)
grep -A 20 "### Agents Using This Pattern" AGENTS.md | grep -E "(task-executor|implementation-controller|codebase-analyzer)"

# Verify research references section exists
grep -A 10 "### Research References" AGENTS.md | grep "thoughts/shared/research"
```

---

## Acceptance Criteria

For implementation to be considered complete:

1. **Template Updates Complete**:
   - Task Completion Report template (PLAN-001) uses `<thinking>` and `<answer>` with YAML frontmatter
   - Final Completion Report template (PLAN-002) uses `<thinking>` and `<answer>` with YAML frontmatter
   - Resume Status Report template (PLAN-003) uses `<thinking>` and `<answer>` with YAML frontmatter

2. **Structure Validation**:
   - All three templates include `<thinking>` tags documenting orchestration phases
   - All three templates include `<answer>` tags with YAML frontmatter + concise status
   - YAML frontmatter includes required fields: message_id, correlation_id, timestamp, message_type, controller_version, status fields

3. **Documentation Complete**:
   - New section "Output Format: Thinking/Answer Separation" exists in agent/implementation-controller.md after line 82
   - Section explains what to include in `<thinking>` (5 phases)
   - Section explains what to include in `<answer>` (YAML + status)
   - Section explains when to use the pattern (4 output types)

4. **Cross-Agent Consistency**:
   - New section "Agent Communication Patterns" exists in AGENTS.md
   - Section lists agents using this pattern (6 agents)
   - Section cross-references research reports (4 reports)

5. **Verification**:
   - All verification commands pass for PLAN-001 through PLAN-005
   - Grep finds `<thinking>` and `<answer>` tags in all three templates
   - Grep finds YAML frontmatter fields (message_id, correlation_id, etc.) in all three templates

6. **No Regression**:
   - No changes to operational logic (orchestration workflow unchanged)
   - No changes to tool permissions
   - No changes to task-executor agent
   - User-facing output structure improved but content preserved

## Implementor Checklist

- [ ] PLAN-001: Update Task Completion Report template with thinking/answer separation
- [ ] PLAN-002: Update Final Completion Report template with thinking/answer separation
- [ ] PLAN-003: Update Resume Status Report template with thinking/answer separation
- [ ] PLAN-004: Add thinking/answer pattern documentation to agent definition
- [ ] PLAN-005: Update AGENTS.md with cross-agent pattern documentation

## Notes

**Token Impact Summary** (from research report):
- Per-output cost: +10% tokens (thinking overhead)
- User-visible reduction: -33% to -60% lines
- Debugging benefit: Full reasoning trail preserved
- Consistency benefit: Matches task-executor pattern

**Implementation Sequence**:
- Phase 1 (PLAN-001 to PLAN-003): Core pattern implementation - HIGH IMPACT
- Phase 2 (PLAN-004): Agent-specific documentation - MEDIUM IMPACT
- Phase 3 (PLAN-005): Cross-agent documentation - LOW IMPACT but high maintainability value

**User Experience Impact**:
- Current: Users see 18-50 lines of mixed reasoning + status
- After: Users see ~12-20 lines of actionable status
- Reasoning available in `<thinking>` section for debugging but hidden by default

**Cross-References**:
- Task-executor pattern: `agent/task-executor.md:158-243`
- Baseline research: `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md`
- Industry sources: Anthropic Multi-Agent Research System (June 2025), Anthropic CoT Documentation (Current)
