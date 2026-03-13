# Basic React App Cookbook

A minimal Fusion Framework React application that highlights the essential pieces you need to get started.

## Features

- ✅ Minimal centered `App` component
- ✅ Simple configurator with logging callbacks
- ✅ Clean structure with very little boilerplate

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

The configurator logs the current render environment and the lifecycle callbacks that fire during setup.

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator, env) => {
  console.log('configuring application', env);

  configurator.onConfigured((config) => {
    console.log('application config created', config);
  });

  configurator.onInitialized((instance) => {
    console.log('application initialized', instance);
  });
};
```
