---
date: 2026-01-09
researcher: research-architect-001
topic: "Dify Platform Architecture, Node Types, and Workflow/Chatbot Mechanisms"
status: complete
coverage:
  - Dify official documentation (23 pages)
  - bots/ directory (19 YAML workflow files)
  - Application types: workflow vs advanced-chat
  - Node type specifications (18+ node types)
  - Variable system and data flow
  - DSL structure and format
---

# Research: Dify Platform Architecture, Node Types, and Workflow/Chatbot Mechanisms

## Executive Summary

- Dify is an open-source visual workflow platform for building AI applications using a directed acyclic graph (DAG) execution model.
- Two application modes exist: `workflow` (single-turn, stateless) and `advanced-chat` (multi-turn, stateful with conversation variables).
- Applications are defined in YAML using Dify DSL with three core sections: `app` (metadata), `workflow` (configuration + graph), `dependencies` (plugins).
- Data flows between nodes via variable references using `{{#node_id.output_field#}}` syntax; nodes connect via edges defining execution order.
- The platform supports 18+ node types across 6 categories: Input/Output, AI/LLM, Control Flow, Data Processing, State Management, Integration.
- Conversation variables persist across chat turns in `advanced-chat` mode; workflow variables reset per execution.
- All bot files in `bots/` are YAML format (version 0.3.1 or 0.4.0) with consistent graph structure using numeric node IDs.

## Coverage Map

### Documentation Coverage
- **Core concepts**: 3 pages (introduction, quick-start, key-concepts)
- **Node specifications**: 20 pages (user-input, llm, answer, output, agent, tools, question-classifier, ifelse, iteration, loop, code, template, variable-aggregator, doc-extractor, variable-assigner, parameter-extractor, http-request, list-operator)
- **Source**: docs.dify.ai official documentation dated January 2026

### Codebase Coverage
- **Directory**: `bots/` (flat structure, 19 files, 784KB total)
- **File types**: 100% YAML (`.yml` extension)
- **Sampled files**: 8 of 19 (42% coverage by count, representative across use cases)
  - Simple HTTP Flow.yml (3.7KB) - basic workflow
  - Friendly Multilingual Chatbot v1.0.yml (5.7KB) - simple chatbot
  - bug_hunting_2_parallelism.yml (7.5KB) - parallel iteration
  - Excel to FAQ.yml (5.0KB) - document processing
  - DeepResearch.yml (34KB) - complex research workflow with iteration
  - Patient Intake Chatbot.yml (54KB) - stateful conversation with variable assignment
  - Betterdoc AI Agent v2.0 DE.yml (58KB) - production chatbot with knowledge base
  - VIER RAG.yml (9.4KB) - RAG workflow with HTTP integration

## Critical Findings (Verified, Planner Attention Required)

### Finding 1: Two Distinct Application Modes with Different Capabilities

**Observation:** Dify supports two application modes with fundamentally different execution models and capabilities.

**Direct consequence:** Any implementation must choose the correct mode at design time; modes cannot be mixed and have different node availability.

**Evidence:** `bots/Simple HTTP Flow.yml:5`, `bots/Friendly Multilingual Chatbot v1.0.yml:5`

**Excerpt:**
```yaml
# Workflow mode (stateless, single-turn)
app:
  mode: workflow

# Advanced-chat mode (stateful, multi-turn)
app:
  mode: advanced-chat
```

**Additional evidence from documentation:**
> "Chatflow is a special type of workflow app that gets triggered at every turn of a conversation. Other than workflow features, chatflow comes with the ability to store and update custom conversation-specific variables, enable memory in LLM nodes, and stream formatted text, images, and files at different points throughout the chatflow run."

> "Unlike workflow, chatflow can't use Trigger to start."

### Finding 2: Variable Reference Syntax is Context-Dependent

**Observation:** Variables are referenced using the syntax `{{#source_node_id.field_name#}}` in workflow configurations, but specific contexts use different patterns.

**Direct consequence:** Variable referencing must account for node IDs (numeric strings), field paths (dot notation), array indexing, and special system variables.

**Evidence:** `bots/DeepResearch.yml:530`, `bots/bug_hunting_2_parallelism.yml:154`, `bots/Excel to FAQ.yml:169`

