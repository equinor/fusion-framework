import { createElement, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework-react';

const mocks = vi.hoisted(() => ({
  configureModules: vi.fn(),
  initialize: vi.fn(),
}));

vi.mock('@equinor/fusion-framework-app', () => ({
  configureModules: mocks.configureModules,
}));

import { makeComponent } from '../make-component';

describe('makeComponent', () => {
  beforeEach(() => {
    mocks.configureModules.mockReset();
    mocks.initialize.mockReset();
    mocks.configureModules.mockReturnValue(mocks.initialize);
  });

  it('reports module initialization failures to the application host', async () => {
    const error = new Error('Roles module bootstrap denied.');
    const onError = vi.fn();
    const onUncaughtError = vi.fn();
    mocks.initialize.mockRejectedValue(error);

    const Component = makeComponent(createElement('div'), {
      fusion: {} as Fusion,
      env: {} as AppEnv,
      onError,
    });
    const element = document.createElement('div');
    const root = createRoot(element, { onUncaughtError });
    root.render(createElement(Suspense, { fallback: null }, createElement(Component)));

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error));
    await vi.waitFor(() => expect(onUncaughtError).toHaveBeenCalledWith(error, expect.anything()));
    root.unmount();
  });
});
