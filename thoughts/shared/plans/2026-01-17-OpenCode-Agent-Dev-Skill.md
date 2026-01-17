# OpenCode Skills and Agent Development Skill - Implementation Plan

## Inputs
- **Research report**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md`
- **User request**: Create a new skill for OpenCode containing all knowledge about creating skills and agents for OpenCode, including prompt generation, editing, improvement, and evaluation for building agents
- **Constraint**: Do NOT use existing project files (skills/agents) as reference - quality not evaluated

## Verified Current State

### Fact: Research Report Exists and Contains Comprehensive OpenCode Documentation
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:1-929`
- **Excerpt**:
  ```yaml
  ---
  date: 2026-01-17
  researcher: web-search-researcher
  topic: "OpenCode Skills and Agent Development with Claude Sonnet-4.5 Optimization"
  status: complete
  coverage:
    - OpenCode Skills system (official documentation)
    - OpenCode Agents (Markdown format, official documentation)
    - Claude Sonnet-4.5 model specifications and capabilities
    - Prompt engineering best practices for autonomous agents
  ---
  ```

### Fact: Project Uses `skills/` Directory (Not `.opencode/skill/`)
- **Evidence**: Directory listing via bash
- **Excerpt**: 
  ```
  skills/
  └── dify-reference/
      ├── SKILL.md
      └── references/
          ├── architecture.md
          ├── node-types.md
          ├── variable-system.md
          └── voice-bot-patterns.md
  ```

### Fact: Existing Skill Follows Standard Structure Pattern
- **Evidence**: `skills/dify-reference/SKILL.md:1-12`
- **Excerpt**:
  ```yaml
  ---
  name: dify-reference
  description: Comprehensive technical reference for Dify bot development...
  license: MIT
  allowed-tools:
    - read
  metadata:
    version: "1.1"
    author: "Netto Bot Development Team"
    last-updated: "2026-01-13"
  ---
  ```

### Fact: Research Contains 5 Critical Findings for Planner Attention
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:41-155`
- **Excerpt**:
  1. Finding 1: Directory-to-frontmatter name matching (lines 43-66)
  2. Finding 2: Claude Sonnet-4.5 requires explicit tool usage instructions (lines 68-86)
  3. Finding 3: Last-match-wins permission pattern (lines 88-110)
  4. Finding 4: Measurable cost-quality tradeoff (lines 112-134)
  5. Finding 5: Context engineering replaces traditional prompting (lines 136-155)

### Fact: Research Includes Complete OpenCode Skills System Architecture
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:158-318`
- **Coverage**:
  - Discovery mechanism (lines 158-172)
  - SKILL.md format specification (lines 174-211)
  - Tool registration and invocation (lines 213-233)
  - Permission system (lines 235-282)
  - Supporting files and path resolution (lines 284-318)

### Fact: Research Includes Complete OpenCode Agents Architecture
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:320-500`
- **Coverage**:
  - Agent file structure (lines 320-351)
  - YAML frontmatter schema (lines 353-420)
  - Agent types and behavior (lines 422-457)
  - Temperature configuration (lines 459-472)
  - System prompt definition (lines 474-500)

### Fact: Research Includes Claude Sonnet-4.5 Specifications
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:502-595`
- **Coverage**:
  - Core specifications (lines 502-518)
  - Benchmark performance (lines 520-536)
  - Extended thinking feature (lines 538-562)
  - Context awareness (lines 564-571)
  - Safety and alignment (lines 573-595)

### Fact: Research Includes Prompt Engineering Best Practices
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:597-817`
- **Coverage**:
  - Claude 4.5 best practices (lines 597-695)
  - Advanced techniques (lines 697-817)
  - Structured prompting, CoT, few-shot, ReAct patterns
  - Cost-quality tradeoff strategies

## Goals / Non-Goals

### Goals
1. Create a new skill named `opencode-agent-dev` in `skills/` directory
2. Provide comprehensive reference for OpenCode Skills system from research report
3. Provide comprehensive reference for OpenCode Agents system from research report
4. Provide comprehensive reference for Claude Sonnet-4.5 optimization from research report
5. Provide comprehensive reference for prompt engineering techniques from research report
6. Structure skill to match existing pattern (SKILL.md + references/)
7. Make skill immediately usable via `skill` tool invocation

### Non-Goals
- Do NOT reference existing skills/agents in this project (quality not evaluated per user request)
- Do NOT create example agents (only documentation)
- Do NOT create custom tools (only document the system)
- Do NOT add evaluation frameworks (limited public information per research)

## Design Overview

### Directory Structure
```
skills/opencode-agent-dev/
├── SKILL.md                          # Skill definition and index
└── references/
    ├── skills-system.md              # Complete OpenCode Skills reference
    ├── agents-system.md              # Complete OpenCode Agents reference
    ├── claude-sonnet-4-5.md          # Claude Sonnet-4.5 specs and optimization
    ├── prompt-engineering.md         # Prompt engineering techniques
    └── critical-findings.md          # 5 critical findings from research
