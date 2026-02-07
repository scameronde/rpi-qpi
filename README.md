# rpiqr

**Structured AI-Assisted Development: From Mission to Maintainable Code**

rpiqr is a collection of OpenCode Agents, Skills, and Tools that replaces unstructured "vibe coding" with a repeatable, documented process—delivering testable, maintainable code without slop or rot.

---

## Core Philosophy

**Problem**: Traditional AI-assisted coding often produces context rot, inconsistent quality, and undocumented decisions.

**Solution**: A structured, multi-agent system with explicit phases, persistent documentation, and context management strategies.

---

## Main Development Loop

The primary workflow follows three phases:

```
RESEARCH → PLAN → IMPLEMENT
```

### Two Applications

#### 1. Feature Development
- **Research**: Gather information (web search, API documentation, codebase analysis)
- **Plan**: Create structured implementation plan with discrete tasks
- **Implement**: Execute plan systematically with tracked progress

#### 2. Quality Assurance
- **Research**: Assess code quality through analysis
- **Plan**: Identify necessary fixes and improvements
- **Implement**: Apply changes methodically

---

## Strategic Planning Loop

For greenfield projects or major brownfield changes:

```
MISSION → SPECIFICATION → EPICS
```

- **Mission**: High-level goals and objectives
- **Specification**: Technical requirements and constraints
- **Epics**: Breakdown into implementable feature sets

---

## Architecture

### Agent Hierarchy

```
Primary Agents (Orchestration)
    ↓ delegate to
Sub-Agents (Specialized Tasks)
    ↓ use
Skills & Tools
```

**Key Benefit**: Primary agents maintain clean context by delegating to sub-agents, which always start with fresh context.

### Directory Structure

```
/agent/           Agent definitions (*.md with YAML frontmatter)
/skills/          Skill definitions (SKILL.md + references/)
/tool/            Custom MCP tools (TypeScript)
/thoughts/        Persistent documentation
  /shared/        Cross-project artifacts
    /missions/    High-level mission statements
    /specs/       Technical specifications
    /epics/       Feature epics
    /research/    Research reports
    /plans/       Implementation plans
    /qa/          QA analysis reports
  /projects/      Project-specific documentation
/.opencode/       OpenCode configuration
opencode.json     Provider and MCP configuration
```

---

## Context Rot Prevention

### 1. Phased Implementation with STATE Tracking

Complex plans are divided into:
- **Phases**: Logical groupings of related work
- **Tasks**: Discrete, implementable units

Progress is tracked in a **STATE file**. When context usage reaches **40%**, the context should be flushed by the user and work can continues using the STATE file as the source of truth.

### 2. Agent Delegation

- **Primary agents**: High-level orchestration, no intermediate results
- **Sub-agents**: Fresh context for each specialized task
- **Result**: Primary agent context remains clean and focused

### 3. Persistent Thoughts

Every decision, analysis, and plan is documented in `/thoughts/`:
- **Knowledge transfer** between agents
- **Long-term decision history**
- **Audit trail** for future reference

---

## Key Components

### Agents
Markdown files with YAML frontmatter defining:
- Agent role and prime directive
- Tool permissions
- Temperature settings
- Execution protocols
- Output formats

### Skills
Reusable instruction sets with:
- Reference materials
- Language-specific patterns
- QA workflows
- Quick reference guides

### Tools
TypeScript-based custom MCP tools:
- API integrations (Crawl4AI, SearXNG, Context7)
- System utilities
- External service connections

### Thoughts
Structured documentation in Markdown:
- **Research**: `<thinking>` + `<answer>` with evidence citations
- **Plans**: Verified facts + PLAN-XXX tasks
- **QA Reports**: Analysis + QA-XXX improvement items

---

## Getting Started

### Prerequisites
- [OpenCode CLI](https://opencode.ai)
- Node.js (for tool development)
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url> rpiqr
cd rpiqr
```

2. Install tool dependencies:
```bash
cd .opencode && npm install
```

3. Configure OpenCode providers in `opencode.json`

### Usage

Invoke agents through the OpenCode CLI:
```bash
# Research a topic
opencode --agent research-agent "How does Next.js handle SSR?"

# Analyze code quality
opencode --agent qa-agent "Analyze src/components/"

# Execute an implementation plan
opencode --agent task-executor "Execute PLAN-001 from thoughts/shared/plans/2026-02-07-Feature-X.md"
```

---

## Development Guidelines

See [AGENTS.md](AGENTS.md) for comprehensive guidelines on:
- Agent development patterns
- Skill creation
- Tool implementation
- Code style conventions
- Type safety requirements
- Error handling patterns

---

## Key Principles

1. **Structured Over Ad-Hoc**: Every task follows a defined workflow
2. **Documented Decisions**: Thoughts directory preserves context and rationale
3. **Context Hygiene**: Aggressive context management prevents rot
4. **Separation of Concerns**: Agents specialize, don't generalize
5. **Evidence-Based**: Claims backed by citations (file:line or web sources)
6. **Testable & Maintainable**: Output follows established patterns and conventions

---

## Examples

### Feature Development Workflow

```
1. Mission: "Add real-time collaboration to document editor"
   → thoughts/shared/missions/2026-02-07-Collaboration.md

2. Specification: Technical requirements, constraints, architecture
   → thoughts/shared/specs/2026-02-07-Collaboration-Spec.md

3. Epics: Break into implementable chunks
   → thoughts/shared/epics/2026-02-07-Collaboration-Epic-001.md

4. Research: WebSocket libraries, state synchronization patterns
   → thoughts/shared/research/2026-02-08-WebSocket-Libraries.md

5. Plan: Discrete tasks with verification criteria
   → thoughts/shared/plans/2026-02-08-Collaboration-Implementation.md

6. Implement: Execute via task-executor agent with STATE tracking
   → Code changes + updated STATE file
```

### QA Workflow

```
1. Research: Analyze codebase for quality issues
   → thoughts/shared/qa/2026-02-07-Auth-Module-Analysis.md

2. Plan: Prioritized improvements (QA-001, QA-002, ...)
   → thoughts/shared/plans/2026-02-07-Auth-Improvements.md

3. Implement: Apply fixes systematically
   → Code changes + verification
```

---

## Contributing

When adding new agents, skills, or tools:

1. Follow naming conventions (kebab-case)
2. Include YAML frontmatter with metadata
3. Document in `/thoughts/` when appropriate
4. Match skill directory names to frontmatter `name:` field exactly
5. Use TypeScript strict mode for tools
6. Include error handling and structured responses

---

## License

[Specify License]

---

## Resources

- **OpenCode Documentation**: https://opencode.ai/docs
- **Agent Development Guide**: [AGENTS.md](AGENTS.md)
- **Skill Reference**: `skills/opencode/SKILL.md`
- **QA Skills**: `skills/*-qa/SKILL.md`

---

**Built with OpenCode** • Structured Development • Maintainable Results
