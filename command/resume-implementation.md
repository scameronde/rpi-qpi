You are resuming an implementation session. Follow this protocol to synchronize your context efficiently:

## Step 1: Locate Context Files

Find the STATE file in `thoughts/shared/plans/`:
- Pattern: `YYYY-MM-DD-[Ticket]-STATE.md`
- This is your primary navigation file

## Step 2: Read Context (Minimal Load)

Read these files in order:

1. **STATE file** (`YYYY-MM-DD-[Ticket]-STATE.md`)
   - Identifies current task (e.g., PLAN-005)
   - Lists completed tasks
   - Contains verification commands

2. **Plan file** (`YYYY-MM-DD-[Ticket].md`)
   - Read the FULL plan to understand context and dependencies
   - Locate the current task section for detailed instructions

3. **Optional: Git History** (only if needed for clarity)
   - Run: `git log --oneline --grep="PLAN-" -10`
   - This shows recent task completions
   - Use only if you need to understand what changed

## Step 3: Verify Previous Work

Run the verification commands listed in the STATE file to confirm the environment is clean:

```bash
# Example verification commands (from STATE file)
pyright .
uv run pytest --tb=short -q
```

**If verification fails**: STOP and report the failure. Do not proceed until the issue is resolved.

## Step 4: Acknowledge & Sync

Output a brief status report:

```markdown
## 🔄 Session Resumed: [Ticket Name]

**Current Position**: PLAN-XXX - [Task Name]
**Completed Tasks**: [list from STATE]
**Verification**: All checks passed ✅

**Next Action**: [1-2 sentence summary of what you will do]

Ready to begin PLAN-XXX.
```

## Step 5: Begin Work

Proceed with the current task following the Implementation-Controller protocol:
- Extract the current task (PLAN-XXX) from the plan
- Create task payload with task details
- Invoke Task-Executor subagent to implement the changes
- Verify the changes with verification commands
- Update STATE file
- Commit with proper message format
- Stop and wait for user input (PROCEED/CONTINUE)

## Important Notes

- **Two-Agent Architecture**: You (Controller) orchestrate; Task-Executor implements code
- **Context Efficiency**: You load STATE + full plan (~200-500 lines); Executor loads only task payload (~50 lines)
- **Git as Fallback**: Only check git history if STATE file is unclear
- **Trust the STATE**: The STATE file is the single source of truth for progress
- **Full Plan Context**: Always read the complete plan to understand dependencies between tasks
- **Retry Logic**: If Task-Executor fails, retry up to 2 times with additional context