```

### Content Extraction Strategy
- Extract verified facts from research report sections
- Preserve evidence citations (URLs, line numbers)
- Organize by topic (skills, agents, model, prompting)
- Include code examples verbatim from research
- Highlight critical findings separately

### SKILL.md Design
- Frontmatter: Follow `dify-reference` pattern
- Description: Focus on "what this provides" and "when to use"
- Quick reference: Extract critical rules and common patterns
- File structure: Point to reference files

## Implementation Instructions (For Implementor)

### PLAN-001: Create Skill Directory Structure
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/` (directory)
- **Instruction**:
  1. Create directory `skills/opencode-agent-dev/`
  2. Create subdirectory `skills/opencode-agent-dev/references/`
- **Evidence**: `skills/dify-reference/` structure (verified via bash listing)
- **Done When**: Directories exist and are empty

### PLAN-002: Create SKILL.md Frontmatter and Index
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/SKILL.md`
- **Instruction**:
  1. Create YAML frontmatter with:
     - `name: opencode-agent-dev` (MUST match directory name)
     - `description:` (1-2 sentence summary of skill purpose)
     - `license: MIT`
     - `allowed-tools: [read]` (only needs to read reference files)
     - `metadata:` (version: "1.0", author, last-updated: "2026-01-17")
  2. Add "What This Skill Provides" section listing:
     - OpenCode Skills system reference
     - OpenCode Agents system reference
     - Claude Sonnet-4.5 optimization reference
     - Prompt engineering techniques reference
     - Critical findings reference
  3. Add "When to Use This Skill" section with examples:
     - Creating new skills
     - Configuring agents
     - Optimizing prompts for Claude 4.5
     - Understanding OpenCode architecture
  4. Add "Quick Reference" section with:
     - Critical rules (directory name matching, last-match-wins permissions, etc.)
     - Common patterns (SKILL.md format, agent modes, temperature ranges)
  5. Add "File Structure" section pointing to `references/` files
- **Evidence**: `skills/dify-reference/SKILL.md:1-141` (pattern to follow)
- **Done When**: `skills/opencode-agent-dev/SKILL.md` exists with complete frontmatter and index sections

### PLAN-003: Create Skills System Reference
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/references/skills-system.md`
- **Instruction**:
  1. Extract content from research report lines 158-318 (OpenCode Skills System Architecture)
  2. Organize into sections:
     - Discovery Mechanism (lines 158-172)
     - SKILL.md Format Specification (lines 174-211)
     - Tool Registration and Invocation (lines 213-233)
     - Permission System (lines 235-282)
     - Supporting Files and Path Resolution (lines 284-318)
  3. Preserve all code examples verbatim
  4. Include evidence citations (URLs) in "References" section at end
  5. Add table of contents at top
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:158-318`
- **Done When**: Reference file exists with complete skills system documentation

### PLAN-004: Create Agents System Reference
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/references/agents-system.md`
- **Instruction**:
  1. Extract content from research report lines 320-500 (OpenCode Agents Architecture)
  2. Organize into sections:
     - Agent File Structure (lines 320-351)
     - YAML Frontmatter Complete Schema (lines 353-420)
     - Agent Types and Behavior (lines 422-457)
     - Temperature Configuration Guidance (lines 459-472)
     - System Prompt Definition (lines 474-500)
  3. Preserve all code examples verbatim
  4. Include table showing agent modes comparison (primary vs subagent)
  5. Include evidence citations (URLs) in "References" section at end
  6. Add table of contents at top
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:320-500`
- **Done When**: Reference file exists with complete agents system documentation

### PLAN-005: Create Claude Sonnet-4.5 Reference
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/references/claude-sonnet-4-5.md`
- **Instruction**:
  1. Extract content from research report lines 502-595 (Claude Sonnet-4.5 Model Specifications)
  2. Organize into sections:
     - Core Specifications (lines 502-518) - include pricing table
     - Benchmark Performance (lines 520-536) - include SWE-bench, OSWorld scores
     - Extended Thinking Feature (lines 538-562) - include API usage example
     - Context Awareness Feature (lines 564-571)
     - Safety and Alignment (lines 573-595) - include ASL-3 metrics
  3. Preserve all tables and code examples verbatim
  4. Include evidence citations (URLs, especially System Card PDF) in "References" section
  5. Add table of contents at top
  6. Add "Quick Selection Guide" comparing when to use Sonnet-4.5 vs other models
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:502-595`
- **Done When**: Reference file exists with complete Claude Sonnet-4.5 documentation

### PLAN-006: Create Prompt Engineering Reference
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/references/prompt-engineering.md`
- **Instruction**:
  1. Extract content from research report lines 597-817 (Prompt Engineering Best Practices)
  2. Organize into sections:
     - Claude 4.5 Specific Best Practices (lines 597-695)
       * Be Explicit with Instructions (lines 599-611)
       * Add Context and Motivation (lines 613-620)
       * Optimize for Parallel Tool Calling (lines 622-640)
       * Communication Style Adaptation (lines 642-654)
       * Context Awareness Prompting (lines 656-670)
       * Right-Altitude Prompting (lines 672-695)
     - Advanced Techniques (lines 697-817)
       * Structured Prompting with XML/Markdown (lines 706-729)
       * Chain-of-Thought (CoT) Prompting (lines 731-763)
       * Few-Shot Prompting (lines 765-779)
       * ReAct (Reasoning + Acting) (lines 781-794)
       * Cost-Quality Tradeoff: Hill Climb Strategy (lines 796-817)
  3. Preserve all code examples verbatim
  4. Include "When to Use / When NOT to Use" guidance for each technique
  5. Include evidence citations (URLs) in "References" section
  6. Add table of contents at top
  7. Add "Quick Decision Tree" flowchart (Markdown/Mermaid) for selecting technique
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:597-817`
- **Done When**: Reference file exists with complete prompt engineering documentation

### PLAN-007: Create Critical Findings Reference
- **Change Type**: create
- **File(s)**: `skills/opencode-agent-dev/references/critical-findings.md`
- **Instruction**:
  1. Extract content from research report lines 41-155 (Critical Findings)
  2. Create one section per finding (5 total):
     - Finding 1: Exact Directory-to-Frontmatter Name Matching (lines 43-66)
     - Finding 2: Claude Sonnet-4.5 Requires Explicit Tool Usage Instructions (lines 68-86)
     - Finding 3: Last-Match-Wins Permission Pattern (lines 88-110)
     - Finding 4: Measurable Cost-Quality Tradeoff (lines 112-134)
     - Finding 5: Context Engineering Replaces Traditional Prompting (lines 136-155)
  3. For each finding, preserve exact structure:
     - **Observation**: What was found
     - **Direct Consequence**: What this means for implementors
     - **Evidence**: URL citation
     - **Excerpt**: Code/quote from source
  4. Add "Impact Summary" section at top explaining why these 5 are critical
  5. Add "Checklist" section at bottom with actionable items for each finding
  6. Add table of contents at top
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:41-155`
- **Done When**: Reference file exists with all 5 critical findings documented