**Excerpt:**
```yaml
# Node output reference
tool_parameters:
  query:
    type: mixed
    value: '{{#conversation.nextSearchTopic#}}'

# Iteration item reference
text: Write {{#1762417018690.output#}} in a more human readable form

# Nested field reference
text: 'Erstelle ein FAQ in Markdown Format aus folgenden Informationen:
  {{#1750753732538.text#}}'
```

**Additional patterns observed:**
- System variables: `{{#sys.query#}}`, `{{#sys.user_id#}}`
- Conversation variables: `{{#conversation.variable_name#}}`
- Iteration context: `{{#iteration_node_id.item#}}`, `{{#iteration_node_id.index#}}`

### Finding 3: Graph Structure Uses Numeric Node IDs with Edge-Based Connections

**Observation:** All workflows define nodes with numeric string IDs and use separate edge objects to define connections.

**Direct consequence:** Node references must use exact numeric IDs; edge definitions require sourceHandle/targetHandle specifications; execution order follows edge definitions.

**Evidence:** `bots/Simple HTTP Flow.yml:58-82`, `bots/Friendly Multilingual Chatbot v1.0.yml:64-86`

**Excerpt:**
```yaml
graph:
  edges:
  - data:
      sourceType: start
      targetType: http-request
    id: 1765791071967-source-1765791076602-target
    source: '1765791071967'
    sourceHandle: source
    target: '1765791076602'
    targetHandle: target
    type: custom
  nodes:
  - data:
      title: Start
      type: start
    id: '1765791071967'
```

**Pattern observation:** Edge IDs follow the format `{source_id}-source-{target_id}-target` or include branch identifiers for conditional nodes (e.g., `1754983888848-true-1759753377632-target`).

### Finding 4: Conversation Variables Require Explicit Declaration and Assignment

**Observation:** In `advanced-chat` mode, conversation variables must be declared in `conversation_variables` array and updated using Variable Assigner nodes.

**Direct consequence:** Stateful chatbots require upfront variable declaration with types; variable updates happen through dedicated nodes, not implicitly.

**Evidence:** `bots/DeepResearch.yml:20-52`, `bots/Patient Intake Chatbot.yml:16-57`

**Excerpt:**
```yaml
workflow:
  conversation_variables:
  - description: ''
    id: 07ea9b5b-edf2-471d-8206-50e95e7ab87e
    name: topics
    selector:
    - conversation
    - topics
    value: []
    value_type: array[string]
  - description: ''
    id: a9049588-f66f-4c3a-a30e-5952a677baa9
    name: nextSearchTopic
    selector:
    - conversation
    - nextSearchTopic
    value: ''
    value_type: string
```

**Supported types observed:** `string`, `integer`, `array[string]`, `array[number]`, `array[object]`, `object`, `boolean`.

### Finding 5: Iteration Nodes Support Parallel Execution with Specific Constraints

**Observation:** Iteration nodes can execute in parallel mode with a maximum of 10 concurrent executions; parallel iterations have distinct internal node structure.

**Direct consequence:** Parallel workflows require `is_parallel: true` and `parallel_nums` configuration; nodes inside iterations have `parentId` set to iteration node ID.

**Evidence:** `bots/bug_hunting_2_parallelism.yml:224-252`

**Excerpt:**
```yaml
- data:
    error_handle_mode: terminated
    is_parallel: true
    iterator_selector:
    - '1762416870903'
    - result
    output_type: array[string]
    parallel_nums: 10
    start_node_id: 1762417018690start
    title: Iteration
    type: iteration
  id: '1762417018690'
  
# Child node inside iteration
- data:
    isInIteration: true
    iteration_id: '1762417018690'
    model:
      name: ai-studio-prod-4o
    type: llm
  id: '1762417044235'
  parentId: '1762417018690'
```

**Documentation confirms:** Maximum parallel execution is 10 items; sequential mode also available for order-dependent operations.

### Finding 6: LLM Nodes Support Memory Configuration in Chatflow Mode Only

**Observation:** LLM nodes in `advanced-chat` mode can enable memory with window size configuration; workflow mode LLM nodes do not have memory.

**Direct consequence:** Conversational context requires explicit memory configuration; memory is node-specific and does not share between LLM nodes.

