---
date: 2026-03-03
researcher: OpenCode Research Agent
topic: Parallel Task Execution Architecture for OpenCode Agent System
status: Complete
coverage: Comprehensive analysis of current sequential architecture, parallel execution feasibility, dependency analysis algorithms, required component modifications, backward compatibility strategy, and implementation roadmap
---

<thinking>
This research report documents the analysis of adding parallel task execution capabilities to the OpenCode agent system. The analysis covers:

1. Current sequential execution architecture and limitations
2. Existing parallel tool invocation capabilities in OpenCode
3. File-based dependency analysis algorithm design
4. Required modifications to five system components
5. Backward compatibility preservation strategy
6. Risk mitigation approaches
7. Phased implementation roadmap

The report structure follows the standard research report template with YAML frontmatter, executive summary, coverage map, critical findings, detailed technical analysis, verification log, open questions, and references.

Key architectural insight: OpenCode already supports parallel tool invocation at the framework level, but Implementation Controller enforces sequential execution. The proposed changes leverage existing capabilities while maintaining backward compatibility through optional feature flags and graceful fallbacks.

The dependency analysis algorithm is conservative (file overlap = dependency) to minimize merge conflict risk. Future refinements could add semantic dependency detection, but file-based analysis provides a safe starting point.

Implementation complexity is concentrated in Implementation Controller (batch orchestration, rollback). Planner changes are lower risk (pure analysis output). Task Executor requires no changes (stateless design).

Expected impact: 30-50% wall-clock time reduction for plans with significant independent tasks, better LLM concurrency utilization.
</thinking>

<answer>

# Research Report: Parallel Task Execution Architecture

## Executive Summary

This research analyzes the feasibility and architectural requirements for adding parallel task execution to the OpenCode agent system. The analysis confirms that parallel execution is both **feasible and architecturally sound** with modifications to five components.

### Key Findings

- **Current architecture enforces strict sequential execution** - Implementation Controller processes one task at a time (agent/implementation-controller.md:36)
- **OpenCode framework already supports parallel tool invocation** - Multiple task() calls can be made concurrently in a single message
- **File-based dependency analysis is tractable** - Tasks touching different files can be identified as independent with conservative overlap detection
- **Five components require modification**: Planner (dependency analysis), Implementation Controller (batch orchestration), STATE file format, configuration, and plan structure
- **Backward compatibility is achievable** - New features can default to off, preserving existing sequential workflow
- **Estimated speedup: 30-50%** for plans with significant independent tasks (10 tasks → 6 cycles in example scenario)

### Recommendation

**Proceed with phased implementation** starting with low-risk Planner changes, then Implementation Controller batch execution, then rollback and configuration. Estimated total effort: 10-13 days.

---

## Coverage Map

### Areas Fully Analyzed ✅

- **Current Sequential Architecture** - Implementation Controller execution protocol (agent/implementation-controller.md:36, 84-185)
- **Planner Task Structure** - Task list generation and output format (agent/planner.md:492-726)
- **OpenCode Parallel Invocation** - Tool usage patterns from system instructions (bash tool documentation)
- **Task Executor Design** - Stateless single-task execution model (agent/task-executor.md:1-598)
- **STATE File Format** - Current progress tracking structure (agent/implementation-controller.md:675-709)
- **Dependency Analysis Algorithm** - File-based overlap detection logic
- **Backward Compatibility Strategy** - Fallback behaviors and migration paths
- **Risk Mitigation** - Merge conflicts, verification failures, complexity, resource exhaustion
- **Implementation Phases** - Component-by-component rollout plan

### Areas Partially Analyzed ⚠️

- **OpenCode Task Tool Concurrency Limits** - Framework supports parallel invocation, but maximum concurrent task() calls not documented (requires testing with 2, 4, 8, 16 concurrent calls)
- **Semantic Dependencies** - File-based analysis is conservative; semantic dependencies (e.g., shared state, API contracts) not captured beyond file overlap
- **User Workflow Preferences** - Approval granularity (batch vs. upfront) and commit message format lack user research

### Areas Not Analyzed ❌

- **Performance Profiling** - No empirical testing of actual speedup across diverse plan types
- **Resource Consumption** - Memory and API rate limit impact of concurrent task executors not measured
- **Edge Cases** - Circular dependencies, dynamic file creation, file renames during execution
- **UI/UX Changes** - User interface for batch progress visualization and approval flows

---

