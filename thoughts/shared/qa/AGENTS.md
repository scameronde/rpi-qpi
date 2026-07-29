# qa/ — QA Review Reports

## Purpose

Stores quality analysis reports produced by `/fact-finder` when operating in QA mode. Reports cover automated tool findings (linters, type checkers, test runners) combined with manual code quality analysis.

## Ownership

`/fact-finder` writes (QA mode only). Reports are write-once after creation.

## Local Contracts

**File naming:** `YYYY-MM-DD-<Target>-<Lens>.md` where `<Target>` is the module or file name (e.g., `Auth-Module`, `TypeScript-Config`) and `<Lens>` names the QA skill that produced the report. A full audit produces one file per loaded skill, requiring the lens suffix to prevent collisions.

**Lens tokens:** `-Python` (`python-qa`), `-TypeScript` (`typescript-qa`), `-Design` (`clean-code`), `-Bugs` (`logic-bugs-qa`). These four are the closed set; a new QA skill must declare its own token.

**Required frontmatter:**
```yaml
---
date: YYYY-MM-DD
message_type: QA_REPORT
target: "[module or file name]"
status: complete
upstream-artifact: none
---
```

**Report structure** (follows the loaded QA skill's template):
- Automated tool output summary (linter warnings, type errors, test results)
- Issue classification by severity (critical / high / medium / low)
- Manual analysis findings with file:line evidence
- Each finding includes: description, location as `file:line`, severity, a 1-6 line excerpt, and a `Verify` command or the `none — requires review` literal

**QA mode triggers:** Request includes QA keywords (QA, quality analysis, code review, test coverage) OR user explicitly requests a language-specific QA skill.

## Work Guidance

- QA reports are read-only after creation
- When re-running QA on the same target, create a new dated report — do not overwrite
- Severity classification follows the rules in the loaded language-specific QA skill
- When two QA skills are loaded for one target, each produces a separate report with its own lens suffix; the lens suffix prevents collisions and signals to `/planner` which skill produced each report

## Verification

- A valid QA report has automated tool output AND at least one manual finding
- All file:line citations must be verifiable in the current codebase state
- A valid report's frontmatter carries all five keys: `date`, `message_type`, `target`, `status`, and `upstream-artifact`
