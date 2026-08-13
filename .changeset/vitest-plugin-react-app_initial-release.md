---
"@equinor/fusion-framework-vitest-plugin-react-app": minor
---

Add `@equinor/fusion-framework-vitest-plugin-react-app`: Vitest/`vitest-browser-react` helpers for testing a Fusion Framework React application inside a real, mock-backed application module scope — the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp`/`createComponent` wire up in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`).

```tsx
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';

const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
await vi.waitFor(() => expect(result.current.pending).toBe(false));
```

Highlights:

- `renderAppHook`/`renderAppComponent` — render a hook or component against the real `event`/`http`/`msal` module pipeline, with only the network boundary faked; the result carries a nested `fusion: { framework, app }` for driving a module directly after the initial render.
- `testApp` — a `vitest` `test` extended with `env`/`configure`/`app`/`render`/`renderHook` fixtures, for a test file whose cases share one mocked scope.
- `appTestVitePlugin` — a Vite plugin resolving an application's own manifest, config, and module-configurator (the same pipeline `ffc app build`/`ffc app dev` use) as virtual modules.
- A `/test` entry-point exporting `test`/`render`, pre-seeded from the resolved manifest/config/configure once `appTestVitePlugin` is registered — no per-test `env`/`configure` wiring.

This replaces `@equinor/fusion-framework-react-app`'s removed `./vitest` entry-point; see that package's changelog for migration notes.