## Critical Findings

### Verified Facts

**FINDING-001: Sequential Execution is Hardcoded**

**Evidence**: agent/implementation-controller.md:36
```
**One Task at a Time**: Never proceed to task N+1 until task N is verified, committed, and approved by the user.
```

**Direct consequence**: Independent tasks (modifying different files) wait unnecessarily for sequential execution, leading to suboptimal wall-clock time.

---

**FINDING-002: OpenCode Supports Parallel Tool Calls**

**Evidence**: System instructions for bash tool
```
When issuing multiple commands:
- If the commands are independent and can run in parallel, make multiple Bash tool calls in a single message.
```

**Direct consequence**: OpenCode framework already supports parallel tool invocation; Implementation Controller can invoke multiple task-executor instances concurrently without framework changes.

---

**FINDING-003: Planner Creates Sequential Task Lists Without Dependencies**

**Evidence**: agent/planner.md:1-726 (full agent definition)

**Observation**: Planner outputs linear task lists (PLAN-001, PLAN-002, etc.) with File(s) field but no dependency metadata.

**Direct consequence**: Dependency information is implicit in file overlap; requires new analysis phase in Planner to make dependencies explicit.

---

**FINDING-004: Task Executor is Stateless and Single-Task Focused**

**Evidence**: agent/task-executor.md:1-598 (full agent definition)

**Observation**: Task Executor receives one task description, executes, and returns result with no shared state.

**Direct consequence**: No changes needed to Task Executor for parallel execution; works identically when invoked concurrently.

---

**FINDING-005: STATE File Format Tracks Sequential Progress**

**Evidence**: agent/implementation-controller.md:675-709
```markdown
**Current Task**: PLAN-003
**Total Tasks**: 10

## Execution Progress

**Completed Tasks**:
- ✅ PLAN-001: Description (status, commit, timestamp)
```

**Direct consequence**: STATE file requires new structure to track batch execution, but old format can be auto-migrated on read for backward compatibility.

---

### Planner Attention Required 🔔

**PAR-001: Dependency Analysis Algorithm Design**

**Component**: Planner agent

**Required Change**: Add post-task-list dependency analysis algorithm:

```
For each pair of tasks (PLAN-A, PLAN-B):
  files_A = set of files in PLAN-A's File(s) field
  files_B = set of files in PLAN-B's File(s) field
  
  if files_A ∩ files_B ≠ ∅:
    # File overlap detected
    if A comes before B in task order:
      mark "B depends on A"
```

**Example**:
- PLAN-001: Files = [`src/auth/login.ts`]
- PLAN-002: Files = [`src/auth/register.ts`]
- PLAN-003: Files = [`src/auth/login.ts`, `tests/auth.test.ts`]

**Result**:
- PLAN-001 and PLAN-002 are independent (no file overlap)
- PLAN-003 depends on PLAN-001 (both touch `login.ts`)

**Rationale**: Conservative approach minimizes merge conflict risk; any file overlap creates dependency edge.

---

**PAR-002: Planner Output Format Extension**

**Component**: Planner agent

**Required Change**: Add two new output sections after task list:

```markdown
## Task Dependencies

### Dependency Graph
- **PLAN-001**: [] (no dependencies)
- **PLAN-002**: [] (no dependencies)
- **PLAN-003**: [PLAN-001] (depends on PLAN-001)

### Parallelization Groups
**Batch 1** (2 tasks in parallel): PLAN-001, PLAN-002
**Batch 2** (1 task): PLAN-003
```

And plan metadata before Inputs section:

```markdown
**Execution Mode**: parallel | sequential (default: sequential)
**Max Parallel Tasks**: 4
**Commit Strategy**: batch | individual (default: individual)
```

**Rationale**: Makes dependencies explicit for Implementation Controller batch scheduling; preserves backward compatibility by making sections optional.

**Evidence**: agent/planner.md:492-726 (Output Format section can be extended without breaking existing consumers)

---

**PAR-003: Implementation Controller Batch Orchestration**

**Component**: Implementation Controller agent

**Required Change**: Modify execution protocol (agent/implementation-controller.md:84-185) to add:

1. **Phase 0.5: Load dependency graph** (after reading plan/STATE)
   - Parse execution mode from plan metadata
   - Load dependency graph and parallelization groups
   - Fall back to sequential if no dependency info found

