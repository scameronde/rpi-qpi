# OpenCode QA Agent Implementation Plan

## Inputs
- Research source: `.opencode/skills/opencode/` (opencode-agent-dev skill)
- Template reference: `agent/python-qa-thorough.md:1-364`
- User request: Create opencode-qa-thorough agent for analyzing OpenCode agents and skills

## Verified Current State

### Fact: Python QA Agent Structure
- **Evidence:** `agent/python-qa-thorough.md:1-20`
- **Excerpt:**
  ```yaml
  ---
  description: "Thorough Python QA analysis combining automated tools (ruff, pyright, bandit) with manual quality checks. Writes comprehensive plan file to thoughts/shared/qa/."
  mode: all
  temperature: 0.1
  tools:
    bash: true
    read: true
    write: true
    edit: false # it is not your job to edit files
  ---
  ```

### Fact: OpenCode Skill Knowledge Areas
- **Evidence:** `.opencode/skills/opencode/SKILL.md:17-67`
- **Excerpt:**
  - Skills System (YAML frontmatter, directory structure, metadata)
  - Agents System (modes, temperature, tool permissions)
  - Claude Sonnet-4.5 Optimization (prompt engineering, context management)
  - Prompt Engineering (system prompts, few-shot examples)
  - Critical Findings (common errors, best practices)

### Fact: Critical Validation Rules for OpenCode
- **Evidence:** `.opencode/skills/opencode/references/critical-findings.md:29-50`
- **Excerpt:**
  ```
  Name must:
  - Be 1–64 characters
  - Be lowercase alphanumeric with single hyphen separators
  - Not start or end with `-`
  - Not contain consecutive `--`
  - Match the directory name that contains `SKILL.md`
  ```

### Fact: Agent Mode and Temperature Guidelines
- **Evidence:** `.opencode/skills/opencode/references/agents-system.md:171-185`
- **Excerpt:**
  ```
  Temperature values typically range from 0.0 to 1.0:
  - 0.0-0.2: Very focused and deterministic responses, ideal for code analysis and planning
  - 0.3-0.5: Balanced responses with some creativity, good for general development tasks
  - 0.6-1.0: More creative and varied responses, useful for brainstorming and exploration
  ```

### Fact: QA Directory Exists
- **Evidence:** Shell command `ls -la thoughts/shared/qa/`
- **Excerpt:** Directory exists, currently empty (created on 2024-12-23)

## Goals / Non-Goals

### Goals
1. Create `agent/opencode-qa-thorough.md` agent that analyzes OpenCode agents and skills
2. Adapt python-qa-thorough structure to OpenCode domain (agents, skills, tools)
3. Define OpenCode-specific automated validation tools (YAML, Markdown, naming conventions)
4. Define manual analysis categories: Agent/Skill Clarity, Configuration Correctness, Functional Validation
5. Output plan files to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
6. Leverage opencode-agent-dev skill for domain knowledge

