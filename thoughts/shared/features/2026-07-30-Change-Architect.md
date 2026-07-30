---
date: 2026-07-30
feature-architect: feature-architect-skill
mission-source: "none"
spec-source: "none"
feature-name: "Change Architect"
type: "feature-addition"
status: complete
---

# Feature Brief: Change Architect

## System Context

**Project**: rpiqr (ORBIT) — Claude Code Workflow Toolkit

**Core purpose**: A structured agentic development pipeline that takes work from intent to reviewed, committed code through explicit, durable artifacts at every stage. Three entry points exist today — `/mission-architect` (greenfield), `/feature-architect` (brownfield), and a direct `/fact-finder` start for small changes and bug fixes — converging on `/fact-finder → /planner → /implement`.

**Relevant existing components**:
- `.claude/skills/` — the extension point; each skill is a `SKILL.md` directory invoked via `/skill-name`
- `thoughts/shared/` — the artifact store; every stage writes a durable, write-once `YYYY-MM-DD-Topic.md` artifact (`thoughts/shared/AGENTS.md`)
- The traceability chain — every artifact carries a frontmatter back-pointer to the artifact upstream of it (`CLAUDE.md:74-92`)
- `/fact-finder` Phase 1 — reads the "work order" (epic or feature brief) that names the questions it is meant to answer (`fact-finder/SKILL.md:563-580`)
- `/planner` — copies the fact report's `upstream-artifact:` **verbatim** into the plan rather than re-deriving it (`planner/SKILL.md:637`)
- `/implement` — reads that copy to decide whether an epic's `## Verification Plan (For Implementor)` applies (`implement/SKILL.md:238`)

## Feature Vision

The method ORBIT teaches is a three-beat figure: **Zielbestimmung** (what the system should do), **Ist-Bestimmung** (what it does today, with evidence), then a **plan** that carries the system from Ist to Ziel. Two of the three entry points honour it. `/mission-architect` and `/feature-architect` each produce a target artifact — a mission or a feature brief — that `/fact-finder` reads as its work order and whose path it records in `upstream-artifact:`, starting the traceability chain.

The third entry point does not. A small change or bug fix begins directly at `/fact-finder`, which then writes `upstream-artifact: none`. The intent behind the change is never written down anywhere: it exists only as a chat prompt that vanishes with the session. The consequence is not merely a missing document — the chain has no beginning, so the resulting plan cannot point back to a stated purpose. In the current repository this is the normal case, not the exception: of 44 plans, four carry the field at all, and all four carry `none`.

Two things depend on closing this. The presentation makes uniformity a central claim — every change follows the same schema — and today that claim is false for the most frequent kind of change. And an ISO auditor reading the artifact trail sees code changed with no recorded target state, which is precisely the finding the trail exists to prevent. `/change-architect` closes it with a fourth entry point sized for small work: a short conversation producing a **Change Brief**, so that every route into the pipeline begins with a target artifact and the three-beat figure holds without exception.

## Target Users

**Primary users of this feature**:
- ORBIT's users driving small changes, bug fixes, and maintenance work — the highest-frequency path through the pipeline, and the only one that currently starts with no written intent.

**Impact on other users** (if applicable):
- Auditors and reviewers reading the artifact trail after the fact, who gain a stated target state for every planned change.
- Users on the greenfield and brownfield paths are unaffected in their own flow, but `/planner` gains a refusal that applies to all paths uniformly.

## Feature Value Proposition

Every change to a system — including a one-line bug fix — begins with a written, traceable statement of the target state, at a cost proportional to the change rather than the cost of a full feature brief.

## Essential Capabilities

1. **A fourth entry-point skill sized for small work**
   - **What it enables**: `/change-architect` elicits the intent behind a small change in 2–4 conversational questions and writes a Change Brief. No architecture questions, no codebase scan — the Ist-Bestimmung remains `/fact-finder`'s job, unchanged.
   - **Why it's essential**: The third path exists because a feature brief is too heavy for a bug fix. A target artifact that reintroduces that weight would simply be skipped, and the gap would persist in practice while appearing closed on paper.

2. **A Change Brief whose target state is typed**
   - **What it enables**: The brief carries `change-type: defect | enhancement | maintenance`, and the target-state section takes a different shape per type. A `defect` records the Soll plus its **source** (spec section, existing test, documented behaviour, or an explicit `implicit — user expectation`) alongside the observed Ist. An `enhancement` records the desired behaviour plus today's behaviour as reported and unverified. A `maintenance` change records the **invariant** — what must remain observably identical — plus the justification and the intended structural end state.
   - **Why it's essential**: The three cases are not one case with different wording. A refactoring's target is not a behavioural statement at all, and forcing it into one produces a document that says nothing. For a defect, the source of the Soll is the entry that shows the target state was *determined* rather than invented — the part an auditor reads.

