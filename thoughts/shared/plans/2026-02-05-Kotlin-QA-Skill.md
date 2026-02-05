# Kotlin QA Skill Implementation Plan

## Inputs
- Research report(s) used: `thoughts/shared/research/2026-02-05-Kotlin-QA-Tool-Analysis.md`
- User request summary: Create kotlin-qa skill following existing QA skill patterns (python-qa, typescript-qa, opencode-qa)

## Verified Current State

### Fact 1: Existing QA Skills Follow Common Structure
- **Fact**: All QA skills use identical YAML frontmatter structure with name, description, license, allowed-tools, and metadata fields
- **Evidence**: `skills/python-qa/SKILL.md:1-12`
- **Excerpt**:
  ```yaml
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
  ```

### Fact 2: Kotlin Uses Consolidated Tooling Model
- **Fact**: Kotlin QA requires fewer tools than Python/TypeScript due to detekt handling multiple concerns (linting, security, documentation, dead code detection)
- **Evidence**: `thoughts/shared/research/2026-02-05-Kotlin-QA-Tool-Analysis.md:37-54`
- **Excerpt**:
  ```markdown
  ### Finding 1: Consolidated Tooling Model
  
  - **Observation**: Python requires 4 separate tools (ruff, pyright, bandit, interrogate), TypeScript requires 3+ tools (tsc, eslint, knip, optional plugins), but Kotlin consolidates into 3 tools with detekt handling multiple concerns.
  - **Direct consequence**: kotlin-qa skill will have fewer tool commands but requires understanding detekt's multiple rule sets (code quality, security, documentation, dead code).
  ```

