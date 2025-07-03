# Calculator API Documentation

## Table of Contents
- [Calculator Class](#calculator-class)
- [Expression Parser](#expression-parser)
- [Memory Manager](#memory-manager)
- [History Manager](#history-manager)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Operations Reference](#operations-reference)

## Calculator Class

The main calculator interface for performing calculations.

### Constructor
```javascript
new Calculator(config?: CalculatorConfig)
```

### Methods

#### calculate(operation, operands)
Performs a calculation with the specified operation.

```javascript
calc.calculate('add', [5, 3]) // Returns: 8
calc.calculate('multiply', [4, 7]) // Returns: 28
```

**Parameters:**
- `operation` (string): The operation to perform
- `operands` (number[]): Array of numbers to operate on

**Returns:** `number` - The result of the calculation

#### evaluateExpression(expression)
Evaluates a mathematical expression string.

```javascript
calc.evaluateExpression('2 + 3 * 4') // Returns: 14
calc.evaluateExpression('sqrt(16) + 2^3') // Returns: 12
```

**Parameters:**
- `expression` (string): The mathematical expression to evaluate

**Returns:** `number` - The result of the expression

#### getHistory()
Returns the calculation history.

```javascript
const history = calc.getHistory()
// Returns: Array of HistoryEntry objects
```

#### clearHistory()
Clears all calculation history.

```javascript
calc.clearHistory()
```

#### getLastResult()
Returns the result of the last calculation.

```javascript
const lastResult = calc.getLastResult()
```

#### getMemoryManager()
Returns the memory manager instance.

```javascript
const memory = calc.getMemoryManager()
```

## Expression Parser

### Supported Syntax

The expression parser supports:
- Basic operators: `+`, `-`, `*`, `/`, `^`
- Parentheses: `(`, `)`
- Functions: `sin()`, `cos()`, `tan()`, `log()`, `ln()`, `sqrt()`, etc.
- Memory recall: `MR`
- Numbers: integers and decimals

### Operator Precedence

1. Parentheses
2. Functions
3. Exponentiation (`^`)
4. Multiplication and Division (`*`, `/`)
5. Addition and Subtraction (`+`, `-`)

### Examples

```javascript
// Basic arithmetic
'2 + 3 * 4'           // 14
'(2 + 3) * 4'         // 20

// Functions
'sin(1.5708)'         // ~1 (sin of π/2)
'sqrt(16) + log(100)' // 4 + 2 = 6

// Complex expressions
'2^3 + sqrt(16) - log(100)' // 8 + 4 - 2 = 10
```

## Memory Manager

### Methods

#### memoryStore(value)
Stores a value in memory.

```javascript
memory.memoryStore(42)
```

#### memoryRecall()
Recalls the stored memory value.

```javascript
const value = memory.memoryRecall() // Returns: 42
```

#### memoryAdd(value)
Adds to the memory value.

```javascript
memory.memoryAdd(8) // Memory now contains 50
```

#### memorySubtract(value)
Subtracts from the memory value.

```javascript
memory.memorySubtract(10) // Memory now contains 40
```

#### memoryClear()
Clears the memory.

```javascript
memory.memoryClear()
```

#### storeInSlot(slot, value)
Stores a value in a named slot.

```javascript
memory.storeInSlot('x', 10)
memory.storeInSlot('y', 20)
```

#### recallFromSlot(slot)
Recalls a value from a named slot.

```javascript
const x = memory.recallFromSlot('x') // Returns: 10
```

## History Manager

### Methods

#### add(entry)
Adds an entry to history.

```javascript
historyManager.add({
  operation: 'add',
  operands: [5, 3],
  result: 8
})
```

#### getAll()
Returns all history entries.

```javascript
const allHistory = historyManager.getAll()
```

#### search(query)
Searches history for matching entries.

```javascript
const results = historyManager.search('sqrt')
```

#### getStats()
Returns statistics about the history.

```javascript
const stats = historyManager.getStats()
// Returns: { total, operations, averageResult, minResult, maxResult }
```

#### export(format, filePath)
Exports history to a file.

```javascript
historyManager.export('json', './history.json')
historyManager.export('csv', './history.csv')
historyManager.export('txt', './history.txt')
```

#### import(filePath, append)
Imports history from a file.

```javascript
historyManager.import('./history.json', true)
```

## Configuration

### Configuration Options

```javascript
{
  // Performance
  cacheSize: 1000,              // Expression cache size
  enableCache: true,            // Enable/disable caching
  
  // Display
  precision: 10,                // Decimal precision
  scientificNotation: false,    // Use scientific notation
  thousandsSeparator: true,     // Show thousands separator
  locale: 'en-US',             // Number formatting locale
  
  // History
  historySize: 100,            // Max history entries
  historyFile: '.calculator_history',
  autoSaveHistory: true,
  
  // Logging
  logLevel: 'info',            // debug, info, warn, error
  logFile: null,               // Log file path
  colorOutput: true,           // Colored console output
  
  // Memory
  memorySlots: 10,             // Number of memory slots
  persistMemory: true,         // Save memory between sessions
  
  // Advanced
  timeout: 5000                // Max calculation time (ms)
}
```

### Loading Configuration

Configuration is loaded from multiple sources in order:
1. Default configuration
2. `.calculatorrc` file
3. Environment variables (CALC_*)
4. Command line options

```javascript
config.load({
  precision: 15,
  logLevel: 'debug'
})
```

## Error Handling

### Error Types

- `DivisionByZeroError`: Division by zero attempted
- `InvalidExpressionError`: Malformed expression
- `UnknownOperationError`: Unknown operation or function
- `OverflowError`: Result too large
- `TimeoutError`: Calculation timeout
- `ValidationError`: Invalid input

### Error Response Format

```javascript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE",
    suggestions: ["Recovery suggestion 1", "Recovery suggestion 2"]
  }
}
```

### Example Error Handling

```javascript
try {
  const result = calc.evaluateExpression('10 / 0')
} catch (error) {
  const response = errorHandler.handle(error)
  console.log(response.error.message)
  console.log('Suggestions:', response.error.suggestions)
}
```

## Operations Reference

### Basic Operations
- `add(a, b)`: Addition
- `subtract(a, b)`: Subtraction
- `multiply(a, b)`: Multiplication
- `divide(a, b)`: Division

### Scientific Operations
- `sin(x)`: Sine (radians)
- `cos(x)`: Cosine (radians)
- `tan(x)`: Tangent (radians)
- `asin(x)`: Arcsine
- `acos(x)`: Arccosine
- `atan(x)`: Arctangent
- `log(x)`: Base-10 logarithm
- `ln(x)`: Natural logarithm
- `exp(x)`: e^x
- `sqrt(x)`: Square root
- `pow(x, y)`: x raised to power y
- `abs(x)`: Absolute value

### Advanced Operations
- `factorial(n)`: Factorial (n!)
- `gcd(a, b)`: Greatest common divisor
- `lcm(a, b)`: Least common multiple
- `mod(a, b)`: Modulo operation
- `percent(x, p)`: Percentage calculation
- `round(x, p)`: Round to p decimal places
- `floor(x)`: Round down
- `ceil(x)`: Round up

### Constants
- `pi`: 3.14159265359
- `e`: 2.71828182846