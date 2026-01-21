# Voice Bot Design Patterns for Dify

Specialized patterns, constraints, and best practices for building real-time voice bots in Dify.

## Table of Contents

1. [Identifying Voice Bots](#identifying-voice-bots)
2. [Critical Voice Bot Constraints](#critical-voice-bot-constraints)
3. [Latency Optimization](#latency-optimization)
4. [Speech-to-Text Error Handling](#speech-to-text-error-handling)
5. [Response Format Rules](#response-format-rules)
6. [CVG Integration](#cvg-integration)
7. [Voice-Specific Design Principles](#voice-specific-design-principles)

---

## Identifying Voice Bots

How to recognize when a Dify bot is designed for voice/phone use:

### Plugin Dependency

**CVG (CognitiveVoice.io) Integration:**
```yaml
dependencies:
  - type: marketplace
    value:
      marketplace_plugin_unique_identifier: vier-gmbh/voice-extension:1.0.7@...
```

**Indicator:** Presence of `vier-gmbh/voice-extension` plugin is the strongest signal.

### Feature Flags

**Speech-to-Text Enabled:**
```yaml
features:
  speech_to_text:
    enabled: true
```

**Text-to-Speech Enabled:**
```yaml
features:
  text_to_speech:
    enabled: true
    language: de-DE
    voice: female-voice-1
```

### System Prompt Indicators

**Keywords in LLM prompts:**
- "voice bot"
- "caller" / "anrufer"
- "spoken" / "gesprochen"
- "phone" / "telefon"
- "Keep answers short"
- "Never use bullet points"
- "flowing spoken language"

**Example:**
```yaml
prompt_template:
  - role: system
    text: |
      <Format>You are a voice bot. Keep answers short enough to maintain 
      a natural spoken rhythm and avoid user impatience.</Format>
      <Format>Never use bullet points or lists — respond in flowing, 
      spoken language.</Format>
```

### Call State Handling

**Conversation variables tracking call state:**
```yaml
conversation_variables:
  - name: call_state
    value: greeting
    value_type: string
  - name: caller_id
    value: ''
    value_type: string
```

**Common call states:**
- `greeting` - Initial state
- `message` - Main conversation
- `termination` - End call
- `inactive` - Caller silent
- `recording-available` - Recording ready

---

## Critical Voice Bot Constraints

### Latency Overhead per Node

**CRITICAL:** Each node in a Dify workflow adds 20-50ms overhead beyond its processing time.

**Impact:**
- 1 node: 20-50ms
- 3 sequential nodes: 60-150ms
- 5 sequential nodes: 100-250ms (before LLM processing!)
- 10 sequential nodes: 200-500ms (unacceptable for voice)

**User Patience:**
- Voice callers expect responses within 1-2 seconds total
- Text chat users are more tolerant of delays
- Real-time voice conversations cannot tolerate multi-second pauses

**Latency Budget Example:**
```
Sequential nodes (5): 100-250ms
LLM processing: 500-1500ms
Text-to-speech: 200-400ms
Network latency: 50-100ms
------------------------
TOTAL: 850-2250ms (acceptable range: <2000ms)
```

### Sequential Depth Before First Response

**Goal:** Minimize the number of sequential nodes between start and first answer/end node.

**Target:** <5 sequential nodes before first response

**Counting Example:**
```
Start → LLM Classify → IF/ELSE → LLM Response → Answer
  1         2             3           4           5
```
This is 5 nodes = acceptable.

```
Start → Extract → Validate → Classify → Route → Fetch → Process → Response → Answer
  1       2         3          4         5        6        7         8         9
```
This is 9 nodes = too deep for voice! Refactor needed.

---

## Latency Optimization

### Strategy 1: Consolidate LLM Nodes

**❌ Bad: Multiple specialized LLM nodes (sequential)**
```
Start → Language Detect LLM → Group Classify LLM → Intent Extract LLM → Response LLM → Answer
         (30-100ms overhead)    (30-100ms)           (30-100ms)           (30-100ms)
```
**Total overhead:** 120-400ms + 4 LLM calls

**✅ Good: Single comprehensive LLM with structured output**
```
Start → Combined Classification LLM → Response LLM → Answer
         (30-100ms overhead)           (30-100ms)
```
**Total overhead:** 60-200ms + 2 LLM calls

**Implementation:**
```yaml
# Consolidated LLM with structured extraction
- data:
    prompt_template:
      - role: system
        text: |
          Extract the following from the user's input:
          1. Language (de/en/fr)
          2. Product group (Flussreisen/Hochsee)
          3. Intent (booking/question/complaint)
          
          Respond in JSON format:
          {"language": "de", "group": "Flussreisen", "intent": "booking"}
      - role: user
        text: '{{#sys.query#}}'
    model:
      completion_params:
        response_format: json_object
    type: llm
  id: '1234567890123'
```

### Strategy 2: Minimize Sequential Chains

**Identify opportunities for parallelization:**

**❌ Bad: Sequential validation steps**
```
Input → Validate Format → Check Database → Verify Permissions → Process
```

**✅ Good: Parallel validation (if independent)**
```
Input → Iteration (parallel) → [Validate Format, Check DB, Verify Perms] → Aggregate → Process
```

**Implementation:**
```yaml
# Parallel iteration for independent checks
- data:
    is_parallel: true
    parallel_nums: 3
    iterator_selector: ['code_node', 'validation_tasks']
    type: iteration
  id: 'parallel_validation'
```

### Strategy 3: Precompute Static Content

**❌ Bad: Generate standard responses every call**
```
User Input → Classify → Generate Greeting → Response
```

**✅ Good: Use environment variables for static content**
```yaml
environment_variables:
  - name: GREETING_STANDARD
    value: 'Guten Tag! Willkommen bei Netto IT-Support. Wie kann ich Ihnen helfen?'
  - name: GREETING_CALLBACK
    value: 'Vielen Dank für Ihren Rückruf. Lassen Sie uns Ihr Anliegen besprechen.'

# Reference directly in answer node
- data:
    answer: '{{#env.GREETING_STANDARD#}}'
    type: answer
  id: 'greeting_answer'
```

### Strategy 4: Optimize LLM Configuration

**Reduce LLM latency:**
```yaml
model:
  name: gpt-4o-mini  # Faster, cheaper model for simple tasks
  completion_params:
    temperature: 0.1  # Lower = faster (less sampling)
    max_tokens: 150   # Limit for short voice responses
```

**Use appropriate models:**
- Simple classification: `gpt-4o-mini`, `claude-haiku`
- Complex reasoning: `gpt-4o`, `claude-sonnet`
- Creative responses: Higher temperature, more tokens

---

## Speech-to-Text Error Handling

### Common Transcription Errors

**Homophones and similar-sounding words:**
- "Flussreisen" → transcribed as: "fluß", "plus", "schluss", "river", "muss", "nuss"
- "Hochsee" → transcribed as: "hoch sehen", "ocean", "hochsehen"
- "Buchhaltung" → "Buchaltung", "bookkeeping", "accounting"

### Extraction Prompts with Transcription Variations

**Pattern:** List acceptable transcription variations in prompts.

**Example - Group Selection:**
```yaml
prompt_template:
  - role: user
    text: |
      Identify if the user selects "Flussreisen" or "Hochsee" from this question, 
      accounting for speech recognition errors.
      
      Match these transcription variations:
      
      Flussreisen group: 
        - fluss, fluß, plus, schluss, river, muss, nuss, fuß, schloss, los, job, flucht
      
      Hochsee group: 
        - hochsee, hoch sehen, ocean, hochsehen, hochseh
      
      User input: {{#sys.query#}}
      
      Respond with exactly: "Flussreisen" or "Hochsee"
```

**Example - Filiale Number Extraction:**
```yaml
prompt_template:
  - role: user
    text: |
      Extract the Filiale number from the user's spoken input.
      
      Input is from speech-to-text and may contain transcription errors.
      
      Patterns to match:
      - "Filiale 42" → 42
      - "Vielleicht 42" (misheard "filiale") → 42
      - "Telefon 42" (misheard) → 42
      - "Nr. 42", "Nummer 42" → 42
      
      Extract ONLY the numeric value.
      
      User input: {{#sys.query#}}
```

### Flexible Retry Logic

**Pattern:** Multiple attempts with increasingly relaxed matching.

```yaml
# First attempt: Strict extraction
- data:
    prompt_template:
      - role: user
        text: 'Extract the exact Filiale number (format: 1-999): {{#sys.query#}}'
    type: llm
  id: 'strict_extract'

# Check if successful
- data:
    cases:
      - case_id: 'success'
        conditions:
          - comparison_operator: not empty
            variable_selector: ['strict_extract', 'text']
    type: if-else
  id: 'check_extract'

# If failed, retry with flexible matching
- data:
    prompt_template:
      - role: user
        text: |
          The user is trying to provide their Filiale number but there may be 
          speech recognition errors. Extract ANY number that could be a Filiale ID.
          
          Input: {{#sys.query#}}
    type: llm
  id: 'flexible_extract'
```

---

## Response Format Rules

### Voice-Appropriate Output

**✅ Good - Flowing Spoken Language:**
```
Ich habe verstanden, dass Sie ein Problem mit der Kundenanzeige haben. 
Das Display ist schwarz. Lassen Sie mich Ihnen dabei helfen.
```

**❌ Bad - Bullet Points (Text Chat Style):**
```
Ich habe folgende Informationen erhalten:
- Problem: Kundenanzeige
- Symptom: Schwarzes Display
- Nächste Schritte:
  1. Neustart versuchen
  2. Kabel überprüfen
```

### System Prompt Rules

**Standard voice bot format rules:**
```yaml
prompt_template:
  - role: system
    text: |
      <Format>You are a voice bot. Keep answers short enough to maintain 
      a natural spoken rhythm and avoid user impatience.</Format>
      
      <Format>Never use bullet points or lists — respond in flowing, 
      spoken language.</Format>
      
      <Format>Maintain a tone that is friendly, calm, and professional.</Format>
      
      <Format>Use short sentences. Avoid complex nested clauses.</Format>
```

### Phone Number Pronunciation

**Special handling for reading phone numbers:**
```yaml
<Rule>When reading phone numbers, slightly lengthen the pauses between 
number groups (e.g., after area code and every 2–3 digits) to give the 
listener time to follow or note them down. Do not verbalize the pause.</Rule>
```

**Example output:**
```
Die Hotline-Nummer lautet: null-acht-null-null [pause] eins-zwei-drei [pause] vier-fünf-sechs-sieben.
```

### Email/URL Pronunciation

**Spell out special characters:**
```yaml
<Rule>When reading email addresses or URLs, spell out special characters 
clearly: "at" for @, "dot" for ., "slash" for /.</Rule>
```

**Example output:**
```
Die Email-Adresse ist: support [at] netto [dot] de
```

### Interruption Handling

**Acknowledge when caller interrupts:**
```yaml
<Interruption>
  When you have been interrupted by the caller, just recognize it with 
  a short remark like "yes?" or "Ja, bitte?".
</Interruption>
```

### Avoid Confusing Instructions

**❌ Don't tell caller to "call us" (they're already on the phone!):**
```yaml
<Rule>Do not tell the user to "call us" or to "contact us by phone". 
The user is already speaking with you through this voice bot, so such 
instructions are confusing and unnecessary.</Rule>
```

---

## CVG Integration

### CVG Plugin Configuration

**Plugin Dependency:**
```yaml
dependencies:
  - type: marketplace
    value:
      marketplace_plugin_unique_identifier: vier-gmbh/voice-extension:1.0.7@5585f4cd7e7145e1d14e915bff72e582d924b120ad5851a3f0841f8101bc09cc
```

### Call State Management

**Tracking call lifecycle:**
```yaml
conversation_variables:
  - name: call_state
    value: greeting
    value_type: string
```

**Common states:**
- `greeting` - Initial greeting, start recording
- `message` - Main conversation flow
- `termination` - End call sequence
- `answer` - Caller response expected
- `inactive` - Caller silent/timeout
- `recording-available` - Recording ready for processing
- `forward` - Forwarding to agent
- `callback` - Callback scheduled
- `voicemail` - Leave message

### CVG Commands (Tool Nodes)

**Call Forwarding:**
```yaml
# Forward call to human agent
- data:
    provider_id: cvg
    tool_name: forward_call
    tool_parameters:
      destination:
        type: constant
        value: '+49123456789'
    type: tool
  id: 'forward_node'
```

**Call Recording:**
```yaml
# Start/stop recording
- data:
    provider_id: cvg
    tool_name: control_recording
    tool_parameters:
      action:
        type: constant
        value: start  # or 'stop'
    type: tool
  id: 'recording_node'
```

**Background Audio:**
```yaml
# Play hold music or announcements
- data:
    provider_id: cvg
    tool_name: play_audio
    tool_parameters:
      audio_url:
        type: mixed
        value: '{{#env.HOLD_MUSIC_URL#}}'
    type: tool
  id: 'audio_node'
```

### Allow Interruption Configuration

**Enable caller interruptions mid-response:**
```yaml
features:
  text_to_speech:
    enabled: true
    allow_interrupt: true  # Caller can interrupt bot
```

---

### CVG Voice Event Handling

Voice bots receive CVG platform events through the start node. These events drive the conversation lifecycle (greeting, user message, timeout, termination). The start node must be configured with specific input variables to receive CVG event metadata.

**Start Node Configuration for CVG:**
```yaml
- data:
    type: start
    variables:
      - label: status              # CVG event type (CRITICAL for routing)
        type: text-input
        variable: status
      - label: dialogId            # Unique conversation identifier
        type: text-input
        variable: dialogId
      - label: authToken           # CVG authentication token
        type: paragraph
        variable: authToken
      - label: local               # Local phone number (bot's number)
        type: text-input
        variable: local
      - label: remote              # Caller's phone number
        type: text-input
        variable: remote
      - label: triggeredBargeIn    # Caller interrupted bot (1 or 0)
        type: number
        variable: triggeredBargeIn
      - label: callbackUrl         # CVG callback endpoint
        type: text-input
        variable: callbackUrl
      - label: eventAsString       # Full event payload (for debugging)
        type: paragraph
        variable: eventAsString
      - label: type                # Event type (redundant with status)
        type: text-input
        variable: type
  id: '1762426927307'
```

**CRITICAL:** The `status` field is the primary routing signal. All CVG voice bots must route based on this field immediately after the start node.

**CVG Event Types (status field values):**

| Event Type | When Triggered | User Input Available | Typical Action |
|------------|----------------|---------------------|----------------|
| `greeting` | Call initiated | No | Play welcome message |
| `message` | User spoke | Yes (`sys.query`) | Process user input with LLM |
| `answer` | Bot expects response | No | Wait for user (not commonly used in Dify) |
| `inactive` | User silent/timeout | No | Increment timeout counter, warn or terminate |
| `termination` | Call ended by user/system | No | Log conversation, cleanup |
| `recording-available` | Voice recording ready | No | Process recording (advanced use) |

**Note:** The `message` event is the main conversation driver. `sys.query` contains the transcribed user input (STT output).

**Event Routing Pattern (Root IF/ELSE):**

All CVG voice bots use a root IF/ELSE node immediately after start to route events:

```yaml
- data:
    cases:
      - case_id: 'greeting'
        conditions:
          - comparison_operator: is
            id: a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890
            value: greeting
            varType: string
            variable_selector:
              - '1762426927307'    # Start node ID
              - status
        id: 'greeting'
        logical_operator: and
      - case_id: 'message'
        conditions:
          - comparison_operator: is
            id: b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901
            value: message
            varType: string
            variable_selector:
              - '1762426927307'
              - status
        id: 'message'
      - case_id: 'inactive'
        conditions:
          - comparison_operator: is
            id: c3d4e5f6-a7b8-9012-c3d4-e5f6a7b89012
            value: inactive
            varType: string
            variable_selector:
              - '1762426927307'
              - status
        id: 'inactive'
      - case_id: 'termination'
        conditions:
          - comparison_operator: is
            id: d4e5f6a7-b8c9-0123-d4e5-f6a7b8c90123
            value: termination
            varType: string
            variable_selector:
              - '1762426927307'
              - status
        id: 'termination'
    type: if-else
  id: '1765442525888'
```

**Pattern Notes:**
- Each case routes to a different conversation path (greeting flow, main conversation, timeout handler, cleanup)
- The `id` field in each case MUST match `case_id` (Dify requirement)
- Use `is` operator for string comparison (status is always a string)
- All conditions have unique `id` fields (UUIDs recommended)

### Timeout/Inactive Handling Pattern

Detect caller silence and escalate warnings before terminating inactive calls. This pattern implements multi-threshold timeout handling using a counter incremented on each `inactive` event.

**Pattern Overview:**
1. Declare `inactive_count` conversation variable (integer, default 0)
2. On `inactive` event: increment counter with Code node
3. Check threshold with IF/ELSE: 1st warning at count=1, terminate at count≥2
4. Use environment variables for timeout messages

**Step 1: Declare Conversation Variable**

```yaml
conversation_variables:
  - description: Counter for consecutive inactive events in current state
    id: f8a9c3d1-2b4e-5f6a-8c9d-1e2f3a4b5c6d
    name: inactive_count
    selector:
      - conversation
      - inactive_count
    value: 0
    value_type: integer
```

**Step 2: Increment Counter with Code Node**

When the root IF/ELSE detects `status=inactive`, route to a Code node that increments the counter:

```yaml
- data:
    code: |\n      def main(current_count: int) -> dict:\n          \"\"\"Increment inactive event counter.\"\"\"\n          return {\n              \"new_count\": current_count + 1\n          }\n    code_language: python3
    outputs:
      new_count:
        children: null
        type: number
    title: 'Code: Increment Inactive Count'
    type: code
    variables:
      - value_selector:
          - conversation
          - inactive_count
        value_type: number
        variable: current_count
  id: '1736766201000'
```

**Step 2b: Update Conversation Variable**

Use Variable Assigner v2 to copy the incremented value back to `conversation.inactive_count`:

```yaml
- data:
    items:
      - input_type: variable
        operation: over-write
        value:
          - '1736766201000'    # Code node ID
          - new_count
        variable_selector:
          - conversation
          - inactive_count
        write_mode: over-write
    title: 'Timeout: Update Counter'
    type: assigner
    version: '2'
  id: '1736766202000'
```

**Step 3: Check Threshold and Route**

Use IF/ELSE to route based on counter value:

```yaml
- data:
    cases:
      - case_id: first_warning
        conditions:
          - comparison_operator: '='    # Numeric equality - must be quoted
            id: e1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a
            value: '1'                   # First timeout - warn
            varType: number
            variable_selector:
              - conversation
              - inactive_count
        id: first_warning
        logical_operator: and
      - case_id: terminate
        conditions:
          - comparison_operator: ≥       # Unicode greater-than-or-equal
            id: f2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b
            value: '2'                   # Second+ timeout - terminate
            varType: number
            variable_selector:
              - conversation
              - inactive_count
        id: terminate
        logical_operator: and
    title: 'Timeout: Check Threshold'
    type: if-else
  id: '1736766203000'
```

**Routing:**
- `first_warning` case → Answer node with `{{#env.TIMEOUT_WARNING#}}`
- `terminate` case → Answer node with `{{#env.TIMEOUT_TERMINATION#}}`, then CVG end call tool

**Step 4: Define Timeout Messages**

Use environment variables for reusable, translatable timeout messages:

```yaml
environment_variables:
  - name: TIMEOUT_WARNING
    value: Sind Sie noch da? Bitte antworten Sie, sonst muss ich das Gespräch beenden.
  - name: TIMEOUT_FINAL_WARNING
    value: Ich habe Sie jetzt länger nicht gehört. Wenn Sie noch Unterstützung benötigen, rufen Sie bitte erneut an.
  - name: TIMEOUT_TERMINATION
    value: Auf Wiederhören.
```

**Usage:**
```yaml
# In Answer node for first warning
answer: '{{#env.TIMEOUT_WARNING#}}'

# In Answer node for termination
answer: '{{#env.TIMEOUT_TERMINATION#}}'
```

**Complete Workflow:**

```
Start (status=inactive) 
  → IF/ELSE Router (route to inactive branch)
    → Code Node (increment counter: current + 1)
      → Assigner v2 (update conversation.inactive_count)
        → IF/ELSE Threshold Check
          ├─ count=1 → Answer (TIMEOUT_WARNING) → [return to conversation]
          └─ count≥2 → Answer (TIMEOUT_TERMINATION) → CVG End Call Tool
```

**Key Points:**
- Counter persists across conversation turns (conversation variable)
- Reset counter to 0 when user responds (in message event handler)
- Use Unicode `≥` operator for numeric comparison (not ASCII `>=`)
- Always quote numeric comparison values: `'1'`, `'2'`

---

## Voice-Specific Design Principles

### 1. Minimize Sequential Nodes

**Target:** <5 nodes before first response

**Strategy:**
- Consolidate multiple LLM calls into one
- Use environment variables for static content
- Parallelize independent operations
- Avoid deep nesting of IF/ELSE chains

### 2. Account for STT Errors

**Strategy:**
- List transcription variations in extraction prompts
- Use flexible retry logic (strict → relaxed)
- Implement multiple retry attempts for unclear inputs
- Validate extracted values with sanity checks

### 3. Optimize for Spoken Output

**Strategy:**
- Use flowing, natural language (no bullet points)
- Keep sentences short and simple
- Include pauses for phone numbers/emails
- Acknowledge interruptions gracefully
- Avoid confusing meta-instructions

### 4. State-Aware Conversations

**Strategy:**
- Track call state in conversation variables
- Handle call lifecycle events (greeting, message, termination)
- Manage timeouts and inactive states
- Provide clear exit points for caller

### 5. Production Monitoring

**Key Metrics:**
- Average response time (target: <2s)
- LLM latency (p50, p95, p99)
- STT accuracy (retry rate)
- Call completion rate
- Caller satisfaction (post-call survey)

### 6. Graceful Degradation

**Strategy:**
- Timeout handlers for unresponsive nodes
- Fallback to human agent when bot stuck
- Clear error messages in spoken language
- Retry configs on all external calls

---

## Example: Voice Bot Architecture

### Optimized Voice Bot Flow

```
Start (greeting state)
  ↓
LLM: Greet + Classify Intent (combined)
  │
  ├─→ Intent: Simple Question
  │   ↓
  │   LLM: Answer from Knowledge
  │   ↓
  │   Answer Node → TTS
  │
  ├─→ Intent: Complex Issue
  │   ↓
  │   LLM: Extract Details + Create Ticket (combined)
  │   ↓
  │   Variable Assigner: Update state to "solved"
  │   ↓
  │   Answer Node → TTS
  │
  └─→ Intent: Unclear
      ↓
      LLM: Clarifying Question
      ↓
      Answer Node → TTS
      (Loops back to Start on next message)
```

**Sequential depth:** 3-4 nodes (optimal for voice)

### Anti-Pattern: Over-Engineered Flow

```
Start
  ↓
LLM: Detect Language
  ↓
LLM: Classify Group
  ↓
LLM: Extract Intent
  ↓
IF/ELSE: Intent Router
  │
  ├─→ Code: Validate Input
  │   ↓
  │   HTTP: Check Database
  │   ↓
  │   IF/ELSE: Validation Result
  │   ↓
  │   LLM: Generate Response
  │   ↓
  │   Template: Format Output
  │   ↓
  │   Answer Node
```

**Sequential depth:** 8-10 nodes (too deep for voice!)

**Refactoring:** Consolidate language/group/intent into one LLM, parallelize validation, combine response generation + formatting.

---

## Quick Reference

### Voice Bot Checklist

- [ ] Plugin: `vier-gmbh/voice-extension` present
- [ ] Features: `speech_to_text` and `text_to_speech` enabled
- [ ] Sequential depth: <5 nodes before first response
- [ ] System prompt: Voice-specific format rules
- [ ] STT handling: Transcription variation lists in extraction prompts
- [ ] Response format: No bullet points, flowing language
- [ ] Phone numbers: Pronunciation rules specified
- [ ] Interruption: `allow_interrupt: true` configured
- [ ] Call states: Tracked in conversation variables
- [ ] Latency budget: <2s total response time
- [ ] Retry configs: On LLM and HTTP nodes
- [ ] Fallback: Forward to human agent option

### Latency Optimization Targets

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Sequential nodes | <3 | 3-5 | >5 |
| Node overhead | <100ms | 100-200ms | >200ms |
| LLM calls | 1-2 | 2-3 | >3 |
| Total response | <1.5s | 1.5-2s | >2s |

### Common Voice Bot Patterns

**Pattern:** Quick Greeting
```
Start → Answer (env.GREETING) → Wait for message
```

**Pattern:** Classify + Respond
```
Start → LLM (classify + respond) → Answer
```

**Pattern:** Extract + Validate + Respond
```
Start → LLM (extract + validate in prompt) → Answer
```

**Pattern:** Complex Flow with Fallback
```
Start → LLM (try automated) → IF/ELSE (success?) 
  ↓ [success]              ↓ [fail]
Answer                   Forward to Agent
```
