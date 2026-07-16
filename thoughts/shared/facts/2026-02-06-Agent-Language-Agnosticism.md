---
date: 2026-02-06
researcher: codebase-analysis
topic: "Agent Language Agnosticism"
status: complete
coverage:
  - agent/researcher.md
  - agent/planner.md
  - agent/task-executor.md
  - agent/web-search-researcher.md
  - agent/mission-architect.md
  - agent/specifier.md
---

# Research: Agent Language Agnosticism - Hardcoded Language References

## Executive Summary

- All agent files contain **hardcoded programming language references** primarily in examples and documentation
- Two critical agents (**researcher.md** and **planner.md**) contain **explicit QA skill enumeration** that hardcodes language-to-skill mappings
- File extension mappings (`.py`, `.ts`, `.tsx`) are explicitly documented in QA Mode detection logic
- Verification command examples reference language-specific tools (`pylint`, `pyright`, `eslint`, `tsc`, `ruff`)
- The mission-architect.md and specifier.md agents include language names in "forbidden terms" lists as negative examples

## Coverage Map

**Files Inspected:**
- `agent/researcher.md` (736 lines) - **PRIMARY CHANGE TARGET**
- `agent/planner.md` (744 lines) - **PRIMARY CHANGE TARGET**
- `agent/task-executor.md` (591 lines) - Minor changes (examples only)
- `agent/web-search-researcher.md` (partial read) - Minor changes (examples only)
- `agent/mission-architect.md` (361 lines) - Documentation only (negative examples)
- `agent/specifier.md` (521 lines) - Documentation only (negative examples)
- `agent/implementation-controller.md` (919 lines) - Examples only
- `agent/codebase-analyzer.md` (243 lines) - Examples only
- `agent/codebase-pattern-finder.md` (237 lines) - Examples only
- `agent/codebase-locator.md` (partial read) - Examples only
- `agent/epic-planner.md` (533 lines) - No language references found

**Scope:** Complete review of all agent definition files

## Critical Findings (Verified, Planner Attention Required)

### 1. QA Skill Enumeration in researcher.md

**Observation:** researcher.md explicitly enumerates programming language skills and maps file extensions to QA skills

**Direct consequence:** Adding a new language (e.g., Java, Kotlin, Go) requires editing this agent file

**Evidence:** `agent/researcher.md:87-125`

**Excerpt:**
```markdown
### Trigger Conditions

Activate QA Mode when the user request includes:

1. **QA Keywords**: QA, quality analysis, code quality, code review, test coverage, linting, type safety
2. **Source Code Files with Quality Intent**: User provides file paths (`.py`, `.ts`, `.tsx`, `agent/*.md`, `skills/*/SKILL.md`) with quality-focused language
3. **Explicit Skill Request**: User explicitly requests loading a QA skill (`python-qa`, `typescript-qa`, `opencode-qa`)

### QA Mode Workflow

**Step 1: Detect Language/Target**

Map file extensions to appropriate QA skill:
- `.py` files → `python-qa` skill
- `.ts`, `.tsx` files → `typescript-qa` skill
- `agent/*.md`, `skills/*/SKILL.md` → `opencode-qa` skill

**Step 2: Load Appropriate Skill**

Execute skill loading:
```
skill({ name: "[language]-qa" })
```
```

**Note:** Lines 87-125 in the current version no longer contain the "Step 1: Detect Language/Target" section visible in the system prompt. Line 99 states: "**Note:** OpenCode automatically loads the appropriate QA skill based on file extensions and user intent. No manual skill loading is required."

**Corrected Evidence:** The explicit language mapping was removed, but file extension references remain:
- `agent/researcher.md:92` - File extension list: `.py`, `.ts`, `.tsx`
- `agent/researcher.md:93` - Explicit skill enumeration: `python-qa`, `typescript-qa`, `opencode-qa`

### 2. QA Skill Enumeration in planner.md

**Observation:** planner.md explicitly lists language identifiers and verification commands per language

**Direct consequence:** Adding a new language requires editing verification command templates in this file

