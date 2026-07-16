# Rename-Researcher-to-Fact-Finder Implementation Plan

## Inputs
- Research report(s) used: `thoughts/shared/research/2026-07-16-Rename-Researcher-to-Fact-Finder.md`
- User request summary: Rename the `researcher` skill to `fact-finder`, and rename `thoughts/shared/research/` to `thoughts/shared/facts/`. Do not rename `thoughts/shared/qa/`.

## Verified Current State

- **Fact:** The skill directory `.claude/skills/researcher/` contains exactly one file, `SKILL.md`, with `name: researcher` in its frontmatter.
  - **Evidence:** `.claude/skills/researcher/SKILL.md:1-4`
  - **Excerpt:**
    ```
    ---
    name: researcher
    description: Map the codebase for a spec or question. Spawns codebase agents in isolated contexts — only results return to main context. Outputs a research report to thoughts/shared/research/. Use before /planner.
    ---
    ```

- **Fact:** `thoughts/shared/research/` currently contains 29 files (28 dated reports + `AGENTS.md`).
  - **Evidence:** directory listing captured in the research report; `AGENTS.md:1,9`
  - **Excerpt:**
    ```
    # research/ — Codebase Research Reports
    ...
    `/researcher` writes; `/planner` reads. Reports are write-once after creation.
    ```

- **Fact:** `thoughts/shared/qa/` is a separate directory (4 reports + `AGENTS.md`) whose `AGENTS.md` contains the text `` `/researcher` `` describing who writes into it, without naming the `qa/` directory itself for rename.
  - **Evidence:** `thoughts/shared/qa/AGENTS.md:9`
  - **Excerpt:**
    ```
    `/researcher` writes (QA mode only). Reports are write-once after creation.
    ```

- **Fact:** `thoughts/shared/AGENTS.md` documents `research/` in its directory-assignment table, a populated-directories sentence with a file count, and a Child DOX Index entry.
  - **Evidence:** `thoughts/shared/AGENTS.md:24,28,40`
  - **Excerpt:**
    ```
    | `research/` | `/researcher` | `/planner` |
    ...
    **Currently populated:** `plans/` (66 files, 33 plan/STATE pairs), `research/` (28 files), `qa/` (4 files), `features/` (1 file).
    ...
    - [research/](research/AGENTS.md) — Codebase research reports
    ```

- **Fact:** Root `AGENTS.md` documents the pipeline using `/researcher` in three places.
  - **Evidence:** `AGENTS.md:62-66`
  - **Excerpt:**
    ```
    - Greenfield: `/mission-architect` → `/specifier` → `/epic-planner` → `/researcher` → `/planner` → `/implement`
    - Brownfield: `/feature-architect` → `/epic-planner` → `/researcher` → `/planner` → `/implement`
    - Small fix: `/researcher` → `/planner` → `/implement`

    **Key rule:** `/researcher` must precede `/planner`; `/planner` must precede `/implement`. See `CLAUDE.md` for full documentation.
    ```

- **Fact:** `CLAUDE.md` contains 7 in-scope `/researcher`/`research/`-path lines (13, 18, 23, 34, 48, 123, 124) and 2 lines (73, 134) that name the unrelated `web-search-researcher` agent and must NOT be touched.
  - **Evidence:** `CLAUDE.md:73,134`
  - **Excerpt:**
    ```
    | `web-search-researcher.md` | External knowledge and docs | general-purpose |
    ...
    Each file defines a specialized read-only or search role (Explore type) or a web researcher (general-purpose type).
    ```

- **Fact:** `GUIDE.md` has a Table-of-Contents entry linking to a heading-derived anchor for the Researcher section.
  - **Evidence:** `GUIDE.md:16,220`
  - **Excerpt:**
    ```
    - [Researcher](#4-researcher)
    ...
    ### 4. Researcher
    ```
  - **Direct consequence:** Renaming the heading text changes its GitHub-flavored-Markdown auto-generated anchor; the ToC link must be updated in the same edit or it will silently 404 within the document.

- **Fact:** `GUIDE.md` names the unrelated `web-search-researcher` agent at lines 263, 568, 642, 649, 676 — these must NOT be touched.
  - **Evidence:** `GUIDE.md:568`
  - **Excerpt:**
    ```
    ### web-search-researcher ("The External Scout")
    Answers: *What does the external documentation say?*
    ```

- **Fact:** `.claude/hooks/session-start` injects the pipeline description (including `/researcher` and `thoughts/shared/research/`) as a bash string that is escaped and emitted as `SessionStart` hook JSON — it is plain text inside a shell heredoc-style variable, safely editable with a text edit.
  - **Evidence:** `.claude/hooks/session-start:4,12-13,18-20,24,27`
  - **Excerpt:**
    ```
    /researcher — Map the codebase for a spec or question. Spawns codebase agents for isolation. Output to thoughts/shared/research/. Use before /planner.
    /planner — Write a sequenced, evidence-based implementation plan. Output to thoughts/shared/plans/. Use after /researcher.
    ...
    Greenfield:  /mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement
    Brownfield:  /feature-architect → /epic-planner → /researcher → /planner → /implement
    Small fix:   /researcher → /planner → /implement
    ...
    - Always run /researcher before /planner — planner needs a verified research report.
    ...
    - When the user says 'research X', 'understand X', or 'investigate X' → invoke /researcher.
    ```

