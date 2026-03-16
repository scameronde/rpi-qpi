# Planner

Use the Agent tool to invoke the `planner` subagent.

Pass the user's planning request as the task, including any relevant research report paths or ticket references. If the user provided no specific context, pass: "The user wants to create an implementation plan. Begin by reading the latest research report in thoughts/shared/research/."

The agent will ingest research findings, verify against live code, and produce a sequenced implementation plan + state file in `thoughts/shared/plans/`.
