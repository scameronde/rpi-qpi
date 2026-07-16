---
date: 2026-07-16
researcher: claude
topic: "Rename the researcher skill to fact-finder, and thoughts/shared/research/ to thoughts/shared/facts/"
status: complete
coverage:
  - .claude/skills/ (all 14 skill dirs)
  - .claude/agents/ (all 6 agent files)
  - .claude/hooks/session-start
  - .claude/settings.local.json
  - Root: CLAUDE.md, AGENTS.md, README.md, GUIDE.md, ORBIT-V4-CONCEPT.md, ORBIT-V4-OKF-CONVENTION.md
  - thoughts/shared/ (all subdirectories and their AGENTS.md governance files)
  - thoughts/projects/
  - doc/ and docs/ (reference-only historical material)
  - .superpowers/brainstorm/ (historical brainstorm mockups)
  - presentation/ (ORBIT.pptx, The_Agentic_Assembly_LineV3.html, V2 pptx/pdf, V1/, old/)
---

# Research: Rename "researcher" → "fact-finder" and thoughts/shared/research/ → thoughts/shared/facts/

## Executive Summary

- The live skill directory is `.claude/skills/researcher/SKILL.md` (single file). No other files live under `.claude/skills/researcher/`.
- 48 live (non-`thoughts/`) files contain the string "researcher"/"Researcher"; 74 additional files under `thoughts/` (dated, write-once historical artifacts) also contain it.
- `thoughts/shared/research/` currently holds 29 files (28 dated reports + `AGENTS.md`) that would need to move to `thoughts/shared/facts/` if renamed as a directory `git mv`.
- `thoughts/shared/qa/` contains 5 files (4 QA reports + `AGENTS.md`) and is a separate, unaffected directory — but its `AGENTS.md` file's prose contains the string `` `/researcher` `` (referring to the tool that writes into it), which is a text occurrence that would need updating even though the `qa/` directory itself must not be renamed or moved.
- The `ORBIT-V4-CONCEPT.md` draft document (dated 2026-07-01, status "Entwurf") already proposes this exact rename: "Researcher → **Fact-Finder**" with output separated into `facts/{code,external,quality}/`. This is a draft for a future version, not yet implemented.
- The binary presentation deck `presentation/ORBIT.pptx` contains "researcher"/"research/" text in 9 of its slide XML files (slide4, slide5, slide8, slide9, slide10, slide14, slide15, slide17, slide18). The companion HTML deck `presentation/The_Agentic_Assembly_LineV3.html` contains 9 matching lines. Neither can be edited via a text-based find/replace safely without extraction/re-packaging tooling or manual editing.
- Renaming the `thoughts/shared/research/` directory would break path references to it embedded as literal strings inside dozens of already-completed, write-once historical `plans/`, `research/`, and `qa/` report files (e.g., a plan citing `thoughts/shared/research/2026-01-17-....md` as an evidence source) — those files' governing `AGENTS.md` (`thoughts/shared/plans/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`) both describe reports in this tree as "read-only after creation."

## Coverage Map

- Delegated to `codebase-locator` (comprehensive scope) for repo-wide occurrences of "researcher"/"Researcher" — 126 files, 1224 matched lines, personally spot-verified a sample via direct `grep -n`.
- Delegated to `codebase-locator` (comprehensive scope) for repo-wide occurrences of the path `thoughts/shared/research` / bare `research/` folder name, with manual filtering of generic-English false positives.
- Personally extracted and inspected text runs from `presentation/ORBIT.pptx` (via `unzip` + grep on `ppt/slides/*.xml`) and `presentation/The_Agentic_Assembly_LineV2.pptx` (zero matches — confirms it predates or is unrelated to the ORBIT pipeline naming).
- Personally read `ORBIT-V4-CONCEPT.md` and grepped `ORBIT-V4-OKF-CONVENTION.md`.
- Personally checked `.opencode/` (Node.js tooling directory — zero matches, unrelated).
- Did not extract text from `presentation/The_Agentic_Assembly_LineV2.pdf` (29MB), `presentation/old/*.pdf`, or `presentation/V1/*.pdf` — these are differently-named, differently-scoped historical decks (general AI-engineering talks, not the ORBIT pipeline deck); flagged as Open Question rather than assumed out of scope.

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: The skill directory itself is a single file
- **Observation:** `.claude/skills/researcher/` contains exactly one file, `SKILL.md`.
- **Direct consequence:** Renaming the skill is a directory rename (`.claude/skills/researcher/` → `.claude/skills/fact-finder/`) plus internal frontmatter edits inside that one file — not a multi-file restructure.
- **Evidence:** `.claude/skills/researcher/SKILL.md:2` — `name: researcher`
- **Excerpt:**
  ```
  name: researcher
  description: Map the codebase for a spec or question. Spawns codebase agents in isolated contexts — only results return to main context. Outputs a research report to thoughts/shared/research/. Use before /planner.
  ```

