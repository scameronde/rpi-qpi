# Agent Guidelines for RPIQR Project

## Build/Lint/Test Commands
- No package.json found - this is a configuration-only OpenCode project
- No test suite configured - verify changes manually or via OpenCode's built-in validation

## Project Structure
- `agent/*.md` - Agent definitions (YAML frontmatter + Markdown system prompt)
- `tool/*.ts` - Custom tools using `@opencode-ai/plugin` package
- `command/*.md` - Reusable command templates
- `thoughts/shared/research/` - Research reports (YYYY-MM-DD-[Topic].md)
- `thoughts/shared/plans/` - Implementation plans (YYYY-MM-DD-[Ticket].md)
- `thoughts/shared/qa/` - QA analysis reports (YYYY-MM-DD-[Target].md)

## Code Style & Conventions
- **TypeScript**: Use TypeScript for custom tools; follow existing `tool/searxng-search.ts` patterns
- **Imports**: Tools must import `tool` from `@opencode-ai/plugin`; use named imports for interfaces
- **Types**: Define interfaces for all structured data; use Zod schemas via `tool.schema.*` for validation
- **Error Handling**: Return JSON-stringified error objects with `error: true` flag; never throw unhandled exceptions
- **Naming**: Use kebab-case for filenames; camelCase for TypeScript variables; PascalCase for interfaces
- **Agent Mode**: Primary agents (`mode: primary`), subagents (`mode: subagent`), or all-mode (default)
- **Temperature**: Research/Planning agents use 0.1; Implementation uses 0.2
- **Tool Permissions**: Use granular boolean flags per tool; add explanatory comments when disabling (e.g., `# use Sub-Agent 'X' instead`)
- **Evidence-Based Documentation**: All claims in research reports require file path + line range + code excerpt
- **Primary Agents**: Researcher, Planner, Implementor, Python-QA-Quick, Python-QA-Thorough all use `mode: primary` and can be invoked directly by users
- **QA Reports**: Use YYYY-MM-DD-[Target-Description].md format in `thoughts/shared/qa/`; target can be module name, feature name, or file path slug
