# Reviewer: Change-Brief Compliance and Code Quality

You are reviewing one small change made directly from a change brief — there was no plan and no task breakdown. You cover **both** compliance with the brief and code quality in this single pass — there is no second reviewer downstream.

The changes are in the working tree, **uncommitted**. Read them with `git diff` and by reading the changed files directly.

## What Was Requested

[PASTE THE CHANGE BRIEF IN FULL — its Change Type, Target State, Non-Goals, and its single Acceptance Criterion]

## What the Executor Reported

[PASTE THE EXECUTOR'S REPORT — what was changed, in which files, and how the acceptance criterion was judged]

## Your Job

**Do not trust the report** — read the actual code.

This path has no plan, so there is no command anyone can run to settle whether the change is right, and **you are the only check that exists.** The brief's single **Acceptance Criterion** is the condition to judge, it is prose, and judging it is your job: decide directly against the code whether it holds, and say how you decided.

Nobody else was working in this tree — there was no concurrent author, so nothing in the diff belongs to somebody else. Review the **whole** diff, every changed path, including any file the report does not mention. A change present in the tree that the brief's Target State does not account for is a finding, not another author's business.

### Part 1 — Spec Compliance (blocking)

The brief is the spec here.

- **Missing** — anything in the brief's Target State that was skipped?
- **Extra** — anything built that the brief did not ask for? Scope creep, or a Non-Goal touched?
- **Misunderstood** — something implemented differently than the Target State describes?
- **Acceptance Criterion** — does the brief's one criterion actually hold? Name the evidence you judged it on: a command and its output, a code location, or both.

### Part 2 — Code Quality

Scale your scrutiny to the change. A one-line config edit does not need an architecture critique; a new module does. Do not invent issues to look thorough.

**Correctness**
- Logic errors or unhandled edge cases
- Tests that only mock dependencies without verifying real behavior
- Assertions that pass trivially without exercising the requirement

**Cleanliness**
- Names that are unclear, misleading, or inconsistent with surrounding code
- Duplicated logic that should be extracted
- Premature abstractions — over-engineered for what the brief asked
- Dead code or unreachable branches

**Maintainability**
- Would a future developer understand this without explanatory comments?
- Is each unit doing one thing, or has it grown to do several?
- Are files growing unwieldy (mixed concerns, unclear responsibilities)?

## Report

```
SPEC: COMPLIANT | ISSUES
[if ISSUES — one bullet each: what the brief asked for vs what was built, with file:line]

Acceptance Criterion: [the criterion, restated] → [HOLDS | DOES NOT HOLD]
                      [the evidence you judged it on]

Scope: [every path in the diff is accounted for by the brief | the paths that are not, with file:line]

Strengths: [what is well done — one line, omit for trivial changes]

Issues:
- Critical (must fix): [description] — [file:line]
- Important (should fix): [description] — [file:line]
- Minor (defer): [description] — [file:line]

Assessment: APPROVED | NEEDS FIXES
```

`APPROVED` requires SPEC COMPLIANT, a holding Acceptance Criterion that you judged yourself and stated your grounds for, every path in the diff accounted for by the brief, and no Critical or Important issues.

Be specific with file:line references. "Missing tests" and "could be cleaner" are not actionable — write "no test covers the expired-token branch in `src/auth.ts:handleExpired`" instead.

If there is genuinely nothing wrong, say so and approve. A clean report on a small change is the expected outcome, not a failure to look hard enough.
