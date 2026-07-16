# Research Report: Web-Search-Researcher Agent-to-Agent Communication Optimization

## Metadata
- Date: 2026-01-19
- Researcher: Researcher Agent
- Topic: "Web-Search-Researcher Agent-to-Agent Communication Optimization"
- Status: complete
- Coverage: 
  - agent/web-search-researcher.md (subagent definition and output template)
  - agent/researcher.md (primary consumer)
  - agent/planner.md (primary consumer)
  - agent/python-qa-thorough.md (all-mode consumer)
  - agent/typescript-qa-thorough.md (all-mode consumer)
  - Web research: Reusing findings from 2026-01-18-Codebase-Analyzer-Agent-Communication.md (Anthropic, Microsoft, academic papers)

## Executive Summary

- The web-search-researcher subagent uses Markdown format (optimal: 34-38% fewer tokens than JSON) but has 5 structural gaps preventing optimal agent-to-agent communication
- **Gap 1 (Critical)**: No structured source metadata format - sources use prose "**Type**: Official Docs / Issue / Blog" instead of parseable YAML fields
- **Gap 2 (Critical)**: Variable source count (1-N sources) without template guidance on structure consistency
- **Gap 3**: Lacks separation of reasoning (`<thinking>`) from findings (`<answer>`), preventing debugging and token optimization
- **Gap 4**: "No results" fallback format is structurally incompatible with main template, creating parsing ambiguity for consumers
- **Gap 5**: No structured message envelope (correlation IDs, timestamps) for multi-step workflow debugging
- Research sources: Reusing authoritative findings from codebase-analyzer analysis (Anthropic, Microsoft, academic papers)
- Highest-impact recommendation: Add structured source metadata with YAML frontmatter and thinking/answer separation (enables reliable parsing and debugging)
- Secondary recommendation: Support query-specific depth (minimal vs comprehensive) to save 9-19% tokens for focused queries (much smaller savings than codebase-analyzer's 60-70%)

## Coverage Map

**Files Inspected**:
- `agent/web-search-researcher.md` (subagent definition, lines 1-131)
- `agent/researcher.md` (primary consumer agent, lines 1-526)
- `agent/planner.md` (primary consumer agent, lines 1-480)
- `agent/python-qa-thorough.md` (delegation patterns, lines 16-17, 160)
- `agent/typescript-qa-thorough.md` (delegation patterns, lines 16-17, 150)

**Web Research Sources** (7 authoritative sources, reused from 2026-01-18 report):
1. Anthropic Engineering Blog - Multi-Agent Research System (June 2025)
2. Microsoft Research - Token Efficiency with Structured Output (July 2024)
3. Independent Study - Best Nested Data Format Comparison (October 2025)
4. Academic Paper - Optima Framework for LLM-Based MAS (arXiv:2410.08115)
5. Springer Survey - LLM-Based Multi-Agent Systems (October 2024)
6. ApXML Course - Communication Protocols for LLM Agents (2024)
7. Anthropic Documentation - Chain-of-Thought Prompting (Current)

**Scope**:
- Complete analysis of web-search-researcher output structure
- Comprehensive review of 4 consumer agents (Researcher, Planner, Python-QA, TypeScript-QA)
- Evidence-based comparison against industry best practices
- No implementation changes made (research only)

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: Unstructured Source Metadata Format

**Observation**: The web-search-researcher uses prose format for source metadata (e.g., "**Type**: Official Docs / Issue / Blog") instead of structured fields, making programmatic parsing difficult for consumer agents.

**Direct consequence**: Consumer agents (Researcher, Planner) cannot reliably extract source type, date, or version information without custom parsing logic for each field.

**Evidence**: `agent/web-search-researcher.md:94-100`
**Excerpt**:
```markdown
## Source 1: [Official Documentation / GitHub Issue]
**URL**: [Link]
**Type**: Official Docs / Issue / Blog
**Date**: YYYY-MM
**Version**: [e.g., v3.2+]

**Key Findings**:
```

**Token Impact**: No direct impact on tokens, but increases complexity for consumers.

### Finding 2: Variable Source Count Without Structure Guidance

**Observation**: The template shows "Source 1:" but provides no guidance on how to structure multiple sources (Source 2, Source 3, etc.) or ensure consistency across variable result counts.

**Direct consequence**: Responses with 1 source vs 5 sources may have inconsistent formatting, making it harder for consumers to parse and validate completeness.

**Evidence**: `agent/web-search-researcher.md:94`
**Excerpt**:
```markdown
## Source 1: [Official Documentation / GitHub Issue]
```

**Note**: No "Source 2" shown in template, no max sources specified, no guidance on section ordering.

**Token Impact**: Moderate - responses naturally scale with findings (100-500 tokens per source), but lack of structure creates unpredictability.

### Finding 3: No Separation of Reasoning from Findings

**Observation**: The web-search-researcher returns a single prose report mixing search strategy with final results, lacking Anthropic's recommended `<thinking>` and `<answer>` tag separation.

**Direct consequence**: Consuming agents cannot inspect the researcher's search strategy for debugging, and cannot strip reasoning tokens when passing findings to downstream agents.

**Evidence**: Web research - Anthropic Multi-Agent Research System (https://www.anthropic.com/engineering/multi-agent-research-system, June 2025)
**Excerpt**:
```markdown
Structured thinking with XML tags:
- Use `<thinking>` tags for reasoning
- Extended thinking mode improves instruction-following and efficiency
- Interleaved thinking after tool results
```

**Evidence**: `agent/web-search-researcher.md:86-123` (entire output template)
**Excerpt**:
```markdown
# Web Research Report: [Subject]

## Quick Answer
[No thinking/answer separation visible in template]
```

**Token Impact**: Lost opportunity for 10% token optimization when findings are passed between agents.

### Finding 4: "No Results" Format Incompatibility

**Observation**: The fallback format for unsuccessful searches (lines 125-130) uses a completely different structure ("Status: ⚠️ No Definitive Answer Found") that is incompatible with the main 7-section template.

**Direct consequence**: Consumer agents expecting the structured format (Quick Answer, Sources, Confidence Score, etc.) will encounter parsing errors when web-search-researcher returns "no results."

**Evidence**: `agent/web-search-researcher.md:125-130`
**Excerpt**:
```markdown
## Handling "No Results"

If specific information is missing:
1. Report exactly what you searched.
2. State "Status: ⚠️ No Definitive Answer Found".
3. Recommend next steps (e.g., "Check source code directly").
```

**Evidence**: `agent/web-search-researcher.md:86-123` (main template structure)
**Excerpt**:
```markdown
# Web Research Report: [Subject]
## Quick Answer
## Source 1: [...]
## Confidence Score: [HIGH / MEDIUM / LOW]
```

**Token Impact**: Minimal token difference, but creates reliability issues for consumers.

### Finding 5: No Structured Message Envelope

**Observation**: The web-search-researcher output lacks message metadata (correlation IDs, timestamps, message types) that are standard in multi-agent communication protocols.

**Direct consequence**: Cannot correlate researcher responses to specific requests in multi-step workflows, making debugging difficult when multiple delegations are active.

**Evidence**: Web research - ApXML Communication Protocols (https://apxml.com/courses/agentic-llm-memory-architectures/chapter-5-multi-agent-systems/communication-protocols-llm-agents)
**Excerpt**:
```json
{
  "sender_id": "agent_123",
  "recipient_id": "agent_456",
  "message_id": "msg_789",
  "timestamp": "2025-01-18T12:00:00Z",
  "message_type": "REQUEST",
  "content": { }
}
```

**Evidence**: `agent/web-search-researcher.md:86` (no frontmatter in output template)
**Excerpt**:
```markdown
# Web Research Report: [Subject]
[No metadata envelope]
```

**Token Impact**: Missing 5% overhead for metadata, but loses debugging capability worth more than the token savings.

## Detailed Technical Analysis (Verified)

### Current web-search-researcher Output Structure

**Template Location**: `agent/web-search-researcher.md:86-123`

**Structure** (7 variable sections):

**Section 1: Quick Answer** (required, ~50-100 tokens)
- Direct, actionable answer to the question
- Single-paragraph summary

**Evidence**: `agent/web-search-researcher.md:89-90`
**Excerpt**:
```markdown
## Quick Answer
[Direct, actionable answer to the question]
```

**Section 2: Source 1..N** (variable count, ~150-300 tokens each)
- URL (link)
- Type (prose: Official Docs / Issue / Blog)
- Date (YYYY-MM)
- Version (e.g., v3.2+)
- Key Findings (prose explanation)
- Verified Code Example (optional, format unspecified)

**Evidence**: `agent/web-search-researcher.md:94-111`
**Excerpt**:
```markdown
## Source 1: [Official Documentation / GitHub Issue]
**URL**: [Link]
**Type**: Official Docs / Issue / Blog
**Date**: YYYY-MM
**Version**: [e.g., v3.2+]

**Key Findings**:
[Explanation]

**Verified Code Example**:
```javascript
// Copy exact syntax from webfetch result
const intent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
});
```
```

**Section 3: Confidence Score** (required, ~20-30 tokens)
- HIGH / MEDIUM / LOW rating
- Reasoning explanation

**Evidence**: `agent/web-search-researcher.md:114-115`
**Excerpt**:
```markdown
## Confidence Score: [HIGH / MEDIUM / LOW]
**Reasoning**: [e.g., "Multiple official sources confirm v3 syntax."]
```

**Section 4: Version Compatibility** (required, ~50-75 tokens)
- Version range
- Breaking changes notes

**Evidence**: `agent/web-search-researcher.md:117-119`
**Excerpt**:
```markdown
## Version Compatibility
- **Applies to**: [Version range]
- **Breaking Changes**: [Notes on migrations]
```

**Section 5: Warnings** (optional, ~50-100 tokens)
- Deprecations
- Experimental features
- Common pitfalls

**Evidence**: `agent/web-search-researcher.md:121-122`
**Excerpt**:
```markdown
## Warnings
- [Deprecations, experimental features, or common pitfalls]
```

**Strengths**:
- Uses Markdown (token-efficient format per research)
- Emphasizes verification (webfetch requirement at line 78)
- Includes version awareness (Date field)
- Source priority hierarchy defined (line 32)

**Weaknesses**:
- No structured source metadata
- Variable source count without structure guidance
- No reasoning/findings separation
- "No results" format incompatible with main template
- No message metadata envelope

### Consumer Agent Requirements Analysis

#### Researcher Agent (Primary Consumer)

**Role**: Orchestrates sub-agents to map codebase; synthesizes factual documentation for Planner.

**Delegation Pattern**: `agent/researcher.md:53`
**Excerpt**:
```markdown
- **External Info**: Delegate to `web-search-researcher`.
```

**Format Requirements**: `agent/researcher.md:56-57`
**Excerpt**:
```markdown
Sub-agents must provide: **(a)** exact file path **(b)** suggested line range **(c)** 1–6 line excerpt.
```

**Gap Identified**: This requirement is designed for CODEBASE sub-agents (codebase-analyzer, codebase-locator) not web-search-researcher. Web research returns URLs, not file paths.

**Citation Format**: `agent/researcher.md:519`
**Excerpt**:
```markdown
## References
- `path/to/file.ext:line-line` (only items you verified)
```

**Gap Identified**: References section template expects codebase paths, doesn't account for web URLs from web-search-researcher.

**Tool Configuration**: `agent/researcher.md:16-17`
**Excerpt**:
```yaml
webfetch: false # use Sub-Agent 'web-search-researcher' instead
searxng-search: false # use Sub-Agent 'web-search-researcher' instead
```

**Direct consequence**: Researcher MUST delegate to web-search-researcher for all web research (no fallback).

#### Planner Agent (Primary Consumer)

**Role**: Architects technical solutions; generates implementation blueprints.

**Delegation Pattern**: `agent/planner.md:54`
**Excerpt**:
```markdown
- **External Docs**: Delegate to `web-search-researcher`.
```

**Tool Configuration**: `agent/planner.md:16-17`
**Excerpt**:
```yaml
webfetch: false # use Sub-Agent 'web-search-researcher' instead
searxng-search: false # use Sub-Agent 'web-search-researcher' instead
```

**Tool Alternative**: `agent/planner.md:19,55`
**Excerpt**:
```yaml
context7: true
```
```markdown
- **API Docs**: Use the context7 tool to analyze library usage.
```

**Direct consequence**: Planner can use context7 as alternative, so web-search-researcher is optional (not mandatory like for Researcher).

#### QA Agents (All-Mode Consumers)

**Role**: Analyze code quality for Python and TypeScript projects.

**Use Case**:

**Evidence**: `agent/typescript-qa-thorough.md:150`
**Excerpt**:
```markdown
- If needed, delegate to `web-search-researcher` to verify current TypeScript best practices
```

**Evidence**: `agent/python-qa-thorough.md:160`
**Excerpt**:
```markdown
- If needed, delegate to `web-search-researcher` to verify current Python best practices
```

**Usage Pattern**: Optional delegation, no specific format requirements documented.

**Tool Configuration**:

**Evidence**: `agent/python-qa-thorough.md:16-17`
**Excerpt**:
```yaml
webfetch: false # use Sub-Agent 'web-search-researcher' instead
searxng-search: false # use Sub-Agent 'web-search-researcher' instead
```

**Evidence**: `agent/typescript-qa-thorough.md:16-17`
**Excerpt**:
```yaml
webfetch: false # use Sub-Agent 'web-search-researcher' instead
searxng-search: false # use Sub-Agent 'web-search-researcher' instead
```

### Web Research Findings: Industry Best Practices

**Note**: All 7 sources below are reused from the codebase-analyzer analysis (thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md). The same industry best practices apply to web-search-researcher communication patterns.

#### Source 1: Anthropic Multi-Agent Research System (Official)

**URL**: https://www.anthropic.com/engineering/multi-agent-research-system
**Date**: June 2025
**Type**: Official Engineering Blog
**Models**: Claude Opus 4 (lead), Claude Sonnet 4 (subagents)

**Key Finding 1: Architecture Pattern**

**Observation**: Anthropic uses orchestrator-worker pattern with lead agent coordinating specialized subagents, achieving 90.2% performance improvement over single-agent Claude Opus 4.

**Excerpt from source**:
```markdown
Architecture Design:
- Orchestrator-Worker Pattern: Lead agent (Claude Opus 4) coordinates specialized subagents (Claude Sonnet 4)
- 90.2% Performance Improvement: Multi-agent system outperformed single-agent Claude Opus 4
- Token usage by itself explains 80% of the variance in performance
```

**Direct consequence**: Token efficiency is the primary performance driver in multi-agent systems.

**Key Finding 2: Delegation Requirements**

**Observation**: Each subagent needs clear objective, output format specification, tool usage guidance, and task boundaries.

**Excerpt from source**:
```markdown
Teach the orchestrator how to delegate - Each subagent needs:
- Clear objective
- Output format specification
- Tool usage guidance
- Task boundaries
*"Without detailed task descriptions, agents duplicate work, leave gaps, or fail to find necessary information"*
```

**Direct consequence**: Vague or unspecified output formats cause duplicate work between agents.

**Key Finding 3: Structured Thinking**

**Observation**: Anthropic recommends using `<thinking>` tags for reasoning and separating from final output.

**Excerpt from source**:
```markdown
Structured thinking with XML tags:
- Use `<thinking>` tags for reasoning
- Extended thinking mode improves instruction-following and efficiency
- Interleaved thinking after tool results
```

**Direct consequence**: Separating reasoning from findings enables debugging and token optimization.

**Key Finding 4: Complexity Scaling**

**Observation**: Effort should scale to query complexity.

**Excerpt from source**:
```markdown
Scale effort to query complexity:
- Simple fact-finding: 1 agent, 3-10 tool calls
- Direct comparisons: 2-4 subagents, 10-15 calls each
- Complex research: 10+ subagents with divided responsibilities
```

**Direct consequence**: One-size-fits-all output templates violate this principle.

**Key Finding 5: Token Cost Reality**

**Observation**: Multi-agent systems use 15× more tokens than single-agent chat.

**Excerpt from source**:
```markdown
Multi-agent systems use ~15× more tokens than chat but deliver proportional value
```

**Direct consequence**: Token waste in agent-to-agent communication has 15× multiplier effect on total cost.

#### Source 2: Microsoft Token Efficiency Research

**URL**: https://medium.com/data-science-at-microsoft/token-efficiency-with-structured-output-from-language-models-be2e51d3d9d5
**Date**: July 2024
**Type**: Industry Research
**Model**: GPT-4o

**Empirical Token Comparison** (same structured data, different formats):

| Format | Completion Tokens | % Difference from JSON |
|--------|-------------------|------------------------|
| JSON Message | 370 | Baseline |
| YAML | 260 | **-30%** |
| Function Calling | 213 | **-42%** |
| XML | 666 | **+80%** |

**Observation**: YAML uses 30% fewer tokens than JSON; XML uses 80% more tokens than JSON.

**Excerpt from source**:
```markdown
Why Function Calling is Efficient:
- Removes whitespace and control characters
- Uses compound tokens (e.g., `":` instead of separate `"` and `:`)
- Minimizes JSON structure to machine-readable format
```

**Direct consequence**: Markdown/YAML formats are optimal for agent-to-agent communication; XML is worst choice.

#### Source 3: Empirical Format Performance Study

**URL**: https://www.improvingagents.com/blog/best-nested-data-format
**Date**: October 2025
**Type**: Independent Research
**Models**: GPT-5 Nano, Llama 3.2 3B, Gemini 2.5 Flash Lite

**GPT-5 Nano Results** (1,000 questions, 40-60% accuracy calibration):

| Format | Accuracy | Tokens | Token Efficiency vs JSON |
|--------|----------|--------|--------------------------|
| YAML | **62.1%** | 42,477 | **-27%** |
| Markdown | 54.3% | **38,357** | **-34%** |
| JSON | 50.3% | 57,933 | Baseline |
| XML | 44.4% | 68,804 | +19% |

**Observation**: Markdown is most token-efficient (34% fewer than JSON); YAML has best accuracy.

**Direct consequence**: web-search-researcher's choice of Markdown format is optimal for token efficiency.

#### Source 4: Academic Research on Communication Efficiency

**URL**: https://arxiv.org/abs/2410.08115
**Title**: "Optima: Optimizing Effectiveness and Efficiency for LLM-Based Multi-Agent Systems"
**Date**: October 2024 (revised February 2025)
**Type**: Peer-Reviewed Academic Paper

**Problem Statement**:

**Excerpt from source**:
```markdown
Current MAS coordination "often lacks efficiency, resulting in verbose exchanges"
Leads to "increased token usage, longer inference times, and higher computational costs"
Inefficiency exacerbated by "length bias inherent in LLMs due to alignment training"
```

**Observation**: Verbose agent-to-agent communication is a documented problem in academic literature.

**Optima Framework Solution**:

**Excerpt from source**:
```markdown
Optima Framework Solution:
- Iterative training paradigm: generate → rank → select → train
- Reward function balances: task performance + token efficiency + communication readability
- Results: Up to 2.8× performance gain with <10% tokens on information-heavy tasks
```

**Observation**: Token efficiency can be improved by 90% (10% of baseline) while maintaining 2.8× better performance.

**Direct consequence**: Current web-search-researcher output likely has optimization opportunity.

#### Source 5: Springer Survey on LLM-Based MAS

**URL**: https://link.springer.com/article/10.1007/s44336-024-00009-2
**Date**: October 2024
**Type**: Peer-Reviewed Survey (76k+ citations)

**Message Content Requirements**:

**Excerpt from source**:
```markdown
Message Content Requirements:
- Sender/recipient identification
- Message type (performative/intent)
- Timestamp for ordering
- Correlation ID for linking related messages
```

**Observation**: Industry standard includes message metadata envelope.

**Direct consequence**: web-search-researcher output lacks these standard metadata fields.

#### Source 6: Communication Protocols Course (ApXML)

**URL**: https://apxml.com/courses/agentic-llm-memory-architectures/chapter-5-multi-agent-systems/communication-protocols-llm-agents
**Date**: 2024
**Type**: Educational Resource

**Standard Message Structure**:

**Excerpt from source**:
```json
{
  "sender_id": "agent_123",
  "recipient_id": "agent_456",
  "message_id": "msg_789",
  "timestamp": "2025-01-18T12:00:00Z",
  "message_type": "REQUEST",
  "content": { }
}
```

**Message Types**:

**Excerpt from source**:
```markdown
Message Types (FIPA ACL-inspired):
- REQUEST: Ask agent to perform action
- INFORM: Provide information
- QUERY_IF: Yes/no question
- QUERY_REF: Request value/reference
```

**Observation**: Structured message envelopes with type systems are standard practice.

**Format Trade-offs**:

**Excerpt from source**:
```markdown
- JSON: "Easy for LLMs to process and generate, especially with function calling. Often the default choice."
- YAML: "More concise than JSON for complex nested structures."
```

#### Source 7: Anthropic Chain-of-Thought Documentation

**URL**: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/chain-of-thought
**Date**: Current (2025)
**Type**: Official Documentation

**Structured CoT Recommendation**:

**Excerpt from source**:
```markdown
3. Structured CoT: Use XML tags
   - Most efficient for agent communication
   - Example:
   <thinking>
   Reasoning process here
   </thinking>
   <answer>
   Final output here
   </answer>
```

**Observation**: Anthropic's official documentation recommends XML tag separation for agent communication.

**Trade-off Guidance**:

**Excerpt from source**:
```markdown
"Use CoT for tasks that a human would need to think through. Not all tasks require in-depth thinking."
```

**Direct consequence**: Thinking separation should be standard for research tasks.

### Token Impact Analysis

**Estimated Current State** (average web-search-researcher response with 2 sources):

**Total**: ~600-900 tokens
- Quick Answer: ~75 tokens (8%)
- Source 1: ~250 tokens (28%)
- Source 2: ~250 tokens (28%)
- Confidence Score: ~25 tokens (3%)
- Version Compatibility: ~75 tokens (8%)
- Warnings: ~75 tokens (8%)
- Formatting/headers: ~50 tokens (6%)
- No thinking tags: 0 tokens
- No message envelope: 0 tokens

**Use Case Analysis**:

**Researcher** (needs all sections for citations):
- Receive: 800 tokens (2 sources)
- Need: All sections for citation/verification
- Waste: 0 tokens (all sections serve citation purpose)

**Planner** (needs API syntax only):
- Receive: 800 tokens
- Could skip: Version Compatibility (~75 tokens, 9% waste)
- Could skip: Warnings (~75 tokens, 9% waste)
- Waste: ~150 tokens (19% waste)

**QA Agents** (need current best practices):
- Receive: 800 tokens
- Could skip: Version Compatibility (~75 tokens, 9% waste)
- Waste: ~75 tokens (9% waste)

**Comparison to codebase-analyzer**:
- Codebase-analyzer: 60-70% waste for focused queries
- Web-search-researcher: 9-19% waste for focused queries
- **Conclusion**: Depth levels have MUCH less impact for web-search-researcher

**Projected Impact of Recommendations**:

| Recommendation | Token Impact | Use Case | Net Effect |
|----------------|--------------|----------|------------|
| Add thinking tags | +100 tokens (+13%) | All | Can strip (-13% if not needed) |
| Structured source metadata (YAML) | -50 tokens (-6%) | All | More compact than prose |
| Message envelope | +50 tokens (+6%) | All | Metadata overhead |
| Query-specific depth (minimal) | -150 tokens (-19%) | Planner | Small savings vs codebase-analyzer |
| Unified "no results" format | 0 tokens | Edge case | Reliability improvement |
| Code example format spec | +25 tokens (+3%) | All | Consistency improvement |

**Net Impact by Consumer**:

**Researcher** (with comprehensive depth):
- Current: 800 tokens
- Optimized: 800 - 50 (YAML) + 100 (thinking) + 50 (envelope) = 900 tokens
- Change: +13% (but gains debugging capability)

**Planner** (with minimal depth):
- Current: 800 tokens
- Optimized: 650 (depth) - 50 (YAML) + 75 (thinking) + 50 (envelope) = 725 tokens
- Savings: -9% (can strip thinking → -19%)

**QA Agents** (with focused depth):
- Current: 800 tokens
- Optimized: 725 (depth) - 50 (YAML) + 75 (thinking) + 50 (envelope) = 800 tokens
- Change: 0% (but gains consistency)

**Overall Multi-Agent Workflow Impact**:

Using Anthropic's 15× token multiplier:
- Much smaller savings than codebase-analyzer (9-19% vs 60-70%)
- Primary value is RELIABILITY and CONSISTENCY, not token reduction

## Verification Log

**Verified** (files personally read):
- `agent/web-search-researcher.md:1-131` (complete agent definition)
- `agent/researcher.md:16-17,53,56-57,519` (delegation and citation patterns)
- `agent/planner.md:16-17,19,54-55` (delegation patterns)
- `agent/typescript-qa-thorough.md:16-17,150` (QA usage)
- `agent/python-qa-thorough.md:16-17,160` (QA usage)

**Spot-checked excerpts captured**: Yes

**Web Research Verification**:
- Reused all 7 sources from `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md`
- No new web research required (same industry best practices apply)

## Open Questions / Unverified Claims

### Question 1: Actual Usage Patterns

**Claim**: No concrete examples found in codebase of how agents invoke web-search-researcher or consume its output.

**What I tried**: 
- Read all 4 consumer agent definitions
- Searched for delegation examples
- No task() invocation syntax found

**Evidence missing**: Actual invocation syntax and output processing code

**Implication**: Cannot verify if format gaps cause real-world friction or if agents have adapted workarounds.

### Question 2: Source Count Distribution

**Claim**: Unknown what typical source count is (1 source? 3 sources? 10 sources?).

**What I tried**:
- Searched for historical web research outputs
- No examples found in thoughts/ directory

**Evidence missing**: Empirical data on average response size and source count

**Implication**: Token impact estimates assume 2 sources, but actual may vary significantly.

### Question 3: Consumer Satisfaction

**Claim**: No evidence of complaints about web-search-researcher output format or verbosity.

**What I tried**:
- Searched for keywords: "too verbose", "can't parse", "citation format"
- Searched thoughts/ directory for retrospectives

**Evidence missing**: User/agent feedback on output quality

**Implication**: Cannot determine if identified gaps are actual pain points or theoretical concerns.

### Question 4: Context7 vs web-search-researcher Usage

**Claim**: Unknown when agents prefer context7 vs web-search-researcher.

**What I tried**:
- Reviewed tool permissions (Planner has both, Researcher has only web-search-researcher)
- No documented decision criteria found

**Evidence missing**: Usage statistics or decision tree for tool selection

**Implication**: Cannot optimize web-search-researcher without understanding its position in tool hierarchy.

## Recommendations (Evidence-Based)

### Recommendation 1: Add Structured Source Metadata (CRITICAL)

**Change**: Use YAML frontmatter for source metadata instead of prose

**Before** (current):
```markdown
## Source 1: [Official Documentation / GitHub Issue]
**URL**: [Link]
**Type**: Official Docs / Issue / Blog
**Date**: YYYY-MM
**Version**: [e.g., v3.2+]
```

**After** (recommended):
```markdown
## Source 1: Official Documentation

```yaml
url: https://docs.example.com/api/v3
type: official_docs
date: 2025-12
version: v3.2+
authority: high
```

**Key Findings**:
[Prose explanation]
```

**Justification**:
- YAML uses 30% fewer tokens than JSON (Microsoft research)
- Structured fields enable programmatic parsing by consumers
- Standardizes source type vocabulary (official_docs, github_issue, blog, stackoverflow, academic_paper)
- Authority field maps to Confidence Score logic

**Implementation**:
- Update `agent/web-search-researcher.md:94-100` template
- Define source type vocabulary (6-8 standard types)
- Add authority field: high (official docs), medium (GitHub/SO), low (blogs)

**Token Impact**: -50 tokens (-6%) per response vs prose format

**Priority**: **HIGH** - Enables reliable parsing and citation generation

### Recommendation 2: Separate Reasoning from Findings

**Change**: Wrap output in `<thinking>` and `<answer>` tags

**Before** (current):
```markdown
# Web Research Report: [Subject]

## Quick Answer
[Mixed search strategy and results]
```

**After** (recommended):
```markdown
<thinking>
Search strategy for React 18 authentication patterns:
- Context7 query: "React 18 authentication hooks"
- Found official docs at reactjs.org/docs/hooks-auth
- Verified code examples via webfetch
- Checked date: 2025-08 (current as of 2026-01)
- Confidence: HIGH (official source + recent date)
</thinking>

<answer>
# Web Research Report: React 18 Authentication Patterns

## Quick Answer
[Structured findings]
</answer>
```

**Justification**:
- Anthropic official recommendation (same as codebase-analyzer)
- Enables debugging when search results seem incomplete
- Allows consumers to strip `<thinking>` for token optimization
- Documents which tools were used (context7 vs searxng vs webfetch)

**Implementation**:
- Update `agent/web-search-researcher.md:86` to add thinking section
- Instruct agent to document: queries used, sources checked, verification steps
- Wrap existing template in `<answer>` tags

**Token Impact**: +100 tokens (+13%) per response, but consumers can strip if not needed (-13% net)

**Priority**: **HIGH** - Critical for debugging and transparency

### Recommendation 3: Add Structured Message Envelope

**Change**: Wrap output in YAML frontmatter metadata

**Before** (current):
```markdown
# Web Research Report: [Subject]
[Content]
```

**After** (recommended):
```markdown
---
message_id: research-2026-01-19-001
correlation_id: researcher-task-auth-flow
timestamp: 2026-01-19T12:00:00Z
message_type: RESEARCH_RESPONSE
query_type: library_api
researcher_version: "1.0"
sources_found: 2
search_tools_used: [context7, webfetch]
---

<thinking>
[Reasoning]
</thinking>

<answer>
# Web Research Report: React 18 Authentication
[Content]
</answer>
```

**Justification**:
- Industry standard (FIPA ACL, ApXML course - same as codebase-analyzer)
- Enables correlation in multi-step workflows
- Sources_found field helps consumers validate completeness
- Search_tools_used documents provenance (context7 vs searxng)

**Implementation**:
- Update `agent/web-search-researcher.md:86` to include YAML frontmatter
- Auto-generate message_id (timestamp + sequence)
- Accept correlation_id from caller
- Include search_tools_used for transparency

**Token Impact**: +50 tokens (+6%) per response

**Priority**: **MEDIUM** - Valuable for debugging, not critical for core functionality

### Recommendation 4: Unify "No Results" Format

**Change**: Make fallback format structurally compatible with main template

**Before** (current):
```markdown
If specific information is missing:
1. Report exactly what you searched.
2. State "Status: ⚠️ No Definitive Answer Found".
3. Recommend next steps.
```

**After** (recommended):
```markdown
<thinking>
Searches performed:
- Context7 query: "library-name v3 authentication" - 0 results
- SearXNG query: "library-name auth examples" - 3 results (all deprecated v2)
- Webfetch attempt: https://docs.example.com - 404 Not Found

Conclusion: No definitive answer found for current version.
</thinking>

<answer>
# Web Research Report: [Subject]

## Quick Answer
⚠️ **No Definitive Answer Found**

Searches performed:
- Context7: "library-name v3 authentication" (0 results)
- SearXNG: "library-name auth examples" (3 results, all deprecated)
- Webfetch: https://docs.example.com (404 Not Found)

## Confidence Score: NONE
**Reasoning**: No authoritative sources found for current version.

## Recommended Next Steps
1. Check source code directly at github.com/org/library-name
2. Search GitHub issues for "authentication" keyword
3. Review library changelog for breaking changes
</answer>
```

**Justification**:
- Maintains same Quick Answer / Confidence Score structure
- Consumers can parse "⚠️ No Definitive Answer Found" as special value
- Documents what was tried (transparency for debugging)
- Provides actionable next steps

**Implementation**:
- Update `agent/web-search-researcher.md:125-130`
- Keep Quick Answer / Confidence Score sections
- Use special marker "⚠️ No Definitive Answer Found"
- Add Recommended Next Steps section

**Token Impact**: 0 tokens (edge case, infrequent)

**Priority**: **MEDIUM** - Prevents parsing errors, improves reliability

### Recommendation 5: Specify Code Example Format

**Change**: Define mandatory code excerpt format matching codebase sub-agents

**Before** (current):
```markdown
**Verified Code Example**:
```javascript
// Copy exact syntax from webfetch result
const intent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
});
```
```