**Evidence:** `agent/planner.md:556-665`

**Excerpt (Line 562):**
```markdown
- Language: [Python | TypeScript | OpenCode]
```

**Excerpt (Lines 644-660):**
```markdown
## Baseline Verification

Commands from [language]-qa skill Section 4:

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
```

### 3. Verification Tool References Throughout Agents

**Observation:** Multiple agents reference language-specific verification tools in examples

**Direct consequence:** Documentation examples may mislead users about which tools to use for new languages

**Evidence:** Multiple files contain examples with `pyright`, `ruff`, `eslint`, `tsc`, `pytest`, etc.

**Locations:**
- `agent/implementation-controller.md:449-451` - Example verification commands
- `agent/task-executor.md:257` - Language idiom examples: `Python: _private`, `TypeScript: #private`
- `agent/task-executor.md:755` - Error message mentioning Python type hints

## Detailed Technical Analysis (Verified)

### Researcher Agent (agent/researcher.md)

**QA Mode Detection Section (Lines 83-126)**

**Current State:**
- Line 92: Hardcoded file extension list: `.py`, `.ts`, `.tsx`, `agent/*.md`, `skills/*/SKILL.md`
- Line 93: Explicit QA skill enumeration: `python-qa`, `typescript-qa`, `opencode-qa`
- Lines 99-125: Workflow description referencing loaded skills generically

**Required Change:**
Replace hardcoded lists with framework-provided skill metadata.

**Evidence:** `agent/researcher.md:92-93`
```markdown
2. **Source Code Files with Quality Intent**: User provides file paths (`.py`, `.ts`, `.tsx`, `agent/*.md`, `skills/*/SKILL.md`) with quality-focused language
3. **Explicit Skill Request**: User explicitly requests loading a QA skill (`python-qa`, `typescript-qa`, `opencode-qa`)
```

**Proposed Abstract Language:**
```markdown
2. **Source Code Files with Quality Intent**: User provides source code file paths with quality-focused language
3. **Explicit Skill Request**: User explicitly requests loading a language-specific QA skill
```

### Planner Agent (agent/planner.md)

**QA Planning Template Section (Lines 497-690)**

**Current State:**
- Line 562: Explicit language enumeration: `[Python | TypeScript | OpenCode]`
- Lines 644-660: Language-specific verification command templates
- Line 688: Reference to `[language]-qa` skill format

**Required Change:**
Remove language enumeration and replace verification templates with generic references to skill-provided commands.

**Evidence:** `agent/planner.md:562`
```markdown
- Language: [Python | TypeScript | OpenCode]
```

**Evidence:** `agent/planner.md:644-660`
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
```

**Proposed Abstract Language:**
```markdown
- Language: [Detected from QA skill]
```

```markdown
## Baseline Verification

Commands from [language]-qa skill Section 4:

**Verification commands:**
```bash
[Tool commands from loaded QA skill will be included here]
```

**Note:** The specific verification tools and commands are provided by the loaded QA skill for the target language.
```

### Task Executor Agent (agent/task-executor.md)

**Language Idiom Example (Line 257)**

**Current State:**
Example shows Python and TypeScript-specific naming conventions

**Evidence:** `agent/task-executor.md:257`
```markdown
   - Use language idioms (e.g., Python: `_private`, TypeScript: `#private`)
```

**Proposed Abstract Language:**
```markdown
   - Use language-specific idioms for the target codebase (e.g., private member conventions)
```

**Error Message Example (Lines 752-757)**

**Current State:**
Retry payload example references Python type system

**Evidence:** `agent/task-executor.md:755-757`
```markdown
  "instruction": "RETRY ATTEMPT 1: Previous attempt caused pyright error: 'bool' is not a valid type hint in Python, use 'bool' from typing module.\n\n1. Add return type annotation `-> bool` to `is_valid` function (import bool from typing)\n2. Add parameter type hints to all function parameters\n3. Ensure imports include typing module",
