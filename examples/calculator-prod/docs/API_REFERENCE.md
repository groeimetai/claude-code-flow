# Calculator API Reference

## Core Modules

### Calculator Class
```javascript
import { Calculator } from './src/calculator.js';

const calc = new Calculator();
```

#### Methods

##### `calculate(operation, operands)`
Performs a calculation using the specified operation.

```javascript
calc.calculate('add', [2, 3]); // Returns: 5
calc.calculate('sqrt', [16]);   // Returns: 4
```

##### `getHistory()`
Returns the calculation history array.

```javascript
const history = calc.getHistory();
// Returns: [{ timestamp, operation, operands, result }, ...]
```

##### `clearHistory()`
Clears the calculation history.

```javascript
calc.clearHistory();
```

### ExpressionParser Class
```javascript
import { ExpressionParser } from './src/parser.js';

const parser = new ExpressionParser();
```

#### Methods

##### `parse(expression, memoryValue = 0)`
Parses and evaluates a mathematical expression.

```javascript
parser.parse('2 + 3 * 4');        // Returns: 14
parser.parse('5 + MR', 10);       // Returns: 15
```

##### `tokenize(expression)`
Converts expression string to token array.

```javascript
parser.tokenize('2 + 3');
// Returns: [
//   { type: 'NUMBER', value: '2' },
//   { type: 'OPERATOR', value: '+' },
//   { type: 'NUMBER', value: '3' }
// ]
```

### MemoryManager Class
```javascript
import { MemoryManager } from './src/memory.js';

const memory = new MemoryManager();
```

#### Methods

##### `memoryAdd(value, slot = null)`
Adds value to memory.

```javascript
memory.memoryAdd(5);          // Adds to main memory
memory.memoryAdd(10, 'x');    // Adds to slot 'x'
```

##### `memorySubtract(value, slot = null)`
Subtracts value from memory.

##### `memoryStore(value, slot = null)`
Stores value in memory (replaces current value).

##### `memoryRecall(slot = null)`
Recalls value from memory.

```javascript
memory.memoryRecall();     // Returns main memory
memory.memoryRecall('x');  // Returns slot 'x' value
```

##### `memoryClear(slot = null)`
Clears memory.

##### `getAllMemory()`
Returns all memory values as object.

```javascript
memory.getAllMemory();
// Returns: { main: 10, x: 20, y: 30 }
```

##### `exportState()` / `importState(state)`
Export and import memory state for persistence.

## Operations Module

### Available Operations

```javascript
import { operations } from './src/operations.js';
```

#### Basic Arithmetic
- `add(a, b)` - Addition
- `subtract(a, b)` - Subtraction
- `multiply(a, b)` - Multiplication
- `divide(a, b)` - Division (throws on divide by zero)

#### Advanced Operations
- `power(base, exponent)` - Exponentiation
- `sqrt(n)` - Square root (throws on negative)
- `factorial(n)` - Factorial (throws on negative)
- `percentage(value, percent)` - Percentage calculation

#### Trigonometric (radians)
- `sin(n)` - Sine
- `cos(n)` - Cosine
- `tan(n)` - Tangent

#### Logarithmic
- `log(n)` - Base-10 logarithm (throws on non-positive)
- `ln(n)` - Natural logarithm (throws on non-positive)

#### Number Theory
- `gcd(a, b)` - Greatest Common Divisor
- `lcm(a, b)` - Least Common Multiple

### Helper Functions

```javascript
import { getAvailableOperations, getOperationArity } from './src/operations.js';

getAvailableOperations();  // Returns: ['add', 'subtract', ...]
getOperationArity('sqrt'); // Returns: 1
```

## Interactive Mode API

### InteractiveCalculator Class
```javascript
import { InteractiveCalculator } from './src/interactive.js';

const interactive = new InteractiveCalculator();
await interactive.start();
```

