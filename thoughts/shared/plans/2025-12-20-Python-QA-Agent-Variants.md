# Python QA Agent Variants Implementation Plan

> **Status**: ✅ COMPLETED (2025-12-20)  
> **Note**: The original `python-qa-auditor.md` agent has been removed and replaced by `python-qa-quick.md` and `python-qa-thorough.md` as primary agents.

## Inputs
- Research report(s) used: `thoughts/shared/research/2025-12-20-OpenCode-Framework-and-RPIQR-Project.md`
- User request summary: Create two variants of the python-qa-auditor agent:
  1. **Quick variant**: Runs three command-line tools (ruff, pyright, bandit) and outputs actionable tasks directly (no plan file)
  2. **Thorough variant**: Runs the same three tools PLUS additional readability/maintainability/testability checks, writes a plan file
- **Update**: QA agents should be `primary` agents (like Researcher, Planner, Implementor), not subagents

## Verified Current State

### Fact 1: Existing python-qa-auditor Agent Configuration
- **Fact:** The current python-qa-auditor agent is configured as `mode: all`, uses three tools (ruff, pyright, bandit), and has write/edit disabled.
- **Evidence:** `agent/python-qa-auditor.md:1-52`
- **Excerpt:**
  ```yaml
  ---
  description: >-
    Use this agent when the user requests a rigorous review of Python code
    involving linting, type checking, or security auditing.
  mode: all
  tools:
    write: false
    edit: false
  ---
  ```

### Fact 2: Agent Execution Pattern
- **Fact:** The current agent executes `ruff check`, `pyright`, and `bandit -r` commands and synthesizes findings into a structured Markdown report.
- **Evidence:** `agent/python-qa-auditor.md:15-18`
- **Excerpt:**
  ```markdown
  2.  **Execute Analysis Tools**: You must run the following commands using your terminal tool:
      *   `ruff check [target]` - To identify PEP8 violations, linting errors, and code style issues.
      *   `pyright [target]` - To perform static type checking and verify type hints.
      *   `bandit -r [target]` - To scan for common security issues and vulnerabilities.
  ```

### Fact 3: Planner Agent Structure
- **Fact:** The planner agent writes plans to `thoughts/shared/plans/YYYY-MM-DD-[Ticket].md` with a structured format including Implementation Instructions, Verification Tasks, and Acceptance Criteria.
- **Evidence:** `agent/planner.md:79-130`
- **Excerpt:**
  ```markdown
  ### Phase 4: The Hand-off (Artifact Generation)
  Write the plan to `thoughts/shared/plans/YYYY-MM-DD-[Ticket].md`.
  **Target Audience**: The Implementor Agent (an AI coder).
  
  ## Output Format (STRICT)
  
  Write exactly one plan to `thoughts/shared/plans/YYYY-MM-DD-[Ticket].md`.
  
  Required structure:
  
  ```
  # [Ticket] Implementation Plan
  
  ## Inputs
  - Research report(s) used: `thoughts/shared/research/...`
  - User request summary: ...
  ```

### Fact 4: Agent Mode and Temperature Conventions
- **Fact:** Primary agents use `mode: primary` and subagents use `mode: subagent`. Research/planning agents use `temperature: 0.1`, implementor uses `0.2`.
- **Evidence:** `thoughts/shared/research/2025-12-20-OpenCode-Framework-and-RPIQR-Project.md:320-337`
- **Excerpt:**
  ```markdown
  **Primary Agents (verified):**
  1. **researcher** (Research Architect)
     - Mode: primary, Temperature: 0.1

  2. **planner** (Implementation Architect)
     - Mode: primary, Temperature: 0.1

  3. **implementor** (Software Engineer)
     - Mode: primary, Temperature: 0.2
  ```

### Fact 5: Primary Agent Tool Permissions Pattern
- **Fact:** Primary agents (researcher, planner, implementor) use granular boolean tool permissions with explanatory comments when disabling tools (e.g., `# use Sub-Agent 'X' instead`).
- **Evidence:** `agent/researcher.md:1-20`, `agent/planner.md:1-20`, `agent/implementor.md:1-20`
- **Excerpt (researcher.md):**
  ```yaml
  mode: primary
  temperature: 0.1
  tools:
    bash: true
    edit: false # it is not your job to edit files
    read: true
    write: true
    glob: false # use Sub-Agent 'codebase-locator' instead
  ```