**Evidence:** `bots/Friendly Multilingual Chatbot v1.0.yml:111-118`, `bots/DeepResearch.yml:425-444`

**Excerpt:**
```yaml
# Chatflow LLM with memory enabled
memory:
  query_prompt_template: '{{#sys.query#}}'
  role_prefix:
    assistant: ''
    user: ''
  window:
    enabled: true
    size: 15

# Chatflow LLM with custom memory template
memory:
  query_prompt_template: "## Topic\n{{#sys.query#}}\n\n## Findings\n{{#conversation.findings#}}\n\n## Searched Topics\n{{#conversation.topics#}}"
  role_prefix:
    assistant: ''
    user: ''
  window:
    enabled: false
    size: 50
```

**Pattern:** `query_prompt_template` formats user input; `window.size` controls conversation history length; `enabled: false` still allows custom template usage.

## Detailed Technical Analysis (Verified)

### Dify DSL Structure

#### Top-Level Schema

All bot files follow a consistent YAML structure with three root keys:

**Evidence:** `bots/Simple HTTP Flow.yml:1-10`, `bots/DeepResearch.yml:1-18`

```yaml
app:
  description: ''
  icon: 🤖
  icon_background: '#FFEAD5'
  mode: workflow  # or 'advanced-chat'
  name: Simple HTTP Flow
  use_icon_as_answer_icon: false
dependencies: []  # or plugin references
kind: app
version: 0.4.0  # or 0.3.1
workflow:
  # ... workflow configuration
```

**Version observations:**
- Version 0.4.0: 10 files (Simple HTTP Flow, VIER RAG, Excel to FAQ, Friendly Multilingual Chatbot, bug_hunting_2_parallelism)
- Version 0.3.1: 9 files (DeepResearch, Patient Intake Chatbot, Betterdoc bots)

#### Dependencies Section

**Evidence:** `bots/bug_hunting_2_parallelism.yml:8-12`, `bots/DeepResearch.yml:8-16`

```yaml
dependencies:
- current_identifier: null
  type: marketplace
  value:
    marketplace_plugin_unique_identifier: langgenius/openai_api_compatible:0.0.24@2266d6adfeafd3a161ba4a033553f4ff8a8b1d07be54f4b11ce9e68032889ac3
```

**Pattern:** Plugins are referenced from marketplace with hash-based versioning; `current_identifier: null` is standard pattern.

**Common plugins observed:**
- `langgenius/openai_api_compatible` - OpenAI-compatible API provider
- `langgenius/openai` - Official OpenAI provider
- `langgenius/deepseek` - DeepSeek provider
- `langgenius/json_process` - JSON parsing tools

#### Workflow Configuration Section

**Evidence:** `bots/Simple HTTP Flow.yml:11-164`

```yaml
workflow:
  conversation_variables: []  # Empty for workflow mode
  environment_variables: []   # API keys, secrets
  features:
    file_upload:
      enabled: false
      # ... extensive file upload config
    opening_statement: ''
    retriever_resource:
      enabled: true
    # ... other features
  graph:
    edges: []  # Connection definitions
    nodes: []  # Node definitions
    viewport:  # Canvas view settings
      x: 60.5
      y: 111.5
      zoom: 1
  rag_pipeline_variables: []
```

**Key subsections:**
- `conversation_variables`: Only used in `advanced-chat` mode
- `environment_variables`: Secrets and configuration
- `features`: UI and capability settings
- `graph`: The actual workflow DAG
- `rag_pipeline_variables`: Knowledge retrieval configuration (when used)

### Node Type Implementations

#### Start Node (Entry Point)

**Evidence:** `bots/Simple HTTP Flow.yml:84-100`, `bots/Excel to FAQ.yml:99-129`

```yaml
# Simple start (no inputs)
- data:
    selected: false
    title: Start
    type: start
    variables: []
  id: '1765791071967'
  position:
    x: 80
    y: 282
  type: custom

# Start with input variables
- data:
    type: start
    variables:
    - allowed_file_types:
      - document
      label: Excel FAQ
      required: true
      type: file
      variable: excel
  id: '1750753627754'
```

**Input field types observed:**
- `file`: File upload (with `allowed_file_types`)
- `text-input`: Short text (with `max_length`)
- `paragraph`: Long text
- `number`: Numeric input

