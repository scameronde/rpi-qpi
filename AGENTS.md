# AGENTS.md - OpenCode Agent Guidelines for rpiqr

This document provides guidelines for coding agents working in the rpiqr repository.

## Repository Overview

**Purpose**: OpenCode agent and skill development repository  
**Type**: Agent definitions, skills, and custom tools for OpenCode framework  
**Primary Language**: TypeScript (tools), Markdown (agents/skills)  
**Structure**: Agent orchestration system with specialized subagents

## Directory Structure

```
/agent/           - Agent definitions (*.md with YAML frontmatter)
/skills/          - Skill definitions (SKILL.md with references/)
/tool/            - Custom MCP tools (TypeScript)
/thoughts/        - Documentation and artifacts
  /shared/        - Shared artifacts
    /missions/    - High-level mission statements
    /specs/       - Technical specifications
    /epics/       - Feature epics
    /research/    - Research reports
    /plans/       - Implementation plans
    /qa/          - QA analysis reports
  /projects/      - Project-specific documentation
/.opencode/       - OpenCode configuration and dependencies
opencode.json     - OpenCode provider and MCP configuration
```

## Build/Lint/Test Commands

This repository contains primarily documentation and configuration. There are no traditional build/test commands for the agents and skills themselves.

### Tool Development (TypeScript)

When developing custom tools in `/tool/`:

```bash
# Install dependencies (in .opencode/ directory)
cd .opencode && npm install

# Type checking (if TypeScript is configured)
npx tsc --noEmit

# Linting (if ESLint is configured)
npx eslint tool/*.ts
```

### Testing OpenCode Configuration

```bash
# Validate opencode.json syntax
cat opencode.json | python -m json.tool

# Test agent invocation (from OpenCode CLI)
# Use OpenCode interface to invoke agents
```

### No Unit Tests

**Important**: This repository does not contain test files. Agent behavior is validated through:
- Direct invocation via OpenCode CLI
- Integration testing in target repositories
- Manual validation of agent outputs

## Code Style Guidelines

### Agent Definitions (*.md)

**Location**: `/agent/`  
**Format**: YAML frontmatter + Markdown body

#### YAML Frontmatter Structure

```yaml
---
description: "Brief agent purpose (1-2 sentences)"
mode: primary | subagent | (omit for all-mode)
temperature: 0.1 | 0.2 | 0.5 | 0.7 | 1.0
tools:
  bash: true | false  # with comment explaining why disabled
  edit: true | false
  read: true | false
  write: true | false
  glob: true | false
  grep: true | false
  list: true | false
  patch: true | false
  todoread: true | false
  todowrite: true | false
  webfetch: true | false
  searxng-search: true | false
  sequential-thinking: true | false
  context7: true | false
---
```

**Temperature Guidelines**:
- `0.1` - Precise, deterministic (research, planning, analysis)
- `0.2` - Slightly creative (implementation, code generation)
- `0.5-0.7` - Balanced (general tasks)
- `0.7-1.0` - Creative (brainstorming, exploration)

**Tool Permission Comments**: When disabling a tool, include a comment explaining the alternative:
```yaml
glob: false  # use Sub-Agent 'codebase-locator' instead
```

#### Agent Body Structure

1. **Title**: H1 with agent role name
2. **Prime Directive**: Core mission statement
3. **Non-Negotiables**: Hard constraints (MUST/MUST NOT)
4. **Tools & Delegation**: How to use tools and invoke subagents
5. **Execution Protocol**: Step-by-step workflow
6. **Output Format**: Expected deliverables and structure
7. **Response Format**: Structured message envelope (YAML frontmatter + thinking/answer)

### Skill Definitions (SKILL.md)

**Location**: `/skills/<skill-name>/SKILL.md`  
**Critical Rule**: Directory name MUST exactly match `name:` field in frontmatter

#### SKILL.md Frontmatter Structure

```yaml
---
name: skill-directory-name  # MUST match directory name exactly
description: "One-to-two sentence summary"
license: MIT
allowed-tools:
  - read
  - bash
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "YYYY-MM-DD"
---
```

#### Skill Body Structure

1. **Title**: H1 with skill name
2. **What This Skill Provides**: Overview of capabilities
3. **When to Use This Skill**: Trigger conditions
4. **How to Use**: Usage examples
5. **Reference Material**: Link to `/references/` files
6. **Quick Reference**: Common patterns and commands

### Tool Definitions (*.ts)

**Location**: `/tool/`  
**Framework**: `@opencode-ai/plugin`

#### Import Style

```typescript
import { tool } from "@opencode-ai/plugin"
```

#### Interface Definitions

Group related interfaces at the top:
```typescript
interface RequestConfig {
  cache_mode?: "enabled" | "disabled" | "bypass"
  css_selector?: string
}

interface ResponseData {
  url: string
  success: boolean
  content?: string
}
```

#### Tool Export Pattern

```typescript
export default tool({
  description: "Brief description for LLM to understand when to use this tool",
  args: {
    paramName: tool.schema
      .string()
      .optional()
      .describe("Parameter description"),
  },
  async execute(args) {
    // Implementation
  },
})
```

#### Error Handling

Always wrap API calls in try-catch and return structured JSON:

```typescript
try {
  const response = await fetch(url, config)
  return JSON.stringify({
    success: true,
    result: data,
    formattedOutput: humanReadableString,
  }, null, 2)
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  return JSON.stringify({
    success: false,
    error: true,
    errorMessage: `Failed to ...: ${errorMessage}`,
  }, null, 2)
}
```

### Documentation Files (thoughts/)

#### Research Reports

