---
date: 2026-01-27
researcher: code---anthropic-claude-sonnet
topic: "QA Agent Architecture and Patterns"
status: complete
coverage:
  - .opencode/agent/ QA agents (5 specifications)
  - Total analyzed: 3,008 lines of QA agent documentation
  - Quick agents: 2 (python-qa-quick, typescript-qa-quick)
  - Thorough agents: 3 (opencode-qa-thorough, python-qa-thorough, typescript-qa-thorough)
---

# Research: QA Agent Architecture and Patterns

## Executive Summary

- QA system implements 2-tier architecture: **Quick** (inline feedback) and **Thorough** (plan-based workflow)
- All 5 QA agents implement YAML frontmatter + thinking/answer separation (consistent with other subagents)
- Quick agents use message_type: `QA_RESULT`, Thorough agents use: `QA_REPORT` or `QA_ANALYSIS_REPORT`
- All QA agents support correlation_id for workflow tracking
- Quick agents have `write: false` (read-only), Thorough agents have `write: true` (plan generation)
- Thorough agents delegate to codebase-locator (tests_only scope), codebase-pattern-finder, codebase-analyzer (execution_only depth)
- All QA agents disable glob/grep (enforce delegation to subagents)

## Coverage Map

**Inspected**: All 5 QA agent specifications in `.opencode/agent/` directory

**QA Agent Categories**:
1. **OpenCode QA**: opencode-qa-thorough.md (1 agent, 568 lines)
2. **Python QA**: python-qa-quick.md, python-qa-thorough.md (2 agents, 1,167 lines)
3. **TypeScript QA**: typescript-qa-quick.md, typescript-qa-thorough.md (2 agents, 1,276 lines)

**Architecture Tiers**:
- **Quick tier** (2 agents): Inline output, no file writes, immediate feedback
- **Thorough tier** (3 agents): Plan file generation, comprehensive analysis, workflow integration

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: Consistent Architectural Pattern Adoption

**Observation:** All 5 QA agents implement YAML frontmatter + thinking/answer separation, matching the pattern used by other subagents

**Evidence:**

1. **python-qa-quick.md**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:241-278`
   - **Excerpt:**
     ```markdown
     <thinking>
     Tool Execution Log:
     
     Commands Executed:
     - ruff check [path] (ruff X.Y.Z)
     - pyright [path] (pyright X.Y.Z)
     [...]
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
     ```

2. **python-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:365-382`
   - **Excerpt:**
     ```markdown
     <answer>
     ---
     message_id: qa-thorough-YYYY-MM-DD-NNN
     correlation_id: [workflow-id or user-request-id]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: QA_ANALYSIS_REPORT
     qa_agent: python-qa-thorough
     qa_agent_version: "1.0"
     target_path: [path/to/target]
     target_type: [file | module | package]
     overall_status: [Pass | Conditional Pass | Fail]
     critical_issues: [count]
     high_priority_issues: [count]
     medium_priority_issues: [count]
     low_priority_issues: [count]
     tools_used: [ruff, pyright, bandit, interrogate, manual]
     tools_unavailable: [list or "none"]
     ---
     ```

3. **opencode-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:217-230`
   - **Excerpt:**
     ```markdown
     ---
     # Message Envelope (auto-generated from analysis metadata)
     message_id: qa-YYYY-MM-DD-NNN  # Format: qa-{timestamp}-{sequence}
     correlation_id: ""  # Optional: Link to related workflow
     timestamp: YYYY-MM-DDTHH:MM:SSZ  # ISO 8601 format
     message_type: QA_REPORT  # Fixed value for QA analysis reports
     qa_agent_version: "1.0"  # Version of opencode-qa-thorough agent
     target_path: ""  # Path to analyzed target
     target_type: ""  # agent | skill
     overall_status: ""  # Pass | Conditional Pass | Fail
     critical_issues: 0  # Count of Critical priority issues
     high_priority_issues: 0  # Count of High priority issues
     improvement_opportunities: 0  # Count of Medium + Low priority issues
     ---
     ```

**Direct consequence:** QA agents fully conform to architectural messaging standards established by other subagents (codebase-analyzer, codebase-locator, etc.)

### Finding 2: Two-Tier Architecture (Quick vs Thorough)

**Observation:** QA system implements clear separation between quick feedback and thorough analysis workflows

**Evidence:**

1. **Quick agents - inline output, no file writes**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:8` and `.opencode/agent/python-qa-quick.md:27-32`
   - **Excerpt:**
     ```yaml
     tools:
       write: false
     ```
     ```markdown
     **Output Type**: Inline (chat/terminal output), not file-based
     
     **Use Case**: Fast developer feedback during coding (inner loop)
     
     **Complementary Agent**: Use `opencode-qa-thorough` for comprehensive analysis
     ```

