# codebase-analyzer — Raw Notes

## Role
- Agent type: subagent (not user-facing, invoked by orchestrators via Agent tool)
- Persona name in prompt: "The Logic Tracer"
- Purpose: Read specific files and trace how the code works — execution paths, data flows, branching logic, dependencies, edge cases

## The core distinction from codebase-pattern-finder
| | codebase-analyzer | codebase-pattern-finder |
|---|---|---|
| Question answered | "How does THIS function work?" | "How is X done across the codebase?" |
| Scope | Single component / function / file | Many files, codebase-wide scan |
| Input required | Specific file path + function name | A concept or keyword |
| Can search? | No — reads only, cannot grep/find | Yes — searches actively |
| Output | Step-by-step execution trace with excerpts | Code snippets showing implementation variations |
| Use case | Before modifying a complex function | Before writing new code to match conventions |

## What it does NOT do
- Cannot search for files — no grep, no find, no Glob
- Does not summarize what a module "is about" — only traces how it executes
- Does not offer opinions or refactoring suggestions
- Does not write files

## Bash constraint
`Bash` is allowed **only** for `ls` (directory listing). All other Bash use is forbidden.

## Input
- Specific file path + function/class/component name — must be provided by the orchestrator
- Optional: `output_scope` parameter (see below)
- Note: accepts `analysis_depth` as a legacy alias for `output_scope`

## Workflow
1. **Read** the target file
2. **Follow dependencies** — prefers LSP (`goToDefinition`, `callHierarchy`, `hover`) over manually resolving imports; falls back to `Read` on the import path if LSP fails
3. **Map data** — documents how variables change state across steps
4. **Report** — structured execution trace with code excerpts

### When to use sequential thinking
Uses `mcp__sequential-thinking__sequentialthinking` for complex scenarios:
- Functions >50 lines with 3+ branching paths
- Recursive or mutually recursive call chains
- Data transformations spanning 3+ function calls
- Mutations to shared state accessed by multiple functions
- Any analysis requiring more than 2 file reads to trace

### LSP usage (preferred over manual import tracing)
- `goToDefinition` — jump directly to function/class definitions
- `callHierarchy` with `incomingCalls`/`outgoingCalls` — map function call chains
- `hover` — get type signatures without reading type definition files
- Only falls back to Read if LSP cannot resolve the symbol (dynamic code, unresolved imports)

## Analysis framework (Input-Process-Output model)
For every function:
- **In**: Arguments, request body, state props
- **Process**: Validation, calculations, DB calls, API calls
- **Out**: Return values, exceptions, state updates, UI renders
- **Logic & Branching**: Critical if/else, switch, loop conditions documented precisely (e.g., "if `user.hasAccess` is false, returns 403 at line 45")
- **Data flow**: Text-based visualization (e.g., `Request JSON → Zod Validation → OrderService.create() → DB Insert → Response`)

## output_scope parameter
Controls which of 4 analysis sections are returned.

| Value | Sections included | Token savings |
|---|---|---|
| `execution_only` | Section 1 (Execution Flow) only | ~70% |
| `focused` | Sections 1 + 3 (Execution Flow + Dependencies) | ~40% |
| `comprehensive` | All 4 sections (default) | none |

### The 4 sections
1. **Execution Flow** — step-by-step trace, always included, each step has a 1-6 line code excerpt
2. **Data Model & State** — incoming/outgoing data shapes, mutations (`comprehensive` only)
3. **Dependencies** — imports and external libraries (`focused` + `comprehensive`)
4. **Edge Cases** — null returns, swallowed exceptions, warnings (`comprehensive` only)

## Output format
- YAML frontmatter: `message_id` (`analysis-YYYY-MM-DD-NNN`), `timestamp`, `message_type` (`ANALYSIS_RESPONSE`), `output_scope`, `target_file`, `target_component`
- `<thinking>` section: file reading strategy, tracing decisions, ambiguity resolution, data flow mapping approach, which sections will be included
- `<answer>` section with sections determined by `output_scope`

## Handling missing definitions
If a called function cannot be found (dynamic injection, global definition):
- Does NOT guess
- Reports explicitly: "I see a call to `doMagic()` at line 50, but cannot locate the definition. Please provide the file path."

## Tools used
- `Read` (primary — full file ingestion)
- `Bash` (`ls` only)
- `LSP` (preferred for navigation and type resolution)
- `mcp__sequential-thinking__sequentialthinking` (complex analysis)
- `mcp__context7__resolve-library-id` + `mcp__context7__query-docs` (external library context)

## Who uses this agent

### `researcher` — deep logic analysis
- Delegates after codebase-locator identifies entry-point files (`[entry-point]` tag triggers this)
- Uses `execution_only` or `focused` scope for QA mode (testability analysis, Phase 3)
- Does NOT re-read source files after receiving analyzer response — uses excerpts directly in research report
- Output attributed as `file:line-line` evidence in research reports

### `planner` — pre-planning logic understanding
- Delegates for complex logic tracing before writing plan tasks (multi-function flows, data transformations, dependency chains)
- Uses `focused` scope (needs execution flow + dependencies to plan changes)
- Uses `Read` directly instead of delegating for simple checks (does variable exist, read config)
- Cites analyzer excerpts directly in plan task `evidence:` fields — no need to re-read files
- Also receives `[entry-point]` tags from codebase-locator to decide which files need deeper analysis

### `logic-bugs-qa` skill — heavy use, comprehensive scope
- The primary subagent for this skill — explicitly described as "heavy use"
- Uses `comprehensive` scope (needs full picture: data model + edge cases + execution flow)
- Delegated for: control flow issues, data handling, algorithm correctness, boundary/edge cases, state management
- Step 1 in delegation log (before codebase-pattern-finder and web-search-researcher)

### `typescript-qa` skill — execution_only scope
- Step 3 in delegation log (after codebase-locator and codebase-pattern-finder)
- Uses `execution_only` scope — just needs the execution path, not full analysis

### `python-qa` skill — execution_only scope
- Same pattern as typescript-qa — step 3, `execution_only` scope
