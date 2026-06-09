# .claude/ — Framework Infrastructure

## Purpose

Houses all framework components: workflow skills, worker agents, session hooks, and MCP servers. This directory IS the toolkit — editing here changes agent behavior project-wide.

## Ownership

Framework maintainer. Changes here affect every workflow run.

## Local Contracts

- **Skills** live in `skills/<name>/SKILL.md` — invoked via the `Skill` tool by slash command
- **Agents** live in `agents/<name>.md` — spawned by skills via the `Agent` tool; never invoked directly
- **Hooks** live in `hooks/` — `session-start` runs on every session start/clear/compact
- **MCP servers** live in `mcp/` — auto-enabled via `settings.json`; build with `npm install && npm run build` before first use
- **Settings**: `settings.json` (project-level), `settings.local.json` (permissions/allowlist)

## Work Guidance

- Do not modify skill or agent files while `/subagent-driven-development` is mid-execution on a plan
- New skills: create `skills/<name>/SKILL.md`, update `skills/AGENTS.md` Child DOX Index, update `CLAUDE.md` tables
- New agents: add YAML frontmatter (`name`, `description`, `tools`) to the agent file, update `agents/AGENTS.md`
- New MCP servers: add to `mcp/`, register in `settings.json`, build before use

## Verification

- Skills load when invoked: test with `/skill-name` in a fresh session
- Agents spawn correctly: check that `subagent_type` in the skill matches the agent's `name` field

## Child DOX Index

- [skills/](skills/AGENTS.md) — Workflow orchestrators and quality review skills
- [agents/](agents/AGENTS.md) — Worker agent definitions (read-only specialists)
