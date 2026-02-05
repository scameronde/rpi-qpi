# Structure Principles

Architectural and design principles for evaluating code organization, coupling, cohesion, and abstraction.

## 1. Coupling (Minimize Dependencies)

**Definition**: The degree of interdependence between modules. Low coupling means modules can be changed independently.

**Source**: *The Pragmatic Programmer* Ch. 7 "Orthogonality"

### What to Check

- Can components be changed independently?
- Are dependencies explicit and minimal?
- Can you test one module without loading the entire system?

### Red Flags

- **Circular Dependencies**: Module A imports B, B imports A
- **Too Many Imports**: File has > 10 imports from other modules
- **Tight Coupling to Implementation**: Depending on concrete classes instead of interfaces/abstractions
- **Global State**: Modules communicate via shared global variables
- **Hidden Dependencies**: Module requires external state to be initialized in specific order

### Examples

**Bad: High Coupling**
```python
# orders.py
from payment import CreditCardProcessor, PayPalProcessor, StripeProcessor
from inventory import WarehouseDB
from email import GmailSender

class OrderService:
    def __init__(self):
        self.payment = CreditCardProcessor()  # Tight coupling to concrete class
        self.inventory = WarehouseDB()  # Cannot test without real database
        self.email = GmailSender()  # Cannot test without email service
```

**Good: Low Coupling**
```python
# orders.py
from typing import Protocol

class PaymentProcessor(Protocol):
    def charge(self, amount: float) -> bool: ...

class InventorySystem(Protocol):
    def reserve(self, item_id: str) -> bool: ...

class EmailSender(Protocol):
    def send(self, to: str, subject: str, body: str): ...

class OrderService:
    def __init__(self, payment: PaymentProcessor, inventory: InventorySystem, email: EmailSender):
        self.payment = payment  # Dependency injection, testable
        self.inventory = inventory
        self.email = email
```

### Metrics

- **Import Count**: < 10 ideal, < 20 acceptable, > 30 problematic
- **Dependency Depth**: How many layers deep are transitive dependencies?
- **Change Impact**: How many files must change when one requirement changes?

## 2. Cohesion (Each Module Does One Thing Well)

**Definition**: The degree to which elements within a module belong together. High cohesion means related functionality is grouped together.

**Source**: *Code Complete* Ch. 5 "Design in Construction"

### What to Check

- Are related functions grouped together?
- Are unrelated functions separated?
- Can you describe the module's purpose in one sentence without using "and"?

### Red Flags

- **Utility Classes**: "Utils", "Helpers", "Common" - dumping ground for unrelated functions
- **Manager Classes**: "OrderManager", "UserManager" - vague responsibility
- **Mixed Concerns**: UI code mixed with business logic, database queries in presentation layer
- **Weak Cohesion**: Module has functions that share no data or logic

### Cohesion Levels (Strongest to Weakest)

1. **Functional Cohesion** (Best): All elements contribute to a single well-defined task
   ```python
   class TaxCalculator:
       def calculate_sales_tax(self, amount, state): ...
       def calculate_vat(self, amount, country): ...
       def apply_tax_exemptions(self, amount, exemptions): ...
   ```

2. **Sequential Cohesion** (Good): Output of one element is input to next
   ```python
   class DataPipeline:
       def extract_data(self): ...
       def transform_data(self, raw_data): ...
       def load_data(self, transformed_data): ...
   ```

3. **Communicational Cohesion** (Acceptable): Elements operate on same data
   ```python
   class UserProfile:
       def __init__(self, user_id):
           self.user_id = user_id
       def get_name(self): ...
       def get_email(self): ...
       def get_preferences(self): ...
   ```

4. **Temporal Cohesion** (Weak): Elements executed at same time
   ```python
   class SystemInitializer:
       def initialize(self):
           self.load_config()  # Unrelated tasks
           self.connect_database()  # just happen to run
           self.start_logger()  # at startup
   ```

5. **Logical Cohesion** (Weak): Elements in same category but unrelated
   ```python
   class InputHandler:
       def handle_input(self, type):
           if type == "mouse": ...  # Unrelated input types
           elif type == "keyboard": ...  # grouped by category only
           elif type == "voice": ...
   ```

6. **Coincidental Cohesion** (Worst): No meaningful relationship
   ```python
   class Utilities:  # Random grab bag
       def format_date(self, date): ...
       def send_email(self, to, subject): ...
       def calculate_tax(self, amount): ...
   ```

### Examples

