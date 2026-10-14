import { FrameworkConfigurator, init } from '@equinor/fusion-framework';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  type AccountInfo,
  enableMSAL,
  MsalClient,
  module as authModule,
} from '@equinor/fusion-framework-module-msal';
import { enableRoles, rolesModule, type RolesModule } from '@equinor/fusion-framework-module-roles';
import { RequiredAccessRolesError } from '@equinor/fusion-framework-module-roles/errors';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppConfigurator } from '../AppConfigurator.js';
import { configureModules } from '../configure-modules.js';
import type { AppEnv, AppModuleInitiator } from '../types.js';

const env: AppEnv = {
  manifest: {
    appKey: 'roles-auth-inheritance',
    displayName: 'Roles authentication inheritance',
    description: 'Exercises the production hosted application bootstrap',
    type: 'standalone',
  },
};
const activeRoles = [
  { systemName: 'Fusion', accessRoleName: 'Reports.Read', assignmentType: 'Global' },
];
const disposeCallbacks: Array<() => void | Promise<void>> = [];

/**
 * Supplies a deterministic external MSAL session while retaining the real client and provider.
 *
 * @param identifier - Local account identifier, or null for a signed-out session.
 * @returns Client and mutable session used to simulate parent account changes.
 */
function createSession(identifier: string | null) {
  const session = {
    account: identifier === null ? null : createAccount(identifier),
  };
  const client = new MsalClient({ auth: { clientId: 'roles-inheritance-test' } });
  const initialize = vi.spyOn(client, 'initialize').mockResolvedValue();
  const login = vi.spyOn(client, 'login').mockRejectedValue(new Error('Unexpected login flow'));
  vi.spyOn(client, 'getActiveAccount').mockImplementation(() => session.account);
  return { client, session, initialize, login };
}

/**
 * Creates a complete MSAL account without requiring an Entra login.
 *
 * @param localAccountId - Account selected by the external authentication session.
 * @returns Account shape consumed by the production MSAL provider.
 */
function createAccount(localAccountId: string): AccountInfo {
  return {
    localAccountId,
    homeAccountId: `${localAccountId}.tenant`,
    tenantId: 'tenant',
    environment: 'login.microsoftonline.com',
    username: 'roles-test@example.test',
  };
}

/**
 * Initializes a real portal framework with controlled network and Entra boundaries.
 *
 * @param identifier - Initial authenticated account, or null for sign-out.
 * @returns Portal framework, external session and HTTP request recorder.
 */
async function createPortal(identifier: string | null = 'portal-account') {
  const external = createSession(identifier);
  const requests: Array<{ url: URL; headers: Headers }> = [];
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, options) => {
    const url = new URL(String(input));
    requests.push({ url, headers: new Headers(options?.headers) });
    // Only the external service responses are substituted; discovery, HTTP and Roles stay real.
    if (url.hostname === 'discovery.example.test') {
      return Response.json([
        { key: 'rolesv2', uri: 'https://roles.example.test', scopes: ['roles.read'] },
        { key: 'context', uri: 'https://context.example.test', scopes: [] },
      ]);
    }
    if (
      url.hostname === 'roles.example.test' &&
      url.pathname.endsWith('/active-access-role-assignments')
    ) {
      return Response.json(activeRoles);
    }
    throw new Error(`Unexpected HTTP request: ${url}`);
  });
  vi.stubGlobal('fetch', fetch);

  const configurator = new FrameworkConfigurator();
  configurator.configureMsal((builder) => {
    builder.setClient(external.client);
    builder.setRequiresAuth(false);
  });
  configurator.configureServiceDiscovery({
    client: { baseUri: 'https://discovery.example.test' },
  });
  const fusion = await init(configurator);
  disposeCallbacks.push(() => configurator.dispose(fusion.modules));
  const acquireToken = vi
    .spyOn(fusion.modules.auth, 'acquireAccessToken')
    .mockResolvedValue('portal-test-token');
  const createProxy = vi.spyOn(fusion.modules.auth, 'createProxyProvider');
  return { fusion, requests, acquireToken, createProxy, ...external };
}