### Finding 2: `qa/` must NOT be renamed, but its AGENTS.md contains a "/researcher" string that would need updating
- **Observation:** `thoughts/shared/qa/AGENTS.md` documents `qa/` as written by `` `/researcher` `` in QA mode: `` `/researcher` writes (QA mode only). Reports are write-once after creation.``
- **Direct consequence:** The `qa/` directory path itself is never renamed under this task, but the substring "`/researcher`" inside `qa/AGENTS.md`'s prose is a live governance reference to the renamed skill and is a distinct edit target from the directory rename.
- **Evidence:** `thoughts/shared/qa/AGENTS.md:9`
- **Excerpt:**
  ```
  `/researcher` writes (QA mode only). Reports are write-once after creation.
  ```

### Finding 3: `thoughts/shared/AGENTS.md` documents `research/` in its directory-assignment table and file counts
- **Observation:** The parent governance file for `thoughts/shared/` has a table row `` | `research/` | `/researcher` | `/planner` | `` and a "Currently populated" sentence naming `research/` with a file count, plus a Child DOX Index entry `[research/](research/AGENTS.md)`.
- **Direct consequence:** If the directory moves to `facts/`, this table row, the populated-directories sentence, and the Child DOX Index link all become stale simultaneously and must be updated together.
- **Evidence:** `thoughts/shared/AGENTS.md:24,28,40`
- **Excerpt:**
  ```
  | `research/` | `/researcher` | `/planner` |
  ...
  **Currently populated:** `plans/` (66 files, 33 plan/STATE pairs), `research/` (28 files), `qa/` (4 files), `features/` (1 file).
  ...
  - [research/](research/AGENTS.md) — Codebase research reports
  ```

### Finding 4: `thoughts/shared/research/AGENTS.md` is the governance file that moves with the directory
- **Observation:** This file's own heading and Purpose/Ownership sections describe the directory itself ("research/ — Codebase Research Reports... `/researcher` writes; `/planner` reads.").
- **Direct consequence:** A `git mv thoughts/shared/research thoughts/shared/facts` carries this file to `thoughts/shared/facts/AGENTS.md`; its heading and internal "researcher"/"research" prose still need text edits after the move, since a directory move alone does not change file contents.
- **Evidence:** `thoughts/shared/research/AGENTS.md:1,9`
- **Excerpt:**
  ```
  # research/ — Codebase Research Reports
  ...
  `/researcher` writes; `/planner` reads. Reports are write-once after creation.
  ```

