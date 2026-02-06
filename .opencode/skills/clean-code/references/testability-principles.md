# Testability Principles

Principles for evaluating how easily code can be tested in isolation.

## 1. Seams (Substitutable Dependencies)

**Definition**: A seam is a place where you can alter behavior in your program without editing in that place. Seams allow testing code in isolation by substituting dependencies.

**Source**: *Working Effectively with Legacy Code* Ch. 4 "The Seam Model"

### What to Check

- Can external services be mocked or stubbed?
- Can file I/O operations be isolated?
- Can time/random/network dependencies be controlled in tests?

### Types of Seams

1. **Object Seam**: Replace dependencies via constructor/parameter injection
   ```python
   # Good: Database is injectable (can substitute with mock)
   class OrderService:
       def __init__(self, database):
           self.database = database
   
   # Test can inject mock database
   def test_order_service():
       mock_db = MockDatabase()
       service = OrderService(mock_db)
       service.create_order(...)
       assert mock_db.save_called
   ```

2. **Function Seam**: Replace function via parameter or module-level substitution
   ```python
   # Good: Time function is injectable
   def process_order(order, current_time=None):
       if current_time is None:
           current_time = datetime.now()  # Default behavior
       
       order.created_at = current_time
   
   # Test can control time
   def test_process_order():
       fixed_time = datetime(2024, 1, 15, 12, 0, 0)
       order = process_order(Order(), current_time=fixed_time)
       assert order.created_at == fixed_time
   ```

3. **Template Method Seam**: Override methods in subclass for testing
   ```python
   class EmailService:
       def send(self, to, subject, body):
           message = self.format_message(to, subject, body)
           self.deliver(message)  # Seam: can override in test
       
       def deliver(self, message):
           # Actual SMTP logic
           smtp.send(message)
   
   # Test subclass
   class TestableEmailService(EmailService):
       def __init__(self):
           self.delivered_messages = []
       
       def deliver(self, message):
           self.delivered_messages.append(message)  # Capture instead of send
   ```

### Red Flags (Untestable Code)

1. **Hard-Coded Dependencies**
   ```python
   # Bad: Cannot test without real database
   class OrderService:
       def create_order(self, items):
           db = PostgresDatabase()  # Hard-coded instantiation
           db.save(items)
   ```

2. **Global State**
   ```python
   # Bad: Tests interfere with each other
   current_user = None  # Global variable
   
   def process_request(request):
       global current_user
       current_user = authenticate(request)  # Side effect on global
   ```

3. **Singletons**
   ```python
   # Bad: Singleton prevents substitution
   class ConfigManager:
       _instance = None
       
       @classmethod
       def get_instance(cls):
           if cls._instance is None:
               cls._instance = ConfigManager()
           return cls._instance
   
   # Cannot inject test configuration!
   ```

4. **Static Method Calls**
   ```python
   # Bad: Cannot mock static calls
   class OrderService:
       def create_order(self, items):
           PaymentGateway.charge(items.total)  # Static method, no seam
   ```

### Examples

**Bad: No Seams (Untestable)**
```python
class OrderProcessor:
    def process(self, order_id):
        # Hard-coded database connection
        conn = psycopg2.connect("host=prod-db user=postgres")
        
        # Hard-coded email service
        email = GmailSender(api_key="secret")
        
        # Hard-coded time (tests always use current time)
        order.processed_at = datetime.now()
        
        # Cannot test without real database, email, and variable time!
```

**Good: Multiple Seams (Testable)**
```python
class OrderProcessor:
    def __init__(self, database, email_service, clock=None):
        self.database = database  # Seam: injectable
        self.email_service = email_service  # Seam: injectable
        self.clock = clock or datetime  # Seam: injectable
    
    def process(self, order_id):
        order = self.database.get_order(order_id)
        order.processed_at = self.clock.now()
        self.database.save(order)
        self.email_service.send_confirmation(order)

# Test with mocks
def test_order_processor():
    mock_db = MockDatabase()
    mock_email = MockEmailService()
    fixed_clock = FixedClock("2024-01-15 12:00:00")
    
    processor = OrderProcessor(mock_db, mock_email, fixed_clock)
    processor.process("order-123")
    
    assert mock_db.saved_orders[0].processed_at == "2024-01-15 12:00:00"
    assert mock_email.sent_count == 1
```

## 2. Pure Functions (Minimize Side Effects)