2. **New orchestration loop: Batch execution**
   - Identify ready tasks (dependencies satisfied)
   - Invoke multiple task-executor instances in parallel:
     ```xml
     <function_calls>
     <invoke name="task">
       <subagent_type>task-executor</subagent_type>
       <prompt>Execute PLAN-001: {...}</prompt>
     </invoke>
     <invoke name="task">
       <subagent_type>task-executor</subagent_type>
       <prompt>Execute PLAN-002: {...}</prompt>
     </invoke>
     </function_calls>
     ```
   - Parse all executor responses in parallel
   - Run batch verification (per-task + global)
   - Handle partial failures with rollback capability (`git reset --hard HEAD~N`)
   - Commit based on strategy (individual or batch)
   - Update STATE file with batch information
   - Report batch completion and pause for user approval

3. **Rollback capability**
   - If batch verification fails: `git reset --hard HEAD~N`
   - Retry batch sequentially with error context
   - Maximum 2 retry attempts

**Rationale**: Leverages existing OpenCode parallel tool invocation; rollback ensures atomicity; sequential retry provides recovery path.

**Complexity**: High (batch scheduling, multi-response parsing, rollback logic)

**Evidence**: Current Phase 0 and Phase 1..N (agent/implementation-controller.md:147-185) show clear extension points.

---

**PAR-004: STATE File Format Extension**

**Component**: Implementation Controller agent

**Required Change**: Add new STATE file format for parallel mode:

```markdown
**Execution Mode**: parallel
**Current Batch**: 3
**Total Batches**: 5

## Execution Progress

**Completed Batches**:

### Batch 1 (2 tasks, completed YYYY-MM-DD HH:MM)
- ✅ PLAN-001: Modify login.ts (commit: a1b2c3d)
- ✅ PLAN-002: Modify register.ts (commit: e4f5g6h)

### Batch 2 (3 tasks, completed YYYY-MM-DD HH:MM)
- ✅ PLAN-003: Add validation (commit: i7j8k9l)

**Remaining Batches**:
- Batch 3: PLAN-006, PLAN-007
```

**Migration**: Auto-detect old format (presence of "Current Task" field) and preserve compatibility.

**Rationale**: Tracks batch-level progress while maintaining per-task commit history.

**Evidence**: agent/implementation-controller.md:675-709 (current STATE format)

---

**PAR-005: Configuration System**

**Component**: Multiple (Planner, Implementation Controller, opencode.json)

**Required Change**: Add plan-level and user-level configuration:

**Plan-level** (in plan metadata):
```markdown
**Execution Mode**: parallel
**Max Parallel Tasks**: 4
**Commit Strategy**: individual
```

**User-level** (optional, in `opencode.json`):
```json
{
  "implementation": {
    "execution_mode": "parallel",
    "max_parallel_tasks": 4,
    "commit_strategy": "individual"
  }
}
```

**Precedence**: Plan-level overrides user-level.

**Rationale**: Allows per-plan control (some plans may not benefit from parallelization) while providing user-wide defaults; defaults to sequential for backward compatibility.

**Complexity**: Low (configuration parsing and precedence logic)

---

## Detailed Technical Analysis

### Current Sequential Architecture

The Implementation Controller enforces a strict one-task-at-a-time execution model:

**Evidence**: agent/implementation-controller.md:36
```
**One Task at a Time**: Never proceed to task N+1 until task N is verified, committed, and approved by the user.
```

**Execution flow** (agent/implementation-controller.md:84-185):
1. Read plan and STATE file
2. Identify next incomplete task
3. Delegate to task-executor
4. Verify implementation
5. Commit changes
6. Update STATE file
7. Pause for user approval
8. Repeat

**Performance bottleneck**: Steps 3-7 are serialized even when tasks are independent (modifying different files). For a plan with 10 tasks where 5 are independent, this results in 10 sequential cycles instead of a potential 6 cycles (1 batch of 5 parallel + 5 sequential dependents).

---

### Parallel Invocation Capability

OpenCode framework documentation (bash tool system instructions) explicitly supports parallel tool calls:

```
When issuing multiple commands:
- If the commands are independent and can run in parallel, make multiple Bash tool calls in a single message.
```

**Direct consequence**: The framework already handles concurrent tool invocation. Implementation Controller can invoke multiple task-executor instances concurrently using multiple `<invoke name="task">` blocks in a single message.

