---
date: 2026-07-29
fact-finder: claude-opus-5
topic: "Phase-Two Skills Defects (fact-finder, planner, implement)"
status: complete
coverage:
  - .claude/skills/fact-finder/SKILL.md (full read, 700 lines)
  - .claude/skills/planner/SKILL.md (full read, 792 lines)
  - .claude/skills/implement/SKILL.md (full read, 269 lines)
  - .claude/skills/implement/implementer-prompt.md (full read, 77 lines)
  - .claude/skills/implement/reviewer-prompt.md (full read, 77 lines)
  - .claude/skills/specifier/SKILL.md, epic-planner/SKILL.md, feature-architect/SKILL.md (upstream contracts, via codebase-analyzer)
  - .claude/agents/{thoughts-locator,codebase-locator,codebase-analyzer,web-search-researcher}.md (parameter contracts, via codebase-analyzer + Read)
  - thoughts/shared/plans/2026-07-29-{Inherited-Constraints-Chain,Large-Feature-Routing,Upstream-Skills-Fixes}.md + STATE files (via thoughts-analyzer)
  - git behaviour of `git status --porcelain` on untracked directories (empirical, throwaway repo)
---

# Research: Phase-Two Skills Defects (fact-finder, planner, implement)

## Executive Summary

- The `## Inherited Constraints` chain built by three plans dated 2026-07-29 terminates at `/fact-finder`'s **intake** table. `/fact-finder`'s **output** template has no section for those constraints, and `/planner` ingests the fact report by three named headings, none of which is a constraint section.
- `/planner` reads no epic. Four epic sections are named for downstream readers (`Research Questions for Fact-Finder`, `Acceptance Criteria for Planner`, `Implementation Considerations (For Planner)`, `Verification Plan (For Implementor)`); of the three addressed to `/planner` and `/implement`, none is read by the skill it names.
- One of these gaps was a recorded deferral (`Acceptance Criteria for Planner`, at `2026-07-29-Inherited-Constraints-Chain.md:87`). The rest appear in no plan in that set: greps for `inferred`, `TMPDIR`, `Boundary Check`, and `branch` across all four documents return zero hits.
- `/fact-finder` states a mandatory `Read`-verification step and then twice states that re-reading is not needed for the two subagents that supply most findings.
- `/fact-finder` documents three subagent parameters that diverge from the agents' own declarations: a `surface` scope value that `codebase-analyzer` does not declare, and `thoughts-locator` savings percentages and category enumeration that do not match `thoughts-locator.md`.
- `/planner`'s section titled "Delegating to web-search-researcher for API Validation" contains a `codebase-locator` response contract in its body; `/planner` declares no `web-search-researcher` response format while requiring URL-form evidence from it.
- `/implement`'s Boundary Check reports a newly created directory as the single path `newdir/` (verified empirically), which matches no declared `File(s)` entry; the response prescribed for an unmatched path is discarding the change.
- `/implement` writes its Boundary Check baseline to `$TMPDIR` without a fallback, runs the check before the review gate's fix re-dispatches, and carries a `main`/`master` prohibition that no Pre-Flight step evaluates.

## Coverage Map

Personally inspected with `Read`:

- `.claude/skills/fact-finder/SKILL.md` — full file, 700 lines
- `.claude/skills/planner/SKILL.md` — full file, 792 lines
- `.claude/skills/implement/SKILL.md` — full file, 269 lines
- `.claude/skills/implement/implementer-prompt.md` — full file, 77 lines
- `.claude/skills/implement/reviewer-prompt.md` — full file, 77 lines
- `.claude/agents/codebase-analyzer.md:36-61` — scope semantics
- `.claude/agents/thoughts-locator.md:96-123` — output template headings
- `thoughts/shared/facts/AGENTS.md` — full file, local contract for this report

Inspected via subagent, with excerpts returned and cited below:

- `.claude/skills/{specifier,epic-planner,feature-architect}/SKILL.md` — downstream-reader promises (`codebase-analyzer`)
- `.claude/agents/{thoughts-locator,codebase-locator,codebase-analyzer,web-search-researcher}.md` — full parameter contracts (`codebase-analyzer`)
- `thoughts/shared/plans/2026-07-29-*.md` + STATE files — Non-Goals and task coverage (`thoughts-analyzer`)

Tools run: `Read`, `Glob`/`ls`, `grep`, `git log`, `git show`, and one throwaway `git init` repository to observe `git status --porcelain` behaviour on untracked directories.

**Scope is partial in two respects.** No epic or feature brief governs this work — the user named the five target documents directly, which per `.claude/skills/fact-finder/SKILL.md:569` wins over globbing, so there is no upstream `Research Questions for Fact-Finder` checklist behind this report. Second, the QA-mode findings (F-10, F-11) were verified against `/fact-finder`'s and `/planner`'s own text only; the four QA skills (`python-qa`, `typescript-qa`, `clean-code`, `logic-bugs-qa`) were not read, so what those skills state about their own report count and filenames is unverified here (see Open Questions).

## Critical Findings (Verified, Planner Attention Required)

### F-01 — The inherited-constraints chain has no output section at its terminus

