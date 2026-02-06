# Code Smells Catalog

Complete catalog of code smells from Martin Fowler's "Refactoring" with detection criteria and refactoring strategies.

**Source**: *Refactoring: Improving the Design of Existing Code* Ch. 3 "Bad Smells in Code"

## Bloaters

Smells that indicate code has grown too large or complex.

### 1. Long Method

**Description**: A method that's too long to understand easily.

**Detection**:
- Function > 50 lines (red flag)
- Function > 100 lines (critical)
- Use `lizard` to measure

**Symptoms**:
- Scrolling required to see entire method
- Section comments ("// Validation", "// Calculation")
- Multiple levels of abstraction mixed
- Hard to name

**Example (Python)**:
```python
# BAD: 80 lines, CCN 15
def process_order(order_id, user_id, items, payment, shipping):
    # Validation section (15 lines)
    if not order_id or not user_id:
        raise ValueError("Missing required fields")
    if not items or len(items) == 0:
        raise ValueError("No items")
    for item in items:
        if item.quantity <= 0:
            raise ValueError(f"Invalid quantity: {item.name}")
        if item.price < 0:
            raise ValueError(f"Invalid price: {item.name}")
    # ... more validation
    
    # Calculate totals (20 lines)
    subtotal = 0
    for item in items:
        subtotal += item.price * item.quantity
    tax_rate = get_tax_rate(shipping.state)
    tax = subtotal * tax_rate
    shipping_cost = calculate_shipping(items, shipping)
    total = subtotal + tax + shipping_cost
    # ... more calculation
    
    # Process payment (25 lines)
    # ... payment logic
    
    # Update inventory (15 lines)
    # ... inventory logic
    
    # Send confirmation (10 lines)
    # ... email logic

# GOOD: Extracted methods (each < 20 lines, CCN < 5)
def process_order(order_id, user_id, items, payment, shipping):
    validate_order_inputs(order_id, user_id, items)
    totals = calculate_order_totals(items, shipping)
    payment_result = process_payment(totals, payment)
    update_inventory(items)
    send_order_confirmation(user_id, order_id, totals)
    return create_order_record(order_id, totals, payment_result)
```

**Refactoring**: Extract Method

---

### 2. Large Class

**Description**: A class trying to do too much.

**Detection**:
- Class > 300 lines (red flag)
- Class > 500 lines (critical)
- Class with > 10 public methods
- Class with > 15 instance variables

**Symptoms**:
- Hard to understand class's purpose
- Multiple responsibilities
- Many private helper methods
- Difficult to test

**Example (Python)**:
```python
# BAD: 687 lines, 18 methods, multiple responsibilities
class OrderService:
    # Validation methods
    def validate_items(self): ...
    def validate_payment(self): ...
    def validate_shipping(self): ...
    
    # Calculation methods
    def calculate_tax(self): ...
    def calculate_shipping(self): ...
    def calculate_total(self): ...
    
    # Payment methods
    def charge_credit_card(self): ...
    def process_paypal(self): ...
    
    # Inventory methods
    def check_stock(self): ...
    def reserve_items(self): ...
    def update_inventory(self): ...
    
    # Notification methods
    def send_confirmation_email(self): ...
    def send_shipping_notification(self): ...
    
    # Persistence methods
    def save_order(self): ...
    def load_order(self): ...
    
    # Reporting methods
    def generate_invoice(self): ...
    def generate_receipt(self): ...

# GOOD: Split into focused classes
class OrderValidator: ...  # 3 methods, 50 lines
class OrderCalculator: ...  # 3 methods, 80 lines
class PaymentProcessor: ...  # 2 methods, 120 lines
class InventoryManager: ...  # 3 methods, 90 lines
class OrderNotifier: ...  # 2 methods, 60 lines
class OrderRepository: ...  # 2 methods, 70 lines
class OrderReportGenerator: ...  # 2 methods, 100 lines
```

**Refactoring**: Extract Class, Extract Subclass

---

### 3. Long Parameter List

**Description**: Too many parameters make functions hard to understand and use.

**Detection**:
- Function with 4+ parameters (red flag)
- Function with 6+ parameters (critical)
- Use `lizard --arguments 3`

**Symptoms**:
- Hard to remember parameter order
- Easy to pass arguments in wrong order
- Many test combinations

