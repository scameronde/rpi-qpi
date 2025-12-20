# RPIQR - Research, Plan, Implement, QA, Repeat

> A systematic software development workflow framework for OpenCode

[![OpenCode](https://img.shields.io/badge/OpenCode-Framework-blue)](https://opencode.ai)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Workflow](#workflow)
  - [Research Phase](#research-phase)
  - [Plan Phase](#plan-phase)
  - [Implement Phase](#implement-phase)
  - [QA Phase](#qa-phase)
  - [Repeat](#repeat)
- [Available Agents](#available-agents)
- [Custom Tools](#custom-tools)
- [Commands](#commands)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

RPIQR is an OpenCode project that implements a systematic, phase-based approach to software development with AI agents. It models professional software engineering workflows through specialized agents that handle research, planning, implementation, quality assurance, and iteration.

The framework enforces separation of concerns, evidence-based decision making, and iterative refinement—ensuring high-quality, maintainable code through a structured development process.

## Features

- **12 Specialized Agents** - Purpose-built agents for each phase of development
- **Evidence-Based Research** - Automated research with citation and verification requirements
- **Structured Planning** - Detailed implementation blueprints with verification checkpoints
- **Phase-Gated Implementation** - Incremental development with automated testing
- **Multi-Level QA** - Quick and thorough code review options
- **Pausable Workflows** - Save and resume implementation sessions
- **Custom Tools** - SearXNG web search integration
- **MCP Integration** - Context7 for library docs, Sequential Thinking for reasoning

## Prerequisites

- [OpenCode](https://opencode.ai) v1.0 or later
- Node.js (for MCP servers and custom tools)
- An LLM provider API key (see [Configuration](#configuration))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rpiqr
   ```

2. **Install OpenCode** (if not already installed)
   ```bash
   curl -fsSL https://opencode.ai/install | bash
   ```

3. **Configure your LLM provider**
   
   Edit `opencode.json` to set up your provider credentials, or use the VIER AI Gateway configuration as-is if you have access.

4. **Initialize OpenCode in your target project**
   ```bash
   cd /path/to/your/project
   opencode
   /init
   ```

5. **Copy RPIQR agents to your project** (optional)
   ```bash
   cp -r /path/to/rpiqr/agent ~/.config/opencode/agent/
   cp -r /path/to/rpiqr/tool ~/.config/opencode/tool/
   cp -r /path/to/rpiqr/command ~/.config/opencode/command/
   ```

## Project Structure

```
rpiqr/
├── agent/                      # Agent definitions
│   ├── researcher.md           # Research orchestrator (primary)
│   ├── planner.md              # Implementation architect (primary)
│   ├── implementor.md          # Code builder (primary)
│   ├── codebase-locator.md     # File topology specialist (subagent)
│   ├── codebase-analyzer.md    # Logic analysis specialist (subagent)
│   ├── codebase-pattern-finder.md  # Pattern scanner (subagent)
│   ├── web-search-researcher.md    # External research (subagent)
│   ├── python-qa-auditor.md    # Python QA specialist (subagent)
│   ├── thoughts-analyzer.md    # Document analyzer (subagent)
│   └── thoughts-locator.md     # Document locator (subagent)
├── tool/                       # Custom tools
│   └── searxng-search.ts       # SearXNG web search integration
├── command/                    # Reusable commands
│   ├── pause-implementation.md # Save implementation progress
│   └── resume-implementation.md # Resume from saved state
├── thoughts/                   # Generated artifacts
│   └── shared/
│       ├── research/           # Research reports (YYYY-MM-DD-Topic.md)
│       ├── plans/              # Implementation plans (YYYY-MM-DD-Ticket.md)
│       └── qa/                 # QA analysis reports (YYYY-MM-DD-Target.md)
├── opencode.json               # OpenCode configuration
├── AGENTS.md                   # Agent coding guidelines
└── README.md                   # This file
```

## Workflow

### Research Phase

Every larger change starts with a research phase. The **Researcher** agent:
- Gathers information about the topic from multiple sources
- Explores existing solutions and best practices
- Accesses the internet, documentation, and open source projects
- Documents findings with evidence (file paths, line numbers, code excerpts)
- Produces a factual research report in `thoughts/shared/research/`

**Key principle**: No opinions, only verified observations. The researcher's job is to understand the problem space, not to propose solutions.

### Plan Phase

Based on the research report, the **Planner** agent:
- Creates a detailed implementation blueprint
- Breaks down tasks into phases with verification points
- Identifies constraints, dependencies, and potential challenges
- Specifies exact files to modify and verification commands
- Outputs a plan to `thoughts/shared/plans/`

**Key principle**: No code, only verified planning. Plans must be executable by the implementor without improvisation.

### Implement Phase

The **Implementor** agent executes the plan:
- Works strictly from approved plans (no plan = no code)
- Implements one phase at a time with human checkpoints
- Reads files before editing, verifies changes after
- Runs automated tests after each phase
- Can be paused and resumed using `/pause-implementation` and `/resume-implementation`

**Key principle**: No scope creep. Every change must map to a specific plan action ID.

### QA Phase

QA agents review the implementation as **primary agents** that can be invoked directly:
- **Quick QA** (`@python-qa-quick`): Fast automated checks (ruff, pyright, bandit) with actionable task list. Use for rapid feedback during development.
- **Thorough QA** (`@python-qa-thorough`): Comprehensive analysis including automated tools + manual quality checks; generates detailed plan in `thoughts/shared/qa/`. Use for pre-release reviews or architectural assessments.

QA agents identify bugs, quality issues, and deviations from requirements. Feedback loops back to the implementor for iterative refinement.

### Repeat

Start a new cycle for the next feature, improvement, or refactor. Each cycle builds upon previous work, enabling continuous evolution of your software project.

### Primary Agents

Primary agents in the RPIQR workflow:
1. **Researcher** (@researcher) - Maps codebase and creates factual foundation
2. **Planner** (@planner) - Architects technical solutions and generates blueprints
3. **Implementor** (@implementor) - Executes plans and builds code
4. **QA Quick** (@python-qa-quick) - Rapid quality checks for fast feedback
5. **QA Thorough** (@python-qa-thorough) - Comprehensive quality analysis and improvement planning

## Available Agents

| Agent | Type | Temperature | Purpose |
|-------|------|-------------|---------|
| `researcher` | Primary | 0.1 | Codebase mapping & research orchestration |
| `planner` | Primary | 0.1 | Implementation architecture & blueprints |
| `implementor` | Primary | 0.2 | Plan execution & code building |
| `python-qa-quick` | Primary | 0.1 | Quick Python QA (ruff, pyright, bandit) |
| `python-qa-thorough` | Primary | 0.1 | Thorough Python QA with plan generation |
| `codebase-locator` | Subagent | - | File system topology specialist |
| `codebase-analyzer` | Subagent | - | Code logic & execution tracing |
| `codebase-pattern-finder` | Subagent | - | Pattern & idiom identification |
| `web-search-researcher` | Subagent | - | External library & API research |
| `python-qa-auditor` | Subagent | - | Python linting, typing, security |
| `thoughts-analyzer` | Subagent | - | Historical decision extraction |
| `thoughts-locator` | Subagent | - | Documentation & ticket locator |

Switch between primary agents using the **Tab** key in OpenCode.

## Custom Tools

### searxng-search

Web search tool using SearXNG service.

```typescript
// Usage in agent prompts
searxng-search({
  query: "React 18 useContext best practices",
  language: "en",
  time_range: "year"
})
```

Returns up to 10 search results with titles, URLs, and snippets.

## Commands

### /pause-implementation

Saves current implementation state to context files for later resumption.

```
/pause-implementation
```

Generates:
- `[Plan-Name]-PROGRESS.md` - Detailed status log
- `[Plan-Name]-CONTEXT.md` - Quick resume reference

### /resume-implementation

Resumes implementation from saved context files.

```
/resume-implementation
```

## Configuration

The project uses a custom VIER AI Gateway provider configured in `opencode.json`:

```json
{
  "provider": {
    "aigateway": {
      "npm": "@ai-sdk/openai-compatible",
      "baseURL": "https://aigateway.eu/core/v1",
      "models": {
        "code---anthropic-claude-haiku": { ... },
        "code---anthropic-claude-sonnet": { ... }
      }
    }
  },
  "model": "aigateway/code---anthropic-claude-sonnet"
}
```

**MCP Servers**:
- **Context7**: Library documentation lookup
- **Sequential Thinking**: Multi-step reasoning chains

To use standard providers (Anthropic, OpenAI, etc.), run `/connect` in OpenCode and follow the prompts.

## Usage Examples

### Starting a New Feature

1. **Research** (using `researcher` agent):
   ```
   Research how authentication is currently handled in this codebase and compare
   it to industry best practices for JWT-based auth in Node.js applications.
   ```

2. **Plan** (switch to `planner` agent with Tab):
   ```
   Create a plan to add refresh token support to our authentication system based
   on the research report from 2025-12-20-JWT-Auth-Research.md
   ```

3. **Implement** (switch to `implementor` agent):
   ```
   PROCEED with the plan from thoughts/shared/plans/2025-12-20-Add-Refresh-Tokens.md
   ```

### Quick Code Fix

For straightforward changes, use the `implementor` directly:

```
Add error handling to the login function in @src/auth/login.ts following the
pattern used in @src/auth/register.ts
```

### Research Without Implementation

Use Plan mode (Tab key) to get a plan without code changes, then review before building.

## Contributing

Contributions are welcome! Please:

1. Follow the coding guidelines in `AGENTS.md`
2. Use kebab-case for filenames
3. Add evidence-based documentation for research
4. Test custom tools before submitting

## License

MIT License - see LICENSE file for details

---

**Built with [OpenCode](https://opencode.ai)** - The open source AI coding agent