**Example parallel invocation**:
```xml
<function_calls>
<invoke name="task">
  <subagent_type>task-executor</subagent_type>
  <prompt>Execute PLAN-001: Modify src/auth/login.ts to add JWT validation</prompt>
</invoke>
<invoke name="task">
  <subagent_type>task-executor</subagent_type>
  <prompt>Execute PLAN-002: Modify src/auth/register.ts to add email verification</prompt>
</invoke>
</function_calls>
```

**Constraint**: Maximum concurrent task() calls is undocumented (see Open Question OQ-006).

---

### Dependency Analysis Algorithm

**Input**: List of PLAN-XXX tasks with File(s) field

**Algorithm**: File-based overlap detection

```
dependency_graph = {}
for each task T in task_list:
  dependency_graph[T] = []

for each pair (PLAN-A, PLAN-B) where A < B in task order:
  files_A = set of files from PLAN-A File(s) field
  files_B = set of files from PLAN-B File(s) field
  
  if files_A ∩ files_B ≠ ∅:
    # File overlap detected - B depends on A
    dependency_graph[PLAN-B].append(PLAN-A)
```

**Topological sort for batch groups**:
```
batches = []
remaining = all tasks
in_degree = count of dependencies for each task

while remaining is not empty:
  ready = tasks in remaining with in_degree == 0
  batches.append(ready)
  
  for task in ready:
    remove task from remaining
    for dependent in tasks that depend on task:
      decrement in_degree[dependent]
```

**Example**:
- PLAN-001: Files = [`src/auth/login.ts`]
- PLAN-002: Files = [`src/auth/register.ts`]
- PLAN-003: Files = [`src/auth/login.ts`, `tests/auth.test.ts`]
- PLAN-004: Files = [`src/auth/register.ts`, `tests/auth.test.ts`]

**Dependency graph**:
- PLAN-001: [] (no dependencies)
- PLAN-002: [] (no dependencies)
- PLAN-003: [PLAN-001] (depends on PLAN-001 due to login.ts overlap)
- PLAN-004: [PLAN-002, PLAN-003] (depends on PLAN-002 due to register.ts, and PLAN-003 due to tests/auth.test.ts)

**Parallelization groups**:
- **Batch 1** (2 tasks in parallel): PLAN-001, PLAN-002
- **Batch 2** (1 task): PLAN-003
- **Batch 3** (1 task): PLAN-004

**Rationale**: Conservative approach (any file overlap = dependency) minimizes merge conflict risk. Future refinement could add semantic dependency detection for cases like shared interfaces, but file-based analysis provides a safe starting point.

---

### Benefits Analysis

**Time savings calculation**:

**Scenario**: 10 tasks, 5 are independent (can run in parallel), 5 are sequential dependents

**Sequential execution**:
- 10 task cycles (delegate → verify → commit → pause each)
- Estimated wall-clock time: 10 × T (where T = average task cycle time)

**Parallel execution**:
- Batch 1: 5 tasks in parallel (1 cycle)
- Batches 2-6: 5 sequential tasks (5 cycles)
- Total: 6 cycles
- Estimated wall-clock time: 6 × T

**Speedup**: (10 - 6) / 10 = **40% reduction** in wall-clock time

**Best case** (all tasks independent): 10 tasks → 1 batch → 90% reduction
**Worst case** (all tasks sequential): 10 tasks → 10 batches → 0% reduction

**Expected case** (30-50% independent tasks): 30-50% reduction in wall-clock time

**Resource efficiency benefits**:
- Better utilization of LLM concurrency (OpenCode supports parallel tool calls)
- Reduced idle time for independent file modifications
- Lower total user wait time for plan completion

---

### Risk Mitigation

**RISK-001: Merge Conflicts**

**Scenario**: Two tasks modify adjacent lines in the same file but pass overlap detection

**Likelihood**: Low (conservative file-based detection marks ANY file overlap as dependent)

**Impact**: High (merge conflict breaks build)

**Mitigation**:
- Conservative overlap detection (any file overlap = dependency)
- Global verification after batch (run tests, type checks, lints)
- Rollback capability (`git reset --hard HEAD~N`) if verification fails
- Sequential retry of failed batch with error context

**Evidence**: File-based dependency algorithm above; Implementation Controller batch execution Step 5 (PAR-003)

---

**RISK-002: Partial Batch Failures**

**Scenario**: Batch of 4 tasks, 3 succeed, 1 fails verification

**Likelihood**: Medium (verification failures are common)

**Impact**: Medium (wasted work on 3 successful tasks if no rollback)

