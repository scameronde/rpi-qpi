# Python-QA-Quick Communication Pattern Implementation Plan

## Inputs
- Research report used: `thoughts/shared/research/2026-01-21-Python-QA-Quick-Agent-Communication.md`
- User request summary: Implement thinking/answer separation and documentation improvements for python-qa-quick agent

## Verified Current State

### Fact 1: python-qa-quick lacks thinking/answer separation
- **Evidence:** `agent/python-qa-quick.md:130-157`
- **Excerpt:**
  ```markdown
  ## Output Format
  
  Use this exact Markdown structure:
  
  ```markdown
  ## 🚀 Quick Python QA Results
  
  ### ⏱️ Scan Summary
  - Target: [path]
  - Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
  - Date: YYYY-MM-DD
  ```
  ```
- **Gap:** No `<thinking>` or `<answer>` wrapper, despite being a user-facing agent

### Fact 2: python-qa-quick not documented in AGENTS.md thinking/answer pattern list
- **Evidence:** `AGENTS.md:29-37`
- **Excerpt:**
  ```markdown
  #### Agents Using This Pattern
  
  - **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
  - **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
  - **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
  - **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
  - **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
  - **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning
  - **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
  ```
- **Gap:** python-qa-quick is missing from this list

### Fact 3: Agent is designed for inline output (not file-based)
- **Evidence:** `agent/python-qa-quick.md:22-32`
- **Excerpt:**
  ```markdown
  ## Prime Directive
  
  You analyze code using automated tools and provide concise, actionable task lists. You do not modify code.
  
  ## Target Audience
  
  Your output is for developers who need fast feedback on code quality issues.
  ```
- **Observation:** No mention of writing to `thoughts/shared/qa/` directory (unlike opencode-qa-thorough)

### Fact 4: Agent has conciseness guidelines
- **Evidence:** `agent/python-qa-quick.md:165-168`
- **Excerpt:**
  ```markdown
  2. **Conciseness**
     - Be concise and actionable (task list for immediate action, not detailed report)
     - Group similar issues to avoid overwhelming output (max 20 items per category)
     - If more than 20 issues in a category, summarize: "X additional similar issues in [file]"
  ```
- **Observation:** Designed for fast feedback with limited output size

## Goals / Non-Goals

### Goals
1. Add `<thinking>/<answer>` separation to python-qa-quick output template
2. Define what goes in `<thinking>` section (tool execution logs, synthesis reasoning)
3. Add optional YAML frontmatter for message envelope (inline output, minimal metadata)
4. Update AGENTS.md to include python-qa-quick in thinking/answer pattern list
5. Document architectural decision (inline vs file-based) in agent description
6. Maintain backward compatibility (same task list content in `<answer>`)

### Non-Goals
1. NOT implementing file-based output (remains inline)
2. NOT adding workflow automation (no QA-Planner integration)
3. NOT changing tool execution logic (ruff, pyright, bandit, interrogate)
4. NOT modifying priority hierarchy or categorization rules
5. NOT implementing verbose mode flag (future enhancement, not in this plan)

## Design Overview

### Current Flow
1. User invokes python-qa-quick with target path
2. Agent executes 4 tools in parallel (ruff, pyright, bandit, interrogate)
3. Agent synthesizes findings into prioritized task list
4. Agent outputs task list directly to user (inline)

### New Flow (with thinking/answer separation)
1. User invokes python-qa-quick with target path
2. Agent executes 4 tools in parallel
3. Agent **logs tool execution in `<thinking>` section**: commands, versions, raw outputs, synthesis reasoning
4. Agent **wraps task list in `<answer>` section**: same content as before, unchanged
5. Agent outputs `<thinking>` + `<answer>` structure to user
6. User reads `<answer>` for actionable tasks, inspects `<thinking>` if questioning findings

### Data Flow
- Tool outputs → Thinking section (commands, versions, raw outputs, issue counts, grouping decisions)
- Synthesized findings → Answer section (prioritized task list, unchanged from current format)

## Implementation Instructions (For Implementor)