2. **Thorough agents - plan file generation**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:8` and `.opencode/agent/python-qa-thorough.md:249-253`
   - **Excerpt:**
     ```yaml
     tools:
       write: true
     ```
     ```markdown
     3. Write plan file to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with three-part structure:
        - YAML frontmatter (message envelope)
        - <thinking> section (analysis process log from Phase 4.5)
        - <answer> section (QA report using template below)
     ```

3. **Architectural positioning documented**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:34-44`
   - **Excerpt:**
     ```markdown
     ### When to Use python-qa-quick
     - Developer needs immediate feedback on recent changes
     - Pre-commit hook for blocking critical issues
     - CI/CD pipeline for fast triage
     - Inline task list sufficient (no workflow automation needed)
     
     ### When to Use opencode-qa-thorough
     - Comprehensive QA before implementation planning
     - Need manual analysis + subagent delegation
     - Need workflow automation (QA-Planner → Implementation-Controller)
     - File-based report for documentation/audit trail required
     ```

**Direct consequence:** 
- Quick agents optimize for speed (parallel tool execution, no file I/O)
- Thorough agents optimize for completeness (manual analysis, subagent delegation, plan generation)
- Architecture enables both rapid feedback loops and comprehensive quality gates

### Finding 3: Specialized Message Types for QA Results

**Observation:** QA agents use distinct message_type values to differentiate quick vs thorough outputs

**Evidence:**

1. **Quick agents use `QA_RESULT`**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:271` and `.opencode/agent/typescript-qa-quick.md:279`
   - **Excerpt (python-qa-quick):**
     ```yaml
     message_type: QA_RESULT
     ```
   - **Excerpt (typescript-qa-quick):**
     ```yaml
     message_type: QA_RESULT
     ```

2. **Thorough agents use `QA_REPORT` or `QA_ANALYSIS_REPORT`**:
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:222` and `.opencode/agent/python-qa-thorough.md:370`
   - **Excerpt (opencode-qa-thorough):**
     ```yaml
     message_type: QA_REPORT  # Fixed value for QA analysis reports
     ```
   - **Excerpt (python-qa-thorough):**
     ```yaml
     message_type: QA_ANALYSIS_REPORT
     ```

3. **TypeScript thorough agent**:
   - **Evidence:** `.opencode/agent/typescript-qa-thorough.md:289`
   - **Excerpt:**
     ```yaml
     message_type: QA_REPORT
     ```

**Direct consequence:** 
- Message type enables downstream consumers to distinguish quick results from comprehensive reports
- Inconsistency: opencode/typescript use `QA_REPORT`, python uses `QA_ANALYSIS_REPORT` (minor naming variation)

### Finding 4: Delegation Patterns with Scope/Depth Optimization

**Observation:** Thorough QA agents delegate to subagents with explicit scope/depth parameters to optimize token usage

**Evidence:**

1. **tests_only scope for test file discovery**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:107-156`
   - **Excerpt:**
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
     ```

2. **execution_only depth for testability tracing**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:162-182`
   - **Excerpt:**
     ```markdown
     #### Delegating to codebase-analyzer for Testability Tracing
     
     When analyzing complex execution paths for testability (e.g., identifying hard-to-test code, tracing dependencies for mocking), delegate to `codebase-analyzer` with `execution_only` depth:
     
     **Example delegation**:
     ```markdown
     task({
       agent: "codebase-analyzer",
       task: "Trace execution path for testability analysis: src/utils/validator.py, validate_input function",
       analysis_depth: "execution_only"
     })
     ```
     
     **Token savings**: Using `execution_only` depth returns ~250 tokens instead of ~800 tokens (saves ~70% compared to full comprehensive analysis).
     ```

3. **codebase-pattern-finder for duplication analysis**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:183-204`
   - **Excerpt:**
     ```markdown
     ## Delegating to codebase-pattern-finder for Code Duplication
     
     When searching for duplicate code patterns (required evidence per line 77):
     
     Example:
     ```
     task({
       subagent_type: "codebase-pattern-finder",
       description: "Find duplicate validation logic",
       prompt: "Find duplicate validation logic patterns across src/validators/. Analysis correlation: qa-duplication-check"
     })
     ```
     ```

