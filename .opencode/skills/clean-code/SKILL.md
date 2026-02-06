---
name: clean-code
description: "Language-agnostic code quality analysis focusing on design principles from Clean Code, Pragmatic Programmer, Code Complete, Refactoring, and other seminal software engineering books"
license: MIT
allowed-tools:
  - bash
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# Clean Code QA Skill

This skill provides consolidated reference material for language-agnostic code quality analysis workflows, focusing on STRUCTURE, READABILITY, TESTABILITY, and MAINTAINABILITY.

## Section 1: Overview and Objectives

### Purpose

Evaluate code against design principles from seminal software engineering books:

- **Clean Code: A Handbook of Agile Software Craftsmanship** – Robert C. Martin
- **The Pragmatic Programmer: Your Journey To Mastery** – Andrew Hunt & David Thomas
- **Code Complete (2nd Edition)** – Steve McConnell
- **Refactoring: Improving the Design of Existing Code** – Martin Fowler
- **Working Effectively with Legacy Code** – Michael Feathers
- **Refactoring to Patterns** – Joshua Kerievsky

### When to Use

- After language-specific QA passes (python-qa, typescript-qa)
- During design review or architecture evaluation
- Before major refactoring initiatives
- When evaluating legacy code for maintainability
- When code "works but feels wrong"

### Scope