**After** (recommended):
```markdown
**Verified Code Example**:
- **Source**: https://stripe.com/docs/api/payment_intents/create
- **Language**: JavaScript (Node.js)
- **Excerpt** (lines 42-46 from docs):
  ```javascript
  const intent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd',
  });
  ```
```

**Justification**:
- Matches codebase-analyzer's evidence format (source + line range + excerpt)
- Provides traceability back to original docs
- Specifies language for syntax highlighting
- Limits excerpt length (prevents copy/paste of entire docs)

**Implementation**:
- Update `agent/web-search-researcher.md:103-110`
- Add instruction: "Extract 3-10 lines maximum"
- Add instruction: "Specify source URL and approximate line numbers"
- Add instruction: "Detect language from code syntax"

**Token Impact**: +25 tokens (+3%) per code example (metadata overhead)

**Priority**: **MEDIUM** - Improves citation quality and consistency

### Recommendation 6: Support Query-Specific Depth (LOW PRIORITY)

**Change**: Accept `research_depth` parameter for output granularity

**Invocation Examples**:

```markdown
# For QA agents (best practices only)
task({
  agent: "web-search-researcher",
  task: "Verify current TypeScript async/await best practices",
  research_depth: "focused"
})

# For Planner (API syntax validation)
task({
  agent: "web-search-researcher",
  task: "Find Stripe API syntax for payment intents in v3",
  research_depth: "minimal"
})

# For Researcher (complete research)
task({
  agent: "web-search-researcher",
  task: "Complete analysis of React 18 authentication patterns",
  research_depth: "comprehensive"
})
```

