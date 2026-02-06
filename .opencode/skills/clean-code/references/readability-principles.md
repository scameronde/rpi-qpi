# Readability Principles

Principles for evaluating code clarity, naming, formatting, comments, and human comprehension.

## 1. Meaningful Names

**Definition**: Names should reveal intent and make code self-documenting.

**Source**: *Clean Code* Ch. 2 "Meaningful Names"

### Rules for Good Names

1. **Use Intention-Revealing Names**: Name should answer why it exists, what it does, how it's used
   ```python
   # Bad
   d = 86400  # elapsed time in days
   
   # Good
   elapsed_time_in_days = 86400
   SECONDS_PER_DAY = 86400
   ```

2. **Avoid Disinformation**: Don't use names that vary in small ways
   ```python
   # Bad: Look similar, easy to confuse
   XYZControllerForEfficientHandlingOfStrings
   XYZControllerForEfficientStorageOfStrings
   
   # Good: Clearly different
   StringProcessor
   StringRepository
   ```

3. **Make Meaningful Distinctions**: Don't add noise words
   ```python
   # Bad: What's the difference?
   ProductInfo
   ProductData
   Product
   
   # Good: Clear distinctions
   ProductCatalogEntry  # What we sell
   ProductOrderItem  # What customer ordered
   ProductInventoryRecord  # What we have in stock
   ```

4. **Use Pronounceable Names**: You should be able to say it out loud
   ```python
   # Bad
   genymdhms  # Generate year-month-day-hour-minute-second
   
   # Good
   generation_timestamp
   ```

5. **Use Searchable Names**: Avoid single letters except loop counters
   ```python
   # Bad: Can't search for "e"
   for e in employees:
       s = e.salary * 12
   
   # Good: Searchable
   for employee in employees:
       annual_salary = employee.salary * MONTHS_PER_YEAR
   ```

### Naming by Type

**Variables**: Noun or noun phrase
```python
# Bad
get = ...
calc = ...

# Good
user_count = ...
payment_processor = ...
```

**Functions**: Verb or verb phrase
```python
# Bad
user()
payment()

# Good
get_user()
process_payment()
calculate_total()
```

**Classes**: Noun, not verb
```python
# Bad
ProcessData
HandleRequest

# Good
DataProcessor
RequestHandler
UserAuthenticator
```

**Booleans**: Question form
```python
# Bad
user
status

# Good
is_authenticated
has_permission
can_submit
should_retry
```

**Constants**: ALL_CAPS
```python
# Bad
maxretries = 3

# Good
MAX_RETRIES = 3
DEFAULT_TIMEOUT_SECONDS = 30
```

### Red Flags

- **Single Letter Names**: `d`, `e`, `x` (except loop counters `i`, `j`, `k`)
- **Abbreviations**: `cnt`, `msg`, `usr` (except universally known: `id`, `url`, `html`)
- **Generic Names**: `data`, `info`, `manager`, `helper`, `utils`
- **Type in Name**: `userString`, `accountList` (type should be obvious from usage)
- **Hungarian Notation**: `strName`, `iCount` (outdated in modern typed languages)
- **Cute Names**: `whack()` instead of `kill()`, `eatMyShorts()` instead of `abort()`

### Examples

**Bad Naming**
```python
class DtaRcrd102:  # What is this?
    def __init__(self):
        self.genymdhms = datetime.now()  # Unpronounceable
        self.modymdhms = datetime.now()
        self.pszqint = "102"  # Gibberish

def do_stuff(a1, a2):  # Generic function, generic parameters
    for x in a1:  # What is x?
        if x.k == a2:  # What is k?
            return x.v  # What is v?
    return None
```

**Good Naming**
```python
class Customer:
    def __init__(self):
        self.created_at = datetime.now()
        self.modified_at = datetime.now()
        self.customer_id = "102"

def find_customer_by_id(customers, target_id):
    for customer in customers:
        if customer.id == target_id:
            return customer.profile
    return None
```

## 2. Function Size

**Definition**: Functions should be small, doing one thing well.

**Source**: *Clean Code* Ch. 3 "Functions Should Be Small"