- **Observation:** `/fact-finder`'s intake table gained an `Inherited Constraints` row for epics and for feature briefs. Its output template names seven sections, none of which is a constraint section: Executive Summary, Coverage Map, Critical Findings, Detailed Technical Analysis, Verification Log, Open Questions / Unverified Claims, References.
- **Direct consequence:** A constraint that reaches `/fact-finder` has no declared place in the artifact `/fact-finder` writes. `/planner` reads the fact report by three named headings (F-02), so a constraint recorded outside those headings is not part of what `/planner` is directed to extract.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:576-580` (intake) and `:662-695` (output template)
- **Excerpt:**
  ```markdown
   | Epic | **Dependencies** | which epics must exist first |
   | Epic | **Inherited Constraints** | what to treat as fixed rather than investigate |
   | Feature brief | **Open Questions for Fact-Finder** | your starting research vectors |
  ```
- **Excerpt (output template heading list, `:662-684`):**
  ```markdown
  ## Executive Summary
  ## Coverage Map
  ## Critical Findings (Verified, Planner Attention Required)
  ## Detailed Technical Analysis (Verified)
  ## Verification Log
  ## Open Questions / Unverified Claims
  ```
- **Cross-reference:** `.claude/skills/epic-planner/SKILL.md:230` states the epic section exists for this reader. `.claude/skills/specifier/SKILL.md:98` states a constraint recorded elsewhere "does not travel".

### F-02 — `/planner` reads no epic; three epic sections addressed to it and to `/implement` have no reader

- **Observation:** `/planner`'s Phase 1 directs it to read the user request and the latest fact report, extracting three named headings. The string `epics/` does not appear in `planner/SKILL.md`; neither does `Acceptance Criteria for Planner`, `Implementation Considerations`, nor `Inherited Constraints`. The epic appears only as an optional aside for "extension planning" at `:267-276` and `:371`. The plan template's `## Inputs` names the fact report and a user-request summary.
- **Direct consequence:** Four epic sections are named for downstream stages; the one addressed to `/fact-finder` is read (F-24), and the three addressed to `/planner` and `/implement` are not. The plan artifact records no link to the epic it derives from, so the traceability path mission → spec → epic stops before the plan.
- **Evidence:** `.claude/skills/planner/SKILL.md:19-21` (ingestion contract), `:531-533` (plan Inputs)
- **Excerpt (`:19-21`):**
  ```markdown
  1. **Ingest Research First**
     - You MUST begin by reading the most recent Fact-Finder report in `thoughts/shared/facts/`.
     - Extract, by the report's actual section headings: (a) `## Critical Findings (Verified, Planner Attention Required)`, (b) `## Coverage Map`, (c) `## Open Questions / Unverified Claims`. Deeper detail sits in `## Detailed Technical Analysis (Verified)`.
  ```
- **Excerpt (`:531-533`):**
  ```markdown
  ## Inputs
  - Fact report(s) used: `thoughts/shared/facts/...`
  - User request summary: ...
  ```
- **Cross-reference (the sections that name it):** `.claude/skills/epic-planner/SKILL.md:236` `## Acceptance Criteria for Planner`; `:309` `## Implementation Considerations (For Planner)`; `:329` `## Verification Plan (For Implementor)`; `:253` `**Output Expected**: Implementation plan(s) in thoughts/shared/plans/...`.
- **Prior disposition:** one third of this was a recorded deferral, not an oversight. `thoughts/shared/plans/2026-07-29-Inherited-Constraints-Chain.md:87` reads: `- No change to /planner or /implement. The review's separate finding that Acceptance Criteria for Planner has no named reader is a planner-side gap, deliberately out of scope here.` The other two sections (`Implementation Considerations`, `Verification Plan`) are named in no plan in that set.

### F-03 — The `inferred` marking has no reader

- **Observation:** `/feature-architect` defines a per-row `inferred — <what from>` value in the `Source` column in six places, and states its purpose in terms of what `/fact-finder` does with it. The string `inferred` does not appear anywhere in `fact-finder/SKILL.md`. `/fact-finder`'s intake table describes the section in one clause — "what to treat as fixed rather than investigate" — with no distinction between sourced and inferred rows, and no mention of the `What it forbids or forces` column.
- **Direct consequence:** The distinction `/feature-architect` records for `/fact-finder` is not one `/fact-finder` is directed to act on. Every row is treated identically, which is what the un-sourced marking exists to prevent.
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:191` (stated purpose), `.claude/skills/fact-finder/SKILL.md:580` (the whole of what `/fact-finder` is told)
- **Excerpt (`feature-architect:191`):**
  ```markdown
  These constraints are fixed by the existing system and are NOT open for discussion. `/fact-finder` reads this section by name and treats every row as settled rather than investigating it — which is exactly why each row must carry where it came from. A constraint you inferred from a codebase scan or from the user's account, with no spec behind it, gets `inferred` in its source; the researcher can then verify that one instead of trusting it.
  ```
- **Excerpt (`feature-architect:199`):**
  ```markdown
  [Group by `Kind` for readability; every row needs a source. Where the mission or spec was missing entirely, say so once in `Assumptions` → **About the existing system** as well — but the per-row `inferred` marking is what actually travels, because that is the section `/fact-finder` reads.]
  ```
- **Prior disposition:** not mentioned in any 2026-07-29 plan; `grep -rn "inferred" thoughts/shared/plans/2026-07-29-*.md` returns nothing. The marking was introduced by `db30162` and `3537f85`, which post-date all three plans.

### F-04 — Plan-level acceptance criteria and verification sections have no reader in `/implement`

- **Observation:** The strings `Acceptance` and `Baseline Verification` do not appear anywhere in `.claude/skills/implement/` (SKILL.md or either prompt template). `/planner` writes a `## Acceptance Criteria` section into every standard plan and a `## Baseline Verification` section into every QA plan; `/epic-planner` writes `## Verification Plan (For Implementor)`. `/implement`'s per-wave loop ends at step 5 (commit and advance) with no plan-level step after the final wave.
- **Direct consequence:** Verification in `/implement` is per-task (`Verify:` commands, reviewer reports). The plan's own externally observable criteria and the QA plan's baseline command set are not evaluated at any point in the run, and no step marks the plan's acceptance criteria as met.
- **Evidence:** `.claude/skills/planner/SKILL.md:580-581` and `:699-707`; `.claude/skills/implement/SKILL.md:189-226` (step 5, the terminal step of the loop)
- **Excerpt (`planner:580-581`):**
  ```markdown
  ## Acceptance Criteria
  - Bullet list of externally observable results.
  ```
