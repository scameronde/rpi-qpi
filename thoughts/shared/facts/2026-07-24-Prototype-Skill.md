---
date: 2026-07-24
fact-finder: fact-finder-skill
topic: "Prototype Skill"
status: complete
coverage:
  - .claude/skills/*/SKILL.md (all 14 skills)
  - .claude/skills/AGENTS.md
  - .claude/skills/claude-code-extensions/SKILL.md
  - .claude/agents/*.md (existence check only)
  - .claude/settings.json
  - thoughts/shared/AGENTS.md
  - thoughts/shared/facts/AGENTS.md
  - thoughts/shared/qa/AGENTS.md
  - thoughts/shared/features/2026-07-24-Prototype-Skill.md
  - thoughts/shared/epics/2026-07-24-Prototype-Skill.md (input epic)
  - CLAUDE.md
  - EnterWorktree / ExitWorktree tool schemas (primary-source, non-file evidence)
  - Claude Code official docs (code.claude.com/docs/en/worktrees.md) via delegated web research
  - thoughts/ directory (comprehensive historical search)
---

# Research: Prototype Skill

## Executive Summary

- The Agent tool's `isolation: "worktree"` option is documented in this repo only as a one-line subagent-frontmatter field (`.claude/skills/claude-code-extensions/SKILL.md:170`) and is not invoked live anywhere in `.claude/skills/` or `.claude/agents/`. External Claude Code documentation states it is per-subagent-call and torn down when that single call returns — it cannot back a multi-turn "build, show, ask, iterate" skill session.
- A separate, session-scoped mechanism exists for exactly this purpose: the `EnterWorktree` / `ExitWorktree` tools. `EnterWorktree` creates a worktree under `.claude/worktrees/` and switches the current session's working directory into it, persisting across as many subsequent tool calls/turns as needed until `ExitWorktree` is called.
- `ExitWorktree` with `action: "remove"` refuses to delete a worktree that has uncommitted files or unmerged commits unless `discard_changes: true` is explicitly passed — it does not silently discard real work.
- No skill or agent file in this repo issues `git worktree` commands directly via Bash; the only two mechanisms available are the Agent tool's `isolation: "worktree"` (per-call, ephemeral) and the `EnterWorktree`/`ExitWorktree` tool pair (session-scoped, persistent).
- `thoughts/shared/AGENTS.md`'s directory-assignment table (lines 17-27) and Child DOX Index (lines 37-41) have an exact, repeatable format; `features/` and `epics/` currently have no directory-level `AGENTS.md` of their own, while `plans/`, `facts/`, `qa/` do.
- No existing `SKILL.md` in this repo uses `AskUserQuestion` for a fixed multi-way enum decision (e.g., go/no-go/iterate) — every existing usage is open-ended discovery or a binary confirm/STOP gate. The `/prototype` skill's decision step has no direct precedent to copy verbatim.
- `thoughts/shared/prototypes/` does not currently exist; no prior epic, plan, or fact report in this repo's history documents any actual (non-planning) use of worktree-based isolation.

## Coverage Map

- Read directly: `CLAUDE.md`, `thoughts/shared/AGENTS.md`, `thoughts/shared/facts/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`, `thoughts/shared/features/2026-07-24-Prototype-Skill.md`, `.claude/skills/feature-architect/SKILL.md` (full), `.claude/skills/implement/SKILL.md` (partial, lines 1-100), `.claude/skills/claude-code-extensions/SKILL.md` (lines 140-199), `.claude/skills/AGENTS.md`, `.claude/settings.json`.
- Delegated and spot-verified: `codebase-locator` (file topology across `.claude/skills`, `AGENTS.md` files, worktree grep, prototypes dir check), `codebase-analyzer` (`.claude/skills/feature-architect/SKILL.md` and `.claude/skills/fact-finder/SKILL.md` structural analysis), `codebase-pattern-finder` (git-worktree/isolation usage patterns repo-wide), `thoughts-locator` (historical documents for prototype/worktree topics), `claude-code-guide` (external Claude Code documentation on `isolation: "worktree"` semantics).
- Directly loaded and read as primary evidence: `EnterWorktree` and `ExitWorktree` tool schemas (via `ToolSearch`), which are authoritative on tool behavior independent of any repo file.
- Not inspected: `.claude/agents/*.md` file contents (existence only, confirmed via locator agent — no `isolation:` key present in any of them); `dist/orbit/` build artifacts (excluded as generated copies, not source).

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: Agent tool `isolation: "worktree"` is per-call and ephemeral — not usable to persist a multi-turn skill session

- **Observation:** In this repository, `isolation: worktree` appears exactly once, as a documented frontmatter option for defining a subagent, with a single trailing comment and no further elaboration.
- **Direct consequence:** No file in this repo demonstrates or documents multi-turn reuse of a worktree created via this mechanism. Per official Claude Code documentation (obtained via delegated web research), each Agent tool call using `isolation: "worktree"` receives a temporary worktree removed automatically when that single subagent call finishes without changes — the worktree's lifetime is scoped to one Agent invocation, not to an entire skill's duration across multiple conversational turns.
- **Evidence:** `.claude/skills/claude-code-extensions/SKILL.md:152-176`
- **Excerpt:**
  ```markdown
  ---
  name: code-reviewer           # Required. Lowercase, hyphens only.
  ...
  isolation: worktree           # worktree = isolated git worktree copy
  ---
  ```
- **Web Evidence:** https://code.claude.com/docs/en/worktrees.md (Type: official_docs, Authority: high, obtained via delegated `claude-code-guide` agent, 2026-07-24) — quoted as: "Each subagent gets a temporary worktree that Claude Code removes automatically when the subagent finishes without changes." and "The sweep skips a worktree that still holds work: changed or untracked files, or unpushed commits."

### Finding 2: `EnterWorktree` / `ExitWorktree` are separate, session-scoped tools that fit a multi-turn build/show/ask/iterate loop

- **Observation:** `EnterWorktree` creates a new git worktree inside `.claude/worktrees/` on a new branch and switches the *session's* working directory into it (not a single subagent call's directory). It remains active across as many subsequent tool calls and conversational turns as the skill needs, until `ExitWorktree` is explicitly called.
- **Direct consequence:** This tool pair — not Agent-tool `isolation: "worktree"` — is the mechanism capable of backing a "create once, code across many turns, iterate without recreation" session, which is what the epic's Acceptance Criteria require (worktree/branch persist across "iterate" rounds without recreation).
- **Evidence:** `EnterWorktree` tool schema (loaded via `ToolSearch("select:EnterWorktree,ExitWorktree")`, 2026-07-24) — primary-source tool definition, not a repo file.
- **Excerpt:**
  ```
  In a git repository: creates a new git worktree inside `.claude/worktrees/` on a new
  branch. The base ref is governed by the `worktree.baseRef` setting: `fresh` (default)
  branches from origin/<default-branch>; `head` branches from your current local HEAD.
  Switches the session's working directory to the new worktree.
  Use ExitWorktree to leave the worktree mid-session (keep or remove). On session exit,
  if still in the worktree, the user will be prompted to keep or remove it.
  ```
- **Requirements verbatim (no clean-main-tree requirement stated):** "Must be in a git repository, OR have WorktreeCreate/WorktreeRemove hooks configured in settings.json"; "Must not already be in a worktree session when creating a new worktree (`name`); switching into another existing worktree via `path` is allowed." No requirement of a clean main working tree appears anywhere in the schema.

### Finding 3: `ExitWorktree` refuses to discard real work — it does not silently delete uncommitted changes

- **Observation:** `ExitWorktree` takes `action: "keep" | "remove"` and an optional `discard_changes` flag. Per the schema: "only meaningful with `action: 'remove'`. If the worktree has uncommitted files or commits not on the original branch, the tool will REFUSE to remove it unless this is set to `true`. If the tool returns an error listing changes, confirm with the user before re-invoking with `discard_changes: true`."
- **Direct consequence:** Unconditional cleanup (a hard epic requirement) is achievable, but the skill's cleanup step must handle the refusal case explicitly — e.g., by passing `discard_changes: true` once the user has reached a final decision — rather than assuming a single `ExitWorktree` call always succeeds.
- **Evidence:** `ExitWorktree` tool schema (loaded via `ToolSearch("select:EnterWorktree,ExitWorktree")`, 2026-07-24).
- **Excerpt:**
  ```
  "discard_changes" (optional, default false): only meaningful with action: "remove".
  If the worktree has uncommitted files or commits not on the original branch, the tool
  will REFUSE to remove it unless this is set to true.
  ```

### Finding 4: `ExitWorktree` is scoped to worktrees *it* created — abnormal session termination is only partially covered

- **Observation:** `ExitWorktree`'s "Scope" section states it only operates on worktrees created by `EnterWorktree` in the current session, and explicitly: "If called outside an EnterWorktree session, the tool is a no-op." Separately, `EnterWorktree`'s own description states: "On session exit, if still in the worktree, the user will be prompted to keep or remove it."
- **Direct consequence:** If the user abandons the session mid-prototype without an explicit go/no-go/iterate decision, cleanup is not fully automatic-and-silent — the harness prompts the user to keep or remove at session exit. There is no evidence in this codebase or the tool schemas of a cleanup path that runs with zero user interaction on abnormal termination (e.g., a hard crash) beyond that exit-time prompt.
- **Evidence:** `ExitWorktree` tool schema, "Scope" section; `EnterWorktree` tool schema, "Behavior" section (both loaded via `ToolSearch`, 2026-07-24).

### Finding 5: No existing `SKILL.md` demonstrates a fixed go/no-go/iterate (or any fixed multi-way enum) `AskUserQuestion` decision pattern

- **Observation:** `AskUserQuestion` is used in exactly four workflow skills — `epic-planner`, `specifier`, `feature-architect`, `mission-architect` — and in every case it drives either (a) open-ended, adaptive discovery questions, or (b) a binary "STOP and recommend refinement" gate. None of these files present the user with a small, fixed set of named options (e.g., go/no-go/iterate) as their answer choices.
- **Direct consequence:** The `/prototype` skill's decision step is a new interaction pattern for this codebase — the Planner cannot point to an existing `SKILL.md` section as a structural template for the go/no-go/iterate prompt itself, only for the general fact that `AskUserQuestion` is the established tool for user-facing decisions.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:82,102-103`; `.claude/skills/mission-architect/SKILL.md:54,85,114,129`; `.claude/skills/epic-planner/SKILL.md:50,83`; `.claude/skills/specifier/SKILL.md:52,87`.
- **Excerpt (feature-architect, the closest existing "summarize and confirm" pattern):**
  ```markdown
  **Convergence check** — once clear, summarize and confirm:
  "Here's what I heard: [feature purpose], [core capabilities], [integration points],
  [non-goals]. Does this capture what you want?"
  ```

## Detailed Technical Analysis (Verified)

### `thoughts/shared/AGENTS.md` structure (for the `prototypes/` registration)

- **Observation:** The directory-assignment table and Child DOX Index have exact, repeatable row formats.
- **Evidence:** `thoughts/shared/AGENTS.md:17-27` (table) and `:37-41` (index).
- **Excerpt:**
  ```markdown
  **Directory assignments:**
  | Directory | Written by | Read by |
  |---|---|---|
  | `missions/` | `/mission-architect` | `/specifier` |
  | `features/` | `/feature-architect` | `/epic-planner` |
  ...
  | `qa/` | `/fact-finder` (QA mode) | human review |
  | `plans/` | `/planner` | `/implement` |
  ```
  ```markdown
  ## Child DOX Index

  - [plans/](plans/AGENTS.md) — Implementation plans (PLAN-XXX) and STATE tracking files
  - [facts/](facts/AGENTS.md) — Codebase fact reports
  - [qa/](qa/AGENTS.md) — QA review reports
  ```
- **Direct consequence:** A `prototypes/` row would read `| `prototypes/` | `/prototype` | `/feature-architect`, `/fact-finder` |` to match the existing column semantics (Written by / Read by). Only directories with their own `AGENTS.md` appear in the Child DOX Index — `features/` and `epics/` do not have one (confirmed by directory listing: only `AGENTS.md` exists at `thoughts/shared/`, `thoughts/shared/plans/`, `thoughts/shared/qa/`, `thoughts/shared/facts/`). Whether `prototypes/` needs its own child `AGENTS.md` (as `qa/`/`facts/`/`plans/` do) or can omit one (as `features/`/`epics/` do) is a Planner decision, not dictated by existing convention either way.

### Lowest-rigor existing artifact format precedent: `qa/AGENTS.md`

- **Observation:** `qa/` has the smallest required-frontmatter set of any artifact directory: `date`, `message_type`, `target`, `status` (4 fields) versus `facts/`'s 5-field frontmatter (`date`, `fact-finder`, `topic`, `status`, `coverage`) with a mandatory 7-section body.
- **Evidence:** `thoughts/shared/qa/AGENTS.md:15-23`.
- **Excerpt:**
  ```yaml
  ---
  date: YYYY-MM-DD
  message_type: QA_REPORT
  target: "[module or file name]"
  status: complete
  ---
  ```
- **Direct consequence:** If the Planner wants a lower-rigor precedent for the learnings-note template (per the epic's Open Questions), `qa/AGENTS.md`'s 4-field frontmatter with unstructured prose body is the simplest existing model in this repo — smaller than every other artifact directory's contract.

### `CLAUDE.md` pipeline table — exact current structure

- **Observation:** The "Workflow Pipeline" section lists three named flows as fenced-code arrow chains, followed by a single "Each stage produces artifacts..." table covering all seven pipeline stages.
- **Evidence:** `CLAUDE.md:9-36`.
- **Excerpt:**
  ```markdown
  ## Workflow Pipeline

  **Greenfield (new project):**
  ```
  /mission-architect → /specifier → /epic-planner → /fact-finder → /planner → /implement
  ```

  **Brownfield (new feature in existing system):**
  ```
  /feature-architect → /epic-planner → /fact-finder → /planner → /implement
  ```

  **Small change or bug fix:**
  ```
  /fact-finder → /planner → /implement
  ```
  ```
  A fourth flow (e.g., `**Explore first (optional):**` followed by a `/prototype → (feature-architect | fact-finder)` chain) would follow the same fenced-code-block pattern as the three existing entries, placed after line 24 and before the "Each stage produces artifacts..." table at line 26.
- **Separate table:** `CLAUDE.md:42-50` ("Workflow Skills") lists every skill with a one-line purpose — a `/prototype` row would follow the same `| `/skill-name` | Purpose |` format.

### `SKILL.md` frontmatter format — uniform across all workflow skills

- **Observation:** Every workflow `SKILL.md` inspected (`feature-architect`, `fact-finder` per delegated analysis, confirmed directly for `feature-architect` and `implement`) uses exactly two frontmatter keys: `name` and `description`. No `tools`, `model`, or other keys appear in any workflow skill's frontmatter (those keys exist only in the separate `.claude/agents/*.md` subagent-definition format documented at `claude-code-extensions/SKILL.md:152-176`).
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:1-4`; `.claude/skills/implement/SKILL.md:1-4`.
- **Excerpt:**
  ```yaml
  ---
  name: feature-architect
  description: Define a new feature in an existing system via conversation and light codebase scan. Use for brownfield additions — not greenfield projects. Outputs a feature brief to thoughts/shared/features/. Use before /epic-planner.
  ---
  ```
- **Direct consequence:** `prototype/SKILL.md` should use the same two-key frontmatter shape; there is no established convention for adding extra frontmatter keys at the `SKILL.md` (as opposed to `.claude/agents/*.md`) level in this repo.

### `feature-architect`'s Phase 1 context-loading mechanism (for the learnings-note handoff)

- **Observation:** `feature-architect` loads prior artifacts itself, directly, via `Glob` followed by `Read` — not via sub-agent delegation — as the mandatory first action of its execution protocol.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:66-78`.
- **Excerpt:**
  ```markdown
  ### Phase 1: Load Existing Context

  1. Use Glob to find:
     - `thoughts/shared/missions/*.md` — load the most recent or relevant mission
     - `thoughts/shared/specs/*.md` — load the corresponding spec
     - `thoughts/shared/epics/*.md` — skim titles to understand what's already planned/built
  ```
- **Direct consequence:** A `thoughts/shared/prototypes/*.md` Glob line added to this same Phase 1 list (and to `fact-finder`'s equivalent optional `thoughts-locator` delegation path) is the mechanism by which the learnings-note handoff described in the epic would actually get wired in — it reuses the exact existing self-executed `Glob`+`Read` pattern rather than introducing a new one.

### `fact-finder`'s own context-loading is delegation-based, not self-executed

- **Observation:** Unlike `feature-architect`, `fact-finder`'s "Phase 1: Context & Mapping" (its main-flow phase) is generic ("Read the user request. Decompose into research vectors. Delegate exploration to sub-agents.") — the actual mechanism for reading prior mission/spec/feature-brief/plan artifacts is a separate, situationally-invoked two-step `thoughts-locator` → `thoughts-analyzer` Agent-delegation chain, not a mandatory first step.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:554-557` (main Phase 1); `.claude/skills/fact-finder/SKILL.md:271-295` (thoughts-locator delegation pattern, per delegated `codebase-analyzer` finding, unverified directly by this session — see Open Questions).
- **Direct consequence:** For `fact-finder` specifically, wiring in the prototype learnings note as context means ensuring its situational `thoughts-locator` delegation is actually invoked when a prototype learnings note exists — not adding a new unconditional Glob step, since `fact-finder` has no such step for any artifact type today.

### No direct `git worktree` Bash usage anywhere in `.claude/skills` or `.claude/agents`

- **Observation:** Repo-wide search for `git worktree` inside `.claude/skills/*/SKILL.md` and `.claude/agents/*.md` returns zero matches. The only file mentioning "worktree" at all in `.claude/` is `claude-code-extensions/SKILL.md` (the one-line frontmatter reference already covered in Finding 1).
- **Evidence:** Delegated `codebase-pattern-finder` search (`grep -rn "git worktree" .claude/skills .claude/agents` → 0 matches; `grep -rln "worktree" .claude/` → single file), cross-checked by this session's own `find`/`grep` commands during the parallel research phase, which independently confirmed only `.claude/skills/claude-code-extensions/SKILL.md` and the two Prototype-Skill planning docs (`epics/`, `features/`) mention "worktree" repo-wide (excluding the unrelated `git worktree`-root-detection mention in `thoughts/shared/facts/2026-01-17-OpenCode-Skills-and-Agent-Development.md`, confirmed unrelated to isolation).
- **Direct consequence:** There is no existing skill-level precedent choosing "raw Bash `git worktree` calls" over tool-mediated isolation. The only two tool-mediated options available are Agent-tool `isolation: "worktree"` (Finding 1, per-call) and `EnterWorktree`/`ExitWorktree` (Finding 2, session-scoped) — both are Claude Code platform tools, not something any skill in this repo currently invokes via raw Bash.

### `.claude/skills/AGENTS.md` also lists skill subdirectories — a DOX consequence not named in the epic

- **Observation:** `.claude/skills/AGENTS.md` enumerates every skill subdirectory by category ("Workflow skills", "Quality skills", "DOX maintenance skills") as part of its Local Contracts section.
- **Evidence:** `.claude/skills/AGENTS.md:11-33`.
- **Excerpt:**
  ```markdown
  **Workflow skills (pipeline order):**
  - `mission-architect/` — Elicit project vision; output to `thoughts/shared/missions/`
  ...
  - `implement/` — Execute plan task-by-task via subagents; also contains `implementer-prompt.md`, ...
  ```
- **Direct consequence:** Per `CLAUDE.md`'s DOX Protocol ("If a directory is created or repurposed, also update the parent `AGENTS.md`'s Child DOX Index" — `CLAUDE.md:175`), adding a new `prototype/` subdirectory under `.claude/skills/` is a structural change to that directory's contents, which the DOX Protocol's own rule would require reflecting in `.claude/skills/AGENTS.md`'s listing — this file update is not explicitly named among the epic's Technical Criteria but follows directly from the DOX Protocol already in force.

### `thoughts/shared/prototypes/` does not exist; no prior worktree-isolation usage in project history

- **Observation:** No `thoughts/shared/prototypes/` directory exists anywhere in the repository. No mission, spec, plan, QA report, or fact report anywhere in `thoughts/` documents a prior actual (non-planning) instance of git-worktree-based isolation being used in this framework.
- **Evidence:** Delegated `codebase-locator` (`ls thoughts/shared/prototypes` → "No such file or directory") and `thoughts-locator` (comprehensive search across missions/specs/epics/plans/qa/facts/decisions/personal-notes — only the Prototype Skill's own feature brief and epic mention worktree isolation, both as planned/proposed usage, not historical fact).
- **Direct consequence:** The Planner has no prior implementation to model cleanup/error-handling edge cases on beyond the tool schemas themselves (Findings 2-4) and general git-worktree semantics.

### `worktree.baseRef` setting — not configured in this repo

- **Observation:** `.claude/settings.json` contains no `worktree.baseRef` key; `.claude/settings.local.json` was not found to contain one either (not directly re-verified in this session — see Open Questions).
- **Evidence:** `.claude/settings.json` (full file content, 8 lines) — no `worktree` key of any kind present.
- **Direct consequence:** Per `EnterWorktree`'s own schema description, absent a `worktree.baseRef` override, new worktrees in this repo branch from `fresh` (i.e., `origin/<default-branch>`) by default, not from the current local HEAD — relevant to the epic's Open Question about `/prototype`'s default base ref.

## Verification Log

- `Verified:` `CLAUDE.md`, `thoughts/shared/AGENTS.md`, `thoughts/shared/facts/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`, `thoughts/shared/features/2026-07-24-Prototype-Skill.md`, `.claude/skills/feature-architect/SKILL.md`, `.claude/skills/implement/SKILL.md` (lines 1-100), `.claude/skills/claude-code-extensions/SKILL.md` (lines 140-199), `.claude/skills/AGENTS.md`, `.claude/settings.json`, `EnterWorktree` tool schema, `ExitWorktree` tool schema.
- Spot-checked via direct Bash grep (not sub-agent-reported): `grep -n "worktree" .claude/skills/claude-code-extensions/SKILL.md`; `grep -n "worktree" thoughts/shared/facts/2026-01-17-OpenCode-Skills-and-Agent-Development.md`; `grep -rn "AskUserQuestion" .claude/skills/*/SKILL.md`; `find thoughts/shared -maxdepth 2 -iname AGENTS.md`; `find .claude/skills -maxdepth 1 -type d`.
- `Spot-checked excerpts captured:` yes.
- Not personally re-verified (relied on delegated sub-agent report only): `.claude/skills/fact-finder/SKILL.md`'s exact line numbers for its `thoughts-locator` delegation section (271-295) and its Phase 1 heading (554-557) — the file's existence and general structure were cross-confirmed by this session's own `find` and `grep -rn "AskUserQuestion"` commands (fact-finder produced 0 matches for `AskUserQuestion`, consistent with the delegated finding), but exact line ranges inside `fact-finder/SKILL.md` were not independently re-read line-by-line by this session.

## Open Questions / Unverified Claims

- **`.claude/agents/*.md` file contents**: The delegated `codebase-pattern-finder` reported that no `.claude/agents/*.md` file sets `isolation: worktree`, but this session did not personally `Read` every individual agent file to confirm — only the locator's file-listing and the pattern-finder's grep-based claim were available. What was tried: relied on sub-agent grep report (`grep -rn "isolation" .claude/` → matches limited to unrelated prose plus the one frontmatter-reference line). What's missing: a direct `Read` of each `.claude/agents/*.md` file's frontmatter block.
- **`.claude/settings.local.json` `worktree.baseRef` override**: Not directly re-read in this session to confirm the absence of a `worktree.baseRef` key there (only the tracked `.claude/settings.json` was read in full). What was tried: read `.claude/settings.json` only, per this session's own file-reading budget. What's missing: a direct `Read` of `.claude/settings.local.json`'s full contents.
- **Exact line numbers inside `.claude/skills/fact-finder/SKILL.md`** for its own Phase 1 heading and `thoughts-locator` delegation section — reported by a delegated `codebase-analyzer` sub-agent but not independently re-read by this session line-by-line (see Verification Log). The *absence* of `AskUserQuestion` in that file was independently confirmed via direct grep, but internal section line numbers rest on the sub-agent's report alone.
- **Whether `git worktree add` inherently requires a clean main working tree** (a Constraints & Risks question from the epic): No file or tool schema in this repo states this explicitly one way or the other. The `EnterWorktree` tool schema's "Requirements" section lists no clean-tree precondition, which is suggestive but not a direct statement that uncommitted changes in the main tree are safe — this rests on general git-worktree semantics (a `git worktree add` on a new branch does not require the current tree to be clean, since it operates on a separate checkout of the branch) rather than a codebase or documented-tool-schema citation confirming it for this specific harness.

## References

**Codebase Citations**:
- `.claude/skills/claude-code-extensions/SKILL.md:152-176`
- `.claude/skills/feature-architect/SKILL.md:1-4, 49-116, 118-236`
- `.claude/skills/implement/SKILL.md:1-100`
- `.claude/skills/AGENTS.md:11-33`
- `.claude/settings.json:1-8`
- `thoughts/shared/AGENTS.md:1-42`
- `thoughts/shared/facts/AGENTS.md:1-50`
- `thoughts/shared/qa/AGENTS.md:1-43`
- `thoughts/shared/features/2026-07-24-Prototype-Skill.md:1-126`
- `CLAUDE.md:1-178`
- `.claude/skills/mission-architect/SKILL.md:54,85,114,129`
- `.claude/skills/epic-planner/SKILL.md:50,83`
- `.claude/skills/specifier/SKILL.md:52,87`

**Tool-Schema Citations** (primary-source, non-file evidence):
- `EnterWorktree` tool schema (loaded via `ToolSearch`, 2026-07-24)
- `ExitWorktree` tool schema (loaded via `ToolSearch`, 2026-07-24)

**Web Research Citations**:
- https://code.claude.com/docs/en/worktrees.md (Type: official_docs, Date: unspecified on page, Authority: high, Verified: 2026-07-24 via delegated `claude-code-guide` agent)
- https://code.claude.com/docs/en/tools-reference.md (Type: official_docs, Authority: high, Verified: 2026-07-24 via delegated `claude-code-guide` agent — cited for `EnterWorktree`/`ExitWorktree` vs. `isolation: "worktree"` distinction; corroborated directly by this session's own `ToolSearch`-loaded tool schemas)
