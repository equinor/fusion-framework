import type { ContextResult, ContextResolver } from '@equinor/fusion-react-context-selector';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ContextSelector } from './ContextSelector';

const mocks = vi.hoisted(() => ({
  currentContext: [{ id: 'context-a', title: 'Context A', subTitle: 'Project' }] as ContextResult,
  currentContextRevision: 0,
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
    currentContextRevision: mocks.currentContextRevision,
  }),
}));

describe('ContextSelector', () => {
  afterEach(() => {
    cleanup();
    mocks.currentContext = [{ id: 'context-a', title: 'Context A', subTitle: 'Project' }];
    mocks.currentContextRevision = 0;
    mocks.clearCurrentContext.mockReset();
  });

  it('restores the same context after it is cleared programmatically', async () => {
    const selectedContext = mocks.currentContext;
    const screen = await render(<ContextSelector />);

    await screen.getByText('Context A').click();
    expect(document.querySelector('fwc-searchable-dropdown')).not.toBeNull();

    mocks.currentContext = [];
    mocks.currentContextRevision += 1;
    await screen.rerender(<ContextSelector />);
    mocks.currentContext = selectedContext;
    mocks.currentContextRevision += 1;
    await screen.rerender(<ContextSelector />);

    await expect.element(screen.getByText('Context A')).toBeVisible();
    expect(document.querySelector('fwc-searchable-dropdown')).toBeNull();
  });

  it('restores the same context when clear and restore updates are coalesced', async () => {
    const screen = await render(<ContextSelector />);

    await screen.getByRole('button').click();
    expect(mocks.clearCurrentContext).toHaveBeenCalledOnce();
    mocks.currentContextRevision += 2;
    await screen.rerender(<ContextSelector />);

    await expect.element(screen.getByText('Context A')).toBeVisible();
  });

  it('keeps the search view open across unrelated rerenders', async () => {
    const screen = await render(<ContextSelector />);

    await screen.getByText('Context A').click();
    await screen.rerender(<ContextSelector />);

    expect(document.querySelector('fwc-searchable-dropdown')).not.toBeNull();
  });
});