### PLAN-001: Add Thinking Section Documentation to Workflow
- **Change Type:** modify
- **File(s):** `agent/python-qa-quick.md`
- **Instruction:** Insert new section "3. Document Tool Execution (For <thinking> Section)" after line 108 (current section 3 becomes section 4). Add these subsections:
  1. Commands Executed: exact command strings with paths and flags, tool versions
  2. Tool Outputs: full raw output for each tool (or summary if >100 lines), exit codes, execution time
  3. Synthesis Decisions: issue count by tool and priority, grouping decisions, prioritization reasoning
- **Pseudocode:**
  ```markdown
  ### 3. Document Tool Execution (For <thinking> Section)
  
  Log the following information for debugging and audit trail:
  
  1. **Commands Executed**:
     - Full command string for each tool: `ruff check [path] --version=X.Y.Z`
     - Tool versions (capture from `--version` output)
     - Execution timestamp
  
  2. **Tool Outputs**:
     - Raw output from each tool (first 100 lines if truncated)
     - Exit codes (0 = success, non-zero = issues found)
     - Execution time in milliseconds
  
  3. **Synthesis Decisions**:
     - Issue count breakdown: "ruff: 12 issues (3 complexity, 5 imports, 4 style)"
     - Priority mapping: "bandit HIGH → Critical, pyright errors → High, ruff complexity → Medium"
     - Grouping applied: "20+ similar issues → summarized as 'X additional...'"
     - Hot spot detection: Files appearing in multiple priority categories
  
  ### 4. Synthesize Findings
  [existing content moves here]
  ```
- **Evidence:** `agent/python-qa-quick.md:97-108` (current tool execution section has no logging instructions)
- **Done When:** Section 3 exists with 3 subsections (Commands, Tool Outputs, Synthesis Decisions) and section numbering updated throughout document

### PLAN-002: Update Output Format Template with Thinking/Answer Wrappers
- **Change Type:** modify
- **File(s):** `agent/python-qa-quick.md`
- **Instruction:** Replace output format section (lines 130-157) with new template that includes `<thinking>` and `<answer>` wrappers. Keep all existing sections inside `<answer>` unchanged. Add optional YAML frontmatter inside `<answer>`.
- **Template Structure:**
  ```markdown
  ## Output Format
  
  Use this exact structure with <thinking> and <answer> tags:
  
  <thinking>
  Tool Execution Log:
  
  Commands Executed:
  - ruff check [path] (ruff X.Y.Z)
  - pyright [path] (pyright X.Y.Z)
  - bandit -r [path] (bandit X.Y.Z)
  - interrogate --fail-under 80 -v --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [path] (interrogate X.Y.Z)
  
  Raw Outputs:
  - ruff: [N] issues found ([breakdown by category])
  - pyright: [N] issues found ([breakdown by type])
  - bandit: [N] issues found ([breakdown by severity])
  - interrogate: [coverage]% coverage (threshold 80%, [delta]% gap)
  
  Synthesis Reasoning:
  - Critical ([N] issues): [reasoning for categorization]
  - High ([N] issues): [reasoning]
  - Medium ([N] issues): [reasoning]
  - Low ([N] issues): [reasoning]
  - Grouping: [any summarization applied]
  - Hot spots: [files with multiple issues across categories]
  </thinking>
  
  <answer>
  ---
  message_id: python-qa-quick-[YYYY-MM-DD]-[random-4-digit]
  timestamp: YYYY-MM-DDTHH:MM:SSZ
  message_type: QA_RESULT
  target: [path]
  tools_executed: [ruff, pyright, bandit, interrogate]
  critical_count: [N]
  high_count: [N]
  medium_count: [N]
  low_count: [N]
  ---
  
  ## 🚀 Quick Python QA Results
  
  ### ⏱️ Scan Summary
  - Target: [path]
  - Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
  - Date: YYYY-MM-DD
  
  ### 🔴 Critical Issues (Fix Immediately)
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### 🟠 High Priority
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### 🟡 Medium Priority
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### 🟢 Low Priority / Style
  - [ ] [Issue description] - `[File:Line]` - [Tool]
  
  ### ✅ Next Steps
  [Concrete actions to take]
  </answer>
  ```
