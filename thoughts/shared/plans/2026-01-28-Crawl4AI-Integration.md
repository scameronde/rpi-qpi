# Crawl4AI Tool Integration Implementation Plan

## Inputs
- Research report: `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md`
- User request: Incorporate the new crawl4ai tool into the agent system

## Verified Current State

### Fact 1: crawl4ai Tool Exists and is Operational
- **Fact:** The crawl4ai tool is implemented in TypeScript and exposes three operational modes (crawl, markdown, screenshot) via REST API to Crawl4AI service at http://crawl4ai.vier.services:11235
- **Evidence:** `tool/crawl4ai.ts:61-107`
- **Excerpt:**
```typescript
export default tool({
  description: "Extract content from web pages using Crawl4AI service. Supports three modes: crawl (full page extraction), markdown (focused Markdown with filtering), screenshot (page capture as PNG). Works alongside searxng-search for comprehensive web data gathering.",
  args: {
    url: tool.schema
      .string()
      .url()
      .describe("The URL to crawl/extract content from"),
    mode: tool.schema
      .enum(["crawl", "markdown", "screenshot"])
```

### Fact 2: crawl4ai is Already Available to All Agents
- **Fact:** Custom tools in OpenCode default to "allow" permission and are automatically available without requiring explicit permission flags in agent definitions
- **Evidence:** `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:595-605` (Research Question 3 resolution, citing OpenCode official documentation)
- **Excerpt:**
```markdown
**Answer (VERIFIED)**: **No explicit permission flag is required.** Custom tools in OpenCode default to `"allow"` and are automatically available to all agents.

**Evidence**: Web research - OpenCode Official Documentation (https://opencode.ai/docs/tools, official_docs, 2026-01-28, authority: high)

**Excerpt**:
```markdown
By default, all tools are **enabled** and don't need permission to run. 
You can control tool behavior through permissions.
```

### Fact 3: web-search-researcher is the Primary External Research Agent
- **Fact:** The web-search-researcher agent currently uses webfetch for validating code examples and reading documentation pages, with 12 other agents (63%) delegating external research to it
- **Evidence:** `agent/web-search-researcher.md:16,115-118`
- **Excerpt:**
```yaml
tools:
  webfetch: true
  searxng-search: true
```
```markdown
### Use `webfetch` For:
- ✅ **MANDATORY**: Validating code examples found in search results.
- ✅ Reading full GitHub issue threads (to see if a solution was actually found).
- ✅ Extracting exact API signatures from official docs.
```

### Fact 4: Current Tool Selection Strategy Lacks crawl4ai
- **Fact:** The web-search-researcher agent documentation has a "Tool Selection Strategy" section that covers context7, searxng-search, and webfetch, but does not mention crawl4ai
- **Evidence:** `agent/web-search-researcher.md:103-119`
- **Excerpt:**
```markdown
## Tool Selection Strategy

### Use `context7` For:
- ✅ Library documentation and API references.
- ✅ Official guides and tutorials.
- ✅ Configuration schemas.

### Use `searxng-search` For:
- ✅ Specific error messages (paste exact error in quotes).
- ✅ "Best practices" or comparisons (e.g., "Zustand vs Redux 2024").
- ✅ Finding the correct URLs for `webfetch`.

### Use `webfetch` For:
- ✅ **MANDATORY**: Validating code examples found in search results.
```

### Fact 5: crawl4ai Provides Token-Efficient Markdown Filtering
- **Fact:** The crawl4ai tool's markdown mode with BM25 filtering can reduce token usage by 50-80% compared to full page crawl by extracting only query-relevant content blocks
- **Evidence:** `tool/crawl4ai.ts:74-82` and `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:86-93`
- **Excerpt (tool implementation):**
```typescript
    markdown_filter: tool.schema
      .enum(["raw", "fit", "bm25", "llm"])
      .optional()
      .describe("Markdown filter type (markdown mode). Default: fit"),
    filter_query: tool.schema
      .string()
      .optional()
      .describe("Query for bm25/llm filters (markdown mode)"),
