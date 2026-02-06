# Implementation Plan: Remove Manual Skill Loading Instructions

**Date:** 2026-02-06  
**Planner:** OpenCode Implementation System  
**Objective:** Remove all explicit skill loading instructions from agent files, relying on OpenCode's automatic skill detection

## Context

OpenCode provides **automatic skill detection** - agents do not need to manually load skills using `skill({ name: "..." })`. The platform detects which skills to load based on file extensions, keywords, and context.

**Current Problem:**
- `agent/planner.md` contains deprecated "thorough QA" backward compatibility mappings
- `agent/planner.md` instructs agents to manually load skills with `skill({ name: "..." })`
- `agent/researcher.md` contains language-to-skill mapping and manual loading instructions
- These manual instructions are redundant and can confuse agents

**Solution:**
Remove all manual skill loading instructions and mappings, trusting OpenCode's automatic detection.

## Target Files

1. `agent/planner.md`
2. `agent/researcher.md`

## Evidence of Manual Skill Loading

### agent/planner.md (Lines 406-416)

**Lines 406-412: Deprecated "thorough" QA backward compatibility mappings**
```markdown
1. **Extract Language**
   - Read "Scan Metadata" section
   - Extract "Auditor" field value
   - Map auditor to language identifier:
     - `python-qa-thorough` → `python-qa`
     - `typescript-qa-thorough` → `typescript-qa`
     - `opencode-qa-thorough` → `opencode-qa`
```

**Lines 414-416: Explicit skill loading instruction**
```markdown
2. **Load QA Skill**
   - Use `skill({ name: "[language]-qa" })` (e.g., `skill({ name: "python-qa" })`)
   - Extract verification commands from Section 4 of the skill
```

### agent/researcher.md (Lines 99-114)

**Lines 99-102: Language-to-skill mapping**
```markdown
Map file extensions to appropriate QA skill:
- `.py` files → `python-qa` skill
- `.ts`, `.tsx` files → `typescript-qa` skill
- `agent/*.md`, `skills/*/SKILL.md` → `opencode-qa` skill
```

**Lines 104-114: Explicit skill loading step**
```markdown
**Step 2: Load Appropriate Skill**

Execute skill loading:
```
skill({ name: "[language]-qa" })
```

Extract from loaded skill content:
- Tool commands for automated analysis (linters, type checkers, test runners)
- Prioritization rules for findings (e.g., type errors > style issues)
- Report template structure (sections to include in QA report)
```

## Implementation Tasks

### PLAN-001: Remove Backward Compatibility Mappings from planner.md

**Change Type:** modify  
**Files:** `agent/planner.md`

**Current State (Lines 406-416):**
```markdown
1. **Extract Language**
   - Read "Scan Metadata" section
   - Extract "Auditor" field value
   - Map auditor to language identifier:
     - `python-qa-thorough` → `python-qa`
     - `typescript-qa-thorough` → `typescript-qa`
     - `opencode-qa-thorough` → `opencode-qa`

2. **Load QA Skill**
   - Use `skill({ name: "[language]-qa" })` (e.g., `skill({ name: "python-qa" })`)
   - Extract verification commands from Section 4 of the skill

3. **Apply QA Planning Template**
```

**Target State:**
```markdown
1. **Apply QA Planning Template**
```

**Instructions:**
1. Read `agent/planner.md` lines 400-430 to verify current structure
2. Remove lines 406-416 entirely (both "Extract Language" and "Load QA Skill" steps)
3. Renumber step 3 "Apply QA Planning Template" to step 1
4. Update the step to reference automatic skill detection:
   - Change "Include verification commands from skill in Baseline Verification section"
   - To "Include verification commands from automatically loaded QA skill in Baseline Verification section"

**Evidence:** agent/planner.md:406-416

**Done When:**
- Lines 406-416 are removed from agent/planner.md
- "Apply QA Planning Template" becomes step 1 under "If QA report detected:"
- No references to manual skill loading remain in the QA Report Detection section
- Text reads "automatically loaded QA skill" instead of implying manual loading

**Phase:** 1 (Critical - removes deprecated backward compatibility code)

---

### PLAN-002: Remove Manual Skill Loading from researcher.md QA Workflow

**Change Type:** modify  
**Files:** `agent/researcher.md`

