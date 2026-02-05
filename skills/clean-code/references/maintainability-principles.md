# Maintainability Principles

Principles for evaluating how safely and easily code can be changed over time.

## 1. DRY Principle (Don't Repeat Yourself)

**Definition**: Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

**Source**: *The Pragmatic Programmer* Ch. 9 "The Evils of Duplication"

### What to Check

- Are there copy-pasted code blocks?
- Can repeated patterns be abstracted?
- Is knowledge duplicated across layers (database schema, API models, UI forms)?

### Types of Duplication

1. **Imposed Duplication**: Environment requires duplication
   - Multiple programming languages (backend/frontend)
   - Documentation synced with code
   - **Solution**: Code generation, single source of truth

2. **Inadvertent Duplication**: Developers don't realize they're duplicating
   - Parallel class hierarchies
   - Duplicate business rules in different modules
   - **Solution**: Refactor to shared abstraction

3. **Impatient Duplication**: Developers take shortcuts (copy-paste)
   - "Just this once" becomes standard practice
   - Deadline pressure leads to duplication
   - **Solution**: Refactor immediately, don't accrue duplication debt

4. **Interdeveloper Duplication**: Multiple developers duplicate unknowingly
   - Lack of communication
   - Poor code discovery
   - **Solution**: Code reviews, shared libraries

### Red Flags

1. **Copy-Paste with Small Variations**
   ```python
   # Bad: Duplicate validation logic
   def validate_user_email(email):
       if not email or "@" not in email:
           raise ValueError("Invalid email")
   
   def validate_contact_email(email):
       if not email or "@" not in email:
           raise ValueError("Invalid email")
   
   def validate_admin_email(email):
       if not email or "@" not in email:
           raise ValueError("Invalid email")
   ```

2. **Repeated Business Rules**
   ```python
   # Bad: Tax calculation duplicated
   # In orders.py
   tax = subtotal * 0.1
   
   # In invoices.py
   tax = amount * 0.1
   
   # In reports.py
   tax = total * 0.1
   ```

3. **Duplicate Data Structures**
   ```python
   # Bad: User representation duplicated
   # In database/models.py
   class UserRecord:
       id: int
       name: str
       email: str
   
   # In api/schemas.py
   class UserResponse:
       id: int
       name: str
       email: str
   
   # In ui/types.ts
   interface User {
       id: number;
       name: string;
       email: string;
   }
   ```

### Examples

**Bad: DRY Violation**
```python
# Discount calculation duplicated 3 times
class OrderService:
    def apply_student_discount(self, order):
        if order.total > 100:
            discount = order.total * 0.15
        else:
            discount = order.total * 0.10
        return order.total - discount
    
    def apply_senior_discount(self, order):
        if order.total > 100:
            discount = order.total * 0.15
        else:
            discount = order.total * 0.10
        return order.total - discount
    
    def apply_military_discount(self, order):
        if order.total > 100:
            discount = order.total * 0.15
        else:
            discount = order.total * 0.10
        return order.total - discount
```

**Good: DRY Applied**
```python
class DiscountPolicy:
    def __init__(self, standard_rate, bulk_rate, bulk_threshold):
        self.standard_rate = standard_rate
        self.bulk_rate = bulk_rate
        self.bulk_threshold = bulk_threshold
    
    def calculate(self, amount):
        rate = self.bulk_rate if amount > self.bulk_threshold else self.standard_rate
        return amount * rate

# Single discount logic, multiple configurations
STUDENT_DISCOUNT = DiscountPolicy(0.10, 0.15, 100)
SENIOR_DISCOUNT = DiscountPolicy(0.10, 0.15, 100)
MILITARY_DISCOUNT = DiscountPolicy(0.10, 0.15, 100)

def apply_discount(order, policy):
    discount = policy.calculate(order.total)
    return order.total - discount
```

### When Duplication is Acceptable

- **Coincidental Similarity**: Code looks similar but represents different concepts
  ```python
  # Not duplication: Different domains
  def validate_email(email): ...  # User authentication
  def validate_recipient(email): ...  # Email sending (different rules)
  ```

