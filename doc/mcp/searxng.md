# searxng MCP Server — Raw Notes

## Role
- Type: MCP server (Model Context Protocol)
- Location: `.claude/mcp/searxng/`
- Auto-enabled via `"enableAllProjectMcpServers": true` in `.claude/settings.json`
- Language: TypeScript, compiled to `dist/index.js`
- Transport: stdio (StdioServerTransport — runs as subprocess, communicates via stdin/stdout)
- Purpose: Expose a self-hosted SearXNG instance as a single MCP tool (`searxng_search`) for web search

## Backend Service
- Calls a self-hosted SearXNG instance at `http://searxng.vier.services/search`
- Hardcoded URL — not configurable at runtime
- 10-second timeout (AbortController) — shorter than crawl4ai's 30s
- HTTP GET request (not POST) with query parameters
- User-Agent header: `Claude-SearXNG-MCP/1.0`
- Always appends `format=json` and `results_on_new_tab=0` to every request

## Single Tool: `searxng_search`

### Required parameter
- `query` — the search query string

### Optional parameters
| Parameter | Type | Description | Default |
|---|---|---|---|
| `categories` | string | Comma-separated categories (e.g., `"general,social media"`) | (none) |
| `language` | string | Language code (e.g., `"en"`, `"de"`, `"fr"`) | (none) |
| `pageno` | number | Page number | 1 |
| `time_range` | string enum | `"day"`, `"month"`, or `"year"` | (none) |
| `safesearch` | number | 0 = off, 1 = moderate, 2 = strict | (none) |

### URL construction
Parameters are sent as GET query params:
```
GET /search?q=<query>&format=json&results_on_new_tab=0&pageno=<n>[&categories=...][&language=...][&time_range=...][&safesearch=...]
```

## Response

### Success output shape
```json
{
  "query": "<original query>",
  "resultsFound": <number>,
  "results": [
    {
      "title": "...",
      "url": "...",
      "snippet": "...",
      "engine": "..."   // first engine name from engine[] array, or undefined
    }
  ],
  "formattedResults": "1. Title\n   URL: ...\n   snippet\n\n2. ..."
}
```

### Result limit
- Hard cap of 10 results — `data.results.slice(0, 10)` regardless of what the service returns
- `resultsFound` comes from `data.number_of_results` (SearXNG's total count) OR falls back to `limitedResults.length`
- `engine` field: takes only the first engine from the `engine[]` array in the raw response

### formattedResults
Human-readable numbered list:
```
1. <title>
   URL: <url>
   <snippet>

2. <title>
   ...
```
If no results: `"No results found for the given query."`

### Error output shape
```json
{
  "query": "<original query>",
  "error": true,
  "errorMessage": "Failed to search SearXNG: <reason>",
  "results": [],
  "formattedResults": "Error: <reason>"
}
```
Never throws — all errors caught and returned as structured JSON.

## Output shape (MCP envelope)
```json
{
  "content": [{ "type": "text", "text": "<JSON string>" }]
}
```
Same pattern as crawl4ai: text is a JSON string, not plain text.

## Build & Registration
- Build: `cd .claude/mcp/searxng && npm install && npm run build` (runs `tsc`)
- Output: `dist/index.js`
- Registered automatically via `enableAllProjectMcpServers: true` — no manual registration needed
- Dependencies: `@modelcontextprotocol/sdk ^1.0.0` only

## Comparison with crawl4ai MCP

| | searxng | crawl4ai |
|---|---|---|
| Tool name | `searxng_search` | `crawl4ai` |
| HTTP method | GET | POST |
| Timeout | 10 seconds | 30 seconds |
| Modes | 1 (search only) | 3 (crawl, markdown, screenshot) |
| Result limit | 10 hard cap | No cap (full content) |
| Output content | Structured results list | Raw page content / screenshot |
| Use case | Finding URLs + snippets | Extracting full page content |

## Notes
- `safesearch` is not listed in CLAUDE.md's parameter reference (only query, categories, language, time_range, pageno listed there) — it exists in the implementation but may be undocumented intentionally
- `results_on_new_tab=0` is always forced (prevents SearXNG UI from opening results in new tabs, irrelevant for API but harmless)
- Raw SearXNG response `engine` field is an array; the MCP flattens it to a single string (first element)
- Both MCP servers share identical structure: single file, single tool, stdio transport, no auth
