---
date: 2026-07-24
feature-architect: feature-architect-skill
mission-source: "n/a — framework repo, no separate mission document"
spec-source: "n/a — framework repo, no separate spec document"
feature-name: "Prototype Skill"
type: "feature-addition"
status: complete
---

# Feature Brief: Prototype Skill

## System Context

**Project**: rpiqr (ORBIT) — Claude Code Workflow Toolkit
**Core purpose**: A structured agentic development pipeline (`mission-architect` → `specifier` → `epic-planner` → `fact-finder` → `planner` → `implement`, plus a brownfield variant via `feature-architect`) that takes an idea from vision to reviewed, committed code through explicit artifacts at every stage.
**Relevant existing components**:
- `.claude/skills/` — the extension point; each skill is a `SKILL.md` directory invoked via `/skill-name` (see `.claude/skills/AGENTS.md`)
- `thoughts/shared/` — the artifact store; every pipeline stage writes a durable, write-once markdown artifact here, named `YYYY-MM-DD-Topic.md` (see `thoughts/shared/AGENTS.md`)
- `implement/` skill — the only stage that currently produces real commits; runs implementer + spec-reviewer + code-quality-reviewer subagents per task
- The Agent tool's `isolation: "worktree"` option — already used elsewhere in the framework to give a subagent a fresh git worktree that is auto-removed if unchanged

## Feature Vision

Every existing entry point into the ORBIT pipeline — `mission-architect`, `feature-architect`, `specifier` — assumes the user already knows they want to build something and commits to the full rigor of specification, planning, and quality review before a single line of real code exists. That rigor is the framework's core value for committed work, but it is the wrong tool when the actual question is still "would this even work, and do I want it at all?"

Today, answering that question means either derailing the full pipeline with throwaway exploration that leaves stray commits and half-specified artifacts behind, or stepping outside the framework entirely to hack something together by hand. Neither preserves the framework's guarantees: the first pollutes the durable artifact trail with exploratory noise; the second produces no record at all.

`/prototype` closes this gap: a fast, isolated, consequence-free way to spike an idea into working (if rough) code, look at the result, and decide — go or no-go — before any specification or planning work begins. It is the pipeline's pressure-release valve, not a replacement for any existing stage.

## Target Users

**Primary users of this feature**:
- The framework's own users (developers driving ORBIT via Claude Code) who have a rough idea and want to see it work before investing in a feature brief, spec, or plan.

**Impact on other users** (if applicable):
- None. The skill is invoked explicitly and never runs as a side effect of another skill.

## Feature Value Proposition

Users can go from a rough idea to a working, disposable proof-of-concept — and a clear go/no-go decision — in one skill invocation, without touching the main branch, writing a spec, or triggering any planning or QA machinery.

## Essential Capabilities

1. **Isolated, disposable execution environment**
   - **What it enables**: Invoking `/prototype` creates a new git worktree on a disposable branch (e.g. `prototype/<name>`), so exploratory code is physically separated from the main working tree from the first line written.
   - **Why it's essential**: "Throwaway" only means something if discarding it is a single, guaranteed-clean operation (delete worktree + branch) rather than a manual `git reset` that risks catching real work.

2. **Full-speed coding with no pipeline gates**
   - **What it enables**: Inside the prototype worktree, the skill writes code directly toward the user's stated goal — no mission/spec/plan artifacts, no DOX/AGENTS.md contract reads, no `clean-code`/`typescript-qa`/`python-qa`/`logic-bugs-qa` review passes.
   - **Why it's essential**: The entire point is speed of learning. Any of the normal gates would reintroduce the overhead this skill exists to avoid.

3. **Show, then ask — explicit go/no-go conclusion**
   - **What it enables**: After building, the skill runs/demonstrates the prototype's result to the user, then explicitly asks whether to (a) proceed for real, (b) discard and stop, or (c) keep iterating on the prototype.
   - **Why it's essential**: The feature's stated purpose is to produce a decision, not just code. Without an explicit conclusion step, prototypes could linger in an ambiguous state indefinitely.

4. **Learnings handoff and guaranteed cleanup**
   - **What it enables**: Regardless of the decision, the skill writes a short learnings note (problem, what was built, outcome, decision) to `thoughts/shared/prototypes/`, then deletes the worktree and branch — the code itself never survives. On a "go" decision, that note is handed off as input to `feature-architect`/`fact-finder` so real implementation starts clean through the normal pipeline, rather than continuing from the prototype's code.
   - **Why it's essential**: This is what lets "normal protocols take over again" actually happen — the decision and its rationale persist as durable framework knowledge even though the code that informed it is gone, and there is no ambiguity about whether the prototype branch is real, reviewed work.

## Explicit Non-Goals

- **Producing a mission, feature brief, spec, epic, fact report, or plan artifact for the prototype itself**: Those artifacts are for committed work. The prototype's only durable output is the short learnings note — it is not a substitute for any pipeline stage.
- **Any code quality or spec-compliance review of prototype code**: `clean-code`, `python-qa`, `typescript-qa`, `logic-bugs-qa`, and the `implement` skill's reviewer subagents are explicitly not invoked. Prototype code is never held to production standards.
- **Reading or honoring DOX/AGENTS.md contracts while writing prototype code**: The prototype worktree operates outside DOX governance entirely; this is a deliberate exemption, not an oversight.
- **Carrying prototype code forward into the real implementation**: Even on a "go" decision, the code is discarded, not merged or cherry-picked. Real implementation always starts fresh via `feature-architect`/`fact-finder` and onward.
- **Replacing any existing pipeline entry point**: `/prototype` is an additional, optional branch point alongside `mission-architect`, `feature-architect`, and the direct `fact-finder → planner` path — not a replacement for any of them.

## Inherited Constraints

