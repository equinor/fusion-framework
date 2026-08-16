# Test a Fusion React app with Vitest

Use `@equinor/fusion-framework-vitest-plugin-react-app` to render an existing Fusion React
app in Vitest Browser Mode. The test runs in Chromium with a fresh framework and application
module scope, a deterministic signed-in `Test User`, and no running portal or real credentials.

## Install

```sh
pnpm add -D vitest playwright @vitest/browser-playwright vitest-browser-react \
  @equinor/fusion-framework-vitest-plugin-react-app
pnpm exec playwright install chromium
```

React, React DOM, RxJS, and Vite are peer dependencies that a Fusion React app normally
already provides.

## Configure Vitest

Create `vitest.config.ts` at the app project root:

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

export default defineProject();
```

`defineProject` registers `appTestVitePlugin`, enables headless Chromium through Playwright,
includes `src/**/*.{test,spec}.{ts,tsx}`, and warms application source files so lazy route
imports do not reload the browser during a test.

## Write the first app test

```tsx
import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { App } from './App';

test('renders the app', async ({ render }) => {
  const screen = await render(<App />);
  await expect.element(screen.getByRole('heading')).toBeVisible();
});
```

The `/test` entry point resolves the app's manifest, `app.config.ts`, and module configurator
through the registered Vite plugin. Always await `render`, `renderHook`,
`renderAppComponent`, and `renderAppHook`; Fusion module initialization completes before the
first render.

## Run

```sh
pnpm exec vitest
pnpm exec vitest run
```

The first command watches for changes. The second performs one run for CI. A successful run
reports one passing test and requires no portal, credentials, or backend service.

## Next steps

- [Configure the test project and app-file resolution](configuration.md)
- [Resolve common setup, browser, and network failures](troubleshooting.md)
- [Seed Fusion module dependencies](module-mocks.md)
- [Choose between app, framework, module, and HTTP test layers](../../../framework/docs/testing-choosing-a-layer.md)
- [Seed authentication, context, service discovery, and HTTP](../README.md#overview)
