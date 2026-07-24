# Prototype Skill Implementation Plan

## Inputs

- Fact report used: `thoughts/shared/facts/2026-07-24-Prototype-Skill.md`
- Feature brief: `thoughts/shared/features/2026-07-24-Prototype-Skill.md`
- Epic: `thoughts/shared/epics/2026-07-24-Prototype-Skill.md`
- User request summary: Deliver the `/prototype` skill — an optional, gate-free entry point that spikes an idea into disposable code inside an isolated git worktree, demonstrates it, reaches an explicit go/no-go/iterate decision, always writes a short learnings note to `thoughts/shared/prototypes/`, and unconditionally deletes the worktree/branch regardless of outcome.

## Verified Current State

- **Fact:** `EnterWorktree` creates a new git worktree under `.claude/worktrees/` on a new branch and switches the *session's* working directory into it — this persists across as many subsequent tool calls/turns as needed, unlike the Agent tool's per-call `isolation: "worktree"`.
  - **Evidence:** `EnterWorktree` tool schema (loaded via `ToolSearch("select:EnterWorktree,ExitWorktree")`, 2026-07-24).
  - **Excerpt:**
    ```
    In a git repository: creates a new git worktree inside `.claude/worktrees/` on a new
    branch. ... Switches the session's working directory to the new worktree.
    ```

- **Fact:** `EnterWorktree` should only be used when explicitly instructed by the user or by project instructions (CLAUDE.md/memory) — this is a hard usage gate on the tool itself, not just documentation.
  - **Evidence:** `EnterWorktree` tool schema, top-level description (loaded via `ToolSearch`, 2026-07-24).
  - **Excerpt:**
    ```
    Use this tool ONLY when explicitly instructed to work in a worktree — either by the
    user directly, or by project instructions (CLAUDE.md / memory).
    ```
  - **Direct consequence:** `prototype/SKILL.md` itself must be the explicit instruction that authorizes `EnterWorktree` — its Non-Negotiables must say outright "call `EnterWorktree`" rather than imply it, or the tool's own gate may block the call.

- **Fact:** `EnterWorktree`'s Requirements list only "must be in a git repository" and "must not already be in a worktree session when creating a new worktree" — no requirement of a clean main working tree.
  - **Evidence:** `EnterWorktree` tool schema, "Requirements" section.

- **Fact:** Absent a `worktree.baseRef` setting, new worktrees branch from `fresh` (i.e. `origin/<default-branch>`) by default, not from local HEAD. `.claude/settings.json` contains no `worktree` key.
  - **Evidence:** `EnterWorktree` tool schema ("`fresh` (default) branches from origin/<default-branch>"); `.claude/settings.json:1-8` (full file, no `worktree` key).
  - **Direct consequence:** `EnterWorktree` takes no per-call base-ref parameter — this is a global setting, not something `/prototype` can override per invocation. The skill gets whatever the repo-wide default is (`fresh`), which already satisfies the "never touch the user's current branch" guarantee without any extra work.

- **Fact:** `ExitWorktree` takes `action: "keep" | "remove"` and `discard_changes` (default false). With `action: "remove"`, if the worktree has uncommitted files or commits not on the original branch, it refuses unless `discard_changes: true`.
  - **Evidence:** `ExitWorktree` tool schema, "Parameters" section.
  - **Excerpt:**
    ```
    "discard_changes" (optional, default false): only meaningful with action: "remove".
    If the worktree has uncommitted files or commits not on the original branch, the tool
    will REFUSE to remove it unless this is set to true.
    ```

- **Fact:** `ExitWorktree`'s Behavior section explicitly states it "Restores the session's working directory to where it was before `EnterWorktree`" and "Clears CWD-dependent caches ... so the session state reflects the original directory."
  - **Evidence:** `ExitWorktree` tool schema, "Behavior" section.
  - **Direct consequence:** This is the only tool-documented guarantee about where subsequent file writes land. It is safe to write the learnings note only *after* calling `ExitWorktree`, not while still inside the worktree — see Design Overview below for why this reorders the epic's flowchart (Note → Cleanup) to Cleanup → Note.

