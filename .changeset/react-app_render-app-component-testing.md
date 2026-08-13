---
"@equinor/fusion-framework-react-app": major
---

Remove the `./vitest` entry-point. `renderAppComponent` — a component-level counterpart to `renderAppHook` for testing components (not just hooks) against a real, mock-backed application module scope, built on `vitest-browser-react` instead of the legacy DOM renderer — now lives in a separate package, `@equinor/fusion-framework-vitest-plugin-react-app`.

```tsx
import { renderAppComponent } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { Apploader } from '../apploader/Apploader';

const screen = await renderAppComponent(<Apploader appKey="child-app" />);
await expect.element(screen.getByText('mounted')).toBeVisible();
```

`renderAppComponent` wraps `vitest-browser-react`'s `render` with the same `FrameworkProvider` + `ModuleProvider` nesting `renderAppHook` uses, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`), so tests can render a real component tree without hand-wiring those mocks.

The result also carries a nested `fusion` object (`fusion.framework`, `fusion.app`) — nested rather than spread directly onto the result so `vitest-browser-react`'s own return shape stays free to evolve without ever colliding with it — so a test can drive a module directly after the initial render and assert the component re-renders, instead of hand-wiring `mockAppModules`/`ModuleProvider` itself to reach the same instance:

```tsx
const { getByText, fusion } = await renderAppComponent<[ContextModule]>(<App />, {
  configure: (configurator) => enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
});
await act(() => fusion.app.context.setCurrentContextByIdAsync(projectB.id));
await expect.element(getByText(/project-b/)).toBeVisible();
```

**Breaking change:** the `./vitest` entry-point is removed with no compatibility shim. Migrate by installing `@equinor/fusion-framework-vitest-plugin-react-app`, importing `renderAppComponent` from it, and using `vitest-browser-react`/`vitest` for `render`, waiting, and React updates.