**Location**: `thoughts/shared/research/YYYY-MM-DD-[Topic].md`  
**Structure**: `<thinking>` + `<answer>` with YAML frontmatter

#### Implementation Plans

**Location**: `thoughts/shared/plans/YYYY-MM-DD-[Ticket].md`  
**Structure**: Verified facts + PLAN-XXX tasks with evidence citations

#### QA Reports

**Location**: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`  
**Structure**: `<thinking>` + `<answer>` with QA-XXX improvement items

## Naming Conventions

### Files

- **Agents**: `kebab-case.md` (e.g., `codebase-analyzer.md`)
- **Skills**: Directory and `SKILL.md` (e.g., `typescript-qa/SKILL.md`)
- **Tools**: `kebab-case.ts` (e.g., `crawl4ai.ts`)
- **Thoughts**: `YYYY-MM-DD-[Topic].md` with date prefix

### Variables/Functions (TypeScript)

- **Interfaces**: `PascalCase` (e.g., `CrawlRequest`, `FormattedResponse`)
- **Variables**: `camelCase` or `snake_case` matching API conventions
- **Constants**: `UPPER_SNAKE_CASE` for service URLs
- **Functions**: `camelCase`

### Agent Task IDs

- **Plan tasks**: `PLAN-001`, `PLAN-002` (zero-padded, 3 digits)
- **QA tasks**: `QA-001`, `QA-002`
- **Epic tasks**: `EPIC-001`, `EPIC-002`

## Type Safety Guidelines

### TypeScript Tools

1. **Define interfaces for all API requests/responses**
2. **Use Zod schema for tool argument validation**: `tool.schema.string()`, `tool.schema.number()`, etc.
3. **Explicit return types**: All functions should have return type annotations
4. **Avoid `any`**: Use specific types or `unknown` with type guards
5. **Strict mode**: Assume TypeScript strict mode is enabled

### Type Patterns

```typescript
// API response typing
interface ApiResponse {
  results: Result[]
  number_of_results?: number
}

// Type narrowing
if (error instanceof Error) {
  return error.message
}

// Optional chaining
const engine = result.engine?.[0]
```

## Error Handling Patterns

### Tools (TypeScript)

**Pattern**: Return JSON strings with error flags, never throw

```typescript
try {
  // ... operation
  return JSON.stringify({ success: true, result }, null, 2)
} catch (error) {
  return JSON.stringify({
    success: false,
    error: true,
    errorMessage: `Failed: ${error instanceof Error ? error.message : String(error)}`,
  }, null, 2)
}
```

### Agents (Markdown)

**Pattern**: Report issues to delegating agent or user, don't fail silently

- Use `<thinking>` blocks to document assumptions and uncertainties
- Mark unverified claims in research reports
- Create verification tasks for ambiguous requirements in plans
- Stop and ask for clarification rather than guessing

## Agent Communication Protocols

### Message Envelope (Agent-to-Agent)

When agents respond to delegating agents:

```markdown
---
message_id: [agent-type]-YYYY-MM-DD-NNN
correlation_id: [delegating-agent-correlation-id]
timestamp: YYYY-MM-DDTHH:MM:SSZ
message_type: [ANALYSIS_RESPONSE|PLANNING_RESPONSE|QA_REPORT|etc]
[additional metadata fields]
---

<thinking>
[Internal reasoning, strategy, decisions]
</thinking>

<answer>
[Structured response to delegating agent]
</answer>
```

### Evidence Citation

**File references**: `path/to/file.ext:line-line` with 1-6 line excerpt  
**Web references**: URL + (Type: official_docs, Date: YYYY-MM, Authority: high/medium/low)

## Critical Rules for Agent Development

1. **Directory Name Matching**: Skill directory name MUST exactly match `name:` field
2. **No Code in Agents**: Agents orchestrate, they don't implement (use subagents for code)
3. **Evidence Required**: Claims about code must include path:line + excerpt
4. **Tool Permissions**: Be explicit - use boolean flags with comments when disabling
5. **Temperature Settings**: Lower (0.1-0.2) for precision, higher (0.7+) for creativity
6. **No Scope Creep**: Agents do exactly their defined role, nothing more
7. **Delegation Over Direct Execution**: Use specialized subagents rather than doing everything yourself

## Common Pitfalls to Avoid

- **Don't**: Include line number prefixes from Read tool output in Edit operations
- **Don't**: Assume tooling exists - verify via `package.json` or config files
- **Don't**: Create agents that both plan AND implement (separation of concerns)
- **Don't**: Use `grep`/`glob` when specialized subagents exist (use `codebase-locator` instead)
- **Don't**: Write opinions in research reports (facts only)
- **Don't**: Skip evidence citations (every claim needs proof)
- **Don't**: Create circular dependencies between agents

## OpenCode Configuration

**File**: `opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "aigateway": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "VIER AI Gateway",
      "options": {
        "baseURL": "https://aigateway.eu/core/v1"
      },
      "models": {
        "code---anthropic-claude-sonnet": {
          "name": "Anthropic Claude Sonnet",
          "limit": {
            "context": 200000,
            "output": 64000
          }
        }
      }
    }
  },
  "model": "aigateway/code---anthropic-claude-sonnet",
  "mcp": {
    "server-name": {
      "type": "remote|local",
      "url": "...",  // for remote
      "command": [...],  // for local
      "headers": {...}  // for remote with auth
    }
  }
}
```

## Additional Resources

- **OpenCode Skill Reference**: `skills/opencode/SKILL.md` - Comprehensive agent/skill development guide
- **QA Skills**: `skills/*-qa/SKILL.md` - Language-specific quality analysis workflows
- **Clean Code Skill**: `skills/clean-code/SKILL.md` - Language-agnostic quality principles
