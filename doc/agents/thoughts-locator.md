# thoughts-locator — Raw Notes

## Role
- Agent type: subagent (not user-facing, invoked by orchestrators via Agent tool)
- Persona name in prompt: "The Archivist"
- Purpose: Find file paths for historical documents in the `thoughts/` directory by topic keyword

## What it does NOT do
- Does not read full document content
- Does not analyze or interpret documents (that's thoughts-analyzer)
- Only reads up to 5 lines per file to confirm relevance

## Input
- A topic/keyword (e.g., "auth", "ENG-123", "payment flow")
- Optional: `search_scope` parameter (see below)

## Search strategy
1. Uses `Bash` with `find` and `grep -r` to locate files by keyword
2. Reads first 5 lines of each match to confirm relevance
3. Strips `/searchable/` from any paths (symlinked index artifact — critical edge case)
4. Groups results by document category

## Directory map it knows about
| Category | Path | Filename convention |
|---|---|---|
| Missions | `thoughts/shared/missions/` | `YYYY-MM-DD-[Project].md` |
| Specs | `thoughts/shared/specs/` | `YYYY-MM-DD-[Project].md` |
| Epics | `thoughts/shared/epics/` | `YYYY-MM-DD-[Epic].md` |
| Plans | `thoughts/shared/plans/` | `YYYY-MM-DD-[Ticket].md` |
| QA Reports | `thoughts/shared/qa/` | `YYYY-MM-DD-[Target].md` |
| Research | `thoughts/shared/research/` | `YYYY-MM-DD-[Topic].md` |
| ADRs | `thoughts/decisions/` | freeform |
| Personal notes | `thoughts/[username]/` | freeform |

Note: Personal folders are explicitly called out as important — "don't ignore these!"

## search_scope parameter
Controls how many categories are returned. Trades token cost for completeness.

| Value | Categories returned | Token savings |
|---|---|---|
| `paths_only` | 1 (most relevant) | ~28% |
| `focused` | 2-3 most relevant | ~15% |
| `comprehensive` | All 8 (default) | none |

Specified in task prompt as: `search_scope: focused` (case-insensitive, regex parsed)

## Output format
- YAML frontmatter with metadata fields: `message_id`, `correlation_id`, `timestamp`, `message_type`, `search_scope`, `documents_found`, `categories_searched`, `paths_sanitized`
- `<thinking>` section documenting search strategy
- `<answer>` section with results grouped by category

## Tools used
- `Bash` (find, grep)
- `Read` (5-line header checks only)
- `mcp__sequential-thinking__sequentialthinking`

## Key quirk: path sanitization
The `thoughts/` directory has a symlinked index at `thoughts/searchable/`. Bash searches can return paths containing `/searchable/` which are invalid. The agent is instructed to always strip this segment and report the count in frontmatter (`paths_sanitized: N`).

## Relationship to thoughts-analyzer
- Locator = "where are the documents?" → returns paths
- Analyzer = "what do the documents say?" → reads and extracts signal
- Typical usage: locator runs first, passes paths to analyzer

## Who uses this agent

### `researcher` (the only consumer)
- Uses locator in **exploration mode** — doesn't know which docs exist yet
- Always runs locator first, then passes discovered paths to thoughts-analyzer
- Typically requests `comprehensive` scope to get all 8 categories
- Validates the response before proceeding: checks `documents_found`, `paths_sanitized`, inspects `<thinking>` if results seem incomplete
- Passes a `correlation_id` through both locator and analyzer calls to track the multi-step workflow (format: `research-[topic]-YYYY-MM-DD`)

### `planner` — does NOT use this agent
- Planner typically receives specific document paths from the user or epic, so skips locator entirely and goes straight to thoughts-analyzer