- **Performance Optimization**: Intentional duplication for speed (document reason!)
  ```python
  # Acceptable: Denormalized for performance
  # Cache frequently accessed data to avoid joins (see ADR-042)
  ```

## 2. Single Responsibility Principle (SRP)

**Definition**: A class should have one, and only one, reason to change.

**Source**: *Clean Code* Ch. 10 "Classes" (SOLID Principles)

### What to Check

- Can you describe the class/function in one sentence without using "and"?
- Does it have one reason to change?
- Does it depend on one actor (stakeholder)?

### Red Flags

1. **Multiple Reasons to Change**
   ```python
   # Bad: Changes if business logic changes OR if database changes OR if UI changes
   class Employee:
       def calculate_pay(self): ...  # Business logic (CFO cares)
       def save(self): ...  # Persistence (CTO cares)
       def report_hours(self): ...  # Reporting (COO cares)
   ```

2. **"Manager" or "Util" Classes**
   ```python
   # Bad: Vague responsibility
   class OrderManager:
       def create_order(self): ...
       def validate_payment(self): ...
       def send_email(self): ...
       def generate_invoice(self): ...
       def update_inventory(self): ...
   ```

3. **God Objects**
   ```python
   # Bad: 50+ methods, 1000+ lines
   class Application:
       # Does everything!
   ```

### Examples

**Bad: Multiple Responsibilities**
```python
class Employee:
    def __init__(self, name, salary, hours_worked):
        self.name = name
        self.salary = salary
        self.hours_worked = hours_worked
    
    # Responsibility 1: Business logic
    def calculate_pay(self):
        return self.salary + self.overtime_pay()
    
    def overtime_pay(self):
        overtime_hours = max(0, self.hours_worked - 40)
        return overtime_hours * self.salary / 40 * 1.5
    
    # Responsibility 2: Persistence
    def save(self):
        db.execute("INSERT INTO employees VALUES (...)")
    
    # Responsibility 3: Reporting
    def generate_report(self):
        return f"Employee: {self.name}\nHours: {self.hours_worked}\nPay: {self.calculate_pay()}"
```

**Good: Single Responsibility**
```python
# Responsibility 1: Business logic
class PayrollCalculator:
    def calculate_pay(self, employee):
        regular_pay = employee.salary
        overtime_pay = self.calculate_overtime(employee.hours_worked, employee.salary)
        return regular_pay + overtime_pay
    
    def calculate_overtime(self, hours_worked, salary):
        overtime_hours = max(0, hours_worked - 40)
        return overtime_hours * salary / 40 * 1.5

# Responsibility 2: Persistence
class EmployeeRepository:
    def save(self, employee):
        db.execute("INSERT INTO employees VALUES (...)")
    
    def find_by_id(self, id):
        return db.query("SELECT * FROM employees WHERE id = ?", id)

# Responsibility 3: Reporting
class EmployeeReportGenerator:
    def __init__(self, payroll_calculator):
        self.calculator = payroll_calculator
    
    def generate(self, employee):
        pay = self.calculator.calculate_pay(employee)
        return f"Employee: {employee.name}\nHours: {employee.hours_worked}\nPay: {pay}"
```

## 3. Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension, but closed for modification.

**Source**: *Clean Code* Ch. 10 "Classes" (SOLID Principles)

### What to Check

- Can new features be added via new classes/functions, not edits to existing code?
- Are abstractions (interfaces/protocols) used to enable extension?
- Is behavior controlled by data/configuration instead of code changes?

### Red Flags

1. **Switch/Case on Type Codes**
   ```python
   # Bad: Adding new shape requires modifying existing code
   def calculate_area(shape):
       if shape.type == "circle":
           return 3.14 * shape.radius ** 2
       elif shape.type == "rectangle":
           return shape.width * shape.height
       elif shape.type == "triangle":
           return 0.5 * shape.base * shape.height
       # Adding square requires editing this function!
   ```

2. **If-Else Chains for Extensibility**
   ```python
   # Bad: Adding payment method requires editing process_payment
   def process_payment(payment):
       if payment.method == "credit_card":
           # Credit card logic
       elif payment.method == "paypal":
           # PayPal logic
       elif payment.method == "bitcoin":  # New: must modify function
           # Bitcoin logic
   ```

