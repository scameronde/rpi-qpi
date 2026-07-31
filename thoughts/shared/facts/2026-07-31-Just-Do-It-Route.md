---
date: 2026-07-31
fact-finder: fact-finder-skill
topic: "Just-Do-It — Direct Execution Route for Change Briefs"
status: complete
upstream-artifact: thoughts/shared/features/2026-07-31-Just-Do-It.md
coverage:
  - .claude/skills/ — change-architect, implement (+ both prompt templates), planner, fact-finder, prototype, mission-architect, feature-architect, commit
  - .claude/agents/thoughts-locator.md
  - .claude/hooks/session-start, .claude/hooks/hooks.json
  - thoughts/shared/AGENTS.md and its plans/, facts/, prototypes/ children
  - CLAUDE.md, README.md, root AGENTS.md, CHANGELOG.md
  - scripts/build-plugin.sh
  - presentation/The_Agentic_Assembly_LineV3.html, presentation/ORBIT.pptx
---

# Research: Just-Do-It — Direct Execution Route for Change Briefs

## Executive Summary

- The proposed filename `thoughts/shared/changes/YYYY-MM-DD-Name-RECORD.md` **collides with three existing readers**, all of which would classify it as a change brief. No glob or `find` recipe anywhere in `.claude/` is anchored or extension-filtered. Only `/change-architect`'s write-once check is safe, and only incidentally.
- `thoughts/shared/AGENTS.md` asserts **no frontmatter key set for any directory**. Its `## Verification` list is two checks: a filename glob and the plan/STATE sibling-existence check. `CLAUDE.md`'s claim that the owning directory's `AGENTS.md` `## Verification` list is the only place a key set is asserted therefore resolves, for `changes/`, to **no place at all**.
- The `plans/` pair convention is **not inheritable as stated**: six of its twelve pair rules — including both frontmatter key-set assertions — exist only in `plans/AGENTS.md`, and the parent's two mutability carve-outs are textually bound to `plans/`.
- The presentation deck carries a normative claim a second exit contradicts word-for-word: `Ein Eingabe-Artefakt rein, ein Ausgabe-Artefakt raus.` The feature brief's assumption about the deck's fourth entry-point row is also wrong — that row is `QA / Audit → /fact-finder`, not `/prototype`.
- `CLAUDE.md`'s "five places" is understated. **19 files** carry pipeline-ordering, entry-point-count, or routing statements. Four of them are machine-consumed closed enumerations where a new route's artifact would silently never be found.
- **Three copies are already stale**, independent of this change: `planner/SKILL.md:483`, `prototype/SKILL.md:32`, and the deck's `research/` nodes.
- `/implement`'s review loop is **unbounded** ("Repeat until it passes"), so the feature brief's one-round cap is a deliberate divergence from the established pattern, not an instance of it.
- `scripts/build-plugin.sh` needs **no change**: it copies the whole skills tree with `cp -R`, and the existing `implement/` directory's two sibling prompt files are already carried that way.

## Coverage Map

Personally read in full: `thoughts/shared/AGENTS.md`, `.claude/skills/change-architect/SKILL.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/implement/reviewer-prompt.md`, `presentation/The_Agentic_Assembly_LineV3.html:294-398`, `.claude/skills/planner/SKILL.md:476-505`, `CHANGELOG.md` `## [Unreleased]` block.

Personally spot-verified by exact line: `AGENTS.md:66`, `README.md:30`, `.claude/hooks/session-start:24`, `scripts/build-plugin.sh:49-54`, `thoughts/shared/plans/AGENTS.md:14-17,113-121`, `.claude/skills/fact-finder/SKILL.md:567`, `.claude/skills/prototype/SKILL.md:24,32`, `.claude/skills/implement/SKILL.md:187`.

Delegated and accepted from sub-agent excerpts (not personally re-read): the remainder of `prototype/SKILL.md`, `implement/implementer-prompt.md`, `thoughts/shared/facts/AGENTS.md`, `thoughts/shared/prototypes/AGENTS.md`, `.claude/agents/thoughts-locator.md`, `mission-architect/SKILL.md:55-61`, `feature-architect/SKILL.md:16-21,24`, the deck's CSS block and slides other than 3-4, and the `ORBIT.pptx` XML text extraction.

