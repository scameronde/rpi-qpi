# Web-Search-Researcher Agent Communication Optimization Implementation Plan

## Inputs
- **Research report**: `thoughts/shared/research/2026-01-19-Web-Search-Researcher-Agent-Communication.md`
- **User request**: "Read the research report and create a plan"
- **Ticket ID**: Web-Search-Researcher-Agent-Communication
- **Research scope**: Complete analysis of web-search-researcher output structure and 4 consumer agents (Researcher, Planner, Python-QA-Thorough, TypeScript-QA-Thorough)

## Verified Current State

### Fact 1: web-search-researcher Uses Unstructured Source Metadata
- **Evidence**: `agent/web-search-researcher.md:94-100`
- **Excerpt**:
  ```markdown
  ## Source 1: [Official Documentation / GitHub Issue]
  **URL**: [Link]
  **Type**: Official Docs / Issue / Blog
  **Date**: YYYY-MM
  **Version**: [e.g., v3.2+]
  ```
- **Observation**: Source metadata uses prose format ("**Type**: Official Docs") instead of parseable YAML fields, preventing reliable programmatic extraction by consumer agents.

### Fact 2: No Thinking/Answer Separation
- **Evidence**: `agent/web-search-researcher.md:86-123` (entire output template)
- **Excerpt**:
  ```markdown
  # Web Research Report: [Subject]
  
  ## Quick Answer
  [Direct, actionable answer to the question]
  ```
- **Observation**: Single prose report mixing search strategy with results, lacking Anthropic's recommended `<thinking>` and `<answer>` tag separation for debugging and token optimization.

### Fact 3: No Message Envelope (Metadata)
- **Evidence**: `agent/web-search-researcher.md:86` (start of output template)
- **Excerpt**:
  ```markdown
  # Web Research Report: [Subject]
  [No metadata envelope]
  ```
- **Observation**: Missing YAML frontmatter with correlation IDs, timestamps, message types that are standard in multi-agent communication protocols.

### Fact 4: "No Results" Format Incompatibility
- **Evidence**: `agent/web-search-researcher.md:125-130`
- **Excerpt**:
  ```markdown
  ## Handling "No Results"
  
  If specific information is missing:
  1. Report exactly what you searched.
  2. State "Status: ⚠️ No Definitive Answer Found".
  3. Recommend next steps (e.g., "Check source code directly").
  ```
- **Observation**: Fallback format uses different structure ("Status: ⚠️ No Definitive Answer Found") incompatible with main template's Quick Answer / Confidence Score sections, creating parsing ambiguity.

### Fact 5: Variable Source Count Without Structure Guidance
- **Evidence**: `agent/web-search-researcher.md:94`
- **Excerpt**:
  ```markdown
  ## Source 1: [Official Documentation / GitHub Issue]
  ```
- **Observation**: Template shows "Source 1:" but no "Source 2" guidance, no max sources specified, no section ordering rules.

### Fact 6: Code Example Format Unspecified
- **Evidence**: `agent/web-search-researcher.md:103-110`
- **Excerpt**:
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
- **Observation**: Code examples lack source URL, language specification, line range metadata that codebase-analyzer provides (prevents traceability).

### Fact 7: Researcher Agent Expects File:Line Citations
- **Evidence**: `agent/researcher.md:56-57`
- **Excerpt**:
  ```markdown
  Sub-agents must provide: **(a)** exact file path **(b)** suggested line range **(c)** 1–6 line excerpt.
  ```
- **Evidence**: `agent/researcher.md:519`
- **Excerpt**:
  ```markdown
  ## References
  - `path/to/file.ext:line-line` (only items you verified)
  ```
- **Observation**: Researcher's citation format is designed for CODEBASE sub-agents (codebase-analyzer, codebase-locator), doesn't account for web URLs from web-search-researcher.

### Fact 8: Consumer Agents Lack Delegation Guidance
- **Evidence**: `agent/researcher.md:53`
- **Excerpt**:
  ```markdown
  - **External Info**: Delegate to `web-search-researcher`.
  ```
- **Evidence**: `agent/planner.md:54`
- **Excerpt**:
  ```markdown
  - **External Docs**: Delegate to `web-search-researcher`.
  ```
- **Observation**: Single-line delegation instruction, no examples of invocation syntax, expected response format, or citation handling.

### Fact 9: Researcher Agent Blocks Direct Web Access
- **Evidence**: `agent/researcher.md:16-17` (YAML frontmatter tools section)
- **Excerpt**:
  ```yaml
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  searxng-search: false # use Sub-Agent 'web-search-researcher' instead
  ```
- **Observation**: Researcher MUST delegate to web-search-researcher for all web research (no fallback), making output format reliability critical.

### Fact 10: Planner Has Alternative Context7 Tool
- **Evidence**: `agent/planner.md:16-17,19,55`
- **Excerpt**:
  ```yaml
  webfetch: false # use Sub-Agent 'web-search-researcher' instead
  searxng-search: false # use Sub-Agent 'web-search-researcher' instead
  context7: true
  ```
  ```markdown
  - **API Docs**: Use the context7 tool to analyze library usage.
  ```
