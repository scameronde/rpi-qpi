# Book References

Complete citations and key chapter references for the seminal software engineering books that inform the clean-code skill.

## Primary Sources

### 1. Clean Code: A Handbook of Agile Software Craftsmanship

**Author**: Robert C. Martin ("Uncle Bob")  
**Publisher**: Prentice Hall  
**Year**: 2008  
**ISBN**: 978-0132350884

**Key Chapters**:

- **Chapter 2: Meaningful Names**
  - Principles: Intention-revealing names, avoid disinformation, make meaningful distinctions, use pronounceable names, use searchable names
  - Referenced in: Readability principles (naming)

- **Chapter 3: Functions**
  - Principles: Small functions, do one thing, one level of abstraction, few arguments, no side effects, command-query separation
  - Referenced in: Readability principles (function size), Testability principles (pure functions, argument count)

- **Chapter 4: Comments**
  - Principles: Explain WHY not WHAT, good comments (legal, informative, explanation of intent, clarification, warning, TODO), bad comments (redundant, misleading, mandated, journal, noise, commented-out code)
  - Referenced in: Readability principles (comments)

- **Chapter 5: Formatting**
  - Principles: Vertical formatting (file length, vertical openness, vertical density, vertical ordering), horizontal formatting (line length, horizontal openness, indentation)
  - Referenced in: Readability principles (formatting)

- **Chapter 7: Error Handling**
  - Principles: Use exceptions not error codes, write try-catch-finally first, provide context with exceptions, define exception classes in terms of caller's needs, don't return null, don't pass null
  - Referenced in: Maintainability principles (error handling)

- **Chapter 10: Classes**
  - Principles: Class organization, classes should be small, Single Responsibility Principle, cohesion, organizing for change, Open-Closed Principle, Dependency Inversion Principle
  - Referenced in: Structure principles (cohesion), Maintainability principles (SRP, OCP, DIP)

**Core Themes**: Code readability, simplicity, craftsmanship, professionalism

---

### 2. The Pragmatic Programmer: Your Journey To Mastery (20th Anniversary Edition)

**Authors**: Andrew Hunt & David Thomas  
**Publisher**: Addison-Wesley  
**Year**: 2019 (Original: 1999)  
**ISBN**: 978-0135957059

**Key Chapters**:

- **Chapter 7: Orthogonality**
  - Principles: Independent components, eliminate effects between unrelated things, design for testability, DRY principle as foundation for orthogonality
  - Referenced in: Structure principles (orthogonality, coupling)

