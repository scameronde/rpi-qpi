# QA System Improvements Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-27-QA-Agent-Analysis.md`
- User request: "Create a plan for all 4 points" (message type standardization, TypeScript QA-planner support, verbosity handling, section name requirements)
- Analysis conversation: Analysis of QA agent system architecture and qa-planner integration

## Verified Current State

### Finding 1: Message Type Naming Inconsistency

- **Fact:** Python thorough QA agent uses `message_type: QA_ANALYSIS_REPORT` while OpenCode and TypeScript thorough agents use `message_type: QA_REPORT`
- **Evidence:** `.opencode/agent/python-qa-thorough.md:370`, `.opencode/agent/opencode-qa-thorough.md:222`, `.opencode/agent/typescript-qa-thorough.md:289`
- **Excerpt (python-qa-thorough.md:370):**
  ```yaml
  message_type: QA_ANALYSIS_REPORT
  ```
- **Excerpt (opencode-qa-thorough.md:222):**
  ```yaml
  message_type: QA_REPORT  # Fixed value for QA analysis reports
  ```
- **Excerpt (typescript-qa-thorough.md:289):**
  ```yaml
  message_type: QA_REPORT
  ```

### Finding 2: QA-Planner is Python-Specific

- **Fact:** qa-planner.md only generates Python verification commands and assumes Python tooling
- **Evidence:** `.opencode/agent/qa-planner.md:156`, `.opencode/agent/qa-planner.md:387-392`, `.opencode/agent/qa-planner.md:220`
- **Excerpt (lines 387-392 - verification commands):**
  ```bash
  ruff check [target]
  pyright [target]
  bandit -r [target]
  pytest [target] --cov=[target]
  ```
- **Excerpt (line 220 - assumed language):**
  ```markdown
  - Auditor: python-qa-thorough
  ```

### Finding 3: Python QA Has Verbosity Strategy, TypeScript Lacks It

- **Fact:** python-qa-thorough.md documents tool output verbosity strategy (lines 222-243) for handling large tool outputs, but typescript-qa-thorough.md has no equivalent documentation
- **Evidence:** `.opencode/agent/python-qa-thorough.md:222-243`, `.opencode/agent/typescript-qa-thorough.md:247-250` (Phase 4.5 section lacks verbosity strategy)
- **Excerpt (python-qa-thorough.md:222-243):**
  ```markdown
  #### Tool Output Verbosity Strategy
  
  When documenting automated tool execution in the <thinking> section:
  
  - **If tool produces ≤10 issues**: Include all in thinking summary
  - **If tool produces 11-50 issues**: Include first 10 + count ('... and 15 more similar issues')
  - **If tool produces >50 issues**: Include first 5 + category breakdown + count
  
  **Example** (pyright with 150 errors):
  ```
  Pyright: 150 errors detected
  - First 5 errors:
    1. src/auth.py:42 - Missing return type annotation
    [...]
  - Category breakdown:
    - Missing type annotations: 89 errors
    - Type mismatches: 37 errors
    - Import errors: 24 errors
  ```
  ```

### Finding 4: QA Report Section Names Expected by qa-planner

- **Fact:** qa-planner expects specific section names when parsing QA reports
- **Evidence:** `.opencode/agent/qa-planner.md:80-84`
- **Excerpt:**
  ```markdown
  2. **Read QA Report**
     - Extract "Scan Metadata" section
     - Extract "Executive Summary" section
     - Extract "Improvement Plan (For Implementor)" section
     - Extract "Acceptance Criteria" section
     - Extract "Implementor Checklist" section
  ```

### Finding 5: All Thorough QA Agents Already Use Correct Section Names

- **Fact:** All three thorough QA agents (python, typescript, opencode) already include the exact section names expected by qa-planner
- **Evidence:** `.opencode/agent/python-qa-thorough.md:386-463`, `.opencode/agent/typescript-qa-thorough.md:300-399`, `.opencode/agent/opencode-qa-thorough.md:234-314`
- **Excerpt (python-qa-thorough.md structure):**
  ```markdown
  ## Scan Metadata
  [...]
  ## Executive Summary
  [...]
  ## Improvement Plan (For Implementor)
  [...]
  ## Acceptance Criteria
  [...]
  ## Implementor Checklist
  [...]
  ```

### Finding 6: qa-planner Uses Section-Based Parsing, Not Message Type

