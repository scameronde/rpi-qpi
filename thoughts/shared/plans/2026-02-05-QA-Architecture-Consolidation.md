# QA Architecture Consolidation Implementation Plan

## Inputs
- Research report used: `thoughts/shared/research/2026-02-05-QA-Architecture-Consolidation.md`
- User request summary: Consolidate QA architecture from 6 specialized agents (~3,582 lines) into skills-based approach using extended Researcher/Planner agents

## Verified Current State

### Fact 1: Six QA Agents Exist with Significant Code Duplication
- **Evidence:** `agent/python-qa-thorough.md:1`, `agent/python-qa-quick.md:1`, `agent/typescript-qa-thorough.md:1`, `agent/typescript-qa-quick.md:1`, `agent/opencode-qa-thorough.md:1`, `agent/qa-planner.md:1`
- **Excerpt:** Files verified via bash:
  ```
  -rw-r--r-- 1 eichens eichens 21418 Jan 28 07:41 python-qa-thorough.md
  -rw-r--r-- 1 eichens eichens 17349 Jan 21 11:09 python-qa-quick.md
  -rw-r--r-- 1 eichens eichens 24819 Jan 28 07:43 typescript-qa-thorough.md
  -rw-r--r-- 1 eichens eichens 19712 Jan 21 13:15 typescript-qa-quick.md
  -rw-r--r-- 1 eichens eichens 20877 Jan 21 10:42 opencode-qa-thorough.md
  -rw-r--r-- 1 eichens eichens 17571 Jan 28 09:43 qa-planner.md
  Total: 3,582 lines
  ```

### Fact 2: Tool Commands Hardcoded in QA Agents
- **Evidence:** `agent/python-qa-thorough.md:44-49`
- **Excerpt:**
  ```markdown
  1. Execute ruff, pyright, bandit, interrogate in parallel using bash tool:
     ```bash
     ruff check [target]
     pyright [target]
     bandit -r [target]
     interrogate --fail-under 80 -vv --omit-covered-files [...]
     ```
  ```

### Fact 3: Prioritization Logic Duplicated Across Agents
- **Evidence:** `agent/python-qa-thorough.md:486-491`
- **Excerpt:**
  ```markdown
  Use this hierarchy:
  1. **Critical**: Security vulnerabilities (bandit HIGH/MEDIUM)
  2. **High**: Type errors blocking type checking (pyright errors)
  3. **Medium**: Testability issues, maintainability risks
  4. **Low**: Readability improvements, style consistency
  ```

### Fact 4: Researcher Already Has Required Capabilities
- **Evidence:** `agent/researcher.md:6-20`
- **Excerpt:**
  ```yaml
  tools:
    bash: true
    read: true
    write: true
    glob: false # use Sub-Agent 'codebase-locator' instead
    grep: false # use Sub-Agent 'codebase-pattern-finder' instead
  ```

### Fact 5: Skills Pattern Exists with YAML Frontmatter
- **Evidence:** `skills/opencode/SKILL.md:1-11`
- **Excerpt:**
  ```yaml
  ---
  name: opencode
  description: Comprehensive reference for OpenCode Skills and Agents
  license: MIT
  allowed-tools:
    - read
  metadata:
    version: "1.0"
    author: "OpenCode Development Team"
    last-updated: "2026-01-17"
  ---
  ```

### Fact 6: Planner Reads Reports from thoughts/shared/research/
- **Evidence:** `agent/planner.md:389-395`
- **Excerpt:**
  ```markdown
  ### Phase 1: Context & Ingestion (MANDATORY)
  1. Read the user request.
  2. `list` + `read` the latest relevant Researcher report(s).
  3. Create:
     - **Verified Facts & Constraints** (only items with Evidence)
     - **Open Questions** (items missing evidence)
  ```

## Goals / Non-Goals

**Goals:**
1. Extract language-specific QA knowledge (tools, prioritization, templates) into 3 Skills: python-qa, typescript-qa, opencode-qa
2. Extend Researcher agent to support QA mode (detect QA requests, load appropriate skill, write to thoughts/shared/qa/)
3. Extend Planner agent to detect QA reports and apply QA-specific planning template
4. Deprecate 6 specialized QA agents (python-qa-thorough, python-qa-quick, typescript-qa-thorough, typescript-qa-quick, opencode-qa-thorough, qa-planner)
5. Reduce maintenance burden from ~3,582 lines to ~600 lines of skill definitions + minimal agent extensions