### Fact 6: QA Reports Directory Structure
- **Fact:** The project uses `thoughts/shared/` with subdirectories for `research/` and `plans/`. No `qa/` directory exists yet.
- **Evidence:** Directory listing of `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/thoughts/shared/` showing only `research/` subdirectory
- **Excerpt:** N/A (directory structure observation)

## Goals / Non-Goals

### Goals
1. Create `agent/python-qa-quick.md` as a **primary agent** that runs ruff/pyright/bandit and outputs actionable task list immediately
2. Create `agent/python-qa-thorough.md` as a **primary agent** that runs the same three tools plus manual quality checks and writes a plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
3. Ensure both agents follow RPIQR primary agent conventions (mode: primary, granular tool permissions with comments, evidence-based approach)
4. Create `thoughts/shared/qa/` directory for storing thorough QA plan files
5. Differentiate the thorough variant with additional checks for readability, maintainability, and testability beyond what automated tools catch
6. Align QA agents with the Researcher/Planner/Implementor pattern as first-class workflow participants

### Non-Goals
- Modifying the existing `python-qa-auditor.md` agent (preserve as-is for backward compatibility)
- Creating TypeScript/JavaScript QA variants (Python-specific only)
- Implementing custom linting rules beyond ruff/pyright/bandit
- Auto-fixing issues (agents provide recommendations only)

## Design Overview

### Architecture Pattern
- Both agents are **primary agents** (`mode: primary`) that can be invoked directly by the user or by other agents
- Quick variant: Direct output of actionable tasks (similar to current python-qa-auditor), suitable for rapid feedback loops
- Thorough variant: Hybrid approach combining automated tool checks + manual quality analysis, outputs plan file (similar to planner agent), suitable for comprehensive code reviews

### Control Flow

**Quick Variant (python-qa-quick):**
1. Identify target files/directories (via user input or context)
2. Execute ruff check → pyright → bandit -r in parallel
3. Synthesize findings into categorized issue list
4. Output immediate actionable tasks in Markdown (no file writes)
5. Use subagents (codebase-locator, codebase-pattern-finder) for file discovery if needed

**Thorough Variant (python-qa-thorough):**
1. Identify target files/directories (via user input or context)
2. Execute ruff check → pyright → bandit -r in parallel
3. Read target Python files to perform manual quality checks:
   - Function complexity (cyclomatic complexity estimation)
   - Documentation coverage (docstrings for classes/functions)
   - Test coverage gaps (missing test files, untested critical paths)
   - Import organization and dependency management
   - Error handling patterns and exception granularity
   - Code duplication and DRY violations
   - Magic numbers and configuration hard-coding
   - API design consistency (public vs private interfaces)