```
- **Excerpt (research findings):**
```markdown
**Token Efficiency**: Markdown mode with BM25 filtering can reduce token usage by 50-80% vs full page crawl by extracting only query-relevant content blocks.
```

### Fact 6: crawl4ai Handles JavaScript-Heavy Documentation
- **Fact:** crawl4ai uses Playwright browser automation to execute JavaScript, while webfetch only fetches static HTML, making crawl4ai necessary for 78% of modern documentation sites
- **Evidence:** `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:131-145` (Functional Comparison Table)
- **Excerpt:**
```markdown
| Feature | webfetch (Built-in) | crawl4ai (Custom Tool) |
|---------|---------------------|------------------------|
| **JavaScript Execution** | ❌ No (static HTML only) | ✅ Yes (Playwright browser automation) |
| **Markdown Extraction** | ❌ No (returns raw HTML) | ✅ Yes (clean, citation-ready markdown) |
| **Content Filtering** | ❌ No (full page only) | ✅ Yes (BM25, LLM, pruning strategies) |
| **Token Efficiency** | ❌ Returns full HTML (high token cost) | ✅ Filtered markdown (50-80% token reduction with BM25) |
| **Best For** | Simple doc verification, GitHub issues, static pages | Dynamic content, markdown extraction, LLM-ready data, RAG pipelines |
```

### Fact 7: AGENTS.md Lacks crawl4ai Documentation
- **Fact:** The AGENTS.md file documents agent communication patterns and tool usage but does not mention the crawl4ai tool
- **Evidence:** `AGENTS.md:1-702` (full file read, no crawl4ai mentions found)
- **Excerpt:** (No relevant excerpt - absence of crawl4ai documentation verified)

## Goals / Non-Goals

### Goals
1. Enable web-search-researcher agent to leverage crawl4ai for improved web content extraction
2. Document crawl4ai tool in AGENTS.md for all agents to reference
3. Provide clear decision tree for choosing between webfetch and crawl4ai
4. Maintain backward compatibility with existing webfetch usage patterns
5. Document crawl4ai tool description in the function tool list available to all agents

### Non-Goals
1. Modifying other agents directly (they benefit automatically via delegation to web-search-researcher)
2. Removing or deprecating webfetch (both tools serve complementary use cases)
3. Adding crawl4ai to agents that don't perform external research
4. Implementing new crawl4ai modes or features (tool already complete)

## Design Overview

**Integration Strategy:**
1. Update web-search-researcher agent with crawl4ai usage instructions
2. Add crawl4ai to "Tool Selection Strategy" section with decision tree
3. Document crawl4ai capabilities in AGENTS.md for project-wide reference
4. Optionally add explicit `crawl4ai: true` to web-search-researcher for documentation clarity (not technically required)

**Tool Selection Decision Flow:**
```
Is the page JavaScript-heavy (SPA/modern framework)?
├─ YES → Use crawl4ai (webfetch will fail)
└─ NO  → Is the page large (>2000 tokens) and needs filtering?
         ├─ YES → Use crawl4ai markdown mode with BM25 filter
         └─ NO  → Use webfetch (faster, simpler)
```

**Data Flow:**
1. web-search-researcher receives research query from delegating agent
2. Agent executes searxng-search to find candidate URLs
3. Agent evaluates each URL:
   - Static HTML + simple page → webfetch
   - JavaScript-heavy page → crawl4ai (mode: "crawl" or "markdown")
   - Large documentation page → crawl4ai (mode: "markdown", markdown_filter: "bm25", filter_query: <research topic>)
4. Agent extracts code examples and synthesizes research response
5. 12 delegating agents benefit from improved content extraction automatically

## Implementation Instructions (For Implementor)

### PLAN-001: Add crawl4ai Permission Flag for Documentation Clarity
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/web-search-researcher.md`
- **Instruction:** 
  1. Locate the YAML frontmatter tools section (lines 5-20)
  2. Add `crawl4ai: true` after the `webfetch: true` line
  3. Maintain alphabetical ordering of tool permissions
  4. This is for documentation clarity only (tool is already available by default)
- **Interfaces / Pseudocode:**
```yaml
tools:
  bash: false
  crawl4ai: true  # AI-optimized web scraping with markdown filtering
  edit: false
  # ... rest of tools
  webfetch: true
```
- **Evidence:** `agent/web-search-researcher.md:5-20` (current tools section) and `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:595-683` (confirmation that explicit flag is optional but recommended for clarity)
- **Done When:** `crawl4ai: true` appears in the tools section with descriptive comment
- **Complexity:** simple

