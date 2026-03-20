# logic-bugs-qa skill — Raw Notes

## Role
- Type: skill (loaded via `Skill` tool)
- `disable-model-invocation: true` — loaded as reference material, not standalone execution
- `allowed-tools: Bash, Read, Agent` — notably includes `Agent`, allowing delegation to subagents during analysis
- Purpose: Systematic framework for detecting logic errors and coding bugs that automated tools cannot find. Manual analysis + execution flow tracing.

## Key Distinction from Other QA Skills
- **No automated linting/type tools** — logic bugs require human-style reasoning, not syntax checkers
- Verification is through **tests**, not linters (baseline test suite run + regression after each fix)
- Relies heavily on **codebase-analyzer** delegation for execution path tracing
- Single reference file: `references/common-bug-patterns.md`

## 7 Analysis Categories

| Category | Primary concerns | Delegation |
|---|---|---|
| 1. Control Flow | Off-by-one, loop termination, boolean logic (&&/\|\|), unreachable code | codebase-analyzer (focused) |
| 2. Data Handling | Null dereference, type coercion, integer overflow, float precision, OOB | codebase-analyzer (data model + transforms) |
| 3. Concurrency | Race conditions, deadlocks, missing sync, non-atomic R-M-W | codebase-pattern-finder (sync patterns) |
| 4. Error Handling | Swallowed exceptions, missing error checks, resource leaks, incorrect recovery | codebase-pattern-finder (error handling patterns) |
| 5. Algorithm Correctness | Wrong assumptions, missing edge cases, wrong complexity, incorrect recursion | codebase-analyzer (comprehensive) |
| 6. Boundary & Edge Cases | Min/max values, empty/single-element collections, NaN/infinity/-0, Unicode | codebase-analyzer (edge case branches) |
| 7. State Management | Init order, stale state, missing invariants, reentrancy | codebase-analyzer (state mutations) |

## Delegation Strategy
- **codebase-analyzer (comprehensive)** — algorithm analysis, state tracing (need data model + edge cases + execution flow)
- **codebase-analyzer (focused)** — control flow tracing (execution flow + dependencies only)
- **codebase-pattern-finder** — inconsistent error handling patterns, all synchronization patterns, validation variations
- **web-search-researcher** (limited) — known vulnerabilities in specific algorithms, correct usage of concurrency primitives, edge cases for specific operations (float, Unicode)

## Prioritization Hierarchy
| Level | Criteria |
|---|---|
| Critical | Data loss, security bypass, crash/panic, memory corruption |
| High | Incorrect results, silent failures, exploitable edge cases |
| Medium | Performance issues, suboptimal algorithms, race conditions |
| Low | Defensive programming improvements, clarity issues |

## Verification: Tests, Not Linters
```bash
# Phase 1: Establish baseline (run before analysis)
[language-specific-test-command]

# Phase 2: After each fix (regression check)
[language-specific-test-command]

# Phase 3: Final verification
[language-specific-test-command]  # All tests pass + new tests added
[coverage-command]               # Coverage increased for fixed paths
```

Language-specific test commands: pytest / unittest (Python), jest / vitest / npm test (TypeScript), mvn test / gradle test (Java), `go test ./... -v` + `go test -race` (Go), `cargo test` (Rust).

## Issue Numbering
Issues are numbered `LOGIC-001`, `LOGIC-002`, etc. (distinct from `CLEAN-XXX` and `QA-XXX`)

## Per-Issue Format (Improvement Plan section)
```
### LOGIC-001: [Issue Title]
- Priority: Critical/High/Medium/Low
- Category: [one of 7]
- File(s): path:line-line
- Issue: [what is wrong]
- Evidence: code excerpt
- Expected Behavior: what SHOULD happen
- Actual Behavior: what DOES happen
- Recommendation: specific fix
- Test Case: input that triggers bug OR new test to add
- Done When: all tests pass + new test case added
```

Note: includes both **Expected** and **Actual** behavior — distinguishes this from clean-code which only notes smell/fix.

## Report Format
Output: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
Structure: `<thinking>` + `<answer>` separation

`<thinking>` — 5 phases:
1. Target Discovery (method, files found, scope)
2. Baseline Verification (test command, results, behavioral baseline)
3. Logic Analysis (files read, delegation calls, findings by category, issue counts by category)
4. Delegation Log (each subagent invocation: task, response summary, key findings)
5. Prioritization and Synthesis (reasoning per priority level, grouping decisions)

`<answer>` — YAML frontmatter + report body:
- Frontmatter fields include: `overall_status` (Pass/Conditional Pass/Fail), `critical_issues`, `high_priority_issues`, `analysis_categories` list
- Body sections: Scan Metadata, Executive Summary, Test Suite Baseline, Logic Analysis Findings (7 sections), Improvement Plan, Acceptance Criteria, Implementor Checklist, References

## Quick Reference Bug Patterns (in SKILL.md)
Embedded code examples for most common patterns across languages:
- Off-by-one (`i < len` vs `i < len-1` for look-ahead)
- Null dereference (optional chaining fix)
- Race condition (TOCTOU — check-then-act)
- Boolean logic (De Morgan's law mistake with `!()`)
- Integer overflow (cast to wider type before arithmetic)
- Floating point equality (use `math.isclose` not `==`)
- Resource leaks (context manager / RAII)

## Reference Files
- `references/common-bug-patterns.md` — detailed examples across all 7 categories

## Position in workflow
- Loaded by Researcher in QA mode (same as other QA skills)
- Can be used standalone or combined with clean-code / language-specific skills
- Sits in parallel QA path; output consumed by Planner to produce implementation plan
- Particularly valuable for: code reviews before merging complex logic, auditing after bug report, reviewing algorithmic code