### Fact 3: Gradle-First Approach in Kotlin Ecosystem
- **Fact**: Kotlin projects standardize on Gradle build system, with Gradle tasks being the primary QA workflow
- **Evidence**: `thoughts/shared/research/2026-02-05-Kotlin-QA-Tool-Analysis.md:517-536`
- **Excerpt**:
  ```bash
  ### Gradle-Based Projects (Recommended)
  
  ```bash
  # Code formatting (ktlint)
  ./gradlew ktlintCheck
  
  # Static analysis (detekt - covers linting, security, docs, dead code)
  ./gradlew detekt
  
  # Type checking (kotlinc via Gradle)
  ./gradlew compileKotlin
  ./gradlew compileTestKotlin
  
  # Test coverage (Kover)
  ./gradlew test koverHtmlReport
  ./gradlew koverVerify
  ```

### Fact 4: Kover Emerging as Coverage Standard
- **Fact**: JetBrains Kover is the recommended coverage tool for new Kotlin projects, with JaCoCo as legacy alternative
- **Evidence**: `thoughts/shared/research/2026-02-05-Kotlin-QA-Tool-Analysis.md:72-89`
- **Excerpt**:
  ```markdown
  ### Finding 3: Kover Emerging as Coverage Standard
  
  - **Observation**: JetBrains released Kover as Kotlin-native coverage tool in 2024, offering better Kotlin support than traditional JaCoCo.
  - **Direct consequence**: kotlin-qa skill should recommend Kover for new projects but support JaCoCo for legacy codebases.
  ```

### Fact 5: Skills Use kebab-case Directory Naming
- **Fact**: All existing skills use kebab-case directory names matching the frontmatter name field
- **Evidence**: Bash output from `ls skills/` showing `python-qa/`, `typescript-qa/`, `opencode-qa/`
- **Excerpt**:
  ```
  drwxr-xr-x 1 eichens eichens  16 Feb  5 08:11 opencode-qa
  drwxr-xr-x 1 eichens eichens  16 Feb  5 08:01 python-qa
  drwxr-xr-x 1 eichens eichens  16 Feb  5 08:05 typescript-qa
  ```

## Goals / Non-Goals

**Goals**:
- Create `skills/kotlin-qa/SKILL.md` with Kotlin-specific QA tools, prioritization hierarchy, and report template
- Support both Gradle-based (recommended) and standalone CLI workflows
- Align structure with existing QA skills (python-qa, typescript-qa, opencode-qa)
- Provide comprehensive report template with thinking/answer separation
- Include verification commands for Planner agent consumption

**Non-Goals**:
- Creating custom Kotlin QA tooling (use existing ktlint, detekt, Kover)
- Implementing agent-specific logic (skills provide reference material only)
- Creating references/ subdirectory (consolidated tool docs don't require separate files)
- Supporting non-Gradle build systems beyond Maven fallback

## Design Overview

The kotlin-qa skill follows the established 6-section structure:

1. **YAML Frontmatter**: name: kotlin-qa, description, license, allowed-tools, metadata
2. **Introduction**: Brief skill overview
3. **QA Tool Commands**: Gradle-based (primary) and CLI-based (alternative) commands for ktlint, detekt, kotlinc, Kover/JaCoCo
4. **Prioritization Hierarchy**: Critical → High → Medium → Low (aligned with research findings)
5. **Report Template**: Complete markdown template with thinking/answer separation, YAML frontmatter, Kotlin-specific sections
6. **Baseline Verification Commands**: Gradle tasks for Planner to include in implementation plans

**Key Kotlin Adaptations**:
- Gradle commands as primary (unlike Python/TypeScript CLI-first approach)
- detekt section covers 4 concerns: linting, security (potential-bugs), documentation (comments rule set), dead code
- Support both Kover (recommended) and JaCoCo (legacy) coverage tools
- Binary documentation coverage (no percentage metrics like interrogate)
- Type checking integrated into kotlinc compilation (no separate type checker)

## Implementation Instructions (For Implementor)

### PLAN-001: Create Skill Directory Structure
- **Action ID:** PLAN-001
- **Change Type:** create
- **File(s):** `skills/kotlin-qa/`
- **Instruction:** 
  1. Create directory `skills/kotlin-qa/`
  2. This directory will contain the SKILL.md file created in PLAN-002
- **Evidence**: `skills/python-qa/SKILL.md:1` (pattern: all skills have dedicated directory)
- **Done When**: Directory `skills/kotlin-qa/` exists

### PLAN-002: Write kotlin-qa SKILL.md
- **Action ID:** PLAN-002
- **Change Type:** create
- **File(s):** `skills/kotlin-qa/SKILL.md`
- **Instruction:**
  
  Create `skills/kotlin-qa/SKILL.md` with 6 main sections. Use `skills/python-qa/SKILL.md` as structural template, adapting content for Kotlin tools from research report.

  **Section 1: YAML Frontmatter** (lines 1-12)
  
  Copy structure from `skills/python-qa/SKILL.md:1-12`, changing:
  - `name: python-qa` → `name: kotlin-qa`
  - `description:` → "Kotlin code quality analysis tools, prioritization rules, and report templates for QA workflow"

  **Section 2: Skill Introduction** (lines 14-16)
  
  ```markdown
  # Kotlin QA Skill

  This skill provides consolidated reference material for Kotlin code quality analysis workflows.
  ```

  **Section 3: QA Tool Commands** (lines 18-85)
  
  Source content from research report lines 517-563. Structure:
  
  ```markdown
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
  ```

  **Section 4: Prioritization Hierarchy** (lines 87-96)
  
  Adapt from `skills/python-qa/SKILL.md:33-40` with Kotlin-specific categories:

  ```markdown
  ## Prioritization Hierarchy

  Use this hierarchy when categorizing findings:

  1. **Critical**: Configuration errors preventing compilation (kotlinc errors, invalid detekt config)
  2. **High**: Type safety violations (detekt potential-bugs rule set: unsafe casts, platform types, nullable violations)
  3. **Medium**: Testability issues, maintainability risks, dead code (detekt complexity rules, UnusedPrivateMember, test coverage gaps)
  4. **Low**: Readability improvements, style consistency (ktlint violations, naming conventions)
  ```

  **Section 5: Report Template** (lines 98-365)
  
  Adapt from `skills/python-qa/SKILL.md:44-260`, replacing Python tools with Kotlin equivalents:

  - **Thinking section structure** (Phase 1-5 unchanged, adapt tool references):
    - Phase 1: Target Discovery → identify `.kt` and `.kts` files
    - Phase 2: Automated Tool Execution → ktlint, detekt, kotlinc, Kover/JaCoCo
    - Phase 3: File Analysis → Kotlin-specific categories (null safety, platform types, coroutine usage)
    - Phase 4: Delegation Log (unchanged)
    - Phase 5: Prioritization and Synthesis (use Kotlin hierarchy)
  
  - **Answer section YAML frontmatter**: Change `qa_agent: python-qa-thorough` → `qa_agent: kotlin-qa-thorough`
  
  - **Automated Tool Findings** subsections (replace Python sections):
    - 📋 Code Formatting (ktlint) - replaces ruff formatting section
    - 🛡️ Static Analysis (detekt) - covers linting, security, documentation, dead code (replaces ruff + bandit + interrogate)
      - Note: detekt's comments rule set provides binary doc coverage (not percentage)
    - 🔷 Type Safety (kotlinc) - replaces pyright section
    - 📊 Test Coverage (Kover or JaCoCo) - replaces pytest-cov section
      - Include both Kover and JaCoCo report format examples
  
  - **Manual Quality Analysis** subsections (adapt for Kotlin):
    - 📖 Readability Issues (unchanged structure)
    - 🔧 Maintainability Issues (unchanged structure)
    - 🔒 Type Safety Issues - Kotlin-specific focus:
      - Null safety patterns (safe calls vs. unsafe `!!` operator)
      - Platform type handling (Java interop)
      - Smart cast limitations
      - Generic type constraints
    - 🧪 Testability Issues (unchanged structure)
  
  - **Improvement Plan** (QA-XXX format unchanged)
  - **Acceptance Criteria** (adapt for Kotlin tools)
  - **Implementor Checklist** (unchanged)
  - **References** (list Kotlin tools)

  **Section 6: Baseline Verification Commands** (lines 367-376)
  
  ```markdown
  ## Baseline Verification Commands

  For Planner to include in implementation plans:

  ```bash
  ./gradlew ktlintCheck  # Should pass after Phase 1 (formatting)
  ./gradlew compileKotlin compileTestKotlin  # Should pass after Phase 2 (type safety)
  ./gradlew detekt  # Should pass after Phase 2 (static analysis)
  ./gradlew test koverVerify  # Should pass after Phase 3 (coverage - or jacocoTestCoverageVerification)
  ```
  ```

- **Interfaces / Pseudocode:**
  
  Template structure (pseudocode):
  ```
  YAML Frontmatter (12 lines)
  ---
  Introduction (3 lines)
  ---
  QA Tool Commands (68 lines)
    - Gradle-Based (30 lines)
    - Standalone CLI (15 lines)
    - Tool Availability Check (10 lines)
  ---
  Prioritization Hierarchy (10 lines)
  ---
  Report Template (268 lines)
    - Thinking (95 lines)
    - Answer (173 lines)
      - YAML frontmatter (18 lines)
      - Automated findings (80 lines)
      - Manual analysis (40 lines)
      - Improvement plan (20 lines)
      - Checklists (15 lines)
  ---
  Verification Commands (10 lines)
  ```
  
  **Total estimated lines**: ~370 (similar to typescript-qa at 307 lines, larger than python-qa at 272 due to dual coverage support)

- **Evidence**: 
  - `skills/python-qa/SKILL.md:1-272` (structure template)
  - `skills/typescript-qa/SKILL.md:1-307` (optional tools pattern)
  - Research report lines 517-576 (Kotlin tool commands and verification)
  - Research report lines 206-258 (detekt rule categories for prioritization)
- **Done When**: 
  - File `skills/kotlin-qa/SKILL.md` exists
  - Contains valid YAML frontmatter with `name: kotlin-qa`
  - Includes all 6 sections in correct order
  - Report template has thinking/answer separation with YAML frontmatter
  - Tool commands cover ktlint, detekt, kotlinc, Kover, and JaCoCo
  - Automated findings sections replace Python tools with Kotlin equivalents
  - Verification commands use Gradle tasks
- **Complexity:** complex

### PLAN-003: Verify Skill Structure
- **Action ID:** PLAN-003
- **Change Type:** verify
- **File(s):** `skills/kotlin-qa/SKILL.md`
- **Instruction:**
  1. Run `yamllint -f parsable skills/kotlin-qa/SKILL.md` to verify YAML frontmatter syntax
  2. Run `markdownlint skills/kotlin-qa/SKILL.md` to verify Markdown formatting
  3. Extract `name:` field from YAML frontmatter and verify it equals "kotlin-qa"
  4. Verify directory name `skills/kotlin-qa/` matches frontmatter name field
  5. Count main sections (should be 6: frontmatter, intro, tool commands, prioritization, report template, verification)
  6. Verify report template includes both `<thinking>` and `<answer>` tags
  7. Verify report template YAML frontmatter includes `message_type: QA_REPORT` field
- **Evidence**: 
  - `skills/opencode-qa/SKILL.md:158-164` (verification pattern)
  - `skills/python-qa/SKILL.md:1-272` (expected structure)
- **Done When**: 
  - yamllint exits with code 0 (no errors)
  - markdownlint exits with code 0 (no errors, acceptable warnings OK)
  - Frontmatter name matches directory: "kotlin-qa"
  - All 6 main sections present
  - Report template has proper structure (thinking/answer tags, YAML frontmatter with message_type)

## Acceptance Criteria
- [ ] Directory `skills/kotlin-qa/` exists
- [ ] File `skills/kotlin-qa/SKILL.md` exists with valid YAML frontmatter
- [ ] Skill name in frontmatter matches directory name (kotlin-qa)
- [ ] Tool commands section includes Gradle-based and CLI commands for ktlint, detekt, kotlinc, Kover, JaCoCo
- [ ] Prioritization hierarchy follows 4-level structure (Critical → High → Medium → Low)
- [ ] Report template includes thinking/answer separation with YAML frontmatter
- [ ] Report template has Kotlin-specific sections (detekt covering 4 categories, kotlinc type safety, Kover/JaCoCo coverage)
- [ ] Verification commands use Gradle tasks
- [ ] yamllint validation passes
- [ ] markdownlint validation passes

## Implementor Checklist
- [ ] PLAN-001: Create skills/kotlin-qa/ directory
- [ ] PLAN-002: Write SKILL.md with Kotlin-specific tool commands and report template
- [ ] PLAN-003: Verify YAML and Markdown syntax, validate structure
