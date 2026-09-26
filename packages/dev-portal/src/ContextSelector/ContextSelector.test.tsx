import type { ContextResult, ContextResolver } from '@equinor/fusion-react-context-selector';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ContextSelector } from './ContextSelector';

const mocks = vi.hoisted(() => ({
  currentContext: [{ id: 'context-a', title: 'Context A', subTitle: 'Project' }] as ContextResult,
  clearCurrentContext: vi.fn(),
}));

vi.mock('./useContextResolver', () => ({
  useContextResolver: () => ({
    resolver: {
      searchQuery: vi.fn().mockResolvedValue([]),
      initialResult: mocks.currentContext,
    } satisfies ContextResolver,
    provider: {
      clearCurrentContext: mocks.clearCurrentContext,
    },
    currentContext: mocks.currentContext,
  }),
}));

describe('ContextSelector', () => {
  afterEach(() => {
    cleanup();
    mocks.currentContext = [{ id: 'context-a', title: 'Context A', subTitle: 'Project' }];
    mocks.clearCurrentContext.mockReset();
  });

  it('restores the same context after it is cleared programmatically', async () => {
    const selectedContext = mocks.currentContext;
    const screen = await render(<ContextSelector />);

    await screen.getByText('Context A').click();
    expect(document.querySelector('fwc-searchable-dropdown')).not.toBeNull();

    mocks.currentContext = [];
    await screen.rerender(<ContextSelector />);
    mocks.currentContext = selectedContext;
    await screen.rerender(<ContextSelector />);

    await expect.element(screen.getByText('Context A')).toBeVisible();
    expect(document.querySelector('fwc-searchable-dropdown')).toBeNull();
  });

  it('restores the same context when clear and restore updates are coalesced', async () => {
    const screen = await render(<ContextSelector />);

    await screen.getByRole('button').click();
    expect(mocks.clearCurrentContext).toHaveBeenCalledOnce();
    await screen.rerender(<ContextSelector />);

    await expect.element(screen.getByText('Context A')).toBeVisible();
  });
});