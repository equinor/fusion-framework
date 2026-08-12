---
"@equinor/fusion-framework-react-app": minor
---

Add `renderAppComponent` to the `/vitest` entry-point, a component-level counterpart to `renderAppHook` for testing components (not just hooks) against a real, mock-backed application module scope.

```tsx
import { renderAppComponent } from '@equinor/fusion-framework-react-app/vitest';
import { waitFor } from '@testing-library/react';
import { Apploader } from '../apploader/Apploader';

const { container } = await renderAppComponent(<Apploader appKey="child-app" />);
await waitFor(() => expect(container.textContent).toContain('mounted'));
```

`renderAppComponent` wraps `@testing-library/react`'s `render` with the same `FrameworkProvider` + `ModuleProvider` nesting `renderAppHook` uses, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`), so tests can render a real component tree without hand-wiring those mocks.

The result also carries a nested `app` object (`app.modules`, `app.fusion`) — nested rather than spread directly onto the result so `@testing-library/react`'s own return shape stays free to evolve without ever colliding with it — so a test can drive a module directly after the initial render and assert the component re-renders, instead of hand-wiring `mockAppModules`/`ModuleProvider` itself to reach the same instance:

```tsx
const { getByText, app } = await renderAppComponent<[ContextModule]>(<App />, {
  configure: (configurator) => enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
});
await act(() => app.modules.context.setCurrentContextByIdAsync(projectB.id));
await waitFor(() => expect(getByText(/project-b/)).toBeInTheDocument());
```
