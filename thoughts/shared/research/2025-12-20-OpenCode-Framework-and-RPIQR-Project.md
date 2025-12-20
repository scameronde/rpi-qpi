---
date: 2025-12-20
researcher: researcher-agent
topic: "OpenCode Framework Architecture and RPIQR Project Structure"
status: complete
coverage:
  - OpenCode official documentation (https://opencode.ai)
  - Project directory structure (/home/eichens/workspaces/experiment-ai/opencode/rpiqr)
  - Existing agent definitions (agent/*.md)
  - Existing tool implementations (tool/*.ts)
  - Existing command definitions (command/*.md)
  - Project configuration (opencode.json)
  - Project documentation (README.md)
---

# Research: OpenCode Framework Architecture and RPIQR Project Structure

## Executive Summary

- OpenCode is an open-source AI coding assistant with a plugin architecture supporting custom agents, tools, commands, and plugins.
- RPIQR (Research-Plan-Implement-QA-Repeat) is an OpenCode project implementing a systematic software development workflow with 10 custom agents.
- Agent definitions use Markdown frontmatter format with YAML configuration for mode, temperature, tools, and system prompts.
- Custom tools are TypeScript files using `@opencode-ai/plugin` with Zod schema validation for parameters.
- Commands are reusable prompts stored as Markdown files with template variable support.
- Configuration is hierarchical with project-level `opencode.json` deep-merging with global config.
- The project uses VIER AI Gateway as a custom provider and integrates Context7 and Sequential Thinking MCP servers.

## Coverage Map

**Inspected Resources:**
- **External Documentation**: OpenCode official docs (7 primary pages: agents, tools, custom-tools, commands, config, plugins, SDK)
- **Project Files**: 
  - `/opencode.json` (lines 1-48)
  - `/README.md` (lines 1-30)
  - `/agent/researcher.md` (lines 1-139)
  - `/agent/planner.md` (lines 1-137)
  - `/agent/implementor.md` (lines 1-185)
  - `/agent/codebase-locator.md` (lines 1-101)
  - `/agent/web-search-researcher.md` (lines 1-131)
  - `/tool/searxng-search.ts` (lines 1-153)
  - `/command/pause-implementation.md` (lines 1-18)
  - `/command/resume-implementation.md` (lines 1-11)

**Scope Limitations:**
- Did not inspect: `codebase-analyzer.md`, `codebase-pattern-finder.md`, `python-qa-auditor.md`, `thoughts-analyzer.md`, `thoughts-locator.md` (existence confirmed in file list but content not read)
- Did not verify: MCP server configurations beyond JSON structure
- Did not test: Actual execution of tools or commands

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: Agent Definition Format

**Observation:** OpenCode agents are defined using Markdown files with YAML frontmatter. The frontmatter contains configuration (mode, temperature, tools) and the body contains the system prompt.

**Direct consequence:** Creating new agents requires a `.md` file in either `agent/` (project-local) or `~/.config/opencode/agent/` (global). The filename becomes the agent identifier.

**Evidence:** `agent/researcher.md:1-20`

**Excerpt:**
```yaml
---
description: "Orchestrates sub-agents to map the codebase. Synthesizes factual documentation to serve as the foundation for the Planner."
mode: primary
temperature: 0.1
tools:
  bash: true
  edit: false # it is not your job to edit files
  read: true
  write: true
```

### Finding 2: Tool Implementation Pattern

**Observation:** Custom tools use the `@opencode-ai/plugin` package with a specific structure: `tool()` function wrapping `description`, `args` (Zod schemas), and `execute()` async function.

**Direct consequence:** New tools must import from `@opencode-ai/plugin`, use `tool.schema` for parameter validation, and return string or JSON-stringified results.

**Evidence:** `tool/searxng-search.ts:1-29`

**Excerpt:**
```typescript
import { tool } from "@opencode-ai/plugin"

interface SearchResult {
  title: string
  url: string
  snippet: string
  engine?: string
}

export default tool({
  description: "Search the internet using SearXNG service. Returns up to 10 web search results with titles, URLs, and snippets.",
  args: {
    query: tool.schema
      .string()
      .describe("The search query (e.g., 'OpenCode documentation', 'SearXNG API')"),
```

### Finding 3: Command Template Variable System

**Observation:** Commands support template variables (`$ARGUMENTS`, `$1`, `$2`), shell output injection (`` !`command` ``), and file references (`@filename`).

**Direct consequence:** Command prompts can dynamically incorporate user input, command output, and file contents at invocation time.

**Evidence:** Web research findings from https://opencode.ai/docs/commands/ (verified via web-search-researcher subagent)

**Excerpt from documentation:**
```markdown
Usage: `/component Button`

**4. Positional Arguments:**
Create a file named $1 in the directory $2
with the following content: $3
```

### Finding 4: RPIQR Workflow Architecture

**Observation:** The project implements a multi-phase development workflow: Research → Plan → Implement → QA → Repeat. Each phase has a dedicated primary agent with strict separation of concerns.

**Direct consequence:** New features or workflows must align with this phase separation. Agents cannot cross boundaries (e.g., Researcher cannot edit code, Implementor cannot deviate from plans).

**Evidence:** `README.md:1-30` and `agent/researcher.md:27-31`, `agent/planner.md:24-31`, `agent/implementor.md:22-34`

**Excerpt from README:**
```markdown
## Overview

### Research Phase

Every larger change starts with a research phase. A specialized agent gathers information about the topic at hand, explores existing solutions and documents its findings in a research report.
```

**Excerpt from researcher.md:**
```markdown
## Prime Directive: The Foundation

1. **Target Audience**: You are writing for the **Planner Agent**, not just a human.
2. **Precision is Power**: "The auth logic is complex" is useless. "The auth logic relies on `middleware.ts:45` and ignores `config.ts`" is useful.
3. **No Opinions**: Do not suggest fixes. Do not plan features. Only report *what exists*.
```

### Finding 5: Configuration Hierarchy and Custom Provider

**Observation:** The project uses a custom AI provider "VIER AI Gateway" configured as an OpenAI-compatible endpoint with two Claude models defined.

**Direct consequence:** Agent configurations default to this custom provider. New agents or tools must be aware they're not using standard Anthropic endpoints.

**Evidence:** `opencode.json:3-26`

**Excerpt:**
```json
"provider": {
  "aigateway": {
    "npm": "@ai-sdk/openai-compatible",
    "name": "VIER AI Gateway",
    "options": {
      "baseURL": "https://aigateway.eu/core/v1"
    },
    "models": {
      "code---anthropic-claude-haiku": {
        "name": "Anthropic Claude Haiku",
        "limit": {
          "context": 200000,
          "output": 64000
        }
      },
```

### Finding 6: MCP Server Integration

**Observation:** Two MCP servers are configured: Context7 (remote, for library documentation) and Sequential Thinking (local, for reasoning chains).

**Direct consequence:** Tools prefixed with `context7_` and `sequential-thinking_` are available to agents. These provide specialized capabilities beyond built-in OpenCode tools.

**Evidence:** `opencode.json:29-45`

**Excerpt:**
```json
"mcp": {
  "context7": {
    "type": "remote",
    "url": "https://mcp.context7.com/mcp",
    "headers": {
      "CONTEXT7_API_KEY": "ctx7sk-7ce97112-60af-43c8-8440-9a9990e08363"
    }
  },
  "sequential-thinking": {
    "type": "local",
    "command": [
      "npx",
      "-y",
      "@modelcontextprotocol/server-sequential-thinking"
    ]
  }
}
```

### Finding 7: Tool Permission Control Pattern

**Observation:** Agents use granular tool permissions in frontmatter, often disabling certain tools with explanatory comments directing to subagent delegation.

**Direct consequence:** The architecture enforces separation of concerns through tool permissions. For example, Researcher disables direct web access and delegates to web-search-researcher subagent.

**Evidence:** `agent/researcher.md:5-20`

**Excerpt:**
```yaml
tools:
  bash: true
  edit: false # it is not your job to edit files
  read: true
  write: true
  glob: false # use Sub-Agent 'codebase-locator' instead
  grep: false # use Sub-Agent 'codebase-pattern-finder' instead
  list: true
  patch: false
  todoread: true
  todowrite: true
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  searxng-search: false # use Sub-Agent 'web-search-researcher' instead
```

## Detailed Technical Analysis (Verified)

### OpenCode Agent System

**Agent Types:**
- **Primary agents** (`mode: primary`): Main assistants for direct user interaction, switchable via Tab key
- **Subagents** (`mode: subagent`): Invoked by primary agents or via `@mention` syntax for specialized tasks
- **All-mode agents** (`mode: all`): Can function as both primary and subagent (default if mode not specified)

**Configuration Options (verified from web documentation):**
- `description`: Brief agent description (required)
- `mode`: Agent type (primary/subagent/all)
- `model`: Override default model
- `temperature`: 0.0-1.0 for response randomness
- `maxSteps`: Limit agentic iterations
- `prompt`: System prompt (inline in markdown body or external file reference)
- `tools`: Enable/disable specific tools (boolean per tool)
- `permissions`: Granular control (ask/allow/deny)
- `disable`: Boolean to disable agent

**Evidence:** Web research from https://opencode.ai/docs/agents/ + local verification in `agent/researcher.md:1-20`

### OpenCode Tool System

**Built-in Tools (verified from documentation):**
- File operations: `read`, `write`, `edit`, `patch`
- Search: `glob` (file patterns), `grep` (content search)
- Shell: `bash` (command execution)
- Directory: `list` (directory contents)
- Task management: `todoread`, `todowrite`
- Web: `webfetch` (HTTP requests)

**Custom Tool Structure:**
1. Import: `import { tool } from "@opencode-ai/plugin"`
2. Schema definition: Use `tool.schema.string()`, `.number()`, `.enum()`, etc.
3. Execute function: Async function receiving `(args, context)` parameters
4. Return: String or JSON-stringified object

**Context Object (verified from documentation):**
- `agent`: Current agent name
- `sessionID`: Current session identifier
- `messageID`: Current message identifier

**Evidence:** `tool/searxng-search.ts:1-60` + web research from https://opencode.ai/docs/custom-tools/

**Tool Execution Pattern from searxng-search.ts:**
```typescript
export default tool({
  description: "Search the internet using SearXNG service. Returns up to 10 web search results with titles, URLs, and snippets.",
  args: {
    query: tool.schema
      .string()
      .describe("The search query (e.g., 'OpenCode documentation', 'SearXNG API')"),
    categories: tool.schema
      .string()
      .optional()
      .describe("Comma-separated list of categories to search (e.g., 'general,social media')"),
    // ... more args
  },
  async execute(args) {
    const { query, categories, language, pageno = 1, time_range, safesearch } = args
    // Implementation
    return JSON.stringify(response_data, null, 2)
  },
})
```

### OpenCode Command System

**Command Definition:**
- Files: `.md` files in `command/` or `~/.config/opencode/command/`
- Frontmatter: YAML with `description`, `agent`, `model`, `subtask` options
- Body: Template text with variable substitution

**Template Variables (verified from documentation):**
- `$ARGUMENTS`: All arguments as single string
- `$1`, `$2`, `$N`: Positional arguments
- `` !`command` ``: Shell command output injection
- `@filename`: File content reference

**Evidence:** Web research from https://opencode.ai/docs/commands/ + local files `command/pause-implementation.md:1-18`, `command/resume-implementation.md:1-11`

**Actual Command Example:**
The pause-implementation command contains structured instructions for creating progress snapshot files. It does not use template variables but provides a reusable workflow prompt.

**Excerpt from pause-implementation.md:**
```markdown
We are pausing the session here. I need you to "save the game" by generating two specific context files. This ensures that when I come back, the next agent can pick up exactly where you left off without reading the entire chat history.

**1. Create file: `[Original-Plan-Name]-PROGRESS.md`**
This acts as the detailed log. It must include:
*   **Plan Reference:** Link to the original plan file.
*   **Current Status:** Explicitly state which PLAN items are `COMPLETE`, `PENDING`, or `IN PROGRESS`.
```

### RPIQR Agent Architecture

**Primary Agents (verified):**
1. **researcher** (Research Architect)
   - Mode: primary, Temperature: 0.1
   - Delegates to: codebase-locator, codebase-analyzer, codebase-pattern-finder, web-search-researcher
   - Output: Research reports in `thoughts/shared/research/YYYY-MM-DD-[Topic].md`
   - Constraints: No opinions, evidence required, verification mandatory

2. **planner** (Implementation Architect)
   - Mode: primary, Temperature: 0.1
   - Reads: Research reports from `thoughts/shared/research/`
   - Output: Implementation plans in `thoughts/shared/plans/YYYY-MM-DD-[Ticket].md`
   - Constraints: No code output, verified planning only, no tooling assumptions

3. **implementor** (Software Engineer)
   - Mode: primary, Temperature: 0.2
   - Reads: Implementation plans from `thoughts/shared/plans/`
   - Constraints: No plan = no code, one phase at a time, change boundaries enforced
   - Verification: Automated tests after each phase, human checkpoints required

**Evidence:** 
- `agent/researcher.md:1-139` (full file)
- `agent/planner.md:1-137` (full file)
- `agent/implementor.md:1-185` (full file)

**Subagents (verified existence, content not fully inspected):**
- codebase-locator: File system topology specialist
- codebase-analyzer: Code logic analysis specialist
- codebase-pattern-finder: Pattern identification specialist
- web-search-researcher: External knowledge research specialist
- python-qa-auditor: Python code quality auditor
- thoughts-analyzer: Historical document analyzer
- thoughts-locator: Documentation locator

**Evidence:** File list from project root + `agent/codebase-locator.md:1-101`, `agent/web-search-researcher.md:1-131`

### Configuration Deep Dive

**Project Configuration Structure:**

**Observation:** The `opencode.json` uses the official schema and configures three main areas: provider, model, and MCP servers.

**Evidence:** `opencode.json:1-48` (full file)

**Provider Configuration Pattern:**
```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "aigateway": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "VIER AI Gateway",
      "options": {
        "baseURL": "https://aigateway.eu/core/v1"
      },
      "models": {
        "code---anthropic-claude-haiku": { /* limits */ },
        "code---anthropic-claude-sonnet": { /* limits */ }
      }
    }
  },
  "model": "aigateway/code---anthropic-claude-sonnet"
}
```

**Direct consequence:** The model identifier follows the pattern `{providerID}/{modelID}`. Custom providers can use the OpenAI-compatible adapter via `@ai-sdk/openai-compatible` npm package.

## Verification Log

**Verified Files (read with `read` tool):**
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/README.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/opencode.json`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/agent/researcher.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/agent/planner.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/agent/implementor.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/agent/codebase-locator.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/agent/web-search-researcher.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/tool/searxng-search.ts`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/command/pause-implementation.md`
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/command/resume-implementation.md`

**External Documentation Verified:**
- Via web-search-researcher subagent: 7 pages from https://opencode.ai/docs/
  - /docs/agents/
  - /docs/tools/
  - /docs/custom-tools/
  - /docs/commands/
  - /docs/config/
  - /docs/plugins/
  - /docs/sdk/

**Spot-checked excerpts captured:** Yes (10+ excerpts included in this report)

## Open Questions / Unverified Claims

### Directory Structure for thoughts/

**Unverified:** The exact directory structure for `thoughts/shared/research/` and `thoughts/shared/plans/` is referenced in agent prompts but not verified to exist.

**What was tried:** Referenced in `agent/researcher.md:84` and `agent/planner.md:79` but directory not inspected with `list`.

**Missing evidence:** Need to verify if `thoughts/` directory exists and what its current structure is.

### Remaining Agent Implementations

**Unverified:** Five agent files exist but were not read:
- `agent/codebase-analyzer.md`
- `agent/codebase-pattern-finder.md`
- `agent/python-qa-auditor.md`
- `agent/thoughts-analyzer.md`
- `agent/thoughts-locator.md`

**What was tried:** Confirmed existence via file list, but content not inspected.

**Missing evidence:** Specific tool configurations, temperature settings, and system prompts for these agents.

### MCP Server Tool Availability

**Unverified:** The exact tools provided by Context7 and Sequential Thinking MCP servers.

**What was tried:** Configuration shows they are enabled, and agent frontmatter references tools like `context7` and `sequential-thinking`, but actual tool schemas not inspected.

**Missing evidence:** Need to query available tools via OpenCode CLI or inspect MCP server documentation.

### Plugin System Usage

**Unverified:** Whether this project uses any OpenCode plugins (event-driven hooks).

**What was tried:** No `plugin/` directory found in file list.

**Missing evidence:** No evidence of plugin usage in current project structure.

## References

**Project Files:**
- `opencode.json:1-48` (configuration)
- `README.md:1-30` (project overview)
- `agent/researcher.md:1-139` (research agent definition)
- `agent/planner.md:1-137` (planning agent definition)
- `agent/implementor.md:1-185` (implementation agent definition)
- `agent/codebase-locator.md:1-101` (locator subagent)
- `agent/web-search-researcher.md:1-131` (web research subagent)
- `tool/searxng-search.ts:1-153` (custom search tool)
- `command/pause-implementation.md:1-18` (pause command)
- `command/resume-implementation.md:1-11` (resume command)

**External Documentation:**
- https://opencode.ai/docs/agents/ (agent architecture)
- https://opencode.ai/docs/tools/ (built-in tools)
- https://opencode.ai/docs/custom-tools/ (custom tool development)
- https://opencode.ai/docs/commands/ (command system)
- https://opencode.ai/docs/config/ (configuration hierarchy)
- https://opencode.ai/docs/plugins/ (plugin system)
- https://opencode.ai/docs/sdk/ (programmatic API)
