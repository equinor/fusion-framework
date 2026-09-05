import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { describe, expect, it, vi } from 'vitest';
import { defer, lastValueFrom, Observable, of, Subject, throwError } from 'rxjs';

import { RolesClient } from '../RolesClient.js';

/**
 * Creates an HTTP client whose JSON method can be controlled without performing network I/O.
 *
 * @returns Framework HTTP client and its JSON spy.
 */
const createHttpClient = () => {
  const httpClient = new HttpClient('https://roles.example.test');
  const json = vi.spyOn(httpClient, 'json$');
  return { httpClient, json };
};

/**
 * Creates and initializes a Roles client for an account resolver.
 *
 * @param httpClient - HTTP client used by the Roles transport.
 * @param resolveCurrentAccountIdentifier - Resolver read before every account-scoped operation.
 * @returns Initialized Roles client.
 */
const createRolesClient = (
  httpClient: HttpClient,
  resolveCurrentAccountIdentifier: () => string | Promise<string>,
): RolesClient => {
  const client = new RolesClient(httpClient, resolveCurrentAccountIdentifier);
  client.initialize({ resolveCurrentAccountIdentifier });
  return client;
};

/**
 * Test subclass that exposes protected Roles client extension seams.
 */
class TestRolesClient extends RolesClient {
  /**
   * Resolves the account through the protected client lifecycle method.
   *
   * @returns Current account identifier.
   */
  public resolveAccountIdentifier(): Promise<string> {
    return this._getCurrentAccountIdentifier();
  }

  /**
   * Exposes the inherited HTTP transport for subclass verification.
   *
   * @returns HTTP client supplied to the base constructor.
   */
  public getHttpClient(): IHttpClient {
    return this.httpClient;
  }
}

