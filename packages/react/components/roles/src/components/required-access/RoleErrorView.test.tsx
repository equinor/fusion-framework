import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  RequiredAccessRolesError,
  type RequiredAccessRoleStatus,
} from '@equinor/fusion-framework-module-roles';

import { RoleErrorView } from './RoleErrorView';

const mocks = vi.hoisted(() => ({
  getRequiredAccessRoleStatuses: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
}));

/**
 * Creates the wrapped error shape received by an application host.
 *
 * @param roles - Missing required role names.
 * @returns Application error containing a required-role cause.
 */
const createRequiredAccessRolesError = (roles: readonly string[]): Error =>
  new Error('Application module initialization failed.', {
    cause: new RequiredAccessRolesError('Roles module bootstrap denied.', roles, {
      getRequiredAccessRoleStatuses: mocks.getRequiredAccessRoleStatuses,
      activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
    }),
  });

describe('RoleErrorView', () => {
  beforeEach(() => {
    mocks.getRequiredAccessRoleStatuses.mockReset();
    mocks.activateClaimableRoleAssignment.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('states that an unregistered required role does not exist', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      { name: 'Missing.Role', exists: false, claimableAssignments: [] },
    ] satisfies RequiredAccessRoleStatus[]);

    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Missing.Role'])} onRetry={vi.fn()} />,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Access role does not exist' }))
      .toBeVisible();
    await expect.element(screen.getByText('Missing.Role')).toBeVisible();
    await expect
      .element(screen.getByText('These exact access-role names are not registered in Roles V2.'))
      .toBeVisible();
    expect(mocks.getRequiredAccessRoleStatuses).toHaveBeenCalledWith(['Missing.Role']);
  });

  it('states that an existing required role is not claimable by the account', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      {
        name: 'Fusion.Apps.FullControl',
        description: 'Manage every Fusion application.',
        exists: true,
        claimableAssignments: [],
      },
    ] satisfies RequiredAccessRoleStatus[]);

    const screen = await render(
      <RoleErrorView
        error={createRequiredAccessRolesError(['Fusion.Apps.FullControl'])}
        onRetry={vi.fn()}
      />,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Access role is not claimable' }))
      .toBeVisible();
    await expect.element(screen.getByText('Fusion.Apps.FullControl')).toBeVisible();
    await expect.element(screen.getByText('Manage every Fusion application.')).toBeVisible();
    await expect
      .element(
        screen.getByText(
          'These access roles exist, but your account has no claimable role assignment that grants them.',
        ),
      )
      .toBeVisible();
  });

  it('shows a user-friendly message when role availability cannot be checked', async () => {
    mocks.getRequiredAccessRoleStatuses.mockRejectedValue(
      new RequiredAccessRolesError('Roles module bootstrap denied.', ['Reports.Read']),
    );

    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Reports.Read'])} onRetry={vi.fn()} />,
    );

    await expect
      .element(
        screen.getByText(
          'We could not check whether the required access roles are available. Try again.',
        ),
      )
      .toBeVisible();
    await expect
      .element(screen.getByText('Roles module bootstrap denied.', { exact: true }))
      .not.toBeInTheDocument();
    await expect.element(screen.getByText('Access denied')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Access role does not exist')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Access role is not claimable')).not.toBeInTheDocument();
  });

  it('retries failed metadata locally and restarts the host only after successful activation', async () => {
    const statuses = Promise.withResolvers<RequiredAccessRoleStatus[]>();
    mocks.getRequiredAccessRoleStatuses
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockReturnValueOnce(statuses.promise);
    mocks.activateClaimableRoleAssignment.mockResolvedValue({});
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Reports.Read'])} onRetry={onRetry} />,
    );
    await screen.getByRole('button', { name: 'Retry access check' }).click();
    expect(mocks.getRequiredAccessRoleStatuses).toHaveBeenCalledTimes(2);
    expect(mocks.getRequiredAccessRoleStatuses).toHaveBeenLastCalledWith(['Reports.Read']);
    await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Retry access check' }))
      .not.toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
    expect(mocks.activateClaimableRoleAssignment).not.toHaveBeenCalled();
    statuses.resolve([
      {
        name: 'Reports.Read',
        exists: true,
        claimableAssignments: [
          { assignmentId: 'reader', name: 'reader', displayName: 'Reports reader' },
        ],
      },
    ]);
    await screen.getByRole('button', { name: 'Claim', exact: true }).click();
    expect(onRetry).not.toHaveBeenCalled();
    await screen.getByRole('dialog').getByRole('button', { name: 'Claim', exact: true }).click();
    await vi.waitFor(() => expect(onRetry).toHaveBeenCalledOnce());
  });

  it('keeps another failed metadata retry distinct from missing access', async () => {
    mocks.getRequiredAccessRoleStatuses.mockRejectedValue(new Error('Service unavailable'));
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Reports.Read'])} onRetry={onRetry} />,
    );
    await screen.getByRole('button', { name: 'Retry access check' }).click();
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await expect.element(screen.getByText('Access role does not exist')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Access role is not claimable')).not.toBeInTheDocument();
    expect(mocks.getRequiredAccessRoleStatuses).toHaveBeenCalledTimes(2);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('offers metadata retry when an injected provider throws before returning a promise', async () => {
    mocks.getRequiredAccessRoleStatuses
      .mockImplementationOnce(() => {
        throw new Error('Synchronous metadata failure');
      })
      .mockResolvedValue([{ name: 'Reports.Read', exists: false, claimableAssignments: [] }]);
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Reports.Read'])} onRetry={onRetry} />,
    );
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await screen.getByRole('button', { name: 'Retry access check' }).click();
    await expect
      .element(screen.getByRole('heading', { name: 'Access role does not exist' }))
      .toBeVisible();
    expect(mocks.getRequiredAccessRoleStatuses).toHaveBeenCalledTimes(2);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('does not offer an ineffective metadata retry when the error has no provider', async () => {
    const screen = await render(
      <RoleErrorView
        error={new RequiredAccessRolesError('Legacy error', ['Reports.Read'])}
        onRetry={vi.fn()}
      />,
    );
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent(
        'The application Roles module cannot recover this access-role requirement.',
      );
    await expect
      .element(screen.getByRole('button', { name: 'Retry access check' }))
      .not.toBeInTheDocument();
    expect(mocks.getRequiredAccessRoleStatuses).not.toHaveBeenCalled();
  });

  it('ignores an obsolete metadata failure after changing the required-role error', async () => {
    const previous = Promise.withResolvers<RequiredAccessRoleStatus[]>();
    mocks.getRequiredAccessRoleStatuses
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce([
        { name: 'Reports.Export', exists: true, claimableAssignments: [] },
      ] satisfies RequiredAccessRoleStatus[]);
    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Reports.Read'])} onRetry={vi.fn()} />,
    );
    await screen.rerender(
      <RoleErrorView
        error={createRequiredAccessRolesError(['Reports.Export'])}
        onRetry={vi.fn()}
      />,
    );
    await expect.element(screen.getByText('Reports.Export')).toBeVisible();
    previous.reject(new Error('Obsolete failure'));
    await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Reports.Export')).toBeVisible();
  });

  it('does not retain earlier role outcomes when replaced with an error without a provider', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      { name: 'Missing.Role', exists: false, claimableAssignments: [] },
    ] satisfies RequiredAccessRoleStatus[]);
    const screen = await render(
      <RoleErrorView error={createRequiredAccessRolesError(['Missing.Role'])} onRetry={vi.fn()} />,
    );
    await expect.element(screen.getByText('Access role does not exist')).toBeVisible();
    await screen.rerender(
      <RoleErrorView
        error={new RequiredAccessRolesError('Legacy error', ['Reports.Read'])}
        onRetry={vi.fn()}
      />,
    );
    await expect.element(screen.getByRole('alert')).toBeVisible();
    await expect.element(screen.getByText('Access role does not exist')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Missing.Role')).not.toBeInTheDocument();
  });

  it('claims an available required role before retrying the application', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Export',
        description: 'Export reports.',
        exists: true,
        claimableAssignments: [
          {
            assignmentId: 'claimable-assignment',
            name: 'reports-exporter',
            displayName: 'Reports exporter',
            description: 'Claimable report-export access.',
          },
        ],
      },
    ] satisfies RequiredAccessRoleStatus[]);
    mocks.activateClaimableRoleAssignment.mockResolvedValue({
      activeToDate: '2026-09-05T12:00:00Z',
    });
    const onRetry = vi.fn();

    const screen = await render(
      <RoleErrorView
        error={createRequiredAccessRolesError(['Reports.Export'])}
        onRetry={onRetry}
      />,
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
    expect(mocks.activateClaimableRoleAssignment).toHaveBeenCalledWith({
      assignmentId: 'claimable-assignment',
      reason: 'Required to access this application',
      hours: 2,
    });
  });

  it('does not retry the application when activation fails and exposes retry inside the dialog', async () => {
    mocks.getRequiredAccessRoleStatuses.mockResolvedValue([
      {
        name: 'Reports.Export',
        exists: true,
        claimableAssignments: [
          {
            assignmentId: 'claimable-assignment',
            name: 'reports-exporter',
            displayName: 'Reports exporter',
          },
        ],
      },
    ] satisfies RequiredAccessRoleStatus[]);
    mocks.activateClaimableRoleAssignment
      .mockRejectedValueOnce(new Error('Activation failed'))
      .mockResolvedValue({});
    const onRetry = vi.fn();
    const screen = await render(
      <RoleErrorView
        error={createRequiredAccessRolesError(['Reports.Export'])}
        onRetry={onRetry}
      />,
    );
    await screen.getByRole('button', { name: 'Claim' }).click();
    const dialog = screen.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Claim', exact: true }).click();

    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent(
        'The claimable role assignment could not be activated. Try again or contact your administrator.',
      );
    expect(onRetry).not.toHaveBeenCalled();
    await dialog.getByRole('button', { name: 'Claim', exact: true }).click();
    await vi.waitFor(() => expect(onRetry).toHaveBeenCalledOnce());
    expect(mocks.activateClaimableRoleAssignment).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when no required-role error is present', async () => {
    const screen = await render(
      <RoleErrorView error={new Error('Unrelated failure')} onRetry={vi.fn()} />,
    );

    await expect.element(screen.getByText('Access denied')).not.toBeInTheDocument();
    expect(mocks.getRequiredAccessRoleStatuses).not.toHaveBeenCalled();
  });
});
