import { ContextProvider, type ContextItem } from '@equinor/fusion-framework-module-context';
import { ContextSearch } from '@equinor/fusion-react-context-selector';
import { BehaviorSubject, EMPTY, lastValueFrom, of, throwError } from 'rxjs';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContextSelector } from './ContextSelector';

const mocks = vi.hoisted(() => ({
  useCurrentApp: vi.fn(),
  addEventListener: vi.fn(
    (
      _name: string,
      _listener: (event: { detail: { modules: { context: ContextProvider } } }) => void,
    ) => vi.fn(),
  ),
}));

vi.mock('@equinor/fusion-framework-react', () => ({
  useFramework: () => ({
    modules: { event: { addEventListener: mocks.addEventListener } },
  }),
}));

vi.mock('@equinor/fusion-framework-react/app', () => ({
  useCurrentApp: mocks.useCurrentApp,
}));

const project: ContextItem = {
  id: 'project-one',
  title: 'Project One',
  type: { id: 'ProjectMaster' },
  value: {},
};

describe('ContextSelector', () => {
  let provider: ContextProvider;

  beforeEach(() => {
    provider = new ContextProvider({
      config: {
        client: {
          get: { key: ({ id }) => id, client: { fn: () => of(project) } },
          query: { key: JSON.stringify, client: { fn: () => of([project]) } },
        },
      },
    });
    mocks.useCurrentApp.mockReturnValue({
      currentApp: { instance$: new BehaviorSubject({ context: provider }) },
    });
  });

  afterEach(() => {
    cleanup();
    provider.dispose();
    vi.clearAllMocks();
  });

  it('shows context set by the application before the selector mounts', async () => {
    await lastValueFrom(provider.setCurrentContext(project));

    const screen = await render(<ContextSelector />);

    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();
  });

  it('updates and clears the preview when the application changes context', async () => {
    const screen = await render(<ContextSelector />);
    await expect.element(screen.getByText('Select Context', { exact: true })).toBeVisible();

    await lastValueFrom(provider.setCurrentContext(project));
    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();

    await lastValueFrom(provider.setCurrentContext({ ...project, title: 'Renamed Project' }));
    await expect.element(screen.getByText('Renamed Project', { exact: true })).toBeVisible();

    provider.clearCurrentContext();
    await expect.element(screen.getByText('Select Context', { exact: true })).toBeVisible();
  });

  it('shows context resolved asynchronously by a route loader', async () => {
    const screen = await render(<ContextSelector />);
    await expect.element(screen.getByText('Select Context', { exact: true })).toBeVisible();

    await provider.setCurrentContextByIdAsync(project.id);

    expect(provider.currentContext?.id).toBe(project.id);
    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();
  });

  it('preserves the current preview when resolving another context fails', async () => {
    await provider.setCurrentContextByIdAsync(project.id);
    const screen = await render(<ContextSelector />);
    const error = new Error('Context lookup failed');
    vi.spyOn(provider.contextClient, 'resolveContext').mockReturnValue(throwError(() => error));

    await expect(provider.setCurrentContextByIdAsync('missing-context')).rejects.toThrow(error);

    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();
  });

  it('still clears the application context through the clear button', async () => {
    await provider.setCurrentContextByIdAsync(project.id);
    const screen = await render(<ContextSelector />);

    await screen.getByRole('button').click();

    await expect.poll(() => provider.currentContext).toBeNull();
    await expect.element(screen.getByText('Select Context', { exact: true })).toBeVisible();

    await provider.setCurrentContextByIdAsync(project.id);
    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();
  });

  it('does not reset other context previews when mounting or clearing', async () => {
    const screen = await render(
      <>
        <ContextSearch previewItem={{ id: 'other-context', title: 'Other Context' }} />
        <ContextSelector />
      </>,
    );

    await expect.element(screen.getByText('Other Context', { exact: true })).toBeVisible();
    await provider.setCurrentContextByIdAsync(project.id);
    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();

    provider.clearCurrentContext();

    await expect.element(screen.getByText('Select Context', { exact: true })).toBeVisible();
    await expect.element(screen.getByText('Other Context', { exact: true })).toBeVisible();
  });

  it('shows context from a legacy application registered after mount', async () => {
    mocks.useCurrentApp.mockReturnValue({ currentApp: { instance$: EMPTY } });
    await lastValueFrom(provider.setCurrentContext(project));
    const screen = await render(<ContextSelector />);

    const listener = mocks.addEventListener.mock.calls[0]?.[1];
    expect(listener).toBeDefined();
    listener?.({ detail: { modules: { context: provider } } });

    await expect.element(screen.getByText('Project One', { exact: true })).toBeVisible();
  });
});
