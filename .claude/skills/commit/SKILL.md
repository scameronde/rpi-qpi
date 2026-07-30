---
name: commit
description: Add and commit all outstanding changes, split into meaningful, logically grouped commits. Invoke with /commit.
disable-model-invocation: true   # writes to git history — the user starts this, never Claude
allowed-tools: Bash, Read, Grep, Glob
---

Add and commit all changes in meaningful, logically grouped commits.
