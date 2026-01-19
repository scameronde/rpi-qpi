# Thoughts-Locator Communication Optimization Implementation Plan

## Inputs

- **Research report**: `thoughts/shared/research/2026-01-19-Thoughts-Locator-Agent-Communication.md`
- **User request**: Implement communication optimization for thoughts-locator subagent based on research findings
- **Background research**: `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (methodology)
- **Reference implementation**: `agent/codebase-locator.md` (message envelope pattern)

## Verified Current State

### Fact 1: thoughts-locator Output Format Lacks Message Envelope
**Evidence**: `agent/thoughts-locator.md:48-64`
**Excerpt**:
```markdown
## Output Format

Return a clean, categorized list.

```markdown
## Documentation: [Topic]

### Tickets
- `thoughts/shared/tickets/ENG-123.md` - **Auth Flow Refactor** (Jan 2024)

### Research & Plans
- `thoughts/shared/research/2024-01-oauth.md` - **OAuth Analysis**
```
```
**Analysis**: Current template outputs plain Markdown with no YAML frontmatter, no thinking/answer tags, no metadata.

### Fact 2: Researcher Agent Expects Structured Format
**Evidence**: `agent/researcher.md:190-225`
**Excerpt**:
```markdown
**Expected response format from thoughts-locator:**

```markdown
---
message_id: thoughts-locator-2026-01-18-001
correlation_id: research-auth-history-2026-01-18
search_scope: comprehensive
documents_found: 5
---

<thinking>
Search strategy for authentication documentation:
- Searched thoughts/shared/missions/ for auth-related missions
- Searched thoughts/shared/specs/ for auth specifications
- Found 5 total documents
</thinking>

<answer>
## Historical Documentation: Authentication

### Mission Statements
- `thoughts/shared/missions/2025-12-01-Auth-System.md`
</answer>
```
```
**Analysis**: Format mismatch exists - Researcher expects YAML frontmatter + thinking/answer tags but current template doesn't provide them.

### Fact 3: Codebase-Locator Has Reference Implementation
**Evidence**: `agent/codebase-locator.md:168-190`
**Excerpt**:
```markdown
### Structure

