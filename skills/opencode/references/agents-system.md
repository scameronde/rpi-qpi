# OpenCode Agents System Architecture

## Table of Contents

1. [Agent File Structure](#agent-file-structure)
2. [YAML Frontmatter Complete Schema](#yaml-frontmatter-complete-schema)
3. [Agent Types and Behavior](#agent-types-and-behavior)
4. [Temperature Configuration Guidance](#temperature-configuration-guidance)
5. [System Prompt Definition](#system-prompt-definition)
6. [References](#references)

## Agent File Structure

**Location**:
- Global: `~/.config/opencode/agent/<name>.md`
- Project: `.opencode/agent/<name>.md`

**Filename Becomes Agent Name**: `review.md` → `review` agent

**Evidence**: `https://opencode.ai/docs/agents/`

**Verified Example**:
```markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---

You are in code review mode. Focus on:
- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
```

## YAML Frontmatter Complete Schema

**Required Fields**:
- `description` (string, 1-1024 characters)

**Optional Core Fields**:
```yaml
mode: "primary" | "subagent" | "all"  # Default: "all"
temperature: number  # 0.0-1.0, default: model-specific
model: string  # Format: "provider/model-id"
prompt: string | "{file:./path.txt}"  # Inline or file reference
maxSteps: number  # Max agentic iterations
disable: boolean  # Set true to disable agent
hidden: boolean  # Hide from @ autocomplete (subagents only)
```

**Evidence**: `https://opencode.ai/docs/agents/`

**Tool Control**:
```yaml
tools:
  write: boolean
  edit: boolean
  bash: boolean
  read: boolean
  webfetch: boolean
  skill: boolean
  todoread: boolean
  todowrite: boolean
  glob: boolean
  grep: boolean
  list: boolean
  task: boolean
  lsp: boolean
  websearch: boolean
  codesearch: boolean
  mymcp_*: boolean  # Wildcards supported
```

**Permissions (Granular)**:
```yaml
permission:
  # Simple form
  edit: "ask" | "allow" | "deny"
  bash: "ask" | "allow" | "deny"
  webfetch: "ask" | "allow" | "deny"
  
  # Granular form (pattern-based)
  bash:
    "*": "ask"  # Default (put first!)
    "git *": "allow"
    "git push": "ask"
    "rm *": "deny"
  
  edit:
    "*": "deny"
    "packages/web/src/content/docs/*.mdx": "allow"
  
  skill:
    "*": "allow"
    "internal-*": "deny"
    "experimental-*": "ask"
  
  task:  # Subagent invocation control
    "*": "deny"
    "orchestrator-*": "allow"
    "code-reviewer": "ask"
```

**Evidence**: `https://opencode.ai/docs/agents/`

## Agent Types and Behavior

### Primary Agents

**Mode**: `mode: primary` or `mode: all`

**User Interaction**: Tab key cycles between primary agents

**Access**: All configured tools by default

**Built-in Examples**: `build` (default, all tools), `plan` (read-only analysis)

**Evidence**: `https://opencode.ai/docs/agents/#types`

**Excerpt**:
> "Primary agents are the main assistants you interact with directly. You can cycle through them using the **Tab** key, or your configured `switch_agent` keybind. These agents handle your main conversation and can access all configured tools."

### Subagents

**Mode**: `mode: subagent` or `mode: all`

**Invocation**: Automatic (via Task tool) or manual (`@agent-name`)

**Sessions**: Create child sessions (navigate with `<Leader>+Right`/`<Leader>+Left`)

**Built-in Examples**: `general` (multi-step research), `explore` (codebase exploration)

**Evidence**: `https://opencode.ai/docs/agents/#types`

**Excerpt**:
> "Subagents are specialized assistants that primary agents can invoke for specific tasks. You can also manually invoke them by **@ mentioning** them in your messages."

### Hidden Subagents

```yaml
---
mode: subagent
hidden: true
---
```

**Excerpt**:
> "Hide a subagent from the `@` autocomplete menu with `hidden: true`. Useful for internal subagents that should only be invoked programmatically by other agents via the Task tool."

### Agent Modes Comparison

| Feature | Primary Agent | Subagent | All Mode |
|---------|--------------|----------|----------|
| Mode Value | `mode: primary` | `mode: subagent` | `mode: all` (default) |
| User Activation | Tab key cycle | @mention or Task tool | Both |
| Visibility | Always visible | Visible in @ menu (unless hidden) | Always visible |
| Session Type | Main conversation | Child session | Context-dependent |
| Default Tools | All tools enabled | Customizable (often restricted) | All tools enabled |
| Navigation | N/A | `<Leader>+Right`/`<Leader>+Left` | N/A |
| Use Case | Main interaction | Specialized tasks | Flexible usage |

## Temperature Configuration Guidance

**Official Guidance**:

**Evidence**: `https://opencode.ai/docs/agents/#temperature`

**Excerpt**:
> "Temperature values typically range from 0.0 to 1.0:
> - **0.0-0.2**: Very focused and deterministic responses, ideal for code analysis and planning
> - **0.3-0.5**: Balanced responses with some creativity, good for general development tasks
> - **0.6-1.0**: More creative and varied responses, useful for brainstorming and exploration"

**Default Behavior**:
> "If no temperature is specified, OpenCode uses model-specific defaults; typically 0 for most models, 0.55 for Qwen models."

## System Prompt Definition

### Inline Prompt

```yaml
---
prompt: |
  You are a security expert. Focus on identifying potential security issues.
  
  Look for:
  - Input validation vulnerabilities
  - Authentication and authorization flaws
  - Data exposure risks
---
```

### External File Reference

```yaml
---
prompt: "{file:./prompts/code-review.txt}"
---
```

**Evidence**: `https://opencode.ai/docs/agents/`

**Excerpt**:
> "This path is relative to where the config file is located. So this works for both the global OpenCode config and the project specific config."

## References

### Official Documentation
- **OpenCode Agents Documentation**: https://opencode.ai/docs/agents/
  - Agent file structure, YAML frontmatter schema, agent types, temperature guidance, system prompt definition
- **OpenCode Agents Types**: https://opencode.ai/docs/agents/#types
  - Primary agents, subagents, hidden subagents behavior and invocation patterns
- **OpenCode Agents Temperature**: https://opencode.ai/docs/agents/#temperature
  - Temperature configuration ranges and recommended values
