# Research Report: Python-QA-Quick Agent-to-Agent Communication Optimization

## Metadata
- Date: 2026-01-21
- Researcher: Researcher Agent
- Topic: "Python-QA-Quick Agent-to-Agent Communication Optimization"
- Status: complete
- Coverage:
  - agent/python-qa-quick.md (agent definition and output template)
  - AGENTS.md (thinking/answer pattern guidelines)
  - Background research from 2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md (QA agent communication patterns)
  - Background research from 2026-01-18-Codebase-Analyzer-Agent-Communication.md (industry best practices)

## Executive Summary

- The python-qa-quick agent provides rapid automated Python quality checks with inline task list output but lacks thinking/answer separation despite being a user-facing agent
- **Gap 1 (Critical)**: No separation of analysis process (<thinking>) from final findings (<answer>), preventing debugging and token optimization
- **Gap 2 (Medium)**: No structured message envelope (YAML frontmatter with correlation IDs) for workflow tracking
- **Gap 3 (Documentation)**: Agent not listed in AGENTS.md thinking/answer pattern section despite being user-facing
- **Gap 4 (Architectural)**: Agent uses inline output instead of file-based reports, inconsistent with opencode-qa-thorough and QA workflow pattern
- Key difference from opencode-qa-thorough: python-qa-quick is designed for immediate developer feedback (inline), not workflow automation (file-based)
- Highest-impact recommendation: Add <thinking>/<answer> separation to enable debugging (~15-20% overhead, minimal downstream savings due to inline output)
- Secondary recommendation: Consider whether python-qa-quick should write to `thoughts/shared/qa/` for workflow consistency or remain inline-only

## Coverage Map

**Files Inspected**:
- `agent/python-qa-quick.md` (agent definition, lines 1-267)
- `AGENTS.md` (lines 1-60 for thinking/answer pattern)

**Background Research** (not re-verified, relied on prior analysis):
- `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md` (opencode-qa-thorough communication analysis)
- `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (industry best practices from 7 authoritative sources)

**Scope**:
- Complete analysis of python-qa-quick output structure
- Evidence-based comparison against AGENTS.md guidelines
- Comparison against opencode-qa-thorough agent patterns
- No implementation changes made (research only)

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: No Thinking/Answer Separation Despite User-Facing Role

**Observation**: The python-qa-quick agent produces QA task lists directly for users but does not separate analysis reasoning (<thinking>) from final findings (<answer>), violating the pattern documented in AGENTS.md for "primary agents that communicate directly with users".

**Direct consequence**: Users cannot inspect the agent's reasoning process (which tool commands were executed, how issues were prioritized, why certain issues were grouped), and there is no debugging trail when tool outputs are unexpected.

**Evidence**: `agent/python-qa-quick.md:130-157` (output template)
**Excerpt**:
```markdown
## Output Format

Use this exact Markdown structure:

```markdown
## 🚀 Quick Python QA Results

### ⏱️ Scan Summary
- Target: [path]
- Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
- Date: YYYY-MM-DD

### 🔴 Critical Issues (Fix Immediately)
[No <thinking> wrapper visible]
```
```

**Evidence**: `AGENTS.md:9-15` (thinking/answer pattern guideline)
**Excerpt**:
```markdown
### Thinking/Answer Separation for User-Facing Outputs

Primary agents that communicate directly with users should separate operational reasoning from actionable results using a structured three-part format:
```

**Evidence**: `AGENTS.md:29-37` (agents using pattern)
**Excerpt**:
```markdown
#### Agents Using This Pattern

- **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
- **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
- **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
- **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
- **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
- **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning
- **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
```

**Gap Identified**: python-qa-quick is NOT listed in this section despite being a user-facing agent (mode: all, outputs directly to users).

**Token Impact**: Estimated +100-200 tokens for <thinking> section (+15-20% overhead), minimal downstream savings (no file-based consumers, inline output only).

### Finding 2: Inline Output Without Message Envelope

**Observation**: The python-qa-quick agent outputs directly to chat/terminal without structured message metadata (correlation IDs, timestamps, message types) in YAML frontmatter.

**Direct consequence**: Cannot correlate quick QA runs with follow-up actions, no programmatic parsing possible, no workflow integration.

**Evidence**: `agent/python-qa-quick.md:130-157` (template structure)
**Excerpt**:
```markdown
## Output Format

Use this exact Markdown structure:

```markdown
## 🚀 Quick Python QA Results

### ⏱️ Scan Summary
- Target: [path]
- Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
- Date: YYYY-MM-DD
```
```

**Comparison**: opencode-qa-thorough writes to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` with potential for YAML frontmatter (per 2026-01-20 research).

