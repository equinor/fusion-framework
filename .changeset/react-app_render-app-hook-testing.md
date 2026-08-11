---
"@equinor/fusion-framework-react-app": minor
---

Add a `/testing` entry-point with `renderAppHook`, a pre-wrapped `renderHook` for testing app-scoped hooks (`useAppModule`, `useAccessToken`, etc.) against a real, mock-backed module and framework instance.

```tsx
import { renderAppHook } from '@equinor/fusion-framework-react-app/testing';
import { waitFor } from '@testing-library/react';

const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
await waitFor(() => expect(result.current.pending).toBe(false));
```

`renderAppHook` wraps the hook with the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp` uses in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`), so app teams no longer need to hand-wire those mocks in every test.

Requires `@testing-library/react` (added as an optional peer dependency).
