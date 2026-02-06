# Agent Language Agnosticism Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-02-06-Agent-Language-Agnosticism.md`
- User request: Make all agents programming language agnostic, remove OpenCode/ClaudeCode references, instruct agents to use appropriate skills without explaining HOW

## Verified Current State

### Hardcoded Language References in researcher.md

- **Fact:** researcher.md line 92 hardcodes file extension list for QA mode detection
- **Evidence:** `agent/researcher.md:92`
- **Excerpt:**
  ```markdown
  2. **Source Code Files with Quality Intent**: User provides file paths (`.py`, `.ts`, `.tsx`, `agent/*.md`, `skills/*/SKILL.md`) with quality-focused language
  ```

- **Fact:** researcher.md line 93 explicitly enumerates QA skill names
- **Evidence:** `agent/researcher.md:93`
- **Excerpt:**
  ```markdown
  3. **Explicit Skill Request**: User explicitly requests loading a QA skill (`python-qa`, `typescript-qa`, `opencode-qa`)
  ```

- **Fact:** researcher.md line 99 explains framework mechanics (HOW skills are loaded)
- **Evidence:** `agent/researcher.md:99`
- **Excerpt:**
  ```markdown
  **Note:** OpenCode automatically loads the appropriate QA skill based on file extensions and user intent. No manual skill loading is required.
  ```

- **Fact:** researcher.md line 106 lists language-specific tools in workflow example
- **Evidence:** `agent/researcher.md:106`
- **Excerpt:**
  ```markdown
  - Run tools from loaded skill (e.g., `pylint`, `pyright`, `eslint`, `tsc`)
  ```

### Hardcoded Language References in planner.md

- **Fact:** planner.md line 562 enumerates specific languages as template options
- **Evidence:** `agent/planner.md:562`
- **Excerpt:**
  ```markdown
  - Language: [Python | TypeScript | OpenCode]
  ```

- **Fact:** planner.md lines 644-665 hardcode language-specific verification command templates
- **Evidence:** `agent/planner.md:644-665`
- **Excerpt:**
  ```markdown
  **For Python:**
  ```bash
  ruff check [target]          # Should pass after Phase 1
  pyright [target]             # Should pass after Phase 2
  bandit -r [target]           # Should pass after Phase 1
  pytest [target] --cov=[target]  # Should pass after Phase 2
  ```

  **For TypeScript:**
  ```bash
  npx tsc --noEmit             # Should pass after Phase 1
  npx eslint . --ext .ts,.tsx  # Should pass after Phase 2
  npx knip                     # Should pass after Phase 3
  npm test -- --coverage       # Should pass after Phase 2
  ```

  **For OpenCode:**
  ```bash
  yamllint -f parsable [target]  # Should pass after Phase 1
  markdownlint [target]          # Should pass after Phase 2
  # Manual review of agent/skill structure
  ```
  ```

### Language Examples in Other Agents

