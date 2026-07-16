# research/ — Codebase Research Reports

## Purpose

Stores factual codebase research reports produced by `/researcher`. Each report maps the code relevant to a spec, question, or implementation task — providing verified evidence for the `/planner` to design against.

## Ownership

`/researcher` writes; `/planner` reads. Reports are write-once after creation.

## Local Contracts

**File naming:** `YYYY-MM-DD-<Topic>.md`

**Required frontmatter:**
```yaml
---
date: YYYY-MM-DD
researcher: [identifier]
topic: "[Topic]"
status: complete
coverage:
  - [directories/modules/tools inspected]
---
```

**Required sections (in order):**
1. `## Executive Summary` — 3–7 factual bullets
2. `## Coverage Map` — what was actually inspected
3. `## Critical Findings` — planner-attention items with evidence
4. `## Detailed Technical Analysis` — per-component verified facts
5. `## Verification Log` — files personally read by the researcher
6. `## Open Questions` — unverified claims and what was tried
7. `## References` — codebase citations (file:line) and web citations (URL + date + type)

**Evidence formats:**
- Codebase: `path/to/file.ext:line-line` with 1–6 line excerpt
- Web: URL + date + type (official_docs/blog/etc) + authority (high/medium/low) with excerpt

## Work Guidance

- Reports are read-only after creation — never edit to add new findings; create a new report instead
- Every factual claim requires evidence; unverified claims go to Open Questions
- No opinions, recommendations, or suggestions — observations and direct consequences only

## Verification

- A valid report has non-empty Critical Findings and a populated Verification Log
- All file:line citations must reference files that existed at time of research