### Size Guidelines

- **Ideal**: < 20 lines (fits on screen without scrolling)
- **Acceptable**: < 50 lines (can understand without scrolling)
- **Red Flag**: > 100 lines (needs refactoring)
- **Critical**: > 200 lines (immediate refactoring required)

### Why Small Functions?

1. **Easier to understand**: Can comprehend entire function at once
2. **Easier to test**: Fewer code paths, simpler assertions
3. **Easier to name**: If hard to name, probably does too much
4. **Easier to reuse**: Small functions are composable

### Red Flags

- **Scrolling Required**: Function doesn't fit on one screen
- **Section Comments**: Comments marking sections ("// Validation", "// Calculation") indicate multiple responsibilities
- **Multiple Levels of Abstraction**: Mixing high-level logic with low-level details
- **Hard to Name**: If you can't name it clearly, it probably does too much

### Examples

**Bad: Long Function (100+ lines)**
```python
def process_order(order_id, user_id, items, payment_method, shipping_address):
    # Validation section (20 lines)
    if not order_id:
        raise ValueError("Missing order_id")
    if not user_id:
        raise ValueError("Missing user_id")
    if not items or len(items) == 0:
        raise ValueError("No items in order")
    # ... more validation
    
    # Calculate totals (25 lines)
    subtotal = 0
    for item in items:
        if item.quantity <= 0:
            raise ValueError(f"Invalid quantity for {item.name}")
        subtotal += item.price * item.quantity
    
    tax_rate = get_tax_rate(shipping_address.state)
    tax = subtotal * tax_rate
    shipping = calculate_shipping(items, shipping_address)
    total = subtotal + tax + shipping
    # ... more calculation
    
    # Process payment (30 lines)
    if payment_method.type == "credit_card":
        # ... credit card logic
    elif payment_method.type == "paypal":
        # ... paypal logic
    # ... more payment logic
    
    # Update inventory (20 lines)
    # ... inventory updates
    
    # Send confirmation (15 lines)
    # ... email logic
```

**Good: Extracted Small Functions**
```python
def process_order(order_id, user_id, items, payment_method, shipping_address):
    # Each function < 20 lines, single responsibility
    validate_order_inputs(order_id, user_id, items)
    totals = calculate_order_totals(items, shipping_address)
    payment_result = process_payment(totals, payment_method)
    update_inventory(items)
    send_order_confirmation(user_id, order_id, totals)
    return create_order_record(order_id, user_id, totals, payment_result)

def validate_order_inputs(order_id, user_id, items):
    # 10 lines of validation
    ...

def calculate_order_totals(items, shipping_address):
    # 15 lines of calculation
    ...
```

## 3. Nesting Depth

**Definition**: The number of levels of indentation in code. Deep nesting reduces readability.

**Source**: *Code Complete* Ch. 19 "General Control Issues"

### Depth Guidelines

- **Ideal**: ≤ 2 levels (if, for)
- **Acceptable**: ≤ 3 levels (if, for, if)
- **Red Flag**: ≤ 4 levels (if, for, if, if)
- **Critical**: > 4 levels (immediate refactoring)

### Techniques to Reduce Nesting

1. **Guard Clauses** (Early Return)
   ```python
   # Bad: Arrow code
   def process_payment(user, amount):
       if user is not None:
           if user.is_active:
               if amount > 0:
                   if user.balance >= amount:
                       # Actual logic buried 4 levels deep
                       return charge(user, amount)
   
   # Good: Guard clauses
   def process_payment(user, amount):
       if user is None:
           raise ValueError("User required")
       if not user.is_active:
           raise ValueError("User not active")
       if amount <= 0:
           raise ValueError("Amount must be positive")
       if user.balance < amount:
           raise ValueError("Insufficient balance")
       
       return charge(user, amount)  # Main logic at top level
   ```

2. **Extract Method**
   ```python
   # Bad: Nested loops
   for order in orders:
       for item in order.items:
           if item.needs_shipping:
               if item.in_stock:
                   # Deep nesting
                   ship_item(item)
   
   # Good: Extract nested logic
   for order in orders:
       process_order_items(order)
   
   def process_order_items(order):
       for item in order.items:
           if should_ship_item(item):
               ship_item(item)
   
   def should_ship_item(item):
       return item.needs_shipping and item.in_stock
   ```

