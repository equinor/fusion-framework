import { TelemetryLevel, TelemetryScope } from '@equinor/fusion-framework-module-telemetry';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { ClaimRoleError } from '../errors/ClaimRoleError.js';
import { RoleClaimEvent } from '../RoleClaimEvent.js';
import type { IRolesClient } from '../RolesClient.js';
import { RolesError } from '../errors/RolesError.js';
import { RolesProvider } from '../RolesProvider.js';
import { RolesClient } from '../RolesClient.js';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { Subject } from 'rxjs';

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
  deactivateRole: vi.fn(),
  canClaimAccessRole: vi.fn(),
  getRequiredRoleStatuses: vi.fn(),
  getAccessRoles: vi.fn(),
});

describe('RolesProvider', () => {
  it('converts custom client page observables into a lazy async iterator', async () => {
    const client = createClient();
    vi.mocked(client.getAccessRoles)
      .mockReturnValueOnce(of({ totalCount: 2, value: [{ name: 'First.Role' }], nextPage: 'next' }))
      .mockReturnValueOnce(of({ totalCount: 2, value: [{ name: 'Last.Role' }] }));
    const provider = new RolesProvider({ client });
    const pages = provider.getAccessRoles();

    expect(client.getAccessRoles).not.toHaveBeenCalled();
    await expect(pages.next()).resolves.toEqual({
      done: false,
      value: [{ name: 'First.Role' }],
    });
    expect(client.getAccessRoles).toHaveBeenCalledOnce();
    await expect(pages.next()).resolves.toEqual({
      done: false,
      value: [{ name: 'Last.Role' }],
    });
    expect(client.getAccessRoles).toHaveBeenNthCalledWith(
      2,
      { top: 100, skip: 1 },
      expect.any(AbortSignal),
    );
    await expect(pages.next()).resolves.toEqual({ done: true, value: undefined });
    expect(client.getAccessRoles).toHaveBeenCalledTimes(2);
    provider.dispose();
  });

  it('rejects an invalid continuation from a custom client instead of repeating a page', async () => {
    const client = createClient();
    vi.mocked(client.getAccessRoles).mockReturnValue(
      of({ totalCount: 1, value: [], nextPage: 'next' }),
    );
    const provider = new RolesProvider({ client });

    await expect(provider.getAccessRoles().next()).rejects.toThrow(
      'invalid access-role continuation',
    );
    expect(client.getAccessRoles).toHaveBeenCalledOnce();
    provider.dispose();
  });

  it('fetches access-role pages only as the consumer advances and stops on break', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const json = vi
      .spyOn(httpClient, 'json$')
      .mockReturnValueOnce(of({ value: [{ name: 'First.Role' }], nextPage: 'next' }))
      .mockReturnValueOnce(of({ value: [{ name: 'Second.Role' }], nextPage: 'next' }));
    const provider = new RolesProvider({
      client: new RolesClient(httpClient, () => 'account-id'),
    });
    const pages = provider.getAccessRoles();

    expect(json).not.toHaveBeenCalled();
    await expect(pages.next()).resolves.toMatchObject({
      done: false,
      value: [{ name: 'First.Role' }],
    });
    expect(json).toHaveBeenCalledOnce();
    // Pausing a consumer must not prefetch or buffer any additional pages.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(json).toHaveBeenCalledOnce();
    for await (const page of pages) {
      expect(page).toEqual([{ name: 'Second.Role' }]);
      break;
    }
    expect(json).toHaveBeenCalledTimes(2);
    expect(json.mock.calls[1][0]).toContain('%24skip=1');
    await expect(pages.next()).resolves.toEqual({ done: true, value: undefined });
    provider.dispose();
  });

  it('reports a later page failure through the provider iterator', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const cause = new Error('second page failed');
    vi.spyOn(httpClient, 'json$')
      .mockReturnValueOnce(of({ value: [{ name: 'First.Role' }], nextPage: 'next' }))
      .mockReturnValueOnce(throwError(() => cause));
    const telemetry = { trackEvent: vi.fn(), trackException: vi.fn() };
    const provider = new RolesProvider(
      {
        client: new RolesClient(httpClient, () => 'account-id'),
      },
      { telemetry },
    );
    const pages = provider.getAccessRoles();

    await pages.next();
    await expect(pages.next()).rejects.toMatchObject({ name: 'RolesError', cause });
    expect(telemetry.trackException).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'RolesProvider.getAccessRoles',
      }),
    );
    provider.dispose();
  });

  it('cancels an in-flight access-role page when the consumer aborts', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const page = new Subject<unknown>();
    const json = vi.spyOn(httpClient, 'json$').mockReturnValue(page);
    const controller = new AbortController();
    const provider = new RolesProvider({
      client: new RolesClient(httpClient, () => 'account-id'),
    });
    const pages = provider.getAccessRoles(controller.signal);
    const pendingPage = pages.next();
    const assertion = expect(pendingPage).rejects.toMatchObject({ name: 'RolesError' });

    expect(page.observed).toBe(true);
    controller.abort();
    await assertion;
    expect(page.observed).toBe(false);
    expect(json).toHaveBeenCalledOnce();
    await expect(pages.next()).resolves.toEqual({ done: true, value: undefined });
    provider.dispose();
  });

  it('exposes role operations through the initialized client', async () => {
    const client = createClient();
    const activeRoles = [{ systemName: 'Reports', accessRoleName: 'Reports.Read' }];
    const claimableRoles = [{ id: 'claimable-role' }];
    const activation = { id: 'activation-id' };
    vi.mocked(client.getActiveRoles).mockReturnValue(of(activeRoles));
    vi.mocked(client.getClaimableRoles).mockReturnValue(of(claimableRoles));
    vi.mocked(client.claimRole).mockReturnValue(of(activation));
    vi.mocked(client.deactivateRole).mockReturnValue(of(activation));
    vi.mocked(client.getRequiredRoleStatuses).mockReturnValue(
      of([{ name: 'Reports.Read', exists: true, claims: [] }]),
    );
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
    await expect(provider.deactivateRole({ roleId: 'claimable-role' })).resolves.toEqual(
      activation,
    );
    await expect(provider.getRequiredRoleStatuses(['Reports.Read'])).resolves.toEqual([
      { name: 'Reports.Read', exists: true, claims: [] },
    ]);

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
    vi.mocked(client.getActiveRoles).mockReturnValue(
      of([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }]),
    );
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
    vi.mocked(client.canClaimAccessRole).mockReturnValue(of(true));
    const provider = new RolesProvider({ client });

    await expect(provider.canClaimAccessRole(' Reports.Read ')).resolves.toBe(true);
    await expect(provider.canClaimAccessRole('  ')).resolves.toBe(false);
    expect(client.canClaimAccessRole).toHaveBeenCalledOnce();
    expect(client.canClaimAccessRole).toHaveBeenCalledWith('Reports.Read');
  });

  it('accepts configured requirements when every access role is active', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockReturnValue(
      of([
        { systemName: 'Reports', accessRoleName: 'Reports.Read' },
        { systemName: 'Reports', accessRoleName: 'Reports.Export' },
      ]),
    );
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
    vi.mocked(client.getActiveRoles).mockReturnValue(
      of([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }]),
    );
    const provider = new RolesProvider({ client });

    const result = provider.hasRole(['Reports.Read', 'Reports.Export', 'Reports.Admin'], {
      assert: true,
      required: true,
    });

    await expect(result).rejects.toMatchObject({
      name: 'RequiredRolesError',
      message:
        'Roles module bootstrap denied. Missing required roles: Reports.Export, Reports.Admin.',
      missingRoles: ['Reports.Export', 'Reports.Admin'],
      provider,
    });
  });

  it('reports and propagates client failures', async () => {
    const client = createClient();
    const error = new Error('request failed');
    vi.mocked(client.getActiveRoles).mockReturnValue(throwError(() => error));
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
    vi.mocked(client.claimRole).mockReturnValue(throwError(() => cause));
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
