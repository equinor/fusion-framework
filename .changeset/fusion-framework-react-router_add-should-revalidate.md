---
"@equinor/fusion-framework-react-router": patch
---

Add `shouldRevalidate` support to the file-route Vite plugin.

The Vite plugin now detects and wires a `shouldRevalidate` named export from route files into the generated React Router data route. This allows apps to control whether a route re-runs its loader after a navigation or action — for example to prevent revalidation on search-parameter-only changes.

```ts
// src/pages/ProductsPage.tsx
import type { ShouldRevalidateFunctionArgs } from 'react-router';

export function shouldRevalidate({ currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
  // Only revalidate when the path segment changes, not on search param updates
  return currentUrl.pathname !== nextUrl.pathname;
}

export default function ProductsPage() { ... }
```

Reported by: @yusijs in equinor/fusion#870
Closes: https://github.com/equinor/fusion-core-tasks/issues/1631