### Examples

**Bad: Closed for Extension**
```python
class DiscountCalculator:
    def calculate(self, customer, amount):
        if customer.type == "regular":
            return amount * 0.0
        elif customer.type == "premium":
            return amount * 0.1
        elif customer.type == "vip":
            return amount * 0.2
        # Adding "enterprise" requires modifying this class!
```

**Good: Open for Extension**
```python
# Abstract base
class DiscountPolicy(ABC):
    @abstractmethod
    def calculate(self, amount):
        pass

# Concrete implementations (can add new ones without modifying existing code)
class NoDiscount(DiscountPolicy):
    def calculate(self, amount):
        return 0

class PercentageDiscount(DiscountPolicy):
    def __init__(self, rate):
        self.rate = rate
    
    def calculate(self, amount):
        return amount * self.rate

class TieredDiscount(DiscountPolicy):
    def __init__(self, thresholds):
        self.thresholds = thresholds
    
    def calculate(self, amount):
        for threshold, rate in self.thresholds:
            if amount >= threshold:
                return amount * rate
        return 0

# Usage (closed for modification)
class Customer:
    def __init__(self, name, discount_policy):
        self.name = name
        self.discount = discount_policy
    
    def calculate_discount(self, amount):
        return self.discount.calculate(amount)

# Can add new discount types without modifying Customer class
enterprise_discount = TieredDiscount([(10000, 0.25), (5000, 0.15), (0, 0.10)])
enterprise_customer = Customer("ACME Corp", enterprise_discount)
```

## 4. Error Handling

**Definition**: Errors should be handled cleanly with exceptions, meaningful messages, and guaranteed cleanup.

**Source**: *Clean Code* Ch. 7 "Error Handling"

### What to Check

- Are exceptions used (not error codes or null returns)?
- Are error messages informative?
- Is cleanup guaranteed (finally blocks, context managers, RAII)?

### Red Flags

1. **Swallowed Exceptions**
   ```python
   # Bad: Silent failure
   try:
       process_order(order)
   except:
       pass  # Error lost!
   ```

2. **Returning Null/None**
   ```python
   # Bad: Caller must check for None (easy to forget)
   def find_user(id):
       if id in users:
           return users[id]
       return None  # Caller might forget to check
   
   # Causes NoneType error later
   user = find_user(123)
   print(user.name)  # Boom! if user is None
   ```

3. **Error Codes**
   ```python
   # Bad: Magic error codes
   result = save_user(user)
   if result == -1:  # What does -1 mean?
       # Handle error
   ```

4. **Missing Cleanup**
   ```python
   # Bad: File not closed if error occurs
   f = open("data.txt")
   data = process(f.read())  # If this raises, file never closed
   f.close()
   ```

### Examples

**Bad: Poor Error Handling**
```python
def save_order(order):
    # Error codes instead of exceptions
    if not validate(order):
        return -1  # What does -1 mean?
    
    # Swallowed exception
    try:
        db.save(order)
    except:
        return -2  # Error lost, no details
    
    # Resource leak if error occurs
    f = open("orders.log", "a")
    f.write(f"Saved {order.id}\n")
    f.close()  # Never reached if write() fails
    
    return 0  # Success
```

**Good: Clean Error Handling**
```python
class OrderValidationError(Exception):
    """Raised when order fails validation"""
    pass

class OrderPersistenceError(Exception):
    """Raised when order cannot be saved to database"""
    pass

def save_order(order):
    # Validate with meaningful exception
    if not validate(order):
        raise OrderValidationError(
            f"Order {order.id} failed validation: {order.validation_errors}"
        )
    
    # Let database errors propagate (with context)
    try:
        db.save(order)
    except DatabaseError as e:
        raise OrderPersistenceError(
            f"Failed to save order {order.id}: {e}"
        ) from e
    
    # Guaranteed cleanup with context manager
    with open("orders.log", "a") as f:
        f.write(f"Saved {order.id}\n")
    
    # No error code needed - exceptions handle errors
```