**Bad: Low Cohesion**
```python
class OrderUtils:  # Vague name, mixed concerns
    def validate_order(self, order): ...  # Validation
    def save_to_database(self, order): ...  # Persistence
    def send_confirmation_email(self, order): ...  # Notification
    def format_currency(self, amount): ...  # Formatting (unrelated!)
```

**Good: High Cohesion**
```python
class OrderValidator:  # Single responsibility
    def validate_items(self, items): ...
    def validate_payment(self, payment): ...
    def validate_shipping(self, address): ...

class OrderRepository:  # Separate responsibility
    def save(self, order): ...
    def find_by_id(self, id): ...

class OrderNotifier:  # Separate responsibility
    def send_confirmation(self, order): ...
    def send_shipment_update(self, order): ...
```

## 3. Abstraction Levels (Consistent Within Layers)

**Definition**: Code at the same abstraction level should use similar levels of detail. High-level functions should call high-level operations, not mix with low-level details.

**Source**: *Clean Code* Ch. 3 "Functions" (The Stepdown Rule)

### What to Check

- Do high-level functions call high-level abstractions?
- Are low-level details isolated in separate functions?
- Can you read code top-to-bottom like a narrative?

### Red Flags

- **Mixing Abstraction Levels**: Business logic mixed with SQL queries, HTTP handling, or file I/O
- **Leaky Abstractions**: High-level code depends on low-level implementation details
- **Abstraction Inversion**: Low-level code calling high-level orchestration

### Examples

**Bad: Mixed Abstraction Levels**
```python
def process_order(order_id):
    # HIGH LEVEL: Business logic
    if not validate_order(order_id):
        return False
    
    # LOW LEVEL: SQL query (should be abstracted!)
    conn = psycopg2.connect("dbname=orders user=postgres")
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status='processing' WHERE id=%s", (order_id,))
    conn.commit()
    
    # HIGH LEVEL: Business logic
    send_confirmation_email(order_id)
    
    # LOW LEVEL: File I/O (should be abstracted!)
    with open(f"/tmp/order_{order_id}.log", "w") as f:
        f.write(f"Order {order_id} processed at {datetime.now()}")
```

**Good: Consistent Abstraction Levels**
```python
def process_order(order_id):
    # All HIGH LEVEL operations
    if not validate_order(order_id):
        return False
    
    update_order_status(order_id, "processing")  # Abstraction hides database
    send_confirmation_email(order_id)  # Abstraction hides email service
    log_order_processed(order_id)  # Abstraction hides file I/O

# Low-level details isolated
def update_order_status(order_id, status):
    conn = psycopg2.connect("dbname=orders user=postgres")
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status=%s WHERE id=%s", (status, order_id))
    conn.commit()

def log_order_processed(order_id):
    with open(f"/tmp/order_{order_id}.log", "w") as f:
        f.write(f"Order {order_id} processed at {datetime.now()}")
```

### The Stepdown Rule

Functions should read like a top-down narrative:
1. **High-level**: What we're doing (business logic)
2. **Medium-level**: How we're doing it (orchestration)
3. **Low-level**: Implementation details

```python
# Level 1: High-level business logic
def checkout_customer(cart):
    validate_cart(cart)
    charge_payment(cart)
    fulfill_order(cart)
    notify_customer(cart)

# Level 2: Medium-level orchestration
def charge_payment(cart):
    total = calculate_total(cart)
    payment_method = get_payment_method(cart)
    process_payment(payment_method, total)

# Level 3: Low-level implementation
def process_payment(payment_method, amount):
    # Actual payment gateway integration
    response = payment_gateway.charge(payment_method, amount)
    if not response.success:
        raise PaymentError(response.error)
```

## 4. Orthogonality (Independent Components)

**Definition**: Two components are orthogonal if changes to one do not affect the other. Orthogonal systems are easier to test, debug, and modify.

**Source**: *The Pragmatic Programmer* Ch. 7 "Orthogonality"

### What to Check

- Does changing A require changing B?
- Can features be tested in isolation?
- If you fix a bug in one module, do other modules break?

### Red Flags

- **Shotgun Surgery**: One logical change requires edits to many files
- **Divergent Change**: One class changes for multiple unrelated reasons
- **Cascading Changes**: Changing one function breaks functions that don't call it
- **Feature Dependencies**: Cannot add feature X without modifying feature Y

### Examples

