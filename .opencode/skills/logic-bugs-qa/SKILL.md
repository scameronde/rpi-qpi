---
name: logic-bugs-qa
description: "Language-agnostic logic bug detection through manual code analysis and execution flow tracing"
license: MIT
allowed-tools:
  - bash
  - read
  - task  # For codebase-analyzer delegation
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# Logic Bugs QA Skill

This skill provides a systematic framework for detecting logic errors and coding bugs that automated tools cannot find.

## Analysis Categories

### 1. Control Flow Issues

**What to look for:**
- Off-by-one errors in loops (`< vs <=`, array index boundaries)
- Incorrect loop termination conditions (infinite loops, early exit)
- Missing break/continue/return in switch/match statements
- Unreachable code after return/throw/break
- Incorrect boolean logic in conditionals (`&& vs ||`, De Morgan's laws)
- Missing else branches for critical paths

**Delegation:** Use codebase-analyzer (comprehensive depth) to trace execution paths

### 2. Data Handling Issues

**What to look for:**
- Null/undefined/None dereference without checks
- Uninitialized variables used before assignment
- Type coercion bugs (implicit conversions, truthiness)
- Integer overflow/underflow in arithmetic
- Floating point precision issues (equality comparisons, accumulation)
- Array/list index out of bounds
- String manipulation edge cases (empty strings, Unicode)

**Delegation:** Use codebase-analyzer to examine data model and transformations

### 3. Concurrency Issues

**What to look for:**
- Race conditions (shared state without synchronization)
- Deadlocks (circular wait on locks)
- Missing synchronization on shared resources
- Thread-unsafe operations (non-atomic read-modify-write)
- Missing volatile/atomic flags
- Incorrect lock granularity (too coarse/too fine)

**Delegation:** Use codebase-pattern-finder to find all synchronization patterns

### 4. Error Handling Issues

**What to look for:**
- Swallowed exceptions (empty catch blocks, ignored errors)
- Missing error checks on fallible operations
- Incorrect error recovery (partial rollback, inconsistent state)
- Resource leaks on error paths (unclosed files, connections)
- Error masking (catching broad exceptions, re-raising wrong type)
- Missing cleanup in finally/defer/RAII

**Delegation:** Use codebase-pattern-finder to find error handling patterns

### 5. Algorithm Correctness Issues

**What to look for:**
- Incorrect assumptions about input (range, format, ordering)
- Missing edge case handling (empty collections, single element)
- Wrong algorithm complexity (nested loops, redundant work)
- Incorrect data structure choice (list vs set, map vs array)
- Mutable state in functions assumed pure
- Incorrect recursion (missing base case, wrong reduction)

**Delegation:** Use codebase-analyzer (comprehensive) to understand algorithm logic

### 6. Boundary and Edge Cases

**What to look for:**
- Min/max value handling (INT_MIN, INT_MAX, empty string)
- Empty collection handling (arrays, maps, sets)
- Single-element collection handling
- Large input handling (performance degradation, memory)
- Special values (null, NaN, infinity, -0)
- Timezone/locale-specific bugs

**Delegation:** Use codebase-analyzer to identify edge case branches

### 7. State Management Issues

**What to look for:**
- Incorrect initialization order (dependency on uninitialized state)
- State mutation side effects (unexpected changes)
- Stale state (caching without invalidation)
- Missing state validation (invariants violated)
- Reentrancy bugs (function called while still executing)

**Delegation:** Use codebase-analyzer to trace state mutations

## Baseline Verification Commands

Language-agnostic test execution patterns:

### Python

```bash
# Run test suite
pytest tests/ -v
python -m unittest discover tests/

# Run with coverage
pytest --cov=src tests/
```

### TypeScript/JavaScript

```bash
# Run test suite
npm test
jest
vitest

# Run with coverage
npm test -- --coverage
```

### Java

```bash
# Maven
mvn test

# Gradle
./gradlew test
```

### Go

```bash
go test ./... -v
go test -race ./...  # Race condition detection
```

### Rust

```bash
cargo test
cargo test -- --nocapture  # Show output
```

### Other Languages

```bash
# Generic pattern: [test-runner] [test-directory]
# Verify all tests pass before analysis
# Re-run after fixes to detect regressions
```

## Prioritization Hierarchy

Use this hierarchy when categorizing findings:

1. **Critical**: Data loss, security bypass, crash/panic, memory corruption
2. **High**: Incorrect results, silent failures, exploitable edge cases
3. **Medium**: Performance issues, suboptimal algorithms, race conditions
4. **Low**: Defensive programming improvements, clarity issues

## Delegation Strategy

### Heavy Use of codebase-analyzer

- **For algorithm analysis**: Use `comprehensive` depth (need data model + edge cases + execution flow)
- **For control flow tracing**: Use `focused` depth (execution flow + dependencies)
- **For edge case identification**: Look for conditional branches in execution flow

### Selective Use of pattern-finder

- Find inconsistent error handling patterns across codebase
- Identify all synchronization/locking patterns
- Discover validation pattern variations

### Limited Use of web-search-researcher

- Research known vulnerabilities in specific algorithms
- Verify correct usage of concurrency primitives
- Look up edge cases for specific operations (floating point, Unicode, etc.)

## Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

```markdown
<thinking>
## Phase 1: Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/file.ext` (XXX lines)

**Scope**: [single function | module | feature]

## Phase 2: Baseline Verification

**Test Suite Status**:
- Command: [language-specific test command]
- Result: [X tests passed, Y failed]
- Coverage: [if available]

**Behavioral Baseline**:
- [What does the code currently do? What SHOULD it do?]
- [Any discrepancies between tests and expected behavior?]

## Phase 3: Logic Analysis

**Analysis Method**:
- Read files: [list with line ranges]
- Delegation: [codebase-analyzer calls with targets]
- Categories examined: [control flow, data handling, etc.]

**Files Read** (with line ranges):
- `path/to/file.ext:1-150`

**Analysis Findings by Category**:

### Control Flow Analysis
[List findings with file:line references]

### Data Handling Analysis
[List findings with file:line references]

### Concurrency Analysis
[List findings or "N/A - single-threaded code"]

### Error Handling Analysis
[List findings with file:line references]

### Algorithm Correctness Analysis
[List findings with file:line references]

### Boundary and Edge Cases Analysis
[List findings with file:line references]

### State Management Analysis
[List findings with file:line references]

**Issue Counts by Category**:
- Control Flow: X issues
- Data Handling: Y issues
- Concurrency: Z issues
- Error Handling: W issues
- Algorithm: V issues
- Edge Cases: U issues
- State Management: T issues

## Phase 4: Delegation Log

**Subagent Invocations**:

1. **codebase-analyzer** (comprehensive depth):
   - Task: Trace execution path for [function/method]
   - Response: [X execution steps, Y edge cases identified]
   - Key findings: [summary with file:line references]

2. **codebase-pattern-finder**:
   - Task: Find error handling patterns in [scope]
   - Response: [X variations found]
   - Key findings: [inconsistencies noted]

3. **web-search-researcher**:
   - Task: Research known issues with [algorithm/pattern]
   - Response: [confidence level + sources]
   - Key findings: [vulnerabilities or edge cases]

## Phase 5: Prioritization and Synthesis

**Prioritization Reasoning**:

**Critical Issues** (Data loss, security, crash):
- [Issue description] → LOGIC-XXX

**High Priority Issues** (Incorrect results, silent failures):
- [Issue description] → LOGIC-XXX

**Medium Priority Issues** (Performance, race conditions):
- [Issue description] → LOGIC-XXX

**Low Priority Issues** (Defensive programming):
- [Issue description] → LOGIC-XXX

**Synthesis Decisions**:
- Grouped [related issues] into single LOGIC-XXX task
- Deferred [issue] because [reason]
- Prioritized [issue] over [other] due to [severity/impact]
</thinking>

<answer>
---
message_id: logic-bugs-qa-YYYY-MM-DD-NNN
correlation_id: [workflow-id]
timestamp: YYYY-MM-DDTHH:MM:SSZ
message_type: QA_REPORT
qa_agent: logic-bugs-qa
qa_agent_version: "1.0"
target_path: [path/to/target]
target_type: [function | module | feature]
overall_status: [Pass | Conditional Pass | Fail]
critical_issues: [count]
high_priority_issues: [count]
medium_priority_issues: [count]
low_priority_issues: [count]
analysis_categories: [control-flow, data-handling, concurrency, error-handling, algorithm, edge-cases, state-management]
---

# Logic Bugs QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path/to/target]
- Auditor: logic-bugs-qa
- Analysis Type: Manual logic inspection + execution flow tracing
- Test Suite: [status]

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Logic Errors**: [count]
- **High Priority Issues**: [count]
- **Improvement Opportunities**: [count]

## Test Suite Baseline
- **Command**: [test command used]
- **Status**: [X passed, Y failed]
- **Coverage**: [if available]
- **Behavioral Notes**: [What code currently does vs expected behavior]

## Logic Analysis Findings

### 🔁 Control Flow Issues
[Evidence-based findings with file:line:excerpt]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

### 📊 Data Handling Issues
[Evidence-based findings with file:line:excerpt]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

### 🔀 Concurrency Issues
[Evidence-based findings with file:line:excerpt OR "N/A - single-threaded"]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

### ⚠️ Error Handling Issues
[Evidence-based findings with file:line:excerpt]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

### 🧮 Algorithm Correctness Issues
[Evidence-based findings with file:line:excerpt]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

### 🎯 Boundary and Edge Cases
[Evidence-based findings with file:line:excerpt]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

### 🔄 State Management Issues
[Evidence-based findings with file:line:excerpt]

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:**
  ```[language]
  [3-6 lines of code]
  ```

## Improvement Plan (For Implementor)

### LOGIC-001: [Issue Title]
- **Priority**: Critical/High/Medium/Low
- **Category**: Control Flow | Data Handling | Concurrency | Error Handling | Algorithm | Edge Cases | State Management
- **File(s)**: `path/to/file.ext:line-line`
- **Issue**: [What is wrong with the logic?]
- **Evidence**:
  ```[language]
  [Code excerpt showing the bug]
  ```
- **Expected Behavior**: [What SHOULD happen?]
- **Actual Behavior**: [What DOES happen?]
- **Recommendation**: [Specific fix - be precise]
- **Test Case**: [Specific input that triggers the bug OR new test to add]
- **Done When**: All tests pass + new test case added

[Repeat for each issue]

## Acceptance Criteria
- [ ] All critical logic errors fixed
- [ ] All high priority issues addressed
- [ ] New test cases added for discovered edge cases
- [ ] Test suite passes (no regressions)
- [ ] [Additional criteria based on findings]

## Implementor Checklist
- [ ] LOGIC-001: [Short title]
- [ ] LOGIC-002: [Short title]
[etc.]

## References
- Test suite output: [summary]
- Files analyzed: [list with line ranges]
- Subagents used: [list with correlation IDs]
- Execution flows traced: [list of functions/methods analyzed]
</answer>
```

## Verification Commands for Planner

Since logic bugs are verified through tests, not linters, include these in implementation plans:

```bash
# Phase 1: Establish Baseline
[language-specific-test-command]  # Should pass (or document failures)

# Phase 2: After Each Fix
[language-specific-test-command]  # Should still pass (regression check)

# Phase 3: Final Verification
[language-specific-test-command]  # All tests pass + new tests added
[coverage-command]  # Coverage increased for fixed logic paths
```

## Common Bug Patterns Reference

See `references/common-bug-patterns.md` for detailed examples.

### Quick Reference

**Off-By-One Errors:**
```python
# Incorrect
for i in range(len(arr)):
    if arr[i+1] > threshold:  # IndexError on last iteration!

# Correct
for i in range(len(arr) - 1):
    if arr[i+1] > threshold:
```

**Null Dereference:**
```javascript
// Incorrect
function processUser(user) {
    return user.profile.name.toUpperCase();  // Crash if profile or name is undefined!
}

// Correct
function processUser(user) {
    return user?.profile?.name?.toUpperCase() ?? "Unknown";
}
```

**Race Conditions:**
```python
# Incorrect
if file_exists(path):
    data = read_file(path)  # File might be deleted between check and read!

# Correct
try:
    data = read_file(path)
except FileNotFoundError:
    handle_missing_file()
```

**Boolean Logic (De Morgan's Laws):**
```javascript
// Incorrect
if (!(isValid && isActive)) {
    // Intended: reject if BOTH invalid AND inactive
    // Actual: reject if EITHER invalid OR inactive
}

// Correct
if (!isValid && !isActive) {
    // Now correctly checks both conditions
}
```

**Integer Overflow:**
```java
// Incorrect
int sum = a + b;  // May overflow silently

// Correct
long sum = (long)a + (long)b;
if (sum > Integer.MAX_VALUE || sum < Integer.MIN_VALUE) {
    throw new ArithmeticException("Integer overflow");
}
```

**Floating Point Equality:**
```python
# Incorrect
if (a / b) == 0.1:  # May never be true due to precision

# Correct
import math
if math.isclose(a / b, 0.1, rel_tol=1e-9):
```

**Resource Leaks:**
```python
# Incorrect
file = open(path)
data = file.read()  # If exception occurs, file never closed!

# Correct
with open(path) as file:
    data = file.read()
```
