We are pausing the session here. I need you to "save the game" by generating two specific context files. This ensures that when I come back, the next agent can pick up exactly where you left off without reading the entire chat history.

**1. Create file: `[Original-Plan-Name]-PROGRESS.md`**
This acts as the detailed log. It must include:
*   **Plan Reference:** Link to the original plan file.
*   **Current Status:** Explicitly state which PLAN items are `COMPLETE`, `PENDING`, or `IN PROGRESS`.
*   **Evidence of Completion:** For the step you just finished, list the specific files you created and the verification steps you ran (e.g., "Created `proxy/config.py`, verified imports work").
*   **Next Step (Detailed):** Copy the full instructions for the *immediate next* PLAN item into this file. *Crucial:* Do not just list the title; include the implementation details so the next agent can start immediately.
*   **Remaining Steps:** List the titles of future steps.

**2. Create file: `RESUME-HERE.md`**
This acts as a "Start Menu" for the next session. It must include:
*   **Quick Start Commands:** Bash commands to cat the progress file, the original plan, and verify the current state (e.g., a python one-liner to check the new module).
*   **Status Snapshot:** A 2-line summary (e.g., "Phase 1 Complete, Ready for Phase 2").
*   **Agent Instructions:** A short paragraph addressed to the *future* AI agent. Tell them: "Read the Progress file first. Verify the previous step using [command]. Then immediately begin task [Plan-ID]."

**Format:** Use Markdown with emojis (✅, 🔄, 🔖) for readability. Be precise and technical.
