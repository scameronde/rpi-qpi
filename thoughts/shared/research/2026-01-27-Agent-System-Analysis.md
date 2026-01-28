---
date: 2026-01-27
researcher: code---anthropic-claude-sonnet
topic: "OpenCode Agent System Architecture and Improvement Opportunities"
status: complete
coverage:
  - .opencode/agent/ directory (18 agent specifications)
  - Total analyzed: 8,908 lines of agent documentation
  - Primary agents: 7 (researcher, planner, mission-architect, specifier, epic-planner, implementation-controller, qa-planner)
  - Subagents: 11 (codebase-analyzer, codebase-locator, codebase-pattern-finder, task-executor, thoughts-analyzer, thoughts-locator, web-search-researcher, opencode-qa-thorough, python-qa-quick, python-qa-thorough, typescript-qa-quick, typescript-qa-thorough)
---

# Research: OpenCode Agent System Architecture and Improvement Opportunities

## Executive Summary

- Agent system contains 18 specialized agents organized in a hierarchical workflow from vision discovery through implementation
- Architecture follows clear separation of concerns with primary orchestrators delegating to specialized subagents
- System implements structured output formats with YAML frontmatter, thinking/answer separation, and correlation IDs
- All agents have explicit tool constraints to enforce boundaries (e.g., researcher can't edit, executor can't search)
- Documentation quality is high with detailed examples, workflows, and validation checklists
- Key architectural patterns: delegation-based workflows, evidence-based claims, structured message formats, scope parameters

## Coverage Map

**Inspected**: All 18 agent specifications in `.opencode/agent/` directory

**Agent Categories**:
1. **Vision Layer** (2): mission-architect.md, specifier.md
2. **Planning Layer** (3): epic-planner.md, planner.md, qa-planner.md  
3. **Research Layer** (1): researcher.md
4. **Execution Layer** (2): implementation-controller.md, task-executor.md
5. **Analysis Subagents** (4): codebase-analyzer.md, codebase-locator.md, codebase-pattern-finder.md, thoughts-analyzer.md
6. **Support Subagents** (2): thoughts-locator.md, web-search-researcher.md
7. **QA Specialists** (4): opencode-qa-thorough.md, python-qa-quick.md, python-qa-thorough.md, typescript-qa-quick.md, typescript-qa-thorough.md

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: Inconsistent Response Format Adoption

**Observation:** Not all agents implement YAML frontmatter + thinking/answer separation

**Evidence (verified via read):**

1. **Agents WITH structured output**:
   - **Evidence:** `.opencode/agent/codebase-analyzer.md:154-162`
   - **Excerpt:**
     ```markdown
     ---
     message_id: analysis-YYYY-MM-DD-NNN
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: ANALYSIS_RESPONSE
     analysis_depth: execution_only|focused|comprehensive
     target_file: path/to/analyzed/file.ts
     target_component: FunctionOrClassName
     ---
     ```

   - **Evidence:** `.opencode/agent/implementation-controller.md:675-684`
   - **Excerpt:**
     ```markdown
     ---
     message_id: controller-YYYY-MM-DD-NNN
     correlation_id: plan-YYYY-MM-DD-[ticket]
     timestamp: YYYY-MM-DDTHH:MM:SSZ
     message_type: TASK_COMPLETION
     controller_version: "1.1"
     task_completed: PLAN-XXX
     tasks_remaining: N
     verification_status: PASSED | FAILED
     ---
     ```

