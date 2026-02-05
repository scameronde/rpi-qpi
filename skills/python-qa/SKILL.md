---
name: python-qa
description: "Python code quality analysis tools, prioritization rules, and report templates for QA workflow"
license: MIT
allowed-tools:
  - bash
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# Python QA Skill

This skill provides consolidated reference material for Python code quality analysis workflows.

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

## Prioritization Hierarchy

Use this hierarchy when categorizing findings:

1. **Critical**: Security vulnerabilities (bandit HIGH/MEDIUM severity)
2. **High**: Type errors blocking type checking (pyright errors)
3. **Medium**: Testability issues, maintainability risks (ruff complexity rules C901+, interrogate coverage gaps)
4. **Low**: Readability improvements, style consistency (ruff style rules E501, N806)

## Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

```markdown
<thinking>
## Phase 1: Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/file1.py` (XXX lines)
- `path/to/file2.py` (XXX lines)

**Scope**: [single file | module | package]

## Phase 2: Automated Tool Execution

**Tool Versions**:
- ruff: X.X.X
- pyright: X.X.X
- bandit: X.X.X
- interrogate: X.X.X

**Commands Executed**:
```bash
ruff check [target]
pyright [target]
bandit -r [target]
interrogate --fail-under 80 -vv --omit-covered-files --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
```

**Tool Outputs** (summarized per verbosity strategy):

**Ruff**: [status + issue count + summary]
[First 5-10 issues or category breakdown if >50 issues]

**Pyright**: [status + error count + summary]
[First 5-10 errors or category breakdown if >50 errors]

**Bandit**: [status + security issue count + summary]
[All issues if ≤10, else first 10 + count]

**Interrogate**: [coverage percentage + files missing docstrings]
[All missing docstrings if ≤10, else first 10 + count]

**Tool Availability**: [All available | ruff missing | pyright missing | etc.]

## Phase 3: File Analysis

**Files Read** (with line ranges):
- `path/to/file1.py:1-150`
- `path/to/file2.py:1-87`

**Analysis Categories Performed**:
- Readability: [Function length, docstring quality, variable naming, complex conditionals]
- Maintainability: [Code duplication, magic numbers, imports, module cohesion, hard-coded config]
- Testability: [Missing tests, tight coupling, DI patterns, coverage gaps]

**Issue Counts by Category**:
- Readability: X issues
- Maintainability: Y issues
- Testability: Z issues

## Phase 4: Delegation Log

**Subagent Invocations**:

1. **codebase-locator** (tests_only scope):
   - Task: Find test files for [target]
   - Response: [X test files found | No test files found]
   - Files: [list]

2. **codebase-pattern-finder**:
   - Task: Find duplicate [pattern] across [scope]
   - Response: [X variations found in Y files]
   - Variations: [list with frequencies]

3. **codebase-analyzer** (execution_only depth):
   - Task: Trace execution path for [function/class]
   - Response: [X execution steps identified]
   - Key findings: [summary]

4. **web-search-researcher**:
   - Task: Research [topic]
   - Response: [confidence level + sources]
   - Key findings: [summary]

## Phase 5: Prioritization and Synthesis

**Prioritization Reasoning**:

**Critical Issues** (Security vulnerabilities - bandit HIGH/MEDIUM):
- [Issue description] → QA-XXX

**High Priority Issues** (Type errors blocking type checking - pyright errors):
- [Issue description] → QA-XXX

**Medium Priority Issues** (Testability issues, maintainability risks):
- [Issue description] → QA-XXX

**Low Priority Issues** (Readability improvements, style consistency):
- [Issue description] → QA-XXX

**Synthesis Decisions**:
- Grouped [related issues] into single QA-XXX task because [reason]
- Chose [recommendation approach] over [alternative] due to [trade-off]
- Deferred [issue] to separate task because [reason]
</thinking>

<answer>
---
message_id: qa-thorough-YYYY-MM-DD-NNN
correlation_id: [workflow-id or user-request-id]
timestamp: YYYY-MM-DDTHH:MM:SSZ
message_type: QA_REPORT  # Fixed value for QA analysis reports
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

# Python QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path]
- Auditor: python-qa-thorough
- Tools: ruff, pyright, bandit, interrogate, manual analysis

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **Improvement Opportunities**: [count]

## Automated Tool Findings

### 📚 Documentation Coverage (Interrogate)
- **Overall Coverage**: XX%
- **Threshold**: 80%
- **Status**: [PASSED/FAILED]

#### Missing Docstrings
[List of files/functions/classes missing docstrings with file:line references]

### 🛡️ Security (Bandit)
[Categorized issues with file:line references]

### 📐 Type Safety (Pyright)
[Categorized issues with file:line references]

### 🧹 Code Quality (Ruff)
[Categorized issues with file:line references]

## Manual Quality Analysis

### 📖 Readability Issues

**Note**: interrogate reports automated docstring coverage. This section focuses on docstring **quality** (clarity, completeness, accuracy) for existing docstrings.

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.py:line-line`
- **Excerpt:** 
  ```python
  [3-6 lines of code]
  ```

### 🔧 Maintainability Issues
[Evidence-based findings with file:line:excerpt]

### 🧪 Testability Issues
[Evidence-based findings with file:line:excerpt]

## Improvement Plan (For Implementor)

### QA-001: [Issue Title]
- **Priority**: Critical/High/Medium/Low
- **Category**: Security/Types/Readability/Maintainability/Testability
- **File(s)**: `path/to/file.py:line-line`
- **Issue**: [Detailed description]
- **Evidence**: 
  ```python
  [Excerpt from file or tool output]
  ```
- **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
- **Done When**: [Observable condition]

[Repeat for each issue]

## Acceptance Criteria
- [ ] All critical security issues resolved
- [ ] All type errors fixed
- [ ] Public APIs have docstrings
- [ ] Test coverage for new/modified modules
- [ ] [Additional criteria based on findings]

## Implementor Checklist
- [ ] QA-001: [Short title]
- [ ] QA-002: [Short title]
[etc.]

## References
- Interrogate output: [coverage percentage and summary]
- Ruff output: [summary]
- Pyright output: [summary]
- Bandit output: [summary]
- Files analyzed: [list]
- Subagents used: [list with tasks delegated]
</answer>
```

## Baseline Verification Commands

For Planner to include in implementation plans:

```bash
ruff check [target]  # Should pass after Phase 1
pyright [target]  # Should pass after Phase 2
bandit -r [target]  # Should pass after Phase 1
pytest [target] --cov=[target]  # Should pass after Phase 2
```