Language-agnostic (works for Python, TypeScript, Go, Rust, Java, C#, JavaScript, etc.)

### Output Format

QA report with findings categorized into 4 dimensions:

1. **STRUCTURE**: Coupling, cohesion, abstraction, orthogonality
2. **READABILITY**: Naming, formatting, comments, clarity
3. **TESTABILITY**: Dependencies, seams, observability, purity
4. **MAINTAINABILITY**: DRY, SOLID, code smells, error handling

## Section 2: Automated Tool Execution

### Language-Agnostic Tools

Execute in parallel using bash tool:

```bash
# Complexity analysis (supports 20+ languages including Python, TypeScript, Go, Rust, Java, C#)
lizard [target] --CCN 15 --length 50 --arguments 3

# Lines of code, comments, complexity (language-agnostic)
scc [target] --by-file

# Duplicate code detection (language-agnostic)
jscpd [target] --threshold 5 --min-lines 5 --min-tokens 50
```

### Tool Availability Check

- **lizard**: Install with `pip install lizard` (Python required)
- **scc**: Install from https://github.com/boyter/scc (Go binary, no dependencies)
- **jscpd**: Install with `npm install -g jscpd` (Node.js required)
- **Fallback**: If tools unavailable, note in report "Tools unavailable" section and proceed with manual analysis only
- **Version Capture**: Always record versions (`lizard --version`, `scc --version`, `jscpd --version`)

### Metrics to Extract

From tool outputs, extract and report:

1. **Complexity Metrics** (from lizard):
   - Cyclomatic Complexity (CCN) per function
   - Maximum CCN and location
   - Average CCN across all functions
   - Functions exceeding CCN threshold (15)

2. **Size Metrics** (from lizard and scc):
   - Lines of code per function
   - Maximum function length and location
   - Total lines: code, comments, blank
   - Comment ratio (comment lines / code lines)

3. **Parameter Metrics** (from lizard):
   - Argument count per function
   - Functions with 4+ parameters

4. **Duplication Metrics** (from jscpd):
   - Percentage of duplicated code
   - Number of duplicate blocks
   - Locations of duplicates

### Threshold Recommendations

Based on industry best practices and book recommendations:

- **CCN (Cyclomatic Complexity)**: ≤ 10 ideal, ≤ 15 acceptable, > 20 critical
- **Function Length**: ≤ 20 lines ideal, ≤ 50 acceptable, > 100 critical
- **Parameter Count**: 0-2 ideal, 3 acceptable, ≥ 4 problematic
- **Duplication**: < 3% ideal, < 5% acceptable, > 10% critical
- **Comment Ratio**: 10-30% (too low = unclear, too high = over-commented)
- **Nesting Depth**: ≤ 3 ideal, ≤ 4 acceptable, > 4 critical

## Section 3: Manual Analysis Checklist

Use this checklist to systematically evaluate code. For each item, report specific findings with file:line evidence.

### 3.1 STRUCTURE (Architectural Quality)

Evaluate architectural and design qualities. See `references/structure-principles.md` for detailed guidance.

- [ ] **Coupling**: Are modules/classes loosely coupled?
  - **Book**: Pragmatic Programmer Ch. 7 "Orthogonality"
  - **Check**: Can components be changed independently? Are dependencies explicit and minimal?
  - **Red Flags**: Circular dependencies, too many imports, tight coupling to implementation details
  - **Evidence**: Count imports per file, identify circular references

- [ ] **Cohesion**: Does each module do one thing well?
  - **Book**: Code Complete Ch. 5 "Design in Construction"
  - **Check**: Are related functions grouped? Are unrelated functions separated?
  - **Red Flags**: Utility classes, "Manager" classes, mixed concerns in single module
  - **Evidence**: List module responsibilities, check if describable in one sentence

- [ ] **Abstraction Levels**: Is abstraction consistent within each layer?
  - **Book**: Clean Code Ch. 3 "Functions"
  - **Check**: Do high-level functions call high-level abstractions? Are low-level details isolated?
  - **Red Flags**: Mixing business logic with database queries, UI code with domain logic
  - **Evidence**: Analyze function call chains, identify abstraction level jumps

- [ ] **Orthogonality**: Are components independent?
  - **Book**: Pragmatic Programmer Ch. 7 "Orthogonality"
  - **Check**: Does changing A require changing B? Can features be tested in isolation?
  - **Red Flags**: "Shotgun surgery" (one change touches many files), cascading changes
  - **Evidence**: Use git history to identify files frequently changed together

- [ ] **Data Structures**: Are data structures well-designed?
  - **Book**: Code Complete Ch. 10 "General Issues in Using Variables"
  - **Check**: Are complex structures documented? Are primitives wrapped in meaningful types?
  - **Red Flags**: Primitive obsession, stringly-typed data, parallel arrays
  - **Evidence**: Count primitive parameters, identify type-based validation

### 3.2 READABILITY (Human Comprehension)

Evaluate code clarity and understandability. See `references/readability-principles.md` for detailed guidance.

- [ ] **Naming**: Are names intention-revealing?
  - **Book**: Clean Code Ch. 2 "Meaningful Names"
  - **Check**: Variables reveal intent (`userCount` not `cnt`), functions reveal action (`calculateTotalPrice` not `calc`), classes reveal role (`UserAuthenticator` not `Manager`)
  - **Red Flags**: Single-letter names (except loop counters), abbreviations, generic names (data, info, manager, helper)
  - **Evidence**: List poorly named identifiers with file:line

- [ ] **Function Size**: Are functions small?
  - **Book**: Clean Code Ch. 3 "Functions"
  - **Check**: Ideal < 20 lines, acceptable < 50 lines, red flag > 100 lines
  - **Red Flags**: Functions requiring scrolling, multiple concerns, need for section comments
  - **Evidence**: Use lizard output, list functions > 50 lines

- [ ] **Nesting Depth**: Is control flow shallow?
  - **Book**: Code Complete Ch. 19 "General Control Issues"
  - **Check**: Max 3-4 levels of nesting
  - **Red Flags**: Arrow code (>>>>>>), nested conditionals, deeply nested loops
  - **Evidence**: Identify deeply nested blocks with file:line

- [ ] **Comments**: Do comments explain WHY, not WHAT?
  - **Book**: Clean Code Ch. 4 "Comments"
  - **Check**: Comments explain rationale, trade-offs, non-obvious constraints
  - **Red Flags**: `// increment counter` (obvious), commented-out code, misleading comments
  - **Evidence**: List examples of good and bad comments

- [ ] **Magic Numbers**: Are constants named?
  - **Book**: Code Complete Ch. 12 "Fundamental Data Types"
  - **Check**: Literals replaced with named constants (except 0, 1, empty string)
  - **Red Flags**: `if (status == 404)`, `sleep(86400)`, `buffer[512]`
  - **Evidence**: List magic numbers with file:line, suggest constant names

- [ ] **Formatting**: Is formatting consistent?
  - **Book**: Clean Code Ch. 5 "Formatting"
  - **Check**: Vertical spacing between concepts, indentation reveals structure, consistent style
  - **Red Flags**: Inconsistent spacing, missing blank lines, mixed tabs/spaces
  - **Evidence**: Note formatting inconsistencies (usually caught by linters)

### 3.3 TESTABILITY (Can We Test This?)

Evaluate how easily code can be tested in isolation. See `references/testability-principles.md` for detailed guidance.

- [ ] **Seams**: Can dependencies be substituted?
  - **Book**: Working with Legacy Code Ch. 4 "The Seam Model"
  - **Check**: Are external services mockable? Are file I/O operations isolated?
  - **Red Flags**: Hard-coded dependencies, global state, singletons, static method calls
  - **Evidence**: Identify untestable dependencies with file:line

- [ ] **Pure Functions**: Are side effects minimized?
  - **Book**: Clean Code Ch. 3 "Functions"
  - **Check**: Does function output depend ONLY on inputs? Are state changes explicit?
  - **Red Flags**: Hidden mutations, global variable access, I/O in business logic
  - **Evidence**: List functions with side effects

- [ ] **Dependency Injection**: Are dependencies explicit?
  - **Book**: Pragmatic Programmer Ch. 28 "Decoupling"
  - **Check**: Are dependencies passed as parameters or constructor arguments?
  - **Red Flags**: `new` operator for dependencies, service locator pattern, global config
  - **Evidence**: Count hard-coded instantiations

- [ ] **Argument Count**: Are parameter lists short?
  - **Book**: Clean Code Ch. 3 "Functions"
  - **Check**: Ideal 0-2 arguments, acceptable 3, red flag 4+ (consider parameter object)
  - **Red Flags**: Long parameter lists, boolean flags, order-dependent parameters
  - **Evidence**: Use lizard output, list functions with 4+ parameters

- [ ] **Observable Outcomes**: Can behavior be verified?
  - **Book**: Working with Legacy Code Ch. 11 "I Need to Make a Change. What Methods Should I Test?"
  - **Check**: Do functions return values (not just side effects)? Are errors signaled clearly?
  - **Red Flags**: Void functions with only side effects, swallowed exceptions, silent failures
  - **Evidence**: List functions with unobservable behavior

### 3.4 MAINTAINABILITY (Can We Change This Safely?)

Evaluate change resistance and code smells. See `references/maintainability-principles.md` and `references/code-smells-catalog.md` for detailed guidance.

- [ ] **DRY Principle**: Is logic duplicated?
  - **Book**: Pragmatic Programmer Ch. 9 "The Evils of Duplication"
  - **Check**: Are there copy-pasted blocks? Can repeated patterns be abstracted?
  - **Red Flags**: Copy-paste with small variations, duplicated validation logic, repeated error handling
  - **Evidence**: Use jscpd output, list duplicate blocks with locations

- [ ] **Single Responsibility**: Does each class/function do one thing?
  - **Book**: Clean Code Ch. 10 "Classes"
  - **Check**: Can you describe it without using "and"? Does it have one reason to change?
  - **Red Flags**: "Manager" classes, utility classes, god objects
  - **Evidence**: List classes/functions with multiple responsibilities

- [ ] **Open/Closed Principle**: Can it be extended without modification?
  - **Book**: Clean Code Ch. 10 "Classes" (SOLID Principles)
  - **Check**: Are new features added via new classes/functions, not edits to existing code?
  - **Red Flags**: Switch/case on type codes, if-else chains for extensibility
  - **Evidence**: Identify extension points that require modification

- [ ] **Code Smells**: Check Fowler's catalog
  - **Book**: Refactoring Ch. 3 "Bad Smells in Code"
  - **Check**: See `references/code-smells-catalog.md` for full catalog
  - **Primary Smells to Detect**:
    - **Long Method**: Function > 50 lines (use lizard)
    - **Large Class**: Class > 300 lines or > 10 public methods
    - **Long Parameter List**: > 3 parameters (use lizard)
    - **Divergent Change**: One class changed for multiple unrelated reasons
    - **Shotgun Surgery**: One change requires edits across many classes
    - **Feature Envy**: Method uses another class's data more than its own
    - **Data Clumps**: Same 3-4 variables passed together repeatedly
    - **Primitive Obsession**: Using strings/ints instead of small objects
    - **Switch Statements**: Type codes instead of polymorphism
    - **Speculative Generality**: "We might need this someday" code
    - **Message Chains**: `a.getB().getC().getD()`
    - **Middle Man**: Class delegates all work to another class
  - **Evidence**: For each smell detected, provide file:line and excerpt

- [ ] **Error Handling**: Are errors handled cleanly?
  - **Book**: Clean Code Ch. 7 "Error Handling"
  - **Check**: Are exceptions used (not error codes)? Are error messages informative? Is cleanup guaranteed?
  - **Red Flags**: Swallowed exceptions, returning null, error codes, missing finally/cleanup
  - **Evidence**: List error handling issues with file:line

## Section 4: Verification Commands for Planner

When creating implementation plans from clean-code QA reports, use these verification criteria.

### Quantitative Verifications

Use these objective, measurable criteria:

1. **Complexity Reduced**:
   ```bash
   lizard [file] --CCN 15
   ```
   - Done When: All functions show CCN ≤ 15 (or specified target)
   - Example: "PLAN-003: Refactor processOrder → lizard shows CCN < 10"

2. **Function Length Reduced**:
   ```bash
   lizard [file] --length 50
   ```
   - Done When: All functions ≤ 50 lines (or specified target)
   - Example: "PLAN-005: Extract helper methods → lizard shows all functions < 30 lines"

3. **Parameter Count Reduced**:
   ```bash
   lizard [file] --arguments 3
   ```
   - Done When: All functions have ≤ 3 parameters
   - Example: "PLAN-007: Introduce UserContext object → lizard shows max 3 params"

4. **Duplication Eliminated**:
   ```bash
   jscpd [target] --threshold 5
   ```
   - Done When: Duplication < 5% (or specified target)
   - Example: "PLAN-009: Extract common validation → jscpd shows < 3% duplication"

5. **Comment Ratio in Range**:
   ```bash
   scc [target]
   ```
   - Done When: Comment ratio between 10-30%
   - Example: "PLAN-011: Add docstrings → scc shows comment ratio 15-25%"

### Qualitative Verifications

Use these for subjective principles (requires code review):

1. **Naming Improved**:
   - Done When: Code review confirms all identifiers are intention-revealing
   - Example: "PLAN-013: Rename variables → Code review confirms names reveal intent"

2. **Comments Explain Why**:
   - Done When: Code review confirms comments explain rationale, not mechanics
   - Example: "PLAN-015: Improve comments → Code review confirms WHY over WHAT"

3. **Code Smell Eliminated**:
   - Done When: Code review confirms specific smell is addressed
   - Example: "PLAN-017: Eliminate Feature Envy → Code review confirms method uses own data"

4. **Abstraction Consistent**:
   - Done When: Code review confirms abstraction levels are uniform within layers
   - Example: "PLAN-019: Separate concerns → Code review confirms business logic isolated from data access"

5. **Seams Introduced**:
   - Done When: Code review confirms dependencies can be substituted for testing
   - Example: "PLAN-021: Inject dependencies → Code review confirms service is mockable"

### Hybrid Verifications

Combine quantitative and qualitative:

1. **Extract Method Refactoring**:
   - Quantitative: `lizard` shows CCN reduced by 50%
   - Qualitative: Code review confirms extracted functions have clear single responsibility

2. **Introduce Parameter Object**:
   - Quantitative: `lizard` shows parameter count reduced to ≤ 3
   - Qualitative: Code review confirms parameter object is semantically meaningful

3. **Eliminate Duplication**:
   - Quantitative: `jscpd` shows duplication < 5%
   - Qualitative: Code review confirms abstraction is appropriate (not forced)

## Section 5: Prioritization Rules

When categorizing findings in QA reports, use this hierarchy:

### P1 (Critical) - Immediate Action Required

**Criteria**: Issues causing active maintenance burden or high bug risk

- **Long Method** with CCN > 20 (unmaintainable complexity, high bug risk)
- **Shotgun Surgery** (one logical change impacts 5+ files, change amplification)
- **Feature Envy** in core business logic (tight coupling, fragility)
- **Missing error handling** in critical paths (reliability risk, data corruption)
- **Security-relevant code smells** (hard-coded secrets, SQL injection risk)

**Impact**: Active bugs, team velocity < 50%, production incidents

**Timeline**: Address within current sprint

### P2 (High) - Plan for Next Sprint

**Criteria**: Issues blocking testability or causing frequent rework

- **Long Method** with CCN 15-20 (testability blocker)
- **Large Class** (> 500 lines, > 15 public methods)
- **Long Parameter List** (4+ parameters, testability issue)
- **Data Clumps** (repeated parameter groups in 5+ locations)
- **Primitive Obsession** in domain models (validation scattered, no encapsulation)
- **Duplication** > 10% (change propagation, bug multiplication)
- **Message Chains** (tight coupling, fragile to API changes)

**Impact**: Test coverage < 60%, frequent bug recurrence, slow feature development

**Timeline**: Address within 1-2 sprints

### P3 (Medium) - Address When Touching Code

**Criteria**: Issues reducing readability or requiring opportunistic improvement

- **Magic Numbers** (maintainability, unclear intent)
- **Comments explaining WHAT** not WHY (noise, maintenance burden)
- **Nesting depth** > 4 levels (cognitive load, hard to test)
- **Middle Man** classes (unnecessary indirection, navigation difficulty)
- **Duplication** 5-10% (moderate change propagation)
- **Function length** 50-100 lines (readability issue, not critical)
- **Speculative Generality** (unused abstractions, complexity without benefit)

**Impact**: Slower code review, occasional confusion, minor tech debt

**Timeline**: Address opportunistically when modifying nearby code

### P4 (Low) - Nice to Have

**Criteria**: Minor improvements with low ROI

- **Duplication** < 5% (acceptable level)
- **Formatting inconsistencies** (if not caught by automated linter)
- **Variable names** that could be slightly more descriptive
- **Minor comment improvements**
- **CCN 10-15** in non-critical code

**Impact**: Minimal, aesthetic issues only

**Timeline**: Address only if trivial or part of larger refactoring

### Prioritization Decision Process

1. **Extract metrics** from automated tools (lizard, scc, jscpd)
2. **Identify code smells** using manual analysis checklist
3. **Assess impact**:
   - Is this causing bugs? → P1
   - Is this blocking testing? → P2
   - Is this slowing development? → P2 or P3
   - Is this just aesthetics? → P4
4. **Consider context**:
   - Code change frequency (git history): Hot paths → higher priority
   - Business criticality: Core domain → higher priority
   - Team pain points: Frequently mentioned in retros → higher priority
5. **Assign priority** using rules above

## Section 6: QA Report Template

Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this template:

```markdown
---
date: YYYY-MM-DD
auditor: clean-code
target: [module/package/file]
language: [python|typescript|go|rust|java|etc.]
status: complete
---

<thinking>
## Phase 1: Target Discovery

**Target Identification Method**: [user-provided | codebase-locator | git diff]

**Files Discovered**:
- `path/to/file1.ext` (XXX lines, X functions)
- `path/to/file2.ext` (XXX lines, X functions)
- [list all analyzed files]

**Scope**: [single file | module | package | entire codebase]

**Language Detection**: [Detected from file extensions]

## Phase 2: Automated Tool Execution

**Tool Versions**:
- lizard: X.X.X
- scc: X.X.X
- jscpd: X.X.X

**Commands Executed**:
```bash
lizard [target] --CCN 15 --length 50 --arguments 3
scc [target] --by-file
jscpd [target] --threshold 5 --min-lines 5 --min-tokens 50
```

**Tool Outputs** (raw metrics):

### Lizard Complexity Analysis
- Total functions analyzed: X
- Functions with CCN > 15: X
- Functions with length > 50: X
- Functions with 4+ params: X
- Max CCN: XX in `function_name` at file.ext:line
- Max length: XXX lines in `function_name` at file.ext:line

### SCC Code Metrics
- Total files: X
- Total lines: X (code: X, comments: X, blank: X)
- Comment ratio: X.X%

### JSCPD Duplication Analysis
- Total duplicates: X blocks
- Duplication percentage: X.X%
- Largest duplicate: X lines at file1.ext:line and file2.ext:line

## Phase 3: Manual Analysis

### Checklist Items Reviewed
- [x] Structure: Coupling, cohesion, abstraction, orthogonality
- [x] Readability: Naming, function size, nesting, comments, magic numbers
- [x] Testability: Seams, pure functions, dependency injection, argument count
- [x] Maintainability: DRY, SRP, OCP, code smells, error handling

### Key Findings per Category

**STRUCTURE**:
- [Summarize coupling/cohesion/abstraction findings]

**READABILITY**:
- [Summarize naming/formatting/comment findings]

**TESTABILITY**:
- [Summarize seam/dependency/purity findings]

**MAINTAINABILITY**:
- [Summarize DRY/SOLID/code smell findings]

## Phase 4: Synthesis

**Prioritization Decisions**:
- P1 issues: X (based on [criteria])
- P2 issues: X (based on [criteria])
- P3 issues: X (based on [criteria])
- P4 issues: X (based on [criteria])

**Total Issues**: XX
</thinking>

<answer>
---
message_id: clean-code-qa-YYYY-MM-DD-NNN
message_type: QA_REPORT
target: [target path]
auditor: clean-code
language: [language]
total_issues: X
p1_count: X
p2_count: X
p3_count: X
p4_count: X
timestamp: YYYY-MM-DDTHH:MM:SSZ
---

# Clean Code QA Report: [Target Name]

## Executive Summary

- **Target**: `[module/package/file path]`
- **Language**: [Python|TypeScript|Go|Rust|Java|etc.]
- **Date**: YYYY-MM-DD
- **Total Issues**: X (P1: X, P2: X, P3: X, P4: X)

### Complexity Metrics
- **Max Complexity (CCN)**: XX (threshold: 15) [✅ PASS | ❌ FAIL]
- **Avg Complexity**: X.X (threshold: 10)
- **Max Function Length**: XXX lines (threshold: 50)
- **Duplication**: X.X% (threshold: 5%)

### Recommendation
[One sentence summary: "Immediate action required" | "Plan refactoring for next sprint" | "Code quality acceptable"]

## Critical Findings (P1)

### CLEAN-001: Long Method - `processOrder` (CCN: 28)

- **Category**: Maintainability (Code Smell)
- **Location**: `src/orders/service.py:45-180`
- **Evidence**: 
  ```python
  def processOrder(order_id, user_id, items, payment_method, shipping_address):  # Line 45
      # 135 lines of code with CCN 28
      # [excerpt showing complexity]
  ```
- **Metrics**: 
  - Complexity (CCN): 28 (threshold: 15)
  - Length: 135 lines (threshold: 50)
  - Nesting depth: 6 levels (threshold: 4)
- **Impact**: Untestable (no unit tests), high bug risk, 3 production incidents in last month
- **Book Reference**: Clean Code Ch. 3 "Functions Should Be Small"
- **Recommended Fix**: Extract Method refactoring
  1. Extract validation logic → `validateOrderInputs()`
  2. Extract calculation logic → `calculateOrderTotals()`
  3. Extract payment logic → `processPayment()`
  4. Extract inventory logic → `updateInventory()`
  5. Extract notification logic → `sendOrderConfirmation()`
- **Verification**: 
  - Quantitative: `lizard src/orders/service.py --CCN 10` passes
  - Qualitative: Code review confirms each extracted function has single responsibility

[Repeat for each P1 issue: CLEAN-002, CLEAN-003, etc.]

## High Priority (P2)

### CLEAN-005: Data Clumps - User parameters repeated 8 times

- **Category**: Maintainability (Code Smell)
- **Locations**: 
  - `src/auth/login.py:23` - `authenticate(userId, userName, userEmail)`
  - `src/auth/register.py:45` - `createUser(userId, userName, userEmail)`
  - `src/auth/profile.py:67` - `updateProfile(userId, userName, userEmail)`
  - `src/notifications/email.py:89` - `sendEmail(userId, userName, userEmail)`
  - [4 more locations]
- **Evidence**:
  ```python
  def authenticate(userId: str, userName: str, userEmail: str):  # Line 23
      # Uses all 3 parameters
  
  def createUser(userId: str, userName: str, userEmail: str):  # Line 45
      # Same 3 parameters in same order
  ```
- **Impact**: Change propagation (adding userPhone requires 8 edits), error-prone (parameter order mistakes)
- **Book Reference**: Refactoring Ch. 3 "Data Clumps"
- **Recommended Fix**: Introduce Parameter Object
  ```python
  class UserContext:
      userId: str
      userName: str
      userEmail: str
  
  def authenticate(user: UserContext):
      # Single parameter
  ```
- **Verification**:
  - Quantitative: `lizard src/ --arguments 3` passes (all functions ≤ 3 params)
  - Qualitative: Code review confirms UserContext is semantically meaningful

[Repeat for each P2 issue]

## Medium Priority (P3)

### CLEAN-010: Magic Numbers in configuration

- **Category**: Readability
- **Locations**:
  - `src/api/server.py:12` - `app.listen(8080)`
  - `src/api/server.py:34` - `setTimeout(86400)`
  - `src/database/pool.py:56` - `maxConnections = 100`
- **Evidence**:
  ```python
  app.listen(8080)  # Line 12 - What is significance of 8080?
  setTimeout(86400)  # Line 34 - What is 86400? (seconds in a day)
  maxConnections = 100  # Line 56 - Why 100?
  ```
- **Impact**: Unclear intent, hard to change, potential bugs if wrong constant used
- **Book Reference**: Code Complete Ch. 12 "Fundamental Data Types"
- **Recommended Fix**: Extract named constants
  ```python
  DEFAULT_API_PORT = 8080
  ONE_DAY_SECONDS = 86400
  DEFAULT_DB_POOL_SIZE = 100
  
  app.listen(DEFAULT_API_PORT)
  setTimeout(ONE_DAY_SECONDS)
  maxConnections = DEFAULT_DB_POOL_SIZE
  ```
- **Verification**:
  - Qualitative: Code review confirms no unexplained numeric literals

[Repeat for each P3 issue]

## Low Priority (P4)

[List P4 issues briefly - these are low ROI]

- CLEAN-020: Variable `data` in `parser.py:45` could be renamed to `parsedResponse`
- CLEAN-021: Minor duplication (3.2%) in test fixtures (acceptable level)

## Metrics Summary

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Max Complexity (CCN) | 28 | 15 | ❌ FAIL |
| Avg Complexity | 8.2 | 10 | ✅ PASS |
| Max Function Length | 135 lines | 50 | ❌ FAIL |
| Avg Function Length | 22 lines | 50 | ✅ PASS |
| Functions with 4+ params | 3 | 0 | ❌ FAIL |
| Duplication | 12.3% | 5% | ❌ FAIL |
| Comment Ratio | 18.5% | 10-30% | ✅ PASS |

## Code Smells Detected

| Smell | Count | Locations |
|-------|-------|-----------|
| Long Method | 2 | `processOrder`, `generateReport` |
| Large Class | 1 | `OrderService` (687 lines, 18 methods) |
| Long Parameter List | 3 | `authenticate`, `createOrder`, `updateUser` |
| Data Clumps | 1 | userId/userName/userEmail (8 occurrences) |
| Feature Envy | 1 | `OrderValidator.validatePayment` uses `PaymentService` data |
| Primitive Obsession | 2 | Status codes as strings, amounts as floats |

## Recommendations for Next Steps

### Immediate (Current Sprint)
1. **CLEAN-001**: Refactor `processOrder` (CCN 28 → target < 10)
2. **CLEAN-002**: Extract error handling in `generateReport`

### Short-term (Next Sprint)
3. **CLEAN-005**: Introduce UserContext parameter object
4. **CLEAN-006**: Split OrderService class (687 lines → < 300)

### Medium-term (Opportunistic)
5. **CLEAN-010**: Replace magic numbers with named constants
6. **CLEAN-012**: Improve comments to explain WHY not WHAT

### Ignore (Low ROI)
7. P4 issues (CLEAN-020 to CLEAN-022) - address only if trivial

## References

See `skills/clean-code/references/` for detailed guidance:
- `code-smells-catalog.md` - Fowler's complete catalog with examples
- `structure-principles.md` - Coupling, cohesion, orthogonality
- `readability-principles.md` - Naming, formatting, comments
- `testability-principles.md` - Seams, dependencies, pure functions
- `maintainability-principles.md` - DRY, SOLID principles
- `book-references.md` - Complete citations and key chapters
</answer>
```

## Section 7: Integration with QA Workflow

### Usage Pattern

```bash
# Step 1: Run language-specific QA first
Researcher: "Analyze Python code quality for src/auth/"
→ Uses python-qa skill
→ Produces: thoughts/shared/qa/2026-02-05-Auth-Module-Python.md
→ Covers: Syntax, types, security (ruff, pyright, bandit)

# Step 2: Run clean-code QA second
Researcher: "Analyze code design for src/auth/"
→ Uses clean-code skill
→ Produces: thoughts/shared/qa/2026-02-05-Auth-Module-Design.md
→ Covers: Structure, readability, testability, maintainability

# Step 3: Planner combines both reports
Planner: "Create plan from latest QA reports"
→ Reads both Python QA and Design QA reports
→ Produces: thoughts/shared/plans/2026-02-05-QA-Auth-Module.md
→ Plan includes: Type fixes (from python-qa) + Refactorings (from clean-code)
```

### When to Use Clean-Code vs Language-Specific QA

**Use python-qa/typescript-qa for**:
- Syntax errors, type errors
- Security vulnerabilities (injection, hardcoded secrets)
- Language-specific best practices (Python: docstrings, TypeScript: strict types)
- Test coverage and documentation coverage

**Use clean-code for**:
- Design principles (coupling, cohesion, abstraction)
- Code smells (Long Method, Feature Envy, Data Clumps)
- Refactoring opportunities
- Cross-cutting concerns (naming, complexity, duplication)

**Use BOTH when**:
- Comprehensive code review before major release
- Evaluating legacy code for refactoring
- Onboarding new team members (educational)
- After significant feature development

## Section 8: References

All reference materials are in `skills/clean-code/references/`:

- **structure-principles.md** - Coupling, cohesion, abstraction, orthogonality (Pragmatic Programmer, Code Complete)
- **readability-principles.md** - Naming, formatting, comments, clarity (Clean Code, Code Complete)
- **testability-principles.md** - Seams, dependencies, observability (Working with Legacy Code, Clean Code)
- **maintainability-principles.md** - DRY, SOLID, error handling (Pragmatic Programmer, Clean Code)
- **code-smells-catalog.md** - Complete catalog with examples (Refactoring, Refactoring to Patterns)
- **book-references.md** - Full citations and key chapter references

Load these references during manual analysis to guide evaluation.