**Direct consequence:** 
- QA agents optimize token usage via targeted delegation (76% reduction for test discovery, 70% for execution tracing)
- Scope/depth parameters enable fine-grained control over subagent verbosity

### Finding 5: Evidence Requirement Enforcement (Non-Negotiable)

**Observation:** All thorough QA agents enforce mandatory evidence format (file:line + excerpt) for manual findings

**Evidence:**

1. **opencode-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:112-116` and `.opencode/agent/opencode-qa-thorough.md:327-334`
   - **Excerpt (directive):**
     ```markdown
     **CRITICAL**: Every claim MUST include file:line reference + 3-6 line code excerpt
     
     #### a. Agent/Skill Clarity Checks
     
     1. **System prompt clarity**: Flag verbose/unclear instructions (agents only)
        - **Evidence required**: File path, line range, excerpt showing unclear instruction
     ```
   - **Excerpt (enforcement):**
     ```markdown
     ### Evidence Requirement (NON-NEGOTIABLE)
     
     **EVERY** claim in manual analysis MUST include:
     1. File path and line number/range (e.g., `agent/planner.md:15-20`)
     2. Code excerpt (3-6 lines showing the issue)
     
     If evidence cannot be obtained, mark as **"Assumption"** and create a verification task instead.
     ```

2. **python-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:56` and `.opencode/agent/python-qa-thorough.md:477-483`
   - **Excerpt (directive):**
     ```markdown
     **CRITICAL**: Every claim MUST include file:line reference + 3-6 line code excerpt
     ```
   - **Excerpt (enforcement):**
     ```markdown
     ### Evidence Requirement (NON-NEGOTIABLE)
     
     **EVERY** claim in manual analysis MUST include:
     1. File path and line number/range (e.g., `src/auth.py:42-58`)
     2. Code excerpt (3-6 lines showing the issue)
     
     If evidence cannot be obtained, mark as **"Assumption"** and create a verification task instead.
     ```

3. **typescript-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/typescript-qa-thorough.md:60` and `.opencode/agent/typescript-qa-thorough.md:412-418`
   - **Excerpt:**
     ```markdown
     **CRITICAL**: Every claim MUST include file:line reference + 3-6 line code excerpt
     ```

**Direct consequence:** 
- QA agents inherit same evidence standards as researcher.md (enforces verifiability)
- Prevents vague/unverifiable quality claims ("code is bad" → "function exceeds 50 lines at auth.py:42-95")

### Finding 6: Tool Constraint Enforcement via Permissions

**Observation:** QA agents use tool permissions to enforce delegation boundaries (glob/grep disabled, delegation required)

**Evidence:**

1. **opencode-qa-thorough.md tool constraints**:
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:5-21`
   - **Excerpt:**
     ```yaml
     tools:
       bash: true
       read: true
       write: true
       edit: false # it is not your job to edit files
       glob: false # use Sub-Agent 'codebase-locator' instead
       grep: false # use Sub-Agent 'codebase-pattern-finder' instead
       list: true
       patch: false
       todoread: true
       todowrite: true
       webfetch: false # use Sub-Agent 'web-search-researcher' instead
       searxng-search: false # use Sub-Agent 'web-search-researcher' instead
       sequential-thinking: true
       context7: false # use Sub-Agent 'codebase-analyzer' instead
       skill: true
     ```

