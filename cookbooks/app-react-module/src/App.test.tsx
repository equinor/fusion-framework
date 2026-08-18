import { describe, expect } from 'vitest';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { App } from './App';
import { demoModule, type DemoModule } from './modules/demo';

/**
 * Configures the demo module with given `foo`/`bar` values instead of the cookbook's
 * real `config.ts`, so a test can assert against known, distinct values.
 */
const withDemoConfig =
  (foo: string, bar: number): AppModuleInitiator<[DemoModule]> =>
  (configurator) => {
    configurator.addConfig({
      module: demoModule,
      configure(configBuilder) {
        configBuilder.setFoo(async () => foo);
        configBuilder.setBar(async () => bar);
      },
    });
  };

// --- tests ---

test("renders the demo module's resolved foo/bar values", async ({ render }) => {
  const { getByText, unmount } = await render(<App />);

  await expect.element(getByText('foo: https://foo.bar')).toBeInTheDocument();
  await expect.element(getByText('bar: 69')).toBeInTheDocument();

  await unmount();
});

describe('with an overridden demo configuration', () => {
  test.override('configureApp', { injected: true }, () => withDemoConfig('https://example.com', 7));

  test('renders the overridden foo/bar values instead of the app defaults', async ({ render }) => {
    const { getByText, unmount } = await render(<App />);

    await expect.element(getByText('foo: https://example.com')).toBeInTheDocument();
    await expect.element(getByText('bar: 7')).toBeInTheDocument();

    await unmount();
  });
});
