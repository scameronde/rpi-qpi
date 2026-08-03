---
date: 2026-08-03
fact-finder: claude-fact-finder
topic: "LSP tool usage across ORBIT's skills and worker agents"
status: complete
upstream-artifact: none
coverage:
  - .claude/agents/*.md (all 6 agent files, frontmatter `tools:` lists)
  - .claude/skills/*/SKILL.md (all 17 skill files, frontmatter and body text)
  - .claude/skills/implement/implementer-prompt.md
  - .claude/skills/implement/reviewer-prompt.md
---

# Research: LSP tool usage across ORBIT's skills and worker agents

## Executive Summary
- Of the 6 worker agents in `.claude/agents/`, 2 (`codebase-analyzer`, `codebase-pattern-finder`) carry `LSP` in their frontmatter `tools:` list; the other 4 (`codebase-locator`, `thoughts-analyzer`, `thoughts-locator`, `web-search-researcher`) do not.
- None of the 17 files in `.claude/skills/*/SKILL.md` carry a `tools:` frontmatter field of their own, and none mention `LSP` anywhere in their body text (0 grep matches across all 17 files).
- The only `tools:` occurrences outside the 6 agent files are inside `.claude/skills/claude-code-extensions/SKILL.md`, and those are illustrative frontmatter syntax shown as documentation examples, not a restriction applied to that skill itself.
- 8 of the 17 skills reference `codebase-analyzer` and/or `codebase-pattern-finder` by name in their delegation instructions (the two agents with LSP access): `fact-finder`, `feature-architect`, `just-do-it`, `logic-bugs-qa`, `planner`, `python-qa`, `typescript-qa`, `clean-code`. The remaining 9 (`change-architect`, `claude-code-extensions`, `commit`, `dox-init`, `dox-update`, `epic-planner`, `implement`, `mission-architect`, `prototype`, `specifier`) do not name either agent.
- `/implement` dispatches its per-task implementer and reviewer subagents as `general-purpose` rather than any of the six named agents; the `general-purpose` agent type carries unrestricted tool access, but neither `implement/SKILL.md`, `implementer-prompt.md`, nor `reviewer-prompt.md` mentions `LSP`.

## Coverage Map
- Read all 6 files in `.claude/agents/` (frontmatter section, lines 1–10 of each).
- Read `.claude/skills/fact-finder/SKILL.md` and `.claude/skills/implement/SKILL.md` frontmatter directly.
- Ran `grep -n "LSP"` across all 17 `.claude/skills/*/SKILL.md` files: zero matches.
- Ran `grep -c "^tools:"` across all 17 `.claude/skills/*/SKILL.md` files: only `claude-code-extensions/SKILL.md` matched, and inspection showed the matches are inside example code blocks (lines 52, 162, 197, 203, 204), not that file's own frontmatter.
- Ran a name-matching grep for the six agent names across all 17 `.claude/skills/*/SKILL.md` files to build the delegation map in the Executive Summary.
- Ran `grep -rn "LSP"` across `.claude/skills/implement/` (all three files: `SKILL.md`, `implementer-prompt.md`, `reviewer-prompt.md`): zero matches.
- Exploratory — no upstream target artifact; not eligible as a plan input.

## Inherited Constraints (Treated as Fixed)
None — there is no upstream artifact for this exploratory run.

## Critical Findings (Verified, Planner Attention Required)

- **Observation:** Only 2 of the 6 worker agents (`codebase-analyzer`, `codebase-pattern-finder`) declare `LSP` in their frontmatter `tools:` list.
- **Direct consequence:** The other 4 agents (`codebase-locator`, `thoughts-analyzer`, `thoughts-locator`, `web-search-researcher`) cannot invoke `LSP` regardless of what a calling skill instructs, since agent tool access is bounded by this frontmatter list (`CLAUDE.md`, "Worker Agents" section: "Each agent's capabilities are bounded by the `tools:` list in its frontmatter").
- **Evidence:** `.claude/agents/codebase-analyzer.md:4-9`, `.claude/agents/codebase-pattern-finder.md:4-11`, `.claude/agents/codebase-locator.md:4-8`, `.claude/agents/thoughts-analyzer.md:4-9`, `.claude/agents/thoughts-locator.md:4-6`, `.claude/agents/web-search-researcher.md:4-9`
- **Excerpt (codebase-analyzer.md:4-9):**
  ```yaml
  tools:
    - Read
    - Bash
    - LSP
    - mcp__context7__resolve-library-id
    - mcp__context7__query-docs
  ```