- **Chapter 9: The Evils of Duplication**
  - Principles: DRY (Don't Repeat Yourself), types of duplication (imposed, inadvertent, impatient, interdeveloper), make it easy to reuse
  - Referenced in: Maintainability principles (DRY)

- **Chapter 28: Decoupling**
  - Principles: Train wrecks (message chains), Law of Demeter, dependency injection, avoid global data
  - Referenced in: Testability principles (dependency injection), Code smells (message chains)

**Core Themes**: Pragmatism, reversibility, adaptability, automation, continuous learning

---

### 3. Code Complete (2nd Edition)

**Author**: Steve McConnell  
**Publisher**: Microsoft Press  
**Year**: 2004  
**ISBN**: 978-0735619678

**Key Chapters**:

- **Chapter 5: Design in Construction**
  - Principles: Manage complexity, design at different levels of abstraction, heuristics (hide implementation details, identify areas likely to change, keep coupling loose, look for common design patterns)
  - Referenced in: Structure principles (abstraction, cohesion)

- **Chapter 6: Working Classes**
  - Principles: Class foundations (Abstract Data Types), good class interfaces, design and implementation issues, reasons to create a class, cohesion, encapsulation
  - Referenced in: Structure principles (cohesion)

- **Chapter 7: High-Quality Routines**
  - Principles: Valid reasons to create a routine, design at routine level, routine names, routine parameters (limit number, pass variables in input-modify-output order), function return values
  - Referenced in: Readability principles (function size), Testability principles (argument count)

- **Chapter 10: General Issues in Using Variables**
  - Principles: Data literacy, making variable declarations easy, guidelines for initializing variables, scope, persistence, binding time, relationship between data types and control structures
  - Referenced in: Structure principles (data structure design)

- **Chapter 12: Fundamental Data Types**
  - Principles: Numbers in general, integers, floating-point numbers, characters and strings, boolean variables, enumerated types, named constants, arrays
  - Referenced in: Readability principles (magic numbers), Structure principles (primitive obsession)

- **Chapter 19: General Control Issues**
  - Principles: Boolean expressions, compound statements, null statements, taming dangerously deep nesting, control-structure warning signs
  - Referenced in: Readability principles (nesting depth)

**Core Themes**: Managing complexity, construction as central activity, evidence-based practices

---

### 4. Refactoring: Improving the Design of Existing Code (2nd Edition)

**Author**: Martin Fowler (with Kent Beck)  
**Publisher**: Addison-Wesley  
**Year**: 2018 (Original: 1999)  
**ISBN**: 978-0134757599

**Key Chapters**:

- **Chapter 3: Bad Smells in Code**
  - Catalog of 24 code smells: Long Method, Large Class, Long Parameter List, Divergent Change, Shotgun Surgery, Feature Envy, Data Clumps, Primitive Obsession, Switch Statements, Parallel Inheritance Hierarchies, Lazy Class, Speculative Generality, Temporary Field, Message Chains, Middle Man, Inappropriate Intimacy, Alternative Classes with Different Interfaces, Data Class, Refused Bequest, Comments, Duplicate Code, Dead Code, Loops
  - Referenced in: Code smells catalog (all 19 smells documented in skill)

- **Chapter 6: A First Set of Refactorings**
  - Extract Method, Inline Method, Extract Variable, Inline Variable, Change Function Declaration, Encapsulate Variable, Rename Variable, Introduce Parameter Object, Combine Functions into Class, Split Phase
  - Referenced in: Refactoring strategies for code smells

- **Chapter 7: Encapsulation**
  - Encapsulate Record, Encapsulate Collection, Replace Primitive with Object, Replace Temp with Query, Extract Class, Inline Class, Hide Delegate, Remove Middle Man, Substitute Algorithm
  - Referenced in: Refactoring strategies for primitive obsession, middle man, message chains

- **Chapter 10: Simplifying Conditional Logic**
  - Decompose Conditional, Consolidate Conditional Expression, Replace Nested Conditional with Guard Clauses, Replace Conditional with Polymorphism, Introduce Special Case, Introduce Assertion
  - Referenced in: Refactoring strategies for switch statements, nested conditionals

**Core Themes**: Incremental improvement, catalog of refactorings, preservation of behavior, testability

---

### 5. Working Effectively with Legacy Code

**Author**: Michael Feathers  
**Publisher**: Prentice Hall  
**Year**: 2004  
**ISBN**: 978-0131177052

**Key Chapters**:

- **Chapter 4: The Seam Model**
  - Principles: Seams (places where you can alter behavior without editing in that place), types of seams (object seam, preprocessing seam, link seam), enabling points
  - Referenced in: Testability principles (seams)

- **Chapter 11: I Need to Make a Change. What Methods Should I Test?**
  - Principles: Reasoning about effects, effect propagation, learning from effect analysis, simplifying effect sketches
  - Referenced in: Testability principles (observable outcomes)

- **Chapter 25: Dependency-Breaking Techniques**
  - 24 dependency-breaking techniques: Adapt Parameter, Break Out Method Object, Encapsulate Global References, Extract and Override Call, Extract Interface, Introduce Static Setter, Parameterize Constructor, Parameterize Method, Pull Up Feature, Push Down Dependency, Replace Function with Function Pointer, Replace Global Reference with Getter, Subclass and Override Method, Supersede Instance Variable, Template Redefinition, Text Redefinition
  - Referenced in: Testability principles (dependency injection, seams)

**Core Themes**: Testability in constrained environments, dependency breaking, characterization tests, making code safe to change

---

### 6. Refactoring to Patterns

**Author**: Joshua Kerievsky  
**Publisher**: Addison-Wesley  
**Year**: 2004  
**ISBN**: 978-0321213358

**Key Chapters**:

- **Chapter 1: Why I Wrote This Book**
  - Principles: Patterns as destinations for refactoring, evolutionary design, when to refactor to patterns vs when not to
  - Referenced in: Code smells (speculative generality), Maintainability principles (pattern appropriateness)

- **Chapter 3: Code Smells**
  - Extended catalog of smells with pattern solutions: Alternative Classes with Different Interfaces, Combinatorial Explosion, Conditional Complexity, Duplicated Code, Indecent Exposure, Large Class, Lazy Class, Long Method, Oddball Solution, Primitive Obsession, Solution Sprawl, Speculative Generality, Switch Statements, Uncommunicative Name
  - Referenced in: Code smells catalog

- **Chapter 7: Simplification**
  - Patterns: Compose Method (refactoring to intention-revealing methods), Replace Conditional Logic with Strategy, Move Embellishment to Decorator, Replace State-Altering Conditionals with State, Replace Implicit Language with Interpreter
  - Referenced in: Refactoring strategies for complex conditionals

**Core Themes**: Patterns as refactoring targets, knowing when to apply patterns, evolutionary design

---

## Additional Recommended Reading

### SOLID Principles

- **Agile Software Development, Principles, Patterns, and Practices** – Robert C. Martin (2002)
  - Original source for SOLID principles (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)
  - Referenced in: Maintainability principles (SRP, OCP, LSP)

### Design Patterns

- **Design Patterns: Elements of Reusable Object-Oriented Software** – Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (Gang of Four) (1994)
  - Canonical patterns referenced in refactoring strategies
  - Referenced in: Code smells (speculative generality, appropriate pattern usage)

### Test-Driven Development

- **Test Driven Development: By Example** – Kent Beck (2002)
  - Complements testability principles
  - Referenced in: Testability principles (seams, observable outcomes)

---

## Citation Format for QA Reports

When citing these sources in QA reports, use this format:

```markdown
**Book Reference**: Clean Code Ch. 3 "Functions Should Be Small"
```

Or for specific principles:

```markdown
**Book Reference**: Pragmatic Programmer Ch. 9 "DRY Principle"
```

---

## Fair Use Notice

This skill references principles and concepts from the above books under fair use for educational purposes. Code examples are original implementations demonstrating the principles, not copied from source materials. Users are encouraged to purchase and read the original books for complete understanding.

---

## Version History

- **v1.0** (2026-02-05): Initial catalog with 6 primary sources
- References current as of February 2026
- Based on latest editions available (Clean Code 2008, Pragmatic Programmer 2019, Code Complete 2004, Refactoring 2018, Legacy Code 2004, Patterns 2004)