### PLAN-008: Add Open Questions Section to SKILL.md
- **Change Type**: modify
- **File(s)**: `skills/opencode-agent-dev/SKILL.md`
- **Instruction**:
  1. Add "Known Limitations and Open Questions" section at end (before file structure)
  2. Extract content from research report lines 841-879 (Open Questions / Unverified Claims)
  3. Include:
     - Temperature parameter guidance for Claude Sonnet-4.5 (lines 843-859)
     - Evaluation frameworks (lines 861-875)
     - Skill base directory context delivery (lines 877-892)
  4. Mark each with ⚠️ icon and "Status: Not Found in Official Documentation"
  5. Provide recommended workarounds for each
- **Evidence**: `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:841-892`
- **Done When**: SKILL.md includes open questions section with 3 items

### PLAN-009: Add Usage Examples to SKILL.md
- **Change Type**: modify
- **File(s)**: `skills/opencode-agent-dev/SKILL.md`
- **Instruction**:
  1. Add "How to Use" section after "When to Use This Skill"
  2. Provide 5 concrete example invocations:
     - "How do I create a new skill for OpenCode?"
     - "What's the YAML schema for agent frontmatter?"
     - "How do I optimize my agent prompt for Claude Sonnet-4.5?"
     - "What permission pattern should I use for bash commands?"
     - "How do I reduce context usage for long-horizon tasks?"
  3. Show skill invocation syntax (using native `skill` tool)
  4. Explain that skill will guide to appropriate reference file
