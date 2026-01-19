# Web-Search-Researcher Agent Communication - Test Cases

## Test Case 1: Successful Research (Official Docs)

**Invocation**:
```
task({
  subagent_type: "web-search-researcher",
  description: "Research React 18 hooks",
  prompt: "Research React 18 authentication hooks and patterns. Focus on official documentation. Correlation: test-react-auth"
})
```

**Expected Response**:
- ✅ YAML frontmatter present with all 9 fields
- ✅ `correlation_id: test-react-auth` matches request
- ✅ `sources_found: N` where N ≥ 1
- ✅ `confidence: HIGH` or `MEDIUM`
- ✅ `<thinking>` section documents search queries
- ✅ `<answer>` section has all 5 sections (Quick Answer, Source 1, Confidence, Version, Warnings)
- ✅ Source 1 has YAML metadata with all 5 fields (url, type, date, version, authority)
- ✅ Code example includes source URL, language, line numbers

**Validation Commands**:
```bash
# Check frontmatter parsing
grep -A 10 "^---$" response.md | grep "correlation_id: test-react-auth"

# Check thinking section
grep "<thinking>" response.md

# Check answer structure
grep "## Quick Answer" response.md
grep "## Source 1:" response.md
grep "## Confidence Score:" response.md
```

---

## Test Case 2: No Results Found

**Invocation**:
```
task({
  subagent_type: "web-search-researcher",
  description: "Research non-existent library",
  prompt: "Research authentication patterns for the 'totally-fake-library-xyz-123' npm package. Correlation: test-no-results"
})
```

**Expected Response**:
- ✅ YAML frontmatter present with `confidence: NONE`
- ✅ `sources_found: 0`
- ✅ `<thinking>` documents failed searches
- ✅ Quick Answer = "⚠️ **No Definitive Answer Found**"
- ✅ Confidence Score section present with "NONE" value
- ✅ "Recommended Next Steps" section with 3 actionable items
- ✅ NO Source 1..N sections (0 sources)

**Validation Commands**:
```bash
# Check no results marker
grep "⚠️ \*\*No Definitive Answer Found\*\*" response.md

# Check confidence
grep "confidence: NONE" response.md

# Check next steps
grep "## Recommended Next Steps" response.md
```

---

## Test Case 3: Multiple Sources

**Invocation**:
```
task({
  subagent_type: "web-search-researcher",
  description: "Research Stripe API",
  prompt: "Research Stripe v3 payment intents API. Find official docs and community examples. Correlation: test-multi-source"
})
```

**Expected Response**:
- ✅ `sources_found: N` where N ≥ 2
- ✅ Source 1 with `type: official_docs` and `authority: high`
- ✅ Source 2 with different type (e.g., `github_issue`, `stackoverflow`)
- ✅ Each source has YAML metadata
- ✅ Each source has code example (if applicable)
- ✅ Confidence reasoning mentions multiple sources

**Validation Commands**:
```bash
# Count sources
grep -c "## Source [0-9]:" response.md

# Check source types differ
grep "type: official_docs" response.md
grep "type: github_issue\|type: stackoverflow\|type: blog" response.md
```

---

## Test Case 4: Researcher Agent Citation Integration

**Setup**: Researcher agent receives web-search-researcher response

**Expected Behavior**:
- ✅ Researcher can parse YAML frontmatter
- ✅ Researcher extracts URL from source metadata
- ✅ Researcher creates URL-based citation (not file:line format)
- ✅ Citation includes: Evidence (URL), Date, Type, Excerpt

**Example Citation**:
```markdown
* **Evidence (Web Research):** https://stripe.com/docs/api/payment_intents
* **Date:** 2025-12 (verified current as of 2026-01-19)
* **Type:** official_docs (authority: high)
* **Excerpt:**
  ```javascript
  const intent = await stripe.paymentIntents.create({ amount: 2000 });
  ```
```

---

## Test Case 5: Planner Agent Citation Integration

**Setup**: Planner agent receives web-search-researcher response for API validation

**Expected Behavior**:
- ✅ Planner checks frontmatter `confidence` field for quick assessment
- ✅ Planner extracts code example from Source 1
- ✅ Planner creates Evidence citation in PLAN-XXX task
- ✅ Citation format matches web research format (URL + Date + Type + Excerpt)

**Example in Implementation Plan**:
```markdown
### PLAN-005: Integrate Stripe Payment API
- **Evidence (Web Research):** https://stripe.com/docs/api/payment_intents/create
- **Date:** 2025-12 (verified current)
- **Excerpt:**
  ```javascript
  const intent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd',
  });
  ```
```

---

## Acceptance Criteria

All test cases must pass with:
1. ✅ Correct YAML frontmatter structure (9 required fields)
2. ✅ Proper `<thinking>` and `<answer>` tag separation
3. ✅ Source metadata in YAML format (5 required fields per source)
4. ✅ Code examples with source URL, language, line numbers
5. ✅ "No results" format maintains same structure as success case
6. ✅ Consumer agents (Researcher, Planner) can parse and cite correctly