3. **Full membership in the traceability chain**
   - **What it enables**: Change Briefs live in `thoughts/shared/changes/`, are write-once and named by the standard convention, are found by `/fact-finder`'s Phase 1 work-order glob, supply its research vectors through an `## Open Questions for Fact-Finder` section, and reach the plan through the existing `upstream-artifact:` field with no new mechanism.
   - **Why it's essential**: A target document that downstream stages do not read is decoration. The value is the unbroken chain from plan back to stated purpose, and that chain is made of fields the existing stages already pass along.

4. **A gate that makes the guarantee real**
   - **What it enables**: `/planner` refuses to write a plan from a fact report whose `upstream-artifact:` is `none`, naming the three target skills and offering to run `/change-architect` first. `/fact-finder` gains an earlier redirect for economy — it stops before producing research that could not become a plan. Exploratory research remains possible and is marked by `upstream-artifact: none` together with a required line in the report's Coverage Map declaring it ineligible as a plan input.
   - **Why it's essential**: Without the refusal, the Change Brief is an option, and an option is not a statement one can make to a certifier. The gate is placed at `/planner` rather than `/fact-finder` because a fact report changes nothing while a plan is what leads to a change — and because the resulting property is expressible in one sentence about one field.

## Explicit Non-Goals

- **A verification script or a documented cutover date**: The user decided against both. The gate lives in the `/planner` skill; the chain property is not separately re-checked, and no line in `CLAUDE.md` records when enforcement began. This is a deliberate trade: the assurance is a process commitment rather than a mechanically re-verifiable repository property.
- **Retrofitting existing plans**: The 40+ plans predating the field keep their state. A target state reconstructed after the fact is the opposite of what the artifact is for.
- **Changing the QA path**: QA reports keep `upstream-artifact: none` in their templates and QA skills are untouched. Only `/planner` learns to recognise a QA-sourced plan as exempt.
- **An `## Inherited Constraints` section in the Change Brief**: For a small change the inherited constraint is effectively the whole system; enumerating it is exactly the ceremony that would make the path unusable. `/fact-finder` writes `None` in its own table instead.
- **A new frontmatter field to mark exploration**: `upstream-artifact: none` is itself the marker. No parallel signal is introduced.
- **Replacing or absorbing any existing entry point**: `/mission-architect` and `/feature-architect` keep their scope. `/change-architect` takes over only what today starts at `/fact-finder` directly.

## Inherited Constraints

| Constraint | Kind | Source | What it forbids or forces |
|---|---|---|---|
| A skill is a `SKILL.md` directory under `.claude/skills/`, invoked via the Skill tool as `/skill-name` | Technology | `CLAUDE.md:23-24` | Forces `/change-architect` into the same shape as its three sibling entry points; forbids inventing a different invocation mechanism |
| Nothing compiles and there is no test suite; verification is reading plus two commands | Technology | `CLAUDE.md:11` | Forbids "the tests will catch it" as a safety net — correctness of this change rests on the fact report's evidence and on review |
| Artifacts are named `YYYY-MM-DD-Topic.md` and are write-once after creation | Architectural | `CLAUDE.md:70`; `thoughts/shared/AGENTS.md:15,37` | Forces the Change Brief's filename and forbids later stages from editing it; a superseding brief sets the old one's `status: superseded` |
| Three frontmatter conventions hold across all artifacts: a back-pointer names the artifact upstream (path or literal `none`), `status:` describes the document rather than the work, and the authoring skill signs its own field | Architectural | `CLAUDE.md:90-92` | Forces the Change Brief's key set into this shape — a `change-architect:` signature, a `status: complete \| superseded`, and a back-pointer — and forbids inventing a differently-shaped header |
| `/planner` copies the fact report's `upstream-artifact:` verbatim rather than re-deriving it | Architectural | `CLAUDE.md:90`; `planner/SKILL.md:637` | Forces the Change Brief to reach the plan through that existing field; forbids adding a parallel path for change briefs specifically |
| The pipeline definition is duplicated across five places with no tooling keeping them in sync, and a prior change (`7790fda`) already left two of them stale | Architectural | `CLAUDE.md:94-105` | Forces a fourth entry point to be treated as a multi-file documentation edit, not a skill addition — and forces the fact report to enumerate the actual occurrences rather than trust the count of five |
| `.claude/**` is deliberately outside DOX; live `AGENTS.md` files are the root one plus `thoughts/shared/` and its `facts/`, `plans/`, `qa/`, `prototypes/` children | Architectural | `CLAUDE.md:225` | Forbids creating an `AGENTS.md` for the new skill directory; leaves open (see Open Questions) whether `thoughts/shared/changes/` takes one |
| Never edit a skill or agent file while `/implement` is mid-plan | Operational | `CLAUDE.md:12` | Forces this feature's own execution to hold the orchestrator's rules stable — the plan must not modify `implement/SKILL.md` in a wave whose sibling tasks depend on it |
| ORBIT has no mission or spec document; `CLAUDE.md` and the `SKILL.md` files are the normative record | Architectural | `inferred — Glob of thoughts/shared/missions/ and specs/ returned empty; CLAUDE.md fills the role` | Forces every constraint above to cite `CLAUDE.md` or a skill file rather than a spec, and forbids treating a `CLAUDE.md` statement as merely descriptive — it is the contract |