Scope is partial in one respect: `presentation/ORBIT.pptx` and every PDF under `presentation/` were inspected only through text extraction. The V2 `.pptx` and all PDFs yield no extractable pipeline text (image-only), so they could not be searched.

## Inherited Constraints (Treated as Fixed)

| Constraint | Source | What it forbids or forces | Status |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked as `/skill-name` | `CLAUDE.md`, Claude Code Workflow | Forces `/just-do-it` into the sibling shape; forbids a different invocation mechanism | fixed — not investigated |
| Nothing compiles and there is no test suite | `CLAUDE.md`, What This Repository Is | Forbids "the tests will catch it" | fixed — not investigated |
| A skill that writes git history carries `disable-model-invocation: true` | `commit/SKILL.md:4` | Forces `/just-do-it` to be user-invoked only | fixed — not investigated |
| Artifacts are `YYYY-MM-DD-Topic.md` and write-once; the plan STATE file is the one exception | `CLAUDE.md`; `thoughts/shared/AGENTS.md:15,37` | Forces the Record's filename convention; forbids editing the executed brief | fixed — not investigated |
| `status:` describes the document, except in a STATE file where it tracks execution | `CLAUDE.md`, Artifact Frontmatter | Forces the Record's `status:` to be documented as following the STATE precedent | fixed — not investigated |
| A back-pointer names the artifact upstream; the authoring skill signs its own field | `CLAUDE.md`, Artifact Frontmatter | Forces a `just-do-it:` signature plus a `change-brief:` back-pointer | fixed — not investigated |
| The owning directory's `AGENTS.md` `## Verification` list is the only place a key set is asserted | `CLAUDE.md`, Artifact Frontmatter | Forces `route:` and the Record's key set to be asserted somewhere | **re-opened — see Critical Finding 2** |
| The plan task-field template is a contract with exactly four readers | `CLAUDE.md`, Plan File Format | Forbids reusing `implement/reviewer-prompt.md`; forces a separate reviewer prompt | fixed — not investigated |
| The pipeline definition is duplicated across five places with no tooling keeping them in sync | `CLAUDE.md` | Forces a multi-file documentation edit; forces enumeration over trust | **re-opened — see Critical Finding 4** |
| `.claude/**` is outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and four children | `CLAUDE.md`, DOX Protocol | Forbids an `AGENTS.md` for the new skill directory | fixed — not investigated |
| `/prototype` forbids every pipeline gate inside its worktree, singling out `implement` | `prototype/SKILL.md:24` | Forces `/just-do-it` into that blocklist | fixed — not investigated |
| Never edit a skill or agent file while `/implement` is mid-plan | `CLAUDE.md` | Forces this feature's own plan to hold the orchestrator's rules stable | fixed — not investigated |
| ORBIT has no mission or spec document | `inferred — Glob of missions/ and specs/ both returned empty` | Forces every constraint to cite `CLAUDE.md` or a skill file | **inferred — verified** (`ls` confirms both directories empty) |

Two rows were re-opened because verification contradicted or materially qualified them; both are recorded as Critical Findings below rather than silently corrected.

## Critical Findings (Verified, Planner Attention Required)

### 1. The `-RECORD.md` filename is indistinguishable from a change brief to three of four readers

- **Observation:** Not one reference to `thoughts/shared/changes/` anywhere in `.claude/` or `scripts/` uses an anchored or extension-filtered pattern. Every one is either a bare directory handed to `Glob`, or a `find -name "*Substring*"` recipe with wildcards on both sides.
- **Direct consequence:** A file named `2026-07-31-Topic-RECORD.md` placed in `changes/` is admitted by the store's only asserted filename check, is surfaced by `/fact-finder`'s work-order glob as a brief candidate, and is reported by `thoughts-locator` under the heading `### Change Briefs`. The four readers and their verdicts:

| Reader | Pattern | Matches `-RECORD.md`? |
|---|---|---|
| `thoughts/shared/AGENTS.md:43` | `YYYY-MM-DD-*.md` | **yes** |
| `fact-finder/SKILL.md:567` | bare directory, no filter | **yes** |
| `.claude/agents/thoughts-locator.md:65` | `find … -name "*Timeout*"` | **yes** |
| `change-architect/SKILL.md:114` | one exact target path | no — incidental to path-exactness, not a suffix rule |