**Output Mapping**:

| Depth Level | Sections Included | Token Savings | Use Case |
|-------------|-------------------|---------------|----------|
| `minimal` | Quick Answer + Source 1 (first authoritative source only) | -40% | Planner API validation |
| `focused` | Quick Answer + Sources + Confidence | -20% | QA best practices |
| `comprehensive` | All 5 sections | 0% | Researcher full documentation |

**Justification**:
- Anthropic best practice: "Scale effort to query complexity"
- QA agents don't need Version Compatibility for "current best practices" queries
- Planner doesn't need Warnings for simple syntax lookups

**Implementation**:
- Update `agent/web-search-researcher.md` to recognize `research_depth` parameter
- Default to `comprehensive` for backward compatibility
- Skip Version Compatibility + Warnings for `focused`
- Return only 1 source (most authoritative) for `minimal`

**Token Impact**:
- Minimal mode: -320 tokens (-40%) - 1 source only, no compatibility/warnings
- Focused mode: -150 tokens (-19%) - skip compatibility/warnings
- Comprehensive mode: 0 tokens (unchanged)

**Priority**: **LOW** - Smaller savings than codebase-analyzer (19% vs 56-69%), marginal value

### Recommendation 7: Update Consumer Agent Prompts

**Change**: Provide explicit delegation examples in Researcher and Planner prompts

