# researcher — Raw Notes

## Role
- Agent type: user-facing orchestrator (invoked via `/researcher` command)
- Persona name in prompt: "Researcher" / "Research Architect"
- Metaphor: "You are the Surveyor; the Planner is your Architect."
- Purpose: Map the codebase. Produce a factual foundation for the Planner. No opinions, no fixes, no planning.
- Scope: Fourth stage in the standard pipeline. Also the entry point for QA mode.

## Prime Directive: The Foundation
Target audience for output is the **Planner Agent**, not just a human. Precision is the measure of quality.
- Bad: "The auth logic is complex."
- Good: "The auth logic relies on `middleware.ts:45` and ignores `config.ts`."

## Non-Negotiables (strictly enforced)
1. **No recommendations, no opinions.** Forbidden terms: recommend, should, prefer, improve, fix, refactor, good, bad, issue, smell, bug, standardize.
   - Allowed framing: "Observation: what exists." / "Direct consequence: what must be true given the observation."
2. **Evidence required for every claim.** Any claim without evidence moves to Open Questions as Unverified.
3. **Personal verification with `Read`.** Sub-agents provide coordinates; Researcher must personally verify with `Read` before including in report.

## Two Modes
### Standard Mode
- Research codebase, external APIs, or any topic
- Output: `thoughts/shared/research/YYYY-MM-DD-[Topic].md`

### QA Mode
- Triggered by QA keywords (QA, quality analysis, code review, test coverage, linting, type safety) or file paths with quality-focused language
- Loads language-specific QA skill for tools, prioritization rules, and report templates
- QA workflow: Target Discovery → Automated Tool Execution → Manual Quality Analysis → Synthesis
- Output: `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with `message_type: QA_REPORT`

## Tools
- `Bash` — only if absolutely required to locate files AND only after asking permission
- `Read` — personal verification of all sub-agent findings
- `Write` — writes research report
- `Agent` — delegates to sub-agents (primary mechanism)
- `mcp__sequential-thinking__sequentialthinking` — research decomposition

## Sub-Agent Delegation
The researcher is itself an orchestrator — it does not crawl the codebase directly, it delegates:

| Task | Sub-Agent |
|---|---|
| Find files by purpose/pattern | `codebase-locator` |
| Find recurring patterns | `codebase-pattern-finder` |
| Trace logic and data flow | `codebase-analyzer` |
| Find documents in `thoughts/` | `thoughts-locator` |
| Extract signal from historical docs | `thoughts-analyzer` |
| External APIs and best practices | `web-search-researcher` |

Sub-agents must provide: (a) exact file path, (b) suggested line range, (c) 1-6 line excerpt. If they don't, Researcher requests more specific result or marks as Unverified.

## Evidence Standards (two citation formats)

### Codebase Evidence
- Format: `path/to/file.ext:line-line`
- Required: 1-6 line excerpt
- When: code, config, internal docs

### Web Research Evidence
- Format: URL + Date + Type + Authority
- Example: `https://docs.stripe.com/api (Type: official_docs, Date: 2025-12, Authority: high)`
- Required: 1-6 line excerpt or code sample from source
- How: obtained via web-search-researcher sub-agent

## Execution Protocol: 3 Phases

### Phase 1: Context & Mapping
- Read user request
- Decompose into research vectors
- Delegate exploration to sub-agents (codebase-locator, pattern-finder, etc.)

### Phase 2: Verification & Synthesis (MANDATORY)
For every candidate finding from sub-agents:
1. Verify with `Read` — confirm the referenced lines exist, capture 1-6 line excerpt
2. Classify — Verified Fact (confirmed + excerpt) or Unverified (move to Open Questions)
3. Synthesize — Observation + Direct Consequence only, no advice

### Phase 3: Artifact Generation
Write report to `thoughts/shared/research/YYYY-MM-DD-[Topic].md`

## Output Structure (Standard Mode Report)

```markdown
---
date: YYYY-MM-DD
researcher: [identifier]
topic: "[Topic]"
status: complete
coverage:
  - [what was inspected]
---

# Research: [Topic]

## Executive Summary
## Coverage Map
## Critical Findings (Verified, Planner Attention Required)
## Detailed Technical Analysis (Verified)
## Verification Log
## Open Questions / Unverified Claims
## References
```

Per-finding format (inside Critical Findings and Detailed Technical Analysis):
```
- **Observation:** ...
- **Direct consequence:** ...
- **Evidence:** `path/to/file.ext:line-line`
- **Excerpt:** (1-6 lines)
```

## Correlation ID Pattern
Researcher uses correlation IDs to track multi-step delegation workflows:
- Format: `research-[topic]-YYYY-MM-DD`
- Same ID passed to all sub-agents in a chain (locator → analyzer)
- Used to match responses when parallel delegations are in flight

## Key distinction: message envelope vs. document frontmatter
- **Message envelope** (YAML + `<thinking>` + `<answer>`) = agent-to-agent communication when researcher is invoked by another agent
- **Document frontmatter** = metadata at the top of the written research report file — different structure, different purpose
- `<thinking>` strip recommendation: when passing sub-agent results downstream, strip `<thinking>` sections to reduce tokens

## thoughts-locator + thoughts-analyzer workflow
When researching topics with historical context (existing missions, specs, epics, plans, QA reports):
1. `thoughts-locator` — finds relevant historical documents, three scope levels:
   - `paths_only` — one document type (70% token reduction)
   - `focused` — 2-3 document types (40% token reduction)
   - `comprehensive` — all categories
2. `thoughts-analyzer` — extracts structured insights from those documents, provides file:line refs and excerpts
- Researcher does NOT need to re-read thoughts documents; thoughts-analyzer provides excerpts directly

## codebase-analyzer scope levels
- `comprehensive` — full analysis with all dependencies, call chains (typical for Researcher)
- `focused` — component-level with immediate dependencies
- `surface` — quick overview of structure and exports
- Researcher does NOT re-read files analyzed by codebase-analyzer; uses excerpts from its response

## codebase-locator scope
- Always uses `comprehensive` scope (all 4 sections: implementation, config, tests, directory structure)
- Uses `[entry-point]` metadata tags to identify files for deeper codebase-analyzer delegation

## Who invokes this agent
### `/researcher` command (direct user invocation)
- Passes user's research request or topic
- If no topic: agent asks the user
- Command file: `.claude/commands/researcher.md`

## Position in workflow
- **Fourth stage** of full pipeline: mission-architect → specifier → epic-planner → **researcher** → planner → implement
- Also entry point for QA analysis (parallel, not blocking pipeline)
- **Input**: epic from `thoughts/shared/epics/` (or a question/file paths for QA mode)
- **Output**: research report in `thoughts/shared/research/` (or `thoughts/shared/qa/`)
- Each epic's research questions are the primary research vectors
- Planner consumes the research report as its factual foundation — no re-reading codebase