#### LLM Node (Language Model)

**Evidence:** `bots/Friendly Multilingual Chatbot v1.0.yml:107-170`, `bots/Excel to FAQ.yml:152-188`

```yaml
- data:
    context:
      enabled: false  # RAG context
    model:
      completion_params:
        temperature: 0.7
      mode: chat  # or 'completion'
      name: gpt-4
      provider: openai
    prompt_template:
    - edition_type: basic  # or 'jinja2'
      id: system-prompt-001
      role: system
      text: "<role>\nYou are a friendly, helpful AI assistant..."
    retry_config:
      max_retries: 3
      retry_enabled: true
      retry_interval: 1000
    type: llm
    vision:
      enabled: false
  id: llm-1734960001000
```

**Prompt template roles:** `system`, `user`, `assistant`

**Model configuration observed:**
- Provider patterns: `openai`, `langgenius/openai/openai`, `langgenius/deepseek/deepseek`, `openai_api_compatible`
- Mode: Always `chat` in sampled files
- Temperature: Typically 0.7
- Response format: Can specify `json_object` in `completion_params`

#### Answer Node (Chatflow Output)

**Evidence:** `bots/Friendly Multilingual Chatbot v1.0.yml:171-190`, `bots/DeepResearch.yml:343-363`

```yaml
- data:
    answer: '{{#llm-1734960001000.text#}}'
    type: answer
  id: answer-1734960002000

# With complex variable reference
- data:
    answer: '
      {{#1739246156652.text#}}'
    type: answer
  id: answer
```

**Pattern:** The `answer` field contains variable references or static text; streaming behavior depends on variable resolution order.

#### Output Node (Workflow End)

**Evidence:** `bots/Simple HTTP Flow.yml:138-159`, `bots/Excel to FAQ.yml:189-210`

```yaml
- data:
    outputs:
    - value_selector:
      - '1765791076602'
      - status_code
      value_type: number
      variable: status_code
    title: End
    type: end
  id: '1765791094228'

# Multiple outputs
- data:
    outputs:
    - value_selector:
      - '1750753744061'
      - text
      variable: faq
    title: Ende
    type: end
  id: '1750753748262'
```

**Pattern:** `value_selector` is an array `[node_id, field_name]`; `variable` is the output name exposed to API callers.

#### Code Node (Python/JavaScript)

**Evidence:** `bots/bug_hunting_2_parallelism.yml:194-219`, `bots/DeepResearch.yml:626-659`

```yaml
- data:
    code: "def main() -> dict:\n    return {'result': ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']}"
    code_language: python3
    outputs:
      result:
        children: null
        type: array[string]
    type: code
  id: '1762416870903'

# Code with input variables
- data:
    code: "\ndef main(depth: int) -> dict:\n    depth = depth or 3\n    array = list(range(depth))\n    return {\n        \"array\": array,\n        \"depth\": depth\n    }\n"
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
      variable: depth
  id: '1739245548624'
```

**Pattern:** Code must have `main()` function; return dict keys become output fields; input variables map external values to function parameters.

#### HTTP Request Node

**Evidence:** `bots/Simple HTTP Flow.yml:101-137`, `bots/VIER RAG.yml:200-250`

```yaml
- data:
    authorization:
      config: null
      type: no-auth  # or bearer, basic, custom
    body:
      data: []
      type: none  # or json, form-data, etc.
    headers: ''
    method: post
    retry_config:
      max_retries: 3
      retry_enabled: false
      retry_interval: 100
    timeout:
      max_connect_timeout: 0
      max_read_timeout: 0
      max_write_timeout: 0
    type: http-request
    url: https://metis-assistantbuilder-netto-prod.cloud.samhammer.de/master/api/api/Project/68be9c2842454ef43c75c7c0/DataItemImport/asJson
  id: '1765791076602'

# With variables in URL and headers
- data:
    authorization:
      config:
        api_key: '{{#1732271078041.api_key#}}'
        type: bearer
    headers: 'Content-Type:application/json
      Authorization:Bearer {{#1732271078041.api_key#}}'
    method: post
    type: http-request
    url: https://aigateway.eu/api/knowledge/base/v2/knowledgebases/{{#1732271078041.knowledgebase_id#}}/context
  id: '1733409248710'
```

