# Java QA Skill Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md`
- Reference skills:
  - `skills/python-qa/SKILL.md` (Python QA skill structure)
  - `skills/typescript-qa/SKILL.md` (TypeScript QA skill structure)
  - `skills/opencode-qa/SKILL.md` (OpenCode QA skill structure)
- User request: Create java-qa skill following existing QA skill patterns

## Verified Current State

### Fact 1: Research Report Documents Java QA Tooling
- **Fact:** Research report identifies 9 tool categories for Java QA: Checkstyle (style), PMD (code quality), SpotBugs (bugs/security), javac (type checking), JaCoCo (coverage), DocLint (documentation), dependency analyzers (dead code), Error Prone (compile-time), Google Java Format (formatting)
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:16-21`
- **Excerpt:**
  ```
  - **Core tools**: Checkstyle (style), PMD (code quality), SpotBugs (bugs/security), JaCoCo (coverage)
  - **Supplementary tools**: Error Prone (compile-time checks), Google Java Format (auto-formatter)
  - **Type checking**: javac compiler handles this natively (statically typed language)
  - **Dead code detection**: PMD + maven-dependency-plugin (Maven) or dependency-analysis-gradle-plugin (Gradle)
  ```

### Fact 2: Java Requires Dual Build System Support (Maven + Gradle)
- **Fact:** Unlike other language skills, Java requires parallel command sets for both Maven and Gradle build systems
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:43-55`
- **Excerpt:**
  ```
  - **Observation**: Unlike Kotlin (Gradle-centric) or TypeScript (npm-centric), Java projects use both Maven and Gradle nearly equally (Maven ~55%, Gradle ~45% based on 2024 surveys).
  - **Direct consequence**: java-qa skill must provide parallel command sets for both build systems, doubling the command examples compared to other language skills.
  ```

### Fact 3: Existing QA Skills Follow Consistent Template Structure
- **Fact:** All QA skills (python-qa, typescript-qa, opencode-qa) use identical structure: YAML frontmatter, 4 sections (QA Tool Commands, Prioritization Hierarchy, Report Template, Verification Commands)
- **Evidence:** `skills/python-qa/SKILL.md:1-272`, `skills/typescript-qa/SKILL.md:1-307`, `skills/opencode-qa/SKILL.md:1-174`
- **Excerpt (python-qa):**
  ```markdown
  ---
  name: python-qa
  description: "Python code quality analysis tools, prioritization rules, and report templates for QA workflow"
  license: MIT
  allowed-tools:
    - bash
    - read
  metadata:
    version: "1.0"
  ---
  
  # Python QA Skill
  
  ## QA Tool Commands
  ## Prioritization Hierarchy
  ## Report Template
  ## Baseline Verification Commands
  ```

### Fact 4: Skills Directory Exists with Consistent Structure
- **Fact:** Skills directory contains existing QA skills (python-qa, typescript-qa, opencode-qa) with SKILL.md files
- **Evidence:** Bash output from `ls -la skills/`
- **Excerpt:**
  ```
  drwxr-xr-x 1 eichens eichens  16 Feb  5 08:11 opencode-qa
  drwxr-xr-x 1 eichens eichens  16 Feb  5 08:01 python-qa
  drwxr-xr-x 1 eichens eichens  16 Feb  5 08:05 typescript-qa
  ```

### Fact 5: SpotBugs Requires find-sec-bugs Plugin for Security Scanning
- **Fact:** SpotBugs core focuses on bug detection; security vulnerability detection requires find-sec-bugs plugin dependency
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:73-88`
- **Excerpt:**
  ```
  - **Observation**: SpotBugs core focuses on bug detection, but security vulnerability detection requires the **find-sec-bugs plugin** (138+ security rules covering OWASP Top 10).
  - **Direct consequence**: java-qa skill must document find-sec-bugs as a required dependency for SpotBugs, not optional.
  ```

### Fact 6: DocLint Provides Validation Only (No Coverage Metrics)
- **Fact:** Unlike Python's interrogate, Java's built-in DocLint validates JavaDoc presence/correctness but does NOT provide quantitative coverage metrics
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:90-102`
- **Excerpt:**
  ```
  - **Observation**: Unlike Python (interrogate) or TypeScript (eslint-plugin-jsdoc), Java lacks a widely-adopted documentation coverage tool. Options include javadoc-coverage (third-party, low adoption) or built-in DocLint (validates but doesn't measure coverage).
  - **Direct consequence**: java-qa skill should recommend DocLint for validation with caveat that quantitative coverage metrics are not available via standard tooling.
  ```