**Definition**: A pure function's output depends ONLY on inputs, with no side effects (no mutations, no I/O, no global state changes).

**Source**: *Clean Code* Ch. 3 "Functions" (Command Query Separation)

### Benefits of Pure Functions

1. **Easy to Test**: Input → Output, no setup required
2. **Easy to Understand**: No hidden behavior
3. **Parallelizable**: No shared state, can run concurrently
4. **Cacheable**: Same input always produces same output (memoization)

### What to Check

- Does function output depend ONLY on inputs?
- Are state changes explicit (returned, not mutated)?
- Is I/O isolated from business logic?

### Red Flags (Hidden Side Effects)

1. **Mutating Parameters**
   ```python
   # Bad: Mutates input
   def apply_discount(order):
       order.total *= 0.9  # Side effect: mutates order
       return order
   
   # Good: Returns new value
   def calculate_discounted_total(total):
       return total * 0.9  # Pure: no mutation
   ```

2. **Accessing Global State**
   ```python
   # Bad: Reads global variable
   tax_rate = 0.1  # Global
   
   def calculate_tax(amount):
       return amount * tax_rate  # Impure: depends on global
   
   # Good: Tax rate is parameter
   def calculate_tax(amount, tax_rate):
       return amount * tax_rate  # Pure: explicit dependency
   ```

3. **I/O in Business Logic**
   ```python
   # Bad: File I/O embedded
   def process_order(order_id):
       order = json.load(open(f"orders/{order_id}.json"))  # I/O
       total = sum(item.price for item in order.items)
       return total
   
   # Good: I/O separated from logic
   def load_order(order_id):
       return json.load(open(f"orders/{order_id}.json"))  # I/O layer
   
   def calculate_order_total(order):
       return sum(item.price for item in order.items)  # Pure logic
   ```

4. **Non-Deterministic Functions**
   ```python
   # Bad: Output varies with same input
   def create_order(items):
       order_id = uuid.uuid4()  # Non-deterministic
       timestamp = datetime.now()  # Non-deterministic
       return Order(order_id, items, timestamp)
   
   # Good: Inject random/time dependencies
   def create_order(items, order_id, timestamp):
       return Order(order_id, items, timestamp)  # Pure: deterministic
   ```

### Command-Query Separation

**Rule**: Functions should either:
- **Command**: Change state (return nothing)
- **Query**: Return value (change nothing)

Never both!

```python
# Bad: Does both (ambiguous)
def get_next_item(queue):
    item = queue.pop()  # Mutates queue (command)
    return item  # Returns value (query)

# Good: Separate command and query
def peek_next_item(queue):
    return queue[0] if queue else None  # Query: no mutation

def remove_next_item(queue):
    queue.pop()  # Command: no return value
```

### Examples

**Bad: Impure Function**
```python
# Multiple side effects: mutation, global access, I/O
total_revenue = 0  # Global state

def process_payment(order):
    global total_revenue
    
    # Side effect: mutates global
    total_revenue += order.total
    
    # Side effect: mutates parameter
    order.status = "paid"
    
    # Side effect: I/O
    log_file.write(f"Processed {order.id}\n")
    
    # Non-deterministic
    order.paid_at = datetime.now()
    
    return order  # Returns mutated input (confusing!)
```

**Good: Pure Function**
```python
def calculate_payment_details(order_total, tax_rate, current_time):
    # Pure calculation
    tax = order_total * tax_rate
    total = order_total + tax
    
    return {
        "subtotal": order_total,
        "tax": tax,
        "total": total,
        "calculated_at": current_time
    }

# Separate I/O and side effects into different layer
def process_payment(order, logger, clock):
    details = calculate_payment_details(
        order.total,
        TAX_RATE,
        clock.now()
    )
    
    # Side effects explicit and isolated
    updated_order = order.with_status("paid")
    logger.log(f"Processed {order.id}")
    
    return updated_order, details
```

## 3. Dependency Injection (Explicit Dependencies)

**Definition**: Dependencies are passed to a component (via constructor or parameters) rather than being created or accessed globally.

**Source**: *Pragmatic Programmer* Ch. 28 "Decoupling"

### What to Check

- Are dependencies passed as constructor arguments or parameters?
- Can you tell what a class depends on by reading its constructor?
- Can dependencies be substituted for testing?

### Red Flags

1. **`new` Operator for Dependencies**
   ```python
   # Bad: Creates own dependencies
   class OrderService:
       def __init__(self):
           self.database = PostgresDatabase()  # Hard-coded
           self.email = GmailSender()  # Hard-coded
   ```