- **Evidence:** `thoughts/shared/AGENTS.md:43`
- **Excerpt:**
  ```markdown
  - `ls <subdir>` — every file matches `YYYY-MM-DD-*.md`, plus `AGENTS.md` where one exists
  ```
- **Evidence:** `.claude/skills/fact-finder/SKILL.md:567`
- **Excerpt:**
  ```markdown
  2. **Otherwise glob for the work order**: `thoughts/shared/epics/` on the greenfield path, `thoughts/shared/features/` on the brownfield path, `thoughts/shared/changes/` on the small-change path. All three contain sections written *for you*:
  ```
- **Direct consequence, second order:** `thoughts/shared/AGENTS.md:15` states the convention as `YYYY-MM-DD-Topic.md` and supplies no delimiter semantics, so a `-RECORD` suffix is absorbed into `Topic`. The suffix mechanism that separates a plan from its STATE file is stated **only** in `plans/AGENTS.md:16-17`, scoped by that file's own heading to `plans/`. Nothing at the parent level knows that a suffix can denote a second artifact type in one directory.
- **Evidence:** `thoughts/shared/plans/AGENTS.md:14-17`
- **Excerpt:**
  ```markdown
  **File naming:**
  - Plans: `YYYY-MM-DD-<Topic>.md`
  - STATE files: `YYYY-MM-DD-<Topic>-STATE.md` — same base name as the plan
  - Occasional `-TESTS.md` / `-TEST-CASES.md` companions exist from earlier runs; they are plan-scoped notes, not inputs to `/implement`
  ```
- **Direct consequence:** Making the Record distinguishable requires either a filter edit at each of the three matching readers, or a location or naming scheme that does not sit inside `changes/` under a `YYYY-MM-DD-` prefix. Both are open decisions; the facts do not settle which.

### 2. `thoughts/shared/AGENTS.md` asserts no frontmatter key set, so `route:` has no established place to be asserted

- **Observation:** The parent contract's `## Verification` section contains exactly two checks, neither concerning frontmatter. The word "frontmatter" appears once in the whole file, at `:15`, and only to tie `epic-id:` to a filename.
- **Evidence:** `thoughts/shared/AGENTS.md:41-44`
- **Excerpt:**
  ```markdown
  ## Verification

  - `ls <subdir>` — every file matches `YYYY-MM-DD-*.md`, plus `AGENTS.md` where one exists
  - Each plan in `plans/` has a sibling `-STATE.md`; a plan without one predates STATE tracking, and `/implement` creates it on resume
  ```
- **Direct consequence:** For `missions/`, `specs/`, `epics/`, `features/` and `changes/` — the five directories whose contract this file is (`:53`) — the DOX tree asserts no key set at any level. `CLAUDE.md`'s statement that the owning `AGENTS.md` `## Verification` list is "the only place a key set is actually asserted" is true as a statement about where such assertions live, but for `changes/` that place is empty.
- **Observation:** The range of the established pattern across the four `## Verification` lists:

| File | Checks | Key set asserted | Form |
|---|---|---|---|
| `thoughts/shared/AGENTS.md:41-44` | 2 | no | filename glob + sibling existence |
| `plans/AGENTS.md:113-121` | 9 | yes, both pair members | keys **named**, with count and date-scoping |
| `facts/AGENTS.md:51-54` | 2 | no | body content + citation validity |
| `prototypes/AGENTS.md:38-41` | 2 | yes | **by count only**, names delegated to a template |

- **Evidence:** `thoughts/shared/plans/AGENTS.md:120-121`
- **Excerpt:**
  ```markdown
  - A valid plan's frontmatter carries all six keys: `date`, `planner`, `ticket`, `status`, `fact-source`, `upstream-artifact` — applies to plans authored 2026-07-30 or later; earlier plans carry no document frontmatter at all, which is expected, not a defect
  - A valid STATE file's frontmatter carries all three keys: `date`, `plan`, `status`
  ```
- **Direct consequence:** `plans/AGENTS.md` is the single instance of the strong form. Asserting `route:` and the Record's key set in `thoughts/shared/AGENTS.md` introduces a kind of check that file has never carried; asserting them in a new `changes/AGENTS.md` contradicts `:53` and the DOX child index at `:46-51`. Each path breaks a different existing statement, and the choice is not derivable from the code.