### Fact 7: Error Prone Runs During Compilation (Not Post-Build)
- **Fact:** Error Prone hooks into javac as a compiler plugin, running static analysis during compilation instead of as separate post-build step
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:105-118`
- **Excerpt:**
  ```
  - **Observation**: Error Prone hooks into javac as a compiler plugin (`-Xplugin:ErrorProne`), running static analysis **during compilation** instead of as a separate post-build step.
  - **Direct consequence**: java-qa skill should categorize Error Prone separately from post-build tools (Checkstyle/PMD/SpotBugs) since it blocks compilation on violations.
  ```

### Fact 8: Recommended Tool Specialization to Avoid Overlap
- **Fact:** Research identifies tool specialization strategy: Checkstyle=style, PMD=code smells, SpotBugs=bugs/security, Error Prone=compile-time API misuse
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:1129-1154`
- **Excerpt:**
  ```
  **Checkstyle** - Focus on: Code formatting, Naming conventions, Import organization, JavaDoc presence
  **PMD** - Focus on: Code smells (complexity), Best practices, Unused code, Design issues
  **SpotBugs + find-sec-bugs** - Focus on: Bug patterns, Concurrency issues, Security vulnerabilities, OWASP Top 10
  **Error Prone** - Focus on: Common Java API misuse, Type safety issues, Compile-time preventable bugs
  ```

## Goals / Non-Goals

**Goals:**
1. Create `skills/java-qa/` directory with `SKILL.md` file following existing QA skill template
2. Document parallel Maven and Gradle command sets for all tools (Checkstyle, PMD, SpotBugs, JaCoCo, DocLint, dependency analyzers)
3. Provide prioritization hierarchy aligned with python-qa/typescript-qa patterns
4. Include comprehensive report template with thinking/answer separation and YAML frontmatter
5. Document tool specialization to avoid duplicate warnings
6. Include verification commands for both Maven and Gradle workflows

**Non-Goals:**
1. Creating actual Researcher agent prompt modifications (existing Researcher detects skills automatically)
2. Creating Planner agent modifications (existing Planner handles QA report detection)
3. Writing example Java projects or test fixtures
4. Configuring actual Maven/Gradle build files (skill documents commands only)

## Design Overview

### Skill Structure (4 Sections)

**Section 1: QA Tool Commands**
- Dual command sets (Maven + Gradle) for each tool category
- Tool availability check commands (version detection)
- Tool specialization notes to avoid overlap
- Commands grouped by tool: Checkstyle, PMD, SpotBugs+find-sec-bugs, javac, JaCoCo, DocLint, dependency analyzers
- Optional tools: Error Prone (compile-time), Google Java Format (formatting)

**Section 2: Prioritization Hierarchy**
- Critical: Security vulnerabilities (SpotBugs+find-sec-bugs HIGH/MEDIUM severity)
- High: Compilation errors (javac, Error Prone errors)
- Medium: Code quality issues (PMD complexity), testability, dead code (unused dependencies)
- Low: Style consistency (Checkstyle), readability (PMD style rules)

**Section 3: Report Template**
- Follows python-qa/typescript-qa template structure
- 5-phase thinking section (Target Discovery, Automated Tool Execution, File Analysis, Delegation Log, Prioritization)
- YAML frontmatter answer section with message_type: QA_REPORT
- Tool-specific findings sections: Documentation Coverage (DocLint), Security (SpotBugs+find-sec-bugs), Type Safety (javac), Code Quality (PMD+Checkstyle), Dead Code (dependency analyzers), Test Coverage (JaCoCo)
- Manual analysis categories: Readability, Maintainability, Testability
- Improvement Plan with QA-XXX task format

**Section 4: Baseline Verification Commands**
- Maven verification sequence (4 phases)
- Gradle verification sequence (4 phases)
- Maps to implementation plan phases for Planner agent

