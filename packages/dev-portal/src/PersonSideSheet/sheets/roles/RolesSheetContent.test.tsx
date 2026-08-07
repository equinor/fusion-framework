import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RolesSheetContent } from './RolesSheetContent';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  currentUser: { localAccountId: 'account-id' },
  framework: {
    modules: { serviceDiscovery: { createClient: vi.fn() } },
  },
}));

mocks.framework.modules.serviceDiscovery.createClient = mocks.createClient;

vi.mock('@equinor/fusion-framework-react', () => ({
  useFramework: () => mocks.framework,
}));

vi.mock('@equinor/fusion-framework-react/hooks', () => ({
  useCurrentUser: () => mocks.currentUser,
}));

vi.mock('./ClaimableRole', () => ({
  ClaimableRole: () => <div>Claimable role</div>,
}));

describe('RolesSheetContent', () => {
  beforeEach(() => {
    mocks.createClient.mockReset();
    mocks.currentUser.localAccountId = 'account-id';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading and empty states', async () => {
    const json = vi.fn().mockResolvedValue([]);
    mocks.createClient.mockResolvedValue({ json });

    render(<RolesSheetContent navigate={vi.fn()} />);

    expect(screen.getByLabelText('Loading roles')).toBeTruthy();
    expect(await screen.findByText('You have no available roles')).toBeTruthy();
    expect(json).toHaveBeenCalledTimes(2);
  });

  it('retries role retrieval after a failure', async () => {
    const json = vi
      .fn()
      .mockRejectedValueOnce(new Error('Roles service unavailable'))
      .mockResolvedValue([]);
    mocks.createClient.mockResolvedValue({ json });

    render(<RolesSheetContent navigate={vi.fn()} />);

    expect(await screen.findByText('Roles service unavailable')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(screen.getByLabelText('Loading roles')).toBeTruthy();
    await waitFor(() => expect(mocks.createClient).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('You have no available roles')).toBeTruthy();
  });

  it('hides stale assignments while loading roles for a changed account', async () => {
    const initialJson = vi
      .fn()
      .mockResolvedValueOnce([{ id: 'old-assignment' }])
      .mockResolvedValueOnce([]);
    const pendingJson = vi.fn().mockReturnValue(new Promise(() => undefined));
    mocks.createClient
      .mockResolvedValueOnce({ json: initialJson })
      .mockResolvedValueOnce({ json: pendingJson });

    const { rerender } = render(<RolesSheetContent navigate={vi.fn()} />);

    expect(await screen.findByText('Claimable role')).toBeTruthy();

    mocks.currentUser.localAccountId = 'next-account-id';
    rerender(<RolesSheetContent navigate={vi.fn()} />);

    expect(screen.getByLabelText('Loading roles')).toBeTruthy();
    expect(screen.queryByText('Claimable role')).toBeNull();
  });
});
