# Common Logic Bug Patterns

This reference document provides detailed examples of logic bugs across different programming languages.

## Table of Contents

1. [Control Flow Issues](#control-flow-issues)
2. [Data Handling Issues](#data-handling-issues)
3. [Concurrency Issues](#concurrency-issues)
4. [Error Handling Issues](#error-handling-issues)
5. [Algorithm Correctness Issues](#algorithm-correctness-issues)
6. [Boundary and Edge Cases](#boundary-and-edge-cases)
7. [State Management Issues](#state-management-issues)

---

## Control Flow Issues

### Off-By-One Errors

**Python - Array Index:**
```python
# INCORRECT: IndexError on last iteration
def find_adjacent_duplicates(arr):
    for i in range(len(arr)):
        if arr[i] == arr[i+1]:  # Crashes when i == len(arr)-1
            return True
    return False

# CORRECT: Stop before last element
def find_adjacent_duplicates(arr):
    for i in range(len(arr) - 1):
        if arr[i] == arr[i+1]:
            return True
    return False
```

**JavaScript - Loop Boundary:**
```javascript
// INCORRECT: Misses last element
function processArray(arr) {
    for (let i = 0; i < arr.length - 1; i++) {  // Should be < arr.length
        process(arr[i]);
    }
}

// CORRECT: Process all elements
function processArray(arr) {
    for (let i = 0; i < arr.length; i++) {
        process(arr[i]);
    }
}
```

**Java - String Substring:**
```java
// INCORRECT: StringIndexOutOfBoundsException
String substring = str.substring(0, str.length());  // Exclusive end index
String lastChar = str.substring(str.length(), str.length()+1);  // Crashes!

// CORRECT: Use proper bounds
String lastChar = str.substring(str.length() - 1);  // Or str.charAt(str.length() - 1)
```

### Incorrect Loop Termination

**Python - Infinite Loop:**
```python
# INCORRECT: Loop never terminates
i = 0
while i != 10:
    print(i)
    i += 2  # i becomes 0, 2, 4, 6, 8, 10, 12, ... (skips 10!)

# CORRECT: Use proper comparison
i = 0
while i < 10:
    print(i)
    i += 2
```

**C - Loop Condition:**
```c
// INCORRECT: Infinite loop with unsigned
unsigned int i = 10;
while (i >= 0) {  // Always true! unsigned can't be negative
    printf("%u\n", i);
    i--;
}

// CORRECT: Use signed or different condition
int i = 10;
while (i >= 0) {
    printf("%d\n", i);
    i--;
}
```

### Missing Break in Switch

**JavaScript:**
```javascript
// INCORRECT: Fall-through causes unintended behavior
function getDiscount(memberType) {
    let discount = 0;
    switch(memberType) {
        case 'gold':
            discount = 20;  // Missing break!
        case 'silver':
            discount = 10;  // Gold members get 10, not 20!
        case 'bronze':
            discount = 5;
    }
    return discount;
}

// CORRECT: Add breaks
function getDiscount(memberType) {
    let discount = 0;
    switch(memberType) {
        case 'gold':
            discount = 20;
            break;
        case 'silver':
            discount = 10;
            break;
        case 'bronze':
            discount = 5;
            break;
    }
    return discount;
}
```

### Boolean Logic Errors (De Morgan's Laws)

**Java:**
```java
// INCORRECT: Logic inverted
if (!(user.isValid() && user.isActive())) {
    // Intended: Reject if user is BOTH invalid AND inactive
    // Actual: Reject if user is EITHER invalid OR inactive
    deny();
}

// CORRECT: Apply De Morgan's law properly
if (!user.isValid() && !user.isActive()) {
    deny();
}

// Or equivalently:
if (!(user.isValid() || user.isActive())) {
    deny();
}
```

**Python:**
```python
# INCORRECT: Short-circuit prevents full evaluation
if not (x > 0 and y > 0):
    # Becomes: (x <= 0 or y <= 0)
    # May not be what you want!

# CORRECT: Be explicit
if x <= 0 or y <= 0:
    handle_non_positive()
```

---

## Data Handling Issues

### Null/Undefined Dereference

**JavaScript:**
```javascript
// INCORRECT: No null checks
function getUserEmail(userId) {
    const user = database.findUser(userId);  // May return null
    return user.profile.email.toLowerCase();  // Crash if any is null/undefined!
}

// CORRECT: Use optional chaining
function getUserEmail(userId) {
    const user = database.findUser(userId);
    return user?.profile?.email?.toLowerCase() ?? 'no-email@example.com';
}
```

**Python:**
```python
# INCORRECT: Assumes value exists
def get_config_value(key):
    return config[key].strip()  # KeyError if key doesn't exist, AttributeError if None

# CORRECT: Use get with default
def get_config_value(key):
    value = config.get(key)
    return value.strip() if value is not None else ''
```

**Java:**
```java
// INCORRECT: NullPointerException
public String formatAddress(User user) {
    return user.getAddress().getStreet() + ", " + user.getAddress().getCity();
}

// CORRECT: Null checks or Optional
public String formatAddress(User user) {
    if (user == null || user.getAddress() == null) {
        return "Address unavailable";
    }
    Address addr = user.getAddress();
    return (addr.getStreet() != null ? addr.getStreet() : "") + ", " +
           (addr.getCity() != null ? addr.getCity() : "");
}
```

### Type Coercion Bugs

**JavaScript:**
```javascript
// INCORRECT: Unexpected coercion
if (userInput == 0) {  // Matches 0, '0', false, '', null, undefined
    handleZero();
}

// CORRECT: Use strict equality
if (userInput === 0) {  // Only matches number 0
    handleZero();
}

// INCORRECT: String concatenation instead of addition
const total = form.price + form.tax;  // "100" + "20" = "10020"

// CORRECT: Parse numbers first
const total = parseFloat(form.price) + parseFloat(form.tax);  // 120
```

### Integer Overflow

**Java:**
```java
// INCORRECT: Silent overflow
public int calculateTotal(int price, int quantity) {
    return price * quantity;  // Overflows for large values
}

// CORRECT: Use long and check bounds
public int calculateTotal(int price, int quantity) {
    long result = (long)price * (long)quantity;
    if (result > Integer.MAX_VALUE) {
        throw new ArithmeticException("Total exceeds maximum integer value");
    }
    return (int)result;
}
```

**C:**
```c
// INCORRECT: Signed integer overflow (undefined behavior)
int a = INT_MAX;
int b = a + 1;  // Undefined behavior!

// CORRECT: Check before operation
if (a > INT_MAX - 1) {
    handle_overflow();
} else {
    int b = a + 1;
}
```

### Floating Point Precision

**Python:**
```python
# INCORRECT: Direct equality comparison
total = 0.0
for i in range(10):
    total += 0.1

if total == 1.0:  # May fail due to precision errors
    print("Equal")

# CORRECT: Use tolerance
import math
if math.isclose(total, 1.0, rel_tol=1e-9):
    print("Equal")
```

**JavaScript:**
```javascript
// INCORRECT: Precision loss
const result = 0.1 + 0.2;  // 0.30000000000000004
if (result === 0.3) {  // False!
    console.log("Equal");
}

// CORRECT: Use epsilon comparison
const EPSILON = 1e-10;
if (Math.abs(result - 0.3) < EPSILON) {
    console.log("Equal");
}
```

### Uninitialized Variables

**C:**
```c
// INCORRECT: Reading uninitialized variable
int compute() {
    int result;  // Uninitialized!
    if (someCondition) {
        result = 42;
    }
    return result;  // Undefined if someCondition is false
}

// CORRECT: Initialize variables
int compute() {
    int result = 0;  // Default value
    if (someCondition) {
        result = 42;
    }
    return result;
}
```

---

## Concurrency Issues

### Race Conditions

**Python:**
```python
# INCORRECT: Check-then-act race condition
if os.path.exists(filepath):
    with open(filepath, 'r') as f:  # File might be deleted between check and open
        data = f.read()

# CORRECT: EAFP (Easier to Ask Forgiveness than Permission)
try:
    with open(filepath, 'r') as f:
        data = f.read()
except FileNotFoundError:
    handle_missing_file()
```

**Java:**
```java
// INCORRECT: Race condition in counter
public class Counter {
    private int count = 0;
    
    public void increment() {
        count++;  // Not atomic! Read-modify-write can be interleaved
    }
}

// CORRECT: Use AtomicInteger or synchronization
public class Counter {
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet();
    }
}
```

### Deadlocks

**Java:**
```java
// INCORRECT: Potential deadlock
public void transfer(Account from, Account to, int amount) {
    synchronized(from) {
        synchronized(to) {  // Thread A: from=acct1, to=acct2
            from.debit(amount);  // Thread B: from=acct2, to=acct1
            to.credit(amount);   // Deadlock!
        }
    }
}

// CORRECT: Always acquire locks in consistent order
public void transfer(Account from, Account to, int amount) {
    Account first = from.getId() < to.getId() ? from : to;
    Account second = from.getId() < to.getId() ? to : from;
    
    synchronized(first) {
        synchronized(second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

### Missing Synchronization

**Java:**
```java
// INCORRECT: Shared mutable state without synchronization
public class SharedData {
    private Map<String, String> cache = new HashMap<>();
    
    public void put(String key, String value) {
        cache.put(key, value);  // Not thread-safe!
    }
}

// CORRECT: Use concurrent collection or synchronization
public class SharedData {
    private ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
    
    public void put(String key, String value) {
        cache.put(key, value);
    }
}
```

---

## Error Handling Issues

### Swallowed Exceptions

**Python:**
```python
# INCORRECT: Silent failure
try:
    result = risky_operation()
except Exception:
    pass  # Ignores all errors!

# CORRECT: Log and handle appropriately
try:
    result = risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    result = default_value
```

**Java:**
```java
// INCORRECT: Catching too broad
try {
    processData(input);
} catch (Exception e) {
    // Catches RuntimeException, IOException, everything!
    return null;
}

// CORRECT: Catch specific exceptions
try {
    processData(input);
} catch (IOException e) {
    logger.error("I/O error", e);
    throw new DataProcessingException("Failed to process", e);
} catch (ValidationException e) {
    return ValidationResult.invalid(e.getMessage());
}
```

### Resource Leaks

**Python:**
```python
# INCORRECT: File not closed on exception
def read_config(path):
    file = open(path)
    data = parse(file.read())  # If parse() throws, file never closed
    file.close()
    return data

# CORRECT: Use context manager
def read_config(path):
    with open(path) as file:
        data = parse(file.read())
    return data
```

**Java:**
```java
// INCORRECT: Connection leak on exception
public void queryDatabase(String sql) throws SQLException {
    Connection conn = getConnection();
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(sql);  // If exception, conn/stmt leaked
    processResults(rs);
    rs.close();
    stmt.close();
    conn.close();
}

// CORRECT: Use try-with-resources
public void queryDatabase(String sql) throws SQLException {
    try (Connection conn = getConnection();
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery(sql)) {
        processResults(rs);
    }  // All resources closed automatically
}
```

### Missing Error Checks

**C:**
```c
// INCORRECT: Ignoring return value
FILE *file = fopen(path, "r");
fread(buffer, size, 1, file);  // Crashes if fopen failed!
fclose(file);

// CORRECT: Check for errors
FILE *file = fopen(path, "r");
if (file == NULL) {
    perror("Failed to open file");
    return -1;
}
size_t read = fread(buffer, size, 1, file);
if (read != 1) {
    perror("Failed to read file");
    fclose(file);
    return -1;
}
fclose(file);
```

---

## Algorithm Correctness Issues

### Incorrect Recursion

**Python:**
```python
# INCORRECT: Missing base case
def factorial(n):
    return n * factorial(n - 1)  # Stack overflow!

# CORRECT: Add base case
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

**JavaScript:**
```javascript
// INCORRECT: Wrong reduction
function sum(arr, index = 0) {
    if (index >= arr.length) return 0;
    return arr[index] + sum(arr, index + 1);  // Missing index increment on one path
}

// CORRECT: Proper recursion
function sum(arr, index = 0) {
    if (index >= arr.length) return 0;
    return arr[index] + sum(arr, index + 1);
}
```

### Wrong Data Structure

**Python:**
```python
# INCORRECT: O(n) lookup in list
users = []  # List
def find_user(user_id):
    for user in users:  # O(n) for each lookup
        if user.id == user_id:
            return user

# CORRECT: O(1) lookup in dict
users = {}  # Dict with user_id as key
def find_user(user_id):
    return users.get(user_id)  # O(1) lookup
```

### Incorrect Assumptions

**JavaScript:**
```javascript
// INCORRECT: Assumes array is sorted
function binarySearch(arr, target) {
    // Binary search only works on sorted arrays!
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// CORRECT: Document or enforce precondition
/**
 * Binary search. PRECONDITION: arr must be sorted in ascending order.
 */
function binarySearch(arr, target) {
    if (!isSorted(arr)) {
        throw new Error("Array must be sorted for binary search");
    }
    // ... rest of implementation
}
```

---

## Boundary and Edge Cases

### Empty Collection Handling

**Python:**
```python
# INCORRECT: Assumes non-empty
def get_average(numbers):
    return sum(numbers) / len(numbers)  # ZeroDivisionError if empty!

# CORRECT: Handle empty case
def get_average(numbers):
    if not numbers:
        return 0  # Or raise ValueError, depending on requirements
    return sum(numbers) / len(numbers)
```

### Min/Max Value Handling

**Java:**
```java
// INCORRECT: Integer.MIN_VALUE edge case
public int abs(int value) {
    return value < 0 ? -value : value;
}
// abs(Integer.MIN_VALUE) = Integer.MIN_VALUE (overflow!)

// CORRECT: Handle MIN_VALUE
public int abs(int value) {
    if (value == Integer.MIN_VALUE) {
        throw new ArithmeticException("Cannot compute absolute value of MIN_VALUE");
    }
    return value < 0 ? -value : value;
}
```

### Special Values

**JavaScript:**
```javascript
// INCORRECT: Doesn't handle NaN
function add(a, b) {
    return a + b;  // NaN + 5 = NaN propagates silently
}

// CORRECT: Validate inputs
function add(a, b) {
    if (Number.isNaN(a) || Number.isNaN(b)) {
        throw new Error("Cannot add NaN values");
    }
    return a + b;
}
```

**Python:**
```python
# INCORRECT: Division by zero not handled
def divide(a, b):
    return a / b  # ZeroDivisionError!

# CORRECT: Handle zero
def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

---

## State Management Issues

### Initialization Order

**JavaScript:**
```javascript
// INCORRECT: Using uninitialized dependency
class DataService {
    constructor() {
        this.cache = new Cache(this.config);  // this.config undefined!
        this.config = loadConfig();
    }
}

// CORRECT: Initialize dependencies first
class DataService {
    constructor() {
        this.config = loadConfig();
        this.cache = new Cache(this.config);
    }
}
```

### Stale State

**React (JavaScript):**
```javascript
// INCORRECT: Closure captures stale state
function Counter() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count + 1);  // Always uses initial count (0)!
        }, 1000);
        return () => clearInterval(timer);
    }, []);  // Empty deps = stale closure
    
    return <div>{count}</div>;
}

// CORRECT: Use functional update
function Counter() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCount(c => c + 1);  // Uses current state
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    return <div>{count}</div>;
}
```

### Missing State Validation

**Python:**
```python
# INCORRECT: No invariant checking
class BankAccount:
    def __init__(self, balance):
        self.balance = balance
    
    def withdraw(self, amount):
        self.balance -= amount  # Can go negative!

# CORRECT: Enforce invariants
class BankAccount:
    def __init__(self, balance):
        if balance < 0:
            raise ValueError("Initial balance cannot be negative")
        self._balance = balance
    
    @property
    def balance(self):
        return self._balance
    
    def withdraw(self, amount):
        if amount < 0:
            raise ValueError("Withdrawal amount must be positive")
        if self._balance < amount:
            raise ValueError("Insufficient funds")
        self._balance -= amount
```

---

## Summary

This reference guide covers common logic bugs across seven categories:

1. **Control Flow**: Off-by-one, infinite loops, missing breaks, boolean logic
2. **Data Handling**: Null checks, type coercion, overflows, floating point
3. **Concurrency**: Race conditions, deadlocks, synchronization
4. **Error Handling**: Swallowed exceptions, resource leaks, missing checks
5. **Algorithm Correctness**: Recursion, data structures, assumptions
6. **Boundary Cases**: Empty collections, min/max values, special values
7. **State Management**: Initialization order, stale state, invariants

When analyzing code for logic bugs, systematically check each category and look for patterns similar to the examples above.