- **Evidence:** `agent/python-qa-quick.md:130-157` (current template has no wrappers)
- **Done When:** Output template includes `<thinking>` section with tool logs, `<answer>` section with YAML frontmatter + existing task list format, all existing sections preserved

### PLAN-003: Update Examples with Thinking/Answer Structure
- **Change Type:** modify
- **File(s):** `agent/python-qa-quick.md`
- **Instruction:** Update all three examples (lines 186-260) to include `<thinking>` and `<answer>` wrappers. Add realistic tool execution logs to each `<thinking>` section.
- **For Example 1 (Tool Not Found):**
  ```markdown
  <thinking>
  Tool Execution Log:
  
  Commands Executed:
  - ruff check src/ → FAILED (command not found)
  - pyright src/ (pyright 1.1.335) → SUCCESS
  - bandit -r src/ (bandit 1.7.5) → SUCCESS
  - interrogate --fail-under 80 -v src/ (interrogate 1.5.0) → SUCCESS
  
  Raw Outputs:
  - ruff: Tool not available (exit code 127)
  - pyright: 0 issues found
  - bandit: 0 issues found
  - interrogate: 95% coverage (threshold 80%, +15% above threshold)
  
  Synthesis Reasoning:
  - No issues found in available tools
  - Ruff unavailable → notify user in Scan Summary
  </thinking>
  
  <answer>
  ---
  message_id: python-qa-quick-2025-12-20-1234
  timestamp: 2025-12-20T10:30:00Z
  message_type: QA_RESULT
  target: src/
  tools_executed: [pyright, bandit, interrogate]
  tools_failed: [ruff]
  critical_count: 0
  high_count: 0
  medium_count: 0
  low_count: 0
  ---
  
  ## 🚀 Quick Python QA Results
  
  ### ⏱️ Scan Summary
  - Target: src/
  - Tools: ruff ❌ (not found) | pyright ✓ | bandit ✓ | interrogate ✓
  - Date: 2025-12-20
  
  **⚠️ Note**: `ruff` is not installed. Run `pip install ruff` to enable linting checks.
  
  ### ✅ All Checks Passed
  
  No issues detected with available tools.
  </answer>
  ```
- **For Example 2 (No Issues):** Add thinking section with clean tool outputs (0 issues for all tools except 1 low-priority style issue)
- **For Example 3 (Multiple Issues):** Add realistic thinking section with issue counts, prioritization reasoning, and grouping decisions
- **Evidence:** `agent/python-qa-quick.md:186-260` (current examples lack thinking sections)
- **Done When:** All 3 examples include `<thinking>` section with realistic tool logs and `<answer>` section with YAML frontmatter + task list

### PLAN-004: Add Architectural Position Section to Agent Description
- **Change Type:** modify
- **File(s):** `agent/python-qa-quick.md`
- **Instruction:** Insert new section "Architectural Position" after line 24 (after "You are the **Quick QA Agent**" intro) and before "Prime Directive". Document inline vs file-based decision and when to use python-qa-quick vs opencode-qa-thorough.
- **Content:**
  ```markdown
  ## Architectural Position
  
  **Output Type**: Inline (chat/terminal output), not file-based
  
  **Use Case**: Fast developer feedback during coding (inner loop)
  
  **Complementary Agent**: Use `opencode-qa-thorough` for comprehensive analysis with workflow automation (writes to `thoughts/shared/qa/` for QA-Planner consumption)
  
  ### When to Use python-qa-quick
  - Developer needs immediate feedback on recent changes
  - Pre-commit hook for blocking critical issues
  - CI/CD pipeline for fast triage
  - Inline task list sufficient (no workflow automation needed)
  
  ### When to Use opencode-qa-thorough
  - Comprehensive QA before implementation planning
  - Need manual analysis + subagent delegation (e.g., pattern finding)
  - Need workflow automation (QA-Planner → Implementation-Controller)
  - File-based report for documentation/audit trail required
  ```
