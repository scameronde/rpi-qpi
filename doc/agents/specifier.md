# specifier — Raw Notes

## Role
- Agent type: user-facing orchestrator (invoked via `/specifier` command)
- Persona name in prompt: "Specifier" / "Mission-to-Specification Translator"
- Purpose: Translate a mission statement into a technical specification — defines WHAT and abstract HOW without prescribing specific technologies or implementation details.
- Scope: Second stage in the pipeline. Requires an approved mission statement as input. Cannot proceed without one.

## Core principle: Abstract Architecture
The specifier operates between vision (mission) and execution (epic planner). It defines system components, data models, and contracts at a conceptual level — multiple valid technology implementations must remain possible after reading the spec.

Technology-agnostic rule:
- Allowed: "A persistent data store", "A user-facing interface", "An event notification system"
- Forbidden: "PostgreSQL", "React SPA", "RabbitMQ", REST/GraphQL (unless describing abstract patterns, not implementations)

## What it does NOT do
- Does not search the codebase (Planner handles integration with existing code)
- Does not run bash commands
- Does not delegate to external research agents
- Does not invent new requirements — only derives spec from mission content
- Does not specify technology stacks, frameworks, languages, or databases
- Does not proceed without a valid mission statement — hard stop with redirect to Mission Architect

## Input
- Mission statement path or project name reference
- If no mission specified: asks user which mission to use
- Validates mission completeness before proceeding (vision + audience + 3-7 capabilities + non-goals + success criteria must all be present)

## Workflow: 3 phases

### Phase 1: Intake & Validation
1. Locates mission in `thoughts/shared/missions/` via Glob
2. Reads and validates mission completeness (all 5 required sections)
3. If incomplete → STOP, use AskUserQuestion to recommend Mission Architect refinement
4. Extracts:
   - Essential capabilities → system components & behaviors
   - Success criteria → abstract acceptance tests
   - Constraints → non-functional requirements
   - Non-goals → scope boundaries

### Phase 2: Specification Synthesis
Answers these structural questions:
- What are the major system components?
- How do they interact (data flows, control flows, event triggers)?
- What are the key entities and relationships (abstract data model)?
- What are the external interfaces (user interactions, external systems)?
- What are the non-functional requirements (performance, security, scalability)?

Uses `mcp__sequential-thinking__sequentialthinking` for complex architectural decisions:
- "Should this be event-driven or request-driven?"
- "What are the boundaries between components?"
- "What data needs to be shared vs. isolated?"

Uses `AskUserQuestion` when mission is ambiguous or architectural trade-offs require user input.

### Phase 3: Artifact Generation
Writes spec to `thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md`.

**Pre-write checklist (enforced):**
- [ ] Every essential capability from mission traces to spec components/workflows
- [ ] No technology choices specified
- [ ] At least one Mermaid diagram for architecture or data flow
- [ ] Data model defines entities and relationships, NOT database schemas
- [ ] API contracts define behavior, NOT HTTP endpoints or serialization formats
- [ ] Non-functional requirements extracted from mission constraints
- [ ] Acceptance criteria are testable and trace back to mission

## Output: specification document

### Document frontmatter
```yaml
date: YYYY-MM-DD
specifier: [identifier]
mission-source: "thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md"
project-name: "[Project/Feature Name]"
type: "greenfield-project" | "greenfield-feature"
status: complete
```

### Document sections
1. **Mission Reference** — source link + value proposition + capabilities list (traceability anchor)
2. **System Overview** — high-level description, key responsibilities, system boundaries (in/out of scope)
3. **Architecture (Conceptual)** — Mermaid component diagram + each component's purpose/responsibilities/interactions (3-7 components)
4. **Data Flow** — Mermaid sequence diagram per essential capability + narrative description
5. **Data Model (Abstract)** — entities with conceptual attributes + Mermaid ERD
6. **External Interfaces** — user interface contract + external system integrations + API contracts (abstract)
7. **Non-Functional Requirements** — performance, scalability, security, reliability, usability
8. **Acceptance Criteria** — testable conditions per capability (feeds Epic Planner)
9. **Assumptions & Design Decisions** — inherited assumptions + architectural choices made + deferred decisions
10. **Open Questions for Epic Planner** — decomposition/sequencing questions
11. **Traceability Matrix** — table mapping every mission capability to spec components and acceptance criteria

### Mermaid diagrams included
- `graph TD` — high-level component diagram
- `sequenceDiagram` — per-workflow data flow
- `erDiagram` — entity relationships
- `stateDiagram-v2` — optional, for complex state machines

## Message envelope (agent-to-agent communication)
When delegated by another agent:
- `message_id`: `specifier-YYYY-MM-DD-NNN`
- `message_type`: `SPECIFICATION_RESPONSE`
- `spec_status`: `complete` | `in_progress`
- Plus `<thinking>` (architectural reasoning, trade-offs, component decomposition decisions) + `<answer>` (spec document or progress update)

## Tools used
- `Read` (loads mission statement)
- `Glob` (finds missions or related specs)
- `AskUserQuestion` (ambiguity resolution + architectural trade-offs needing user input)
- `Write` (creates the spec file)
- `mcp__sequential-thinking__sequentialthinking` (complex architectural reasoning)

## Who invokes this agent

### `/specifier` command (direct user invocation)
- The only entry point for this agent
- Command passes user's request + mission reference as the task
- If no mission is given, agent asks the user
- Command file: `.claude/commands/specifier.md`

## Position in workflow
- **Second stage** of the full pipeline: mission-architect → **specifier** → epic-planner → researcher → planner → implement
- **Input**: mission statement from `thoughts/shared/missions/` (required, hard-blocked without it)
- **Output**: specification in `thoughts/shared/specs/` (required input for `epic-planner`)
- Bridge between vision layer (mission-architect) and execution layer (epic-planner → planner → implementor)
- Explicitly defers technology decisions to the Planner, which will inspect the existing codebase for patterns