### 3. The `plans/` pair convention does not transfer by inheritance

- **Observation:** Of twelve rules `plans/AGENTS.md` carries about the plan/STATE pair, six exist nowhere else: the field-level writer split, the per-commit update cadence, the sibling's back-pointer duplication, the discovery/resume mechanism, and both key-set assertions. The parent's two mutability carve-outs are textually restricted to `plans/` in both places they appear.
- **Evidence:** `thoughts/shared/AGENTS.md:10,38`
- **Excerpt:**
  ```markdown
  - The `/implement` orchestrator updates STATE files in `plans/` as it commits (implementer subagents never touch STATE files directly)
  ...
  - Artifact files are read-only after creation (except STATE files in `plans/`)
  ```
- **Direct consequence:** A pair introduced in `changes/` inherits from the parent only the universal write-once default (`:11`, `:38`) and the filename glob (`:43`). Since the feature brief specifies the Record as write-once rather than mutable, the inherited default is already correct for it and no carve-out is needed — which is the one respect in which a change-brief/Record pair is simpler than the plan/STATE pair it mirrors.
- **Observation:** `thoughts/shared/AGENTS.md:32` lists `changes/` under "Empty today", but the directory does not exist on disk. The same line disclaims itself: "File counts are not a contract … `ls` is the authority, not this file."
- **Direct consequence:** Any task that writes into `changes/` creates the directory. Both `/change-architect` and `/just-do-it` reach it before it is known to exist.

### 4. Pipeline statements live in 19 files, and four of them fail silently

- **Observation:** `CLAUDE.md:101` states the ordering is duplicated in five places and `:109` calls a pipeline change "a five-file edit". An exhaustive sweep excluding `thoughts/` found 85 statements across 19 files.
- **Evidence:** `CLAUDE.md:101`
- **Excerpt:**
  ```markdown
  The ordering above is stated in five places, and no tooling keeps them in sync:
  ```
- **Direct consequence:** The five-place framing is accurate for the four canonical prose copies plus "the affected `SKILL.md`", but it collapses into that last item three scenario→route matrices, four stage→output tables, three skills-listing tables, and the closed enumerations below. A plan whose `File(s)` lists are built from the count of five is incomplete.

**The four machine-consumed closed enumerations** — an omission here does not read as stale prose, it simply never fires:

| Location | Enumeration | Failure mode |
|---|---|---|
| `fact-finder/SKILL.md:567` | three work-order directories, "All three" | a new route's artifact is never globbed |
| `planner/SKILL.md:479` | three work-order directories to `Read` | the work order is never read |
| `planner/SKILL.md:483` | fallback `Glob` over `epics/` and `features/` only | **already stale** — omits `changes/` |
| `implement/SKILL.md:238` | positive `epics/` test plus a closed skip list | mitigated by the positive test; the prose enumeration goes stale |

**Closed counting prose that becomes factually wrong** — three files say "the four above" of what would become five routes:

- **Evidence:** `AGENTS.md:66`, `README.md:30`, `.claude/hooks/session-start:24`
- **Excerpt:**
  ```markdown
  - Optional entry point: `/prototype` → one of the four above, on a "go" decision
  /prototype → then one of the four paths above, on a "go" decision
  Unsure:      /prototype → then one of the four above, on a 'go' decision
  ```
- **Direct consequence:** These three count *entry points*, not routes. Under the feature brief's framing — four entry points, a second exit on the change path — the number four remains correct in all three, and the sentences need no edit. This is the one place where the entry-point-versus-exit distinction has a mechanical payoff rather than only a presentational one.

**Additional closed enumerations that name the three architects or three target skills exhaustively:** `planner/SKILL.md:481` ("name the three skills"), `prototype/SKILL.md:3,11,86`, `.claude/hooks/session-start:16`, `CLAUDE.md:55,93,94,95,123`, `README.md:57`, `fact-finder/SKILL.md:630,634`, `presentation/The_Agentic_Assembly_LineV3.html:298`.

### 5. The presentation deck contradicts a second exit in prose, and the brief's assumption about it is wrong