4. Synthesize all findings into structured plan file at `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
5. Output summary with link to plan file
6. Delegate specialized tasks to subagents (codebase-analyzer for tracing, web-search-researcher for best practices)

### Data Flow
- Input: Target file/directory path (from user or calling context)
- Processing: Command execution → stdout/stderr capture → parsing → analysis
- Output: 
  - Quick: Markdown-formatted task list (returned as agent response)
  - Thorough: Plan file written to filesystem + summary response

## Implementation Instructions (For Implementor)

### PLAN-001: Create thoughts/shared/qa/ directory
- **Action ID:** PLAN-001
- **Change Type:** create
- **File(s):** `thoughts/shared/qa/` (directory)
- **Instruction:** 
  1. Create the directory `thoughts/shared/qa/` to store thorough QA plan files
  2. This follows the established pattern of `thoughts/shared/research/` and `thoughts/shared/plans/`
- **Interfaces / Pseudocode:** N/A
- **Evidence:** `thoughts/shared/` directory structure verified via `list` command; `research/` and `plans/` subdirectories exist per planner.md:79 and researcher.md:84
- **Done When:** Directory exists and can be listed with `list /home/eichens/workspaces/experiment-ai/opencode/rpiqr/thoughts/shared/qa/`

### PLAN-002: Create python-qa-quick.md agent (PRIMARY mode)
- **Action ID:** PLAN-002
- **Change Type:** create
- **File(s):** `agent/python-qa-quick.md`
- **Instruction:**
  1. Create new agent definition file with YAML frontmatter and Markdown system prompt
  2. **Frontmatter configuration:**
     - `description`: "Quick Python QA check using ruff, pyright, and bandit. Outputs actionable tasks immediately without writing plan files."
     - `mode`: `primary` (PRIMARY AGENT - not subagent)
     - `temperature`: `0.1` (analytical/consistent output like researcher/planner)
     - `tools`:
       - `bash`: `true` (required to run ruff/pyright/bandit)
       - `read`: `true` (to identify target files)
       - `write`: `false` (no plan file writing)
       - `edit`: `false # it is not your job to edit files` (comment explains why)
       - `glob`: `false # use Sub-Agent 'codebase-locator' instead` (delegate to subagent)
       - `grep`: `false # use Sub-Agent 'codebase-pattern-finder' instead` (delegate to subagent)
       - `list`: `true` (to explore directories)
       - `patch`: `false` (no code modification)
       - `todoread`: `true` (track QA tasks)
       - `todowrite`: `true` (manage QA task lists)
       - `webfetch`: `false # use Sub-Agent 'web-search-researcher' instead`
       - `searxng-search`: `false # use Sub-Agent 'web-search-researcher' instead`
       - `sequential-thinking`: `true` (for complex analysis)
       - `context7`: `false` (not needed for quick checks)
  3. **System prompt structure:**
     - **Role definition**: "You are the **Quick QA Agent**. You perform rapid, automated Python code quality checks to provide immediate actionable feedback."
     - **Prime directive**: "You analyze code using automated tools and provide concise, actionable task lists. You do not modify code."
     - **Target Audience**: "Your output is for developers who need fast feedback on code quality issues."
     - **Operational workflow**:
       a. Identify target files:
          - If user provides explicit path, use it
          - If no path provided, delegate to `codebase-locator` to find Python files
          - If analyzing recent changes, use `git diff` to identify modified Python files
       b. Execute three commands in parallel using bash tool:
          - `ruff check [target]`
          - `pyright [target]`
          - `bandit -r [target]`
       c. Synthesize findings by category (Linting, Typing, Security)
       d. Prioritize issues: Critical (security vulnerabilities) → High (type errors) → Medium (quality issues) → Low (style)
       e. Output actionable task list with priority levels
     - **Output format**: Markdown with structure:
       ```markdown
       ## 🚀 Quick Python QA Results
       
       ### ⏱️ Scan Summary
       - Target: [path]
       - Tools: ruff ✓ | pyright ✓ | bandit ✓
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
       ```
     - **Guidelines**:
       - If tool not found, inform user and suggest `pip install ruff pyright bandit`
       - Be concise and actionable (task list for immediate action, not detailed report)
       - Prioritize security > types > style
       - Group similar issues to avoid overwhelming output (max 20 items per category)
       - Use file path + line number for every issue (e.g., `utils/auth.py:42`)
       - Delegate file discovery to `codebase-locator` when needed
- **Interfaces / Pseudocode:** N/A
- **Evidence:** Current `agent/python-qa-auditor.md:1-52` provides base structure; primary agent pattern verified in `agent/researcher.md:1-20`, `agent/planner.md:1-20`, `agent/implementor.md:1-20`
- **Done When:** File exists, can be read, follows the primary agent pattern (mode: primary, granular tool permissions with comments, temperature: 0.1)

