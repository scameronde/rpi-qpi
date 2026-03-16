---
name: claude-code-extensions
description: Reference for extending Claude Code with Commands/Skills, Subagents, and MCP servers. Use when creating or configuring skills, subagents, or MCP integrations, or when asked how to extend Claude Code.
---

# Claude Code Extensions Reference

Comprehensive reference for extending Claude Code with Skills, Subagents, and MCP servers.

---

## Feature Overview

| Feature | Loads | Best for |
|---|---|---|
| **CLAUDE.md** | Every session, automatic | "Always do X" rules, project conventions |
| **Skill** | On demand (description always in context) | Reusable knowledge, invocable workflows |
| **Subagent** | When spawned | Context isolation, parallel tasks, specialized workers |
| **MCP** | Session start | External services, databases, APIs |

**Decision rules:**
- Put in CLAUDE.md if Claude should always know it
- Put in a skill if it's reference material or a workflow you trigger with `/name`
- Use a subagent when you want context isolation or to run something in parallel
- Use MCP to connect to external tools/data sources

---

## Skills

### File locations

| Scope | Path | Applies to |
|---|---|---|
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Legacy | `.claude/commands/<name>.md` | Same as project skill |

Skills override by name: personal > project. A `.claude/skills/` skill wins over `.claude/commands/` if names match.

### SKILL.md structure

```yaml
---
name: my-skill            # Becomes /my-skill. Uses directory name if omitted.
description: What it does and when to use it. Claude uses this to auto-invoke.
argument-hint: "[issue-number]"   # Shown in autocomplete
disable-model-invocation: true    # true = only YOU can invoke (not Claude auto)
user-invocable: false             # false = hidden from / menu (Claude-only)
allowed-tools: Read, Grep, Glob   # Tools Claude can use without approval
model: sonnet                     # Override model for this skill
context: fork                     # Run in isolated subagent context
agent: Explore                    # Which subagent type to use with context:fork
---

Skill content here...
```

**All frontmatter fields are optional.** Only `description` is recommended.

### Invocation control

| Frontmatter | You invoke | Claude auto-invokes | Context cost |
|---|---|---|---|
| (default) | Yes | Yes | Description always loaded |
| `disable-model-invocation: true` | Yes | No | Zero until you invoke |
| `user-invocable: false` | No | Yes | Description always loaded |

Use `disable-model-invocation: true` for actions with side effects (`/deploy`, `/commit`).

### Arguments

```yaml
---
name: fix-issue
---
Fix GitHub issue $ARGUMENTS following our coding standards.
```

- `$ARGUMENTS` — all arguments as a string
- `$ARGUMENTS[0]`, `$0` — first argument by position
- If `$ARGUMENTS` absent, input is appended as `ARGUMENTS: <value>`

### String substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed to the skill |
| `$ARGUMENTS[N]` / `$N` | Argument at 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing SKILL.md |

### Dynamic context injection

Use `` !`command` `` to run shell commands before the skill runs. Output replaces the placeholder:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---
PR diff: !`gh pr diff`
PR comments: !`gh pr view --comments`

Summarize this pull request...
```

### Run in a subagent (context: fork)

```yaml
---
name: deep-research
context: fork
agent: Explore          # Built-ins: Explore, Plan, general-purpose, or custom agent name
---
Research $ARGUMENTS thoroughly. Find relevant files, read them, summarize findings.
```

The skill content becomes the subagent's task prompt. Results return to your main session.

### Supporting files

```
my-skill/
├── SKILL.md           # Required — main instructions
├── reference.md       # Detailed docs (loaded when needed)
└── scripts/
    └── helper.py      # Scripts Claude can execute
```

Reference them from SKILL.md:
```markdown
For complete API details, see [reference.md](reference.md)
```

---

## Subagents

### File locations

| Scope | Path | Priority |
|---|---|---|
| CLI flag `--agents` | Session only, not saved | 1 (highest) |
| `.claude/agents/<name>.md` | Current project | 2 |
| `~/.claude/agents/<name>.md` | All your projects | 3 |
| Plugin `agents/` | Where plugin enabled | 4 (lowest) |

Same name at multiple scopes: higher priority wins.

### Agent file structure

```markdown
---
name: code-reviewer           # Required. Lowercase, hyphens only.
description: Reviews code for quality. Use proactively after code changes.  # Required.
tools: Read, Grep, Glob, Bash # Allowlist. Inherits all tools if omitted.
disallowedTools: Write, Edit  # Denylist, removed from inherited/specified list.
model: sonnet                 # sonnet | opus | haiku | inherit (default: inherit)
permissionMode: default       # default | acceptEdits | dontAsk | bypassPermissions | plan
maxTurns: 10                  # Max agentic turns before stopping
skills:                       # Skills preloaded into subagent context at startup
  - api-conventions
  - error-handling-patterns
mcpServers:                   # MCP servers available to this subagent
  - slack                     # Reference by name (must be already configured)
memory: user                  # user | project | local — enables cross-session memory
background: false             # true = always run as background task
isolation: worktree           # worktree = isolated git worktree copy
---

