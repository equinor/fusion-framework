import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import type { ContextItem } from '@equinor/fusion-framework-react-module-context';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { expect, vi } from 'vitest';

import { configure } from './config';
import { useRelatedContext } from './useRelatedContext';

const project: ContextItem = {
  id: 'project-a',
  type: { id: 'ProjectMaster' },
  value: {},
  title: 'Project A',
};

const facility: ContextItem = {
  id: 'facility-a',
  type: { id: 'Facility' },
  value: {},
  title: 'Facility A',
};

const discipline: ContextItem = {
  id: 'discipline-a',
  type: { id: 'Discipline' },
  value: {},
  title: 'Discipline A',
};

/**
 * Configures the cookbook with deterministic context items for hook tests.
 * @param seed - Context mock setup applied after the cookbook configuration.
 * @returns An app mock configurator with seeded context data.
 */
const withSeededContext =
  (seed: Parameters<typeof enableContextMock>[1]): AppMockConfigureFn =>
  (configurator, args) => {
    configure(configurator, args);
    enableContextMock(configurator, seed);
  };

test('returns no related value when no current context is selected', async ({ renderHook }) => {
  const { result, unmount } = await renderHook(() => useRelatedContext());

  expect(result.current.value).toBeUndefined();

  await unmount();
});

test.override('configureApp', { injected: true }, () =>
  withSeededContext((mock) => {
    mock.setContexts([project, facility, discipline]);
    mock.setCurrentContext(project);
  }),
);

test('filters related contexts by the requested type', async ({ renderHook }) => {
  const { result, unmount } = await renderHook(() => useRelatedContext(['Facility']));

  await vi.waitFor(() => expect(result.current.value).toEqual([facility]));

  await unmount();
});
