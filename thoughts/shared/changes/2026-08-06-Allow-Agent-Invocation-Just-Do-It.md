---
date: 2026-08-06
change-architect: claude
change-name: "Allow Agents to Invoke the Just-Do-It Skill"
change-type: enhancement
route: direct
spec-source: "none"
status: complete
---

# Change Brief: Allow Agents to Invoke the Just-Do-It Skill

## Change Type

**enhancement** — the system should do something it can't do today: any agent should be able to invoke `/just-do-it` through the Skill tool, not only a human typing the command.

## Trigger

The user wants to be able to start an arbitrary background agent and have it run `/just-do-it`, the same way it can invoke any other skill. Today, `.claude/skills/just-do-it/SKILL.md` carries `disable-model-invocation: true` for the same stated reason as `/commit` (`CLAUDE.md`: "it writes code and commits, so it stays user-invoked only"), which blocks every Skill-tool call to it.

## Target State

**Soll**: Any agent can invoke `/just-do-it` through the Skill tool, unconditionally — no restriction on which agent, subagent type, or calling context. Behaves identically to every other skill's model-invocation path.
**Today**: `disable-model-invocation: true` in the skill's frontmatter blocks Skill-tool invocation entirely; only a human typing `/just-do-it` triggers it — as reported by the user, not independently verified (unlike `/commit`, this was not tried in this session).

## Non-Goals

None named — the user was asked explicitly and had nothing to add.

## Acceptance Criteria

The change is done when:

- [ ] A background agent invokes `/just-do-it` through the Skill tool and it runs to completion (executes the change and its commit), confirmed by review.

## Open Questions for Fact-Finder

none — nothing must be established before the change

## Conversation Summary

- **Initial description**: User asked for a change brief allowing agents to use the `just-do-it` skill, alongside an identical one for `commit`.
- **Refinements**: Confirmed the type as enhancement; scope is unconditional — no restriction to specific callers or contexts; the trigger is wanting to run `/just-do-it` from an arbitrary background agent, the same way any other skill is invoked; acceptance is a working end-to-end invocation confirmed by review; no non-goals.
- **Type decision**: Enhancement, not obvious on its own but settled with the user directly — this is new capability, not correcting behaviour against an existing Soll, and not a structural refactor with unchanged behaviour.
