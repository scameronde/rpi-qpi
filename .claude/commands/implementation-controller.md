# Implementation Controller

Use the Agent tool to invoke the `implementation-controller` subagent.

Pass the user's implementation request as the task, including any plan file path or ticket name. If the user provided no specific plan, pass: "The user wants to execute an implementation plan. Locate the most recent plan in thoughts/shared/plans/ and begin pre-flight."

The agent will orchestrate task-by-task execution: delegating code changes to the task-executor subagent, running verification after each task, updating the STATE file, and committing after each verified task.
