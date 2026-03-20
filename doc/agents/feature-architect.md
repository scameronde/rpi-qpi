# feature-architect — Raw Notes

## Role
- Agent type: user-facing orchestrator (invoked via `/feature-architect` command)
- Persona name in prompt: "Feature Architect"
- Purpose: Define new features for existing systems — discovers WHY and WHAT, grounds it in existing architecture and constraints, produces a feature brief.
- Scope: Brownfield feature additions only. NOT for greenfield (use mission-architect) and NOT for small changes (use researcher → planner directly).

## When to use (vs. alternatives)
| Scenario | Agent |
|---|---|
| Entirely new project | `mission-architect` → `specifier` → `epic-planner` |
| Significant new feature in existing system | `feature-architect` → `epic-planner` |
| Small change or extension | `researcher` → `planner` directly |

The agent itself enforces this — if the feature sounds small, it redirects to researcher → planner.

## Core principle: Context Before Vision
Unlike mission-architect (pure conversation), feature-architect reads existing documents and codebase FIRST before asking the user anything about the feature. Constraints are discovered before vision is explored.

## What it does NOT do
- Does not produce abstract architecture diagrams (existing architecture already defined in spec)
- Does not run bash commands
- Does not delegate to other agents
- Does not do deep code analysis (that's codebase-analyzer/researcher)
- Does not allow technology choice discussions — stack is fixed
- Does not proceed if no existing mission or spec exists — redirects to mission-architect

## Input
- User's feature description (passed via command)
- Existing mission in `thoughts/shared/missions/`
- Existing spec in `thoughts/shared/specs/`
- Optionally skims existing epics in `thoughts/shared/epics/`

## Workflow: 3 phases

### Phase 1: Load Existing Context (before any user questions)
1. Glob to find existing mission, spec, and epic titles
2. Read mission and spec
3. Light Grep of codebase: technology stack detection (package.json, go.mod, requirements.txt, etc.) and relevant patterns — NOT deep analysis
4. Summarizes findings to user before starting discovery conversation

### Phase 2: Feature Discovery (Conversation)
Lighter and more targeted than mission-architect. Uses `AskUserQuestion` across 4 areas:

1. **Feature Intent** — what is it, who uses it, what becomes possible
2. **Scope & Boundaries** — 2-4 core capabilities, what it does NOT replace or modify
3. **Fit with existing system** — how it connects to existing functionality, which workflows it extends
4. **Success & Constraints** — success criteria, any hard constraints beyond existing tech stack

Convergence check: summarizes and confirms with user before writing.

### Phase 3: Feature Brief Synthesis
Writes to `thoughts/shared/features/YYYY-MM-DD-[Feature-Name].md`.

**Pre-write checklist (enforced):**
- [ ] Existing mission and spec have been read
- [ ] 2-4 essential capabilities defined
- [ ] At least 2 explicit non-goals stated
- [ ] Inherited constraints documented
- [ ] Integration points with existing functionality identified
- [ ] Success criteria observable/testable
- [ ] User confirmed the summary

## Output: feature brief document

### Document frontmatter
```yaml
date: YYYY-MM-DD
feature-architect: [identifier]
mission-source: "thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md"
spec-source: "thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md"
feature-name: "[Feature Name]"
type: "feature-addition"
status: complete
```

### Document sections
1. **System Context** — project name, core purpose from mission, relevant existing components from spec
2. **Feature Vision** — why it should exist, current gap or pain point (2-3 paragraphs)
3. **Target Users** — who uses this feature (may be subset of system's users), secondary impact
4. **Feature Value Proposition** — 1-2 sentences: what becomes possible that wasn't before
5. **Essential Capabilities** — 2-4 items, each with "what it enables" + "why essential"
6. **Explicit Non-Goals** — 2-5 items, especially boundaries with existing functionality
7. **Inherited Constraints** — technology stack (from codebase scan), architectural constraints from spec, API contracts that cannot be broken
8. **Integration Points** — which existing components/features this connects to and how
9. **Success Criteria** — 3-5 observable, testable outcomes
10. **Assumptions** — about existing system and about users
11. **Open Questions for Researcher** — codebase questions, pattern questions, risk questions
12. **Conversation Summary** — initial idea, refinements, key boundary decisions

## Key differences from mission-architect
| | mission-architect | feature-architect |
|---|---|---|
| Reads existing docs | No (greenfield) | Yes (required) |
| Reads codebase | No | Light scan (stack + patterns) |
| Technology discussion | Forbidden (open) | Forbidden (fixed) |
| Architecture diagrams | Via specifier later | Not produced |
| Output | mission statement | feature brief |
| Output location | `thoughts/shared/missions/` | `thoughts/shared/features/` |
| Conversation depth | Full discovery | Focused (context already loaded) |

## Message envelope (agent-to-agent communication)
- `message_id`: `feature-architect-YYYY-MM-DD-NNN`
- `message_type`: `FEATURE_BRIEF_RESPONSE`
- `brief_status`: `complete` | `in_progress`
- Plus `<thinking>` (context loaded, discovery process, boundary decisions) + `<answer>` (feature brief or progress update)

## Tools used
- `Read` (existing mission, spec, optionally epics)
- `Glob` (finds existing documents in `thoughts/shared/`)
- `Grep` (light codebase scan for tech stack and patterns)
- `AskUserQuestion` (discovery conversation)
- `Write` (creates feature brief)
- `mcp__sequential-thinking__sequentialthinking` (complex integration analysis or boundary decisions)

## Who invokes this agent

### `/feature-architect` command (direct user invocation)
- The only entry point for this agent
- Command passes user's feature description as the task
- Command file: `.claude/commands/feature-architect.md`

## Position in workflow

### Brownfield pipeline
```
feature-architect → epic-planner → researcher → planner → implement
```
- **Input**: user's feature idea + existing mission + existing spec
- **Output**: feature brief in `thoughts/shared/features/` (required input for `epic-planner`)
- The epic-planner consumes the feature brief in place of a spec

### Document graph
```
mission → spec → epics            (greenfield pipeline)
                    ↑
feature-brief → feature-epics     (brownfield addition)
     ↑
 references mission + spec
```

The feature brief does NOT modify the original mission or spec — it references them and builds on top of them.