- **Fact:** If `ExitWorktree` is called outside an `EnterWorktree` session, it is a no-op; it only ever operates on worktrees created by `EnterWorktree` *in the current session*.
  - **Evidence:** `ExitWorktree` tool schema, "Scope" section.
  - **Direct consequence:** A crashed/abandoned prior `/prototype` session's worktree cannot be cleaned up by a fresh `/prototype` invocation's `ExitWorktree` call. This is a platform-level limitation, not something the skill can work around; `EnterWorktree`'s own description states the harness prompts the user to keep/remove at session exit as the fallback. The skill documents this rather than inventing a workaround.

- **Fact:** `thoughts/shared/AGENTS.md`'s directory-assignment table and Child DOX Index use an exact, repeatable row format; only `plans/`, `facts/`, `qa/` currently have a child `AGENTS.md` (linked from the index) — `features/`, `epics/` do not.
  - **Evidence:** `thoughts/shared/AGENTS.md:17-27` (table), `:37-41` (index).
  - **Excerpt:**
    ```markdown
    | `qa/` | `/fact-finder` (QA mode) | human review |
    | `plans/` | `/planner` | `/implement` |
    ...
    - [qa/](qa/AGENTS.md) — QA review reports
    ```

- **Fact:** `qa/AGENTS.md` is the lowest-rigor existing artifact-directory contract: 4-field frontmatter (`date`, `message_type`, `target`, `status`), unstructured prose body.
  - **Evidence:** `thoughts/shared/qa/AGENTS.md:15-23`.

- **Fact:** Every workflow `SKILL.md`'s frontmatter uses exactly two keys: `name`, `description`. No `tools`/`model`/other keys appear at the `SKILL.md` level (those belong to the separate `.claude/agents/*.md` subagent format).
  - **Evidence:** `.claude/skills/feature-architect/SKILL.md:1-4`.