/**
 * Boots an ordinary application through the same entry point used by React makeComponent.
 *
 * @param portal - Initialized portal whose modules are passed into app initialization.
 * @param configure - Optional deliberate application authentication customization.
 * @returns Application modules with the production Roles client initialized.
 */
async function initializeApp(
  portal: Awaited<ReturnType<typeof createPortal>>,
  configure?: AppModuleInitiator<[RolesModule]>,
) {
  const initialize = configureModules<[RolesModule]>(async (configurator, args) => {
    await configure?.(configurator, args);
    enableRoles(configurator);
  });
  const modules = await initialize({ fusion: portal.fusion, env });
  disposeCallbacks.push(() => modules.roles.dispose());
  return modules;
}

describe('hosted Roles authentication through configureModules', () => {
  afterEach(async () => {
    // Dispose application clients before their portal and restore external boundaries last.
    for (const dispose of disposeCallbacks.splice(0).reverse()) {
      await dispose();
    }
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([false, true])(
    'uses portal auth with real Roles HTTP requests (redundant enableMSAL: %s)',
    async (explicitEnable) => {
      const portal = await createPortal();
      const defaults = new AppConfigurator(env);
      expect(defaults.modules.map(({ name }) => name)).toEqual(['event', 'http', 'auth']);
      const modules = await initializeApp(portal, (configurator) => {
        // Compare the historical troubleshooting workaround with ordinary app bootstrap.
        if (explicitEnable) {
          enableMSAL(configurator);
        }
      });

      await expect(modules.roles.getActiveAccessRoleAssignments()).resolves.toEqual(activeRoles);
      expect(portal.createProxy).toHaveBeenCalledOnce();
      expect(portal.createProxy).toHaveBeenCalledWith(String(authModule.version));
      expect(modules.auth.client).toBe(portal.client);
      expect(modules.auth.account).toBe(portal.session.account);
      expect(portal.requests.at(-1)?.url.pathname).toBe(
        '/accounts/portal-account/active-access-role-assignments',
      );
      expect(portal.requests.at(-1)?.url.searchParams.get('api-version')).toBe('1.0');
      expect(portal.requests.at(-1)?.headers.get('Authorization')).toBe('Bearer portal-test-token');
      expect(portal.acquireToken).toHaveBeenCalledWith({ request: { scopes: ['roles.read'] } });
      expect(portal.initialize).toHaveBeenCalledOnce();
      expect(portal.login).not.toHaveBeenCalled();
    },
  );

  it('reads parent account switches and sign-out before cache lookup, and recovers after sign-in', async () => {
    const portal = await createPortal();
    const modules = await initializeApp(portal);
    await modules.roles.getActiveAccessRoleAssignments();
    portal.session.account = createAccount('second-account');
    await modules.roles.getActiveAccessRoleAssignments();
    expect(portal.requests.at(-1)?.url.pathname).toContain('/accounts/second-account/');

    const requestCount = portal.requests.length;
    portal.session.account = null;
    await expect(modules.roles.getActiveAccessRoleAssignments()).rejects.toBeInstanceOf(
      RequiredAccessRolesError,
    );
    expect(portal.requests).toHaveLength(requestCount);

    portal.session.account = createAccount('third-account');
    await expect(modules.roles.getActiveAccessRoleAssignments()).resolves.toEqual(activeRoles);
    expect(portal.requests.at(-1)?.url.pathname).toContain('/accounts/third-account/');
    expect(portal.initialize).toHaveBeenCalledOnce();
    expect(portal.login).not.toHaveBeenCalled();
  });

  it.each([null, ''])(
    'rejects an unauthenticated or unidentified parent account (%s)',
    async (id) => {
      const portal = await createPortal(id);
      const modules = await initializeApp(portal);
      const requestCount = portal.requests.length;

      await expect(modules.roles.getActiveAccessRoleAssignments()).rejects.toThrow(
        'Roles module requires an active authenticated account to resolve Roles V2 data.',
      );
      expect(portal.requests).toHaveLength(requestCount);
      expect(portal.login).not.toHaveBeenCalled();
    },
  );

  it('retains an explicitly supplied app provider, including its signed-out state', async () => {
    const portal = await createPortal();
    const custom = createSession('custom-account');
    const customConfigurator = new ModulesConfigurator([authModule]);
    enableTelemetry(customConfigurator);
    enableMSAL(customConfigurator, (builder) => {
      builder.setClient(custom.client);
      builder.setRequiresAuth(false);
    });
    const customModules = await customConfigurator.initialize();
    const { auth } = customModules;
    disposeCallbacks.push(() => customConfigurator.dispose(customModules));
    const modules = await initializeApp(portal, (configurator) => {
      enableMSAL(configurator, (builder) => builder.setProvider(auth));
    });

    expect(modules.auth).toBe(auth);
    expect(portal.createProxy).not.toHaveBeenCalled();
    await modules.roles.getActiveAccessRoleAssignments();
    expect(portal.requests.at(-1)?.url.pathname).toContain('/accounts/custom-account/');
    portal.session.account = createAccount('changed-portal-account');
    custom.session.account = null;
    const requestCount = portal.requests.length;
    await expect(modules.roles.getActiveAccessRoleAssignments()).rejects.toBeInstanceOf(
      RequiredAccessRolesError,
    );
    expect(portal.requests).toHaveLength(requestCount);
    expect(custom.login).not.toHaveBeenCalled();
  });

  it('reuses a legacy v4 parent proxy through the existing MSAL compatibility path', async () => {
    const portal = await createPortal();
    portal.fusion.modules.auth = portal.fusion.modules.auth.createProxyProvider('4.0.0');
    const modules = await initializeApp(portal);

    expect(modules.auth.client).toBe(portal.client);
    await expect(modules.roles.getActiveAccessRoleAssignments()).resolves.toEqual(activeRoles);
    portal.session.account = createAccount('legacy-parent-next-account');
    await modules.roles.getActiveAccessRoleAssignments();
    expect(portal.requests.at(-1)?.url.pathname).toContain('/accounts/legacy-parent-next-account/');
    expect(portal.initialize).toHaveBeenCalledOnce();
    expect(portal.login).not.toHaveBeenCalled();
  });

  it('distinguishes a bare module registry from the automatic app auth registration', async () => {
    const portal = await createPortal();
    const configurator = new ModulesConfigurator([rolesModule]);
    const modules = await configurator.initialize(portal.fusion.modules);
    disposeCallbacks.push(() => configurator.dispose(modules));

    await expect(modules.roles.getActiveAccessRoleAssignments()).rejects.toBeInstanceOf(
      RequiredAccessRolesError,
    );
    expect(portal.requests.some(({ url }) => url.hostname === 'roles.example.test')).toBe(false);
    expect(portal.createProxy).not.toHaveBeenCalled();
  });

  it('checks startup requirements using the inherited account without app auth configuration', async () => {
    const portal = await createPortal();
    const initialize = configureModules<[RolesModule]>((configurator) => {
      enableRoles(configurator, (builder) => builder.requireAccessRoles(['Reports.Read']));
    });
    const modules = await initialize({ fusion: portal.fusion, env });
    disposeCallbacks.push(() => modules.roles.dispose());

    expect(portal.requests.at(-1)?.url.pathname).toContain('/accounts/portal-account/');
    await expect(modules.roles.hasAccessRole(['Reports.Read'], { required: true })).resolves.toBe(
      true,
    );
    expect(portal.login).not.toHaveBeenCalled();
  });
});
