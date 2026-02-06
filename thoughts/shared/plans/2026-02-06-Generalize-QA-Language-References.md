---
date: 2026-02-06
ticket: "GENERALIZE-QA"
title: "Generalize QA Language References for Full Extensibility"
status: ready
target_files:
  - agent/researcher.md
  - AGENTS.md
verification:
  - "rg -F '.py' agent/researcher.md AGENTS.md | wc -l should return 0"
  - "rg -F 'python-qa' agent/researcher.md AGENTS.md | wc -l should return 0"
  - "rg -F 'typescript-qa' agent/researcher.md AGENTS.md | wc -l should return 0"
  - "Manual validation: Ensure skill discovery patterns reference skills/ directory"
---

# Implementation Plan: Generalize QA Language References

## Objective

Make the QA system fully extensible by removing all hardcoded programming language references from agent files and documentation. After this change, adding new language QA support (e.g., Rust, Go, C++) requires only creating a new skill file (`skills/rust-qa/SKILL.md`) without modifying any agent files.

## Context

**Current State**: The QA workflow has hardcoded references to specific languages in multiple locations:
- researcher.md enumerates `.py`, `.ts`, `.tsx` file extensions and their skill mappings
- AGENTS.md lists specific file extension → skill mappings
- AGENTS.md lists specific "thorough" auditor name mappings
- AGENTS.md lists specific deprecated agents (which become stale as new languages are added)

**Desired State**: Generic patterns that discover available QA skills from the `skills/` directory, making the system truly extensible.

**Evidence**:
- `agent/researcher.md:92` - Hardcoded file extension list
- `agent/researcher.md:93` - Hardcoded skill name list
- `AGENTS.md:382-386` - File extension → skill mappings
- `AGENTS.md:401-407` - Auditor name → skill mappings
- `AGENTS.md:10-15` - Deprecated agent list with specific language examples

## Phases

### Phase 1: Generalize researcher.md QA Mode Triggers (Lines 88-94)

**Goal**: Replace enumerated file extensions and skill names with generic patterns.

**Tasks**:

#### PLAN-001: Generalize QA Mode Trigger Conditions
**Type**: modify
**Files**: `agent/researcher.md`
**Instruction**:
1. Locate the "### Trigger Conditions" section (lines 87-94)
2. Replace lines 92-93 with generic pattern-based triggers
3. Maintain the same 3-trigger structure (keywords, files, explicit request)
4. Reference the `skills/` directory for skill discovery

**Evidence**: `agent/researcher.md:87-94`

**Before**:
```markdown
### Trigger Conditions

Activate QA Mode when the user request includes:

1. **QA Keywords**: QA, quality analysis, code quality, code review, test coverage, linting, type safety
2. **Source Code Files with Quality Intent**: User provides file paths (`.py`, `.ts`, `.tsx`, `agent/*.md`, `skills/*/SKILL.md`) with quality-focused language
3. **Explicit Skill Request**: User explicitly requests loading a QA skill (`python-qa`, `typescript-qa`, `opencode-qa`)
```

**After**:
```markdown
### Trigger Conditions

Activate QA Mode when the user request includes:

1. **QA Keywords**: QA, quality analysis, code quality, code review, test coverage, linting, type safety
2. **Source Code Files with Quality Intent**: User provides file paths to source files with quality-focused language
   - Detect file extensions and check for matching QA skills in `skills/` directory
   - Supported languages determined by available skills matching pattern `skills/*-qa/SKILL.md`
3. **Explicit Skill Request**: User explicitly requests loading a QA skill (any skill matching `*-qa` pattern in `skills/` directory)
```

**Done When**:
- No hardcoded file extensions in lines 88-94
- "skills/" directory reference present
- Pattern-based skill discovery described
- Section maintains same 3-trigger structure

---

### Phase 2: Generalize AGENTS.md QA Analysis Section (Lines 375-425)

**Goal**: Replace enumerated mappings with generic skill discovery patterns.

**Tasks**:

#### PLAN-002: Generalize File Extension → Skill Mapping
**Type**: modify
**Files**: `AGENTS.md`
**Instruction**:
1. Locate the "### QA Analysis (Researcher in QA Mode)" section (lines 377-393)
2. Replace step 3 (lines 381-387) with generic skill discovery pattern
3. Remove specific file extension enumerations
4. Add skill metadata reference for determining file extension patterns

**Evidence**: `AGENTS.md:381-387`

**Before**:
```markdown
3. Researcher loads appropriate skill based on file extension or explicit request:
   - `.py` files → `python-qa` skill
   - `.ts`, `.tsx` files → `typescript-qa` skill
   - `.java` files → `java-qa` skill (requires manual skill loading)
   - `.kt`, `.kts` files → `kotlin-qa` skill (requires manual skill loading)
   - `agent/*.md`, `skills/*/SKILL.md` → `opencode-qa` skill
   - Explicit request → `logic-bugs-qa` or `clean-code` skill (language-agnostic, supplemental analysis)
```