- **Fact:** `presentation/The_Agentic_Assembly_LineV3.html` is a plain-text HTML file with 8 in-scope lines (376, 515, 528, 531, 557, 566, 736, 851) and one out-of-scope line (792, names `web-search-researcher`).
  - **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:566,792`
  - **Excerpt:**
    ```
    /researcher &nbsp;→&nbsp; thoughts/shared/research/
    ...
    <div class="fleet-item"><code>web-search-researcher</code><br>Recherchiert externe APIs, Bibliotheken und Best Practices.</div>
    ```

- **Fact:** `ORBIT-V4-CONCEPT.md` (dated 2026-07-01, status "Entwurf zur gemeinsamen Reflektion") already proposes renaming Researcher → Fact-Finder, but with a three-way `facts/{code,external,quality}/` split, which is broader than this plan's flat `facts/` rename.
  - **Evidence:** `ORBIT-V4-CONCEPT.md:124`
  - **Excerpt:**
    ```
    | Researcher | **Fact-Finder** | Umbenannt. Produziert ausschließlich die *deskriptive* Ebene. Output nach Art getaggt und in `facts/{code,external,quality}/` getrennt abgelegt. |
    ```

- **Fact:** `.claude/settings.local.json:19` contains a `Bash(rm ...)` permission-allowlist string from a prior migration naming an already-deleted `.claude/agents/researcher.md` (command-era file, not the current skill) — inert historical data with no live effect.
  - **Evidence:** `.claude/settings.local.json:19`
  - **Excerpt:**
    ```
    "Bash(rm .claude/agents/mission-architect.md .claude/agents/feature-architect.md .claude/agents/specifier.md .claude/agents/epic-planner.md .claude/agents/researcher.md .claude/agents/planner.md .claude/agents/implementation-controller.md .claude/agents/coder.md)",
    ```

- **Fact:** `.claude/skills/claude-code-extensions/SKILL.md:196` uses `researcher` as a generic illustrative placeholder name alongside a non-existent `worker` agent, demonstrating YAML `tools:` restriction syntax — not a live reference to this project's `researcher` skill.
  - **Evidence:** `.claude/skills/claude-code-extensions/SKILL.md:196`
  - **Excerpt:**
    ```
    tools: Agent(worker, researcher), Read, Bash  # Only worker and researcher
    ```

- **Fact:** `thoughts/shared/plans/`, `thoughts/shared/qa/` (report bodies), `thoughts/shared/research/` (report bodies), and `thoughts/projects/` are all documented by their own `AGENTS.md` files as "write-once" / "read-only after creation."
  - **Evidence:** `thoughts/shared/plans/AGENTS.md:9`, `thoughts/shared/qa/AGENTS.md:9`, `thoughts/shared/research/AGENTS.md:9`
  - **Excerpt:**
    ```
    - `/planner` creates plan files (write-once)
    ...
    `/researcher` writes (QA mode only). Reports are write-once after creation.
    ...
    `/researcher` writes; `/planner` reads. Reports are write-once after creation.
    ```

## Goals / Non-Goals

**Goals:**
- Rename the skill `.claude/skills/researcher/` → `.claude/skills/fact-finder/` (directory + internal `SKILL.md` prose: frontmatter `name`, persona name, and self-referential path).
- Rename the directory `thoughts/shared/research/` → `thoughts/shared/facts/` via `git mv` (preserves history, moves all 29 files as a unit).
- Update every live/active file's textual references to the skill name (`researcher`/`Researcher` → `fact-finder`/`Fact-Finder`) and to the directory path (`thoughts/shared/research/` → `thoughts/shared/facts/`), restricted to genuine references to *this* skill/directory — not the unrelated `web-search-researcher` agent, and not generic English uses of the word "research."
- Update `thoughts/shared/qa/AGENTS.md`'s `/researcher` text reference to `/fact-finder` without moving or renaming the `qa/` directory itself.
- Update every governance `AGENTS.md` file whose content is affected (root `AGENTS.md`, `.claude/skills/AGENTS.md`, `.claude/agents/AGENTS.md`, `thoughts/shared/AGENTS.md`, the moved `thoughts/shared/facts/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`).
- Update the plain-text presentation asset (`The_Agentic_Assembly_LineV3.html`) to match.

**Non-Goals (explicit exclusions):**
- Do NOT edit `presentation/ORBIT.pptx` — the user will update this presentation deck manually later, out of band from this plan.
- Do NOT implement the `ORBIT-V4-CONCEPT.md` draft's three-way `facts/{code,external,quality}/` split. This plan performs a **flat** rename only. `ORBIT-V4-CONCEPT.md` and `ORBIT-V4-OKF-CONVENTION.md` are left untouched — they are drafts for a distinct future version.
- Do NOT touch `.claude/agents/web-search-researcher.md`, or any prose anywhere that names the `web-search-researcher` agent (a separate, unrelated component).
- Do NOT edit historical/write-once report **bodies** under `thoughts/shared/plans/`, `thoughts/shared/facts/` (formerly `research/`), `thoughts/shared/qa/`, or `thoughts/projects/` — their internal prose keeps saying "research"/"researcher" as an accurate historical record; only the `research/` → `facts/` directory itself moves via `git mv`. This respects the write-once convention documented in their own `AGENTS.md` files.
- Do NOT edit `doc/`, `docs/superpowers/`, or `.superpowers/brainstorm/` — reference-only/historical material per `CLAUDE.md`'s own directory-structure notes.
- Do NOT edit `.claude/settings.local.json:19` — inert historical permission-log entry naming an already-deleted file; no functional effect either way.
- Do NOT edit `.claude/skills/claude-code-extensions/SKILL.md:196` — generic illustrative placeholder example, not a live reference to this skill.
- Do NOT edit `presentation/The_Agentic_Assembly_LineV2.pptx`, `.pdf`, `presentation/V1/`, or `presentation/old/` — confirmed unrelated/superseded decks (zero matches verified in V2 `.pptx`).
- Do NOT rename illustrative example strings such as correlation-ID examples (e.g. `research-auth-2026-01-19`) that use "research" as a generic topic-prefix convention rather than as a literal reference to the skill or directory.

## Design Overview

- **Classification rule for every text edit in this plan:** rename only (a) the exact command form `` /researcher `` → `` /fact-finder ``; (b) the proper-noun persona reference `` Researcher ``/`` the Researcher `` → `` Fact-Finder ``/`` the Fact-Finder `` when it names this skill's role; (c) the literal path `thoughts/shared/research/` (and bare `research/` used as a directory-tree entry for this same folder) → `thoughts/shared/facts/` / `facts/`; (d) the YAML `name: researcher` → `name: fact-finder`. Do not touch any line whose only match is the substring "researcher" inside `web-search-researcher`, nor generic English uses of "research" as a common noun/verb.
- **Stage-label consistency:** table rows that pair a Stage label with its Command and Output (e.g. `| Research | /researcher | thoughts/shared/research/ |`) get their Stage-label cell renamed from `Research` to `Facts` too, for consistency with the other noun-labeled stages (`Vision`, `Specification`, `Epics`, `Plan`).
- **Order of operations:** perform the two `git mv` operations first (PLAN-001, PLAN-002), then update all text references afterward — this way, if a later text-edit task is interrupted, the file moves are already durable and re-running text edits is idempotent (`grep` before editing to confirm a line still needs changing).
- **GUIDE.md heading anchor:** when the heading `### 4. Researcher` becomes `### 4. Fact-Finder`, its ToC entry `[Researcher](#4-researcher)` must become `[Fact-Finder](#4-fact-finder)` in the same task to avoid a silently broken in-document link.

