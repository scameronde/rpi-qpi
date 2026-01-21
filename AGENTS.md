# Agent Guidelines for RPIQPI Project

## Build/Lint/Test Commands
- No package.json found - this is a configuration-only OpenCode project
- No test suite configured - verify changes manually or via OpenCode's built-in validation

## Agent Communication Patterns

### Thinking/Answer Separation for User-Facing Outputs

Primary agents that communicate directly with users should separate operational reasoning from actionable results using a structured three-part format:

#### Pattern Structure

```markdown
<thinking>
[Document decision-making process, file reads, parsing, analysis, verification reasoning]
</thinking>

<answer>
---
[YAML frontmatter with message_id, correlation_id, status fields]
---

[User-facing status and actionable information]
</answer>
```

#### Agents Using This Pattern

- **task-executor** (`agent/task-executor.md`): Documents task execution reasoning (parsing, verification, strategy, execution, adaptations)
- **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning (task extraction, delegation, parsing, verification, commit)
- **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning (implemented per research 2026-01-18)
- **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning (implemented per research 2026-01-18)
- **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning (implemented per research 2026-01-18)
- **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning (tool execution, file reads, prioritization decisions)
- **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
- **python-qa-thorough** (`agent/python-qa-thorough.md`): Documents comprehensive Python QA reasoning (tool execution, manual analysis, prioritization decisions)
- **typescript-qa-quick** (`agent/typescript-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
- **typescript-qa-thorough** (`agent/typescript-qa-thorough.md`): Documents comprehensive TypeScript QA reasoning (tool execution, manual analysis, prioritization decisions)
- **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning

#### Benefits

- **Users see only actionable information**: ~30-70% reduction in visible text depending on agent type
- **Full reasoning trail available for debugging**: Inspect `<thinking>` section when outputs are unexpected
- **Consistent structure across agent outputs**: All primary agents use same format
- **Workflow correlation via YAML frontmatter**: `message_id` and `correlation_id` enable tracing outputs across agents
- **Token optimization**: Consumers can strip `<thinking>` section when passing results downstream (~10% savings)

#### Token Impact

- **Cost**: +10-16% tokens per output (thinking overhead + frontmatter metadata)
- **Benefit**: User experience improvement, debugging capability, cross-agent consistency
- **Trade-off**: Accept modest token cost for significant UX and maintainability benefits

#### Research References

- `thoughts/shared/research/2026-01-21-Python-QA-Quick-Agent-Communication.md` (python-qa-quick communication pattern analysis)
- `thoughts/shared/research/2026-01-21-TypeScript-QA-Quick-Agent-Communication.md` (typescript-qa-quick communication pattern analysis)
- `thoughts/shared/research/2026-01-21-Python-QA-Thorough-Agent-Communication.md` (python-qa-thorough communication pattern analysis)
- `thoughts/shared/research/2026-01-21-TypeScript-QA-Thorough-Agent-Communication.md` (typescript-qa-thorough communication pattern analysis)
- `thoughts/shared/research/2026-01-19-Implementation-Controller-User-Communication-Verbosity.md` (implementation-controller analysis)
- `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (baseline research, industry best practices)
- `thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md` (locator-specific optimization)
- `thoughts/shared/research/2026-01-18-Codebase-Pattern-Finder-Agent-Communication.md` (pattern-finder optimization)

Industry sources:
- Anthropic Multi-Agent Research System (June 2025): "Use `<thinking>` tags for reasoning"
- Anthropic Chain-of-Thought Documentation (Current): "Structured CoT with XML tags most efficient for agent communication"

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

## Historical Document Analysis Workflow

### Two-Agent Pattern: thoughts-locator → thoughts-analyzer

For researching historical decisions, specifications, and constraints from past documentation:

1. **thoughts-locator**: Finds relevant documents in `thoughts/` directory by topic/keyword
2. **thoughts-analyzer**: Extracts decisions, constraints, and specifications with evidence (path:line + excerpt)

### Consumer Agents

- **Researcher**: Uses thoughts-locator (with scope parameter) + thoughts-analyzer when researching features with historical context
- **Planner**: Uses thoughts-analyzer to extract decisions from known specification documents

### Output Formats

#### thoughts-locator Output

thoughts-locator returns structured document discovery with:
- YAML frontmatter (message_id, correlation_id, timestamp, message_type, search_scope, locator_version, query_topic, documents_found, categories_searched, paths_sanitized)
- <thinking> section (search strategy, commands used, match counts, sanitization actions)
- <answer> section (categorized file paths by document type)

Supports three scope levels: paths_only, focused, comprehensive (default)

See `agent/researcher.md` for delegation examples and `agent/thoughts-locator.md` for complete template.

#### thoughts-analyzer Output

thoughts-analyzer returns structured analysis with:
- YAML frontmatter (message_id, correlation_id, document metadata)
- <thinking> section (analysis reasoning)
- <answer> section (metadata, extracted signals with excerpts, verification notes)

See `agent/researcher.md` for delegation examples.

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
   - Returns structured results with YAML frontmatter and thinking/answer separation
   - **Total context: ~250 lines** (vs ~730 lines in monolithic approach)
   - **Token impact**: +10-13% for typical tasks, net improvement for adapted tasks due to eliminated duplicate reads

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
   - Returns structured response with:
     - **YAML frontmatter**: message_id, task_id, status, files_modified, adaptations_made
     - **<thinking> section**: Implementation reasoning and decision process
     - **<answer> section**: Structured task report with changes, adaptations, and verification readiness
   - Reports SUCCESS/BLOCKED/FAILED in YAML frontmatter status field

4. **Controller** handles executor response:
   - Parses YAML frontmatter for status
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

## Codebase-Locator Output Format and Scope Levels

The codebase-locator subagent supports three scope levels to optimize token usage:

### Scope Levels

1. **tests_only** (~20 tokens, 76% savings)
   - Use case: QA agents needing test file paths for coverage analysis
   - Sections: Testing Coordinates only

2. **paths_only** (~25 tokens, 70% savings)
   - Use case: Targeted file discovery (agent/skill files, source files only)
   - Sections: Primary Implementation only

3. **comprehensive** (~83 tokens, complete topology)
   - Use case: Researcher/Planner agents needing full system map
   - Sections: All 4 (Primary Implementation, Related Configuration, Testing Coordinates, Directory Structure)

### Output Structure

All responses include:
- YAML frontmatter (message_id, correlation_id, timestamp, search_scope, files_found, etc.)
- `<thinking>` section (search strategy and reasoning)
- `<answer>` section (structured findings with file paths)
- Role metadata on file paths ([entry-point], [secondary], [config], [exports: N])

### Specifying Scope

Include `Search scope: [level]` in the task prompt:

```
task({
  subagent_type: "codebase-locator",
  description: "Find test files",
  prompt: "Find test files for src/auth/login.py. Search scope: tests_only"
})
```

If not specified, defaults to `comprehensive`.

### Token Efficiency

Based on research (thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md):
- QA workflows: -76% token usage with tests_only scope
- Targeted discovery: -70% token usage with paths_only scope
- Researcher/Planner workflows: 0% change with comprehensive scope (but gains entry point detection and debugging)

### Role Metadata

File paths include role metadata to eliminate ambiguity:

```markdown
### Primary Implementation
- `src/features/auth/AuthService.ts` [entry-point, exports: 5]
- `src/features/auth/AuthController.ts` [secondary, exports: 3]

### Related Configuration
- `config/auth.yaml` [config]
```

This eliminates the need for follow-up queries to determine which file is the "main" entry point.

### Complete Example (tests_only scope)

```markdown
---
message_id: locator-2026-01-18-001
correlation_id: qa-auth-coverage
timestamp: 2026-01-18T14:30:00Z
message_type: LOCATION_RESPONSE
search_scope: tests_only
locator_version: "1.1"
query_topic: authentication test files
files_found: 2
directories_scanned: 1
---

<thinking>
Search strategy for authentication test files:
- Used glob pattern: tests/**/*auth*.spec.ts
- Found 2 matches in tests/integration/
- Scope: tests_only (returning Section 3 only)
</thinking>

<answer>
## Coordinates: Authentication Tests

### Testing Coordinates
- `tests/integration/auth.spec.ts`
- `tests/integration/auth-permissions.spec.ts`
</answer>
```

## Codebase-Pattern-Finder Output Format and Usage

The codebase-pattern-finder subagent uses a three-part response structure:

### Response Structure

1. **YAML Frontmatter** (message envelope with search metadata):
   - `message_id`, `correlation_id`, `timestamp`, `message_type`
   - Search metadata: `patterns_found`, `variations_total`, `files_matched`, `files_scanned`, `search_keywords`
   - Use for workflow correlation and search completeness validation

2. **<thinking> Section** (search strategy and debugging):
   - Documents keywords, grep commands, match counts, file reads
   - Inspect when results seem incomplete or unexpected
   - Strip when passing findings to downstream agents (token optimization)

3. **<answer> Section** (pattern findings):
   - Variable number of variations (scales with findings)
   - Each variation: Location, Frequency (quantified), Code snippet with context
   - Distribution Notes: Standard vs legacy usage statistics

### Code Excerpts

Pattern-finder output includes actual code excerpts with context (imports, class wrappers), not just descriptions. This eliminates the need for consumer agents to re-read files for evidence.

### Frequency Metrics

Frequency uses quantified format: `Dominant (10/12 files, 83%)` instead of vague "High/Low" labels. Use this for data-driven decisions about which pattern to follow.

### When to Use Each Research Subagent

- **codebase-locator**: Find file paths and entry points
  - Use when: "Where is feature X implemented?"
  - Output: File paths, directory structure
  - Scope levels: tests_only, paths_only, comprehensive

- **codebase-analyzer**: Trace execution flow and logic
  - Use when: "How does function X work?"
  - Output: Execution steps, data model, dependencies, edge cases
  - Depth levels: execution_only, focused, comprehensive

- **codebase-pattern-finder**: Discover implementation patterns and conventions
  - Use when: "How is concept X implemented across the codebase?"
  - Output: Code snippets showing all variations with usage statistics
  - Variable output: Scales naturally with findings (no scope levels needed)

- **web-search-researcher**: Research external libraries and APIs
  - Use when: "What's the current API syntax for library X?"
  - Output: Verified documentation with code examples and version info
  - Citation format: URL-based (not file:line)

### Token Efficiency

Pattern-finder's variable template design eliminates the fixed verbosity problem:
- 1 variation: ~250 tokens
- 2-3 variations (typical): ~400-600 tokens
- 5+ variations (complex): ~1000+ tokens
- No wasted sections (unlike locator's 76% waste or analyzer's 60-70% waste for focused queries)

## Web-Search-Researcher Output Format and Usage

The web-search-researcher subagent provides verified external knowledge (library APIs, best practices, error resolution) using a three-part structured response.

### Response Structure

All responses include:
- **YAML frontmatter** (message envelope with correlation_id, sources_found, confidence, search_tools_used)
- **`<thinking>` section** (search strategy, queries executed, verification steps - for debugging)
- **`<answer>` section** (structured findings with 5 sections)

### Output Sections

1. **Quick Answer** (~50-100 tokens)
   - Direct, actionable summary
   - Use case: Fast reference without reading full report

2. **Source 1..N** (variable count, ~150-300 tokens each)
   - YAML metadata: url, type, date, version, authority
   - Key Findings (prose explanation)
   - Verified Code Example (with source URL, language, line numbers)

3. **Confidence Score** (~20-30 tokens)
   - HIGH | MEDIUM | LOW | NONE
   - Reasoning (why this confidence level)

4. **Version Compatibility** (~50-75 tokens)
   - Version range
   - Breaking changes notes

5. **Warnings** (~50-100 tokens)
   - Deprecations, experimental features, common pitfalls

### Source Type Vocabulary

- `official_docs`: Framework/library official documentation (authority: high)
- `github_issue`: GitHub issues, PRs, discussions (authority: medium)
- `stackoverflow`: Stack Overflow Q&A (authority: medium)
- `blog`: Technical blogs and articles (authority: low)
- `academic_paper`: Research papers, arXiv preprints (authority: high for theory)
- `community_forum`: Reddit, Discord, forums (authority: low)

### Citation Format

When citing web research in reports/plans, use URL-based format:

```markdown
* **Evidence (Web Research):** https://docs.example.com/api/v3
* **Date:** 2025-12 (verified current as of 2026-01-19)
* **Type:** official_docs (authority: high)
* **Excerpt:**
  ```javascript
  const example = apiCall();
  ```
```

This differs from codebase citations (`path/to/file.ext:line-line`) but maintains same evidence structure (source + excerpt).

### When to Use web-search-researcher

- **Library APIs**: External library syntax, configuration, best practices
- **Error Resolution**: Specific error messages and solutions
- **Version Compatibility**: Breaking changes, migration guides
- **Best Practices**: Current community recommendations

### When to Use context7 Instead

- **Well-supported libraries**: Faster RAG-based lookups for stable libraries
- **Quick syntax checks**: Simple API reference lookups
- **Trade-off**: context7 may have stale data for rapidly evolving libraries

### Delegation Pattern

```
task({
  subagent_type: "web-search-researcher",
  description: "Research library API patterns",
  prompt: "Research [library] [version] [specific aspect]. Focus on official documentation. Correlation: [workflow-id]"
})
```

### Response Parsing

1. **Quick validation**: Check YAML frontmatter `confidence` field
2. **Debugging**: Inspect `<thinking>` if results seem incomplete
3. **Extract findings**: Parse `<answer>` sections for citations
4. **Handle "no results"**: Response maintains same structure with Quick Answer = "⚠️ **No Definitive Answer Found**"

### Token Efficiency

- Average response: ~600-900 tokens (2 sources)
- Frontmatter overhead: +50 tokens (+6%)
- Thinking overhead: +100 tokens (+13%)
- **Trade-off**: +16% tokens for reliability and debugging capability
- Consumers can strip `<thinking>` section if not needed (-13% net)
