---
date: 2026-08-06
change-architect: claude
change-name: "Allow Agents to Invoke the Commit Skill"
change-type: enhancement
route: direct
spec-source: "none"
status: complete
---

# Change Brief: Allow Agents to Invoke the Commit Skill

## Change Type

**enhancement** — the system should do something it can't do today: any agent should be able to invoke `/commit` through the Skill tool, not only a human typing the command.

## Trigger

The user wants to be able to start an arbitrary background agent and have it run `/commit`, the same way it can invoke any other skill. Today, `.claude/skills/commit/SKILL.md`'s `disable-model-invocation: true` blocks every Skill-tool call to it — confirmed directly earlier in this session, where invoking it via the Skill tool errored with "Skill commit cannot be used with Skill tool due to disable-model-invocation."

## Target State

**Soll**: Any agent can invoke `/commit` through the Skill tool, unconditionally — no restriction on which agent, subagent type, or calling context. Behaves identically to every other skill's model-invocation path.
**Today**: `disable-model-invocation: true` in the skill's frontmatter blocks Skill-tool invocation entirely; only a human typing `/commit` triggers it — as observed in this session (one error, not independently re-verified elsewhere).

## Non-Goals

None named — the user was asked explicitly and had nothing to add.

## Acceptance Criteria

The change is done when:

- [ ] A background agent invokes `/commit` through the Skill tool and it runs to completion (adds and commits outstanding changes), confirmed by review.

## Open Questions for Fact-Finder

none — nothing must be established before the change

## Conversation Summary

- **Initial description**: User asked for a change brief allowing agents to use the `commit` skill, alongside an identical one for `just-do-it`.
- **Refinements**: Confirmed the type as enhancement; scope is unconditional — no restriction to specific callers or contexts; the trigger is wanting to run `/commit` from an arbitrary background agent, the same way any other skill is invoked; acceptance is a working end-to-end invocation confirmed by review; no non-goals.
- **Type decision**: Enhancement, not obvious on its own but settled with the user directly — this is new capability, not correcting behaviour against an existing Soll, and not a structural refactor with unchanged behaviour.
