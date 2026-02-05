---
name: typescript-qa
description: "TypeScript code quality analysis tools, prioritization rules, and report templates for QA workflow"
license: MIT
allowed-tools:
  - bash
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# TypeScript QA Skill

This skill provides consolidated reference material for TypeScript code quality analysis workflows.

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

## Prioritization Hierarchy

Use this hierarchy when categorizing findings:

1. **Critical**: Security vulnerabilities (eslint-plugin-security HIGH/MEDIUM)
2. **High**: Type errors blocking compilation (tsc errors)
3. **Medium**: Testability issues, maintainability risks, dead code (eslint complexity, knip findings)
4. **Low**: Readability improvements, style consistency, React patterns

## Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

```markdown
<thinking>
## Phase 1: Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/file1.ts` (XXX lines)
- `path/to/file2.tsx` (XXX lines)

**Scope**: [single file | module | package]

## Phase 2: Automated Tool Execution

**Tool Versions**:
- tsc: X.X.X
- eslint: X.X.X
- knip: X.X.X
- eslint-plugin-security: X.X.X (if available)
- eslint-plugin-jsdoc: X.X.X (if available)

**Commands Executed**:
```bash
npx tsc --noEmit --pretty false
npx eslint . --ext .ts,.tsx --format json
npx knip --reporter json
npx eslint . --ext .ts,.tsx --plugin security --format json  # if available
npx eslint . --ext .ts,.tsx --plugin jsdoc --format json  # if available
```

**Tool Outputs** (summarized per verbosity strategy):

**TypeScript Compiler**: [status + error count + summary]
[First 5-10 errors or category breakdown if >50 errors]

**ESLint**: [status + issue count + summary]
[First 5-10 issues or category breakdown if >50 issues]

**Knip**: [status + unused exports/files/deps count + summary]
[All issues if ≤10, else first 10 + count]

**ESLint Security Plugin**: [status + security issue count + summary]
[All issues if ≤10, else first 10 + count]

**ESLint JSDoc Plugin**: [coverage percentage + missing docs count]
[All missing docs if ≤10, else first 10 + count]

**Tool Availability**: [All available | eslint-plugin-security missing | etc.]

## Phase 3: File Analysis

**Files Read** (with line ranges):
- `path/to/file1.ts:1-150`
- `path/to/file2.tsx:1-87`

**Analysis Categories Performed**:
- Readability: [Function/component length, JSDoc/TSDoc quality, variable naming, complex conditionals]
- Maintainability: [Code duplication, magic numbers, imports, module cohesion, hard-coded config]
- Type Safety: [any usage, type assertions, non-null assertions, missing generic constraints, tsconfig strict mode]
- React/JSX: [Component prop typing, hook dependencies, missing keys, unsafe DOM, composition patterns]
- Testability: [Missing tests, tight coupling, DI patterns, coverage gaps]

**Issue Counts by Category**:
- Readability: X issues
- Maintainability: Y issues
- Type Safety: Z issues
- React/JSX: W issues
- Testability: V issues

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
   - Task: Trace execution path for [function/component]
   - Response: [X execution steps identified]
   - Key findings: [summary]

4. **web-search-researcher**:
   - Task: Research [topic]
   - Response: [confidence level + sources]
   - Key findings: [summary]

## Phase 5: Prioritization and Synthesis

**Prioritization Reasoning**:

**Critical Issues** (Security vulnerabilities - eslint-plugin-security HIGH/MEDIUM):
- [Issue description] → QA-XXX

**High Priority Issues** (Type errors blocking compilation - tsc errors):
- [Issue description] → QA-XXX

**Medium Priority Issues** (Testability issues, maintainability risks, dead code):
- [Issue description] → QA-XXX

**Low Priority Issues** (Readability improvements, style consistency, React patterns):
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
qa_agent: typescript-qa-thorough
qa_agent_version: "1.0"
target_path: [path/to/target]
target_type: [file | module | package]
overall_status: [Pass | Conditional Pass | Fail]
critical_issues: [count]
high_priority_issues: [count]
medium_priority_issues: [count]
low_priority_issues: [count]
tools_used: [tsc, eslint, knip, eslint-plugin-security, eslint-plugin-jsdoc, manual]
tools_unavailable: [list or "none"]
---

# TypeScript QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path]
- Auditor: typescript-qa-thorough
- Tools: tsc, eslint, knip, manual analysis

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **Improvement Opportunities**: [count]

## Automated Tool Findings

### 🔷 Type Safety (TypeScript Compiler)
- **Status**: [PASSED/FAILED]
- **Errors**: [count]

#### Type Errors
[List of type errors with file:line references]

### 📚 Documentation Coverage (ESLint JSDoc Plugin)
- **Overall Coverage**: [if measurable]
- **Status**: [PASSED/FAILED]

#### Missing Documentation
[List of files/functions/classes missing JSDoc with file:line references]

### 🛡️ Security (ESLint Security Plugin)
[Categorized issues with file:line references]

### 🧹 Code Quality (ESLint)
[Categorized issues with file:line references]

### 🗑️ Dead Code (Knip)
- **Unused Exports**: [count]
- **Unused Files**: [count]
- **Unused Dependencies**: [count]

[List with file:line references]

## Manual Quality Analysis

### 📖 Readability Issues

**Note**: ESLint plugin reports automated JSDoc coverage. This section focuses on JSDoc/TSDoc **quality** (clarity, completeness, accuracy) for existing documentation.

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.ts:line-line`
- **Excerpt:** 
  ```typescript
  [3-6 lines of code]
  ```

### 🔧 Maintainability Issues
[Evidence-based findings with file:line:excerpt]

### 🔒 Type Safety Issues

**Note**: This section covers manual type safety analysis beyond tsc errors (patterns, configurations, best practices).

[Evidence-based findings with file:line:excerpt]

### ⚛️ React/JSX Issues (Low Priority)

**Note**: React patterns reported here are minor concerns. Focus on correctness, not style preferences.

[Evidence-based findings with file:line:excerpt]

### 🧪 Testability Issues
[Evidence-based findings with file:line:excerpt]

## Improvement Plan (For Implementor)

### QA-001: [Issue Title]
- **Priority**: Critical/High/Medium/Low
- **Category**: Security/Types/Readability/Maintainability/Testability/React
- **File(s)**: `path/to/file.ts:line-line`
- **Issue**: [Detailed description]
- **Evidence**: 
  ```typescript
  [Excerpt from file or tool output]
  ```
- **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
- **Done When**: [Observable condition]

[Repeat for each issue]

## Acceptance Criteria
- [ ] All critical security issues resolved
- [ ] All type errors fixed
- [ ] Public APIs have JSDoc/TSDoc
- [ ] Test coverage for new/modified modules
- [ ] [Additional criteria based on findings]

## Implementor Checklist
- [ ] QA-001: [Short title]
- [ ] QA-002: [Short title]
[etc.]

## References
- TypeScript compiler output: [error count and summary]
- ESLint output: [summary]
- Knip output: [summary]
- Files analyzed: [list]
- Subagents used: [list with tasks delegated]
</answer>
```

## Baseline Verification Commands

For Planner to include in implementation plans:

```bash
npx tsc --noEmit  # Should pass after Phase 1
npx eslint . --ext .ts,.tsx  # Should pass after Phase 2
npx knip  # Should pass after Phase 3
npm test -- --coverage  # Should pass after Phase 2
```
