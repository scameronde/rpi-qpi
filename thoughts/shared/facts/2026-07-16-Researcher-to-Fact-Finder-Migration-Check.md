---
date: 2026-07-16
fact-finder: fact-finder-migration-check
topic: "Completeness of /researcher -> /fact-finder rename and thoughts/shared/research -> thoughts/shared/facts path rename"
status: complete
coverage:
  - .claude/ (agents, skills, hooks, settings.local.json)
  - CLAUDE.md, GUIDE.md, README.md, ORBIT-V4-CONCEPT.md (root docs)
  - doc/agents/ (legacy opencode-format mirror tree)
  - dist/orbit/ (build output tree)
  - docs/superpowers/, .superpowers/brainstorm/ (historical planning archives)
  - thoughts/shared/{facts,plans,qa,features}/, thoughts/projects/
  - presentation/The_Agentic_Assembly_LineV3.html
  - Delegated repo-wide grep sweeps via codebase-locator (2 passes); personally verified 13 files with Read
---

# Research: Completeness of /researcher → /fact-finder and thoughts/shared/research → thoughts/shared/facts rename

## Executive Summary

- No file in the repository contains the literal path `thoughts/research` (without `shared/`) — the old path was always `thoughts/shared/research/`, and that path has zero references inside `.claude/` (the directory Claude Code reads at runtime).
- No `/researcher` slash-command string, `.claude/agents/researcher.md`, or `.claude/skills/researcher/` remain inside `.claude/`. `.claude/skills/fact-finder/` exists and is populated.
- One live config file, `.claude/settings.local.json:19`, still contains the substring `.claude/agents/researcher.md` inside a historical `rm` permission-allowlist entry; the file itself no longer exists on disk.
- `CLAUDE.md:127-129` documents top-level `agent/`, `skills/`, `tool/` directories as "reference only" mirrors, but none of these three directories exist in the current working tree.
- `doc/agents/researcher.md` still exists as a full, unrenamed legacy document referencing `/researcher` and `thoughts/shared/research/`; no `doc/agents/fact-finder.md` counterpart exists.
- `dist/orbit/` (a build-output tree last touched 2026-06-12, before any PLAN-0xx rename commit) contains extensive un-renamed content, including a whole skill directory `dist/orbit/skills/researcher/SKILL.md` and a `dist/orbit/hooks-handlers/session-start` that references `/researcher` and `thoughts/shared/research/` throughout.
- `thoughts/shared/features/2026-06-10-DOX-Skills.md` contains a frontmatter field `research-source:` and body prose citing `thoughts/shared/research/2026-06-09-DOX-Framework-Integration.md` (old path).
- `thoughts/shared/plans/AGENTS.md:19` contains a "Local Contracts" template excerpt showing `Research report(s) used: thoughts/shared/research/...` (old path), inside a governance file that is not itself a frozen historical report.
- Two hundred+ historical files under `thoughts/shared/{facts,plans,qa,features}/` and `thoughts/projects/` retain "Researcher" / `thoughts/shared/research/` text as part of their original, dated content.

## Coverage Map

Inspected directly with `Read`: `.claude/settings.local.json`, `doc/agents/researcher.md`, `dist/orbit/hooks-handlers/session-start`, `dist/orbit/skills/researcher/SKILL.md`, `ORBIT-V4-CONCEPT.md`, `CLAUDE.md` (directory-structure section), `thoughts/shared/features/2026-06-10-DOX-Skills.md`, `thoughts/shared/plans/AGENTS.md`, `.claude/agents/AGENTS.md`, `.claude/skills/claude-code-extensions/SKILL.md`, `thoughts/shared/plans/2026-07-16-Rename-Researcher-to-Fact-Finder-STATE.md`.

Delegated repo-wide scans (via `codebase-locator`, comprehensive scope) covering `.claude/`, `thoughts/`, `doc/`, `dist/`, `docs/superpowers/`, `.superpowers/`, root markdown files, and `presentation/`. Verified via `git log` that `dist/orbit/` predates the rename commits.

**Not inspected**: binary content of `presentation/ORBIT.pptx` (grep cannot read it directly; a prior report cited 9 slide-XML fragments containing old names — not re-verified in this pass, moved to Open Questions).

## Critical Findings (Verified, Planner Attention Required)