## Integration Points

- **`/fact-finder` Phase 1 work-order glob** (`fact-finder/SKILL.md:563-580`): the glob set gains `thoughts/shared/changes/`, and the work-order table gains rows mapping the Change Brief's sections to research vectors. Its `## Inherited Constraints` handling must additionally cover "upstream artifact present but carrying no such section", which today only covers "no upstream artifact at all" (`fact-finder/SKILL.md:662-667`).
- **`/fact-finder` `upstream-artifact:` field description** (`fact-finder/SKILL.md:624`): currently describes the field as holding an epic or feature brief path; must admit a change brief, and must define the exploratory case and its Coverage Map declaration.
- **`/planner` work-order read and refusal** (`planner/SKILL.md:479-482`, `:637`, `:667`, `:896`): must read change briefs, must refuse `none` for `facts/`-sourced plans, must exempt `qa/`-sourced plans, and its `## Inputs` line labelled "Epic / feature brief" must carry the third artifact type.
- **`/implement` acceptance step** (`implement/SKILL.md:238`): the rule enumerating which values to skip becomes brittle with a third artifact type; it inverts to a positive test — the epic verification section applies exactly when the path is under `epics/`.
- **`/feature-architect` routing** (`feature-architect/SKILL.md:21,23`): the routing-table row and the redirect sentence currently send small changes straight to `/fact-finder`; both now point at `/change-architect`.
- **`/mission-architect` routing** (`mission-architect/SKILL.md:61`): the same routing row appears there and must move in step.
- **`/prototype`** (`prototype/SKILL.md:3,11,24,86`): names `fact-finder` as a post-"go" entry point in three places, which becomes `/change-architect` for small work; and its in-worktree skill blocklist at `:24` must gain the new skill.
- **`thoughts/shared/AGENTS.md`**: the directory-assignment table gains a `changes/` row, and the "Populated / Empty today" line changes.
- **`.claude/agents/thoughts-locator.md:50`**: the artifact-category list gains change briefs; the category count quoted in `fact-finder/SKILL.md:376` moves from 9 to 10.
- **Pipeline definition, five places** (`CLAUDE.md:36-49,63,78,90` plus its skills table; `.claude/hooks/session-start:8-23`; `README.md:22-24,40,47-54`; root `AGENTS.md:65`; the affected `SKILL.md` files): all must state the fourth entry point and the revised small-change ordering.
- **`CHANGELOG.md`**: an entry under `## [Unreleased]`.

## Success Criteria

- [ ] Invoking `/change-architect` for a bug fix produces a Change Brief in `thoughts/shared/changes/` in a short conversation, with a recorded source for the target state.
- [ ] Running `/fact-finder` afterwards finds that brief as its work order without being pointed at it, and its report's `upstream-artifact:` names the brief's path.
- [ ] `/planner` refuses to write a plan from a `facts/` report carrying `upstream-artifact: none`, and names `/change-architect` as the remedy.
- [ ] `/planner` still writes a plan from a `qa/` report carrying `upstream-artifact: none`.
- [ ] Every one of the five pipeline-definition locations states the same four entry points and the same orderings — verifiable by reading them side by side.
- [ ] `/implement` completes a plan whose `upstream-artifact:` names a change brief, skipping the epic verification step without treating the value as an error.

## Assumptions

