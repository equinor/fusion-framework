---
"@equinor/fusion-framework-react-app": minor
---

Add `renderAppComponent` to the `/testing` entry-point, a component-level counterpart to `renderAppHook` for testing components (not just hooks) against a real, mock-backed application module scope.

```tsx
import { renderAppComponent } from '@equinor/fusion-framework-react-app/testing';
import { waitFor } from '@testing-library/react';
import { Apploader } from '../apploader/Apploader';

const { container } = await renderAppComponent(<Apploader appKey="child-app" />);
await waitFor(() => expect(container.textContent).toContain('mounted'));
```

`renderAppComponent` wraps `@testing-library/react`'s `render` with the same `FrameworkProvider` + `ModuleProvider` nesting `renderAppHook` uses, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`), so tests can render a real component tree without hand-wiring those mocks.