### 1. Stale permission string in live settings file
- **Observation:** `.claude/settings.local.json:19` contains the string `.claude/agents/researcher.md` inside a `Bash(rm ...)` permission-allowlist entry.
- **Direct consequence:** The file `.claude/agents/researcher.md` does not exist on disk (confirmed absent during this session's file reads and by the earlier locator sweep), so this permission string references a non-existent path.
- **Evidence:** `.claude/settings.local.json:19`
- **Excerpt:**
  ```
  "Bash(rm .claude/agents/mission-architect.md .claude/agents/feature-architect.md .claude/agents/specifier.md .claude/agents/epic-planner.md .claude/agents/researcher.md .claude/agents/planner.md .claude/agents/implementation-controller.md .claude/agents/coder.md)",
  ```

### 2. CLAUDE.md documents three top-level directories that do not exist
- **Observation:** `CLAUDE.md:127-129` lists `agent/`, `skills/`, `tool/` as top-level directories containing "Original opencode agent definitions (reference only)".
- **Direct consequence:** `find . -maxdepth 1` run from the repository root returns no `agent`, `skills`, or `tool` entries — these directories are absent from the working tree that CLAUDE.md describes.
- **Evidence:** `CLAUDE.md:127-129`
- **Excerpt:**
  ```
  agent/            # Original opencode agent definitions (reference only)
  skills/           # Original opencode skill definitions (reference only)
  tool/             # Original opencode tool source files (crawl4ai.ts, searxng-search.ts)
  ```

### 3. `doc/agents/researcher.md` is a complete, unrenamed legacy agent document
- **Observation:** The file exists in full, titled "researcher — Raw Notes", describing itself as "invoked via `/researcher` command" with output path `thoughts/shared/research/YYYY-MM-DD-[Topic].md`. No `doc/agents/fact-finder.md` exists anywhere in the tree.
- **Direct consequence:** Any reader of `doc/agents/` encounters the pre-rename name and pre-rename output path for this role, with no renamed counterpart present.
- **Evidence:** `doc/agents/researcher.md:1-8,24`
- **Excerpt:**
  ```
  # researcher — Raw Notes

  ## Role
  - Agent type: user-facing orchestrator (invoked via `/researcher` command)
  - Persona name in prompt: "Researcher" / "Research Architect"
  ...
  - Output: `thoughts/shared/research/YYYY-MM-DD-[Topic].md`
  ```

### 4. `dist/orbit/` build output is entirely unrenamed and predates the rename commits
- **Observation:** `dist/orbit/skills/researcher/SKILL.md` exists with `name: researcher` in frontmatter and "You are the **Researcher**" in the body. `dist/orbit/hooks-handlers/session-start` defines a session-start context string that instructs `/researcher` (not `/fact-finder`) as the fourth pipeline stage, with output path `thoughts/shared/research/`.
- **Direct consequence:** `git log -1 --format=%cI` for `dist/orbit/skills/researcher/SKILL.md` returns `2026-06-12T10:16:52+02:00`, which predates every `PLAN-0xx` rename commit in the current branch's log (earliest rename-related commit referenced is dated 2026-07-16). The `dist/orbit/` tree has not been regenerated since the rename.
- **Evidence:** `dist/orbit/skills/researcher/SKILL.md:1-9`, `dist/orbit/hooks-handlers/session-start:12,18-20,24,27`
- **Excerpt:**
  ```
  ---
  name: researcher
  description: Map the codebase for a spec or question. ... Outputs a research report to thoughts/shared/research/. Use before /planner.
  ---

  # Research Architect: Codebase Mapping & Documentation

  You are the **Researcher**. You are the **Surveyor**; the **Planner** is your Architect.
  ```
  ```
  /researcher — Map the codebase for a spec or question. Spawns codebase agents for isolation. Output to thoughts/shared/research/. Use before /planner.
  ...
  Greenfield:  /mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement
  Brownfield:  /feature-architect → /epic-planner → /researcher → /planner → /implement
  Small fix:   /researcher → /planner → /implement

  ## Rules

  - Always run /researcher before /planner — planner needs a verified research report.
  ```

### 5. Feature brief frontmatter and body cite the old research path
- **Observation:** `thoughts/shared/features/2026-06-10-DOX-Skills.md` contains a frontmatter field `research-source: "thoughts/shared/research/2026-06-09-DOX-Framework-Integration.md"` and body text at lines 21-22 listing `thoughts/shared/research/` as an existing directory and citing the same path as a research source.
- **Direct consequence:** This file is dated 2026-06-10, before the rename plan (dated 2026-07-16) executed; it was not among the 22 tasks (`PLAN-001` through `PLAN-022`) listed as completed in `thoughts/shared/plans/2026-07-16-Rename-Researcher-to-Fact-Finder-STATE.md:5`, nor is it listed in that file's "Non-goals" line.
- **Evidence:** `thoughts/shared/features/2026-06-10-DOX-Skills.md:1-9,21-22`
- **Excerpt:**
  ```
  ---
  date: 2026-06-10
  feature-architect: feature-architect-skill
  ...
  research-source: "thoughts/shared/research/2026-06-09-DOX-Framework-Integration.md"
  ...
  ---
  ```
  ```
  - Existing partial DOX tree: `AGENTS.md` files already present at `thoughts/shared/`, `thoughts/shared/plans/`, `thoughts/shared/research/`, `thoughts/shared/qa/`, `.claude/agents/`
  - Research: `thoughts/shared/research/2026-06-09-DOX-Framework-Integration.md` — full DOX analysis and four integration approaches documented
  ```

### 6. `thoughts/shared/plans/AGENTS.md` template still shows the old research path
- **Observation:** `thoughts/shared/plans/AGENTS.md:19`, inside a "Local Contracts" section documenting the Plan file format, shows `- Research report(s) used: thoughts/shared/research/...` as the template line for the Inputs section of a plan.
- **Direct consequence:** This line does not match the plan-file format documented in the top-level `CLAUDE.md:145`, which already reads `thoughts/shared/facts/...`. `thoughts/shared/plans/2026-07-16-Rename-Researcher-to-Fact-Finder-STATE.md` lists `PLAN-003` through `PLAN-008` as the governance-file update tasks, none of which name `thoughts/shared/plans/AGENTS.md`, and this file is not named in that STATE file's "Non-goals" line either.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:14-19`
- **Excerpt:**
  ```
  ## Local Contracts

  **Plan file format:**
  ```markdown
  # Plan: <title>

  ## Inputs
  - Research report(s) used: thoughts/shared/research/...
  ```

## Detailed Technical Analysis (Verified)

### Live `.claude/` runtime tree — rename complete apart from Finding 1
- `.claude/skills/fact-finder/SKILL.md` exists and its frontmatter description reads "Outputs a research report to thoughts/shared/facts/."
- `.claude/skills/planner/SKILL.md` reads "Use after /fact-finder and before /implement."
- `.claude/hooks/session-start` (the live hook, distinct from the stale `dist/orbit/hooks-handlers/session-start` copy in Finding 4) reads "- Always run /fact-finder before /planner..." at line 24.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:3`, `.claude/skills/planner/SKILL.md:3`, `.claude/hooks/session-start:24`

### `web-search-researcher` is a distinct, unrelated agent name
- All remaining occurrences of the substring "researcher" inside `.claude/agents/`, `.claude/skills/*/SKILL.md`, `CLAUDE.md`, and `GUIDE.md` that were checked resolve to `web-search-researcher.md` (an agent name unrelated to the renamed Researcher→Fact-Finder role) or to the generic English phrase "web researcher" in prose.
- **Evidence:** `.claude/agents/AGENTS.md:30`, `CLAUDE.md:73,134`

### Illustrative example text, not a real reference
- `.claude/skills/claude-code-extensions/SKILL.md:196` contains the line `tools: Agent(worker, researcher), Read, Bash  # Only worker and researcher` as generic illustrative syntax inside a code fence demonstrating the `tools:` frontmatter field — not a reference to any file or agent that exists in this repository.
- **Evidence:** `.claude/skills/claude-code-extensions/SKILL.md:195-197`

### `ORBIT-V4-CONCEPT.md` documents the rename as a historical decision, not a leftover
- `ORBIT-V4-CONCEPT.md:124` contains a table row `| Researcher | **Fact-Finder** | Umbenannt. ... |` — this is prose describing the V3→V4 rename decision itself, not an unrenamed reference.
- **Evidence:** `ORBIT-V4-CONCEPT.md:124`

### Historical write-once report bodies (frozen, dated before the rename)
- The bulk of remaining "researcher" / `thoughts/shared/research` matches (~85-95 files) are inside `thoughts/shared/facts/*.md`, `thoughts/shared/plans/*.md` (excluding `AGENTS.md`, see Finding 6), `thoughts/shared/qa/*.md`, and `thoughts/projects/*/*.md` — each dated before 2026-07-16 and describing the codebase as it existed at time of writing.
- **Evidence (sample):** `thoughts/shared/plans/2026-01-17-OpenCode-Agent-Dev-Skill.md`, `thoughts/shared/facts/2026-01-18-Codebase-Pattern-Finder-Agent-Communication.md`, `thoughts/shared/facts/2025-12-20-OpenCode-Framework-and-RPIQR-Project.md:130,324,329,416`

### `docs/superpowers/` and `.superpowers/brainstorm/` — archived design material predating the rename
- `docs/superpowers/plans/2026-06-09-workflow-restructure.md` and `docs/superpowers/specs/2026-06-09-workflow-restructure-design.md`, plus multiple HTML files under `.superpowers/brainstorm/70316-1781003572/content/`, contain "researcher" text dated 2026-06-09, before the 2026-07-16 rename plan existed.
- **Evidence:** `docs/superpowers/plans/2026-06-09-workflow-restructure.md:21`, `.superpowers/brainstorm/70316-1781003572/content/three-approaches.html:90`

## Verification Log

- `Verified:` `.claude/settings.local.json`, `doc/agents/researcher.md`, `dist/orbit/hooks-handlers/session-start`, `dist/orbit/skills/researcher/SKILL.md`, `ORBIT-V4-CONCEPT.md`, `CLAUDE.md`, `thoughts/shared/features/2026-06-10-DOX-Skills.md`, `thoughts/shared/plans/AGENTS.md`, `.claude/agents/AGENTS.md`, `.claude/skills/claude-code-extensions/SKILL.md`, `thoughts/shared/plans/2026-07-16-Rename-Researcher-to-Fact-Finder-STATE.md`
- `Spot-checked excerpts captured:` yes
- `Additional shell verification:` `find . -maxdepth 1` (confirmed absence of top-level `agent/`, `skills/`, `tool/`); `git log -1 --format=%cI -- dist/orbit/skills/researcher/SKILL.md` (returned 2026-06-12T10:16:52+02:00, predating the 2026-07-16 rename commit series)

## Open Questions / Unverified Claims

- **`presentation/ORBIT.pptx`**: A binary PowerPoint file. This report did not re-open or re-extract its slide XML. A prior fact-finder report (`thoughts/shared/facts/2026-07-16-Rename-Researcher-to-Fact-Finder.md`, per its own citations) reported 9 slide-XML fragments still containing "researcher"/"research/" text, and the rename STATE file's Non-Goals line marks this file as "intentionally excluded — user will edit manually." Not independently re-verified in this pass — could not confirm current content with `Read` (binary format).
- **Completeness of the ~85-95 historical `thoughts/shared/{facts,plans,qa}/*.md` file list**: Only a representative sample was opened with `Read`; the full enumerated list came from delegated `codebase-locator` sweeps. Individual line numbers for files not explicitly quoted above were not personally re-verified.
- **Whether `dist/orbit/` is expected to be regenerated from `.claude/` sources or is a frozen build snapshot**: No build script, package.json, or generator invocation was located or inspected in this pass to determine whether `dist/orbit/` is auto-regenerated (in which case its staleness might self-resolve on next build) or manually maintained.

## References

**Codebase Citations:**
- `.claude/settings.local.json:19`
- `CLAUDE.md:73,127-129,134,145`
- `doc/agents/researcher.md:1-30`
- `dist/orbit/skills/researcher/SKILL.md:1-9`
- `dist/orbit/hooks-handlers/session-start:1-42`
- `ORBIT-V4-CONCEPT.md:115-129`
- `thoughts/shared/features/2026-06-10-DOX-Skills.md:1-24`
- `thoughts/shared/plans/AGENTS.md:10-24`
- `.claude/agents/AGENTS.md:25-34`
- `.claude/skills/claude-code-extensions/SKILL.md:190-200`
- `.claude/skills/fact-finder/SKILL.md:3`
- `.claude/skills/planner/SKILL.md:3`
- `.claude/hooks/session-start:24`
- `thoughts/shared/plans/2026-07-16-Rename-Researcher-to-Fact-Finder-STATE.md:1-59`