**About the existing system**:
- ORBIT has no mission or spec document. Both `thoughts/shared/missions/` and `specs/` are empty, so `mission-source:` and `spec-source:` above read `none`. `CLAUDE.md` and the `SKILL.md` files were used in their place, and the one constraint row that rests on that substitution rather than on a readable spec is marked `inferred` in its Source column.
- The count of "five places" where the pipeline is defined is `CLAUDE.md`'s own claim. The grep run during this brief's preparation found routing statements in `mission-architect/SKILL.md`, `feature-architect/SKILL.md` and `prototype/SKILL.md` as well, which the five-place framing folds into "the affected `SKILL.md`". The fact report should enumerate rather than count.
- The four QA skills each template `upstream-artifact: none` into their reports, making the `qa/` exemption load-bearing rather than defensive. This was observed by grep and needs verification with evidence.

**About users**:
- A user reaching for a bug fix will accept 2–4 questions before research begins, but not the feature brief's discovery conversation — this is the premise the whole feature rests on, and if it is wrong the path will be bypassed rather than followed.
- Users doing genuinely exploratory research will use the marked exploration route rather than inventing a throwaway Change Brief to get past the gate.

## Open Questions for Fact-Finder

- [ ] Does a new artifact directory under `thoughts/shared/` get its own `AGENTS.md`? The target-artifact siblings `features/`, `missions/`, `specs/` and `epics/` have none (`thoughts/shared/AGENTS.md:52`), while `facts/`, `plans/`, `qa/` and `prototypes/` do — and `CLAUDE.md:92` states that the owning directory's `AGENTS.md` `## Verification` list is the only place a frontmatter key set is actually asserted. Which pattern governs `changes/`, and where does the Change Brief's key set get asserted if the answer is "no `AGENTS.md`"?
- [ ] Enumerate every location stating the pipeline ordering or routing between entry points — including any inside `SKILL.md` files beyond the three found by preliminary grep — with paths and line ranges, so the plan's `File(s)` lists are exhaustive.
- [ ] What exactly does `/planner` do today at `planner/SKILL.md:479-482` when `upstream-artifact` is `none` versus absent, and what does `:896` specify for QA plans? The refusal must not break the "field absent — report predates it" branch, which is a different case from `none`.
- [ ] Confirm with evidence that all four QA skills template `upstream-artifact: none`, and establish how `/planner` can tell a QA-sourced plan from a fact-sourced one — is `fact-source:` reliably a `qa/` path in QA plans?
- [ ] How does `/fact-finder` currently decide it has "no work order", and where in Phase 1 would a redirect sit without disturbing the branch where the user names a document directly (`fact-finder/SKILL.md:565`)?
- [ ] What is the established structure of a target-artifact `SKILL.md` — compare `feature-architect` and `mission-architect` for their Phase layout, pre-write checklist, and `AskUserQuestion` usage rules — so `/change-architect` is a smaller instance of the same shape rather than a new one?
- [ ] Does `scripts/build-plugin.sh` pick up a new skill directory automatically, or does it carry an enumeration that must be extended?
- [ ] Are there existing `thoughts/shared/facts/` or `plans/` conventions for how a skill announces a refusal to the user, so the `/planner` gate's wording matches established practice?

## Conversation Summary

- **Initial idea**: The third entry point starts at `/fact-finder`, so the intent behind a small change or bug fix is never recorded — breaking the uniform Ziel → Ist → Plan schema the presentation claims and giving an ISO auditor a change with no documented target state.
- **Refinements**: The path was found to carry three distinct kinds of work — defects, small enhancements, and refactoring/maintenance — of which the last has no behavioural target at all, which drove the typed target-state design. Intent was established to exist only in the chat prompt, with no ticket system behind it, so the skill must elicit rather than import. Three solution shapes were weighed: a new skill (chosen), a light mode inside `/feature-architect` (rejected — a bug fix is not a feature brief, and the name is read by both the audience and the certifier), and a target section inside the fact report (rejected — `/fact-finder`'s "no opinions" prime directive, and mixing Ziel with Ist destroys the separation the certifier wants to see). The gate was placed at `/planner` rather than `/fact-finder` on the reasoning that a fact report changes nothing while a plan leads to a change. A collision was then found: all four QA skills template `upstream-artifact: none`, so a blanket refusal would make QA-driven repair unplannable — resolved by exempting QA-sourced plans on the argument that a QA report is already a Soll-Ist comparison, with the lens skill's ruleset as the Soll.
- **Key boundary decisions**: No verification script and no documented cutover date — the user chose the process commitment over the mechanically checkable property. No retrofitting of the existing 40+ plans, because a target state reconstructed after the fact is what the artifact exists to prevent. No `## Inherited Constraints` section in the Change Brief, because for small work it would be the ceremony that kills adoption. Exploration stays legal and is marked by the existing `none` value rather than a new field, on the reasoning that forbidden exploration happens anyway, just undocumented.
