# ORBIT — Claude Code Workflow Toolkit

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

### Installation

```bash
claude plugin install ./orbit
```

### Configuration

Edit `.mcp.json` in your project and replace the Context7 API key placeholder with your own key. You can get one for free at [Context7](https://context7.com/):

```json
"context7": {
  "type": "http",
  "url": "https://mcp.context7.com/mcp",
  "headers": {
    "CONTEXT7_API_KEY": "<your key here>"
  }
}
```

The crawl4ai and searxng MCP servers connect to hosted VIER instances and require no local setup.

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

| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic review against Clean Code, Pragmatic Programmer, etc. |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |

## Architecture

```
orbit/
  .claude-plugin/
    plugin.json        # Plugin manifest
  agents/              # Subagent prompts — embedded by orchestrators via Agent tool
  skills/              # Workflow orchestrators and code quality skills
  hooks/
    hooks.json         # SessionStart hook definition
  hooks-handlers/
    session-start      # Injects workflow context at session start
  .mcp.json            # MCP server configs (crawl4ai, searxng, context7, sequential-thinking)

thoughts/shared/       # Workflow artifacts (missions, features, specs, epics, research, plans)
```

**`agents/` vs `skills/`:**
- **agents/** — Subagent prompts that orchestrators embed in `Agent` tool calls; never invoked directly
- **skills/** — Workflow orchestrators and quality review skills invoked via `/skill-name`

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

## License

MIT