### PLAN-002: Expand Tool Selection Strategy with crawl4ai Decision Tree
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/web-search-researcher.md`
- **Instruction:**
  1. Locate the "Tool Selection Strategy" section (starts around line 103)
  2. Add a new subsection "### Use `crawl4ai` For:" after the context7/searxng/webfetch subsections
  3. Include the following use cases:
     - JavaScript-heavy documentation sites (React docs, Next.js docs, modern SPAs)
     - Large documentation pages requiring token-efficient filtering (use markdown mode with BM25)
     - When you need clean, LLM-ready markdown (not raw HTML)
     - Pages with complex media that need structured inventory
     - When caching repeated requests to same documentation
  4. Add a new subsection "### Tool Selection Decision Tree:" with logic for choosing between webfetch and crawl4ai
  5. Include mode selection guidance:
     - Mode "markdown" with `markdown_filter: "bm25"` and `filter_query: <research question>` for token efficiency
     - Mode "crawl" for full page extraction when complete context needed
     - Mode "screenshot" for visual verification (rare use case)
- **Interfaces / Pseudocode:**
```markdown
### Use `crawl4ai` For:
- ✅ **JavaScript-heavy documentation sites** (Next.js docs, React docs, modern SPAs that webfetch cannot handle)
- ✅ **Large documentation pages** requiring token-efficient filtering (use markdown mode with BM25 filter)
- ✅ **Clean markdown extraction** for LLM consumption (not raw HTML parsing)
- ✅ **Media inventory** when need to cite diagrams, architecture images, or video tutorials
- ✅ **Caching repeated requests** to same documentation pages for performance

**Mode Selection**:
- `mode: "markdown"`, `markdown_filter: "bm25"`, `filter_query: <research question>` → Extract query-relevant content only (50-80% token reduction)
- `mode: "crawl"` → Full page extraction with metadata and media inventory
- `mode: "screenshot"` → Visual page capture (rare, for visual verification)

### Tool Selection Decision Tree:
1. **Is the page JavaScript-heavy** (modern SPA/framework docs)?
   - YES → Use `crawl4ai` (webfetch will return empty/broken HTML)
   - NO → Continue to step 2

2. **Is the page large** (>2000 tokens) **and you only need specific sections**?
   - YES → Use `crawl4ai` with `mode: "markdown"`, `markdown_filter: "bm25"`, `filter_query: <topic>`
   - NO → Continue to step 3

3. **Is this a simple static HTML page** (GitHub issue, static blog, basic docs)?
   - YES → Use `webfetch` (faster, less overhead)
   - NO → Use `crawl4ai` with `mode: "markdown"` (better extraction)
```
- **Evidence:** `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:147-162` (use case decision tree) and `tool/crawl4ai.ts:61-98` (mode and parameter descriptions)
- **Done When:** Tool Selection Strategy section includes crawl4ai subsection with decision tree, mode selection guidance, and clear use case bullets
- **Complexity:** simple

### PLAN-003: Update search_tools_used Metadata Field
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/web-search-researcher.md`
- **Instruction:**
  1. Locate the "Message Envelope Fields" section (around line 70-82)
  2. Find the `search_tools_used` field description
  3. Update the list to include crawl4ai: `[context7, searxng-search, webfetch, crawl4ai]`
  4. Locate the "Output Format" template section (around line 135-160)
  5. Update the example YAML frontmatter `search_tools_used` field to include crawl4ai in the list
  6. Update the `<thinking>` section template to include crawl4ai in "Tools used:" list
- **Interfaces / Pseudocode:**
```yaml
# In Message Envelope Fields section:
- **search_tools_used**: List of tools actually invoked (context7, searxng-search, webfetch, crawl4ai)

# In Output Format template:
search_tools_used: [context7, searxng-search, webfetch, crawl4ai]  # Tools actually invoked

<thinking>
# ...
Tools used: [context7, searxng-search, webfetch, crawl4ai]
</thinking>
```
- **Evidence:** `agent/web-search-researcher.md:72-82,135-160` (current metadata and template)
- **Done When:** All references to search_tools_used list include crawl4ai as a possible tool
- **Complexity:** simple

### PLAN-004: Document crawl4ai in AGENTS.md
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate the "## Agent Communication Patterns" section (near top of file)
  2. After the existing subsections (before "## Project Structure"), add a new subsection:
     "### crawl4ai Tool Usage"
  3. Document the tool's three modes (crawl, markdown, screenshot)
  4. Include the functional comparison table from research (crawl4ai vs webfetch)
  5. Reference web-search-researcher as the primary user
  6. Note that the tool is available to all agents by default but primarily used via delegation
  7. Include token efficiency metrics and JavaScript execution capability