- **Fact:** task-executor.md line 257 uses Python/TypeScript-specific naming conventions as examples
- **Evidence:** `agent/task-executor.md:257`
- **Excerpt:**
  ```markdown
     - Use language idioms (e.g., Python: `_private`, TypeScript: `#private`)
  ```

- **Fact:** web-search-researcher.md line 150 lists specific languages in auto-detection example
- **Evidence:** `agent/web-search-researcher.md:150`
- **Excerpt:**
  ```markdown
  2. **Language**: Auto-detect from code syntax (JavaScript, Python, TypeScript, etc.)
  ```

- **Fact:** mission-architect.md line 39 includes language names in forbidden terms list
- **Evidence:** `agent/mission-architect.md:39`
- **Excerpt:**
  ```markdown
     - Forbidden terms: API, database, frontend, backend, REST, GraphQL, React, Python, SQL, microservices, containers.
  ```

- **Fact:** specifier.md line 44 includes language names in forbidden terms list
- **Evidence:** `agent/specifier.md:44`
- **Excerpt:**
  ```markdown
     - Forbidden terms: React, Python, PostgreSQL, AWS, Docker, Kubernetes, REST, GraphQL (unless describing abstract interaction patterns, not implementations).
  ```

### OpenCode Framework References

- **Fact:** Total of 4 OpenCode references found across agent files
- **Evidence:** grep results across agent/*.md
- **Excerpt:**
  ```
  agent/planner.md:562:- Language: [Python | TypeScript | OpenCode]
  agent/planner.md:660:**For OpenCode:**
  agent/researcher.md:99:**Note:** OpenCode automatically loads the appropriate QA skill...
  agent/researcher.md:93:...(`python-qa`, `typescript-qa`, `opencode-qa`)
  ```

## Goals / Non-Goals

**Goals:**
1. Make all agent instructions programming language agnostic (support any language via skills)
2. Remove all references to OpenCode or ClaudeCode frameworks (framework-agnostic)
3. Instruct agents to use appropriate skills (WHAT) without explaining framework-specific automatic loading mechanics (HOW)

**Non-Goals:**
- Changing the skill loading mechanism itself (that's framework implementation)
- Removing illustrative examples that demonstrate patterns (can remain as "e.g.")
- Modifying the thoughts/ directory structure or file naming conventions
- Changing QA skill file structure or content
- Removing references to the "skill tool" (that's a legitimate agent tool, not framework-specific)

## Design Overview

The changes transform agent instructions from framework-specific, language-hardcoded documentation to generic, extensible instructions that delegate language-specific knowledge to skills.

**Key Principles:**
1. **Language Detection**: Change from "file extensions .py/.ts" → "source code files" (let framework/skill handle detection)
2. **Skill References**: Change from "python-qa, typescript-qa, opencode-qa" → "language-specific QA skill" (generic reference)
3. **Framework Mechanics**: Change from "OpenCode automatically loads" → "Use the appropriate skill" (remove framework-specific automatic loading explanation)
4. **Verification Commands**: Change from hardcoded templates → "refer to loaded skill" (delegate to skill content)
5. **Framework Name**: Remove "OpenCode" and "opencode-qa" from all agent instructions
6. **Tool References**: Keep "skill tool" references (that's a legitimate agent tool, not framework-specific)

**Impact:**
- Adding new language support (e.g., Java, Kotlin, Go) requires only creating a new skill file, not editing agent instructions
- Agents can run in any agentic framework without OpenCode-specific assumptions
- Framework implementers control HOW skills are loaded/matched via their own logic

## Implementation Instructions (For Implementor)

### Phase 1: Critical Changes (Language & Framework Agnosticism)

#### PLAN-001: Make QA trigger file extension reference generic in researcher.md
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:** 
  1. Locate line 92 in the "Trigger Conditions" section
  2. Replace the current text with: `2. **Source Code Files with Quality Intent**: User provides source code file paths with quality-focused language`
  3. Remove the hardcoded file extension list (`.py`, `.ts`, `.tsx`, `agent/*.md`, `skills/*/SKILL.md`)
- **Evidence:** `agent/researcher.md:92` - Currently contains hardcoded file extensions
- **Done When:** Line 92 reads "User provides source code file paths with quality-focused language" without listing specific extensions

#### PLAN-002: Make QA skill reference generic in researcher.md
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:**
  1. Locate line 93 in the "Trigger Conditions" section
  2. Replace the current text with: `3. **Explicit Skill Request**: User explicitly requests loading a language-specific QA skill`
  3. Remove the explicit skill enumeration (`python-qa`, `typescript-qa`, `opencode-qa`)
- **Evidence:** `agent/researcher.md:93` - Currently enumerates specific skill names
- **Done When:** Line 93 reads "User explicitly requests loading a language-specific QA skill" without naming specific skills

#### PLAN-003: Remove framework mechanics explanation in researcher.md
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:**
  1. Locate line 99 in the "QA Mode Workflow" section
  2. Replace the current Note with: `**Note:** Use the appropriate QA skill for the target language to access automated tools, prioritization rules, and report templates.`
  3. Remove the phrase "OpenCode automatically loads the appropriate QA skill based on file extensions and user intent. No manual skill loading is required."
- **Evidence:** `agent/researcher.md:99` - Currently explains OpenCode framework mechanics (automatic loading without manual skill tool usage)
- **Done When:** Line 99 instructs WHAT to do (use appropriate skill) without explaining framework-specific automatic loading behavior

#### PLAN-004: Make tool example generic in researcher.md
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:**
  1. Locate line 106 in "Phase 2: Automated Tool Execution"
  2. Replace the current text with: `- Run automated tools from loaded QA skill (e.g., linters, type checkers, test runners)`
  3. Remove specific tool names (`pylint`, `pyright`, `eslint`, `tsc`)
  4. Add a parenthetical note: "(tool names vary by language - refer to loaded skill)"
- **Evidence:** `agent/researcher.md:106` - Currently lists Python/TypeScript-specific tools
- **Done When:** Line 106 references "automated tools from loaded QA skill" with generic examples, followed by note that tools vary by language

#### PLAN-005: Remove language enumeration in planner.md
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. Locate line 562 in the "QA Implementation Plan" template section
  2. Replace `- Language: [Python | TypeScript | OpenCode]` with `- Language: [Detected from QA skill]`
  3. Remove explicit language options
- **Evidence:** `agent/planner.md:562` - Currently enumerates Python | TypeScript | OpenCode
- **Done When:** Line 562 reads "Language: [Detected from QA skill]" without listing specific languages

#### PLAN-006: Replace language-specific verification templates in planner.md
- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. Locate lines 644-665 in the "Baseline Verification" section
  2. Delete the entire language-specific template block (all "For Python:", "For TypeScript:", "For OpenCode:" sections)
  3. Replace with the following generic template:
     ```markdown
     ## Baseline Verification

     Commands from [language]-qa skill Section 4:

     ```bash
     [Insert verification commands from loaded QA skill]
     ```

     **Note:** The specific verification tools and commands are provided by the loaded QA skill for the target language. Refer to the skill's Section 4 for the complete verification command set.
     ```
- **Evidence:** `agent/planner.md:644-665` - Currently contains hardcoded Python/TypeScript/OpenCode verification commands
- **Done When:** Lines 644-665 contain generic verification template with instruction to refer to loaded skill, without any language-specific command examples

#### PLAN-007: Remove OpenCode language reference in planner.md verification section
- **Action ID:** PLAN-007
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. Verify this change was completed as part of PLAN-006
  2. Ensure line 660 no longer contains "**For OpenCode:**" header
  3. Ensure no OpenCode-specific verification commands remain (yamllint, markdownlint examples)
- **Evidence:** `agent/planner.md:660` - Currently contains "For OpenCode:" section header
- **Done When:** No "OpenCode" references remain in the Baseline Verification section (removed by PLAN-006)

### Phase 2: Documentation Cleanup (Examples)

#### PLAN-008: Make language idiom example generic in task-executor.md
- **Action ID:** PLAN-008
- **Change Type:** modify
- **File(s):** `agent/task-executor.md`
- **Instruction:**
  1. Locate line 257 in the code conventions section
  2. Replace the current text with: `- Use language-specific idioms and conventions for the target codebase (e.g., private member naming, module patterns)`
  3. Remove the specific Python/TypeScript examples (`Python: _private`, `TypeScript: #private`)