describe('RolesClient', () => {
  it('defers account resolution and transport until subscription', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockReturnValue(of([]));
    let account = 'first-account';
    const resolver = vi.fn(() => account);
    const client = createRolesClient(httpClient, resolver);
    const roles = client.getActiveRoles();

    expect(resolver).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    account = 'second-account';
    await lastValueFrom(roles);
    expect(json.mock.calls[0][0]).toContain('/accounts/second-account/');
    account = 'third-account';
    await lastValueFrom(roles);
    expect(json.mock.calls[1][0]).toContain('/accounts/third-account/');
  });

  it('stops required-role pagination once every requested role is found', async () => {
    const { httpClient, json } = createHttpClient();
    json
      .mockReturnValueOnce(of({ value: [{ name: 'Reports.Read' }], nextPage: 'next' }))
      .mockReturnValueOnce(of({ value: [] }));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getRequiredRoleStatuses(['Reports.Read']))).resolves.toEqual([
      { name: 'Reports.Read', exists: true, claims: [] },
    ]);
    expect(json).toHaveBeenCalledTimes(2);
  });

  it('returns a cold observable for one access-role page without following its continuation', async () => {
    const { httpClient, json } = createHttpClient();
    const page = { value: [{ name: 'Reports.Read' }], nextPage: 'next' };
    json.mockReturnValue(of(page));
    const client = createRolesClient(httpClient, () => 'account-id');
    const result = client.getAccessRoles({ top: 25, skip: 50 });

    expect(result).toBeInstanceOf(Observable);
    expect(json).not.toHaveBeenCalled();
    await expect(lastValueFrom(result)).resolves.toEqual(page);
    expect(json).toHaveBeenCalledOnce();
    expect(json.mock.calls[0][0]).toContain('%24top=25&%24skip=50');
  });

  it('reports access-role request errors through the observable error channel', async () => {
    const { httpClient, json } = createHttpClient();
    const error = new Error('access-role page failed');
    json.mockReturnValue(throwError(() => error));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getAccessRoles())).rejects.toBe(error);
    expect(json).toHaveBeenCalledOnce();
  });

  it('gets active roles for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    json.mockReturnValue(of(activeRoles));
    const client = createRolesClient(httpClient, () => 'account/id');

    await expect(lastValueFrom(client.getActiveRoles())).resolves.toEqual(activeRoles);

    expect(json).toHaveBeenCalledWith(
      '/accounts/account%2Fid/active-access-role-assignments?api-version=1.0',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
  });

  it('gets consolidated claimable roles for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const claimableRoles = [{ id: 'claimable-role' }];
    json.mockReturnValue(of(claimableRoles));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getClaimableRoles())).resolves.toEqual(claimableRoles);
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/consolidated-claimable-role-assignments?api-version=1.0',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
  });

  it('claims a role for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const activation = { id: 'activation-id', activeToDate: '2026-09-02T14:00:00Z' };
    json.mockReturnValue(of(activation));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(
      lastValueFrom(
        client.claimRole({
          roleId: 'role/id',
          reason: 'Incident response',
          hours: 2,
        }),
      ),
    ).resolves.toEqual(activation);
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/claimable-role-assignments/role%2Fid/activate?api-version=1.0',
      expect.objectContaining({
        method: 'POST',
        body: {
          reason: 'Incident response',
          hours: 2,
        },
        selector: expect.any(Function),
      }),
    );
  });

  it('deactivates a role for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const deactivation = { id: 'activation-id', activeToDate: '2026-09-02T14:00:00Z' };
    json.mockReturnValue(of(deactivation));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.deactivateRole({ roleId: 'role/id' }))).resolves.toEqual(
      deactivation,
    );
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/claimable-role-assignments/role%2Fid/deactivate?api-version=1.0',
      expect.objectContaining({
        method: 'POST',
        body: undefined,
        selector: expect.any(Function),
      }),
    );
  });

  it('propagates request failures from Roles V2', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockReturnValue(throwError(() => new Error('request failed')));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getActiveRoles())).rejects.toThrow('request failed');
  });

  it('checks expanded access-role mappings for claim eligibility', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockReturnValue(
      of({
        totalCount: 1,
        value: [
          {
            claimableRole: {
              accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }],
            },
          },
        ],
      }),
    );
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.canClaimAccessRole('Reports.Read'))).resolves.toBe(true);
    await expect(lastValueFrom(client.canClaimAccessRole('Reports.Write'))).resolves.toBe(false);
    expect(json.mock.calls[0][0]).toBe(
      '/accounts/account-id/claimable-role-assignments?api-version=1.0&%24expand=accessRoleMappings',
    );
  });

  it('resolves required role existence and claimable assignments through typed endpoints', async () => {
    const { httpClient, json } = createHttpClient();
    json
      .mockReturnValueOnce(
        of({
          totalCount: 2,
          value: [
            {
              name: 'Fusion.Apps.FullControl',
              description: 'Manage every Fusion application.',
            },
            { name: 'Reports.Export', description: 'Export reports.' },
          ],
        }),
      )
      .mockReturnValueOnce(
        of({
          totalCount: 2,
          value: [
            {
              id: 'claimable-assignment',
              claimableRole: {
                name: 'reports-exporter',
                displayName: 'Reports exporter',
                description: 'Allows report exports.',
                accessRoleMappings: [{ accessRole: { name: 'Reports.Export' } }],
              },
            },
            {
              id: 'elevated-assignment',
              claimableRole: {
                name: 'reports-administrator',
                displayName: 'Reports administrator',
                description: 'Allows administration and report exports.',
                accessRoleMappings: [{ accessRole: { name: 'Reports.Export' } }],
              },
            },
          ],
        }),
      );
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(
      lastValueFrom(
        client.getRequiredRoleStatuses([
          'Missing.Role',
          'Fusion.Apps.FullControl',
          'Reports.Export',
        ]),
      ),
    ).resolves.toEqual([
      { name: 'Missing.Role', exists: false, claims: [] },
      {
        name: 'Fusion.Apps.FullControl',
        description: 'Manage every Fusion application.',
        exists: true,
        claims: [],
      },
      {
        name: 'Reports.Export',
        description: 'Export reports.',
        exists: true,
        claims: [
          {
            assignmentId: 'claimable-assignment',
            name: 'reports-exporter',
            displayName: 'Reports exporter',
            description: 'Allows report exports.',
          },
          {
            assignmentId: 'elevated-assignment',
            name: 'reports-administrator',
            displayName: 'Reports administrator',
            description: 'Allows administration and report exports.',
          },
        ],
      },
    ]);
    expect(json).toHaveBeenNthCalledWith(
      1,
      '/access-roles?api-version=1.0&%24top=100&%24skip=0',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
    expect(json).toHaveBeenNthCalledWith(
      2,
      '/accounts/account-id/claimable-role-assignments?api-version=1.0&%24expand=accessRoleMappings',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
  });

  it('filters unusable claims and preserves mapping order across independent subscriptions', async () => {
    const { httpClient, json } = createHttpClient();
    const roles = of({ value: [{ name: 'Reports.Read' }, { name: 'Reports.Export' }] });
    const assignments = of({
      value: [
        { claimableRole: { accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }] } },
        { id: '' },
        { id: 'no-mappings' },
        {
          id: 'shared-assignment',
          claimableRole: {
            displayName: 'Report access',
            accessRoleMappings: [
              {},
              { accessRole: { name: 'Unrelated.Role' } },
              { accessRole: { name: 'Reports.Read' } },
              { accessRole: { name: 'Reports.Export' } },
            ],
          },
        },
        {
          id: 'fallback-assignment',
          claimableRole: { accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }] },
        },
      ],
    });
    json
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(assignments)
      .mockReturnValueOnce(roles)
      .mockReturnValueOnce(assignments);
    const client = createRolesClient(httpClient, () => 'account-id');
    const lookup = client.getRequiredRoleStatuses(['Reports.Export', 'Reports.Read']);
    const expected = [
      {
        name: 'Reports.Export',
        exists: true,
        claims: [
          {
            assignmentId: 'shared-assignment',
            name: 'Report access',
            displayName: 'Report access',
          },
        ],
      },
      {
        name: 'Reports.Read',
        exists: true,
        claims: [
          {
            assignmentId: 'shared-assignment',
            name: 'Report access',
            displayName: 'Report access',
          },
          {
            assignmentId: 'fallback-assignment',
            name: 'Reports.Read',
            displayName: 'Reports.Read',
          },
        ],
      },
    ];

    await expect(lastValueFrom(lookup)).resolves.toEqual(expected);
    await expect(lastValueFrom(lookup)).resolves.toEqual(expected);
  });

  it('rejects incomplete claimable data and unsubscribes pending registry reads', async () => {
    const { httpClient, json } = createHttpClient();
    const registry = new Subject<unknown>();
    json
      .mockReturnValueOnce(registry)
      .mockReturnValueOnce(of({ value: [], nextPage: 'unsupported' }));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getRequiredRoleStatuses(['Reports.Read']))).rejects.toThrow(
      'Roles V2 returned incomplete data while resolving required access roles.',
    );
    expect(registry.observed).toBe(false);
  });

  it('rejects a failed claimable lookup without waiting for access-role pagination', async () => {
    const { httpClient, json } = createHttpClient();
    const accessRoles = new Subject<unknown>();
    const teardown = vi.fn();
    const error = new Error('claimable lookup failed');
    json
      .mockReturnValueOnce(
        new Observable((subscriber) => {
          const subscription = accessRoles.subscribe(subscriber);
          return () => {
            subscription.unsubscribe();
            teardown();
          };
        }),
      )
      .mockReturnValueOnce(throwError(() => error));
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getRequiredRoleStatuses(['Reports.Read']))).rejects.toBe(
      error,
    );
    expect(teardown).toHaveBeenCalledOnce();
    accessRoles.next({ value: [], nextPage: 'next' });
    expect(json).toHaveBeenCalledTimes(2);
  });

  it('handles a late claimable failure after access-role lookup has already failed', async () => {
    const { httpClient, json } = createHttpClient();
    const rejectClaimableRoles = vi.fn<(reason: Error) => void>();
    const claimableRoles = new Promise<unknown>((_resolve, reject) => {
      rejectClaimableRoles.mockImplementation(reject);
    });
    const error = new Error('access-role lookup failed');
    const accessRoles = new Subject<unknown>();
    json.mockReturnValueOnce(accessRoles).mockReturnValueOnce(defer(() => claimableRoles));
    const client = createRolesClient(httpClient, () => 'account-id');

    const result = lastValueFrom(client.getRequiredRoleStatuses(['Reports.Read']));
    const assertion = expect(result).rejects.toBe(error);
    await vi.waitFor(() => expect(json).toHaveBeenCalledTimes(2));
    accessRoles.error(error);
    await assertion;
    rejectClaimableRoles(new Error('claimable lookup failed later'));

    // Let Vitest observe any unhandled rejection from the losing request.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it('paginates required access roles while preserving unique requirement order', async () => {
    const { httpClient, json } = createHttpClient();
    json
      .mockReturnValueOnce(
        defer(async () => ({ value: [{ name: 'Unrelated.Role' }], nextPage: 'next' })),
      )
      .mockReturnValueOnce(of({ value: [] }))
      .mockReturnValueOnce(
        of({
          value: [{ name: 'Reports.Read', description: 'Read reports.' }],
        }),
      );
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(
      lastValueFrom(
        client.getRequiredRoleStatuses(['Reports.Read', 'Missing.Role', 'Reports.Read']),
      ),
    ).resolves.toEqual([
      { name: 'Reports.Read', description: 'Read reports.', exists: true, claims: [] },
      { name: 'Missing.Role', exists: false, claims: [] },
    ]);
    expect(json).toHaveBeenNthCalledWith(
      3,
      '/access-roles?api-version=1.0&%24top=100&%24skip=1',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
  });

  it('does not request role collections for an empty requirement', async () => {
    const { httpClient, json } = createHttpClient();
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.getRequiredRoleStatuses([]))).resolves.toEqual([]);
    expect(json).not.toHaveBeenCalled();
  });

  it('throws rather than returning false for an incomplete claim eligibility response', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockReturnValue(
      of({
        totalCount: 2,
        nextPage: '/accounts/account-id/claimable-role-assignments?page=2',
        value: [],
      }),
    );
    const client = createRolesClient(httpClient, () => 'account-id');

    await expect(lastValueFrom(client.canClaimAccessRole('Reports.Read'))).rejects.toThrow(
      'Roles V2 returned incomplete claimable role assignments while checking claim eligibility.',
    );
  });

  it('caches reads and invalidates them after a successful claim', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    const claimableRoles = [{ id: 'claimable-role' }];
    const claimability = {
      totalCount: 1,
      value: [
        {
          claimableRole: {
            accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }],
          },
        },
      ],
    };
    const activation = { id: 'activation-id' };
    json
      .mockReturnValueOnce(of(activeRoles))
      .mockReturnValueOnce(of(claimableRoles))
      .mockReturnValueOnce(of(claimability))
      .mockReturnValueOnce(of(activation))
      .mockReturnValueOnce(of(activeRoles))
      .mockReturnValueOnce(of(claimableRoles))
      .mockReturnValueOnce(of(claimability));
    const client = createRolesClient(httpClient, () => 'account-id');

    await Promise.all([
      lastValueFrom(client.getActiveRoles()),
      lastValueFrom(client.getActiveRoles()),
    ]);
    await Promise.all([
      lastValueFrom(client.getClaimableRoles()),
      lastValueFrom(client.getClaimableRoles()),
    ]);
    await Promise.all([
      lastValueFrom(client.canClaimAccessRole('Reports.Read')),
      lastValueFrom(client.canClaimAccessRole('Reports.Read')),
    ]);
    expect(json).toHaveBeenCalledTimes(3);

    await lastValueFrom(client.claimRole({ roleId: 'claimable-role' }));
    await lastValueFrom(client.getActiveRoles());
    await lastValueFrom(client.getClaimableRoles());
    await lastValueFrom(client.canClaimAccessRole('Reports.Read'));

    expect(json).toHaveBeenCalledTimes(7);
  });

  it('refreshes cached reads after one minute', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    json.mockReturnValue(of(activeRoles));
    let now = Date.now();
    const dateNow = vi.spyOn(Date, 'now').mockImplementation(() => now);
    const client = createRolesClient(httpClient, () => 'account-id');

    await lastValueFrom(client.getActiveRoles());
    await lastValueFrom(client.getActiveRoles());
    expect(json).toHaveBeenCalledOnce();

    now += 60 * 1000 + 1;
    await lastValueFrom(client.getActiveRoles());
    expect(json).toHaveBeenCalledTimes(2);

    dateNow.mockRestore();
  });

  it('preserves cached reads when a claim fails', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    const claimableRoles = [{ id: 'claimable-role' }];
    const claimability = {
      totalCount: 1,
      value: [
        {
          claimableRole: {
            accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }],
          },
        },
      ],
    };
    json
      .mockReturnValueOnce(of(activeRoles))
      .mockReturnValueOnce(of(claimableRoles))
      .mockReturnValueOnce(of(claimability))
      .mockReturnValueOnce(throwError(() => new Error('claim failed')));
    const client = createRolesClient(httpClient, () => 'account-id');

    await lastValueFrom(client.getActiveRoles());
    await lastValueFrom(client.getClaimableRoles());
    await lastValueFrom(client.canClaimAccessRole('Reports.Read'));
    await expect(lastValueFrom(client.claimRole({ roleId: 'claimable-role' }))).rejects.toThrow(
      'claim failed',
    );

    await lastValueFrom(client.getActiveRoles());
    await lastValueFrom(client.getClaimableRoles());
    await lastValueFrom(client.canClaimAccessRole('Reports.Read'));
    expect(json).toHaveBeenCalledTimes(4);
  });

  it('uses the account resolver supplied to the constructor', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockReturnValue(of([]));
    const client = new RolesClient(httpClient, () => 'constructor-account');

    await lastValueFrom(client.getActiveRoles());

    expect(json.mock.calls[0][0]).toContain('/accounts/constructor-account/');
  });

  it('uses the current account resolver supplied during initialization', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockReturnValue(of([]));
    const client = new RolesClient(httpClient, () => 'constructor-account');
    client.initialize({ resolveCurrentAccountIdentifier: () => 'initialized-account' });

    await lastValueFrom(client.getActiveRoles());

    expect(json.mock.calls[0][0]).toContain('/accounts/initialized-account/');
  });

  it('exposes account resolution and transport to extending mock clients', async () => {
    const { httpClient } = createHttpClient();
    const client = new TestRolesClient(httpClient, () => 'mock-account');

    await expect(client.resolveAccountIdentifier()).resolves.toBe('mock-account');
    expect(client.getHttpClient()).toBe(httpClient);
  });

  it('resolves the current account for each operation and isolates cached data by account', async () => {
    const { httpClient, json } = createHttpClient();
    let currentAccountIdentifier = 'account-a';
    json.mockReturnValue(of([]));
    const client = createRolesClient(httpClient, () => currentAccountIdentifier);

    await lastValueFrom(client.getActiveRoles());
    currentAccountIdentifier = 'account-b';
    await lastValueFrom(client.getActiveRoles());
    currentAccountIdentifier = 'account-a';
    await lastValueFrom(client.getActiveRoles());

    expect(json).toHaveBeenCalledTimes(2);
    expect(json.mock.calls[0][0]).toContain('/accounts/account-a/');
    expect(json.mock.calls[1][0]).toContain('/accounts/account-b/');
  });
});