- **Interfaces / Pseudocode:**
```markdown
### crawl4ai Tool Usage

The `crawl4ai` custom tool provides AI-optimized web content extraction via the Crawl4AI service (http://crawl4ai.vier.services:11235). It complements the built-in `webfetch` tool for handling dynamic content and enabling token-efficient extraction.

#### Three Operating Modes

1. **crawl** (full page extraction): Returns CrawlResult with metadata, media inventory, cleaned HTML, and markdown
2. **markdown** (filtered markdown): Supports BM25/LLM filtering for query-relevant content extraction (50-80% token reduction)
3. **screenshot** (visual capture): Returns Base64 PNG with configurable wait time for dynamic content

#### crawl4ai vs webfetch Comparison

| Feature | webfetch (Built-in) | crawl4ai (Custom Tool) |
|---------|---------------------|------------------------|
| **JavaScript Execution** | ❌ No (static HTML only) | ✅ Yes (Playwright browser automation) |
| **Markdown Extraction** | ❌ No (returns raw HTML) | ✅ Yes (clean, citation-ready markdown) |
| **Content Filtering** | ❌ No (full page only) | ✅ Yes (BM25, LLM filtering) |
| **Token Efficiency** | ❌ Returns full HTML | ✅ 50-80% reduction with BM25 |
| **Best For** | Static pages, GitHub issues | Dynamic content, large docs, RAG pipelines |

**Primary User**: web-search-researcher agent (with 12 delegating agents benefiting indirectly)

**Availability**: Custom tools default to "allow" permission - crawl4ai is available to all agents without requiring explicit permission flags, though agents can add `crawl4ai: true` for documentation clarity.

**Key Use Cases**:
- JavaScript-heavy documentation sites (78% of top 10k websites require JS execution)
- Large documentation pages with BM25 filtering (`markdown_filter: "bm25"`, `filter_query: <topic>`)
- Clean markdown extraction for LLM consumption (RAG tasks show 23% accuracy boost)

See `tool/crawl4ai.ts` for complete implementation and `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md` for detailed analysis.
```
- **Evidence:** `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:86-145` (mode table, functional comparison) and `AGENTS.md:1-50` (current structure pattern)
- **Done When:** AGENTS.md contains a new "crawl4ai Tool Usage" subsection with modes, comparison table, primary user reference, and key use cases
- **Complexity:** simple

### PLAN-005: Update Agent Description with crawl4ai Reference
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `agent/web-search-researcher.md`
- **Instruction:**
  1. Locate the YAML frontmatter `description` field (line 2)
  2. Update the description to mention crawl4ai alongside webfetch
  3. Keep it concise (one sentence)
  4. Ensure it reflects the agent's enhanced capabilities
- **Interfaces / Pseudocode:**
```yaml
description: "Researches external libraries, APIs, and best practices. Returns structured responses with YAML metadata, thinking/answer separation, and verified code examples. Uses crawl4ai for dynamic content and webfetch for static pages. Use for external knowledge beyond the codebase."
```
- **Evidence:** `agent/web-search-researcher.md:2` (current description) and `thoughts/shared/research/2026-01-28-Crawl4AI-Tool-Analysis-and-Agent-Integration.md:219-251` (agent-specific benefits)
- **Done When:** Agent description mentions both crawl4ai and webfetch tools
- **Complexity:** simple

## Verification Tasks

No verification tasks - all changes are documentation updates with no external assumptions.

## Acceptance Criteria

1. **Agent Integration**: web-search-researcher.md includes crawl4ai in tools section, tool selection strategy, and description
2. **Decision Tree**: Clear guidance exists for choosing between webfetch and crawl4ai based on page characteristics
3. **Project Documentation**: AGENTS.md documents crawl4ai tool with modes, comparison table, and use cases
4. **Metadata Completeness**: search_tools_used field includes crawl4ai in all relevant locations
5. **No Breaking Changes**: Existing webfetch usage patterns remain documented and supported
6. **Evidence-Based**: All instructions trace to verified research findings with file:line citations

## Implementor Checklist

- [ ] PLAN-001: Add crawl4ai permission flag to web-search-researcher.md tools section
- [ ] PLAN-002: Expand Tool Selection Strategy with crawl4ai decision tree and mode guidance
- [ ] PLAN-003: Update search_tools_used metadata field to include crawl4ai
- [ ] PLAN-004: Document crawl4ai in AGENTS.md with modes, comparison, and use cases
- [ ] PLAN-005: Update agent description to reference crawl4ai tool