## Implementation Instructions (For Implementor)

### PLAN-001: Rename the skill directory and rewrite its internal prose
- **Change Type:** modify (git mv + edits)
- **File(s):** `.claude/skills/researcher/SKILL.md` → `.claude/skills/fact-finder/SKILL.md`
- **Instruction:**
  1. `git mv .claude/skills/researcher .claude/skills/fact-finder`
  2. In `.claude/skills/fact-finder/SKILL.md`, update:
     - Line 2: `name: researcher` → `name: fact-finder`
     - Line 3: `description: ... Outputs a research report to thoughts/shared/research/. Use before /planner.` → replace `thoughts/shared/research/` with `thoughts/shared/facts/` (keep the rest of the description text; the word "research report" here is generic prose describing the output artifact type, not the directory name — leave it as prose, only the path changes)
     - Line 6 heading `# Research Architect: Codebase Mapping & Documentation` → `# Fact-Finder Architect: Codebase Mapping & Documentation`
     - Line 8: `You are the **Researcher**. You are the **Surveyor**; the **Planner** is your Architect.` → `You are the **Fact-Finder**. You are the **Surveyor**; the **Planner** is your Architect.`
     - Line 69: `the Researcher enters **QA Mode**` → `the Fact-Finder enters **QA Mode**`
     - Line 576: `Write the report to \`thoughts/shared/research/YYYY-MM-DD-[Topic].md\`.` → `thoughts/shared/facts/YYYY-MM-DD-[Topic].md`
     - Line 592, 623 (document frontmatter examples): `researcher: [identifier]` → `fact-finder: [identifier]`
     - Line 610: `Write exactly one report to: \`thoughts/shared/research/YYYY-MM-DD-[Topic].md\`` → `thoughts/shared/facts/YYYY-MM-DD-[Topic].md`
     - Line 580: `Researchers work in two communication contexts:` → `Fact-Finders work in two communication contexts:`
  3. Leave all `web-search-researcher` mentions (lines 46, 59, 111, 121, 128, 244, 248) untouched — that is a different, unrelated agent.
  4. Leave the illustrative delegation-pattern correlation-ID examples (e.g. `research-auth-2026-01-19`, lines 123, 178, 294, 317, 320, 345, 377, 386, 395, 423, 433, 508, 511, 536) untouched — generic topic-prefix naming convention, not a literal reference to this skill or directory.
- **Evidence:** `.claude/skills/researcher/SKILL.md:1-9,69,576,580,592,610,623` (full excerpts above and in Verified Current State)
- **Done When:** `.claude/skills/researcher/` no longer exists; `.claude/skills/fact-finder/SKILL.md` exists with `name: fact-finder` and no remaining "researcher"/"Researcher" text except inside untouched `web-search-researcher` mentions and untouched correlation-ID examples.

### PLAN-002: Rename the thoughts/shared/research/ directory
- **Change Type:** modify (git mv)
- **File(s):** `thoughts/shared/research/` → `thoughts/shared/facts/` (29 files)
- **Instruction:** `git mv thoughts/shared/research thoughts/shared/facts`. Do not edit any report body's internal text as part of this move (see Non-Goals) — only the directory itself relocates.
- **Evidence:** research report's directory listing (29 files: 28 dated reports + `AGENTS.md`)
- **Done When:** `thoughts/shared/research/` no longer exists; `thoughts/shared/facts/` exists containing all 29 original files with unchanged content (except `AGENTS.md`, updated in PLAN-003).

### PLAN-003: Update the moved thoughts/shared/facts/AGENTS.md governance content
- **Change Type:** modify
- **File(s):** `thoughts/shared/facts/AGENTS.md` (post-move path from PLAN-002)
- **Instruction:** After PLAN-002 has moved the file, edit its content (not its path — that already changed):
  - Line 1 heading: `# research/ — Codebase Research Reports` → `# facts/ — Codebase Fact Reports`
  - Line 5 (Purpose, if it says "Stores factual codebase research reports produced by `/researcher`..."): change `/researcher` → `/fact-finder`, and "research reports" → "fact reports" where it refers to this directory's content type
  - Line 9 (Ownership): `` `/researcher` writes; `/planner` reads. `` → `` `/fact-finder` writes; `/planner` reads. ``
  - Any remaining body text that names the directory as `research/` (e.g. naming convention examples) → `facts/`