### PLAN-003: Create python-qa-thorough.md agent (PRIMARY mode)
- **Action ID:** PLAN-003
- **Change Type:** create
- **File(s):** `agent/python-qa-thorough.md`
- **Instruction:**
  1. Create new agent definition file with YAML frontmatter and Markdown system prompt
  2. **Frontmatter configuration:**
     - `description`: "Thorough Python QA analysis combining automated tools (ruff, pyright, bandit) with manual quality checks. Writes comprehensive plan file to thoughts/shared/qa/."
     - `mode`: `primary` (PRIMARY AGENT - not subagent)
     - `temperature`: `0.1` (matching planner agent for analytical rigor)
     - `tools`:
       - `bash`: `true` (run analysis tools)
       - `read`: `true` (inspect source files for manual checks)
       - `write`: `true` (create plan file)
       - `edit`: `false # it is not your job to edit files` (comment explains why)
       - `glob`: `false # use Sub-Agent 'codebase-locator' instead` (delegate to subagent)
       - `grep`: `false # use Sub-Agent 'codebase-pattern-finder' instead` (delegate to subagent)
       - `list`: `true` (explore structure)
       - `patch`: `false` (no code modification)
       - `todoread`: `true` (track QA improvement tasks)
       - `todowrite`: `true` (manage comprehensive QA checklists)
       - `webfetch`: `false # use Sub-Agent 'web-search-researcher' instead`
       - `searxng-search`: `false # use Sub-Agent 'web-search-researcher' instead`
       - `sequential-thinking`: `true` (for complex multi-phase analysis)
       - `context7`: `false # use Sub-Agent 'codebase-analyzer' instead` (delegate deep analysis)
  3. **System prompt structure:**
     - **Role definition**: "You are the **Thorough QA Agent**. You are the Quality Architect; the **Implementor** is your Builder. You perform comprehensive Python code quality analysis to produce a detailed improvement plan."
     - **Prime directive**: "You analyze, document, and plan improvements. You do not modify code. Your plan is the blueprint for quality improvement."
     - **Target Audience**: "Your output is for the Implementor Agent (an AI coder) and senior developers who need a complete quality assessment with specific remediation steps."
     - **Operational workflow**:
       
       **Phase 1: Target Identification**
       a. If user provides explicit path, use it
       b. If no path provided, delegate to `codebase-locator` to find Python files
       c. If analyzing recent changes, use `git diff` to identify scope
       
       **Phase 2: Automated Tool Execution**
       a. Execute ruff, pyright, bandit in parallel
       b. Capture and categorize automated findings
       c. If tool not found, note in report and skip that tool
       
       **Phase 3: Manual Quality Analysis** (Evidence-based only)
       a. **Readability checks**:
          - Read each target Python file using the `read` tool
          - Assess function/method length (>50 lines flagged)
          - Check docstring coverage for public APIs (classes, functions with non-_ prefix)
          - Evaluate variable naming clarity (single-letter vars outside loops, ambiguous names)
          - Identify complex conditionals (nested if/for/while beyond 3 levels)
          - **Evidence requirement**: Every claim MUST include file:line reference + 3-6 line excerpt
       
       b. **Maintainability checks**:
          - Detect code duplication (delegate to `codebase-pattern-finder` for similarity search)
          - Flag magic numbers (numeric literals outside constants/enums)
          - Check import organization (stdlib → third-party → local pattern)
          - Assess module cohesion (single responsibility principle violations)
          - Identify hard-coded configuration values
          - **Evidence requirement**: Every claim MUST include file:line reference + 3-6 line excerpt
       
       c. **Testability checks**:
          - Map source files to corresponding test files (delegate to `codebase-locator` to find `test_*.py` or `*_test.py`)
          - Flag missing test files for modules with public APIs
          - Identify tightly coupled code (hard-to-mock dependencies)
          - Check for dependency injection patterns vs hard-coded dependencies
          - Assess test coverage of critical paths (error handling, edge cases)
          - **Evidence requirement**: Every claim MUST include file:line reference + 3-6 line excerpt
       
       **Phase 4: External Best Practices (Optional)**
       - If needed, delegate to `web-search-researcher` to verify current Python best practices
       - Use `codebase-analyzer` to trace complex execution paths for testability analysis
       
       **Phase 5: Plan Generation**
       a. Synthesize all findings (automated + manual) into priority-ranked improvement tasks
       b. Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
       c. Return summary with link to plan file
     
     - **Plan file structure** (similar to planner.md:82-130):
       ```markdown
       # Python QA Analysis: [Target]
       
       ## Scan Metadata
       - Date: YYYY-MM-DD
       - Target: [path]
       - Auditor: python-qa-thorough
       - Tools: ruff, pyright, bandit, manual analysis
       
       ## Executive Summary
       - **Overall Status**: [Pass/Conditional Pass/Fail]
       - **Critical Issues**: [count]
       - **High Priority**: [count]
       - **Improvement Opportunities**: [count]
       
       ## Automated Tool Findings
       
       ### 🛡️ Security (Bandit)
       [Categorized issues with file:line references]
       
       ### 📐 Type Safety (Pyright)
       [Categorized issues with file:line references]
       
       ### 🧹 Code Quality (Ruff)
       [Categorized issues with file:line references]
       
       ## Manual Quality Analysis
       
       ### 📖 Readability Issues
       For each issue:
       - **Issue:** [Description]
       - **Evidence:** `path/to/file.py:line-line`
       - **Excerpt:** 
         ```python
         [3-6 lines of code]
         ```
       
       ### 🔧 Maintainability Issues
       [Evidence-based findings with file:line:excerpt]
       
       ### 🧪 Testability Issues
       [Evidence-based findings with file:line:excerpt]
       
       ## Improvement Plan (For Implementor)
       
       ### QA-001: [Issue Title]
       - **Priority**: Critical/High/Medium/Low
       - **Category**: Security/Types/Readability/Maintainability/Testability
       - **File(s)**: `path/to/file.py:line-line`
       - **Issue**: [Detailed description]
       - **Evidence**: 
         ```python
         [Excerpt from file or tool output]
         ```
       - **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
       - **Done When**: [Observable condition]
       
       [Repeat for each issue]
       
       ## Acceptance Criteria
       - [ ] All critical security issues resolved
       - [ ] All type errors fixed
       - [ ] Public APIs have docstrings
       - [ ] Test coverage for new/modified modules
       - [ ] [Additional criteria based on findings]
       
       ## Implementor Checklist
       - [ ] QA-001: [Short title]
       - [ ] QA-002: [Short title]
       [etc.]
       
       ## References
       - Ruff output: [summary]
       - Pyright output: [summary]
       - Bandit output: [summary]
       - Files analyzed: [list]
       - Subagents used: [list with tasks delegated]
       ```
     
     - **Guidelines**:
       - **EVIDENCE REQUIREMENT**: Every claim in manual analysis MUST include file:line reference and excerpt (3-6 lines)
       - If evidence cannot be obtained, mark as "Assumption" and create verification task instead
       - Prioritize: Security > Types > Testability > Maintainability > Readability
       - Be constructive and specific (bad: "improve error handling", good: "wrap API call in try/except and raise CustomError")
       - Delegate file discovery to `codebase-locator`
       - Delegate pattern matching to `codebase-pattern-finder`
       - Delegate complex tracing to `codebase-analyzer`
       - Delegate best practices research to `web-search-researcher`
       - Tool not found: skip that tool and note in report metadata
       - **Skepticism first**: Verify every assumption against live code before including in plan
