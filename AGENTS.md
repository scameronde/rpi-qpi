# Agent Guidelines for RPIQPI Project

## Build/Lint/Test Commands
- No package.json found - this is a configuration-only OpenCode project
- No test suite configured - verify changes manually or via OpenCode's built-in validation

## Project Structure
- `agent/*.md` - Agent definitions (YAML frontmatter + Markdown system prompt)
- `tool/*.ts` - Custom tools using `@opencode-ai/plugin` package
- `skills/[skill-name]/` - Reusable knowledge modules with domain-specific expertise
  - `SKILL.md` - Skill definition with metadata and documentation
  - `references/` - Reference documentation files
- `thoughts/shared/missions/` - Mission statements (YYYY-MM-DD-[Project-Name].md) - vision and value for greenfield work
- `thoughts/shared/specs/` - Specifications (YYYY-MM-DD-[Project-Name].md) - abstract architecture from missions
- `thoughts/shared/epics/` - Epic decompositions (YYYY-MM-DD-[Epic-Name].md) - story-based breakdowns from specs
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
- **Primary Agents**: Mission-Architect, Specifier, Epic-Planner, Researcher, Planner, Implementation-Controller, Python-QA-Quick, Python-QA-Thorough, TypeScript-QA-Quick, TypeScript-QA-Thorough all use `mode: primary` and can be invoked directly by users
- **QA Reports**: Use YYYY-MM-DD-[Target-Description].md format in `thoughts/shared/qa/`; target can be module name, feature name, or file path slug
- **QA Workflow**: QA agents write to `thoughts/shared/qa/` → QA-Planner converts to `thoughts/shared/plans/YYYY-MM-DD-QA-[Target].md` → Implementation-Controller executes fixes
- **Skills**: Domain-specific knowledge modules in `skills/[skill-name]/` with `SKILL.md` definition and `references/` documentation; use kebab-case for skill names

## Greenfield Workflow (Mission-Architect → Specifier → Epic-Planner → Researcher/Planner)

For **completely new projects** or **completely new features** in existing applications:

### 1. Mission Statement Creation (Mission-Architect)
- **Input**: User's vision and ideas (conversational brainstorming)
- **Agent**: Mission-Architect (Primary Agent)
- **Process**: 
  - User describes their vision
  - Agent asks clarifying questions (why, who, what, when)
  - Agent participates in brainstorming
  - Agent challenges assumptions and helps refine scope
- **Output**: `thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md`
- **Focus**: WHY and WHAT (not HOW)
- **Content**: 
  - Vision statement (problem, value, audience)
  - Essential capabilities (3-7 must-have features)
  - Explicit non-goals (scope boundaries)
  - Success criteria (observable outcomes)
  - Assumptions and constraints

### 2. Specification Creation (Specifier)
- **Input**: Mission statement from `thoughts/shared/missions/`
- **Agent**: Specifier (Primary Agent)
- **Process**:
  - Read and validate mission statement
  - Define abstract architecture (components, interactions)
  - Create conceptual data models (entities, relationships)
  - Define external interfaces (user-facing, APIs, integrations)
  - Extract non-functional requirements
- **Output**: `thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md`
- **Focus**: WHAT the system does and HOW it's structured (abstract level)
- **Content**:
  - System overview and boundaries
  - Architecture diagrams (Mermaid)
  - Abstract data models (no schemas/types)
  - API contracts (no specific technologies)
  - Non-functional requirements
  - Acceptance criteria per capability
- **Constraints**: 
  - NO technology stack decisions (no React, PostgreSQL, AWS, etc.)
  - Abstract components only ("Data Layer", not "PostgreSQL database")
  - Mermaid diagrams encouraged for clarity

### 3. Epic Decomposition (Epic-Planner)
- **Input**: Specification from `thoughts/shared/specs/`
- **Agent**: Epic-Planner (Primary Agent)
- **Process**:
  - Read and validate specification
  - Decompose into functional epics (story-based, not task-based)
  - Define user stories (3-7 per epic)
  - Formulate research questions for Researcher
  - Define acceptance criteria for Planner
  - Identify dependencies between epics
- **Output**: Multiple files in `thoughts/shared/epics/YYYY-MM-DD-[Epic-Name].md`
- **Focus**: User-facing capabilities and system components (not implementation tasks)
- **Content**: Each epic includes:
  - User stories (As a... I want to... So that...)
  - Research questions (for Researcher agent)
  - Acceptance criteria (for Planner agent)
  - Dependencies (prerequisite/concurrent/dependent epics)
  - Data model requirements
  - External interface requirements
  - Verification plan
- **Granularity**: Right-sized for 1-3 research reports + 1-5 implementation plans
  - Good: "User Authentication System" (login, registration, password reset)
  - Bad (too big): "The Entire Application"
  - Bad (too small): "Add email validation function"

### 4. Implementation (Researcher → Planner → Implementor)
- **Input**: Epic(s) from `thoughts/shared/epics/`
- **Flow**: User can now use existing workflow for each epic:
  - **Researcher**: Answers research questions from epic → `thoughts/shared/research/`
  - **Planner**: Creates implementation plan using epic's acceptance criteria → `thoughts/shared/plans/`
  - **Implementor**: Executes plan → code changes
- **User Control**: User decides which epics to implement and in what order (respecting dependencies)

### Key Benefits

- **Clear Vision Before Code**: Mission → Spec → Epics ensures shared understanding before implementation
- **Technology-Agnostic Planning**: Specifier defines "what" without prescribing "how" (Planner chooses based on codebase)
- **Traceable Requirements**: Epic → Spec → Mission lineage ensures every story traces to original value
- **Flexible Execution**: User can implement all epics or cherry-pick based on priority
- **Separation of Concerns**: 
  - Mission-Architect = vision and value (no tech)
  - Specifier = architecture and design (abstract)
  - Epic-Planner = decomposition and stories (functional)
  - Researcher/Planner = codebase integration and tasks (concrete)

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

## Codebase-Analyzer Output Format and Depth Levels

The codebase-analyzer subagent supports three analysis depth levels to optimize token usage:

### Depth Levels

1. **execution_only** (~250 tokens, 70% savings)
   - Use case: QA agents needing testability analysis
   - Sections: Execution Flow only (with code excerpts)

2. **focused** (~350 tokens, 56% savings)
   - Use case: Planner agents needing implementation context
   - Sections: Execution Flow + Dependencies

3. **comprehensive** (~950 tokens, complete analysis)
   - Use case: Researcher agents needing full analysis
   - Sections: All 4 (Execution Flow, Data Model, Dependencies, Edge Cases)

### Output Structure

All responses include:
- YAML frontmatter (message_id, timestamp, target info, depth used)
- `<thinking>` section (reasoning process)
- `<answer>` section (structured findings with code excerpts)

### Specifying Depth

Include `Analysis depth: [level]` in the task prompt:

```
task({
  subagent_type: "codebase-analyzer",
  prompt: "Analyze processOrder in src/orders.ts. Analysis depth: focused."
})
```

If not specified, defaults to `comprehensive`.

### Token Efficiency

Based on research (thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md):
- QA workflows: -35% to -45% token usage
- Planner workflows: -31% to -41% token usage
- Researcher workflows: +13% tokens but eliminates duplicate file reads

### Code Excerpts

All execution steps include 1-6 line code excerpts in the exact format required by Researcher and Planner agents:

```markdown
* **Step 1**: Validates input (Line 12)
  * **Excerpt:**
    ```typescript
    const result = schema.validate(input);
    if (!result.success) throw new ValidationError();
    ```
```

This eliminates the need for consumer agents to re-read files to extract excerpts.