3. **Invert Conditions**
   ```python
   # Bad: Nesting
   def process(item):
       if item.is_valid:
           if item.needs_processing:
               # Logic here
               process_item(item)
   
   # Good: Combined condition
   def process(item):
       if item.is_valid and item.needs_processing:
           process_item(item)
   ```

### Red Flags

- **Arrow Code**: `>>>>>>` shaped indentation
- **Hard to Find Matching Braces**: Which `}` closes which `{`?
- **Lost Context**: What was the condition 5 levels up?

## 4. Comments

**Definition**: Comments should explain WHY, not WHAT. Code should be self-documenting for WHAT.

**Source**: *Clean Code* Ch. 4 "Comments"

### Good Comments

1. **Legal Comments**: Copyright, license
2. **Explanation of Intent**: Why this approach was chosen
   ```python
   # We use exponential backoff to avoid overwhelming the API during retries.
   # Linear backoff caused cascading failures in production (incident #1234).
   ```

3. **Clarification**: When code can't be changed (3rd party API)
   ```python
   # API returns 200 even for errors, check response.status field instead
   ```

4. **Warning of Consequences**:
   ```python
   # Don't run this test in production - it deletes all data
   def test_cascade_delete():
       ...
   ```

5. **TODO Comments**: (but track in issue tracker too)
   ```python
   # TODO: Replace with async implementation when Python 3.11 available
   ```

6. **Amplification**: Emphasize importance of something seemingly small
   ```python
   # This trim() is critical - whitespace causes authentication to fail
   username = username.trim()
   ```

### Bad Comments

1. **Obvious Comments**: Explaining WHAT (code already says it)
   ```python
   # Bad: Redundant
   i = i + 1  # Increment i
   
   # Good: No comment needed (code is clear)
   i += 1
   ```

2. **Misleading Comments**: Comment contradicts code
   ```python
   # Check if user is admin
   if user.role == "moderator":  # Oops! Comment is wrong
   ```

3. **Mandated Comments**: Every function must have comment (even trivial ones)
   ```python
   # Bad: Mandated noise
   def get_name(self):
       """Returns the name"""
       return self.name
   ```

4. **Journal Comments**: Change history (use git instead)
   ```python
   # 2024-01-15: Fixed bug in calculation
   # 2024-01-20: Added validation
   # 2024-01-25: Refactored for performance
   ```