### Data Flow
1. Researcher agent invokes java-qa skill when detecting Java QA analysis request
2. Researcher loads skill → accesses Section 1 (QA Tool Commands)
3. Researcher executes tools in parallel (bash), captures versions and outputs
4. Researcher uses Section 2 (Prioritization Hierarchy) to categorize findings
5. Researcher writes report using Section 3 (Report Template) to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
6. Planner agent reads QA report → extracts verification commands from Section 4

## Implementation Instructions (For Implementor)

### PLAN-001: Create java-qa Skill Directory
- **Action ID:** PLAN-001
- **Change Type:** create
- **File(s):** `skills/java-qa/` (directory)
- **Instruction:** 
  1. Create directory `skills/java-qa/` at repository root
  2. Verify directory name uses kebab-case (lowercase, hyphen-separated)
  3. Ensure directory exists before proceeding to PLAN-002
- **Interfaces / Pseudocode:** N/A (directory creation)
- **Evidence:** `skills/python-qa/SKILL.md:1-12` (existing skill uses kebab-case directory name matching `name:` field in frontmatter)
- **Done When:** Directory `skills/java-qa/` exists and is empty

### PLAN-002: Create SKILL.md with YAML Frontmatter
- **Action ID:** PLAN-002
- **Change Type:** create
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Create file `skills/java-qa/SKILL.md`
  2. Add YAML frontmatter with required fields:
     - `name: java-qa` (matches directory name)
     - `description: "Java code quality analysis tools, prioritization rules, and report templates for QA workflow"`
     - `license: MIT`
     - `allowed-tools: [bash, read]` (consistent with other QA skills)
     - `metadata.version: "1.0"`
     - `metadata.author: "OpenCode Development Team"`
     - `metadata.last-updated: "2026-02-05"`
  3. Add skill title: `# Java QA Skill`
  4. Add intro paragraph: "This skill provides consolidated reference material for Java code quality analysis workflows."
- **Interfaces / Pseudocode:**
  ```yaml
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
  ```
- **Evidence:** `skills/python-qa/SKILL.md:1-16` (frontmatter structure and required fields)
- **Done When:** File exists with valid YAML frontmatter, `yamllint skills/java-qa/SKILL.md` passes

### PLAN-003: Add Section 1 - QA Tool Commands (Maven)
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Add `## QA Tool Commands` section header
  2. Add note about dual build system support: "Java projects use both Maven and Gradle. Commands are provided for both build systems."
  3. Add `### Maven-Based Projects` subsection
  4. Document commands for each tool in this order:
     - **Code Style (Checkstyle):** `mvn checkstyle:check`
     - **Code Quality (PMD):** `mvn compile pmd:check`
     - **Security and Bugs (SpotBugs):** `mvn spotbugs:check` (with find-sec-bugs note)
     - **Type Checking (javac):** `mvn compile`
     - **Test Coverage (JaCoCo):** `mvn clean test jacoco:report && mvn jacoco:check`
     - **Documentation (DocLint):** `mvn javadoc:javadoc -Ddoclint=all` (with "validation only, no coverage metrics" note)
     - **Dead Code (PMD + Dependencies):** `mvn compile pmd:pmd && mvn dependency:analyze`
     - **Compile-Time Checks (Error Prone):** Note that it runs automatically during `mvn compile` if configured
  5. Add **Tool Availability Check** subsection with version commands:
     ```bash
     mvn checkstyle:help -Ddetail=true
     mvn pmd:help -Ddetail=true
     mvn spotbugs:help -Ddetail=true
     mvn compiler:help -Ddetail=true
     mvn jacoco:help -Ddetail=true
     mvn javadoc:help -Ddetail=true
     mvn dependency:help -Ddetail=true
     ```
  6. Add **Tool Specialization Note** explaining Checkstyle=style, PMD=smells, SpotBugs=bugs/security, Error Prone=compile-time
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:998-1033` (Maven command list), `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:1129-1154` (tool specialization)
- **Done When:** Section 1 Maven subsection complete with all 7 tool commands + availability check + specialization note

### PLAN-004: Add Section 1 - QA Tool Commands (Gradle)
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Add `### Gradle-Based Projects` subsection
  2. Document parallel Gradle commands for each tool:
     - **Code Style (Checkstyle):** `./gradlew checkstyleMain checkstyleTest`
     - **Code Quality (PMD):** `./gradlew pmdMain pmdTest`
     - **Security and Bugs (SpotBugs):** `./gradlew spotbugsMain spotbugsTest` (with find-sec-bugs note)
     - **Type Checking (javac):** `./gradlew compileJava compileTestJava`
     - **Test Coverage (JaCoCo):** `./gradlew test jacocoTestReport && ./gradlew jacocoTestCoverageVerification`
     - **Documentation (DocLint):** `./gradlew javadoc -Pdoclint=all` (with "validation only" note)
     - **Dead Code (PMD + Dependencies):** `./gradlew pmdMain && ./gradlew buildHealth` (note: buildHealth requires plugin)
  3. Add note about dependency-analysis-gradle-plugin requirement for `buildHealth` task
  4. Add **Tool Availability Check** subsection:
     ```bash
     ./gradlew --version
     ./gradlew tasks --group verification
     ```
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:1035-1066` (Gradle command list)
- **Done When:** Section 1 Gradle subsection complete with all 7 tool commands + availability check

### PLAN-005: Add Section 2 - Prioritization Hierarchy
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Add `## Prioritization Hierarchy` section header
  2. Add intro: "Use this hierarchy when categorizing findings:"
  3. Define 4 priority levels (numbered list):
     - **Critical:** Security vulnerabilities (SpotBugs + find-sec-bugs HIGH/MEDIUM severity)
     - **High:** Compilation errors (javac errors, Error Prone errors blocking compilation)
     - **Medium:** Code quality issues (PMD complexity rules C901+, testability issues, dead code (unused dependencies))
     - **Low:** Style consistency (Checkstyle violations), readability improvements (PMD style rules)
  4. Ensure alignment with python-qa/typescript-qa hierarchy structure