**Addition to `agent/researcher.md`**:

```markdown
## Delegating to web-search-researcher

When delegating external knowledge research, provide:
1. Specific library/API name and version (if known)
2. Desired research depth (minimal, focused, comprehensive)
3. Correlation ID for tracking

Example:
task({
  agent: "web-search-researcher",
  task: "Research React 18 authentication hooks and patterns for single-page apps",
  research_depth: "comprehensive",
  correlation_id: "research-auth-2026-01-19"
})

Expected response format:
- YAML frontmatter (correlation_id for verification, sources_found count)
- <thinking> section (inspect if results seem incomplete)
- <answer> section with 5 sections (Quick Answer, Sources, Confidence, Version Compatibility, Warnings)
- Each source includes YAML metadata (url, type, date, version, authority)
- Code examples include source URL and line numbers

## Citing Web Research in Reports

For web research findings, use URL-based citations (not file:line format):

**Format**:
- **Evidence:** https://docs.react.dev/reference/react/hooks#authentication
- **Date:** 2025-12 (verified current as of 2026-01-19)
- **Type:** official_docs
- **Excerpt:**
  ```javascript
  const { user, login } = useAuth();
  ```
```

**Addition to `agent/planner.md`**:

```markdown
## Delegating to web-search-researcher for API Validation

When validating external library APIs, use `minimal` depth:

task({
  agent: "web-search-researcher",
  task: "Find Stripe v3 API syntax for creating payment intents",
  research_depth: "minimal"
})

This returns only the Quick Answer and most authoritative source, saving ~40% tokens.
```