5. **Commented-Out Code**: Delete it (it's in git history)
   ```python
   # def old_implementation():
   #     # ... 50 lines of dead code
   ```

6. **Noise Comments**: Stating the obvious
   ```python
   # The day of the month
   private int day_of_month;
   ```

### When to Comment

- **Regex**: Explain complex patterns
  ```python
  # Match email: username@domain.ext (RFC 5322 simplified)
  pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  ```

- **Non-Obvious Algorithms**: Explain tricky logic
  ```python
  # Using Boyer-Moore string search for O(n/m) average case
  # vs naive O(n*m) when searching large documents
  ```

- **Magic Numbers**: (But prefer named constants)
  ```python
  # Sleep 86400 seconds (24 hours) to allow batch job to complete
  time.sleep(86400)
  
  # Better: No comment needed
  BATCH_JOB_DURATION_SECONDS = 86400
  time.sleep(BATCH_JOB_DURATION_SECONDS)
  ```

## 5. Magic Numbers

**Definition**: Unexplained numeric literals in code. Should be replaced with named constants.

**Source**: *Code Complete* Ch. 12 "Fundamental Data Types"

### What are Magic Numbers?

Any numeric literal except:
- `0`, `1` (usually obvious)
- `-1` (common sentinel value)
- `""` (empty string)

### Why are they bad?

1. **Unclear Intent**: What does `86400` mean?
2. **Hard to Change**: If value appears 10 times, must change 10 places
3. **Error-Prone**: Easy to mistype `604800` vs `608400`
4. **No Type Safety**: Is `100` a percentage, a count, a dollar amount?

### Examples

**Bad: Magic Numbers**
```python
if response.status == 404:  # What does 404 mean?
    retry_after(3600)  # 3600 what? Seconds? Minutes?

area = 3.14159 * radius ** 2  # Why this specific value?

buffer = [0] * 1024  # Why 1024?
```

**Good: Named Constants**
```python
HTTP_NOT_FOUND = 404
RETRY_DELAY_SECONDS = 3600
PI = 3.14159
BUFFER_SIZE_BYTES = 1024

if response.status == HTTP_NOT_FOUND:
    retry_after(RETRY_DELAY_SECONDS)

area = PI * radius ** 2

buffer = [0] * BUFFER_SIZE_BYTES
```

### Where to Define Constants

1. **Module Level**: For module-specific constants
   ```python
   # config.py
   MAX_RETRIES = 3
   DEFAULT_TIMEOUT = 30
   ```

2. **Class Level**: For class-specific constants
   ```python
   class HttpClient:
       DEFAULT_TIMEOUT_SECONDS = 30
       MAX_REDIRECTS = 10
   ```

3. **Enum**: For related constants
   ```python
   class HttpStatus(Enum):
       OK = 200
       NOT_FOUND = 404
       SERVER_ERROR = 500
   ```

## 6. Formatting

**Definition**: Consistent code layout that reveals structure.

**Source**: *Clean Code* Ch. 5 "Formatting"

### Vertical Formatting

1. **File Length**: < 500 lines ideal, < 1000 acceptable
2. **Vertical Openness**: Blank lines separate concepts
   ```python
   # Good: Blank lines separate sections
   import os
   import sys
   
   from myapp import models
   from myapp import utils
   
   def process_data(data):
       validated = validate(data)
       
       transformed = transform(validated)
       
       return save(transformed)
   ```

3. **Vertical Density**: Related lines stay together
   ```python
   # Bad: Unnecessary blank lines
   class User:
   
       def __init__(self):
   
           self.name = ""
   
           self.email = ""
   
   # Good: Related lines together
   class User:
       def __init__(self):
           self.name = ""
           self.email = ""
   ```

4. **Vertical Ordering**: High-level → low-level (like newspaper)
   ```python
   # High-level public API
   def process_order(order_id):
       items = get_items(order_id)
       total = calculate_total(items)
       return total
   
   # Medium-level helpers
   def get_items(order_id):
       return _query_database(order_id)
   
   # Low-level implementation details
   def _query_database(order_id):
       # SQL query details
       ...
   ```

### Horizontal Formatting

1. **Line Length**: < 80 characters ideal, < 120 acceptable
2. **Horizontal Openness**: Spaces reveal precedence
   ```python
   # Good: Spaces show structure
   total = subtotal + tax + shipping
   result = a*b + c*d
   
   # Bad: No spaces
   total=subtotal+tax+shipping
   ```

3. **Indentation**: Reveals hierarchy
   ```python
   # Good: Indentation shows nesting
   if condition:
       for item in items:
           if item.valid:
               process(item)
   ```

### Team Rules

- Use automated formatter (black, prettier, gofmt)
- Configure once, never argue about style again
- Consistency > personal preference

## Summary Checklist

When evaluating READABILITY, check:

- [ ] **Names**: Intention-revealing, pronounceable, searchable (no `cnt`, `data`, `mgr`)
- [ ] **Function Size**: < 50 lines ideal, < 100 acceptable, > 200 critical
- [ ] **Nesting**: ≤ 3 levels, use guard clauses for early return
- [ ] **Comments**: Explain WHY not WHAT, no commented-out code
- [ ] **Magic Numbers**: Named constants for all literals except 0, 1, -1
- [ ] **Formatting**: Consistent (use automated formatter)

## Further Reading

- *Clean Code* Ch. 2 "Meaningful Names"
- *Clean Code* Ch. 3 "Functions"
- *Clean Code* Ch. 4 "Comments"
- *Clean Code* Ch. 5 "Formatting"
- *Code Complete* Ch. 12 "Fundamental Data Types"
- *Code Complete* Ch. 19 "General Control Issues"