- **Interfaces / Pseudocode:**
  ```markdown
  ## Prioritization Hierarchy
  
  Use this hierarchy when categorizing findings:
  
  1. **Critical**: Security vulnerabilities (SpotBugs + find-sec-bugs HIGH/MEDIUM severity)
  2. **High**: Compilation errors (javac errors, Error Prone errors blocking compilation)
  3. **Medium**: Code quality issues (PMD complexity rules C901+), testability issues, dead code (unused dependencies)
  4. **Low**: Style consistency (Checkstyle violations), readability improvements (PMD style rules)
  ```
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:1119-1124` (prioritization hierarchy), `skills/python-qa/SKILL.md:33-40` (python-qa hierarchy structure)
- **Done When:** Section 2 complete with 4 priority levels matching research recommendations

### PLAN-006: Add Section 3 - Report Template (Thinking Section)
- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Add `## Report Template` section header
  2. Add intro: "Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:"
  3. Open markdown code block with triple backticks
  4. Add `<thinking>` section with 5 phases (copy structure from python-qa/typescript-qa):
     - **Phase 1: Target Discovery** (target identification method, files discovered, scope)
     - **Phase 2: Automated Tool Execution** (tool versions, commands executed, tool outputs for Checkstyle/PMD/SpotBugs/javac/JaCoCo/DocLint/dependency analyzers, tool availability)
     - **Phase 3: File Analysis** (files read with line ranges, analysis categories: Readability/Maintainability/Testability, issue counts)
     - **Phase 4: Delegation Log** (subagent invocations: codebase-locator, codebase-pattern-finder, codebase-analyzer, web-search-researcher)
     - **Phase 5: Prioritization and Synthesis** (prioritization reasoning with Critical/High/Medium/Low sections, synthesis decisions)
  5. Adapt tool names from Python (ruff/pyright/bandit) to Java (Checkstyle/PMD/SpotBugs/javac/JaCoCo/DocLint)
  6. Note in Phase 2 that DocLint provides validation only (no percentage coverage like interrogate/eslint-plugin-jsdoc)
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
  ```
- **Evidence:** `skills/python-qa/SKILL.md:44-150` (python-qa thinking section structure), `skills/typescript-qa/SKILL.md:50-164` (typescript-qa thinking section structure)
- **Done When:** Section 3 thinking portion complete with all 5 phases adapted for Java tooling

### PLAN-007: Add Section 3 - Report Template (Answer Section with YAML Frontmatter)
- **Action ID:** PLAN-007
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Continue Section 3 report template (still inside markdown code block)
  2. Add `<answer>` section
  3. Add YAML frontmatter with required fields (match python-qa/typescript-qa structure):
     - `message_id: qa-thorough-YYYY-MM-DD-NNN`
     - `correlation_id: [workflow-id or user-request-id]`
     - `timestamp: YYYY-MM-DDTHH:MM:SSZ`
     - `message_type: QA_REPORT` (fixed value)
     - `qa_agent: java-qa-thorough`
     - `qa_agent_version: "1.0"`
     - `target_path: [path/to/target]`
     - `target_type: [file | module | package]`
     - `overall_status: [Pass | Conditional Pass | Fail]`
     - `critical_issues: [count]`
     - `high_priority_issues: [count]`
     - `medium_priority_issues: [count]`
     - `low_priority_issues: [count]`
     - `tools_used: [checkstyle, pmd, spotbugs, javac, jacoco, doclint, dependency-analyzer, manual]`
     - `tools_unavailable: [list or "none"]`
  4. Add main report header: `# Java QA Analysis: [Target]`
  5. Add `## Scan Metadata` section (Date, Target, Auditor, Tools)
  6. Add `## Executive Summary` section (Overall Status, Critical Issues, High Priority, Improvement Opportunities)
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
- **Evidence:** `skills/python-qa/SKILL.md:152-184` (python-qa answer section structure with YAML frontmatter)
- **Done When:** Answer section started with YAML frontmatter and initial headers matching python-qa template