**Gap Identified**: python-qa-quick produces ephemeral output with no file-based persistence, no message envelope, no workflow correlation.

**Token Impact**: N/A (inline output makes frontmatter less useful unless file-based output is added).

### Finding 3: Architectural Inconsistency with QA Workflow Pattern

**Observation**: The python-qa-quick agent is designed for immediate inline feedback, while AGENTS.md documents a file-based QA workflow: "QA agents write to `thoughts/shared/qa/` → QA-Planner converts to `thoughts/shared/plans/` → Implementation-Controller executes fixes".

**Direct consequence**: python-qa-quick cannot participate in the documented QA workflow automation because it does not write to `thoughts/shared/qa/`, making it incompatible with QA-Planner agent.

**Evidence**: `agent/python-qa-quick.md:22-32` (prime directive and target audience)
**Excerpt**:
```markdown
## Prime Directive

You analyze code using automated tools and provide concise, actionable task lists. You do not modify code.

## Target Audience

Your output is for developers who need fast feedback on code quality issues.
```

**Evidence**: `AGENTS.md` (QA workflow documentation - from background research, line reference not verified)
**Excerpt** (from 2026-01-20 research):
```markdown
- **QA Workflow**: QA agents write to `thoughts/shared/qa/` → QA-Planner converts to `thoughts/shared/plans/YYYY-MM-DD-QA-[Target].md` → Implementation-Controller executes fixes
```

**Analysis**: python-qa-quick serves a different use case than opencode-qa-thorough:
- **python-qa-quick**: Fast developer feedback loop, inline task list, no workflow integration
- **opencode-qa-thorough**: Comprehensive analysis, file-based report, workflow integration

**Gap Identified**: Architectural decision (inline vs file-based) is NOT documented in agent description. User may not understand when to use python-qa-quick vs opencode-qa-thorough.

**Token Impact**: N/A (architectural choice, not communication pattern).

### Finding 4: No Reasoning Trail for Tool Execution

**Observation**: The python-qa-quick agent executes 4 tools in parallel (ruff, pyright, bandit, interrogate) but does not document the exact commands executed, tool versions, or raw outputs.

**Direct consequence**: If a user questions why an issue was flagged or not flagged, there is no visible audit trail showing what command was run or what the tool actually said.

**Evidence**: `agent/python-qa-quick.md:97-108` (tool execution instructions)
**Excerpt**:
```markdown
### 2. Execute Analysis Tools (in parallel)

Run the following commands using the bash tool:

```bash
ruff check [target]
pyright [target]
bandit -r [target]
interrogate --fail-under 80 -v --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate [target]
```

Execute these four commands in parallel for speed.
```

**Evidence**: `agent/python-qa-quick.md:130-157` (output template - no tool output section)
**Excerpt**:
```markdown
## Output Format

Use this exact Markdown structure:

```markdown
## 🚀 Quick Python QA Results

### ⏱️ Scan Summary
- Target: [path]
- Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
- Date: YYYY-MM-DD

### 🔴 Critical Issues (Fix Immediately)
- [ ] [Issue description] - `[File:Line]` - [Tool]
```
[No section for raw tool outputs or command logs]
```

**Missing Information** (should be in <thinking>):
- Exact commands executed (with full paths and flags)
- Tool versions (ruff 0.1.0 vs 0.2.0 may have different rules)
- Raw tool outputs (full text for debugging)
- Issue count by tool (how many ruff issues vs pyright issues)
- Grouping decisions (why 20 similar issues were summarized)

**Token Impact**: Users must trust agent's interpretation of tool outputs without visibility into raw data.

### Finding 5: Template Verbosity Scales Naturally with Findings

**Observation**: Like opencode-qa-thorough, the python-qa-quick template has conditional sections that scale with the number of findings.

**Direct consequence**: A clean codebase produces a short report; a problematic codebase produces a long report. This is optimal design and requires NO changes.

**Evidence**: `agent/python-qa-quick.md:130-157` (template structure)
**Excerpt**:
```markdown
### 🔴 Critical Issues (Fix Immediately)
- [ ] [Issue description] - `[File:Line]` - [Tool]

### 🟠 High Priority
- [ ] [Issue description] - `[File:Line]` - [Tool]

### 🟡 Medium Priority
- [ ] [Issue description] - `[File:Line]` - [Tool]

### 🟢 Low Priority / Style
- [ ] [Issue description] - `[File:Line]` - [Tool]
```

