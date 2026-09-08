import type { FunctionComponent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework-react';

const mocks = vi.hoisted(() => ({
  createRoot: vi.fn(),
  render: vi.fn(),
  unmount: vi.fn(),
}));

vi.mock('react-dom/client', () => ({
  createRoot: mocks.createRoot,
}));

import type { ComponentRenderer } from '../create-component';
import { renderComponent } from '../render-component';

describe('renderComponent', () => {
  beforeEach(() => {
    mocks.createRoot.mockReset();
    mocks.render.mockReset();
    mocks.unmount.mockReset();
    mocks.createRoot.mockReturnValue({
      render: mocks.render,
      unmount: mocks.unmount,
    });
  });

  it('forwards uncaught React errors to the application host', () => {
    const Component: FunctionComponent = () => <div>Application</div>;
    const renderer = vi.fn(() => Component) as unknown as ComponentRenderer;
    const onError = vi.fn();
    const element = document.createElement('div');

    renderComponent(renderer)(element, {
      fusion: {} as Fusion,
      env: {} as AppEnv,
      onError,
    });

    expect(mocks.createRoot).toHaveBeenCalledWith(element, { onUncaughtError: onError });
  });
});
