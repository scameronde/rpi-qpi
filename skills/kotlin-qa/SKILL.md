---
name: kotlin-qa
description: "Kotlin code quality analysis tools, prioritization rules, and report templates for QA workflow"
license: MIT
allowed-tools:
  - bash
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# Kotlin QA Skill

This skill provides consolidated reference material for Kotlin code quality analysis workflows.

## QA Tool Commands

Execute using bash tool (Gradle recommended for Kotlin projects):

### Gradle-Based Projects (Recommended)

```bash
# Code formatting (ktlint)
./gradlew ktlintCheck

# Static analysis (detekt - covers linting, security, docs, dead code)
./gradlew detekt

# Type checking (kotlinc via Gradle)
./gradlew compileKotlin
./gradlew compileTestKotlin

# Test coverage (Kover - recommended for new projects)
./gradlew test koverHtmlReport
./gradlew koverVerify

# Alternative: JaCoCo coverage (legacy codebases)
./gradlew test jacocoTestReport
./gradlew jacocoTestCoverageVerification
```

### Standalone CLI (Alternative)

```bash
# Code formatting
ktlint

# Static analysis
detekt --config detekt.yml --report html:reports/detekt.html

# Type checking (less common - use Gradle instead)
kotlinc src/main/kotlin -d build/classes

# Test coverage (N/A - use Gradle)
```

**Tool Availability Check:**
- Check for Gradle wrapper: `./gradlew --version`
- Standalone tools: `ktlint --version`, `detekt --version`, `kotlinc -version`
- Coverage tool detection: Check build.gradle.kts for `org.jetbrains.kotlinx.kover` (Kover) or `jacoco` (JaCoCo) plugins
- If tool not found, note in report "Tools unavailable" section and skip that tool

## Prioritization Hierarchy

Use this hierarchy when categorizing findings:

1. **Critical**: Configuration errors preventing compilation (kotlinc errors, invalid detekt config)
2. **High**: Type safety violations (detekt potential-bugs rule set: unsafe casts, platform types, nullable violations)
3. **Medium**: Testability issues, maintainability risks, dead code (detekt complexity rules, UnusedPrivateMember, test coverage gaps)
4. **Low**: Readability improvements, style consistency (ktlint violations, naming conventions)

## Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

```markdown
<thinking>
## Phase 1: Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/file1.kt` (XXX lines)
- `path/to/file2.kts` (XXX lines)

**Scope**: [single file | module | package]

## Phase 2: Automated Tool Execution

**Tool Versions**:
- Gradle: X.X.X
- ktlint: X.X.X
- detekt: X.X.X
- kotlinc: X.X.X
- Kover: X.X.X (or JaCoCo: X.X.X)

**Commands Executed**:
```bash
./gradlew ktlintCheck
./gradlew detekt
./gradlew compileKotlin compileTestKotlin
./gradlew test koverHtmlReport koverVerify  # or jacocoTestReport jacocoTestCoverageVerification
```

**Tool Outputs** (summarized per verbosity strategy):

**ktlint**: [status + violation count + summary]
[First 5-10 violations or category breakdown if >50 violations]

**detekt**: [status + issue count + summary by rule set]
[First 5-10 issues or category breakdown if >50 issues]
- Potential bugs: X issues
- Code complexity: Y issues
- Comments/Documentation: Z issues
- Dead code: W issues

**kotlinc**: [status + compilation error count + summary]
[First 5-10 errors or category breakdown if >50 errors]

**Kover** (or JaCoCo): [coverage percentage + uncovered lines summary]
[Module-level breakdown if multiple modules]

**Tool Availability**: [All available | ktlint missing | detekt missing | etc.]

## Phase 3: File Analysis

**Files Read** (with line ranges):
- `path/to/file1.kt:1-150`
- `path/to/file2.kt:1-87`

**Analysis Categories Performed**:
- Readability: [Function length, KDoc quality, variable naming, complex conditionals]
- Maintainability: [Code duplication, magic numbers, imports, module cohesion, hard-coded config]
- Type Safety: [Null safety patterns (!!, ?., ?.let), platform type handling, smart cast limitations, generic constraints]
- Kotlin Idioms: [Extension functions, data classes, sealed classes, coroutine usage]
- Testability: [Missing tests, tight coupling, DI patterns, coverage gaps]

**Issue Counts by Category**:
- Readability: X issues
- Maintainability: Y issues
- Type Safety: Z issues
- Kotlin Idioms: W issues
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
   - Task: Trace execution path for [function/class]
   - Response: [X execution steps identified]
   - Key findings: [summary]

4. **web-search-researcher**:
   - Task: Research [topic]
   - Response: [confidence level + sources]
   - Key findings: [summary]

## Phase 5: Prioritization and Synthesis

**Prioritization Reasoning**:

**Critical Issues** (Configuration errors preventing compilation):
- [Issue description] → QA-XXX

**High Priority Issues** (Type safety violations - detekt potential-bugs, kotlinc errors):
- [Issue description] → QA-XXX

**Medium Priority Issues** (Testability issues, maintainability risks, dead code):
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
qa_agent: kotlin-qa-thorough
qa_agent_version: "1.0"
target_path: [path/to/target]
target_type: [file | module | package]
overall_status: [Pass | Conditional Pass | Fail]
critical_issues: [count]
high_priority_issues: [count]
medium_priority_issues: [count]
low_priority_issues: [count]
tools_used: [ktlint, detekt, kotlinc, kover/jacoco, manual]
tools_unavailable: [list or "none"]
---