**Analysis**:
- Fixed sections: Scan Summary, Next Steps (~15% of report)
- Conditional sections: Critical/High/Medium/Low issues (~85% of report, scale with findings)

**Comparison to opencode-qa-thorough**: Both agents scale naturally with findings. No verbosity optimization needed for either.

**Token Impact**: No verbosity optimization needed; current design is efficient.

### Finding 6: Conciseness Guidelines Prevent Output Bloat

**Observation**: The python-qa-quick agent includes explicit conciseness guidelines to limit output size.

**Direct consequence**: Agent self-regulates output length, preventing overwhelming task lists (max 20 items per category, summarization for additional issues).

**Evidence**: `agent/python-qa-quick.md:165-168` (conciseness guideline)
**Excerpt**:
```markdown
2. **Conciseness**
   - Be concise and actionable (task list for immediate action, not detailed report)
   - Group similar issues to avoid overwhelming output (max 20 items per category)
   - If more than 20 issues in a category, summarize: "X additional similar issues in [file]"
```

**Analysis**: This is a strength unique to python-qa-quick. opencode-qa-thorough does not have explicit output length limits because file-based reports can be longer.

**Token Impact**: Prevents runaway token usage on large codebases with many issues.

## Detailed Technical Analysis (Verified)

### Current python-qa-quick Output Structure

**Template Location**: `agent/python-qa-quick.md:130-157`

**Structure** (6 sections, 2 fixed + 4 conditional):

**Fixed Sections** (always present):
1. **Scan Summary**: Target path, tools used with status indicators, date
2. **Next Steps**: Concrete actions to take

**Conditional Sections** (scale with findings):
3. **Critical Issues**: Security vulnerabilities (empty if none)
4. **High Priority**: Type errors (empty if none)
5. **Medium Priority**: Quality issues + documentation gaps (empty if none)
6. **Low Priority**: Style issues (empty if none)

**Evidence**: `agent/python-qa-quick.md:134-157`
**Excerpt**:
```markdown
```markdown
## 🚀 Quick Python QA Results

### ⏱️ Scan Summary
- Target: [path]
- Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
- Date: YYYY-MM-DD

### 🔴 Critical Issues (Fix Immediately)
- [ ] [Issue description] - `[File:Line]` - [Tool]

### 🟠 High Priority
- [ ] [Issue description] - `[File:Line]` - [Tool]

### 🟡 Medium Priority
- [ ] [Issue description] - `[File:Line]` - [Tool]

### 🟢 Low Priority / Style
- [ ] [Issue description] - `[File:Line]` - [Tool]

### ✅ Next Steps
[Concrete actions to take]
```
```

**Strengths**:
- Emoji-based visual hierarchy (🔴🟠🟡🟢) for quick scanning
- Checkbox format for actionable task tracking
- File:Line specificity for every issue
- Scales naturally with findings (no fixed-verbosity waste)
- Conciseness guidelines prevent output bloat
- Parallel tool execution for speed

**Weaknesses**:
- No <thinking>/<answer> separation (reasoning not visible)
- No YAML frontmatter message envelope
- Inline output prevents workflow automation
- Not documented in AGENTS.md thinking/answer pattern list
- No file-based persistence (ephemeral output)

### Consumer Analysis

#### User/Developer (Primary Consumer)

**Role**: Developer running quick QA check during coding, needs immediate actionable feedback

**Input Requirements**:
- Fast results (parallel tool execution)
- Prioritized task list (Critical → High → Medium → Low)
- File:Line specificity for every issue
- Concise output (avoid overwhelming)

**Current Satisfaction**: ✅ All requirements met (agent optimized for speed and conciseness)

**Gap Identified**: Cannot see HOW agent categorized issues or WHICH exact commands were run. If user disagrees with a priority level (e.g., thinks a bandit finding is false positive), no reasoning trail to inspect.

**Example Use Case**: User sees "SQL injection risk: string concatenation in query - `src/db.py:42` - bandit" but thinks it's a false positive (query is hardcoded constant). Without <thinking> section showing actual bandit output and reasoning, user cannot validate the finding.

#### QA-Planner Agent (Potential Consumer)

**Role**: Converts QA reports to implementation plans (documented workflow pattern)

