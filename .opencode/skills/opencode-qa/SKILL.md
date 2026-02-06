---
name: opencode-qa
description: "OpenCode agent and skill quality analysis tools, prioritization rules, and report templates for QA workflow"
license: MIT
allowed-tools:
  - bash
  - read
metadata:
  version: "1.0"
  author: "OpenCode Development Team"
  last-updated: "2026-02-05"
---

# OpenCode Quality Analysis

This skill provides QA tools, prioritization rules, and report templates specifically for analyzing OpenCode agents and skills.

## QA Tool Commands

Execute in parallel using bash tool:

```bash
# YAML validation for frontmatter
yamllint -f parsable [target]

# Markdown linting
markdownlint [target]
```

**Custom Validation Checks:**
- For skills: Extract `name:` field from YAML frontmatter, compare to directory name
- Validate kebab-case pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
- For agents: Validate required frontmatter fields (description, mode, temperature, tools)

## Prioritization Hierarchy

1. **Critical**: Configuration errors preventing agent loading (invalid YAML, directory mismatch for skills)
2. **High**: Tool permission misalignment, incorrect agent mode, missing required fields
3. **Medium**: Suboptimal temperature settings, unclear delegation patterns, missing examples
4. **Low**: Documentation improvements, naming convention preferences

## Report Template

Write QA analysis reports to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this structure:

```markdown
---
# Message Envelope (auto-generated from analysis metadata)
message_id: qa-YYYY-MM-DD-NNN  # Format: qa-{timestamp}-{sequence}, e.g., qa-2026-01-18-001
correlation_id: ""  # Optional: Link to related workflow (e.g., plan-task-id, epic-name)
timestamp: YYYY-MM-DDTHH:MM:SSZ  # ISO 8601 format, e.g., 2026-01-18T14:30:00Z
message_type: QA_REPORT  # Fixed value for QA analysis reports
qa_agent_version: "1.0"  # Version of opencode-qa-thorough agent
target_path: ""  # Path to analyzed target (e.g., agent/planner.md or skills/opencode/)
target_type: ""  # agent | skill
overall_status: ""  # Pass | Conditional Pass | Fail
critical_issues: 0  # Count of Critical priority issues
high_priority_issues: 0  # Count of High priority issues
improvement_opportunities: 0  # Count of Medium + Low priority issues
---

# OpenCode QA Analysis: [Target]

## Scan Metadata
- Date: YYYY-MM-DD
- Target: [path]
- Auditor: opencode-qa-thorough
- Tools: yamllint, markdownlint, manual analysis, opencode skill

## Executive Summary
- **Overall Status**: [Pass/Conditional Pass/Fail]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **Improvement Opportunities**: [count]

## Automated Tool Findings

### 📋 YAML Validation (yamllint)
- **Status**: [PASSED/FAILED]
- **Errors**: [count]

#### Issues
[List of YAML syntax/schema errors with file:line references]

### 📝 Markdown Linting (markdownlint)
- **Status**: [PASSED/FAILED]
- **Warnings**: [count]

#### Issues
[List of Markdown formatting issues with file:line references]

### 🏷️ Naming Conventions
- **Status**: [PASSED/FAILED]
- **Violations**: [count]

#### Issues
[List of naming convention violations (kebab-case, directory matching)]

## Manual Quality Analysis

### 📖 Agent/Skill Clarity Issues

For each issue:
- **Issue:** [Description]
- **Evidence:** `path/to/file.md:line-line`
- **Excerpt:** 
  ```yaml or markdown
  [3-6 lines of code]
  ```

### 🔧 Configuration Correctness Issues
[Evidence-based findings with file:line:excerpt]

### 🎯 Functional Validation Issues
[Evidence-based findings with file:line:excerpt]

## Improvement Plan (For Implementor)

### QA-001: [Issue Title]
- **Priority**: Critical/High/Medium/Low
- **Category**: Configuration/Clarity/Validation
- **File(s)**: `path/to/file.md:line-line`
- **Issue**: [Detailed description]
- **Evidence**: 
  ```yaml or markdown
  [Excerpt from file or tool output]
  ```
- **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
- **Done When**: [Observable condition]

[Repeat for each issue]

## Acceptance Criteria
- [ ] All critical configuration errors resolved
- [ ] All YAML validation errors fixed
- [ ] Directory names match frontmatter name fields (skills)
- [ ] Tool permissions align with agent responsibilities
- [ ] Temperature settings appropriate for task types
- [ ] [Additional criteria based on findings]

## Implementor Checklist
- [ ] QA-001: [Short title]
- [ ] QA-002: [Short title]
[etc.]

## References
- yamllint output: [summary]
- markdownlint output: [summary]
- OpenCode skill: opencode (version X.X)
- Files analyzed: [list]
- Subagents used: [list with tasks delegated]
```

## Verification Commands

Use these commands to validate changes:

```bash
# Verify YAML frontmatter
yamllint -f parsable [target]

# Verify Markdown formatting
markdownlint [target]
```

## When to Use This Skill

Invoke this skill when performing quality analysis on:
- OpenCode agent definitions (agent/*.md)
- OpenCode skill definitions (skills/*/SKILL.md)
- QA workflow planning and report generation

The skill provides standardized tools, rules, and templates for consistent quality analysis across all OpenCode components.
