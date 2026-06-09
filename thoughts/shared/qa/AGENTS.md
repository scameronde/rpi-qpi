# qa/ — QA Review Reports

## Purpose

Stores quality analysis reports produced by `/researcher` when operating in QA mode. Reports cover automated tool findings (linters, type checkers, test runners) combined with manual code quality analysis.

## Ownership

`/researcher` writes (QA mode only). Reports are write-once after creation.

## Local Contracts

**File naming:** `YYYY-MM-DD-<Target>.md` where `<Target>` is the module or file name (e.g., `Auth-Module`, `TypeScript-Config`).

**Required frontmatter:**
```yaml
---
date: YYYY-MM-DD
message_type: QA_REPORT
target: "[module or file name]"
status: complete
---
```

**Report structure** (follows the loaded QA skill's template):
- Automated tool output summary (linter warnings, type errors, test results)
- Issue classification by severity (critical / high / medium / low)
- Manual analysis findings with file:line evidence
- Each finding includes: description, location, severity, and reproduction path

**QA mode triggers:** Request includes QA keywords (QA, quality analysis, code review, test coverage) OR user explicitly requests a language-specific QA skill.

## Work Guidance

- QA reports are read-only after creation
- When re-running QA on the same target, create a new dated report — do not overwrite
- Severity classification follows the rules in the loaded language-specific QA skill

## Verification

- A valid QA report has automated tool output AND at least one manual finding
- All file:line citations must be verifiable in the current codebase state
