import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  RequiredRolesError,
  type RequiredRoleStatus,
} from '@equinor/fusion-framework-module-roles';

import { RoleErrorView } from './RoleErrorView';

const mocks = vi.hoisted(() => ({
  getRequiredRoleStatuses: vi.fn(),
  claimRole: vi.fn(),
}));

/**
 * Creates the wrapped error shape received by an application host.
 *
 * @param roles - Missing required role names.
 * @returns Application error containing a required-role cause.
 */
const createRequiredRolesError = (roles: readonly string[]): Error =>
  new Error('Application module initialization failed.', {
    cause: new RequiredRolesError('Roles module bootstrap denied.', roles, {
      getRequiredRoleStatuses: mocks.getRequiredRoleStatuses,
      claimRole: mocks.claimRole,
    }),
  });

describe('RoleErrorView', () => {
  beforeEach(() => {
    mocks.getRequiredRoleStatuses.mockReset();
    mocks.claimRole.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('states that an unregistered required role does not exist', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      { name: 'Missing.Role', exists: false, claims: [] },
    ] satisfies RequiredRoleStatus[]);

    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Missing.Role'])} onRetry={vi.fn()} />,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Role does not exist' }))
      .toBeVisible();
    await expect.element(screen.getByText('Missing.Role')).toBeVisible();
    await expect
      .element(screen.getByText('These exact access-role names are not registered in Roles V2.'))
      .toBeVisible();
    expect(mocks.getRequiredRoleStatuses).toHaveBeenCalledWith(['Missing.Role']);
  });

  it('states that an existing required role is not claimable by the account', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      {
        name: 'Fusion.Apps.FullControl',
        description: 'Manage every Fusion application.',
        exists: true,
        claims: [],
      },
    ] satisfies RequiredRoleStatus[]);

    const screen = await render(
      <RoleErrorView
        error={createRequiredRolesError(['Fusion.Apps.FullControl'])}
        onRetry={vi.fn()}
      />,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Role is not claimable' }))
      .toBeVisible();
    await expect.element(screen.getByText('Fusion.Apps.FullControl')).toBeVisible();
    await expect.element(screen.getByText('Manage every Fusion application.')).toBeVisible();
    await expect
      .element(
        screen.getByText(
          'The roles exist, but your account has no claimable assignment that grants them.',
        ),
      )
      .toBeVisible();
  });

  it('shows a user-friendly message when role availability cannot be checked', async () => {
    mocks.getRequiredRoleStatuses.mockRejectedValue(
      new RequiredRolesError('Roles module bootstrap denied.', ['Reports.Read']),
    );

    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Read'])} onRetry={vi.fn()} />,
    );

    await expect
      .element(
        screen.getByText('We could not check whether the required roles are available. Try again.'),
      )
      .toBeVisible();
    await expect
      .element(screen.getByText('Roles module bootstrap denied.', { exact: true }))
      .not.toBeInTheDocument();
    await expect.element(screen.getByText('Access denied')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Role does not exist')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Role is not claimable')).not.toBeInTheDocument();
  });

  it('retries failed metadata locally and restarts the host only after successful activation', async () => {
    const statuses = Promise.withResolvers<RequiredRoleStatus[]>();
    mocks.getRequiredRoleStatuses
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockReturnValueOnce(statuses.promise);
    mocks.claimRole.mockResolvedValue({});
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Read'])} onRetry={onRetry} />,
    );
    await screen.getByRole('button', { name: 'Retry role check' }).click();
    expect(mocks.getRequiredRoleStatuses).toHaveBeenCalledTimes(2);
    expect(mocks.getRequiredRoleStatuses).toHaveBeenLastCalledWith(['Reports.Read']);
    await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Retry role check' }))
      .not.toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
    expect(mocks.claimRole).not.toHaveBeenCalled();
    statuses.resolve([
      {
        name: 'Reports.Read',
        exists: true,
        claims: [{ assignmentId: 'reader', name: 'reader', displayName: 'Reports reader' }],
      },
    ]);
    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    expect(onRetry).not.toHaveBeenCalled();
    await screen.getByRole('dialog').getByRole('button', { name: 'Claim', exact: true }).click();
    await vi.waitFor(() => expect(onRetry).toHaveBeenCalledOnce());
  });

  it('keeps another failed metadata retry distinct from missing access', async () => {
    mocks.getRequiredRoleStatuses.mockRejectedValue(new Error('Service unavailable'));
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Read'])} onRetry={onRetry} />,
    );
    await screen.getByRole('button', { name: 'Retry role check' }).click();
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await expect.element(screen.getByText('Role does not exist')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Role is not claimable')).not.toBeInTheDocument();
    expect(mocks.getRequiredRoleStatuses).toHaveBeenCalledTimes(2);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('offers metadata retry when an injected provider throws before returning a promise', async () => {
    mocks.getRequiredRoleStatuses
      .mockImplementationOnce(() => {
        throw new Error('Synchronous metadata failure');
      })
      .mockResolvedValue([{ name: 'Reports.Read', exists: false, claims: [] }]);
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Read'])} onRetry={onRetry} />,
    );
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await screen.getByRole('button', { name: 'Retry role check' }).click();
    await expect
      .element(screen.getByRole('heading', { name: 'Role does not exist' }))
      .toBeVisible();
    expect(mocks.getRequiredRoleStatuses).toHaveBeenCalledTimes(2);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('does not offer an ineffective metadata retry when the error has no provider', async () => {
    const screen = await render(
      <RoleErrorView
        error={new RequiredRolesError('Legacy error', ['Reports.Read'])}
        onRetry={vi.fn()}
      />,
    );
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('The application Roles module cannot recover this role requirement.');
    await expect
      .element(screen.getByRole('button', { name: 'Retry role check' }))
      .not.toBeInTheDocument();
    expect(mocks.getRequiredRoleStatuses).not.toHaveBeenCalled();
  });

  it('ignores an obsolete metadata failure after changing the required-role error', async () => {
    const previous = Promise.withResolvers<RequiredRoleStatus[]>();
    mocks.getRequiredRoleStatuses
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce([
        { name: 'Reports.Export', exists: true, claims: [] },
      ] satisfies RequiredRoleStatus[]);
    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Read'])} onRetry={vi.fn()} />,
    );
    await screen.rerender(
      <RoleErrorView error={createRequiredRolesError(['Reports.Export'])} onRetry={vi.fn()} />,
    );
    await expect.element(screen.getByText('Reports.Export')).toBeVisible();
    previous.reject(new Error('Obsolete failure'));
    await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Reports.Export')).toBeVisible();
  });

  it('does not retain earlier role outcomes when replaced with an error without a provider', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      { name: 'Missing.Role', exists: false, claims: [] },
    ] satisfies RequiredRoleStatus[]);
    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Missing.Role'])} onRetry={vi.fn()} />,
    );
    await expect.element(screen.getByText('Role does not exist')).toBeVisible();
    await screen.rerender(
      <RoleErrorView
        error={new RequiredRolesError('Legacy error', ['Reports.Read'])}
        onRetry={vi.fn()}
      />,
    );
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await expect.element(screen.getByText('Role does not exist')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Missing.Role')).not.toBeInTheDocument();
  });

  it('claims an available required role before retrying the application', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Export',
        description: 'Export reports.',
        exists: true,
        claims: [
          {
            assignmentId: 'claimable-assignment',
            name: 'reports-exporter',
            displayName: 'Reports exporter',
            description: 'Claimable report-export access.',
          },
        ],
      },
    ] satisfies RequiredRoleStatus[]);
    mocks.claimRole.mockResolvedValue({ activeToDate: '2026-09-05T12:00:00Z' });
    const onRetry = vi.fn();

    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Export'])} onRetry={onRetry} />,
    );

    await expect
      .element(
        screen.getByRole('heading', {
          name: 'You are currently missing activation of role Reports.Export.',
        }),
      )
      .toBeVisible();
    await expect.element(screen.getByText('Claimable report-export access.')).toBeVisible();
    await screen.getByRole('button', { name: 'Claim' }).click();
    await expect.element(screen.getByText('Claim Reports exporter', { exact: true })).toBeVisible();
    await screen.getByRole('button', { name: 'Claim', exact: true }).last().click();

    await vi.waitFor(() => expect(onRetry).toHaveBeenCalledOnce());
    expect(mocks.claimRole).toHaveBeenCalledWith({
      roleId: 'claimable-assignment',
      reason: 'Required to access this application',
      hours: 2,
    });
  });

  it('does not retry the application when activation fails and exposes retry inside the dialog', async () => {
    mocks.getRequiredRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Export',
        exists: true,
        claims: [
          {
            assignmentId: 'claimable-assignment',
            name: 'reports-exporter',
            displayName: 'Reports exporter',
          },
        ],
      },
    ] satisfies RequiredRoleStatus[]);
    mocks.claimRole.mockRejectedValueOnce(new Error('Activation failed')).mockResolvedValue({});
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredRolesError(['Reports.Export'])} onRetry={onRetry} />,
    );
    await screen.getByRole('button', { name: 'Claim' }).click();
    const dialog = screen.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Claim', exact: true }).click();

    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent(
        'The role could not be activated. Try again or contact your administrator.',
      );
    expect(onRetry).not.toHaveBeenCalled();
    await dialog.getByRole('button', { name: 'Claim', exact: true }).click();
    await vi.waitFor(() => expect(onRetry).toHaveBeenCalledOnce());
    expect(mocks.claimRole).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when no required-role error is present', async () => {
    const screen = await render(
      <RoleErrorView error={new Error('Unrelated failure')} onRetry={vi.fn()} />,
    );

    await expect.element(screen.getByText('Access denied')).not.toBeInTheDocument();
    expect(mocks.getRequiredRoleStatuses).not.toHaveBeenCalled();
  });
});