**Mitigation**:
- Rollback entire batch on any failure (`git reset --hard HEAD~N`)
- Retry batch sequentially with error context from failed task
- Maximum 2 retry attempts to avoid infinite loops
- Clear error reporting to user with task-level failure attribution

**Evidence**: Implementation Controller batch execution rollback capability (PAR-003)

---

**RISK-003: Increased Complexity**

**Scenario**: Batch orchestration, dependency analysis, and rollback logic increase Implementation Controller complexity

**Likelihood**: High (architectural change adds complexity)

**Impact**: Medium (harder to debug, maintain)

**Mitigation**:
- `<thinking>` sections document batch scheduling decisions and reasoning
- Correlation IDs link task executor responses to original requests
- Feature can be disabled entirely (execution_mode: sequential)
- Fallback to sequential execution if dependency graph missing
- Phased implementation (Planner first, then Implementation Controller)

**Evidence**: agent/implementation-controller.md:86-145 (existing thinking/answer separation pattern)

---

**RISK-004: Resource Exhaustion**

**Scenario**: Large plan (50+ tasks) with many independent tasks causes too many concurrent task() calls

**Likelihood**: Low (most plans have <20 tasks)

**Impact**: High (API rate limits, memory exhaustion, framework errors)

**Mitigation**:
- `max_parallel_tasks` configuration limits concurrent executors (default: 4)
- Batch groups respect max limit (split large batches into sub-batches)
- Graceful degradation (if concurrency limit hit, fall back to sequential)

**Evidence**: Configuration options (PAR-005)

---

### Backward Compatibility Strategy

**Principle**: Existing plans and workflows must continue working unchanged.

**Fallback behaviors**:

1. **Missing dependency graph** → Sequential execution
   - If plan has no "Task Dependencies" section, Implementation Controller uses current sequential loop
   - Evidence: agent/implementation-controller.md:147-185 (current Phase 0 and Phase 1..N remain valid)

2. **No execution mode specified** → Default to sequential
   - If plan metadata lacks "Execution Mode" field, default to "sequential"
   - Preserves existing behavior for all current plans

3. **Old STATE file format** → Auto-migrate on read
   - Implementation Controller detects old format (presence of "Current Task" field)
   - Migrates to new format with single-task batches
   - Continues execution seamlessly

4. **Configuration absence** → Sequential execution
   - If `opencode.json` lacks `implementation` section, default to sequential
   - No breaking changes for users who don't update configuration

**Testing strategy**:
- Run existing plans (without dependency graph) through updated Implementation Controller
- Verify sequential execution path unchanged
- Verify old STATE files migrate correctly

**Evidence**: All PAR items include backward compatibility clauses; new features are additive (optional sections, default values).

---

### Implementation Phases

**Phase 1: Planner Dependency Analysis** (Low Risk, 2-3 days)

**Deliverables**:
- Add file overlap detection algorithm to Planner (PAR-001)
- Add "Task Dependencies" output section (PAR-002)
- Add plan metadata fields (execution_mode, max_parallel_tasks, commit_strategy)

**Testing**:
- Verify dependency graph correctness for sample plans (independent tasks, sequential tasks, mixed)
- Verify parallelization groups match expected batches
- Verify backward compatibility (old plans still work)

**Validation criteria**:
- Dependency graph has no cycles
- File overlap correctly detected (manual inspection)
- Tasks with no file overlap are in same batch

---

**Phase 2: Implementation Controller Batch Execution** (Medium Risk, 4-5 days)

**Deliverables**:
- Add Phase 0.5 (load dependency graph) (PAR-003)
- Implement batch scheduling loop (PAR-003)
- Implement multi-task delegation with parallel task() calls (PAR-003)
- Implement batch verification (per-task + global) (PAR-003)

**Testing**:
- Run small plans (2-3 tasks) with parallel execution
- Verify multiple task-executor instances invoked concurrently
- Verify batch verification runs correctly
- Verify fallback to sequential if dependency graph missing

**Validation criteria**:
- Parallel task() calls complete successfully
- All task executor responses parsed correctly
- Verification runs on all tasks in batch

---

**Phase 3: STATE File Format & Rollback** (Medium Risk, 2-3 days)

**Deliverables**:
- Implement new STATE file format (PAR-004)
- Implement auto-migration from old format (PAR-004)
- Implement rollback capability (PAR-003)
- Implement sequential retry on failure (PAR-003)