- **Fact:** qa-planner reads QA reports structurally by markdown section headings, does not parse YAML frontmatter message_type field
- **Evidence:** `.opencode/agent/qa-planner.md:80-84` (no mention of frontmatter parsing)
- **Excerpt:**
  ```markdown
  2. **Read QA Report**
     - Extract "Scan Metadata" section
     - Extract "Executive Summary" section
     - Extract "Improvement Plan (For Implementor)" section
     - Extract "Acceptance Criteria" section
     - Extract "Implementor Checklist" section
  ```

## Goals / Non-Goals

### Goals
1. Standardize message type naming across all thorough QA agents for consistency
2. Enable qa-planner to handle TypeScript QA reports (either via language detection or TypeScript-specific variant)
3. Add verbosity handling documentation to typescript-qa-thorough.md to prevent output bloat
4. ~~Add section name requirements~~ (CANCELLED - verified agents already use correct names)

### Non-Goals
- Adding version fields to quick QA agents (no demonstrated need)
- Creating domain-specific skills (no skills exist yet)
- Modifying qa-planner's section-based parsing approach (working as designed)
- Breaking changes to existing QA report formats

## Design Overview

### Approach 1: Message Type Standardization
- Single-line change in python-qa-thorough.md
- Change `QA_ANALYSIS_REPORT` → `QA_REPORT` to match other agents
- Low risk (qa-planner doesn't parse this field)

### Approach 2: TypeScript QA-Planner Support (Language-Agnostic Strategy)
- Modify qa-planner.md to detect source language from QA report metadata
- Add conditional logic for verification command generation:
  - If `qa_agent: python-qa-thorough` → use ruff/pyright/bandit/pytest
  - If `qa_agent: typescript-qa-thorough` → use tsc/eslint/knip/jest
  - If `qa_agent: opencode-qa-thorough` → use yamllint/markdownlint
- Update plan template to use language-appropriate code blocks and commands

### Approach 3: Verbosity Handling Documentation
- Copy verbosity strategy section from python-qa-thorough.md
- Adapt examples for TypeScript tools (tsc, eslint, knip)
- Insert into typescript-qa-thorough.md after delegation sections, before Phase 4.5

## Implementation Instructions (For Implementor)

### Phase 1: Low-Risk Cosmetic Fix

#### PLAN-001: Standardize Message Type in python-qa-thorough.md
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `.opencode/agent/python-qa-thorough.md`
- **Instruction:** 
  1. Locate line 370 containing `message_type: QA_ANALYSIS_REPORT`
  2. Change to `message_type: QA_REPORT`
  3. Update the comment on that line to match opencode-qa-thorough.md style: `# Fixed value for QA analysis reports`
- **Evidence:** `.opencode/agent/python-qa-thorough.md:370` currently shows `message_type: QA_ANALYSIS_REPORT`
- **Done When:** Line 370 reads `message_type: QA_REPORT  # Fixed value for QA analysis reports` and matches the format used in opencode-qa-thorough.md:222
- **Complexity:** simple

### Phase 2: Documentation Enhancement

#### PLAN-002: Add Verbosity Handling Strategy to typescript-qa-thorough.md
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `.opencode/agent/typescript-qa-thorough.md`
- **Instruction:**
  1. Locate the section before "Phase 4.5: Separate Reasoning from User-Facing Output" (around line 247)
  2. Insert a new subsection "Tool Output Verbosity Strategy" modeled after python-qa-thorough.md:222-243
  3. Adapt the strategy for TypeScript tools:
     - Replace pyright example with tsc example (150 type errors)
     - Replace Python-specific error categories with TypeScript categories:
       - "Missing type annotations" → "Implicit any types"
       - "Type mismatches" → "Type incompatibilities"
       - "Import errors" → "Module resolution errors"
  4. Use the same thresholds: ≤10 issues (all), 11-50 issues (first 10 + count), >50 issues (first 5 + breakdown)
- **Pseudocode:**
  ```markdown
  #### Tool Output Verbosity Strategy
  
  When documenting automated tool execution in the <thinking> section:
  
  - **If tool produces ≤10 issues**: Include all in thinking summary
  - **If tool produces 11-50 issues**: Include first 10 + count ('... and 15 more similar issues')
  - **If tool produces >50 issues**: Include first 5 + category breakdown + count
  
  **Example** (tsc with 150 errors):
  ```
  TypeScript Compiler: 150 errors detected
  - First 5 errors:
    1. src/auth.ts:42 - Parameter 'user' implicitly has an 'any' type
    2. src/auth.ts:58 - Argument of type 'string' is not assignable to parameter of type 'number'
    3. src/db.ts:12 - Cannot find module 'pg' or its corresponding type declarations
    4. src/db.ts:89 - Type 'null' is not assignable to type 'string'
    5. src/utils.ts:5 - Module '"lodash"' has no exported member 'debounce'
  - Category breakdown:
    - Implicit any types: 89 errors
    - Type incompatibilities: 37 errors
    - Module resolution errors: 24 errors
  ```
  ```
- **Evidence:** `.opencode/agent/python-qa-thorough.md:222-243` provides the source template to adapt
- **Done When:** typescript-qa-thorough.md contains a "Tool Output Verbosity Strategy" subsection with TypeScript-specific examples before the "Phase 4.5" section
- **Complexity:** simple

### Phase 3: Language-Agnostic QA-Planner

#### PLAN-003: Add Language Detection to qa-planner.md
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `.opencode/agent/qa-planner.md`
- **Instruction:**
  1. In "Phase 1: Locate and Ingest QA Report", after step 2 "Read QA Report", add step 2.1:
     ```markdown
     2.1. **Detect Source Language**
        - Read the "Scan Metadata" section
        - Extract "Auditor" field value
        - Map to language:
          - `python-qa-thorough` → Python
          - `typescript-qa-thorough` → TypeScript
          - `opencode-qa-thorough` → OpenCode (YAML/Markdown)
        - Store language identifier for use in verification command generation
     ```
  2. Update line 93-95 to reference language-specific tools:
     ```markdown
     - QA "Auditor" → Plan "Language" and "Verification Tools"
     ```
  3. Update "Inputs Section" template (lines 100-105) to include language:
     ```markdown
     ## Inputs
     - QA report: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
     - Audit date: YYYY-MM-DD
     - Language: [Python | TypeScript | OpenCode]
     - Automated tools: [list from QA report]
     ```
- **Evidence:** `.opencode/agent/qa-planner.md:92-95` currently only maps "Tools" without language context
- **Done When:** qa-planner.md Phase 1 includes language detection step and Inputs section template includes Language field
- **Complexity:** simple

#### PLAN-004: Add Conditional Verification Commands to qa-planner.md
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `.opencode/agent/qa-planner.md`
- **Instruction:**
  1. Replace the "Verification Commands Section" (lines 149-158) with conditional logic:
     ```markdown
     **g. Verification Commands Section**
     - Extract from QA report "Tools" field
     - Generate language-specific baseline commands based on detected language:
     
     **For Python**:
     ```markdown
     ## Baseline Verification
     - `ruff check [target]` - Should pass after Phase 1
     - `pyright [target]` - Should pass after Phase 2
     - `bandit -r [target]` - Should pass after Phase 1
     - `pytest [target] --cov=[target]` - Should pass after Phase 2
     ```
     
     **For TypeScript**:
     ```markdown
     ## Baseline Verification
     - `npx tsc --noEmit` - Should pass after Phase 1
     - `npx eslint . --ext .ts,.tsx` - Should pass after Phase 2
     - `npx knip` - Should pass after Phase 3
     - `npm test -- --coverage` - Should pass after Phase 2
     ```
     
     **For OpenCode**:
     ```markdown
     ## Baseline Verification
     - `yamllint -f parsable [target]` - Should pass after Phase 1
     - `markdownlint [target]` - Should pass after Phase 2
     - Manual review of agent/skill structure - Should pass after all phases
     ```
     ```
  2. Update the plan template section (lines 211-419) to use `[language-specific-tool]` placeholders with examples:
     - Line 308-311: Update Phase 1 Verification to show both Python and TypeScript examples
     - Line 331-335: Update Phase 2 Verification to show both Python and TypeScript examples
     - Line 356-358: Update Phase 3 Verification to show both Python and TypeScript examples
     - Line 379-381: Update Phase 4 Verification to show both Python and TypeScript examples
     - Lines 387-392: Update Baseline Verification to include all three languages
- **Evidence:** `.opencode/agent/qa-planner.md:156` hardcodes `pytest [target]` which is Python-specific
- **Done When:** 
  1. Verification Commands Section includes conditional logic for all three languages
  2. Plan template shows language-specific verification commands
  3. All verification command references use conditional language detection
- **Complexity:** complex

#### PLAN-005: Update qa-planner.md Plan Template Code Block Language Tags
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `.opencode/agent/qa-planner.md`
- **Instruction:**
  1. Update the plan template section to use conditional code block language tags
  2. In "Verified Current State" sections (lines 224-267), replace hardcoded `python` language tags with language-aware placeholders:
     ```markdown
     - **Excerpt:**
       ```[detected-language]
       [Code excerpt from QA report]
       ```
     ```
  3. In "Phased Implementation" sections (lines 289-381), replace hardcoded `python` language tags with conditional tags
  4. Add note at top of template (after line 213):
     ```markdown
     **Note**: Replace `[detected-language]` with actual language from QA report (python, typescript, yaml, or markdown)
     ```
- **Evidence:** `.opencode/agent/qa-planner.md:229-230` shows hardcoded `python` language tag
- **Done When:** All code block language tags in the plan template use conditional language detection instead of hardcoded `python`
- **Complexity:** simple

#### PLAN-006: Update qa-planner.md STATE File Template with Language-Specific Commands
- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `.opencode/agent/qa-planner.md`
- **Instruction:**
  1. Update the STATE file template (lines 186-204) to use conditional verification commands
  2. Replace lines 193-196 (hardcoded Python commands) with language-conditional commands:
     ```markdown
     ## Quick Verification
     [For Python targets:]
     ruff check [target]
     pyright [target]
     bandit -r [target]
     pytest [target] --cov=[target]
     
     [For TypeScript targets:]
     npx tsc --noEmit
     npx eslint . --ext .ts,.tsx
     npx knip
     npm test -- --coverage
     
     [For OpenCode targets:]
     yamllint -f parsable [target]
     markdownlint [target]
     ```
  3. Add instruction in Phase 3 (line 183-204) to select appropriate verification commands based on detected language
- **Evidence:** `.opencode/agent/qa-planner.md:193-196` shows hardcoded Python verification commands
- **Done When:** STATE file generation logic selects verification commands based on detected language from QA report
- **Complexity:** simple

## Verification Tasks

### Assumption Check 1: No Existing TypeScript QA Reports
- **Assumption:** There are no existing TypeScript QA reports that would break if we modify qa-planner
- **Verification Step:** Run `find thoughts/shared/qa -name "*.md" -exec grep -l "typescript-qa-thorough" {} \;`
- **Pass Condition:** No files found OR user confirms breaking changes acceptable

### Assumption Check 2: Quick QA Agents Don't Need Changes
- **Assumption:** Quick QA agents (python-qa-quick, typescript-qa-quick) don't produce reports for qa-planner, so message type changes don't affect them
- **Verification Step:** Read `.opencode/agent/python-qa-quick.md` and `.opencode/agent/typescript-qa-quick.md` to confirm they don't write files to `thoughts/shared/qa/`
- **Pass Condition:** Both agents have `write: false` in tool permissions (already verified in research report)

## Acceptance Criteria

- [ ] All three thorough QA agents use `message_type: QA_REPORT` (standardized)
- [ ] typescript-qa-thorough.md includes verbosity handling strategy with TypeScript-specific examples
- [ ] qa-planner.md detects source language from QA report Auditor field
- [ ] qa-planner.md generates Python verification commands for python-qa-thorough reports
- [ ] qa-planner.md generates TypeScript verification commands for typescript-qa-thorough reports
- [ ] qa-planner.md generates OpenCode verification commands for opencode-qa-thorough reports
- [ ] qa-planner.md plan template uses language-appropriate code block tags
- [ ] qa-planner.md STATE file template uses language-specific verification commands
- [ ] No existing QA workflow functionality is broken

## Implementor Checklist

### Phase 1: Low-Risk Cosmetic Fix
- [ ] PLAN-001: Standardize message type in python-qa-thorough.md

### Phase 2: Documentation Enhancement
- [ ] PLAN-002: Add verbosity handling strategy to typescript-qa-thorough.md

### Phase 3: Language-Agnostic QA-Planner
- [ ] PLAN-003: Add language detection to qa-planner.md
- [ ] PLAN-004: Add conditional verification commands to qa-planner.md
- [ ] PLAN-005: Update plan template code block language tags
- [ ] PLAN-006: Update STATE file template with language-specific commands
