# web-search-researcher — Raw Notes

## Role
- Agent type: subagent (not user-facing, invoked by orchestrators via Agent tool)
- Persona name in prompt: "The External Scout"
- Purpose: Bring verified external knowledge into the system — library docs, APIs, best practices, error resolution, version compatibility

## What it does NOT do
- Has no access to internal filesystem: no `Read`, `Glob`, `Grep`, or `Bash`
- Cannot see local code — orchestrator must provide relevant code snippets as context if needed
- Does not invent syntax or guess answers — "No definitive answer found" is a valid output

## Input
- A research question/topic from the orchestrator
- Optional: `correlation_id` for workflow tracking
- Orchestrator can inject local code context into the task prompt if comparison against current implementation is needed

## Workflow (3 phases)

### Phase 1: Strategy & Query Planning
- Breaks the request into specific lookup tasks
- Decides which tool to use for each task (docs vs. community, see tool selection below)

### Phase 2: Execution & Verification
- Executes searches
- **Critical rule**: When a promising URL or snippet is found, MUST use `WebFetch` to read the actual page — search summaries are not trusted
- Verifies version compatibility for all code examples

### Phase 3: Synthesis
- Compiles findings into structured report
- Assigns a Confidence Score (HIGH / MEDIUM / LOW / NONE) based on source authority

## Tool selection strategy

| Tool | When to use |
|---|---|
| `context7` (resolve-library-id + query-docs) | Library docs, API references, official guides, config schemas |
| `mcp__searxng__searxng_search` | Exact error messages, best-practice comparisons, finding URLs for WebFetch |
| `WebFetch` | Mandatory verification of code examples; full GitHub issue threads; exact API signatures |
| `mcp__crawl4ai__crawl4ai` | JS-heavy docs (Next.js, React SPAs); large pages needing token-efficient extraction; clean markdown for LLM |

### crawl4ai mode selection
- `mode: "markdown"` + `markdown_filter: "bm25"` + `filter_query: <topic>` → extract only query-relevant content (50-80% token reduction)
- `mode: "crawl"` → full page with metadata
- `mode: "screenshot"` → visual verification (rare)

### Decision tree (simplified)
1. JS-heavy SPA? → `crawl4ai`
2. Large page, only need specific sections? → `crawl4ai` with BM25
3. Simple static HTML? → `WebFetch`
4. Otherwise → `crawl4ai` markdown mode

## Source authority hierarchy
1. Official docs (`context7` / `WebFetch`) — authority: `high`
2. GitHub issues / PRs / Stack Overflow accepted answers — authority: `medium`
3. Blogs, community forums, Reddit — authority: `low`

Source type vocabulary: `official_docs`, `github_issue`, `stackoverflow`, `blog`, `academic_paper`, `community_forum`

## Code example extraction rules
- Provide direct source URL
- Auto-detect language
- 3-10 lines maximum (no wholesale doc copy-paste)
- Approximate line numbers from source
- Exact syntax — no modifications to what WebFetch returned

## Key behavioral rules
- "Verify, Don't Guess" — search results are hints, authoritative pages are truth
- Always check publication dates — old answers for fast-moving frameworks are wrong answers
- State "No Definitive Answer Found" rather than inventing an answer
- Document all queries executed and verification steps in `<thinking>` section (enables debugging)

## Output format
- YAML frontmatter: `message_id` (`research-YYYY-MM-DD-NNN`), `correlation_id`, `timestamp`, `message_type` (always `RESEARCH_RESPONSE`), `query_type`, `researcher_version` (`1.1`), `sources_found`, `search_tools_used`, `confidence`
- `<thinking>` section: queries run, result counts, WebFetch verifications, authority reasoning
- `<answer>` section containing:
  - **Quick Answer** — direct actionable answer
  - **Source N** blocks — each with YAML metadata (url, type, date, version, authority) + key findings + verified code example
  - **Confidence Score** with reasoning
  - **Version Compatibility** — applies-to range and breaking changes
  - **Warnings** — deprecations, experimental features, pitfalls

## "No results" handling
Has a defined fallback output format when nothing useful is found:
- `sources_found: 0`, `confidence: NONE`
- Lists all searches attempted with their result counts and statuses
- Provides **Recommended Next Steps** (e.g., "check source code directly at github.com/...")

## query_type classification
- `library_api` — how to use a specific library or API
- `best_practices` — patterns, comparisons, recommendations
- `error_resolution` — debugging specific error messages
- `version_compatibility` — migration, breaking changes, version ranges

## Tools used
- `WebFetch`
- `mcp__crawl4ai__crawl4ai`
- `mcp__searxng__searxng_search`
- `mcp__sequential-thinking__sequentialthinking`
- `mcp__context7__resolve-library-id`
- `mcp__context7__query-docs`

## Who uses this agent

### `researcher` — primary consumer
- Delegates when external knowledge is needed (library APIs, best practices, error resolution)
- Provides: specific subject + library/API name and version (if known) + optional correlation ID
- Correlation ID format: `research-[topic]-YYYY-MM-DD`
- Validates response via frontmatter: checks `sources_found`, `confidence`, `search_tools_used`
- Inspects `<thinking>` only when results seem incomplete or confidence is unexpectedly low
- Cites web research findings in reports using URL-based format (NOT file:line):
  - URL + Date + Type (e.g., `official_docs`, authority: `high`) + excerpt
  - This is explicitly different from codebase evidence which uses `path/to/file:line-line`

### `planner` — targeted use for API validation
- Delegates specifically for validating external library APIs or checking framework syntax
- Use case: before writing a plan task that depends on a specific external API, verify correct syntax/version
- If evidence cannot be obtained (web or codebase), planner creates a Verification Task instead of a PLAN-XXX task
- Correlation ID format: `plan-[topic]-YYYY-MM-DD`

### `typescript-qa` skill
- Listed as step 4 in the delegation log template (after codebase-pattern-finder and codebase-analyzer)
- Used to research external topics relevant to the QA analysis
- Output recorded as: task description, confidence level + sources, key findings

### `python-qa` skill
- Same pattern as typescript-qa — step 4 in delegation log
- Used to research external topics during Python code quality analysis

### `logic-bugs-qa` skill
- Explicitly marked as **"limited use"** — only invoked for specific narrow cases:
  - Research known vulnerabilities in specific algorithms
  - Verify correct usage of concurrency primitives
  - Look up edge cases for specific operations (floating point, Unicode, etc.)
- Step 3 in delegation log (after codebase-analyzer and codebase-pattern-finder)

### `clean-code` skill — does NOT use this agent
- Technically cannot: declares `allowed-tools: Bash, Read` and `disable-model-invocation: true` — agent spawning is disabled
- Conceptually doesn't need to: its analysis is based entirely on timeless principles from established books (Clean Code, Pragmatic Programmer, Refactoring, Code Complete, etc.) — nothing to verify online
- Relies only on local static analysis tools (lizard, scc, jscpd) and direct file reading

## Position in the workflow
- Invoked by orchestrators and skills when external knowledge is needed
- Complements the codebase-focused agents — those look inward, this one looks outward
- Output feeds into research reports, plans, and QA reports