- **Excerpt (codebase-locator.md:4-8, no LSP):**
  ```yaml
  tools:
    - Bash
    - Read
    - Glob
    - Grep
  ```

- **Observation:** No `.claude/skills/*/SKILL.md` file carries its own `tools:` frontmatter field, and none mentions `LSP` in body text.
- **Direct consequence:** Skills are not individually tool-restricted the way agents are; a skill's actual LSP exposure depends entirely on which agents it delegates to (see delegation map below) or, when run in the main session context, on whatever tools that context has loaded.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:1-4`, `.claude/skills/implement/SKILL.md:1-4`
- **Excerpt (fact-finder/SKILL.md:1-4):**
  ```yaml
  ---
  name: fact-finder
  description: Map the codebase for a spec or question. Spawns codebase agents in isolated contexts — only results return to main context. Outputs a research report to thoughts/shared/facts/. Use before /planner.
  ---
  ```

- **Observation:** `claude-code-extensions/SKILL.md` is the only skill file containing the string `tools:`, but its four occurrences are inside example frontmatter blocks illustrating how to write *other* agent/skill definitions.
- **Direct consequence:** This skill's own tool access is not restricted by these lines; they are reference documentation content, not that file's frontmatter.
- **Evidence:** `.claude/skills/claude-code-extensions/SKILL.md:52,162,197,203-204`
- **Excerpt:**
  ```
  162:tools: Read, Grep, Glob, Bash # Allowlist. Inherits all tools if omitted.
  ```

- **Observation:** Of the 17 skills, 8 explicitly name `codebase-analyzer` and/or `codebase-pattern-finder` (the two LSP-capable agents) in their delegation instructions: `fact-finder`, `feature-architect`, `just-do-it`, `logic-bugs-qa`, `planner`, `python-qa`, `typescript-qa`, `clean-code`.
- **Direct consequence:** For these 8 skills, code-analysis work delegated to those two agents can use `LSP`; for the other 9 skills (`change-architect`, `claude-code-extensions`, `commit`, `dox-init`, `dox-update`, `epic-planner`, `implement`, `mission-architect`, `prototype`, `specifier`), no such delegation path to an LSP-capable agent is named in their SKILL.md text.
- **Evidence:** grep results captured in Coverage Map; individually verified by reading `fact-finder/SKILL.md` and `implement/SKILL.md` frontmatter/body directly (see Verification Log).

- **Observation:** `/implement` dispatches its implementer and reviewer subagents as `general-purpose` (`CLAUDE.md`, "Worker Agents" section: "`/implement` is the exception: its implementers and reviewers run as `general-purpose`, on `haiku` and the session model respectively"), and the `general-purpose` agent type's declared tool set is `*` per the current agent-type listing available in this session.
- **Direct consequence:** `/implement`'s subagents are not blocked from calling `LSP` by a frontmatter restriction the way `codebase-locator` or `thoughts-locator` are, but neither `implement/SKILL.md` nor its `implementer-prompt.md`/`reviewer-prompt.md` templates instruct or reference `LSP` use.
- **Evidence:** `.claude/skills/implement/SKILL.md`, `.claude/skills/implement/implementer-prompt.md`, `.claude/skills/implement/reviewer-prompt.md` — zero matches for `LSP` in all three files.

## Detailed Technical Analysis (Verified)

