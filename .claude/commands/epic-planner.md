# Epic Planner

Use the Agent tool to invoke the `epic-planner` subagent.

Pass the user's request along with any specification reference (file path or project name). If no spec is specified, pass: "The user wants to create epics. Ask them which specification to use."

The agent will locate the specification in `thoughts/shared/specs/`, decompose it into epics, and write one epic document per epic to `thoughts/shared/epics/`.