- **Evidence:** `agent/task-executor.md:257` - Currently lists Python and TypeScript specific naming conventions
- **Done When:** Line 257 references "language-specific idioms" with a generic example, without naming Python or TypeScript

#### PLAN-009: Remove language list from web-search-researcher.md
- **Action ID:** PLAN-009
- **Change Type:** modify
- **File(s):** `agent/web-search-researcher.md`
- **Instruction:**
  1. Locate line 150 in the code evidence citation section
  2. Replace the current text with: `2. **Language**: Auto-detect from code syntax`
  3. Remove the explicit language list (JavaScript, Python, TypeScript, etc.)
- **Evidence:** `agent/web-search-researcher.md:150` - Currently lists specific languages
- **Done When:** Line 150 reads "Auto-detect from code syntax" without listing specific languages

#### PLAN-010: Replace language names in mission-architect.md forbidden terms
- **Action ID:** PLAN-010
- **Change Type:** modify
- **File(s):** `agent/mission-architect.md`
- **Instruction:**
  1. Locate line 39 in the forbidden terms section
  2. Replace `React, Python, SQL` with generic placeholders: `[Framework], [Language], [Database]`
  3. Keep the other forbidden terms (API, database, frontend, backend, REST, GraphQL, microservices, containers) as they are generic concepts
  4. Update the line to read: `- Forbidden terms: API, database, frontend, backend, REST, GraphQL, [Framework], [Language], [Database], microservices, containers.`