**Example (Python)**:
```python
# BAD: 7 parameters
def create_user(name, email, password, age, country, city, newsletter_opt_in):
    ...

# Caller must remember order (error-prone)
create_user("Alice", "alice@example.com", "pass123", 30, "US", "NYC", True)

# GOOD: Parameter object
@dataclass
class UserRegistration:
    name: str
    email: str
    password: str
    age: int
    country: str
    city: str
    newsletter_opt_in: bool

def create_user(registration: UserRegistration):
    ...

# Caller uses named fields (self-documenting)
create_user(UserRegistration(
    name="Alice",
    email="alice@example.com",
    password="pass123",
    age=30,
    country="US",
    city="NYC",
    newsletter_opt_in=True
))
```

**Refactoring**: Introduce Parameter Object, Preserve Whole Object

---

### 4. Primitive Obsession

**Description**: Using primitives (strings, ints) instead of small objects for domain concepts.

**Detection**:
- Status represented as string ("pending", "active")
- Money represented as float
- Addresses represented as strings
- Repeated validation of same primitive type

**Example (Python)**:
```python
# BAD: Status as string (no validation, no type safety)
order_status = "pending"  # Could be typo: "pendng"
if order_status == "shipped":  # Magic string

# BAD: Money as float (precision issues)
price = 19.99
tax = price * 0.1  # 1.9990000000000001

# BAD: Address as string (hard to parse)
address = "123 Main St, Springfield, IL, 62701"

# GOOD: Value objects
class OrderStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

@dataclass
class Money:
    amount: Decimal
    currency: str
    
    def __mul__(self, rate):
        return Money(self.amount * Decimal(rate), self.currency)

@dataclass
class Address:
    street: str
    city: str
    state: str
    zip_code: str
    
    def __str__(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"

# Usage
order_status = OrderStatus.PENDING
price = Money(Decimal("19.99"), "USD")
tax = price * Decimal("0.1")
address = Address("123 Main St", "Springfield", "IL", "62701")
```

**Refactoring**: Replace Data Value with Object, Replace Type Code with Class

---

## Object-Orientation Abusers

Smells that indicate improper use of OO concepts.

### 5. Switch Statements (Type Codes)

**Description**: Using switch/case or if-else chains on type codes instead of polymorphism.

**Detection**:
- `if type == "A"` chains
- `switch(type)` statements
- Same conditional appears in multiple places

**Example (Python)**:
```python
# BAD: Switch on type
def calculate_shipping(order):
    if order.shipping_method == "standard":
        return 5.00
    elif order.shipping_method == "express":
        return 15.00
    elif order.shipping_method == "overnight":
        return 30.00
    else:
        return 0

def get_delivery_days(order):
    if order.shipping_method == "standard":
        return 7
    elif order.shipping_method == "express":
        return 3
    elif order.shipping_method == "overnight":
        return 1
    # Same conditional duplicated!

# GOOD: Polymorphism
class ShippingMethod(ABC):
    @abstractmethod
    def calculate_cost(self, order): pass
    
    @abstractmethod
    def get_delivery_days(self): pass

class StandardShipping(ShippingMethod):
    def calculate_cost(self, order):
        return 5.00
    def get_delivery_days(self):
        return 7

class ExpressShipping(ShippingMethod):
    def calculate_cost(self, order):
        return 15.00
    def get_delivery_days(self):
        return 3

class OvernightShipping(ShippingMethod):
    def calculate_cost(self, order):
        return 30.00
    def get_delivery_days(self):
        return 1

# Usage
order.shipping = ExpressShipping()
cost = order.shipping.calculate_cost(order)
days = order.shipping.get_delivery_days()
```

**Refactoring**: Replace Conditional with Polymorphism

---

### 6. Temporary Field

**Description**: Instance variables that are only set in certain circumstances.

**Detection**:
- Fields that are None most of the time
- Fields only used by one or two methods
- Fields with confusing lifecycle

**Example (Python)**:
```python
# BAD: temporary_result only used in one method
class Calculator:
    def __init__(self):
        self.temporary_result = None  # Why is this a field?
    
    def calculate(self, a, b):
        self.temporary_result = a + b
        self.temporary_result *= 2
        return self.temporary_result
    
    # temporary_result is None everywhere else!

# GOOD: Use local variable
class Calculator:
    def calculate(self, a, b):
        result = a + b
        result *= 2
        return result
```

**Refactoring**: Extract Class, Introduce Null Object

---

### 7. Refused Bequest

**Description**: Subclass inherits methods/data it doesn't need or doesn't support parent's interface.

**Detection**:
- Subclass throws "NotImplementedError" for inherited methods
- Subclass overrides to do nothing
- Subclass uses only small fraction of inherited interface

