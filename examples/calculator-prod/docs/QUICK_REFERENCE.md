# Calculator Quick Reference Card

## CLI Commands

### Basic Math
```bash
node index.js add 5 3          # → 8
node index.js subtract 10 4    # → 6
node index.js multiply 7 8     # → 56
node index.js divide 20 4      # → 5
```

### Scientific
```bash
node index.js sqrt 16          # → 4
node index.js power 2 10       # → 1024
node index.js factorial 5      # → 120
node index.js sin 0            # → 0
node index.js log 100          # → 2
```

### Expressions
```bash
node index.js eval "2 + 3 * 4"              # → 14
node index.js eval "(2 + 3) * 4"            # → 20
node index.js eval "sqrt(3^2 + 4^2)"        # → 5
node index.js eval "sin(pi/2) + cos(0)"     # → 2
```

### Memory
```bash
node index.js m+ 10      # Add to memory
node index.js m- 3       # Subtract from memory
node index.js mr         # Recall memory
node index.js mc         # Clear memory
```

## Interactive Mode Commands

### Start Interactive Mode
```bash
node index.js interactive
```

### Inside Interactive Mode
```
> 2 + 3                  # Basic calculation
> sqrt(16)               # Function call
> ans * 2                # Use last result
> sin(pi/2)              # Use constants
> 10 + MR                # Use memory
> help                   # Show help
> exit                   # Quit
```

### Special Interactive Commands
- `help` - Show all commands
- `clear` - Clear screen
- `history` - Show history
- `memory` - Show memory values
- `ms` - Store last result in memory
- `m+` - Add last result to memory
- `m-` - Subtract last result from memory
- `functions` - List all functions
- `mode` - Toggle multiline mode

## Expression Syntax

### Operators (by precedence)
1. `()` - Parentheses
2. `^` - Power
3. `*`, `/` - Multiply, Divide
4. `+`, `-` - Add, Subtract

### Functions
```
sqrt(x)         - Square root
sin(x)          - Sine
cos(x)          - Cosine
tan(x)          - Tangent
log(x)          - Base-10 log
ln(x)           - Natural log
factorial(x)    - Factorial
power(x, y)     - x^y
percentage(x,y) - x% of y
gcd(x, y)       - Greatest common divisor
lcm(x, y)       - Least common multiple
```

### Constants (Interactive Mode)
- `pi` - 3.14159...
- `e` - 2.71828...
- `ans` - Last result
- `MR` - Memory recall

## Configuration File

Create `.calculatorrc`:
```json
{
  "precision": 10,
  "angleMode": "radians",
  "theme": "dark",
  "autoSave": true,
  "historySize": 1000
}
```

## Keyboard Shortcuts (Interactive)

- `↑` / `↓` - Navigate history
- `Tab` - Auto-complete
- `Ctrl+C` - Cancel current input
- `Ctrl+D` - Exit (same as 'exit')
- `Ctrl+L` - Clear screen

## Common Patterns

### Chain Calculations
```
> 100
= 100
> ans / 4
= 25
> sqrt(ans)
= 5
```

### Store Constants
```
> 3.14159
= 3.14159
> ms
Stored in memory
> 2 * MR
= 6.28318
```

### Complex Expressions
```
> (sqrt(16) + 3^2) / (2 * factorial(3))
= 0.8333...
```

## Error Messages

- `Division by zero` - Check denominators
- `Unknown function: X` - Typo in function name
- `Missing closing parenthesis` - Check brackets
- `Unexpected token: X` - Invalid character
- `Function X expects Y argument(s)` - Wrong number of args

## Performance Tips

1. Use `eval` for complex expressions
2. Interactive mode caches results
3. Memory persists between sessions
4. History limited to last 1000 entries

## File Locations

- Config: `~/.calculatorrc`
- Memory: `.calculator-data/memory.json`
- History: `.calculator-data/history.json`

---

For full documentation: `node index.js --help`