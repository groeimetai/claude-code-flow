# Contributing to Calculator-Prod

Thank you for your interest in contributing to Calculator-Prod! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Prioritize the community's best interests

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/calculator-prod.git
   cd calculator-prod
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/originalowner/calculator-prod.git
   ```

## Development Setup

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Installation
```bash
# Install dependencies
npm install

# Link for local development
npm link

# Run tests
npm test
```

### Development Workflow
```bash
# Start in development mode
npm run dev

# Run tests in watch mode
npm run test:watch

# Check code coverage
npm run test:coverage

# Run benchmarks
npm run benchmark
```

## Making Changes

### 1. Create a Branch
```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow these guidelines:
- Write clear, self-documenting code
- Add comments for complex logic
- Update tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Run specific test file
npm test -- calculator.test.js

# Run benchmarks to ensure performance
npm run benchmark
```

### 4. Commit Your Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new mathematical operation"
```

#### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions or modifications
- `chore:` Build process or auxiliary tool changes

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Writing Tests
```javascript
// Example test structure
describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calc.calculate('add', [2, 3])).toBe(5);
    });
    
    it('should handle negative numbers', () => {
      expect(calc.calculate('add', [-2, 3])).toBe(1);
    });
  });
});
```

### Test Guidelines
- Write tests for all new features
- Maintain test coverage above 90%
- Test edge cases and error conditions
- Use descriptive test names
- Group related tests with `describe`

## Submitting Changes

### 1. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request
1. Go to your fork on GitHub
2. Click "Pull Request"
3. Fill out the PR template
4. Link related issues

### 3. PR Guidelines
- Give your PR a descriptive title
- Explain what changes you made and why
- Include screenshots for UI changes
- Reference any related issues
- Ensure all tests pass
- Request review from maintainers

### 4. Code Review Process
- Respond to feedback promptly
- Make requested changes
- Push additional commits to your branch
- Mark conversations as resolved

## Coding Standards

### JavaScript Style
```javascript
// Use ES modules
import { something } from './module.js';

// Use const/let, not var
const constant = 42;
let variable = 'value';

// Use arrow functions for callbacks
array.map(item => item * 2);

// Use async/await
async function fetchData() {
  const result = await asyncOperation();
  return result;
}

// Destructuring
const { property } = object;
const [first, second] = array;
```

### Code Organization
```
src/
├── calculator.js      # Main calculator class
├── operations.js      # Mathematical operations
├── parser.js          # Expression parser
├── errors.js          # Error handling
├── config.js          # Configuration management
├── logger.js          # Logging system
├── history.js         # History management
└── memory.js          # Memory operations
```

### Documentation
```javascript
/**
 * Calculates the result of a mathematical operation
 * 
 * @param {string} operation - The operation to perform
 * @param {number[]} operands - Array of operands
 * @returns {number} The calculation result
 * @throws {Error} If operation is unknown
 * 
 * @example
 * calculate('add', [2, 3]) // Returns 5
 */
function calculate(operation, operands) {
  // Implementation
}
```

## Documentation

### Adding Documentation
1. Update JSDoc comments in code
2. Update API documentation in `docs/API.md`
3. Update user guide in `docs/USER_GUIDE.md`
4. Add examples to `examples/` directory

### Documentation Standards
- Use clear, concise language
- Include code examples
- Explain both "what" and "why"
- Keep documentation up-to-date

## Adding New Features

### 1. New Operations
To add a new mathematical operation:

```javascript
// In operations.js
export const operations = {
  // ... existing operations
  
  yourOperation: (a, b) => {
    // Implementation
    return result;
  }
};

// Add tests in operations.test.js
test('yourOperation', () => {
  expect(operations.yourOperation(2, 3)).toBe(expectedResult);
});
```

### 2. New Commands
To add a new CLI command:

```javascript
// In index.js
program
  .command('yourcommand')
  .description('Description of your command')
  .action((options) => {
    // Implementation
  });
```

### 3. Performance Considerations
- New features must maintain <10ms response time
- Run benchmarks after adding features
- Consider adding caching for expensive operations
- Profile code for performance bottlenecks

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run all tests and benchmarks
4. Create release PR
5. Tag release after merge
6. Publish to npm

## Getting Help

- Check existing issues and PRs
- Ask questions in discussions
- Join our community chat
- Email maintainers for sensitive issues

## Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Given credit in the project README

Thank you for contributing to Calculator-Prod!