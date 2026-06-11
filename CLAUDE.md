# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Claude Code Workflow

This project uses a structured agentic workflow for software development. Workflow orchestrators are Skills in `.claude/skills/` and invoked via `/skill-name`. Worker agents are in `.claude/agents/` and spawned by Skills via the Agent tool.

## Workflow Pipeline

**Greenfield (new project):**
```
/mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement
```

**Brownfield (new feature in existing system):**
```
/feature-architect → /epic-planner → /researcher → /planner → /implement
```

**Small change or bug fix:**
```
/researcher → /planner → /implement
```

Each stage produces artifacts written to `thoughts/shared/`:

| Stage | Skill | Output directory |
|---|---|---|
| Vision (greenfield) | `/mission-architect` | `thoughts/shared/missions/` |
| Feature brief (brownfield) | `/feature-architect` | `thoughts/shared/features/` |
| Spec | `/specifier` | `thoughts/shared/specs/` |
| Epics | `/epic-planner` | `thoughts/shared/epics/` |
| Research | `/researcher` | `thoughts/shared/research/` or `thoughts/shared/qa/` |
| Plan | `/planner` | `thoughts/shared/plans/` |
| Execution | `/implement` | Git commits per task |

## Workflow Skills

All workflow orchestration is done via Skills (invoked with `/skill-name` or proactively by Claude):

| Skill | Purpose |
|---|---|
| `/mission-architect` | Discover project vision and goals via conversation (greenfield) |
| `/feature-architect` | Define a new feature within an existing system (brownfield) |
| `/specifier` | Translate a mission into a technical specification |
| `/epic-planner` | Decompose a spec into epics and user stories |
| `/researcher` | Map the codebase relevant to a spec or question |
| `/planner` | Produce a sequenced, evidence-based implementation plan |
| `/implement` | Execute a plan task-by-task via subagents, with spec + quality review per task |

## Quality Skills

| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic code quality review (Clean Code, Pragmatic Programmer, etc.) |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |

## Worker Agents (used internally by Skills)

These live in `.claude/agents/` and are spawned by Skills via the `Agent` tool — never invoked directly.

| File | Role | Agent type |
|---|---|---|
| `codebase-locator.md` | Find files by purpose/pattern | Explore |
| `codebase-analyzer.md` | Trace logic and data flow | Explore |
| `codebase-pattern-finder.md` | Find recurring patterns | Explore |
| `thoughts-locator.md` | Find docs in `thoughts/` directory | Explore |
| `thoughts-analyzer.md` | Extract signal from docs | Explore |
| `web-search-researcher.md` | External knowledge and docs | general-purpose |

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
  agents/         # Worker agents (spawned by Skills via Agent tool)
  skills/         # All skills — workflow orchestrators + quality reviewers
  hooks/          # SessionStart hook for skill bootstrap
  mcp/
    crawl4ai/     # MCP server wrapping Crawl4AI
    searxng/      # MCP server wrapping SearXNG
  settings.json          # enableAllProjectMcpServers: true
  settings.local.json    # permissions (WebSearch, WebFetch, Bash allowlist)

thoughts/
  shared/
    missions/     # Vision artifacts from /mission-architect
    features/     # Feature briefs from /feature-architect
    specs/        # Technical specs from /specifier
    epics/        # Epics from /epic-planner
    research/     # Codebase research from /researcher
    qa/           # QA research from /researcher
    plans/        # Plans + STATE files from /planner

agent/            # Original opencode agent definitions (reference only)
skills/           # Original opencode skill definitions (reference only)
tool/             # Original opencode tool source files (crawl4ai.ts, searxng-search.ts)
```

### agents/ vs skills/

- **`agents/`** — Worker agents, never invoked directly. Skills embed their path in `Agent` tool `subagent_type` parameters. Each file defines a specialized read-only or search role (Explore type) or a web researcher (general-purpose type). Context isolation comes from the Agent tool call, not from file type.
- **`skills/`** — Skills loaded via the `Skill` tool. Workflow orchestrators (`/mission-architect` through `/implement`) plus quality tools. The `/implement` skill directory also contains three prompt template files used to build implementer and reviewer prompts.

## Plan File Format

Plans produced by `/planner` follow this structure:

```markdown
# Plan: <title>

## Inputs
- Research report(s) used: thoughts/shared/research/...

## Verified Current State
- **Fact:** ...
- **Evidence:** file:line-line

## Goals / Non-Goals

## Design Overview

## Implementation Instructions

### PLAN-001: <task name>
- changeType: modify|create|remove
- files: [path/to/file]
- instruction: What to do
- evidence: file:line-line
- doneWhen: Verifiable completion criterion
- allowedAdjacentEdits: [optional]
- context: Why this change is needed
```

`/implement` reads the plan and dispatches one implementer subagent per PLAN-XXX task.

## DOX Protocol

`AGENTS.md` files are local governance contracts for directory subtrees. Claude Code does not read them automatically — this section activates the protocol.

**Before editing any file:** Walk from the repository root to each target file's directory. At each level, check for an `AGENTS.md` and read it. The nearest `AGENTS.md` to the file being edited is the local contract; parent `AGENTS.md` files supply broader rules. This `CLAUDE.md` is always the top-level contract.

**After a meaningful change:** If the change affects a directory's purpose, scope, ownership, structure, file format contracts, or naming conventions — update the nearest owning `AGENTS.md`. If a directory is created or repurposed, also update the parent `AGENTS.md`'s Child DOX Index.

**Conflict rule:** When `AGENTS.md` files conflict, the closer file governs local details. No `AGENTS.md` may override this `CLAUDE.md`.