- **Observation:** Slide 4's fourth entry-row is `QA / Audit → /fact-finder → QA Pipeline`. The string `prototype` does not occur anywhere in the deck's 949 lines.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:380-388`
- **Excerpt:**
  ```html
        <div class="entry-box">QA / Audit<small>Qualitätsanalyse</small></div>
        <div class="arr">→</div>
        <div class="cmd-box">/fact-finder</div>
        <div class="arr">→</div>
        <div class="result-box">QA Pipeline</div>
  ```
- **Direct consequence:** The feature brief's Integration Points describe the slide as carrying a `/prototype` row. It does not. The four rows are mission-architect, feature-architect, change-architect, and fact-finder-for-QA; `/change-architect` is row 3, inserted last cycle per `CHANGELOG.md:24`.
- **Observation:** Slide 3 carries a normative one-in-one-out claim, and every row's `.result-box` holds exactly one exit label.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:301`
- **Excerpt:**
  ```html
          Alle anderen Skills folgen der Regel: <strong>Ein Eingabe-Artefakt rein, ein Ausgabe-Artefakt raus.</strong> Kein Skill überspringt einen Schritt.
  ```
- **Direct consequence:** A change path with two exits contradicts this sentence directly, and no row in the entry-point slide's markup currently expresses a branch after `.result-box`. The stylesheet has no class for a second exit or a sub-row — the available classes are `.entry-row`, `.entry-box`, `.cmd-box`, `.result-box`, `.arr`, plus four unused generic boxes.
- **Observation, structural:** Slide geometry is fixed at 1200×675 px with `overflow: hidden` at two levels, so added content is clipped rather than scrolled. Adding a *row* touches no counter; adding a *slide* requires editing the hardcoded `16` at both `:933` and `:936` and keeping slide ids contiguous, because navigation derives the id by string concatenation `'s' + cur`.
- **Also observed, already stale and independent of this change:** the chain diagrams at `:325` and `:897` name `research/` where the directory is `facts/`; the abbreviated chain at `:437` reads `missions/ / features/` with no `changes/`; the Quick-Start terminal list at `:844-886` omits `/change-architect`; and HTML comment numbering lags the slide ids from `:743` onward.

### 6. `/implement`'s review loop is unbounded, so the one-round cap is a divergence

- **Observation:** The fix/re-review instruction carries no iteration cap, no attempt counter, and no review-specific escalation clause. The bounded ladder in that file applies to implementer `BLOCKED` status, not to review failure.
- **Evidence:** `.claude/skills/implement/SKILL.md:187`
- **Excerpt:**
  ```markdown
  **SPEC ISSUES**, **Critical**, or **Important** must be fixed before the wave commits. Re-dispatch the implementer for that task with the listed issues, then re-run the reviewer for that task only. Repeat until it passes.
  ```
- **Direct consequence:** The feature brief's "one fix round, then abandon" has no precedent in the codebase to follow; it is a new rule. Two properties of `/implement` bound the *effect* of its unbounded loop rather than the loop itself — a wave may not commit while a task is unresolved, and waves are strictly sequential — so a non-converging loop stalls the run instead of shipping. `/just-do-it` has neither property available, since it has no waves and no per-task commit gate.

### 7. `implement/reviewer-prompt.md` is largely reusable, but one instruction must be inverted rather than dropped

- **Observation:** Of the template's eight sections, Part 2 (Code Quality) is entirely free of plan-task fields, and the report block depends on a field in one line of seven. The `Verify:` machinery and `Done When` are the field-anchored parts.
- **Observation:** The template already contains the mode a brief-plus-diff reviewer permanently occupies.
- **Evidence:** `.claude/skills/implement/reviewer-prompt.md:21`
- **Excerpt:**
  ```markdown
  If the task's `Verify:` is `none — requires review`, there is no command to run and **you are the only check that exists.** The orchestrator routed this task here precisely because its `Done When` cannot be settled mechanically. Judge that condition directly against the code and say how you judged it.
  ```
- **Direct consequence:** Every `/just-do-it` review is in that state by construction, since no `Verify:` field exists to be satisfied. The whole population is `none — requires review`.
- **Observation:** One instruction exists solely because of wave concurrency and reverses outside it.
- **Evidence:** `.claude/skills/implement/reviewer-prompt.md:23`
- **Excerpt:**
  ```markdown
  Concurrent implementers worked on other files in this wave. Review **only** the files listed above; other changes in the working tree are not yours to judge.
  ```