**Input Requirements** (inferred from AGENTS.md):
- File-based report at `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
- Structured tasks with priority, evidence, recommendations
- Observable "Done When" criteria

**Current Satisfaction**: ❌ python-qa-quick produces inline output, not file-based report. QA-Planner cannot consume it.

**Gap Identified**: Architectural mismatch. python-qa-quick is designed for immediate developer feedback (inline), not workflow automation (file-based).

**Token Impact**: N/A (no consumption possible with current architecture).

#### Implementation-Controller (Potential Tertiary Consumer)

**Role**: Executes implementation plans from QA-Planner

**Input Requirements**: None (consumes QA-Planner output, not QA reports directly)

**Gap Identified**: None (no direct consumption, and no QA-Planner consumption either due to inline output).

### Comparison: python-qa-quick vs opencode-qa-thorough

| Aspect | python-qa-quick | opencode-qa-thorough |
|--------|-----------------|----------------------|
| **Output Type** | Inline (chat/terminal) | File-based (`thoughts/shared/qa/`) |
| **Use Case** | Fast developer feedback | Comprehensive analysis + workflow automation |
| **Tools** | 4 automated tools (ruff, pyright, bandit, interrogate) | Automated tools + manual analysis + subagent delegation |
| **Output Length** | Concise (max 20 items/category) | Comprehensive (no limits, scales naturally) |
| **Thinking/Answer** | ❌ No separation | ❌ No separation (but recommended per 2026-01-20 research) |
| **Message Envelope** | ❌ No frontmatter | ❌ No frontmatter (but recommended per 2026-01-20 research) |
| **Workflow Integration** | ❌ Cannot be consumed by QA-Planner | ✅ Designed for QA-Planner consumption |
| **Reasoning Trail** | ❌ No visible tool outputs | ❌ No visible analysis process |
| **Target Audience** | Developer (immediate action) | Developer + QA-Planner (planning) |

**Key Insight**: These are complementary agents, not redundant:
- Use **python-qa-quick** for rapid feedback during development (inline task list)
- Use **opencode-qa-thorough** for comprehensive QA before implementation (file-based report → workflow automation)

### Workflow Analysis: python-qa-quick Position in QA Ecosystem

**Current Position**: Standalone tool, no workflow integration

**Potential Workflows**:

**Workflow 1: Developer Inner Loop (Current)**
1. Developer modifies Python code
2. Developer runs python-qa-quick for immediate feedback
3. Developer fixes issues inline
4. Repeat

**Workflow 2: Pre-Commit Hook (Potential)**
1. Developer commits code
2. Pre-commit hook runs python-qa-quick
3. Commit blocked if critical issues found
4. Developer fixes issues
5. Retry commit

**Workflow 3: CI/CD Integration (Potential)**
1. CI pipeline runs python-qa-quick on changed files
2. Pipeline fails if critical/high issues found
3. Developer receives notification with task list
4. Developer fixes issues
5. Re-run pipeline

**Workflow 4: Dual-Agent QA (Potential New Pattern)**
1. Developer runs python-qa-quick for fast triage (inline)
2. If issues found, run opencode-qa-thorough for comprehensive analysis (file-based)
3. QA-Planner converts thorough report to implementation plan
4. Implementation-Controller executes plan
5. Developer re-runs python-qa-quick to verify fixes

**Gap Identified**: Workflow 4 is not documented in AGENTS.md. Users may not know that python-qa-quick and opencode-qa-thorough are complementary.

**Token Impact**: N/A (documentation gap, not communication pattern).

### Industry Best Practices (Background Research)

**Note**: The following findings are from prior research documented in `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` and `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md`. They are included here for completeness but were NOT re-verified during this analysis.

#### Source 1: Anthropic Multi-Agent Research System (June 2025)

**Key Finding**: Structured thinking with `<thinking>` tags improves efficiency

**Excerpt from prior research**:
```markdown
Structured thinking with XML tags:
- Use `<thinking>` tags for reasoning
- Extended thinking mode improves instruction-following and efficiency
- Interleaved thinking after tool results
```

**Direct consequence**: Even for inline outputs, separating reasoning from findings enables debugging and user trust.

**Applicability to python-qa-quick**:
- Agent executes 4 tools in parallel ✅
- Agent synthesizes tool outputs into prioritized task list ✅
- Users may question prioritization decisions ✅
- No reasoning trail currently available ❌

**Conclusion**: python-qa-quick would benefit from <thinking>/<answer> separation despite inline output.

#### Source 2: AGENTS.md Guidelines (Current)

**Thinking/Answer Pattern Benefits**:

**Evidence**: `AGENTS.md:39-45` (from background research)
**Excerpt**:
```markdown
#### Benefits