2. **Service Locator Pattern**
   ```python
   # Bad: Hidden dependency on ServiceLocator
   class OrderService:
       def process(self, order):
           db = ServiceLocator.get("database")  # Hidden dependency
           db.save(order)
   ```

3. **Global Configuration**
   ```python
   # Bad: Reads global config
   import config
   
   class EmailService:
       def send(self, message):
           smtp_host = config.SMTP_HOST  # Global dependency
   ```

### Examples

**Bad: Hidden Dependencies**
```python
class OrderProcessor:
    def __init__(self):
        # Creates own dependencies (tight coupling)
        self.db = PostgresDatabase(
            host="localhost",
            user="postgres",
            password="secret"
        )
        self.payment = StripePaymentGateway(api_key="sk_test_...")
        self.email = SendGridEmailService(api_key="SG...")
    
    # Cannot test without real database, Stripe, and SendGrid!
```

**Good: Dependency Injection**
```python
class OrderProcessor:
    def __init__(self, database, payment_gateway, email_service):
        # Dependencies injected (loose coupling)
        self.database = database
        self.payment_gateway = payment_gateway
        self.email_service = email_service

# Production: Inject real implementations
def create_production_processor():
    db = PostgresDatabase(...)
    payment = StripePaymentGateway(...)
    email = SendGridEmailService(...)
    return OrderProcessor(db, payment, email)

# Test: Inject mocks
def test_order_processor():
    mock_db = MockDatabase()
    mock_payment = MockPaymentGateway()
    mock_email = MockEmailService()
    
    processor = OrderProcessor(mock_db, mock_payment, mock_email)
    # Can test without external dependencies!
```

### Constructor Injection vs Parameter Injection

**Constructor Injection**: For mandatory, long-lived dependencies
```python
class UserService:
    def __init__(self, database):  # Constructor injection
        self.database = database
    
    def get_user(self, user_id):
        return self.database.query(user_id)
```

**Parameter Injection**: For optional or varying dependencies
```python
def process_order(order, logger=None):  # Parameter injection
    if logger:
        logger.log(f"Processing {order.id}")
    # ...
```

## 4. Argument Count (Short Parameter Lists)

**Definition**: Functions should have few parameters (0-2 ideal, max 3).

**Source**: *Clean Code* Ch. 3 "Functions"

### Parameter Count Guidelines

- **0 parameters** (Niladic): Ideal (pure, no context needed)
- **1 parameter** (Monadic): Good
- **2 parameters** (Dyadic): Acceptable
- **3 parameters** (Triadic): Use with caution
- **4+ parameters** (Polyadic): Consider parameter object

### Why Fewer is Better

1. **Easier to Test**: Fewer combinations to test
   - 2 params with 3 values each = 9 test cases
   - 4 params with 3 values each = 81 test cases
2. **Easier to Understand**: Less to remember
3. **Easier to Call**: Less error-prone (wrong order, missing args)

### Red Flags

1. **Long Parameter Lists**
   ```python
   # Bad: 6 parameters
   def create_user(name, email, password, age, country, newsletter_opt_in):
       ...
   ```

2. **Boolean Flags**
   ```python
   # Bad: Boolean indicates function does two things
   def render(content, use_cache):
       if use_cache:
           # Do one thing
       else:
           # Do different thing
   
   # Good: Split into two functions
   def render(content): ...
   def render_cached(content): ...
   ```

3. **Order-Dependent Parameters**
   ```python
   # Bad: Easy to swap
   def send_email(to, from, subject, body):
       ...
   
   send_email("alice@example.com", "bob@example.com", ...)  # Which is which?
   ```

### Solutions

1. **Introduce Parameter Object**
   ```python
   # Bad: 5 parameters
   def create_user(name, email, password, age, country):
       ...
   
   # Good: Parameter object
   @dataclass
   class UserRegistration:
       name: str
       email: str
       password: str
       age: int
       country: str
   
   def create_user(registration: UserRegistration):
       ...
   ```

2. **Extract Class**
   ```python
   # Bad: Many parameters indicate missing abstraction
   def calculate_shipping(weight, dimensions, origin, destination, service_level):
       ...
   
   # Good: Package abstraction
   class Package:
       def __init__(self, weight, dimensions):
           self.weight = weight
           self.dimensions = dimensions
   
   class ShipmentRequest:
       def __init__(self, package, origin, destination, service_level):
           ...
   
   def calculate_shipping(shipment: ShipmentRequest):
       ...
   ```