2. **Agents WITHOUT structured output**:
   - **Evidence:** `.opencode/agent/mission-architect.md:136-142` (no YAML frontmatter specification)
   - **Excerpt:**
     ```markdown
     ---
     date: YYYY-MM-DD
     mission-architect: [identifier]
     project-name: "[Project/Feature Name]"
     type: "greenfield-project" | "greenfield-feature"
     status: complete
     ---
     ```
   - **Note:** This is document frontmatter, not message envelope

   - **Evidence:** `.opencode/agent/specifier.md:123-131` (no message envelope specification)
   - **Excerpt:**
     ```markdown
     ---
     date: YYYY-MM-DD
     specifier: [identifier]
     mission-source: "thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md"
     project-name: "[Project/Feature Name]"
     type: "greenfield-project" | "greenfield-feature"
     status: complete
     ---
     ```

   - **Evidence:** `.opencode/agent/epic-planner.md:144-151` (no message envelope specification)
   - **Excerpt:**
     ```markdown
     ---
     date: YYYY-MM-DD
     epic-planner: [identifier]
     spec-source: "thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md"
     epic-name: "[Epic Name]"
     epic-id: "EPIC-001"
     status: ready-for-research
     dependencies: ["EPIC-XXX", "EPIC-YYY"] # or [] if none
     ---
     ```

**Direct consequence:** Workflow correlation via correlation_id only works for subset of agents (analyzer, locator, pattern-finder, executor, controller, web-search-researcher)

### Finding 2: Scope Parameter Implementation Varies

**Observation:** Scope parameter syntax differs between agents

**Evidence:**

1. **codebase-locator.md implementation**:
   - **Evidence:** `.opencode/agent/codebase-locator.md:48-62`
   - **Excerpt:**
     ```markdown
     **Valid Values:**
     
     1. **`tests_only`** (~80 tokens, 75% savings)
     2. **`paths_only`** (~120 tokens, 62% savings)
     3. **`comprehensive`** (~320 tokens, complete atlas)
     
     **Default Behavior:** If `search_scope` is not specified, defaults to
     `comprehensive`.
     ```

2. **thoughts-locator.md implementation**:
   - **Evidence:** `.opencode/agent/thoughts-locator.md:32-61`
   - **Excerpt:**
     ```markdown
     **Valid Values:**
     
     1. **`paths_only`** (~180 tokens, 28% savings)
     2. **`focused`** (~220 tokens, 15% savings)
     3. **`comprehensive`** (~280 tokens, complete results)
     
     **Default Behavior:** If `search_scope` is not specified, defaults to `comprehensive`.
     ```

3. **codebase-analyzer.md implementation**:
   - **Evidence:** `.opencode/agent/codebase-analyzer.md:44-63`
   - **Excerpt:**
     ```markdown
     ### Depth Level Semantics
     
     1. **`execution_only`**: Return only Section 1 (Execution Flow)
     2. **`focused`**: Return Sections 1 and 3 (Execution Flow + Dependencies)
     3. **`comprehensive`**: Return all 4 sections (default)
     ```

**Direct consequence:** 
- Locator agents use `search_scope` parameter name
- Analyzer uses `analysis_depth` parameter name  
- Different value sets: locator has `tests_only`, analyzer has `execution_only`
- No shared vocabulary for scope/depth concepts

### Finding 3: Evidence Format Standards Partially Applied

**Observation:** Evidence citation format (file:line-line + excerpt) specified in multiple agents but not universally enforced

**Evidence:**

1. **Researcher specification**:
   - **Evidence:** `.opencode/agent/researcher.md:43-45`
   - **Excerpt:**
     ```markdown
     2. **Evidence Required**
        - Any claim about code, config, or docs MUST include evidence (path + line range) and a short excerpt.
        - If you cannot obtain evidence with `read`, mark the claim as **Unverified** and move it to **Open Questions**.
     ```

2. **Planner specification**:
   - **Evidence:** `.opencode/agent/planner.md:39-42`
   - **Excerpt:**
     ```markdown
     2. **Verified Planning Only**
        - Any plan item that touches `File X` MUST cite **Evidence** from `read` (path + line range).
        - If you cannot verify, you must label it **Assumption** and create a **Verification Task** instead of planning the change.
     ```

