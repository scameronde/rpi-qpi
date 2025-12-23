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

## Implementation Workflow (Planner → Implementation-Controller → Task-Executor)

### Architecture Overview

The implementation system uses a **two-agent architecture** to minimize LLM context:

1. **Implementation-Controller** (Primary Agent - Orchestrator)
   - Loads plan + STATE file (~200-500 lines)
   - Extracts PLAN-XXX tasks one at a time
   - Delegates code changes to Task-Executor subagent
   - Runs verification after each task
   - Updates STATE file and commits to git
   - Manages retry logic and error recovery

2. **Task-Executor** (Subagent - Builder)
   - Receives single task payload (~50 lines)
   - Reads target files (~200 lines)
   - Implements exactly one PLAN-XXX task
   - Returns results to Controller
   - **Total context: ~250 lines** (vs ~730 lines in monolithic approach)

### Plan Creation (Planner)
1. Planner creates TWO files:
   - `YYYY-MM-DD-[Ticket].md` - The implementation plan (blueprint)
   - `YYYY-MM-DD-[Ticket]-STATE.md` - Progress tracker (minimal, ~20-30 lines)

### Task Execution (Implementation-Controller → Task-Executor)

**For each task (PLAN-XXX):**

1. **Controller** extracts task from plan, creates task payload:
   ```json
   {
     "taskId": "PLAN-005",
     "taskName": "Add type annotations",
     "changeType": "modify",
     "files": ["src/utils/validate.ts"],
     "instruction": "Step-by-step instructions...",
     "evidence": "src/utils/validate.ts:42-48",
     "doneWhen": "pyright shows no errors",
     "allowedAdjacentEdits": [],
     "context": "Phase 2: Type Safety"
   }
   ```

2. **Controller** invokes **Task-Executor** subagent with payload

3. **Task-Executor** implements the task:
   - Reads target files
   - Makes code changes
   - Reports SUCCESS/BLOCKED/FAILED

4. **Controller** handles executor response:
   - If SUCCESS: Proceed to verification
   - If BLOCKED/FAILED: Retry with additional context (max 2 retries)

5. **Controller** runs verification:
   - Execute commands from task's "Done When" criteria
   - If fails: Retry with Task-Executor (max 2 retries)
   - If passes: Proceed to commit

6. **Controller** updates STATE file and commits:
   - Mark task complete in STATE
   - `git commit -m "PLAN-XXX: <description>"`
   - Stop and report to user

7. **Wait for user**: "PROCEED" or "CONTINUE"

### Resume Implementation (User → Implementation-Controller)

1. User runs `/resume-implementation` command
2. **Controller** reads STATE file (identifies current task)
3. **Controller** reads full plan (gets context)
4. Optional: Check git log for recent task completions
5. Verify environment with commands from STATE file
6. Continue with current task (invoke Task-Executor)

### Key Benefits

- **Minimal Executor Context**: ~250 lines per task (vs ~730 lines monolithic)
- **Context Reduction**: ~66% reduction in executor LLM context
- **Separation of Concerns**: Controller = orchestration, Executor = implementation
- **Fault Isolation**: Executor failures don't pollute controller context
- **Retry Logic**: Controller can retry failed tasks with additional context
- **Git as Evidence**: Each task = one commit, git history becomes audit trail
- **Single Source of Truth**: STATE file tracks progress, plan remains unchanged
- **Scalability**: Future parallel task execution possible