3. **Use Builder Pattern**
   ```python
   # Bad: Many optional parameters
   def send_email(to, subject, body, cc=None, bcc=None, attachments=None, 
                  priority=None, reply_to=None):
       ...
   
   # Good: Builder pattern
   email = EmailBuilder()
       .to("alice@example.com")
       .subject("Hello")
       .body("Message")
       .cc("bob@example.com")
       .attach("file.pdf")
       .send()
   ```

## 5. Observable Outcomes (Verifiable Behavior)

**Definition**: Functions should return values or throw exceptions, making behavior observable and testable.

**Source**: *Working Effectively with Legacy Code* Ch. 11 "I Need to Make a Change. What Methods Should I Test?"

### What to Check

- Do functions return values (not just side effects)?
- Are errors signaled clearly (exceptions, not silent failures)?
- Can behavior be verified without inspecting internal state?

### Red Flags

1. **Void Functions with Only Side Effects**
   ```python
   # Bad: No observable outcome
   def save_user(user):
       database.save(user)
       # How do I know it succeeded? (Must inspect database)
   
   # Good: Return value indicates success
   def save_user(user):
       result = database.save(user)
       return result.success
   ```

2. **Swallowed Exceptions**
   ```python
   # Bad: Silent failure
   def load_config():
       try:
           return json.load(open("config.json"))
       except:
           return {}  # Error hidden! No way to detect failure
   
   # Good: Let exception propagate
   def load_config():
       return json.load(open("config.json"))  # Raises if file missing
   ```

3. **Silent Failures**
   ```python
   # Bad: Returns None on error (ambiguous)
   def find_user(user_id):
       if user_id in users:
           return users[user_id]
       return None  # User not found? Or error?
   
   # Good: Raise exception on error
   def find_user(user_id):
       if user_id not in users:
           raise UserNotFoundError(user_id)
       return users[user_id]
   ```

4. **Checking Internal State**
   ```python
   # Bad: Must inspect internals to verify
   class OrderProcessor:
       def __init__(self):
           self.processed_count = 0
       
       def process(self, order):
           # Do work
           self.processed_count += 1  # Only observable via internals
   
   # Good: Return value observable
   class OrderProcessor:
       def process(self, order):
           # Do work
           return ProcessingResult(success=True, order_id=order.id)
   ```

### Examples

**Bad: Unobservable**
```python
class EmailService:
    def __init__(self):
        self.sent_emails = []  # Internal state
    
    def send(self, to, subject, body):
        # Sends email
        self.sent_emails.append((to, subject))  # Side effect only
        # No return value - how do I know it worked?

# Test must inspect internals
def test_email_service():
    service = EmailService()
    service.send("alice@example.com", "Hello", "Body")
    assert len(service.sent_emails) == 1  # Fragile: depends on internals
```

**Good: Observable**
```python
@dataclass
class EmailResult:
    success: bool
    message_id: str
    error: Optional[str] = None

class EmailService:
    def send(self, to, subject, body):
        try:
            message_id = smtp.send(to, subject, body)
            return EmailResult(success=True, message_id=message_id)
        except SMTPException as e:
            return EmailResult(success=False, message_id="", error=str(e))

# Test verifies return value
def test_email_service():
    service = EmailService()
    result = service.send("alice@example.com", "Hello", "Body")
    assert result.success  # Observable outcome
    assert result.message_id  # Can verify specific behavior
```

## Summary Checklist

When evaluating TESTABILITY, check:

- [ ] **Seams**: Dependencies injectable (constructor/parameter), not hard-coded
- [ ] **Pure Functions**: Output depends only on inputs, minimal side effects
- [ ] **Dependency Injection**: Dependencies explicit (passed in), not hidden (global/new)
- [ ] **Argument Count**: ≤ 3 parameters, consider parameter object for 4+
- [ ] **Observable Outcomes**: Functions return values/throw exceptions, not just side effects

## Further Reading

- *Working Effectively with Legacy Code* Ch. 4 "The Seam Model"
- *Working Effectively with Legacy Code* Ch. 11 "I Need to Make a Change. What Methods Should I Test?"
- *Clean Code* Ch. 3 "Functions" (Command Query Separation)
- *Pragmatic Programmer* Ch. 28 "Decoupling"
