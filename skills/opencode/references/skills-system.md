# OpenCode Skills System Architecture

## Table of Contents

1. [Discovery Mechanism](#discovery-mechanism)
2. [SKILL.md Format Specification](#skillmd-format-specification)
3. [Tool Registration and Invocation](#tool-registration-and-invocation)
4. [Permission System](#permission-system)
5. [Supporting Files and Path Resolution](#supporting-files-and-path-resolution)
6. [References](#references)

## Discovery Mechanism

**Discovery Mechanism**:
OpenCode searches for skills in this order:
1. `.opencode/skill/<name>/SKILL.md` (project-local)
2. `~/.config/opencode/skill/<name>/SKILL.md` (global)
3. `.claude/skills/<name>/SKILL.md` (Claude-compatible project)
4. `~/.claude/skills/<name>/SKILL.md` (Claude-compatible global)

**Evidence**: `https://opencode.ai/docs/skills/`

**Excerpt**:
> "For project-local paths, OpenCode walks up from your current working directory until it reaches the git worktree. It loads any matching `skill/*/SKILL.md` in `.opencode/` and any matching `.claude/skills/*/SKILL.md` along the way."

## SKILL.md Format Specification

**YAML Frontmatter Schema**:
```yaml
---
name: skill-name           # REQUIRED: ^[a-z0-9]+(-[a-z0-9]+)*$
description: description   # REQUIRED: 1-1024 chars
license: MIT               # OPTIONAL: Any string
compatibility: opencode    # OPTIONAL: Compatibility marker
metadata:                  # OPTIONAL: String-to-string map
  audience: maintainers
  workflow: github
---
```

**Evidence**: `https://opencode.ai/docs/skills/`

**Verified Example**:
```markdown
---
name: git-release
description: Create consistent releases and changelogs
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

## What I do
- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable `gh release create` command

## When to use me
Use this when you are preparing a tagged release.
Ask clarifying questions if the target versioning scheme is unclear.
```

## Tool Registration and Invocation

**Tool Description Format**:
Skills are registered as native tools and presented to agents in XML format.

**Evidence**: `https://opencode.ai/docs/skills/`

**Excerpt**:
> "OpenCode lists available skills in the `skill` tool description. Each entry includes the skill name and description:
> ```xml
> <available_skills>
>   <skill>
>     <name>git-release</name>
>     <description>Create consistent releases and changelogs</description>
>   </skill>
> </available_skills>
> ```
> The agent loads a skill by calling the tool:
> ```javascript
> skill({ name: "git-release" })
> ```"

## Permission System

**Permission Levels**:
| Permission | Behavior |
|------------|----------|
| `allow` | Skill loads immediately without approval |
| `deny` | Skill hidden from agent, access rejected |
| `ask` | User prompted for approval before loading |

**Evidence**: `https://opencode.ai/docs/skills/`

**Configuration Example**:
```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

**Per-Agent Overrides** (Markdown frontmatter):
```yaml
---
permission:
  skill:
    "documents-*": "allow"
---
```

**Per-Agent Overrides** (opencode.json):
```json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow"
        }
      }
    }
  }
}
```

## Supporting Files and Path Resolution

**Standard Directory Structure**:
```
.opencode/skill/report-generator/
├── SKILL.md              # Required: skill definition
├── scripts/              # Executable scripts
│   ├── generate.py
│   └── validate.sh
├── references/           # Documentation
│   ├── api-schema.json
│   └── examples.md
├── templates/            # Output templates
│   ├── report.html
│   └── summary.md
└── assets/               # Static resources
    ├── company-logo.png
    └── styles.css
```

**Path Resolution Rules**:
Skills use relative paths from `SKILL.md` location. Absolute paths defeat portability.

**Evidence**: `https://deepwiki.com/malhashemi/opencode-skills/3.4-supporting-files-and-path-resolution` (third-party plugin documentation)

**Excerpt**:
> "Always use relative paths for skill-bundled files. Absolute paths defeat portability and will fail when skills are shared or moved."

Example references in `SKILL.md`:
```markdown
1. Read the API documentation: `references/api-docs.md`
2. Run the generation script: `scripts/generate.py`
3. Use the HTML template: `templates/report.html`
```

## References

### Official Documentation
- **OpenCode Skills System**: https://opencode.ai/docs/skills/
  - Discovery mechanism, SKILL.md format, tool registration, permission system

### Third-Party Documentation
- **OpenCode Skills Plugin - Path Resolution**: https://deepwiki.com/malhashemi/opencode-skills/3.4-supporting-files-and-path-resolution
  - Supporting files and relative path patterns (third-party plugin documentation)
