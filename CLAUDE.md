# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# What This Repository Is

ORBIT is a Claude Code workflow toolkit, not an application. There is no application code here: the product is the prompt set in `.claude/` — skills, worker agents, and a SessionStart hook — plus the workflow artifacts in `thoughts/`. Editing a `SKILL.md` *is* editing behavior.

Two consequences to keep in mind:

- **Nothing compiles and there is no test suite.** Verification is reading, plus the two checks below.
- **Never edit a skill or agent file while `/implement` is mid-plan.** The orchestrator's own behavior comes from those files; changing them mid-run changes the rules under a running plan (`.claude/skills/implement/SKILL.md`, Red Flags).

## Commands

```bash
bash scripts/build-plugin.sh                          # regenerate dist/orbit/ from .claude/ + .mcp.json
.claude/hooks/session-start | python3 -m json.tool    # hook must emit valid JSON, or sessions start blind
```

`dist/` is currently absent — `cab454b` deleted it as a stale build snapshot. The build script regenerates everything derivable but deliberately never generates the two hand-authored plugin assets, so a fresh build warns and produces a tree that will not install until they are recreated:

- `dist/orbit/.claude-plugin/plugin.json` — manifest; last committed as `{"name": "orbit", "version": "3.3.0", "skills": ["./"]}` (recover with `git show cab454b^:dist/orbit/.claude-plugin/plugin.json`)
- `dist/orbit/README.md` — plugin install docs

The `uv run mypy|ruff|pytest` entries in `.claude/settings.json` are allowlisted for the *target* projects this toolkit is used on. There is no Python in this repo.

# Claude Code Workflow

Workflow orchestrators are Skills in `.claude/skills/`, invoked via `/skill-name`. Worker agents are in `.claude/agents/` and are spawned by Skills via the Agent tool.

## Workflow Pipeline

**Greenfield (new project):**
```
/mission-architect → /specifier → /epic-planner → /fact-finder → /planner → /implement
```

**Brownfield (new feature in existing system):**
```
/feature-architect → /fact-finder → /planner → /implement
```
Brownfield skips `/epic-planner` on purpose: epic decomposition exists to cut a whole specification into several parallel streams, and one feature is one stream.