2. **python-qa-quick.md tool constraints**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:5-20`
   - **Excerpt:**
     ```yaml
     tools:
       bash: true
       read: true
       write: false
       edit: false # it is not your job to edit files
       glob: false # use Sub-Agent 'codebase-locator' instead
       grep: false # use Sub-Agent 'codebase-pattern-finder' instead
       list: true
       patch: false
       todoread: true
       todowrite: true
       webfetch: false # use Sub-Agent 'web-search-researcher' instead
       searxng-search: false # use Sub-Agent 'web-search-researcher' instead
       sequential-thinking: true
       context7: false
     ```

3. **typescript-qa-thorough.md tool constraints**:
   - **Evidence:** `.opencode/agent/typescript-qa-thorough.md:5-20`
   - **Excerpt:**
     ```yaml
     tools:
       bash: true
       read: true
       write: true
       edit: false # it is not your job to edit files
       glob: false # use Sub-Agent 'codebase-locator' instead
       grep: false # use Sub-Agent 'codebase-pattern-finder' instead
       [...]
     ```

**Direct consequence:** 
- Tool constraints architecturally enforce delegation (agents cannot bypass subagent system)
- Consistent pattern across all 5 QA agents (glob/grep disabled, bash/read enabled)
- Quick agents have write:false (read-only), Thorough agents have write:true (plan generation)

## Detailed Technical Analysis (Verified)

### Architecture: Specialization by Language/Domain

**QA agents organized by target domain**:

1. **OpenCode QA** (agent/skill analysis):
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:23-25` and `.opencode/agent/opencode-qa-thorough.md:88-104`
   - **Excerpt (purpose):**
     ```markdown
     You are the **Thorough QA Agent**. You are the Quality Architect; the **Implementor** is your Builder. You perform comprehensive OpenCode quality analysis to produce a detailed improvement plan.
     ```
   - **Excerpt (tools):**
     ```markdown
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
     ```

2. **Python QA** (Python code analysis):
   - **Evidence:** `.opencode/agent/python-qa-quick.md:117-128` and `.opencode/agent/python-qa-thorough.md:42-52`
   - **Excerpt (quick):**
     ```bash
     ruff check [target]
     pyright [target]
     bandit -r [target]
     interrogate --fail-under 80 -v --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
     ```
   - **Excerpt (thorough):**
     ```bash
     ruff check [target]
     pyright [target]
     bandit -r [target]
     interrogate --fail-under 80 -vv --omit-covered-files --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
     ```

3. **TypeScript QA** (TypeScript/React code analysis):
   - **Evidence:** `.opencode/agent/typescript-qa-quick.md:97-114` and `.opencode/agent/typescript-qa-thorough.md:42-57`
   - **Excerpt (quick):**
     ```bash
     npx tsc --noEmit
     npx eslint . --ext .ts,.tsx
     npx knip --reporter compact
     ```
   - **Excerpt (thorough):**
     ```bash
     npx tsc --noEmit --pretty false
     npx eslint . --ext .ts,.tsx --format json
     npx knip --reporter json
     ```

**Key differences**:
- OpenCode QA uses YAML/Markdown linters (domain-specific)
- Python QA uses ruff/pyright/bandit/interrogate (Python ecosystem)
- TypeScript QA uses tsc/eslint/knip (TypeScript ecosystem)
- Quick agents use human-readable output formats
- Thorough agents use JSON/parsable formats for programmatic analysis

### Architecture: Thinking/Answer Separation (Transparency + Token Optimization)

**All QA agents implement two-section output**:

1. **<thinking> section - operational reasoning**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:130-217`
   - **Excerpt:**
     ```markdown
     ### 3. Document Tool Execution (For <thinking> Section)
     
     #### 3.1 Commands Executed
     
     Log each command with:
     - Exact command string (including paths, flags, and arguments)
     - Tool version (e.g., `ruff --version` output)
     - Execution context (working directory if not project root)
     
     #### 3.2 Tool Outputs
     
     For each tool, log:
     - Full raw output (if ≤100 lines) or summary statistics (if >100 lines)
     - Exit code (0 = success, non-zero = failures detected)
     - Execution time (if significant)
     
     #### 3.3 Synthesis Decisions
     
     Document your reasoning for prioritization and grouping
     ```

2. **<answer> section - user-facing results**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:241-265`
   - **Excerpt:**
     ```markdown
     Use this exact structure with <thinking> and <answer> tags:
     
     <thinking>
     Tool Execution Log:
     [...]
     </thinking>
     
     <answer>
     ---
     message_id: python-qa-quick-[YYYY-MM-DD]-[random-4-digit]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: QA_RESULT
     [...]
     ---
     
     ## 🚀 Quick Python QA Results
     ```

3. **Benefits documented**:
   - **Evidence:** `.opencode/agent/typescript-qa-thorough.md:247-267`
   - **Excerpt:**
     ```markdown
     **Benefits**:
     - **Cleaner user output**: Users see only actionable findings, not process details
     - **Debugging capability**: Full reasoning trail available in `<thinking>` for troubleshooting
     - **Token optimization**: Consumers can strip `<thinking>` section when not needed (~10% savings)
     ```

