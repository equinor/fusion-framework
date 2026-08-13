import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClaimableRole } from './ClaimableRole';
import type { ClaimableRoleAssignment } from './RolesApi';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  currentUser: { localAccountId: 'account-id' },
}));

vi.mock('@equinor/fusion-framework-react', () => ({
  useFramework: () => ({
    modules: { serviceDiscovery: { createClient: mocks.createClient } },
  }),
}));

vi.mock('@equinor/fusion-framework-react/hooks', () => ({
  useCurrentUser: () => mocks.currentUser,
}));

const assignment: ClaimableRoleAssignment = {
  id: 'assignment-id',
  claimableRole: {
    name: 'Developer',
    displayName: 'Developer role',
    description: 'Temporary development access',
  },
  isActive: false,
  activeTo: null,
};

describe('ClaimableRole', () => {
  beforeEach(() => {
    mocks.createClient.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('requires a reason before activating a role', async () => {
    const json = vi.fn();
    mocks.createClient.mockResolvedValue({ json });

    const screen = await render(<ClaimableRole assignment={assignment} onChange={vi.fn()} />);

    await screen.getByLabelText('Activate Developer role').click();
    await screen.getByRole('button', { name: 'Activate' }).click();

    await expect.element(screen.getByText('Reason is required.')).toBeVisible();
    expect(json).not.toHaveBeenCalled();
  });

  it('activates a role and reports its updated state', async () => {
    const json = vi.fn().mockResolvedValue({ activeToDate: '2026-08-07T16:00:00Z' });
    const onChange = vi.fn();
    mocks.createClient.mockResolvedValue({ json });

    const screen = await render(<ClaimableRole assignment={assignment} onChange={onChange} />);

    await screen.getByLabelText('Activate Developer role').click();
    await screen.getByLabelText('Reason for activation').fill('Testing role-dependent behavior');
    await screen.getByRole('button', { name: 'Activate' }).click();

    await vi.waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        ...assignment,
        isActive: true,
        activeTo: '2026-08-07T16:00:00Z',
      }),
    );
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/claimable-role-assignments/assignment-id/activate',
      {
        method: 'POST',
        body: JSON.stringify({ reason: 'Testing role-dependent behavior', hours: 2 }),
      },
    );
  });
});
