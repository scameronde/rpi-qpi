# RPIQPI - Research, Plan, Implement, QA, Plan, Implement

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
  - [QA-Driven Planning Phase](#qa-driven-planning-phase)
  - [Fix Implementation Phase](#fix-implementation-phase)
- [Available Agents](#available-agents)
- [Custom Tools](#custom-tools)
- [Commands](#commands)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

RPIQPI is an OpenCode project that implements a systematic, phase-based approach to software development with AI agents. It models professional software engineering workflows through specialized agents that handle research, planning, implementation, quality assurance, and iterative refinement.

The framework enforces separation of concerns, evidence-based decision making, and explicit workflow phases—ensuring high-quality, maintainable code through a structured development process. The name reflects the complete workflow cycle: **Research** (gather facts) → **Plan** (architect solution) → **Implement** (build features) → **QA** (analyze quality) → **Plan** (convert QA findings) → **Implement** (execute fixes), which then repeats for continuous improvement.

## Features

- **19 Specialized Agents** - Purpose-built agents for each phase of development
- **Greenfield Workflow** - Mission-driven development from vision to specification to epics
- **Evidence-Based Research** - Automated research with citation and verification requirements
- **Structured Planning** - Detailed implementation blueprints with verification checkpoints
- **Two-Agent Implementation** - Controller/Executor architecture for minimal context and maximum efficiency
- **Multi-Level QA** - Quick and thorough code review for both Python and TypeScript
- **QA-to-Implementation Bridge** - Seamless conversion of QA findings into actionable plans
- **Skills System** - Reusable knowledge modules for domain-specific expertise
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

5. **Copy RPIQPI agents to your project** (optional)
   ```bash
   cp -r /path/to/rpiqr/agent ~/.config/opencode/agent/
   cp -r /path/to/rpiqr/tool ~/.config/opencode/tool/
   cp -r /path/to/rpiqr/skills ~/.config/opencode/skills/
   ```

## Project Structure

```
rpiqr/
├── agent/                           # Agent definitions
│   ├── mission-architect.md         # Vision discovery (primary)
│   ├── specifier.md                 # Mission-to-spec translator (primary)
│   ├── epic-planner.md              # Spec-to-epic decomposer (primary)
│   ├── researcher.md                # Research orchestrator (primary)
│   ├── planner.md                   # Implementation architect (primary)
│   ├── implementation-controller.md # Implementation orchestrator (primary)
│   ├── task-executor.md             # Single-task builder (subagent)
│   ├── qa-planner.md                # QA-to-plan converter (subagent)
│   ├── opencode-qa-thorough.md      # Thorough OpenCode QA (primary)
│   ├── python-qa-quick.md           # Quick Python QA (primary)
│   ├── python-qa-thorough.md        # Thorough Python QA (primary)
│   ├── typescript-qa-quick.md       # Quick TypeScript QA (primary)
│   ├── typescript-qa-thorough.md    # Thorough TypeScript QA (primary)
│   ├── codebase-locator.md          # File topology specialist (subagent)
│   ├── codebase-analyzer.md         # Logic analysis specialist (subagent)
│   ├── codebase-pattern-finder.md   # Pattern scanner (subagent)
│   ├── web-search-researcher.md     # External research (subagent)
│   ├── thoughts-analyzer.md         # Document analyzer (subagent)
│   └── thoughts-locator.md          # Document locator (subagent)
├── tool/                            # Custom tools
│   └── searxng-search.ts            # SearXNG web search integration
├── skills/                          # Reusable knowledge modules
│   ├── dify/                        # Dify bot development reference
│   │   ├── SKILL.md                 # Skill definition and documentation
│   │   └── references/              # Reference documentation files
│   └── opencode/                    # OpenCode framework reference
│       ├── SKILL.md                 # Skill definition and documentation
│       └── references/              # Reference documentation files
├── thoughts/                        # Generated artifacts
│   └── shared/
│       ├── missions/                # Mission statements (YYYY-MM-DD-[Project-Name].md)
│       ├── specs/                   # Specifications (YYYY-MM-DD-[Project-Name].md)
│       ├── epics/                   # Epic decompositions (YYYY-MM-DD-[Epic-Name].md)
│       ├── research/                # Research reports (YYYY-MM-DD-Topic.md)
│       ├── plans/                   # Implementation plans (YYYY-MM-DD-Ticket.md or YYYY-MM-DD-QA-Target.md)
│       └── qa/                      # QA analysis reports (YYYY-MM-DD-Target.md)
├── opencode.json                    # OpenCode configuration
├── AGENTS.md                        # Agent coding guidelines
└── README.md                        # This file
```

## Workflow

### Greenfield Workflow (New Projects/Features)

For completely new projects or features, start with the greenfield workflow:

#### 1. Mission Statement (Mission-Architect)
- Collaborative vision discovery through conversation
- Captures WHY and WHAT (not HOW)
- Outputs to `thoughts/shared/missions/`
- **Key principle**: Vision before specification

#### 2. Specification (Specifier)
- Transforms mission into abstract technical specification
- Defines components, data models, interfaces (technology-agnostic)
- Outputs to `thoughts/shared/specs/`
- **Key principle**: What the system does, not how it's built

#### 3. Epic Decomposition (Epic-Planner)
- Breaks specification into story-based epics
- Defines research questions and acceptance criteria
- Outputs to `thoughts/shared/epics/`
- **Key principle**: User-facing value, not tasks

#### 4. Implementation (Researcher → Planner → Implementation-Controller)
- Follow standard workflow for each epic (see below)

### Standard Workflow (Existing Features/Fixes)

#### Research Phase

Every larger change starts with research. The **Researcher** agent:
- Gathers information about the topic from multiple sources
- Explores existing solutions and best practices
- Accesses the internet, documentation, and open source projects
- Documents findings with evidence (file paths, line numbers, code excerpts)
- Produces a factual research report in `thoughts/shared/research/`

**Key principle**: No opinions, only verified observations.

#### Plan Phase

Based on research (or epic), the **Planner** agent:
- Creates a detailed implementation blueprint
- Breaks down tasks into phases with verification points
- Identifies constraints, dependencies, and potential challenges
- Specifies exact files to modify and verification commands
- Outputs plan and STATE file to `thoughts/shared/plans/`

**Key principle**: No code, only verified planning.

#### Implement Phase

The **Implementation-Controller** orchestrates execution:
- Loads plan and STATE file from `thoughts/shared/plans/`
- Extracts PLAN-XXX tasks one at a time
- Delegates code changes to **Task-Executor** subagent
- Runs verification after each task
- Updates STATE file and commits to git
- Stops after each task for user approval

The **Task-Executor** builds the code:
- Receives single task payload (~50 lines context)
- Implements exactly one PLAN-XXX task
- Reports SUCCESS/BLOCKED/FAILED to Controller

**Key principle**: Minimal context, maximum efficiency. ~66% reduction in LLM context vs monolithic approach.

#### QA Phase

QA agents review the implementation as **primary agents** that can be invoked directly:

**Python QA**:
- **Quick QA** (`@python-qa-quick`): Fast automated checks (ruff, pyright, bandit) with actionable task list
- **Thorough QA** (`@python-qa-thorough`): Comprehensive analysis + detailed report in `thoughts/shared/qa/`

**TypeScript QA**:
- **Quick QA** (`@typescript-qa-quick`): Fast automated checks (eslint, tsc) with actionable task list
- **Thorough QA** (`@typescript-qa-thorough`): Comprehensive analysis + detailed report in `thoughts/shared/qa/`

**QA-to-Implementation Bridge**:
After thorough QA analysis, the **QA-Planner** subagent converts QA reports into implementation-ready plans:
1. Reads QA report from `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
2. Translates findings into phased implementation plan
3. Writes to `thoughts/shared/plans/YYYY-MM-DD-QA-[Target].md`
4. Implementation-Controller executes the fixes phase-by-phase

This workflow ensures QA findings are systematically addressed with the same rigor as feature development.

#### QA-Driven Planning Phase

After QA analysis identifies issues, the workflow returns to the planning phase:
- The **QA-Planner** subagent converts the QA report into an implementation-ready plan
- Creates phased action items in `thoughts/shared/plans/YYYY-MM-DD-QA-[Target].md`
- Prioritizes issues by severity and impact
- Defines verification steps for each fix

**Key principle**: QA findings must be planned before implementation.

#### Fix Implementation Phase

The **Implementation-Controller** executes the QA-driven plan:
- Works from the QA-converted plan (same process as feature implementation)
- Implements fixes one task at a time with verification
- Updates STATE file and commits after each task
- Returns to QA phase for verification after all fixes are complete

**Complete workflow cycle**: Research → Plan → Implement → QA → Plan (QA findings) → Implement (fixes) → QA (verify) → [New feature cycle]

### Primary Agents

Primary agents that can be invoked directly:

**Greenfield Workflow**:
1. **Mission-Architect** (@mission-architect) - Vision discovery and mission statements
2. **Specifier** (@specifier) - Mission-to-specification translator
3. **Epic-Planner** (@epic-planner) - Specification-to-epic decomposer

**Standard Workflow**:
4. **Researcher** (@researcher) - Codebase mapping and research orchestration
5. **Planner** (@planner) - Implementation architecture and blueprints
6. **Implementation-Controller** (@implementation-controller) - Plan execution orchestrator

**QA Workflow**:
7. **OpenCode-QA-Thorough** (@opencode-qa-thorough) - Comprehensive OpenCode project analysis
8. **Python-QA-Quick** (@python-qa-quick) - Rapid Python quality checks
9. **Python-QA-Thorough** (@python-qa-thorough) - Comprehensive Python analysis
10. **TypeScript-QA-Quick** (@typescript-qa-quick) - Rapid TypeScript quality checks
11. **TypeScript-QA-Thorough** (@typescript-qa-thorough) - Comprehensive TypeScript analysis

## Available Agents

| Agent | Type | Temperature | Purpose |
|-------|------|-------------|---------|
| **Greenfield Workflow** | | | |
| `mission-architect` | Primary | 0.1 | Vision discovery & mission statements |
| `specifier` | Primary | 0.1 | Mission-to-specification translation |
| `epic-planner` | Primary | 0.1 | Specification-to-epic decomposition |
| **Standard Workflow** | | | |
| `researcher` | Primary | 0.1 | Codebase mapping & research orchestration |
| `planner` | Primary | 0.1 | Implementation architecture & blueprints |
| `implementation-controller` | Primary | 0.2 | Plan execution orchestration |
| `task-executor` | Subagent | 0.2 | Single-task code builder |
| **QA Workflow** | | | |
| `opencode-qa-thorough` | Primary | 0.1 | Thorough OpenCode QA (yamllint, markdownlint) |
| `python-qa-quick` | Primary | 0.1 | Quick Python QA (ruff, pyright, bandit) |
| `python-qa-thorough` | Primary | 0.1 | Thorough Python QA with report generation |
| `typescript-qa-quick` | Primary | 0.1 | Quick TypeScript QA (eslint, tsc) |
| `typescript-qa-thorough` | Primary | 0.1 | Thorough TypeScript QA with report generation |
| `qa-planner` | Subagent | 0.1 | QA report to implementation plan converter |
| **Support Subagents** | | | |
| `codebase-locator` | Subagent | - | File system topology specialist |
| `codebase-analyzer` | Subagent | - | Code logic & execution tracing |
| `codebase-pattern-finder` | Subagent | - | Pattern & idiom identification |
| `web-search-researcher` | Subagent | - | External library & API research |
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

## Skills

Skills are reusable knowledge modules that provide domain-specific expertise to agents. Each skill contains curated reference documentation and can be invoked when specialized knowledge is needed.

### dify

Comprehensive technical reference for Dify bot development.

**Provides:**
- Node type specifications (18+ node types across 6 categories)
- Variable system reference (syntax, scopes, resolution)
- Voice bot design patterns (latency optimization, speech handling)
- Platform architecture (workflow modes, DSL structure, execution model)

**Usage:**
```
Load the dify skill when working with Dify bots
```

**Structure:**
```
skills/dify/
├── SKILL.md                    # Skill definition and quick reference
└── references/                 # Detailed documentation
    ├── node-types.md           # Complete node catalog
    ├── variable-system.md      # Variable reference guide
    ├── voice-bot-patterns.md   # Voice-specific patterns
    └── architecture.md         # Platform deep dive
```

### opencode

Comprehensive reference for OpenCode Skills and Agents systems.

**Provides:**
- Skills system best practices
- Agent definition guidelines
- Claude Sonnet-4.5 optimization techniques
- Prompt engineering patterns

**Usage:**
```
Load the opencode skill when working with OpenCode agents and skills
```

**Structure:**
```
skills/opencode/
├── SKILL.md                    # Skill definition and quick reference
└── references/                 # Detailed documentation
```

### Creating Custom Skills

Skills follow this structure:
1. Create directory in `skills/[skill-name]/`
2. Add `SKILL.md` with metadata and description
3. Add reference files in `references/` or equivalent
4. Agents can load skills when domain expertise is needed

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

### Starting a Greenfield Project

1. **Mission Statement** (using `mission-architect` agent):
   ```
   I want to build a tool that helps developers track technical debt across multiple projects.
   ```
   Agent will ask clarifying questions and create mission statement in `thoughts/shared/missions/`

2. **Specification** (switch to `specifier` agent with Tab):
   ```
   Create a specification from the mission statement thoughts/shared/missions/2026-01-16-Tech-Debt-Tracker.md
   ```

3. **Epic Decomposition** (switch to `epic-planner` agent):
   ```
   Decompose the specification thoughts/shared/specs/2026-01-16-Tech-Debt-Tracker.md into epics
   ```

4. **Implement Epics** (follow standard workflow for each epic)

### Starting a Feature (Standard Workflow)

1. **Research** (using `researcher` agent):
   ```
   Research how authentication is currently handled in this codebase and compare
   it to industry best practices for JWT-based auth in Node.js applications.
   ```

2. **Plan** (switch to `planner` agent with Tab):
   ```
   Create a plan to add refresh token support to our authentication system based
   on the research report from 2026-01-16-JWT-Auth-Research.md
   ```

3. **Implement** (switch to `implementation-controller` agent):
   ```
   PROCEED with the plan from thoughts/shared/plans/2026-01-16-Add-Refresh-Tokens.md
   ```
   Controller will execute tasks one at a time, waiting for "PROCEED" or "CONTINUE" after each task.

### Running QA

**Thorough OpenCode QA** (using `opencode-qa-thorough` agent):
```
Run thorough QA on the OpenCode project
```

**Quick TypeScript QA** (using `typescript-qa-quick` agent):
```
Run quick QA checks on src/auth/
```

**Thorough Python QA** (using `python-qa-thorough` agent):
```
Perform thorough QA analysis on the authentication module
```

QA reports go to `thoughts/shared/qa/`, then use `planner` to convert findings to implementation plans.

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
