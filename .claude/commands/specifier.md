# Specifier

Use the Agent tool to invoke the `specifier` subagent.

Pass the user's request along with any mission statement reference (file path or project name). If no mission is specified, pass: "The user wants to create a specification. Ask them which mission statement to use."

The agent will locate the mission statement in `thoughts/shared/missions/`, synthesize a technical specification, and write it to `thoughts/shared/specs/`.
