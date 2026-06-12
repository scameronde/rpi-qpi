# .claude/ — Framework Infrastructure

## Purpose

Houses all framework components: workflow skills, worker agents, session hooks, and settings. This directory IS the toolkit — editing here changes agent behavior project-wide.

## Ownership

Framework maintainer. Changes here affect every workflow run.

## Local Contracts

- **Skills** live in `skills/<name>/SKILL.md` — invoked via the `Skill` tool by slash command
- **Agents** live in `agents/<name>.md` — spawned by skills via the `Agent` tool; never invoked directly
- **Hooks** live in `hooks/` — `session-start` runs on every session start/clear/compact
- **MCP servers** are defined in `.mcp.json` at the project root; remote servers require no local build
- **Settings**: `settings.json` (project-level), `settings.local.json` (permissions/allowlist)

## Work Guidance

- Do not modify skill or agent files while `/implement` is mid-execution on a plan
- New skills: create `skills/<name>/SKILL.md`, update `skills/AGENTS.md` Child DOX Index, update `CLAUDE.md` tables
- New agents: add YAML frontmatter (`name`, `description`, `tools`) to the agent file, update `agents/AGENTS.md`
- MCP servers are hosted remotely (VIER infrastructure); to add a new server, update `.mcp.json` at the project root

## Verification

- Skills load when invoked: test with `/skill-name` in a fresh session
- Agents spawn correctly: check that `subagent_type` in the skill matches the agent's `name` field

## Child DOX Index

- [skills/](skills/AGENTS.md) — Workflow orchestrators and quality review skills
- [agents/](agents/AGENTS.md) — Worker agent definitions (read-only specialists)
