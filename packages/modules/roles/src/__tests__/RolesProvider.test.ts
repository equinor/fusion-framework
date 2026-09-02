import { TelemetryLevel, TelemetryScope } from '@equinor/fusion-framework-module-telemetry';
import { describe, expect, it, vi } from 'vitest';

import { RoleClaimEvent } from '../RoleClaimEvent.js';
import type { IRolesClient } from '../RolesClient.js';
import { RolesProvider } from '../RolesProvider.js';

/**
 * Creates the minimal typed client required by provider lifecycle tests.
 *
 * @returns A Roles V2 client test double.
 */
const createClient = (): IRolesClient => ({
  getActiveRoles: vi.fn(),
  getClaimableRoles: vi.fn(),
  claimRole: vi.fn(),
  canClaimAccessRole: vi.fn(),
});

describe('RolesProvider', () => {
  it('exposes role operations through the initialized client', async () => {
    const client = createClient();
    const activeRoles = [{ systemName: 'Reports', accessRoleName: 'Reports.Read' }];
    const claimableRoles = [{ id: 'claimable-role' }];
    const activation = { id: 'activation-id' };
    vi.mocked(client.getActiveRoles).mockResolvedValue(activeRoles);
    vi.mocked(client.getClaimableRoles).mockResolvedValue(claimableRoles);
    vi.mocked(client.claimRole).mockResolvedValue(activation);
    const dispatchEvent = vi.fn(async (event: RoleClaimEvent) => event);
    const telemetry = {
      trackEvent: vi.fn(),
      trackException: vi.fn(),
    };
    const provider = new RolesProvider(
      { requiredRoles: [], client },
      {
        event: { dispatchEvent },
        telemetry,
      },
    );

    await expect(provider.getActiveRoles()).resolves.toEqual(activeRoles);
    await expect(provider.getClaimableRoles()).resolves.toEqual(claimableRoles);
    await expect(provider.claimRole({ roleId: 'claimable-role' })).resolves.toEqual(activation);

    expect(dispatchEvent.mock.calls[0][0]).toBeInstanceOf(RoleClaimEvent);
    expect(dispatchEvent.mock.calls[0][0].cancelable).toBe(true);
    expect(dispatchEvent.mock.calls[0][0].detail).toEqual({ roleId: 'claimable-role' });
    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect(telemetry.trackEvent).toHaveBeenCalledWith({
      name: 'RolesProvider.claimRole',
      level: TelemetryLevel.Debug,
      scope: ['roles', TelemetryScope.Framework],
      properties: { outcome: 'success' },
    });
    expect(telemetry.trackException).not.toHaveBeenCalled();
  });

  it('does not activate a role when the claim event is canceled', async () => {
    const client = createClient();
    const dispatchEvent = vi.fn(async (event: RoleClaimEvent) => {
      // Simulate a listener vetoing the claim before the activation request.
      if (event instanceof RoleClaimEvent) {
        event.preventDefault();
      }
      return event;
    });
    const provider = new RolesProvider({ requiredRoles: [], client }, { event: { dispatchEvent } });

    await expect(provider.claimRole({ roleId: 'claimable-role' })).rejects.toThrow(
      'Role claim was canceled by an event listener.',
    );
    expect(client.claimRole).not.toHaveBeenCalled();
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });

  it('checks active access-role names for the authenticated account', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
    ]);
    const provider = new RolesProvider({ requiredRoles: [], client });

    await expect(provider.hasRole('Reports.Read')).resolves.toBe(true);
    await expect(provider.hasRole('Reports.Write')).resolves.toBe(false);
    await expect(provider.hasRole('  ')).resolves.toBe(false);
    expect(client.getActiveRoles).toHaveBeenCalledTimes(2);
  });

  it('checks claim eligibility through the account-scoped client', async () => {
    const client = createClient();
    vi.mocked(client.canClaimAccessRole).mockResolvedValue(true);
    const provider = new RolesProvider({ requiredRoles: [], client });

    await expect(provider.canClaimAccessRole(' Reports.Read ')).resolves.toBe(true);
    await expect(provider.canClaimAccessRole('  ')).resolves.toBe(false);
    expect(client.canClaimAccessRole).toHaveBeenCalledOnce();
    expect(client.canClaimAccessRole).toHaveBeenCalledWith('Reports.Read');
  });

  it('reports and propagates client failures', async () => {
    const client = createClient();
    const error = new Error('request failed');
    vi.mocked(client.getActiveRoles).mockRejectedValue(error);
    const telemetry = {
      trackEvent: vi.fn(),
      trackException: vi.fn(),
    };
    const provider = new RolesProvider({ requiredRoles: [], client }, { telemetry });

    await expect(provider.getActiveRoles()).rejects.toThrow('request failed');
    expect(telemetry.trackException).toHaveBeenCalledWith({
      name: 'RolesProvider.getActiveRoles',
      exception: error,
      level: TelemetryLevel.Error,
      scope: ['roles', TelemetryScope.Framework],
      properties: { outcome: 'failure' },
    });
    expect(telemetry.trackEvent).not.toHaveBeenCalled();
  });

  it('disposes client cache resources with the provider', () => {
    const dispose = vi.fn();
    const client = { ...createClient(), dispose };
    const provider = new RolesProvider({ requiredRoles: [], client });

    provider.dispose();

    expect(dispose).toHaveBeenCalledOnce();
  });
});
