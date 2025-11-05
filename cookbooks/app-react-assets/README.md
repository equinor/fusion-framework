# Assets Cookbook

This cookbook demonstrates how to import and use static assets like images in your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Import images using TypeScript/ES6 import syntax
- Display static images in React components
- Configure TypeScript to recognize asset types

## Code Example

### Import and Use an Image

```typescript
import memeUrl from './mount_batur.jpg';

export const App = () => (
  <div>
    <img
      src={memeUrl}
      alt="should display in cookbook"
      style={{ maxWidth: '100vw', height: 'auto', display: 'block' }}
    />
  </div>
);
```

### TypeScript Declarations

In `src/global.d.ts`:

```typescript
declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}
```

This allows TypeScript to recognize image imports and provide type safety.

## Why Use Import Syntax

Importing assets ensures:
- Type safety
- Build-time validation
- Asset optimization
- Proper bundling

## When to Use This Pattern

Use asset imports for:
- Images
- Fonts
- Other static files