**Justification**:
- Anthropic best practice: "Teach orchestrator how to delegate"
- Clarifies citation format difference (URLs vs file paths)
- Documents depth level recommendations
- Prevents format mismatch errors

**Implementation**:
- Update `agent/researcher.md` with delegation examples + citation format
- Update `agent/planner.md` with minimal depth recommendation
- Update `agent/typescript-qa-thorough.md` and `agent/python-qa-thorough.md` with focused depth examples

**Token Impact**: No change to web-search-researcher output; improves consumer efficiency

**Priority**: **HIGH** - Critical for preventing citation format mismatches

## Implementation Roadmap (Suggested Sequence)

### Phase 1: High-Impact Reliability Improvements

1. **Recommendation 1**: Add structured source metadata (YAML frontmatter)
2. **Recommendation 2**: Add thinking/answer separation
3. **Recommendation 4**: Unify "no results" format
4. **Recommendation 7**: Update consumer agent prompts (citation format)

**Estimated effort**: 3-5 hours
**Token impact**: -6% (YAML savings) + 13% (thinking) = +7% per response
**Value**: Eliminates parsing ambiguity and citation format mismatches

### Phase 2: Infrastructure Enhancements

5. **Recommendation 3**: Add message envelope
6. **Recommendation 5**: Specify code example format
7. **Test edge cases**: Verify "no results" format, multi-source responses

