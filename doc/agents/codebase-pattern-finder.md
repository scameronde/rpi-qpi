# codebase-pattern-finder — Raw Notes

## Role
- Agent type: subagent (not user-facing, invoked by orchestrators via Agent tool)
- Persona name in prompt: "The Pattern Librarian"
- Purpose: Scan the entire codebase to find how a concept or idiom is implemented, return concrete copy-pasteable code snippets showing all existing variations

## The core distinction from codebase-analyzer
| | codebase-pattern-finder | codebase-analyzer |
|---|---|---|
| Question answered | "How is X done across the codebase?" | "How does THIS function work?" |
| Scope | Many files, codebase-wide scan | Single component / function / file |
| Input required | A concept or keyword | Specific file path + function name |
| Can search? | Yes — searches actively | No — reads only, cannot grep/find |
| Output | Code snippets showing implementation variations | Step-by-step execution trace with excerpts |
| Use case | Before writing new code to match conventions | Before modifying a complex function |

## What it does NOT do
- Does not refactor or improve code
- Does not offer opinions on best practices (unless explicitly asked to compare legacy vs. modern)
- Does not produce execution traces or logic analysis (that's codebase-analyzer)

## Input
- A concept/keyword query (e.g., "How is pagination implemented?", "Find all error handling patterns")
- Optional: scope hint (e.g., "in React components", "in src/api/")
- Optional: `correlation_id` for workflow tracking

## Workflow
1. **Plan** (mandatory, in `<thinking>`) — identify keywords, search scope, expected variations before running any commands
2. **Search** — LSP for symbols, Grep/Bash for string patterns, Glob for file types
3. **Read** — MUST read the actual file to extract snippets (never trusts grep output alone — grep snippets are often incomplete/missing context)
4. **Report** — returns variations with frequency metrics

### Tool selection (LSP vs Grep)
- **Use LSP** (`workspaceSymbol`, `findReferences`) for: class names, function names, type definitions, symbol usages
- **Use Grep/Bash** for: string literals, comments, non-symbol text, regex patterns, testing patterns
- **Use Glob** for: finding file types (e.g., `**/*.test.ts` to find testing patterns)
- **Use Read** always: to extract complete snippets with full context (imports, class wrappers)

## Output: variation-based format
Results are grouped by implementation variation, not by file. Each variation shows:
- **Location** — `src/path/to/file.ts:45-67` (canonical example)
- **Frequency** — `N/M files (X%)` — how many files use this variation out of total files with the pattern
- **Semantic label** (optional): Dominant (>70%), Common (30-70%), Rare (<30%)
- **Code snippet** — actual code read from file, includes imports/class wrappers for context
- **Distribution Notes** — where each variation appears (e.g., "Variation 2 is limited to `src/legacy`")

This frequency data is explicitly used downstream: orchestrators use it to decide which pattern to follow ("dominant pattern = what new code should look like").

## Output format
- YAML frontmatter: `message_id` (`pattern-YYYY-MM-DD-NNN`), `correlation_id`, `timestamp`, `message_type` (`PATTERN_RESPONSE`), `finder_version` (`1.1`), `query_topic`, `patterns_found`, `variations_total`, `files_matched`, `files_scanned`, `search_keywords`
- `<thinking>` section: planned keywords, scope, executed commands, matches per command, distinct variations identified, files read for snippets
- `<answer>` section: one block per variation with location, frequency, code snippet, distribution notes

Note: No `output_scope` parameter — always returns full results. Unlike other agents, there is no token-optimization mode.

## Key rule: always read before posting
Never outputs code from grep results alone. Always reads the file to get the full snippet with surrounding context (imports, class declarations). Grep is only used to find file paths.

## "No examples found" handling
If nothing matches: states "No examples found matching [criteria]" explicitly. Does not invent code.

## Bonus: finds test files too
Looks for a test file that tests the pattern — described as "the ultimate documentation of expected behavior." If found, included alongside the implementation.

## Tools used
- `Bash` (grep for string patterns, find)
- `Read` (snippet extraction — always required)
- `Glob` (file type searches)
- `Grep` (content searches)
- `LSP` (`workspaceSymbol`, `findReferences`)
- `mcp__sequential-thinking__sequentialthinking`
- `mcp__context7__resolve-library-id` + `mcp__context7__query-docs`

## Who uses this agent

### `researcher` — convention mapping
- Uses pattern-finder alongside codebase-locator (both listed as "Find files/Context" tools)
- Delegates when needing to understand how a concept is implemented across the codebase
- Output feeds into research reports as evidence of existing conventions

### `planner` — convention research before planning
- Explicitly described use case: "Before planning new code, research established conventions to ensure consistency"
- Delegates to find dominant patterns so new code matches existing style
- Uses frequency data (`Dominant (10/12 files, 83%)`) to decide which convention to follow when writing plan tasks

### `logic-bugs-qa` skill — targeted use for cross-cutting patterns
- Uses pattern-finder specifically for patterns that span multiple files (vs. single-function analysis which goes to codebase-analyzer)
- Delegated for: concurrency/synchronization patterns, error handling patterns, validation pattern variations
- Step 2 in delegation log (after codebase-analyzer, before web-search-researcher)

### `typescript-qa` skill — duplicate pattern detection
- Step 2 in delegation log (after codebase-locator, before codebase-analyzer)
- Task framing: "Find duplicate [pattern] across [scope]"
- Response recorded as: X variations found in Y files, with variation list and frequencies

### `python-qa` skill — same as typescript-qa
- Step 2, same framing and recording pattern
