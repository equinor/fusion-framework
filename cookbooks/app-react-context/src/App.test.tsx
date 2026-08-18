import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import type { AppModulesInstance } from '@equinor/fusion-framework-react-app';
import { mockFramework } from '@equinor/fusion-framework/mock';
import type { FusionModulesInstance } from '@equinor/fusion-framework';
import { enableAppManifestMock, type AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-react-module-context';
import { act } from 'react';
import { describe, expect, vi } from 'vitest';

import { App } from './App';
import { configure } from './config';

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
 * Composes the cookbook's real `configure` with `enableContextMock`, which
 * replaces the real context module `enableContext` just registered — seeding
 * known context items without a fake router or network mock.
 */
const withSeededContext =
  (seed: Parameters<typeof enableContextMock>[1]): AppMockConfigureFn =>
  (configurator, args) => {
    configure(configurator, args);
    enableContextMock(configurator, seed);
  };

// --- test setup: each variant seeds a different context scenario via the `configureApp` fixture ---

// --- tests ---

test('renders the current and related context sections once the app configuration has initialized', async ({
  render,
}) => {
  const { getByRole, unmount } = await render(<App />);

  await expect.element(getByRole('heading', { name: /current context/i })).toBeInTheDocument();
  await expect.element(getByRole('heading', { name: /related context/i })).toBeInTheDocument();

  await unmount();
});

describe('with an initial project', () => {
  test.override('configureApp', { injected: true }, () =>
    withSeededContext((mock) => {
      mock.setCurrentContext(project);
    }),
  );

  test('displays the initial context the app resolves on startup', async ({ render }) => {
    const { getByText, unmount } = await render(<App />);

    await expect.element(getByText(/project-a/)).toBeInTheDocument();

    await unmount();
  });
});

describe('with related contexts', () => {
  test.override('configureApp', { injected: true }, () =>
    withSeededContext((mock) => {
      // a realistic pool: related items are a different type than the current context, never the same
      mock.setContexts([project, facility, discipline]);
      mock.setCurrentContext(project);
    }),
  );

  test('resolves related items for the current context, excluding itself', async ({ render }) => {
    const { getByRole, unmount } = await render(<App />);

    // the related section is the <pre> immediately following its own heading
    const relatedPre = getByRole('heading', { name: /related context/i }).element()
      .nextElementSibling as HTMLElement;
    await vi.waitFor(() => expect(relatedPre.textContent).toContain('facility-a'));
    expect(relatedPre.textContent).toContain('discipline-a');
    expect(relatedPre.textContent).not.toContain('project-a');

    await unmount();
  });
});

describe('when the app context changes', () => {
  test.override('configureApp', { injected: true }, () =>
    withSeededContext((mock) => {
      mock.setContexts([project, facility]);
      mock.setCurrentContext(project);
    }),
  );

  test('re-renders with the new context', async ({ render, app }) => {
    const { getByRole, getByText, unmount } = await render(<App />);

    const relatedPre = getByRole('heading', { name: /related context/i }).element()
      .nextElementSibling as HTMLElement;

    await expect.element(getByText(/project-a/)).toBeInTheDocument();
    await vi.waitFor(() => expect(relatedPre.textContent).toContain('facility-a'));

    // drives the switch through the same provider App reads its context from, into a different-typed context
    const context = (app as AppModulesInstance<[ContextModule]>).context;
    await act(() => context.setCurrentContextByIdAsync(facility.id));

    await expect.element(getByText(/facility-a/)).toBeInTheDocument();
    // related context flips along with it — now excludes facility (the new current) and includes project
    await vi.waitFor(() => expect(relatedPre.textContent).toContain('project-a'));
    expect(relatedPre.textContent).not.toContain('facility-a');

    await unmount();
  });
});

describe('with a parent framework context', () => {
  // the app mirrors the parent's context, while its local mock pool resolves mirrored items without a network request
  test.override('configureApp', { injected: true }, () =>
    withSeededContext((mock) => {
      mock.setContexts([project, facility]);
    }),
  );
  test.override('fusion', async ({ appEnv }) =>
    mockFramework<[AppModule, ContextModule]>((configurator) => {
      enableAppManifestMock(configurator, appEnv);
      enableContextMock(configurator, (mock) => {
        mock.setContexts([project, facility]);
        mock.setCurrentContext(project);
      });
    }),
  );

  test('mirrors the context the parent sets', async ({ render, fusion }) => {
    const { getByRole, unmount } = await render(<App />);

    // scoped to the current-context <pre>: `facility-a` already appears in the related
    // section from the start, so a page-wide text match wouldn't prove anything switched
    const currentPre = getByRole('heading', { name: /current context/i }).element()
      .nextElementSibling as HTMLElement;
    await vi.waitFor(() => expect(currentPre.textContent).toContain('project-a'));

    // the framework's own context module drives this change, not the app's
    const parentContext = (fusion.modules as FusionModulesInstance<[ContextModule]>).context;
    await act(() => parentContext.setCurrentContextByIdAsync(facility.id));

    await vi.waitFor(() => expect(currentPre.textContent).toContain('facility-a'));

    await unmount();
  });
});