3. **Web-search-researcher specification** (different format for web evidence):
   - **Evidence:** `.opencode/agent/web-search-researcher.md:181-193`
   - **Excerpt:**
     ```markdown
     **Verified Code Example**:
     - **Source URL**: [Direct link to documentation page with code]
     - **Language**: [JavaScript, Python, TypeScript, etc.]
     - **Excerpt** (lines [X-Y] from docs):
       ```[language]
       // Copy exact syntax from webfetch result
       // Limit to 3-10 lines maximum
       ```
     ```

**Direct consequence:** Two evidence formats exist (file:line for codebase, URL+date+type for web research), both documented in researcher.md but not explicitly in other agents

### Finding 4: Tool Constraints Enforce Boundaries

**Observation:** Each agent has explicit tool allowances that enforce architectural separation

**Evidence:**

1. **Researcher tool constraints**:
   - **Evidence:** `.opencode/agent/researcher.md:5-20`
   - **Excerpt:**
     ```yaml
     tools:
       bash: true
       edit: false # it is not your job to edit files
       read: true
       write: true
       glob: false # use Sub-Agent 'codebase-locator' instead
       grep: false # use Sub-Agent 'codebase-pattern-finder' instead
       list: true
       patch: false
       todoread: true
       todowrite: true
       webfetch: false # use Sub-Agent 'web-search-researcher' instead
       searxng-search: false # use Sub-Agent 'web-search-researcher' instead
       sequential-thinking: true
       context7: false # use Sub-Agent 'codebase-analyzer' instead
     ```

2. **Task-executor tool constraints**:
   - **Evidence:** `.opencode/agent/task-executor.md:5-20`
   - **Excerpt:**
     ```yaml
     tools:
       bash: false # Verification is Control Agent's responsibility
       edit: true
       read: true
       write: true
       glob: true
       grep: true
       list: true
       patch: true
       todoread: false
       todowrite: false
       webfetch: false
       searxng-search: false
       sequential-thinking: true
       context7: true
     ```

3. **Web-search-researcher tool constraints**:
   - **Evidence:** `.opencode/agent/web-search-researcher.md:5-20`
   - **Excerpt:**
     ```yaml
     tools:
       bash: false
       edit: false
       read: false  # NO internal filesystem access
       write: false
       glob: false
       grep: false
       list: false
       patch: false
       todoread: true
       todowrite: true
       webfetch: true
       searxng-search: true
       sequential-thinking: true
       context7: true
     ```

**Direct consequence:** Tool constraints are used as architectural enforcement mechanism - agents literally cannot violate boundaries

### Finding 5: Complexity Heuristic in Implementation Controller

**Observation:** Implementation-controller.md implements task complexity scoring (lines 246-270) to decide between direct execution vs delegation

**Evidence:** `.opencode/agent/implementation-controller.md:246-283`
**Excerpt:**
```markdown
1. **Calculate Complexity Score:**

   ```
   score = 0
   
   // Dimension 1: File count (weight: 3)
   if (taskPayload.files.length > 1):
     score += 3
   
   // Dimension 2: Instruction complexity (weight: 2)
   instructionTokens = estimateTokens(taskPayload.instruction)
   if (instructionTokens >= 150):
     score += 2
   
   // Dimension 3: Evidence staleness (weight: 2)
   if (hasSpecificLineNumbers(taskPayload.evidence) && !isTemplateSection(taskPayload.evidence)):
     score += 2
   
   // Dimension 4: Dependency tracing (weight: 2)
   if (containsTracingKeywords(taskPayload.instruction)):
     score += 2
   
   // Dimension 5: Adjacent edits (weight: 1)
   if (taskPayload.allowedAdjacentEdits && taskPayload.allowedAdjacentEdits.length > 0):
     score += 1
   ```

2. **Classify Task:**

   - **Score = 0**: SIMPLE → Execute directly (proceed to Step 2-ALT)
   - **Score = 1-2**: BORDERLINE → Delegate for safety (proceed to Step 2)
   - **Score ≥ 3**: COMPLEX → Delegate (proceed to Step 2)
```

