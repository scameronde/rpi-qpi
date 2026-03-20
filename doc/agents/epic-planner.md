# epic-planner — Raw Notes

## Role
- Agent type: user-facing orchestrator (invoked via `/epic-planner` command)
- Persona name in prompt: "Epic Planner" / "Specification-to-Epic Decomposition"
- Purpose: Decompose a specification into implementation-ready epics — story-based, user-facing chunks of work that feed the Researcher and Planner.
- Scope: Third stage in the pipeline. Requires an approved specification as input. Cannot proceed without one.

## Core principle: Story-Based Decomposition (NOT Task-Based)
Each epic must represent a user-facing capability or system component — not a technical task.

- Good epic: "User Authentication System" (contains: registration, login, password reset, session management)
- Bad epic: ~~"Database Schema Creation"~~ (this is a task, not a story)

Epic size rule: should take 1-3 research reports + 1-5 implementation plans. Too big = "The Entire Application". Too small = "Add a validation function".

## What it does NOT do
- Does not search the codebase (Researcher will do that)
- Does not run bash commands
- Does not write implementation plans (Planner will do that)
- Does not proceed without a valid specification — hard stop with redirect to Specifier
- Does not accept incomplete specs — stops and recommends Specifier refinement

## Input
- Specification path or project name reference
- If no spec specified: asks user which spec to use
- Also optionally reads the linked mission statement for additional context

## Workflow: 4 phases

### Phase 1: Intake & Validation
1. Locates spec in `thoughts/shared/specs/` via Glob
2. Reads and validates spec completeness (architecture + data model + acceptance criteria required)
3. If incomplete → STOP, use AskUserQuestion to recommend Specifier refinement
4. Optionally reads the mission statement referenced in the spec for alignment context

### Phase 2: Decomposition Strategy
Uses `mcp__sequential-thinking__sequentialthinking` to determine:
1. What are the major functional areas (from spec components/workflows)?
2. What are the natural boundaries (what can be built independently)?
3. What is the logical sequence (what must come first due to dependencies)?

**Three decomposition approaches** (chosen based on spec structure):
- **By User Workflow** — epic per major user journey (e.g., "Onboarding Flow", "Reporting Dashboard")
- **By System Component** — epic per major architectural component (e.g., "Authentication Service")
- **By Feature Cluster** — epic per related set of capabilities (e.g., "User Profile Features")

### Phase 3: Epic Creation
For each identified epic:
1. Extract which spec components/workflows/data entities belong to it
2. Define 3-7 user stories (each: As a [role], I want to [action], So that [benefit])
3. Formulate research questions (both codebase context and external knowledge)
4. Define acceptance criteria (functional + technical + quality/testing)
5. Identify dependencies (prerequisite epics, concurrent epics, dependent epics)

**Three mandatory sections per epic:**
- Research Questions for Researcher
- Acceptance Criteria for Planner
- Dependencies on other epics

### Phase 4: Artifact Generation
Writes ONE file per epic: `thoughts/shared/epics/YYYY-MM-DD-[Epic-Name].md`

**Pre-write checklist (enforced):**
- [ ] Each epic has a cohesive, user-facing capability or system component
- [ ] Each epic has 3-7 user stories
- [ ] Research questions defined (Researcher can answer them)
- [ ] Acceptance criteria defined (Planner can use them)
- [ ] Dependencies between epics identified
- [ ] Each epic traces back to spec components/workflows
- [ ] Each epic traces back to mission capabilities
- [ ] All epics together fully cover the specification

## Output: one epic document per epic

### Document frontmatter
```yaml
date: YYYY-MM-DD
epic-planner: [identifier]
spec-source: "thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md"
epic-name: "[Epic Name]"
epic-id: "EPIC-001"
status: ready-for-research
dependencies: ["EPIC-XXX"] # or []
```

### Document sections
1. **Specification Reference** — source link + related spec components + originating mission capability
2. **Epic Summary** — what it delivers (2-4 sentences), value statement, scope (in/out)
3. **User Stories** — 3-7 stories in "As a / I want to / So that" format
4. **System Behaviors** — optional, for non-user-facing technical requirements
5. **Research Questions for Researcher** — codebase context, external knowledge, constraints/risks
6. **Acceptance Criteria for Planner** — functional criteria, technical criteria, quality/testing criteria
7. **Dependencies** — prerequisite epics, concurrent epics, dependent epics + Mermaid dependency diagram
8. **Data Model Requirements** — entities this epic creates/modifies (CRUD operations)
9. **External Interface Requirements** — UI views, API operations, external integrations
10. **Non-Functional Requirements** — performance, security, scalability, reliability
11. **Implementation Considerations** — suggested phases if large, known constraints, edge cases (hints for Planner, NOT prescriptive)
12. **Open Questions** — unresolved questions for user/Mission Architect/Specifier
13. **Verification Plan** — manual verification steps + automated testing (unit/integration/E2E)
14. **Traceability** — table mapping every story to spec component + mission capability + acceptance criteria

## Message envelope (agent-to-agent communication)
When delegated by another agent:
- `message_id`: `epic-planner-YYYY-MM-DD-NNN`
- `message_type`: `EPIC_RESPONSE`
- `epic_status`: `ready-for-research` | `in_progress`
- `epics_created`: number of epic documents created
- Plus `<thinking>` (decomposition strategy, dependency analysis, story granularity decisions) + `<answer>` (epic documents or progress update)

## Tools used
- `Read` (loads spec and optionally mission)
- `Glob` (finds specs or related epics)
- `AskUserQuestion` (ambiguity resolution, decomposition trade-offs, dependency sequencing)
- `Write` (creates one file per epic)
- `mcp__sequential-thinking__sequentialthinking` (decomposition decisions, dependency analysis, sequencing logic)

## Who invokes this agent

### `/epic-planner` command (direct user invocation)
- The only entry point for this agent
- Command passes user's request + spec reference as the task
- If no spec given, agent asks the user
- Command file: `.claude/commands/epic-planner.md`

## Position in workflow
- **Third stage** of the full pipeline: mission-architect → specifier → **epic-planner** → researcher → planner → implement
- **Input**: specification from `thoughts/shared/specs/` (required, hard-blocked without it)
- **Output**: one epic file per epic in `thoughts/shared/epics/` — each consumed by `researcher` (for investigation) and `planner` (for task sequencing)
- Bridge between specification layer (specifier) and execution layer (researcher → planner → implementor)
- Each epic's research questions directly feed the Researcher's investigation scope
- Each epic's acceptance criteria directly feed the Planner's done criteria