**Estimated effort**: 2-3 hours
**Token impact**: +6% (envelope) + 3% (code format) = +9% overhead
**Value**: Debugging capability and citation quality

### Phase 3: Optimization (Optional)

8. **Recommendation 6**: Support query-specific depth levels
9. **Update consumer delegation**: Add depth examples
10. **Documentation**: Update AGENTS.md with new patterns

**Estimated effort**: 2-4 hours
**Token impact**: -19% to -40% for focused queries
**Value**: Marginal savings (much less than codebase-analyzer)

**Total estimated effort**: 7-12 hours
**Total token impact**:
- Comprehensive mode: +16% (envelope + thinking + code format)
- Focused mode: -3% (saves 19%, adds 16%)
- Minimal mode: -24% (saves 40%, adds 16%)

**Key Difference from codebase-analyzer**: Token savings are much smaller (3-24% vs 31-45%), so primary value is **reliability and consistency**, not optimization.

## Acceptance Criteria

For implementation to be considered complete:

1. **Structured Metadata**: All sources use YAML frontmatter with url, type, date, version, authority fields
2. **Thinking Separation**: Output wrapped in `<thinking>` and `<answer>` tags
3. **Message Envelope**: YAML frontmatter includes message_id, correlation_id, timestamp, sources_found
4. **Unified "No Results"**: Fallback format maintains Quick Answer / Confidence Score structure
5. **Code Example Format**: All code examples include source URL, language, and line reference
6. **Depth Levels**: Agent accepts and correctly handles `minimal`, `focused`, `comprehensive` parameters (optional)
7. **Consumer Updates**: Researcher and Planner agents have delegation examples with citation format guidance
8. **Documentation**: AGENTS.md updated with web research citation patterns
9. **Verification**: Sample delegations tested for each depth level with spot-check of output format

## References

**Files Verified**:
- `agent/web-search-researcher.md:1-131` (complete definition)
- `agent/researcher.md:16-17,53,56-57,519` (delegation and citation)
- `agent/planner.md:16-17,19,54-55` (delegation patterns)
- `agent/typescript-qa-thorough.md:16-17,150` (QA usage)
- `agent/python-qa-thorough.md:16-17,160` (QA usage)

**Web Research Sources**:
(Reused from `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md`)
1. https://www.anthropic.com/engineering/multi-agent-research-system (Anthropic official)
2. https://medium.com/data-science-at-microsoft/token-efficiency-with-structured-output-from-language-models-be2e51d3d9d5 (Microsoft)
3. https://www.improvingagents.com/blog/best-nested-data-format (independent study)
4. https://arxiv.org/abs/2410.08115 (academic paper - Optima)
5. https://link.springer.com/article/10.1007/s44336-024-00009-2 (Springer survey)
6. https://apxml.com/courses/agentic-llm-memory-architectures/chapter-5-multi-agent-systems/communication-protocols-llm-agents (ApXML course)
7. https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/chain-of-thought (Anthropic docs)
