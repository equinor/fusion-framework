---
description: Rules for writing tests in Fusion Framework
name: Testing Rules
applyTo: "**/*.{test,spec}.{ts,tsx}"
---

# Testing Rules

## TL;DR (for AI agents)

- **Framework**: Use Vitest for all tests with `describe/it/expect/vi`.
- **Coverage**: For every new exported function/module/component, add at least one happy-path test and one error/edge-case (including async where relevant).
- **Behavior**: Test observable behavior, not implementation details; focus on inputs/outputs and side effects.
- **Mocking**: Use `vi.mock` / `vi.fn` for external dependencies; prefer real dependencies for integration tests.
- **Location**: Co-locate tests as `*.test.ts(x)` or under `__tests__` next to the code.

## Testing Framework
- Use **Vitest** for all tests
- Follow **TDD approach**: Write tests first (RED), implement (GREEN), refactor

## Test Structure

### Basic Test Pattern
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('FeatureName', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## Test Requirements

### Coverage
- Test all public APIs
- Test error scenarios and edge cases
- Test boundary conditions
- Test async operations

### Mocking
- Mock external dependencies in unit tests
- Use `vi.mock()` for module mocking
- Use `vi.fn()` for function mocking
- Use real dependencies in integration tests

### Error Testing
```typescript
it('should throw error when input is invalid', () => {
  expect(() => {
    functionUnderTest(invalidInput);
  }).toThrow('Expected error message');
});
```

### Async Testing
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## Test File Organization
- Place test files next to source: `src/feature.ts` → `src/feature.test.ts`
- Or in `__tests__` directory: `src/__tests__/feature.test.ts`
- Use `.test.ts` or `.spec.ts` extension

## Mocking Patterns

### Mock Node.js Modules
```typescript
import { vi } from 'vitest';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));
```

### Mock External Dependencies
```typescript
vi.mock('@equinor/fusion-framework', () => ({
  Framework: vi.fn(),
}));
```

## Test Best Practices
- Keep tests focused and isolated
- Use descriptive test names
- Test behavior, not implementation
- Clean up after tests (if needed)
- Avoid testing implementation details

## Integration Tests
- Use real dependencies when possible
- Test actual workflows end-to-end
- Test error handling in real scenarios
- Verify external integrations work correctly