- **Observation**: Planner can use context7 as alternative, so web-search-researcher is optional (not mandatory like for Researcher).

## Goals / Non-Goals

### Goals
1. **Structured Output**: Add YAML frontmatter for source metadata and message envelope, enabling reliable parsing by consumer agents
2. **Debugging Capability**: Separate reasoning (`<thinking>`) from findings (`<answer>`) for transparency and token optimization
3. **Format Consistency**: Unify "no results" fallback format to maintain Quick Answer / Confidence Score structure
4. **Citation Quality**: Specify code example format with source URL, language, and line reference
5. **Consumer Integration**: Update Researcher and Planner agents with delegation examples and web citation format
6. **Documentation**: Update AGENTS.md with new web research patterns

### Non-Goals
- **Query-Specific Depth Levels**: Token savings are minimal (9-19% vs codebase-analyzer's 60-70%), defer as LOW PRIORITY
- **Performance Optimization**: Primary value is reliability and consistency, not token reduction
- **Breaking Changes**: Maintain backward compatibility where possible (default to comprehensive output)

## Design Overview

### Architecture Pattern
- **Current**: Single prose report mixing search strategy and results (no structure)
- **Target**: Three-part structure following industry best practices:
  1. **YAML Frontmatter**: Message envelope with correlation IDs, timestamps, metadata
  2. **`<thinking>` Section**: Search strategy, tools used, verification steps (debug-only)
  3. **`<answer>` Section**: Structured findings (5 sections) with parseable YAML source metadata

### Token Impact Summary
- **Phase 1 (Reliability)**: +7% overhead (YAML -6%, thinking +13%)
- **Phase 2 (Infrastructure)**: +9% overhead (envelope +6%, code format +3%)
- **Total**: +16% overhead for comprehensive mode
- **Trade-off**: Token cost is justified by reliability gains (prevents parsing errors, enables debugging)

### Data Flow
1. **Consumer Agent** (Researcher/Planner) → Invokes web-search-researcher with optional correlation_id
2. **web-search-researcher** → Executes searches (context7, searxng, webfetch) and documents in `<thinking>`
3. **web-search-researcher** → Returns structured `<answer>` with YAML frontmatter + 5 sections
4. **Consumer Agent** → Parses YAML frontmatter for metadata, can inspect `<thinking>` for debugging
5. **Consumer Agent** → Extracts findings from `<answer>`, creates URL-based citations

## Implementation Instructions (For Implementor)

### Phase 1: High-Impact Reliability Improvements

#### PLAN-001: Add Structured Source Metadata (YAML Frontmatter)
- **Change Type**: modify
- **File(s)**: `agent/web-search-researcher.md`
- **Instruction**:
  1. Locate the output template at lines 86-123
  2. Replace the Source 1 section (lines 94-110) with new YAML frontmatter format:
     ```markdown
     ## Source 1: [Title]
     
     ```yaml
     url: https://docs.example.com/api/v3
     type: official_docs  # official_docs | github_issue | stackoverflow | blog | academic_paper | community_forum
     date: 2025-12
     version: v3.2+
     authority: high  # high (official docs) | medium (GitHub/SO) | low (blogs)
     ```
     
     **Key Findings**:
     [Prose explanation of source insights]
     
     **Verified Code Example**:
     [Code block - will be updated in PLAN-004]
     ```
  3. Add source type vocabulary documentation after line 33:
     ```markdown
     **Source Type Vocabulary**:
     - `official_docs`: Framework/library official documentation
     - `github_issue`: GitHub issues, PRs, discussions
     - `stackoverflow`: Stack Overflow Q&A
     - `blog`: Technical blogs and articles
     - `academic_paper`: Research papers, arXiv preprints
     - `community_forum`: Reddit, Discord, forums
     ```
  4. Add authority level guidance after the source type vocabulary:
     ```markdown
     **Authority Levels**:
     - `high`: Official documentation, authoritative sources
     - `medium`: GitHub issues/PRs, Stack Overflow accepted answers
     - `low`: Blogs, community forums, unverified sources
     ```
- **Evidence**: `agent/web-search-researcher.md:94-100` (current unstructured format), Research report lines 769-805 (recommendation details)
- **Done When**: 
  - Source metadata uses YAML frontmatter with 5 required fields (url, type, date, version, authority)
  - Source type vocabulary documented with 6 standard types
  - Authority levels documented with 3 levels
  - pyright shows no syntax errors in the Markdown file

#### PLAN-002: Add Thinking/Answer Separation
- **Change Type**: modify
- **File(s)**: `agent/web-search-researcher.md`
- **Instruction**:
  1. Locate the output template start at line 86
  2. Replace the template (lines 86-123) with new structure:
     ```markdown
     <thinking>
     Search strategy for [subject]:
     - Query 1: [context7/searxng query] → [result count] results
     - Query 2: [query] → [result count] results
     - Webfetch verification: [URL] → [status]
     - Date verification: [latest date found]
     - Authority assessment: [reasoning for confidence score]
     
     Tools used: [context7, searxng-search, webfetch]
     
     [Additional reasoning about search completeness, version compatibility, etc.]
     </thinking>
     
     <answer>
     # Web Research Report: [Subject]
     
     ## Quick Answer
     [Direct, actionable answer to the question]
     
     ---
     
     ## Source 1: [Title]
     
     ```yaml
     url: [URL]
     type: [official_docs | github_issue | stackoverflow | blog | academic_paper | community_forum]
     date: YYYY-MM
     version: [e.g., v3.2+]
     authority: [high | medium | low]
     ```
     
     **Key Findings**:
     [Explanation]
     
     **Verified Code Example**:
     [Code block]
     
     ---
     
     ## Confidence Score: [HIGH | MEDIUM | LOW]
     **Reasoning**: [e.g., "Multiple official sources confirm v3 syntax."]
     
     ## Version Compatibility
     - **Applies to**: [Version range]
     - **Breaking Changes**: [Notes on migrations]
     
     ## Warnings
     - [Deprecations, experimental features, or common pitfalls]
     </answer>
     ```
  3. Add instruction after line 48 (before "## Tool Selection Strategy"):
     ```markdown
     ## Documenting Your Search Process
     
     Use the `<thinking>` section to document:
     - **Queries Executed**: Exact search queries and tools used
     - **Results Count**: Number of results found per query
     - **Verification Steps**: Webfetch URLs and validation performed
     - **Decision Reasoning**: Why you chose specific sources, how you assessed authority
     
     This enables debugging when results seem incomplete and allows consumers to strip reasoning tokens if not needed.
     ```
- **Evidence**: `agent/web-search-researcher.md:86-123` (current single-block format), Research report lines 807-845 (thinking/answer recommendation)
- **Done When**:
  - Output template wrapped in `<thinking>` and `<answer>` tags
  - `<thinking>` section includes: queries used, result counts, webfetch verification, authority reasoning
  - Documentation added for what to include in `<thinking>` section
  - Entire `<answer>` section (all 5 sections) wrapped in closing tag

#### PLAN-003: Unify "No Results" Format
- **Change Type**: modify
- **File(s)**: `agent/web-search-researcher.md`
- **Instruction**:
  1. Locate the "Handling 'No Results'" section at lines 125-130
  2. Replace with new unified format:
     ```markdown
     ## Handling "No Results"
     
     If specific information is missing, maintain the same thinking/answer structure:
     
     <thinking>
     Searches performed:
     - Context7 query: "[query]" → [N] results ([status: relevant/irrelevant/outdated])
     - SearXNG query: "[query]" → [N] results ([status])
     - Webfetch attempt: [URL] → [HTTP status code or error]
     
     Conclusion: No definitive answer found for [specific aspect]. [Reasoning why searches failed]
     </thinking>
     
     <answer>
     # Web Research Report: [Subject]
     
     ## Quick Answer
     ⚠️ **No Definitive Answer Found**
     
     Searches performed:
     - Context7: "[query]" ([N] results, [status])
     - SearXNG: "[query]" ([N] results, [status])
     - Webfetch: [URL] ([error/404/etc.])
     
     [Brief explanation of why searches failed]
     
     ## Confidence Score: NONE
     **Reasoning**: No authoritative sources found for [version/aspect]. [Details about what was tried]
     
     ## Recommended Next Steps
     1. [Specific action, e.g., "Check source code directly at github.com/org/repo"]
     2. [Specific action, e.g., "Search GitHub issues for 'authentication' keyword"]
     3. [Specific action, e.g., "Review library changelog for breaking changes"]
     </answer>
     ```
  3. Remove the old prose-only format
- **Evidence**: `agent/web-search-researcher.md:125-130` (current incompatible format), Research report lines 904-946 (unified format recommendation)
- **Done When**:
  - "No results" format maintains `<thinking>` and `<answer>` structure
  - Quick Answer section shows "⚠️ **No Definitive Answer Found**" marker
  - Confidence Score section present with "NONE" value
  - Recommended Next Steps section added with 3 specific actionable items
  - Consumer agents can parse "no results" responses identically to success responses

#### PLAN-004: Add Message Envelope (YAML Frontmatter)
- **Change Type**: modify
- **File(s)**: `agent/web-search-researcher.md`
- **Instruction**:
  1. Locate the output template start (now at `<thinking>` after PLAN-002)
  2. Add YAML frontmatter BEFORE `<thinking>` tag:
     ```markdown
     ---
     message_id: research-YYYY-MM-DD-NNN  # Auto-generate: research-{date}-{3-digit-sequence}
     correlation_id: [from caller, or 'none']  # Consumer can pass for multi-step tracking
     timestamp: YYYY-MM-DDTHH:MM:SSZ  # ISO 8601 format
     message_type: RESEARCH_RESPONSE
     query_type: [library_api | best_practices | error_resolution | version_compatibility]
     researcher_version: "1.1"  # Track template version for compatibility
     sources_found: N  # Count of sources in response
     search_tools_used: [context7, searxng-search, webfetch]  # Tools actually invoked
     confidence: [HIGH | MEDIUM | LOW | NONE]  # Duplicate from body for quick parsing
     ---
     
     <thinking>
     [Search process documentation]
     </thinking>
     
     <answer>
     [Structured findings]
     </answer>
     ```
  3. Add instruction after line 48 (in the documentation section added by PLAN-002):
     ```markdown
     ## Message Envelope Fields
     
     Generate YAML frontmatter with these fields:
     - **message_id**: Auto-generate as `research-{YYYY-MM-DD}-{001-999}` (3-digit sequence per day)
     - **correlation_id**: Use value from caller's delegation (if provided), otherwise "none"
     - **timestamp**: Current UTC timestamp in ISO 8601 format
     - **message_type**: Always "RESEARCH_RESPONSE"
     - **query_type**: Categorize request: library_api, best_practices, error_resolution, version_compatibility
     - **researcher_version**: Current template version "1.1"
     - **sources_found**: Count of Source 1..N sections in response
     - **search_tools_used**: List of tools actually invoked (context7, searxng-search, webfetch)
     - **confidence**: Duplicate from Confidence Score section for quick parsing without reading full answer
     
     This metadata enables workflow correlation and completeness validation.
     ```
- **Evidence**: `agent/web-search-researcher.md:86` (no frontmatter currently), Research report lines 859-902 (message envelope recommendation)
- **Done When**:
  - YAML frontmatter added before `<thinking>` tag with 9 required fields
  - Documentation added explaining each field and auto-generation rules
  - Example updated to show frontmatter → thinking → answer structure
  - "No results" format also includes frontmatter with `confidence: NONE`

#### PLAN-005: Specify Code Example Format
- **Change Type**: modify
- **File(s)**: `agent/web-search-researcher.md`
- **Instruction**:
  1. Locate the "Verified Code Example" section in the Source 1 template (modified by PLAN-001)
  2. Replace the code example section with structured format:
     ```markdown
     **Verified Code Example**:
     - **Source URL**: [Direct link to documentation page with code]
     - **Language**: [JavaScript, Python, TypeScript, etc.]
     - **Excerpt** (lines [X-Y] from docs):
       ```[language]
       // Copy exact syntax from webfetch result
       // Limit to 3-10 lines maximum
       const intent = await stripe.paymentIntents.create({
         amount: 2000,
         currency: 'usd',
       });
       ```
     ```
  3. Add instruction in "Use `webfetch` For:" section (after line 78):
     ```markdown
     ### Code Example Extraction Rules
     
     When extracting code examples:
     1. **Source URL**: Provide direct link to the page containing the code
     2. **Language**: Auto-detect from code syntax (JavaScript, Python, TypeScript, etc.)
     3. **Excerpt Length**: Extract 3-10 lines maximum (avoid copy/paste of entire docs)
     4. **Line Numbers**: Approximate line numbers from source document (e.g., "lines 42-48 from docs")
     5. **Exact Syntax**: Copy code exactly as it appears in webfetch result (no modifications)
     
     This matches the evidence format used by codebase-analyzer for consistency.
     ```
- **Evidence**: `agent/web-search-researcher.md:103-110` (current unstructured code block), Research report lines 966-1005 (code example format recommendation)
- **Done When**:
  - Code examples include 3 metadata fields: Source URL, Language, Excerpt (with line numbers)
  - Documentation added with 5 extraction rules
  - Examples limited to 3-10 lines
  - Format matches codebase-analyzer's evidence structure (source + line range + excerpt)

#### PLAN-006: Update Researcher Agent Delegation Guidance
- **Change Type**: modify
- **File(s)**: `agent/researcher.md`
- **Instruction**:
  1. Locate the delegation bullet for web-search-researcher at line 53
  2. Replace single-line bullet with detailed section:
     ```markdown
     ## Delegating to web-search-researcher
     
     When delegating external knowledge research (library APIs, best practices, error resolution), provide:
     1. **Specific subject**: Library/API name and version (if known)
     2. **Correlation ID**: For tracking multi-step workflows (optional)
     
     ### Delegation Pattern
     
     ```
     task({
       subagent_type: "web-search-researcher",
       description: "Research React 18 auth patterns",
       prompt: "Research React 18 authentication hooks and patterns for single-page apps. Focus on official documentation and current best practices. Correlation: research-auth-2026-01-19"
     })
     ```
     
     ### Expected Response Format
     
     web-search-researcher returns three-part structure:
     
     **1. YAML Frontmatter** (message envelope):
     - `correlation_id`: Verify matches your request
     - `sources_found`: Count of sources (validate completeness)
     - `search_tools_used`: Tools invoked (context7, searxng, webfetch)
     - `confidence`: HIGH | MEDIUM | LOW | NONE (quick assessment)
     
     **2. `<thinking>` Section** (debugging only):
     - Inspect if results seem incomplete or confidence is unexpectedly low
     - Documents: queries executed, result counts, verification steps
     - Can strip this section when citing findings (token optimization)
     
     **3. `<answer>` Section** (structured findings):
     - Quick Answer (direct, actionable summary)
     - Source 1..N (each with YAML metadata: url, type, date, version, authority)
     - Confidence Score (HIGH/MEDIUM/LOW with reasoning)
     - Version Compatibility (version range, breaking changes)
     - Warnings (deprecations, pitfalls)
     
     ### Citing Web Research in Reports
     
     For web research findings, use URL-based citations (NOT file:line format):
     
     **Format**:
     ```markdown
     * **Evidence:** https://docs.react.dev/reference/react/hooks#authentication
     * **Date:** 2025-12 (verified current as of 2026-01-19)
     * **Type:** official_docs (authority: high)
     * **Excerpt:**
       ```javascript
       const { user, login } = useAuth();
       ```
     ```
     
     **Integration with file:line citations**:
     - CODEBASE evidence: `path/to/file.ext:line-line` format
     - WEB research evidence: URL + Date + Type format
     - Both formats include **Excerpt** field for 1-6 line code/text sample
     ```
  3. Locate the References section template at line 519
  4. Update to include web citation example:
     ```markdown
     ## References
     
     **Codebase Citations**:
     - `path/to/file.ext:line-line` (only items you verified)
     
     **Web Research Citations**:
     - https://docs.example.com/api/v3 (Type: official_docs, Date: 2025-12, Verified: 2026-01-19)
     ```
- **Evidence**: `agent/researcher.md:53` (current single-line delegation), `agent/researcher.md:519` (references template), Research report lines 1067-1106 (delegation guidance recommendation)
- **Done When**:
  - Detailed "Delegating to web-search-researcher" section added (20-30 lines)
  - Delegation pattern shows task() invocation with correlation_id
  - Expected response format documented (frontmatter, thinking, answer)
  - "Citing Web Research in Reports" section added with URL-based citation format
  - References template updated to include both codebase and web citation examples

#### PLAN-007: Update Planner Agent Delegation Guidance
- **Change Type**: modify
- **File(s)**: `agent/planner.md`
- **Instruction**:
  1. Locate the delegation bullet for web-search-researcher at line 54
  2. Replace single-line bullet with focused section:
     ```markdown
     - **External Docs**: Delegate to `web-search-researcher` for library/API research.
     
     ## Delegating to web-search-researcher for API Validation
     
     When validating external library APIs or checking framework syntax:
     
     ### Delegation Pattern
     
     ```
     task({
       subagent_type: "web-search-researcher",
       description: "Validate Stripe API syntax",
       prompt: "Find Stripe v3 API syntax for creating payment intents. Focus on official documentation and current code examples. Correlation: plan-payment-2026-01-19"
     })
     ```
     
     ### Response Handling
     
     web-search-researcher returns:
     - **YAML Frontmatter**: Check `confidence` field (HIGH/MEDIUM/LOW/NONE) for quick assessment
     - **`<thinking>` Section**: Inspect only if confidence is unexpectedly low
     - **`<answer>` Section**: Extract findings from Quick Answer and Source 1..N sections
     
     ### Citing in Implementation Plans
     
     When referencing web research in PLAN-XXX tasks:
     
     **Format**:
     ```markdown
     * **Evidence (Web Research):** https://stripe.com/docs/api/payment_intents/create
     * **Date:** 2025-12 (verified current)
     * **Excerpt:**
       ```javascript
       const intent = await stripe.paymentIntents.create({
         amount: 2000,
         currency: 'usd',
       });
       ```
     ```
     
     **Alternative: context7 Tool**
     
     For well-supported libraries, consider using the context7 tool directly instead of delegating to web-search-researcher. context7 provides faster RAG-based lookups but may have stale data for rapidly evolving libraries.
     ```
  3. Keep the context7 reference at line 55 intact
- **Evidence**: `agent/planner.md:54` (current single-line delegation), Research report lines 1108-1122 (Planner delegation recommendation)
- **Done When**:
  - "Delegating to web-search-researcher for API Validation" section added (15-20 lines)
  - Delegation pattern shows task() invocation with correlation_id
  - Response handling documented (frontmatter quick check, thinking for debugging, answer for findings)
  - Citation format provided for implementation plans
  - context7 alternative mentioned as faster option for stable libraries

### Phase 2: Documentation and Verification

#### PLAN-008: Update AGENTS.md with Web Research Patterns
- **Change Type**: modify
- **File(s)**: `AGENTS.md`
- **Instruction**:
  1. Locate the "Codebase-Pattern-Finder Output Format and Usage" section (around line 300-400)
  2. Add new section after it:
     ```markdown
     ## Web-Search-Researcher Output Format and Usage
     
     The web-search-researcher subagent provides verified external knowledge (library APIs, best practices, error resolution) using a three-part structured response.
     
     ### Response Structure
     
     All responses include:
     - **YAML frontmatter** (message envelope with correlation_id, sources_found, confidence, search_tools_used)
     - **`<thinking>` section** (search strategy, queries executed, verification steps - for debugging)
     - **`<answer>` section** (structured findings with 5 sections)
     
     ### Output Sections
     
     1. **Quick Answer** (~50-100 tokens)
        - Direct, actionable summary
        - Use case: Fast reference without reading full report
     
     2. **Source 1..N** (variable count, ~150-300 tokens each)
        - YAML metadata: url, type, date, version, authority
        - Key Findings (prose explanation)
        - Verified Code Example (with source URL, language, line numbers)
     
     3. **Confidence Score** (~20-30 tokens)
        - HIGH | MEDIUM | LOW | NONE
        - Reasoning (why this confidence level)
     
     4. **Version Compatibility** (~50-75 tokens)
        - Version range
        - Breaking changes notes
     
     5. **Warnings** (~50-100 tokens)
        - Deprecations, experimental features, common pitfalls
     
     ### Source Type Vocabulary
     
     - `official_docs`: Framework/library official documentation (authority: high)
     - `github_issue`: GitHub issues, PRs, discussions (authority: medium)
     - `stackoverflow`: Stack Overflow Q&A (authority: medium)
     - `blog`: Technical blogs and articles (authority: low)
     - `academic_paper`: Research papers, arXiv preprints (authority: high for theory)
     - `community_forum`: Reddit, Discord, forums (authority: low)
     
     ### Citation Format
     
     When citing web research in reports/plans, use URL-based format:
     
     ```markdown
     * **Evidence (Web Research):** https://docs.example.com/api/v3
     * **Date:** 2025-12 (verified current as of 2026-01-19)
     * **Type:** official_docs (authority: high)
     * **Excerpt:**
       ```javascript
       const example = apiCall();
       ```
     ```
     
     This differs from codebase citations (`path/to/file.ext:line-line`) but maintains same evidence structure (source + excerpt).
     
     ### When to Use web-search-researcher
     
     - **Library APIs**: External library syntax, configuration, best practices
     - **Error Resolution**: Specific error messages and solutions
     - **Version Compatibility**: Breaking changes, migration guides
     - **Best Practices**: Current community recommendations
     
     ### When to Use context7 Instead
     
     - **Well-supported libraries**: Faster RAG-based lookups for stable libraries
     - **Quick syntax checks**: Simple API reference lookups
     - **Trade-off**: context7 may have stale data for rapidly evolving libraries
     
     ### Delegation Pattern
     
     ```
     task({
       subagent_type: "web-search-researcher",
       description: "Research library API patterns",
       prompt: "Research [library] [version] [specific aspect]. Focus on official documentation. Correlation: [workflow-id]"
     })
     ```
     
     ### Response Parsing
     
     1. **Quick validation**: Check YAML frontmatter `confidence` field
     2. **Debugging**: Inspect `<thinking>` if results seem incomplete
     3. **Extract findings**: Parse `<answer>` sections for citations
     4. **Handle "no results"**: Response maintains same structure with Quick Answer = "⚠️ **No Definitive Answer Found**"
     
     ### Token Efficiency
     
     - Average response: ~600-900 tokens (2 sources)
     - Frontmatter overhead: +50 tokens (+6%)
     - Thinking overhead: +100 tokens (+13%)
     - **Trade-off**: +16% tokens for reliability and debugging capability
     - Consumers can strip `<thinking>` section if not needed (-13% net)
     ```
  3. Update the "When to Use Each Codebase Subagent" section to include web-search-researcher:
     ```markdown
     ### When to Use Each Research Subagent
     
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
     
     - **web-search-researcher**: Research external libraries and APIs
       - Use when: "What's the current API syntax for library X?"
       - Output: Verified documentation with code examples and version info
       - Citation format: URL-based (not file:line)
     ```
- **Evidence**: Research report lines 1139-1178 (implementation roadmap and documentation needs)
- **Done When**:
  - "Web-Search-Researcher Output Format and Usage" section added to AGENTS.md (~100 lines)
  - Section includes: response structure, output sections, source types, citation format, delegation pattern
  - "When to Use Each Research Subagent" section updated to include web-search-researcher
  - Documentation positioned after codebase-pattern-finder section (maintains subagent grouping)

#### PLAN-009: Create Verification Test Cases
- **Change Type**: create
- **File(s)**: `thoughts/shared/plans/2026-01-19-Web-Search-Researcher-Agent-Communication-TEST-CASES.md`
- **Instruction**:
  1. Create new test cases document:
     ```markdown
     # Web-Search-Researcher Agent Communication - Test Cases
     
     ## Test Case 1: Successful Research (Official Docs)
     
     **Invocation**:
     ```
     task({
       subagent_type: "web-search-researcher",
       description: "Research React 18 hooks",
       prompt: "Research React 18 authentication hooks and patterns. Focus on official documentation. Correlation: test-react-auth"
     })
     ```
     
     **Expected Response**:
     - ✅ YAML frontmatter present with all 9 fields
     - ✅ `correlation_id: test-react-auth` matches request
     - ✅ `sources_found: N` where N ≥ 1
     - ✅ `confidence: HIGH` or `MEDIUM`
     - ✅ `<thinking>` section documents search queries
     - ✅ `<answer>` section has all 5 sections (Quick Answer, Source 1, Confidence, Version, Warnings)
     - ✅ Source 1 has YAML metadata with all 5 fields (url, type, date, version, authority)
     - ✅ Code example includes source URL, language, line numbers
     
     **Validation Commands**:
     ```bash
     # Check frontmatter parsing
     grep -A 10 "^---$" response.md | grep "correlation_id: test-react-auth"
     
     # Check thinking section
     grep "<thinking>" response.md
     
     # Check answer structure
     grep "## Quick Answer" response.md
     grep "## Source 1:" response.md
     grep "## Confidence Score:" response.md
     ```
     
     ---
     
     ## Test Case 2: No Results Found
     
     **Invocation**:
     ```
     task({
       subagent_type: "web-search-researcher",
       description: "Research non-existent library",
       prompt: "Research authentication patterns for the 'totally-fake-library-xyz-123' npm package. Correlation: test-no-results"
     })
     ```
     
     **Expected Response**:
     - ✅ YAML frontmatter present with `confidence: NONE`
     - ✅ `sources_found: 0`
     - ✅ `<thinking>` documents failed searches
     - ✅ Quick Answer = "⚠️ **No Definitive Answer Found**"
     - ✅ Confidence Score section present with "NONE" value
     - ✅ "Recommended Next Steps" section with 3 actionable items
     - ✅ NO Source 1..N sections (0 sources)
     
     **Validation Commands**:
     ```bash
     # Check no results marker
     grep "⚠️ \*\*No Definitive Answer Found\*\*" response.md
     
     # Check confidence
     grep "confidence: NONE" response.md
     
     # Check next steps
     grep "## Recommended Next Steps" response.md
     ```
     
     ---
     
     ## Test Case 3: Multiple Sources
     
     **Invocation**:
     ```
     task({
       subagent_type: "web-search-researcher",
       description: "Research Stripe API",
       prompt: "Research Stripe v3 payment intents API. Find official docs and community examples. Correlation: test-multi-source"
     })
     ```
     
     **Expected Response**:
     - ✅ `sources_found: N` where N ≥ 2
     - ✅ Source 1 with `type: official_docs` and `authority: high`
     - ✅ Source 2 with different type (e.g., `github_issue`, `stackoverflow`)
     - ✅ Each source has YAML metadata
     - ✅ Each source has code example (if applicable)
     - ✅ Confidence reasoning mentions multiple sources
     
     **Validation Commands**:
     ```bash
     # Count sources
     grep -c "## Source [0-9]:" response.md
     
     # Check source types differ
     grep "type: official_docs" response.md
     grep "type: github_issue\|type: stackoverflow\|type: blog" response.md
     ```
     
     ---
     
     ## Test Case 4: Researcher Agent Citation Integration
     
     **Setup**: Researcher agent receives web-search-researcher response
     
     **Expected Behavior**:
     - ✅ Researcher can parse YAML frontmatter
     - ✅ Researcher extracts URL from source metadata
     - ✅ Researcher creates URL-based citation (not file:line format)
     - ✅ Citation includes: Evidence (URL), Date, Type, Excerpt
     
     **Example Citation**:
     ```markdown
     * **Evidence (Web Research):** https://stripe.com/docs/api/payment_intents
     * **Date:** 2025-12 (verified current as of 2026-01-19)
     * **Type:** official_docs (authority: high)
     * **Excerpt:**
       ```javascript
       const intent = await stripe.paymentIntents.create({ amount: 2000 });
       ```
     ```
     
     ---
     
     ## Test Case 5: Planner Agent Citation Integration
     
     **Setup**: Planner agent receives web-search-researcher response for API validation
     
     **Expected Behavior**:
     - ✅ Planner checks frontmatter `confidence` field for quick assessment
     - ✅ Planner extracts code example from Source 1
     - ✅ Planner creates Evidence citation in PLAN-XXX task
     - ✅ Citation format matches web research format (URL + Date + Type + Excerpt)
     
     **Example in Implementation Plan**:
     ```markdown
     ### PLAN-005: Integrate Stripe Payment API
     - **Evidence (Web Research):** https://stripe.com/docs/api/payment_intents/create
     - **Date:** 2025-12 (verified current)
     - **Excerpt:**
       ```javascript
       const intent = await stripe.paymentIntents.create({
         amount: 2000,
         currency: 'usd',
       });
       ```
     ```
     
     ---
     
     ## Acceptance Criteria
     
     All test cases must pass with:
     1. ✅ Correct YAML frontmatter structure (9 required fields)
     2. ✅ Proper `<thinking>` and `<answer>` tag separation
     3. ✅ Source metadata in YAML format (5 required fields per source)
     4. ✅ Code examples with source URL, language, line numbers
     5. ✅ "No results" format maintains same structure as success case
     6. ✅ Consumer agents (Researcher, Planner) can parse and cite correctly
     ```
  2. Document manual testing steps at end of file
- **Evidence**: Research report lines 1181-1193 (acceptance criteria)
- **Done When**:
  - Test cases document created with 5 test cases
  - Each test case includes: invocation example, expected response checklist, validation commands
  - Acceptance criteria section lists 6 verification requirements
  - Manual testing steps documented for spot-checking

#### PLAN-010: Update Agent Version and Documentation
- **Change Type**: modify
- **File(s)**: `agent/web-search-researcher.md`
- **Instruction**:
  1. Locate the description in YAML frontmatter (line 2)
  2. Update description to reflect new capabilities:
     ```yaml
     description: "Researches external libraries, APIs, and best practices. Returns structured responses with YAML metadata, thinking/answer separation, and verified code examples. Use for external knowledge beyond the codebase."
     ```
  3. Add version tracking comment at end of file (after line 131):
     ```markdown
     ---
     
     ## Version History
     
     - **v1.1** (2026-01-19): Added structured output format
       - YAML frontmatter (message envelope)
       - Thinking/answer separation
       - Structured source metadata (YAML)
       - Code example format specification
       - Unified "no results" format
     - **v1.0** (initial): Basic prose report format
     ```
  4. Update the `researcher_version` field value in the message envelope example to "1.1"
- **Evidence**: Research report lines 859-902 (message envelope with version field)
- **Done When**:
  - Agent description updated in YAML frontmatter
  - Version History section added at end of file
  - researcher_version field in template shows "1.1"
  - Git commit created with message "PLAN-010: Update web-search-researcher to v1.1 with structured output"

## Verification Tasks

No verification tasks required - all implementation items are based on verified current state from research report.

## Acceptance Criteria

For implementation to be considered complete:

1. ✅ **Structured Source Metadata**: All sources use YAML frontmatter with 5 required fields (url, type, date, version, authority)
2. ✅ **Thinking Separation**: Output wrapped in `<thinking>` and `<answer>` tags with search process documented
3. ✅ **Message Envelope**: YAML frontmatter includes 9 required fields (message_id, correlation_id, timestamp, message_type, query_type, researcher_version, sources_found, search_tools_used, confidence)
4. ✅ **Unified "No Results"**: Fallback format maintains Quick Answer / Confidence Score structure with "⚠️ **No Definitive Answer Found**" marker
5. ✅ **Code Example Format**: All code examples include source URL, language, and line reference
6. ✅ **Consumer Updates**: Researcher and Planner agents have delegation examples with URL-based citation format guidance
7. ✅ **AGENTS.md Documentation**: New section added documenting web-search-researcher output format, source types, citation format, and usage patterns
8. ✅ **Test Cases**: 5 test cases documented with validation commands
9. ✅ **Version Tracking**: Agent updated to v1.1 with version history documented

## Implementor Checklist

### Phase 1: High-Impact Reliability Improvements
- [ ] PLAN-001: Add structured source metadata (YAML frontmatter)
- [ ] PLAN-002: Add thinking/answer separation
- [ ] PLAN-003: Unify "no results" format
- [ ] PLAN-004: Add message envelope (YAML frontmatter)
- [ ] PLAN-005: Specify code example format
- [ ] PLAN-006: Update Researcher agent delegation guidance
- [ ] PLAN-007: Update Planner agent delegation guidance

### Phase 2: Documentation and Verification
- [ ] PLAN-008: Update AGENTS.md with web research patterns
- [ ] PLAN-009: Create verification test cases
- [ ] PLAN-010: Update agent version and documentation

## Quick Verification Commands

After implementation, verify changes with:

```bash
# Check web-search-researcher agent structure
grep -A 15 "^---$" agent/web-search-researcher.md | head -20  # YAML frontmatter template
grep "<thinking>" agent/web-search-researcher.md  # Thinking section present
grep "```yaml" agent/web-search-researcher.md  # Source metadata YAML

# Check consumer agent updates
grep -A 10 "Delegating to web-search-researcher" agent/researcher.md
grep -A 10 "Delegating to web-search-researcher" agent/planner.md

# Check documentation
grep -A 5 "Web-Search-Researcher Output Format" AGENTS.md

# Check test cases
test -f thoughts/shared/plans/2026-01-19-Web-Search-Researcher-Agent-Communication-TEST-CASES.md
```

## Notes

- **Token Impact**: +16% overhead for comprehensive responses (YAML +6%, thinking +13%, envelope +6%, code format +3% = +28%, but YAML saves -6% and thinking can be stripped -13% = net +9-16%)
- **Trade-off Justification**: Token cost justified by reliability gains (prevents parsing errors, enables debugging, ensures citation quality)
- **Difference from codebase-analyzer**: Token savings are smaller (9-19% vs 60-70%), so primary value is RELIABILITY and CONSISTENCY, not optimization
- **Backward Compatibility**: Changes are additive (new sections), existing consumers will see expanded format but can ignore new fields
- **Phase 3 Deferred**: Query-specific depth levels (Recommendation 6) deferred as LOW PRIORITY due to minimal token savings (9-19% vs codebase-analyzer's 60-70%)
