# codebase-locator — Raw Notes

## Role
- Agent type: subagent (not user-facing, invoked by orchestrators via Agent tool)
- Persona name in prompt: "The Cartographer"
- Purpose: Return file paths and directory topology for a given topic — NOT code logic or analysis

## What it does NOT do
- Does not analyze function logic, architecture, or behavior (that's codebase-analyzer)
- Does not output code snippets under any circumstances
- Does not provide architectural opinions
- Only reads files when absolutely necessary to identify an entry point (first 50 lines max)

## Input
- A topic/feature name or keyword (e.g., "authentication system", "UserService", "payment flow")
- Optional: `search_scope` parameter (see below)
- Optional: `correlation_id` for workflow tracking

## Search strategy
1. **Broad survey** (if request is vague) — runs `tree src -L 2 -d` to visualize directory structure
2. **Targeted search** — uses Glob patterns or `find`/`grep -l` (filenames only, never content)
3. **Entry point detection** (only when 2+ ambiguous files found) — reads first 50 lines to count exports, marks highest-export file as `[entry-point]`
4. Always excludes: `node_modules`, `.git`, `dist`, `build`

### Two search strategies
- **By filename** — `find src -name "*Controller.ts"` — best for known naming conventions
- **By content keyword** — `grep -r "class User" src -l` — best for "where is X defined?" (MUST use `-l`, never outputs code)

## search_scope parameter
Controls which sections are included in the response. More granular than thoughts-locator — has 4 levels including a test-specific mode.

| Value | Sections returned | Token savings |
|---|---|---|
| `tests_only` | Testing Coordinates only | ~75% |
| `paths_only` | Primary Implementation only | ~62% |
| `focused` | Primary Implementation + Related Configuration | ~37% |
| `comprehensive` | All 4 sections (default) | none |

Specified in task prompt as: `search_scope: focused` (case-insensitive, regex parsed)

The `tests_only` scope is specifically designed for QA agents that need test file locations for coverage analysis.

## Role metadata tags on file paths
Every returned path is annotated with a role tag in square brackets:
- `[entry-point]` — main file in a group (most exports)
- `[entry-point, exports: N]` — entry point with export count (when Read was used)
- `[secondary]` — supporting implementation file
- `[secondary, exports: N]` — supporting file with export count
- `[config]` — configuration file

## Output format
- YAML frontmatter: `message_id` (`locator-YYYY-MM-DD-NNN`), `correlation_id`, `timestamp`, `message_type` (always `LOCATION_RESPONSE`), `search_scope`, `locator_version` (`1.1`), `query_topic`, `files_found`, `directories_scanned`
- `<thinking>` section: glob patterns / bash commands used, matches found, filtering logic, entry point detection reasoning, scope level applied
- `<answer>` section with up to 4 sections depending on scope:
  - **Primary Implementation** — implementation files with role tags
  - **Related Configuration** — config files
  - **Testing Coordinates** — test files
  - **Directory Structure** — `src/features/auth/` contains: 5 TypeScript files, 1 subdirectory

## Tools used
- `Glob` (primary — wildcard searches)
- `Bash` (`find`, `tree`, `ls`, `grep -l`)
- `Read` (only for entry point disambiguation — 50 lines max, conditional use only)
- `mcp__sequential-thinking__sequentialthinking`

## Key behavioral rule: default to action
If file paths are ambiguous, the agent runs searches to resolve them rather than asking for clarification. It is explicitly instructed to be proactive.

## Who uses this agent

### `researcher` — primary consumer, comprehensive scope
- Delegates for full codebase topology mapping during research
- Uses `comprehensive` scope to get all 4 sections
- Also uses `tests_only` scope specifically in QA mode (Phase 1: Target Discovery — finding test files)
- Correlation ID format: `research-[topic]-YYYY-MM-DD`
- Response feeds into research reports as file:line evidence

### `planner` — targeted use, focused/paths_only scope
- Delegates to find implementation files before writing plan tasks
- Uses `focused` or `paths_only` scope (no need for test files during planning)
- Cites the locator response message_id directly in plan evidence fields (e.g., `codebase-locator response locator-2026-01-18-001 identified all auth components`)

### `typescript-qa` skill — tests_only scope
- Uses `tests_only` scope as step 1 in delegation log — finds test files for coverage analysis
- Result recorded as: task, response (X test files found / No test files found), file list

### `python-qa` skill — tests_only scope
- Same pattern as typescript-qa — `tests_only` scope, step 1 in delegation log

### `logic-bugs-qa` skill — mentioned in report template only
- Lists `codebase-locator` as one option for Target Identification Method in the report template
- Does NOT actively delegate to it during execution (the template just records how files were found)

### `clean-code` skill — cannot use it
- Has `disable-model-invocation: true` and `allowed-tools: Bash, Read` — agent spawning is blocked
- Mentions `codebase-locator` in report template only (same as logic-bugs-qa — just documents how the target was identified)

## Relationship to codebase-analyzer
- Locator = "where is the code?" → returns paths
- Analyzer = "what does the code do?" → reads and traces logic
- Typical usage: locator runs first, passes paths to analyzer