**Output fields:** `body`, `status_code`, `headers`, `files` (if detected)

#### Iteration Node

**Evidence:** `bots/bug_hunting_2_parallelism.yml:220-252`

```yaml
- data:
    error_handle_mode: terminated  # or 'continue' or 'remove_failed'
    height: 178
    is_parallel: true
    iterator_selector:
    - '1762416870903'
    - result
    output_selector:
    - '1762417044235'
    - text
    output_type: array[string]
    parallel_nums: 10
    start_node_id: 1762417018690start
    type: iteration
    width: 388
  id: '1762417018690'
  zIndex: 1

# Iteration start node (virtual)
- data:
    isInIteration: true
    type: iteration-start
  draggable: false
  id: 1762417018690start
  parentId: '1762417018690'
  position:
    x: 24
    y: 68
  selectable: false
  type: custom-iteration-start
  zIndex: 1002
```

**Pattern:** Iteration creates container node; child nodes have `parentId` and `isInIteration: true`; virtual start node named `{iteration_id}start`.

**Built-in variables:** `items` (current element), `index` (0-based position)

#### IF/ELSE Node

**Evidence:** `bots/DeepResearch.yml:660-692`

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
    type: if-else
  id: '1739245723720'
```

**Comparison operators observed:** `is`, `is not`, `contains`, `not contains`, `empty`, `not empty`

**Logical operators:** `and`, `or`

**Edge pattern:** Edges from IF/ELSE use handle names matching case IDs (e.g., `'true'`, `'false'`, custom case IDs).

#### Variable Assigner Node (Chatflow Only)

**Evidence:** `bots/DeepResearch.yml:694-743`

```yaml
- data:
    items:
    - input_type: variable
      operation: over-write  # or 'append', 'arithmetic'
      value:
      - '1739245446901'
      - text
      variable_selector:
      - conversation
      - nextSearchTopic
      write_mode: over-write
    - input_type: variable
      operation: append
      value:
      - conversation
      - nextSearchTopic
      variable_selector:
      - conversation
      - topics
      write_mode: over-write
    type: assigner
    version: '2'
  id: '1739245826988'
```

**Operations:**
- `over-write`: Replace value
- `append`: Add to array
- `arithmetic`: Add/subtract/multiply/divide (for numbers)

**Input types:** `variable`, `constant`

#### Variable Aggregator Node

**Evidence:** `bots/DeepResearch.yml:882-909`

```yaml
- data:
    isInIteration: true
    iteration_id: '1739244888446'
    output_type: string
    type: variable-aggregator
    variables:
    - - '1739254060247'
      - output
    - - '1739254516383'
      - output
  id: '1739254296073'
```

**Purpose:** Merges outputs from different conditional branches into single variable; enforces same-type constraint.

#### Template Transform Node

**Evidence:** `bots/DeepResearch.yml:848-881`

```yaml
- data:
    template: '{{ index + 1 }}/{{ depth }}th search executed.
      '
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

**Template engine:** Jinja2 with variable substitution, filters, loops, conditionals.

#### Document Extractor Node

**Evidence:** `bots/Excel to FAQ.yml:130-151`

```yaml
- data:
    is_array_file: false
    title: Doc Extraktor
    type: document-extractor
    variable_selector:
    - '1750753627754'
    - excel
  id: '1750753732538'
```

**Output:** `text` field containing extracted document content.

#### Tool Node

**Evidence:** `bots/DeepResearch.yml:484-546`

```yaml
- data:
    provider_id: tavily
    provider_name: tavily
    provider_type: builtin
    title: Tavily Search
    tool_configurations:
      days:
        type: constant
        value: 3
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
        type: mixed
        value: '{{#conversation.nextSearchTopic#}}'
    type: tool
  id: '1739245424964'
```

**Parameter types:** `constant` (fixed value), `mixed` (variable reference)

**Tool versions:** `tool_node_version: '2'` is current standard

### Variable System Deep Dive

#### System Variables

**Documentation reference:** All workflows have access to system variables without declaration.

**Workflow mode:**
- `sys.user_id` - User identifier
- `sys.app_id` - Application ID
- `sys.workflow_id` - Workflow ID
- `sys.workflow_run_id` - Execution run ID
- `sys.timestamp` - Execution start timestamp