**Testing**:
- Trigger batch verification failure
- Verify rollback reverts all commits in batch
- Verify sequential retry succeeds
- Verify old STATE files migrate correctly

**Validation criteria**:
- Rollback leaves repository in clean state (git status clean)
- Sequential retry includes error context from initial failure
- Old STATE files migrate without data loss

---

**Phase 4: Configuration & Optimization** (Low Risk, 2-3 days)

**Deliverables**:
- Add plan-level configuration parsing (PAR-005)
- Add user-level configuration in opencode.json (PAR-005)
- Add max_parallel_tasks enforcement (RISK-004 mitigation)
- User acceptance testing

**Testing**:
- Test plan-level config overrides user-level
- Test max_parallel_tasks limits batch size
- Run diverse plans (small, large, independent, sequential)

**Validation criteria**:
- Configuration precedence correct (plan > user > default)
- Batches respect max_parallel_tasks limit
- Performance improvement measurable (30-50% speedup for independent tasks)

---

**Total estimated effort**: 10-13 days (design, implementation, testing, documentation)

---

## Verification Log

### Verified Through Direct Code Analysis ✅

- **agent/implementation-controller.md:36** - Sequential execution enforcement ("One Task at a Time")
- **agent/implementation-controller.md:84-185** - Current execution protocol (Phase 0, Phase 1..N)
- **agent/implementation-controller.md:675-709** - STATE file format structure
- **agent/planner.md:492-726** - Planner output format (task list structure)
- **agent/task-executor.md:1-598** - Task Executor stateless design
- **System instructions (bash tool)** - Parallel tool invocation support

### Verified Through Logical Inference ✅

- **Dependency algorithm correctness** - File overlap detection is sound (set intersection)
- **Topological sort validity** - Standard algorithm for dependency graph scheduling
- **Backward compatibility** - Additive changes preserve existing behavior (optional sections, default values)
- **Time savings calculation** - Mathematical reduction in cycle count (10 tasks → 6 cycles = 40% speedup)

### Requires Empirical Testing 🧪

- **OpenCode task() concurrency limits** - Maximum concurrent invocations not documented (see OQ-006)
- **Actual speedup measurement** - 30-50% estimate based on model, not profiling
- **Resource consumption** - Memory and API rate limit impact of concurrent executors
- **Edge cases** - Circular dependencies, dynamic file creation, file renames during execution

---

## Open Questions / Unverified Claims

**OQ-001: Commit Message Format for Batches**

**Question**: Should batch commits list all task IDs or use a summary message?

**Options**:
- Option A: `git commit -m "Batch 1: PLAN-001, PLAN-002"` (explicit task list)
- Option B: `git commit -m "Implement authentication features (2 tasks)"` (summary)

**What's missing**: User preference or convention guidance for commit message verbosity

**Impact**: Medium (affects git history readability)

**Proposed resolution**: Default to Option A (explicit), allow user configuration

---

**OQ-002: User Approval Granularity**

**Question**: Should user approve each batch, or entire parallel execution upfront?

**Options**:
- Option A: Pause after each batch for approval (current behavior per-task, extended to per-batch)
- Option B: User approves entire plan upfront, no pauses during execution
- Option C: Configurable (user chooses granularity)

**What's missing**: UX research on user workflow preferences (how much control do users want?)

**Impact**: High (affects user experience and error recovery)

**Proposed resolution**: Default to Option A (pause per batch), add Option B as advanced setting

---

**OQ-003: Semantic Dependency Hints**

**Question**: Should Planner allow manual dependency annotations for semantic dependencies beyond file overlap?

**Example**: PLAN-001 changes API interface, PLAN-002 implements client using new interface (different files, but semantic dependency)

**What's missing**: Analysis of how often semantic dependencies are missed by file-based detection

**Impact**: Medium (affects parallelization accuracy)

**Proposed resolution**: Start with file-based only (Phase 1-4), add manual hints in future if needed

---

**OQ-004: Task Prioritization Within Batches**

**Question**: Should high-priority tasks execute first within a batch, or truly concurrent?

**Options**:
- Option A: Truly concurrent (all tasks in batch start simultaneously)
- Option B: Priority-ordered (start high-priority first, then others)

**What's missing**: Performance analysis of task execution ordering impact

**Impact**: Low (minor optimization)

**Proposed resolution**: Option A (truly concurrent) for simplicity

---

