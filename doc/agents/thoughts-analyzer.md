# thoughts-analyzer — Raw Notes

## Role
- Agent type: subagent (not user-facing, invoked by orchestrators via Agent tool)
- Persona name in prompt: "The Thoughts Analyzer" / "Project Historian"
- Purpose: Read specific documents from `thoughts/` and extract actionable intelligence — decisions, constraints, specs

## What it does NOT do
- Does not find or locate files (that's thoughts-locator)
- Does not summarize or paraphrase — only extracts concrete facts
- Discards: brainstorming, vague chatter, superseded ideas, "what if" discussions

## Input
- Specific file path(s) — expected to be provided by the orchestrator (typically sourced from thoughts-locator)
- Optional: `output_scope` parameter (see below)
- Optional: `correlation_id` for workflow tracking

## Workflow
1. **Read & Contextualize** — Reads full document, immediately evaluates:
   - Date (how old is this?)
   - Status (draft vs. final)
   - Author authority (lead architect vs. intern brainstorm)
2. **Signal Extraction** — Uses `mcp__sequential-thinking__sequentialthinking` to classify content:
   - **Decision** — "We decided to use Redis"
   - **Constraint** — "Max payload is 1MB", "Node version X required"
   - **Spec** — "Timeout: 5000ms", "JWT required"
   - Everything else → discarded
3. **Verification (optional)** — If a document makes a bold/questionable technical claim, cross-checks against actual source code using `Bash` grep. Reports matches or mismatches.
4. **Report** — Structured output with evidence

## Signal classification
| Type | Description | Example |
|---|---|---|
| Decision | A choice that was made | "We decided to use Redis" |
| Constraint | Hard technical limit or requirement | "Max payload is 1MB" |
| Spec | Specific value or convention | "Timeout: 5000ms", "JWT required" |
| Noise (discarded) | Questions, brainstorming, vague ideas | "What if we used Redis?" |

## output_scope parameter
Controls which sections are included in the response.

| Value | Includes | Token savings |
|---|---|---|
| `execution_only` | Extracted signal only | ~60% |
| `focused` | Signal + document metadata | ~30% |
| `comprehensive` | Signal + metadata + verification notes (default) | none |

## Output format
- YAML frontmatter: `message_id`, `correlation_id`, `timestamp`, `message_type`, `output_scope`, `source_document`, `document_date`, `document_status`, `reliability`
- `<thinking>` section with analysis reasoning
- `<answer>` section containing:
  - **Metadata** (date, status, reliability) — for `focused` / `comprehensive`
  - **Extracted Signal** (decisions/constraints/specs, each with line-number evidence and 1-6 line excerpt) — always
  - **Verification Notes** (claim vs. code comparison) — for `comprehensive` only

## Evidence format
Every signal item must include:
- Exact line number reference: `thoughts/shared/specs/auth.md:45-47`
- 1-6 line excerpt from source document in a code block

## Reliability assessment
The agent assigns a reliability level (High / Medium / Low) to the document based on date, status, and author. Outdated or conflicting information is explicitly flagged as **"Potentially Outdated"**.

## Tools used
- `Read` (full document ingestion)
- `Bash` (optional code verification with grep)
- `WebFetch` (available but not a primary workflow step)
- `mcp__sequential-thinking__sequentialthinking` (signal extraction reasoning)
- `mcp__searxng__searxng_search` (available)
- `mcp__context7__query-docs` (available)

## Key behavioral rules (from prompt)
- "Be Ruthless": if a 10-page doc has 1 decision, return 5 lines
- Quote exact values — never say "a timeout was set", say "Timeout: 5000ms"
- Flag conflicts if document architecture contradicts known project state
- Every signal item needs evidence + excerpt — no unsupported claims

## Relationship to thoughts-locator
- Locator = "where are the documents?" → returns paths
- Analyzer = "what do the documents say?" → reads and extracts signal
- Typical usage: locator runs first, passes paths to analyzer

## Who uses this agent

### `researcher` — exploration mode
- Receives paths from thoughts-locator, then delegates to analyzer
- Uses `comprehensive` output scope for full context
- Passes the same `correlation_id` used in the locator call (format: `research-[topic]-YYYY-MM-DD`)
- Does NOT re-read the source documents — trusts analyzer's excerpts and evidence directly
- Use cases: researching features with existing missions/specs/epics, tracing feature evolution, investigating QA-covered issues

### `planner` — targeted mode
- Skips thoughts-locator; already has the specific document path from the user or epic
- Uses `focused` output scope (only needs architecture and dependencies, not full analysis)
- Use cases: extension planning, consistency checking, extracting design decision context, mapping acceptance criteria
- Takes analyzer output and cites the evidence directly in plan task fields (`evidence:` field)
- Correlation ID format: `plan-[topic]-YYYY-MM-DD`

### Key difference between the two consumers
| | researcher | planner |
|---|---|---|
| Knows target doc upfront? | No — uses locator first | Yes — skips locator |
| output_scope | `comprehensive` | `focused` |
| Goal | Full historical context for research report | Architectural context to inform plan tasks |
