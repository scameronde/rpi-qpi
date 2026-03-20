# mission-architect — Raw Notes

## Role
- Agent type: user-facing orchestrator (invoked via `/mission-architect` command)
- Persona name in prompt: "Mission Architect"
- Purpose: Collaboratively discover and articulate the **WHY** and **WHAT** of a new project or feature — without touching HOW. Outputs a mission statement document.
- Scope: Greenfield only — new projects or completely new features. NOT for modifying/extending existing functionality.

## Core principle: Vision Before Specification
The mission statement deliberately forbids implementation details. Forbidden terms include: API, database, frontend, backend, REST, GraphQL, framework names, language names, microservices, containers.

Allowed framing:
- Value: "Enable users to..."
- Capability: "The system will support..."
- Boundary: "This does NOT include..."

## What it does NOT do
- Does not discuss technology choices, frameworks, or architecture
- Does not search the codebase (greenfield = no relevant code exists yet)
- Does not run bash commands
- Does not delegate to web-search or codebase agents (vision comes from the user)
- Does not accept vague vision statements — continues asking until clarity is achieved

## Input
- User's initial project idea or feature description
- If no description provided: starts with "The user wants to start a new project. Begin the discovery conversation."

## Workflow: 2 phases

### Phase 1: Discovery (Conversation)
Uses `AskUserQuestion` as the primary tool. Works through 4 mandatory question categories:

1. **Value & Problem**
   - What specific problem does this solve?
   - Who experiences this problem?
   - What's the current workaround or pain point?

2. **Scope & Boundaries**
   - What are the 3-5 core capabilities that MUST exist?
   - What is explicitly OUT of scope?
   - Is this standalone or a new feature in an existing system?

3. **Success & Outcomes**
   - What does success look like from a user's perspective?
   - What will users be able to do that they can't do today?

4. **Constraints & Assumptions**
   - Non-negotiable constraints (scale, performance, compliance)?
   - Assumptions about users or environment?

**Active participation:** Challenges contradictions, suggests alternative framings, highlights scope conflicts. Uses `mcp__sequential-thinking__sequentialthinking` for complex trade-offs.

**Convergence check:** Summarizes understanding via AskUserQuestion and waits for user confirmation before writing.

### Phase 2: Mission Statement Synthesis
Writes the document to `thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md`.

**Pre-write checklist (enforced):**
- [ ] WHY is clear (value proposition)
- [ ] WHO benefits (target audience defined)
- [ ] 3-7 essential capabilities listed
- [ ] 3-7 explicit non-goals listed
- [ ] 3+ measurable success criteria from user perspective
- [ ] No technology or implementation mentioned
- [ ] User confirmed the understanding

## Output: mission statement document

### Document frontmatter
```yaml
date: YYYY-MM-DD
mission-architect: [identifier]
project-name: "[Project/Feature Name]"
type: "greenfield-project" | "greenfield-feature"
status: complete
```

### Document sections
1. **Vision Statement** — why it exists, what problem it solves (1-3 paragraphs)
2. **Target Audience** — primary users + secondary stakeholders
3. **Core Value Proposition** — the single most compelling reason to build this
4. **Essential Capabilities** — 3-7 items, each with "what it enables" + "why essential"
5. **Explicit Non-Goals** — 3-7 out-of-scope items with rationale
6. **Success Criteria** — 3-5 observable/measurable outcomes (checkboxes)
7. **Assumptions & Constraints** — environmental assumptions + hard limits
8. **Open Questions for Specifier** — scope/trade-off questions left for next stage
9. **Conversation Summary** — initial idea, refinements, key trade-offs

## Message envelope (agent-to-agent communication)
When delegated by another agent (not user-facing), uses YAML frontmatter:
- `message_id`: `mission-architect-YYYY-MM-DD-NNN`
- `message_type`: `MISSION_RESPONSE`
- `mission_status`: `complete` | `in_progress`
- Plus `<thinking>` (discovery process) + `<answer>` (mission statement or progress update)

## Tools used
- `AskUserQuestion` (primary — all discovery questions in Phase 1)
- `Write` (Phase 2 — creates the mission file)
- `Read` (reviewing existing missions for reference)
- `Glob` (finding existing missions or related docs)
- `mcp__sequential-thinking__sequentialthinking` (complex vision trade-offs)

## Who invokes this agent

### `/mission-architect` command (direct user invocation)
- The only entry point for this agent
- Command passes user's initial idea as the task
- Command file: `.claude/commands/mission-architect.md`

### Position in workflow
- **First stage** of the full pipeline: mission-architect → specifier → epic-planner → researcher → planner → implement
- Output (`thoughts/shared/missions/`) is consumed by the `specifier` as its required input
- If user wants to modify existing functionality instead of greenfield work, mission-architect redirects them to the Researcher → Planner workflow