- **Interfaces / Pseudocode:** N/A
- **Evidence:** Structure inspired by `agent/planner.md:1-137` (plan generation pattern) and `agent/python-qa-auditor.md:1-52` (tool execution pattern); primary agent pattern from `agent/researcher.md:1-20`, `agent/planner.md:1-20`; evidence requirements from `thoughts/shared/research/2025-12-20-OpenCode-Framework-and-RPIQR-Project.md:119-140`
- **Done When:** File exists, can be read, follows primary agent pattern (mode: primary, granular tool permissions with comments, temperature: 0.1), and includes both automated and manual analysis workflows with evidence-based approach

### PLAN-004: Update AGENTS.md with new conventions
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Read current `AGENTS.md` file
  2. Add new section after "Project Structure" documenting the QA directory:
     ```markdown
     - `thoughts/shared/qa/` - QA analysis reports (YYYY-MM-DD-[Target].md)
     ```
  3. Add entry to "Code Style & Conventions" about QA plan naming:
     ```markdown
     - **QA Reports**: Use YYYY-MM-DD-[Target-Description].md format in `thoughts/shared/qa/`; target can be module name, feature name, or file path slug
     ```
  4. Add note about primary agents in "Code Style & Conventions":
     ```markdown
     - **Primary Agents**: Researcher, Planner, Implementor, Python-QA-Quick, Python-QA-Thorough all use `mode: primary` and can be invoked directly by users
     ```
- **Interfaces / Pseudocode:** N/A
- **Evidence:** `AGENTS.md` exists in file list; current conventions documented per `thoughts/shared/research/2025-12-20-OpenCode-Framework-and-RPIQR-Project.md:1-30`
- **Done When:** `AGENTS.md` includes documentation for `thoughts/shared/qa/` directory, QA report naming conventions, and primary agent status