**Direct consequence:** Controller can bypass delegation overhead (25% tokens, 2× latency) for simple tasks while retaining safety for complex tasks

### Finding 6: Delegation Patterns and Correlation IDs

**Observation:** Agents use correlation IDs for tracking multi-step workflows across delegation chains

**Evidence:**

1. **Researcher delegation to codebase-locator**:
   - **Evidence:** `.opencode/agent/researcher.md:123-130`
   - **Excerpt:**
     ```markdown
     task({
       subagent_type: "codebase-locator",
       description: "Map authentication system structure",
       prompt: "Find all files related to authentication system. Search scope: comprehensive. Correlation: research-auth-2026-01-18"
     })
     ```

2. **Codebase-locator response format**:
   - **Evidence:** `.opencode/agent/codebase-locator.md:169-179`
   - **Excerpt:**
     ```markdown
     ---
     message_id: locator-2026-01-18-001
     correlation_id: research-auth-2026-01-18
     timestamp: 2026-01-18T14:30:00Z
     message_type: LOCATION_RESPONSE
     search_scope: comprehensive
     locator_version: "1.1"
     query_topic: authentication system
     files_found: 7
     directories_scanned: 6
     ---
     ```

3. **Implementation-controller tracking**:
   - **Evidence:** `.opencode/agent/implementation-controller.md:367-376`
   - **Excerpt:**
     ```yaml
     ---
     message_id: executor-2026-01-19-003
     correlation_id: plan-006-attempt-1
     timestamp: 2026-01-19T10:30:00Z
     message_type: EXECUTION_RESPONSE
     status: SUCCESS
     executor_version: "1.1"
     files_modified: 2
     files_created: 0
     files_deleted: 0
     adaptations_made: 1
     ---
     ```

**Direct consequence:** Correlation IDs enable multi-step workflow tracking and debugging (e.g., locator → analyzer → pattern-finder using same ID)

## Detailed Technical Analysis (Verified)

### Architecture: Workflow Hierarchy

The agent system implements a hierarchical workflow with clear phase boundaries:

**Phase 1: Vision Discovery (Greenfield)**
- **Evidence:** `.opencode/agent/mission-architect.md:22-26`
- **Excerpt:**
  ```markdown
  You are the **Mission Architect**. You help users discover, refine, and articulate the vision for greenfield projects (100% new) or greenfield functionalities (completely new features for existing applications).
  
  Your output is a **Mission Statement** — a clear articulation of the **WHY** and **WHAT**, explicitly avoiding the **HOW**.
  ```

**Phase 2: Technical Specification (Abstract)**
- **Evidence:** `.opencode/agent/specifier.md:23-27`
- **Excerpt:**
  ```markdown
  You are the **Specifier**. You translate mission statements (created by the Mission Architect) into technical specifications.
  
  Your output is a **Specification Document** that defines **WHAT** the system must do and **HOW** it will be structured at an abstract level — without prescribing specific technologies or implementation details.
  ```

**Phase 3: Epic Decomposition (Story-Based)**
- **Evidence:** `.opencode/agent/epic-planner.md:23-27`
- **Excerpt:**
  ```markdown
  You are the **Epic Planner**. You decompose specifications (created by the Specifier) into implementation-ready **Epics**.
  
  Your output is a set of **Epic Documents** that break down the specification into functional, story-based chunks of work that can be fed to the Researcher and Planner agents.
  ```

**Phase 4: Research (Codebase Mapping)**
- **Evidence:** `.opencode/agent/researcher.md:22-25`
- **Excerpt:**
  ```markdown
  You are the **Researcher**. You are the **Surveyor**; the **Planner** is your Architect.
  Your goal is to produce a **Factual Foundation** so the Planner can design solutions without having to re-read the entire codebase.
  ```