A feature that turns out to need epic decomposition is not a feature — it is a subsystem carrying its own mission, and it goes through `/mission-architect` on the greenfield path instead. The test is **both** of these at once: it has its own value proposition (you can say why it should exist without reference to the host system's mission) **and** it needs several parallel streams. Either alone stays with `/feature-architect`. When that route is taken, the mission **must** record the host system in its `Constraints (Non-Negotiable)` section — that `Host system` line is what `/specifier` reads before settling architecture, and it is the only thing standing in for the inherited-constraint capture `/feature-architect` would otherwise have produced (`.claude/skills/mission-architect/SKILL.md`, "Projects, Not Features"; `.claude/skills/feature-architect/SKILL.md:12`).

**Small change or bug fix:**
```
/fact-finder → /planner → /implement
```

**Explore first (optional, on a "go" decision):**
```
/prototype → (mission-architect | feature-architect | fact-finder)
```

Each stage produces artifacts written to `thoughts/shared/`:

| Stage | Skill | Output directory |
|---|---|---|
| Prototype (optional) | `/prototype` | `thoughts/shared/prototypes/` |
| Vision (greenfield) | `/mission-architect` | `thoughts/shared/missions/` |
| Feature brief (brownfield) | `/feature-architect` | `thoughts/shared/features/` |
| Spec | `/specifier` | `thoughts/shared/specs/` |
| Epics | `/epic-planner` | `thoughts/shared/epics/` |
| Facts | `/fact-finder` | `thoughts/shared/facts/` or `thoughts/shared/qa/` |
| Plan | `/planner` | `thoughts/shared/plans/` |
| Execution | `/implement` | Git commits per task |

Artifacts are named `YYYY-MM-DD-Topic.md` — epic files additionally carry their ID, `YYYY-MM-DD-EPIC-NNN-Topic.md`, matching the file's `epic-id:` — and are write-once after creation. The one exception is a plan's STATE file, which the `/implement` orchestrator updates as it goes (`thoughts/shared/AGENTS.md`).

## Artifact Frontmatter — the traceability chain

Every artifact opens with YAML frontmatter, and it is what makes the pipeline traversable in both directions. Plan and STATE files were the last holdouts; `b1b3a22` gave them theirs, so the chain is now unbroken:

```
mission ──mission-source──▶ spec ──spec-source──▶ epic ─┐
feature brief ──────────────────────────────────────────┤ upstream-artifact
                                                        ▼
                                        fact report / QA report
                                                        │ fact-source
                                                        ▼
                                              plan ──plan:──▶ STATE
```

Each edge is labeled with the field the artifact it points *into* carries — so the arrows follow the pipeline while the fields all point back upstream.

Three conventions hold across all of them:

- **A back-pointer names the artifact upstream** — `mission-source:`, `spec-source:`, `fact-source:`, `plan:`, or the generic `upstream-artifact:` — always a repo-relative path or the literal `none`. `/planner` copies the fact report's `upstream-artifact:` **verbatim** rather than re-deriving it, and `/implement`'s closing acceptance step reads that copy to decide whether an epic's `## Verification Plan (For Implementor)` applies. `none`, or a path into `features/`, means skip it — only epics carry that section.
- **`status:` describes the document, not the work** — `complete | superseded` for missions, specs, feature briefs and plans, `ready-for-research | superseded` for epics, bare `complete` for fact/QA reports and prototype notes. Whether a plan has been *executed* is tracked separately, in its STATE file's own `status: in-progress | complete`.
- **The authoring skill signs its own field** — `fact-finder:`, `feature-architect:`, `planner:`. The only place a key set is actually asserted is the owning directory's `AGENTS.md` `## Verification` list (e.g. `thoughts/shared/plans/AGENTS.md:118-119`), so adding or renaming a key means editing the skill *and* that list.

## The pipeline definition is duplicated — change every copy

The ordering above is stated in five places, and no tooling keeps them in sync:

1. this file
2. `.claude/hooks/session-start` — the text injected into every session
3. `README.md`
4. root `AGENTS.md`
5. the affected `SKILL.md`, plus any sibling skill that names the stage before or after it

When `7790fda` removed `/epic-planner` from the brownfield path it updated the hook and the skill, leaving this file and `README.md` claiming the old order. Treat a pipeline change as a five-file edit.

## Workflow Skills

| Skill | Purpose |
|---|---|
| `/mission-architect` | Discover project vision and goals via conversation (greenfield) |
| `/feature-architect` | Define a new feature within an existing system (brownfield) |
| `/specifier` | Translate a mission into a technical specification |
| `/epic-planner` | Decompose a spec into epics and user stories |
| `/fact-finder` | Map the codebase relevant to a spec or question; also runs QA mode |
| `/planner` | Produce a sequenced, evidence-based implementation plan |
| `/implement` | Execute a plan wave-by-wave via subagents, one combined spec-and-quality review gate per task |
| `/prototype` | Spike a rough idea into disposable, isolated code and reach a go/no-go/iterate decision (optional, before mission-architect/feature-architect/fact-finder — the prototype code itself is always discarded) |

`/prototype` carries `model: opus` deliberately, and must never be given `context: fork`: it is interactive and owns a git worktree lifecycle, neither of which survives being run as a subagent. The rationale is recorded in its own frontmatter note.

## Quality and Maintenance Skills

| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic code quality review (Clean Code, Pragmatic Programmer, etc.) |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `dox-init` | Bootstrap a DOX `AGENTS.md` tree for a project (idempotent — never overwrites) |
| `dox-update` | Detect and regenerate stale `AGENTS.md` files |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |
| `commit` | Add and commit all outstanding changes as logically grouped commits |

`/commit` carries `disable-model-invocation: true` — it writes git history, so it stays user-invoked only. That also keeps its description out of every session's context.

## Worker Agents (used internally by Skills)

These live in `.claude/agents/` and are spawned by Skills via the `Agent` tool — never invoked directly.

| Agent | Role |
|---|---|
| `codebase-locator` | Find files by purpose/pattern — returns paths, not analysis |
| `codebase-analyzer` | Trace logic and data flow through paths it is given — cannot search |
| `codebase-pattern-finder` | Find recurring patterns and idioms, with snippets |
| `thoughts-locator` | Find docs in the `thoughts/` directory |
| `thoughts-analyzer` | Extract decisions and constraints from `thoughts/` docs |
| `web-search-researcher` | External libraries, APIs, docs |

A Skill dispatches these by the agent's own `name` — `subagent_type: "codebase-locator"` — not via a generic harness agent type. Each agent's capabilities are bounded by the `tools:` list in its frontmatter, which is the only thing stopping, say, `codebase-analyzer` from searching. `/implement` is the exception: its implementers and reviewers run as `general-purpose`, on `haiku` and the session model respectively.

Context isolation comes from the Agent tool call, not from the file: only an agent's returned report enters the caller's context.

## MCP Servers

All three servers are **remote** — declared in the root `.mcp.json`, no local install or build — and auto-enabled via `"enableAllProjectMcpServers": true` in `.claude/settings.json`.

| Server | Tool(s) | Endpoint | Notes |
|---|---|---|---|
| `crawl4ai` | `crawl4ai` | `mcp.vier.services/crawl4ai-mcp` | Web crawling: crawl, markdown, screenshot modes |
| `searxng` | `searxng_search` | `mcp.vier.services/searxng-mcp` | Web search via hosted SearXNG |
| `context7` | `resolve-library-id`, `query-docs` | `mcp.context7.com/mcp` | Library docs; needs a key |

`.mcp.json` interpolates `${CONTEXT7_API_KEY}` from the gitignored `.env`. Without it only `context7` degrades; the VIER-hosted servers need no credentials.

## Directory Structure

```
.claude/
  agents/                # Worker agents (spawned by Skills via Agent tool)
  skills/                # All skills — workflow orchestrators + quality/DOX
  hooks/
    session-start        # Emits the workflow context injected at session start
    hooks.json           # Hook registration, plugin flavor (see below)
  settings.json          # enableAllProjectMcpServers, hook registration, uv allowlist
  settings.local.json    # Local permissions + sandbox settings

.mcp.json                # Remote MCP server declarations
scripts/build-plugin.sh  # .claude/ + .mcp.json → dist/orbit/

ORBIT-V4-CONCEPT.md      # Draft rearchitecture — NOT current state, see below
ORBIT-V4-OKF-CONVENTION.md

thoughts/
  shared/                # Pipeline artifact store (see stage table above)
  projects/              # Older per-topic working notes
presentation/            # Slide decks about the method (PDF/PPTX)
```

**The SessionStart hook is registered twice, on purpose.** `.claude/settings.json` registers it with a `${CLAUDE_PROJECT_DIR}` path — that copy is what runs in this repo. `.claude/hooks/hooks.json` is the plugin-build source; `scripts/build-plugin.sh` rewrites its path to `${CLAUDE_PLUGIN_ROOT}/hooks-handlers/session-start`. Editing the hook's *text* touches only `session-start`; changing *how it is registered* touches both files.

## Plan File Format

`.claude/skills/planner/SKILL.md` holds the canonical task template — read it there rather than reproducing it. Its field list (`Wave:`, `Model:`, `Change Type:`, `File(s):`, `allowedAdjacentEdits:`, `Instruction:`, `Evidence:`, `Done When:`, `Verify:`, `Context:`) is **a contract with four readers**: `planner/SKILL.md`, `implement/SKILL.md`, and both prompt templates in `.claude/skills/implement/` (`implementer-prompt.md`, `reviewer-prompt.md`). Renaming a field or changing its allowed values means editing all four; a change landing in only some of them fails silently, because the reader simply does not find what it looks for.

Two fields carry most of the weight:

- **`File(s)` plus `allowedAdjacentEdits` must be exhaustive** — implementation, tests, config, docs. They are the input to the wave-disjointness check, so an omitted path is a path two concurrent implementers can both write.
- **`Verify:` is what lets the orchestrator confirm a mechanical change without spending a review subagent** — but only if the command asserts content. A count or existence check passes for the wrong content, and since the implementer is handed the command before it works, a bar it can see in advance is a bar it can clear without doing the task. Such a task goes to review instead; `Verify: none — requires review` says so explicitly.

`/implement` executes the plan **wave by wave**. Tasks sharing a `Wave:` have disjoint `File(s)` and run concurrently — one implementer subagent each. After each wave the orchestrator runs a **Boundary Check**: every path the wave actually changed must appear in the union of its tasks' declared paths, or it is treated as either an incomplete `File(s)` list or scope creep. Then mechanical changes are verified against `Done When`; everything else goes to a single reviewer covering spec compliance and code quality together.

State lives in a sibling file, `<plan>-STATE.md`. The orchestrator — never a subagent — makes every commit and every STATE update, each commit carrying the update for exactly the task IDs it contains, so a run interrupted mid-wave resumes without redoing finished work.

**The two files' frontmatter has two different writers.** A plan carries six keys (`date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact`) and `/planner` owns all of them. A STATE file carries three (`date`, `plan`, `status`); `/planner` stamps `status: in-progress` at creation and never touches it again, and `/implement` is the **sole** writer that flips it to `complete`, in the same step where it sets `**Current Task**: Complete` — after the acceptance checks pass, not before. A run that skips the flip leaves a finished plan claiming to still be in progress.

STATE's `plan:` frontmatter field and its `**Plan**:` body line hold the same path deliberately: `/implement`'s resume path parses the body by bold key, so the bold line stays and the frontmatter field only makes the same link machine-readable. Write the path in both.

## DOX Protocol

`AGENTS.md` files are local governance contracts for directory subtrees. Claude Code does not read them automatically — this section activates the protocol.

**Before editing any file:** Walk from the repository root to each target file's directory. At each level, check for an `AGENTS.md` and read it. The nearest `AGENTS.md` to the file being edited is the local contract; parent `AGENTS.md` files supply broader rules. This `CLAUDE.md` is always the top-level contract.

**After a meaningful change:** If the change affects a directory's purpose, scope, ownership, structure, file format contracts, or naming conventions — update the nearest owning `AGENTS.md`. If a directory is created or repurposed, also update the parent `AGENTS.md`'s Child DOX Index.

**Conflict rule:** When `AGENTS.md` files conflict, the closer file governs local details. No `AGENTS.md` may override this `CLAUDE.md`.

**Scope in this repo:** `.claude/**` is deliberately outside DOX. `dox-init` and `dox-update` exclude it, which left the `AGENTS.md` files there hand-maintainable only and duly stale, so `031e491` removed all three and moved the load-bearing rules into the skills themselves. `.claude/` is self-describing: every `SKILL.md` and agent file carries its name, description and contract in frontmatter. Live `AGENTS.md` files are the root one plus `thoughts/shared/` and its `facts/`, `plans/`, `qa/`, `prototypes/` children.

## ORBIT V4 — Draft, Not Current State

`ORBIT-V4-CONCEPT.md` and `ORBIT-V4-OKF-CONVENTION.md` (German, both marked *Entwurf*, dated 2026-07-01) propose the next architecture: `thoughts/shared/` becomes an Open-Knowledge-Format bundle under `knowledge/`, splitting normative (intent, rules, specs) from descriptive (code, external, quality facts); a first-class `rules/` layer replaces today's implicit conventions; facts carry content hashes so staleness becomes mechanical; a new compliance agent reports Ist-vs-Soll drift; and DOX dissolves into path-scoped rules.

None of it is implemented — everything else in this file describes V3, which is what runs. Read the V4 docs before planning structural work, and do not treat them as a description of the current tree.