**Example (Python)**:
```python
# BAD: Stack refuses inherited methods
class List:
    def add(self, item): ...
    def remove(self, item): ...
    def get(self, index): ...
    def set(self, index, item): ...

class Stack(List):  # Inheritance doesn't fit
    def push(self, item):
        self.add(item)
    
    def pop(self):
        return self.remove(len(self) - 1)
    
    # Refuses these inherited methods
    def get(self, index):
        raise NotImplementedError("Stack doesn't support random access")
    
    def set(self, index, item):
        raise NotImplementedError("Stack doesn't support random access")

# GOOD: Composition instead of inheritance
class Stack:
    def __init__(self):
        self._items = []  # Composition
    
    def push(self, item):
        self._items.append(item)
    
    def pop(self):
        return self._items.pop()
    
    # Only exposes stack operations, no refused methods
```

**Refactoring**: Replace Inheritance with Delegation

---

## Change Preventers

Smells that make changes difficult or require changes in many places.

### 8. Divergent Change

**Description**: One class is commonly changed in different ways for different reasons.

**Detection**:
- "Every time we add a new database, we change class X"
- "Every time we add a new report, we change class X"
- Class has multiple reasons to change (SRP violation)

**Example (Python)**:
```python
# BAD: User class changes for multiple reasons
class User:
    # Changes when authentication rules change
    def authenticate(self, password): ...
    
    # Changes when database schema changes
    def save_to_database(self): ...
    
    # Changes when email templates change
    def send_welcome_email(self): ...
    
    # Changes when business rules change
    def calculate_loyalty_points(self): ...

# GOOD: Split by reason to change
class UserAuthenticator:  # Changes when auth rules change
    def authenticate(self, user, password): ...

class UserRepository:  # Changes when database changes
    def save(self, user): ...

class UserNotifier:  # Changes when email templates change
    def send_welcome_email(self, user): ...

class LoyaltyPointsCalculator:  # Changes when business rules change
    def calculate(self, user): ...
```

**Refactoring**: Extract Class

---

### 9. Shotgun Surgery

**Description**: One change requires small edits to many different classes.

**Detection**:
- "To add feature X, I need to edit 10 files"
- grep shows same pattern in many files
- Use git history to find files frequently changed together

**Example (Python)**:
```python
# BAD: Adding new payment method requires editing many files
# In orders.py
if payment_type == "paypal":
    # PayPal logic

# In invoices.py
if payment_type == "paypal":
    # PayPal logic

# In reports.py
if payment_type == "paypal":
    # PayPal logic

# In validators.py
if payment_type == "paypal":
    # PayPal logic

# Adding "stripe" requires editing ALL these files!

# GOOD: Centralize payment handling
class PaymentProcessor:
    def __init__(self):
        self.handlers = {
            "paypal": PayPalHandler(),
            "stripe": StripeHandler(),
            # Add new handler here only
        }
    
    def process(self, payment_type, amount):
        handler = self.handlers.get(payment_type)
        return handler.process(amount)

# Adding new payment method requires editing only PaymentProcessor
```

**Refactoring**: Move Method, Move Field, Inline Class

---

### 10. Parallel Inheritance Hierarchies

**Description**: Every time you add a subclass to one hierarchy, you must add a subclass to another.

**Detection**:
- Class names have matching patterns (OrderValidator/OrderProcesser)
- Subclasses appear in pairs

**Example (Python)**:
```python
# BAD: Adding new order type requires adding to BOTH hierarchies
# Hierarchy 1
class Order: pass
class ExpressOrder(Order): pass
class InternationalOrder(Order): pass

# Hierarchy 2 (parallel)
class OrderProcessor: pass
class ExpressOrderProcessor(OrderProcessor): pass
class InternationalOrderProcessor(OrderProcessor): pass

# Adding "BulkOrder" requires adding "BulkOrderProcessor" too!

# GOOD: Merge hierarchies
class Order:
    def __init__(self, processor):
        self.processor = processor
    
    def process(self):
        self.processor.process(self)

# Single hierarchy
class OrderProcessor(ABC):
    @abstractmethod
    def process(self, order): pass

class ExpressProcessor(OrderProcessor): ...
class InternationalProcessor(OrderProcessor): ...

# Adding BulkProcessor doesn't require new Order subclass
```

**Refactoring**: Move Method, Move Field

---

## Dispensables

Smells that represent unnecessary code.

### 11. Comments (Excessive/Unnecessary)