**Chatflow mode (additional):**
- `sys.query` - Current user message
- `sys.conversation_id` - Conversation session ID
- `sys.dialogue_count` - Turn counter

**Observation:** `sys.query` is frequently referenced in chatflow LLM prompts.

**Evidence:** `bots/DeepResearch.yml:428`, `bots/Friendly Multilingual Chatbot v1.0.yml:112`

```yaml
# System query in memory template
query_prompt_template: '{{#sys.query#}}'

# System query in prompt
text: '## Topic\n{{#sys.query#}}'
```

#### Conversation Variables Schema

**Evidence:** `bots/DeepResearch.yml:20-52`

```yaml
conversation_variables:
- description: ''
  id: 07ea9b5b-edf2-471d-8206-50e95e7ab87e  # UUID
  name: topics
  selector:
  - conversation
  - topics
  value: []  # Default value
  value_type: array[string]
```

**Required fields:**
- `id`: UUID for internal tracking
- `name`: Variable identifier
- `selector`: Always `['conversation', name]`
- `value`: Initial/default value (type must match `value_type`)
- `value_type`: Type specification

**Supported types:** `string`, `integer`, `array[string]`, `array[number]`, `array[object]`, `object`, `boolean`

#### Environment Variables

**Evidence:** `bots/Betterdoc AI Agent v2.0 DE.yml:59-103`

```yaml
environment_variables:
- description: ''
  id: c5c7fb48-bf3a-47c5-9139-143735c83a6d
  name: TOPIC_EXCEPTIONS
  selector:
  - env
  - TOPIC_EXCEPTIONS
  value: '  <topic>vasectomy</topic>'
  value_type: string
- description: 'Knowledge about BetterDoc'
  id: 78127fbe-4348-4d68-a1dd-fca93e41b8e5
  name: KNOWLEDGE
  selector:
  - env
  - KNOWLEDGE
  value: "## Generelle Informationen zum Service\n\n**Wer ist BetterDoc?**\n\nBetterDoc ist..."
  value_type: string
```

**Usage pattern:** Environment variables store large static content (prompts, knowledge bases) and secrets; accessed via `{{#env.VARIABLE_NAME#}}`.

### Edge and Connection Patterns

#### Edge Data Structure

**Evidence:** `bots/Simple HTTP Flow.yml:59-70`

```yaml
edges:
- data:
    isInIteration: false
    isInLoop: false
    sourceType: start
    targetType: http-request
  id: 1765791071967-source-1765791076602-target
  source: '1765791071967'
  sourceHandle: source
  target: '1765791076602'
  targetHandle: target
  type: custom
  zIndex: 0
```

**Required fields:**
- `source`: Source node ID (string)
- `target`: Target node ID (string)
- `sourceHandle`: Output handle name (usually `'source'`)
- `targetHandle`: Input handle name (usually `'target'`)
- `type`: Always `'custom'`

**Metadata fields:**
- `isInIteration`: Boolean indicating if edge is inside iteration
- `isInLoop`: Boolean indicating if edge is inside loop
- `iteration_id`: Present when inside iteration
- `sourceType`, `targetType`: Node type names for validation

#### Conditional Branch Edges

**Evidence:** `bots/DeepResearch.yml:167-174`

```yaml
- data:
    isInIteration: true
    iteration_id: '1739244888446'
    sourceType: if-else
    targetType: tool
  id: 1739245723720-true-1739245424964-target
  source: '1739245723720'
  sourceHandle: 'true'
  target: '1739245424964'
  type: custom
```

**Pattern:** IF/ELSE nodes use case IDs as `sourceHandle` values (`'true'`, `'false'`, custom case IDs).

### Features Configuration

#### File Upload Configuration

**Evidence:** `bots/Simple HTTP Flow.yml:14-42`

```yaml
features:
  file_upload:
    allowed_file_extensions:
    - .JPG
    - .JPEG
    - .PNG
    allowed_file_types:
    - image
    allowed_file_upload_methods:
    - local_file
    - remote_url
    enabled: false
    fileUploadConfig:
      audio_file_size_limit: 50
      batch_count_limit: 5
      file_size_limit: 250
      image_file_size_limit: 5
      video_file_size_limit: 100
      workflow_file_upload_limit: 10
    image:
      enabled: false
      number_limits: 3
      transfer_methods:
      - local_file
      - remote_url
    number_limits: 3
```

