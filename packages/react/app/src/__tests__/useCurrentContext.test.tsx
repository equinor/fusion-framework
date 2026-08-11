import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';

import { useCurrentContext } from '../context/useCurrentContext';
import { renderAppHook } from '../testing/render-app-hook';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

const project: ContextItem = {
  id: 'ctx-1',
  title: 'My project',
  type: { id: 'ProjectMaster' },
  value: {},
};
const facility: ContextItem = {
  id: 'ctx-2',
  title: 'My facility',
  type: { id: 'Facility' },
  value: {},
};

describe('useCurrentContext', () => {
  it('resolves the context item selected on startup from the app-scoped context module', async () => {
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );
    const configure: AppMockConfigureFn<[ContextModule]> = (configurator) =>
      enableContextMock(configurator, (mock) => {
        mock.setCurrentContext(project);
      });

    const { result } = await renderAppHook(() => useCurrentContext(), { env, fusion, configure });

    await waitFor(() => expect(result.current.currentContext).toMatchObject({ id: project.id }));
  });

  it('switches the current context when setCurrentContext is called with another seeded item', async () => {
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );
    const configure: AppMockConfigureFn<[ContextModule]> = (configurator) =>
      enableContextMock(configurator, (mock) => {
        mock.setCurrentContext(project);
        mock.addContext(facility);
      });

    const { result } = await renderAppHook(() => useCurrentContext(), { env, fusion, configure });
    await waitFor(() => expect(result.current.currentContext).toMatchObject({ id: project.id }));

    await act(async () => {
      await result.current.setCurrentContext(facility.id);
    });

    await waitFor(() => expect(result.current.currentContext).toMatchObject({ id: facility.id }));
  });
});
