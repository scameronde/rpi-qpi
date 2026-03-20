# crawl4ai MCP Server — Raw Notes

## Role
- Type: MCP server (Model Context Protocol)
- Location: `.claude/mcp/crawl4ai/`
- Auto-enabled via `"enableAllProjectMcpServers": true` in `.claude/settings.json`
- Language: TypeScript, compiled to `dist/index.js`
- Transport: stdio (StdioServerTransport — runs as subprocess, communicates via stdin/stdout)
- Purpose: Expose Crawl4AI web content extraction as a single MCP tool (`crawl4ai`) with 3 operation modes

## Backend Service
- Calls a remote Crawl4AI service at `http://crawl4ai.vier.services:11235`
- Hardcoded base URL — not configurable at runtime
- 30-second timeout on all requests (AbortController)
- User-Agent header: `Claude-Crawl4AI-MCP/1.0`
- All requests use HTTP POST with JSON body

## Single Tool: `crawl4ai`

### Required parameter
- `url` — URL to crawl/extract content from

### Mode parameter (default: `crawl`)
- `crawl` — Full page extraction → hits `/crawl` endpoint
- `markdown` — Focused Markdown with optional filtering → hits `/md` endpoint
- `screenshot` — Page capture as PNG → hits `/screenshot` endpoint

### Mode: `crawl`
Endpoint: `POST /crawl`

Request body structure:
```json
{
  "urls": ["<url>"],
  "crawler_config": { ... },  // optional
  "browser_config": { ... }   // optional
}
```

Parameters:
- `cache_mode`: `"enabled" | "disabled" | "bypass" | "read_only" | "write_only"`
- `css_selector`: CSS selector to extract specific content
- `word_count_threshold`: minimum word count for content blocks
- `headless`: boolean (default: true)
- `user_agent`: custom user agent string

Response: `{ results: [CrawlResult] }` or `{ ...CrawlResult }` (fallback)

CrawlResult fields used:
- `success`: boolean
- `markdown`: extracted markdown content
- `media.images[]`: image URLs
- `media.videos[]`: video URLs
- `metadata.title`, `metadata.description`
- `error_message`: on failure

Output format: JSON with `{ mode, url, success, result, formattedOutput }` — formattedOutput is a human-readable summary with title, description, markdown preview (first 500 chars), and media counts

### Mode: `markdown`
Endpoint: `POST /md`

Request body structure:
```json
{
  "url": "<url>",
  "f": "raw|fit|bm25|llm",
  "q": "<filter_query>"  // only for bm25 or llm
}
```

Parameters:
- `markdown_filter`: `"raw" | "fit" | "bm25" | "llm"` (default: `"fit"`)
  - `raw` — no filtering
  - `fit` — trimmed to relevant content
  - `bm25` — BM25 relevance ranking against `filter_query`
  - `llm` — LLM-based extraction against `filter_query`
- `filter_query`: query string — only sent to API when mode is `bm25` or `llm`

Output: JSON with `{ mode, url, success: true, result: { markdown }, formattedOutput }` — preview is first 1000 chars

### Mode: `screenshot`
Endpoint: `POST /screenshot`

Request body:
```json
{
  "url": "<url>",
  "screenshot_wait_for": <seconds>
}
```

Parameters:
- `screenshot_wait`: wait time in seconds before capture (default: 2)

Output: JSON with `{ mode, url, success: true, result: { screenshot }, formattedOutput }` — screenshot is base64 PNG string; formattedOutput notes size in characters

## Error Handling
- All errors caught in try/catch
- Returns `{ success: false, error: true, errorMessage: "...", formattedOutput: "Error: ..." }` — never throws to MCP caller
- HTTP non-2xx: throws `Crawl4AI API error: <status> <statusText>`
- Timeout (30s): AbortController abort triggers catch

## Output Shape (all modes)
Always returns:
```json
{
  "content": [{ "type": "text", "text": "<JSON string>" }]
}
```
The `text` value is a JSON string (not raw text) containing `mode`, `url`, `success`, `result`, and `formattedOutput`.

## Build & Registration
- Build: `cd .claude/mcp/crawl4ai && npm install && npm run build` (runs `tsc`)
- Output: `dist/index.js`
- Registered automatically by Claude Code via `enableAllProjectMcpServers: true` — no manual server registration needed
- Dependencies: `@modelcontextprotocol/sdk ^1.0.0` only

## Notes
- Single-URL only — `urls` array in crawl mode always contains exactly one URL
- `headless` and `user_agent` only apply to `crawl` mode (browser_config)
- `css_selector`, `cache_mode`, `word_count_threshold` only apply to `crawl` mode (crawler_config)
- `filter_query` is silently ignored in `markdown` mode when `markdown_filter` is `raw` or `fit`
- No authentication on the backend service call
