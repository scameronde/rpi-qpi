# python-qa skill — Raw Notes

## Role
- Type: skill (loaded via `Skill` tool)
- `disable-model-invocation: true` — reference material, not standalone execution
- `allowed-tools: Bash, Read` — no `Agent` (unlike logic-bugs-qa); no subagent delegation in tool grant, though delegation log suggests it's used in practice
- Purpose: Python-specific code quality analysis using 4 automated tools + manual analysis in 3 categories.

## 4 Automated Tools (run in parallel)

| Tool | What it checks | Key flags |
|---|---|---|
| `ruff` | Style, complexity, code quality (linter) | no extra flags needed |
| `pyright` | Type errors, type safety (static type checker) | no extra flags needed |
| `bandit` | Security vulnerabilities | `-r` (recursive) |
| `interrogate` | Docstring coverage | `--fail-under 80 -vv --omit-covered-files --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate` |

If a tool is unavailable: note in report, skip that tool, continue with rest.
Always capture version numbers before running.

## Prioritization Hierarchy
| Level | Source | Criteria |
|---|---|---|
| Critical | bandit | Security vulnerabilities (HIGH/MEDIUM severity) |
| High | pyright | Type errors blocking type checking |
| Medium | ruff C901+, interrogate | Testability issues, maintainability risks, complexity, coverage gaps |
| Low | ruff E501/N806/etc | Readability, style consistency |

## Issue Numbering
Issues are numbered `QA-001`, `QA-002`, etc. (shared namespace — not prefixed with language)

## 3 Manual Analysis Categories (Phase 3)
1. **Readability** — function length, docstring quality, variable naming, complex conditionals
   - Note: interrogate covers docstring *presence*; manual phase covers docstring *quality* (clarity, completeness, accuracy)
2. **Maintainability** — code duplication, magic numbers, imports, module cohesion, hard-coded config
3. **Testability** — missing tests, tight coupling, DI patterns, coverage gaps

## Report Format
Output: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
Structure: `<thinking>` + `<answer>` separation

`<thinking>` — 5 phases:
1. Target Discovery (method, files, scope)
2. Automated Tool Execution (versions, commands, summarized outputs, verbosity strategy)
3. File Analysis (files read with line ranges, categories performed, issue counts by category)
4. Delegation Log (subagent invocations: codebase-locator tests_only, pattern-finder, codebase-analyzer execution_only, web-search-researcher)
5. Prioritization and Synthesis (per-level reasoning, grouping decisions, trade-offs)

`<answer>` — YAML frontmatter + report body:
- Frontmatter: `overall_status` (Pass/Conditional Pass/Fail), issue counts per level, `tools_used`, `tools_unavailable`
- Body sections: Scan Metadata, Executive Summary, Automated Tool Findings (4 subsections), Manual Quality Analysis (3 subsections), Improvement Plan, Acceptance Criteria, Implementor Checklist, References

### Automated tool output verbosity strategy
- ruff/pyright: first 5-10 issues, or category breakdown if >50
- bandit: all issues if ≤10, else first 10 + count (security = always show)
- interrogate: all missing if ≤10, else first 10 + count

## Per-Issue Format (Improvement Plan)
```
### QA-001: [Issue Title]
- Priority: Critical/High/Medium/Low
- Category: Security/Types/Readability/Maintainability/Testability
- File(s): path/to/file.py:line-line
- Issue: [detailed description]
- Evidence: code excerpt
- Recommendation: specific action (NO VAGUE INSTRUCTIONS)
- Done When: observable condition
```

## Baseline Verification Commands for Planner
```bash
ruff check [target]          # Should pass after Phase 1
pyright [target]             # Should pass after Phase 2
bandit -r [target]           # Should pass after Phase 1
pytest [target] --cov=[target]  # Should pass after Phase 2
```

## Key Differences from Other QA Skills

| | python-qa | clean-code | logic-bugs-qa |
|---|---|---|---|
| Language | Python only | Any | Any |
| Automated tools | 4 (ruff, pyright, bandit, interrogate) | 3 (lizard, scc, jscpd) | None (tests only) |
| `Agent` tool | Not in allowed-tools | Not in allowed-tools | Yes |
| Issue prefix | QA-XXX | CLEAN-XXX | LOGIC-XXX |
| Security coverage | Yes (bandit) | No | No |
| Type checking | Yes (pyright) | No | No |
| Doc coverage | Yes (interrogate) | No | No |
| Verification | ruff/pyright/bandit/pytest | lizard/jscpd/code review | test suite only |

## Position in workflow
- Run BEFORE clean-code (language-specific QA first, then design review)
- Loaded by Researcher in QA mode
- Output consumed by Planner to produce a QA implementation plan
- No reference files (unlike clean-code which has 6 reference files)