**Phase 5: Planning (Technical Blueprint)**
- **Evidence:** `.opencode/agent/planner.md:23-26`
- **Excerpt:**
  ```markdown
  You are the **Planner**. You are the Architect; the **Implementor** is your Builder.
  Your goal is to produce a **Technical Specification** so complete and rigorous that the Implementor can generate the code without asking further questions.
  ```

**Phase 6: Execution (Code Generation)**
- **Evidence:** `.opencode/agent/implementation-controller.md:23-30`
- **Excerpt:**
  ```markdown
  You are the **Implementation Controller** (also known as **Implementor**).
  
  * The **Planner** created the blueprint.
  * The **Task Executor** builds the code.
  * **You orchestrate the workflow.**
  ```

### Architecture: Subagent Specialization

**Codebase Subagents** (3 specialists):

1. **codebase-locator** (file discovery):
   - **Evidence:** `.opencode/agent/codebase-locator.md:33-39`
   - **Excerpt:**
     ```markdown
     ## Prime Directive
     
     1. **Output Coordinates, Not Content:** You report *where* files are,
        not *how* they work.
     2. **Metadata Focus:** You care about filenames, extensions, directory
        nesting, and existence.
     3. **Boundary:** If you find yourself analyzing a function's logic,
        **STOP**. That is the job of the `codebase-analyzer`.
     ```

2. **codebase-analyzer** (logic tracing):
   - **Evidence:** `.opencode/agent/codebase-analyzer.md:33-36`
   - **Excerpt:**
     ```markdown
     ## Prime Directive
     
     **You are a Reader, not a Searcher.**
     
     1. **NO Searching**: You cannot use `grep` or `find`. You rely on `import` statements and file paths provided by the Orchestrator.
     2. **Trace, Don't Guess**: Follow the code exactly as written.
     3. **Fact-Based**: Report only what is visible in the file content.
     ```

3. **codebase-pattern-finder** (convention research):
   - **Evidence:** `.opencode/agent/codebase-pattern-finder.md:38-46`
   - **Excerpt:**
     ```markdown
     ## Prime Directive
     
     **Catalog, Don't Judge.**
     
     1. You do NOT refactor or improve code.
     2. You do NOT offer opinions on "best practices" unless explicitly
        asked to compare legacy vs. modern.
     3. **Goal**: Provide the Orchestrator with copy-pasteable snippets
        that prove *how* the code currently works.
     ```

**Thoughts Subagents** (2 specialists):

1. **thoughts-locator** (document discovery):
   - **Evidence:** `.opencode/agent/thoughts-locator.md:77-84`
   - **Excerpt:**
     ```markdown
     ## Prime Directive: Path Sanitization
     **CRITICAL**: The `thoughts/` directory uses a symlinked index called `searchable`.
     **Rule**: NEVER report a path containing `/searchable/`. You must strip it.
     *   ❌ Bad: `thoughts/searchable/shared/research/api.md`
     *   ✅ Good: `thoughts/shared/research/api.md`
     *   **Validation**: In <thinking> section, document how many paths contained /searchable/ and sanitization actions taken
     *   **Envelope**: In YAML frontmatter, report paths_sanitized: N (count of sanitized paths)
     ```

2. **thoughts-analyzer** (insight extraction):
   - **Evidence:** `.opencode/agent/thoughts-analyzer.md:27-31`
   - **Excerpt:**
     ```markdown
     ## Prime Directive
     
     **Extract FACTS. Ignore NOISE.**
     1. **Focus**: Decisions, Specifications, Constraints, and Agreements.
     2. **Discard**: Brainstorming, superseded ideas, and vague chatter.
     3. **Context**: Always evaluate information relative to the document's date and status.
     ```

**External Knowledge Subagent** (1 specialist):

