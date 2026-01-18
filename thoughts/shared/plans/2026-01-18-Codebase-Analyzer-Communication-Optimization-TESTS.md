# Codebase-Analyzer Communication Optimization - Verification Test Cases

**Date**: 2026-01-18  
**Plan**: [2026-01-18-Codebase-Analyzer-Communication-Optimization.md](./2026-01-18-Codebase-Analyzer-Communication-Optimization.md)  
**Purpose**: Manual verification test cases for new communication patterns and depth levels

---

## Test Case 1: execution_only Depth

### Objective
Verify that `execution_only` depth returns only Section 1 (Execution Flow) with code excerpts, achieving ~70% token reduction.

### Sample Delegation Call

```markdown
task({
  subagent_type: "codebase-analyzer",
  prompt: "Trace execution path for testability analysis in tool/searxng-search.ts. Analysis depth: execution_only."
})
```

### Expected Output Structure

**YAML Frontmatter** (required):
```yaml
---
message_id: analysis-2026-01-18-XXX
timestamp: 2026-01-18T...
message_type: ANALYSIS_RESPONSE
analysis_depth: execution_only
target_file: tool/searxng-search.ts
target_component: [component name]
---
```

**Thinking Section** (required):
```markdown
<thinking>
[Analyzer's reasoning process about execution flow]
</thinking>
```

**Answer Section** (required):
```markdown
<answer>
## Logic Analysis: [Component Name]

### 1. Execution Flow

**Entry Point**: [Description] (Line X)
  * **Excerpt:**
    ```typescript
    [1-6 lines of code]
    ```

* **Step 1**: [Description] (Line Y)
  * **Excerpt:**
    ```typescript
    [1-6 lines of code]
    ```

[Additional steps...]

* **Return/Exit**: [Description] (Line Z)
  * **Excerpt:**
    ```typescript
    [1-6 lines of code]
    ```
</answer>
```

### Expected Sections

**Present**:
- ✅ Section 1: Execution Flow (with code excerpts)

**Absent**:
- ❌ Section 2: Data Model
- ❌ Section 3: Dependencies
- ❌ Section 4: Edge Cases

### Verification Checklist

- [ ] YAML frontmatter present with all required fields
- [ ] `analysis_depth: execution_only` in frontmatter
- [ ] `<thinking>` section present and non-empty
- [ ] `<answer>` section present
- [ ] Section 1 (Execution Flow) present
- [ ] Every execution step includes 1-6 line code excerpt
- [ ] Code excerpts use correct language syntax highlighting
- [ ] Excerpts formatted as nested bullet under step description
- [ ] NO Section 2 (Data Model) present
- [ ] NO Section 3 (Dependencies) present
- [ ] NO Section 4 (Edge Cases) present
- [ ] Token count approximately **250 tokens** (±50)

---

## Test Case 2: focused Depth

### Objective
Verify that `focused` depth returns Sections 1 and 3 (Execution Flow + Dependencies) with code excerpts, achieving ~56% token reduction.

### Sample Delegation Call

```markdown
task({
  subagent_type: "codebase-analyzer",
  prompt: "Analyze authentication flow for migration planning in agent/researcher.md. Analysis depth: focused."
})
```

### Expected Output Structure

**YAML Frontmatter** (required):
```yaml
---
message_id: analysis-2026-01-18-XXX
timestamp: 2026-01-18T...
message_type: ANALYSIS_RESPONSE
analysis_depth: focused
target_file: agent/researcher.md
target_component: [component name]
---
```

**Thinking Section** (required):
```markdown
<thinking>
[Analyzer's reasoning about execution flow and dependencies]
</thinking>
```

**Answer Section** (required):
```markdown
<answer>
## Logic Analysis: [Component Name]

### 1. Execution Flow

[Entry point and steps with excerpts, same format as Test Case 1]

### 3. Dependencies

**Internal Dependencies**:
- `[module/file]`: [Usage description]
  * **Excerpt:**
    ```typescript
    [1-6 lines of import or usage]
    ```

**External Dependencies**:
- `[package-name]`: [Usage description]
  * **Excerpt:**
    ```typescript
    [1-6 lines of import or usage]
    ```
</answer>
```

### Expected Sections

**Present**:
- ✅ Section 1: Execution Flow (with code excerpts)
- ✅ Section 3: Dependencies (with code excerpts)

**Absent**:
- ❌ Section 2: Data Model
- ❌ Section 4: Edge Cases

### Verification Checklist

