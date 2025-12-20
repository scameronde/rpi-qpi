# RESEARCCH - PLAN - IMPLEMENT - QA - REPEAT

This project contains agents, tools and commands for OpenCode, an agentic coding assistant. 
The idea behind this project is to model a systematc approach to developing software with the help of AI agents.

## Overview

### Research Phase

Every larger change starts with a research phase. A specialized agent gathers information about the topic at hand, explores existing solutions and documents its findings in a research report.
The agent is not restricted to your code base - in fact you code base might be the least interesting part of the research. The agent has acccess to the internet, can read documentation, explore open source projects and gather information from various sources. It's job is not to develop a solution, but to understand the problem space and existing solutions.

### Plan Phase

Based on the research report, a planning agent creates a detailed plan for implementing the desired feature or change. The plan includes a breakdown of tasks, required resourcesa and potential challenges. The planning agent ensures that the implementation phase is well-structured and organized.

### Implement Phase

The implementation phase is carried out step by step by the implementation agent. This agent follow the plan created in the previous phase to develop the required feature or change. The implementation agent writes code, creates tests and documentation as needed. After completing each task, the agent runs tests to ensure that the new code integrates well with the existing code base and does not introduce any regressions. Since the implementation usually involves multiple steps, the agent works iteratively, completing one task at a time and verifying its correctness before moving on to the next task. After each task, the work can be paused and set aside to be continued later.

### QA Phase

Once the implementation phase is complete, one of the QA agents takes over. There are currently two QA agents available: a quick QA agent that performs a fast but shallow review of the changes, and a thorough QA agent that conducts an in-depth analysis of the code, tests and documentation. The QA agents look for bugs, code quality issues and ensure that the new feature meets the requirements outlined in the plan. The QA agents provide feedback and suggestions for improvements, which can be addressed by the implementation agent if necessary.

The quick QA agent is suitable for smaller changes or when time is of the essence, while the thorough QA agent is ideal for larger changes or when high quality is paramount. While the quick QA agent just outputs a summary of its findings with actionable items, the thorough QA agent generates a detailed QA report that documents its findings, and a plan - not unlike the one created in the planning phase - for addressing any issues found during the review. This plan can then be handed back to the implementation agent for further work. The process is iterative. After the QA phase, if any issues were found or if further improvements are needed, the implementation agent can pick up the work again, following the feedback provided by the QA agents. This cycle continues until the desired quality and functionality are achieved.

### Repeat

Now it is time to repeat the process. Whether you want to add another feature, improve existing functionality or refactor code, you can start a new cycle of research, planning, implementation and QA. Each cycle builds upon the previous one, allowing for continuous improvement and evolution of your software project with the help of AI agents.
