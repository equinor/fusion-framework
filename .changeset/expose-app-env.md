---
"@equinor/fusion-framework-react-app": minor
---

## @equinor/fusion-react

### What changed?

The `useAppEnvironmentVariables` hook has been added to the `@equinor/fusion-react` package. 
This hook provides access to the application's environment variables, which are retrieved from the app module provided by the framework.

### Why the change?

Previously, there was no built-in way to access the application's environment variables from the React components. 
This new hook fills that gap, making it easier for developers to retrieve and use the environment configuration in their applications.

### How to use the new feature

To use the `useAppEnvironmentVariables` hook, simply import it and call it in your React component:

```typescript
import { useAppEnvironmentVariables } from '@equinor/fusion-react';

const MyComponent = () => {
  const env = useAppEnvironmentVariables<{ API_URL: string }>();

  if (!env.complete) {
    return <div>Loading environment variables...</div>;
  }

  if (env.error) {
    return <div>Error loading environment variables</div>;
  }

  return (
    <div>
      My environment variables: {JSON.stringify(env.value, null, 2)}
    </div>
  );
};
```


The hook returns an observable state object that represents the current environment configuration. 
The `value` property of this object contains the environment variables, which can be typed using a generic type parameter.

If the environment configuration is not yet available (e.g., during the initial load), the `complete` property will be `false`. 
If there was an error retrieving the configuration, the `error` property will be set.

### Migration guide

There are no breaking changes introduced with this feature. Developers can start using the `useAppEnvironmentVariables` hook immediately to access their application's environment variables.

