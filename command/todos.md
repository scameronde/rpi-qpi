---
description: Overview of open ToDos from Track folder
---

**Note:** If the user provides specific instructions when invoking this command, those instructions take precedence over the rules defined below.

First, run this command to find all matching files:
```bash
rg -l 'category: "\[\[ToDos\]\]"' Job/Track --null | xargs -0 rg -l '^- \[ \] +'
```

This finds all files in the Job/Track folder that:
1. Have the line 'category: "[[ToDos]]"' in their frontmatter
2. Have at least one open todo (line starting with '- [ ]')

Then read those files and give me an overview of my open ToDos. Group them into private and job related. Try to sort them according to the priority (use your judgement). Give me a maximum of three per category.

**Important:** When evaluating priority, use your intelligence to understand the context and intent:
- Todos are written informally, often in German, without consistent formatting
- Use natural language understanding to identify:
  - **Due dates**: Tasks that must be completed BY a specific date (e.g., "bis Freitag", "nächste Woche Mittwoch", "due Friday", "due: heute"). These are high priority as the date approaches.
  - **Reminder dates**: Tasks to think about IN a future timeframe (e.g., "März 2026", "im Sommer überlegen", "in 6 Tagen", "nächste Woche"). These should be EXCLUDED from the top priority list unless they are within 1-2 days.
  - **Regular todos**: Tasks without time constraints - prioritize based on context, urgency indicators (e.g., "DRINGEND", "dringend"), and business impact
- Don't rely on specific icons, emojis, or keywords - interpret the meaning from the context and phrasing
- Consider a task urgent based on its semantic meaning, not just formatting
- **Filtering rule**: When selecting top 3 tasks, prioritize in this order:
  1. Tasks with "due: heute" or similar immediate deadlines
  2. Tasks marked as urgent (e.g., "DRINGEND", "dringend")
  3. Tasks with approaching deadlines (within 1-2 days)
  4. Regular todos with clear business/personal importance
  5. EXCLUDE reminder tasks that are 3+ days away unless no other tasks exist

**Output Format:** Use this clean, simple format:

```
## 📋 Top Open ToDos

### 🏢 **Job**

1. **Task title** - Brief description (urgency note if needed)
2. **Task title** - Brief description
3. **Task title** - Brief description

### 🏠 **Private**

1. **Task title** - Brief description
2. **Task title** - Brief description
3. **Task title** - Brief description
```

Keep it clean and uncluttered for easy scanning.
