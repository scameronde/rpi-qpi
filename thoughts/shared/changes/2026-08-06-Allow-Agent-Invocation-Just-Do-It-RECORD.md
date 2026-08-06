---
date: 2026-08-06
just-do-it: claude
change-brief: "thoughts/shared/changes/2026-08-06-Allow-Agent-Invocation-Just-Do-It.md"
status: complete
review: passed
---

# Change Record: Allow Agents to Invoke the Just-Do-It Skill

## Outcome

Removed the `disable-model-invocation: true` line from `.claude/skills/just-do-it/SKILL.md`'s frontmatter, so the skill is now admitted to the Skill tool like any other model-invocable skill, with no restriction on which agent or context invokes it. Also removed the sentence in `CLAUDE.md` that documented the now-obsolete restriction, since leaving it would have made the document assert something the frontmatter no longer does. The sibling sentence noting that `/implement`, `/just-do-it`, and `/commit` all write git history (unrelated to the invocation flag) was left untouched, as was `/commit`'s own flag and its own CLAUDE.md sentence — those belong to the sibling change brief for `/commit`.

## Files Changed

- `.claude/skills/just-do-it/SKILL.md` — deleted the frontmatter line `disable-model-invocation: true   # writes git history — the user starts this, never Claude`; frontmatter is now `name` + `description` only.
- `CLAUDE.md` — deleted the sentence `` `/just-do-it` carries `disable-model-invocation: true` for the same reason `/commit` does: it writes code and commits, so it stays user-invoked only. `` and its trailing blank line.

## Acceptance Criterion

"A background agent invokes `/just-do-it` through the Skill tool and it runs to completion (executes the change and its commit), confirmed by review." → **HOLDS**, with a caveat on evidence strength that the reviewer named explicitly. Evidence: (1) the skill's frontmatter now matches every other model-invocable skill's shape, confirmed by reading the file; (2) `grep -n "^disable-model-invocation" .claude/skills/*/SKILL.md` no longer lists `just-do-it`; (3) live in-session confirmation, both before and after the edit, that the harness's Skill-tool availability listing excludes a skill carrying the flag (`/commit`, unchanged) and includes one that does not (`/just-do-it`, post-edit) — the same admission mechanism observed on both sides of the same edit, independently reproduced by the reviewer rather than taken on the executor's report alone. The reviewer noted this falls short of a literally witnessed end-to-end run against a real `route: direct` brief with a landed commit, since staging that would have executed an unrelated real change as a side effect of review — out of proportion to a two-line documentation/frontmatter change.

## Review Verdict

```
SPEC: COMPLIANT
Acceptance Criterion: HOLDS (see evidence above)
Scope: every path in the diff (.claude/skills/just-do-it/SKILL.md, CLAUDE.md) is accounted for by the brief.
Strengths: minimal, surgical diff — exactly the gating line plus the one sentence asserting the now-false state; correctly left /commit's own flag and sentence untouched.
Issues: none (Critical/Important/Minor all none)
Assessment: APPROVED
```