**Direct consequence:** QA agents match thinking/answer pattern used by implementation-controller, task-executor, and all locator/analyzer subagents

### Architecture: Prioritization Hierarchy

**All QA agents implement consistent 4-level priority system**:

1. **opencode-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:336-343`
   - **Excerpt:**
     ```markdown
     ### Prioritization
     
     Use this hierarchy:
     1. **Critical**: Configuration errors preventing agent loading (invalid YAML, directory mismatch for skills)
     2. **High**: Tool permission misalignment, incorrect agent mode, missing required fields
     3. **Medium**: Suboptimal temperature settings, unclear delegation patterns, missing examples
     4. **Low**: Documentation improvements, naming convention preferences
     ```

2. **python-qa-quick.md and python-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:226-234` and `.opencode/agent/python-qa-thorough.md:485-491`
   - **Excerpt (quick):**
     ```markdown
     ### 5. Prioritize Issues
     
     Use this priority hierarchy:
     1. **Critical** (🔴): Security vulnerabilities from bandit
     2. **High** (🟠): Type errors from pyright that block type checking
     3. **Medium** (🟡): Quality issues from ruff (complexity, maintainability) + Missing docstrings from interrogate
     4. **Low** (🟢): Style issues from ruff (formatting, naming)
     ```
   - **Excerpt (thorough):**
     ```markdown
     Use this hierarchy:
     1. **Critical**: Security vulnerabilities (bandit HIGH/MEDIUM)
     2. **High**: Type errors blocking type checking (pyright errors)
     3. **Medium**: Testability issues, maintainability risks
     4. **Low**: Readability improvements, style consistency
     ```

3. **typescript-qa-quick.md and typescript-qa-thorough.md**:
   - **Evidence:** `.opencode/agent/typescript-qa-quick.md:231-237` and `.opencode/agent/typescript-qa-thorough.md:420-426`
   - **Excerpt (quick):**
     ```markdown
     Use this priority hierarchy:
     1. **Critical** (🔴): Security vulnerabilities from eslint-plugin-security
     2. **High** (🟠): Type errors from tsc that block compilation
     3. **Medium** (🟡): Quality issues from eslint (complexity, maintainability) + Unused code from knip
     4. **Low** (🟢): Style issues from eslint (formatting, naming) + React patterns
     ```
   - **Excerpt (thorough):**
     ```markdown
     Use this hierarchy:
     1. **Critical**: Security vulnerabilities (eslint-plugin-security HIGH/MEDIUM)
     2. **High**: Type errors blocking compilation (tsc errors)
     3. **Medium**: Testability issues, maintainability risks, dead code
     4. **Low**: Readability improvements, style consistency, React patterns
     ```

**Pattern**: All agents prioritize Security > Correctness > Maintainability > Style

### Architecture: Version Field Naming

**QA agents use specialized version field names**:

1. **opencode-qa-thorough**:
   - **Evidence:** `.opencode/agent/opencode-qa-thorough.md:223`
   - **Excerpt:**
     ```yaml
     qa_agent_version: "1.0"  # Version of opencode-qa-thorough agent
     ```

2. **python-qa-thorough**:
   - **Evidence:** `.opencode/agent/python-qa-thorough.md:372`
   - **Excerpt:**
     ```yaml
     qa_agent_version: "1.0"
     ```

3. **Quick agents do not specify version field in frontmatter**:
   - **Evidence:** `.opencode/agent/python-qa-quick.md:269-278` and `.opencode/agent/typescript-qa-quick.md:276-286`
   - **Excerpt (python):**
     ```yaml
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
     ```
   - **Note:** No version field present

**Observation:** Quick agents omit version field, Thorough agents use `qa_agent_version`

## Verification Log

**Verified files** (all QA agents read in full):
- `.opencode/agent/opencode-qa-thorough.md` (568 lines)
- `.opencode/agent/python-qa-quick.md` (542 lines)
- `.opencode/agent/python-qa-thorough.md` (626 lines)
- `.opencode/agent/typescript-qa-quick.md` (593 lines)
- `.opencode/agent/typescript-qa-thorough.md` (684 lines)