### Finding 5: Historical (dated, write-once) reports reference the literal path `thoughts/shared/research/...`
- **Observation:** Multiple files under `thoughts/shared/plans/` cite research reports by full literal path, e.g. `thoughts/shared/plans/2026-06-11-Rename-SDD-to-Implement.md` and dozens of others (full list produced by the delegated locator agent, saved in this task's scratchpad dump).
- **Direct consequence:** If the `research/` directory is renamed to `facts/`, every literal path string of the form `thoughts/shared/research/<file>.md` embedded in these already-completed plan/QA files becomes a dangling reference to a path that no longer exists, unless those strings are also rewritten.
- **Evidence:** `thoughts/shared/plans/2026-06-11-Rename-SDD-to-Implement.md:4` (representative example; dozens of similar lines exist across the `plans/` directory)
- **Excerpt:**
  ```
  - Research report(s) used: thoughts/shared/research/2026-06-11-Rename-SDD-to-Implement.md
  ```

### Finding 6: `ORBIT-V4-CONCEPT.md` already names this exact rename as a future-version decision
- **Observation:** The V4 concept draft's role-mapping table has a row mapping "Researcher" to "**Fact-Finder**" with output routed to `facts/{code,external,quality}/`.
- **Direct consequence:** The rename requested by the user matches a decision already recorded in the V4 draft; the draft's `facts/{code,external,quality}/` subdivision (three subfolders by type) is broader than a flat `facts/` folder — the user's instruction as given only specifies renaming `research/` to a flat `facts/` folder, not adopting the three-way split.
- **Evidence:** `ORBIT-V4-CONCEPT.md:124`
- **Excerpt:**
  ```
  | Researcher | **Fact-Finder** | Umbenannt. Produziert ausschließlich die *deskriptive* Ebene. Output nach Art getaggt und in `facts/{code,external,quality}/` getrennt abgelegt. Explizit erkennbar, ob Architektur-, Design- oder Bibliotheks-Fakt. |
  ```

### Finding 7: The binary presentation deck `presentation/ORBIT.pptx` contains matching text in 9 slide XML parts
- **Observation:** Extracting `<a:t>` text runs from `ppt/slides/*.xml` inside the `.pptx` (a zip archive) surfaces "researcher"/"research/" text in `slide4.xml`, `slide5.xml`, `slide8.xml`, `slide9.xml`, `slide10.xml`, `slide14.xml`, `slide15.xml`, `slide17.xml`, `slide18.xml`.
- **Direct consequence:** The slide-XML filenames (`slideN.xml`) are internal zip-part names and are not guaranteed to match the visual on-screen slide order (that ordering lives in `ppt/presentation.xml`'s `<p:sldIdLst>`, which was not inspected); a text-only edit to the `.pptx` (e.g. sed on the extracted XML) risks corrupting the OOXML structure (relationship IDs, shape IDs) if not re-zipped correctly.
- **Evidence:** `presentation/ORBIT.pptx` (zip member `ppt/slides/slide9.xml`, extracted text)
- **Excerpt:**
  ```
  Der Researcher bildet das faktenbasierte Fundament
  thoughts/shared/research/
  /researcher
  ```

### Finding 8: `presentation/The_Agentic_Assembly_LineV3.html` contains 9 matching lines, editable as plain text
- **Observation:** This is a plain HTML file (not binary), so its "researcher"/"research/" occurrences are directly text-editable.
- **Direct consequence:** Unlike the `.pptx`, this file can be safely edited with a standard text replacement pass.
- **Evidence:** `presentation/The_Agentic_Assembly_LineV3.html:566`
- **Excerpt:**
  ```
  /researcher &nbsp;→&nbsp; thoughts/shared/research/
  ```

### Finding 9: `.claude/settings.local.json` contains a historical permission string naming `researcher.md`, not a live reference
- **Observation:** Line 19 of this file is a `Bash(rm ...)` permission-allowlist entry from a prior migration (deleting old `.claude/agents/*.md` command-era files, including `researcher.md`), not a currently-active rule invoking anything.
- **Direct consequence:** This string is inert historical permission-log content; whether the planner chooses to edit or leave it is a low-priority, no-behavioral-impact decision — it does not affect any live workflow.
- **Evidence:** `.claude/settings.local.json:19`
- **Excerpt:**
  ```
  "Bash(rm .claude/agents/mission-architect.md .claude/agents/feature-architect.md .claude/agents/specifier.md .claude/agents/epic-planner.md .claude/agents/researcher.md .claude/agents/planner.md .claude/agents/implementation-controller.md .claude/agents/coder.md)",
  ```

## Detailed Technical Analysis

### Live files referencing "researcher" / "Researcher" (48 files, outside `thoughts/`)

Verified representative subset (full 276-line detail returned by the delegating locator agent and spot-checked):

- `CLAUDE.md:13,18,23,34,48,73,123,124,134`
- `AGENTS.md:62,63,64,66`
- `README.md:9,14,19,30,75`
- `GUIDE.md:16,36,39,42,45,58,65,73,74,138,143,206,220,222,225,233,255,263,277,382,386,391,409,504,550,568,642,649,669,676,691,692,716,726,733,740`
- `ORBIT-V4-CONCEPT.md:124`
- `presentation/The_Agentic_Assembly_LineV3.html:376,515,528,531,557,566,736,792,851`
- `.claude/agents/AGENTS.md:9,30`
- `.claude/skills/mission-architect/SKILL.md:48`
- `.claude/skills/feature-architect/SKILL.md:18,20,44,53,223,225,240`
- `.claude/skills/specifier/SKILL.md:40,325`
- `.claude/skills/epic-planner/SKILL.md:3,10,40,54,117,224,394,405,406,411`
- `.claude/skills/researcher/SKILL.md:2,8,46,59,69,111,121,128,244,248,580,592,623` (the skill's own file — every occurrence is inside the file being renamed)
- `.claude/skills/planner/SKILL.md:3,20,42,60,63,71,270,358,360,362,371`
- `.claude/skills/AGENTS.md:20,38` (governance)
- `.claude/skills/clean-code/SKILL.md:718,724`
- `.claude/skills/logic-bugs-qa/SKILL.md:180,268`
- `.claude/skills/python-qa/SKILL.md:119`
- `.claude/skills/typescript-qa/SKILL.md:133`
- `.claude/skills/claude-code-extensions/SKILL.md:196`
- `.claude/agents/web-search-researcher.md:2,71,155,229` (the file's own name contains "researcher" — it is a distinct agent, "the External Scout"; it is NOT the same as the `researcher` skill and is not in scope for this rename per the user's request, which named only the "researcher" skill)
- `.claude/agents/thoughts-locator.md:23,27,31`
- `.claude/agents/codebase-locator.md:47`
- `.claude/agents/codebase-analyzer.md:35`
- `.claude/hooks/session-start:12,13,18,19,20,24,27`
- `.claude/settings.local.json:19` (see Finding 9 — inert historical entry)
- `doc/agents/{researcher,planner,specifier,epic-planner,mission-architect,feature-architect,thoughts-locator,thoughts-analyzer,codebase-locator,codebase-analyzer,codebase-pattern-finder,web-search-researcher,implementation-controller}.md` — reference-only historical docs (per `CLAUDE.md`'s own directory-structure note: "`agent/` Original opencode agent definitions (reference only)"), each with 1-9 matches
- `doc/skills/{logic-bugs-qa,typescript-qa,python-qa,clean-code}.md` — same reference-only status
- `.superpowers/brainstorm/70316-1781003572/content/*.html` (5 files) — dated brainstorm mockup HTML files from an earlier design exploration
- `docs/superpowers/specs/2026-06-09-workflow-restructure-design.md` and `docs/superpowers/plans/2026-06-09-workflow-restructure.md` — dated historical design docs describing the original Command→Skill conversion that created the `researcher` skill

### Live files referencing the `thoughts/shared/research/` path or bare `research/` folder name

Verified representative subset (full detail returned by the delegating locator agent):

- `.claude/agents/thoughts-locator.md:42,43,54,114`
- `.claude/hooks/session-start:12`
- `.claude/skills/AGENTS.md:20`
- `.claude/skills/epic-planner/SKILL.md:241`
- `.claude/skills/planner/SKILL.md:20,445`
- `.claude/skills/researcher/SKILL.md:3,320,345,576,610`
- `doc/agents/{planner,researcher,thoughts-locator}.md`
- `CLAUDE.md:34,123,145`
- `GUIDE.md:223,280,393,691`
- `README.md:30`
- `docs/superpowers/plans/2026-06-09-workflow-restructure.md:277,857,968,1057,1079`
- `presentation/The_Agentic_Assembly_LineV3.html:325,539,566,580,886`
- `.superpowers/brainstorm/70316-1781003572/content/design-2-pipeline.html:64,93`
- `thoughts/projects/opencode-skill/Commands.md:31`
- `thoughts/projects/subagent-optimization/Chat.md:15,17,21`
- `thoughts/shared/AGENTS.md:24,28,40` (governance — see Finding 3)
- `thoughts/shared/features/2026-06-10-DOX-Skills.md:6,21,22`
- `thoughts/shared/plans/*.md` — dozens of files citing research reports by literal path (see Finding 5); full file-by-file line list preserved in the delegating agent's response
- `thoughts/shared/research/*.md` — self-referential mentions inside the reports that will themselves move if the directory is renamed (full file-by-file line list preserved in the delegating agent's response)

Two false positives were identified and excluded by the delegating agent (not directory-path references):
- `thoughts/shared/qa/2026-01-18-Codebase-Pattern-Finder-Agent.md:96` — compound word "research/planning", not a path
- `thoughts/shared/research/2026-01-17-OpenCode-Skills-and-Agent-Development.md:924` — an unrelated external URL containing the substring "research/"

### `presentation/ORBIT.pptx` — extracted slide text matches

- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide4.xml` line 28 (extracted): `research/`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide5.xml` line 24 (extracted): `/researcher`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide8.xml` line 19 (extracted): `Zwingende Fragen für den Researcher — unbeantwortet bleiben sie eine offene Gefahr.`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide9.xml` lines 2,7,20 (extracted): `Der Researcher bildet das faktenbasierte Fundament`, `thoughts/shared/research/`, `/researcher`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide10.xml` lines 4,8 (extracted): `thoughts/shared/research/`, `research/`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide14.xml` line 4 (extracted): `/researcher`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide15.xml` line 20 (extracted): `web-search-researcher` (this is the unrelated `web-search-researcher` agent, not the `researcher` skill — see Finding note above)
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide17.xml` line 10 (extracted): `/researcher QA`
- **Evidence:** `presentation/ORBIT.pptx` → `ppt/slides/slide18.xml` line 9 (extracted): `research/`

`slide1.xml` and `slide2.xml` matched an initial broad grep only because they contain the unrelated string "QA" (`&amp; QA`) — verified these do NOT reference "researcher"/"research/" and require no edit.

`presentation/The_Agentic_Assembly_LineV2.pptx` (30MB, a differently-scoped historical deck) was checked and contains zero matches for "researcher" — confirmed out of scope.

## Verification Log

**Verified (personally read/executed):**
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/presentation` (directory listing)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/ORBIT-V4-CONCEPT.md` (grep + prior full read in this session)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/ORBIT-V4-OKF-CONVENTION.md` (grep)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/presentation/ORBIT.pptx` (extracted and grepped all slide XML parts)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/presentation/The_Agentic_Assembly_LineV2.pptx` (extracted and grepped all slide XML parts)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/.opencode` (directory listing + grep)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/presentation/old`, `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/presentation/V1` (directory listings only)
- `/home/eichens/workspaces/experiment-ai/opencode/rpiqr/thoughts/shared/AGENTS.md`, `thoughts/shared/qa/AGENTS.md`, `thoughts/shared/research/AGENTS.md`, `.claude/agents/AGENTS.md`, `.claude/skills/AGENTS.md`, `AGENTS.md` (root), `CLAUDE.md` — all fully read in this session (prior dox-update task, same session)

**Verified via delegated sub-agents with returned file:line evidence (not independently re-read line-by-line due to volume — 1224 + 324 matched lines across 126+ files):**
- `codebase-locator` agent 1: repo-wide "researcher"/"Researcher" occurrences
- `codebase-locator` agent 2: repo-wide "research/" path occurrences

**Not verified / out of scope for this pass:**
- `presentation/The_Agentic_Assembly_LineV2.pdf` (29MB) — not extracted
- `presentation/old/*.pdf`, `presentation/V1/*.pdf` — not extracted (differently-titled historical decks, directory listing only)
- Individual line-by-line personal re-verification of all 74 historical `thoughts/` files — relied on delegated locator agent's file:line output

## Open Questions / Unverified Claims

- **Scope of `doc/`, `docs/superpowers/`, `.superpowers/brainstorm/`, and `thoughts/projects/`:** These are explicitly reference-only or dated-historical per `CLAUDE.md`'s own directory-structure notes and the write-once convention documented in `thoughts/shared/*/AGENTS.md`. Whether the rename should touch these frozen historical/reference materials (vs. leaving them as an accurate record of what existed at the time) was not resolved — this is a scope decision, not a factual gap.
- **Whether historical `thoughts/shared/plans/`, `thoughts/shared/research/`, `thoughts/shared/qa/` report bodies (as opposed to the directory path itself) should have their prose edited:** These files are documented as "read-only after creation" / "write-once" in their governing `AGENTS.md` files. Editing decades — sorry, dozens — of historical report prose to say "fact-finder" instead of "researcher" conflicts with that write-once convention. This is a scope/design decision for the planner, not a fact that can be verified further.
- **`presentation/The_Agentic_Assembly_LineV2.pdf`, `presentation/old/*.pdf`, `presentation/V1/*.pdf`:** Not extracted for text content (large files, and `V1`/`old` are differently-titled decks unrelated to "ORBIT" branding based on filenames alone). Could not verify with certainty whether they contain "researcher" mentions — flagged rather than assumed clean.
- **Whether `ppt/presentation.xml`'s `<p:sldIdLst>` slide ordering matches the `slideN.xml` filename numbering in `ORBIT.pptx`:** Not inspected. The slide-XML-part evidence above (Finding 7) is filename-accurate for the zip archive but not confirmed to match the visually-numbered slide sequence a human would see in PowerPoint.
- **Whether `web-search-researcher` (the agent) and slide15's "web-search-researcher" mention are in scope:** The user's request named only "the skill researcher"; `web-search-researcher` is a separate, differently-named agent file (`.claude/agents/web-search-researcher.md`) not mentioned by the user. Treated as out of scope pending confirmation.

## References

**Codebase Citations:**
- `.claude/skills/researcher/SKILL.md:2-3`
- `thoughts/shared/qa/AGENTS.md:9`
- `thoughts/shared/AGENTS.md:24,28,40`
- `thoughts/shared/research/AGENTS.md:1,9`
- `thoughts/shared/plans/2026-06-11-Rename-SDD-to-Implement.md:4`
- `ORBIT-V4-CONCEPT.md:124`
- `presentation/The_Agentic_Assembly_LineV3.html:566`
- `.claude/settings.local.json:19`
- `CLAUDE.md:13,18,23,34,48,73,123,124,134`
- `AGENTS.md:62-66`
- `README.md:9,14,19,30,75`
- `GUIDE.md:16,36-45,58,65,73-74,138,143,206,220-277,382-411,504,550,568,642,649,669-740`
