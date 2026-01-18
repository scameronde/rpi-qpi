# Codebase-Pattern-Finder Communication Optimization Implementation Plan

## Inputs
- Research report used: `thoughts/shared/research/2026-01-18-Codebase-Pattern-Finder-Agent-Communication.md`
- User request summary: Improve codebase-pattern-finder agent communication based on research findings
- Background research: 
  - `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (industry best practices)
  - `thoughts/shared/research/2026-01-18-Codebase-Locator-Agent-Communication.md` (comparative analysis)

## Verified Current State

### Fact 1: Pattern-Finder Uses Variable Template Design
- **Fact:** The codebase-pattern-finder uses a variable template structure that scales output naturally with findings (N variations), unlike locator/analyzer which use fixed 4-section templates.
- **Evidence:** `agent/codebase-pattern-finder.md:76-105`
- **Excerpt:**
  ```markdown
  ## Pattern: [Topic]
  
  ### Variation 1: [Name/Context]
  [...variation 1 details...]
  
  ### Variation 2: [Alternative Approach]
  [...variation 2 details...]
  
  ### Distribution Notes
  [...optional notes...]
  ```
- **Implication:** This is a strength - avoids the 76% token waste found in locator and 60-70% waste in analyzer. Plan should preserve this design.

### Fact 2: Pattern-Finder Already Requires Code Excerpts with Context
- **Fact:** The pattern-finder mandates actual code excerpts (not descriptions) and requires context (imports, class wrappers).
- **Evidence:** `agent/codebase-pattern-finder.md:109-111`
- **Excerpt:**
  ```markdown
  1.  **Read Before Posting**: Never output code you haven't `read` from the file. Grep snippets are often incomplete.
  2.  **Context**: Always include imports or class wrappers in your snippets so the Orchestrator sees the full context.
  3.  **Tests**: If possible, find a test file that *tests* the pattern. This is the ultimate documentation of expected behavior.
  ```
- **Implication:** Content quality is already best-in-class. Plan focuses on structural improvements only.

### Fact 3: Pattern-Finder Lacks Thinking/Answer Separation
- **Fact:** The output template does not include `<thinking>` and `<answer>` tags to separate reasoning from findings.
- **Evidence:** `agent/codebase-pattern-finder.md:76-105` (entire output template shows no XML tag structure)
- **Excerpt:**
  ```markdown
  ## Output Format
  
  When returning findings to the Orchestrator, use this structure:
  
  ```markdown
  ## Pattern: [Topic]
  [No thinking/answer separation visible]
  ```
- **Implication:** Debugging complex searches is difficult without visibility into search strategy. This is a critical gap.

### Fact 4: Pattern-Finder Lacks Structured Message Envelope
- **Fact:** The output template does not include YAML frontmatter with message metadata or search-specific metadata.
- **Evidence:** `agent/codebase-pattern-finder.md:76` (template starts with "## Pattern:")
- **Excerpt:**
  ```markdown
  ## Pattern: [Topic]
  [No metadata envelope]
  ```
- **Implication:** Cannot correlate responses in multi-step workflows or validate search completeness.

### Fact 5: Pattern-Finder Uses Vague Frequency Metrics
- **Fact:** Template instructs use of subjective "High/Low" labels, though it shows a numeric example.
- **Evidence:** `agent/codebase-pattern-finder.md:81`
- **Excerpt:**
  ```markdown
  **Frequency**: [High/Low] (e.g., "Found in 12 files")
  ```
- **Implication:** Inconsistent with Distribution Notes which use quantified percentages (line 103-104).

### Fact 6: Eight Consumer Agents Delegate to Pattern-Finder
- **Fact:** Researcher, Planner, Python-QA-Thorough, Python-QA-Quick, TypeScript-QA-Thorough, TypeScript-QA-Quick, OpenCode-QA-Thorough all have `grep: false` and delegate pattern search.
- **Evidence:** `agent/researcher.md:11`, `agent/planner.md:11`, `agent/python-qa-thorough.md:11`, `agent/typescript-qa-thorough.md:11`, etc.
- **Excerpt (example from researcher):**
  ```markdown
  grep: false # use Sub-Agent 'codebase-pattern-finder' instead
  ```