- **Evidence:** `agent/mission-architect.md:39` - Currently lists specific technology names as negative examples
- **Done When:** Line 39 uses generic placeholders [Framework], [Language], [Database] instead of specific technology names, while preserving the teaching intent

#### PLAN-011: Replace language names in specifier.md forbidden terms
- **Action ID:** PLAN-011
- **Change Type:** modify
- **File(s):** `agent/specifier.md`
- **Instruction:**
  1. Locate line 44 in the forbidden terms section
  2. Replace specific technology names with generic placeholders:
     - `React` → `[Framework]`
     - `Python` → `[Language]`
     - `PostgreSQL` → `[Database]`
     - `AWS` → `[CloudProvider]`
     - `Docker, Kubernetes` → `[ContainerTech]`
  3. Keep REST, GraphQL as they are followed by an exception clause
  4. Update the line to read: `- Forbidden terms: [Framework], [Language], [Database], [CloudProvider], [ContainerTech], REST, GraphQL (unless describing abstract interaction patterns, not implementations).`
- **Evidence:** `agent/specifier.md:44` - Currently lists specific technology names as negative examples
- **Done When:** Line 44 uses generic placeholders instead of specific technology names, while preserving the teaching intent of the forbidden terms list

## Acceptance Criteria

1. **Language Agnosticism**: No agent file contains hardcoded lists of programming languages, file extensions, or language-specific tool names (except as illustrative examples marked with "e.g.")

2. **Framework Agnosticism**: No references to "OpenCode" or "ClaudeCode" remain in any agent file

3. **Skill Usage Instruction**: Agents instruct WHAT to do ("use appropriate QA skill") without explaining framework-specific automatic loading behavior ("OpenCode automatically loads...")

4. **Tool References Preserved**: References to "skill tool" remain as it is a legitimate agent tool, not framework-specific

5. **Extensibility**: Adding support for a new language (e.g., Java, Kotlin, Go) requires only creating a new `[language]-qa.md` skill file, without modifying any agent instruction files

6. **Verification**: Running `grep -i "opencode\|claudecode" agent/*.md` returns no results

7. **Generic Examples**: Language-specific examples (Python, TypeScript, JavaScript) are replaced with generic placeholders or removed entirely

## Implementor Checklist

### Phase 1 (Critical)
- [ ] PLAN-001: Make QA trigger file extension reference generic in researcher.md
- [ ] PLAN-002: Make QA skill reference generic in researcher.md
- [ ] PLAN-003: Remove framework mechanics explanation in researcher.md
- [ ] PLAN-004: Make tool example generic in researcher.md
- [ ] PLAN-005: Remove language enumeration in planner.md
- [ ] PLAN-006: Replace language-specific verification templates in planner.md
- [ ] PLAN-007: Remove OpenCode language reference in planner.md verification section

### Phase 2 (Documentation)
- [ ] PLAN-008: Make language idiom example generic in task-executor.md
- [ ] PLAN-009: Remove language list from web-search-researcher.md
- [ ] PLAN-010: Replace language names in mission-architect.md forbidden terms
- [ ] PLAN-011: Replace language names in specifier.md forbidden terms

## References
- Research report: `thoughts/shared/research/2026-02-06-Agent-Language-Agnosticism.md`
- Primary change targets: agent/researcher.md, agent/planner.md
- Secondary change targets: agent/task-executor.md, agent/web-search-researcher.md, agent/mission-architect.md, agent/specifier.md
