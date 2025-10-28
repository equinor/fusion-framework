# Environment Variables Cookbook

This cookbook demonstrates how to access application configuration using environment variables.

## What This Shows

This cookbook illustrates how to:
- Access environment variables in React components
- Use the `useAppEnvironmentVariables` hook
- Handle loading and error states
- Display configuration values

## Code Example

```typescript
import { useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';

export const App = () => {
  const { value, complete, error } = useAppEnvironmentVariables();
  
  // Show loading state
  if (!complete) {
    return <div>Loading...</div>;
  }
  
  // Show error state
  if (error) {
    return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;
  }
  
  // Display the environment variables
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
};
```

## Understanding the Hook

The `useAppEnvironmentVariables` hook provides:
- `value`: The environment variables object
- `complete`: Boolean indicating if loading is complete
- `error`: Any error that occurred during loading

## When to Use Environment Variables

Use environment variables for:
- API endpoints
- Feature toggles
- Environment-specific settings
- Configuration that varies by deployment