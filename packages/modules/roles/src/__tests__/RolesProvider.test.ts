import { TelemetryLevel, TelemetryScope } from '@equinor/fusion-framework-module-telemetry';
import { describe, expect, it, vi } from 'vitest';

import { ClaimRoleError } from '../errors/ClaimRoleError.js';
import { RequiredRolesError } from '../errors/RequiredRolesError.js';
import { RoleClaimEvent } from '../RoleClaimEvent.js';
import type { IRolesClient } from '../RolesClient.js';
import { RolesError } from '../errors/RolesError.js';
import { RolesProvider } from '../RolesProvider.js';

/**
 * Creates the minimal typed client required by provider lifecycle tests.
 *
 * @returns A Roles V2 client test double.
 */
const createClient = (): IRolesClient => ({
  initialize: vi.fn(),
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
      { client },
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
    const provider = new RolesProvider({ client }, { event: { dispatchEvent } });

    const claim = provider.claimRole({ roleId: 'claimable-role' });

    await expect(claim).rejects.toThrow('Role claim was canceled by an event listener.');
    await expect(claim).rejects.toBeInstanceOf(ClaimRoleError);
    expect(client.claimRole).not.toHaveBeenCalled();
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });

  it('checks active access-role names for the authenticated account', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
    ]);
    const provider = new RolesProvider({ client });

    await expect(provider.hasRole(['Reports.Read'], {})).resolves.toBe(true);
    await expect(
      provider.hasRole(['Reports.Read', 'Reports.Write'], { required: true }),
    ).resolves.toBe(false);
    await expect(
      provider.hasRole(['Reports.Write', 'Reports.Read'], { required: false }),
    ).resolves.toBe(true);
    await expect(provider.hasRole(['  '], {})).resolves.toBe(false);
    expect(client.getActiveRoles).toHaveBeenCalledTimes(3);
  });

  it('checks claim eligibility through the account-scoped client', async () => {
    const client = createClient();
    vi.mocked(client.canClaimAccessRole).mockResolvedValue(true);
    const provider = new RolesProvider({ client });

    await expect(provider.canClaimAccessRole(' Reports.Read ')).resolves.toBe(true);
    await expect(provider.canClaimAccessRole('  ')).resolves.toBe(false);
    expect(client.canClaimAccessRole).toHaveBeenCalledOnce();
    expect(client.canClaimAccessRole).toHaveBeenCalledWith('Reports.Read');
  });

  it('accepts configured requirements when every access role is active', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
      { systemName: 'Reports', accessRoleName: 'Reports.Export' },
    ]);
    const provider = new RolesProvider({ client });

    await expect(
      provider.hasRole(['Reports.Read', 'Reports.Export'], { assert: true, required: true }),
    ).resolves.toBe(true);
  });

  it('does not load active roles when no requirements are configured', async () => {
    const client = createClient();
    const provider = new RolesProvider({ client });

    await expect(provider.hasRole([], { assert: true, required: true })).resolves.toBe(true);
    await expect(provider.hasRole([], { assert: false, required: false })).resolves.toBe(false);
    expect(client.getActiveRoles).not.toHaveBeenCalled();
  });

  it('reports every configured access role that is not active', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
    ]);
    const provider = new RolesProvider({ client });

    await expect(
      provider.hasRole(['Reports.Read', 'Reports.Export', 'Reports.Admin'], {
        assert: true,
        required: true,
      }),
    ).rejects.toEqual(
      new RequiredRolesError(
        'Roles module bootstrap denied. Missing required roles: Reports.Export, Reports.Admin.',
        ['Reports.Export', 'Reports.Admin'],
      ),
    );
  });

  it('reports and propagates client failures', async () => {
    const client = createClient();
    const error = new Error('request failed');
    vi.mocked(client.getActiveRoles).mockRejectedValue(error);
    const telemetry = {
      trackEvent: vi.fn(),
      trackException: vi.fn(),
    };
    const provider = new RolesProvider({ client }, { telemetry });

    await expect(provider.getActiveRoles()).rejects.toMatchObject({
      name: 'RolesError',
      cause: error,
    });
    expect(telemetry.trackException).toHaveBeenCalledWith({
      name: 'RolesProvider.getActiveRoles',
      exception: expect.any(RolesError),
      level: TelemetryLevel.Error,
      scope: ['roles', TelemetryScope.Framework],
      properties: { outcome: 'failure' },
    });
    expect(telemetry.trackEvent).not.toHaveBeenCalled();
  });

  it('classifies client activation failures as claim errors', async () => {
    const client = createClient();
    const cause = new Error('activation failed');
    vi.mocked(client.claimRole).mockRejectedValue(cause);
    const provider = new RolesProvider({ client });

    await expect(provider.claimRole({ roleId: 'claimable-role' })).rejects.toMatchObject({
      name: 'ClaimRoleError',
      message: 'Failed to claim role.',
      cause,
    });
  });

  it('disposes client cache resources with the provider', () => {
    const dispose = vi.fn();
    const client = { ...createClient(), dispose };
    const provider = new RolesProvider({ client });

    provider.dispose();

    expect(dispose).toHaveBeenCalledOnce();
  });
});
