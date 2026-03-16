# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Code Workflow

This project uses a structured agentic workflow for software development. User-facing commands are in `.claude/commands/` and invoked via `/command-name`. Subagents are in `.claude/agents/` and invoked programmatically via the Agent tool.

## Workflow Pipeline

```
/mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement
```

Each stage produces artifacts written to `thoughts/shared/`:

| Stage | Command | Output directory |
|---|---|---|
| Vision | `/mission-architect` | `thoughts/shared/missions/` |
| Spec | `/specifier` | `thoughts/shared/specs/` |
| Epics | `/epic-planner` | `thoughts/shared/epics/` |
| Research | `/researcher` | `thoughts/shared/research/` or `thoughts/shared/qa/` |
| Plan | `/planner` | `thoughts/shared/plans/` |
| Execution | `/implement` | Updates STATE file, commits each task |

## Development Commands

### Workflow Orchestration
| Command | Purpose |
|---|---|
| `/mission-architect` | Discover project vision and goals via conversation |
| `/specifier` | Translate a mission into a technical specification |
| `/epic-planner` | Decompose a spec into epics and user stories |
| `/researcher` | Map the codebase relevant to a spec or question |
| `/planner` | Produce a sequenced, evidence-based implementation plan |
| `/implement` | Execute a plan task-by-task via subagents, committing after each |

### Skills (invoked via the `Skill` tool, not slash commands)
| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic code quality review (Clean Code, Pragmatic Programmer, etc.) |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |

## Subagents (used internally by orchestration commands)

These live in `.claude/agents/` and are invoked by orchestration commands via the `Agent` tool — not user-facing slash commands. Orchestrators embed the full agent file content in the Agent tool `prompt` parameter.

| File | Role | Agent type |
|---|---|---|
| `codebase-locator.md` | Find files by purpose/pattern | Explore |
| `codebase-analyzer.md` | Trace logic and data flow | Explore |
| `codebase-pattern-finder.md` | Find recurring patterns | Explore |
| `thoughts-locator.md` | Find docs in `thoughts/` directory | Explore |
| `thoughts-analyzer.md` | Extract signal from docs | Explore |
| `web-researcher.md` | External knowledge and docs | general-purpose |
| `task-executor.md` | Implement a single PLAN-XXX task | general-purpose |

## MCP Servers

Servers live in `.claude/mcp/` and are auto-enabled via `"enableAllProjectMcpServers": true` in `.claude/settings.json`. Build before first use:

```bash
cd .claude/mcp/crawl4ai && npm install && npm run build
cd .claude/mcp/searxng  && npm install && npm run build
```

| Server | Tool | Description |
|---|---|---|
| `crawl4ai` | `crawl4ai` | Web crawling with 3 modes: crawl, markdown, screenshot |
| `searxng` | `searxng_search` | Web search via self-hosted SearXNG |

### crawl4ai tool parameters
- `url` (required): URL to crawl
- `mode`: `crawl` | `markdown` | `screenshot` (default: `crawl`)
- `cache_mode`: `enabled` | `disabled` | `bypass` | `read_only` | `write_only`
- `css_selector`: Extract specific content (crawl mode)
- `markdown_filter`: `raw` | `fit` | `bm25` | `llm` (default: `fit`)
- `filter_query`: Query for bm25/llm filters

### searxng_search tool parameters
- `query` (required): Search query
- `categories`: Comma-separated categories (e.g., `general,social media`)
- `language`: Language code (e.g., `en`, `de`)
- `time_range`: `day` | `month` | `year`
- `pageno`: Page number (default: 1)

## Directory Structure

```
.claude/
  commands/       # User-facing slash commands (workflow orchestration)
  agents/         # Subagent prompt files (embedded by orchestrators via Agent tool)
  skills/         # User-invocable skills (clean-code, python-qa, typescript-qa, logic-bugs-qa, claude-code-extensions)
  mcp/
    crawl4ai/     # MCP server wrapping Crawl4AI
    searxng/      # MCP server wrapping SearXNG
  settings.json          # enableAllProjectMcpServers: true
  settings.local.json    # permissions (WebSearch, WebFetch, Bash allowlist)

thoughts/
  shared/
    missions/     # Vision artifacts from /mission-architect
    specs/        # Technical specs from /specifier
    epics/        # Epics from /epic-planner
    research/     # Codebase research from /researcher
    qa/           # QA research from /researcher
    plans/        # Plans + STATE files from /planner

agent/            # Original opencode agent definitions (reference only)
skills/           # Original opencode skill definitions (reference only)
tool/             # Original opencode tool source files (crawl4ai.ts, searxng-search.ts)
```

### commands/ vs agents/ vs skills/

- **`commands/`** — Invoked directly by the user via `/command-name`. These are the primary workflow orchestrators (`/mission-architect`, `/specifier`, `/epic-planner`, `/researcher`, `/planner`, `/implementation-controller`).
- **`agents/`** — Never invoked directly. Orchestrators embed their content in `Agent` tool `prompt` parameters. Each file corresponds to a specialized subagent role.
- **`skills/`** — User-invocable skills loaded via the `Skill` tool. Each subdirectory contains a `SKILL.md` and optional `references/`.

## Plan File Format

Plans produced by `/planner` follow this structure:

```markdown
# Plan: <title>

## STATE
Current: PLAN-001
Status: pending|in_progress|completed|blocked

## Tasks

### PLAN-001: <task name>
- changeType: modify|create|remove
- files: [path/to/file]
- instruction: What to do
- evidence: file:line-line
- doneWhen: Verifiable completion criterion
- allowedAdjacentEdits: [optional related files]
- context: Why this change is needed
```

`/implement` reads the STATE to resume interrupted plans.