- **Excerpt (`planner:699-705`):**
  ```markdown
  ## Baseline Verification

  Commands from [language]-qa skill Section 4:

  ```bash
  [Insert verification commands from loaded QA skill]
  ```
  ```

### F-05 — The Boundary Check reports a new directory as one path, which no `File(s)` list can match

- **Observation:** The Boundary Check derives the wave's changed paths from `git status --porcelain | cut -c4-`. `git status --porcelain` reports an untracked directory as a single trailing-slash entry rather than the files inside it. Verified empirically in a throwaway repository: with `newdir/sub/file.md` and `newdir/other.md` created, `git status --porcelain` emits exactly `?? newdir/`, while `git status --porcelain -uall` emits both file paths.
- **Direct consequence:** For any task whose `Change Type: create` places a file in a directory that does not yet exist, the changed-path set contains `newdir/` while the declared set contains `newdir/other.md`. The comparison finds a path not in the declared set. The prescribed handling for that outcome is Cause A (keep, report the plan's omission) or Cause B (`git checkout --` for tracked, delete for untracked), and the diagnosis is left to the orchestrator's judgement.
- **Evidence:** `.claude/skills/implement/SKILL.md:140-144` (the command), `:152` (Cause B handling)
- **Excerpt (`:140-144`):**
  ```bash
  git status --porcelain | cut -c4- | sort | comm -13 "$TMPDIR/wave-baseline.txt" -
  ```
- **Excerpt (`:152`):**
  ```markdown
  **Cause B — scope creep.** The implementer was told to report `NEEDS_CONTEXT` rather than touch an unlisted file, and did not. **Read the change before you throw it away** — `git diff -- <path>` — then discard it: `git checkout -- <path>` for a tracked file, delete an untracked one. Note it in the wave report.
  ```
- **Empirical excerpt (throwaway repo, this session):**
  ```
  --- porcelain (default) ---
  ?? newdir/
  --- porcelain -uall ---
  ?? newdir/other.md
  ?? newdir/sub/file.md
  ```

### F-06 — The Boundary Check baseline path has no fallback for an unset `$TMPDIR`

- **Observation:** Both the baseline write (Pre-Flight step 4, and again at step 5) and the comparison read reference `"$TMPDIR/wave-baseline.txt"` with no default. The skill states no requirement that `TMPDIR` be set.
- **Direct consequence:** Where `TMPDIR` is unset, the write target resolves to `/wave-baseline.txt` and the read target to the same path. `comm` with a missing first operand produces an error rather than a path list, so the step yields no findings to diagnose. The skill states at `:254` that an undeclared path is invisible to both implementer and reviewer, making this step the only place it is detected.
- **Evidence:** `.claude/skills/implement/SKILL.md:55-57`, `:141`, `:220-222`, `:254`
- **Excerpt (`:55-57`):**
  ```bash
  git status --porcelain | cut -c4- | sort > "$TMPDIR/wave-baseline.txt"
  ```
- **Excerpt (`:254`):**
  ```markdown
  - **Never** commit a wave without running the Boundary Check — an undeclared path is invisible to both the implementer and the reviewer, so if you do not catch it, nobody does
  ```

### F-07 — The Boundary Check precedes the review gate's fix re-dispatches

- **Observation:** The per-wave loop orders the steps: 3. Boundary Check, 4. Review Gate, 5. Commit. Step 4 directs re-dispatch of the implementer for any task with SPEC ISSUES, Critical, or Important findings. No step re-runs the Boundary Check after those re-dispatches.
- **Direct consequence:** Paths introduced by a fix round enter the commit in step 5 without passing the comparison that step 3 performs. The prohibition at `:156` ("Never commit a path that no task declared") is stated for the whole wave, while the step that evaluates it runs once, before the fix rounds exist.
- **Evidence:** `.claude/skills/implement/SKILL.md:136-138` (step 3 position), `:185` (re-dispatch), `:189` (step 5)
- **Excerpt (`:185`):**
  ```markdown
  **SPEC ISSUES**, **Critical**, or **Important** must be fixed before the wave commits. Re-dispatch the implementer for that task with the listed issues, then re-run the reviewer for that task only. Repeat until it passes.
  ```

### F-08 — The `main`/`master` prohibition has no evaluation point

- **Observation:** Red Flags states "Never start on main/master without explicit user consent". Pre-Flight's eight numbered steps cover the plan file, task field extraction, the STATE file, the dirty-tree baseline, the prompt templates, the wave list, TodoWrite items, and an ambiguity check. None reads the current branch.
- **Direct consequence:** The condition is stated where the run has already begun and is evaluated at no step of the protocol. This is the same shape as the condition addressed by `0e0639a` ("Give mission-architect's greenfield rule a trigger point").
- **Evidence:** `.claude/skills/implement/SKILL.md:259` (the rule), `:28-69` (Pre-Flight, the eight steps)
- **Excerpt (`:259`):**
  ```markdown
  - **Never** start on main/master without explicit user consent
  ```

## Detailed Technical Analysis (Verified)

### `/fact-finder` — verification protocol

#### F-09 — A mandatory `Read` step and two statements that re-reading is not needed

- **Observation:** Non-Negotiable 2, Phase 2 (labelled MANDATORY), and the required `## Verification Log` section each require the fact-finder to open the referenced file itself. Two other passages state that re-reading is not needed for `codebase-analyzer` output and for `thoughts-analyzer` output.
- **Direct consequence:** The two exempted sources are the two the skill directs most findings through (`:56-58`). The file states both that every claim requires the fact-finder's own `Read` and that the excerpts from those two agents may be used without one.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:27-29`, `:589-597`, `:680-682` against `:278` and `:533`
- **Excerpt (`:589-596`):**
  ```markdown
  ### Phase 2: Verification & Synthesis (MANDATORY)

  For every candidate finding from sub-agents:

  1. **Verify with `Read`**
     - Open the referenced file(s).
     - Confirm the specific lines/constructs exist.
  ```
- **Excerpt (`:278`):**
  ```markdown
  **Important:** The codebase-analyzer provides excerpts directly in its response. You do NOT need to re-read files to obtain excerpts—extract them from the sub-agent's analysis and include them in your research report with proper attribution (file:line-line).
  ```
- **Excerpt (`:533`):**
  ```markdown
  5. **Verification**: You do NOT need to re-read the thoughts documents; thoughts-analyzer provides excerpts directly
  ```

### `/fact-finder` — QA mode

#### F-10 — QA mode states two reports and one report

- **Observation:** The QA skill-selection guidance states that a full audit loads two skills and that each writes its own report, producing two reports read together by `/planner`. The Output Format section states that exactly one report is written, to `thoughts/shared/qa/YYYY-MM-DD-[Target].md`. The filename template contains no element distinguishing one loaded skill from another. `/planner`'s QA plan template names a single QA report in its `## Inputs`.
- **Direct consequence:** Two reports for one target resolve to the same path under the stated naming rule. `thoughts/shared/AGENTS.md` records artifacts as write-once, and `Write` overwrites without prompting.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:94` against `:642-646`; `.claude/skills/planner/SKILL.md:599`
- **Excerpt (`fact-finder:94`):**
  ```markdown
  Each loaded skill writes its own report. Two skills means two reports in `thoughts/shared/qa/`, which `/planner` then reads together.
  ```
- **Excerpt (`fact-finder:642-644`):**
  ```markdown
  ### QA Mode:

  Write exactly one report to: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
  ```
- **Excerpt (`planner:599`):**
  ```markdown
  - QA report: `thoughts/shared/qa/YYYY-MM-DD-[Target].md`
  ```

#### F-11 — The `Bash` restriction and the QA phase that requires `Bash`

- **Observation:** Tools & Delegation restricts `Bash` to locating files, only when absolutely required, and only after asking permission. QA Mode Phase 2 directs the running of linters, type checkers and test runners from the loaded skill.
- **Direct consequence:** The tool QA Phase 2 depends on is restricted by the file to a different purpose, under a precondition Phase 2 does not mention.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:65` against `:100-103`
- **Excerpt (`:65`):**
  ```markdown
  - Use `Bash` only if absolutely required to locate files AND only after asking permission.
  ```
- **Excerpt (`:100-102`):**
  ```markdown
  **Phase 2: Automated Tool Execution**
  - Run automated tools from loaded QA skill (e.g., linters, type checkers, test runners) (tool names vary by language - refer to loaded skill)
  ```

### `/fact-finder` — subagent parameter contracts

#### F-12 — A `surface` output scope that `codebase-analyzer` does not declare

- **Observation:** `/fact-finder` lists three output scopes for `codebase-analyzer`, the third being `surface`. `codebase-analyzer.md` declares exactly three values — `execution_only`, `focused`, `comprehensive` — at its Output Scope Semantics section, restates that enum at `:120` and `:156`, and contains no occurrence of `surface`. Personally verified by reading `codebase-analyzer.md:36-61`.
- **Direct consequence:** A delegation specifying `surface` names a value absent from the agent's enum. The agent's stated default for an absent parameter is `comprehensive`, the largest of the three.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:255-257` against `.claude/agents/codebase-analyzer.md:44-57`
- **Excerpt (`fact-finder:255-257`):**
  ```markdown
  3. **Output Scope**: Choose based on your research needs:
     - `comprehensive`: Full analysis with all dependencies, call chains, and technical details (typical for Fact-Finder)
     - `focused`: Component-level analysis with immediate dependencies only
     - `surface`: Quick overview of structure and exports
  ```
- **Excerpt (`codebase-analyzer.md:44-54`, read directly):**
  ```markdown
  1. **`execution_only`**: Return only Section 1 (Execution Flow)
  2. **`focused`**: Return Sections 1 and 3 (Execution Flow + Dependencies)
  3. **`comprehensive`**: Return all 4 sections (default)
  ```

#### F-13 — `thoughts-locator` savings percentages do not match the agent's

- **Observation:** `/fact-finder`'s scope guidance for `thoughts-locator` states ~70% reduction for `paths_only` and ~40% for `focused`. `thoughts-locator.md` states 28% and 15%. The figures 62% and 37% appear in `codebase-locator.md` for the same two value names.
- **Direct consequence:** The stated basis for choosing a narrower `thoughts-locator` scope overstates the difference between the three values by a factor of roughly two and a half.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:370`, `:375` against `.claude/agents/thoughts-locator.md:22`, `:26` and `.claude/agents/codebase-locator.md:39`, `:43`
- **Excerpt (`fact-finder:367-375`):**
  ```markdown
  **Use `paths_only` when you need only one document type:**
  - Token efficiency: ~70% reduction vs comprehensive
  ...
  - Token efficiency: ~40% reduction vs comprehensive
  ```
- **Excerpt (`thoughts-locator.md:21-27`):**
  ```markdown
  1. **`paths_only`** (~180 tokens, 28% savings)
  2. **`focused`** (~220 tokens, 15% savings)
  ```

#### F-14 — The `thoughts-locator` category count and enumeration match neither of the agent's two lists

- **Observation:** `/fact-finder` states `comprehensive` returns "All 8 categories" and enumerates them as missions, specs, epics, plans, QA reports, research, STATE files, related docs. `thoughts-locator.md` states "All 9 categories" twice; its Map of the Archive lists nine, including feature briefs and prototype learnings; its `<answer>` template carries eight `###` headings, with no Feature Briefs heading and no STATE Files heading. Personally verified by reading `thoughts-locator.md:96-123`.
- **Direct consequence:** `STATE files` appears as a category name in `/fact-finder` and in its worked example, and as a heading in neither the agent's Map nor its output template. `features/` and `prototypes/` are directories the agent's Map covers and `/fact-finder`'s enumeration omits — both are directories `/fact-finder`'s own Phase 1 depends on (`:571`, `:582`).
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:379`, `:358-359` against `.claude/agents/thoughts-locator.md:31`, `:99-121`
- **Excerpt (`fact-finder:379`):**
  ```markdown
  - Returns: All 8 categories (missions, specs, epics, plans, QA reports, research, STATE files, related docs)
  ```
- **Excerpt (`fact-finder:358-359`, inside the worked response example):**
  ```markdown
  ### STATE Files
  - `thoughts/shared/plans/2025-12-15-AUTH-001-STATE.md`
  ```
- **Excerpt (`thoughts-locator.md:117-121`, read directly — the template's last two headings):**
  ```markdown
  ### Prototype Learnings
  - `thoughts/shared/prototypes/2026-01-20-csv-converter.md` - **CSV Converter Spike** (go)

  ### Project Notes
  - `thoughts/projects/auth-rework/Chat.md` - **Draft Ideas**
  ```

### `/fact-finder` and `/planner` — pre-Skills scaffolding

#### F-15 / F-19 — A message-envelope contract for a delegation path that does not exist

- **Observation:** Both files open a "Response Format (Structured Output)" section stating they work in two communication contexts, the second being "Agent Delegation (when invoked by other agents): Use structured message envelope for machine-readable responses". Each then spends a subsection distinguishing that envelope from its document frontmatter. `grep -rn 'subagent_type: "fact-finder"|"planner"' .claude/skills/` returns no match; no skill spawns either as a subagent. Neither file specifies the envelope's fields.
- **Direct consequence:** Each file describes two output formats and defines one. The undefined format is described as applying to an invocation path that no file in `.claude/` performs.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:608-634`; `.claude/skills/planner/SKILL.md:501-516`
- **Excerpt (`fact-finder:608-613`):**
  ```markdown
  Fact-Finders work in two communication contexts:

  1. **Research Execution (writing reports)**: Create research report documents
  2. **Agent Delegation (when invoked by other agents)**: Use structured message envelope for machine-readable responses
  ```
- **Excerpt (`planner:503-506`):**
  ```markdown
  Planners work in two communication contexts:

  1. **Plan Creation (writing plan documents)**: Create implementation plan and state files
  2. **Agent Delegation (when invoked by other agents)**: Use structured message envelope for machine-readable responses
  ```

### `/planner` — structure

#### F-16 — The `web-search-researcher` section contains a `codebase-locator` contract

- **Observation:** The section titled "Delegating to web-search-researcher for API Validation" opens with a matching delegation example, then presents a response format introduced as "The locator returns YAML frontmatter + thinking + answer with all 4 sections", with `message_id: locator-2026-01-18-001`, a `## Coordinates: User Authentication System` answer, and `files_found: 9`. Its two following subsections are "Parsing the Response for Implementation Planning" and "Using Locator Output in Your Plan". `/planner` contains no other `codebase-locator` response contract, and no `web-search-researcher` response contract. `/planner`'s Evidence standards require URL + Date + Type + Authority evidence obtained via that subagent.
- **Direct consequence:** The response format `/planner` is directed to parse for web research is a file-topology report. The evidence form its own standards require from that subagent — URL, date, type, authority — appears in no response contract in the file. `web-search-researcher.md` declares nine envelope fields including `sources_found`, `confidence`, and `query_type`, none of which appears in `/planner`.
- **Evidence:** `.claude/skills/planner/SKILL.md:63-155`, specifically `:78`, `:98`, `:121`, `:131`, against `:37-42`
- **Excerpt (`:76-86`):**
  ```markdown
  ### Expected Response Format

  The locator returns YAML frontmatter + thinking + answer with all 4 sections:

  ```markdown
  ---
  message_id: locator-2026-01-18-001
  correlation_id: plan-auth-refactor-2026-01-18
  search_scope: comprehensive
  files_found: 9
  ```
- **Excerpt (`:37-41`):**
  ```markdown
  ### Web Research Evidence (URL Format)
  - **Format:** URL + Date + Type + Authority
  - **Example:** https://docs.react.dev/reference/react/useState (Type: official_docs, Date: 2026-01, Authority: high)
  - **Required:** 1-6 line excerpt or code sample from source
  ```

#### F-17 — Non-Negotiables 3 and 4 sit under a different heading

- **Observation:** The `## Non-Negotiables (Enforced)` section contains items 1 and 2. The `## Evidence & Citation Standards (STRICT)` heading follows, with its three subsections, and items numbered 3 and 4 appear after them, before `## Tools & Delegation (STRICT)`.
- **Direct consequence:** Two of the four enforced rules are located inside the Evidence & Citation Standards section. A reader of the section named for them finds two of four.
- **Evidence:** `.claude/skills/planner/SKILL.md:17-26` (items 1-2), `:27` (intervening heading), `:49-54` (items 3-4)
- **Excerpt (`:44-54`):**
  ```markdown
  ### Unverified Items
  - If you cannot obtain evidence with `Read` or delegation, DO NOT create a PLAN-XXX task
  - Create a **Verification Task** instead
  - Document what needs verification and how to verify it

  3. **No Code Output**
     - Do not output patches, diffs, or full file rewrites.
  ```

#### F-18 — The Approval Gate is required by the protocol and absent from both templates

- **Observation:** Phase 3 directs the inclusion of an `## Approval Gate` section. `grep -rn "Approval Gate" .claude/` returns one match, that instruction. Neither the standard plan template nor the QA plan template contains the section. Phase 3 states no criterion for when approval is required, and its second branch — "Otherwise, proceed to generate implementor-ready tasks" — follows a first bullet stating the full plan artifact is always written.
- **Direct consequence:** A section the protocol requires has no slot in the structure the same file declares as STRICT. The branch condition is unstated, and the alternative branch names an output the preceding bullet has already produced.
- **Evidence:** `.claude/skills/planner/SKILL.md:488-492`, against `:528-589` (standard template) and `:595-736` (QA template)
- **Excerpt (`:488-492`):**
  ```markdown
  ### Phase 3: Decision Gates (NO DEADLOCK)
  - Always write the full plan artifact.
  - Include an **Approval Gate** section:
    - If user approval is required, stop after writing and present only the plan summary + explicit questions.
    - Otherwise, proceed to generate implementor-ready tasks.
  ```

#### F-20 — The standard task template has no `Excerpt` field

- **Observation:** The Evidence & Citation Standards require a 1-6 line excerpt for every task Evidence field, in both codebase and web form. The standard task field list carries `Evidence:` with no `Excerpt:`. The QA task template carries `Excerpt:` with a fenced code block.
- **Direct consequence:** The excerpt the Evidence standards require has a named field in one of the two templates. `CLAUDE.md`'s statement of the canonical field list also omits it, so the four-reader contract does not cover it.
- **Evidence:** `.claude/skills/planner/SKILL.md:33-35` (requirement), `:558-570` (standard fields), `:663-666` (QA fields)
- **Excerpt (`:33-35`):**
  ```markdown
  - **Format:** `path/to/file.ext:line-line`
  - **Example:** `src/auth/login.ts:45-50`
  - **Required:** 1-6 line excerpt showing the referenced code
  ```
- **Excerpt (`:663-666`, QA template only):**
  ```markdown
  - **Excerpt:**
    ```[language]
    [Code excerpt]
    ```
  ```

#### F-21 — `## Quick Verification` duplicates the plan's commands into a file capped at 40 lines

- **Observation:** The STATE template contains a `## Quick Verification` section directing the listing of the plan's `Verify:` commands, and a subsequent instruction to keep the file at or under 40 lines. The STATE template's other content — header, four status lines, wave-grouped checklist, Notes — occupies the remainder. `/implement` contains no reference to `Quick Verification`.
- **Direct consequence:** For a plan whose task count approaches the checklist's share of 40 lines, the two instructions constrain the same budget. The commands are stated in two files, and no step reads the STATE copy.
- **Evidence:** `.claude/skills/planner/SKILL.md:767-768`, `:777`
- **Excerpt (`:767-768`):**
  ```markdown
  ## Quick Verification
  <list the Verify: commands from the plan>
  ```
- **Excerpt (`:777`):**
  ```markdown
  **Important**: Keep this file minimal (≤40 lines). The Implementor amends a STATE update into **every** commit it makes, covering exactly that commit's task IDs — so an interrupted run resumes without redoing finished work.
  ```

#### F-22 — Two template field lines present their allowed values rather than a placeholder

- **Observation:** The `Model:` line in both templates reads `haiku (default) | opus (architecture/complex refactor only)`, and the `Verify:` line reads `` `command` → expected result (or `none — requires review`) ``. Other fields in the same lists use bracketed placeholders (`` `path/...` ``, `[Detailed steps from QA report]`).
- **Direct consequence:** These two lines are simultaneously the value menu and the template text. `/implement` reads `Model:` for one of two literal values (`:232`) and tests `Verify:` against the literal string `none — requires review` (`:171`), so a line copied unaltered supplies neither.
- **Evidence:** `.claude/skills/planner/SKILL.md:561`, `:569`, `:679`, `:686`; `.claude/skills/implement/SKILL.md:171`, `:232`
- **Excerpt (`planner:561`, `:569`):**
  ```markdown
  - **Model:** haiku (default) | opus (architecture/complex refactor only)
  ...
  - **Verify:** `command` → expected result (or `none — requires review`)
  ```

### `/implement` — prompt templates

#### F-23 — The implementer's test rule and its file constraint have no stated precedence

- **Observation:** Responsibility 5 directs the implementer to write a test when the change alters behaviour in executable code. The Constraints section permits modification only of files in `File(s)` or `allowedAdjacentEdits`, and directs a `NEEDS_CONTEXT` report rather than touching an unlisted file. Neither passage refers to the other. `/planner`'s Phase 2b directs the inclusion of test files in `File(s)`.
- **Direct consequence:** Where a behaviour-changing task's `File(s)` omits a test file, the two instructions select different actions and the prompt states no precedence between them.
- **Evidence:** `.claude/skills/implement/implementer-prompt.md:27-30` against `:37-38`; `.claude/skills/planner/SKILL.md:417`
- **Excerpt (`implementer-prompt.md:27-29`):**
  ```markdown
  5. **Tests** — apply judgment, do not write tests reflexively:
     - Behavior change in executable code → write a test, failing test first when possible, then run it.
     - Documentation, prompt text, config values, or markdown → no test. The `Verify:` command is the check.
  ```
- **Excerpt (`implementer-prompt.md:37-38`):**
  ```markdown
  - Only modify files in the task's **File(s)** field (or **allowedAdjacentEdits** if listed)
  - If you need to touch an unlisted file: report `NEEDS_CONTEXT`, do **not** touch it silently
  ```

### Contracts verified as intact

#### F-24 — The epic → fact-finder research-question channel resolves correctly

- **Observation:** `epic-planner/SKILL.md:119` cites `.claude/skills/fact-finder/SKILL.md:575` as the point where `/fact-finder` reads `Research Questions for Fact-Finder` by name. Line 575 of that file is the table row for that section. The glob citation at `Inherited-Constraints-Chain.md:33-38` pointing to `fact-finder/SKILL.md:571` likewise resolves to the glob instruction.
- **Direct consequence:** Two of the cross-file line citations in the phase-one skills and plans resolve to the text they claim. This channel and the `Dependencies` row are the parts of the epic → fact-finder hand-off that the intake table covers.
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:571`, `:575`
- **Excerpt (`:571-577`):**
  ```markdown
  2. **Otherwise glob for the work order**: `thoughts/shared/epics/` on the greenfield path, `thoughts/shared/features/` on the brownfield path. Both contain sections written *for you*:

     | Artifact | Section | What it gives you |
     |---|---|---|
     | Epic | **Research Questions for Fact-Finder** | your starting research vectors, already as a checklist |
     | Epic | **Dependencies** | which epics must exist first |
     | Epic | **Inherited Constraints** | what to treat as fixed rather than investigate |
  ```

#### F-25 — The scope values other than `surface`, and the envelope fields, match their agents

- **Observation:** Every other subagent parameter and envelope field documented in `/fact-finder` matches the agent that implements it: `codebase-locator`'s four `search_scope` values and their savings figures; `thoughts-locator`'s three values, `paths_sanitized`, `documents_found`, and `locator_version`; `codebase-analyzer`'s `analysis_depth` alias; `web-search-researcher`'s `correlation_id`, `sources_found`, `search_tools_used`, and `confidence`. `codebase-analyzer` declares no `correlation_id` field, which `/fact-finder` does not claim it has.
- **Direct consequence:** The divergences recorded in F-12, F-13 and F-14 are localised to the `codebase-analyzer` scope list and the `thoughts-locator` scope-guidance subsection, not distributed through the delegation documentation.
- **Evidence:** `.claude/agents/codebase-locator.md:33-47`; `.claude/agents/thoughts-locator.md:79-90`; `.claude/agents/codebase-analyzer.md:40`; `.claude/agents/web-search-researcher.md:148-158`
- **Excerpt (`codebase-locator.md:39-43`):**
  ```markdown
  2. **`paths_only`** (~120 tokens, 62% savings)
     - **Sections Returned:** Primary Implementation only

  3. **`focused`** (~200 tokens, 37% savings)
  ```

## Verification Log

`Verified:` (files personally read this session)

- `.claude/skills/fact-finder/SKILL.md`
- `.claude/skills/planner/SKILL.md`
- `.claude/skills/implement/SKILL.md`
- `.claude/skills/implement/implementer-prompt.md`
- `.claude/skills/implement/reviewer-prompt.md`
- `.claude/agents/codebase-analyzer.md` (lines 36-61)
- `.claude/agents/thoughts-locator.md` (lines 96-123)
- `thoughts/shared/facts/AGENTS.md`

`Verified via subagent excerpts, not personally re-read:`

- `.claude/skills/specifier/SKILL.md`, `.claude/skills/epic-planner/SKILL.md`, `.claude/skills/feature-architect/SKILL.md`
- `.claude/agents/codebase-locator.md`, `.claude/agents/web-search-researcher.md`, and the remainder of `thoughts-locator.md` / `codebase-analyzer.md`
- `thoughts/shared/plans/2026-07-29-{Inherited-Constraints-Chain,Large-Feature-Routing,Upstream-Skills-Fixes}.md` and their STATE files

`Verified by command output:` `git status --porcelain` untracked-directory behaviour (throwaway repository, this session); `grep` absence checks for `inferred`, `Approval Gate`, `Acceptance`, `Baseline Verification`, `epics/`, and `subagent_type: "fact-finder"|"planner"`.

`Spot-checked excerpts captured:` yes

## Open Questions / Unverified Claims

- **What the four QA skills state about their own report count and filename.** F-10 records a contradiction inside `/fact-finder` and `/planner`. Whether `python-qa`, `typescript-qa`, `clean-code` or `logic-bugs-qa` specify a report path of their own — which would determine whether two loaded skills actually collide — was not checked. Tried: reading `/fact-finder` and `/planner` only. Missing: `Read` of the four skill files.
- **Whether `$TMPDIR` is set in the environments `/implement` runs in.** F-06 records the absence of a fallback and the consequence of an unset variable. Whether Claude Code sets `TMPDIR` outside sandbox mode was not established from a primary source. Tried: observed it set to `/tmp/claude-1000` in this session. Missing: a statement of the guarantee, or its absence, for non-sandboxed runs.
- **Whether any consumer reads `/fact-finder`'s or `/planner`'s frontmatter fields.** `fact-finder:` and `topic:` in the report frontmatter, and the QA mode's `message_type: QA_REPORT`, are written per the templates. `/planner`'s QA detection reads `message_type` (`:389-390`); no reader was located for `fact-finder:`, `topic:`, or `coverage:`. Tried: grep across `.claude/skills/`. Missing: confirmation that no reader exists rather than that none was found by name.
- **Whether the empty untracked directory `.claude/skills/planner/.claude/` is expected.** It contains no files and is not tracked by git. Tried: `find` and `git ls-files`. Missing: its provenance.
- **The reviewer prompt's tool assumptions.** `reviewer-prompt.md:19` directs the reviewer to run the task's `Verify:` command. Reviewers are dispatched as `general-purpose` (`implement/SKILL.md:177`), and no tool restriction was located. Not verified: whether every `Verify:` form a planner may write is runnable by that subagent type.

## References

**Codebase Citations**

- `.claude/skills/fact-finder/SKILL.md:65`, `:94`, `:100-103`, `:255-257`, `:278`, `:358-359`, `:367-380`, `:533`, `:569`, `:571`, `:575-580`, `:589-604`, `:608-634`, `:642-646`, `:662-695`, `:680-682`
- `.claude/skills/planner/SKILL.md:17-26`, `:33-42`, `:49-54`, `:63-155`, `:267-276`, `:371`, `:389-390`, `:488-492`, `:501-516`, `:528-589`, `:531-533`, `:558-570`, `:580-581`, `:595-736`, `:599`, `:663-666`, `:679`, `:686`, `:699-707`, `:767-768`, `:777`
- `.claude/skills/implement/SKILL.md:28-69`, `:55-57`, `:136-157`, `:140-144`, `:152`, `:171`, `:177`, `:185`, `:189-226`, `:220-222`, `:232`, `:254`, `:259`
- `.claude/skills/implement/implementer-prompt.md:27-30`, `:37-38`
- `.claude/skills/implement/reviewer-prompt.md:19`
- `.claude/skills/specifier/SKILL.md:98`, `:107`, `:306-312`
- `.claude/skills/epic-planner/SKILL.md:41`, `:115-116`, `:119`, `:139`, `:209`, `:228-234`, `:230`, `:236`, `:253`, `:309`, `:325`, `:329`
- `.claude/skills/feature-architect/SKILL.md:38`, `:47-49`, `:122`, `:189-201`, `:191`, `:199`
- `.claude/agents/codebase-analyzer.md:36-61`, `:40`, `:44-57`, `:120`, `:156`
- `.claude/agents/thoughts-locator.md:21-35`, `:31`, `:48-56`, `:79-90`, `:96-123`, `:156`
- `.claude/agents/codebase-locator.md:33-51`, `:113-123`
- `.claude/agents/web-search-researcher.md:62-73`, `:148-158`
- `thoughts/shared/plans/2026-07-29-Inherited-Constraints-Chain.md:3`, `:33-38`, `:77-78`, `:82-89`, `:87`, `:93`, `:194`, `:198-205`, `:225`, `:229-231`, `:245`
- `thoughts/shared/plans/2026-07-29-Inherited-Constraints-Chain-STATE.md:4-15`
- `thoughts/shared/plans/2026-07-29-Large-Feature-Routing.md:100-106`, `:105`, `:117`, `:300-310`
- `thoughts/shared/plans/2026-07-29-Upstream-Skills-Fixes.md:79-84`, `:129-134`, `:131`, `:310`
- `thoughts/shared/facts/AGENTS.md:27-38`

**Web Research Citations**

- None. No external sources were consulted; every claim in this report is sourced to a file in this repository or to command output captured in this session.
