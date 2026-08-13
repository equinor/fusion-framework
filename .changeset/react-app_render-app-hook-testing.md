---
"@equinor/fusion-framework-react-app": major
---

Remove the `./vitest` entry-point. `renderAppHook` — a pre-wrapped `renderHook` for testing app-scoped hooks (`useAppModule`, `useAccessToken`, etc.) against a real, mock-backed module and framework instance, built on `vitest-browser-react` instead of the legacy DOM renderer — now lives in a separate package, `@equinor/fusion-framework-vitest-plugin-react-app`.

```tsx
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';

const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
await vi.waitFor(() => expect(result.current.pending).toBe(false));
```

`renderAppHook` wraps the hook with the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp` uses in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`), so app teams no longer need to hand-wire those mocks in every test.

The result also carries a nested `fusion` object (`fusion.framework`, `fusion.app`) — the same instances the hook rendered against, for driving a module the hook itself doesn't return — nested rather than spread directly onto the result so the underlying `renderHook` return shape stays free to evolve without ever colliding with it.

**Breaking change:** the `./vitest` entry-point is removed with no compatibility shim. Migrate by installing `@equinor/fusion-framework-vitest-plugin-react-app`, importing `renderAppHook` from it, using `vitest-browser-react`/`vitest` for rendering, waiting, and React updates, and reading `fusion.framework`/`fusion.app` instead of the old result shape.

```diff
-import { renderAppHook } from '@equinor/fusion-framework-react-app/vitest';
+import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
```