---

## Manual Testing Steps

### Prerequisites
1. Ensure web-search-researcher subagent is available in the system
2. Have a text editor and terminal ready for validation
3. Create a working directory for test outputs: `mkdir -p /tmp/web-search-tests`

### Step 1: Test Successful Research (Test Case 1)
1. **Invoke the subagent** with Test Case 1 invocation
2. **Save response** to `/tmp/web-search-tests/test-case-1-response.md`
3. **Run validation commands**:
   ```bash
   cd /tmp/web-search-tests
   grep -A 10 "^---$" test-case-1-response.md | grep "correlation_id: test-react-auth"
   grep "<thinking>" test-case-1-response.md
   grep "## Quick Answer" test-case-1-response.md
   grep "## Source 1:" test-case-1-response.md
   grep "## Confidence Score:" test-case-1-response.md
   ```
4. **Manual verification**:
   - Open file and verify YAML frontmatter has 9 fields
   - Check that Source 1 has YAML metadata with 5 fields
   - Verify code example has source URL, language tag, and appears between triple backticks
   - Confirm `<thinking>` and `<answer>` sections are present

### Step 2: Test No Results Found (Test Case 2)
1. **Invoke the subagent** with Test Case 2 invocation
2. **Save response** to `/tmp/web-search-tests/test-case-2-response.md`
3. **Run validation commands**:
   ```bash
   cd /tmp/web-search-tests
   grep "⚠️ \*\*No Definitive Answer Found\*\*" test-case-2-response.md
   grep "confidence: NONE" test-case-2-response.md
   grep "## Recommended Next Steps" test-case-2-response.md
   ```
4. **Manual verification**:
   - Confirm `sources_found: 0` in frontmatter
   - Verify NO "Source 1" sections exist
   - Check that Recommended Next Steps has 3+ actionable items

### Step 3: Test Multiple Sources (Test Case 3)
1. **Invoke the subagent** with Test Case 3 invocation
2. **Save response** to `/tmp/web-search-tests/test-case-3-response.md`
3. **Run validation commands**:
   ```bash
   cd /tmp/web-search-tests
   grep -c "## Source [0-9]:" test-case-3-response.md
   grep "type: official_docs" test-case-3-response.md
   grep "type: github_issue\|type: stackoverflow\|type: blog" test-case-3-response.md
   ```
4. **Manual verification**:
   - Count should be ≥ 2
   - Verify each source has different `type` field
   - Check that each source has YAML metadata block
   - Confirm confidence reasoning mentions multiple sources

### Step 4: Test Researcher Integration (Test Case 4)
1. **Simulate Researcher agent** receiving Test Case 1 response
2. **Extract citation components**:
   ```bash
   cd /tmp/web-search-tests
   # Extract URL from Source 1
   grep -A 5 "## Source 1:" test-case-1-response.md | grep "url:"
   # Extract date
   grep -A 5 "## Source 1:" test-case-1-response.md | grep "date:"
   # Extract type
   grep -A 5 "## Source 1:" test-case-1-response.md | grep "type:"
   ```
3. **Manual verification**:
   - Verify citation format matches example in Test Case 4
   - Confirm URL uses https:// format (not file:line format)
   - Check that excerpt is properly formatted code block

### Step 5: Test Planner Integration (Test Case 5)
1. **Simulate Planner agent** parsing Test Case 3 response
2. **Quick assessment check**:
   ```bash
   cd /tmp/web-search-tests
   grep "^confidence:" test-case-3-response.md
   ```
3. **Manual verification**:
   - Verify Planner can extract confidence value from frontmatter
   - Confirm code example from Source 1 can be copied to implementation plan
   - Check that citation format includes all 4 components (URL, Date, Type, Excerpt)

### Step 6: Spot-Check All Acceptance Criteria
For each test case response file:
1. **YAML frontmatter structure**: Count fields in frontmatter (should be 9)
   ```bash
   grep -A 15 "^---$" test-case-*.md | head -n 16 | grep -c ":"
   ```
2. **Thinking/Answer separation**: Verify both tags present
   ```bash
   grep "<thinking>" test-case-*.md && grep "<answer>" test-case-*.md
   ```
3. **Source metadata**: Verify YAML format (not prose)
   ```bash
   grep -A 10 "## Source 1:" test-case-*.md | grep "url:\|type:\|date:\|version:\|authority:"
   ```
4. **Code examples**: Check for source URL in comments/metadata
5. **No results format**: Compare test-case-2 structure to test-case-1 (should have same sections except Sources)
6. **Consumer parsing**: Review Test Case 4 and 5 citation outputs

### Success Criteria
- All 5 test cases execute without errors
- All validation commands return expected matches (exit code 0)
- Manual verification confirms all checklist items
- Consumer integration tests (4 and 5) produce properly formatted citations
- Acceptance criteria 1-6 are all verified
