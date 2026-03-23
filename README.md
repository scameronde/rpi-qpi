# Claude Code Workflow Toolkit

A structured agentic development workflow for [Claude Code](https://claude.ai/code), ported from an [OpenCode](https://opencode.ai) agent system. Provides a full pipeline from project vision to code implementation, with specialized subagents, code quality skills, and MCP servers for web research.

## Pipeline

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

Each stage produces artifacts in `thoughts/shared/`:

| Stage | Command | Output |
|---|---|---|
| Vision (greenfield) | `/mission-architect` | `thoughts/shared/missions/` |
| Feature brief (brownfield) | `/feature-architect` | `thoughts/shared/features/` |
| Specification | `/specifier` | `thoughts/shared/specs/` |
| Epics | `/epic-planner` | `thoughts/shared/epics/` |
| Research | `/researcher` | `thoughts/shared/research/` |
| Plan | `/planner` | `thoughts/shared/plans/` |
| Execution | `/implement` | Commits per task, updates STATE |

## Getting Started

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- Node.js 20+
- A running [Crawl4AI](https://crawl4ai.com) instance (for the crawl4ai MCP server)
- A running [SearXNG](https://searxng.org) instance (for the searxng MCP server)

### Installation

Copy the folder `.claude` and the file `.mcp.json` into your project directory.

### Setup

Build the MCP servers before first use:

```bash
cd .claude/mcp/crawl4ai && npm install && npm run build
cd .claude/mcp/searxng  && npm install && npm run build
```

The servers are auto-registered via `"enableAllProjectMcpServers": true` in `.claude/settings.json`.

### Configuration

Set the Crawl4AI and SearXNG base URLs in the MCP server source files if your instances differ from the defaults:

- `.claude/mcp/crawl4ai/src/index.ts` — `BASE_URL`
- `.claude/mcp/searxng/src/index.ts` — base URL constant

Edit `.mcp.json` and set you Context7 API Key. You can get one for free at [Context7](https://context7.com/)

## Commands

### Workflow Orchestration

| Command | Purpose |
|---|---|
| `/mission-architect` | Discover and articulate project vision (why + what, not how) — greenfield |
| `/feature-architect` | Define a new feature within an existing system — brownfield |
| `/specifier` | Translate a mission statement into a technical specification |
| `/epic-planner` | Decompose a spec into epics and user stories |
| `/researcher` | Map the codebase or investigate a topic before planning |
| `/planner` | Produce a sequenced, evidence-based implementation plan |
| `/implement` | Execute a plan task-by-task via subagents, committing after each |

### Code Quality Skills

Invoked via the `Skill` tool (not slash commands):

| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic review against Clean Code, Pragmatic Programmer, etc. |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |

## Architecture

```
.claude/
  commands/          # User-facing slash commands (workflow orchestrators)
  agents/            # Subagent prompts — embedded by orchestrators via Agent tool
  skills/            # Code quality and reference skills
  mcp/
    crawl4ai/        # MCP server: web content extraction via Crawl4AI
    searxng/         # MCP server: web search via SearXNG
  settings.json      # enableAllProjectMcpServers: true
  settings.local.json  # Tool permissions

thoughts/shared/     # Workflow artifacts (missions, features, specs, epics, research, plans)

agent/               # Original OpenCode agent definitions (reference)
skills/              # Original OpenCode skill definitions (reference)
tool/                # Original OpenCode tool source files (reference)
```

**`commands/` vs `agents/` vs `skills/`:**
- **commands/** — Slash commands the user invokes directly (`/researcher`, `/planner`, etc.)
- **agents/** — Subagent prompts that orchestrators embed in `Agent` tool calls; never invoked directly by users
- **skills/** — Quality review and reference skills loaded via the `Skill` tool

## Plan File Format

Plans in `thoughts/shared/plans/` follow this structure:

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
- context: Why this change is needed
```

`/implement` reads the STATE block to resume interrupted plans.

## Background

This toolkit was converted from an OpenCode workflow. See [ANALYSIS.md](ANALYSIS.md) for a detailed mapping of every agent, skill, and tool — including what was preserved, what was rewritten, and what could not be ported.

## License

MIT