- **Users see only actionable information**: ~30-70% reduction in visible text depending on agent type
- **Full reasoning trail available for debugging**: Inspect `<thinking>` section when outputs are unexpected
- **Consistent structure across agent outputs**: All primary agents use same format
- **Token optimization**: Consumers can strip `<thinking>` section when passing results downstream (~10% savings)
```

**Applicability to python-qa-quick**:
- Agent is user-facing (mode: all) ✅
- Communicates directly with users ✅
- Has no downstream consumer (inline output) ❌
- Performs complex synthesis (tool outputs → prioritized tasks) ✅

**Partial Match**: python-qa-quick meets 3 of 4 criteria. No downstream consumer means token optimization benefit is reduced, but debugging benefit remains.

**Conclusion**: python-qa-quick should adopt <thinking>/<answer> pattern for debugging and consistency, but token optimization benefit is minimal.

## Token Impact Analysis

**Estimated Current State** (average python-qa-quick output with moderate issues):

**Total**: ~400-600 tokens
- Scan Summary: ~50 tokens (8%)
- Critical Issues: ~50-100 tokens (12%)
- High Priority: ~50-100 tokens (12%)
- Medium Priority: ~100-200 tokens (25%)
- Low Priority: ~50-100 tokens (12%)
- Next Steps: ~100-150 tokens (20%)
- No <thinking> section: 0 tokens
- No message envelope: 0 tokens

**Projected State with Recommendations**:

**Total**: ~500-800 tokens (+15-25%)
- Scan Summary: ~50 tokens (6%)
- Critical/High/Medium/Low Issues: ~250-550 tokens (63%)
- Next Steps: ~100-150 tokens (15%)
- <thinking> section: ~100-200 tokens (15%)
- Message envelope (if inline YAML): ~0 tokens (N/A for inline output)

**Use Case Analysis**:

**User/Developer** (reading for immediate action):
- Current: 400-600 tokens visible
- Optimized: 400-600 tokens in <answer>, 100-200 tokens in <thinking> (inspect only if needed)
- User experience: Same actionable content, optional debugging visibility
- Estimated visibility improvement: 0% (same content) but +100% debugging capability (can inspect when needed)

**No Downstream Consumer** (inline output):
- Token savings: 0% (no automated consumers stripping <thinking>)
- Debugging value: +100% (users can inspect reasoning when questioning findings)

**Overall Impact**:

Using Anthropic's guidance that structured thinking improves efficiency:
- User debugging capability: +100% (from 0% to full tool output visibility)
- Token optimization for consumers: 0% (no downstream consumers)
- Report generation cost: +15-25% (one-time overhead per run)
- Net value: Positive (modest cost for significant debugging improvement)

## Verification Log

**Verified** (files personally read):
- `agent/python-qa-quick.md:1-267`
- `AGENTS.md:1-60`

**Spot-checked excerpts captured**: Yes

**Background Research** (relied on prior analysis, not re-verified):
- `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md` (opencode-qa-thorough communication patterns)
- `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (industry best practices from 7 authoritative sources)

**Assumptions**:
- QA-Planner agent exists and consumes file-based reports (inferred from AGENTS.md workflow description, not verified by reading QA-Planner agent definition)
- python-qa-quick is intended for inline use only (inferred from template structure, not explicitly stated in agent description)

## Open Questions / Unverified Claims

### Question 1: QA-Planner Agent Implementation

**Claim**: AGENTS.md documents a "QA-Planner" agent that converts QA reports to implementation plans.

**What I tried**:
- Searched AGENTS.md for "QA-Planner" reference (found in background research from 2026-01-20)
- Did not verify QA-Planner agent definition exists

**Evidence missing**: `agent/qa-planner.md` file existence and implementation details

**Implication**: If QA-Planner does not exist, the architectural mismatch (inline vs file-based) is less critical.

### Question 2: Actual python-qa-quick Token Counts

**Claim**: Estimated 400-600 tokens for typical python-qa-quick output with moderate issues.

**What I tried**:
- Analyzed template structure and section sizes
- Extrapolated tokens using ~4 tokens per line heuristic for task list items

**Evidence missing**: Actual token count measured by LLM tokenizer on sample output

**Implication**: Token impact projections are estimates, not measured data. Actual overhead could be higher or lower.

### Question 3: User Preference for Inline vs File-Based Output

**Claim**: python-qa-quick's inline output is designed for "developers who need fast feedback".

**What I tried**:
- Read agent description and target audience section
- Compared to opencode-qa-thorough architecture

**Evidence missing**: User feedback or requirements documentation explaining why inline output was chosen

**Implication**: <thinking> section recommendation may need adjustment if users prefer minimal inline output without debugging details.

### Question 4: Thinking Section Content for Tool-Heavy Agents

