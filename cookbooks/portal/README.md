# Portal Cookbook

This cookbook demonstrates the basic portal framework for building widget-based applications.

## What This Shows

This cookbook illustrates a simple portal implementation that provides a foundation for widget-based architectures.

## Code Example

```typescript
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Portal } from './Portal';

export const render = (el: HTMLElement) => {
  createRoot(el).render(createElement(Portal));
};
```

## Portal Component

```typescript
export const Portal = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#cfd2d3',
    }}>
      <div style={{
        maxHeight: '90%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}>
        <h1>Welcome to the CLI Demo Portal</h1>
        <p>This is a sample portal application.</p>
      </div>
    </div>
  );
};
```

## When to Use Portals

Use portals for:
- Widget-based application architecture
- Hosting multiple apps in cabinets
- Building workspaces with multiple tools