- **Fact:** `feature-architect`'s Phase 1 ("Load Existing Context") self-executes `Glob` + `Read` over `thoughts/shared/missions/*.md`, `thoughts/shared/specs/*.md`, `thoughts/shared/epics/*.md` as its first mandatory action.
  - **Evidence:** `.claude/skills/feature-architect/SKILL.md:66-78`.
  - **Excerpt:**
    ```markdown
    ### Phase 1: Load Existing Context

    1. Use Glob to find:
       - `thoughts/shared/missions/*.md` — load the most recent or relevant mission
       - `thoughts/shared/specs/*.md` — load the corresponding spec
       - `thoughts/shared/epics/*.md` — skim titles to understand what's already planned/built
    ```

- **Fact:** `fact-finder`'s own Phase 1 is generic ("Read the user request. Decompose into research vectors. Delegate exploration to sub-agents.") — it has no unconditional Glob step for any artifact type. Its actual mechanism for reading prior mission/spec/plan/QA artifacts is a situational, two-step `thoughts-locator` → `thoughts-analyzer` delegation ("When researching features with historical context...").
  - **Evidence:** `.claude/skills/fact-finder/SKILL.md:552-557` (Phase 1); `:271-286` (`thoughts-locator` delegation trigger conditions).
  - **Direct consequence:** `fact-finder` needs no direct edit to pick up prototype learnings notes — it already delegates to `thoughts-locator` whenever historical context is relevant. What *does* need to change is `thoughts-locator` itself (see next fact), since that agent's document map is what determines whether prototype notes are findable at all.

- **Fact:** `.claude/agents/thoughts-locator.md`'s "Map of the Archive" is a hardcoded, enumerated list of 8 categories (missions, specs, epics, plans, qa, facts, decisions, personal notes) with matching `find` examples and a matching 8-category "Output Format" answer template. `thoughts/shared/features/` is notably also absent from this map (pre-existing gap, out of scope here). `thoughts/shared/prototypes/` is not listed.
  - **Evidence:** `.claude/agents/thoughts-locator.md:47-56` (Map of the Archive), `:58-66` (Workflow find examples), `:95-121` (Output Format answer template), `:149-155` (scope-level category counts, "All 8 categories").
  - **Direct consequence:** Without adding a "Prototype Learnings" category to this file, `thoughts-locator` will never surface `thoughts/shared/prototypes/*.md` notes to `fact-finder` (or to any other delegating skill), even though `fact-finder`'s own delegation mechanism is otherwise unconditionally sufficient. This is the load-bearing edit for the epic's "fact-finder can reference the prototype's learnings note as context" acceptance criterion.

- **Fact:** `.claude/skills/AGENTS.md`'s Local Contracts section enumerates every skill subdirectory by category ("Workflow skills (pipeline order)", "Quality skills", "DOX maintenance skills").
  - **Evidence:** `.claude/skills/AGENTS.md:15-33`.
  - **Direct consequence:** Per `CLAUDE.md`'s DOX Protocol ("If a directory is created or repurposed, also update the parent `AGENTS.md`'s Child DOX Index" — `CLAUDE.md:175`), adding `.claude/skills/prototype/` requires updating this listing.

- **Fact:** `CLAUDE.md`'s "Workflow Pipeline" section lists three named flows as fenced-code arrow chains (lines 11-24), followed by a "Each stage produces artifacts..." table (lines 26-36) covering all seven existing stages; a separate "Workflow Skills" table (lines 42-50) lists every skill with a one-line purpose; the "Directory Structure" section (lines 117-125) enumerates every `thoughts/shared/` subdirectory with a one-line comment.
  - **Evidence:** `CLAUDE.md:9-36`, `:117-125`.

- **Fact:** No existing `SKILL.md` uses `AskUserQuestion` for a fixed multi-way enum (e.g. go/no-go/iterate); all four existing usages are open-ended discovery or a binary "STOP and recommend refinement" gate. `AskUserQuestion` is available as a directly-callable top-level tool (confirmed by this session's own tool list — not deferred).
  - **Evidence:** `.claude/skills/feature-architect/SKILL.md:82,102-103`; `.claude/skills/mission-architect/SKILL.md:54,85,114,129`; `.claude/skills/epic-planner/SKILL.md:50,83`; `.claude/skills/specifier/SKILL.md:52,87`.
  - **Direct consequence:** There is no structural template to copy for the go/no-go/iterate question itself; `prototype/SKILL.md` must specify the exact three option labels directly (see PLAN-001) since no precedent constrains this choice.

- **Fact:** `thoughts/shared/prototypes/` does not exist anywhere in the repository; no prior mission/spec/plan/QA/fact report documents any actual (non-planning) instance of worktree-based isolation being used in this framework.
  - **Evidence:** Directory listing of `thoughts/shared/` (`AGENTS.md, epics, facts, features, missions, plans, qa, specs` — no `prototypes`), confirmed directly in this session.

## Goals / Non-Goals

**Goals:**
- Ship `.claude/skills/prototype/SKILL.md` implementing the full build → demonstrate → decide (go/no-go/iterate) → cleanup → learnings-note lifecycle.
- Register `thoughts/shared/prototypes/` in `thoughts/shared/AGENTS.md` (table + Child DOX Index) with its own child `AGENTS.md`, following the `qa/` low-rigor precedent.
- Document `/prototype` in `CLAUDE.md` (pipeline flow, Workflow Skills table, Directory Structure) and in `.claude/skills/AGENTS.md`.
- Wire the "go" handoff so `feature-architect` (self-executed Glob) and `fact-finder` (via `thoughts-locator`) can both discover a prototype's learnings note as context.
- Guarantee the worktree/branch are unconditionally deleted at session conclusion via `ExitWorktree(action: "remove", discard_changes: true)`, regardless of go/no-go outcome.

**Non-Goals** (carried forward from the feature brief — do not "fix" these):
- No mission/feature/spec/epic/fact/plan artifact for the prototype itself — only the learnings note.
- No `clean-code`/`typescript-qa`/`python-qa`/`logic-bugs-qa`/`implement`-style review of prototype code.
- No DOX/AGENTS.md contract enforcement *inside* the prototype worktree.
- No carrying prototype code forward on a "go" decision — it is always discarded via `discard_changes: true`.
- No new isolation mechanism — reuse `EnterWorktree`/`ExitWorktree` exactly as documented.
- No per-invocation base-ref parameter for `/prototype` — the repo-wide `worktree.baseRef` default (`fresh`) governs every invocation; this plan does not add or change that setting.
- No automatic cleanup path for an abandoned/crashed session beyond what `EnterWorktree`/`ExitWorktree` already document (the harness's own keep/remove prompt at session exit) — this is a documented platform behavior, not a gap this skill needs to close.

## Design Overview

- **Lifecycle:** `EnterWorktree` (setup) → Code (no gates) → Demonstrate → `AskUserQuestion` (go/no-go/iterate) → [iterate: loop to Code in the same worktree, no re-`EnterWorktree`] → [go or no-go: `ExitWorktree(remove, discard_changes: true)`] → write learnings note (now back in the main tree) → tell the user the note's path (+ next-step pointer on "go").
- **Deliberate reordering vs. the epic's flowchart:** The epic's diagram shows `Decide → Note → Cleanup`. This plan reorders to `Decide → Cleanup → Note`, because `ExitWorktree`'s Behavior section is the only tool-documented guarantee about the session's working directory (Verified Current State above) — writing the learnings note *before* `ExitWorktree` would write it into the worktree's own copy of `thoughts/shared/prototypes/`, which is then deleted along with everything else by `discard_changes: true`. Writing it *after* `ExitWorktree` uses the tool's documented cwd-restoration guarantee instead of an unverified cross-worktree write. The net externally-observable behavior (note exists, cleanup happened, both unconditional) is identical either way — only the internal call order changes.
- **No per-round cleanup:** "Iterate" never calls `ExitWorktree` — the worktree/branch persist across as many rounds as the user chooses, matching Epic Story 5 and the fact report's Finding 2.
- **No delegation to any pipeline skill or QA skill from inside `/prototype`** — it is a self-contained skill with no `Agent` tool calls to `fact-finder`, `planner`, `feature-architect`, `epic-planner`, `mission-architect`, `specifier`, `clean-code`, `python-qa`, `typescript-qa`, or `logic-bugs-qa`.
- **Handoff wiring is two-pronged:** `feature-architect` gets an added Glob line in its existing self-executed Phase 1 (PLAN-007); `fact-finder` needs no direct edit because it already delegates to `thoughts-locator` situationally — instead, `thoughts-locator`'s document map itself is extended with a "Prototype Learnings" category (PLAN-006), which is what actually makes the notes discoverable.

## Implementation Instructions (For Implementor)

### PLAN-001: Create the `/prototype` skill

- **Change Type:** create
- **File(s):** `.claude/skills/prototype/SKILL.md`
- **Instruction:**
  1. Frontmatter: exactly two keys, matching the uniform convention.
     ```yaml
     ---
     name: prototype
     description: Spike a rough idea into working, disposable code inside an isolated git worktree, demonstrate it, and reach an explicit go/no-go/iterate decision — no spec/plan/QA gates. Writes a learnings note to thoughts/shared/prototypes/ regardless of outcome; code is always discarded. Optional entry point before mission-architect/feature-architect/fact-finder.
     ---
     ```
  2. Opening section establishing identity/purpose: this skill is the pipeline's "pressure-release valve" — answers "would this even work?" before any spec/plan/QA rigor begins (per Feature Vision, `thoughts/shared/features/2026-07-24-Prototype-Skill.md:23-29`).
  3. **Non-Negotiables (Enforced)** section must state, as hard rules:
     - Call `EnterWorktree` explicitly as the first action, with `name: "prototype/<slug>"` where `<slug>` is a short kebab-case derivation of the user's stated idea (e.g. idea "spike a CSV to JSON converter" → slug `csv-to-json-converter`). This explicit instruction is what satisfies `EnterWorktree`'s own "only when explicitly instructed by ... project instructions" gate (Verified Current State above) — do not phrase this as optional or implied.
     - If `EnterWorktree` errors because a worktree session is already active, do not force a nested worktree — tell the user and ask them to resolve the existing session first (they may need `ExitWorktree` themselves), then stop. Do not silently pick a different mechanism.
     - Once inside the worktree: no calls to `fact-finder`, `planner`, `epic-planner`, `feature-architect`, `specifier`, `mission-architect`, `clean-code`, `python-qa`, `typescript-qa`, `logic-bugs-qa`, `dox-init`, `dox-update` — full coding freedom, no gates.
     - Do not seek out or honor any `AGENTS.md` file encountered while working inside the prototype worktree — DOX governance is deliberately suspended for this skill's own code-writing, per the feature brief's Explicit Non-Goals.
     - Never write to `thoughts/shared/missions/`, `features/`, `specs/`, `epics/`, `facts/`, `qa/`, or `plans/` — the only new artifact this skill ever produces is the learnings note in `thoughts/shared/prototypes/`.
     - Must demonstrate the result before asking the go/no-go/iterate question — never skip straight to the decision.
     - The go/no-go/iterate decision must use `AskUserQuestion` with exactly three options, labeled "Go" / "No-go" / "Iterate" (or equivalent short labels), each with a one-line description matching: proceed for real / discard and stop / keep working in this worktree.
     - Cleanup via `ExitWorktree(action: "remove", discard_changes: true)` is unconditional on reaching "go" or "no-go" — never on "iterate" — and always happens *before* the learnings note is written (see Design Overview's reordering rationale). Always pass `discard_changes: true`; never attempt `action: "keep"` for this skill's own worktree, since prototype code is never carried forward per the feature brief.
     - The learnings note must be written exactly once per session, after `ExitWorktree` returns, regardless of which of the three outcomes ended the session.
  4. **Tools & Delegation** section: lists `EnterWorktree`, `ExitWorktree`, `AskUserQuestion`, `Bash` (to run/demonstrate the prototype inside the worktree), `Write`/`Edit` (prototype code + the final learnings note), `Read`. Explicitly states: "You do NOT delegate to any Agent subagent or invoke any other skill — this skill is self-contained."
  5. **Execution Protocol** — four phases, described as step-by-step instructions (pseudocode, no literal code):
     - **Phase 1: Setup.** Derive the slug from the user's idea. Call `EnterWorktree(name: "prototype/<slug>")`. On success, confirm to the user that an isolated worktree/branch now exists and coding is starting.
     - **Phase 2: Build (repeats on "iterate").** Write code directly toward the stated goal inside the worktree, applying none of the gates listed in Non-Negotiables. Track, across iterations, a short running account of what was built and why (needed later for the learnings note) — this can be an in-conversation summary, not a file.
     - **Phase 3: Demonstrate.** Run the prototype and show its output if it is runnable (e.g. `Bash`); if there is nothing meaningfully runnable (e.g. a pure refactor spike), show a `git diff`-style summary of what changed instead. Always show *something* before Phase 4.
     - **Phase 4: Decide.** Ask the go/no-go/iterate question via `AskUserQuestion`. On "Iterate": go back to Phase 2, same worktree, no new `EnterWorktree` call. On "Go" or "No-go": proceed to Phase 5.
     - **Phase 5: Cleanup.** Call `ExitWorktree(action: "remove", discard_changes: true)`.
     - **Phase 6: Learnings Note.** Now that the working directory is restored to the main tree (per `ExitWorktree`'s documented Behavior), compose and `Write` the learnings note to `thoughts/shared/prototypes/YYYY-MM-DD-<slug>.md` using the Output Format below. Tell the user the note's path. On "go", additionally tell them: "Next: invoke `/feature-architect` or `/fact-finder` and point it at this note for context — the prototype's code itself was discarded; real implementation starts fresh."
  6. **Output Format (STRICT)** section, specifying the learnings note's exact shape:
     ```markdown
     ---
     date: YYYY-MM-DD
     message_type: PROTOTYPE_NOTE
     topic: "<short name>"
     decision: go|no-go
     status: complete
     ---

     # Prototype: <Short Name>

     ## Problem
     [What question or idea this prototype was meant to answer]

     ## What Was Built
     [Brief, honest description of what was actually coded — not a spec, just a record]

     ## Outcome
     [What happened when demonstrated: worked / partially worked / didn't work, and why]

     ## Decision
     [go|no-go, one-paragraph rationale, and iteration count if more than one round happened]
     ```
     This mirrors `qa/AGENTS.md`'s 4-field low-rigor frontmatter precedent (`date`, `message_type`, target-equivalent, `status`) plus a `decision` field specific to this artifact's purpose.
  7. A closing note documenting the one known platform limitation, matching Verified Current State: if the user abandons the session entirely without reaching a decision, cleanup is not guaranteed by this skill — the harness itself will prompt to keep/remove the worktree at session exit (per `EnterWorktree`'s own documented behavior). This is stated for user awareness, not implemented as additional logic.
- **Evidence:** `EnterWorktree`/`ExitWorktree` tool schemas (Verified Current State above); `.claude/skills/feature-architect/SKILL.md:1-4` (frontmatter convention); `thoughts/shared/qa/AGENTS.md:15-23` (low-rigor artifact precedent); `thoughts/shared/features/2026-07-24-Prototype-Skill.md:44-67` (capability/non-goal source).
- **Done When:** `.claude/skills/prototype/SKILL.md` exists, is invocable as `/prototype`, and its content satisfies every bullet in step 3 above (verifiable by re-reading the file against this checklist).

### PLAN-002: Register `prototypes/` in `thoughts/shared/AGENTS.md`

- **Change Type:** modify
- **File(s):** `thoughts/shared/AGENTS.md`
- **Instruction:**
  1. Add a row to the directory-assignment table (after the `qa/` row, before `plans/`, to preserve the pipeline-order-ish grouping — exact position is not load-bearing, just keep the table's row format):
     ```markdown
     | `prototypes/` | `/prototype` | `/feature-architect`, `/fact-finder` |
     ```
  2. Add a Child DOX Index entry (after `qa/`, matching the existing three-entry format):
     ```markdown
     - [prototypes/](prototypes/AGENTS.md) — Prototype learnings notes (problem/built/outcome/decision)
     ```
  3. Update the "Currently populated" / "Currently empty" bullet (line 28-29) to include `prototypes/` under "Currently empty" (it will be populated after the first `/prototype` run, but does not exist yet at documentation time).
- **Evidence:** `thoughts/shared/AGENTS.md:17-27` (table format to match), `:37-41` (Child DOX Index format to match), `:28-29` (populated/empty bullet).
- **Done When:** The table has a `prototypes/` row with correct Written-by/Read-by columns, the Child DOX Index has a matching `prototypes/` entry linking to `prototypes/AGENTS.md`, and the populated/empty bullet mentions `prototypes/`.

### PLAN-003: Create `thoughts/shared/prototypes/AGENTS.md`

- **Change Type:** create
- **File(s):** `thoughts/shared/prototypes/AGENTS.md`
- **Instruction:** Mirror `qa/AGENTS.md`'s structure and rigor level exactly (Purpose / Ownership / Local Contracts / Work Guidance / Verification), substituting prototype-specific content:
  - **Purpose:** Stores short learnings notes produced by `/prototype` after every prototype session — the durable record of a go/no-go/iterate decision, even though the prototype's code itself is always discarded.
  - **Ownership:** `/prototype` writes (only writer). Notes are write-once after creation. Read by `/feature-architect` and `/fact-finder` on a "go" decision, as additional context.
  - **Local Contracts:** File naming `YYYY-MM-DD-<name>.md`; required frontmatter block exactly as specified in PLAN-001's Output Format (`date`, `message_type: PROTOTYPE_NOTE`, `topic`, `decision`, `status`); required body sections: Problem, What Was Built, Outcome, Decision.
  - **Work Guidance:** Notes are read-only after creation; re-running `/prototype` on a related idea creates a new dated note, never overwrites a prior one; a note's `decision` field is descriptive record-keeping, not a gate — nothing in the pipeline blocks on it.
  - **Verification:** A valid note has all four required frontmatter fields and all four required body sections; it never contains or references surviving prototype code (the code is deleted before the note is written).
- **Evidence:** `thoughts/shared/qa/AGENTS.md:1-43` (structural template to mirror); PLAN-001's Output Format (frontmatter/body contract this file documents).
- **Done When:** `thoughts/shared/prototypes/AGENTS.md` exists with all five sections (Purpose, Ownership, Local Contracts, Work Guidance, Verification) populated as specified above.

### PLAN-004: Register `prototype/` in `.claude/skills/AGENTS.md`

- **Change Type:** modify
- **File(s):** `.claude/skills/AGENTS.md`
- **Instruction:** Insert a new bullet at the top of the "Workflow skills (pipeline order):" list (before `mission-architect/`), matching the existing bullet format:
  ```markdown
  - `prototype/` — Spike an idea into disposable, isolated code and reach a go/no-go/iterate decision; optional entry point before mission-architect/feature-architect/fact-finder; output to `thoughts/shared/prototypes/`
  ```
- **Evidence:** `.claude/skills/AGENTS.md:15-22` (list format and existing bullet style to match); `CLAUDE.md:175` (DOX Protocol rule requiring this update when a skill subdirectory is added).
- **Done When:** The `prototype/` bullet appears in `.claude/skills/AGENTS.md`'s Workflow skills list, formatted identically to sibling bullets.

### PLAN-005: Document `/prototype` in `CLAUDE.md`

- **Change Type:** modify
- **File(s):** `CLAUDE.md`
- **Instruction:**
  1. In the "## Workflow Pipeline" section, add a fourth fenced-code flow after the existing three (after line 24, before the "Each stage produces artifacts..." sentence at line 26):
     ```markdown
     **Explore first (optional):**
     ```
     /prototype → (feature-architect | fact-finder)
     ```
     ```
  2. Add a row to the "Each stage produces artifacts..." table (after the `Execution` row or as a leading row — position not load-bearing):
     ```markdown
     | Prototype (optional) | `/prototype` | `thoughts/shared/prototypes/` |
     ```
  3. Add a row to the "## Workflow Skills" table (top or bottom — position not load-bearing):
     ```markdown
     | `/prototype` | Spike a rough idea into disposable, isolated code and reach a go/no-go/iterate decision (optional, before mission-architect/feature-architect/fact-finder) |
     ```
  4. In the "## Directory Structure" section's `thoughts/shared/` listing, add a line matching the existing comment style:
     ```
         prototypes/   # Prototype learnings notes from /prototype
     ```
- **Evidence:** `CLAUDE.md:9-24` (three existing flows, format to match), `:26-36` (stage table), `:42-50` (Workflow Skills table), `:117-125` (Directory Structure listing).
- **Done When:** All four edits are present in `CLAUDE.md`, each matching the formatting of its surrounding existing entries.

### PLAN-006: Add "Prototype Learnings" category to `thoughts-locator`

- **Change Type:** modify
- **File(s):** `.claude/agents/thoughts-locator.md`
- **Instruction:**
  1. In "Map of the Archive" (after the `qa/` line, before `thoughts/decisions/`), add:
     ```
     *   `thoughts/shared/prototypes/` -> Prototype learnings notes (`YYYY-MM-DD-[Name].md`)
     ```
  2. In the "Workflow" step 1 find-command examples (after the QA Reports example), add:
     ```
     *   *Prototype Notes*: `find thoughts/shared/prototypes/ -name "*csv*"`
     ```
  3. In the Output Format "answer" template (after the "### Fact Reports" example block, before "### Decisions (ADRs)"), add a matching example section:
     ```markdown
     ### Prototype Learnings
     - `thoughts/shared/prototypes/2026-01-20-csv-converter.md` - **CSV Converter Spike** (go)
     ```
  4. Update the scope-level category counts to account for the new category: `comprehensive` scope's description ("`~280 tokens, complete results`", "Sections Returned: All 8 categories") must become "All 9 categories"; the "Answer Section Format" comprehensive-scope line ("Return all 8 categories (omitting empty ones)") must become "all 9 categories".
- **Evidence:** `.claude/agents/thoughts-locator.md:47-56` (Map of the Archive — exact lines to extend), `:58-66` (Workflow examples), `:95-121` (Output Format template), `:30-34` and `:149-155` (category-count text requiring the 8→9 update).
- **Done When:** `thoughts-locator`'s Map of the Archive, Workflow examples, Output Format template, and category-count text all include/reflect the new "Prototype Learnings" / `thoughts/shared/prototypes/` category, consistent with the file's existing 8-category pattern extended to 9.

### PLAN-007: Wire the "go" handoff into `feature-architect`

- **Change Type:** modify
- **File(s):** `.claude/skills/feature-architect/SKILL.md`
- **Instruction:** In "### Phase 1: Load Existing Context", add a third Glob bullet after the existing `thoughts/shared/epics/*.md` bullet:
  ```markdown
  - `thoughts/shared/prototypes/*.md` — check for a prototype learnings note relevant to this feature; if found, treat its problem/outcome/decision as additional context (informational only — not a substitute for the mission or spec)
  ```
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:66-71` (exact Phase 1 Glob list to extend); `thoughts/shared/features/2026-07-24-Prototype-Skill.md:58` (source requirement: "that note is handed off as input to `feature-architect`/`fact-finder`").
- **Done When:** `feature-architect/SKILL.md`'s Phase 1 Glob list includes the `thoughts/shared/prototypes/*.md` bullet, worded as above.

## Verification Tasks (Assumption Requiring Manual Confirmation)

- **Assumption:** Passing `EnterWorktree(name: "prototype/<slug>")` produces a git branch literally named `prototype/<slug>` (matching the epic's "disposable `prototype/<name>` branch" requirement). The tool schema documents that `name` supports "/"-separated segments and is used to name the worktree, but does not explicitly state the resulting branch name follows the same string.
  - **Verification Step:** During the first real `/prototype` invocation (see Implementor Checklist's manual verification), before calling `ExitWorktree`, run `git branch --list 'prototype/*'` from the main tree (or `git worktree list`) and confirm the branch name matches `prototype/<slug>` exactly.
  - **Pass Condition:** Branch name matches `prototype/<slug>`. If it does not (e.g. the harness uses a different naming scheme), update PLAN-001's slug-naming instruction in `prototype/SKILL.md` to describe the observed convention instead, and note the discrepancy in that session's learnings note.

## Acceptance Criteria

- Invoking `/prototype` with a rough idea creates an isolated worktree/branch, writes code directly with no gates, and produces working code the user can inspect — with zero mission/feature/spec/epic/fact/plan artifacts and zero QA skill invocations during the session.
- The skill demonstrates a result before ever asking the go/no-go/iterate question.
- "Iterate" resumes in the same worktree without a new `EnterWorktree` call.
- After any of the three outcomes concludes the session, the worktree and branch are fully gone (`git worktree list` / `git branch` show no trace) and the user's main working tree/branch are unaffected throughout.
- A learnings note exists at `thoughts/shared/prototypes/YYYY-MM-DD-<slug>.md` after every run, with all four required frontmatter fields and four required body sections.
- On "go", `feature-architect` (via its Phase 1 Glob) and `fact-finder` (via `thoughts-locator`'s new category) can both discover and reference the note.
- `thoughts/shared/AGENTS.md`, `.claude/skills/AGENTS.md`, and `CLAUDE.md` all reflect the new skill and directory per the DOX Protocol.

## Implementor Checklist

- [ ] PLAN-001: Create `.claude/skills/prototype/SKILL.md`
- [ ] PLAN-002: Register `prototypes/` in `thoughts/shared/AGENTS.md`
- [ ] PLAN-003: Create `thoughts/shared/prototypes/AGENTS.md`
- [ ] PLAN-004: Register `prototype/` in `.claude/skills/AGENTS.md`
- [ ] PLAN-005: Document `/prototype` in `CLAUDE.md`
- [ ] PLAN-006: Add "Prototype Learnings" category to `.claude/agents/thoughts-locator.md`
- [ ] PLAN-007: Wire the "go" handoff into `.claude/skills/feature-architect/SKILL.md`
- [ ] Manual verification (per epic's Verification Plan): run `/prototype` end-to-end at least once — invoke → build → demonstrate → iterate once → decide → confirm cleanup — and check the Verification Task above (branch naming) while the worktree is still open.
