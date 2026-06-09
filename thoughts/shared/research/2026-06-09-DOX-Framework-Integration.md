---
date: 2026-06-09
researcher: researcher-skill
topic: "DOX Framework Integration with Agentic Engineering Framework"
status: complete
coverage:
  - https://github.com/agent0ai/dox (full repository: README.md, AGENTS.md verbatim)
  - .claude/skills/ (all 10 skill directories)
  - .claude/agents/ (all 6 agent definitions)
  - .claude/hooks/ (hooks.json, session-start script)
  - CLAUDE.md, README.md
  - thoughts/shared/ (directory structure and population state)
---

# Research: DOX Framework Integration with Agentic Engineering Framework

## Executive Summary

- DOX (https://github.com/agent0ai/dox) is a single 83-line `AGENTS.md` Markdown file — no library, no CLI, no runtime. The file IS the framework.
- DOX defines a **hierarchical documentation protocol**: `AGENTS.md` files distributed across the filesystem govern the agent behavior in their subtrees, with a six-step pre-edit traversal and a six-step post-edit update obligation.
- The project's existing framework (`CLAUDE.md` + `.claude/skills/` + `.claude/agents/`) provides workflow orchestration (missions → specs → epics → research → plans → implementation). DOX provides documentation governance. The two are **additive, not competing**.
- DOX was created June 1–2, 2026 (8 days before this report). It is brand new with no stable versioning.
- Four integration approaches exist, ranging from zero-friction (add root `AGENTS.md`) to high-friction (replace `CLAUDE.md` governance with a full DOX hierarchy). The two most actionable are detailed in Critical Findings.
- A structural tension exists: the current project is Claude Code-centric (`CLAUDE.md`), while DOX targets `AGENTS.md`. DOX's README claims Claude Code compatibility — verify before full adoption.

---

## Coverage Map

- Fetched and read `https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md` verbatim (full 83 lines)
- Fetched `https://github.com/agent0ai/dox` repository overview and README
- Read `.claude/hooks/hooks.json` and `.claude/hooks/session-start`
- Read `README.md`
- Read `CLAUDE.md` (available in session context)
- Scanned full directory tree via codebase-locator (comprehensive scope, 109 files across 23 directories)

---

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: DOX is a Protocol, Not a Package

**Observation:** The entire DOX framework consists of one Markdown file. Installation is: copy the file into your project's `AGENTS.md`.

**Direct consequence:** Integration requires no build steps, no dependencies, no API surface learning. The cost of adoption is the behavioral obligation it imposes on agents (pre-edit traversal + post-edit doc updates).

**Evidence:** https://raw.githubusercontent.com/agent0ai/dox/main/README.md (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
## Installation

No installation, dependencies or packages needed.

Simply copy the contents of AGENTS.md to your project's AGENTS.md.
```

---

### Finding 2: DOX Defines a Strict Six-Step Read Protocol and Six-Step Closeout Protocol

**Observation:** DOX mandates that before any edit, the agent must: (1) read root AGENTS.md, (2) identify every file/folder to touch, (3) walk root-to-target paths, (4) read every AGENTS.md along each route, (5) follow parent-to-child chains where listed, (6) use the nearest AGENTS.md as the local contract. After editing, the agent must update the nearest owning AGENTS.md, refresh Child DOX Indexes, and remove stale text.

**Direct consequence:** Any skill or agent that modifies files in a DOX-governed project must include these protocols in its instruction set, or DOX will be ignored in practice. The session-start hook, implementer-prompt, and individual SKILL.md files are the natural injection points.

**Evidence:** https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
## Read Before Editing

1. Read the root AGENTS.md (this file)
2. Identify every file and folder you intend to touch
3. Walk the path from the repository root to each target
4. At each level, check for an AGENTS.md file and read it
5. If a parent lists a Child DOX, and that child's scope contains your target, read it and continue
6. Use the nearest AGENTS.md as the local contract; parents supply repo-wide rules
```

---

### Finding 3: DOX Child AGENTS.md Schema Is Structurally Compatible With Existing SKILL.md Files

**Observation:** DOX mandates this section order for every child `AGENTS.md`: Purpose, Ownership, Local Contracts, Work Guidance, Verification, Child DOX Index. The existing SKILL.md files already contain Purpose-equivalent (`## Role`, `## Goal`), Work Guidance-equivalent (protocol sections), and Verification-equivalent (output format / completion criteria) sections — but do not use the DOX schema headings and lack Ownership and Child DOX Index sections.

**Direct consequence:** Aligning SKILL.md files to the DOX child schema is an incremental rename-and-add operation, not a rewrite. The substantive content is already present.

**Evidence (DOX schema):** https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
## Child Doc Shape

Default section order for every AGENTS.md (omit sections that don't apply):

1. Purpose
2. Ownership
3. Local Contracts
4. Work Guidance
5. Verification
6. Child DOX Index
```

---

### Finding 4: The Project Has One Flat Governance File (CLAUDE.md); DOX Would Distribute It

**Observation:** All agent governance — workflow pipeline, skill descriptions, directory structure, plan format, agent roles — is concentrated in `CLAUDE.md` at the project root. This file is ~200 lines of dense instruction governing ten skill domains, six agent types, two MCP servers, and a multi-stage pipeline. There is no per-directory contract today.

**Direct consequence:** Any subagent working in `.claude/skills/researcher/` must load the entire root CLAUDE.md to understand its local context. DOX would place a 20-line AGENTS.md inside `.claude/skills/researcher/` with the researcher's Purpose, Ownership, and Local Contracts — and the root CLAUDE.md would shrink to only cross-cutting rules.

**Evidence (current flat structure):** `CLAUDE.md:1-200` (loaded in session context)
**Evidence (session-start hook):** `.claude/hooks/session-start:4-28`
**Excerpt:**
```bash
context="You have workflow skills for software development available in this project.

## Available Workflow Skills

/mission-architect — Greenfield projects: discover vision, output mission statement to thoughts/shared/missions/. Use before /specifier.
...
```

---

### Finding 5: AGENTS.md vs CLAUDE.md — Platform Compatibility Requires Verification

**Observation:** Claude Code natively reads `CLAUDE.md` files. DOX targets `AGENTS.md`. DOX's README claims compatibility with Claude Code, but the project is 8 days old and no Claude Code changelog confirming `AGENTS.md` support was found in this research. The two file names may both be read by current Claude Code, or `AGENTS.md` support may be absent.

**Direct consequence:** Full DOX adoption depends on confirming Claude Code reads `AGENTS.md` in addition to or instead of `CLAUDE.md`. Without this confirmation, distributed `AGENTS.md` files would be invisible to Claude Code agents.

**Evidence:** https://github.com/agent0ai/dox README (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
Works with: Codex, Claude Code, OpenCode and any agent that supports AGENTS.md
```

---

### Finding 6: The `thoughts/shared/` Artifact Directories Have No Local Contracts

**Observation:** The directories `thoughts/shared/plans/`, `thoughts/shared/research/`, `thoughts/shared/qa/` are the most populated directories (34, 25, and 4 files respectively) but contain no governance files — no AGENTS.md, no README, no schema document. File format contracts for these directories live only in `CLAUDE.md:135-165`.

**Direct consequence:** Subagents writing to `thoughts/shared/plans/` or reading from it must reference the root CLAUDE.md for format guidance. A child AGENTS.md at each artifact directory would co-locate format specs with the artifacts themselves.

**Evidence:** Verified by directory scan — no governance files found in `thoughts/shared/` subdirectories.

---

## Detailed Technical Analysis

### DOX Core Architecture

#### Hierarchy Model

DOX structures documentation as a tree:
- **Root AGENTS.md**: project-wide instructions, global preferences, durable workflow rules, Child DOX Index of direct-child domains
- **Child AGENTS.md files**: domain-specific instructions, their own Child DOX Index
- **Proximity rule**: the closer a doc is to the work, the more specific and practical it must be

**Evidence:** https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
## Hierarchy

- Root AGENTS.md contains: project-wide instructions, global preferences, durable workflow rules, top-level Child DOX Index
- Child AGENTS.md files contain: domain-specific instructions, their own Child DOX Index
- Each parent explains what the direct children cover vs. what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be
```

#### User Preferences Section

DOX designates a **User Preferences** section in the root AGENTS.md as a durable registry for behavioral changes requested by the user. This is a defined, standard slot — not ad-hoc comments.

**Evidence:** https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
## User Preferences

Use this section to document durable behavior changes the user has requested.
```

**Direct consequence:** The existing project has no equivalent durable preference registry. User preferences currently live in memory files at `/home/eichens/.claude/projects/...memory/`. A DOX User Preferences section in the root `AGENTS.md` would make preferences project-scoped and visible to any agent without memory lookup.

#### Style Contract (Anti-Patterns DOX Prohibits)

DOX enforces: keep docs concise and operational; document stable contracts, not diary entries; do not duplicate rules across files; delete stale notes instead of explaining history.

**Evidence:** https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md (Type: official_docs, Date: 2026-06, Authority: high)
**Excerpt:**
```markdown
- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs, concrete details in child docs
- Do not duplicate rules across files unless each scope needs a local version
- Delete stale notes instead of explaining history
```

---

### Current Framework Structure (Verified)

#### Entry Points

- `CLAUDE.md` — primary project-level instruction file, ~200 lines, governs all agent behavior
- `.claude/hooks/session-start` — bash script injecting workflow skill awareness at session start
- `.claude/hooks/hooks.json:3-6` — binds SessionStart trigger to `startup|clear|compact` events

**Evidence:** `.claude/hooks/hooks.json:1-16`
**Excerpt:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [{ "type": "command", "command": ".claude/hooks/session-start", "async": false }]
```

#### Skill Structure

Each of the 10 workflow/quality skills lives in `.claude/skills/<skill-name>/SKILL.md`. The subagent-driven-development skill has 3 additional prompt template files:
- `implementer-prompt.md` — governs the implementer subagent
- `spec-reviewer-prompt.md` — governs spec review after each task
- `code-quality-reviewer-prompt.md` — governs quality review after each task

**Evidence:** Codebase-locator scan, `.claude/skills/subagent-driven-development/` directory

#### Artifact Directory Population

As of 2026-06-09:
- `thoughts/shared/plans/` — 34 files (active; date range 2026-01-17 to 2026-03-03)
- `thoughts/shared/research/` — 25 files (active; date range 2025-12-20 to 2026-03-03)
- `thoughts/shared/qa/` — 4 files (date range 2026-01-17 to 2026-01-18)
- `thoughts/shared/epics/`, `thoughts/shared/features/`, `thoughts/shared/missions/`, `thoughts/shared/specs/` — all empty

**Evidence:** Codebase-locator scan, directory structure confirmed.

---

## Integration Approaches

Four distinct approaches are described below, ordered by implementation effort. These are observations about what would be structurally required — not recommendations.

### Approach A: Additive Root AGENTS.md (Zero-Friction)

**What it requires:**
- Create `AGENTS.md` at project root containing the DOX root template (Purpose, Ownership, User Preferences, Child DOX Index)
- The Child DOX Index lists: `.claude/skills/`, `.claude/agents/`, `thoughts/shared/`, `.claude/mcp/`
- `CLAUDE.md` is left entirely unchanged

**What it provides:**
- DOX traversal protocol applies to any agent that reads AGENTS.md
- User Preferences has a standard project-scoped home
- Establishes the DOX hierarchy without changing existing files

**What it does not provide:**
- Local contracts at subdirectory boundaries (those require child AGENTS.md files)
- DOX closeout compliance by existing skills (their prompts are unchanged)

**Structural prerequisite:** Confirm Claude Code reads `AGENTS.md` in addition to `CLAUDE.md`.

---

### Approach B: Child AGENTS.md at Domain Boundaries (Incremental)

**What it requires:**
- Approach A plus child `AGENTS.md` files in:
  - `.claude/skills/<each-skill>/` — Purpose, Ownership, Local Contracts for that skill
  - `.claude/agents/` — Purpose, Ownership, role definitions for each agent type
  - `thoughts/shared/plans/` — file format contract, naming convention, STATE protocol
  - `thoughts/shared/research/` — file format contract, evidence standards
  - `thoughts/shared/qa/` — file format contract, QA report schema

**What it provides:**
- Local contracts co-located with the code/artifacts they govern
- Subagents working in a subdirectory get scoped instructions without loading the full CLAUDE.md
- CLAUDE.md can gradually shrink to only cross-cutting rules

**What it does not provide:**
- Automatic maintenance — the DOX closeout protocol still requires explicit wiring into skill prompts

---

### Approach C: DOX Closeout Wired into SDD Workflow (Behavioral Integration)

**What it requires:**
- Add a DOX closeout step to `implementer-prompt.md` in `.claude/skills/subagent-driven-development/`
- After each PLAN-XXX task, the implementer must: check changed paths against the DOX chain, update nearest owning AGENTS.md, refresh affected Child DOX Indexes, remove stale text

**What it provides:**
- Implementation artifacts generate and maintain DOX documentation automatically
- The framework self-documents as it builds software

**What it does not provide:**
- DOX compliance during research, planning, and review stages (only SDD is wired)

---

### Approach D: Full DOX Migration (High Friction)

**What it requires:**
- All of Approaches A, B, C
- Migrate governance content from `CLAUDE.md` into the DOX hierarchy
- CLAUDE.md becomes a thin pointer: "This project uses DOX. See AGENTS.md."
- Session-start hook updated to reference AGENTS.md structure

**What it provides:**
- Complete DOX adoption; all agent behavior governed by distributed, proximity-aware contracts
- Maximum token efficiency for subagents (they load only local contracts)

**Structural risk:**
- CLAUDE.md is the authoritative file for Claude Code today. Hollowing it out requires confirmed AGENTS.md support in Claude Code. If Claude Code does not read AGENTS.md, agents will lose their governance context.

---

## Verification Log

- `Verified:` https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md — full 83 lines retrieved verbatim
- `Verified:` https://github.com/agent0ai/dox — README confirmed consistent with AGENTS.md content
- `Verified:` `.claude/hooks/hooks.json` — read directly, lines 1-16
- `Verified:` `.claude/hooks/session-start` — read directly, lines 1-43
- `Verified:` `README.md` — read directly, lines 1-149
- `Verified:` Directory scan via codebase-locator — all .claude/ and thoughts/shared/ paths confirmed
- `Spot-checked excerpts captured:` yes

---

## Open Questions / Unverified Claims

1. **Does Claude Code read `AGENTS.md` files in subdirectories?** DOX's README claims Claude Code compatibility, but no Claude Code changelog, official documentation, or release note confirming `AGENTS.md` support was found. The claim comes solely from the DOX README (8 days old). **What was tried:** web search for "Claude Code AGENTS.md support" — no authoritative result found. **Missing:** official Claude Code documentation or changelog entry.

2. **What happens when AGENTS.md and CLAUDE.md conflict?** DOX defines proximity-wins for conflicts between its own files, but does not address conflicts with CLAUDE.md. **What was tried:** full read of AGENTS.md — no mention of CLAUDE.md. **Missing:** any documented precedence rule.

3. **Does the DOX bootstrap command (`Initialize DOX tree`) work with Claude Code's Skill tool / Agent tool architecture?** DOX's README describes a single conversational command to bootstrap. The current project uses skills and structured agent spawning. Compatibility of the bootstrap flow with the existing architecture is unconfirmed. **What was tried:** no test of the command was run. **Missing:** empirical test.

---

## References

**Web Research Citations:**
- https://raw.githubusercontent.com/agent0ai/dox/main/AGENTS.md (Type: official_docs, Date: 2026-06, Verified: 2026-06-09) — full verbatim source of DOX specification
- https://github.com/agent0ai/dox (Type: official_docs, Date: 2026-06, Verified: 2026-06-09) — repository overview and README
- https://raw.githubusercontent.com/agent0ai/dox/main/README.md (Type: official_docs, Date: 2026-06, Verified: 2026-06-09) — installation and compatibility claims

**Codebase Citations:**
- `.claude/hooks/hooks.json:1-16`
- `.claude/hooks/session-start:1-43`
- `README.md:1-149`
- `CLAUDE.md:1-200` (available in session context)