**Claim**: <thinking> section should include exact commands, tool versions, raw outputs, and grouping decisions.

**What I tried**:
- Reviewed agent operational workflow (tool execution in parallel)
- Identified information types that should be logged

**Evidence missing**: Examples from similar tool-heavy agents (linters, formatters) showing optimal thinking section content

**Implication**: <thinking> section design is based on researcher judgment, not validated patterns. May include too much or too little detail for tool-heavy agents.

### Question 5: Dual-Agent QA Workflow Viability

**Claim**: Users could use python-qa-quick for triage, then opencode-qa-thorough for comprehensive analysis.

**What I tried**:
- Compared agent architectures and use cases
- Identified complementary patterns

**Evidence missing**: User workflows showing actual usage of both agents together

**Implication**: Dual-agent workflow may be researcher invention, not actual user need.

## Recommendations (Evidence-Based)

### Recommendation 1: Add Thinking/Answer Separation (MEDIUM PRIORITY)

**Change**: Wrap python-qa-quick output in `<thinking>` and `<answer>` tags

**Before** (current):
```markdown
Execute these four commands in parallel for speed.

### 3. Synthesize Findings
[...]

## Output Format

Use this exact Markdown structure:

```markdown
## 🚀 Quick Python QA Results

### ⏱️ Scan Summary
- Target: [path]
```
```

**After** (recommended):
```markdown
Execute these four commands in parallel for speed.

### 3. Document Tool Execution (For <thinking> Section)

Log the following for debugging:

1. **Commands Executed**:
   - Exact command strings with full paths and flags
   - Tool versions (use --version flags)

2. **Tool Outputs**:
   - Full raw output for each tool (or summary if >100 lines)
   - Exit codes
   - Execution time

3. **Synthesis Decisions**:
   - Issue count by tool and priority level
   - Grouping decisions (if >20 issues in category)
   - Prioritization reasoning (why bandit finding is Critical vs High)

### 4. Synthesize Findings
[...]

## Output Format

Use this exact structure:

<thinking>
Tool Execution Log:

Commands Executed:
- ruff check src/auth/ (ruff 0.1.6)
- pyright src/auth/ (pyright 1.1.335)
- bandit -r src/auth/ (bandit 1.7.5)
- interrogate --fail-under 80 -v --ignore-init-module --ignore-magic --ignore-private --ignore-semiprivate src/auth/ (interrogate 1.5.0)

Raw Outputs:
- ruff: 12 issues found (3 complexity, 5 unused imports, 4 style)
- pyright: 8 issues found (5 missing annotations, 3 type errors)
- bandit: 2 issues found (1 HIGH: SQL injection, 1 MEDIUM: hardcoded password)
- interrogate: 65% coverage (threshold 80%, -15% gap)

Prioritization Reasoning:
- Critical (2 issues): bandit HIGH severity → immediate security risk
- High (3 issues): pyright type errors → block type checking
- Medium (10 issues): ruff complexity + unused imports + interrogate gaps → maintainability
- Low (4 issues): ruff style → cosmetic

Grouping Decisions:
- 12 ruff issues grouped by type (3 complexity, 5 imports, 4 style)
- No grouping needed (total 19 issues < 20 limit per category)
</thinking>

<answer>
## 🚀 Quick Python QA Results

### ⏱️ Scan Summary
- Target: src/auth/
- Tools: ruff ✓ | pyright ✓ | bandit ✓ | interrogate ✓
- Date: 2026-01-21

### 🔴 Critical Issues (Fix Immediately)
- [ ] SQL injection risk: string concatenation in query - `src/auth/db.py:42` - bandit
- [ ] Hardcoded password detected - `src/auth/config.py:15` - bandit

### 🟠 High Priority
- [ ] Missing return type annotation for public function - `src/auth/login.py:28` - pyright
- [ ] Variable used before assignment in error path - `src/auth/session.py:56` - pyright
- [ ] Type error: str incompatible with int - `src/auth/utils.py:12` - pyright

### 🟡 Medium Priority
- [ ] Function too complex (cyclomatic complexity 15) - `src/auth/validate.py:10` - ruff
- [ ] Unused import 'hashlib' - `src/auth/utils.py:3` - ruff
- [ ] Missing docstring coverage: 65% (threshold: 80%) - interrogate

### 🟢 Low Priority / Style
- [ ] Variable name 'x' too short - `src/auth/utils.py:45` - ruff

### ✅ Next Steps
1. Fix critical security issues in db.py and config.py immediately
2. Add type annotations to login.py and fix session.py logic error
3. Refactor validate.py to reduce complexity
4. Clean up imports and add documentation
</answer>
```