- **Evidence**: `skills/dify-reference/SKILL.md:74-88` (pattern to follow)
- **Done When**: SKILL.md includes usage examples section

### PLAN-010: Verification - Validate Skill Name Matching
- **Change Type**: verify
- **File(s)**: `skills/opencode-agent-dev/SKILL.md`
- **Instruction**:
  1. Read `skills/opencode-agent-dev/SKILL.md` frontmatter
  2. Verify `name:` field exactly matches `opencode-agent-dev` (directory name)
  3. Verify name matches regex `^[a-z0-9]+(-[a-z0-9]+)*$`
  4. Verify description is 1-1024 characters
  5. If any validation fails, fix immediately
- **Evidence**: Research Finding 1 (lines 43-66): "Match the directory name that contains SKILL.md"
- **Done When**: All validations pass

### PLAN-011: Verification - Check Reference File Paths
- **Change Type**: verify
- **File(s)**: `skills/opencode-agent-dev/SKILL.md`
- **Instruction**:
  1. Read SKILL.md "File Structure" section
  2. Verify all referenced files exist:
     - `references/skills-system.md`
     - `references/agents-system.md`
     - `references/claude-sonnet-4-5.md`
     - `references/prompt-engineering.md`
     - `references/critical-findings.md`
  3. Verify paths use relative format (not absolute)
  4. If any file missing, report error
- **Evidence**: Research lines 284-318 (path resolution rules)
- **Done When**: All reference files exist and paths are relative

### PLAN-012: Verification - Test Skill Invocation
- **Change Type**: verify
- **File(s)**: All skill files
- **Instruction**:
  1. Attempt to invoke skill via `skill({ name: "opencode-agent-dev" })`
  2. Verify skill loads without errors
  3. Verify all reference file paths resolve correctly
  4. Verify skill description appears in tool listing
  5. If errors occur, fix and retry
- **Evidence**: Research lines 213-233 (tool registration and invocation)
- **Done When**: Skill loads successfully and is accessible via `skill` tool

## Verification Tasks

No assumptions requiring verification. All implementation is based on verified research findings.

## Acceptance Criteria

1. **Skill Structure**:
   - ✅ Directory `skills/opencode-agent-dev/` exists
   - ✅ File `skills/opencode-agent-dev/SKILL.md` exists with valid frontmatter
   - ✅ Subdirectory `skills/opencode-agent-dev/references/` exists
   - ✅ All 5 reference files exist in `references/` subdirectory

2. **Skill Name Validation**:
   - ✅ Directory name `opencode-agent-dev` matches frontmatter `name:` field
   - ✅ Name matches regex `^[a-z0-9]+(-[a-z0-9]+)*$`

3. **Content Completeness**:
   - ✅ Skills system reference covers all topics from research lines 158-318
   - ✅ Agents system reference covers all topics from research lines 320-500
   - ✅ Claude Sonnet-4.5 reference covers all topics from research lines 502-595
   - ✅ Prompt engineering reference covers all topics from research lines 597-817
   - ✅ Critical findings reference covers all 5 findings from research lines 41-155

4. **SKILL.md Completeness**:
   - ✅ "What This Skill Provides" section lists all 5 reference files
   - ✅ "When to Use This Skill" section provides concrete scenarios
   - ✅ "How to Use" section provides example invocations
   - ✅ "Quick Reference" section highlights critical rules
   - ✅ "Known Limitations" section includes 3 open questions
   - ✅ "File Structure" section lists all reference files with relative paths

5. **Evidence Preservation**:
   - ✅ All reference files include "References" section with URL citations
   - ✅ Code examples preserved verbatim from research report
   - ✅ Tables and schemas preserved exactly as in research

6. **Usability**:
   - ✅ Skill loads successfully via `skill` tool
   - ✅ Skill description appears in tool listing
   - ✅ All reference file paths resolve correctly

## Implementor Checklist

- [ ] PLAN-001: Create skill directory structure
- [ ] PLAN-002: Create SKILL.md frontmatter and index
- [ ] PLAN-003: Create skills-system.md reference
- [ ] PLAN-004: Create agents-system.md reference
- [ ] PLAN-005: Create claude-sonnet-4-5.md reference
- [ ] PLAN-006: Create prompt-engineering.md reference
- [ ] PLAN-007: Create critical-findings.md reference
- [ ] PLAN-008: Add open questions section to SKILL.md
- [ ] PLAN-009: Add usage examples to SKILL.md
- [ ] PLAN-010: Verify skill name matching
- [ ] PLAN-011: Verify reference file paths
- [ ] PLAN-012: Test skill invocation
