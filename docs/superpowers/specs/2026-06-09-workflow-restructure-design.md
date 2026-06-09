# Design: Workflow Restructure — Skills + SessionStart Hook

**Date:** 2026-06-09  
**Status:** Approved

## Problem

The current `.claude/` structure has three interlocking problems:

1. **Command/Agent duplication.** Every workflow stage (mission-architect, specifier, epic-planner, researcher, planner, feature-architect) has both a Command file and a matching Agent file with the same intent. This doubles the maintenance surface with no architectural benefit.

2. **IC/Coder delegation failure.** The implementation-controller Agent is supposed to delegate all code changes to the coder Agent via the `Agent` tool. In practice it never does — it uses `cat > file << EOF` in Bash instead, bypassing the delegation entirely. No code isolation, no review gates.

3. **No session bootstrap.** Skills exist but Claude only discovers them when the user explicitly types `/skill-name`. There is no hook to brief Claude at session start about what skills are available and when to invoke them.

## Goal

Full alignment with the Superpowers architecture pattern:
- Workflow orchestrators become **Skills** — instructions for Claude in the main loop
- Heavy work (codebase research, implementation) runs in **isolated Agent tool calls**
- A **SessionStart hook** bootstraps skill awareness at every session open
- The IC/Coder pair is replaced by the **Subagent-Driven Development** pattern

## Non-goals

- Changing the workflow pipeline stages themselves (mission → spec → epics → research → plan → implement)
- Changing the worker agent logic (codebase-locator, codebase-analyzer, etc.)
- Supporting platforms other than Claude Code

## Architecture

### File structure after restructure

```
.claude/
  agents/                    # Worker agents only (6 files)
    codebase-locator.md      # Explore type — read-only file search
    codebase-analyzer.md     # Explore type — logic tracing
    codebase-pattern-finder.md  # Explore type — pattern search
    thoughts-locator.md      # Explore type — docs in thoughts/
    thoughts-analyzer.md     # Explore type — extract signal from docs
    web-search-researcher.md # general-purpose — external research

  skills/
    mission-architect/       # ✨ converted from Command+Agent
    feature-architect/       # ✨ converted from Command+Agent
    specifier/               # ✨ converted from Command+Agent
    epic-planner/            # ✨ converted from Command+Agent
    researcher/              # ✨ converted from Command+Agent
    planner/                 # ✨ converted from Command+Agent
    subagent-driven-development/  # ✨ replaces IC+Coder
      SKILL.md
      implementer-prompt.md
      spec-reviewer-prompt.md
      code-quality-reviewer-prompt.md
    clean-code/              # unchanged
    python-qa/               # unchanged
    typescript-qa/           # unchanged
    logic-bugs-qa/           # unchanged
    claude-code-extensions/  # unchanged

  hooks/                     # ✨ new
    hooks.json
    session-start

  # commands/ — removed entirely
```

**Removed:**
- `.claude/commands/` (all 7 files)
- `.claude/agents/mission-architect.md`
- `.claude/agents/feature-architect.md`
- `.claude/agents/specifier.md`
- `.claude/agents/epic-planner.md`
- `.claude/agents/researcher.md`
- `.claude/agents/planner.md`
- `.claude/agents/implementation-controller.md`
- `.claude/agents/coder.md`

**File count:** 25 → 15

### Workflow pipeline

```
Greenfield:  /mission-architect → /specifier → /epic-planner → /researcher → /planner → /subagent-driven-development
Brownfield:  /feature-architect → /epic-planner → /researcher → /planner → /subagent-driven-development
Small fix:   /researcher → /planner → /subagent-driven-development
```

All invocations are Skill calls. The user types `/skill-name` or Claude invokes proactively based on hook-injected context.

### Context isolation

Context isolation comes from **Agent tool calls**, not from file type. Skills load orchestration instructions into the main context (~2–5k tokens per skill), then Claude spawns isolated agents for heavy work:

| Stage | Agent calls | Isolation |
|---|---|---|
| mission-architect | None | Not needed — conversation only |
| feature-architect | codebase-locator | Scan results isolated |
| specifier | None | Not needed — reads one doc |
| epic-planner | None | Not needed — reads one doc |
| researcher | codebase-locator, codebase-analyzer, codebase-pattern-finder, web-search-researcher | All file reads isolated |
| planner | codebase-analyzer (for evidence) | File reads isolated |
| subagent-driven-development | implementer, spec-reviewer, quality-reviewer (all general-purpose) | Per-task implementation isolated |

Worker agents use the `Explore` subagent type which physically prevents write operations — a real safety guarantee, not just convention.

### SessionStart hook

Two files in `.claude/hooks/`:

**hooks.json** — registers the hook with Claude Code:
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup|clear|compact",
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/session-start",
        "async": false
      }]
    }]
  }
}
```

**session-start** — bash script that outputs `additionalContext` JSON with:
- List of available workflow skills and their purpose
- Invocation ordering rules (researcher before planner, planner before SDD)
- Trigger conditions (when to invoke each skill proactively)

The hook fires on session start (`startup|clear|compact` events). Claude receives the injected context as active instructions rather than passive documentation.

### Subagent-Driven Development (replaces IC/Coder)

The SDD skill instructs Claude (main loop) to orchestrate implementation as follows:

1. Read plan, extract all tasks upfront
2. Per task:
   a. Spawn `general-purpose` implementer agent — implements, writes tests, commits, self-reviews
   b. Spawn `general-purpose` spec reviewer — verifies code matches spec by reading actual files
   c. Spawn `general-purpose` quality reviewer — checks clean code, test coverage, structure
   d. If either reviewer finds issues: implementer fixes, reviewer re-reviews
   e. Mark task complete, advance
3. After all tasks: final review pass

The skill directory contains three prompt template files (`implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`) that Claude reads and embeds into each Agent tool call.

**Model selection:** Claude sizes the model to task complexity — Haiku for mechanical 1–2 file tasks, Sonnet for multi-file integration, Opus for architecture/judgment tasks.

**No Bash escape hatch:** implementer agents have Edit/Write/Read/Glob/Grep/LSP — no Bash. Code changes cannot be made via shell commands.

### Skill file anatomy

Each workflow skill follows this structure:

```
skills/<name>/
  SKILL.md           # frontmatter (name, description) + instructions
```

Frontmatter:
```yaml
---
name: researcher
description: Map codebase relevant to a spec. Spawns codebase agents for isolation. Use before /planner.
---
```

The description field is what appears in the hook-injected skill list and what Claude Code uses for skill discovery.

## Migration

| Action | What |
|---|---|
| Delete | `.claude/commands/` (all 7 files) |
| Delete | `.claude/agents/` orchestrator files (7) + coder + IC (total 9) |
| Convert | Agent content → Skill SKILL.md (7 orchestrators) |
| Create | `.claude/skills/subagent-driven-development/` (4 files) |
| Create | `.claude/hooks/hooks.json` |
| Create | `.claude/hooks/session-start` |
| Update | `CLAUDE.md` — remove Commands table, update workflow docs |

## Open questions

None — design is complete.
