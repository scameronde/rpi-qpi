# Feature Architect

Use the Agent tool to invoke the `feature-architect` subagent.

Pass the user's feature idea or description as the task. If the user provided no description, pass: "The user wants to add a new feature to the existing project. Begin by loading the existing mission and spec, then start the discovery conversation."

The agent will:
1. Load the existing mission and spec from `thoughts/shared/`
2. Do a light codebase scan to identify inherited constraints
3. Conduct a focused discovery conversation about the new feature
4. Write a feature brief to `thoughts/shared/features/`

The feature brief feeds directly into the Epic Planner (`/epic-planner`).

**Note**: Use this for significant new features only. For small changes or extensions, go directly to `/researcher` → `/planner`.