- **Evidence:** Research finding that users may not understand when to use each agent (research lines 411-412)
- **Done When:** "Architectural Position" section exists between intro and Prime Directive, contains 4 subsections (Output Type, Use Case, Complementary Agent, When to Use X2)

### PLAN-005: Add python-qa-quick to AGENTS.md Thinking/Answer Pattern List
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:** Add python-qa-quick entry to the "Agents Using This Pattern" list (after line 36, before web-search-researcher). Use same format as other entries with brief description of reasoning documented.
- **Content:**
  ```markdown
  - **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
  ```
- **Evidence:** `AGENTS.md:29-37` (python-qa-quick currently missing)
- **Done When:** AGENTS.md line ~37 contains python-qa-quick entry with file path and description, alphabetical or logical ordering maintained

### PLAN-006: Update AGENTS.md Research References
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:** Add new research reference to line 58 (after existing references, before "Industry sources:" line). Add reference to 2026-01-21 python-qa-quick research.
- **Content:**
  ```markdown
  - `thoughts/shared/research/2026-01-21-Python-QA-Quick-Agent-Communication.md` (python-qa-quick communication pattern analysis)
  ```
- **Evidence:** `AGENTS.md:53-58` (research references section)
- **Done When:** AGENTS.md contains reference to 2026-01-21 research report in chronological order

## Verification Tasks

No unverified assumptions. All changes are based on verified evidence from research report.

## Acceptance Criteria

1. **Thinking/Answer Separation**: `agent/python-qa-quick.md` output template wrapped in `<thinking>` and `<answer>` tags
2. **Thinking Content**: `<thinking>` section includes 3 information categories (Commands Executed, Tool Outputs, Synthesis Decisions)
3. **YAML Frontmatter**: `<answer>` section includes optional YAML frontmatter with message_id, timestamp, message_type, target, tools_executed, and issue counts
4. **Answer Consistency**: `<answer>` section preserves existing task list format (🚀 Quick Python QA Results, priority sections, Next Steps)
5. **Examples Updated**: All 3 examples (Tool Not Found, No Issues, Multiple Issues) include realistic `<thinking>` sections
6. **Architectural Documentation**: "Architectural Position" section exists in agent description explaining inline vs file-based decision
7. **AGENTS.md Updated**: python-qa-quick listed in thinking/answer pattern section with description
8. **Research Reference**: AGENTS.md includes 2026-01-21 research reference
9. **Backward Compatibility**: Task list content in `<answer>` matches current format (users see same actionable content)
10. **Documentation Consistency**: All section numbers updated after inserting new section 3

## Implementor Checklist

- [ ] PLAN-001: Add "Document Tool Execution" section to workflow (3 subsections)
- [ ] PLAN-002: Update output format template with thinking/answer wrappers and YAML frontmatter
- [ ] PLAN-003: Update all 3 examples with realistic thinking sections
- [ ] PLAN-004: Add "Architectural Position" section to agent description
- [ ] PLAN-005: Add python-qa-quick to AGENTS.md thinking/answer pattern list
- [ ] PLAN-006: Add 2026-01-21 research reference to AGENTS.md

## Token Impact Summary

**Estimated Changes**:
- Agent prompt: +150-200 tokens (new section 3 + architectural position section, one-time cost)
- Agent output: +100-200 tokens per run (thinking section with tool logs, +15-25% overhead)
- YAML frontmatter: +50 tokens per run (message envelope)
- Total output overhead: +150-250 tokens (+20-30%)

**Benefits**:
- User debugging capability: +100% (from 0 to full tool output visibility)
- Documentation consistency: python-qa-quick aligned with other user-facing agents
- Backward compatibility: Same actionable content in `<answer>` (users can ignore `<thinking>`)

**Trade-off Analysis** (from research):
- No downstream consumer (inline output) → no token optimization for consumers
- Significant debugging value → users can inspect when questioning findings
- Industry best practice → Anthropic recommends structured thinking for agent communication
- Net value: Positive (modest cost for significant debugging + consistency improvement)
