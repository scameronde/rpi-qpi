# Agent Guidelines for RPIQPI Project

## Build/Lint/Test Commands
- No package.json found - this is a configuration-only OpenCode project
- No test suite configured - verify changes manually or via OpenCode's built-in validation

## Project Structure
- `agent/*.md` - Agent definitions (YAML frontmatter + Markdown system prompt)
- `tool/*.ts` - Custom tools using `@opencode-ai/plugin` package
- `command/*.md` - Reusable command templates
- `thoughts/shared/research/` - Research reports (YYYY-MM-DD-[Topic].md)
- `thoughts/shared/plans/` - Implementation plans (YYYY-MM-DD-[Ticket].md or YYYY-MM-DD-QA-[Target].md)
  - Each plan has a companion STATE file (YYYY-MM-DD-[Ticket]-STATE.md) for progress tracking
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
- **QA Workflow**: Python-QA agents write to `thoughts/shared/qa/` → QA-Planner converts to `thoughts/shared/plans/YYYY-MM-DD-QA-[Target].md` → Implementor executes fixes

## Implementation Workflow (Planner → Implementor)

### Plan Creation (Planner)
1. Planner creates TWO files:
   - `YYYY-MM-DD-[Ticket].md` - The implementation plan (blueprint)
   - `YYYY-MM-DD-[Ticket]-STATE.md` - Progress tracker (minimal, ~20-30 lines)

### Task Execution (Implementor)
1. Implementor reads full plan + STATE file
2. For each task (PLAN-XXX):
   - Execute task according to plan
   - Run verification (tests, build, etc.)
   - **Update STATE file** (mark task complete, advance current task)
   - **Commit to git** with format: `PLAN-XXX: <description>`
   - Stop and wait for user (PROCEED/CONTINUE)

### Resume Implementation (User → Implementor)
1. User runs `/resume-implementation` command
2. Implementor reads STATE file (identifies current task)
3. Implementor reads full plan (gets context)
4. Optional: Check git log for recent task completions
5. Verify environment with commands from STATE file
6. Continue with current task

### Key Benefits
- **Minimal Context**: Resume only needs STATE + plan (~200-500 lines vs ~1000+ lines previously)
- **Git as Evidence**: Each task = one commit, git history becomes audit trail
- **No Pause Needed**: Implementor auto-updates STATE after each task
- **Single Source of Truth**: STATE file tracks progress, plan remains unchanged