- **Implication:** Changes to pattern-finder affect 8 agents. Must ensure backward compatibility.

### Fact 7: Consumer Agents Lack Delegation Examples
- **Fact:** Consumer agent prompts mention delegation but lack concrete invocation examples or output format descriptions.
- **Evidence:** `agent/researcher.md:50` (brief mention: "Delegate to `codebase-locator` / `codebase-pattern-finder`")
- **Excerpt:**
  ```markdown
  - **Find files/Context**: Delegate to `codebase-locator` / `codebase-pattern-finder`.
  ```
- **Implication:** Consuming agents may not use pattern-finder effectively or know how to interpret new envelope/thinking sections.

### Fact 8: Research Validates Token Impacts
- **Fact:** Research provides token impact estimates: +19% for thinking tags, +8% for envelope, 0% for frequency clarification.
- **Evidence:** `thoughts/shared/research/2026-01-18-Codebase-Pattern-Finder-Agent-Communication.md:449-468`
- **Excerpt:**
  ```markdown
  | Recommendation | Token Impact | Use Case | Net Effect |
  |----------------|--------------|----------|------------|
  | Add thinking tags | +100 tokens (+19%) | All | Can strip (0% net if not needed) |
  | Message envelope | +40 tokens (+8%) | All | Metadata overhead |
  | Quantify frequency | 0 tokens | All | Just clearer labeling |
  ```
- **Implication:** Total overhead is +27% worst case (thinking + envelope), +8% best case (thinking stripped). This is acceptable given debugging and correlation value.

## Goals / Non-Goals

### Goals
1. Add `<thinking>` and `<answer>` tag separation for debugging complex pattern searches
2. Add YAML frontmatter message envelope with search-specific metadata
3. Replace vague "High/Low" frequency labels with quantified metrics
4. Update all 8 consumer agent prompts with delegation examples
5. Maintain backward compatibility (new sections are additions, not breaking changes)
6. Preserve existing strengths: variable template design, code excerpt requirements, context inclusion