#### Configuration
```javascript
{
  prompt: '> ',           // Command prompt
  historyFile: '.history', // History persistence
  maxHistory: 1000,       // Max history entries
  multilineMode: false    // Multiline input mode
}
```

## Expression Syntax

### Basic Syntax
- Numbers: `123`, `3.14`, `1.5e-10`
- Operators: `+`, `-`, `*`, `/`, `^`
- Parentheses: `(`, `)`
- Functions: `functionName(arg1, arg2, ...)`
- Memory: `MR`

### Operator Precedence
1. Parentheses
2. Functions
3. Power (`^`)
4. Multiplication (`*`), Division (`/`)
5. Addition (`+`), Subtraction (`-`)

### Special Values (Interactive Mode)
- `ans` - Last calculation result
- `pi` - π (3.14159...)
- `e` - Euler's number (2.71828...)
- `MR` - Memory recall

## Error Handling

All operations throw descriptive errors:

```javascript
try {
  calc.calculate('divide', [10, 0]);
} catch (error) {
  console.error(error.message); // "Division by zero"
}
```

Common errors:
- `Division by zero`
- `Cannot calculate square root of negative number`
- `Unknown function: <name>`
- `Function <name> expects N argument(s), got M`
- `Unexpected token: <token>`
- `Missing closing parenthesis`

## Performance Optimization

### OptimizedExpressionParser
For high-performance scenarios:

```javascript
import { evaluateExpression, clearExpressionCache, getCacheStats } from './src/parser-optimized.js';

// Evaluate with caching
const result = evaluateExpression('2 + 3 * 4'); // Cached after first call

// Cache management
clearExpressionCache();
const stats = getCacheStats();
// Returns: { size: 0, maxSize: 1000, hitRate: 0.85 }
```

### Performance Characteristics
- Simple expressions: ~0.001ms
- Complex expressions: ~0.005ms
- Cache hit rate: typically >80%
- Memory usage: O(cache size)

## Configuration

### Loading Configuration
```javascript
import { loadConfig } from './src/config.js';

const config = loadConfig();
// Loads from .calculatorrc or defaults
```

### Default Configuration
```javascript
{
  precision: 15,
  angleMode: 'radians',
  outputFormat: 'decimal',
  theme: 'default',
  autoSave: true,
  historySize: 100
}
```

## Utility Functions

### Data Persistence
```javascript
import { 
  loadMemoryState, 
  saveMemoryState, 
  loadHistory, 
  saveHistory,
  clearAllData 
} from './src/utils/helpers.js';
```

### File Locations
- Memory: `.calculator-data/memory.json`
- History: `.calculator-data/history.json`
- Config: `.calculatorrc`

## TypeScript Support

Full TypeScript definitions available:

```typescript
import type { 
  Operation, 
  Token, 
  CalculationResult,
  MemoryState,
  Config 
} from './calculator';
```

## Integration Examples

### Web Application
```javascript
// Express.js endpoint
app.post('/calculate', (req, res) => {
  const { expression } = req.body;
  try {
    const result = evaluateExpression(expression);
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
```

### Electron App
```javascript
// Main process
ipcMain.handle('calculate', async (event, expression) => {
  return evaluateExpression(expression);
});
```

### React Component
```jsx
function Calculator() {
  const [result, setResult] = useState(0);
  
  const handleCalculate = (expression) => {
    try {
      setResult(evaluateExpression(expression));
    } catch (error) {
      alert(error.message);
    }
  };
  
  return <CalculatorUI onCalculate={handleCalculate} result={result} />;
}
```

## Best Practices

1. **Always handle errors** when evaluating user input
2. **Use the optimized parser** for repeated calculations
3. **Clear cache periodically** in long-running applications
4. **Validate input** before parsing expressions
5. **Use memory slots** for complex multi-step calculations
6. **Export state** for persistence between sessions

## Version Compatibility

- Node.js: >=14.0.0
- ES Modules required
- No external runtime dependencies