**Justification**:
- Matches AGENTS.md guideline for user-facing agents (AGENTS.md:9-15)
- Enables users to inspect tool outputs when questioning findings
- Provides audit trail for debugging (exact commands, versions, raw outputs)
- Industry best practice (Anthropic official recommendation)
- Consistent with other user-facing agents (codebase-analyzer, opencode-qa-thorough)

**Implementation**:
- Update `agent/python-qa-quick.md:97` to add Phase 3 (Document Tool Execution)
- Add explicit list of information to log in <thinking> section
- Wrap output template (lines 130-157) in <thinking> and <answer> tags
- Update AGENTS.md:29-37 to add python-qa-quick to thinking/answer pattern list

**Token Impact**: +100-200 tokens (+15-25%) per run, no downstream savings (inline output)

**Priority**: **MEDIUM** - Significant debugging value, but no workflow automation benefit

**Alternative**: If token cost is unacceptable for inline output, make <thinking> section **optional** (only generate when user adds `--verbose` flag or asks for debugging details).

### Recommendation 2: Document Architectural Decision (Inline vs File-Based)

**Change**: Add explicit statement in agent description explaining when to use python-qa-quick vs opencode-qa-thorough

**Before** (current):
```markdown
# Quick QA Agent: Rapid Python Quality Checks

You are the **Quick QA Agent**. You perform rapid, automated Python code quality checks to provide immediate actionable feedback.

## Prime Directive

You analyze code using automated tools and provide concise, actionable task lists. You do not modify code.

## Target Audience

Your output is for developers who need fast feedback on code quality issues.
```

**After** (recommended):
```markdown
# Quick QA Agent: Rapid Python Quality Checks

You are the **Quick QA Agent**. You perform rapid, automated Python code quality checks to provide immediate actionable feedback.

## Architectural Position

**Output Type**: Inline (chat/terminal), not file-based

**Use Case**: Fast developer feedback during coding (inner loop)

**Complementary Agent**: Use `opencode-qa-thorough` for comprehensive analysis with workflow automation (writes to `thoughts/shared/qa/` for QA-Planner consumption)

**When to Use python-qa-quick**:
- Developer needs immediate feedback on recent changes
- Pre-commit hook for blocking critical issues
- CI/CD pipeline for fast triage
- No workflow automation needed (inline task list sufficient)

**When to Use opencode-qa-thorough**:
- Comprehensive QA before implementation planning
- Need manual analysis + subagent delegation
- Need workflow automation (QA-Planner → Implementation-Controller)
- File-based report for documentation/audit trail

## Prime Directive

You analyze code using automated tools and provide concise, actionable task lists. You do not modify code.

## Target Audience

Your output is for developers who need fast feedback on code quality issues.
```

**Justification**:
- Clarifies architectural decision (inline vs file-based)
- Helps users choose between python-qa-quick and opencode-qa-thorough
- Documents complementary nature of two QA agents
- Prevents confusion about why python-qa-quick doesn't write to `thoughts/shared/qa/`

**Implementation**:
- Update `agent/python-qa-quick.md:22` to add "Architectural Position" section
- Update AGENTS.md QA workflow section to mention both agents

**Token Impact**: +100-150 tokens in agent prompt (one-time), no impact on output tokens

**Priority**: **LOW** - Documentation improvement, not functional change

### Recommendation 3: Add python-qa-quick to AGENTS.md Thinking/Answer Pattern List

**Change**: Add python-qa-quick to AGENTS.md thinking/answer pattern list (if Recommendation 1 is adopted)

**Before** (current):
```markdown
#### Agents Using This Pattern

- **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
- **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
- **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
- **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
- **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
- **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning
- **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
```

**After** (recommended):
```markdown
#### Agents Using This Pattern

- **task-executor** (`agent/task-executor.md`): Documents task execution reasoning
- **implementation-controller** (`agent/implementation-controller.md`): Documents orchestration reasoning
- **codebase-analyzer** (`agent/codebase-analyzer.md`): Documents code analysis reasoning
- **codebase-locator** (`agent/codebase-locator.md`): Documents file discovery reasoning
- **codebase-pattern-finder** (`agent/codebase-pattern-finder.md`): Documents pattern search reasoning
- **opencode-qa-thorough** (`agent/opencode-qa-thorough.md`): Documents QA analysis reasoning (tool execution, file reads, prioritization decisions)
- **python-qa-quick** (`agent/python-qa-quick.md`): Documents automated tool execution reasoning (commands, versions, raw outputs, synthesis decisions)
- **web-search-researcher** (`agent/web-search-researcher.md`): Documents external research reasoning
```