- [ ] YAML frontmatter present with all required fields
- [ ] `analysis_depth: focused` in frontmatter
- [ ] `<thinking>` section present and non-empty
- [ ] `<answer>` section present
- [ ] Section 1 (Execution Flow) present with code excerpts
- [ ] Section 3 (Dependencies) present with code excerpts
- [ ] Internal dependencies listed with excerpts
- [ ] External dependencies listed with excerpts
- [ ] All excerpts are 1-6 lines with correct syntax highlighting
- [ ] NO Section 2 (Data Model) present
- [ ] NO Section 4 (Edge Cases) present
- [ ] Token count approximately **350 tokens** (±75)

---

## Test Case 3: comprehensive Depth

### Objective
Verify that `comprehensive` depth returns all 4 sections (Execution Flow, Data Model, Dependencies, Edge Cases) with code excerpts. This is the complete analysis.

### Sample Delegation Call

```markdown
task({
  subagent_type: "codebase-analyzer",
  prompt: "Complete logic analysis of authentication system in agent/codebase-analyzer.md. Analysis depth: comprehensive."
})
```

### Expected Output Structure

**YAML Frontmatter** (required):
```yaml
---
message_id: analysis-2026-01-18-XXX
timestamp: 2026-01-18T...
message_type: ANALYSIS_RESPONSE
analysis_depth: comprehensive
target_file: agent/codebase-analyzer.md
target_component: [component name]
---
```

**Thinking Section** (required):
```markdown
<thinking>
[Analyzer's reasoning about all aspects of the component]
</thinking>
```

**Answer Section** (required):
```markdown
<answer>
## Logic Analysis: [Component Name]

### 1. Execution Flow

[Entry point and steps with excerpts, same format as Test Case 1]

### 2. Data Model

**Input Structure**:
- `[field/parameter]`: [Type and description]
  * **Excerpt:**
    ```typescript
    [1-6 lines showing type definition or usage]
    ```

**Output Structure**:
- `[field/property]`: [Type and description]
  * **Excerpt:**
    ```typescript
    [1-6 lines showing type definition or usage]
    ```

**State Mutations** (if applicable):
- [Description of state changes with excerpts]

### 3. Dependencies

[Internal and external dependencies with excerpts, same format as Test Case 2]

### 4. Edge Cases

**Validation/Error Handling**:
- [Case description with excerpt]
  * **Excerpt:**
    ```typescript
    [1-6 lines of error handling code]
    ```

**Boundary Conditions**:
- [Case description with excerpt]
  * **Excerpt:**
    ```typescript
    [1-6 lines of boundary check code]
    ```

**Async/Concurrency** (if applicable):
- [Case description with excerpt]
</answer>
```

### Expected Sections

**Present**:
- ✅ Section 1: Execution Flow (with code excerpts)
- ✅ Section 2: Data Model (with code excerpts)
- ✅ Section 3: Dependencies (with code excerpts)
- ✅ Section 4: Edge Cases (with code excerpts)

**Absent**:
- None (all sections present)

### Verification Checklist

- [ ] YAML frontmatter present with all required fields
- [ ] `analysis_depth: comprehensive` in frontmatter
- [ ] `<thinking>` section present and non-empty
- [ ] `<answer>` section present
- [ ] Section 1 (Execution Flow) present with code excerpts
- [ ] Section 2 (Data Model) present with code excerpts
- [ ] Section 3 (Dependencies) present with code excerpts
- [ ] Section 4 (Edge Cases) present with code excerpts
- [ ] All excerpts are 1-6 lines with correct syntax highlighting
- [ ] Input structure documented in Section 2
- [ ] Output structure documented in Section 2
- [ ] Error handling cases documented in Section 4
- [ ] Token count approximately **950 tokens** (±150)

---

## Test Case 4: Default Depth (No Parameter)

### Objective
Verify backward compatibility: when no `analysis_depth` parameter is provided, the analyzer defaults to `comprehensive` depth.

### Sample Delegation Call

```markdown
task({
  subagent_type: "codebase-analyzer",
  prompt: "Analyze tool/searxng-search.ts for research purposes."
})
```

**Note**: No `Analysis depth:` parameter specified.

### Expected Output Structure

Same as Test Case 3 (comprehensive depth).

### Expected Sections

**Present**:
- ✅ Section 1: Execution Flow (with code excerpts)
- ✅ Section 2: Data Model (with code excerpts)
- ✅ Section 3: Dependencies (with code excerpts)
- ✅ Section 4: Edge Cases (with code excerpts)

### Verification Checklist

