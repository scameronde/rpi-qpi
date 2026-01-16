# Dify Variable System Reference

Complete guide to variable reference syntax, types, and patterns in Dify DSL.

## Table of Contents

1. [Variable Reference Syntax](#variable-reference-syntax)
2. [System Variables](#system-variables)
3. [Conversation Variables](#conversation-variables)
4. [Environment Variables](#environment-variables)
5. [Iteration Variables](#iteration-variables)
6. [Field Path Resolution](#field-path-resolution)
7. [Common Patterns](#common-patterns)

---

## Variable Reference Syntax

### Basic Pattern

All variable references use the syntax: `{{#source.field#}}`

**Components:**
- `{{#` - Opening delimiter
- `source` - Node ID, special keyword, or variable scope
- `.field` - Field name or path (dot notation)
- `#}}` - Closing delimiter

**Examples:**
```yaml
# Reference LLM node output
{{#1734960001000.text#}}

# Reference HTTP response field
{{#1765791076602.status_code#}}

# Reference conversation variable
{{#conversation.state#}}

# Reference system variable
{{#sys.query#}}
```

---

## System Variables

System variables are automatically available without declaration.

### Workflow Mode Variables

Available in both `workflow` and `advanced-chat` modes:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `sys.user_id` | string | User identifier | `{{#sys.user_id#}}` |
| `sys.app_id` | string | Application ID | `{{#sys.app_id#}}` |
| `sys.workflow_id` | string | Workflow definition ID | `{{#sys.workflow_id#}}` |
| `sys.workflow_run_id` | string | Current execution run ID | `{{#sys.workflow_run_id#}}` |
| `sys.timestamp` | number | Execution start timestamp (Unix) | `{{#sys.timestamp#}}` |

### Chatflow Mode Additional Variables

Only available in `advanced-chat` mode:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `sys.query` | string | Current user message | `{{#sys.query#}}` |
| `sys.conversation_id` | string | Conversation session ID | `{{#sys.conversation_id#}}` |
| `sys.dialogue_count` | number | Turn counter (1-indexed) | `{{#sys.dialogue_count#}}` |

### Usage Examples

**LLM User Prompt:**
```yaml
prompt_template:
  - role: user
    text: |
      User query: {{#sys.query#}}
      User ID: {{#sys.user_id#}}
      Turn number: {{#sys.dialogue_count#}}
```

**HTTP Request Headers:**
```yaml
headers: |
  X-User-ID: {{#sys.user_id#}}
  X-Request-ID: {{#sys.workflow_run_id#}}
  X-Conversation-ID: {{#sys.conversation_id#}}
```

**Template Transform:**
```yaml
template: 'Request {{#sys.workflow_run_id#}} started at {{#sys.timestamp#}}'
```

---

## Conversation Variables

Conversation variables persist across chat turns in `advanced-chat` mode. They must be declared before use.

### Declaration

**Location:** `workflow.conversation_variables` array

**Required Fields:**
```yaml
conversation_variables:
  - description: 'Human-readable description'
    id: 07ea9b5b-edf2-471d-8206-50e95e7ab87e  # UUID
    name: variable_name
    selector:
      - conversation
      - variable_name
    value: default_value  # Must match value_type
    value_type: string    # Type specification
```

**Supported Types:**
- `string` - Text value
- `number` - Numeric value (integer or float)
- `boolean` - true/false
- `array[string]` - Array of strings
- `array[number]` - Array of numbers
- `array[object]` - Array of objects
- `object` - JSON object

### Reference Syntax

**Pattern:** `{{#conversation.variable_name#}}`

**Examples:**
```yaml
# String variable
{{#conversation.state#}}

# Number variable
{{#conversation.counter#}}

# Array variable
{{#conversation.topics#}}

# Object variable
{{#conversation.user_profile#}}
```

### Declaration Examples

**String Variable:**
```yaml
- description: 'Current conversation state (triage, solve, solved)'
  id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
  name: state
  selector:
    - conversation
    - state
  value: triage
  value_type: string
```

**Array Variable:**
```yaml
- description: 'List of searched topics'
  id: 07ea9b5b-edf2-471d-8206-50e95e7ab87e
  name: topics
  selector:
    - conversation
    - topics
  value: []
  value_type: array[string]
```

**Object Variable:**
```yaml
- description: 'User profile information'
  id: f1e2d3c4-b5a6-7890-1234-567890abcdef
  name: user_profile
  selector:
    - conversation
    - user_profile
  value:
    name: ''
    age: null
    preferences: []
  value_type: object
```

### Updating Conversation Variables

Use Variable Assigner v2 node (type: `assigner`, version: `'2'`):

```yaml
- data:
    items:
      # Set literal value
      - input_type: constant
        operation: set
        value: solved
        variable_selector:
          - conversation
          - state
        write_mode: over-write
      
      # Copy from node output
      - input_type: variable
        operation: overwrite
        value_selector:
          - '1765447098058'
          - ticket_id
        variable_selector:
          - conversation
          - ticket_id
        write_mode: over-write
      
      # Append to array
      - input_type: variable
        operation: append
        value_selector:
          - conversation
          - current_topic
        variable_selector:
          - conversation
          - topics
        write_mode: over-write
    type: assigner
    version: '2'
  id: '1739245826988'
```

---

## Environment Variables

Environment variables store static configuration, secrets, and large text blocks.

### Declaration

**Location:** `workflow.environment_variables` array

**Required Fields:**
```yaml
environment_variables:
  - description: 'API key for external service'
    id: c5c7fb48-bf3a-47c5-9139-143735c83a6d
    name: API_KEY
    selector:
      - env
      - API_KEY
    value: 'sk-abc123...'
    value_type: string
```

### Reference Syntax

**Pattern:** `{{#env.VARIABLE_NAME#}}`

**Examples:**
```yaml
# API key
{{#env.API_KEY#}}

# Knowledge base content
{{#env.KNOWLEDGE#}}

# System prompt template
{{#env.SYSTEM_PROMPT#}}
```

### Usage Examples

**HTTP Authorization:**
```yaml
authorization:
  config:
    api_key: '{{#env.API_KEY#}}'
    type: bearer
```

**LLM System Prompt:**
```yaml
prompt_template:
  - role: system
    text: '{{#env.SYSTEM_PROMPT#}}'
```

**Large Static Content:**
```yaml
- description: 'Knowledge about BetterDoc service'
  id: 78127fbe-4348-4d68-a1dd-fca93e41b8e5
  name: KNOWLEDGE
  selector:
    - env
    - KNOWLEDGE
  value: |
    ## General Information
    
    **Who is BetterDoc?**
    BetterDoc is a medical consultation service...
    
    (Multiple paragraphs of content)
  value_type: string
```

### Naming Convention

- Use SCREAMING_SNAKE_CASE: `API_KEY`, `SYSTEM_PROMPT`, `KNOWLEDGE_BASE`
- Semantic names describing content/purpose
- Avoid abbreviations: `MESSAGE_GREETING` not `MSG_GREET`

---

## Iteration Variables

Special variables available inside iteration nodes.

### Built-in Variables

When inside an iteration (parentId set to iteration node):

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{#iteration_id.item#}}` | any | Current array element | `{{#1762417018690.item#}}` |
| `{{#iteration_id.index#}}` | number | 0-based index | `{{#1762417018690.index#}}` |

### Usage Example

**Iteration Configuration:**
```yaml
- data:
    iterator_selector:
      - '1762416870903'  # Node producing array
      - result           # Field name: ['one', 'two', 'three']
    type: iteration
  id: '1762417018690'
```

**LLM Node Inside Iteration:**
```yaml
- data:
    isInIteration: true
    iteration_id: '1762417018690'
    prompt_template:
      - role: user
        text: |
          Process item {{#1762417018690.index#}}: {{#1762417018690.item#}}
    type: llm
  id: '1762417044235'
  parentId: '1762417018690'
```

**Output:**
- First iteration: "Process item 0: one"
- Second iteration: "Process item 1: two"
- Third iteration: "Process item 2: three"

---

## Field Path Resolution

### Nested Field Access

Use dot notation to access nested fields:

**Simple Field:**
```yaml
{{#node_id.field_name#}}
```

**Nested Object Field:**
```yaml
{{#http_node.body.data.results#}}
```

**Array Element (if supported):**
```yaml
{{#http_node.body.items.0.name#}}
```

### Output Field Patterns by Node Type

**LLM Node:**
- `text` - Generated text
- `usage.total_tokens` - Token usage (nested)

**HTTP Request Node:**
- `body` - Response body (parsed JSON)
- `body.field_name` - Nested field in JSON response
- `status_code` - HTTP status
- `headers` - Response headers

**Code Node:**
- Custom fields defined in `outputs` configuration
- Example: If code returns `{"result": "value", "count": 5}`:
  - `{{#code_node.result#}}` → "value"
  - `{{#code_node.count#}}` → 5

**Start Node:**
- Variable names defined in `variables` array
- Example: If start has variable `excel`:
  - `{{#start_node.excel#}}`

**Document Extractor:**
- `text` - Extracted text content

**Template Transform:**
- `output` - Rendered template

**Tool Node:**
- Tool-specific output fields (varies by tool)
- Example: Tavily Search might have `results`, `summary`, etc.

---

## Common Patterns

### Pattern 1: Node Output → LLM Prompt

```yaml
# HTTP request fetches data
- data:
    type: http-request
    url: https://api.example.com/data
  id: '1234567890123'

# LLM processes the response
- data:
    prompt_template:
      - role: user
        text: |
          Analyze this data:
          {{#1234567890123.body#}}
    type: llm
  id: '1234567890124'
```

### Pattern 2: User Input → Conversation Variable

```yaml
# User message in chatflow
{{#sys.query#}}

# Assign to conversation variable for later use
- data:
    items:
      - input_type: variable
        operation: overwrite
        value_selector:
          - sys
          - query
        variable_selector:
          - conversation
          - last_query
    type: assigner
    version: '2'
  id: '1234567890125'

# Reference in later node
{{#conversation.last_query#}}
```

### Pattern 3: LLM → Conditional → Branch-Specific Output

```yaml
# LLM classifies input
- data:
    type: llm
    # ... outputs: classification result
  id: '1111111111111'

# IF/ELSE branches on result
- data:
    type: if-else
    cases:
      - case_id: 'positive'
        conditions:
          - comparison_operator: is
            value: 'positive'
            variable_selector: ['1111111111111', 'text']
  id: '2222222222222'

# Branch A processes positive case
- data:
    type: llm
    prompt_template:
      - role: user
        text: 'Handle positive: {{#1111111111111.text#}}'
  id: '3333333333333'

# Branch B processes other cases
- data:
    type: llm
    prompt_template:
      - role: user
        text: 'Handle negative: {{#1111111111111.text#}}'
  id: '4444444444444'

# Variable Aggregator merges outputs
- data:
    type: variable-aggregator
    variables:
      - ['3333333333333', 'text']
      - ['4444444444444', 'text']
  id: '5555555555555'

# Answer uses merged output
- data:
    answer: '{{#5555555555555.output#}}'
    type: answer
  id: '6666666666666'
```

### Pattern 4: Environment Variable → HTTP Auth

```yaml
# Environment variable declaration
environment_variables:
  - name: API_KEY
    value: 'sk-1234567890abcdef'
    value_type: string

# HTTP request uses it
- data:
    authorization:
      config:
        api_key: '{{#env.API_KEY#}}'
        type: bearer
    headers: |
      Authorization: Bearer {{#env.API_KEY#}}
    type: http-request
  id: '7777777777777'
```

### Pattern 5: Iteration → LLM → Aggregate Results

```yaml
# Code produces array
- data:
    code: |
      def main() -> dict:
          return {'items': ['task1', 'task2', 'task3']}
    outputs:
      items:
        type: array[string]
    type: code
  id: '8888888888888'

# Iteration processes each item
- data:
    iterator_selector: ['8888888888888', 'items']
    output_selector: ['9999999999999', 'text']
    output_type: array[string]
    type: iteration
  id: '8888888888889'

# LLM inside iteration
- data:
    isInIteration: true
    iteration_id: '8888888888889'
    prompt_template:
      - role: user
        text: 'Process: {{#8888888888889.item#}} (index: {{#8888888888889.index#}})'
    type: llm
  id: '9999999999999'
  parentId: '8888888888889'

# Results available as array
# {{#8888888888889.output#}} = ['result1', 'result2', 'result3']
```

### Pattern 6: Memory with Conversation Context

```yaml
# Conversation variable tracks state
conversation_variables:
  - name: findings
    value: ''
    value_type: string

# LLM uses conversation variables in memory template
- data:
    memory:
      query_prompt_template: |
        ## User Query
        {{#sys.query#}}
        
        ## Context
        Previous findings: {{#conversation.findings#}}
      window:
        enabled: true
        size: 15
    type: llm
  id: '1010101010101'
```

---

## Value Selector Format

In node configurations, variable references use `value_selector` arrays instead of string syntax:

**String Syntax (used in prompts, templates, URLs):**
```yaml
text: '{{#1234567890.field#}}'
```

**Array Syntax (used in node configuration):**
```yaml
value_selector:
  - '1234567890'  # Node ID
  - field         # Field name
```

**Examples:**

**Template Transform:**
```yaml
variables:
  - value_selector:
      - '1739244888446'
      - index
    variable: index
```

**Variable Assigner:**
```yaml
items:
  - value_selector:
      - '1765447098058'
      - ticket_number
    variable_selector:
      - conversation
      - ticket_id
```

**HTTP Request Body:**
```yaml
body:
  data:
    - key: query
      value_selector:
        - '1234567890'
        - search_term
```

---

## Type Compatibility

When referencing variables, ensure type compatibility:

**Strings:**
- Can be used in text fields, templates, prompts
- Can be compared with `is`, `contains` operators

**Numbers:**
- Can use arithmetic operators (`>`, `<`, `>=`, `<=`)
- Can be used in calculations (Variable Assigner arithmetic operations)

**Arrays:**
- Can be iterated with iteration nodes
- Can use `contains`, `in` operators
- Can be appended/extended with Variable Assigner

**Objects:**
- Fields accessed with dot notation
- Can be passed to code nodes
- Can be stored in conversation variables

**Type Mismatches:**
- Variable Aggregator requires same type for all inputs
- LLM prompts convert all types to strings
- Code nodes need explicit type handling

---

## Quick Reference

### Syntax Cheat Sheet

```yaml
# Node output
{{#node_id.field#}}

# System variables
{{#sys.query#}}
{{#sys.user_id#}}
{{#sys.conversation_id#}}

# Conversation variables
{{#conversation.variable_name#}}

# Environment variables
{{#env.VARIABLE_NAME#}}

# Iteration variables
{{#iteration_id.item#}}
{{#iteration_id.index#}}

# Nested fields
{{#node_id.body.data.field#}}
```

### Value Selector Cheat Sheet

```yaml
# Basic reference
value_selector:
  - 'node_id'
  - field_name

# Conversation variable
variable_selector:
  - conversation
  - variable_name

# Environment variable
value_selector:
  - env
  - VARIABLE_NAME

# System variable
value_selector:
  - sys
  - query
```
