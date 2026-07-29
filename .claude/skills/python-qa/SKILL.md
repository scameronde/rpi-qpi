---
name: python-qa
description: Python code quality analysis using ruff, pyright, bandit, and interrogate. Use when asked to review Python code quality, run a Python QA pass, or audit a .py file or module.
allowed-tools: Bash, Read, Grep, Glob, Write, Agent   # no Edit — a reviewer must not fix what it reviews
---

# Python QA Skill

This skill provides consolidated reference material for Python code quality analysis workflows.

## QA Tool Commands

Execute in parallel using Bash tool:

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

## Delegation

Delegate when a question needs breadth you should not spend your own context on. Do **not** delegate a file whose path you already have — reading it yourself is cheaper than a subagent dispatch. Record every call you make in the **Delegation Log** section of the **Audit Trail**.

```
Agent tool:
  subagent_type: "codebase-locator"
  description: "Find test files for [target]"
  prompt: "Locate the test files covering [target]. Search scope: tests_only."
```

```
Agent tool:
  subagent_type: "codebase-pattern-finder"
  description: "Find [pattern] variations"
  prompt: "Find every occurrence of [pattern] under [scope]. Return concrete excerpts with file:line."
```

```
Agent tool:
  subagent_type: "codebase-analyzer"
  description: "Trace [function]"
  prompt: "Trace the execution path of [function] in [file]. Output scope: execution_only."
```

```
Agent tool:
  subagent_type: "web-search-researcher"
  description: "Research [topic]"
  prompt: "[Specific question about a library, API or Python idiom]. Verify against authoritative sources."
```

## Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target]-Python.md` using this exact template (note: `-Python` is this skill's lens token):

```markdown
---
date: YYYY-MM-DD
message_type: QA_REPORT
target: "[module or file name]"
status: complete
upstream-artifact: none
---

# Python QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path]
- Auditor: python-qa
- Tools: ruff, pyright, bandit, interrogate, manual analysis

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **Improvement Opportunities**: [count]

## Automated Tool Findings

### Documentation Coverage (Interrogate)
- **Overall Coverage**: XX%
- **Threshold**: 80%
- **Status**: [PASSED/FAILED]

#### Missing Docstrings
[List of files/functions/classes missing docstrings with file:line references]

### Security (Bandit)
[Categorized issues with file:line references]

### Type Safety (Pyright)
[Categorized issues with file:line references]

### Code Quality (Ruff)
[Categorized issues with file:line references]

## Manual Quality Analysis

### Readability Issues

**Note**: interrogate reports automated docstring coverage. This section focuses on docstring **quality** (clarity, completeness, accuracy) for existing docstrings.

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.py:line-line`
- **Excerpt:**
  ```python
  [3-6 lines of code]
  ```

### Maintainability Issues
[Evidence-based findings with file:line:excerpt]

### Testability Issues
[Evidence-based findings with file:line:excerpt]

## Improvement Plan (For Implementor)

For each finding, the **Verify** command must assert content; judgment-heavy findings take the literal `none — requires review` so `/planner` can lift the field verbatim.

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
- **Verify**: [`command` → expected result, or `none — requires review`]

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

## Audit Trail

### Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/file1.py` (XXX lines)
- `path/to/file2.py` (XXX lines)

**Scope**: [single file | module | package]

### Tool Versions and Commands

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
[All issues if <=10, else first 10 + count]

**Interrogate**: [coverage percentage + files missing docstrings]
[All missing docstrings if <=10, else first 10 + count]

**Tool Availability**: [All available | ruff missing | pyright missing | etc.]

### Delegation Log

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

### Prioritization Reasoning

**Critical Issues** (Security vulnerabilities - bandit HIGH/MEDIUM):
- [Issue description] -> QA-XXX

**High Priority Issues** (Type errors blocking type checking - pyright errors):
- [Issue description] -> QA-XXX

**Medium Priority Issues** (Testability issues, maintainability risks):
- [Issue description] -> QA-XXX

**Low Priority Issues** (Readability improvements, style consistency):
- [Issue description] -> QA-XXX

**Synthesis Decisions**:
- Grouped [related issues] into single QA-XXX task because [reason]
- Chose [recommendation approach] over [alternative] due to [trade-off]
- Deferred [issue] to separate task because [reason]
```

## Baseline Verification Commands

These commands assert the end state after every phase has landed. `/implement` runs them once after the final wave:

```bash
ruff check [target]
pyright [target]
bandit -r [target]
pytest [target] --cov=[target]
```
