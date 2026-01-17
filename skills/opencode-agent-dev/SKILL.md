---
name: opencode-agent-dev
description: Comprehensive reference for OpenCode Skills and Agents systems, including Claude Sonnet-4.5 optimization techniques and prompt engineering best practices
license: MIT
allowed-tools:
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-01-17"
---

# OpenCode Agent Development

Comprehensive reference for developing OpenCode skills and agents. This skill provides detailed specifications, examples, and best practices for the Skills system, Agents system, Claude Sonnet-4.5 optimization, and prompt engineering.

## What This Skill Provides

### 1. OpenCode Skills System Reference
Complete guide to the Skills system architecture:
- Skill definition format (YAML frontmatter + Markdown)
- Directory structure and file organization
- Tool permissions and allowed-tools configuration
- Metadata requirements and versioning
- Integration with agent system

**Reference:** `references/skills-system.md`

### 2. OpenCode Agents System Reference
Detailed specifications for agent configuration:
- Agent definition format (YAML frontmatter + Markdown)
- Agent modes (primary, subagent, all-mode)
- Temperature settings for different tasks
- Tool permissions (granular boolean flags)
- Agent orchestration patterns

**Reference:** `references/agents-system.md`

### 3. Claude Sonnet-4.5 Optimization Reference
Claude 4.5-specific optimization techniques:
- Prompt engineering best practices
- Context window management strategies
- Temperature tuning for different task types
- Token efficiency techniques
- Multi-agent coordination patterns

**Reference:** `references/claude-optimization.md`

### 4. Prompt Engineering Techniques Reference
General prompt engineering patterns:
- System prompt structure and organization
- Few-shot examples and demonstrations
- Chain-of-thought prompting
- Role-based prompting
- Error recovery patterns

**Reference:** `references/prompt-engineering.md`

### 5. Critical Findings Reference
Important pitfalls and best practices:
- Common configuration errors
- Tool permission gotchas
- Agent mode selection guidelines
- Debugging strategies
- Performance optimization tips

**Reference:** `references/critical-findings.md`

## When to Use This Skill

Invoke this skill when you need:

1. **Creating New Skills**: "What's the required format for SKILL.md frontmatter?"
2. **Configuring Agents**: "How do I set up a primary agent with specific tool permissions?"
3. **Optimizing Prompts for Claude 4.5**: "What temperature should I use for planning tasks?"
4. **Understanding OpenCode Architecture**: "How do skills and agents interact?"
5. **Troubleshooting Configuration**: "Why isn't my agent loading?"
6. **Best Practices**: "What are the critical rules for agent development?"

## How to Use

Simply invoke the skill and ask your question. The skill will guide you to the appropriate reference file or provide direct answers.

**Examples:**
```
skills_opencode_agent_dev
Question: What's the format for agent YAML frontmatter?

skills_opencode_agent_dev  
Question: How do I optimize prompts for Claude Sonnet-4.5?

skills_opencode_agent_dev
Question: What are the required fields in SKILL.md metadata?

skills_opencode_agent_dev
Question: How do I create a new skill for OpenCode?

skills_opencode_agent_dev
Question: How do I reduce context usage for long-horizon tasks?
```

## Quick Reference

### Critical Rules
- **Directory Name Matching**: Skill `name:` field MUST exactly match directory name (e.g., `skills/opencode-agent-dev/` → `name: opencode-agent-dev`)
- **Last-Match-Wins Permissions**: If tool appears multiple times in `allowed-tools`, last occurrence takes precedence
- **Agent Modes**: Primary agents (`mode: primary`) can be invoked directly; subagents (`mode: subagent`) are invoked by other agents
- **Tool Permissions**: Use granular boolean flags in agent frontmatter; add comments when disabling (e.g., `# use Sub-Agent 'X' instead`)
- **Temperature Ranges**: Research/Planning = 0.1, Implementation = 0.2, Creative = 0.7+

### Common Patterns

**SKILL.md Format:**
```yaml
---
name: skill-directory-name
description: One-to-two sentence summary
license: MIT
allowed-tools:
  - read
metadata:
  version: "1.0"
  author: "Team Name"
  last-updated: "YYYY-MM-DD"
---
```

**Agent Modes:**
- `mode: primary` - User-invokable agents (Mission-Architect, Planner, etc.)
- `mode: subagent` - Helper agents invoked by other agents (Task-Executor, etc.)
- No mode field - All-mode agent (available in all contexts)

**Temperature Guidelines:**
- 0.1 = Precise, deterministic (research, planning, analysis)
- 0.2 = Slightly creative (implementation, code generation)
- 0.5-0.7 = Balanced (general tasks)
- 0.7-1.0 = Creative (brainstorming, exploration)

### File Structure
All references are in the `references/` directory:
- `skills-system.md` - Skills architecture and configuration
- `agents-system.md` - Agent configuration and orchestration
- `claude-optimization.md` - Claude 4.5-specific techniques
- `prompt-engineering.md` - General prompt engineering patterns
- `critical-findings.md` - Pitfalls and best practices

## Related Documentation

- **AGENTS.md**: Repository-wide agent guidelines and code style
- **thoughts/shared/**: Mission statements, specifications, epics, research, and plans
- **agent/*.md**: Agent definitions in the project
- **tool/*.ts**: Custom tool implementations

## Known Limitations and Open Questions

This section documents research limitations and unverified claims identified during skill development. These represent gaps in official documentation or areas requiring empirical validation.

### Temperature Parameter for Claude Sonnet-4.5

**Status**: ⚠️ **Not Found in Official Documentation**

**Attempted**:
- Searched official Anthropic documentation
- Searched Claude API reference
- Searched community resources

**Finding**: No specific temperature guidance found for Claude Sonnet-4.5. Anthropic emphasizes prompt engineering over sampling parameters.

**Recommended Approach**:
- Use default (not specified) for most tasks
- Test empirically: `temperature=0` for deterministic coding, `0.7-1.0` for creative tasks
- Contact Anthropic support for official recommendations

**Evidence Missing**: Specific temperature value recommendations from official sources

### Evaluation Frameworks for Prompt Optimization

**Status**: ⚠️ **Limited Public Information**

**Attempted**:
- Searched for LLM evaluation frameworks
- Searched for prompt testing methodologies
- SearxNG returned no results

**Finding**: Most evaluation tooling is proprietary/closed-source. Academic focus is on techniques, not measurement.

**Known Tools** (mentioned but not verified):
- **Evals** (OpenAI internal framework, partially open-sourced)
- **BrainTrust** (mentioned in searches, no detailed docs)
- **LangSmith** (LangChain ecosystem)
- **Promptfoo** (open-source, mentioned but not fetched)

**Evidence Missing**: Comprehensive evaluation framework documentation, best practices for measuring prompt effectiveness

### Skill Base Directory Context Delivery

**Status**: ⚠️ **Plugin-Specific Feature**

**Attempted**:
- Verified official OpenCode documentation (no mention)
- Found in third-party `opencode-skills` plugin documentation

**Finding**: "Base directory for this skill: {path}" message injection is a **plugin-specific feature**, not guaranteed in native OpenCode implementation.

**Source**: `https://deepwiki.com/malhashemi/opencode-skills/2.2-creating-your-first-skill` (third-party plugin)

**Evidence Missing**: Confirmation from official OpenCode docs on how skill base directory is communicated to agents