- **Direct consequence:** With no concurrent implementer there is no other author's work in the tree, and the same reasoning that produces "review only your files" under concurrency produces "review the whole diff" without it. Dropping the line leaves the scope unstated; inverting it states it. `implement/SKILL.md:140` records that reviewers ignoring outside changes is precisely why the orchestrator's Boundary Check must exist — a check `/just-do-it` has no equivalent of.
- **Observation:** The template's `## What the Implementer Reported` section has no counterpart when the change is authored directly rather than by a dispatched subagent, and the distrust framing at `:19` ("Do not trust the implementer's report — read the actual code") is load-bearing for it.

### 8. `scripts/build-plugin.sh` requires no change

- **Observation:** The skills stage is a single recursive copy with no enumeration and no name filter. The directory count in the log line runs against the already-copied output and drives no decision.
- **Evidence:** `scripts/build-plugin.sh:49-53`
- **Excerpt:**
  ```bash
  mkdir -p "$OUT/skills"
  cp -R "$SRC/skills/." "$OUT/skills/"
  find "$OUT/skills" -name AGENTS.md -delete
  log "skills/    ($(find "$OUT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ') skills)"
  ```
- **Direct consequence:** A new skill directory carrying `SKILL.md` plus `reviewer-prompt.md` is picked up unchanged. The precedent is live: `.claude/skills/implement/` already holds two sibling prompt files, and `clean-code/references/` and `logic-bugs-qa/references/` are carried as nested subdirectories by the same copy. This confirms the conclusion the `/change-architect` run reached for its own skill.

## Detailed Technical Analysis (Verified)

### The refusal micro-grammar

Four gates exist across three skills — `/planner`'s admission gate, `/fact-finder`'s stop-before-research, and `/change-architect`'s upward escape and pre-write checklist. All four instantiate the same shape:

> bolded label or bolded condition → condition with its boolean combinator named **and** emphasised, usually restated → imperative stop scoped to the skill's own first costly step, with the un-produced artifacts enumerated → a one-sentence rationale grounded in what the *next* stage will not accept → remedy as slash-command(s) each paired with a scope selector → a forward path (resume · downgraded artifact · return to conversation) → where applicable, an exemption with an explicitly closed test list.