**Bad: Non-Orthogonal (Coupled)**
```python
# Changing authentication breaks order processing!
class User:
    def authenticate(self, password):
        self.is_authenticated = True
        self.last_login = datetime.now()
        self.process_pending_orders()  # Side effect! Violates orthogonality

class OrderService:
    def create_order(self, user, items):
        if not user.is_authenticated:  # Coupled to authentication state
            raise AuthError()
        # Now authentication and orders are entangled
```

**Good: Orthogonal (Independent)**
```python
class User:
    def authenticate(self, password):
        self.is_authenticated = True
        self.last_login = datetime.now()
        # No side effects, only updates user state

class OrderService:
    def create_order(self, user, items):
        # Accepts any user object (doesn't care about authentication)
        # Caller decides whether to check authentication
        order = Order(user, items)
        return order

# Orchestration layer decides when to combine features
def checkout(user, password, items):
    user.authenticate(password)  # Feature 1
    order = order_service.create_order(user, items)  # Feature 2
    # Features are independent, combined by orchestration
```

### Testing for Orthogonality

1. **Unit Test Independence**: Can you test each module without mocking 10 other modules?
2. **Change Impact Analysis**: Use git history to find files frequently changed together
3. **Bug Localization**: When a bug occurs, is it confined to one module?

### Benefits of Orthogonality

- **Productivity**: Changes are localized, faster development
- **Risk Reduction**: Bugs are isolated, easier to fix
- **Testing**: Components can be tested independently
- **Reusability**: Orthogonal components can be reused in different contexts

## 5. Data Structure Design

**Definition**: Appropriate choice and design of data structures to represent domain concepts.

**Source**: *Code Complete* Ch. 10 "General Issues in Using Variables"

### What to Check

- Are complex structures documented?
- Are primitives wrapped in meaningful types (avoiding Primitive Obsession)?
- Are data invariants enforced?

### Red Flags

- **Primitive Obsession**: Using strings/ints instead of small objects
  ```python
  # Bad: Status as string (no validation)
  order_status = "pending"  # Could be typo: "pendng"
  
  # Good: Status as enum
  class OrderStatus(Enum):
      PENDING = "pending"
      PROCESSING = "processing"
      SHIPPED = "shipped"
  ```

- **Parallel Arrays**: Related data in separate arrays instead of single structure
  ```python
  # Bad: Parallel arrays (easy to get out of sync)
  names = ["Alice", "Bob", "Charlie"]
  ages = [30, 25, 35]
  emails = ["alice@example.com", "bob@example.com"]  # Oops! Out of sync
  
  # Good: Single structure
  users = [
      User("Alice", 30, "alice@example.com"),
      User("Bob", 25, "bob@example.com"),
      User("Charlie", 35, "charlie@example.com")
  ]
  ```

- **Stringly-Typed**: Overuse of strings for structured data
  ```python
  # Bad: Address as string (hard to parse, validate)
  address = "123 Main St, Springfield, IL, 62701"
  
  # Good: Address as structure
  class Address:
      street: str
      city: str
      state: str
      zip_code: str
  ```

### Examples

**Bad: Poor Data Structure**
```python
# User data as dictionary (no validation, no type safety)
user = {
    "id": "123",
    "name": "Alice",
    "email": "alice@example.com",
    "status": "actve",  # Typo! No validation
    "created": "2024-01-15"  # String date (hard to compare)
}
```

**Good: Well-Designed Data Structure**
```python
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

@dataclass
class User:
    id: str
    name: str
    email: str
    status: UserStatus
    created: datetime
    
    def __post_init__(self):
        # Enforce invariants
        if not self.email or "@" not in self.email:
            raise ValueError("Invalid email")
        if len(self.name) < 2:
            raise ValueError("Name too short")
```

## Summary Checklist

When evaluating STRUCTURE, check:

- [ ] **Coupling**: Modules have < 10 imports, no circular dependencies
- [ ] **Cohesion**: Each module describable in one sentence without "and"
- [ ] **Abstraction**: No mixing of high-level business logic with low-level SQL/file I/O
- [ ] **Orthogonality**: Changes to Feature A don't break Feature B
- [ ] **Data Structures**: No primitive obsession, no parallel arrays, invariants enforced

## Further Reading

- *The Pragmatic Programmer* Ch. 7 "Orthogonality"
- *Code Complete* Ch. 5 "Design in Construction"
- *Clean Code* Ch. 3 "Functions" (Abstraction Levels)
- *Code Complete* Ch. 10 "General Issues in Using Variables" (Data Structures)
