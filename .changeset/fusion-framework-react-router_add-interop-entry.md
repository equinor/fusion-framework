---
"@equinor/fusion-framework-react-router": minor
---

Add `./interop` entry point with curated deprecated re-exports of `react-router` symbols.

Teams that are mid-migration from `react-router` to `@equinor/fusion-framework-react-router`, or
that need `MemoryRouter` for testing and widget scenarios, can now import these symbols without
adding `react-router` as a direct dependency — which risks dual-bundling when the Fusion router is
also present.

**Exported symbols** (all marked `@deprecated` — interop only, will be removed in a future major):

```ts
import {
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
  Routes,
  Route,
} from '@equinor/fusion-framework-react-router/interop';
```

**Typical use cases:**

```tsx
// Testing with a memory router
import { MemoryRouter } from '@equinor/fusion-framework-react-router/interop';

render(
  <MemoryRouter initialEntries={['/products/42']}>
    <ProductPage />
  </MemoryRouter>,
);

// Widget / SSR — no window available
import { createMemoryRouter, RouterProvider } from '@equinor/fusion-framework-react-router/interop';

const router = createMemoryRouter(routes, { initialEntries: ['/'] });
root.render(<RouterProvider router={router} />);
```

These exports are a temporary bridge. Migrate to `@equinor/fusion-framework-react-router` fully
and remove the `/interop` import once your team is ready.