### Exception Hierarchy

Create specific exceptions for different error types:

```python
# Base exception for domain
class OrderError(Exception):
    """Base class for order-related errors"""
    pass

# Specific exceptions
class OrderNotFoundError(OrderError):
    """Order does not exist"""
    pass

class OrderValidationError(OrderError):
    """Order data is invalid"""
    pass

class OrderProcessingError(OrderError):
    """Order cannot be processed"""
    pass

# Usage
try:
    order = find_order(order_id)
except OrderNotFoundError:
    # Specific handling for not found
    return 404
except OrderError:
    # General handling for other order errors
    return 500
```

### Guaranteed Cleanup Patterns

**Python: Context Managers**
```python
with open("file.txt") as f:  # Guaranteed close
    data = f.read()

with database.transaction() as txn:  # Guaranteed commit/rollback
    txn.execute("INSERT ...")
```

**Try-Finally**
```python
resource = acquire_resource()
try:
    use_resource(resource)
finally:
    release_resource(resource)  # Always executed
```

## 5. Liskov Substitution Principle (LSP)

**Definition**: Subtypes must be substitutable for their base types without altering program correctness.

**Source**: *Clean Code* Ch. 10 "Classes" (SOLID Principles)

### What to Check

- Can you replace parent class with subclass without breaking code?
- Do subclasses honor parent's contract (preconditions, postconditions, invariants)?

### Red Flags

1. **Strengthening Preconditions**
   ```python
   # Bad: Subclass requires more than parent
   class Bird:
       def fly(self, altitude):
           # Accepts any altitude
           pass
   
   class Eagle(Bird):
       def fly(self, altitude):
           if altitude < 1000:
               raise ValueError("Eagles only fly high!")  # Stricter than parent
   ```

2. **Weakening Postconditions**
   ```python
   # Bad: Subclass returns less than parent promises
   class Repository:
       def find_by_id(self, id) -> User:
           # Promises to return User
           return users[id]
   
   class CachedRepository(Repository):
       def find_by_id(self, id) -> Optional[User]:
           return cache.get(id)  # Returns None if not cached (breaks contract)
   ```

3. **Type Checking in Client Code**
   ```python
   # Bad: Clients must check type (LSP violation)
   def process_shape(shape):
       if isinstance(shape, Square):
           # Special handling for Square
       else:
           # General handling
   ```

### Examples

**Bad: LSP Violation (Classic Rectangle/Square)**
```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def set_width(self, width):
        self.width = width
    
    def set_height(self, height):
        self.height = height

class Square(Rectangle):
    def set_width(self, width):
        self.width = width
        self.height = width  # Violates Rectangle's behavior!
    
    def set_height(self, height):
        self.width = height
        self.height = height  # Violates Rectangle's behavior!

# Test breaks with Square (LSP violation)
def test_rectangle(rect):
    rect.set_width(5)
    rect.set_height(4)
    assert rect.width * rect.height == 20  # Passes for Rectangle, FAILS for Square!

test_rectangle(Rectangle(0, 0))  # OK
test_rectangle(Square(0, 0))  # FAILS! (LSP violation)
```

**Good: LSP Compliant**
```python
class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height

class Square(Shape):
    def __init__(self, side):
        self.side = side
    
    def area(self):
        return self.side ** 2

# No inheritance relationship = no LSP violation
# Both implement Shape interface correctly
```

## Summary Checklist

When evaluating MAINTAINABILITY, check:

- [ ] **DRY**: No copy-pasted logic, < 5% duplication (jscpd)
- [ ] **SRP**: Each class/function has one reason to change
- [ ] **OCP**: New features added via new classes, not modifying existing code
- [ ] **Error Handling**: Exceptions (not error codes), meaningful messages, guaranteed cleanup
- [ ] **LSP**: Subclasses substitutable for parents without breaking behavior

## Further Reading

- *The Pragmatic Programmer* Ch. 9 "The Evils of Duplication"
- *Clean Code* Ch. 7 "Error Handling"
- *Clean Code* Ch. 10 "Classes" (SOLID Principles)
- *Code Complete* Ch. 8 "Defensive Programming"
