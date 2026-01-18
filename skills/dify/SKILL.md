---
name: dify
description: Comprehensive technical reference for Dify bot development including node types, variable system, voice bot patterns, and architecture specifications
license: MIT
allowed-tools:
  - read
metadata:
  version: "1.1"
  author: "Netto Bot Development Team"
  last-updated: "2026-01-13"
---

# Dify Reference

Comprehensive technical reference for Dify bot development. This skill provides detailed specifications, examples, and best practices for working with Dify DSL workflows and chatbots.

## What This Skill Provides

### 1. Node Type Specifications
Detailed reference for all 18+ Dify node types across 6 categories:
- Input/Output nodes (start, end, answer)
- AI/LLM nodes (llm configuration, memory, vision)
- Control flow nodes (if-else, iteration, loop)
- Data processing nodes (code, template-transform, variable-assigner, variable-aggregator)
- Integration nodes (http-request, tool)
- State management nodes (question-classifier, list-operator)

**Reference:** `references/node-types.md`

### 2. Variable System Deep Dive
Complete guide to Dify's variable system:
- Variable reference syntax patterns
- System variables (workflow vs chatflow)
- Conversation variables (declaration and usage)
- Environment variables
- Iteration variables
- Field path resolution

**Reference:** `references/variable-system.md`

### 3. Voice Bot Design Patterns
Voice-specific design patterns and constraints:
- Identifying voice bots
- Latency optimization strategies
- Speech-to-text error handling
- Response format rules for spoken output
- CVG (CognitiveVoice.io) integration
- Phone element pronunciation

**Reference:** `references/voice-bot-patterns.md`

### 4. Platform Architecture
Deep dive into Dify platform architecture:
- Application modes (workflow vs advanced-chat)
- DSL structure and format
- Graph execution model (DAG)
- Plugin system
- Features configuration
- Production readiness

**Reference:** `references/architecture.md`

## When to Use This Skill

Invoke this skill when you need:

1. **Node Type Lookup**: "What are the configuration options for iteration nodes?"
2. **Variable Syntax**: "How do I reference a nested field from an HTTP response?"
3. **Voice Bot Design**: "What are the latency constraints for voice bots?"
4. **Architecture Questions**: "What's the difference between workflow and advanced-chat mode?"
5. **Example Patterns**: "Show me an example of parallel iteration configuration"
6. **Troubleshooting**: "Why is my variable reference not resolving?"

## How to Use

Simply invoke the skill and ask your question. The skill will guide you to the appropriate reference file or provide direct answers.

**Examples:**
```
skills_dify_reference
Question: What's the configuration for Variable Assigner v2?

skills_dify_reference  
Question: How do I optimize a voice bot for low latency?

skills_dify_reference
Question: Show me the syntax for referencing iteration items
```

## Quick Reference

### Critical Rules
- Always use Variable Assigner **v2** (type: assigner, version: '2')
- Node IDs must be numeric strings (e.g., '1765791071967')
- Variable references: `{{#node_id.field_name#}}`
- Max parallel iterations: 10
- Voice bots: Minimize sequential nodes (each adds 20-50ms overhead)


### Node Structure Pitfalls (CRITICAL)

**Code Nodes:**
- ❌ NEVER use `inputs` → ✅ Always use `variables` (array)
- ❌ Field names: `selector`, `type` → ✅ Use `value_selector`, `value_type`
- ❌ Outputs: `{type: number}` → ✅ Must include `children: null`

**If-Else Nodes:**
- ❌ Number equality: `is` → ✅ Use `=` (quoted operator)
- ❌ Greater-equal: `>=` → ✅ Use `≥` (Unicode U+2265)
- ❌ Values: `1`, `2` (integers) → ✅ Use `'1'`, `'2'` (quoted strings)
- ❌ Missing `id` in cases → ✅ Every case needs `id` field matching `case_id`


**Assigner v2 Nodes:**
- ❌ Field name: `value_selector` → ✅ Use `value` (for both constant and variable)
- ❌ Operation: `overwrite` → ✅ Use `over-write` (with hyphen)
- ❌ Using wrong operation for input type → ✅ `constant`+`set`, `variable`+`over-write`

**Impact:** These mistakes cause **silent failures** - Dify Studio won't load the bot with no error message.


### Common Patterns
- Start node → required entry point
- End node → workflow output (type: end)
- Answer node → chatflow streaming output (type: answer)
- Edge format: `{source_id}-source-{target_id}-target`

### File Structure
All references are in the `references/` directory:
- `node-types.md` - Complete node type catalog
- `variable-system.md` - Variable reference guide
- `voice-bot-patterns.md` - Voice-specific patterns
- `architecture.md` - Platform deep dive

## Related Documentation

- **AGENTS.md**: Repository-wide Dify guidelines and code style
- **thoughts/shared/research/**: Research findings and analysis
- **bots/**: Example bot implementations
- **knowledge/**: Problem/solution documents for Netto domain
