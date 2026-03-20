# typescript-qa skill — Raw Notes

## Role
- Type: skill (loaded via `Skill` tool)
- `disable-model-invocation: true` — reference material, not standalone execution
- `allowed-tools: Bash, Read` — no `Agent` (same as python-qa)
- Purpose: TypeScript-specific code quality analysis using 3 core + 2 optional automated tools + manual analysis in 5 categories.

## Automated Tools

### Core tools (always run, in parallel)
| Tool | What it checks | Command |
|---|---|---|
| `tsc` | Type errors blocking compilation | `npx tsc --noEmit --pretty false` |
| `eslint` | Code quality, style, complexity | `npx eslint . --ext .ts,.tsx --format json` |
| `knip` | Dead code — unused exports, files, dependencies | `npx knip --reporter json` |

### Optional tools (run if detected in package.json)
| Tool | What it checks | Command |
|---|---|---|
| `eslint-plugin-security` | Security vulnerabilities | `npx eslint . --ext .ts,.tsx --plugin security --format json` |
| `eslint-plugin-jsdoc` | JSDoc/TSDoc documentation coverage | `npx eslint . --ext .ts,.tsx --plugin jsdoc --format json` |

Check `package.json` for optional plugin presence before running. Capture version from package.json or `--version`.

## Prioritization Hierarchy
| Level | Source | Criteria |
|---|---|---|
| Critical | eslint-plugin-security | Security vulnerabilities (HIGH/MEDIUM) |
| High | tsc | Type errors blocking compilation |
| Medium | eslint complexity, knip | Testability issues, maintainability risks, dead code |
| Low | eslint style, React patterns | Readability, style consistency |

## Issue Numbering
`QA-001`, `QA-002`, etc. — same namespace as python-qa (not language-prefixed)

## 5 Manual Analysis Categories (Phase 3)
1. **Readability** — function/component length, JSDoc/TSDoc quality, variable naming, complex conditionals
2. **Maintainability** — code duplication, magic numbers, imports, module cohesion, hard-coded config
3. **Type Safety** — `any` usage, type assertions, non-null assertions (`!`), missing generic constraints, tsconfig strict mode
   - Note: this supplements tsc; covers patterns and configurations beyond what tsc catches
4. **React/JSX** — component prop typing, hook dependencies, missing keys, unsafe DOM, composition patterns
   - Explicitly marked Low Priority in report template; focus on correctness not style preferences
5. **Testability** — missing tests, tight coupling, DI patterns, coverage gaps

## Key TypeScript-Specific Concerns
- `any` usage — defeats type safety
- Non-null assertions (`!`) — runtime crash risk if wrong
- Type assertions (`as X`) — bypasses type checker
- Missing generic constraints — overly permissive types
- `tsconfig` strict mode — whether strict is enabled at all
- JSDoc/TSDoc quality — eslint-plugin-jsdoc covers presence; manual covers quality
- Knip dead code — unique to TS; finds unused exports/files/dependencies that don't cause compiler errors

## Report Format
Output: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
Structure: `<thinking>` + `<answer>` separation

`<thinking>` — 5 phases (identical structure to python-qa):
1. Target Discovery
2. Automated Tool Execution (versions, commands, summarized outputs)
3. File Analysis (5 categories, issue counts per category)
4. Delegation Log (codebase-locator, pattern-finder, codebase-analyzer, web-search-researcher)
5. Prioritization and Synthesis

`<answer>` — YAML frontmatter + report body:
- Frontmatter: `overall_status`, issue counts, `tools_used` (includes optional plugins), `tools_unavailable`
- Body sections: Scan Metadata, Executive Summary, Automated Tool Findings (5 subsections), Manual Quality Analysis (5 subsections), Improvement Plan, Acceptance Criteria, Implementor Checklist, References

### Automated tool output verbosity strategy
- tsc/eslint: first 5-10 errors, or category breakdown if >50
- knip/security: all if ≤10, else first 10 + count

### JSDoc quality split (same pattern as python-qa docstring split)
- eslint-plugin-jsdoc measures *presence*
- Manual phase measures *quality* (clarity, completeness, accuracy)

## Baseline Verification Commands for Planner
```bash
npx tsc --noEmit              # Should pass after Phase 1
npx eslint . --ext .ts,.tsx   # Should pass after Phase 2
npx knip                      # Should pass after Phase 3
npm test -- --coverage        # Should pass after Phase 2
```

Note: phased — tsc and security first (Phase 1), then eslint/tests (Phase 2), then dead code (Phase 3)

## Comparison with python-qa

| | typescript-qa | python-qa |
|---|---|---|
| Core tools | tsc, eslint, knip | ruff, pyright, bandit, interrogate |
| Optional tools | eslint-plugin-security, eslint-plugin-jsdoc | none |
| Security tool | eslint-plugin-security (optional) | bandit (always) |
| Dead code detection | knip (always) | none |
| Doc coverage | eslint-plugin-jsdoc (optional) | interrogate (always) |
| Type checker | tsc | pyright |
| Linter | eslint | ruff |
| Extra manual category | React/JSX | none |
| No reference files | same | same |

## Position in workflow
- Run BEFORE clean-code (language-specific QA first, then design review)
- Loaded by Researcher in QA mode
- Output consumed by Planner to produce a QA implementation plan
- No reference files (all content in one SKILL.md, same as python-qa)