**OQ-005: Cross-Batch Verification**

**Question**: Should verification run after each batch, or only at the end of all batches?

**Options**:
- Option A: Verify after each batch (early error detection, slower)
- Option B: Verify only at end (faster, but errors detected late)
- Option C: Configurable

**What's missing**: Trade-off analysis between early error detection vs. execution speed

**Impact**: Medium (affects error recovery time)

**Proposed resolution**: Option A (verify per batch) for safer execution

---

**OQ-006: OpenCode Task Tool Concurrency Limits**

**Question**: What is the maximum number of concurrent task() invocations supported by OpenCode framework?

**What's missing**: Official OpenCode documentation on task tool concurrency limits

**Verification needed**: Test with 2, 4, 8, 16 concurrent task() calls to determine practical limits

**Impact**: High (constrains max_parallel_tasks default value)

**Proposed resolution**: Test empirically, default max_parallel_tasks to 4 (conservative), document findings

---

## References

### Code References

1. **agent/implementation-controller.md:36** - Sequential execution enforcement
   ```
   **One Task at a Time**: Never proceed to task N+1 until task N is verified, committed, and approved by the user.
   ```

2. **agent/implementation-controller.md:84-185** - Execution Protocol (Phase 0, Phase 1..N)
   - Phase 0: Initialize (read plan, STATE, repository status)
   - Phase 1..N: Task loop (delegate, verify, commit, update STATE, pause)

3. **agent/implementation-controller.md:675-709** - STATE File Format
   ```markdown
   **Current Task**: PLAN-003
   **Total Tasks**: 10
   
   ## Execution Progress
   
   **Completed Tasks**:
   - ✅ PLAN-001: Description (status, commit, timestamp)
   ```

4. **agent/planner.md:492-726** - Output Format
   - Task list structure (PLAN-XXX tasks with File(s) field)
   - Plan metadata structure (Inputs, Dependencies, etc.)

5. **agent/task-executor.md:1-598** - Task Executor design (stateless, single-task)

### System Documentation

6. **Bash tool system instructions** - Parallel tool invocation
   ```
   When issuing multiple commands:
   - If the commands are independent and can run in parallel, make multiple Bash tool calls in a single message.
   ```

### External References

7. **Topological Sort Algorithm** - Standard algorithm for dependency graph scheduling
   - Type: Algorithm Reference
   - Authority: High (established computer science algorithm)

8. **Git Reset Documentation** - Rollback capability
   - Command: `git reset --hard HEAD~N`
   - Type: Tool Documentation
   - Authority: High (official Git documentation)

---

## Summary Table

| Component | Changes | Complexity | Backward Compatible | Effort |
|-----------|---------|------------|---------------------|--------|
| Planner | Add dependency analysis, new output sections (PAR-001, PAR-002) | Medium | Yes (optional sections) | 2-3 days |
| Implementation Controller | Batch orchestration, rollback, multi-delegation (PAR-003) | High | Yes (falls back to sequential) | 4-5 days |
| Task Executor | None | None | N/A | 0 days |
| STATE file | New format with batch tracking (PAR-004) | Low | Yes (auto-migrate) | 2-3 days |
| Configuration | Add execution_mode, max_parallel_tasks, commit_strategy (PAR-005) | Low | Yes (defaults sequential) | 2-3 days |
| **Total** | **5 components** | **Medium-High** | **Yes** | **10-13 days** |

---

## Recommendation

**Proceed with phased implementation** starting with:

1. **Phase 1: Planner changes** (low risk, high value) - Add dependency analysis and output format extensions
2. **Phase 2: Implementation Controller batch execution** (medium risk, core functionality) - Implement parallel task delegation
3. **Phase 3: Rollback and STATE file** (medium risk, safety) - Add failure recovery
4. **Phase 4: Configuration and optimization** (low risk, polish) - Add user controls and finalize

**Expected impact**: 30-50% reduction in plan execution time for plans with significant independent tasks, better LLM concurrency utilization, improved user experience for large plans.

**Risk level**: Medium (architectural change with high complexity in Implementation Controller, but strong backward compatibility and rollback mitigations)

**Next steps**:
1. Validate dependency algorithm with sample plans
2. Test OpenCode task() concurrency limits (OQ-006)
3. Begin Phase 1 implementation (Planner dependency analysis)
4. Gather user feedback on approval granularity (OQ-002) and commit message format (OQ-001)

</answer>