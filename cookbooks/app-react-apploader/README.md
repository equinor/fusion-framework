# App Loader Cookbook

This cookbook demonstrates how to load other applications inside your app using the app loader.

## What This Shows

This cookbook illustrates how to:
- Embed other Fusion Framework applications as widgets
- Use the Apploader component
- Load apps by their registry key

## Code Example

```typescript
import { Apploader } from '@equinor/fusion-framework-react-app/apploader';

export const App = () => {
  return (
    <div>
      <h1>Hello Fusion app</h1>
      <h2>App Loader</h2>
      <Apploader appKey="experience-to-learning-report" />
    </div>
  );
};
```

## Key Concepts

- `appKey`: The unique identifier in the app registry
- The loaded app runs in its own context
- Supports micro-frontend architectures

## When to Use App Loader

Use when you need to:
- Embed multiple apps in a dashboard
- Create a workspace with multiple tools
- Build widget-based interfaces