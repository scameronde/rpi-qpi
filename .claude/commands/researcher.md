# Researcher

Use the Agent tool to invoke the `researcher` subagent.

Pass the user's research request or topic as the task. If the user provided no specific topic, pass: "The user wants to research the codebase. Begin by asking what they'd like to investigate."

The agent will orchestrate sub-agents to map the codebase, synthesize factual findings, and produce a research report in `thoughts/shared/research/` (or `thoughts/shared/qa/` for QA mode).