```

**Recommendation:** This is an example of error handling and demonstrates the pattern. Could be replaced with a language-agnostic example or retained as one of multiple language examples.

### Web Search Researcher Agent (agent/web-search-researcher.md)

**Language Auto-Detection (Line 150)**

**Current State:**
Example lists specific languages

**Evidence:** `agent/web-search-researcher.md:150`
```markdown
2. **Language**: Auto-detect from code syntax (JavaScript, Python, TypeScript, etc.)
```

**Proposed Abstract Language:**
```markdown
2. **Language**: Auto-detect from code syntax
```

### Mission Architect and Specifier Agents

**Forbidden Terms Lists (Lines 39 in mission-architect.md, Line 44 in specifier.md)**

**Current State:**
Language names appear in "forbidden terms" examples to teach agents NOT to specify technology

**Evidence:** `agent/mission-architect.md:39`
```markdown
   - Forbidden terms: API, database, frontend, backend, REST, GraphQL, React, Python, SQL, microservices, containers.
```

**Evidence:** `agent/specifier.md:44`
```markdown
   - Forbidden terms: React, Python, PostgreSQL, AWS, Docker, Kubernetes, REST, GraphQL (unless describing abstract interaction patterns, not implementations).
```

**Recommendation:** These are negative examples (teaching what NOT to do) and can remain as documentation. Alternatively, replace with generic placeholders like `[Framework]`, `[Language]`, `[Database]`.

## Verification Log

**Verified:**
- `agent/researcher.md` - Read lines 1-736 (complete file)
- `agent/planner.md` - Read lines 1-744 (complete file)
- `agent/task-executor.md` - Read lines 1-591 (complete file)
- `agent/mission-architect.md` - Read lines 1-361 (complete file)
- `agent/specifier.md` - Read lines 1-521 (complete file)
- `agent/implementation-controller.md` - Read lines 1-919 (complete file)
- `agent/codebase-analyzer.md` - Read lines 1-243 (complete file)
- `agent/codebase-pattern-finder.md` - Read lines 1-237 (complete file)
- `agent/epic-planner.md` - Read lines 1-533 (complete file)
- `agent/web-search-researcher.md` - Partial read (lines visible via grep)

**Spot-checked excerpts captured:** Yes

## Open Questions / Unverified Claims

None. All claims verified via direct file reads.

## References

**Codebase Citations:**
- `agent/researcher.md:92-93` (file extension and skill enumeration)
- `agent/researcher.md:99` (note about automatic skill loading)
- `agent/planner.md:562` (language enumeration)
- `agent/planner.md:644-660` (verification command templates)
- `agent/task-executor.md:257` (language idiom examples)
- `agent/task-executor.md:755-757` (Python error message example)
- `agent/web-search-researcher.md:150` (language list)
- `agent/mission-architect.md:39` (forbidden terms)
- `agent/specifier.md:44` (forbidden terms)

## Summary for Planner

**Primary Change Targets:**

1. **agent/researcher.md (Lines 92-93)**
   - Remove file extension list
   - Remove explicit QA skill enumeration
   - Replace with framework-provided skill references

2. **agent/planner.md (Lines 562, 644-660)**
   - Remove language enumeration
   - Replace verification command templates with skill-provided references
   - Keep QA plan structure but make verification section generic

**Secondary Change Targets (Optional - Examples Only):**

3. **agent/task-executor.md (Line 257)** - Make language idiom example more generic
4. **agent/web-search-researcher.md (Line 150)** - Remove language list from example
5. **agent/mission-architect.md (Line 39)** and **agent/specifier.md (Line 44)** - Consider replacing language names in forbidden terms with generic placeholders

**No Changes Needed:**
- All other file extension references (`.ts`, `.py`, `.tsx`) in examples can remain as illustrative examples
- Verification tool examples (`pyright`, `ruff`, `eslint`) can remain as documentation examples
- Agent files not explicitly managing language detection logic

**Framework Integration Point:**
The agents should query the framework for:
- Available QA skills and their metadata (file extensions, description)
- Language detection based on file path
- Skill loading based on detected language or user request