### Non-Goals
- Creating automated validation scripts (agent will use existing tools: yamllint, markdownlint)
- Analyzing TypeScript tool implementations (focus on agents and skills only)
- Modifying python-qa-thorough agent (create new agent, don't touch existing)

## Design Overview

### Data Flow
1. User invokes `opencode-qa-thorough` agent with target (e.g., `agent/planner.md` or `skills/opencode-agent-dev/`)
2. Agent loads opencode-agent-dev skill for domain knowledge
3. Agent runs automated tools (yamllint, markdownlint, custom name validation)
4. Agent reads target files and performs evidence-based manual analysis
5. Agent synthesizes findings into QA-XXX tasks
6. Agent writes plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`

### Control Flow
- Phase 1: Target Identification (explicit path or delegate to codebase-locator)
- Phase 2: Load OpenCode Skill (skill tool with opencode-agent-dev)
- Phase 3: Automated Tool Execution (YAML validation, Markdown linting, naming checks)
- Phase 4: Manual Quality Analysis (read files, verify against skill knowledge)
- Phase 5: Plan Generation (synthesize findings, write to thoughts/shared/qa/)

### Manual Analysis Categories

**Agent/Skill Clarity** (replaces Python "Readability"):
- System prompt clarity and organization
- Description field accuracy (matches actual behavior)
- Documentation completeness
- Naming conventions (kebab-case for files, PascalCase for types)

**Configuration Correctness** (replaces Python "Maintainability"):
- YAML frontmatter schema compliance
- Directory name matching (skill name: field must match directory)
- Tool permission consistency
- Temperature appropriateness for task type
- Agent mode correctness (primary vs subagent vs all-mode)
- Last-match-wins permission conflicts

**Functional Validation** (replaces Python "Testability"):
- Tool permission alignment with agent responsibility
- Delegation patterns (avoiding tool overlap with subagents)
- Examples and demonstrations in system prompts
- Evidence-based instructions (no vague directives)
- Observable "Done When" criteria

## Implementation Instructions (For Implementor)

### PLAN-001: Create Agent File Structure
- **Change Type:** create
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Create new file with YAML frontmatter section
  2. Set `description` to: "Thorough OpenCode QA analysis combining automated tools (yamllint, markdownlint) with manual quality checks for agents and skills. Writes comprehensive plan file to thoughts/shared/qa/."
  3. Set `mode: all` (available in all contexts, like python-qa-thorough)
  4. Set `temperature: 0.1` (deterministic analysis)
  5. Configure tools:
     - `bash: true` (for running validation tools)
     - `read: true` (for reading agent/skill files)
     - `write: true` (for writing QA plan files)
     - `edit: false` (QA agent doesn't modify code)
     - `glob: false` (use codebase-locator subagent)
     - `grep: false` (use codebase-pattern-finder subagent)
     - `list: true` (for directory inspection)
     - `skill: true` (for loading opencode-agent-dev skill)
     - `todoread: true` and `todowrite: true` (for task tracking)
     - `sequential-thinking: true` (for complex analysis)
     - All other tools: false (delegate or not needed)
- **Evidence:** `agent/python-qa-thorough.md:1-20` (template structure)
- **Done When:** File exists with valid YAML frontmatter and tool configuration

### PLAN-002: Write Prime Directive and Target Audience
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add section: `# Thorough QA Agent: Comprehensive OpenCode Quality Analysis`
  2. Add subsection: `## Prime Directive`
  3. Write: "You analyze, document, and plan improvements for OpenCode agents and skills. You do not modify code. Your plan is the blueprint for quality improvement."
  4. Add subsection: `## Target Audience`
  5. Write: "Your output is for the Implementor Agent (an AI coder) and OpenCode developers who need a complete quality assessment of their agents and skills with specific remediation steps."
- **Evidence:** `agent/python-qa-thorough.md:22-32` (template pattern)
- **Done When:** Prime directive and target audience sections exist

### PLAN-003: Define Operational Workflow (Phase 1-2)
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add section: `## Operational Workflow`
  2. Add subsection: `### Phase 1: Target Identification`
  3. Write steps:
     - "1. If user provides explicit path (e.g., `agent/planner.md` or `skills/opencode-agent-dev/`), use it"
     - "2. If no path provided, delegate to `codebase-locator` to find agent/*.md or skills/*/SKILL.md files"
     - "3. If analyzing recent changes, use `git diff --name-only` to identify scope"
  4. Add subsection: `### Phase 2: Load OpenCode Skill`
  5. Write steps:
     - "1. Execute `skill({ name: \"opencode-agent-dev\" })` to load domain knowledge"
     - "2. Extract validation rules from loaded skill content"
     - "3. Use skill references for manual analysis criteria"
- **Evidence:** `agent/python-qa-thorough.md:36-41` (phase 1 template), `.opencode/skills/opencode/SKILL.md:1-208` (skill knowledge)
- **Done When:** Phases 1-2 documented with OpenCode-specific steps

### PLAN-004: Define Automated Tool Execution (Phase 3)
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add subsection: `### Phase 3: Automated Tool Execution`
  2. Write steps:
     ```
     1. Execute automated tools in parallel using bash tool:
        ```bash
        # YAML validation for frontmatter
        yamllint -f parsable [target]
        
        # Markdown linting
        markdownlint [target]
        
        # Directory-to-frontmatter name matching (custom check)
        # For skills: extract `name:` field, compare to directory name
        # Regex: ^[a-z0-9]+(-[a-z0-9]+)*$
        ```
     2. Capture and categorize automated findings
     3. If tool not found, note in report and skip that tool
     ```
  3. Note that custom validation checks include:
     - Agent/skill naming conventions (kebab-case)
     - Directory name matching for skills (Critical Finding #1)
     - Temperature range validation (0.0-1.0)
     - Required frontmatter fields (description for agents, name+description for skills)
- **Evidence:** `.opencode/skills/opencode/references/critical-findings.md:29-50` (naming rules)
- **Done When:** Phase 3 documented with OpenCode-specific validation tools

### PLAN-005: Define Manual Analysis Categories (Phase 4)
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add subsection: `### Phase 4: Manual Quality Analysis (Evidence-Based Only)`
  2. Add note: "**CRITICAL**: Every claim MUST include file:line reference + 3-6 line code excerpt"
  3. Add subsubsection: `#### a. Agent/Skill Clarity Checks`
  4. Write items with evidence requirements:
     ```
     1. **System prompt clarity**: Flag verbose/unclear instructions (agents only)
        - **Evidence required**: File path, line range, excerpt showing unclear instruction
        
     2. **Description accuracy**: Verify frontmatter description matches actual behavior
        - **Evidence required**: File:line for description field + behavior mismatch excerpt
        
     3. **Documentation completeness**: Check for missing usage examples, unclear delegation patterns
        - **Evidence required**: File:line showing missing documentation section
        
     4. **Naming conventions**: Verify kebab-case for filenames, PascalCase for types
        - **Evidence required**: File path with naming violation
     ```
  5. Add subsubsection: `#### b. Configuration Correctness Checks`
  6. Write items:
     ```
     1. **YAML schema compliance**: Validate frontmatter against official schema
        - Delegate to automated tools (yamllint)
        - **Evidence required**: Tool output + file:line
        
     2. **Directory name matching** (skills only): Verify directory name matches frontmatter `name:` field exactly
        - **Evidence required**: Directory path + SKILL.md:line showing name field
        
     3. **Tool permission consistency**: Check for permission conflicts (e.g., edit:true but instructions say "don't edit")
        - **Evidence required**: File:line for permission + file:line for conflicting instruction
        
     4. **Temperature appropriateness**: Verify temperature matches task type (0.0-0.2 for analysis/planning, 0.3-0.5 for implementation, 0.6-1.0 for creative)
        - **Evidence required**: File:line for temperature + agent task description
        
     5. **Agent mode correctness**: Verify mode (primary/subagent/all) matches invocation pattern
        - **Evidence required**: File:line for mode field + analysis of intended usage
        
     6. **Permission ordering**: Check for last-match-wins conflicts (wildcard after specific rules)
        - **Evidence required**: File:line showing permission block with incorrect ordering
     ```
  7. Add subsubsection: `#### c. Functional Validation Checks`
  8. Write items:
     ```
     1. **Tool permission alignment**: Verify enabled tools match agent responsibility
        - **Evidence required**: File:line for tool permissions + system prompt excerpt showing responsibility mismatch
        
     2. **Delegation patterns**: Check for tool overlap with subagent delegation (e.g., glob:true but instructions say "delegate to codebase-locator")
        - **Evidence required**: File:line for tool + file:line for delegation instruction
        
     3. **Explicit tool usage instructions** (Claude Sonnet-4.5): Check for "default-to-action" directive
        - **Evidence required**: File:line showing missing/present directive (Critical Finding #2)
        
     4. **Observable acceptance criteria**: Verify "Done When" conditions are testable
        - **Evidence required**: File:line showing vague vs observable criteria
     ```
- **Evidence:** `.opencode/skills/opencode/references/critical-findings.md:52-98` (Claude tool usage), `agent/python-qa-thorough.md:54-106` (manual analysis template)
- **Done When:** Phase 4 documented with three analysis categories and evidence requirements

### PLAN-006: Define Plan Generation (Phase 5)
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add subsection: `### Phase 5: Plan Generation`
  2. Write steps:
     - "1. Synthesize all findings (automated + manual) into priority-ranked improvement tasks"
     - "2. Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`"
     - "   - For agents: Use agent filename (e.g., `2026-01-17-Planner-Agent.md`)"
     - "   - For skills: Use skill name (e.g., `2026-01-17-OpenCode-Skill.md`)"
     - "3. Return summary with link to plan file"
- **Evidence:** `agent/python-qa-thorough.md:113-117` (plan generation template)
- **Done When:** Phase 5 documented with OpenCode-specific file naming

### PLAN-007: Define Plan File Structure Template
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add section: `## Plan File Structure`
  2. Add: "Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:"
  3. Write template:
     ````markdown
     ```markdown
     # OpenCode QA Analysis: [Target]
     
     ## Scan Metadata
     - Date: YYYY-MM-DD
     - Target: [path]
     - Auditor: opencode-qa-thorough
     - Tools: yamllint, markdownlint, manual analysis, opencode-agent-dev skill
     
     ## Executive Summary
     - **Overall Status**: [Pass/Conditional Pass/Fail]
     - **Critical Issues**: [count]
     - **High Priority**: [count]
     - **Improvement Opportunities**: [count]
     
     ## Automated Tool Findings
     
     ### 📋 YAML Validation (yamllint)
     - **Status**: [PASSED/FAILED]
     - **Errors**: [count]
     
     #### Issues
     [List of YAML syntax/schema errors with file:line references]
     
     ### 📝 Markdown Linting (markdownlint)
     - **Status**: [PASSED/FAILED]
     - **Warnings**: [count]
     
     #### Issues
     [List of Markdown formatting issues with file:line references]
     
     ### 🏷️ Naming Conventions
     - **Status**: [PASSED/FAILED]
     - **Violations**: [count]
     
     #### Issues
     [List of naming convention violations (kebab-case, directory matching)]
     
     ## Manual Quality Analysis
     
     ### 📖 Agent/Skill Clarity Issues
     
     For each issue:
     - **Issue:** [Description]
     - **Evidence:** `path/to/file.md:line-line`
     - **Excerpt:** 
       ```yaml or markdown
       [3-6 lines of code]
       ```
     
     ### 🔧 Configuration Correctness Issues
     [Evidence-based findings with file:line:excerpt]
     
     ### 🎯 Functional Validation Issues
     [Evidence-based findings with file:line:excerpt]
     
     ## Improvement Plan (For Implementor)
     
     ### QA-001: [Issue Title]
     - **Priority**: Critical/High/Medium/Low
     - **Category**: Configuration/Clarity/Validation
     - **File(s)**: `path/to/file.md:line-line`
     - **Issue**: [Detailed description]
     - **Evidence**: 
       ```yaml or markdown
       [Excerpt from file or tool output]
       ```
     - **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
     - **Done When**: [Observable condition]
     
     [Repeat for each issue]
     
     ## Acceptance Criteria
     - [ ] All critical configuration errors resolved
     - [ ] All YAML validation errors fixed
     - [ ] Directory names match frontmatter name fields (skills)
     - [ ] Tool permissions align with agent responsibilities
     - [ ] Temperature settings appropriate for task types
     - [ ] [Additional criteria based on findings]
     
     ## Implementor Checklist
     - [ ] QA-001: [Short title]
     - [ ] QA-002: [Short title]
     [etc.]
     
     ## References
     - yamllint output: [summary]
     - markdownlint output: [summary]
     - OpenCode skill: opencode-agent-dev (version X.X)
     - Files analyzed: [list]
     - Subagents used: [list with tasks delegated]
     ```
     ````
- **Evidence:** `agent/python-qa-thorough.md:122-211` (template structure)
- **Done When:** Plan file template section exists with OpenCode-specific categories

### PLAN-008: Add Prioritization and Specificity Guidelines
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add section: `## Guidelines`
  2. Add subsection: `### Evidence Requirement (NON-NEGOTIABLE)`
  3. Write:
     ```
     **EVERY** claim in manual analysis MUST include:
     1. File path and line number/range (e.g., `agent/planner.md:15-20`)
     2. Code excerpt (3-6 lines showing the issue)
     
     If evidence cannot be obtained, mark as **"Assumption"** and create a verification task instead.
     ```
  4. Add subsection: `### Prioritization`
  5. Write hierarchy:
     ```
     Use this hierarchy:
     1. **Critical**: Configuration errors preventing agent loading (invalid YAML, directory mismatch for skills)
     2. **High**: Tool permission misalignment, incorrect agent mode, missing required fields
     3. **Medium**: Suboptimal temperature settings, unclear delegation patterns, missing examples
     4. **Low**: Documentation improvements, naming convention preferences
     ```
  6. Add subsection: `### Specificity`
  7. Write examples:
     ```
     **Bad**: "Improve system prompt"
     **Good**: "Add explicit tool usage directive at line 42: '<default_to_action>By default, implement changes rather than only suggesting them.</default_to_action>'"
     
     **Bad**: "Fix temperature"
     **Good**: "Change temperature from 0.5 to 0.1 at line 5 (agent performs deterministic planning, requires focused responses)"
     
     **Bad**: "Check permissions"
     **Good**: "Reorder permission.bash block at lines 15-20: move wildcard '*' rule to first position (last-match-wins causes git commands to be denied)"
     ```
- **Evidence:** `agent/python-qa-thorough.md:213-236` (guidelines template), `.opencode/skills/opencode/references/critical-findings.md:75-98` (permission ordering)
- **Done When:** Guidelines section exists with OpenCode-specific prioritization and examples

### PLAN-009: Add Delegation Strategy
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add subsection: `### Delegation Strategy`
  2. Write:
     ```
     - **File discovery**: Delegate to `codebase-locator` for finding agent/*.md, skills/*/SKILL.md
     - **Pattern matching**: Delegate to `codebase-pattern-finder` for duplicate agent patterns, inconsistent tool permissions across agents
     - **Complex tracing**: Delegate to `codebase-analyzer` for agent-to-subagent delegation path analysis
     - **Domain knowledge**: Load `opencode-agent-dev` skill (do NOT delegate to web-search-researcher)
     ```
- **Evidence:** `agent/python-qa-thorough.md:238-245` (delegation template)
- **Done When:** Delegation strategy documented with OpenCode-specific agents

### PLAN-010: Add Tool Availability and Error Handling
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add subsection: `### Tool Availability`
  2. Write:
     ```
     If a tool is not found:
     1. Note in "Scan Metadata" section
     2. Skip that tool's findings section
     3. Continue with available tools
     4. Suggest installation in summary:
        - yamllint: `pip install yamllint`
        - markdownlint: `npm install -g markdownlint-cli`
     ```
  3. Add subsection: `### Skepticism First`
  4. Write: "**Verify every assumption against live code before including in plan.** Do not assume file structure, naming conventions, or configuration patterns without reading the actual files."
  5. Add section: `## Error Handling`
  6. Write:
     ```
     1. **All tools fail**: Report error, suggest installation, ask user to retry
     2. **Target path doesn't exist**: Inform user, suggest using `codebase-locator`
     3. **Target is not an agent or skill**: Inform user, ask for clarification
     4. **Cannot read file**: Skip that file, note in report, continue with others
     5. **Subagent fails**: Note in report, continue with manual analysis
     6. **Skill loading fails**: Warn user, proceed with built-in knowledge (may be incomplete)
     ```
- **Evidence:** `agent/python-qa-thorough.md:247-256` (tool availability), `agent/python-qa-thorough.md:330-337` (error handling)
- **Done When:** Tool availability and error handling sections exist

### PLAN-011: Add Examples Section
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add section: `## Examples`
  2. Add subsection: `### Example: Configuration Correctness Issue (Proper Evidence)`
  3. Write:
     ````markdown
     ```markdown
     ### 🔧 Configuration Correctness Issues
     
     #### Directory Name Mismatch (Skill)
     - **Issue:** Skill directory name does not match frontmatter `name:` field
     - **Evidence:** `.opencode/skills/opencode-dev/SKILL.md:2`
     - **Excerpt:**
       ```yaml
       ---
       name: opencode-agent-dev
       description: OpenCode development reference
       ---
       ```
     - **Impact:** Skill will fail to load (Critical Finding #1)
     - **Expected:** Directory should be `opencode-agent-dev/` or name should be `opencode-dev`
     ```
     ````
  4. Add subsection: `### Example: Functional Validation Issue (Proper Evidence)`
  5. Write:
     ````markdown
     ```markdown
     ### 🎯 Functional Validation Issues
     
     #### Tool Permission Misalignment
     - **Issue:** Agent has `glob: true` but system prompt instructs to delegate to codebase-locator
     - **Evidence:** `agent/planner.md:10` (tool permission) + `agent/planner.md:65` (instruction)
     - **Excerpt (Permission):**
       ```yaml
       tools:
         glob: true  # Conflicts with delegation instruction
         task: true
       ```
     - **Excerpt (Instruction):**
       ```markdown
       For file discovery, delegate to `codebase-locator` subagent.
       ```
     - **Impact:** Inconsistent behavior - agent can use glob directly despite instructions
     ```
     ````
  6. Add subsection: `### Example: QA Task with Specific Recommendation`
  7. Write:
     ````markdown
     ```markdown
     ### QA-003: Add Default-to-Action Directive for Claude Sonnet-4.5
     - **Priority**: High
     - **Category**: Functional Validation
     - **File(s)**: `agent/implementation-controller.md:1-50`
     - **Issue**: Agent uses Claude Sonnet-4.5 but lacks explicit tool usage directive, may suggest instead of implement
     - **Evidence**: 
       ```yaml
       ---
       description: Controls implementation workflow
       model: anthropic/claude-sonnet-4-20250514
       temperature: 0.2
       ---
       
       You are the Implementation Controller...
       ```
     - **Recommendation**: 
       1. Add XML directive after role definition (around line 25):
          ```xml
          <default_to_action>
          By default, implement changes rather than only suggesting them. If the user's 
          intent is unclear, infer the most useful likely action and proceed, using tools 
          to discover any missing details instead of guessing.
          </default_to_action>
          ```
       2. Reference: Critical Finding #2 from opencode-agent-dev skill
     - **Done When**: 
       - `<default_to_action>` block exists in system prompt
       - Block is placed before first workflow phase definition
       - Agent successfully invokes task-executor subagent in test run
     ```
     ````
- **Evidence:** `.opencode/skills/opencode/references/critical-findings.md:52-71` (default-to-action), `agent/python-qa-thorough.md:260-327` (examples template)
- **Done When:** Examples section exists with OpenCode-specific issues

### PLAN-012: Add Workflow Summary and Final Checks
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Add section: `## Workflow Summary`
  2. Write:
     ````
     ```
     1. Identify Target (user input or delegate to codebase-locator)
        ↓
     2. Load OpenCode Skill (skill tool: opencode-agent-dev)
        ↓
     3. Run Automated Tools (yamllint, markdownlint, custom naming checks)
        ↓
     4. Read Target Files (use read tool for manual analysis)
        ↓
     5. Delegate Specialized Tasks (to codebase-pattern-finder, codebase-analyzer, etc.)
        ↓
     6. Synthesize Findings (combine automated + manual with evidence)
        ↓
     7. Write Plan File (thoughts/shared/qa/YYYY-MM-DD-[Target].md)
        ↓
     8. Return Summary (with link to plan file)
     ```
     ````
  3. Add section: `## Final Checks Before Writing Plan`
  4. Write checklist:
     ```
     - [ ] Every manual finding has file:line + excerpt?
     - [ ] All QA-XXX tasks have specific recommendations?
     - [ ] All "Done When" conditions are observable/testable?
     - [ ] Prioritization follows Critical > High > Medium > Low?
     - [ ] No vague language ("improve", "refactor", "fix")?
     - [ ] Subagent delegations documented in References?
     - [ ] Tool failures noted in Scan Metadata?
     - [ ] OpenCode skill version referenced in metadata?
     ```
- **Evidence:** `agent/python-qa-thorough.md:339-364` (workflow and final checks)
- **Done When:** Workflow summary and final checks sections exist

## Verification Tasks

None - all claims are verified against existing files.

## Acceptance Criteria

- [ ] File `agent/opencode-qa-thorough.md` exists
- [ ] YAML frontmatter includes: description, mode: all, temperature: 0.1, tool configuration
- [ ] System prompt includes all 5 operational phases
- [ ] Manual analysis defines 3 categories: Agent/Skill Clarity, Configuration Correctness, Functional Validation
- [ ] Plan file template uses OpenCode-specific categories (YAML, Markdown, Naming instead of Ruff, Pyright, Bandit)
- [ ] Examples section includes OpenCode-specific issues (directory mismatch, permission conflicts, default-to-action)
- [ ] Guidelines reference opencode-agent-dev skill explicitly
- [ ] Error handling covers skill loading failures
- [ ] Agent can be invoked and successfully loads opencode-agent-dev skill

## Implementor Checklist

- [ ] PLAN-001: Create Agent File Structure
- [ ] PLAN-002: Write Prime Directive and Target Audience
- [ ] PLAN-003: Define Operational Workflow (Phase 1-2)
- [ ] PLAN-004: Define Automated Tool Execution (Phase 3)
- [ ] PLAN-005: Define Manual Analysis Categories (Phase 4)
- [ ] PLAN-006: Define Plan Generation (Phase 5)
- [ ] PLAN-007: Define Plan File Structure Template
- [ ] PLAN-008: Add Prioritization and Specificity Guidelines
- [ ] PLAN-009: Add Delegation Strategy
- [ ] PLAN-010: Add Tool Availability and Error Handling
- [ ] PLAN-011: Add Examples Section
- [ ] PLAN-012: Add Workflow Summary and Final Checks
