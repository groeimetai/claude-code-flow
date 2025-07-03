# Calculator Production App

A production-ready command-line calculator application built with Node.js, featuring a clean architecture, comprehensive testing, and colorful CLI interface.

## Features

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Advanced Operations**: Power, square root, factorial, percentages
- **Scientific Functions**: Trigonometric (sin, cos, tan) and logarithmic (log, ln) operations
- **History Tracking**: Keep track of all calculations with timestamps
- **Colorful Output**: Enhanced readability with colored terminal output
- **Comprehensive Testing**: Full test coverage with Jest
- **Error Handling**: Graceful handling of edge cases and invalid inputs

## Installation

```bash
# Clone the repository
cd examples/calculator-prod

# Install dependencies
npm install

# Make the CLI executable
chmod +x index.js

# Optional: Link globally for system-wide access
npm link
```

## Usage

### Basic Operations

```bash
# Addition
./index.js add 5 3
# Result: 8

# Subtraction
./index.js subtract 10 4
# Result: 6

# Multiplication
./index.js multiply 6 7
# Result: 42

# Division
./index.js divide 20 4
# Result: 5
```

### Advanced Operations

```bash
# Power
./index.js power 2 8
# Result: 256

# Square root
./index.js sqrt 16
# Result: 4

# Factorial
./index.js factorial 5
# Result: 120

# Percentage
./index.js percentage 200 15
# Result: 30
```

### Scientific Operations

```bash
# Trigonometric (input in radians)
./index.js sin 1.5708
# Result: 1

# Logarithms
./index.js log 100
# Result: 2

./index.js ln 2.71828
# Result: 1
```

### Utility Commands

```bash
# List all available operations
./index.js list

# Show calculation history
./index.js history

# Clear history
./index.js clear

# Show help
./index.js --help
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
calculator-prod/
├── package.json          # Project configuration
├── README.md            # This file
├── index.js             # Entry point
├── src/
│   ├── calculator.js    # Core calculator engine
│   ├── cli.js          # CLI interface
│   └── operations.js    # Mathematical operations
├── tests/
│   ├── calculator.test.js  # Calculator tests
│   └── cli.test.js        # CLI tests
└── coverage/            # Test coverage reports (generated)
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

1. **Calculator Engine** (`src/calculator.js`): Core business logic
2. **Operations Module** (`src/operations.js`): Pure functions for mathematical operations
3. **CLI Interface** (`src/cli.js`): Command-line interface using Commander.js
4. **Entry Point** (`index.js`): Minimal entry point that bootstraps the CLI

## Error Handling

The calculator handles various error cases:
- Division by zero
- Square root of negative numbers
- Factorial of negative numbers
- Logarithm of non-positive numbers
- Invalid number inputs
- Unknown operations

## Future Enhancements

- Interactive REPL mode
- Expression parsing (e.g., "2 + 3 * 4")
- Custom function definitions
- Unit conversion capabilities
- Configuration file support
- Export history to various formats

## License

MIT