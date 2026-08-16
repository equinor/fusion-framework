# Why Browser Mode is the default

`@equinor/fusion-framework-vitest-plugin-react-app` runs component and hook tests in headless
Chromium by default. A real browser gives these tests more accurate DOM behavior, but it is
slower than `happy-dom` or `jsdom`.

This guide explains that tradeoff and shows how to use a different browser or renderer when a
test does not need Chromium.

## Performance

A real browser is slower than DOM emulation. `happy-dom` and `jsdom` run in the same Node process
as the test. Browser Mode starts Chromium through Playwright and communicates with that browser
process.

Choose Browser Mode for fidelity, not speed. Keep fast unit tests on Node or DOM emulation when
they do not need browser behavior.

## Why use a real browser

- **React compatibility:** the previous React test setup failed after its React 19 peer
  dependency update. The repository then moved those tests to Vitest Browser Mode. See the
  `packages/utils/observable` 8.4.4 changelog and migration commit `059aefae5d`.
- **Real framework execution:** tests control external boundaries and seed module state through
  [Module mocks](module-mocks.md), while the actual module configuration, lifecycle, providers,
  and rendering behavior still run.
- **Browser fidelity:** Chromium provides real layout, `ResizeObserver`, custom elements, and
  Shadow DOM. This can remove DOM polyfills and component replacements that only exist because
  `happy-dom` or `jsdom` cannot provide the required browser behavior.

A real browser does not remove every test workaround. AG Grid license messages and Lit dev-mode
warnings can still occur in Chromium. Component mocks may also be useful because they simplify
focused tests. Remove a workaround only after running the affected test against the real
component.

## Choose a different runtime

You can change either the browser provider or the renderer:

- Stay in Browser Mode and replace Playwright with another Vitest browser provider.
- Keep the Fusion module setup but render with `happy-dom` or `jsdom`.

### Use another browser provider

Pass `test.browser.provider` to `defineProject` to replace Playwright while staying in Browser
Mode. This example uses WebdriverIO:

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';
import { webdriverio } from '@vitest/browser-webdriverio';

export default defineProject({
  test: { browser: { provider: webdriverio() } },
});
```

See [Configuration](configuration.md) for the complete `defineProject` behavior.

### Use happy-dom or jsdom

The Fusion module setup does not depend on Browser Mode. Build the same provider tree and pass it
to another renderer. The example below uses `@testing-library/react` on `happy-dom`:

```tsx
import { render } from '@testing-library/react';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock, mockAppModules } from '@equinor/fusion-framework-app/mock';
import { FrameworkProvider } from '@equinor/fusion-framework-react';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { ReactElement } from 'react';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'Test app',
    type: 'standalone',
  },
} as const;

async function renderWithHappyDom(ui: ReactElement) {
  const framework = await mockFramework<[AppModule]>((configurator) =>
    enableAppManifestMock(configurator, env),
  );
  const app = await mockAppModules(undefined, env, framework);
  return render(ui, {
    wrapper: ({ children }) => (
      <FrameworkProvider value={framework}>
        <ModuleProvider value={app}>{children}</ModuleProvider>
      </FrameworkProvider>
    ),
  });
}
```

Run the test in a Vitest project with `environment: 'happy-dom'` instead of
`browser.enabled`. Use a separate project if the same app also has Browser Mode tests.

Call the same `enable*Mock` functions from the `mockAppModules` configuration callback. These
mocks configure Fusion modules and do not depend on the renderer. `renderHook` from
`@testing-library/react` can use the same wrapper for hook tests.

Use Browser Mode when browser behavior matters. Use `happy-dom`, `jsdom`, or no DOM for focused
tests that only need application logic or simple rendering.

## Related documentation

- [Overview](overview.md)
- [Configuration](configuration.md)
- [Module mocks](module-mocks.md)
- [Migrate an existing app to Fusion Vitest](migrating-an-existing-app.md)
- [Choose a Fusion testing layer](../../../framework/docs/testing-choosing-a-layer.md)
