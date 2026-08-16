import { cleanup, render } from 'vitest-browser-react';
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

    const screen = await render(<RolesSheetContent navigate={vi.fn()} />);

    await expect.element(screen.getByText('You have no available roles')).toBeVisible();
    expect(json).toHaveBeenCalledTimes(2);
  });

  it('retries role retrieval after a failure', async () => {
    const json = vi
      .fn()
      .mockRejectedValueOnce(new Error('Roles service unavailable'))
      .mockResolvedValue([]);
    mocks.createClient.mockResolvedValue({ json });

    const screen = await render(<RolesSheetContent navigate={vi.fn()} />);

    await expect.element(screen.getByText('Roles service unavailable')).toBeVisible();
    await screen.getByRole('button', { name: 'Retry' }).click();

    await vi.waitFor(() => expect(mocks.createClient).toHaveBeenCalledTimes(2));
    await expect.element(screen.getByText('You have no available roles')).toBeVisible();
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

    const screen = await render(<RolesSheetContent navigate={vi.fn()} />);

    await expect.element(screen.getByText('Claimable role')).toBeVisible();

    mocks.currentUser.localAccountId = 'next-account-id';
    await screen.rerender(<RolesSheetContent navigate={vi.fn()} />);

    await expect.element(screen.getByLabelText('Loading roles')).toBeVisible();
    await expect.element(screen.getByText('Claimable role')).not.toBeInTheDocument();
  });
});
