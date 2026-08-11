import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';

import useAppModule from '../useAppModule';
import { useHelpCenter } from '../help-center/useHelpCenter';
import { EVENT_NAME } from '../help-center/event-name.js';
import { renderAppHook } from '../testing/render-app-hook';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

describe('useHelpCenter', () => {
  it('dispatches the expected page and detail for every help-center action', async () => {
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );

    const { result } = await renderAppHook(
      () => ({ helpCenter: useHelpCenter(), eventModule: useAppModule('event') }),
      { env, fusion },
    );

    const received: Array<{ page: string } & Record<string, unknown>> = [];
    result.current.eventModule.addEventListener(EVENT_NAME, (event) => {
      received.push(event.detail as { page: string } & Record<string, unknown>);
    });

    result.current.helpCenter.openHelp();
    await waitFor(() => expect(received).toHaveLength(1));

    result.current.helpCenter.openArticle('my-article');
    await waitFor(() => expect(received).toHaveLength(2));

    result.current.helpCenter.openFaqs();
    await waitFor(() => expect(received).toHaveLength(3));

    result.current.helpCenter.openSearch('my search');
    await waitFor(() => expect(received).toHaveLength(4));

    result.current.helpCenter.openGovernance();
    await waitFor(() => expect(received).toHaveLength(5));

    result.current.helpCenter.openReleaseNotes();
    await waitFor(() => expect(received).toHaveLength(6));

    expect(received).toEqual([
      { page: 'home' },
      { page: 'article', articleId: 'my-article' },
      { page: 'faqs' },
      { page: 'search', search: 'my search' },
      { page: 'governance' },
      { page: 'release-notes' },
    ]);
  });
});