### Non-Goals
1. Change the variable template design (it's already optimal)
2. Change code excerpt requirements (already best-in-class)
3. Add scope levels like locator/analyzer (not needed - pattern-finder's variable design already scales)
4. Break backward compatibility with existing consumers

## Design Overview

### High-Level Approach
The plan enhances the codebase-pattern-finder output structure WITHOUT changing its core content design:

1. **Wrap output in XML tags**: `<thinking>` section documents search strategy; `<answer>` section contains existing template
2. **Add YAML frontmatter**: Message envelope with correlation IDs and search metadata (patterns_found, variations_total, files_matched, files_scanned, search_keywords)
3. **Quantify frequency field**: Replace "High/Low" with "N/M files (X%)" for consistency with Distribution Notes
4. **Teach consumers**: Add delegation examples and response format descriptions to all 8 consumer agent prompts

### Data Flow
1. Consumer agent → Pattern-finder: Invokes with pattern query (optionally includes correlation_id)
2. Pattern-finder → Consumer agent: Returns structured response (envelope + thinking + answer)
3. Consumer agent: 
   - Uses metadata for correlation and validation
   - Inspects `<thinking>` if search seems incomplete (debugging)
   - Extracts `<answer>` section for findings
   - Strips `<thinking>` when passing to downstream agents (token optimization)

### Control Flow
- No changes to search workflow (plan → search → extract → report)
- Output formatting happens at report stage
- Backward compatible: Consumers can parse new format (envelope and thinking are additive)

## Implementation Instructions (For Implementor)

### PLAN-001: Update Pattern-Finder Output Template with Thinking/Answer Separation
- **Action ID:** PLAN-001
- **Change Type:** modify
- **File(s):** `agent/codebase-pattern-finder.md`
- **Instruction:**
  1. Locate the "## Output Format" section (line 72)
  2. Replace the example template (lines 76-105) with the new structure that includes `<thinking>` and `<answer>` tags
  3. In the `<thinking>` section example, document:
     - Search strategy and keywords planned
     - Grep/glob commands executed with results
     - Number of matches found per search
     - Files read for snippet extraction
     - Criteria for choosing representative examples
  4. Wrap the existing template structure (Pattern heading, Variations, Distribution Notes) in `<answer>` tags
  5. Preserve all existing content requirements (code excerpts, context, frequency, etc.)
  
  **Template Structure:**
  ```markdown
  <thinking>
  Search strategy for [topic]:
  - Planning phase: Identified keywords [list]
  - Scope: [directories], [file patterns]
  - Executed grep: `[command]`
    - Found N matches across M files
  - Identified X distinct implementation patterns:
    - Variation 1: [description] - Y files
    - Variation 2: [description] - Z files
  - Read sample files to extract snippets:
    - [file paths]
  - Found test file: [path] (if applicable)
  </thinking>
  
  <answer>
  ## Pattern: [Topic]
  
  ### Variation 1: [Name/Context]
  [existing structure unchanged]
  
  ### Distribution Notes
  [existing structure unchanged]
  </answer>
  ```
  
- **Interfaces / Pseudocode:** N/A (template update only)
- **Evidence:** `agent/codebase-pattern-finder.md:76-105` (current template location)
- **Done When:** 
  - Output template includes `<thinking>` section before `<answer>` section
  - `<thinking>` section instructs documentation of search strategy, commands, match counts, file reads
  - `<answer>` section contains existing Pattern/Variation/Distribution template structure
  - All existing content requirements preserved (code excerpts, context, tests recommendation)

### PLAN-002: Add Message Envelope with Search Metadata
- **Action ID:** PLAN-002
- **Change Type:** modify
- **File(s):** `agent/codebase-pattern-finder.md`
- **Instruction:**
  1. Locate the updated "## Output Format" section (modified in PLAN-001)
  2. Add YAML frontmatter BEFORE the `<thinking>` tag
  3. Define required metadata fields:
     - `message_id`: Auto-generated (format: `pattern-YYYY-MM-DD-NNN`)
     - `correlation_id`: Passed from caller or "none"
     - `timestamp`: ISO 8601 format
     - `message_type`: Always "PATTERN_RESPONSE"
     - `finder_version`: "1.1" (marking this update)
     - `query_topic`: Extracted from user query
     - `patterns_found`: Count of distinct pattern concepts
     - `variations_total`: Count of implementation variations
     - `files_matched`: Count of files with matching code
     - `files_scanned`: Count of total files searched
     - `search_keywords`: Array of search terms used
  4. Update the template example to show the complete structure (frontmatter + thinking + answer)
  
  **Example Structure:**
  ```markdown
  ---
  message_id: pattern-2026-01-18-001
  correlation_id: research-task-pagination
  timestamp: 2026-01-18T12:00:00Z
  message_type: PATTERN_RESPONSE
  finder_version: "1.1"
  query_topic: pagination
  patterns_found: 1
  variations_total: 2
  files_matched: 12
  files_scanned: 45
  search_keywords: ["usePagination", "Paginator", "page="]
  ---
  
  <thinking>
  [Search strategy]
  </thinking>
  
  <answer>
  ## Pattern: [Topic]
  [Content]
  </answer>
  ```
  
- **Interfaces / Pseudocode:** N/A (template update only)
- **Evidence:** `agent/codebase-pattern-finder.md:76` (template location)
- **Done When:**
  - YAML frontmatter with 11 required fields precedes `<thinking>` tag
  - All metadata fields have clear descriptions and format requirements
  - Template example shows complete structure (frontmatter + thinking + answer)
  - Instructions clarify how to generate message_id and extract query_topic

### PLAN-003: Quantify Frequency Metrics in Template
- **Action ID:** PLAN-003
- **Change Type:** modify
- **File(s):** `agent/codebase-pattern-finder.md`
- **Instruction:**
  1. Locate the Frequency field in the updated template (within `<answer>` section, Variation subsection)
  2. Replace `**Frequency**: [High/Low] (e.g., "Found in 12 files")` 
  3. With `**Frequency**: N/M files (X%)` where:
     - N = files matching this specific variation
     - M = total files with the pattern
     - X = percentage (N/M * 100)
  4. Optionally add semantic label before the numbers:
     - Dominant (>70%)
     - Common (30-70%)
     - Rare (<30%)
  5. Update the template example to show: `**Frequency**: Dominant (10/12 files, 83%)`
  6. Ensure consistency with Distribution Notes section which already uses percentages
  
- **Interfaces / Pseudocode:** N/A (template clarification only)
- **Evidence:** `agent/codebase-pattern-finder.md:81` (current vague format)
- **Done When:**
  - Frequency field uses quantified format `N/M files (X%)`
  - Template example shows the new format with actual numbers
  - Optional semantic labels defined with clear thresholds
  - Consistent with Distribution Notes section style

### PLAN-004: Add Delegation Examples to Researcher Agent
- **Action ID:** PLAN-004
- **Change Type:** modify
- **File(s):** `agent/researcher.md`
- **Instruction:**
  1. Locate the Tools section (around line 50 where delegation is mentioned)
  2. Add a new "## Delegating to codebase-pattern-finder" section after the tools description
  3. Include:
     - When to delegate (pattern search, convention research)
     - What to provide (pattern name, optional scope, correlation_id)
     - Invocation example with `task()` syntax
     - Expected response format description (envelope, thinking, answer sections)
     - How to use search metadata for validation
     - How to inspect thinking for debugging
     - How to strip thinking when passing to downstream agents
  
  **Section Content:**
  ```markdown
  ## Delegating to codebase-pattern-finder
  
  When delegating pattern search, provide:
  1. Specific pattern or concept name (e.g., "pagination", "error handling")
  2. Optional scope hint (e.g., "in React components", "in src/api/")
  3. Correlation ID for tracking multi-step workflows
  
  Example:
  ```
  task({
    subagent_type: "codebase-pattern-finder",
    description: "Find pagination patterns",
    prompt: "Find all pagination implementation patterns in React components. Analysis correlation: research-ui-patterns-2026-01-18"
  })
  ```
  
  Expected response format:
  - **YAML frontmatter**: correlation_id, search metadata (patterns_found, variations_total, files_matched, files_scanned, search_keywords)
    - Use metadata to validate search completeness (e.g., "Only 5 files_scanned - seems incomplete")
  - **<thinking> section**: Search strategy, grep commands, match counts
    - Inspect if results seem incomplete or unexpected
    - Example: "Why didn't it find pattern X in directory Y?"
  - **<answer> section**: 
    - Pattern heading
    - N variations (each with location, frequency, code snippet, context)
    - Distribution Notes (standard vs legacy usage statistics)
  
  When passing findings to downstream agents, strip `<thinking>` section to reduce tokens.
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `agent/researcher.md:50` (current brief mention)
- **Done When:**
  - New section "## Delegating to codebase-pattern-finder" added
  - Includes invocation example with correlation_id
  - Describes all three response sections (frontmatter, thinking, answer)
  - Explains how to use metadata for validation
  - Explains how to inspect thinking for debugging
  - Explains token optimization (stripping thinking)

### PLAN-005: Add Delegation Examples to Planner Agent
- **Action ID:** PLAN-005
- **Change Type:** modify
- **File(s):** `agent/planner.md`
- **Instruction:**
  1. Locate the Tools section (around line 11 where grep is disabled)
  2. Add a new "## Delegating to codebase-pattern-finder for Convention Research" section
  3. Focus on Planner's use case: identifying established conventions before planning new code
  4. Include invocation example and emphasis on using Distribution Notes to identify dominant patterns
  
  **Section Content:**
  ```markdown
  ## Delegating to codebase-pattern-finder for Convention Research
  
  Before planning new code, research established conventions to ensure consistency:
  
  Example:
  ```
  task({
    subagent_type: "codebase-pattern-finder",
    description: "Find transaction patterns",
    prompt: "Find all database transaction patterns to identify established convention. Analysis correlation: planning-transaction-impl"
  })
  ```
  
  Expected response:
  - **YAML frontmatter**: Search metadata for validation
  - **<thinking>**: Search strategy (inspect if unsure about completeness)
  - **<answer>**: 
    - Multiple variations with code examples
    - **Distribution Notes**: Use this to identify the dominant pattern
      - Example: "Variation 1 is used in 80% of src/" = follow Variation 1 for consistency
      - Example: "Variation 2 is limited to src/legacy" = avoid Variation 2 for new code
  
  Use the quantified frequency metrics (e.g., "Dominant (10/12 files, 83%)") to make data-driven decisions about which pattern to follow.
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `agent/planner.md:11` (grep disabled, delegates to pattern-finder)
- **Done When:**
  - New section added explaining convention research use case
  - Invocation example with correlation_id included
  - Emphasizes Distribution Notes for identifying dominant patterns
  - Explains how to use frequency metrics for decisions

### PLAN-006: Add Delegation Examples to Python-QA-Thorough Agent
- **Action ID:** PLAN-006
- **Change Type:** modify
- **File(s):** `agent/python-qa-thorough.md`
- **Instruction:**
  1. Locate the existing delegation mention (around line 77: "Code duplication: Delegate to codebase-pattern-finder")
  2. Expand this into a full section "## Delegating to codebase-pattern-finder for Code Duplication"
  3. Focus on QA's use case: identifying duplicate code patterns
  4. Explain how pattern-finder's multi-variation output is ideal for showing duplicates
  
  **Section Content:**
  ```markdown
  ## Delegating to codebase-pattern-finder for Code Duplication
  
  When searching for duplicate code patterns (required evidence per line 77):
  
  Example:
  ```
  task({
    subagent_type: "codebase-pattern-finder",
    description: "Find duplicate validation logic",
    prompt: "Find duplicate validation logic patterns across src/validators/. Analysis correlation: qa-duplication-check"
  })
  ```
  
  Expected response:
  - **YAML frontmatter**: 
    - `variations_total` indicates how many duplicates found
    - `files_matched` shows scope of duplication
  - **<answer>**: 
    - Each variation includes file:line location and code excerpt (matches required evidence format from line 77)
    - Multiple variations = code duplication detected
  
  Use the Location and Frequency fields to create duplication findings with proper evidence.
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `agent/python-qa-thorough.md:77` (existing delegation instruction)
- **Done When:**
  - Expanded section explains duplication detection use case
  - Invocation example included
  - Explains how variations_total metadata indicates duplicates
  - Explains how output matches required evidence format (file:line + excerpt)

### PLAN-007: Add Delegation Examples to TypeScript-QA-Thorough Agent
- **Action ID:** PLAN-007
- **Change Type:** modify
- **File(s):** `agent/typescript-qa-thorough.md`
- **Instruction:**
  1. Locate the existing delegation mention (around line 81: "Code duplication: Delegate to codebase-pattern-finder")
  2. Add identical section as PLAN-006 but customized for TypeScript context
  3. Use TypeScript-specific example (e.g., "duplicate React hooks", "duplicate type guards")
  
  **Section Content:** (Same structure as PLAN-006, TypeScript example)
  ```markdown
  ## Delegating to codebase-pattern-finder for Code Duplication
  
  When searching for duplicate code patterns (required evidence per line 81):
  
  Example:
  ```
  task({
    subagent_type: "codebase-pattern-finder",
    description: "Find duplicate hooks",
    prompt: "Find duplicate React hook patterns across src/hooks/. Analysis correlation: qa-duplication-check"
  })
  ```
  
  [Same explanation as PLAN-006]
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `agent/typescript-qa-thorough.md:81` (existing delegation instruction)
- **Done When:**
  - Expanded section added (TypeScript-specific example)
  - Same structure as PLAN-006

### PLAN-008: Add Delegation Examples to OpenCode-QA-Thorough Agent
- **Action ID:** PLAN-008
- **Change Type:** modify
- **File(s):** `agent/opencode-qa-thorough.md`
- **Instruction:**
  1. Locate the existing delegation mention (around line 278: "Pattern matching: Delegate to codebase-pattern-finder")
  2. Expand into "## Delegating to codebase-pattern-finder for Pattern Consistency Analysis"
  3. Focus on OpenCode-QA's specific use case: finding inconsistent patterns across agent definitions
  
  **Section Content:**
  ```markdown
  ## Delegating to codebase-pattern-finder for Pattern Consistency Analysis
  
  When analyzing pattern consistency across agents (per line 278):
  
  Example:
  ```
  task({
    subagent_type: "codebase-pattern-finder",
    description: "Find tool permission patterns",
    prompt: "Find tool permission patterns across agent/*.md files to identify inconsistencies. Analysis correlation: qa-agent-consistency"
  })
  ```
  
  Expected response:
  - Multiple variations = inconsistent approaches detected
  - Distribution Notes shows which pattern is standard vs outlier
  - Use frequency metrics to determine if inconsistency is intentional (e.g., "Rare (1/15 agents, 7%)") or widespread
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `agent/opencode-qa-thorough.md:278` (existing delegation instruction)
- **Done When:**
  - Expanded section explains pattern consistency use case
  - OpenCode-specific example (agent definitions)
  - Explains how variations indicate inconsistencies

### PLAN-009: Add Brief Delegation Notes to Quick QA Agents
- **Action ID:** PLAN-009
- **Change Type:** modify
- **File(s):** `agent/python-qa-quick.md`, `agent/typescript-qa-quick.md`
- **Instruction:**
  1. Locate the tools section (line 11 where grep is disabled)
  2. Add a brief note (2-3 sentences) about pattern-finder delegation
  3. Keep it minimal since quick QA agents have limited scope
  4. Reference thorough QA agents for detailed examples
  
  **Section Content (add near line 11):**
  ```markdown
  ## Pattern Search
  
  Use `codebase-pattern-finder` subagent for pattern search (grep is disabled). See [language]-qa-thorough agent for detailed delegation examples. Typical use: finding duplicate code patterns with file:line evidence.
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `agent/python-qa-quick.md:11`, `agent/typescript-qa-quick.md:11` (grep disabled)
- **Done When:**
  - Brief note added to both quick QA agents
  - References thorough agents for details
  - Mentions typical use case (duplication)

### PLAN-010: Update AGENTS.md with Pattern-Finder Best Practices
- **Action ID:** PLAN-010
- **Change Type:** modify
- **File(s):** `AGENTS.md`
- **Instruction:**
  1. Locate the "## Code Style & Conventions" section
  2. Add a new subsection "## Codebase-Pattern-Finder Output Format" after existing conventions
  3. Document the new output structure (envelope + thinking + answer)
  4. Add guidance on when to use locator vs analyzer vs pattern-finder
  
  **Section Content:**
  ```markdown
  ## Codebase-Pattern-Finder Output Format and Usage
  
  The codebase-pattern-finder subagent uses a three-part response structure:
  
  ### Response Structure
  
  1. **YAML Frontmatter** (message envelope with search metadata):
     - `message_id`, `correlation_id`, `timestamp`, `message_type`
     - Search metadata: `patterns_found`, `variations_total`, `files_matched`, `files_scanned`, `search_keywords`
     - Use for workflow correlation and search completeness validation
  
  2. **<thinking> Section** (search strategy and debugging):
     - Documents keywords, grep commands, match counts, file reads
     - Inspect when results seem incomplete or unexpected
     - Strip when passing findings to downstream agents (token optimization)
  
  3. **<answer> Section** (pattern findings):
     - Variable number of variations (scales with findings)
     - Each variation: Location, Frequency (quantified), Code snippet with context
     - Distribution Notes: Standard vs legacy usage statistics
  
  ### Code Excerpts
  
  Pattern-finder output includes actual code excerpts with context (imports, class wrappers), not just descriptions. This eliminates the need for consumer agents to re-read files for evidence.
  
  ### Frequency Metrics
  
  Frequency uses quantified format: `Dominant (10/12 files, 83%)` instead of vague "High/Low" labels. Use this for data-driven decisions about which pattern to follow.
  
  ### When to Use Each Codebase Subagent
  
  - **codebase-locator**: Find file paths and entry points
    - Use when: "Where is feature X implemented?"
    - Output: File paths, directory structure
    - Scope levels: tests_only, paths_only, comprehensive
  
  - **codebase-analyzer**: Trace execution flow and logic
    - Use when: "How does function X work?"
    - Output: Execution steps, data model, dependencies, edge cases
    - Depth levels: execution_only, focused, comprehensive
  
  - **codebase-pattern-finder**: Discover implementation patterns and conventions
    - Use when: "How is concept X implemented across the codebase?"
    - Output: Code snippets showing all variations with usage statistics
    - Variable output: Scales naturally with findings (no scope levels needed)
  
  ### Token Efficiency
  
  Pattern-finder's variable template design eliminates the fixed verbosity problem:
  - 1 variation: ~250 tokens
  - 2-3 variations (typical): ~400-600 tokens
  - 5+ variations (complex): ~1000+ tokens
  - No wasted sections (unlike locator's 76% waste or analyzer's 60-70% waste for focused queries)
  ```
  
- **Interfaces / Pseudocode:** N/A (documentation only)
- **Evidence:** `AGENTS.md` (existing conventions section)
- **Done When:**
  - New section documents three-part response structure
  - Includes guidance on using each section (frontmatter, thinking, answer)
  - Comparative guidance for choosing between locator/analyzer/pattern-finder
  - Token efficiency information included

### PLAN-011: Verification Testing
- **Action ID:** PLAN-011
- **Change Type:** N/A (verification only)
- **File(s):** N/A
- **Instruction:**
  1. Read the updated `agent/codebase-pattern-finder.md` to verify template structure
  2. Check all 8 consumer agents to verify delegation sections added
  3. Check `AGENTS.md` to verify best practices section added
  4. Verify backward compatibility:
     - Envelope is additive (frontmatter before content)
     - Thinking is additive (can be stripped)
     - Answer section preserves existing template structure
     - Frequency change is backward compatible (still includes file count)
  5. Create verification checklist document
  
  **Verification Commands:**
  ```bash
  # Verify pattern-finder template updated
  grep -A 20 "## Output Format" agent/codebase-pattern-finder.md
  
  # Verify frontmatter structure
  grep "message_id:" agent/codebase-pattern-finder.md
  grep "correlation_id:" agent/codebase-pattern-finder.md
  grep "patterns_found:" agent/codebase-pattern-finder.md
  
  # Verify thinking/answer tags
  grep "<thinking>" agent/codebase-pattern-finder.md
  grep "<answer>" agent/codebase-pattern-finder.md
  
  # Verify frequency format
  grep "Frequency:" agent/codebase-pattern-finder.md | grep -E "[0-9]+/[0-9]+"
  
  # Verify consumer updates (all 8 agents)
  grep "Delegating to codebase-pattern-finder" agent/researcher.md
  grep "Delegating to codebase-pattern-finder" agent/planner.md
  grep "Delegating to codebase-pattern-finder" agent/python-qa-thorough.md
  grep "Delegating to codebase-pattern-finder" agent/typescript-qa-thorough.md
  grep "Delegating to codebase-pattern-finder" agent/opencode-qa-thorough.md
  grep "Pattern Search" agent/python-qa-quick.md
  grep "Pattern Search" agent/typescript-qa-quick.md
  
  # Verify AGENTS.md update
  grep "Codebase-Pattern-Finder Output Format" AGENTS.md
  ```
  
- **Interfaces / Pseudocode:** N/A (verification only)
- **Evidence:** All previous PLAN tasks
- **Done When:**
  - All grep commands return expected matches
  - Backward compatibility verified (no breaking changes)
  - All 11 metadata fields present in template
  - All 8 consumer agents have delegation sections
  - AGENTS.md has comparative guidance section

## Verification Tasks (If Assumptions Exist)

No unverified assumptions blocking implementation. All facts verified against codebase.

Open questions from research (actual usage patterns, historical performance data) are informational only and do not affect implementation.

## Acceptance Criteria

Implementation is complete when:

1. **Pattern-Finder Template Updated**:
   - Output template includes YAML frontmatter with 11 required metadata fields
   - Output wrapped in `<thinking>` and `<answer>` tags
   - `<thinking>` section documents search strategy (keywords, commands, match counts, file reads)
   - `<answer>` section preserves existing template structure (Pattern heading, Variations, Distribution Notes)
   - Frequency field uses quantified format: `N/M files (X%)` or `Dominant (N/M files, X%)`

2. **Consumer Agents Updated** (all 8):
   - Researcher: Full delegation section with invocation example, response format, debugging guidance
   - Planner: Delegation section focused on convention research, emphasizes Distribution Notes
   - Python-QA-Thorough: Delegation section focused on duplication detection
   - TypeScript-QA-Thorough: Delegation section focused on duplication detection
   - OpenCode-QA-Thorough: Delegation section focused on pattern consistency analysis
   - Python-QA-Quick: Brief note referencing thorough agent
   - TypeScript-QA-Quick: Brief note referencing thorough agent

3. **Documentation Updated**:
   - AGENTS.md includes "Codebase-Pattern-Finder Output Format and Usage" section
   - Comparative guidance for choosing locator vs analyzer vs pattern-finder
   - Token efficiency information included
   - Code excerpt requirements documented

4. **Backward Compatibility Maintained**:
   - Frontmatter is additive (does not break existing parsers)
   - Thinking tags are strippable (consumers can ignore)
   - Answer section structure unchanged (existing Variation/Distribution format)
   - Frequency format still includes file counts (just adds percentage)

5. **Verification Passed**:
   - All verification commands (PLAN-011) return expected results
   - No breaking changes detected
   - All 11 metadata fields defined
   - All 8 consumers updated

6. **Quality Checks**:
   - Examples in template are complete and realistic
   - Delegation examples show correct `task()` syntax
   - Metadata field descriptions are clear
   - Token impact acknowledged in documentation (+27% worst case, +8% best case)

## Implementor Checklist

- [ ] PLAN-001: Update Pattern-Finder Output Template with Thinking/Answer Separation
- [ ] PLAN-002: Add Message Envelope with Search Metadata
- [ ] PLAN-003: Quantify Frequency Metrics in Template
- [ ] PLAN-004: Add Delegation Examples to Researcher Agent
- [ ] PLAN-005: Add Delegation Examples to Planner Agent
- [ ] PLAN-006: Add Delegation Examples to Python-QA-Thorough Agent
- [ ] PLAN-007: Add Delegation Examples to TypeScript-QA-Thorough Agent
- [ ] PLAN-008: Add Delegation Examples to OpenCode-QA-Thorough Agent
- [ ] PLAN-009: Add Brief Delegation Notes to Quick QA Agents
- [ ] PLAN-010: Update AGENTS.md with Pattern-Finder Best Practices
- [ ] PLAN-011: Verification Testing
