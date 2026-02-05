## Researcher

### starter

#### 1

Have a look at the subagent found here "agent/codebase-analyzer.md". Which primary agents are using this subagent? Use the opencode skill if necessary.

#### 2

Great. Now we know, that the codebase-analyzer is not meant to present it's output to a human but only to other agents. Analyze the way and structure of the output the codebase-analyzer creates and how this output is used by the other primary and all-mode agents. The main question is: is the output the best it can be for this? Is the structure well suited? Is the output too verbose, or is it not verbose enough? I don't want simply want your opinion. Take this as a research task that is meant to aquire more knowledge. Search the internet for patterns or proven ways to optimize agent to agent communication. Maybe the people from Anthropic have done some work on that for ClaudeCode?

### newest

Read "thoughts/shared/research/2026-01-20-OpenCode-QA-Thorough-Agent-Communication.md" and then perform a similar analysis for the subagent "agent/typescript-qa-thorough.md". You can depend on the background research that has already been done. You don't have to do it twice.

Read "thoughts/shared/research/2026-01-18-Codebase-Analyzer-Agent-Communication.md" and then perform a similar analysis for the primary agent "agent/thoughts-analyzer.md". The goal is a little bit different here. The primary agent should delegate most of it's work to other agents. It should do all to keep it's own context as small as possible. It's output should be informative enough for a human, but not too verbose. You can depend on the background research that has already been done. You don't have to do it twice.

## Planner

Read the research report "thoughts/shared/research/2026-01-21-TypeScript-QA-Thorough-Agent-Communication.md" and create plan.

## Implementor

Read "thoughts/shared/plans/2026-01-21-TypeScript-QA-Thorough-Communication-STATE.md", add and commit the plan and the research, then list the open tasks

## QA

Analyze the agent @agent/codebase-analyzer.md 

## QA Planner

Read @thoughts/shared/qa/2026-01-18-Codebase-Analyzer-Agent.md and create the plan

