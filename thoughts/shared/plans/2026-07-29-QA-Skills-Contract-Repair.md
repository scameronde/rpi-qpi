# QA-Skills-Contract-Repair Implementation Plan

## Inputs
- Fact report(s) used: `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md`
- Epic / feature brief: `none` (from the fact report's `upstream-artifact: none`)
- User request summary: repair the four QA skills so they satisfy the contracts established by the phase-one and phase-two skill work. Four dispositions were decided by the user before planning: remove `disable-model-invocation` from all four (Q-01); converge `clean-code` to the sibling report shape and relabel P1–P4 to Critical/High/Medium/Low while keeping `CLEAN-XXX` ids (Q-06/Q-07); drop the `<thinking>`/`<answer>` wrappers in favour of real frontmatter plus a demoted `## Audit Trail` section (Q-02/Q-03/Q-13); give every finding a `Verify:` field (Q-05). Nine further defaults were decided in conversation and are recorded per task below.

## Verified Current State

### The load step cannot execute

- **Fact:** all four QA skills carry `disable-model-invocation: true` on line 4, and no other skill in `.claude/skills/` carries the field. `claude-code-extensions:67-70` documents that value as "Claude auto-invokes: No", "Context cost: Zero until you invoke".
- **Evidence:** `.claude/skills/python-qa/SKILL.md:1-5`
- **Excerpt:**
  ```yaml
  ---
  name: python-qa
  description: Python code quality analysis using ruff, pyright, bandit, and interrogate. Use when asked to review Python code quality, run a Python QA pass, or audit a .py file or module.
  disable-model-invocation: true
  allowed-tools: Bash, Read, Grep, Glob, Write, Agent   # no Edit — a reviewer must not fix what it reviews
  ```

- **Fact:** `/fact-finder:83` requires loading one of the four through the `Skill` tool as QA Mode's first action, and states the consequence of not doing so.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:83`
- **Excerpt:**
  ```markdown
  **First, load the matching quality skill** via the `Skill` tool. It supplies the automated tool commands, the prioritization rules and the report template that the phases below refer to as "the loaded skill" — without it those phases have nothing to draw on.
  ```

- **Fact:** the flag predates the load instruction by four months. `c6a7e21` (2026-03-16) introduced it across a 120-file port; `b58138c` (2026-06-09) introduced the QA Mode section; `0d38e63` (2026-07-28) introduced the load instruction. `git merge-base --is-ancestor c6a7e21 0d38e63` exits 0.
- **Evidence:** `thoughts/shared/facts/2026-07-29-QA-Skills-Contract-Drift.md:88-96` (Q-01 Provenance)
- **Excerpt:**
  ```markdown
  - **Direct consequence:** the flag was set when no file instructed loading these skills programmatically, and the loading instruction was added later without the frontmatter being revisited.
  ```

### The written report has no frontmatter

- **Fact:** three of four templates instruct writing a file whose first line is `<thinking>`; the block carrying `message_type: QA_REPORT` sits later, inside `<answer>`, where it is body text rather than frontmatter.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:70-74`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

  ```markdown
  <thinking>
  ## Phase 1: Target Discovery
  ```

- **Fact:** `/planner:499` names that block as detection method 2, and `qa/AGENTS.md:15-23` states four required frontmatter fields of which the envelope supplies one.
- **Evidence:** `.claude/skills/planner/SKILL.md:497-499`
- **Excerpt:**
  ```markdown
  **Detection Methods:**
  1. File path starts with `thoughts/shared/qa/`
  2. YAML frontmatter contains `message_type: QA_REPORT`
  ```

- **Fact:** `clean-code` alone emits real frontmatter, at `:451-458`, and that block omits `message_type`. A second `---` block at `:541-553` carries `message_type` plus `p1_count`…`p4_count` where the siblings use `critical_issues`…`low_priority_issues`.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:451-458`
- **Excerpt:**
  ```yaml
  ---
  date: YYYY-MM-DD
  auditor: clean-code
  target: [module/package/file]
  language: [python|typescript|go|rust|java|etc.]
  status: complete
  ---
  ```

- **Fact:** `/fact-finder`'s own artifact template is plain frontmatter with no wrapper, and includes `upstream-artifact:`, which `/planner:479-482` reads in Phase 1 — before QA detection at `:493`. An **absent** field authorizes globbing `epics/` and `features/` and asking the user to confirm a candidate.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:613-621`
- **Excerpt:**
  ```yaml
  ---
  date: YYYY-MM-DD
  fact-finder: [identifier]
  topic: "[Topic]"
  status: complete
  upstream-artifact: [path or none]
  ```

### No finding carries a verification command

- **Fact:** the finding templates stop at `Done When`. `/planner:572` requires a literal command per task, and `/implement:22` states the condition cannot be repaired at execution time.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:252-263`
- **Excerpt:**
  ```markdown
  ### QA-001: [Issue Title]
  - **Priority**: Critical/High/Medium/Low
  - **Recommendation**: [Specific action to take - NO VAGUE INSTRUCTIONS]
  - **Done When**: [Observable condition]
  ```

- **Fact:** `clean-code:310-314` expresses judgment-heavy checks as "Done When: Code review confirms …". `/planner:596` names the literal that expresses that condition in the current vocabulary.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:310-314`
- **Excerpt:**
  ```markdown
  1. **Naming Improved**:
     - Done When: Code review confirms all identifiers are intention-revealing
  ```

### `clean-code` is the structural outlier

- **Fact:** `clean-code` contains no `## Improvement Plan (For Implementor)`, no `## Acceptance Criteria` and no `## Implementor Checklist`; the other three carry all three (`python-qa:250,266,273`; `typescript-qa:279,295,302`; `logic-bugs-qa:436,455,462`). `clean-code` offers `## Recommendations for Next Steps` instead.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:703-708`
- **Excerpt:**
  ```markdown
  ## Recommendations for Next Steps

  ### Immediate (Current Sprint)
  1. **CLEAN-001**: Refactor `processOrder` (CCN 28 → target < 10)
  ```

- **Fact:** `/planner:830-832` fills the plan's acceptance criteria from that missing section, and `/implement:236,240` gates run closure on the plan's copy.
- **Evidence:** `.claude/skills/implement/SKILL.md:236`
- **Excerpt:**
  ```markdown
  1. **Read the plan's `## Acceptance Criteria` section.** Confirm each item holds in the working tree. For each criterion, name the evidence (output of a command, a code location, or both). Report any criterion that does not hold rather than closing the run.
  ```

- **Fact:** `clean-code` heads its tiers P1–P4 with the shared vocabulary in parentheses; `/planner:504-509` keys plan phases to that vocabulary.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:352`
- **Excerpt:**
  ```markdown
  ### P1 (Critical) - Immediate Action Required
  ```

### Naming and pointer divergences

- **Fact:** all four state the unsuffixed report path; `/fact-finder:94,636` and `qa/AGENTS.md:13` state the suffixed form. `clean-code` states both, 287 lines apart, the suffixed one in its own worked example.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:737-745`
- **Excerpt:**
  ```markdown
  Fact-Finder: "Analyze Python code quality for src/auth/"
  → Uses python-qa skill
  → Produces: thoughts/shared/qa/2026-02-05-Auth-Module-Python.md
  ```

- **Fact:** `/planner:822,828` directs the reader to "the skill's Section 4". Only `clean-code:265` has a section so numbered, and it is not a `[language]-qa` skill. The four headings are three distinct strings.
- **Evidence:** `.claude/skills/planner/SKILL.md:820-828`
- **Excerpt:**
  ```markdown
  Commands from [language]-qa skill Section 4:
  ...
  **Note:** The specific verification tools and commands are provided by the loaded QA skill for the target language. Refer to the skill's Section 4 for the complete verification command set.
  ```

- **Fact:** the baseline blocks annotate commands with phases that contradict the skills' own tiers — `ruff check` "after Phase 1" where `python-qa:34` classes ruff style as Low (Phase 4); `npx tsc --noEmit` "after Phase 1" where `typescript-qa:37` classes tsc errors as High (Phase 2). `/implement:232-238` runs the block once, after every wave.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:292-297`
- **Excerpt:**
  ```bash
  ruff check [target]  # Should pass after Phase 1
  pyright [target]  # Should pass after Phase 2
  bandit -r [target]  # Should pass after Phase 1
  ```

- **Fact:** `logic-bugs-qa` carries two verification sections, at `:98` and `:475`, whose names match the two different strings used by its siblings.
- **Evidence:** `.claude/skills/logic-bugs-qa/SKILL.md:475-478`
- **Excerpt:**
  ```markdown
  ## Verification Commands for Planner

  Since logic bugs are verified through tests, not linters, include these in implementation plans:
  ```

- **Fact:** `logic-bugs-qa:174` leaves the analyzer scope alternation unbracketed while `[function]` and `[file]` are bracketed, so the line as written sends all three values.
- **Evidence:** `.claude/skills/logic-bugs-qa/SKILL.md:174`
- **Excerpt:**
  ```markdown
    prompt: "Trace [function] in [file]. Output scope: comprehensive | focused | execution_only."
  ```

- **Fact:** `typescript-qa:41-64` declares three delegation blocks; its report template logs a fourth at `:158-161`. `python-qa:61-66` declares that fourth block.
- **Evidence:** `.claude/skills/typescript-qa/SKILL.md:158-161`
- **Excerpt:**
  ```markdown
  4. **web-search-researcher**:
     - Task: Research [topic]
     - Response: [confidence level + sources]
  ```

- **Fact:** `qa/AGENTS.md:29` requires a per-finding "reproduction path" that no template produces; `logic-bugs-qa:450` is the nearest, and only logic findings have reproductions.
- **Evidence:** `thoughts/shared/qa/AGENTS.md:25-29`
- **Excerpt:**
  ```markdown
  **Report structure** (follows the loaded QA skill's template):
  - Automated tool output summary (linter warnings, type errors, test results)
  - Issue classification by severity (critical / high / medium / low)
  - Manual analysis findings with file:line evidence
  - Each finding includes: description, location, severity, and reproduction path
  ```

### Scope boundaries verified during Phase 2

- **Fact:** none of the seven `references/` files duplicates the report template, the severity tiers or the verification commands. The single marker hit is a Python email example using `message_id` as a domain field. This resolves the fact report's Open Question 6 and holds the surface at six files rather than thirteen.
- **Evidence:** `.claude/skills/clean-code/references/testability-principles.md:627-636`
- **Excerpt:**
  ```python
      message_id: str
              message_id = smtp.send(to, subject, body)
              return EmailResult(success=True, message_id=message_id)
  ```

- **Fact:** `claude-code-extensions` documents `disable-model-invocation` as a general field and makes no claim about the four QA skills, so removing the flag does not require editing it.
- **Evidence:** `.claude/skills/claude-code-extensions/SKILL.md:73`
- **Excerpt:**
  ```markdown
  Use `disable-model-invocation: true` for actions with side effects (`/deploy`, `/commit`).
  ```

- **Fact:** `dist/` does not exist, and `scripts/build-plugin.sh` rewrites only the hook path — it never touches skill frontmatter. No mirrored copy needs updating and no build task is required.
- **Evidence:** `scripts/build-plugin.sh:63`
- **Excerpt:**
  ```bash
  sed 's|\.claude/hooks/session-start|${CLAUDE_PLUGIN_ROOT}/hooks-handlers/session-start|g' \
  ```

- **Fact:** `thoughts/shared/AGENTS.md:25` describes `qa/` as written by `/fact-finder` (QA mode) and read by human review and `/planner`. That remains true after this plan, so the parent DOX file needs no edit.
- **Evidence:** `thoughts/shared/AGENTS.md:25`
- **Excerpt:**
  ```markdown
  | `qa/` | `/fact-finder` (QA mode) | human review, `/planner` (QA plans) |
  ```

## Inherited Constraints (Respected)

None. The fact report's `## Inherited Constraints (Treated as Fixed)` section reads `None` — no epic or feature brief exists for this work, and `upstream-artifact:` is `none`.

## Goals / Non-Goals

**Goals**
- Make `/fact-finder:83`'s load instruction executable by removing the flag that blocks it (Q-01).
- Make every QA report detectable by `/planner:499` and compliant with `qa/AGENTS.md:15-23`: real frontmatter, `message_type` in it, `upstream-artifact: none` present so `/planner:479-482` does not hunt for an epic (Q-02, Q-03, Q-04).
- Give every finding a `Verify:` field carrying a literal command or the `none — requires review` literal, so `/planner` lifts rather than invents (Q-05).
- Bring `clean-code` to the sibling report shape and the shared severity vocabulary (Q-06, Q-07).
- Pin the four lens tokens and state each in its own skill (Q-08, Q-09).
- Give the four skills one verification heading and make `/planner` cite it by name (Q-10, Q-12).
- Delete envelope fields with no reader and auditor names no skill bears (Q-13, Q-14).
- Correct the baseline blocks' phase annotations, the unbracketed scope alternation, the missing delegation block, and the `qa/AGENTS.md` finding-element list (Q-11, Q-15, Q-16, Q-17).

**Non-Goals**
- **Q-18 is deliberately left unaddressed.** The SessionStart hook still names none of the four skills. The user chose "Remove the flag" over "Remove it and name them in the hook", so discoverability of the QA skills continues to rest on `CLAUDE.md:103-106` and `README.md:120-123`. This is a recorded deferral, not an oversight — see `## Approval Gate`.
- No change to the QA tool sets, thresholds, prioritization criteria, or analysis checklists. This plan repairs the handoff contracts, not the analysis.
- No change to `/implement`, `implementer-prompt.md`, `reviewer-prompt.md`, `CLAUDE.md`, `README.md`, the SessionStart hook, or the seven `references/` files.
- No `dist/` regeneration.

## Approval Gate

**Three of the four Phase 3 triggers apply. This plan stops here for approval before `/implement` runs.**

**1. Changes a contract with more than one reader.** The QA report format is parsed by `/planner:499` and declared by `qa/AGENTS.md:15-23`; the verification heading is cited by `/planner:822,828`. Six files must land together or the contract half-lands and fails silently, exactly as `CLAUDE.md:75-79` warns.
> **Question:** confirm the six-file set lands as one plan, and confirm the heading string `## Baseline Verification Commands` as the single name across all four skills — with `clean-code` keeping its own numbering as `## Section 4: Baseline Verification Commands` so the shared phrase stays greppable without renumbering its other eight sections.

**2. Edits files that define the executing orchestrator's own behaviour.** PLAN-005 edits `.claude/skills/planner/SKILL.md`. `/implement` reads that file in Pre-Flight step 4, but only on the branch where no STATE file exists — and this plan ships a STATE file, so that branch is dead for this run. `CLAUDE.md`'s Red Flag and `/implement:278-280` both permit the edit when a task in the plan says to, which PLAN-005 does.
> **Question:** confirm proceeding on that basis. If you would rather isolate it, PLAN-005 can be split into its own plan run after this one.

**3. Leaves a finding deliberately unaddressed.** Q-18 — the SessionStart hook names none of the four skills — is in Non-Goals per your Q-01 choice.
> **Question:** confirm Q-18 stays open.

**Trigger 4 considered and not applicable.** This plan does not reverse a recorded deferral. `2026-07-29-Phase-Two-Skills-Repair.md:81,118` deferred the QA skills *to a follow-up plan*; this is that follow-up, so it fulfils the deferral rather than reversing it.

## Design Overview

- **One task per file, six tasks, two waves.** Every finding is confined to one of six files, and the same-file rule collapses all edits to a file into one task with a numbered instruction. No file appears in two tasks.
- **Wave 1 — the four QA skills.** They establish the conventions: frontmatter shape, `Verify:` field, lens token, verification heading. Their `File(s)` sets are pairwise disjoint, so four implementers run concurrently under the cap of five.
- **Wave 2 — the two describing files.** `/planner`'s pointer and `qa/AGENTS.md`'s declaration describe what wave 1 implements. Sequencing them second means a wave-1 escalation cannot leave them describing a shape that was not built.
- **Data flow after this plan:** a QA skill writes `thoughts/shared/qa/YYYY-MM-DD-<Target>-<Lens>.md` with frontmatter carrying `message_type: QA_REPORT` and `upstream-artifact: none` → `/planner` Phase 1 reads `upstream-artifact` and does not glob for an epic → `/planner:493-511` detects the QA report on both methods → per-finding `Verify:` commands are lifted into PLAN task `Verify:` fields → `/implement` runs the fast path where the command asserts content, and the plan's `## Baseline Verification` block once after the final wave.
- **`clean-code` after this plan** carries the same three handoff sections as its siblings and the same four severity words, while keeping `CLEAN-XXX` ids (which never collide with `QA-XXX` or `LOGIC-XXX`, since `/fact-finder:92` pairs a language skill with `clean-code` or `logic-bugs-qa`, never `python-qa` with `typescript-qa`).

## Execution Waves

| Wave | Tasks | Files touched | Rationale |
|---|---|---|---|
| 1 | PLAN-001, PLAN-002, PLAN-003, PLAN-004 | `.claude/skills/python-qa/SKILL.md`, `.claude/skills/typescript-qa/SKILL.md`, `.claude/skills/logic-bugs-qa/SKILL.md`, `.claude/skills/clean-code/SKILL.md` | Four disjoint files, no task consumes another's output. Four concurrent implementers, under the cap of five. |
| 2 | PLAN-005, PLAN-006 | `.claude/skills/planner/SKILL.md`, `thoughts/shared/qa/AGENTS.md` | Both describe the conventions wave 1 establishes. Disjoint from each other and from wave 1. |

Tasks in the same wave run concurrently. No path appears twice within a wave.

**Wave self-check.** Wave 1 paths: `python-qa/SKILL.md`, `typescript-qa/SKILL.md`, `logic-bugs-qa/SKILL.md`, `clean-code/SKILL.md` — four paths, no repeat, all `allowedAdjacentEdits: none`. Wave 2 paths: `planner/SKILL.md`, `qa/AGENTS.md` — two paths, no repeat, all `allowedAdjacentEdits: none`. No path appears in both waves.

## Implementation Instructions (For Implementor)

**The report template shape all four skills converge on.** Wave-1 tasks each rewrite their `Report Template` section so the written artifact has this shape. Frontmatter first, findings next, audit trail last:

```markdown
---
date: YYYY-MM-DD
message_type: QA_REPORT
target: "[module or file name]"
status: complete
upstream-artifact: none
---

# [Lens] QA Analysis: [Target]

## Scan Metadata
## Executive Summary
## Automated Tool Findings
## Manual Quality Analysis
## Improvement Plan (For Implementor)
## Acceptance Criteria
## Implementor Checklist

## Audit Trail
### Target Discovery
### Tool Versions and Commands
### Delegation Log
### Prioritization Reasoning
```

No `<thinking>` or `<answer>` tags anywhere. Frontmatter carries exactly those five keys. The `## Audit Trail` subsections are the demoted Phase 1–5 content, keeping their existing body text; where a skill has no counterpart for a subsection, omit that subsection rather than inventing one.

---

- **Action ID:** PLAN-001
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `.claude/skills/python-qa/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Delete line 4, `disable-model-invocation: true`. Leave the other three frontmatter keys untouched.
  2. At line 70, change the write path to `thoughts/shared/qa/YYYY-MM-DD-[Target]-Python.md` and state that `-Python` is this skill's lens token.
  3. Restructure the report template (lines 72-286) to the shape given above: delete the `<thinking>`, `</thinking>`, `<answer>` and `</answer>` tags; put the five-key frontmatter at the top; keep `## Scan Metadata` through `## Implementor Checklist` in the order shown; move the Phase 1-5 content below them under `## Audit Trail`, as `### Target Discovery`, `### Tool Versions and Commands`, `### Delegation Log`, `### Prioritization Reasoning`.
  4. In that frontmatter, delete `message_id`, `correlation_id`, `timestamp`, `qa_agent`, `qa_agent_version`, `target_path`, `target_type`, `overall_status`, the four `*_issues` counts, `tools_used` and `tools_unavailable`. The five keys listed in the shape block are the whole frontmatter; the counts already appear in `## Executive Summary` and the tool lists in `## Scan Metadata`.
  5. At the `## Scan Metadata` line that reads `- Auditor: python-qa-thorough`, change the value to `python-qa`. No skill named `python-qa-thorough` exists.
  6. In the `### QA-001: [Issue Title]` finding template, add a `- **Verify**: [\`command\` → expected result, or \`none — requires review\`]` line immediately after `- **Done When**:`. Add one sentence above the template stating that the command must assert content, and that judgment-heavy findings take the literal `none — requires review` so `/planner` can lift the field verbatim.
  7. In `## Baseline Verification Commands`, delete the four `# Should pass after Phase N` comments. Replace the section's lead-in so it states that the block asserts the end state after every phase has landed, because `/implement` runs it once after the final wave.
- **Interfaces / Pseudocode:** frontmatter keys are exactly `date`, `message_type`, `target`, `status`, `upstream-artifact`. The lens literal is `-Python`. The review literal is `none — requires review`.
- **Evidence:** `.claude/skills/python-qa/SKILL.md:70-74`
- **Excerpt:**
  ```markdown
  Write to `thoughts/shared/qa/YYYY-MM-DD-[Target].md` using this exact template:

  ```markdown
  <thinking>
  ## Phase 1: Target Discovery
  ```
- **Done When:** the frontmatter carries no `disable-model-invocation`; the file contains no `<thinking>`, `<answer>`, `message_id`, `correlation_id`, `qa_agent` or `thorough` token; the write path carries the `-Python` lens; the template has frontmatter above the title and an `## Audit Trail` section below the checklist; the finding template has a `**Verify**:` line; and no `Should pass after Phase` comment remains.
- **Verify:** `! grep -qE 'disable-model-invocation|<thinking>|<answer>|message_id|correlation_id|qa_agent|thorough|Should pass after Phase' .claude/skills/python-qa/SKILL.md && grep -q 'Target\]-Python' .claude/skills/python-qa/SKILL.md && grep -q '^## Audit Trail' .claude/skills/python-qa/SKILL.md && grep -q '^upstream-artifact: none' .claude/skills/python-qa/SKILL.md && grep -q '\*\*Verify\*\*:' .claude/skills/python-qa/SKILL.md` → exit 0
- **Context:** Q-01, Q-02, Q-04, Q-05, Q-08, Q-11, Q-13, Q-14. This file is the template the other two language-shaped skills mirror, so its shape sets the pattern. The frontmatter is what `/planner:499` detects on and `qa/AGENTS.md:15-23` requires; `upstream-artifact: none` is what stops `/planner:479-482` globbing for an epic that does not exist. Expect the review path rather than the fast path — the diff is far over 20 lines.

---

- **Action ID:** PLAN-002
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `.claude/skills/typescript-qa/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Delete line 4, `disable-model-invocation: true`.
  2. At line 68, change the write path to `thoughts/shared/qa/YYYY-MM-DD-[Target]-TypeScript.md` and state that `-TypeScript` is this skill's lens token.
  3. Restructure the report template (lines 70-314) to the shape given above, exactly as PLAN-001 does for `python-qa`: tags deleted, five-key frontmatter on top, Phase 1-5 content demoted under `## Audit Trail`.
  4. Delete the same dead frontmatter keys PLAN-001 deletes: `message_id`, `correlation_id`, `timestamp`, `qa_agent`, `qa_agent_version`, `target_path`, `target_type`, `overall_status`, the four `*_issues` counts, `tools_used`, `tools_unavailable`.
  5. Change `- Auditor: typescript-qa-thorough` to `- Auditor: typescript-qa`.
  6. Add the `- **Verify**:` line to the `### QA-001: [Issue Title]` finding template, with the same one-sentence rule as PLAN-001.
  7. In `## Baseline Verification Commands`, delete the four `# Should pass after Phase N` comments and restate the lead-in as the end-state assertion.
  8. Add a fourth delegation block to the `## Delegation` section (lines 41-64) for `web-search-researcher`, modelled on `python-qa:61-66`, so the section declares the agent its own report template logs at lines 158-161.
- **Interfaces / Pseudocode:** the lens literal is `-TypeScript`. The new delegation block uses `subagent_type: "web-search-researcher"` and a prompt ending "Verify against authoritative sources."
- **Evidence:** `.claude/skills/typescript-qa/SKILL.md:158-161`
- **Excerpt:**
  ```markdown
  4. **web-search-researcher**:
     - Task: Research [topic]
     - Response: [confidence level + sources]
     - Key findings: [summary]
  ```
- **Done When:** as PLAN-001's condition, with the `-TypeScript` lens; plus the `## Delegation` section contains a `web-search-researcher` block.
- **Verify:** `! grep -qE 'disable-model-invocation|<thinking>|<answer>|message_id|correlation_id|qa_agent|thorough|Should pass after Phase' .claude/skills/typescript-qa/SKILL.md && grep -q 'Target\]-TypeScript' .claude/skills/typescript-qa/SKILL.md && grep -q '^## Audit Trail' .claude/skills/typescript-qa/SKILL.md && grep -q '^upstream-artifact: none' .claude/skills/typescript-qa/SKILL.md && grep -q '\*\*Verify\*\*:' .claude/skills/typescript-qa/SKILL.md && grep -q 'subagent_type: "web-search-researcher"' .claude/skills/typescript-qa/SKILL.md` → exit 0
- **Context:** Q-01, Q-02, Q-04, Q-05, Q-08, Q-09, Q-11, Q-13, Q-14, Q-16. `-TypeScript` is the one lens token stated nowhere in the repo — the other three are recoverable from examples at `/fact-finder:94,638` and `qa/AGENTS.md:13`. This task is the near-twin of PLAN-001; the transformation is the same, on a file with one extra delegation block to add.

---

- **Action ID:** PLAN-003
- **Wave:** 1
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `.claude/skills/logic-bugs-qa/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Delete line 4, `disable-model-invocation: true`.
  2. At line 211, change the write path to `thoughts/shared/qa/YYYY-MM-DD-[Target]-Bugs.md` and state that `-Bugs` is this skill's lens token.
  3. Restructure the report template (lines 213-473) to the shape given above. This skill's Phase 2 is a behavioural baseline rather than tool execution, so its `## Audit Trail` subsections are `### Target Discovery`, `### Baseline Verification`, `### Logic Analysis`, `### Delegation Log`, `### Prioritization Reasoning`. Keep `## Test Suite Baseline` in the findings half where it is — it is a finding, not audit trail.
  4. Delete `message_id`, `correlation_id`, `timestamp`, `qa_agent`, `qa_agent_version`, `target_path`, `target_type`, `overall_status`, the four `*_issues` counts and `analysis_categories` from the frontmatter, leaving the five keys.
  5. In the `### LOGIC-001: [Issue Title]` finding template, replace `- **Done When**: All tests pass + new test case added` with a `- **Done When**:` carrying the observable condition and a new `- **Verify**:` line below it. Keep the existing `- **Test Case**:` field — it names the input that reproduces the finding, which is what the `Verify:` command runs against.
  6. Merge the two verification sections. Keep `## Baseline Verification Commands` at line 98 with its six per-language blocks; delete `## Verification Commands for Planner` at lines 475-489 entirely; fold its only unique content — that logic findings are verified by tests rather than linters, and that coverage should rise for fixed paths — into one sentence in the surviving section. Restate the lead-in as the end-state assertion.
  7. At line 174, bracket the scope alternation: `Output scope: [comprehensive | focused | execution_only]`, so the line reads as a placeholder rather than three values to send.
- **Interfaces / Pseudocode:** the lens literal is `-Bugs`. The surviving heading is `## Baseline Verification Commands`. Accepted analyzer scopes per `codebase-analyzer.md:44-54` are `execution_only`, `focused`, `comprehensive`.
- **Evidence:** `.claude/skills/logic-bugs-qa/SKILL.md:174`
- **Excerpt:**
  ```markdown
    prompt: "Trace [function] in [file]. Output scope: comprehensive | focused | execution_only."
  ```
- **Done When:** the frontmatter carries no `disable-model-invocation`; no `<thinking>`, `<answer>`, `message_id`, `correlation_id` or `qa_agent` token remains; the write path carries `-Bugs`; `## Audit Trail` exists; `## Verification Commands for Planner` no longer exists while `## Baseline Verification Commands` does; the finding template has a `**Verify**:` line; and line 174's scope alternation is bracketed.
- **Verify:** `! grep -qE 'disable-model-invocation|<thinking>|<answer>|message_id|correlation_id|qa_agent' .claude/skills/logic-bugs-qa/SKILL.md && ! grep -q '^## Verification Commands for Planner' .claude/skills/logic-bugs-qa/SKILL.md && grep -q '^## Baseline Verification Commands' .claude/skills/logic-bugs-qa/SKILL.md && grep -q 'Target\]-Bugs' .claude/skills/logic-bugs-qa/SKILL.md && grep -q '^## Audit Trail' .claude/skills/logic-bugs-qa/SKILL.md && grep -q 'Output scope: \[comprehensive | focused | execution_only\]' .claude/skills/logic-bugs-qa/SKILL.md && grep -q '\*\*Verify\*\*:' .claude/skills/logic-bugs-qa/SKILL.md` → exit 0
- **Context:** Q-01, Q-02, Q-04, Q-05, Q-08, Q-12, Q-13, Q-15. This is the only skill with two competing verification sections, and the only one whose findings are verified by tests rather than linters — which is why its `Test Case:` field survives while the others gain nothing equivalent.

---

- **Action ID:** PLAN-004
- **Wave:** 1
- **Model:** opus
- **Change Type:** modify
- **File(s):** `.claude/skills/clean-code/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. Delete line 4, `disable-model-invocation: true`.
  2. At line 449, change the write path to `thoughts/shared/qa/YYYY-MM-DD-[Target]-Design.md` and state that `-Design` is this skill's lens token. This matches the suffixed example already at lines 737-745, which the unsuffixed line at 449 has been contradicting.
  3. Restructure the report template (lines 451-730) to the shape given above. Reconcile the two `---` blocks into one frontmatter with the five keys: keep the outer block's position, add `message_type: QA_REPORT` and `upstream-artifact: none`, and delete the inner block at lines 541-553 along with `message_id`, `auditor`, `language`, `total_issues` and `p1_count`…`p4_count`. Delete the `<thinking>`/`<answer>` tags. Demote the Phase 1-4 content to `## Audit Trail` subsections `### Target Discovery`, `### Tool Versions and Commands`, `### Manual Analysis`, `### Prioritization Reasoning`.
  4. Relabel the four tiers in `## Section 5: Prioritization Rules` (lines 348-425) from `P1 (Critical)`, `P2 (High)`, `P3 (Medium)`, `P4 (Low)` to `Critical`, `High`, `Medium`, `Low`, dropping the P-prefix and the parentheses. Update every downstream reference to a P-tier in the file, including the report template's `## Critical Findings (P1)` and `## High Priority (P2)` headings and the `p1_count` style prose. Keep the `CLEAN-XXX` finding ids unchanged.
  5. Add the three handoff sections the siblings carry and this file lacks, positioned per the shape block: `## Improvement Plan (For Implementor)`, carrying the `CLEAN-XXX` findings in the sibling field order with `Priority`, `Category`, `File(s)`, `Issue`, `Evidence`, `Recommendation`, `Done When` and `Verify`; `## Acceptance Criteria`, as a checklist of externally observable conditions derived from the findings; and `## Implementor Checklist`, one `- [ ] CLEAN-XXX:` line per finding. The existing `## Recommendations for Next Steps`, `## Metrics Summary` and `## Code Smells Detected` sections stay — they carry content the siblings have no counterpart for.
  6. Convert `## Section 4: Verification Commands for Planner` (line 265) to `## Section 4: Baseline Verification Commands`, preserving the `Section 4:` prefix so the file's own nine-section numbering survives while the shared phrase becomes greppable. Fold the Quantitative and Qualitative subsections into the per-finding `Verify:` field vocabulary: a quantitative entry becomes a literal command plus expected result, and every "Done When: Code review confirms …" entry becomes the literal `none — requires review`.
  7. Update the `## Section 8: Integration with QA Workflow` usage pattern at lines 736-753 if any part of it still describes the pre-change shape.
- **Interfaces / Pseudocode:** frontmatter keys are exactly `date`, `message_type`, `target`, `status`, `upstream-artifact`. The lens literal is `-Design`. Severity words are `Critical`, `High`, `Medium`, `Low`. Finding ids stay `CLEAN-XXX`. The review literal is `none — requires review`.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:352`
- **Excerpt:**
  ```markdown
  ### P1 (Critical) - Immediate Action Required

  **Criteria**: Issues causing active maintenance burden or high bug risk
  ```
- **Done When:** no `disable-model-invocation`, `<thinking>`, `<answer>` or `message_id` token remains; exactly one `---` frontmatter block precedes the report body and it carries all five keys; no `P1`, `P2`, `P3`, `P4` or `p1_count` token remains; `## Improvement Plan (For Implementor)`, `## Acceptance Criteria` and `## Implementor Checklist` all exist; `## Section 4: Baseline Verification Commands` exists; the write path carries `-Design`; and `CLEAN-` ids are still present.
- **Verify:** `! grep -qE 'disable-model-invocation|<thinking>|<answer>|message_id|\bP[1-4]\b|p[1-4]_count' .claude/skills/clean-code/SKILL.md && grep -q '^## Improvement Plan (For Implementor)' .claude/skills/clean-code/SKILL.md && grep -q '^## Acceptance Criteria' .claude/skills/clean-code/SKILL.md && grep -q '^## Implementor Checklist' .claude/skills/clean-code/SKILL.md && grep -q '^## Section 4: Baseline Verification Commands' .claude/skills/clean-code/SKILL.md && grep -q 'Target\]-Design' .claude/skills/clean-code/SKILL.md && grep -q '^## Audit Trail' .claude/skills/clean-code/SKILL.md && grep -q 'CLEAN-' .claude/skills/clean-code/SKILL.md` → exit 0
- **Context:** Q-01, Q-02, Q-03, Q-04, Q-05, Q-06, Q-07, Q-08, Q-10, Q-13. This is the only `opus` task in the plan. It is not a mirror of its siblings: it adds three sections that do not exist rather than restructuring three that do, it must author acceptance criteria for a design-lens audit where no template exists to copy, and it must relabel a tier vocabulary that threads through 787 lines including a nine-section numbering scheme it has to leave intact. `/implement:246` warns that an overwhelmed `haiku` reports `DONE` on a plausible wrong implementation rather than `BLOCKED`, which is the failure mode this task is most exposed to.

---

- **Action ID:** PLAN-005
- **Wave:** 2
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `.claude/skills/planner/SKILL.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. At line 822, replace `Commands from [language]-qa skill Section 4:` with a pointer that cites the heading by name — the loaded QA skill's `## Baseline Verification Commands` section.
  2. At line 828, replace `Refer to the skill's Section 4 for the complete verification command set.` with the same heading-name pointer.
  3. Add one sentence to the same `## Baseline Verification` block stating that the commands assert the end state after all phases, because `/implement` runs the block once after the final wave — not per phase.
- **Interfaces / Pseudocode:** the heading string to cite is `## Baseline Verification Commands`. Note that `clean-code` prefixes it `## Section 4: ` for its internal numbering, so the pointer must name the phrase rather than require an exact line match.
- **Evidence:** `.claude/skills/planner/SKILL.md:820-828`
- **Excerpt:**
  ```markdown
  Commands from [language]-qa skill Section 4:

  ```bash
  [Insert verification commands from loaded QA skill]
  ```

  **Note:** The specific verification tools and commands are provided by the loaded QA skill for the target language. Refer to the skill's Section 4 for the complete verification command set.
  ```
- **Done When:** neither occurrence of `Section 4` remains in the file, and the `## Baseline Verification` block cites `Baseline Verification Commands` by name.
- **Verify:** `! grep -q 'Section 4' .claude/skills/planner/SKILL.md && grep -q 'Baseline Verification Commands' .claude/skills/planner/SKILL.md` → exit 0
- **Context:** Q-10. Before wave 1 this pointer resolved in exactly one of four skills, and not in either of the two the phrase `[language]-qa` names. This is the one task that edits a file `/implement` can read while running — Pre-Flight step 4's create-STATE branch — which is why it carries an Approval Gate question. The branch is dead for this run because the plan ships a STATE file.

---

- **Action ID:** PLAN-006
- **Wave:** 2
- **Model:** haiku
- **Change Type:** modify
- **File(s):** `thoughts/shared/qa/AGENTS.md`
- **allowedAdjacentEdits:** none
- **Instruction:**
  1. In **Required frontmatter** (lines 15-23), add `upstream-artifact: none` as a fifth key, so the DOX contract declares the field the four skills now emit and `/planner:479-482` reads.
  2. At line 29, replace `- Each finding includes: description, location, severity, and reproduction path` with the elements the templates actually produce: description, location as `file:line`, severity, a 1-6 line excerpt, and a `Verify` command or the `none — requires review` literal. Do not add a reproduction-path field to the templates; only `logic-bugs-qa` findings have reproductions, and it carries them in its own `Test Case:` field.
  3. Add one line to **Local Contracts** naming the four lens tokens: `-Python`, `-TypeScript`, `-Design`, `-Bugs`. Line 13 currently gives three as examples and omits `-TypeScript`.
  4. Add one line to **Verification** stating that a valid report's frontmatter carries all five keys, so the directory's own validity rule covers what `/planner:499` detects on.
- **Interfaces / Pseudocode:** the five frontmatter keys are `date`, `message_type`, `target`, `status`, `upstream-artifact`. The four lens tokens are `-Python`, `-TypeScript`, `-Design`, `-Bugs`.
- **Evidence:** `thoughts/shared/qa/AGENTS.md:25-29`
- **Excerpt:**
  ```markdown
  **Report structure** (follows the loaded QA skill's template):
  - Automated tool output summary (linter warnings, type errors, test results)
  - Issue classification by severity (critical / high / medium / low)
  - Manual analysis findings with file:line evidence
  - Each finding includes: description, location, severity, and reproduction path
  ```
- **Done When:** `reproduction path` no longer appears; the required-frontmatter block lists `upstream-artifact`; all four lens tokens including `-TypeScript` appear; and the Verification section names the five-key requirement.
- **Verify:** `! grep -q 'reproduction path' thoughts/shared/qa/AGENTS.md && grep -q 'upstream-artifact' thoughts/shared/qa/AGENTS.md && grep -q -- '-TypeScript' thoughts/shared/qa/AGENTS.md && grep -q -- '-Design' thoughts/shared/qa/AGENTS.md && grep -q -- '-Bugs' thoughts/shared/qa/AGENTS.md && grep -q -- '-Python' thoughts/shared/qa/AGENTS.md` → exit 0
- **Context:** Q-04, Q-09, Q-17. This is the DOX contract for the directory the four skills write into, so it is the file that makes the new frontmatter normative rather than merely conventional. Per `CLAUDE.md`'s DOX rule this is the owning `AGENTS.md` for `thoughts/shared/qa/`; `thoughts/shared/AGENTS.md:25` needs no change because its `qa/` row stays accurate.

## Verification Tasks (If Assumptions Exist)

None. Every claim in `## Verified Current State` carries a `Read`-verified citation, and the fact report's one open scope question (its Open Question 6, on the seven `references/` files) was closed during Phase 2 — see the scope-boundary facts above.

## Acceptance Criteria

Checkable from the finished tree by `/implement` after wave 2:

- [ ] `grep -rl 'disable-model-invocation' .claude/skills/` returns no QA skill — only `claude-code-extensions/SKILL.md`, which documents the field generically.
- [ ] No QA skill contains a `<thinking>` or `<answer>` tag: `! grep -lE '<thinking>|<answer>' .claude/skills/{python-qa,typescript-qa,logic-bugs-qa,clean-code}/SKILL.md`.
- [ ] Each of the four skills' report templates begins its frontmatter with the five keys `date`, `message_type`, `target`, `status`, `upstream-artifact`, and each carries `message_type: QA_REPORT`.
- [ ] Each of the four skills states its own lens token in its write path: `-Python`, `-TypeScript`, `-Bugs`, `-Design` respectively.
- [ ] Each of the four skills' finding templates carries a `**Verify**:` field, and the `none — requires review` literal appears in each.
- [ ] All four skills carry a heading containing the phrase `Baseline Verification Commands`, and `logic-bugs-qa` no longer carries `## Verification Commands for Planner`.
- [ ] No QA skill contains the token `thorough`, `message_id`, `correlation_id`, `qa_agent` or `qa_agent_version`.
- [ ] `clean-code` carries `## Improvement Plan (For Implementor)`, `## Acceptance Criteria` and `## Implementor Checklist`, retains `CLEAN-` ids, and contains no `P1`/`P2`/`P3`/`P4` or `p1_count`-style token.
- [ ] `.claude/skills/planner/SKILL.md` contains no `Section 4` and does contain `Baseline Verification Commands`.
- [ ] `thoughts/shared/qa/AGENTS.md` contains no `reproduction path`, and does contain `upstream-artifact` plus all four lens tokens.
- [ ] `.claude/hooks/session-start | python3 -m json.tool` still emits valid JSON — the hook is untouched, so this confirms nothing regressed in it.
- [ ] Q-18 remains open by design: `! grep -qE 'clean-code|python-qa|typescript-qa|logic-bugs-qa' .claude/hooks/session-start` still holds.

## Implementor Checklist

### Wave 1
- [ ] PLAN-001: Restructure python-qa — flag, frontmatter, Verify field, lens, baseline
- [ ] PLAN-002: Restructure typescript-qa — same, plus the missing delegation block
- [ ] PLAN-003: Restructure logic-bugs-qa — same, plus merge two verification sections
- [ ] PLAN-004: Converge clean-code — sections, severity vocabulary, single frontmatter

### Wave 2
- [ ] PLAN-005: Point planner at the verification heading by name
- [ ] PLAN-006: Update the qa/ DOX contract to the new frontmatter and lens tokens