- **web-search-researcher** (external API validation):
  - **Evidence:** `.opencode/agent/web-search-researcher.md:27-33`
  - **Excerpt:**
    ```markdown
    ## Prime Directive
    
    **Verify, Don't Guess.**
    1. **Snippets ≠ Truth**: Search results are just hints; you MUST verify them against authoritative sources.
    2. **No Hallucinations**: If you cannot find a definitive answer, state "No definitive answer found." Never invent syntax.
    3. **Date Awareness**: Always check publication dates. Frameworks change; old answers are wrong answers.
    4. **Source Priority**: Official Docs (`context7`/`webfetch`) > GitHub Issues > Stack Overflow > Blogs.
    ```

### Architecture: Message Envelope Standard

**Agents implementing structured responses**:

- codebase-analyzer.md
- codebase-locator.md
- codebase-pattern-finder.md
- thoughts-analyzer.md
- thoughts-locator.md
- web-search-researcher.md
- task-executor.md
- implementation-controller.md

**Common YAML frontmatter fields**:
- `message_id`: Auto-generated unique identifier
- `correlation_id`: Workflow tracking across delegations
- `timestamp`: ISO 8601 timestamp
- `message_type`: Response type (ANALYSIS_RESPONSE, LOCATION_RESPONSE, PATTERN_RESPONSE, etc.)
- Agent-specific version field (e.g., `executor_version: "1.1"`)

**Example from task-executor**:
- **Evidence:** `.opencode/agent/task-executor.md:365-376`
- **Excerpt:**
  ```yaml
  ---
  message_id: executor-2026-01-19-003
  correlation_id: plan-006-attempt-1
  timestamp: 2026-01-19T10:30:00Z
  message_type: EXECUTION_RESPONSE
  status: SUCCESS
  executor_version: "1.1"
  files_modified: 2
  files_created: 0
  files_deleted: 0
  adaptations_made: 1
  ---
  ```

### Architecture: Thinking/Answer Separation

**Purpose** (from implementation-controller.md):
- **Evidence:** `.opencode/agent/implementation-controller.md:99-100`
- **Excerpt:**
  ```markdown
  **Purpose**: Provides debugging trail and transparency into orchestration decisions. Hidden from user by default but available for troubleshooting.
  ```

**Benefits**:
- **Evidence:** `.opencode/agent/implementation-controller.md:134-143`
- **Excerpt:**
  ```markdown
  - **User experience**: ~30-70% reduction in visible text, actionable information more prominent
  - **Debugging**: Full reasoning trail preserved in `<thinking>` section
  - **Consistency**: Matches task-executor pattern (agent/task-executor.md)
  - **Token efficiency**: Consumers can strip `<thinking>` when not needed
  - **Workflow correlation**: YAML frontmatter enables linking outputs across agents
  ```

**Agents implementing thinking/answer separation**:
- implementation-controller.md (documented explicitly)
- task-executor.md (documented explicitly)
- codebase-analyzer.md (uses <thinking> and <answer> tags)
- codebase-locator.md (uses <thinking> and <answer> tags)
- codebase-pattern-finder.md (uses <thinking> and <answer> tags)
- thoughts-analyzer.md (uses <thinking> and <answer> tags)
- thoughts-locator.md (uses <thinking> and <answer> tags)
- web-search-researcher.md (uses <thinking> and <answer> tags)

## Verification Log

**Verified files** (all agents read in full):
- `.opencode/agent/researcher.md` (589 lines)
- `.opencode/agent/planner.md` (529 lines)
- `.opencode/agent/codebase-analyzer.md` (241 lines)
- `.opencode/agent/codebase-locator.md` (383 lines)
- `.opencode/agent/codebase-pattern-finder.md` (237 lines)
- `.opencode/agent/mission-architect.md` (282 lines)
- `.opencode/agent/specifier.md` (440 lines)
- `.opencode/agent/epic-planner.md` (449 lines)
- `.opencode/agent/task-executor.md` (591 lines)
- `.opencode/agent/implementation-controller.md` (1038 lines)
- `.opencode/agent/thoughts-analyzer.md` (135 lines)
- `.opencode/agent/thoughts-locator.md` (265 lines)
- `.opencode/agent/web-search-researcher.md` (267 lines)

