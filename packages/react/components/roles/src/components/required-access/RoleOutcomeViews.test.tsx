import { cleanup, render } from 'vitest-browser-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CheckingRolesView } from './CheckingRolesView';
import { RoleClaimableView } from './RoleClaimableView';
import { RoleDoesNotExistView } from './RoleDoesNotExistView';
import { RoleNotClaimableView } from './RoleNotClaimableView';

describe('role outcome views', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the checking outcome', async () => {
    const screen = await render(<CheckingRolesView />);

    await expect
      .element(screen.getByText('Checking required access-role availability...'))
      .toBeVisible();
  });

  it('renders only roles that do not exist', async () => {
    const screen = await render(
      <RoleDoesNotExistView
        statuses={[
          { name: 'Missing.Role', exists: false, claimableAssignments: [] },
          { name: 'Existing.Role', exists: true, claimableAssignments: [] },
        ]}
      />,
    );

    await expect.element(screen.getByText('Missing.Role')).toBeVisible();
    await expect.element(screen.getByText('Existing.Role')).not.toBeInTheDocument();
  });

  it('renders only existing roles that are not claimable', async () => {
    const screen = await render(
      <RoleNotClaimableView
        statuses={[
          { name: 'Unavailable.Role', exists: true, claimableAssignments: [] },
          { name: 'Missing.Role', exists: false, claimableAssignments: [] },
        ]}
      />,
    );

    await expect.element(screen.getByText('Unavailable.Role')).toBeVisible();
    await expect.element(screen.getByText('Missing.Role')).not.toBeInTheDocument();
  });

  it('renders claimable roles and dispatches their assignment identifier', async () => {
    const onActivate = vi.fn().mockResolvedValue(undefined);
    const screen = await render(
      <RoleClaimableView
        statuses={[
          {
            name: 'Claimable.Role',
            description: 'Allows access to the claimable feature.',
            exists: true,
            claimableAssignments: [
              {
                assignmentId: 'assignment-id',
                name: 'claimable-role',
                displayName: 'Claimable role',
                description: 'Activates the required access role.',
              },
            ],
          },
        ]}
        defaultReason="Required for testing"
        onActivate={onActivate}
      />,
    );

    await expect
      .element(
        screen.getByRole('heading', {
          name: 'You are currently missing activation of role Claimable.Role.',
        }),
      )
      .toBeVisible();
    await expect.element(screen.getByText('claimable-role')).toBeVisible();
    await expect.element(screen.getByText('Activates the required access role.')).toBeVisible();
    await expect
      .element(
        screen.getByText(
          'You are eligible to claim this role. Click below to claim Claimable role.',
        ),
      )
      .toBeVisible();
    await screen.getByRole('button', { name: 'Claim' }).click();
    await expect.element(screen.getByText('Claim Claimable role', { exact: true })).toBeVisible();
    await screen.getByRole('textbox', { name: 'Reason' }).fill('Temporary test access');
    await expect.element(screen.getByText('Duration: 2 hours')).toBeVisible();
    await screen.getByRole('button', { name: 'Claim', exact: true }).last().click();

    expect(onActivate).toHaveBeenCalledWith('assignment-id', 'Temporary test access', 2);
  });

  it('renders one recovery option when multiple assignments grant the same claimable role', async () => {
    const onActivate = vi.fn().mockResolvedValue(undefined);
    const screen = await render(
      <RoleClaimableView
        statuses={[
          {
            name: 'Claimable.Role',
            exists: true,
            claimableAssignments: [
              {
                assignmentId: 'first-assignment',
                name: 'claimable-role',
                displayName: 'Claimable role',
              },
              {
                assignmentId: 'second-assignment',
                name: 'claimable-role',
                displayName: 'Claimable role',
              },
            ],
          },
        ]}
        defaultReason="Required for testing"
        onActivate={onActivate}
      />,
    );

    await expect
      .element(screen.getByRole('heading', { name: 'Claimable role', exact: true }))
      .toBeVisible();
    expect(screen.getByRole('button', { name: 'Claim' }).all()).toHaveLength(1);
    await screen.getByRole('button', { name: 'Claim' }).click();
    await screen.getByRole('button', { name: 'Claim', exact: true }).last().click();

    expect(onActivate).toHaveBeenCalledWith('first-assignment', 'Required for testing', 2);
  });
});
