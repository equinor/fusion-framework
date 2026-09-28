import { afterEach, describe, expect, it } from 'vitest';

import { createMockServer, type MockServerHandle } from '../index.js';
import { defineRolesV2Mock } from '../presets/fusion/define-roles-v2-mock.js';

interface MockSession {
  cookie: string;
  token: string;
}

const ASSIGNMENT_ID = '11111111-1111-4111-8111-111111111111';
const FAILURE_ASSIGNMENT_ID = '22222222-2222-4222-8222-222222222222';

/**
 * Selects a mock-auth persona and acquires a Roles bearer token for its browser session.
 *
 * @param serverUrl - Running mock server origin.
 * @param userId - Configured Roles V2 account identifier.
 * @param cookie - Existing session cookie when switching identity.
 * @returns Cookie and bearer token for the selected persona.
 */
async function selectPersona(
  serverUrl: string,
  userId: string,
  cookie?: string,
): Promise<MockSession> {
  const selection = await fetch(`${serverUrl}/@fusion-mock/auth/user`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({ userId }),
  });
  const resolvedCookie = cookie ?? selection.headers.getSetCookie()[0]?.split(';')[0];
  // A missing session cookie would make isolation assertions meaningless.
  if (!resolvedCookie) throw new Error('Mock auth did not establish a session cookie.');

  const tokenResponse = await fetch(`${serverUrl}/@fusion-mock/auth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: resolvedCookie },
    body: JSON.stringify({ scopes: ['api://roles/.default'] }),
  });
  const resolution = (await tokenResponse.json()) as { token?: unknown };
  // Tests need the same supported bearer-token contract used by browser applications.
  if (typeof resolution.token !== 'string') {
    throw new Error('Mock auth did not issue a bearer token.');
  }
  return { cookie: resolvedCookie, token: resolution.token };
}

/**
 * Sends an authenticated Roles V2 mock request.
 *
 * @param serverUrl - Running mock server origin.
 * @param session - Selected mock-auth persona.
 * @param path - Roles service-relative path.
 * @param init - Optional request method and body.
 * @returns Raw HTTP response.
 */
function requestRoles(
  serverUrl: string,
  session: MockSession,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${serverUrl}/rolesv2${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${session.token}`,
      'content-type': 'application/json',
      ...init?.headers,
    },
  });
}