**Current State (Lines 97-114):**
```markdown
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

Extract from loaded skill content:
- Tool commands for automated analysis (linters, type checkers, test runners)
- Prioritization rules for findings (e.g., type errors > style issues)
- Report template structure (sections to include in QA report)

**Step 3: Execute QA Workflow Phases**
```

**Target State:**
```markdown
**Step 1: Execute QA Workflow Phases**

(OpenCode automatically loads the appropriate QA skill based on file extensions and context)
```

**Instructions:**
1. Read `agent/researcher.md` lines 85-135 to verify current structure
2. Remove "Step 1: Detect Language/Target" entirely (lines 97-102)
3. Remove "Step 2: Load Appropriate Skill" entirely (lines 104-114)
4. Renumber "Step 3: Execute QA Workflow Phases" to "Step 1"
5. Add a brief note after the step heading explaining that OpenCode handles skill detection automatically
6. Update Phase 2 and Phase 3 text to reference "loaded skill" (passive voice) instead of implying manual loading:
   - Phase 2: "Run tools from loaded skill" (keep as-is)
   - Phase 3: "Apply prioritization rules from loaded skill" (keep as-is)

**Evidence:** agent/researcher.md:97-114

**Done When:**
- Lines 97-114 are removed from agent/researcher.md
- "Execute QA Workflow Phases" becomes step 1 under "QA Mode Workflow"
- A note explains that OpenCode automatically loads skills
- No explicit `skill({ name: "..." })` instructions remain
- Phase descriptions use passive voice ("loaded skill") rather than active voice ("load skill")

**Phase:** 1 (Critical - removes redundant manual instructions)

---

### PLAN-003: Verify Automatic Skill Detection Works

**Change Type:** verification  
**Files:** None (testing only)

**Instructions:**
1. Test automatic skill detection by simulating QA scenarios:
   - Create a mock request: "Analyze code quality for src/example.py"
   - Verify OpenCode would automatically load `python-qa` skill based on `.py` extension
   - Create a mock request: "QA analysis for agent/planner.md"
   - Verify OpenCode would automatically load `opencode-qa` skill based on `agent/*.md` pattern
2. Confirm that the Planner agent can still process QA reports without manual skill loading
3. Confirm that the Researcher agent can still execute QA workflows without manual skill loading
4. Verify that skill content (tools, prioritization, templates) is still accessible after automatic loading

**Evidence:** OpenCode automatic skill detection (documented in system capabilities)

**Done When:**
- Automatic skill detection confirmed for Python, TypeScript, and OpenCode files
- QA workflow can complete end-to-end without manual `skill()` calls
- Skill content remains accessible to agents after automatic loading
- No regressions in QA report quality or structure

**Phase:** 2 (High - validation before deployment)

---

## Baseline Verification

After all changes, verify:

```bash
# Verify no manual skill loading instructions remain
grep -n "skill({ name:" agent/planner.md agent/researcher.md

# Expected: No matches (exit code 1)

# Verify no "thorough" QA mappings remain
grep -n "thorough" agent/planner.md

# Expected: No matches in QA detection section

# Verify files are valid markdown
markdownlint agent/planner.md agent/researcher.md

# Expected: No errors
```

## Success Criteria

1. ✅ All explicit `skill({ name: "..." })` instructions removed from agent files
2. ✅ All deprecated "thorough QA" backward compatibility mappings removed
3. ✅ All language-to-skill extension mappings removed (OpenCode handles this)
4. ✅ Agent instructions reference "automatically loaded skill" or "loaded skill" (passive voice)
5. ✅ No markdown lint errors in modified files
6. ✅ QA workflow still functional with automatic skill detection

## Rollback Plan

If automatic skill detection fails:

1. Revert changes to `agent/planner.md` and `agent/researcher.md`
2. Restore manual skill loading instructions
3. File a bug report with OpenCode team about skill detection failure
4. Document specific scenarios where automatic detection fails

**Note:** This should not be necessary - OpenCode's automatic skill detection is a core platform feature.

## Related Documentation

- **AGENTS.md**: Documents QA workflow and skill system
- **skills/python-qa/SKILL.md**: Python QA skill definition
- **skills/typescript-qa/SKILL.md**: TypeScript QA skill definition
- **skills/opencode-qa/SKILL.md**: OpenCode QA skill definition
- **thoughts/shared/research/2026-02-05-QA-Agent-Consolidation.md**: Background on QA system migration
