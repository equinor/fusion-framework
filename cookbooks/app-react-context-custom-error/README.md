# Context Custom Error Cookbook

This cookbook demonstrates custom error handling in the context module.

## What This Shows

This cookbook illustrates how to:
- Throw custom context errors
- Configure error handling in context filters
- Display user-friendly error messages

## Code Example

```typescript
import {
  FusionContextSearchError,
  enableContext,
} from '@equinor/fusion-framework-react-module-context';

export const configure: AppModuleInitiator = (configurator) => {
  enableContext(configurator, async (builder) => {
    builder.setContextFilter((items) => {
      if (items.length === 0) {
        throw new FusionContextSearchError({
          title: 'This is a custom error',
          description: 'Could not find any items in the context. This error is intentional',
        });
      }
      return items;
    });
  });
};
```

## Understanding Custom Errors

Use `FusionContextSearchError` to throw user-friendly errors with:
- `title`: Short error title
- `description`: Detailed explanation

## When to Use This

Use custom errors for:
- Better error messaging
- User-friendly error handling
- Context validation