# Kotlin QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path]
- Auditor: kotlin-qa-thorough
- Tools: ktlint, detekt, kotlinc, Kover (or JaCoCo), manual analysis

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **Improvement Opportunities**: [count]

## Automated Tool Findings

### 📋 Code Formatting (ktlint)
- **Status**: [PASSED/FAILED]
- **Violations**: [count]

#### Formatting Violations
[List of violations with file:line references]

### 🛡️ Static Analysis (detekt)

**Overall Status**: [PASSED/FAILED]
**Total Issues**: [count]

#### Potential Bugs (High Priority)
- **UnsafeCallOnNullableType**: [count] (unsafe !! operator usage)
- **HasPlatformType**: [count] (unhandled Java interop)
- **UnsafeCast**: [count] (unsafe type casts)
[List with file:line references]

#### Code Complexity (Medium Priority)
- **ComplexMethod**: [count]
- **LongMethod**: [count]
- **TooManyFunctions**: [count]
[List with file:line references]

#### Documentation Coverage (Medium Priority)
**Note**: detekt provides binary documentation coverage (documented/undocumented), not percentage metrics.

- **UndocumentedPublicClass**: [count]
- **UndocumentedPublicFunction**: [count]
- **UndocumentedPublicProperty**: [count]
[List with file:line references]

#### Dead Code (Medium Priority)
- **UnusedPrivateMember**: [count]
- **UnreachableCode**: [count]
[List with file:line references]

### 🔷 Type Safety (kotlinc)
- **Status**: [PASSED/FAILED]
- **Compilation Errors**: [count]

#### Compilation Errors
[List of errors with file:line references]

### 📊 Test Coverage (Kover)
- **Overall Coverage**: XX%
- **Line Coverage**: XX%
- **Branch Coverage**: XX%
- **Status**: [PASSED/FAILED]

#### Module Coverage Breakdown
[Per-module or per-package coverage statistics]

#### Uncovered Code
[List of files/functions with low coverage, file:line references]

### 📊 Test Coverage (JaCoCo) - Alternative
- **Overall Coverage**: XX%
- **Line Coverage**: XX%
- **Branch Coverage**: XX%
- **Status**: [PASSED/FAILED]

#### Coverage Breakdown
[Per-package coverage statistics]

#### Uncovered Code
[List of files/functions with low coverage, file:line references]

## Manual Quality Analysis

### 📖 Readability Issues

**Note**: detekt reports binary documentation coverage. This section focuses on KDoc **quality** (clarity, completeness, accuracy) for existing documentation.

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.kt:line-line`
- **Excerpt:** 
  ```kotlin
  [3-6 lines of code]
  ```

### 🔧 Maintainability Issues
[Evidence-based findings with file:line:excerpt]

### 🔒 Type Safety Issues

**Note**: This section covers manual type safety analysis beyond kotlinc errors and detekt potential-bugs rules.

Focus areas:
- **Null Safety Patterns**: Overuse of `!!` operator, missing safe calls (`?.`), prefer `?.let` over manual null checks
- **Platform Type Handling**: Java interop exposing platform types (`String!`), missing explicit nullability annotations
- **Smart Cast Limitations**: Unsafe assumptions about smart casts, mutable properties preventing smart casts
- **Generic Type Constraints**: Missing generic constraints, overly broad type parameters

[Evidence-based findings with file:line:excerpt]

### 🎯 Kotlin Idioms (Low Priority)

**Note**: Kotlin best practices and idiomatic patterns. Focus on correctness and maintainability, not style preferences.

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.kt:line-line`
- **Excerpt:** 
  ```kotlin
  [3-6 lines of code]
  ```

### 🧪 Testability Issues
[Evidence-based findings with file:line:excerpt]

## Improvement Plan (For Implementor)

### QA-001: [Issue Title]
- **Priority**: Critical/High/Medium/Low
- **Category**: Compilation/Types/Security/Readability/Maintainability/Testability
- **File(s)**: `path/to/file.kt:line-line`
- **Issue**: [Detailed description]
- **Evidence**: 
  ```kotlin
  [Excerpt from file or tool output]
  ```
- **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
- **Done When**: [Observable condition]

[Repeat for each issue]

## Acceptance Criteria
- [ ] All critical compilation errors resolved
- [ ] All type safety violations fixed
- [ ] Public APIs have KDoc documentation
- [ ] Test coverage meets threshold (e.g., 80%)
- [ ] [Additional criteria based on findings]

## Implementor Checklist
- [ ] QA-001: [Short title]
- [ ] QA-002: [Short title]
[etc.]

## References
- ktlint output: [violation count and summary]
- detekt output: [summary]
- kotlinc output: [error count and summary]
- Kover/JaCoCo output: [coverage percentage]
- Files analyzed: [list]
- Subagents used: [list with tasks delegated]
</answer>
```

## Baseline Verification Commands

For Planner to include in implementation plans:

```bash
./gradlew ktlintCheck  # Should pass after Phase 1 (formatting)
./gradlew compileKotlin compileTestKotlin  # Should pass after Phase 2 (type safety)
./gradlew detekt  # Should pass after Phase 2 (static analysis)
./gradlew test koverVerify  # Should pass after Phase 3 (coverage - or jacocoTestCoverageVerification)
```