- **Evidence:** `.claude/skills/planner/SKILL.md:481`
- **Excerpt:**
  ```markdown
     - **Admission gate — no plan without a recorded target state.** When **both** of these hold — the fact report's `upstream-artifact:` is the literal `none`, **and** the input is not a QA report by the `### QA Report Detection` test below — **stop before writing anything**: no plan file, no STATE file, no partial artifact.
  ```

Three details bear on `/just-do-it`'s three refusal paths:

1. **The stop is placed at the skill's own first irreversible step**, not at the end of a phase — the `Write` in `/planner` and `/change-architect`, the subagent delegation in `/fact-finder`. `/just-do-it`'s equivalents are its first file modification and its commit.
2. **A "no partial" clause accompanies the stop** in both `/planner` gates: "no plan file, no STATE file, no partial artifact" (`:481`), restated at `:602` as "no plan, no STATE, no stub".
3. **Only `/change-architect:23` hands the model literal quoted speech.** `/planner` and `/fact-finder` describe the speech act in verbs and leave the wording open. No refusal anywhere in these files is expressed as a fenced block, a numbered script, or a decision table; fenced blocks are reserved for delegation patterns and output templates.

An exemption, where one exists, is specified defensively: two named detection methods, a justification, an explicit closure, and a named forbidden test with its failure mode.

- **Evidence:** `.claude/skills/planner/SKILL.md:502`
- **Excerpt:**
  ```markdown
  Test the exemption with the two methods above and nothing else — in particular **not** with `fact-source:`, which is written in four places in this file and read in none, so a rule keyed on it would silently never fire.
  ```

**Direct consequence:** the "written in N places and read in none" test is a stated method in this codebase for judging whether a proposed field can carry a rule. It applies directly to the proposed `route:` key, which must be read by `/just-do-it` for the gate to fire at all.

### `/implement`'s branch check and discard protocol

The branch rule is *stop and ask*, not a hard refusal — consent unblocks it, and branch creation is offered rather than performed.

- **Evidence:** `.claude/skills/implement/SKILL.md:32`
- **Excerpt:**
  ```markdown
  1. **Check the current branch.** Run `git rev-parse --abbrev-ref HEAD`. If the result is `main` or `master`, stop and ask the user for explicit consent before continuing. Offer to create a branch. Do not start dispatch on main or master without permission.
  ```

The discard protocol carries three distinct safety clauses: read-before-discard, stated twice; an escalate-to-user condition keyed on **unattributable diff content**, not on size or file type; and an untracked-file case handled by deletion with no mechanism prescribed.

- **Evidence:** `.claude/skills/implement/SKILL.md:156`
- **Excerpt:**
  ```markdown
  `git checkout --` is unrecoverable, and it discards the file's *whole* working state, not just the part the implementer added. Never aim it at a path you have not just read. If the diff holds anything you cannot attribute to this wave, stop and ask the user before discarding — the same rule the resume path in Pre-Flight step 4 applies to leftover changes.
  ```

**Direct consequence:** the feature brief specifies two abandonment paths that discard a working tree. The established rule attaches discarding to a prior read and to an escalation condition, both of which are stated in terms of attribution rather than volume.

### `/prototype`'s blocklist and its write-restriction list

The blocklist is a single 14-item sentence, each item backtick-quoted and bare (no leading slash), comma-separated with an Oxford `, or` before `dox-update`. Ordering is workflow skills, then QA skills, then DOX skills — neither alphabetical nor pipeline order.

- **Evidence:** `.claude/skills/prototype/SKILL.md:24`
- **Excerpt:**
  ```markdown
     While working inside the prototype worktree, never call `fact-finder`, `planner`, `implement`, `epic-planner`, `feature-architect`, `change-architect`, `specifier`, `mission-architect`, `clean-code`, `python-qa`, `typescript-qa`, `logic-bugs-qa`, `dox-init`, or `dox-update`. Full coding freedom, no gates — that is the entire point of this skill.
  ```

The `implement`-specific paragraph that follows states the consequence chain — real plan tasks committed to a branch Phase 5 deletes unconditionally, leaving the plan's STATE file silently un-advanced.

**Direct consequence:** `/just-do-it` commits, and the same chain applies to it with the Record rather than a STATE file as the silently-lost artifact. The blocklist currently omits `commit`, which writes history by the same argument.

A second list in the same file is already stale:

- **Evidence:** `.claude/skills/prototype/SKILL.md:32`
- **Excerpt:**
  ```markdown
     Never write to `thoughts/shared/missions/`, `features/`, `specs/`, `epics/`, `facts/`, `qa/`, or `plans/`. The only new artifact this skill ever produces is the learnings note in `thoughts/shared/prototypes/`.
  ```
- **Observation:** `changes/` is absent from this seven-item list, though the same file routes to `change-architect` at `:3`, `:11` and `:86`.

### `thoughts-locator`'s category count

The agent asserts 10 categories in two places (`:31`, `:165`) and its caller echoes the count at `fact-finder/SKILL.md:376`. Its archive map lists exactly 10 directory entries and its output template contains exactly 10 `###` headings, so the count is internally consistent. Change briefs are reported under `### Change Briefs` at `:111`.

**Direct consequence:** whether a Record constitutes an eleventh category or is reported under the existing heading determines whether three separate count statements move from 10 to 11.

## Verification Log

- `Verified (personally read):` `thoughts/shared/AGENTS.md`, `.claude/skills/change-architect/SKILL.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/implement/reviewer-prompt.md`, `.claude/skills/planner/SKILL.md:476-505`, `presentation/The_Agentic_Assembly_LineV3.html:294-398`, `CHANGELOG.md` `## [Unreleased]`, `AGENTS.md:58-72`, `README.md:18-30`, `.claude/hooks/session-start:6-30`, `scripts/build-plugin.sh:49-54`, `thoughts/shared/plans/AGENTS.md:14-17,113-121`, `.claude/skills/fact-finder/SKILL.md:567`, `.claude/skills/prototype/SKILL.md:18-30,32`, `.claude/skills/commit/SKILL.md:1-8`, `.claude/agents/thoughts-locator.md:51,65,111-112`
- `Accepted from sub-agent excerpts (not personally re-read):` `.claude/skills/prototype/SKILL.md` remaining lines (3, 9, 11, 34-44, 57-86, 88-120), `.claude/skills/implement/implementer-prompt.md`, `thoughts/shared/facts/AGENTS.md`, `thoughts/shared/prototypes/AGENTS.md`, `.claude/skills/mission-architect/SKILL.md:49-63`, `.claude/skills/feature-architect/SKILL.md:12,16-21,24,201`, `.claude/skills/specifier/SKILL.md:401`, `presentation/The_Agentic_Assembly_LineV3.html` CSS block (`:7-191`) and slides other than 3-4, `presentation/ORBIT.pptx` extracted slide text, `ORBIT-V5-CONCEPT.md:124-186`
- `Spot-checked excerpts captured:` yes — every excerpt in Critical Findings 1-8 was re-read at its cited line before being quoted here.