```markdown
---
message_id: locator-YYYY-MM-DD-NNN
correlation_id: [extracted from task prompt or "none"]
timestamp: [ISO 8601 timestamp]
message_type: LOCATION_RESPONSE
search_scope: [tests_only|paths_only|comprehensive]
locator_version: "1.1"
query_topic: [brief description]
files_found: [total count]
directories_scanned: [count]
---

<thinking>
[Search strategy documentation]
</thinking>

<answer>
## Coordinates: [Topic]

[Sections based on scope...]
</answer>
```
```
**Analysis**: Codebase-locator already implements the complete message envelope pattern that thoughts-locator needs.

### Fact 4: Current Categorization Doesn't Match Document Lifecycle
**Evidence**: `agent/thoughts-locator.md:32-37`
**Excerpt**:
```markdown
## Map of the Archive
*   `thoughts/shared/tickets/` -> JIRA/Linear tickets (`ENG-123.md`)
*   `thoughts/shared/research/` -> Deep dive reports (`YYYY-MM-DD-topic.md`)
*   `thoughts/shared/plans/` -> Implementation blueprints
*   `thoughts/decisions/` -> ADRs (Architecture Decision Records)
*   `thoughts/[username]/` -> Personal notes (Don't ignore these!)
```
**Analysis**: Categories are generic (Tickets, Research & Plans, Decisions) but AGENTS.md documents specific lifecycle: missions → specs → epics → plans → qa.

### Fact 5: Path Sanitization Rule Exists But Not Validated
**Evidence**: `agent/thoughts-locator.md:26-30`
**Excerpt**:
```markdown
## Prime Directive: Path Sanitization
**CRITICAL**: The `thoughts/` directory uses a symlinked index called `searchable`.
**Rule**: NEVER report a path containing `/searchable/`. You must strip it.
*   ❌ Bad: `thoughts/searchable/shared/research/api.md`
*   ✅ Good: `thoughts/shared/research/api.md`
```
**Analysis**: Rule is instruction-based only; no validation in output template to document sanitization actions.

### Fact 6: No Scope-Based Filtering Support
**Evidence**: `agent/thoughts-locator.md:1-70` (full file)
**Analysis**: Entire file has no mention of "scope", "paths_only", "comprehensive", or conditional output sections. All responses return all categories regardless of query focus.

### Fact 7: AGENTS.md Already Documents thoughts-locator Pattern
**Evidence**: `AGENTS.md:21-42`
**Excerpt**:
```markdown
## Historical Document Analysis Workflow

### Two-Agent Pattern: thoughts-locator → thoughts-analyzer

For researching historical decisions, specifications, and constraints from past documentation:

1. **thoughts-locator**: Finds relevant documents in `thoughts/` directory by topic/keyword
2. **thoughts-analyzer**: Extracts decisions, constraints, and specifications with evidence (path:line + excerpt)

### Output Format

thoughts-analyzer returns structured analysis with:
- YAML frontmatter (message_id, correlation_id, document metadata)
- <thinking> section (analysis reasoning)
- <answer> section (metadata, extracted signals with excerpts, verification notes)
```
**Analysis**: AGENTS.md documents thoughts-analyzer format but doesn't document thoughts-locator's expected format. Needs update after implementation.

## Goals / Non-Goals

### Goals
1. **Align thoughts-locator output format with codebase-locator pattern**: Add YAML frontmatter, thinking/answer separation
2. **Enable workflow correlation**: Support correlation_id for multi-agent workflows
3. **Support scope-based filtering**: Implement paths_only, focused, comprehensive modes
4. **Update categorization**: Align with document lifecycle (missions, specs, epics, plans, qa, research, decisions)
5. **Add path sanitization validation**: Document sanitization actions in output
6. **Update Researcher agent**: Provide complete delegation examples
7. **Update AGENTS.md**: Document thoughts-locator output format
8. **Maintain backward compatibility**: Default to comprehensive mode

### Non-Goals
- Changing the core search logic (grep/find workflows remain unchanged)
- Modifying thoughts directory structure
- Changing Planner agent (Planner typically bypasses locator per research findings)
- Adding new search capabilities beyond path discovery

## Design Overview

### Three-Phase Rollout

**Phase 1: Critical Message Envelope** (Required for Researcher workflow)
- Update output template with YAML frontmatter (9 required fields)
- Add thinking/answer tag separation
- Update categorization to match document lifecycle (8 categories)
- Token impact: +120-180 tokens per response (+48-72%)
- Benefit: Enables workflow correlation and debugging

**Phase 2: Scope-Based Optimization** (Optional, token savings for focused queries)
- Add search_scope parameter support (paths_only, focused, comprehensive)
- Implement conditional output logic based on scope
- Update Researcher agent delegation examples
- Token impact: -28% to -48% for focused queries (paths_only mode)
- Benefit: Significant token savings when only one document type is needed

**Phase 3: Reliability Enhancements** (Documentation and validation)
- Add path sanitization validation to frontmatter
- Update AGENTS.md with complete thoughts-locator documentation
- Token impact: +5-10 tokens for validation metadata
- Benefit: Programmatic verification of path sanitization

### Data Flow
1. Consumer (Researcher) invokes thoughts-locator with correlation_id and search_scope
2. thoughts-locator performs grep/find searches in thoughts/ directory
3. thoughts-locator sanitizes paths (removes /searchable/)
4. thoughts-locator categorizes results by document type
5. thoughts-locator filters output sections based on search_scope
6. thoughts-locator returns YAML frontmatter + thinking + answer
7. Consumer validates response using message_id, correlation_id, documents_found
8. Consumer passes file paths to thoughts-analyzer for content extraction

## Implementation Instructions (For Implementor)

### PLAN-001: Add Message Envelope to thoughts-locator Output Template

**Change Type**: modify  
**File(s)**: `agent/thoughts-locator.md`

**Instruction**:
1. Locate the "Output Format" section (currently lines 48-64)
2. Replace the current output template with the structured format:
   - Add YAML frontmatter block at the beginning with these exact fields:
     - `message_id: locator-YYYY-MM-DD-NNN` (auto-increment per session)
     - `correlation_id: [extracted from task prompt or "none"]`
     - `timestamp: [ISO 8601 timestamp]`
     - `message_type: LOCATION_RESPONSE`
     - `search_scope: [paths_only|focused|comprehensive]`
     - `locator_version: "1.0"`
     - `query_topic: [brief description]`
     - `documents_found: [total count]`
     - `categories_searched: [count]`
   - Add field instructions section after the template (copied from codebase-locator.md:192-205)
3. Preserve the categorized list format but move it inside `<answer>` tags (to be added in PLAN-002)

**Interfaces / Pseudocode**:
```markdown
---
message_id: locator-2026-01-19-001
correlation_id: research-auth-history-2026-01-19
timestamp: 2026-01-19T14:30:00Z
message_type: LOCATION_RESPONSE
search_scope: comprehensive
locator_version: "1.0"
query_topic: authentication documentation
documents_found: 5
categories_searched: 4
---

[Content to be wrapped in thinking/answer tags in next task]
```

**Evidence**: `agent/codebase-locator.md:168-205` (reference pattern)  
**Why this file**: thoughts-locator.md defines the subagent's output template  
**Why this approach**: Matches established pattern from codebase-locator and Researcher expectations

**Done When**:
- YAML frontmatter block exists in "Output Format" section
- All 9 required fields are documented
- Field instructions section is present (explaining how to populate each field)
- Template uses "locator-YYYY-MM-DD-NNN" format for message_id
- Template shows "LOCATION_RESPONSE" for message_type
- Frontmatter comes before any other output

---

### PLAN-002: Add Thinking/Answer Tag Separation to thoughts-locator

**Change Type**: modify  
**File(s)**: `agent/thoughts-locator.md`

**Instruction**:
1. In the "Output Format" section, immediately after the YAML frontmatter:
   - Add a `<thinking>` section with instructions to document:
     - Search commands used (grep patterns, find commands)
     - Number of matches found per category
     - Path sanitization actions (count of paths sanitized)
     - Total documents found
   - Add example thinking section showing typical search strategy
2. Wrap the existing categorized list format in `<answer>` tags
3. Add a new section after the output template titled "Thinking Section Format" with instructions:
   - Document grep/find commands executed
   - Report match counts per directory searched
   - Document path sanitization actions
   - Keep concise (5-10 lines typical)

**Interfaces / Pseudocode**:
```markdown
<thinking>
Search strategy for authentication documentation:
- Used grep pattern: "auth" in thoughts/shared/missions/
- Found 1 mission statement
- Used grep pattern: "auth" in thoughts/shared/specs/
- Found 1 specification
- Used find: thoughts/shared/plans/*AUTH*
- Found 2 implementation plans
- Total: 5 documents across 4 categories
- Path sanitization: Stripped /searchable/ from 2 paths
</thinking>

<answer>
## Historical Documentation: Authentication

### Mission Statements
- `thoughts/shared/missions/2025-12-01-Auth-System.md`
</answer>
```

**Evidence**: `agent/researcher.md:200-207` (consumer expectation), `agent/codebase-locator.md:207-227` (reference pattern)  
**Why this approach**: Anthropic official recommendation; enables debugging and token optimization

**Done When**:
- `<thinking>` section exists in output template
- Thinking section includes search commands, match counts, sanitization actions
- `<answer>` tags wrap the categorized results
- "Thinking Section Format" instructions are added to the template documentation
- Example thinking section shows realistic search strategy (5-10 lines)

---

### PLAN-003: Update Categorization to Match Document Lifecycle

**Change Type**: modify  
**File(s)**: `agent/thoughts-locator.md`

**Instruction**:
1. Update "Map of the Archive" section (currently lines 32-37):
   - Replace current bullet list with expanded categories:
     - `thoughts/shared/missions/` → Mission statements (YYYY-MM-DD-[Project].md)
     - `thoughts/shared/specs/` → Specifications (YYYY-MM-DD-[Project].md)
     - `thoughts/shared/epics/` → Epic decompositions (YYYY-MM-DD-[Epic].md)
     - `thoughts/shared/plans/` → Implementation plans (YYYY-MM-DD-[Ticket].md)
     - `thoughts/shared/qa/` → QA analysis reports (YYYY-MM-DD-[Target].md)
     - `thoughts/shared/research/` → Research reports (YYYY-MM-DD-[Topic].md)
     - `thoughts/decisions/` → ADRs (Architecture Decision Records)
     - `thoughts/[username]/` → Personal notes (Don't ignore these!)
2. Update the output template's categorized sections to match:
   - Replace "### Tickets" with "### Mission Statements"
   - Replace "### Research & Plans" with separate sections:
     - ### Specifications
     - ### Epics
     - ### Implementation Plans
     - ### QA Reports
     - ### Research Reports
   - Keep "### Decisions (ADRs)"
   - Keep "### Personal Notes"
3. Update search workflow examples (lines 40-46) to show searches for new categories

**Interfaces / Pseudocode**:
```markdown
<answer>
## Historical Documentation: Authentication

### Mission Statements
- `thoughts/shared/missions/2025-12-01-Auth-System.md`

### Specifications
- `thoughts/shared/specs/2025-12-05-Auth-System.md`

### Epics
- `thoughts/shared/epics/2025-12-10-User-Authentication.md`

### Implementation Plans
- `thoughts/shared/plans/2025-12-15-AUTH-001.md`
- `thoughts/shared/plans/2025-12-20-AUTH-002.md`

### QA Reports
- `thoughts/shared/qa/2025-12-25-Auth-Module.md`

### Research Reports
- `thoughts/shared/research/2025-12-01-OAuth-Analysis.md`

### Decisions (ADRs)
- `thoughts/decisions/005-jwt-tokens.md`

### Personal Notes
- `thoughts/jordan/notes/auth-ideas.md`
</answer>
```

**Evidence**: `AGENTS.md:7-19` (project structure), `agent/researcher.md:212-223` (expected categories)  
**Why this approach**: Aligns with greenfield workflow (Mission → Spec → Epic → Plan → QA) and provides clearer semantic categories

**Done When**:
- "Map of the Archive" section lists all 8 categories
- Output template shows all 8 category sections
- Category names match AGENTS.md structure exactly
- Search workflow examples include searches for missions, specs, epics, plans, qa
- No references to old "Tickets" or "Research & Plans" categories remain

---

### PLAN-004: Add search_scope Parameter Support

**Change Type**: modify  
**File(s)**: `agent/thoughts-locator.md`

**Instruction**:
1. After the frontmatter section (after line 20), add a new section "## Input Parameters"
2. Add subsection "### search_scope" with documentation:
   - Define three scope levels: `paths_only`, `focused`, `comprehensive`
   - For each level, document:
     - Token savings estimate
     - Use case
     - Sections returned
     - Example invocation
   - Copy structure from `agent/codebase-locator.md:42-99` (adapt for thoughts-locator categories)
3. Scope level definitions:
   - **paths_only** (~180 tokens, -28% savings):
     - Use case: "Researcher needs only one document type (e.g., only specs)"
     - Sections returned: Only the single most relevant category
   - **focused** (~220 tokens, -15% savings):
     - Use case: "Researcher needs 2-3 document types (e.g., specs + plans)"
     - Sections returned: 2-3 most relevant categories
   - **comprehensive** (~280 tokens, complete results):
     - Use case: "Researcher exploring all historical context"
     - Sections returned: All 8 categories
4. Update "Output Format" section to add conditional output instructions:
   - Add subsection "Answer Section Format" explaining conditional sections
   - Show examples for each scope level
5. Add parsing instructions: "Include `search_scope: [value]` or `Search scope: [value]` in task prompt"
6. Default behavior: "If search_scope not specified, defaults to comprehensive"

**Interfaces / Pseudocode**:
```markdown
## Input Parameters

### search_scope

The `search_scope` parameter controls which document categories appear in the output. This optimizes token usage for different consumer needs.

**Valid Values:**

1. **`paths_only`** (~180 tokens, 28% savings)
   - **Use Case:** Researcher needing only one document type (e.g., only specifications)
   - **Sections Returned:** Single most relevant category only
   - **Example:**
     ```
     task({
       subagent_type: "thoughts-locator",
       prompt: "Find specification documents for authentication. Search scope: paths_only. Correlation: research-auth-2026-01-19"
     })
     ```

2. **`focused`** (~220 tokens, 15% savings)
   - **Use Case:** Researcher needing 2-3 document types (e.g., specs + plans)
   - **Sections Returned:** 2-3 most relevant categories
   - **Example:**
     ```
     task({
       subagent_type: "thoughts-locator",
       prompt: "Find specifications and plans for authentication. Search scope: focused. Correlation: research-auth-2026-01-19"
     })
     ```

3. **`comprehensive`** (~280 tokens, complete results)
   - **Use Case:** Researcher exploring all historical context
   - **Sections Returned:** All 8 categories (default)
   - **Example:**
     ```
     task({
       subagent_type: "thoughts-locator",
       prompt: "Find all documentation for authentication. Search scope: comprehensive. Correlation: research-auth-2026-01-19"
     })
     ```

**Default Behavior:** If `search_scope` is not specified, defaults to `comprehensive`.
```

**Evidence**: `agent/codebase-locator.md:42-99` (reference implementation)  
**Why this approach**: Matches codebase-locator pattern; enables token optimization for focused queries

**Done When**:
- "Input Parameters" section exists after frontmatter
- All 3 scope levels are documented with token savings estimates
- Each scope level has example invocation
- Default behavior is documented (comprehensive)
- Parsing instructions are present (search for "search_scope:" in prompt)
- Conditional output examples show paths_only, focused, comprehensive modes

---

### PLAN-005: Add Path Sanitization Validation

**Change Type**: modify  
**File(s)**: `agent/thoughts-locator.md`

**Instruction**:
1. Update the YAML frontmatter template (from PLAN-001) to add a new field:
   - Add `paths_sanitized: [count]` field after `categories_searched`
2. Update the "Prime Directive: Path Sanitization" section (lines 26-30):
   - Add bullet point: "**Validation**: In `<thinking>` section, document how many paths contained `/searchable/` and sanitization actions taken"
   - Add bullet point: "**Envelope**: In YAML frontmatter, report `paths_sanitized: N` (count of sanitized paths)"
3. Update the thinking section example to include sanitization reporting:
   - Add line: "Path sanitization: Stripped /searchable/ from 3 paths"
4. Update frontmatter field instructions to explain paths_sanitized:
   - "**paths_sanitized**: Count of file paths that required /searchable/ stripping (0 if none)"

**Interfaces / Pseudocode**:
```markdown
---
message_id: locator-2026-01-19-001
paths_sanitized: 3
documents_found: 5
---

<thinking>
Search results:
- Found 5 files via grep in thoughts/shared/
- Sanitization: 3 paths contained /searchable/, stripped to canonical form
- Final: 5 valid paths reported
</thinking>
```

**Evidence**: Research report lines 783-836 (Recommendation 4)  
**Why this approach**: Provides programmatic verification that sanitization occurred without additional LLM burden

**Done When**:
- `paths_sanitized` field exists in YAML frontmatter template
- "Prime Directive" section includes validation instructions
- Thinking section example includes sanitization reporting
- Field instructions explain paths_sanitized field
- Example shows paths_sanitized: 0 case and paths_sanitized: N>0 case

---

### PLAN-006: Update Researcher Agent Delegation Examples

**Change Type**: modify  
**File(s)**: `agent/researcher.md`

**Instruction**:
1. Locate the "Delegation Pattern for thoughts-locator" section (around line 180)
2. Update the delegation example to include search_scope:
   - Change prompt to: "Find all mission statements, specs, epics, plans, QA reports, and research related to authentication. Search scope: comprehensive. Correlation: research-auth-2026-01-19"
3. Update the "Expected response format" section (lines 190-225):
   - Update YAML frontmatter to include all 9 fields from PLAN-001
   - Add `paths_sanitized: 0` field
   - Update thinking section to include sanitization reporting
   - Update answer section categories to match PLAN-003 (8 categories)
4. Add new subsection after the basic example: "## Scope Level Guidance for thoughts-locator"
   - Add guidance: "Use `paths_only` when you need only one document type (e.g., only specs)"
   - Add guidance: "Use `focused` when you need 2-3 document types (e.g., specs + plans)"
   - Add guidance: "Use `comprehensive` when exploring all historical context"
   - Add example for paths_only:
     ```
     task({
       subagent_type: "thoughts-locator",
       description: "Find authentication specifications",
       prompt: "Find specification documents for authentication system. Search scope: paths_only. Correlation: research-auth-2026-01-19"
     })
     ```
   - Add example for focused:
     ```
     task({
       subagent_type: "thoughts-locator",
       description: "Find authentication specs and plans",
       prompt: "Find specifications and implementation plans for authentication. Search scope: focused. Correlation: research-auth-2026-01-19"
     })
     ```
5. Add subsection "## Validating thoughts-locator Responses":
   - Add: "Use `correlation_id` to match responses in multi-delegation workflows"
   - Add: "Use `documents_found` to validate search completeness"
   - Add: "Use `search_scope` to verify the locator used correct filtering"
   - Add: "Inspect `<thinking>` if results seem incomplete or unexpected"
   - Add: "Check `paths_sanitized` to confirm path sanitization occurred"

**Evidence**: `agent/researcher.md:180-225` (current delegation pattern), research report lines 876-930 (Recommendation 6)  
**Why this approach**: Teaches Researcher how to use new scope feature effectively

**Done When**:
- Basic delegation example includes search_scope parameter
- Expected response format shows all 9 frontmatter fields + paths_sanitized
- Expected response categories match updated lifecycle (8 categories)
- "Scope Level Guidance" section exists with 3 examples (paths_only, focused, comprehensive)
- "Validating thoughts-locator Responses" section exists with 5 validation points
- All correlation_id examples use format: "research-[topic]-YYYY-MM-DD"

---

### PLAN-007: Update AGENTS.md Documentation

**Change Type**: modify  
**File(s)**: `AGENTS.md`

**Instruction**:
1. Locate the "Historical Document Analysis Workflow" section (currently lines 21-42)
2. Update the "Output Format" subsection for thoughts-locator (currently only documents thoughts-analyzer):
   - Change heading to "### Output Formats"
   - Add new subsection "#### thoughts-locator Output" before the thoughts-analyzer section
   - Document the structured format:
     - YAML frontmatter (message_id, correlation_id, timestamp, message_type, search_scope, locator_version, query_topic, documents_found, categories_searched, paths_sanitized)
     - `<thinking>` section (search strategy, commands used, match counts, sanitization actions)
     - `<answer>` section (categorized file paths by document type)
   - Add scope level note: "Supports three scope levels: paths_only, focused, comprehensive (default)"
   - Add reference: "See `agent/researcher.md` delegation examples and `agent/thoughts-locator.md` for complete template"
3. Update the consumer agents list to clarify scope usage:
   - Update Researcher bullet: "Uses thoughts-locator (with scope parameter) + thoughts-analyzer when researching features with historical context"

**Interfaces / Pseudocode**:
```markdown
### Output Formats

#### thoughts-locator Output

thoughts-locator returns structured location responses with:
- YAML frontmatter (message_id, correlation_id, search_scope, documents_found, paths_sanitized, etc.)
- <thinking> section (search strategy and path sanitization actions)
- <answer> section (categorized file paths: Mission Statements, Specifications, Epics, Implementation Plans, QA Reports, Research Reports, Decisions, Personal Notes)
- Supports three scope levels: paths_only (single category), focused (2-3 categories), comprehensive (all categories, default)

See `agent/researcher.md` delegation examples for scope usage patterns.

#### thoughts-analyzer Output

thoughts-analyzer returns structured analysis with:
[existing content...]
```

**Evidence**: `AGENTS.md:21-42` (current section)  
**Why this approach**: Provides central documentation reference for thoughts-locator pattern

**Done When**:
- "Output Formats" heading exists (plural)
- "thoughts-locator Output" subsection exists before thoughts-analyzer
- All 10 frontmatter fields are listed
- Thinking and answer sections are documented
- Scope levels are documented (paths_only, focused, comprehensive)
- Reference to agent/researcher.md is present
- Consumer agents section mentions scope parameter usage

---

## Verification Tasks

No unverified assumptions exist. All recommendations are based on verified current state from files read during research phase.

## Acceptance Criteria

Implementation is complete when:

1. ✅ **Message Envelope**: YAML frontmatter includes all 10 required fields (message_id, correlation_id, timestamp, message_type, search_scope, locator_version, query_topic, documents_found, categories_searched, paths_sanitized)
2. ✅ **Thinking Separation**: Output template uses `<thinking>` (search strategy + sanitization) and `<answer>` (categorized paths) tags
3. ✅ **Scope Levels**: Agent documentation defines and supports `paths_only`, `focused`, `comprehensive` parameters with examples
4. ✅ **Categorization**: Categories aligned with document lifecycle (Mission Statements, Specifications, Epics, Implementation Plans, QA Reports, Research Reports, Decisions, Personal Notes)
5. ✅ **Path Sanitization**: Thinking section documents sanitization actions; frontmatter includes paths_sanitized count
6. ✅ **Consumer Updates**: Researcher agent has complete delegation examples with scope level guidance and validation instructions
7. ✅ **Backward Compatibility**: Default scope level is `comprehensive` (explicitly documented)
8. ✅ **Documentation**: AGENTS.md documents thoughts-locator output format with scope levels
9. ✅ **Template Consistency**: thoughts-locator format matches codebase-locator pattern (YAML frontmatter structure, thinking/answer tags)
10. ✅ **Field Instructions**: All frontmatter fields have clear population instructions (format, examples, defaults)

## Implementor Checklist

- [ ] PLAN-001: Add message envelope to thoughts-locator output template
- [ ] PLAN-002: Add thinking/answer tag separation to thoughts-locator
- [ ] PLAN-003: Update categorization to match document lifecycle
- [ ] PLAN-004: Add search_scope parameter support
- [ ] PLAN-005: Add path sanitization validation
- [ ] PLAN-006: Update Researcher agent delegation examples
- [ ] PLAN-007: Update AGENTS.md documentation

## Notes

**Token Impact Summary** (from research report):
- Comprehensive mode: +84% tokens (+120-180 tokens) but gains workflow correlation and debugging
- Paths_only mode: -28% tokens (-70-120 tokens) for focused queries
- Net benefit: Critical workflow tracking capability with optional optimization for focused queries

**Phases**:
- Phase 1 (Critical): PLAN-001, PLAN-002, PLAN-003 (message envelope and structure)
- Phase 2 (Optimization): PLAN-004, PLAN-006 (scope-based filtering)
- Phase 3 (Documentation): PLAN-005, PLAN-007 (validation and docs)

**Testing Strategy**: After implementation, Researcher agent should be able to invoke thoughts-locator with different scope levels and receive correctly formatted responses. Validation should check:
- YAML frontmatter parses correctly
- correlation_id matches invocation
- documents_found matches actual file count
- paths_sanitized is accurate
- Scope filtering works (paths_only returns 1 category, focused returns 2-3, comprehensive returns all)
