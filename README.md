# ORBIT — Claude Code Workflow Toolkit

A structured agentic development workflow for [Claude Code](https://claude.ai/code), ported from an [OpenCode](https://opencode.ai) agent system. It provides a full pipeline from project vision to code implementation, backed by specialized subagents, code quality skills, and hosted MCP servers for web research.

ORBIT has no runtime of its own. It is a set of prompts — skills and agents under `.claude/` — that Claude Code loads, either directly in this repository or as an installable plugin in another one.

## Pipeline

**Greenfield (new project):**
```
/mission-architect → /specifier → /epic-planner → /fact-finder → /planner → /implement
```

**Brownfield (new feature in existing system):**
```
/feature-architect → /fact-finder → /planner → /implement
```
Brownfield skips `/epic-planner`: decomposition into epics exists to split a whole specification into parallel streams, and a single feature is a single stream.

A feature that does need epic decomposition is a subsystem with its own mission — take the greenfield path instead. The test is both at once: its own value proposition, **and** several parallel streams. Either alone stays brownfield. On that route the mission records the host system as a constraint, which `/specifier` reads before settling architecture.

**Small change, bug fix, or maintenance:**
```
/change-architect → /fact-finder → /planner → /implement
/change-architect → /just-do-it
```
The change brief is typed — `defect | enhancement | maintenance` — and a change needing more than one intended outcome belongs to `/feature-architect`. The brief's `route:` field, set by `/change-architect`, determines which exit: `full` for the complete pipeline, `direct` for `/just-do-it`. `direct` requires **both** mechanical conditions — the brief's `## Open Questions for Fact-Finder` is the literal `none — nothing must be established before the change`, **and** its `## Acceptance Criteria` holds exactly one entry. `full` is the default whenever either fails.

**Not sure it should be built at all:**
```
/prototype → then one of the four paths above, on a "go" decision
```

Three orderings are load-bearing: `/fact-finder` must precede `/planner` (the planner needs a verified research report), `/planner` must precede `/implement` (which needs a plan file), and every pipeline begins with a target artifact because `/planner` refuses to write a plan from a fact report whose `upstream-artifact:` is `none`.

Each stage produces artifacts in `thoughts/shared/`, named `YYYY-MM-DD-Topic.md` — epics additionally carry their ID, `YYYY-MM-DD-EPIC-NNN-Topic.md`:

| Stage | Command | Output |
|---|---|---|
| Prototype (optional) | `/prototype` | `thoughts/shared/prototypes/` |
| Vision (greenfield) | `/mission-architect` | `thoughts/shared/missions/` |
| Feature brief (brownfield) | `/feature-architect` | `thoughts/shared/features/` |
| Change brief (small change) | `/change-architect` | `thoughts/shared/changes/` |
| Change record | `/just-do-it` | `thoughts/shared/changes/` (`-RECORD.md` sibling) |
| Specification | `/specifier` | `thoughts/shared/specs/` |
| Epics | `/epic-planner` | `thoughts/shared/epics/` |
| Facts | `/fact-finder` | `thoughts/shared/facts/` (QA mode: `thoughts/shared/qa/`) |
| Plan | `/planner` | `thoughts/shared/plans/` (plan + `-STATE.md`) |
| Execution | `/implement` | Commits per task, advancing STATE |

Every artifact opens with YAML frontmatter naming the artifact it came from — `mission-source:`, `spec-source:`, `fact-source:`, `plan:`, `change-brief:`, or the generic `upstream-artifact:` — so any plan can be traced back through its fact report and epic to the mission it serves:

```
mission ──▶ spec ──▶ epic ─┐
feature brief ─────────────┼──▶ fact report ──▶ plan ──▶ STATE
change brief ──────────────┘
             └──────────────▶ Change Record        (route: direct)
```

Downstream stages read these fields rather than guessing: `/planner` copies the fact report's `upstream-artifact:` verbatim, and `/implement` uses that copy to find the epic whose verification plan it must run before closing out — but only when the path is under `epics/`; a path into `features/` or `changes/`, or the literal `none`, are skipped.

A `status:` field describes the document — `complete`, `superseded`, or `ready-for-research` for an epic awaiting `/fact-finder`. Two artifacts are the exception, and both track an execution attempt instead: a plan's STATE file (`in-progress | complete`) and a Change Record (`complete | abandoned`). So whether a plan has actually been *executed* is never read off the plan itself.

## Getting Started

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI
- Bash and `python3` (the plugin build script and the hook self-check)

No Node.js or Python packages are needed — the MCP servers are hosted, not built locally.

### Starting Claude Code

**Always launch Claude Code via `./start-claude.sh`, not `claude` directly.** The script loads the gitignored `.env` into the environment before exec'ing `claude`, which is what lets `.mcp.json`'s `${CRAWL4AI_MCP_URL}`, `${SEARXNG_MCP_URL}` and `${CONTEXT7_API_KEY}` placeholders resolve — Claude Code itself never reads `.env`. Run `claude` directly and every MCP server silently fails to connect.

```bash
./start-claude.sh
```

Any arguments are forwarded to `claude` as-is.

### Using it in this repository

Nothing to install. `.claude/` is picked up directly, and a SessionStart hook injects the pipeline rules at the start of every session. Verify the hook still emits valid JSON after editing it:

```bash
.claude/hooks/session-start | python3 -m json.tool
```

### Installing it into another project

Build the distributable plugin from `.claude/` plus the root `.mcp.json`, then install the result:

```bash
bash scripts/build-plugin.sh
claude plugin install ./dist/orbit
```

`dist/` is not committed. The build regenerates every derivable part of the plugin — agents, skills, the hook handler, `hooks.json` with its command path rewritten to `${CLAUDE_PLUGIN_ROOT}`, and `.mcp.json` — but two hand-authored assets have no counterpart under `.claude/` and are never generated:

- `dist/orbit/.claude-plugin/plugin.json` — the plugin manifest, including its version
- `dist/orbit/README.md` — plugin-specific install docs

Both were removed along with the stale `dist/` snapshot in commit `cab454b`, so the script currently warns about them and the built tree will not install until they are restored. The last committed manifest is recoverable from git:

```bash
git show cab454b^:dist/orbit/.claude-plugin/plugin.json
git show cab454b^:dist/orbit/README.md
```

### Configuration

`.mcp.json` declares three remote MCP servers and needs no local build — but it holds no endpoints of its own. Both VIER endpoints and the Context7 key are interpolated from the environment:

```json
"crawl4ai": {
  "type": "streamable-http",
  "url": "${CRAWL4AI_MCP_URL}"
}
```

Copy `.env.example` to the gitignored `.env` and fill it in:

```bash
cp .env.example .env
```

- `CRAWL4AI_MCP_URL`, `SEARXNG_MCP_URL` — hosted VIER instances, no credentials needed; the example file carries the current values.
- `CONTEXT7_API_KEY` — free from [Context7](https://context7.com/).

Without a `.env` no MCP server resolves, so web crawling, search and library-documentation lookups are all unavailable.

## Commands

### Workflow orchestration

| Command | Purpose |
|---|---|
| `/mission-architect` | Discover and articulate project vision (why + what, not how) — greenfield |
| `/feature-architect` | Define a new feature within an existing system — brownfield |
| `/change-architect` | Record the intent of a small change, bug fix, or maintenance work — brownfield, before research |
| `/just-do-it` | Execute a `route: direct` change brief directly — no fact report, no plan; one reviewer, one commit, one record |
| `/specifier` | Translate a mission statement into a technical specification |
| `/epic-planner` | Decompose a spec into epics and user stories |
| `/fact-finder` | Map the codebase or investigate a topic before planning |
| `/planner` | Produce a sequenced, evidence-based implementation plan |
| `/implement` | Execute a plan wave-by-wave via subagents, committing per task |
| `/prototype` | Spike a rough idea into disposable code in an isolated worktree, then decide go / no-go / iterate |

### Quality and maintenance skills

| Skill | Purpose |
|---|---|
| `clean-code` | Language-agnostic review against Clean Code, Pragmatic Programmer, etc. |
| `python-qa` | Python-specific quality review |
| `typescript-qa` | TypeScript-specific quality review |
| `logic-bugs-qa` | Logic and bug analysis across languages |
| `dox-init` | Bootstrap a DOX `AGENTS.md` governance tree (idempotent) |
| `dox-update` | Detect and regenerate stale `AGENTS.md` files |
| `mission-check` | Audit code against recorded mission/spec/epic intent, including orphan feature and change work with no mission root |
| `claude-code-extensions` | Reference for creating commands, skills, subagents, and MCP servers |
| `/commit` | Add and commit all outstanding changes as logically grouped commits (user-invoked only) |
## Architecture

```
.claude/
  agents/              # Subagent prompts — dispatched by skills via the Agent tool
  skills/              # Workflow orchestrators, quality reviewers, DOX tooling
  hooks/
    session-start      # Emits the workflow context injected at session start
    hooks.json         # Hook registration used by the plugin build
  settings.json        # enableAllProjectMcpServers, hook registration
  settings.local.json  # Local tool permissions and sandbox settings

.mcp.json              # Remote MCP servers (crawl4ai, searxng, context7)
scripts/
  build-plugin.sh      # .claude/ + .mcp.json → dist/orbit/

thoughts/shared/       # Workflow artifacts (see the pipeline table above)
presentation/          # Slide decks about the method

CHANGELOG.md           # Keep a Changelog format, one section per git tag
ORBIT-V5-CONCEPT.md    # Draft next-generation architecture (not implemented)
ORBIT-V5-OKF-CONVENTION.md
```

**`agents/` vs `skills/`:**
- **agents/** — Worker prompts, never invoked directly. A skill dispatches one by its frontmatter `name` (`subagent_type: "codebase-locator"`), and each agent's `tools:` list is what bounds its capabilities. Only an agent's returned report enters the caller's context, which is where the context savings come from.
- **skills/** — Invoked as `/skill-name`, or proactively by Claude when a request matches the skill's description.

## Plan File Format

The canonical task template lives in `.claude/skills/planner/SKILL.md`. A plan opens with six frontmatter keys — `date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact` — and each task carries:

```markdown
- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku (default) | opus (architecture/complex refactor only)
- **Change Type:** create/modify/remove
- **File(s):** `path/...` (exhaustive — impl, tests, config, docs)
- **allowedAdjacentEdits:** `path/...` or none
- **Instruction:** exact steps
- **Evidence:** `path:line-line`
- **Done When:** concrete observable condition
- **Verify:** `command` → expected result (or `none — requires review`)
- **Context:** why this change is needed
```

That field list is a contract shared by four readers — `planner/SKILL.md`, `implement/SKILL.md`, and the two prompt templates in `.claude/skills/implement/` — so renaming a field means editing all four.

`/implement` runs the plan wave by wave: tasks in the same `Wave:` have disjoint `File(s)` and execute concurrently, one subagent each, followed by a boundary check and a review gate. Progress is tracked in a sibling `<plan>-STATE.md` file, updated by the orchestrator with every commit, so an interrupted run resumes without redoing finished work.

STATE carries its own `date`, `plan` and `status` frontmatter. `/planner` stamps `status: in-progress` when it creates the file; `/implement` is the only thing that flips it to `complete`, once the plan's acceptance criteria have been checked.

## Background

This toolkit was converted from an OpenCode workflow: skills and agents were rewritten as Claude Code skills and subagents, and the two locally built MCP tools were replaced by hosted endpoints. `ORBIT-V5-CONCEPT.md` sketches where it goes next — a living knowledge base as the source of truth, with an explicit rules layer and continuous drift checking against the code.

## License

MIT