**After**:
```markdown
3. Researcher loads appropriate skill based on file extension or explicit request:
   - **Language-Specific Skills**: Discovers QA skills in `skills/` directory matching pattern `skills/*-qa/SKILL.md`
     - Each language skill's metadata defines supported file extensions
     - Example: `python-qa` skill supports `.py`, `typescript-qa` skill supports `.ts` and `.tsx`
     - If target file extension matches a skill's supported extensions, load that skill
   - **Language-Agnostic Skills**: `logic-bugs-qa` and `clean-code` provide supplemental analysis for any language
   - **Explicit Request**: User can explicitly request any QA skill by name
```

**Done When**:
- No enumerated file extension → skill mappings
- Generic skill discovery pattern described
- Reference to skill metadata for extension mapping
- Language-agnostic skills section preserved
- Lines 381-387 replaced with new pattern

---

#### PLAN-003: Generalize Auditor Name → Skill Mapping
**Type**: modify
**Files**: `AGENTS.md`
**Instruction**:
1. Locate the "### QA Planning (Planner with QA Detection)" section (lines 395-411)
2. Replace step 4 (lines 400-407) with generic pattern matching
3. Remove specific auditor name enumerations
4. Add pattern-based extraction logic

**Evidence**: `AGENTS.md:400-407`

**Before**:
```markdown
4. Planner extracts "Auditor" field, maps to skill:
   - `python-qa-thorough` → `python-qa`
   - `typescript-qa-thorough` → `typescript-qa`
   - `opencode-qa-thorough` → `opencode-qa`
   - `java-qa-thorough` → `java-qa`
   - `kotlin-qa-thorough` → `kotlin-qa`
   - `logic-bugs-qa` → `logic-bugs-qa`
   - `clean-code` → `clean-code`
```

**After**:
```markdown
4. Planner extracts "Auditor" field, maps to skill:
   - **Pattern Matching**: Extract skill name from auditor field using pattern `{skill-name}-thorough` → `{skill-name}`
   - **Direct Mapping**: Language-agnostic skills use direct name mapping (e.g., `logic-bugs-qa` → `logic-bugs-qa`)
   - **Validation**: Verify extracted skill exists in `skills/{skill-name}/SKILL.md` before loading
   - **Fallback**: If skill not found, log warning and skip skill-specific verification commands
```

**Done When**:
- No enumerated auditor → skill mappings
- Generic pattern extraction logic described
- Validation step included
- Fallback behavior documented
- Lines 400-407 replaced with new pattern

---

### Phase 3: Generalize Deprecated Agents Section (Lines 7-18)

**Goal**: Use template pattern for deprecated agents instead of specific examples.

**Tasks**:

#### PLAN-004: Generalize Deprecated Agents Documentation
**Type**: modify
**Files**: `AGENTS.md`
**Instruction**:
1. Locate the "### Deprecated Agents" section (lines 7-18)
2. Replace specific agent examples (lines 10-15) with generic template pattern
3. Keep migration date and rationale
4. Add note about extensibility to new languages

**Evidence**: `AGENTS.md:7-18`

**Before**:
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

**After**:
```markdown
### Deprecated Agents

The following agents have been consolidated into the skills-based QA workflow:
- ~~`agent/{language}-qa-thorough.md`~~ → Use `researcher` in QA mode with `{language}-qa` skill
- ~~`agent/{language}-qa-quick.md`~~ → Use `researcher` in QA mode with `{language}-qa` skill (inline output)
- ~~`agent/qa-planner.md`~~ → Use `planner` with QA report detection

**Pattern**: Language-specific QA agents (`python-qa`, `typescript-qa`, `java-qa`, `kotlin-qa`, etc.) now live as skills in `skills/{language}-qa/SKILL.md`. Add new language support by creating a new skill file following the existing skill template structure.

**Migration Date:** 2026-02-05
**Rationale:** Consolidation reduces maintenance burden from ~3,582 lines to ~600 lines while maintaining QA quality standards and enables extensibility to new languages without agent file modifications.
```

**Done When**:
- Specific language examples replaced with `{language}` template pattern
- Reference to skill directory structure added
- Extensibility note included in rationale
- Lines 10-15 replaced with template pattern
- Migration date and rationale preserved

---

### Phase 4: Update QA Skills Section for Discoverability (Lines 120-128)

**Goal**: Make QA skills section describe discovery pattern instead of enumerating all skills.

**Tasks**:

#### PLAN-005: Add Skill Discovery Pattern to QA Skills Section
**Type**: modify
**Files**: `AGENTS.md`
**Instruction**:
1. Locate the "### QA Skills" section (lines 120-128)
2. Add discovery pattern description before the enumerated list
3. Keep the current list as examples, not exhaustive enumeration
4. Add note about adding new languages

**Evidence**: `AGENTS.md:120-128`

**Before**:
```markdown
### QA Skills
- `skills/python-qa/SKILL.md` - Python code quality analysis (ruff, pyright, bandit, interrogate)
- `skills/typescript-qa/SKILL.md` - TypeScript code quality analysis (tsc, eslint, knip)
- `skills/opencode-qa/SKILL.md` - OpenCode agent/skill quality analysis (yamllint, markdownlint)
- `skills/java-qa/SKILL.md` - Java code quality analysis (Maven/Gradle, Checkstyle, PMD, SpotBugs, JaCoCo)
- `skills/kotlin-qa/SKILL.md` - Kotlin code quality analysis (ktlint, detekt, Kover)
- `skills/logic-bugs-qa/SKILL.md` - Language-agnostic logic bug detection through manual analysis
- `skills/clean-code/SKILL.md` - Language-agnostic design principles (Clean Code, Pragmatic Programmer, Code Complete)
```

**After**:
```markdown
### QA Skills

**Discovery Pattern**: QA skills are discovered automatically from `skills/` directory by matching pattern `skills/*-qa/SKILL.md`. Each skill's YAML frontmatter defines supported file extensions, tools, and prioritization rules.

**Adding New Languages**: Create `skills/{language}-qa/SKILL.md` following the template structure (see existing skills for reference). No agent file modifications required.

**Language-Specific Skills** (examples):
- `skills/python-qa/SKILL.md` - Python code quality analysis (ruff, pyright, bandit, interrogate)
- `skills/typescript-qa/SKILL.md` - TypeScript code quality analysis (tsc, eslint, knip)
- `skills/opencode-qa/SKILL.md` - OpenCode agent/skill quality analysis (yamllint, markdownlint)
- `skills/java-qa/SKILL.md` - Java code quality analysis (Maven/Gradle, Checkstyle, PMD, SpotBugs, JaCoCo)
- `skills/kotlin-qa/SKILL.md` - Kotlin code quality analysis (ktlint, detekt, Kover)

**Language-Agnostic Skills**:
- `skills/logic-bugs-qa/SKILL.md` - Language-agnostic logic bug detection through manual analysis
- `skills/clean-code/SKILL.md` - Language-agnostic design principles (Clean Code, Pragmatic Programmer, Code Complete)
```

**Done When**:
- Discovery pattern description added at top of section
- "Adding New Languages" guidance included
- Existing skills relabeled as "examples" with categorization (language-specific vs language-agnostic)
- Section communicates extensibility clearly
- All existing skills preserved in list

---

## Verification Strategy

### Automated Verification
```bash
# Verify no hardcoded file extensions in trigger sections
rg -F '.py' agent/researcher.md AGENTS.md

# Verify no hardcoded skill names in mapping sections
rg -F 'python-qa' agent/researcher.md AGENTS.md | grep -v '# ' | grep -v 'examples'

# Should only find references in:
# - QA Skills section examples
# - Comments explaining patterns
# - Historical migration notes
```

### Manual Verification Checklist
- [ ] researcher.md trigger conditions are generic (no `.py`, `.ts` enumerations)
- [ ] AGENTS.md QA Analysis section uses skill discovery pattern
- [ ] AGENTS.md QA Planning section uses pattern matching (no auditor enumerations)
- [ ] AGENTS.md Deprecated Agents uses `{language}` template pattern
- [ ] AGENTS.md QA Skills section describes discovery pattern
- [ ] All references to "skills/" directory are present
- [ ] Extensibility to new languages is documented

### Test Case: Adding a New Language (Rust)
After this plan is implemented, adding Rust QA support should require:
1. **Only Action**: Create `skills/rust-qa/SKILL.md` with:
   - YAML frontmatter with supported file extensions (`.rs`)
   - QA tool commands (e.g., `cargo clippy`, `cargo test --doc`)
   - Prioritization hierarchy
   - Report template
2. **Zero Modifications**: No changes to `agent/researcher.md` or `AGENTS.md`
3. **Automatic Discovery**: Researcher detects `.rs` files and loads `rust-qa` skill

## Key Benefits

1. **True Extensibility**: Add new language support by creating one skill file
2. **Zero Agent Maintenance**: No agent file edits when adding languages
3. **Reduced Duplication**: Generic patterns replace enumerated lists
4. **Self-Documenting**: Skill directory structure becomes the source of truth
5. **Backward Compatible**: Existing skills and workflows continue to work
6. **Future-Proof**: Scales to unlimited languages without documentation updates

## Dependencies

- None (this is a documentation-only refactor)

## Risks and Mitigations

**Risk**: Generic patterns might be less clear than explicit examples
**Mitigation**: Keep examples in QA Skills section, clearly labeled as "examples"

**Risk**: Skill discovery pattern might fail if skill files don't follow expected structure
**Mitigation**: Add validation step in PLAN-003 ("verify skill exists before loading")

## Rollback Plan

If issues arise, revert all files to their current state using git:
```bash
git checkout HEAD -- agent/researcher.md AGENTS.md
```

## Related Documentation

- `skills/python-qa/SKILL.md` - Example language-specific skill structure
- `skills/typescript-qa/SKILL.md` - Example language-specific skill structure
- `skills/logic-bugs-qa/SKILL.md` - Example language-agnostic skill structure
- `thoughts/shared/research/2026-02-05-QA-Workflow-Consolidation.md` - Migration research (if exists)