**Description**: Code that needs comments to explain what it does (not why).

**Detection**:
- Comments explaining obvious code
- Section comments marking code blocks
- Commented-out code

**Example (Python)**:
```python
# BAD: Comments explain WHAT (code already says it)
# Get the total
total = 0  # Initialize total to zero
# Loop through items
for item in items:  # For each item
    # Add item price to total
    total += item.price  # Increment total

# GOOD: Code is self-documenting, comment explains WHY
def calculate_total(items):
    # Tax calculation uses deprecated API until migration to v3 complete (JIRA-1234)
    return sum(item.price for item in items)
```

**Refactoring**: Extract Method, Rename Method, Introduce Assertion

---

### 12. Duplicate Code

**Description**: Same code structure in multiple places.

**Detection**:
- Use `jscpd` to find duplicates
- > 5% duplication is red flag
- Look for copy-paste patterns

**Example (Python)**:
```python
# BAD: Duplicate validation logic
def validate_user_email(email):
    if not email or "@" not in email or "." not in email:
        raise ValueError("Invalid email")

def validate_admin_email(email):
    if not email or "@" not in email or "." not in email:
        raise ValueError("Invalid email")

def validate_contact_email(email):
    if not email or "@" not in email or "." not in email:
        raise ValueError("Invalid email")

# GOOD: Extract common validation
def validate_email(email):
    if not email or "@" not in email or "." not in email:
        raise ValueError("Invalid email")

def validate_user_email(email):
    validate_email(email)

def validate_admin_email(email):
    validate_email(email)
```

**Refactoring**: Extract Method, Extract Class, Pull Up Method

---

### 13. Lazy Class

**Description**: A class that doesn't do enough to justify its existence.

**Detection**:
- Class with 1-2 methods
- Class with no logic (just data holder)
- Class used in only one place

**Example (Python)**:
```python
# BAD: Class does nothing
class OrderIdGenerator:
    def generate(self):
        return uuid.uuid4()

# Used only here
order_id = OrderIdGenerator().generate()

# GOOD: Inline or remove class
order_id = uuid.uuid4()  # No class needed
```

**Refactoring**: Inline Class, Collapse Hierarchy

---

### 14. Speculative Generality

**Description**: Code added for future needs that may never materialize.

**Detection**:
- Unused abstract classes
- Unused parameters "for future use"
- Overly generic interfaces with one implementation

**Example (Python)**:
```python
# BAD: Abstract interface with only one implementation (no other planned)
class PaymentProcessor(ABC):
    @abstractmethod
    def process(self, amount): pass

class CreditCardProcessor(PaymentProcessor):
    def process(self, amount):
        # Only implementation

# No other processors exist or planned!

# GOOD: Concrete class (add abstraction when second implementation appears)
class PaymentProcessor:
    def process(self, amount):
        # Direct implementation
```

**Refactoring**: Collapse Hierarchy, Inline Class, Remove Parameter

---

## Couplers

Smells that indicate excessive coupling between classes.

### 15. Feature Envy

**Description**: A method that uses another class's data more than its own.

**Detection**:
- Method calls many getters on another object
- Method uses foreign data extensively
- Method would make more sense in another class

**Example (Python)**:
```python
# BAD: Order.calculate_shipping uses ShippingAddress data extensively
class Order:
    def calculate_shipping(self):
        # Feature envy: uses address data more than order data
        if self.shipping_address.country == "US":
            if self.shipping_address.state in HAWAII_ALASKA:
                return 20.00
            elif self.shipping_address.is_po_box:
                return 15.00
            else:
                return 5.00
        elif self.shipping_address.country == "CA":
            return 10.00
        else:
            return 25.00

# GOOD: Move method to ShippingAddress
class ShippingAddress:
    def calculate_shipping_cost(self):
        if self.country == "US":
            if self.state in HAWAII_ALASKA:
                return 20.00
            elif self.is_po_box:
                return 15.00
            else:
                return 5.00
        elif self.country == "CA":
            return 10.00
        else:
            return 25.00

class Order:
    def calculate_shipping(self):
        return self.shipping_address.calculate_shipping_cost()
```

**Refactoring**: Move Method, Extract Method

---

### 16. Inappropriate Intimacy

**Description**: Two classes are too tightly coupled, accessing each other's private parts.

**Detection**:
- Classes access each other's private fields
- Bidirectional dependencies
- Classes can't be changed independently

