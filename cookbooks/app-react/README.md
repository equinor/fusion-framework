# Basic React App Cookbook

This cookbook demonstrates the fundamental setup for building a React application with the Fusion Framework.

## Overview

This is the simplest example of a Fusion Framework React application. It serves as the foundation for all other React cookbooks and shows the basic structure and configuration required to get started.

## Features

- ✅ **Basic Application Structure**: Simple React component setup
- ✅ **Framework Configuration**: Demonstrates app module configuration
- ✅ **Lifecycle Callbacks**: Shows how to use configuration and initialization callbacks
- ✅ **Minimal Boilerplate**: Clean, simple implementation

## Code Structure

### Main App Component (`src/App.tsx`)

```typescript
export const App = () => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f0f0',
        color: '#343434',
      }}
    >
      <h1>🚀 Hello Fusion 😎</h1>
    </div>
  );
};
```

### Configuration (`src/config.ts`)

The configuration module is where you set up the framework for your application:

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator, env) => {
  // This logs the render environment (e.g., development, production)
  console.log('configuring application', env);

  // Callback when configuration is created
  configurator.onConfigured((config) => {
    console.log('application config created', config);
  });

  // Callback when application modules have been initialized
  configurator.onInitialized((instance) => {
    console.log('application initialized', instance);
  });
};
```

## Key Concepts

### AppModuleInitiator

The `configure` function is an `AppModuleInitiator` that receives:
- **configurator**: Object that allows configuring framework modules
- **env**: The render environment information

### Configuration Lifecycle

1. **Configuration Phase**: The `configure` function is called
2. **onConfigured**: Fires when the configuration object is created
3. **onInitialized**: Fires when all modules are initialized

## Next Steps

Once you understand this basic setup, you can explore other cookbooks to learn how to:
- Add authentication (see `app-react-msal`)
- Use modules like HTTP, Context, or Navigation
- Implement features like bookmarks, settings, or routing

## Related Cookbooks

- **app-react-msal**: Add authentication to your app
- **app-react-router**: Add client-side routing
- **app-react-context**: Use shared context in your app