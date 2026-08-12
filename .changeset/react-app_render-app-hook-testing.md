---
"@equinor/fusion-framework-react-app": minor
---

Add a `/vitest` entry-point with `renderAppHook`, a pre-wrapped `renderHook` for testing app-scoped hooks (`useAppModule`, `useAccessToken`, etc.) against a real, mock-backed module and framework instance.

```tsx
import { renderAppHook } from '@equinor/fusion-framework-react-app/vitest';
import { waitFor } from '@testing-library/react';

const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
await waitFor(() => expect(result.current.pending).toBe(false));
```

`renderAppHook` wraps the hook with the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp` uses in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`), so app teams no longer need to hand-wire those mocks in every test.

The result also carries a nested `app` object (`app.modules`, `app.fusion`) — the same instances the hook rendered against, for driving a module the hook itself doesn't return — nested rather than spread directly onto the result so `@testing-library/react`'s own return shape stays free to evolve without ever colliding with it.

Requires `@testing-library/react` (added as an optional peer dependency).