System prompt / instructions for this subagent.
Subagents receive only this system prompt (plus env details like CWD).
They do NOT inherit the main Claude Code system prompt.
```

### Built-in subagents

| Agent | Model | Tools | Purpose |
|---|---|---|---|
| `Explore` | Haiku | Read-only | Fast codebase search and analysis |
| `Plan` | Inherits | Read-only | Research during plan mode |
| `general-purpose` | Inherits | All | Complex multi-step tasks |

### Tool control

```yaml
# Allowlist — only these tools
tools: Read, Grep, Glob, Bash

# Denylist — remove specific tools
disallowedTools: Write, Edit

# Control which subagents can be spawned (for main-thread agents only)
tools: Agent(worker, researcher), Read, Bash  # Only worker and researcher
tools: Agent, Read, Bash                      # Any subagent
# Omit Agent entirely to block all spawning
```

### Preload skills

```yaml
skills:
  - api-conventions       # Full skill content injected at startup
  - error-patterns        # Subagents do NOT inherit skills from parent
```

This is the inverse of `context: fork` in a skill:
- `context: fork` in skill → skill content drives a subagent
- `skills:` in subagent → subagent controls prompt, skills are reference material

### Memory

```yaml
memory: user     # ~/.claude/agent-memory/<name>/
memory: project  # .claude/agent-memory/<name>/  (shareable via git)
memory: local    # .claude/agent-memory-local/<name>/  (gitignored)
```

When enabled: agent gets memory directory, first 200 lines of `MEMORY.md` injected at startup. Read/Write/Edit tools auto-enabled.

### Hooks in subagents

Define in frontmatter — only active while subagent runs:

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/lint.sh"
```

### Disable specific subagents

In `settings.json`:
```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-agent)"]
  }
}
```

Or via CLI: `claude --disallowedTools "Agent(Explore)"`

### Manage subagents

```bash
/agents          # Interactive UI to create/edit/delete
claude agents    # List all configured agents (CLI)
```

---

## MCP Servers

### Add a server

```bash
# HTTP (recommended for remote servers)
claude mcp add --transport http <name> <url>
claude mcp add --transport http notion https://mcp.notion.com/mcp

# SSE (deprecated, use HTTP when available)
claude mcp add --transport sse <name> <url>

# stdio (local processes)
claude mcp add --transport stdio --env KEY=value <name> -- <command> [args]
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable -- npx -y airtable-mcp-server

# With auth header
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

**IMPORTANT:** All flags (`--transport`, `--env`, `--scope`, `--header`) must come BEFORE the server name. `--` separates server name from the command.

### Scopes

```bash
--scope local    # Default. Private, stored in ~/.claude.json under project path.
--scope project  # Shared via .mcp.json in project root (commit to git).
--scope user     # Cross-project, private, stored in ~/.claude.json.
```

Precedence: local > project > user

### Manage servers

```bash
claude mcp list             # List all configured servers
claude mcp get <name>       # Details for a specific server
claude mcp remove <name>    # Remove a server
/mcp                        # Check status and authenticate (within Claude Code)
```

### .mcp.json format (project scope)

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    },
    "local-tool": {
      "command": "/path/to/server",
      "args": ["--config", "config.json"],
      "env": { "KEY": "value" }
    }
  }
}
```

Supports `${VAR}` and `${VAR:-default}` environment variable expansion in `command`, `args`, `env`, `url`, `headers`.

### OAuth authentication

```bash
# Add server, then authenticate:
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
/mcp    # Follow browser flow

# Fixed callback port (for pre-registered redirect URIs):
claude mcp add --transport http --callback-port 8080 my-server https://mcp.example.com/mcp

# Pre-configured OAuth credentials:
claude mcp add --transport http --client-id your-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### Use in subagents

```yaml
# Reference by name (server must already be configured):
mcpServers:
  - slack
  - github

# Or inline definition:
mcpServers:
  my-db:
    type: stdio
    command: npx
    args: ["-y", "db-server"]
    env:
      DB_URL: "postgresql://localhost/mydb"
```

### MCP Tool Search

Automatically activates when MCP tools exceed 10% of context. Control with:
```bash
ENABLE_TOOL_SEARCH=auto        # Default — activates at 10% threshold
ENABLE_TOOL_SEARCH=auto:5      # Activate at 5% threshold
ENABLE_TOOL_SEARCH=true        # Always enabled
ENABLE_TOOL_SEARCH=false       # Disabled — all tools loaded upfront
```

---

## Combining Features

| Pattern | How |
|---|---|
| Skill + context isolation | Add `context: fork` + `agent: Explore` to skill frontmatter |
| Subagent with domain knowledge | Add `skills: [my-skill]` to subagent frontmatter |
| Subagent with external tools | Add `mcpServers: [server-name]` to subagent frontmatter |
| Parallel research | Use a skill with `context: fork` per topic, or ask Claude to spawn parallel subagents |
| Side-effect skill (safe) | Add `disable-model-invocation: true` — only you can trigger |

---

## Context Cost Summary

| Feature | Cost |
|---|---|
| CLAUDE.md | Every request (full content) |
| Skill description | Every request (small) |
| Skill full content | Only when invoked |
| `disable-model-invocation: true` skill | Zero until manually invoked |
| MCP tool definitions | Every request (tool search defers extras) |
| Subagent | Isolated — doesn't affect main context |

Keep CLAUDE.md under ~500 lines. Use skills for reference material loaded on demand.
