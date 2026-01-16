# Dify Node Types Reference

Complete catalog of all Dify node types with specifications, configuration options, and examples.

## Table of Contents

1. [Input/Output Nodes](#inputoutput-nodes)
2. [AI/LLM Nodes](#aillm-nodes)
3. [Control Flow Nodes](#control-flow-nodes)
4. [Data Processing Nodes](#data-processing-nodes)
5. [Integration Nodes](#integration-nodes)
6. [State Management Nodes](#state-management-nodes)

---

## Input/Output Nodes

### Start Node

**Type:** `start`

**Purpose:** Entry point for all workflows. Required in both workflow and advanced-chat modes.

**Configuration:**
```yaml
- data:
    selected: false
    title: Start
    type: start
    variables: []  # Optional input variables
  id: '1765791071967'
  position:
    x: 80
    y: 282
  type: custom
```

**Input Variables (Optional):**
```yaml
variables:
  - allowed_file_types:
      - document
    label: Excel FAQ
    required: true
    type: file
    variable: excel
```

**Supported Input Types:**
- `file` - File upload (with `allowed_file_types`)
- `text-input` - Short text (with `max_length`)
- `paragraph` - Long text
- `number` - Numeric input

**Output Fields:**
- Variable values are accessible via `{{#start_node_id.variable_name#}}`

---

### End Node

**Type:** `end`

**Purpose:** Workflow output node. Used in `workflow` mode only. Defines the final output structure.

**Configuration:**
```yaml
- data:
    outputs:
      - value_selector:
          - '1765791076602'
          - status_code
        value_type: number
        variable: status_code
      - value_selector:
          - '1750753744061'
          - text
        value_type: string
        variable: faq
    title: End
    type: end
  id: '1765791094228'
```

**Output Configuration:**
- `value_selector`: Array `[node_id, field_name]` referencing source data
- `value_type`: Type of output (string, number, object, array[string], etc.)
- `variable`: Name exposed to API caller

**Constraints:**
- Only one end node per workflow (can have multiple conditional paths leading to it)
- Required in workflow mode
- Not used in advanced-chat mode (use `answer` instead)

---

### Answer Node

**Type:** `answer`

**Purpose:** Streaming output for chatflows. Used in `advanced-chat` mode only. Sends responses to user.

**Configuration:**
```yaml
- data:
    answer: '{{#llm-1734960001000.text#}}'
    type: answer
  id: answer-1734960002000
```

**Features:**
- Supports variable references for dynamic content
- Streams output token-by-token
- Can have multiple answer nodes in a chatflow (different conversation paths)
- Answer field can include literal text + variable references

**Example with mixed content:**
```yaml
answer: 'Based on your input, here is the result: {{#1739246156652.text#}}'
```

---

## AI/LLM Nodes

### LLM Node

**Type:** `llm`

**Purpose:** Language model inference with prompt templates, memory (chatflow), and configurable parameters.

**Basic Configuration:**
```yaml
- data:
    context:
      enabled: false  # RAG context integration
    model:
      completion_params:
        temperature: 0.7
        max_tokens: 4000
      mode: chat
      name: gpt-4o
      provider: openai
    prompt_template:
      - edition_type: basic  # or 'jinja2'
        id: system-prompt-001
        role: system
        text: "You are a helpful assistant..."
      - edition_type: basic
        id: user-prompt-001
        role: user
        text: "{{#sys.query#}}"
    retry_config:
      max_retries: 3
      retry_enabled: true
      retry_interval: 1000
    type: llm
    vision:
      enabled: false
  id: '1734960001000'
```

**Prompt Template Roles:**
- `system` - System instructions
- `user` - User message
- `assistant` - Assistant response (for few-shot examples)

**Edition Types:**
- `basic` - Plain text with variable substitution
- `jinja2` - Jinja2 template syntax with filters and logic

**Memory Configuration (Chatflow Only):**
```yaml
memory:
  query_prompt_template: '{{#sys.query#}}'
  role_prefix:
    assistant: ''
    user: ''
  window:
    enabled: true
    size: 15  # Number of conversation turns to remember
```

**Advanced Memory Example:**
```yaml
memory:
  query_prompt_template: |
    ## User Query
    {{#sys.query#}}
    
    ## Context
    Findings: {{#conversation.findings#}}
    Topics: {{#conversation.topics#}}
  window:
    enabled: false
    size: 50
```

**Vision Support:**
```yaml
vision:
  enabled: true
  configs:
    detail: high  # or 'low', 'auto'
```

**Response Format:**
```yaml
completion_params:
  temperature: 0.1
  response_format: json_object  # Force JSON output
```

**Model Provider Patterns:**
- `openai` - OpenAI models
- `langgenius/openai/openai` - Dify's OpenAI provider plugin
- `openai_api_compatible` - Custom OpenAI-compatible endpoints
- `langgenius/deepseek/deepseek` - DeepSeek provider

**Output Fields:**
- `text` - Generated text
- `usage` - Token usage statistics

---

## Control Flow Nodes

### IF/ELSE Node

**Type:** `if-else`

**Purpose:** Conditional branching based on variable values.

**Configuration:**
```yaml
- data:
    cases:
      - case_id: 'true'
        conditions:
          - comparison_operator: is
            id: b3169e80-3090-4a5b-8df4-3148d7afcb4d
            value: 'True'
            varType: string
            variable_selector:
              - '1739245524260'
              - text
        id: 'true'
        logical_operator: and
      - case_id: 'false'
        id: 'false'
    type: if-else
  id: '1739245723720'
```

**Comparison Operators:**
- `is` - Exact match
- `is not` - Not equal
- `contains` - String/array contains
- `not contains` - String/array does not contain
- `empty` - Value is null/empty
- `not empty` - Value exists
- `>`, `<`, `>=`, `<=` - Numeric comparison
- `in` - Value in list
- `not in` - Value not in list

**Logical Operators:**
- `and` - All conditions must be true
- `or` - Any condition must be true

**Edge Connection Pattern:**
Edges from IF/ELSE use case IDs as source handles:
```yaml
edges:
  - source: '1739245723720'
    sourceHandle: 'true'  # Matches case_id
    target: '1739245424964'
    targetHandle: target
```

**Multiple Conditions Example:**
```yaml
cases:
  - case_id: 'condition1'
    conditions:
      - comparison_operator: contains
        value: 'error'
        varType: string
        variable_selector: ['1234', 'text']
      - comparison_operator: '>'
        value: '5'
        varType: number
        variable_selector: ['1234', 'count']
    logical_operator: and
```


**CRITICAL: Comparison Operator Format Requirements**

⚠️ **Common Mistakes to Avoid:**

1. **For numeric equality, use `=` not `is`:**
   ```yaml
   # ❌ WRONG - will cause silent failure
   comparison_operator: is
   value: 1
   varType: number
   
   # ✅ CORRECT
   comparison_operator: '='
   value: '1'          # Must be quoted string
   varType: number
   ```

2. **For greater-than-or-equal, use Unicode ≥ not ASCII >=:**
   ```yaml
   # ❌ WRONG
   comparison_operator: '>='
   
   # ✅ CORRECT
   comparison_operator: ≥     # Unicode U+2265
   ```

3. **All comparison values must be quoted strings:**
   ```yaml
   # ❌ WRONG - integer literals
   value: 1
   value: 2
   
   # ✅ CORRECT - quoted strings
   value: '1'
   value: '2'
   ```

4. **Every case must have an `id` field matching `case_id`:**
   ```yaml
   # ❌ WRONG - second case missing id
   cases:
     - case_id: first_case
       conditions: [...]
       id: first_case          # ✅ Has id
       logical_operator: and
     - case_id: second_case
       conditions: [...]
       logical_operator: and   # ❌ Missing id field
   
   # ✅ CORRECT - all cases have id
   cases:
     - case_id: first_case
       conditions: [...]
       id: first_case
       logical_operator: and
     - case_id: second_case
       conditions: [...]
       id: second_case         # ✅ Added id field
       logical_operator: and
   ```

**Complete Corrected Example:**
```yaml
- data:
    cases:
      - case_id: first_warning
        conditions:
          - comparison_operator: '='    # String equality for numbers
            id: e1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a
            value: '1'                   # Quoted string
            varType: number
            variable_selector:
              - conversation
              - inactive_count
        id: first_warning                # Required id field
        logical_operator: and
      - case_id: terminate
        conditions:
          - comparison_operator: ≥       # Unicode character
            id: f2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b
            value: '2'                   # Quoted string
            varType: number
            variable_selector:
              - conversation
              - inactive_count
        id: terminate                    # Required id field
        logical_operator: and
    title: 'Timeout: Check Threshold'
    type: if-else
  id: '1736766203000'
```

**Operator Reference Table:**

| Operation | String Type | Number Type |
|-----------|-------------|-------------|
| Equals | `is` | `=` (quoted) |
| Not equals | `is not` | `≠` (Unicode U+2260) |
| Greater than | N/A | `>` |
| Greater than or equal | N/A | `≥` (Unicode U+2265) |
| Less than | N/A | `<` |
| Less than or equal | N/A | `≤` (Unicode U+2264) |

---

### Iteration Node

**Type:** `iteration`

**Purpose:** Loop over arrays with support for parallel execution (max 10 concurrent).

**Configuration:**
```yaml
- data:
    error_handle_mode: terminated  # or 'continue', 'remove_failed'
    height: 178
    is_parallel: true
    iterator_selector:
      - '1762416870903'  # Source node ID
      - result            # Field containing array
    output_selector:
      - '1762417044235'  # Child node ID producing output
      - text             # Field from child node
    output_type: array[string]
    parallel_nums: 10
    start_node_id: 1762417018690start
    type: iteration
    width: 388
  id: '1762417018690'
```

**Error Handling Modes:**
- `terminated` - Stop on first error
- `continue` - Skip failed items, continue with rest
- `remove_failed` - Remove failed items from output array

**Parallel Execution:**
- `is_parallel: true` - Execute up to `parallel_nums` items concurrently
- `parallel_nums` - Max concurrent executions (1-10)
- Default: Sequential execution

**Child Nodes:**
All nodes inside iteration must have:
```yaml
- data:
    isInIteration: true
    iteration_id: '1762417018690'
    # ... node configuration
  id: '1762417044235'
  parentId: '1762417018690'  # Parent iteration node ID
```

**Virtual Start Node:**
```yaml
- data:
    isInIteration: true
    type: iteration-start
  draggable: false
  id: 1762417018690start  # {iteration_id}start
  parentId: '1762417018690'
  selectable: false
  type: custom-iteration-start
```

**Built-in Variables:**
- `{{#iteration_id.item#}}` - Current array element
- `{{#iteration_id.index#}}` - 0-based index

**Example:**
```yaml
# Code node produces array
- data:
    code: "def main() -> dict:\n    return {'result': ['one', 'two', 'three']}"
    outputs:
      result:
        type: array[string]
    type: code
  id: '1762416870903'

# Iteration processes each element
- data:
    iterator_selector: ['1762416870903', 'result']
    is_parallel: true
    parallel_nums: 3
    type: iteration
  id: '1762417018690'

# LLM inside iteration processes each item
- data:
    isInIteration: true
    iteration_id: '1762417018690'
    prompt_template:
      - role: user
        text: "Process: {{#1762417018690.item#}}"
    type: llm
  id: '1762417044235'
  parentId: '1762417018690'
```

---

### Loop Node

**Type:** `loop`

**Purpose:** Conditional loops that repeat until termination condition is met.

**Configuration:**
```yaml
- data:
    iterator_selector:
      - start_node_id
      - variable
    output_selector:
      - node_id
      - field
    type: loop
  id: 'loop_id'
```

**Note:** Loop nodes were not found in sampled bot files. Refer to official Dify documentation for complete loop node specification.

---

## Data Processing Nodes

### Code Node

**Type:** `code`

**Purpose:** Execute Python or JavaScript code with defined inputs/outputs.

**Python Example:**
```yaml
- data:
    code: |
      def main(depth: int) -> dict:
          depth = depth or 3
          array = list(range(depth))
          return {
              "array": array,
              "depth": depth
          }
    code_language: python3
    outputs:
      array:
        type: array[number]
      depth:
        type: number
    type: code
    variables:
      - value_selector:
          - '1739229221219'
          - depth
        variable: depth  # Parameter name in main()
  id: '1739245548624'
```

**JavaScript Example:**
```yaml
- data:
    code: |
      function main(input) {
        return {
          result: input.toUpperCase()
        };
      }
    code_language: javascript
    outputs:
      result:
        type: string
    variables:
      - value_selector: ['start', 'text']
        variable: input
  id: 'code123'
```

**Constraints:**
- Must have `main()` function
- Return dict/object with keys matching `outputs` configuration
- Input variables mapped to function parameters
- Supported types: string, number, boolean, array, object


**CRITICAL: Code Node Structure Requirements**

⚠️ **Common Mistakes to Avoid:**

1. **Use `variables` array, NOT `inputs` object:**
   ```yaml
   # ❌ WRONG - will cause silent failure
   - data:
       code: |
         def main(current_count: int) -> dict:
             return {"new_count": current_count + 1}
       code_language: python3
       inputs:                    # ❌ WRONG field name
         current_count:
           selector: [conversation, inactive_count]
           type: number
   
   # ✅ CORRECT
   - data:
       code: |
         def main(current_count: int) -> dict:
             return {"new_count": current_count + 1}
       code_language: python3
       variables:                 # ✅ CORRECT - array format
         - value_selector:        # ✅ CORRECT field names
             - conversation
             - inactive_count
           value_type: number     # ✅ Not 'type'
           variable: current_count
   ```

2. **Outputs must include `children: null` field:**
   ```yaml
   # ❌ WRONG - missing children field
   outputs:
     new_count:
       type: number
   
   # ✅ CORRECT
   outputs:
     new_count:
       children: null      # ✅ Required field
       type: number
   ```

**Variable Field Mapping:**

| Field Name | Purpose | Type |
|------------|---------|------|
| `value_selector` | Source node/field path | Array of strings |
| `value_type` | Data type | string, number, boolean, array, object |
| `variable` | Parameter name in `main()` | string |

**Complete Corrected Example:**
```yaml
- data:
    code: |
      def main(current_count: int) -> dict:
          return {
              "new_count": current_count + 1
          }
    code_language: python3
    outputs:
      new_count:
        children: null           # Required field
        type: number
    selected: false
    title: 'Code: Increment Inactive Count'
    type: code
    variables:                   # Must be 'variables', not 'inputs'
      - value_selector:          # Must be 'value_selector', not 'selector'
          - conversation
          - inactive_count
        value_type: number       # Must be 'value_type', not 'type'
        variable: current_count  # Maps to main() parameter
  height: 120
  id: '1736766201000'
  position:
    x: -1900
    y: 1600
  positionAbsolute:
    x: -1900
    y: 1600
  selected: false
  sourcePosition: right
  targetPosition: left
  type: custom
  width: 240
```

**Comparison of WRONG vs CORRECT:**

| Aspect | ❌ Wrong | ✅ Correct |
|--------|---------|-----------|
| Input field | `inputs` (object) | `variables` (array) |
| Selector field | `selector` | `value_selector` |
| Type field | `type` | `value_type` |
| Outputs | `{type: number}` | `{children: null, type: number}` |

---

### Template Transform Node

**Type:** `template-transform`

**Purpose:** Jinja2 template processing for text transformation.

**Configuration:**
```yaml
- data:
    template: '{{ index + 1 }}/{{ depth }}th search executed.'
    title: Intermediate Output Format
    type: template-transform
    variables:
      - value_selector:
          - '1739244888446'
          - index
        variable: index
      - value_selector:
          - '1739229221219'
          - depth
        variable: depth
  id: '1739254060247'
```

**Template Features:**
- Jinja2 syntax
- Variable substitution: `{{ variable_name }}`
- Filters: `{{ text|upper }}`, `{{ items|length }}`
- Conditionals: `{% if condition %}...{% endif %}`
- Loops: `{% for item in items %}...{% endfor %}`

**Output:**
- Single field: `output` (string)

---

### Variable Aggregator Node

**Type:** `variable-aggregator`

**Purpose:** Merge outputs from different conditional branches into a single variable.

**Configuration:**
```yaml
- data:
    output_type: string  # All variables must match this type
    type: variable-aggregator
    variables:
      - - '1739254060247'
        - output
      - - '1739254516383'
        - output
  id: '1739254296073'
```

**Constraints:**
- All aggregated variables must be the same type
- Typically used after IF/ELSE to merge branch outputs
- Output field: `output`

**Use Case:**
```
IF/ELSE
  ├── Branch A → Template Transform → output: "Result A"
  └── Branch B → Template Transform → output: "Result B"
Variable Aggregator → Merges whichever branch executed
```

---

### Variable Assigner Node (Chatflow Only)

**Type:** `assigner`
**Version:** `2` (CRITICAL: Always use v2, never v1)

**Purpose:** Update conversation variables in advanced-chat mode.

**Configuration:**
```yaml
- data:
    desc: Update conversation state
    items:
      - input_type: constant        # 'constant' or 'variable'
        operation: set              # 'set', 'overwrite', 'clear', 'append', 'extend'
        value: triage               # Literal value (for constant)
        variable_selector:
          - conversation
          - state
        write_mode: over-write
      - input_type: variable
        operation: overwrite
        value_selector:             # Used instead of 'value' for variable input
          - '1765447098058'
          - ticket_number
        variable_selector:
          - conversation
          - ticket_id
        write_mode: over-write
    type: assigner
    version: '2'
  id: '1739245826988'
```

**CRITICAL RULES:**

**Input Types:**
- `constant` - Use for hardcoded/literal values → pair with `operation: set` or `operation: clear`
- `variable` - Use to copy from another node → pair with `operation: overwrite` and use `value_selector`

**Operations:**
- `set` - Assign literal value (use with `input_type: constant`)
- `overwrite` - Copy from another variable (use with `input_type: variable`)
- `clear` - Reset variable (set `value: ''`, use with `input_type: constant`)
- `append` - Add single element to array
- `extend` - Add multiple elements to array

**Common Mistakes:**
- ❌ Using `type: variable-assigner` (v1, deprecated)
- ❌ Missing `version: '2'`
- ❌ Using `operation: overwrite` with `input_type: constant`
- ❌ Using `operation: set` with `input_type: variable`

**Array Operations Example:**
```yaml
items:
  - input_type: variable
    operation: append  # Add single element
    value_selector:
      - conversation
      - nextSearchTopic
    variable_selector:
      - conversation
      - topics
    write_mode: over-write
```

---

### Document Extractor Node

**Type:** `document-extractor`

**Purpose:** Extract text content from uploaded files.

**Configuration:**
```yaml
- data:
    is_array_file: false
    title: Doc Extraktor
    type: document-extractor
    variable_selector:
      - '1750753627754'  # Start node ID
      - excel            # File variable name
  id: '1750753732538'
```

**Output:**
- `text` - Extracted text content

**Supported File Types:**
- PDF, Word (DOCX), Excel (XLSX), Text files

---

### Parameter Extractor Node

**Type:** `parameter-extractor`

**Purpose:** Structured extraction of parameters from unstructured text using LLM.

**Note:** Not found in sampled files. Refer to Dify documentation for configuration.

**Typical Use:**
- Extract entities (names, dates, locations) from user input
- Parse structured data from natural language
- Two modes: function calling or prompt-based

---

## Integration Nodes

### HTTP Request Node

**Type:** `http-request`

**Purpose:** Make REST API calls with authentication, retry, and timeout configuration.

**Configuration:**
```yaml
- data:
    authorization:
      config:
        api_key: '{{#env.API_KEY#}}'
        type: bearer  # or 'basic', 'custom', 'no-auth'
      type: bearer
    body:
      data:
        - key: query
          type: text
          value: '{{#1234.text#}}'
      type: json  # or 'form-data', 'x-www-form-urlencoded', 'raw-text', 'none'
    headers: |
      Content-Type: application/json
      Authorization: Bearer {{#env.API_KEY#}}
    method: post  # get, post, put, patch, delete, head
    retry_config:
      max_retries: 3
      retry_enabled: true
      retry_interval: 1000  # milliseconds
    timeout:
      max_connect_timeout: 300
      max_read_timeout: 600
      max_write_timeout: 600
    type: http-request
    url: https://api.example.com/endpoint
  id: '1765791076602'
```

**Authorization Types:**
- `no-auth` - No authentication
- `bearer` - Bearer token (`config.api_key`)
- `basic` - Basic auth (`config.username`, `config.password`)
- `custom` - Custom headers

**Body Types:**
- `none` - No body (GET, HEAD)
- `json` - JSON payload
- `form-data` - Multipart form data
- `x-www-form-urlencoded` - URL-encoded form
- `raw-text` - Plain text

**Output Fields:**
- `body` - Response body (parsed JSON if applicable)
- `status_code` - HTTP status code
- `headers` - Response headers
- `files` - Extracted files (if detected)

**Example with Variables:**
```yaml
url: https://api.example.com/search?q={{#conversation.query#}}
headers: |
  X-User-ID: {{#sys.user_id#}}
  X-Request-ID: {{#sys.workflow_run_id#}}
```

---

### Tool Node

**Type:** `tool`

**Purpose:** Integration with external tools (Tavily Search, web scrapers, etc.).

**Configuration:**
```yaml
- data:
    provider_id: tavily
    provider_name: tavily
    provider_type: builtin  # or 'api', 'model'
    title: Tavily Search
    tool_configurations:
      max_results:
        type: constant
        value: 5
      search_depth:
        type: constant
        value: advanced
    tool_label: Tavily Search
    tool_name: tavily_search
    tool_node_version: '2'
    tool_parameters:
      query:
        type: mixed  # 'constant' or 'mixed' (variable reference)
        value: '{{#conversation.nextSearchTopic#}}'
    type: tool
  id: '1739245424964'
```

**Parameter Types:**
- `constant` - Fixed value
- `mixed` - Variable reference

**Common Tools:**
- `tavily` - Tavily Search
- Custom API tools
- Web scrapers

---

## State Management Nodes

### Question Classifier Node

**Type:** `question-classifier`

**Purpose:** Semantic routing based on user intent using LLM classification.

**Note:** Not found in sampled files. Refer to Dify documentation.

**Typical Use:**
- Route user queries to different flows based on intent
- Multi-language classification
- Category detection

---

### List Operator Node

**Type:** `list-operator`

**Purpose:** Array manipulation operations.

**Note:** Not found in sampled files. Refer to Dify documentation.

**Typical Operations:**
- Filter arrays
- Map transformations
- Reduce aggregations
- Sort, slice, concat

---

## Node Positioning & UI Metadata

All nodes require positioning data for the visual editor:

```yaml
height: 120
position:
  x: 80
  y: 282
positionAbsolute:
  x: 80
  y: 282
sourcePosition: right
targetPosition: left
type: custom
width: 242
```

**Standard Dimensions:**
- Width: 240-244px
- Height: Varies by node type (52-300px)
- Connection points: source (right), target (left)

---

## Quick Reference Table

| Node Type | Category | Mode Support | Key Use Case |
|-----------|----------|--------------|--------------|
| start | I/O | Both | Entry point, input variables |
| end | I/O | Workflow | Workflow output definition |
| answer | I/O | Chatflow | Streaming chat response |
| llm | AI | Both | Language model inference |
| if-else | Control | Both | Conditional branching |
| iteration | Control | Both | Array loops (parallel support) |
| loop | Control | Both | Conditional loops |
| code | Data | Both | Python/JS execution |
| template-transform | Data | Both | Jinja2 text transformation |
| variable-aggregator | Data | Both | Merge branch outputs |
| assigner | Data | Chatflow | Update conversation vars |
| document-extractor | Data | Both | File text extraction |
| parameter-extractor | Data | Both | Structured entity extraction |
| http-request | Integration | Both | REST API calls |
| tool | Integration | Both | External tool integration |
| question-classifier | State | Chatflow | Intent-based routing |
| list-operator | State | Both | Array operations |

### Variable Assigner Node (Version 2)

**Type:** `assigner`  
**Version:** `'2'` (REQUIRED)

**Purpose:** Update conversation variables with new values (literal or from other nodes).

**CRITICAL: Always use Version 2**

⚠️ **Common Mistakes:**

1. **When copying from another node, use `value` not `value_selector`:**
   ```yaml
   # ❌ WRONG
   items:
     - input_type: variable
       operation: overwrite
       value_selector: ['1234', 'output']  # ❌ Wrong field name
       variable_selector: [conversation, my_var]
   
   # ✅ CORRECT
   items:
     - input_type: variable
       operation: over-write         # ✅ With hyphen
       value: ['1234', 'output']     # ✅ Called 'value', not 'value_selector'
       variable_selector: [conversation, my_var]
   ```

2. **Operation names have hyphens:**
   ```yaml
   # ❌ WRONG
   operation: overwrite   # ❌ No hyphen
   
   # ✅ CORRECT
   operation: over-write  # ✅ With hyphen
   ```

**Complete Example - Copying from Node Output:**
```yaml
- data:
    desc: Update inactive_count in conversation
    items:
      - input_type: variable      # Copying from another node
        operation: over-write     # With hyphen!
        value:                    # Not 'value_selector'!
          - '1736766201000'       # Source node ID
          - new_count             # Field from source node
        variable_selector:
          - conversation
          - inactive_count
        write_mode: over-write
    selected: false
    title: 'Timeout: Update Counter'
    type: assigner
    version: '2'                  # Required version
  id: '1736766202000'
```

**Complete Example - Setting Literal Value:**
```yaml
- data:
    items:
      - input_type: constant      # Setting a literal value
        operation: set            # Use 'set' for constants
        value: "triage"           # Literal value
        variable_selector:
          - conversation
          - state
        write_mode: over-write
    type: assigner
    version: '2'
  id: 'assigner123'
```

**Operation Reference:**

| Operation | Input Type | Purpose | Value Field |
|-----------|------------|---------|-------------|
| `set` | `constant` | Set literal value | `value: "literal"` |
| `over-write` | `variable` | Copy from node output | `value: [node_id, field]` |
| `clear` | `constant` | Reset to empty | `value: ''` |
| `append` | `variable` | Add to array | `value: [node_id, field]` |
| `extend` | `variable` | Add multiple to array | `value: [node_id, field]` |

**Field Name Reference:**

| When input_type is | Use this field | NOT this field |
|--------------------|----------------|----------------|
| `constant` | `value: "literal"` | ~~`value_selector`~~ |
| `variable` | `value: [node, field]` | ~~`value_selector`~~ |