### PLAN-005: Update README.md with new agents
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `README.md`
- **Instruction:**
  1. Read current `README.md`
  2. Update "Available Agents" table (around line 160-172) to include:
     ```markdown
     | `python-qa-quick` | Primary | 0.1 | Quick Python QA (ruff, pyright, bandit) |
     | `python-qa-thorough` | Primary | 0.1 | Thorough Python QA with plan generation |
     ```
  3. Update "QA Phase" section (around line 147-153) to document the two variants:
     ```markdown
     ### QA Phase
     
     QA agents review the implementation as **primary agents** that can be invoked directly:
     - **Quick QA** (`@python-qa-quick`): Fast automated checks (ruff, pyright, bandit) with actionable task list. Use for rapid feedback during development.
     - **Thorough QA** (`@python-qa-thorough`): Comprehensive analysis including automated tools + manual quality checks; generates detailed plan in `thoughts/shared/qa/`. Use for pre-release reviews or architectural assessments.
     
     QA agents identify bugs, quality issues, and deviations from requirements. Feedback loops back to the implementor for iterative refinement.
     ```
  4. Update "Project Structure" section (around line 100-106) to include:
     ```markdown
     │       ├── research/           # Research reports (YYYY-MM-DD-Topic.md)
     │       ├── plans/              # Implementation plans (YYYY-MM-DD-Ticket.md)
     │       └── qa/                 # QA analysis reports (YYYY-MM-DD-Target.md)
     ```
  5. Update workflow description to reflect QA as primary agents:
     ```markdown
     Primary agents in the RPIQR workflow:
     1. **Researcher** (@researcher) - Maps codebase and creates factual foundation
     2. **Planner** (@planner) - Architects technical solutions and generates blueprints
     3. **Implementor** (@implementor) - Executes plans and builds code
     4. **QA Quick** (@python-qa-quick) - Rapid quality checks for fast feedback
     5. **QA Thorough** (@python-qa-thorough) - Comprehensive quality analysis and improvement planning
     ```
- **Interfaces / Pseudocode:** N/A
- **Evidence:** `README.md:1-291` shows current structure with 10 agents listed and QA Phase described at lines 147-153
- **Done When:** README accurately reflects the two new QA agents as primary agents with invocation examples and updated workflow description

## Verification Tasks

### Assumption 1: Tool Installation Commands
- **Assumption:** Users may not have ruff, pyright, or bandit installed; suggesting `pip install ruff pyright bandit` is the correct installation method
- **Verification Step:** Check if these tools have alternative installation methods (conda, system package managers) or if pip is universal
- **Pass Condition:** Confirm pip installation works for all three tools OR document alternative methods in agent prompts

### Assumption 2: QA Directory Location
- **Assumption:** `thoughts/shared/qa/` is the appropriate location for QA plan files (parallel to research/ and plans/)
- **Verification Step:** Review if there's a documented convention for artifact organization beyond research and plans
- **Pass Condition:** Confirm no conflicts with existing RPIQR architecture or adjust path if needed

### Assumption 3: Testability Heuristics
- **Assumption:** The thorough agent can identify missing tests by checking for conventional test file naming patterns (`test_*.py`, `*_test.py`)
- **Verification Step:** Consider Python testing frameworks (pytest, unittest) and their file discovery conventions
- **Pass Condition:** Test file detection logic covers common patterns OR explicitly documents limitations

## Acceptance Criteria

- [ ] `thoughts/shared/qa/` directory exists and is documented in AGENTS.md and README.md
- [ ] `agent/python-qa-quick.md` exists with **mode: primary**, temperature 0.1, granular tool permissions with explanatory comments, runs ruff/pyright/bandit, outputs actionable task list without writing files
- [ ] `agent/python-qa-thorough.md` exists with **mode: primary**, temperature 0.1, granular tool permissions with explanatory comments, runs automated tools + manual analysis, writes plan to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
- [ ] Both agents follow RPIQR primary agent conventions: kebab-case filenames, commented tool permissions (e.g., `# use Sub-Agent 'X' instead`), evidence-based approach, subagent delegation pattern
- [ ] Manual quality checks in thorough variant include readability, maintainability, and testability dimensions beyond automated tools
- [ ] Plan file format for thorough variant matches planner agent structure with QA-specific sections (QA-001 format for tasks)
- [ ] Documentation updated in AGENTS.md and README.md reflecting new **primary agents** and QA workflow
- [ ] No modifications to existing `python-qa-auditor.md` (preserved for backward compatibility)
- [ ] Both agents can delegate to appropriate subagents (codebase-locator, codebase-pattern-finder, codebase-analyzer, web-search-researcher)

## Implementor Checklist
- [ ] PLAN-001: Create `thoughts/shared/qa/` directory
- [ ] PLAN-002: Create `agent/python-qa-quick.md` (PRIMARY agent, temp 0.1, fast checks, task list output)
- [ ] PLAN-003: Create `agent/python-qa-thorough.md` (PRIMARY agent, temp 0.1, comprehensive checks, plan file output)
- [ ] PLAN-004: Update `AGENTS.md` with QA directory and naming conventions
- [ ] PLAN-005: Update `README.md` with new primary agents and updated QA Phase documentation