- **Evidence:** `thoughts/shared/research/AGENTS.md:1,9` (pre-move; excerpt in Verified Current State)
- **Done When:** `thoughts/shared/facts/AGENTS.md` heading reads `# facts/ — ...`, and contains no remaining unqualified `/researcher` or `research/`-as-this-directory references.

### PLAN-004: Update thoughts/shared/qa/AGENTS.md's /researcher reference (directory NOT renamed)
- **Change Type:** modify
- **File(s):** `thoughts/shared/qa/AGENTS.md`
- **Instruction:** On line 9, change `` `/researcher` writes (QA mode only). Reports are write-once after creation. `` → `` `/fact-finder` writes (QA mode only). Reports are write-once after creation. `` Do not rename, move, or otherwise touch the `qa/` directory itself or any other file inside it.
- **Evidence:** `thoughts/shared/qa/AGENTS.md:9`
- **Done When:** line 9 reads `/fact-finder`; `thoughts/shared/qa/` still exists at its original path with all 5 files (4 reports + `AGENTS.md`) unchanged otherwise.

### PLAN-005: Update thoughts/shared/AGENTS.md governance content
- **Change Type:** modify
- **File(s):** `thoughts/shared/AGENTS.md`
- **Instruction:**
  - Line 24 table row: `` | `research/` | `/researcher` | `/planner` | `` → `` | `facts/` | `/fact-finder` | `/planner` | ``
  - Line 28: `` **Currently populated:** `plans/` (66 files, 33 plan/STATE pairs), `research/` (28 files), `qa/` (4 files), `features/` (1 file). `` → replace `` `research/` (28 files) `` with `` `facts/` (29 files, including AGENTS.md) `` — note the count includes `facts/AGENTS.md`, so correct the number to 29 to match the actual file count (28 reports + `AGENTS.md`), consistent with how `plans/` and `qa/` are counted in this same sentence (their counts also include AGENTS.md-adjacent files per the sentence's existing convention — verify this against `ls thoughts/shared/facts | wc -l` before finalizing the number)
  - Line 40: `` - [research/](research/AGENTS.md) — Codebase research reports `` → `` - [facts/](facts/AGENTS.md) — Codebase fact reports ``
- **Evidence:** `thoughts/shared/AGENTS.md:24,28,40`
- **Done When:** no line in this file contains `research/` or `/researcher`; the Child DOX Index link resolves to the existing `thoughts/shared/facts/AGENTS.md`.

### PLAN-006: Update .claude/skills/AGENTS.md skill listing
- **Change Type:** modify
- **File(s):** `.claude/skills/AGENTS.md`
- **Instruction:**
  - Line 20: `` - `researcher/` — Map codebase or research topic; output to `thoughts/shared/research/` or `thoughts/shared/qa/` `` → `` - `fact-finder/` — Map codebase or research topic; output to `thoughts/shared/facts/` or `thoughts/shared/qa/` ``
  - Line 38: `- Workflow ordering is enforced: researcher must precede planner; planner must precede /implement` → `- Workflow ordering is enforced: fact-finder must precede planner; planner must precede /implement`
- **Evidence:** `.claude/skills/AGENTS.md:20,38`
- **Done When:** file contains `fact-finder/` and `thoughts/shared/facts/`, no remaining `researcher`/`research/` text.

### PLAN-007: Update .claude/agents/AGENTS.md
- **Change Type:** modify
- **File(s):** `.claude/agents/AGENTS.md`
- **Instruction:** Line 9: `` Agents are consumed by skills. The `researcher` skill uses all five codebase/web agents. `` → `` Agents are consumed by skills. The `fact-finder` skill uses all five codebase/web agents. `` Leave line 30 (`web-search-researcher.md` description) untouched.
- **Evidence:** `.claude/agents/AGENTS.md:9,30`
- **Done When:** line 9 reads `fact-finder`; line 30 unchanged.

### PLAN-008: Update root AGENTS.md pipeline references
- **Change Type:** modify
- **File(s):** `AGENTS.md` (repo root)
- **Instruction:** Lines 62-66: replace every `` /researcher `` with `` /fact-finder ``:
  ```
  - Greenfield: /mission-architect → /specifier → /epic-planner → /fact-finder → /planner → /implement
  - Brownfield: /feature-architect → /epic-planner → /fact-finder → /planner → /implement
  - Small fix: /fact-finder → /planner → /implement

  Key rule: /fact-finder must precede /planner; /planner must precede /implement.
  ```
- **Evidence:** `AGENTS.md:62-66`
- **Done When:** no `/researcher` remains in this file.

### PLAN-009: Update .claude/agents/thoughts-locator.md
- **Change Type:** modify
- **File(s):** `.claude/agents/thoughts-locator.md`
- **Instruction:**
  - Lines 23, 27, 31: `Researcher needs only one document type` / `Researcher needs 2-3 document types` / `Researcher exploring all historical context` → replace `Researcher` with `Fact-Finder` in each
  - Lines 42-43 (bad/good path examples): `thoughts/searchable/shared/research/api.md` → `thoughts/searchable/shared/facts/api.md`; `thoughts/shared/research/api.md` → `thoughts/shared/facts/api.md`
  - Line 54: `` `thoughts/shared/research/` -> Research reports (`YYYY-MM-DD-[Topic].md`) `` → `` `thoughts/shared/facts/` -> Fact reports (`YYYY-MM-DD-[Topic].md`) ``
  - Line 114: `` `thoughts/shared/research/2025-11-20-oauth.md` - **OAuth Analysis** `` → `` `thoughts/shared/facts/2025-11-20-oauth.md` - **OAuth Analysis** ``
- **Evidence:** `.claude/agents/thoughts-locator.md:23,27,31,42-43,54,114`
- **Done When:** no remaining `research/` (as this directory) or bare "Researcher" persona reference in this file.

### PLAN-010: Update .claude/agents/codebase-locator.md
- **Change Type:** modify
- **File(s):** `.claude/agents/codebase-locator.md`
- **Instruction:** Line 47: `Researcher agents needing full topology (default)` → `Fact-Finder agents needing full topology (default)`
- **Evidence:** `.claude/agents/codebase-locator.md:47`
- **Done When:** line 47 reads "Fact-Finder agents."

### PLAN-011: Update .claude/agents/codebase-analyzer.md
- **Change Type:** modify
- **File(s):** `.claude/agents/codebase-analyzer.md`
- **Instruction:** Line 35: `invoked by primary agents (Researcher, Planner, Implementation-Controller)` → `invoked by primary agents (Fact-Finder, Planner, Implementation-Controller)`
- **Evidence:** `.claude/agents/codebase-analyzer.md:35`
- **Done When:** line 35 reads "Fact-Finder, Planner, Implementation-Controller."

### PLAN-012: Update .claude/skills/mission-architect/SKILL.md
- **Change Type:** modify
- **File(s):** `.claude/skills/mission-architect/SKILL.md`
- **Instruction:** Line 48: `redirect them to the Researcher → Planner workflow.` → `redirect them to the Fact-Finder → Planner workflow.`
- **Evidence:** `.claude/skills/mission-architect/SKILL.md:48`
- **Done When:** line 48 reads "Fact-Finder → Planner workflow."

### PLAN-013: Update .claude/skills/feature-architect/SKILL.md
- **Change Type:** modify
- **File(s):** `.claude/skills/feature-architect/SKILL.md`
- **Instruction:** Update every "Researcher"/"researcher" persona reference to "Fact-Finder"/"fact-finder":
  - Line 18: `` | Small change or extension to existing functionality | `researcher` → `planner` directly | `` → `` | ... | `fact-finder` → `planner` directly | ``
  - Line 20: `"...going straight to the Researcher → Planner workflow..."` → `"...going straight to the Fact-Finder → Planner workflow..."`
  - Line 44: `The Epic Planner and Researcher depend on knowing what's fixed.` → `...and Fact-Finder depend on knowing what's fixed.`
  - Line 53: `(not deep analysis — that's the Researcher's job)` → `that's the Fact-Finder's job`
  - Line 223 heading: `## Open Questions for Researcher` → `## Open Questions for Fact-Finder`
  - Line 225: `Before planning implementation, the Researcher should investigate:` → `...the Fact-Finder should investigate:`
  - Line 240: `The Researcher depends on your integration points to know where to look.` → `The Fact-Finder depends on...`
- **Evidence:** `.claude/skills/feature-architect/SKILL.md:18,20,44,53,223,225,240`
- **Done When:** no remaining "Researcher"/"researcher" text in this file.

### PLAN-014: Update .claude/skills/specifier/SKILL.md
- **Change Type:** modify
- **File(s):** `.claude/skills/specifier/SKILL.md`
- **Instruction:**
  - Line 40: `The Planner (and Researcher) will:` → `The Planner (and Fact-Finder) will:`
  - Line 325: `**Deferred Decisions** (for Planner/Researcher):` → `**Deferred Decisions** (for Planner/Fact-Finder):`
- **Evidence:** `.claude/skills/specifier/SKILL.md:40,325`
- **Done When:** both lines updated.

### PLAN-015: Update .claude/skills/epic-planner/SKILL.md
- **Change Type:** modify
- **File(s):** `.claude/skills/epic-planner/SKILL.md`
- **Instruction:**
  - Line 3 (frontmatter description): `...Use after /specifier and before /researcher.` → `...before /fact-finder.`
  - Line 10: `...fed to the Researcher and Planner agents.` → `...fed to the Fact-Finder and Planner agents.`
  - Line 40: `**Research Questions for Researcher**: ...` → `**Research Questions for Fact-Finder**: ...`
  - Line 54: `Search the codebase (the Researcher will do that).` → `(the Fact-Finder will do that).`
  - Line 117: `What does the Researcher need to find in the codebase?` → `What does the Fact-Finder need to find...`
  - Line 224 heading: `## Research Questions for Researcher` → `## Research Questions for Fact-Finder`
  - Line 241: `` **Output Expected**: Research report in `thoughts/shared/research/YYYY-MM-DD-[Epic-Name].md` `` → `` Fact report in `thoughts/shared/facts/YYYY-MM-DD-[Epic-Name].md` ``
  - Line 394: `I have defined research questions that the Researcher can answer.` → `...that the Fact-Finder can answer.`
  - Line 405: `bridge between specification (Specifier) and execution (Researcher → Planner → Implementor).` → `(Fact-Finder → Planner → Implementor).`
  - Line 406: `Decomposed enough that the Researcher can explore one area at a time.` → `...that the Fact-Finder can explore...`
  - Line 411: `The Researcher and Planner depend on you getting this right.` → `The Fact-Finder and Planner depend on you getting this right.`
- **Evidence:** `.claude/skills/epic-planner/SKILL.md:3,10,40,54,117,224,241,394,405,406,411`
- **Done When:** no remaining "Researcher"/"researcher"/`thoughts/shared/research/` text in this file.

### PLAN-016: Update .claude/skills/planner/SKILL.md
- **Change Type:** modify
- **File(s):** `.claude/skills/planner/SKILL.md`
- **Instruction:**
  - Line 3 (frontmatter description): `...Outputs plan + state files to thoughts/shared/plans/. Use after /researcher and before /implement.` → `...Use after /fact-finder and before /implement.`
  - Line 20: `You MUST begin by reading the most recent Researcher report in \`thoughts/shared/research/\`.` → `...most recent Fact-Finder report in \`thoughts/shared/facts/\`.`
  - Line 270: `This makes \`thoughts-locator\` less critical for you than for the Researcher agent` → `...than for the Fact-Finder agent`
  - Line 358: `### Difference from Researcher Usage` → `### Difference from Fact-Finder Usage`
  - Lines 360, 362: `**Researcher**: Needs \`thoughts-locator\`...` and `**Researcher**: Uses \`comprehensive\` depth...` → `**Fact-Finder**: ...` (both lines)
  - Line 371: `Use \`Glob\` + \`Read\` to find and read the latest relevant Researcher report(s).` → `...latest relevant Fact-Finder report(s).`
  - Line 445: `` Research report(s) used: `thoughts/shared/research/...` `` (template example) → `` Fact report(s) used: `thoughts/shared/facts/...` ``
  - Leave lines 42, 60, 63, 71 (`web-search-researcher` delegation section) untouched.
- **Evidence:** `.claude/skills/planner/SKILL.md:3,20,42,60,63,71,270,358,360,362,371,445`
- **Done When:** no remaining "Researcher"/"researcher"/`thoughts/shared/research/` text outside the untouched `web-search-researcher` section.

### PLAN-017: Update .claude/skills/clean-code/SKILL.md
- **Change Type:** modify
- **File(s):** `.claude/skills/clean-code/SKILL.md`
- **Instruction:** Lines 718 and 724 are example dialogue lines: `Researcher: "Analyze Python code quality for src/auth/"` and `Researcher: "Analyze code design for src/auth/"` → change the speaker label `Researcher:` to `Fact-Finder:` in both.
- **Evidence:** `.claude/skills/clean-code/SKILL.md:718,724`
- **Done When:** both example lines use `Fact-Finder:` as the speaker label.

### PLAN-018: Update CLAUDE.md
- **Change Type:** modify
- **File(s):** `CLAUDE.md`
- **Instruction:**
  - Line 13: `/mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement` → replace `/researcher` with `/fact-finder`
  - Line 18: `/feature-architect → /epic-planner → /researcher → /planner → /implement` → same replacement
  - Line 23: `/researcher → /planner → /implement` → same replacement
  - Line 34: `` | Research | `/researcher` | `thoughts/shared/research/` or `thoughts/shared/qa/` | `` → `` | Facts | `/fact-finder` | `thoughts/shared/facts/` or `thoughts/shared/qa/` | ``
  - Line 48: `` | `/researcher` | Map the codebase relevant to a spec or question | `` → `` | `/fact-finder` | ... | ``
  - Line 123: `    research/     # Codebase research from /researcher` → `    facts/        # Codebase facts from /fact-finder`
  - Line 124: `    qa/           # QA research from /researcher` → `    qa/           # QA research from /fact-finder`
  - Leave lines 73 (`web-search-researcher.md` table row) and 134 (generic "a web researcher (general-purpose type)" prose) untouched.
- **Evidence:** `CLAUDE.md:13,18,23,34,48,73,123,124,134`
- **Done When:** no `/researcher` or `research/`-as-this-directory text remains outside lines 73 and 134.

### PLAN-019: Update README.md
- **Change Type:** modify
- **File(s):** `README.md`
- **Instruction:**
  - Line 9: `/mission-architect → /specifier → /epic-planner → /researcher → /planner → /implement` → replace `/researcher` with `/fact-finder`
  - Line 14: `/feature-architect → /epic-planner → /researcher → /planner → /implement` → same
  - Line 19: `/researcher → /planner → /implement` → same
  - Line 30: `` | Research | `/researcher` | `thoughts/shared/research/` | `` → `` | Facts | `/fact-finder` | `thoughts/shared/facts/` | ``
  - Line 75: `` | `/researcher` | Map the codebase or investigate a topic before planning | `` → `` | `/fact-finder` | ... | ``
- **Evidence:** `README.md:9,14,19,30,75`
- **Done When:** no `/researcher` or `thoughts/shared/research/` text remains in this file.

### PLAN-020: Update GUIDE.md
- **Change Type:** modify
- **File(s):** `GUIDE.md`
- **Instruction:**
  - Line 16: `- [Researcher](#4-researcher)` → `- [Fact-Finder](#4-fact-finder)`
  - Lines 36, 39, 42, 45, 58, 65, 73, 74: replace `/researcher` with `/fact-finder` in each pipeline diagram/table line
  - Line 138: `Open questions for the Researcher` → `Open questions for the Fact-Finder`
  - Line 143: `skip to \`/researcher\` directly.` → `skip to \`/fact-finder\` directly.`
  - Line 206: `**Research questions for the Researcher**` → `**Research questions for the Fact-Finder**`
  - Line 220: `### 4. Researcher` → `### 4. Fact-Finder` (heading — also update line 16's anchor as noted above)
  - Line 222: `**Command:** \`/researcher\`` → `**Command:** \`/fact-finder\``
  - Line 223: `**Output:** \`thoughts/shared/research/YYYY-MM-DD-[Topic].md\`` → `thoughts/shared/facts/YYYY-MM-DD-[Topic].md`
  - Line 225: `The Researcher maps the codebase...` → `The Fact-Finder maps the codebase...`
  - Line 233: `Driven by the epic's research questions, the Researcher will:` → `...the Fact-Finder will:`
  - Line 255: `#### Subagents the Researcher delegates to` → `#### Subagents the Fact-Finder delegates to`
  - Line 277: `The Researcher also runs in QA mode...` → `The Fact-Finder also runs in QA mode...`
  - Line 280: `Outputs to \`thoughts/shared/qa/\` instead of \`thoughts/shared/research/\`` → `instead of \`thoughts/shared/facts/\``
  - Line 382: `/researcher (QA mode) → /planner (QA mode) → /implement` → `/fact-finder (QA mode) → ...`
  - Line 386: `Run \`/researcher\` with any QA-related keywords:` → `Run \`/fact-finder\` with any QA-related keywords:`
  - Line 391: `The Researcher detects the QA intent...` → `The Fact-Finder detects the QA intent...`
  - Line 393: `\`thoughts/shared/qa/\` (not \`thoughts/shared/research/\`)` → `(not \`thoughts/shared/facts/\`)`
  - Line 409: `Skills are loaded by the Researcher during QA mode.` → `...by the Fact-Finder during QA mode.`
  - Line 504: `(Researcher, Planner, QA skills)` → `(Fact-Finder, Planner, QA skills)`
  - Line 550: `Note: Only used by the Researcher.` → `Note: Only used by the Fact-Finder.`
  - Line 669 (sequential-thinking usage table row): `| researcher | Decomposing a research topic into investigation vectors |` → `| fact-finder | Decomposing a research topic into investigation vectors |`
  - Line 691: `    research/    # /researcher output          — YYYY-MM-DD-[Topic].md` → `    facts/       # /fact-finder output         — YYYY-MM-DD-[Topic].md`
  - Line 692: `    qa/          # /researcher QA mode output  — YYYY-MM-DD-[Target].md` → `    qa/          # /fact-finder QA mode output — YYYY-MM-DD-[Target].md`
  - Lines 716, 726, 733, 740: replace `/researcher` with `/fact-finder` in each cheat-sheet line
  - Leave lines 263, 568, 642, 649, 676 (all naming `web-search-researcher`) untouched.
- **Evidence:** `GUIDE.md:16,36-45,58,65,73-74,138,143,206,220-280,382-409,504,550,568,642,649,669-740` (excerpts in Verified Current State and research report)
- **Done When:** no remaining `/researcher`, bare "Researcher" persona reference, or `thoughts/shared/research/` text outside the five untouched `web-search-researcher` lines; the ToC anchor link resolves to the renamed heading.

### PLAN-021: Update .claude/hooks/session-start
- **Change Type:** modify
- **File(s):** `.claude/hooks/session-start`
- **Instruction:** Inside the `context="..."` bash string (lines 4-28), replace every occurrence of `/researcher` with `/fact-finder` and `thoughts/shared/research/` with `thoughts/shared/facts/`:
  - Line 12: `/researcher — Map the codebase...Output to thoughts/shared/research/. Use before /planner.` → `/fact-finder — ...Output to thoughts/shared/facts/. Use before /planner.`
  - Line 13: `...Use after /researcher.` → `...Use after /fact-finder.`
  - Lines 18, 19, 20 (pipeline ordering diagrams): replace `/researcher` with `/fact-finder`
  - Line 24: `Always run /researcher before /planner...` → `Always run /fact-finder before /planner...`
  - Line 27: `When the user says 'research X', 'understand X', or 'investigate X' → invoke /researcher.` → `→ invoke /fact-finder.`
  - Do not alter the `escape_for_json` function body (lines 30-38) — it contains no skill-name text.
- **Evidence:** `.claude/hooks/session-start:4,12-13,18-20,24,27`
- **Done When:** the emitted JSON (test via running the script and inspecting stdout) contains `/fact-finder` and `thoughts/shared/facts/` with no remaining `/researcher` or `thoughts/shared/research/`.

### PLAN-022: Update presentation/The_Agentic_Assembly_LineV3.html
- **Change Type:** modify
- **File(s):** `presentation/The_Agentic_Assembly_LineV3.html`
- **Instruction:**
  - Line 376: `<div class="cmd-box">/researcher</div>` → `<div class="cmd-box">/fact-finder</div>`
  - Line 515: `Zwingende Fragen für den Researcher — ...` → `Zwingende Fragen für den Fact-Finder — ...`
  - Line 528 (HTML comment): `<!-- SLIDE 8 · Phase 4 — Researcher -->` → `<!-- SLIDE 8 · Phase 4 — Fact-Finder -->`
  - Line 531: `Phase 4: Der Researcher bildet das faktenbasierte Fundament` → `Phase 4: Der Fact-Finder bildet das faktenbasierte Fundament`
  - Line 557: `<div class="box-navy" ...>/researcher</div>` → `/fact-finder`
  - Line 566: `/researcher &nbsp;→&nbsp; thoughts/shared/research/` → `/fact-finder &nbsp;→&nbsp; thoughts/shared/facts/`
  - Line 736: `Trigger: /researcher<br>mit <strong>QA-Keywords</strong>` → `Trigger: /fact-finder<br>...`
  - Line 851: `<span class="term-cmd">/researcher QA</span>` → `<span class="term-cmd">/fact-finder QA</span>`
  - Leave line 792 (`web-search-researcher` fleet-item) untouched.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:376,515,528,531,557,566,736,792,851`
- **Done When:** no `/researcher`, "Researcher" persona text, or `thoughts/shared/research/` remains outside line 792.

## Verification Tasks

- **Assumption:** The `git mv` of `thoughts/shared/research` → `thoughts/shared/facts` will not conflict with any open file handles or uncommitted work.
  - **Verification Step:** Run `git status` before starting; confirm a clean working tree in `thoughts/shared/research/`.
  - **Pass Condition:** No uncommitted changes reported in that directory before the move.

- **Assumption:** After all text edits, no live-file reference to "researcher" or "shared/research" remains outside the explicitly excluded historical/reference paths.
  - **Verification Step:** Run:
    ```bash
    grep -rn "researcher" . \
      --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist \
      --exclude-dir=thoughts/shared/plans --exclude-dir=thoughts/shared/facts \
      --exclude-dir=thoughts/shared/qa --exclude-dir=thoughts/projects \
      --exclude-dir=doc --exclude-dir=docs --exclude-dir=.superpowers \
      | grep -vi "web-search-researcher"
    ```
    and
    ```bash
    grep -rn "shared/research" . \
      --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist \
      --exclude-dir=thoughts/shared/plans --exclude-dir=thoughts/shared/facts \
      --exclude-dir=thoughts/shared/qa --exclude-dir=thoughts/projects \
      --exclude-dir=doc --exclude-dir=docs --exclude-dir=.superpowers
    ```
  - **Pass Condition:** Both commands return zero matches (aside from `.claude/settings.local.json:19` and `.claude/skills/claude-code-extensions/SKILL.md:196`, both explicitly excluded by design — see Non-Goals).

- **Assumption:** `thoughts/shared/qa/` was not moved or renamed.
  - **Verification Step:** `ls thoughts/shared/qa/` and `git status` — confirm the directory exists at its original path with its original 5 files, and `git status` shows no rename/move for this path.
  - **Pass Condition:** Directory present at `thoughts/shared/qa/`, unchanged except `AGENTS.md` content (PLAN-004).

- **Assumption:** The skill rename is complete and the old path is gone.
  - **Verification Step:** `test -d .claude/skills/researcher && echo STILL EXISTS || echo GONE`; `test -f .claude/skills/fact-finder/SKILL.md && echo EXISTS`.
  - **Pass Condition:** `GONE` and `EXISTS` respectively.

## Acceptance Criteria

- [ ] `.claude/skills/researcher/` no longer exists; `.claude/skills/fact-finder/SKILL.md` exists with `name: fact-finder`.
- [ ] `thoughts/shared/research/` no longer exists; `thoughts/shared/facts/` exists with all 29 original files.
- [ ] `thoughts/shared/qa/` exists unchanged at its original path (only its `AGENTS.md` content updated).
- [ ] All governance `AGENTS.md` files (root, `.claude/skills/`, `.claude/agents/`, `thoughts/shared/`, `thoughts/shared/facts/`, `thoughts/shared/qa/`) reflect the new names and paths.
- [ ] `CLAUDE.md`, `README.md`, `GUIDE.md`, root `AGENTS.md`, and `.claude/hooks/session-start` reference `/fact-finder` and `thoughts/shared/facts/` wherever they previously referenced `/researcher` and `thoughts/shared/research/`.
- [ ] `presentation/The_Agentic_Assembly_LineV3.html` reflects the rename on its affected sections.
- [ ] `presentation/ORBIT.pptx` is left untouched (user will update it manually later).
- [ ] `web-search-researcher` (agent, and all its mentions) is entirely untouched.
- [ ] Historical report bodies under `thoughts/shared/plans/`, `thoughts/shared/facts/`, `thoughts/shared/qa/`, and `thoughts/projects/` are untouched (only the `research/`→`facts/` directory itself moved).
- [ ] `ORBIT-V4-CONCEPT.md`, `ORBIT-V4-OKF-CONVENTION.md`, `doc/`, `docs/superpowers/`, and `.superpowers/brainstorm/` are untouched.
- [ ] The verification greps in "Verification Tasks" return zero unexpected matches.

## Implementor Checklist

- [ ] PLAN-001: Rename skill directory `.claude/skills/researcher/` → `.claude/skills/fact-finder/` + rewrite internal prose
- [ ] PLAN-002: `git mv thoughts/shared/research thoughts/shared/facts`
- [ ] PLAN-003: Update moved `thoughts/shared/facts/AGENTS.md` content
- [ ] PLAN-004: Update `thoughts/shared/qa/AGENTS.md` line 9 (`/researcher` → `/fact-finder`)
- [ ] PLAN-005: Update `thoughts/shared/AGENTS.md` (table row, file count, Child DOX Index)
- [ ] PLAN-006: Update `.claude/skills/AGENTS.md` skill listing
- [ ] PLAN-007: Update `.claude/agents/AGENTS.md` line 9
- [ ] PLAN-008: Update root `AGENTS.md` pipeline lines 62-66
- [ ] PLAN-009: Update `.claude/agents/thoughts-locator.md`
- [ ] PLAN-010: Update `.claude/agents/codebase-locator.md` line 47
- [ ] PLAN-011: Update `.claude/agents/codebase-analyzer.md` line 35
- [ ] PLAN-012: Update `.claude/skills/mission-architect/SKILL.md` line 48
- [ ] PLAN-013: Update `.claude/skills/feature-architect/SKILL.md`
- [ ] PLAN-014: Update `.claude/skills/specifier/SKILL.md`
- [ ] PLAN-015: Update `.claude/skills/epic-planner/SKILL.md`
- [ ] PLAN-016: Update `.claude/skills/planner/SKILL.md`
- [ ] PLAN-017: Update `.claude/skills/clean-code/SKILL.md`
- [ ] PLAN-018: Update `CLAUDE.md`
- [ ] PLAN-019: Update `README.md`
- [ ] PLAN-020: Update `GUIDE.md` (incl. ToC anchor fix)
- [ ] PLAN-021: Update `.claude/hooks/session-start`
- [ ] PLAN-022: Update `presentation/The_Agentic_Assembly_LineV3.html`
- [ ] Run Verification Tasks (repo-wide grep sweep + qa/ untouched check + skill-path check)