**Non-Goals:**
1. Change QA analysis methodology or quality standards
2. Modify thoughts/shared/qa/ report structure (maintain backward compatibility)
3. Change Implementation-Controller or Task-Executor workflow
4. Re-implement existing QA tool commands (extract as-is into skills)

## Design Overview

### Architecture Change: From Specialized Agents to Skills-Based

**Current:**
```
User → python-qa-thorough → thoughts/shared/qa/ → qa-planner → thoughts/shared/plans/
      → python-qa-quick → inline output
      → typescript-qa-thorough → thoughts/shared/qa/ → qa-planner → thoughts/shared/plans/
      → typescript-qa-quick → inline output
      → opencode-qa-thorough → thoughts/shared/qa/ → qa-planner → thoughts/shared/plans/
```

**Target:**
```
User → researcher (QA mode) → load python-qa skill → thoughts/shared/qa/ → planner (QA detection) → thoughts/shared/plans/
                            → load typescript-qa skill → thoughts/shared/qa/ → planner (QA detection) → thoughts/shared/plans/
                            → load opencode-qa skill → thoughts/shared/qa/ → planner (QA detection) → thoughts/shared/plans/
```

### Data Flow

1. **User invokes Researcher with QA intent**: "Analyze code quality for src/auth/login.py"
2. **Researcher detects QA mode**: Keywords (QA, quality, analysis) or target is source code file
3. **Researcher loads appropriate skill**: File extension → skill mapping (.py → python-qa, .ts/.tsx → typescript-qa, agent/*.md → opencode-qa)
4. **Skill provides**:
   - Tool command templates (bash commands with [target] placeholder)
   - Prioritization rules (tool output → Critical/High/Medium/Low mapping)
   - Report template (YAML frontmatter + thinking/answer structure)
5. **Researcher executes QA workflow**:
   - Phase 1: Target discovery (codebase-locator if needed)
   - Phase 2: Tool execution (bash with commands from skill)
   - Phase 3: Manual analysis (read files, delegate to codebase-analyzer/pattern-finder)
   - Phase 4: Synthesis (apply prioritization rules from skill, generate report)
6. **Researcher writes to thoughts/shared/qa/**: YYYY-MM-DD-[Target].md with message_type: QA_REPORT
7. **User invokes Planner**: "Create plan from latest QA report"
8. **Planner detects QA input**: Path starts with thoughts/shared/qa/ OR message_type: QA_REPORT
9. **Planner loads appropriate skill**: Extract "Auditor" field → map to language → load skill
10. **Skill provides verification commands**: Language-specific baseline verification
11. **Planner applies QA template**: QA-XXX → PLAN-XXX mapping, Phase 1-4 structure

### Skill Structure (Template)

Each skill (python-qa, typescript-qa, opencode-qa) will contain:

**YAML Frontmatter:**
- `name`: Skill directory name (kebab-case)
- `description`: One-sentence summary
- `license`: MIT
- `allowed-tools`: [bash, read] (QA needs tool execution and file reading)
- `metadata`: version, author, last-updated

**Markdown Content:**
- Section 1: Tool Commands (with [target] placeholder)
- Section 2: Prioritization Rules (tool output patterns → priority levels)
- Section 3: Report Template (YAML frontmatter structure + thinking/answer sections)
- Section 4: Verification Commands (for Planner to use in implementation plans)

## Implementation Instructions (For Implementor)

### Phase 1: Create QA Skills

- **Action ID:** PLAN-001
- **Change Type:** create
- **File(s):** `skills/python-qa/SKILL.md`
- **Instruction:** 
  1. Create directory `skills/python-qa/`
  2. Create `skills/python-qa/SKILL.md` with YAML frontmatter:
     - `name: python-qa`
     - `description: "Python code quality analysis tools, prioritization rules, and report templates for QA workflow"`
     - `license: MIT`
     - `allowed-tools: [bash, read]`
     - `metadata.version: "1.0"`
     - `metadata.author: "OpenCode Development Team"`
     - `metadata.last-updated: "2026-02-05"`
  3. Add Markdown sections extracted from `agent/python-qa-thorough.md`:
     - **Section 1 - Tool Commands** (extract from lines 44-49):
       ```markdown
       ## QA Tool Commands
       
       Execute in parallel using bash tool:
       
       ```bash
       ruff check [target]
       pyright [target]
       bandit -r [target]
       interrogate --fail-under 80 -vv --omit-covered-files --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
       ```
       
       **Tool Availability Check:**
       - If tool not found, note in report "Tools unavailable" section and skip that tool
       - Capture version numbers: `ruff --version`, `pyright --version`, `bandit --version`, `interrogate --version`
       ```
     - **Section 2 - Prioritization Rules** (extract from lines 486-491):
       ```markdown
       ## Prioritization Hierarchy
       
       Use this hierarchy when categorizing findings:
       
       1. **Critical**: Security vulnerabilities (bandit HIGH/MEDIUM severity)
       2. **High**: Type errors blocking type checking (pyright errors)
       3. **Medium**: Testability issues, maintainability risks (ruff complexity rules C901+, interrogate coverage gaps)
       4. **Low**: Readability improvements, style consistency (ruff style rules E501, N806)
       ```
     - **Section 3 - Report Template** (extract from lines 243-410):
       Include YAML frontmatter structure with message_type: QA_REPORT, qa_agent field, and thinking/answer sections
     - **Section 4 - Verification Commands** (extract from qa-planner.md:176-183):
       ```markdown
       ## Baseline Verification Commands
       
       For Planner to include in implementation plans:
       
       ```bash
       ruff check [target]  # Should pass after Phase 1
       pyright [target]  # Should pass after Phase 2
       bandit -r [target]  # Should pass after Phase 1
       pytest [target] --cov=[target]  # Should pass after Phase 2
       ```
       ```
- **Evidence:** `agent/python-qa-thorough.md:44-49` (tool commands), `agent/python-qa-thorough.md:486-491` (prioritization), `agent/qa-planner.md:176-183` (verification commands)
- **Done When:** 
  - File `skills/python-qa/SKILL.md` exists with valid YAML frontmatter
  - All 4 sections present with extracted content from python-qa-thorough agent
  - File structure matches `skills/opencode/SKILL.md` pattern

---

- **Action ID:** PLAN-002
- **Change Type:** create
- **File(s):** `skills/typescript-qa/SKILL.md`
- **Instruction:**
  1. Create directory `skills/typescript-qa/`
  2. Create `skills/typescript-qa/SKILL.md` with YAML frontmatter (same structure as PLAN-001)
  3. Add Markdown sections extracted from `agent/typescript-qa-thorough.md`:
     - **Section 1 - Tool Commands** (extract from lines 44-56):
       ```markdown
       ## QA Tool Commands
       
       Execute in parallel using bash tool:
       
       ```bash
       npx tsc --noEmit --pretty false
       npx eslint . --ext .ts,.tsx --format json
       npx knip --reporter json
       ```
       
       **Optional Tools** (if detected in package.json):
       ```bash
       npx eslint . --ext .ts,.tsx --plugin security --format json
       npx eslint . --ext .ts,.tsx --plugin jsdoc --format json
       ```
       
       **Tool Availability Check:**
       - Check package.json for eslint-plugin-security and eslint-plugin-jsdoc
       - Capture version numbers from package.json or --version commands
       ```
     - **Section 2 - Prioritization Rules** (extract from lines 444-449):
       ```markdown
       ## Prioritization Hierarchy
       
       1. **Critical**: Security vulnerabilities (eslint-plugin-security HIGH/MEDIUM)
       2. **High**: Type errors blocking compilation (tsc errors)
       3. **Medium**: Testability issues, maintainability risks, dead code (eslint complexity, knip findings)
       4. **Low**: Readability improvements, style consistency, React patterns
       ```
     - **Section 3 - Report Template**: Same structure as python-qa but with TypeScript-specific fields
     - **Section 4 - Verification Commands** (extract from qa-planner.md:186-192):
       ```markdown
       ## Baseline Verification Commands
       
       ```bash
       npx tsc --noEmit  # Should pass after Phase 1
       npx eslint . --ext .ts,.tsx  # Should pass after Phase 2
       npx knip  # Should pass after Phase 3
       npm test -- --coverage  # Should pass after Phase 2
       ```
       ```
- **Evidence:** `agent/typescript-qa-thorough.md:44-56` (tool commands), `agent/typescript-qa-thorough.md:444-449` (prioritization), `agent/qa-planner.md:186-192` (verification commands)
- **Done When:**
  - File `skills/typescript-qa/SKILL.md` exists with valid YAML frontmatter
  - All 4 sections present with extracted TypeScript-specific content
  - Optional tool detection logic documented

---

- **Action ID:** PLAN-003
- **Change Type:** create
- **File(s):** `skills/opencode-qa/SKILL.md`
- **Instruction:**
  1. Create directory `skills/opencode-qa/`
  2. Create `skills/opencode-qa/SKILL.md` with YAML frontmatter (same structure as PLAN-001)
  3. Add Markdown sections extracted from `agent/opencode-qa-thorough.md`:
     - **Section 1 - Tool Commands** (extract from lines 90-101):
       ```markdown
       ## QA Tool Commands
       
       Execute in parallel using bash tool:
       
       ```bash
       # YAML validation for frontmatter
       yamllint -f parsable [target]
       
       # Markdown linting
       markdownlint [target]
       ```
       
       **Custom Validation Checks:**
       - For skills: Extract `name:` field from YAML frontmatter, compare to directory name
       - Validate kebab-case pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
       - For agents: Validate required frontmatter fields (description, mode, temperature, tools)
       ```
     - **Section 2 - Prioritization Rules** (extract from lines 337-343):
       ```markdown
       ## Prioritization Hierarchy
       
       1. **Critical**: Configuration errors preventing agent loading (invalid YAML, directory mismatch for skills)
       2. **High**: Tool permission misalignment, incorrect agent mode, missing required fields
       3. **Medium**: Suboptimal temperature settings, unclear delegation patterns, missing examples
       4. **Low**: Documentation improvements, naming convention preferences
       ```
     - **Section 3 - Report Template**: OpenCode-specific with agent/skill metadata fields
     - **Section 4 - Verification Commands**: yamllint and markdownlint commands
- **Evidence:** `agent/opencode-qa-thorough.md:90-101` (tool commands), `agent/opencode-qa-thorough.md:337-343` (prioritization), `agent/opencode-qa-thorough.md:82-85` (skill loading)
- **Done When:**
  - File `skills/opencode-qa/SKILL.md` exists with valid YAML frontmatter
  - Custom validation logic documented
  - All 4 sections present

### Phase 2: Extend Researcher Agent for QA Mode

- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:**
  1. Add new section after "## Tools & Delegation (STRICT)" (around line 82):
     ```markdown
     ## QA Mode Detection and Workflow
     
     **Trigger Conditions** (any of these activate QA mode):
     - User request contains keywords: "QA", "quality analysis", "code quality", "code review"
     - User request specifies target as source code file(s) with quality intent
     - User explicitly requests skill loading: "Use python-qa skill"
     
     **QA Mode Workflow:**
     
     1. **Detect Language/Target:**
        - Extract target file path(s) from user request
        - Map file extension to skill:
          - `.py` → `python-qa`
          - `.ts`, `.tsx` → `typescript-qa`
          - `agent/*.md`, `skills/*/SKILL.md` → `opencode-qa`
        - If target not specified, ask user for clarification
     
     2. **Load Appropriate Skill:**
        ```
        skill({ name: "[language]-qa" })
        ```
        Extract from loaded skill:
        - Tool commands (Section 1)
        - Prioritization rules (Section 2)
        - Report template (Section 3)
     
     3. **Execute QA Workflow Phases:**
        - **Phase 1: Target Discovery** (use codebase-locator if needed)
        - **Phase 2: Automated Tool Execution** (bash with commands from skill)
        - **Phase 3: Manual Quality Analysis** (read files, delegate to codebase-analyzer/pattern-finder)
        - **Phase 4: Synthesis and Reporting** (apply prioritization rules, generate report)
     
     4. **Output Path Override:**
        - Write report to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` (NOT thoughts/shared/research/)
        - Use report template structure from loaded skill
        - Include YAML frontmatter with `message_type: QA_REPORT`
     ```
  2. Update "## Output Format (STRICT)" section (around line 629) to add conditional logic:
     ```markdown
     ## Output Format (STRICT)
     
     **Standard Mode:**
     Write exactly one report to: `thoughts/shared/research/YYYY-MM-DD-[Topic].md`
     
     **QA Mode:**
     Write exactly one report to: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
     
     Use report template structure from loaded QA skill (YAML frontmatter with message_type: QA_REPORT).
     
     Required structure for standard mode:
     [... existing structure ...]
     ```
- **Evidence:** `agent/researcher.md:629-641` (current output format to be extended), `agent/opencode-qa-thorough.md:82-85` (skill loading pattern), `thoughts/shared/research/2026-02-05-QA-Architecture-Consolidation.md:445-457` (Researcher extensions needed)
- **Done When:**
  - New "QA Mode Detection and Workflow" section added with 4-step workflow
  - "Output Format" section updated with conditional path logic
  - Skill loading pattern documented

---

- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. Add new section after "### Phase 1: Context & Ingestion (MANDATORY)" (around line 395):
     ```markdown
     ### QA Report Detection
     
     After reading input file(s) in Phase 1, check if input is a QA report:
     
     **Detection Methods:**
     1. File path starts with `thoughts/shared/qa/`
     2. YAML frontmatter contains `message_type: QA_REPORT`
     
     If QA report detected:
     
     1. **Extract Language:**
        - Read "Scan Metadata" section
        - Extract "Auditor" field value
        - Map to skill name:
          - `python-qa-thorough` → `python-qa`
          - `typescript-qa-thorough` → `typescript-qa`
          - `opencode-qa-thorough` → `opencode-qa`
     
     2. **Load QA Skill:**
        ```
        skill({ name: "[language]-qa" })
        ```
        Extract verification commands from Section 4 of loaded skill
     
     3. **Apply QA Planning Template:**
        - Use QA-XXX → PLAN-XXX mapping (extract QA-001, QA-002, etc. from report)
        - Organize into phases: Phase 1 (Critical), Phase 2 (High), Phase 3 (Medium), Phase 4 (Low)
        - Include verification commands from loaded skill in "Baseline Verification" section
        - Map priority levels to implementation phases
     ```
  2. Update "## Output Format (STRICT)" section (around line 450) to document QA plan structure:
     ```markdown
     ## Output Format (STRICT)
     
     Write TWO artifacts:
     
     ### 1. Plan File: `thoughts/shared/plans/YYYY-MM-DD-[Ticket].md`
     
     **For Standard Implementation Plans:**
     [... existing structure ...]
     
     **For QA Implementation Plans (when input is QA report):**
     
     Required structure:
     
     ```markdown
     # [Ticket] QA Implementation Plan
     
     ## Inputs
     - QA report used: `thoughts/shared/qa/...`
     - Language detected: [Python|TypeScript|OpenCode]
     - Skill loaded: [python-qa|typescript-qa|opencode-qa]
     
     ## Scan Summary
     - Critical issues: N
     - High priority issues: N
     - Medium priority issues: N
     - Low priority issues: N
     
     ## Implementation Instructions
     
     ### Phase 1: Critical Issues (Security)
     For each QA-XXX with Priority: Critical:
     - **Action ID:** PLAN-001 (mapped from QA-XXX)
     - **Change Type:** modify
     - **File(s):** [from QA report]
     - **Instruction:** [from QA report Issue Description]
     - **Evidence:** [from QA report Evidence field]
     - **Done When:** [from QA report Suggested Fix Verification]
     
     [... Phases 2-4 for High/Medium/Low ...]
     
     ## Baseline Verification
     [Insert verification commands from QA skill Section 4]
     ```
     ```
- **Evidence:** `agent/planner.md:389-395` (Phase 1 ingestion to be extended), `agent/qa-planner.md:86-93` (language detection logic to absorb), `agent/qa-planner.md:161-187` (verification command generation to absorb)
- **Done When:**
  - "QA Report Detection" section added after Phase 1
  - Language detection and skill loading documented
  - QA planning template structure added to Output Format section

### Phase 3: Update AGENTS.md Documentation

- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Add new section under "## Project Structure" (around line 25):
     ```markdown
     ### QA Skills
     - `skills/python-qa/SKILL.md` - Python code quality analysis (ruff, pyright, bandit, interrogate)
     - `skills/typescript-qa/SKILL.md` - TypeScript code quality analysis (tsc, eslint, knip)
     - `skills/opencode-qa/SKILL.md` - OpenCode agent/skill quality analysis (yamllint, markdownlint)
     ```
  2. Add new section after "## Implementation Workflow" (around line 300):
     ```markdown
     ## QA Workflow (Researcher → Planner → Implementation-Controller)
     
     ### QA Analysis (Researcher in QA Mode)
     
     1. User invokes Researcher with QA intent: "Analyze code quality for [target]"
     2. Researcher detects QA mode (keywords, file extensions, explicit skill request)
     3. Researcher loads appropriate skill (python-qa, typescript-qa, or opencode-qa)
     4. Researcher executes 4-phase workflow:
        - Phase 1: Target Discovery (codebase-locator if needed)
        - Phase 2: Automated Tool Execution (bash with commands from skill)
        - Phase 3: Manual Analysis (read files, delegate to analyzers)
        - Phase 4: Synthesis (apply prioritization rules from skill)
     5. Researcher writes to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with message_type: QA_REPORT
     
     ### QA Planning (Planner with QA Detection)
     
     1. User invokes Planner: "Create plan from latest QA report"
     2. Planner reads QA report from `thoughts/shared/qa/`
     3. Planner detects QA input (path or message_type field)
     4. Planner extracts "Auditor" field, maps to skill (python-qa-thorough → python-qa)
     5. Planner loads appropriate skill
     6. Planner extracts verification commands from skill Section 4
     7. Planner applies QA template: QA-XXX → PLAN-XXX, Priority → Phase
     8. Planner writes to `thoughts/shared/plans/YYYY-MM-DD-QA-[Target].md`
     
     ### QA Implementation (Implementation-Controller)
     
     Same workflow as standard implementation (no changes needed).
     
     ### Key Benefits
     
     - **Centralized QA Knowledge**: Tool commands, prioritization rules, templates in 3 skills (~600 lines) vs 6 agents (~3,582 lines)
     - **Reduced Duplication**: Language-specific logic maintained in one place
     - **Easier Updates**: Change tool command once in skill instead of in 6 agent files
     - **Backward Compatible**: QA reports maintain same structure, Implementation-Controller unchanged
     ```
  3. Add deprecation notice under "## Agent Guidelines for RPIQPI Project" (around line 15):
     ```markdown
     ### Deprecated Agents
     
     The following agents have been consolidated into the skills-based QA workflow:
     - ~~`agent/python-qa-thorough.md`~~ → Use `researcher` in QA mode with `python-qa` skill
     - ~~`agent/python-qa-quick.md`~~ → Use `researcher` in QA mode with `python-qa` skill (inline output)
     - ~~`agent/typescript-qa-thorough.md`~~ → Use `researcher` in QA mode with `typescript-qa` skill
     - ~~`agent/typescript-qa-quick.md`~~ → Use `researcher` in QA mode with `typescript-qa` skill (inline output)
     - ~~`agent/opencode-qa-thorough.md`~~ → Use `researcher` in QA mode with `opencode-qa` skill
     - ~~`agent/qa-planner.md`~~ → Use `planner` with QA report detection
     
     **Migration Date:** 2026-02-05
     **Rationale:** Consolidation reduces maintenance burden from ~3,582 lines to ~600 lines while maintaining QA quality standards
     ```
- **Evidence:** `AGENTS.md:1` (file exists), `thoughts/shared/research/2026-02-05-QA-Architecture-Consolidation.md:22-28` (consolidation summary)
- **Done When:**
  - QA Skills section added to Project Structure
  - QA Workflow section added with 3 subsections
  - Deprecated Agents section added with migration date

### Phase 4: Deprecate Specialized QA Agents

- **Action ID:** PLAN-007
- **Change Type:** remove
- **File(s):** 
  - `agent/python-qa-thorough.md`
  - `agent/python-qa-quick.md`
  - `agent/typescript-qa-thorough.md`
  - `agent/typescript-qa-quick.md`
  - `agent/opencode-qa-thorough.md`
  - `agent/qa-planner.md`
- **Instruction:**
  1. Move deprecated agents to archive directory:
     ```bash
     mkdir -p agent/deprecated/2026-02-05-qa-consolidation
     mv agent/python-qa-thorough.md agent/deprecated/2026-02-05-qa-consolidation/
     mv agent/python-qa-quick.md agent/deprecated/2026-02-05-qa-consolidation/
     mv agent/typescript-qa-thorough.md agent/deprecated/2026-02-05-qa-consolidation/
     mv agent/typescript-qa-quick.md agent/deprecated/2026-02-05-qa-consolidation/
     mv agent/opencode-qa-thorough.md agent/deprecated/2026-02-05-qa-consolidation/
     mv agent/qa-planner.md agent/deprecated/2026-02-05-qa-consolidation/
     ```
  2. Create README in archive directory:
     ```bash
     cat > agent/deprecated/2026-02-05-qa-consolidation/README.md << 'ARCHIVE_EOF'
     # Deprecated QA Agents (2026-02-05)
     
     These agents were consolidated into the skills-based QA workflow.
     
     **Replacement:**
     - Use `researcher` agent in QA mode with appropriate skill (python-qa, typescript-qa, opencode-qa)
     - Use `planner` agent with QA report detection (automatic)
     
     **Rationale:**
     - Reduced maintenance burden from ~3,582 lines to ~600 lines of skill definitions
     - Eliminated duplication of tool commands, prioritization logic, and report templates
     - Centralized language-specific QA knowledge in Skills
     
     **Files Archived:**
     - python-qa-thorough.md (626 lines)
     - python-qa-quick.md (542 lines)
     - typescript-qa-thorough.md (707 lines)
     - typescript-qa-quick.md (593 lines)
     - opencode-qa-thorough.md (568 lines)
     - qa-planner.md (552 lines)
     
     **See:** thoughts/shared/plans/2026-02-05-QA-Architecture-Consolidation.md
     ARCHIVE_EOF
     ```
- **Evidence:** `thoughts/shared/research/2026-02-05-QA-Architecture-Consolidation.md:22-28` (agent list and line counts verified)
- **Done When:**
  - All 6 agent files moved to `agent/deprecated/2026-02-05-qa-consolidation/`
  - README.md created in archive directory with migration documentation
  - Original agent/*.md files no longer exist in main agent/ directory

## Verification Tasks (If Assumptions Exist)

No assumptions - all claims verified with direct file reads and evidence from research report.

## Acceptance Criteria

1. **Three QA Skills Created:**
   - `skills/python-qa/SKILL.md` exists with valid YAML frontmatter and 4 sections
   - `skills/typescript-qa/SKILL.md` exists with valid YAML frontmatter and 4 sections
   - `skills/opencode-qa/SKILL.md` exists with valid YAML frontmatter and 4 sections

2. **Researcher Extended:**
   - `agent/researcher.md` contains "QA Mode Detection and Workflow" section
   - Output format section includes conditional logic for thoughts/shared/qa/ path

3. **Planner Extended:**
   - `agent/planner.md` contains "QA Report Detection" section
   - Output format section includes QA planning template structure

4. **Documentation Updated:**
   - `AGENTS.md` contains QA Skills section, QA Workflow section, and Deprecated Agents section

5. **Agents Deprecated:**
   - 6 agent files moved to `agent/deprecated/2026-02-05-qa-consolidation/`
   - Archive README.md created with migration documentation

6. **Backward Compatibility:**
   - QA report structure (message_type: QA_REPORT) maintained
   - Plan structure (PLAN-XXX tasks) maintained
   - Implementation-Controller workflow unchanged

7. **Line Count Reduction:**
   - Before: ~3,582 lines across 6 agents
   - After: ~600 lines across 3 skills + minimal extensions to researcher.md and planner.md

## Implementor Checklist

### Phase 1: Create QA Skills
- [ ] PLAN-001: Create skills/python-qa/SKILL.md with 4 sections
- [ ] PLAN-002: Create skills/typescript-qa/SKILL.md with 4 sections
- [ ] PLAN-003: Create skills/opencode-qa/SKILL.md with 4 sections

### Phase 2: Extend Researcher and Planner
- [ ] PLAN-004: Add QA mode detection to agent/researcher.md
- [ ] PLAN-005: Add QA report detection to agent/planner.md

### Phase 3: Update Documentation
- [ ] PLAN-006: Update AGENTS.md with QA workflow and deprecation notice

### Phase 4: Deprecate Agents
- [ ] PLAN-007: Move 6 QA agents to deprecated/ with README
