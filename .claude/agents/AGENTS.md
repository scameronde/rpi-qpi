# agents/ — Worker Agent Definitions

## Purpose

Read-only specialist agents spawned by skills via the `Agent` tool. Each agent is a focused, context-isolated role: it receives a task, does one thing well, and returns a structured response. No agent here writes code or modifies project files.

## Ownership

Agents are consumed by skills. The `fact-finder` skill uses all five codebase/web agents. The `planner` skill may call codebase agents to verify evidence. `implement` uses the implementer and reviewer prompts (which live in `skills/implement/`, not here).

## Local Contracts

All agent files follow this structure:
```yaml
---
name: <agent-name>          # matches subagent_type in Agent tool calls
description: <one-liner>    # shown in tool call UI
tools: [...]                # explicit tool allowlist
---
# Agent Title
...prompt body...
```

**Current agents:**
- `codebase-locator.md` — File system topology: finds paths, directory structure, entry points. Returns coordinates, not code.
- `codebase-analyzer.md` — Logic tracer: reads specific files, follows execution paths, maps data flow.
- `codebase-pattern-finder.md` — Pattern scanner: identifies recurring idioms and implementation examples across the codebase.
- `thoughts-locator.md` — Finds documents in `thoughts/` by topic (missions, specs, plans, facts, QA reports).
- `thoughts-analyzer.md` — Extracts structured insights (objectives, requirements, decisions) from documents in `thoughts/`.
- `web-search-researcher.md` — External knowledge: searches the web, fetches documentation, returns cited findings.

## Work Guidance

- Always invoke via `Agent` tool with `subagent_type` matching the agent's `name` field
- Agents return structured responses: YAML frontmatter + `<thinking>` + `<answer>` blocks
- Use `correlation_id` in prompts to track multi-agent workflows
- Strip `<thinking>` blocks before passing agent output to downstream agents to save tokens
- When adding a new agent: add YAML frontmatter, update this file's agent list above

## Verification

- Agent names must exactly match `subagent_type` values used by skills
- Test by spawning the agent directly via `Agent` tool and verifying the response structure
