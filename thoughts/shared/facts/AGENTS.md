# facts/ — Codebase Fact Reports

## Purpose

Stores factual codebase fact reports produced by `/fact-finder`. Each report maps the code relevant to a spec, question, or implementation task — providing verified evidence for the `/planner` to design against.

## Ownership

`/fact-finder` writes; `/planner` reads. Reports are write-once after creation.

## Local Contracts

**File naming:** `YYYY-MM-DD-<Topic>.md`

**Required frontmatter:**
```yaml
---
date: YYYY-MM-DD
fact-finder: [identifier]
topic: "[Topic]"
status: complete
upstream-artifact: [path or none]
coverage:
  - [directories/modules/tools inspected]
---
```

**Required sections (in order):**
1. `## Executive Summary` — 3–7 factual bullets
2. `## Coverage Map` — what was actually inspected
3. `## Inherited Constraints (Treated as Fixed)` — constraints from the upstream epic or feature brief
4. `## Critical Findings` — planner-attention items with evidence
5. `## Detailed Technical Analysis` — per-component verified facts
6. `## Verification Log` — files personally read by the fact-finder and files accepted from sub-agent excerpts
7. `## Open Questions` — unverified claims and what was tried
8. `## References` — codebase citations (file:line) and web citations (URL + date + type)

**Evidence formats:**
- Codebase: `path/to/file.ext:line-line` with 1–6 line excerpt
- Web: URL + date + type (official_docs/blog/etc) + authority (high/medium/low) with excerpt

## Work Guidance

- Reports are read-only after creation — never edit to add new findings; create a new report instead
- Every factual claim requires evidence; unverified claims go to Open Questions
- No opinions, recommendations, or suggestions — observations and direct consequences only
- The `## Inherited Constraints (Treated as Fixed)` section is required and takes `None` when there are no upstream constraints or no upstream artifact; `upstream-artifact:` takes a file path or the literal `none`

## Verification

- A valid report has non-empty Critical Findings and a populated Verification Log
- All file:line citations must reference files that existed at time of research
