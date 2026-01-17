# Claude Sonnet-4.5 Model Reference

## Table of Contents

1. [Overview](#overview)
2. [Core Specifications](#core-specifications)
3. [Benchmark Performance](#benchmark-performance)
4. [Extended Thinking Feature](#extended-thinking-feature)
5. [Context Awareness Feature](#context-awareness-feature)
6. [Safety and Alignment](#safety-and-alignment)
7. [Quick Selection Guide](#quick-selection-guide)
8. [References](#references)

## Overview

Claude Sonnet-4.5 (released September 29, 2025) is Anthropic's most capable Sonnet model, optimized for complex agents and coding tasks. It features a 200K context window (1M tokens in beta), 64K output capacity, extended thinking support, and best-in-class coding performance (77.2% on SWE-bench Verified). The model maintains focus for **more than 30 hours** on complex, multi-step tasks, making it ideal for autonomous agent development.

## Core Specifications

| Feature | Claude Sonnet-4.5 |
|---------|-------------------|
| **Description** | Best model for complex agents and coding |
| **Claude API ID** | `claude-sonnet-4-5-20250929` |
| **Claude API alias** | `claude-sonnet-4-5` |
| **Input Pricing** | $3 per million tokens |
| **Output Pricing** | $15 per million tokens |
| **Context Window** | 200K tokens / 1M tokens (beta) |
| **Max Output** | 64K tokens |
| **Extended Thinking** | Yes (disabled by default) |
| **Reliable Knowledge Cutoff** | January 2025 |
| **Training Data Cutoff** | July 2025 |

## Benchmark Performance

### SWE-bench Verified (Real-world software coding)

- **Base Config** (200K context): 77.2%
- **High Compute Config** (parallel attempts, rejection sampling): 82.0%

### OSWorld (Computer use benchmark)

- **Claude Sonnet-4.5**: 61.4%
- **Claude Sonnet-4**: 42.2%
- **Improvement**: 45% increase in 4 months

### Long-Horizon Capabilities

Anthropic's official documentation states:

> "Practically speaking, we've observed it maintaining focus for **more than 30 hours** on complex, multi-step tasks."

This makes Claude Sonnet-4.5 particularly well-suited for autonomous agents that need to handle extended workflows without losing context or focus.

## Extended Thinking Feature

### Recommendation for Coding

Anthropic's official documentation states:

> "Claude Sonnet 4.5 performs **significantly better on coding tasks when extended thinking is enabled**. Extended thinking is disabled by default, but we recommend enabling it for complex coding work."

### Warning

> "Be aware that extended thinking impacts prompt caching efficiency."

### API Usage

```python
# Extended thinking enabled
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    },
    messages=[{"role": "user", "content": "..."}]
)
```

**When to Enable Extended Thinking**:
- Complex coding tasks requiring multi-step reasoning
- Debugging intricate issues
- Architectural design decisions
- Code refactoring with multiple constraints

**When to Keep Disabled**:
- Simple CRUD operations
- Straightforward bug fixes
- Documentation tasks
- High-volume API calls where prompt caching matters

## Context Awareness Feature

**New in Claude 4.5**:

Anthropic's official documentation states:

> "Claude Sonnet 4.5 features **context awareness**, enabling the model to track its remaining context window throughout a conversation. Claude receives real-time updates on remaining context capacity after each tool call."

**Implication**: Agent can self-manage context budget, implement compaction strategies proactively.

This feature enables agents to:
- Monitor their own context usage
- Decide when to summarize or compress previous context
- Avoid hitting context limits unexpectedly
- Optimize tool call sequences to preserve context space

## Safety and Alignment

### ASL-3 Deployment

Anthropic's System Card states:

> "Claude Sonnet-4.5 is being released under our **AI Safety Level 3 (ASL-3) protections**, as per our framework that matches model capabilities with appropriate safeguards."

### Alignment Metrics

- **99.29%** harmless response rate
- **<5%** multi-turn failure rate across high-risk categories
- **0.02%** refusal rate for benign requests

### Behavioral Improvements

- Reduced sycophancy, deception, power-seeking
- Reduced encouragement of delusional thinking
- Improved prompt injection resistance

## Quick Selection Guide

### When to Use Claude Sonnet-4.5

**Best For**:
- **Autonomous Agents**: Long-running tasks requiring 30+ hours of focus
- **Complex Coding**: Multi-file refactoring, architectural changes, sophisticated algorithms
- **Tool-Heavy Workflows**: Tasks requiring 10+ sequential tool calls with context preservation
- **Research & Planning**: Deep analysis requiring extended thinking
- **Production Agents**: High reliability requirements (ASL-3 safety, 99.29% harmless rate)

**Cost Considerations**:
- Input: $3/million tokens
- Output: $15/million tokens
- Extended thinking adds token overhead but improves coding accuracy

### When to Use Alternatives

**Use Claude Opus 4.5 Instead**:
- Maximum capability required (research, complex reasoning)
- Budget allows for higher cost ($15 input / $75 output per million tokens)
- Task complexity exceeds Sonnet's capabilities

**Use Claude Sonnet-4 Instead**:
- Existing workflows optimized for Sonnet-4
- Budget constraints (check current pricing)
- Tasks not requiring extended thinking or context awareness

**Use Claude Haiku Instead**:
- High-volume, simple tasks (validation, formatting)
- Sub-second latency requirements
- Tight budget constraints
- Simple tool calls without extended reasoning

**Use GPT-4o / GPT-5 Instead**:
- Need OpenAI ecosystem integration
- Prefer different prompting style
- Specific benchmarks favor GPT models for your use case

### Model Selection Strategy

**Phase 1: Establish Baseline** (Recommended)
1. Start with most capable model (GPT-5 or Claude Opus 4.5)
2. Write detailed, verbose prompts
3. Build comprehensive evaluation suite
4. Achieve target accuracy (e.g., 95%)

**Phase 2: Optimize Cost**
1. Try smaller models (GPT-4o, Claude Sonnet 4.5)
2. Simplify prompts (remove redundant instructions)
3. Constrain outputs (JSON schemas, shorter responses)
4. Run evaluations - if accuracy drops <2%, keep optimization
5. Iterate until cost/quality balanced

## References

### Primary Documentation

- **Model Overview**: https://platform.claude.com/docs/en/about-claude/models/overview
- **What's New in Claude 4.5**: https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-5
- **Release Announcement**: https://www.anthropic.com/news/claude-sonnet-4-5

### Safety and Alignment

- **System Card** (PDF): https://assets.anthropic.com/m/12f214efcc2f457a/original/Claude-Sonnet-4-5-System-Card.pdf

### Prompt Engineering

- **Claude 4 Best Practices**: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices
- **Anthropic Prompt Engineering Guide**: https://platform.claude.com/docs/

### Technical Analysis

- **LLM Stats Analysis**: https://llm-stats.com/blog/research/claude-sonnet-4-5-launch

---

**Last Updated**: January 17, 2026  
**Source**: OpenCode Skills and Agent Development Research Report (2026-01-17)