**Total lines analyzed:** 3,013 lines

**Spot-checked excerpts captured:** yes (all findings include file:line evidence and 1-6 line excerpts)

## Open Questions / Unverified Claims

1. **Message type naming consistency**:
   - Observed: opencode/typescript use `QA_REPORT`, python uses `QA_ANALYSIS_REPORT`
   - Question: Should thorough agents standardize on single message type name?

2. **Version field presence**:
   - Observed: Quick agents omit version field, Thorough agents include `qa_agent_version`
   - Question: Should Quick agents also include version for consistency?

3. **Tool output verbosity strategy**:
   - Observed: python-qa-thorough.md implements verbosity strategy (lines 222-243), typescript-qa-thorough.md does not
   - Question: Should all thorough agents document verbosity handling for large tool outputs?

4. **Correlation with qa-planner.md**:
   - Noted in 2026-01-27-Agent-System-Analysis.md that qa-planner.md exists but not analyzed
   - Question: How do QA agents integrate with qa-planner workflow? Does qa-planner consume QA_REPORT messages?

5. **Skill loading**:
   - opencode-qa-thorough.md loads `opencode` skill (line 84), other QA agents do not
   - Question: Should Python/TypeScript thorough agents load domain-specific skills for best practices validation?

## References

**Codebase Citations** (all verified via read):
- `.opencode/agent/opencode-qa-thorough.md:5-21` (tool constraints)
- `.opencode/agent/opencode-qa-thorough.md:88-104` (automated tools)
- `.opencode/agent/opencode-qa-thorough.md:112-116` (evidence requirement)
- `.opencode/agent/opencode-qa-thorough.md:217-230` (YAML frontmatter)
- `.opencode/agent/opencode-qa-thorough.md:327-334` (evidence enforcement)
- `.opencode/agent/opencode-qa-thorough.md:336-343` (prioritization)
- `.opencode/agent/python-qa-quick.md:5-20` (tool constraints)
- `.opencode/agent/python-qa-quick.md:27-32` (architectural positioning)
- `.opencode/agent/python-qa-quick.md:34-44` (when to use quick vs thorough)
- `.opencode/agent/python-qa-quick.md:107-156` (delegation to codebase-locator)
- `.opencode/agent/python-qa-quick.md:117-128` (automated tools)
- `.opencode/agent/python-qa-quick.md:130-217` (thinking section documentation)
- `.opencode/agent/python-qa-quick.md:226-234` (prioritization)
- `.opencode/agent/python-qa-quick.md:241-278` (output format)
- `.opencode/agent/python-qa-quick.md:269-278` (YAML frontmatter - quick)
- `.opencode/agent/python-qa-thorough.md:8` (write permission)
- `.opencode/agent/python-qa-thorough.md:42-52` (automated tools)
- `.opencode/agent/python-qa-thorough.md:56` (evidence requirement)
- `.opencode/agent/python-qa-thorough.md:107-156` (tests_only scope delegation)
- `.opencode/agent/python-qa-thorough.md:162-182` (execution_only depth delegation)
- `.opencode/agent/python-qa-thorough.md:183-204` (pattern-finder delegation)
- `.opencode/agent/python-qa-thorough.md:249-253` (plan generation)
- `.opencode/agent/python-qa-thorough.md:365-382` (YAML frontmatter - thorough)
- `.opencode/agent/python-qa-thorough.md:477-483` (evidence enforcement)
- `.opencode/agent/python-qa-thorough.md:485-491` (prioritization)
- `.opencode/agent/typescript-qa-quick.md:97-114` (automated tools)
- `.opencode/agent/typescript-qa-quick.md:231-237` (prioritization)
- `.opencode/agent/typescript-qa-quick.md:276-286` (YAML frontmatter)
- `.opencode/agent/typescript-qa-thorough.md:5-20` (tool constraints)
- `.opencode/agent/typescript-qa-thorough.md:42-57` (automated tools)
- `.opencode/agent/typescript-qa-thorough.md:60` (evidence requirement)
- `.opencode/agent/typescript-qa-thorough.md:247-267` (thinking/answer benefits)
- `.opencode/agent/typescript-qa-thorough.md:289` (message type)
- `.opencode/agent/typescript-qa-thorough.md:412-418` (evidence enforcement)
- `.opencode/agent/typescript-qa-thorough.md:420-426` (prioritization)
