---
name: java-qa
description: "Java code quality analysis tools, prioritization rules, and report templates for QA workflow"
license: MIT
allowed-tools:
  - bash
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# Java QA Skill

This skill provides consolidated reference material for Java code quality analysis workflows.

## QA Tool Commands

Java projects use both **Maven** and **Gradle** build systems. Commands are provided for both.

### Maven-Based Projects

Execute in parallel using bash tool (where applicable):

```bash
# Code style (Checkstyle)
mvn checkstyle:check

# Code quality (PMD)
mvn compile pmd:check

# Security and bugs (SpotBugs with find-sec-bugs plugin)
mvn spotbugs:check

# Type checking (javac)
mvn compile

# Test coverage (JaCoCo)
mvn clean test jacoco:report
mvn jacoco:check

# Documentation validation (DocLint - validation only, no coverage metrics)
mvn javadoc:javadoc -Ddoclint=all

# Dead code detection
mvn compile pmd:pmd  # Unused variables/methods/imports
mvn dependency:analyze  # Unused dependencies
```

**Note on Error Prone:** If configured, runs automatically during `mvn compile` (compile-time plugin).

**Tool Availability Check:**
```bash
mvn checkstyle:help -Ddetail=true
mvn pmd:help -Ddetail=true
mvn spotbugs:help -Ddetail=true
mvn compiler:help -Ddetail=true
mvn jacoco:help -Ddetail=true
mvn javadoc:help -Ddetail=true
mvn dependency:help -Ddetail=true
```

**Tool Specialization (to avoid duplicate warnings):**
- **Checkstyle:** Code formatting, naming conventions, import organization, JavaDoc presence
- **PMD:** Code smells, complexity, best practices, unused code (variables/methods/imports)
- **SpotBugs + find-sec-bugs:** Bug patterns, concurrency issues, security vulnerabilities (OWASP Top 10)
- **Error Prone:** Common Java API misuse, type safety issues (compile-time enforcement)

### Gradle-Based Projects

Execute in parallel using bash tool (where applicable):

```bash
# Code style (Checkstyle)
./gradlew checkstyleMain checkstyleTest

# Code quality (PMD)
./gradlew pmdMain pmdTest

# Security and bugs (SpotBugs with find-sec-bugs plugin)
./gradlew spotbugsMain spotbugsTest

# Type checking (javac)
./gradlew compileJava compileTestJava

# Test coverage (JaCoCo)
./gradlew test jacocoTestReport
./gradlew jacocoTestCoverageVerification

# Documentation validation (DocLint - validation only, no coverage metrics)
./gradlew javadoc -Pdoclint=all

# Dead code detection
./gradlew pmdMain  # Unused variables/methods/imports
./gradlew buildHealth  # Unused dependencies (requires dependency-analysis-gradle-plugin)
```

**Note on Error Prone:** If configured, runs automatically during `./gradlew compileJava` (compile-time plugin).

**Tool Availability Check:**
```bash
./gradlew --version
./gradlew tasks --group verification
```

## Prioritization Hierarchy

Use this hierarchy when categorizing findings:

1. **Critical**: Security vulnerabilities (SpotBugs + find-sec-bugs HIGH/MEDIUM severity)
2. **High**: Compilation errors (javac errors, Error Prone errors blocking compilation)
3. **Medium**: Code quality issues (PMD complexity rules C901+), testability issues, dead code (unused dependencies)
4. **Low**: Style consistency (Checkstyle violations), readability improvements (PMD style rules)

## Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

```markdown
<thinking>
## Phase 1: Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/File1.java` (XXX lines)
- `path/to/File2.java` (XXX lines)

**Scope**: [single file | module | package]

## Phase 2: Automated Tool Execution

**Tool Versions**:
- Checkstyle: X.X.X
- PMD: X.X.X
- SpotBugs: X.X.X (with find-sec-bugs X.X.X)
- javac: X.X.X
- JaCoCo: X.X.X
- DocLint: X.X.X
- Maven Dependency Plugin: X.X.X (Maven) OR Dependency Analysis Plugin: X.X.X (Gradle)

**Commands Executed** (Maven OR Gradle):
```bash
# Maven
mvn checkstyle:check
mvn compile pmd:check
mvn spotbugs:check
mvn compile
mvn clean test jacoco:report && mvn jacoco:check
mvn javadoc:javadoc -Ddoclint=all
mvn dependency:analyze

# Gradle
./gradlew checkstyleMain checkstyleTest
./gradlew pmdMain pmdTest
./gradlew spotbugsMain spotbugsTest
./gradlew compileJava compileTestJava
./gradlew test jacocoTestReport jacocoTestCoverageVerification
./gradlew javadoc -Pdoclint=all
./gradlew buildHealth
```

**Tool Outputs** (summarized per verbosity strategy):

**Checkstyle**: [status + violation count + summary]
[First 5-10 violations or category breakdown if >50 violations]

**PMD**: [status + issue count + summary]
[First 5-10 issues or category breakdown if >50 issues]

**SpotBugs + find-sec-bugs**: [status + security issue count + bug count + summary]
[All security issues if ≤10, else first 10 + count]

**javac**: [status + compilation error count + summary]
[All errors if ≤10, else first 10 + count]

**JaCoCo**: [coverage percentage + threshold status]
[Branch/line coverage summary]

**DocLint**: [validation status + missing/invalid JavaDoc count]
**Note**: DocLint validates presence/correctness but does NOT provide coverage percentage metrics.
[All missing JavaDoc if ≤10, else first 10 + count]

**Dependency Analyzers**: [unused dependencies count + unused declared/undeclared summary]
[All unused deps if ≤10, else first 10 + count]

