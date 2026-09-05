import { of } from 'rxjs';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppLoader } from './AppLoader';

const mocks = vi.hoisted(() => {
  const initialize = vi.fn();
  const setCurrentApp = vi.fn();
  const currentApp = { appKey: 'reports-app', tag: undefined, initialize };
  return {
    renderApp: vi.fn(),
    getRequiredRoleStatuses: vi.fn(),
    claimRole: vi.fn(),
    setCurrentApp,
    initialize,
    framework: {
      modules: {
        app: {
          current: currentApp,
          current$: {},
          setCurrentApp,
        },
      },
    },
    observableState: {
      value: currentApp,
    },
  };
});

vi.mock('@equinor/fusion-framework-react', () => ({
  useFramework: () => mocks.framework,
}));

vi.mock('@equinor/fusion-observable/react', () => ({
  useObservableState: () => mocks.observableState,
}));

describe('AppLoader', () => {
  beforeEach(() => {
    mocks.renderApp.mockReset();
    mocks.setCurrentApp.mockReset();
    mocks.initialize.mockReset();
    mocks.getRequiredRoleStatuses.mockReset();
    mocks.claimRole.mockReset();
    mocks.initialize.mockReturnValue(
      of({
        manifest: { appKey: 'reports-app', build: {} },
        config: {},
        script: { renderApp: mocks.renderApp },
      }),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the application again when the error boundary requests a retry', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Read',
        exists: true,
        claims: [
          {
            assignmentId: 'assignment-id',
            name: 'reports-reader',
            displayName: 'Reports reader',
          },
        ],
      },
    ]);
    mocks.claimRole.mockResolvedValue({ activeToDate: '2026-09-05T12:00:00Z' });
    mocks.renderApp.mockImplementation((element, args) => {
      // The first render reports a recoverable failure; retry renders the resolved app.
      if (mocks.renderApp.mock.calls.length === 1) {
        // Mimic a structurally compatible error from a separately bundled application.
        args.onError(
          Object.assign(new Error('Missing required role.'), {
            name: 'RequiredRolesError',
            type: 'RolesError',
            missingRoles: ['Reports.Read'],
            provider: {
              getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
              claimRole: mocks.claimRole,
            },
          }),
        );
      } else {
        element.textContent = 'Application rendered';
      }
      return vi.fn();
    });

    const screen = await render(<AppLoader appKey="reports-app" />);

    await screen.getByRole('button', { name: 'Claim' }).click();
    await screen.getByRole('button', { name: 'Claim', exact: true }).last().click();

    await expect.element(screen.getByText('Application rendered')).toBeVisible();
    expect(mocks.claimRole).toHaveBeenCalledOnce();
    expect(mocks.claimRole).toHaveBeenCalledWith({
      roleId: 'assignment-id',
      reason: 'Required to access this application',
      hours: 2,
    });
    expect(mocks.initialize).toHaveBeenCalledTimes(2);
    expect(mocks.renderApp).toHaveBeenCalledTimes(2);
    expect(mocks.setCurrentApp).not.toHaveBeenCalled();
  });

  it('renders the generic fallback for an unrelated application error', async () => {
    mocks.renderApp.mockImplementation((_element, args) => {
      args.onError(new Error('Unexpected render failure'));
      return vi.fn();
    });

    const screen = await render(<AppLoader appKey="reports-app" />);

    await expect
      .element(screen.getByRole('heading', { name: '🔥 Failed to load application 🤬' }))
      .toBeVisible();
    await expect
      .element(screen.getByRole('heading', { name: 'Unexpected render failure' }))
      .toBeVisible();
  });
});
