# clean-code skill — Raw Notes

## Role
- Type: skill (loaded via `Skill` tool, not a subagent)
- `disable-model-invocation: true` — loaded as reference material, does not invoke a model by itself
- `allowed-tools: Bash, Read` — skill grants access to these tools when loaded
- Purpose: Language-agnostic code quality analysis. Provides reference material, checklists, metrics thresholds, and a QA report template for evaluating code against classic software engineering principles.
- Consumer: Researcher (in QA mode) loads this skill to gain automated tools, prioritization rules, and report template.

## Source Books
- Clean Code — Robert C. Martin
- The Pragmatic Programmer — Hunt & Thomas
- Code Complete (2nd Edition) — Steve McConnell
- Refactoring — Martin Fowler
- Working Effectively with Legacy Code — Michael Feathers
- Refactoring to Patterns — Joshua Kerievsky

## When to Use
- After language-specific QA passes (python-qa, typescript-qa) for design review
- During design review or architecture evaluation
- Before major refactoring initiatives
- When evaluating legacy code
- When code "works but feels wrong"

## 4 Evaluation Dimensions
1. **STRUCTURE** — Coupling, cohesion, abstraction, orthogonality
2. **READABILITY** — Naming, formatting, comments, clarity
3. **TESTABILITY** — Dependencies, seams, observability, purity
4. **MAINTAINABILITY** — DRY, SOLID, code smells, error handling

## Automated Tools (Section 2)
Three language-agnostic tools run in parallel:

| Tool | Purpose | Install |
|---|---|---|
| `lizard` | Complexity (CCN), function length, parameter count | `pip install lizard` |
| `scc` | Lines of code, comment ratio, language stats | Go binary |
| `jscpd` | Duplicate code detection (language-agnostic) | `npm install -g jscpd` |

### Key commands
```bash
lizard [target] --CCN 15 --length 50 --arguments 3
scc [target] --by-file
jscpd [target] --threshold 5 --min-lines 5 --min-tokens 50
```

If tools unavailable: note in report "Tools unavailable", proceed with manual analysis only.

### Thresholds
| Metric | Ideal | Acceptable | Critical |
|---|---|---|---|
| Cyclomatic Complexity (CCN) | ≤ 10 | ≤ 15 | > 20 |
| Function length (lines) | ≤ 20 | ≤ 50 | > 100 |
| Parameter count | 0-2 | 3 | ≥ 4 |
| Code duplication | < 3% | < 5% | > 10% |
| Comment ratio | 10-30% | — | too low or too high |
| Nesting depth | ≤ 3 | ≤ 4 | > 4 |

## Manual Analysis Checklist (Section 3)

### Structure (5 items)
- Coupling — loosely coupled? (Pragmatic Programmer: Orthogonality)
- Cohesion — each module does one thing? (Code Complete Ch. 5)
- Abstraction Levels — consistent within each layer? (Clean Code Ch. 3)
- Orthogonality — can components change independently? (Pragmatic Programmer Ch. 7)
- Data Structures — primitives wrapped in meaningful types? (Code Complete Ch. 10)

### Readability (6 items)
- Naming — intention-revealing? (Clean Code Ch. 2)
- Function Size — small? (Clean Code Ch. 3)
- Nesting Depth — max 3-4 levels? (Code Complete Ch. 19)
- Comments — explain WHY, not WHAT? (Clean Code Ch. 4)
- Magic Numbers — replaced with named constants? (Code Complete Ch. 12)
- Formatting — consistent? (Clean Code Ch. 5)

### Testability (5 items)
- Seams — can dependencies be substituted? (Working with Legacy Code Ch. 4)
- Pure Functions — side effects minimized? (Clean Code Ch. 3)
- Dependency Injection — dependencies explicit? (Pragmatic Programmer Ch. 28)
- Argument Count — short parameter lists? (Clean Code Ch. 3)
- Observable Outcomes — can behavior be verified? (Working with Legacy Code Ch. 11)

### Maintainability (5 items)
- DRY — no duplicated logic? (Pragmatic Programmer Ch. 9)
- Single Responsibility — one reason to change? (Clean Code Ch. 10)
- Open/Closed — extends without modification? (Clean Code Ch. 10)
- Code Smells — check Fowler's catalog (12 primary smells)
- Error Handling — exceptions, informative messages, cleanup? (Clean Code Ch. 7)

### Primary Fowler code smells checked
Long Method, Large Class, Long Parameter List, Divergent Change, Shotgun Surgery, Feature Envy, Data Clumps, Primitive Obsession, Switch Statements, Speculative Generality, Message Chains, Middle Man

## Prioritization (Section 5)
| Priority | Criteria | Timeline |
|---|---|---|
| P1 Critical | CCN > 20, Shotgun Surgery, Feature Envy in core, missing error handling in critical paths, security smells | Current sprint |
| P2 High | CCN 15-20, Large Class, 4+ params, Data Clumps (5+ locs), Duplication > 10% | 1-2 sprints |
| P3 Medium | Magic numbers, WHAT comments, nesting > 4, Middle Man, Duplication 5-10% | Opportunistically |
| P4 Low | Duplication < 5%, formatting, minor naming | Only if trivial |

### Decision heuristic
- Causing bugs? → P1
- Blocking testing? → P2
- Slowing development? → P2 or P3
- Aesthetics only? → P4
- Additional context: git change frequency, business criticality, team pain points

## Verification Commands for Planner (Section 4)
Two types:
- **Quantitative**: lizard/scc/jscpd commands with measurable pass conditions
- **Qualitative**: code review criteria ("confirms names reveal intent", "confirms WHY over WHAT")
- **Hybrid**: both combined (e.g. "lizard shows CCN reduced by 50% AND code review confirms single responsibility")

## Report Format (Section 6)
Output: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
Structure uses `<thinking>` + `<answer>` separation:
- `<thinking>` — 4 phases: Target Discovery, Automated Tool Execution, Manual Analysis, Synthesis
- `<answer>` — YAML frontmatter (`message_type: QA_REPORT`) + report body

Issue numbering: `CLEAN-001`, `CLEAN-002`, etc.

Per-issue format: Category, Location, Evidence (code excerpt), Metrics, Impact, Book Reference, Recommended Fix, Verification (quantitative + qualitative)

## Integration with QA Workflow (Section 7)
### Relationship to language-specific skills
- **python-qa / typescript-qa**: syntax errors, type errors, security, language-specific practices → run FIRST
- **clean-code**: design principles, code smells, cross-language concerns → run SECOND (after language-specific)

### When to use both
- Comprehensive code review before major release
- Evaluating legacy code for refactoring
- After significant feature development

## Reference Files
All 5 principles + catalog + citations live in `references/`:
- `structure-principles.md`
- `readability-principles.md`
- `testability-principles.md`
- `maintainability-principles.md`
- `code-smells-catalog.md`
- `book-references.md`

Skill instructs: "Load these references during manual analysis to guide evaluation."

## Position in workflow
- Loaded by Researcher in QA mode
- Output (QA report) consumed by Planner to produce a QA implementation plan
- Sits in the parallel QA path alongside the main pipeline