## Open Questions / Unverified Claims

- **`presentation/ORBIT.pptx` content is unverified as edited text.** The sub-agent reports that slides 4, 5, 17 and 18 name only two architects, route small changes to `/fact-finder`, and omit `/change-architect` entirely — i.e. the `.pptx` is a release behind the HTML deck. I could not confirm this with `Read`, since the file is a binary zip and the claim rests on extracted `<a:t>` runs. What is verified: the feature brief places the `.pptx` out of scope, so the discrepancy does not gate this work.
- **All PDFs under `presentation/`, and `The_Agentic_Assembly_LineV2.pptx`, could not be searched at all.** Text extraction yields nothing (V2's PDF returns 15 bytes total), so their content is image-only. Whether any of them states a pipeline ordering is unknown and unknowable by these means.
- **Whether `route:` on a change brief would be read by anything other than `/just-do-it`** was not established beyond the four readers enumerated in Critical Finding 1. Those four are the only places `changes/` is referenced in `.claude/` and `scripts/`; no reader of individual brief *fields* other than `/fact-finder`'s work-order table was traced.
- **`thoughts/shared/qa/AGENTS.md` was not read.** It is the fifth live child contract and is cited by `prototype/SKILL.md:116` as the frontmatter-shape precedent for a low-rigor four-field artifact — which is the closest existing analogue to the proposed Record's key set. It fell outside the delegated target list.
- **The `.claude/skills/just-do-it/` directory does not exist**, so no claim about its contents could be verified. All statements about it in this report are restatements of the feature brief's intent, not findings.

## References

**Codebase Citations**:
- `thoughts/shared/AGENTS.md:10,11,15,22,32,38,39,41-44,46-51,53`
- `thoughts/shared/plans/AGENTS.md:14-17,102,104,108-110,113-121`
- `.claude/skills/change-architect/SKILL.md:12,16-21,23,25,58,78,112,114,116-127,134-141,187-192`
- `.claude/skills/implement/SKILL.md:1-4,32,100,107-112,128-134,136,140,142-144,152,154,156,158,175-185,187,189,193,198-199,204,206-216,218,220,225,228,232-240,246,250,267-284`
- `.claude/skills/implement/reviewer-prompt.md:1-78`
- `.claude/skills/planner/SKILL.md:476-505,602,624-633,640,668-671,899`
- `.claude/skills/fact-finder/SKILL.md:376,567,584,628-634,674`
- `.claude/skills/prototype/SKILL.md:3,9,11,18,24,26,32,41,55,61,86,116,118-120`
- `.claude/skills/commit/SKILL.md:1-5`
- `.claude/skills/mission-architect/SKILL.md:55-61`
- `.claude/skills/feature-architect/SKILL.md:16-21,24`
- `.claude/agents/thoughts-locator.md:31,48-58,51,65,111-112,165`
- `.claude/hooks/session-start:6-16,18-24,28-30`
- `CLAUDE.md:34-56,60-70,79-87,93-95,99-109,113-123`
- `README.md:9-31,33,37-47,51-54,57,125-135`
- `AGENTS.md:61-68`
- `CHANGELOG.md:18,24,45,53`
- `scripts/build-plugin.sh:49-53`
- `presentation/The_Agentic_Assembly_LineV3.html:7-191,296-302,306-342,349-395,403,430-446,844-886,896-898,933,936-947`

**Web Research Citations**: none — this research was entirely internal to the repository.
