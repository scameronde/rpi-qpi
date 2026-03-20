# Agentic Software Engineering — User Guide

This guide explains the full agentic software engineering workflow: a structured pipeline of AI agents that takes a project idea from raw vision through deployed code, with every step producing traceable, reviewable artifacts.

---

## Table of Contents

1. [Overview](#overview)
2. [The Two Pipelines](#the-two-pipelines)
3. [Stage-by-Stage Reference](#stage-by-stage-reference)
   - [Mission Architect](#1-mission-architect-greenfield-only)
   - [Feature Architect](#1b-feature-architect-brownfield-only)
   - [Specifier](#2-specifier-greenfield-only)
   - [Epic Planner](#3-epic-planner)
   - [Researcher](#4-researcher)
   - [Planner](#5-planner)
   - [Implementation Controller](#6-implementation-controller)
4. [Parallel Path: QA Workflow](#parallel-path-qa-workflow)
5. [QA Skills](#qa-skills)
6. [Supporting Subagents](#supporting-subagents)
7. [MCP Servers](#mcp-servers)
8. [Artifact Directory Reference](#artifact-directory-reference)
9. [Quick-Start Cheat Sheet](#quick-start-cheat-sheet)

---

## Overview

The workflow is a **pipeline of specialized agents**, each with a narrow responsibility and a well-defined output. No agent skips ahead — each stage depends on the previous stage's artifact.

The key design principle: **vision before specification, specification before planning, planning before execution**. This prevents the most common failure mode in AI-assisted development: jumping straight to implementation without a clear, agreed-upon understanding of what to build.

```
GREENFIELD:
  /mission-architect  →  /specifier  →  /epic-planner  →  /researcher  →  /planner  →  /implement

BROWNFIELD (new feature in existing system):
  /feature-architect  →  /epic-planner  →  /researcher  →  /planner  →  /implement

SMALL CHANGE:
  /researcher  →  /planner  →  /implement

QA (runs in parallel):
  /researcher (QA mode)  →  /planner (QA mode)  →  /implement
```

Every stage writes its output to `thoughts/shared/`, creating a permanent, searchable record of all decisions and rationale.

---

## The Two Pipelines

### Greenfield Pipeline
Use when building an entirely new project or a completely new feature from scratch.

```
/mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement
```

### Brownfield Pipeline
Use when adding a significant feature to an existing system.

```
/feature-architect → /epic-planner → /researcher → /planner → /implement
```

**Rule of thumb:**
| Scenario | Start here |
|---|---|
| Entirely new project | `/mission-architect` |
| Significant new feature in existing system | `/feature-architect` |
| Small change, bug fix, or extension | `/researcher` directly |
| Code quality review | `/researcher` (QA mode) |

---

## Stage-by-Stage Reference

---

### 1. Mission Architect *(greenfield only)*

**Command:** `/mission-architect`
**Output:** `thoughts/shared/missions/YYYY-MM-DD-[Project-Name].md`

The Mission Architect captures **why** the project should exist and **what** it must do — without touching implementation details. No technology names, no architecture, no frameworks.

#### What it does
Runs a structured discovery conversation with you across four areas:
1. **Value & Problem** — what specific problem does this solve, and for whom?
2. **Scope & Boundaries** — what are the 3-5 core capabilities; what is explicitly out of scope?
3. **Success & Outcomes** — what will users be able to do that they can't today?
4. **Constraints & Assumptions** — non-negotiable limits; environmental assumptions

The agent challenges vague answers, surfaces scope conflicts, and confirms its understanding before writing anything.

#### What the output contains
- Vision statement (the "why")
- Target audience
- Core value proposition
- Essential capabilities (3-7), each with "what it enables" and "why it's essential"
- Explicit non-goals (3-7) with rationale
- Success criteria (measurable outcomes from the user's perspective)
- Assumptions and constraints
- Open questions for the Specifier

#### Rules
- Technology names are **forbidden** in the mission document. If you say "React" or "PostgreSQL", the agent will redirect the conversation.
- This stage is for greenfield only. For features on existing systems, use `/feature-architect`.
- The agent will not write the document until you confirm its summary of the discussion.

---

### 1b. Feature Architect *(brownfield only)*

**Command:** `/feature-architect`
**Output:** `thoughts/shared/features/YYYY-MM-DD-[Feature-Name].md`

The Feature Architect is the brownfield equivalent of Mission Architect. It defines a new feature within an existing system — grounded in existing architecture and constraints.

#### Key difference from Mission Architect
Feature Architect **reads the existing mission and spec first**, before asking you a single question. The conversation is shorter and more focused because much context already exists.

#### What it reads on startup
- The existing mission in `thoughts/shared/missions/`
- The existing spec in `thoughts/shared/specs/`
- A light scan of the codebase for technology stack detection

#### What the output contains
- System context (what the existing system does and its relevant components)
- Feature vision (the gap or pain point)
- Essential capabilities (2-4), with boundaries clearly stated
- Explicit non-goals, especially boundaries with existing functionality
- Inherited constraints (the technology stack is already fixed — no discussion)
- Integration points (which existing components this feature connects to)
- Success criteria
- Open questions for the Researcher

#### Rules
- Requires an existing mission AND spec. If neither exists, the agent redirects to `/mission-architect`.
- Technology stack is not up for discussion — it's already determined by the codebase.
- For small changes that don't need a full feature brief, skip to `/researcher` directly.

---

### 2. Specifier *(greenfield only)*

**Command:** `/specifier`
**Output:** `thoughts/shared/specs/YYYY-MM-DD-[Project-Name].md`

The Specifier translates a mission statement into a **technical specification** — still technology-agnostic, but now concrete enough to guide decomposition into epics.

#### What it does
Working from the mission document, the Specifier answers:
- What are the major system components?
- How do they interact (data flows, event triggers)?
- What are the key entities and relationships?
- What are the external interfaces (user interactions, integrations)?
- What are the non-functional requirements (performance, security, scalability)?

It produces Mermaid diagrams for architecture, data flow, and entity relationships.

#### What the output contains
- Mission reference (traceability anchor to `thoughts/shared/missions/`)
- System overview and boundaries
- Conceptual architecture with component diagram (`graph TD`)
- Data flow diagrams per essential capability (`sequenceDiagram`)
- Abstract data model with entity relationships (`erDiagram`)
- External interface contracts (behavior, not HTTP endpoints)
- Non-functional requirements
- Acceptance criteria (testable conditions per capability)
- Traceability matrix (every mission capability → spec component → acceptance criteria)
- Open questions for the Epic Planner

#### Rules
- Requires a complete mission document (all 5 required sections: vision, audience, capabilities, non-goals, success criteria). Incomplete missions cause a hard stop.
- No technology choices in the spec. "A persistent data store" yes; "PostgreSQL" no.
- The Specifier deliberately defers technology decisions to the Planner, which will read the actual codebase.

---

### 3. Epic Planner

**Command:** `/epic-planner`
**Output:** One file per epic in `thoughts/shared/epics/YYYY-MM-DD-[Epic-Name].md`

The Epic Planner decomposes a specification (or feature brief) into **user-facing epics** — chunks of work that each deliver a meaningful capability.

#### The core principle: stories, not tasks
- **Good epic:** "User Authentication System" (spans registration, login, password reset, session management)
- **Bad epic:** ~~"Database Schema Creation"~~ (this is a technical task, not a user story)

Each epic should take 1-3 research reports and 1-5 implementation plans to complete. If it's larger, it's two epics. If it's smaller, it's a plan task.

#### Decomposition approaches
The agent chooses one based on the spec structure:
- **By User Workflow** — one epic per major user journey
- **By System Component** — one epic per architectural component
- **By Feature Cluster** — one epic per set of related capabilities

#### What each epic document contains
- Specification reference and traceability
- Epic summary (what it delivers, value statement, in/out scope)
- 3-7 user stories in "As a / I want to / So that" format
- **Research questions for the Researcher** (codebase context, external knowledge, risks)
- **Acceptance criteria for the Planner** (functional, technical, quality/testing)
- Dependencies on other epics (with Mermaid dependency diagram)
- Data model requirements (which entities this epic creates/modifies)
- Implementation considerations (hints — not prescriptive)
- Verification plan (manual steps + automated tests)

#### Rules
- Requires a complete spec or feature brief. Incomplete input = hard stop.
- Research questions and acceptance criteria are **mandatory** sections — they feed the next two stages directly.
- Dependencies between epics must be identified. The Mermaid dependency diagram is enforced.

---

### 4. Researcher

**Command:** `/researcher`
**Output:** `thoughts/shared/research/YYYY-MM-DD-[Topic].md`

The Researcher maps the codebase to create the factual foundation the Planner needs. It operates as an **orchestrator** — it delegates to specialized subagents and personally verifies every finding before including it in the report.

#### Prime directive
The output is written for the **Planner Agent**, not just a human. Every claim requires evidence. No recommendations, no opinions, no "this could be improved." Only verified observations and their direct consequences.

Forbidden terms: *recommend, should, prefer, improve, fix, refactor, good, bad, issue, smell, bug, standardize.*

#### What it investigates
Driven by the epic's research questions, the Researcher will:
- Map the codebase topology (which files contain what)
- Trace execution paths through complex functions
- Identify recurring patterns and conventions
- Research external APIs and libraries when needed
- Consult historical decisions from `thoughts/`

#### Evidence standards
**Codebase evidence:**
```
path/to/file.ext:line-line
[1-6 line excerpt from the file]
```

**Web evidence:**
```
https://docs.example.com/api (Type: official_docs, Date: 2025-12, Authority: high)
[1-6 line excerpt]
```

Any claim that cannot be verified moves to the "Open Questions / Unverified Claims" section — it never becomes a false finding.

#### Subagents the Researcher delegates to
| Task | Subagent |
|---|---|
| Find files by purpose/pattern | codebase-locator |
| Trace execution logic | codebase-analyzer |
| Find conventions and patterns | codebase-pattern-finder |
| Find historical documents | thoughts-locator |
| Extract signal from historical docs | thoughts-analyzer |
| External libraries and APIs | web-search-researcher |

#### Output structure
```
Executive Summary
Coverage Map
Critical Findings (Verified, Planner Attention Required)
Detailed Technical Analysis (Verified)
Verification Log
Open Questions / Unverified Claims
References
```

#### QA Mode
The Researcher also runs in QA mode, triggered by keywords like "QA", "code review", "test coverage", "type safety", "linting". In QA mode:
- It loads the appropriate QA skill (python-qa, typescript-qa, clean-code, or logic-bugs-qa)
- Runs automated analysis tools
- Outputs to `thoughts/shared/qa/` instead of `thoughts/shared/research/`

---

### 5. Planner

**Command:** `/planner`
**Output:** Two files in `thoughts/shared/plans/`:
- `YYYY-MM-DD-[Ticket].md` — the blueprint
- `YYYY-MM-DD-[Ticket]-STATE.md` — the progress tracker

The Planner converts research findings into an **evidence-backed implementation plan** — specific enough that the Implementation Controller can execute it without asking any further questions.

#### Prime directive
Every plan task that touches a file must cite evidence (`path:line-line` with excerpt). If a file cannot be verified, the item becomes a **Verification Task** — not a `PLAN-XXX` task. The Planner never plans based on assumptions.

No code is written. Pseudocode, interfaces, step-by-step instructions only.

#### What each PLAN-XXX task contains
```
- Action ID: PLAN-001
- Change Type: create / modify / remove
- File(s): path/to/file
- Instruction: exact steps, specific enough to execute without further questions
- Interfaces / Pseudocode: minimal — just enough to guide the coder
- Evidence: path:line-line (why this file, why this approach)
- Done When: concrete, observable completion condition
- Complexity: simple | complex (optional override)
```

The optional `Complexity` field tells the Implementation Controller whether to delegate a task to the coder subagent or handle it directly:
- `simple` — force direct execution (for tasks that look complex but aren't)
- `complex` — force delegation (for tasks that look simple but have hidden complexity)
- Omit — let the controller decide automatically (recommended default)

#### The STATE file
A minimal (≤40 line) progress tracker created alongside the plan:
- Current task
- Completed tasks checklist
- Quick verification commands
- Updated after every completed task during execution

This is the resume checkpoint. If execution is interrupted, the Implementation Controller reads this file to know exactly where to pick up.

#### QA Mode
When given a QA report as input (from `thoughts/shared/qa/`), the Planner maps `QA-XXX` issues directly to `PLAN-XXX` tasks and organizes them by priority: Critical (Phase 1) → High (Phase 2) → Medium (Phase 3) → Low (Phase 4).

---

### 6. Implementation Controller

**Command:** `/implement` (or `/implementation-controller`)
**Output:** Committed code changes + updated STATE file

The Implementation Controller drives the plan to completion, one task at a time. It **orchestrates but does not implement** — all code changes go through the coder subagent.

#### The orchestration loop

For each `PLAN-XXX` task:
1. **Extract** the task payload from the plan
2. **Delegate** to the coder subagent with a JSON task payload
3. **Parse** the coder's response (SUCCESS / BLOCKED / FAILED)
4. **Verify** using the task's "Done When" criteria
5. **Update** the STATE file
6. **Commit** with message `PLAN-XXX: <description>`
7. **Report** to you and wait for your approval to continue

#### User commands during execution
| Command | What happens |
|---|---|
| `PROCEED` or `CONTINUE` | Start the next task |
| `SKIP` | Skip current task, mark skipped in STATE |
| `RETRY` | Retry current task |
| `STOP` | Pause, save position in STATE |
| `STATUS` | Report completed tasks and current position |
| `VERIFY` | Re-run verification for current task |

If you say "complete all tasks" upfront, the controller will proceed through the entire plan without stopping for approval at each step.

#### Retry behavior
The controller has a structured retry decision tree:
- **BLOCKED — "Need to edit unlisted file":** If adjacent edit is reasonable, adds it to allowed list and retries; if out of scope, stops and reports.
- **BLOCKED — "Instruction ambiguous":** Adds clarification and retries (max 2).
- **BLOCKED — "Evidence mismatch":** Stops — the plan needs updating.
- **FAILED — "File not found":** Changes type to "create" and retries.
- **Verification fails:** Retries with error details (max 2 retries), then stops and reports.

#### Resuming interrupted execution
If execution was interrupted, simply run `/implement` again. The controller reads the STATE file to find the current task position, runs verification to confirm a clean environment, and resumes from exactly where it stopped.

#### Rules
- No direct code editing. The `Edit` tool is used only for STATE file updates.
- Always commit after verified task completion — never commit partial or failed work.
- The coder is the only agent in the entire pipeline that actually writes source code.

---

## Parallel Path: QA Workflow

The QA workflow runs in parallel with the main pipeline. It does not block feature development — it produces its own implementation plan that can be executed separately.

```
/researcher (QA mode)  →  /planner (QA mode)  →  /implement
```

**Triggering QA mode:**
Run `/researcher` with any QA-related keywords:
- "QA", "quality analysis", "code review"
- "test coverage", "linting", "type safety"
- Specific file paths with quality-focused language

The Researcher detects the QA intent and loads the appropriate skill.

**QA output path:** `thoughts/shared/qa/` (not `thoughts/shared/research/`)

**QA skill selection:**
| Language / Focus | Skill |
|---|---|
| Python | `python-qa` |
| TypeScript / JavaScript | `typescript-qa` |
| Logic bugs and correctness (any language) | `logic-bugs-qa` |
| Design principles and code smells (any language) | `clean-code` |

Run language-specific skills first, then `clean-code` for design review.

---

## QA Skills

Skills are loaded by the Researcher during QA mode. They provide automated tool configurations, analysis checklists, and report templates.

---

### python-qa

**4 automated tools (run in parallel):**
| Tool | What it checks |
|---|---|
| `ruff` | Style, complexity, code quality |
| `pyright` | Type errors and type safety |
| `bandit` | Security vulnerabilities |
| `interrogate` | Docstring coverage |

**3 manual analysis categories:** Readability, Maintainability, Testability

**Issue prefix:** `QA-XXX`

**Prioritization:**
- Critical: bandit security (HIGH/MEDIUM)
- High: pyright type errors
- Medium: ruff complexity, coverage gaps
- Low: style consistency

---

### typescript-qa

**3 core automated tools:**
| Tool | What it checks |
|---|---|
| `tsc` | Type errors blocking compilation |
| `eslint` | Code quality, style, complexity |
| `knip` | Dead code (unused exports, files, dependencies) |

**2 optional tools** (if detected in `package.json`): `eslint-plugin-security`, `eslint-plugin-jsdoc`

**5 manual analysis categories:** Readability, Maintainability, Type Safety, React/JSX, Testability

**Issue prefix:** `QA-XXX`

**Key TypeScript-specific checks:**
- `any` usage — defeats type safety
- Non-null assertions (`!`) — runtime crash risk
- Type assertions (`as X`) — bypasses type checker
- Missing generic constraints
- `tsconfig` strict mode enabled?

---

### clean-code

**Language-agnostic.** Based on: Clean Code (Martin), The Pragmatic Programmer (Hunt & Thomas), Code Complete (McConnell), Refactoring (Fowler), Working Effectively with Legacy Code (Feathers).

**3 automated tools:** `lizard` (complexity), `scc` (lines/comments), `jscpd` (duplication)

**Key thresholds:**
| Metric | Ideal | Acceptable | Critical |
|---|---|---|---|
| Cyclomatic Complexity | ≤ 10 | ≤ 15 | > 20 |
| Function length | ≤ 20 lines | ≤ 50 lines | > 100 lines |
| Parameter count | 0-2 | 3 | ≥ 4 |
| Code duplication | < 3% | < 5% | > 10% |

**4 evaluation dimensions:** Structure, Readability, Testability, Maintainability

**Issue prefix:** `CLEAN-XXX`

Run this **after** language-specific QA passes.

---

### logic-bugs-qa

**No automated linting tools** — logic bugs require execution tracing, not syntax checking.

**7 analysis categories:**
1. Control Flow (off-by-one, loop termination, boolean logic)
2. Data Handling (null dereference, type coercion, overflow)
3. Concurrency (race conditions, deadlocks, missing sync)
4. Error Handling (swallowed exceptions, resource leaks)
5. Algorithm Correctness (wrong assumptions, missing edge cases)
6. Boundary & Edge Cases (min/max, empty collections, NaN/infinity)
7. State Management (init order, stale state, missing invariants)

**Verification is through tests**, not linters. A baseline test run is established before analysis; regression check after each fix.

**Issue prefix:** `LOGIC-XXX`

**Heavy use of codebase-analyzer** — execution tracing is the primary analysis technique.

---

## Supporting Subagents

These agents are **not user-facing**. They are invoked programmatically by the orchestrators (Researcher, Planner, QA skills) via the `Agent` tool. You never call them directly.

---

### codebase-locator ("The Cartographer")
Answers: *Where is the code?*

Returns file paths and directory topology for a given topic. Never outputs code snippets. Uses role tags on every path:
- `[entry-point]` — main file in a group (most exports)
- `[secondary]` — supporting implementation file
- `[config]` — configuration file

**Scope levels:** `tests_only`, `paths_only`, `focused`, `comprehensive`

---

### codebase-analyzer ("The Logic Tracer")
Answers: *How does this specific function work?*

Reads specific files and traces execution paths, data flows, branching logic, and dependencies. Cannot search — requires a specific file path from the caller.

Uses LSP tools (`goToDefinition`, `callHierarchy`) to navigate rather than manually resolving imports.

**Scope levels:** `execution_only` (~70% token savings), `focused` (~40%), `comprehensive` (full)

---

### codebase-pattern-finder ("The Pattern Librarian")
Answers: *How is X done across the entire codebase?*

Scans the full codebase and returns concrete copy-pasteable code snippets showing all implementation variations with frequency metrics:
- `Dominant (10/12 files, 83%)` — what new code should match
- `Common (4/12 files, 33%)`
- `Rare (1/12 files, 8%)` — avoid unless intentional

Always reads the actual file before posting a snippet (grep output alone is not trusted).

---

### thoughts-locator ("The Archivist")
Answers: *Where are the historical documents for this topic?*

Searches `thoughts/shared/` by keyword and returns file paths grouped by category (missions, specs, epics, plans, QA reports, research, ADRs, personal notes).

**Scope levels:** `paths_only`, `focused`, `comprehensive`

Note: Only used by the Researcher. The Planner skips this and goes directly to thoughts-analyzer with a known path.

---

### thoughts-analyzer ("The Project Historian")
Answers: *What do these historical documents actually say?*

Reads specific `thoughts/` documents and extracts only three types of signal:
- **Decision** — "We decided to use Redis"
- **Constraint** — "Max payload is 1MB"
- **Spec** — "Timeout: 5000ms"

Everything else is discarded. Assigns a reliability level (High / Medium / Low) based on document age and status. Explicitly flags outdated information.

**Scope levels:** `execution_only` (~60% token savings), `focused` (~30%), `comprehensive`

---

### web-search-researcher ("The External Scout")
Answers: *What does the external documentation say?*

Researches external APIs, library docs, and best practices. Has no access to the local filesystem — the orchestrator must provide relevant code snippets as context if comparison is needed.

**Tool selection:**
| Situation | Tool used |
|---|---|
| Library docs, API references | context7 |
| Finding URLs, error messages | searxng_search |
| Verifying code examples | WebFetch |
| JS-heavy SPAs, large pages | crawl4ai (BM25 mode) |

Assigns confidence scores: HIGH / MEDIUM / LOW / NONE. Never invents answers — "No Definitive Answer Found" is a valid output.

---

## MCP Servers

Four MCP servers extend the pipeline with web and reasoning capabilities. All are defined in `.mcp.json` at the project root.

The two local servers (crawl4ai and searxng) require a one-time build:
```bash
cd .claude/mcp/crawl4ai && npm install && npm run build
cd .claude/mcp/searxng  && npm install && npm run build
```

The context7 server requires an API key — replace `<your key here>` in `.mcp.json` with your Context7 API key.

The sequential-thinking server is installed on demand via `npx` and requires no manual setup.

---

### crawl4ai

**Tool:** `mcp__crawl4ai__crawl4ai`

Extracts content from web pages in three modes:

| Mode | Use case | Key parameters |
|---|---|---|
| `crawl` | Full page extraction | `css_selector`, `cache_mode` |
| `markdown` | Focused content extraction | `markdown_filter` (raw/fit/bm25/llm), `filter_query` |
| `screenshot` | Visual page capture | `screenshot_wait` |

**Markdown filter recommendations:**
- `fit` — default, trims to relevant content
- `bm25` + `filter_query` — 50-80% token reduction, focuses on your query topic
- `llm` + `filter_query` — highest quality but slowest

---

### searxng

**Tool:** `mcp__searxng__searxng_search`

Web search via a self-hosted SearXNG instance. Returns up to 10 results.

| Parameter | Description |
|---|---|
| `query` | Search query (required) |
| `categories` | Comma-separated (e.g., `"general,social media"`) |
| `language` | Language code (e.g., `"en"`, `"de"`) |
| `time_range` | `"day"`, `"month"`, or `"year"` |
| `pageno` | Page number (default: 1) |

---

### context7

**Tools:** `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`
**Transport:** HTTP (`https://mcp.context7.com/mcp`)
**Requires:** `CONTEXT7_API_KEY` in `.mcp.json`

Provides up-to-date library documentation and API references. Used directly by the Planner (for quick external API lookups) and by the web-search-researcher subagent (for library docs and official guides).

**Workflow:**
1. Call `resolve-library-id` with a library name to get the Context7 library ID
2. Call `query-docs` with that ID and a specific query to retrieve targeted documentation

**When agents use it:**
- **web-search-researcher** — primary tool for library docs, API references, config schemas, official guides
- **Planner** — direct use for quick API lookups before writing plan tasks (no subagent delegation needed)
- **codebase-analyzer** and **codebase-pattern-finder** — available for external library context during analysis

---

### sequential-thinking

**Tool:** `mcp__sequential-thinking__sequentialthinking`
**Transport:** stdio (installed via `npx @modelcontextprotocol/server-sequential-thinking`)
**Requires:** No setup — npx installs on first use

Provides a structured multi-step reasoning workspace. Agents use this for decisions that benefit from explicit, chainable thinking steps rather than single-pass reasoning.

**When agents use it:**
| Agent | Use cases |
|---|---|
| **mission-architect** | Complex vision trade-offs and scope conflicts |
| **specifier** | Architectural decisions ("event-driven vs. request-driven?", component boundary analysis) |
| **epic-planner** | Decomposition strategy, dependency analysis, sequencing logic |
| **researcher** | Decomposing a research topic into investigation vectors |
| **planner** | Complex planning decisions with multiple dependencies |
| **codebase-analyzer** | Functions >50 lines with 3+ branching paths; recursive call chains; state mutations across multiple functions |
| **codebase-pattern-finder** | Planning keyword strategy and variation identification before searching |
| **codebase-locator** | Resolving ambiguous file paths |
| **thoughts-locator** | Search strategy planning |
| **thoughts-analyzer** | Signal extraction from complex documents |
| **web-search-researcher** | Multi-step research planning |

---

## Artifact Directory Reference

All pipeline artifacts live in `thoughts/shared/`:

```
thoughts/
  shared/
    missions/    # /mission-architect output   — YYYY-MM-DD-[Project].md
    features/    # /feature-architect output   — YYYY-MM-DD-[Feature].md
    specs/       # /specifier output           — YYYY-MM-DD-[Project].md
    epics/       # /epic-planner output        — YYYY-MM-DD-[Epic].md (one per epic)
    research/    # /researcher output          — YYYY-MM-DD-[Topic].md
    qa/          # /researcher QA mode output  — YYYY-MM-DD-[Target].md
    plans/       # /planner output             — YYYY-MM-DD-[Ticket].md + STATE.md
  decisions/     # Architecture decision records (ADRs)
  [username]/    # Personal notes
```

**Traceability chain:**
```
mission → spec → epic → research → plan → (committed code)
                  ↑
         feature-brief (brownfield)
```

Each artifact references the previous stage's file path, creating a complete audit trail from user story to merged commit.

---

## Quick-Start Cheat Sheet

### Starting a new project
```
1. /mission-architect   — explore the vision (interactive conversation)
2. /specifier           — translate mission to abstract architecture
3. /epic-planner        — decompose spec into user-facing epics
4. /researcher          — map codebase for epic N's research questions
5. /planner             — create implementation plan from research
6. /implement           — execute plan task-by-task
   (repeat 4-6 for each epic)
```

### Adding a feature to an existing project
```
1. /feature-architect   — define feature with existing constraints in mind
2. /epic-planner        — decompose feature brief into epics
3. /researcher          — map codebase for epic N's research questions
4. /planner             — create implementation plan from research
5. /implement           — execute plan task-by-task
```

### Fixing a bug or making a small change
```
1. /researcher          — understand the relevant code
2. /planner             — create a focused implementation plan
3. /implement           — execute
```

### Running a code quality review
```
1. /researcher          — use QA mode ("review the auth module", "check test coverage for...")
2. /planner             — creates prioritized QA fix plan
3. /implement           — execute fixes in priority order
```

### Resuming interrupted execution
```
/implement              — reads STATE file automatically, resumes where it stopped
```

### Checking on execution status mid-run
```
STATUS                  — type this as your next message during execution
```