**Technology Stack**:
- Implemented as a `SKILL.md` in `.claude/skills/prototype/`, invoked via the Claude Code `Skill` tool (`/prototype`), consistent with every other skill in the framework.
- Uses the `Agent` tool's `isolation: "worktree"` mechanism (or equivalent direct `git worktree` + branch commands) for isolation — no new isolation mechanism should be invented.
- No new MCP servers or external dependencies.

**Architectural Constraints**:
- Must follow the `thoughts/shared/` conventions documented in `thoughts/shared/AGENTS.md`: new artifacts named `YYYY-MM-DD-Topic.md`, written once, not edited by later stages. A new `prototypes/` directory under `thoughts/shared/` will need a Child DOX Index entry and a row in that AGENTS.md's directory-assignment table.
- Must not write to `missions/`, `features/`, `specs/`, `epics/`, `facts/`, `qa/`, or `plans/` — those remain exclusively the outputs of their respective existing skills.
- Cleanup (worktree + branch deletion) must be unconditional at skill conclusion, regardless of which of the three outcomes (go/no-go/iterate) the user picks for that round — "iterate" continues in the same worktree without cleanup only while the session stays open; cleanup happens once the user is done, not per round.

**Operational Constraints**:
- Must not touch the user's main working tree or currently checked-out branch at any point — a hard isolation guarantee, not a best-effort one.

## Integration Points

Where this feature connects to or depends on existing functionality:

- **`feature-architect` / `fact-finder`**: On a "go" decision, the prototype's learnings note is the handoff artifact these skills consume as additional context — read the same way an existing mission or spec would be read, per each skill's own Phase 1 context-loading step.
- **`thoughts/shared/AGENTS.md`**: The new `prototypes/` directory must be registered here (directory-assignment table + Child DOX Index) as part of implementation, following the same pattern as `features/`, `facts/`, etc.
- **Agent tool `isolation: "worktree"`**: Reused directly rather than reimplemented; the skill's implementation should confirm this mechanism's exact cleanup semantics (auto-removal "if unchanged") don't silently discard a prototype worktree that does have real, uncommitted changes.
- **CLAUDE.md pipeline table**: `/prototype` should be documented alongside the three existing flows (greenfield / brownfield / small change) as a fourth, optional "explore first" branch — this is a documentation integration point, not a behavioral dependency.

## Success Criteria

From a user's perspective, this feature is complete when:

- [ ] Invoking `/prototype` with a rough idea results in working, runnable code the user can inspect and try, without any spec/plan/QA artifacts being created.
- [ ] The prototype's code and branch are fully gone from the repository after the skill concludes, with zero trace in the main working tree or its git history.
- [ ] A short learnings note exists in `thoughts/shared/prototypes/` after every run, regardless of the go/no-go/iterate outcome.
- [ ] On a "go" decision, the next invocation of `feature-architect` or `fact-finder` can reference the prototype's learnings note as context.
- [ ] On a "no-go" decision, the user can confirm (via `git status`/`git worktree list`) that nothing from the prototype persists beyond the learnings note.

## Assumptions

**About the existing system**:
- The Agent tool's `isolation: "worktree"` behavior (auto-remove if unchanged, otherwise return path + branch) is available and suitable for a full skill invocation, not just a single subagent call — this should be confirmed during fact-finding rather than assumed true at implementation time.

**About users**:
- Users invoking `/prototype` understand up front that the code is disposable by design and will not ask for it to be preserved as-is after a "go" decision.
- A single conversational session is enough to reach a go/no-go/iterate decision; the feature is not designed around prototypes that persist across multiple separate sessions before a decision is reached.

## Open Questions for Fact-Finder

Before planning implementation, the Fact-Finder should investigate:

- [ ] What exactly does the Agent tool's `isolation: "worktree"` do when invoked for a full skill's duration rather than a single agent call — does it fit a multi-turn "build, show, ask, iterate" loop, or does the skill need to manage `git worktree add`/`remove` directly instead?
- [ ] What is the precise current structure of `thoughts/shared/AGENTS.md` and its Child DOX Index, so the `prototypes/` addition matches the existing pattern exactly (see `features/`, `facts/`, `qa/` entries)?
- [ ] How do other skills' `SKILL.md` files structure the "ask user a go/no-go/iterate question, then branch behavior" pattern, if any precedent exists, so `/prototype` stays consistent with established skill-authoring conventions?
- [ ] Are there existing examples in `.claude/skills/*/SKILL.md` of a skill invoking `git worktree` commands directly (vs. only ever going through the Agent tool), to confirm the right level (skill-level Bash calls vs. Agent tool isolation) for this skill's cleanup guarantee?

## Conversation Summary

- **Initial idea**: Add a "prototype" mode to ORBIT that skips spec/plan/QA and just writes throwaway code so the user can decide whether to pursue an idea, with changes made to be discarded afterward, after which normal protocols resume.
- **Refinements**: Isolation mechanism narrowed to git worktree + disposable branch (reusing the existing Agent tool `isolation: "worktree"` capability) rather than an in-tree scratch folder or unenforced convention. Entry point confirmed as standalone/always-available rather than a formal pipeline gate. Outcome handling narrowed to "always discard code, keep only a learnings note" rather than offering to merge/cherry-pick prototype code forward. Record-keeping added: a short note in `thoughts/shared/prototypes/` survives even though code doesn't. Conclusion behavior fixed as an explicit go/no-go/iterate question at the end of the skill, not a silent stop.
- **Key boundary decisions**: DOX/AGENTS.md contracts and all QA skills are explicitly skipped inside the prototype worktree — full coding freedom is the point. Prototype code is never carried forward into real implementation, even on a "go" decision; real implementation always restarts clean via `feature-architect`/`fact-finder` onward, using only the learnings note as context.
