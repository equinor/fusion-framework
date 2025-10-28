# Vanilla JavaScript Cookbook

This cookbook demonstrates how to use the Fusion Framework without React using vanilla JavaScript and TypeScript.

## What This Shows

This cookbook illustrates how to:
- Configure Fusion Framework modules without React
- Access framework modules directly
- Render applications using vanilla DOM manipulation
- Use the `configureModules` pattern

## Code Example

```typescript
import { configureModules, type AppRenderFn } from '@equinor/fusion-framework-app';

/**
 * Configure all required modules
 */
const init = configureModules((configurator, env) => {
  console.log('configuring application', env);

  // Callback when configuration is created
  configurator.onConfigured((config) => {
    console.log('application config created', config);
  });

  // Callback when modules are initialized
  configurator.onInitialized((instance) => {
    console.log('application initialized', instance);
  });
});

/**
 * Render the application
 */
export const renderApp: AppRenderFn = (el, args) => {
  const myApp = document.createElement('pre');
  
  // Initialize modules and display result
  init(args)
    .then((modules) => {
      // Access modules directly (e.g., auth module)
      myApp.innerText = JSON.stringify(modules.auth.defaultAccount, null, 2);
    })
    .catch((error) => {
      // Display errors
      myApp.innerText = JSON.stringify(error, null, 2);
    });
  
  // Show loading state
  myApp.innerText = 'loading...';
  el.appendChild(myApp);
};
```

## When to Use This Pattern

Use vanilla JavaScript approach when:
- Building non-React applications
- Progressive enhancement
- Custom renderers
- Legacy system integration