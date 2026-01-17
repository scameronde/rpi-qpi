# Critical Findings Reference

## Table of Contents

- [Impact Summary](#impact-summary)
- [Finding 1: Exact Directory-to-Frontmatter Name Matching](#finding-1-exact-directory-to-frontmatter-name-matching)
- [Finding 2: Claude Sonnet-4.5 Requires Explicit Tool Usage Instructions](#finding-2-claude-sonnet-45-requires-explicit-tool-usage-instructions)
- [Finding 3: Last-Match-Wins Permission Pattern](#finding-3-last-match-wins-permission-pattern)
- [Finding 4: Measurable Cost-Quality Tradeoff](#finding-4-measurable-cost-quality-tradeoff)
- [Finding 5: Context Engineering Replaces Traditional Prompting](#finding-5-context-engineering-replaces-traditional-prompting)
- [Implementation Checklist](#implementation-checklist)

## Impact Summary

These five critical findings represent **must-know** requirements for OpenCode agent and skill development. Each finding addresses a common failure mode that will cause silent errors, unexpected behavior, or cost overruns if ignored:

1. **Directory-Frontmatter Matching** - Skills fail silently without exact name matching
2. **Explicit Tool Instructions** - Claude Sonnet-4.5 suggests instead of implements without explicit direction
3. **Permission Ordering** - Incorrect rule order allows/denies unintended tool usage
4. **Cost-Quality Tradeoff** - 76% cost difference between optimized/unoptimized prompts at scale
5. **Context Engineering** - 66% context reduction possible through architectural patterns

**Why These Five?** These findings are verified from official documentation, represent common implementation errors, and have immediate, measurable impact on system reliability and cost.

---

## Finding 1: Exact Directory-to-Frontmatter Name Matching

**Observation**: OpenCode validates that the directory containing `SKILL.md` exactly matches the `name` field in YAML frontmatter, following strict regex `^[a-z0-9]+(-[a-z0-9]+)*$`.

**Direct Consequence**: Any mismatch between directory name and frontmatter `name` will cause skill loading to fail silently. Skills must use lowercase alphanumeric with single hyphens only.

**Evidence**: `https://opencode.ai/docs/skills/`

**Excerpt**:
```yaml
---
name: skill-name           # REQUIRED: 1-64 chars, lowercase alphanumeric with hyphens
description: description   # REQUIRED: 1-1024 chars, shown in tool description
---
```

Official validation rules:
> "Name must:
> - Be 1–64 characters
> - Be lowercase alphanumeric with single hyphen separators
> - Not start or end with `-`
> - Not contain consecutive `--`
> - **Match the directory name that contains `SKILL.md`**"

---

## Finding 2: Claude Sonnet-4.5 Requires Explicit Tool Usage Instructions

**Observation**: Claude Sonnet-4.5's default behavior is to suggest rather than implement when instructions are ambiguous (e.g., "Can you suggest changes?"). The model follows instructions literally.

**Direct Consequence**: Agents using Claude Sonnet-4.5 must include explicit "default-to-action" instructions in system prompts to trigger tool usage for implementation tasks, otherwise the model will only provide suggestions.

**Evidence**: `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices`

**Excerpt**:
> "Claude 4.5 models are trained for precise instruction following and benefits from explicit direction to use specific tools. If you say 'can you suggest some changes,' it will sometimes provide suggestions rather than implementing them—even if making changes might be what you intended."

Recommended pattern:
```text
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's 
intent is unclear, infer the most useful likely action and proceed, using tools 
to discover any missing details instead of guessing.
</default_to_action>
```

---

## Finding 3: Last-Match-Wins Permission Pattern

**Observation**: OpenCode's granular permission system evaluates rules in order, with the last matching pattern taking precedence. This requires wildcard `"*"` rules to be placed first.

**Direct Consequence**: Incorrectly ordered permission rules (e.g., specific rule before wildcard) will be overridden, potentially allowing/denying unintended tool usage. Always structure rules as: wildcard first, specific overrides after.

**Evidence**: `https://opencode.ai/docs/permissions/`

**Excerpt**:
> "Rules are evaluated by pattern match, with the **last matching rule winning**. A common pattern is to put the catch-all `"*"` rule first, and more specific rules after it."

Example:
```json
{
  "permission": {
    "bash": {
      "*": "ask",           // Default: ask for all
      "git status *": "allow",
      "git push": "ask",
      "rm *": "deny"
    }
  }
}
```

---

## Finding 4: Measurable Cost-Quality Tradeoff

**Observation**: Production analysis of Bolt (2,500 token prompt) vs Cluely (212 token prompt) reveals 76% cost difference ($3,000/day vs $706/day at 100K calls) with justifiable quality tradeoffs.

**Direct Consequence**: Longer, detailed prompts can deliver superior results but require explicit cost-benefit analysis. "Hill climbing" strategy (start high-quality/high-cost, optimize down) prevents premature optimization.

**Evidence**: `https://www.news.aakashg.com/p/prompt-engineering`

**Excerpt**:
Real-world cost equation:
```
Total Cost = (Input Tokens × Price) + (Output Tokens × Price) × Call Volume

Bolt: 2,500 input + 1,500 output = $0.03/call × 100K = $3,000/day
Cluely: 212 input + 400 output = $0.00706/call × 100K = $706/day
```

**Hill Climb Strategy**:
1. Start with GPT-5/Claude Opus + detailed prompts → establish quality baseline
2. Build comprehensive eval suite
3. Optimize down (smaller models, shorter prompts, constrained outputs)
4. Accept optimization if accuracy drops <2%

---

## Finding 5: Context Engineering Replaces Traditional Prompting

**Observation**: Anthropic's engineering team reframes prompting as "context engineering" - the holistic management of all tokens available during inference (system prompt + tools + message history + retrieved data + hooks).

**Direct Consequence**: Effective agent design requires optimizing the entire context stack, not just the system prompt. For long-horizon tasks (>100K tokens), implement compaction strategies, sub-agent architectures, or structured note-taking.

**Evidence**: `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`

**Excerpt**:
Context anatomy components:
1. **System Instructions/Prompts** - Role, task definitions
2. **Tools** - API schemas, function definitions
3. **Message History** - Conversation state
4. **Retrieved Data** - RAG results, file contents
5. **Hooks & Guardrails** - Safety checks, validation

Sub-agent context reduction pattern:
- Manager agent: Maintains high-level plan (~500 tokens)
- Executor sub-agents: Handle detailed implementation (~250 tokens each)
- **Total context reduction: ~66%** vs monolithic approach

---

## Implementation Checklist

### Before Creating a Skill:
- [ ] **Verify directory name** matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex
- [ ] **Ensure frontmatter `name`** exactly matches directory name
- [ ] **Test skill loading** with `skill({ name: "your-skill-name" })`

### Before Creating an Agent:
- [ ] **Add explicit tool usage instructions** if using Claude Sonnet-4.5
- [ ] **Include default-to-action directive** in system prompt
- [ ] **Order permission rules** with wildcards first, specifics after
- [ ] **Verify permission patterns** match intended tool access

### Before Optimizing Prompts:
- [ ] **Establish quality baseline** with detailed prompts + capable model
- [ ] **Build eval suite** to measure accuracy objectively
- [ ] **Calculate cost impact** using token counts × call volume
- [ ] **Apply hill climb strategy** (optimize down from quality baseline)

### Before Deploying Long-Horizon Agents:
- [ ] **Analyze context budget** for tasks >100K tokens
- [ ] **Consider sub-agent architecture** for 66% context reduction
- [ ] **Implement context awareness** prompting for self-management
- [ ] **Test compaction strategies** if using message history >50K tokens