### Agent frontmatter `tools:` lists (all 6, verified by Read)
| Agent | tools: list | Has LSP? |
|---|---|---|
| `codebase-analyzer` | Read, Bash, LSP, mcp__context7__resolve-library-id, mcp__context7__query-docs | Yes |
| `codebase-pattern-finder` | Bash, Read, Glob, Grep, LSP, mcp__context7__resolve-library-id, mcp__context7__query-docs | Yes |
| `codebase-locator` | Bash, Read, Glob, Grep | No |
| `thoughts-analyzer` | Bash, Read, WebFetch, mcp__searxng__searxng_search, mcp__context7__query-docs | No |
| `thoughts-locator` | Bash, Read | No |
| `web-search-researcher` | WebFetch, mcp__crawl4ai__crawl4ai, mcp__searxng__searxng_search, mcp__context7__resolve-library-id, mcp__context7__query-docs | No |

Evidence for each row is the frontmatter block at lines 4–10 (approx.) of the respective file under `.claude/agents/`, all read directly in Phase 1 of this research.

### Skill → LSP-capable-agent delegation map (verified by grep, cross-checked against 2 skills' full frontmatter)
| Skill | References codebase-analyzer or codebase-pattern-finder? |
|---|---|
| `fact-finder` | Yes (both) |
| `feature-architect` | Yes (codebase-analyzer) |
| `just-do-it` | codebase-analyzer, codebase-locator (analyzer only carries LSP) |
| `logic-bugs-qa` | Yes (both) |
| `planner` | Yes (both) |
| `python-qa` | Yes (both) |
| `typescript-qa` | Yes (both) |
| `clean-code` | Yes (both) |
| `change-architect` | No |
| `claude-code-extensions` | No |
| `commit` | No |
| `dox-init` | No |
| `dox-update` | No |
| `epic-planner` | No |
| `implement` | No (uses `general-purpose` subagents instead) |
| `mission-architect` | No |
| `prototype` | No |
| `specifier` | No |

**Evidence:** `grep -o` name-matching command over `.claude/skills/*/SKILL.md`, output captured verbatim in the tool-call transcript for this research session.

## Verification Log
- `Verified (personally read):` `.claude/agents/codebase-analyzer.md`, `.claude/agents/codebase-locator.md`, `.claude/agents/codebase-pattern-finder.md`, `.claude/agents/thoughts-analyzer.md`, `.claude/agents/thoughts-locator.md`, `.claude/agents/web-search-researcher.md`, `.claude/skills/fact-finder/SKILL.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/claude-code-extensions/SKILL.md`
- `Accepted from sub-agent excerpts (not personally re-read):` none — no sub-agents were delegated to for this research; all findings came from direct `Read`/`Bash`/`grep` by the fact-finder itself, since the scope (frontmatter of 23 files) did not require exploratory delegation.
- `Spot-checked excerpts captured:` yes

## Open Questions / Unverified Claims
- The `general-purpose` agent type's tool set (`*`, i.e. unrestricted) was read from this session's own agent-type listing rather than from a file in the repository, since no `.claude/agents/general-purpose.md` or equivalent definition file was found under `.claude/agents/`. Whether that tool set is itself configured somewhere in this repo, or is a harness-level default outside the repo, was not established — no file evidence was found either way. Treated as Unverified for repo-internal sourcing.
- Whether a skill or agent that has `LSP` in scope *actually invokes* it during a real run (as opposed to merely being permitted to) was out of scope for this research, which covers declared tool access only, not runtime behavior.

## References

**Codebase Citations**:
- `.claude/agents/codebase-analyzer.md:4-9`
- `.claude/agents/codebase-locator.md:4-8`
- `.claude/agents/codebase-pattern-finder.md:4-11`
- `.claude/agents/thoughts-analyzer.md:4-9`
- `.claude/agents/thoughts-locator.md:4-6`
- `.claude/agents/web-search-researcher.md:4-9`
- `.claude/skills/fact-finder/SKILL.md:1-4`
- `.claude/skills/implement/SKILL.md:1-4`
- `.claude/skills/claude-code-extensions/SKILL.md:52,162,197,203-204`