**Example (Python)**:
```python
# BAD: Order and Customer access each other's internals
class Order:
    def calculate_discount(self):
        # Inappropriate intimacy: accesses customer internals
        if self.customer._loyalty_points > 1000:
            return self.total * 0.1
        return 0

class Customer:
    def update_loyalty_points(self, order):
        # Inappropriate intimacy: accesses order internals
        self._loyalty_points += order._subtotal * 0.01

# GOOD: Public interfaces only
class Order:
    def calculate_discount(self):
        return self.customer.get_discount_rate() * self.total

class Customer:
    def get_discount_rate(self):
        return 0.1 if self.loyalty_points > 1000 else 0
    
    def add_loyalty_points(self, amount):
        self.loyalty_points += amount
```

**Refactoring**: Move Method, Move Field, Change Bidirectional Association to Unidirectional

---

### 17. Message Chains

**Description**: Long chains of method calls (Law of Demeter violation).

**Detection**:
- `a.getB().getC().getD()`
- Multiple dots in one expression
- Tight coupling to object structure

**Example (Python)**:
```python
# BAD: Message chain
customer_country = order.get_customer().get_address().get_country()

# If Address changes, this breaks!
# If Customer changes, this breaks!

# GOOD: Hide delegate
class Order:
    def get_customer_country(self):
        return self.customer.get_country()

class Customer:
    def get_country(self):
        return self.address.country

customer_country = order.get_customer_country()
```

**Refactoring**: Hide Delegate

---

### 18. Middle Man

**Description**: Class delegates all its work to another class.

**Detection**:
- Most methods are simple delegations
- Class adds no value

**Example (Python)**:
```python
# BAD: OrderFacade delegates everything
class OrderFacade:
    def __init__(self, order_service):
        self.service = order_service
    
    def create_order(self, items):
        return self.service.create_order(items)
    
    def cancel_order(self, id):
        return self.service.cancel_order(id)
    
    def get_order(self, id):
        return self.service.get_order(id)
    
    # Just delegates everything, adds no value!

# GOOD: Use OrderService directly
order = order_service.create_order(items)
```

**Refactoring**: Remove Middle Man, Inline Method

---

## Data Clumps

### 19. Data Clumps

**Description**: Same group of 3-4 variables always appearing together.

**Detection**:
- Same parameter groups in multiple methods
- Same field groups in multiple classes
- Variables always passed/used together

**Example (Python)**:
```python
# BAD: userId, userName, userEmail always together
def authenticate(userId, userName, userEmail): ...
def create_order(userId, userName, userEmail): ...
def send_notification(userId, userName, userEmail): ...
def update_profile(userId, userName, userEmail): ...

# 8 methods with same 3 parameters!

# GOOD: Extract into object
@dataclass
class UserContext:
    id: str
    name: str
    email: str

def authenticate(user: UserContext): ...
def create_order(user: UserContext): ...
def send_notification(user: UserContext): ...
def update_profile(user: UserContext): ...
```

**Refactoring**: Extract Class, Introduce Parameter Object, Preserve Whole Object

---

## Summary

| Smell | Detection | Priority | Refactoring |
|-------|-----------|----------|-------------|
| Long Method | > 50 lines, CCN > 15 | P1 if > 100 lines | Extract Method |
| Large Class | > 300 lines, > 10 methods | P2 | Extract Class |
| Long Parameter List | > 3 params | P2 | Introduce Parameter Object |
| Primitive Obsession | Strings for status, floats for money | P2 | Replace Data Value with Object |
| Switch Statements | Type code conditionals | P2 | Replace Conditional with Polymorphism |
| Divergent Change | Multiple reasons to change | P1 | Extract Class (SRP) |
| Shotgun Surgery | One change affects 5+ files | P1 | Move Method, Move Field |
| Feature Envy | Uses other class's data | P2 | Move Method |
| Data Clumps | Same 3-4 params repeated | P2 | Introduce Parameter Object |
| Duplicate Code | > 5% duplication | P1 if > 10% | Extract Method |
| Message Chains | a.b().c().d() | P3 | Hide Delegate |
| Middle Man | All methods delegate | P4 | Remove Middle Man |
| Speculative Generality | Unused abstractions | P4 | Inline Class |

## Further Reading

- *Refactoring: Improving the Design of Existing Code* (Fowler) Ch. 3 "Bad Smells in Code"
- *Refactoring to Patterns* (Kerievsky) - Pattern-driven refactoring strategies
- *Working Effectively with Legacy Code* (Feathers) - Refactoring in constrained environments
