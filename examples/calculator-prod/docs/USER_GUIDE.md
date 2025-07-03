# Calculator User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic Usage](#basic-usage)
3. [Expression Syntax](#expression-syntax)
4. [Interactive Mode](#interactive-mode)
5. [Memory Functions](#memory-functions)
6. [History Management](#history-management)
7. [Configuration](#configuration)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Installation

```bash
npm install -g calculator-prod
```

Or run locally:
```bash
npm install
npm link
```

### Quick Start

```bash
# Perform a simple calculation
calculator add 5 3

# Evaluate an expression
calculator eval "2 + 3 * 4"

# Start interactive mode
calculator interactive
```

## Basic Usage

### Command Line Interface

The calculator provides several commands:

```bash
# Basic operations
calculator add <num1> <num2>
calculator subtract <num1> <num2>
calculator multiply <num1> <num2>
calculator divide <num1> <num2>

# Expression evaluation
calculator eval "<expression>"

# Interactive mode
calculator interactive

# Help
calculator --help
calculator help <command>
```

### Examples

```bash
# Basic arithmetic
calculator add 10 5          # Result: 15
calculator multiply 7 8      # Result: 56

# Expressions
calculator eval "2 + 3 * 4"  # Result: 14
calculator eval "sqrt(16)"   # Result: 4

# Scientific calculations
calculator eval "sin(1.5708)" # Result: ~1
calculator eval "log(100)"    # Result: 2
```

## Expression Syntax

### Operators

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Exponentiation: `^`

### Functions

#### Trigonometric
- `sin(x)` - Sine (x in radians)
- `cos(x)` - Cosine (x in radians)
- `tan(x)` - Tangent (x in radians)
- `asin(x)` - Arcsine
- `acos(x)` - Arccosine
- `atan(x)` - Arctangent

#### Logarithmic
- `log(x)` - Base-10 logarithm
- `ln(x)` - Natural logarithm
- `exp(x)` - e^x

#### Other Functions
- `sqrt(x)` - Square root
- `abs(x)` - Absolute value
- `factorial(n)` - Factorial
- `gcd(a,b)` - Greatest common divisor
- `lcm(a,b)` - Least common multiple
- `round(x)` - Round to nearest integer
- `floor(x)` - Round down
- `ceil(x)` - Round up

### Order of Operations

The calculator follows standard mathematical order of operations (PEMDAS):

1. **P**arentheses
2. **E**xponents
3. **M**ultiplication and **D**ivision (left to right)
4. **A**ddition and **S**ubtraction (left to right)

### Examples

```bash
# Standard order
calculator eval "2 + 3 * 4"        # = 2 + 12 = 14

# With parentheses
calculator eval "(2 + 3) * 4"      # = 5 * 4 = 20

# Complex expression
calculator eval "sqrt(16) + 2^3"   # = 4 + 8 = 12

# Nested functions
calculator eval "log(10^2)"        # = log(100) = 2
```

## Interactive Mode

Interactive mode provides a REPL (Read-Eval-Print Loop) interface:

```bash
$ calculator interactive

Calculator Interactive Mode
Type 'help' for commands, 'exit' to quit

> 5 + 3
8

> sqrt(144)
12

> ans * 2
24

> help
Available commands:
  - Mathematical expressions
  - ans: Use previous result
  - memory: Memory operations
  - history: Show calculation history
  - clear: Clear screen
  - exit: Exit interactive mode

> exit
Goodbye!
```

### Special Variables

- `ans` - Previous calculation result
- `MR` - Memory recall value
- `pi` - Pi constant (3.14159...)
- `e` - Euler's number (2.71828...)

## Memory Functions

### Basic Memory Operations

```bash
# Store value in memory
calculator memory store 42

# Recall memory
calculator memory recall

# Add to memory
calculator memory add 8

# Subtract from memory
calculator memory subtract 5

# Clear memory
calculator memory clear
```

### Using Memory in Expressions

```bash
# Store a value
calculator memory store 10

# Use in expression
calculator eval "5 + MR"      # = 5 + 10 = 15
calculator eval "MR * 2"      # = 10 * 2 = 20
```

### Memory Slots

```bash
# Store in named slots
calculator memory store --slot x 10
calculator memory store --slot y 20

# Recall from slots
calculator memory recall --slot x
calculator eval "sqrt(x^2 + y^2)"
```

## History Management

### View History

```bash
# Show all history
calculator history

# Show last N entries
calculator history --last 10

# Search history
calculator history --search "sqrt"
```

### Export History

```bash
# Export as JSON
calculator history --export history.json

# Export as CSV
calculator history --export history.csv

# Export as text
calculator history --export history.txt
```

### Import History

```bash
# Import and replace
calculator history --import backup.json

# Import and append
calculator history --import backup.json --append
```

### Clear History

```bash
calculator history --clear
```

## Configuration

### Configuration File

Create a `.calculatorrc` file in your home directory or project:

```json
{
  "precision": 10,
  "scientificNotation": false,
  "thousandsSeparator": true,
  "locale": "en-US",
  "historySize": 100,
  "logLevel": "info",
  "colorOutput": true
}
```

### Environment Variables

```bash
# Set precision
export CALC_PRECISION=15

# Set log level
export CALC_LOG_LEVEL=debug

# Disable colors
export CALC_COLOR_OUTPUT=false

# Run calculator
calculator eval "22/7"
```

### Command Line Options

```bash
# Override precision
calculator --precision 2 eval "22/7"

# Change log level
calculator --log-level debug eval "1+1"

# Disable colors
calculator --no-color eval "sqrt(2)"

# Use specific config file
calculator --config ./custom.calculatorrc eval "2*3"
```

## Advanced Features

### Performance Options

```bash
# Disable cache for testing
calculator --no-cache eval "complex expression"

# Set timeout
calculator --timeout 1000 eval "factorial(1000)"

# Benchmark mode
calculator --benchmark eval "sin(1) + cos(1)"
```

### Output Formatting

```bash
# Scientific notation
calculator --scientific eval "1234567890"

# Custom precision
calculator --precision 15 eval "pi"

# Thousands separator
calculator --thousands-separator eval "1000000/3"

# Different locale
calculator --locale de-DE eval "1234.56"
```

### Batch Processing

```bash
# Process file of expressions
calculator batch expressions.txt

# Pipe expressions
echo "2+2" | calculator eval

# Process multiple
cat << EOF | calculator batch
5 + 3
sqrt(16)
log(100)
EOF
```

## Troubleshooting

### Common Issues

#### "Division by zero" Error
- Check your expression for division by zero
- Example: `10/0` is invalid

#### "Unknown operation" Error
- Verify the function name is spelled correctly
- Use `calculator help operations` to see available operations

#### "Invalid expression" Error
- Check for matching parentheses
- Ensure operators have operands on both sides
- Verify function syntax: `function(argument)`

### Performance Issues

If calculations are slow:
1. Check cache is enabled: `calculator --cache-stats`
2. Reduce precision for faster calculations
3. Break complex expressions into steps

### Getting Help

```bash
# General help
calculator --help

# Command help
calculator help eval
calculator help memory

# List operations
calculator help operations

# Version info
calculator --version
```

### Debug Mode

For troubleshooting:

```bash
# Enable debug logging
calculator --log-level debug eval "expression"

# Save logs to file
calculator --log-file debug.log eval "expression"
```

## Tips and Tricks

1. **Use parentheses** for clarity in complex expressions
2. **Save frequently used values** in memory slots
3. **Export history** regularly for backup
4. **Use configuration file** for persistent settings
5. **Interactive mode** is great for exploratory calculations
6. **Combine with shell scripts** for automation

## Examples Collection

```bash
# Financial calculation
calculator eval "1000 * (1 + 0.05)^10"  # Compound interest

# Geometry
calculator eval "pi * 5^2"              # Circle area

# Statistics
calculator eval "(10 + 20 + 30) / 3"    # Average

# Physics
calculator eval "0.5 * 10 * 9.8^2"      # Kinetic energy

# Complex calculation
calculator eval "sqrt(sin(pi/4)^2 + cos(pi/4)^2)"  # Should equal 1
```