### PLAN-008: Add Section 3 - Report Template (Automated Tool Findings)
- **Action ID:** PLAN-008
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Continue Section 3 report template answer section
  2. Add `## Automated Tool Findings` header
  3. Add 7 subsections (one per tool category, using emoji icons for visual consistency):
     - `### 📚 Documentation Coverage (DocLint)` - Status, Errors, Missing/Invalid JavaDoc list with file:line
     - `### 🛡️ Security (SpotBugs + find-sec-bugs)` - Categorized security issues with file:line
     - `### 🔷 Type Safety (javac)` - Status, Errors, Compilation errors list with file:line
     - `### 🧹 Code Quality (PMD)` - Categorized code quality issues with file:line
     - `### 🎨 Code Style (Checkstyle)` - Categorized style violations with file:line
     - `### 🗑️ Dead Code (Dependency Analyzers)` - Unused dependencies, unused variables/methods (from PMD) with file:line
     - `### 📊 Test Coverage (JaCoCo)` - Coverage percentage, threshold status, branch/line coverage
  4. Add note under Documentation Coverage: "DocLint validates JavaDoc presence and correctness but does NOT provide quantitative coverage metrics (e.g., '85% of public APIs documented')."
  5. Each subsection should include placeholders: `[Categorized issues with file:line references]` or `[List of issues with file:line references]`
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
- **Evidence:** `skills/python-qa/SKILL.md:186-203` (python-qa automated findings structure), `skills/typescript-qa/SKILL.md:199-227` (typescript-qa automated findings with emoji icons and multiple tool sections)
- **Done When:** Automated Tool Findings section complete with 7 tool-specific subsections matching research tool categories

