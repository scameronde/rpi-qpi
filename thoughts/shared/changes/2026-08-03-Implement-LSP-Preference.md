---
date: 2026-08-03
change-architect: claude-change-architect
change-name: "Implement LSP Preference"
change-type: enhancement
route: full
spec-source: "none"
status: complete
---

# Change Brief: Implement LSP Preference

## Change Type

**enhancement** — `/implement`'s implementer and reviewer subagents should do something new they cannot do today: prefer LSP navigation over raw `Read`/`Grep` when it applies. There is no spec or documented expectation this contradicts, so it is not a defect, and it changes subagent behavior rather than only prompt structure, so it is not maintenance.

## Trigger

An exploratory fact report (`thoughts/shared/facts/2026-08-03-LSP-Usage-Across-Skills-And-Agents.md`) found that only 2 of ORBIT's 6 worker agents (`codebase-analyzer`, `codebase-pattern-finder`) carry explicit LSP-preference instructions, and no skill's prompt text mentions LSP at all — including `/implement`, which is the highest-volume skill in the pipeline (a fresh implementer and reviewer subagent per task, per wave). Those subagents run as `general-purpose`, which has unrestricted tool access, so LSP is technically reachable but currently unsteered. The user wants to maximize LSP use across ORBIT to reduce token cost and increase speed, and identified this as the highest-leverage gap.

## Target State

**Soll**: `implementer-prompt.md` and `reviewer-prompt.md` (both in `.claude/skills/implement/`) instruct their subagents to prefer LSP operations — `goToDefinition`, `findReferences`, `hover`, `callHierarchy`, `workspaceSymbol` — over raw `Read`/`Grep` when navigating, understanding, or reviewing code, mirroring the existing guidance in `.claude/agents/codebase-analyzer.md:76-80` and `.claude/agents/codebase-pattern-finder.md:46-53`.

**Today**: Neither prompt template mentions LSP in any form; subagents default to `Read`/`Grep` for all code navigation and review, with no steering toward the lower-token LSP path.

## Non-Goals

- `codebase-locator.md` stays untouched — it remains Glob/Grep-only, no LSP added there.
- `implement/SKILL.md` stays untouched — only the two prompt templates (`implementer-prompt.md`, `reviewer-prompt.md`) change.

## Acceptance Criteria

The change is done when:

- [ ] `implementer-prompt.md` contains explicit instructions to prefer LSP operations over `Read`/`Grep` when navigating or understanding code, in a style consistent with `codebase-analyzer.md`'s existing guidance.
- [ ] `reviewer-prompt.md` contains explicit instructions to prefer LSP operations over `Read`/`Grep` when reviewing changed code, in a style consistent with `codebase-pattern-finder.md`'s existing guidance.
- [ ] Neither `implement/SKILL.md` nor `codebase-locator.md` has been modified.

## Open Questions for Fact-Finder

- [ ] What is the current structure of `implementer-prompt.md` and `reviewer-prompt.md` (existing sections, any current tool-usage guidance) — where is the natural insertion point for LSP-preference instructions consistent with each file's existing style? `thoughts/shared/facts/2026-08-03-LSP-Usage-Across-Skills-And-Agents.md` may be reused for the already-established agent-tool findings, but the two prompt files themselves should be read fresh since that report did not analyze their internal structure.

## Conversation Summary

- **Initial description**: Follows directly from a prior conversation establishing that ORBIT's LSP use is concentrated in `codebase-analyzer` and `codebase-pattern-finder`, with `/implement` identified as the highest-leverage gap (highest subagent volume, unsteered despite unrestricted tool access).
- **Refinements**: User confirmed the proposed scope (both prompt files, full set of LSP operations already used by the two agents), confirmed today's behavior (no workaround, just unsteered `Read`/`Grep`), and added two non-goals (leave `codebase-locator.md` and `implement/SKILL.md` untouched).
- **Type decision**: `enhancement` — not contested; the target state is a new capability, not a documented broken behavior or a pure restructuring.