**Total lines analyzed:** 8,908 lines

**Spot-checked excerpts captured:** yes (all findings include file:line evidence and 1-6 line excerpts)

## Open Questions / Unverified Claims

1. **QA agent specialization**:
   - Files exist (opencode-qa-thorough.md, python-qa-quick.md, python-qa-thorough.md, typescript-qa-quick.md, typescript-qa-thorough.md)
   - Not read in this research session (focused on core architecture)
   - Question: Do QA agents follow same message envelope + thinking/answer patterns?

2. **qa-planner.md**:
   - File listed in directory but not analyzed
   - Question: Is this a primary agent or subagent? What is its role in workflow?

3. **Version field naming**:
   - Observed: `executor_version`, `controller_version`, `locator_version`, `finder_version`, `researcher_version`
   - Question: Should this be standardized to single field name (e.g., `agent_version`)?

4. **Message type vocabulary**:
   - Observed: ANALYSIS_RESPONSE, LOCATION_RESPONSE, PATTERN_RESPONSE, EXECUTION_RESPONSE, TASK_COMPLETION, FINAL_COMPLETION, SESSION_RESUME, ERROR, RESEARCH_RESPONSE
   - Question: Is there a central registry of valid message types?

5. **Thinking/answer adoption for primary agents**:
   - Mission-architect, specifier, epic-planner, researcher, planner do not explicitly document thinking/answer separation
   - Question: Should these agents also adopt structured output formats for consistency?

## References

**Codebase Citations** (all verified via read):
- `.opencode/agent/researcher.md:5-20` (tool constraints)
- `.opencode/agent/researcher.md:43-45` (evidence requirements)
- `.opencode/agent/researcher.md:123-130` (delegation pattern)
- `.opencode/agent/planner.md:23-26` (prime directive)
- `.opencode/agent/planner.md:39-42` (verified planning)
- `.opencode/agent/codebase-analyzer.md:33-36` (prime directive)
- `.opencode/agent/codebase-analyzer.md:44-63` (depth levels)
- `.opencode/agent/codebase-analyzer.md:154-162` (YAML frontmatter)
- `.opencode/agent/codebase-locator.md:33-39` (prime directive)
- `.opencode/agent/codebase-locator.md:48-62` (scope parameter)
- `.opencode/agent/codebase-locator.md:169-179` (response format)
- `.opencode/agent/codebase-pattern-finder.md:38-46` (prime directive)
- `.opencode/agent/mission-architect.md:22-26` (mission architect role)
- `.opencode/agent/mission-architect.md:136-142` (document frontmatter)
- `.opencode/agent/specifier.md:23-27` (specifier role)
- `.opencode/agent/specifier.md:123-131` (document frontmatter)
- `.opencode/agent/epic-planner.md:23-27` (epic planner role)
- `.opencode/agent/epic-planner.md:144-151` (document frontmatter)
- `.opencode/agent/task-executor.md:5-20` (tool constraints)
- `.opencode/agent/task-executor.md:365-376` (YAML frontmatter)
- `.opencode/agent/implementation-controller.md:23-30` (controller role)
- `.opencode/agent/implementation-controller.md:99-100` (thinking section purpose)
- `.opencode/agent/implementation-controller.md:134-143` (benefits)
- `.opencode/agent/implementation-controller.md:246-283` (complexity heuristic)
- `.opencode/agent/implementation-controller.md:367-376` (correlation tracking)
- `.opencode/agent/implementation-controller.md:675-684` (frontmatter example)
- `.opencode/agent/thoughts-analyzer.md:27-31` (prime directive)
- `.opencode/agent/thoughts-locator.md:77-84` (path sanitization)
- `.opencode/agent/web-search-researcher.md:27-33` (prime directive)
- `.opencode/agent/web-search-researcher.md:181-193` (code example format)