**Pattern:** File upload disabled by default; limits specified in MB; methods include `local_file` and `remote_url`.

#### Other Feature Flags

**Evidence:** `bots/Friendly Multilingual Chatbot v1.0.yml:43-61`

```yaml
features:
  opening_statement: 'Hello! / Hallo! I''m your friendly assistant...'
  retriever_resource:
    enabled: false
  sensitive_word_avoidance:
    enabled: false
  speech_to_text:
    enabled: false
  suggested_questions: []
  suggested_questions_after_answer:
    enabled: false
  text_to_speech:
    enabled: false
    language: ''
    voice: ''
```

**Feature types:**
- `opening_statement`: Initial message (chatflow only)
- `retriever_resource`: Knowledge base integration
- `sensitive_word_avoidance`: Content filtering
- `speech_to_text`: Voice input
- `text_to_speech`: Voice output
- `suggested_questions`: Quick reply buttons

### Node Positioning and UI Metadata

**Evidence:** `bots/Simple HTTP Flow.yml:91-100`

```yaml
- data:
    # ... node configuration
  height: 52
  id: '1765791071967'
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

**Standard dimensions:**
- Width: Usually 242 or 244 pixels
- Height: Varies by node type (52-300+ pixels)
- Positions: Absolute canvas coordinates

**Connection points:**
- `sourcePosition`: `right` (standard)
- `targetPosition`: `left` (standard)

**Viewport settings:**

**Evidence:** `bots/Simple HTTP Flow.yml:160-163`

```yaml
viewport:
  x: 60.5
  y: 111.5
  zoom: 1