### PLAN-009: Add Section 3 - Report Template (Manual Analysis and Improvement Plan)
- **Action ID:** PLAN-009
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Continue Section 3 report template answer section
  2. Add `## Manual Quality Analysis` header
  3. Add 3 subsections (matching python-qa structure):
     - `### 📖 Readability Issues` - Note: "DocLint reports automated JavaDoc coverage. This section focuses on JavaDoc **quality** (clarity, completeness, accuracy) for existing documentation."
     - `### 🔧 Maintainability Issues` - Evidence-based findings with file:line:excerpt
     - `### 🧪 Testability Issues` - Evidence-based findings with file:line:excerpt
  4. For each issue format, include:
     ```
     - **Issue:** [Description]
     - **Evidence:** `path/to/File.java:line-line`
     - **Excerpt:**
       ```java
       [3-6 lines of code]
       ```
     ```
  5. Add `## Improvement Plan (For Implementor)` header
  6. Add template for QA-XXX tasks:
     ```
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
     ```
  7. Add `## Acceptance Criteria` section with checkboxes:
     - All critical security issues resolved
     - All compilation errors fixed
     - Public APIs have JavaDoc
     - Test coverage for new/modified modules
     - [Additional criteria based on findings]
  8. Add `## Implementor Checklist` section with QA-XXX task list
  9. Add `## References` section listing tool outputs, files analyzed, subagents used
  10. Close `</answer>` tag
  11. Close markdown code block (triple backticks)
  12. Close Section 3
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
- **Evidence:** `skills/python-qa/SKILL.md:205-259` (python-qa manual analysis and improvement plan structure)
- **Done When:** Manual Analysis, Improvement Plan, Acceptance Criteria, Implementor Checklist, and References sections complete, matching python-qa template structure

### PLAN-010: Add Section 4 - Baseline Verification Commands
- **Action ID:** PLAN-010
- **Change Type:** modify
- **File(s):** `skills/java-qa/SKILL.md`
- **Instruction:**
  1. Add `## Baseline Verification Commands` section header
  2. Add intro: "For Planner to include in implementation plans:"
  3. Add `### Maven-Based Projects` subsection with 4-phase verification:
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
  4. Add `### Gradle-Based Projects` subsection with 4-phase verification:
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
  5. Ensure phase names align with python-qa/typescript-qa phase structure
- **Interfaces / Pseudocode:**
  ```markdown
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
  ```
- **Evidence:** `thoughts/shared/research/2026-02-05-Java-QA-Tool-Analysis.md:1086-1117` (verification commands grouped by phase), `skills/python-qa/SKILL.md:262-271` (python-qa verification commands structure)
- **Done When:** Section 4 complete with Maven and Gradle verification commands grouped into 4 phases

## Acceptance Criteria
- [ ] Directory `skills/java-qa/` exists with correct kebab-case naming
- [ ] File `skills/java-qa/SKILL.md` exists with valid YAML frontmatter
- [ ] `yamllint skills/java-qa/SKILL.md` passes (no YAML syntax errors)
- [ ] Skill name in frontmatter (`name: java-qa`) matches directory name
- [ ] All 4 sections present: QA Tool Commands (Maven + Gradle), Prioritization Hierarchy, Report Template, Baseline Verification Commands
- [ ] Section 1 documents all 7 tool categories with parallel Maven/Gradle commands
- [ ] Section 2 defines 4 priority levels (Critical/High/Medium/Low)
- [ ] Section 3 includes complete report template with thinking/answer separation and YAML frontmatter
- [ ] Section 4 provides 4-phase verification commands for both Maven and Gradle
- [ ] Report template includes 7 automated tool findings subsections (DocLint, SpotBugs, javac, PMD, Checkstyle, Dependency Analyzers, JaCoCo)
- [ ] Tool specialization notes included to avoid duplicate warnings (Checkstyle=style, PMD=smells, SpotBugs=bugs/security)
- [ ] DocLint limitation documented (validation only, no coverage metrics)
- [ ] find-sec-bugs plugin documented as required dependency for SpotBugs security scanning
- [ ] Error Prone noted as compile-time plugin (runs during mvn/gradlew compile)

## Implementor Checklist
- [ ] PLAN-001: Create java-qa skill directory
- [ ] PLAN-002: Create SKILL.md with YAML frontmatter
- [ ] PLAN-003: Add Section 1 - QA Tool Commands (Maven)
- [ ] PLAN-004: Add Section 1 - QA Tool Commands (Gradle)
- [ ] PLAN-005: Add Section 2 - Prioritization Hierarchy
- [ ] PLAN-006: Add Section 3 - Report Template (Thinking Section)
- [ ] PLAN-007: Add Section 3 - Report Template (Answer Section with YAML Frontmatter)
- [ ] PLAN-008: Add Section 3 - Report Template (Automated Tool Findings)
- [ ] PLAN-009: Add Section 3 - Report Template (Manual Analysis and Improvement Plan)
- [ ] PLAN-010: Add Section 4 - Baseline Verification Commands