describe('defineRolesV2Mock', () => {
  let server: MockServerHandle | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('serves checks and isolates activation state by browser session and account', async () => {
    const roles = defineRolesV2Mock({
      now: () => new Date('2026-01-02T03:04:05.000Z'),
      accessRoles: [
        {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          name: 'Application.View',
          description: 'View application data.',
          system: { id: 'system-a', name: 'Application' },
        },
        {
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          name: 'Application.Edit',
          description: 'Edit application data.',
          system: { id: 'system-a', name: 'Application' },
        },
      ],
      accounts: {
        'account-a': {
          activeAccessRoleAssignments: [
            {
              systemName: 'Application',
              accessRoleName: 'Application.View',
              assignmentType: 'Global',
            },
          ],
          claimableRoleAssignments: [
            {
              id: ASSIGNMENT_ID,
              reason: 'Configured application policy',
              type: 'Global',
              isActive: false,
              claimableRole: {
                id: 'claimable-a',
                name: 'Application contributor',
                system: { id: 'system-a', name: 'Application' },
                accessRoleMappings: [
                  {
                    accessRole: {
                      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                      name: 'Application.Edit',
                    },
                  },
                ],
              },
              scope: { isGlobal: true, value: null },
            },
          ],
          consolidatedRoleAssignments: [
            {
              id: 'standing-a',
              role: { id: 'role-a', name: 'Application member' },
              reasons: ['Configured application policy'],
              type: 'Global',
            },
          ],
        },
        'account-b': {
          activeAccessRoleAssignments: [],
          claimableRoleAssignments: [],
        },
      },
    });
    server = createMockServer().use('fusion').use([roles]);
    const { url } = await server.start();

    const [firstAccountASession, secondAccountASession, accountBSession] = await Promise.all([
      selectPersona(url, 'account-a'),
      selectPersona(url, 'account-a'),
      selectPersona(url, 'account-b'),
    ]);

    const accessRolePage = await requestRoles(
      url,
      firstAccountASession,
      '/access-roles?$top=1&$skip=0',
    );
    await expect(accessRolePage.json()).resolves.toMatchObject({
      totalCount: 2,
      count: 1,
      nextPage: expect.stringContaining('$skip=1'),
      value: [{ name: 'Application.View' }],
    });

    const claimablePage = await requestRoles(
      url,
      firstAccountASession,
      '/accounts/account-a/claimable-role-assignments?$top=100&$skip=0',
    );
    await expect(claimablePage.json()).resolves.toMatchObject({
      totalCount: 1,
      value: [{ id: ASSIGNMENT_ID, isActive: false }],
    });

    const activation = await requestRoles(
      url,
      firstAccountASession,
      `/accounts/account-a/claimable-role-assignments/${ASSIGNMENT_ID}/activate`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: 'Needed for browser test', hours: 2 }),
      },
    );
    expect(activation.status).toBe(201);
    await expect(activation.json()).resolves.toEqual({
      id: ASSIGNMENT_ID,
      activationDate: '2026-01-02T03:04:05.000Z',
      activeToDate: '2026-01-02T05:04:05.000Z',
      reason: 'Needed for browser test',
    });

    const [firstActive, secondActive, accountBActive] = await Promise.all([
      requestRoles(url, firstAccountASession, '/accounts/account-a/active-access-role-assignments'),
      requestRoles(
        url,
        secondAccountASession,
        '/accounts/account-a/active-access-role-assignments',
      ),
      requestRoles(url, accountBSession, '/accounts/account-b/active-access-role-assignments'),
    ]);
    await expect(firstActive.json()).resolves.toEqual([
      {
        systemName: 'Application',
        accessRoleName: 'Application.View',
        assignmentType: 'Global',
      },
      {
        systemName: 'Application',
        accessRoleName: 'Application.Edit',
        assignmentType: 'Global',
        activeToDate: '2026-01-02T05:04:05.000Z',
      },
    ]);
    await expect(secondActive.json()).resolves.toHaveLength(1);
    await expect(accountBActive.json()).resolves.toEqual([]);

    const switched = await selectPersona(url, 'account-b', firstAccountASession.cookie);
    const switchedActive = await requestRoles(
      url,
      switched,
      '/accounts/account-b/active-access-role-assignments',
    );
    await expect(switchedActive.json()).resolves.toEqual([]);

    const switchedBack = await selectPersona(url, 'account-a', switched.cookie);
    const restoredActive = await requestRoles(
      url,
      switchedBack,
      '/accounts/account-a/active-access-role-assignments',
    );
    await expect(restoredActive.json()).resolves.toHaveLength(2);

    const deactivation = await requestRoles(
      url,
      switchedBack,
      `/accounts/account-a/claimable-role-assignments/${ASSIGNMENT_ID}/deactivate`,
      { method: 'POST' },
    );
    expect(deactivation.status).toBe(201);
    const afterDeactivation = await requestRoles(
      url,
      switchedBack,
      '/accounts/account-a/active-access-role-assignments',
    );
    await expect(afterDeactivation.json()).resolves.toEqual([
      {
        systemName: 'Application',
        accessRoleName: 'Application.View',
        assignmentType: 'Global',
      },
    ]);
  });

  it('returns configured activation failures and explicit identity/account errors', async () => {
    const roles = defineRolesV2Mock({
      accounts: {
        'failure-account': {
          claimableRoleAssignments: [
            {
              id: FAILURE_ASSIGNMENT_ID,
              type: 'Global',
              claimableRole: { id: 'claimable-failure', name: 'Temporary capability' },
            },
          ],
          activations: {
            [FAILURE_ASSIGNMENT_ID]: {
              error: { status: 503, body: { error: 'Activation unavailable' } },
            },
          },
        },
      },
    });
    server = createMockServer().use('fusion').use([roles]);
    const { url } = await server.start();
    const session = await selectPersona(url, 'failure-account');

    const failure = await requestRoles(
      url,
      session,
      `/accounts/failure-account/claimable-role-assignments/${FAILURE_ASSIGNMENT_ID}/activate`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: 'Exercise failure', hours: 1 }),
      },
    );
    expect(failure.status).toBe(503);
    await expect(failure.json()).resolves.toEqual({ error: 'Activation unavailable' });

    const mismatch = await requestRoles(
      url,
      session,
      '/accounts/another-account/active-access-role-assignments',
    );
    expect(mismatch.status).toBe(403);

    const unknownSession = await selectPersona(url, 'unknown-account');
    const unknown = await requestRoles(url, unknownSession, '/access-roles');
    expect(unknown.status).toBe(404);

    const missing = await fetch(
      `${url}/rolesv2/accounts/failure-account/active-access-role-assignments`,
    );
    expect(missing.status).toBe(401);
  });

  it('rejects malformed account and activation policy before server startup', () => {
    expect(() => defineRolesV2Mock({ accounts: {} })).toThrow(
      'requires at least one configured account',
    );
    expect(() =>
      defineRolesV2Mock({
        accounts: {
          persona: {
            claimableRoleAssignments: [{ id: ASSIGNMENT_ID }],
            activations: {
              missing: { error: { status: 200, body: {} } },
            },
          },
        },
      }),
    ).toThrow('configures unknown claimable assignment "missing"');
  });
});