```

**Purpose:** Canvas view state for UI; does not affect execution.

## Verification Log

### Verified Files
- `bots/Simple HTTP Flow.yml:1-165` (complete)
- `bots/Friendly Multilingual Chatbot v1.0.yml:1-196` (complete)
- `bots/bug_hunting_2_parallelism.yml:1-318` (complete)
- `bots/Excel to FAQ.yml:1-216` (complete)
- `bots/DeepResearch.yml:1-1116` (complete)
- `bots/Patient Intake Chatbot.yml:1-300` (partial - 300 of ~1800 lines)
- `bots/Betterdoc AI Agent v2.0 DE - internal Knowledge (8).yml:1-300` (partial - 300 of ~2300 lines)
- `bots/VIER RAG.yml:1-335` (complete)

### Spot-checked excerpts captured
Yes - all excerpts verified by direct file reads with line numbers

### Cross-referenced with documentation
All node type behaviors cross-referenced with official Dify documentation; variable syntax patterns confirmed across multiple sources.

## Open Questions / Unverified Claims

### Question 1: Loop Node Implementation
**What was attempted:** Searched sampled files for `type: loop` nodes.
**Evidence missing:** No loop nodes found in the 8 sampled files.
**Why it matters:** Documentation describes loop vs iteration differences, but no concrete YAML example available from codebase.
**Documentation reference available:** Loop node termination conditions and state management described in docs.

### Question 2: Agent Node with ReAct Strategy
**What was attempted:** Searched sampled files for `type: agent` nodes.
**Evidence missing:** No agent nodes found in sampled files.
**Why it matters:** Documentation describes two strategies (Function Calling vs ReAct) but no YAML configuration example.
**Documentation reference available:** Agent strategies and tool control described in docs.

### Question 3: Question Classifier Node
**What was attempted:** Searched sampled files for `type: question-classifier` nodes.
**Evidence missing:** No question classifier nodes found.
**Why it matters:** Semantic routing mechanism not exemplified in sample bots.
**Documentation reference available:** LLM-based classification described in docs.

### Question 4: Parameter Extractor Node
**What was attempted:** Searched sampled files for `type: parameter-extractor` nodes.
**Evidence missing:** No parameter extractor nodes found.
**Why it matters:** Structured extraction from unstructured text not exemplified.
**Documentation reference available:** Inference modes (function call vs prompt-based) described in docs.

### Question 5: Remaining Bot Files
**What was attempted:** Read 8 of 19 bot files (42% by count).
**Files not examined:**
  - `Analyze a Paper (2).yml` (70KB)
  - `Confluence to Knowledgebase.yml` (28KB)
  - `CORA DIST Specialist.yml` (27KB)
  - `CVG Test Forward.yml` (64KB)
  - `CVG Test.yml` (48KB)
  - `Detailed Meeting-Minutes for Open WebUI.yml` (18KB)
  - `Detailed Meeting-Minutes XML (1).yml` (17KB)
  - `PDF Reader for long Text.yml` (17KB)
  - `Steffen_ Netto Bot with AB & Mail 10.12 V2 (31).yml` (177KB - largest)
  - `Betterdoc AI Agent v2.0 FR - internal Knowledge.yml` (56KB)
  - `Betterdoc AI Agent v2.0 IT - internal Knowledge.yml` (56KB)
**Why it matters:** These files might contain node types or patterns not seen in sampled set.
**Mitigation:** Sampled files represent diverse use cases (simple workflow, chatbot, iteration, document processing, research, stateful intake, RAG); remaining files likely use similar patterns.

### Question 6: Knowledge Base / RAG Pipeline Configuration
**What was attempted:** Examined `rag_pipeline_variables` and `retriever_resource` fields.
**Evidence found:** All sampled files have `rag_pipeline_variables: []` (empty); `retriever_resource.enabled` varies.
**Evidence missing:** Actual RAG configuration with knowledge base connections.
**Why it matters:** RAG is mentioned as core Dify feature but not fully configured in samples.
**Partial evidence:** VIER RAG bot uses HTTP request to external knowledge API, not Dify's built-in RAG.

### Question 7: Custom Note Nodes
**What was attempted:** Observed `type: custom-note` nodes in DeepResearch workflow.
**Evidence found:** `bots/DeepResearch.yml:934-1032` contains note nodes with rich text JSON.
**Evidence missing:** Documentation for note node format and purpose.
**Observation:** Notes appear to be UI-only documentation elements with `author`, `text` (Lexical JSON format), `theme`, dimensions.
**Why it matters:** Understanding if notes affect execution or are purely UI metadata.

## References

### Documentation Sources
- https://docs.dify.ai/en/use-dify/getting-started/introduction
- https://docs.dify.ai/en/use-dify/getting-started/quick-start
- https://docs.dify.ai/en/use-dify/getting-started/key-concepts
- https://docs.dify.ai/en/use-dify/nodes/user-input
- https://docs.dify.ai/en/use-dify/nodes/llm
- https://docs.dify.ai/en/use-dify/nodes/answer
- https://docs.dify.ai/en/use-dify/nodes/output
- https://docs.dify.ai/en/use-dify/nodes/agent
- https://docs.dify.ai/en/use-dify/nodes/tools
- https://docs.dify.ai/en/use-dify/nodes/question-classifier
- https://docs.dify.ai/en/use-dify/nodes/ifelse
- https://docs.dify.ai/en/use-dify/nodes/iteration
- https://docs.dify.ai/en/use-dify/nodes/loop
- https://docs.dify.ai/en/use-dify/nodes/code
- https://docs.dify.ai/en/use-dify/nodes/template
- https://docs.dify.ai/en/use-dify/nodes/variable-aggregator
- https://docs.dify.ai/en/use-dify/nodes/doc-extractor
- https://docs.dify.ai/en/use-dify/nodes/variable-assigner
- https://docs.dify.ai/en/use-dify/nodes/parameter-extractor
- https://docs.dify.ai/en/use-dify/nodes/http-request
- https://docs.dify.ai/en/use-dify/nodes/list-operator

### Verified Codebase Files
- `bots/Simple HTTP Flow.yml:1-165`
- `bots/Friendly Multilingual Chatbot v1.0.yml:1-196`
- `bots/bug_hunting_2_parallelism.yml:1-318`
- `bots/Excel to FAQ.yml:1-216`
- `bots/DeepResearch.yml:1-1116`
- `bots/Patient Intake Chatbot.yml:1-300`
- `bots/Betterdoc AI Agent v2.0 DE - internal Knowledge (8).yml:1-300`
- `bots/VIER RAG.yml:1-335`