**Tool Availability**: [All available | Checkstyle missing | PMD missing | etc.]

## Phase 3: File Analysis

**Files Read** (with line ranges):
- `path/to/File1.java:1-150`
- `path/to/File2.java:1-87`

**Analysis Categories Performed**:
- Readability: [Method length, JavaDoc quality, variable naming, complex conditionals]
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
   - Task: Trace execution path for [method/class]
   - Response: [X execution steps identified]
   - Key findings: [summary]

4. **web-search-researcher**:
   - Task: Research [topic]
   - Response: [confidence level + sources]
   - Key findings: [summary]

## Phase 5: Prioritization and Synthesis

**Prioritization Reasoning**:

**Critical Issues** (Security vulnerabilities - SpotBugs + find-sec-bugs HIGH/MEDIUM):
- [Issue description] → QA-XXX

**High Priority Issues** (Compilation errors - javac/Error Prone errors):
- [Issue description] → QA-XXX

**Medium Priority Issues** (Code quality issues, testability issues, dead code):
- [Issue description] → QA-XXX

**Low Priority Issues** (Style consistency, readability improvements):
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
message_type: QA_REPORT
qa_agent: java-qa-thorough
qa_agent_version: "1.0"
target_path: [path/to/target]
target_type: [file | module | package]
overall_status: [Pass | Conditional Pass | Fail]
critical_issues: [count]
high_priority_issues: [count]
medium_priority_issues: [count]
low_priority_issues: [count]
tools_used: [checkstyle, pmd, spotbugs, javac, jacoco, doclint, dependency-analyzer, manual]
tools_unavailable: [list or "none"]
---

# Java QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path]
- Auditor: java-qa-thorough
- Tools: Checkstyle, PMD, SpotBugs (with find-sec-bugs), javac, JaCoCo, DocLint, dependency analyzers, manual analysis

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **Improvement Opportunities**: [count]

## Automated Tool Findings

### 📚 Documentation Coverage (DocLint)
- **Status**: [PASSED/FAILED]
- **Errors**: [count]

**Note**: DocLint validates JavaDoc presence and correctness but does NOT provide quantitative coverage metrics (e.g., "85% of public APIs documented").

#### Missing or Invalid JavaDoc
[List of files/methods/classes with missing or invalid JavaDoc with file:line references]

### 🛡️ Security (SpotBugs + find-sec-bugs)
[Categorized security issues with file:line references]

### 🔷 Type Safety (javac)
- **Status**: [PASSED/FAILED]
- **Errors**: [count]

#### Compilation Errors
[List of compilation errors with file:line references]

### 🧹 Code Quality (PMD)
[Categorized code quality issues (complexity, best practices, design) with file:line references]

### 🎨 Code Style (Checkstyle)
[Categorized style violations (formatting, naming, imports) with file:line references]

### 🗑️ Dead Code (Dependency Analyzers)
- **Unused Dependencies**: [count]
- **Unused Variables/Methods/Imports** (PMD): [count]

[List with file:line references]

### 📊 Test Coverage (JaCoCo)
- **Overall Coverage**: XX%
- **Threshold**: [e.g., 80%]
- **Status**: [PASSED/FAILED]

#### Coverage Details
- Line Coverage: XX%
- Branch Coverage: XX%
- Complexity Coverage: XX%

## Manual Quality Analysis

### 📖 Readability Issues

**Note**: DocLint reports automated JavaDoc coverage. This section focuses on JavaDoc **quality** (clarity, completeness, accuracy) for existing documentation.

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/File.java:line-line`
- **Excerpt:**
  ```java
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
- **File(s)**: `path/to/File.java:line-line`
- **Issue**: [Detailed description]
- **Evidence**:
  ```java
  [Excerpt from file or tool output]
  ```
- **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
- **Done When**: [Observable condition]

[Repeat for each issue]

## Acceptance Criteria
- [ ] All critical security issues resolved
- [ ] All compilation errors fixed
- [ ] Public APIs have JavaDoc
- [ ] Test coverage for new/modified modules
- [ ] [Additional criteria based on findings]

## Implementor Checklist
- [ ] QA-001: [Short title]
- [ ] QA-002: [Short title]
[etc.]

## References
- Checkstyle output: [summary]
- PMD output: [summary]
- SpotBugs + find-sec-bugs output: [summary]
- javac output: [summary]
- JaCoCo output: [coverage percentage and summary]
- DocLint output: [validation summary]
- Dependency analyzer output: [unused dependencies summary]
- Files analyzed: [list]
- Subagents used: [list with tasks delegated]
</answer>
```

## Baseline Verification Commands

For Planner to include in implementation plans:

### Maven-Based Projects

```bash
# Phase 1: Code Style and Documentation
mvn checkstyle:check  # Should pass
mvn javadoc:javadoc -Ddoclint=all  # Should pass

# Phase 2: Code Quality and Security
mvn compile pmd:check  # Should pass
mvn spotbugs:check  # Should pass

# Phase 3: Type Safety and Compilation
mvn compile  # Should compile without errors

# Phase 4: Test Coverage
mvn test jacoco:check  # Should meet coverage threshold
```

### Gradle-Based Projects

```bash
# Phase 1: Code Style and Documentation
./gradlew checkstyleMain checkstyleTest  # Should pass
./gradlew javadoc -Pdoclint=all  # Should pass

# Phase 2: Code Quality and Security
./gradlew pmdMain pmdTest  # Should pass
./gradlew spotbugsMain spotbugsTest  # Should pass

# Phase 3: Type Safety and Compilation
./gradlew compileJava compileTestJava  # Should compile without errors

# Phase 4: Test Coverage
./gradlew test jacocoTestCoverageVerification  # Should meet coverage threshold
```
