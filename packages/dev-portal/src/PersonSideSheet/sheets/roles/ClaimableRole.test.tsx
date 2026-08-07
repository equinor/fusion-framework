import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

    render(<ClaimableRole assignment={assignment} onChange={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Activate Developer role'));
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));

    expect(await screen.findByText('Reason is required.')).toBeTruthy();
    expect(json).not.toHaveBeenCalled();
  });

  it('activates a role and reports its updated state', async () => {
    const json = vi.fn().mockResolvedValue({ activeToDate: '2026-08-07T16:00:00Z' });
    const onChange = vi.fn();
    mocks.createClient.mockResolvedValue({ json });

    render(<ClaimableRole assignment={assignment} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Activate Developer role'));
    fireEvent.change(screen.getByLabelText('Reason for activation'), {
      target: { value: 'Testing role-dependent behavior' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));

    await waitFor(() =>
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
