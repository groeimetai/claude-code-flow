# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is this calculator?
**A:** This is a production-ready command-line calculator with support for basic arithmetic, scientific functions, expression parsing, memory operations, and an interactive REPL mode.

### Q: What are the system requirements?
**A:** Node.js version 14 or higher with ES modules support. No external dependencies are required for core functionality.

### Q: How do I install it?
**A:** Clone the repository, run `npm install`, and you're ready to go. You can also install it globally with `npm install -g .` for system-wide access.

## Usage Questions

### Q: How do I perform a simple calculation?
**A:** Use the `eval` command:
```bash
node index.js eval "2 + 3 * 4"
```

### Q: Why does `2 + 3 * 4` equal 14 and not 20?
**A:** The calculator follows standard mathematical operator precedence. Multiplication happens before addition. Use parentheses to change the order: `(2 + 3) * 4`.

### Q: How do I use the interactive mode?
**A:** Run `node index.js interactive` to start the REPL. Type expressions and press Enter. Use `help` for commands and `exit` to quit.

### Q: Can I use the result of the previous calculation?
**A:** Yes! In interactive mode, use `ans` to reference the last result:
```
> 10 + 5
= 15
> ans * 2
= 30
```

## Memory Questions

### Q: How does memory work?
**A:** The calculator has persistent memory that saves between sessions:
- `m+` adds to memory
- `m-` subtracts from memory
- `mr` recalls memory value
- `mc` clears memory
- Use `MR` in expressions to access memory value

### Q: Can I have multiple memory slots?
**A:** Yes! The memory system supports named slots. Use the programmatic API to access this feature.

### Q: Where is memory stored?
**A:** Memory is stored in `.calculator-data/memory.json` in the current directory.

## Function Questions

### Q: What functions are available?
**A:** Run `node index.js list` to see all available functions, including:
- Basic: sqrt, power, factorial
- Trigonometric: sin, cos, tan (in radians)
- Logarithmic: log (base 10), ln (natural)
- Number theory: gcd, lcm

### Q: Are trigonometric functions in degrees or radians?
**A:** All trigonometric functions use radians by default. To convert:
- Degrees to radians: multiply by π/180
- Radians to degrees: multiply by 180/π

### Q: How do I calculate percentages?
**A:** Use the percentage function:
```bash
node index.js percentage 200 15  # 15% of 200 = 30
```

## Expression Questions

### Q: What's the maximum expression length?
**A:** There's no hard limit, but very long expressions may impact performance. The parser is optimized for expressions under 1000 characters.

### Q: Can I use scientific notation?
**A:** Yes! Numbers like `1.5e-10` and `3.14e8` are supported.

### Q: How do I use pi and e?
**A:** In interactive mode, use `pi` and `e` directly:
```
> sin(pi/2)
= 1
> ln(e)
= 1
```

## Error Handling

### Q: What does "Division by zero" mean?
**A:** You're trying to divide by zero, which is mathematically undefined. Check your expression for zero denominators.

### Q: What does "Unknown function" mean?
**A:** You've typed a function name that doesn't exist. Check spelling or run `node index.js list` to see available functions.

### Q: What does "Missing closing parenthesis" mean?
**A:** You have more opening parentheses `(` than closing ones `)`. Count your parentheses.

### Q: Why do I get "Unexpected token"?
**A:** You've used a character that's not recognized. Valid characters are:
- Numbers: 0-9
- Operators: + - * / ^
- Functions: letters only
- Grouping: ( ) ,
- Memory: MR

## Performance Questions

### Q: How fast is the calculator?
**A:** Very fast! Simple expressions evaluate in under 0.002ms, complex ones in under 0.005ms. The optimized parser includes caching for repeated calculations.

### Q: Does it cache results?
**A:** Yes, the optimized parser caches expression results. Clear the cache with the API if needed.

### Q: What's the precision?
**A:** JavaScript's standard 64-bit floating-point precision (about 15-17 decimal digits). Configure display precision in `.calculatorrc`.

## Configuration Questions

### Q: How do I configure the calculator?
**A:** Create a `.calculatorrc` file in your home directory or project root:
```json
{
  "precision": 10,
  "angleMode": "radians",
  "theme": "dark"
}
```

### Q: Can I change the prompt in interactive mode?
**A:** Yes, through the configuration file or programmatic API.

### Q: How do I clear the history?
**A:** Run `node index.js clear` to clear calculation history.

## Troubleshooting

### Q: The calculator won't start
**A:** Check that you have Node.js 14+ installed and you've run `npm install`.

### Q: Memory isn't persisting
**A:** Ensure you have write permissions in the current directory. The calculator creates a `.calculator-data` folder.

### Q: I get "Cannot find module"
**A:** Make sure you're using Node.js with ES modules support. Add `"type": "module"` to package.json if needed.

### Q: Interactive mode history isn't working
**A:** Arrow key support requires a terminal that supports ANSI escape codes. Try a different terminal emulator.

## Advanced Questions

### Q: Can I use this in my own project?
**A:** Yes! Import the modules you need:
```javascript
import { evaluateExpression } from './src/parser.js';
const result = evaluateExpression('2 + 3');
```

### Q: Is there TypeScript support?
**A:** Yes, TypeScript definitions are included in `calculator.d.ts`.

### Q: Can I add custom functions?
**A:** Yes, add them to `src/operations.js` and update the arity map.

### Q: Is there a web version?
**A:** The core is platform-agnostic and can be used in browsers with a bundler like Webpack or Rollup.

## Security Questions

### Q: Is it safe to evaluate user input?
**A:** Yes! The calculator uses a custom parser, not `eval()`. Only mathematical expressions are allowed.

### Q: Can it execute arbitrary code?
**A:** No. The parser only recognizes mathematical operations and explicitly defined functions.

### Q: Is the memory file encrypted?
**A:** No, it's stored as plain JSON. Don't store sensitive data in calculator memory.

---

Still have questions? Check the [full documentation](../README.md) or [open an issue](https://github.com/your-repo/issues)!