- [ ] YAML frontmatter present with all required fields
- [ ] `analysis_depth: comprehensive` in frontmatter (defaulted)
- [ ] `<thinking>` section present and non-empty
- [ ] `<answer>` section present
- [ ] All 4 sections present (same as Test Case 3)
- [ ] All sections include code excerpts (1-6 lines each)
- [ ] Token count approximately **950 tokens** (±150)
- [ ] **CRITICAL**: Default behavior matches comprehensive depth (backward compatibility verified)

---

## Acceptance Criteria Checklist

Based on research report (lines 1093-1105), implementation is complete when:

### Format Requirements

- [ ] **AC1: Excerpt Format** - Every execution step includes 1-6 line code excerpt in separate field (nested bullet with `**Excerpt:**` header and code fence)
- [ ] **AC2: Thinking Separation** - Output wrapped in `<thinking>` and `<answer>` tags
- [ ] **AC3: Depth Levels** - Agent accepts and correctly handles `execution_only`, `focused`, `comprehensive` parameters
- [ ] **AC4: Message Envelope** - YAML frontmatter includes:
  - [ ] `message_id`
  - [ ] `timestamp`
  - [ ] `message_type`
  - [ ] `analysis_depth`
  - [ ] `target_file`
  - [ ] `target_component`

### Integration Requirements

- [ ] **AC5: Consumer Updates** - All 6 consumer agents have delegation examples in prompts:
  - [ ] researcher.md
  - [ ] planner.md
  - [ ] typescript-qa-quick.md
  - [ ] typescript-qa-thorough.md
  - [ ] python-qa-quick.md
  - [ ] python-qa-thorough.md

### Compatibility Requirements

- [ ] **AC6: Backward Compatibility** - Default depth level is `comprehensive` (no breaking changes)
- [ ] **AC7: Documentation** - AGENTS.md updated with new patterns
- [ ] **AC8: Verification** - Sample delegations tested for each depth level with spot-check of output format

---

## Token Count Verification Guidelines

### Measurement Method

1. Copy the entire analyzer response (from `---` frontmatter to end of `</answer>`)
2. Use a token counter tool (e.g., OpenAI tokenizer, Claude's estimate)
3. Record the count

### Expected Ranges

| Depth Level | Expected Tokens | Acceptable Range | Deviation Threshold |
|-------------|----------------|------------------|---------------------|
| execution_only | ~250 | 200-300 | >100 = investigate |
| focused | ~350 | 275-425 | >150 = investigate |
| comprehensive | ~950 | 800-1100 | >250 = investigate |

### Savings Calculation

- **execution_only** vs comprehensive: Should save ~70% (700 tokens)
- **focused** vs comprehensive: Should save ~56% (600 tokens)

### What to Investigate If Out of Range

- Excessive `<thinking>` content (should be concise reasoning)
- Too many code excerpt lines (should be 1-6 per step)
- Missing depth filtering (sections not properly excluded)
- Overly verbose descriptions (should be concise)

---

## Test Execution Log Template

```markdown
### Test Run: [Date/Time]

**Test Case 1 (execution_only)**:
- Delegation call: [paste exact prompt]
- Token count: [actual count]
- Sections present: [list]
- Sections absent: [list]
- Pass/Fail: [result]
- Notes: [any deviations]

**Test Case 2 (focused)**:
- Delegation call: [paste exact prompt]
- Token count: [actual count]
- Sections present: [list]
- Sections absent: [list]
- Pass/Fail: [result]
- Notes: [any deviations]

**Test Case 3 (comprehensive)**:
- Delegation call: [paste exact prompt]
- Token count: [actual count]
- Sections present: [list]
- Pass/Fail: [result]
- Notes: [any deviations]

**Test Case 4 (default)**:
- Delegation call: [paste exact prompt]
- Token count: [actual count]
- Default depth used: [comprehensive expected]
- Pass/Fail: [result]
- Notes: [any deviations]

**Acceptance Criteria**:
- AC1-AC8: [checklist results]
- Overall: PASS/FAIL
```

---

## Notes for Test Executor

1. **Sequential Testing**: Run tests in order (1→2→3→4) to verify increasing complexity
2. **Actual Files**: Use real files from the codebase (tool/*.ts, agent/*.md) for realistic token counts
3. **Excerpt Validation**: Manually verify that excerpts match the file content at the cited lines
4. **Token Variance**: Some variance is expected based on component complexity; focus on relative savings
5. **Debugging**: If a test fails, check the analyzer's `<thinking>` section for reasoning errors
6. **Reporting**: Document all deviations from expected behavior, even minor ones, for pattern analysis