**Justification**:
- Ensures documentation consistency
- Helps future agent developers understand pattern adoption criteria
- Makes thinking/answer pattern discoverable for python-qa-quick users
- Prerequisite: Adopt Recommendation 1 first

**Implementation**:
- Update `AGENTS.md:29-37` to add python-qa-quick entry
- Use same format as other entries (agent name, file path, brief description of reasoning logged)

**Token Impact**: No change to agent output; documentation update only

**Priority**: **LOW** - Documentation improvement, dependent on Recommendation 1

### Recommendation 4: Consider Optional Verbose Mode

**Change**: Add optional `--verbose` flag to trigger <thinking> section generation

**Rationale**: python-qa-quick is designed for fast feedback. Adding 100-200 tokens of <thinking> content may not be desirable for every run. Allow users to opt-in to debugging details.

**Implementation**:
- Modify agent to check for `--verbose` flag in user prompt
- If `--verbose` present: Generate <thinking> section with tool outputs
- If `--verbose` absent: Omit <thinking> section, output only <answer>

**Example Usage**:
```
User: "Run python-qa-quick on src/auth/ --verbose"
Agent: [Generates thinking + answer with full tool outputs]

User: "Run python-qa-quick on src/auth/"
Agent: [Generates answer only, no thinking section]
```

**Justification**:
- Balances debugging value with token efficiency
- Respects "fast feedback" design goal
- Gives users control over verbosity level

**Token Impact**:
- Normal mode: 0% change (no thinking section)
- Verbose mode: +15-25% (thinking section included)

**Priority**: **LOW** - Enhancement, not critical for functionality

## Implementation Roadmap (Suggested Sequence)

### Phase 1: Core Communication Pattern (If Adopted)
1. **Recommendation 1**: Add thinking/answer separation with tool execution logging
2. **Test**: Run python-qa-quick on sample Python code with --verbose flag (if Recommendation 4 adopted)
3. **Validate**: Verify <thinking> section includes exact commands, versions, raw outputs, synthesis reasoning

**Estimated effort**: 2-3 hours
**Token impact**: +15-25% per run (or +0% if verbose mode optional)

### Phase 2: Documentation Consistency
4. **Recommendation 2**: Document architectural decision (inline vs file-based)
5. **Recommendation 3**: Add python-qa-quick to AGENTS.md thinking/answer pattern list
6. **Update AGENTS.md**: Add section comparing python-qa-quick vs opencode-qa-thorough use cases

**Estimated effort**: 1-2 hours
**Token impact**: 0% (documentation only)

### Phase 3: Optional Enhancement
7. **Recommendation 4**: Implement optional verbose mode (--verbose flag)
8. **Test**: Verify both modes (with/without --verbose) produce expected output

**Estimated effort**: 2-3 hours
**Token impact**: +0% (normal mode), +15-25% (verbose mode)

**Total estimated effort**: 5-8 hours
**Total token impact**:
- Agent prompt updates: +100-150 tokens (one-time, Recommendation 2)
- Output (normal mode): +0% if verbose mode optional
- Output (verbose mode): +15-25% when user requests debugging details
- User debugging capability: +100% (from none to full tool output visibility)
- Workflow automation: 0% change (inline output, no file-based consumers)

## Acceptance Criteria

For implementation to be considered complete:

1. **Thinking/Answer Separation** (if adopted): python-qa-quick output wrapped in `<thinking>` and `<answer>` tags
2. **Thinking Content**: <thinking> section includes all 3 information categories (commands executed, tool outputs, synthesis decisions)
3. **Answer Consistency**: <answer> section uses existing template structure (no changes to task list format)
4. **Documentation**: AGENTS.md thinking/answer pattern list includes python-qa-quick entry (if pattern adopted)
5. **Architectural Clarity**: Agent description includes "Architectural Position" section explaining inline vs file-based decision
6. **Backward Compatibility**: <answer> section content matches current output format (users see same task list)
7. **Verification**: Sample run produces output with expected structure (thinking + answer if adopted, or answer-only if not)
8. **Optional Verbose Mode** (if adopted): --verbose flag toggles <thinking> section generation

## References

**Files Verified**:
- `agent/python-qa-quick.md:1-267` (agent definition and template)
- `AGENTS.md:1-60` (thinking/answer pattern guidelines)

**Background Research** (relied on prior analysis):
- `thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md` (opencode-qa-thorough communication patterns)
- `thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md` (industry best practices, 7 authoritative sources)
