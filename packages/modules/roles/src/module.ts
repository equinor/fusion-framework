import type {
  IModuleConfigurator,
  IModulesConfigurator,
  Module,
} from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

import { RolesClient } from './RolesClient.js';
import {
  type IRolesModuleConfigurator,
  RolesModuleConfigurator,
} from './RolesModuleConfigurator.js';
import { type IRolesProvider, RolesProvider } from './RolesProvider.js';
import { RequiredRolesError } from './RequiredRolesError.js';

const ROLES_SERVICE_KEY = 'rolesv2';

interface ActiveAccountProvider {
  account: {
    localAccountId: string;
  } | null;
}

/**
 * Determines whether authentication exposes the active Fusion account needed for role checks.
 *
 * @param value - Authentication provider resolved from the module registry.
 * @returns True when the provider exposes an active-account property.
 */
const isActiveAccountProvider = (value: unknown): value is ActiveAccountProvider => {
  return !!value && typeof value === 'object' && 'account' in value;
};

/**
 * Resolves the active Fusion account identifier from the authentication provider.
 *
 * @param auth - Authentication provider expected to expose the signed-in account.
 * @returns The active local account identifier.
 * @throws {RequiredRolesError} When authentication does not expose an active account.
 */
const resolveAccountIdentifier = (auth: unknown): string => {
  // Roles V2 account operations must follow the account selected by framework authentication.
  if (!isActiveAccountProvider(auth) || !auth.account?.localAccountId) {
    throw new RequiredRolesError(
      'Roles module requires an active authenticated account to resolve Roles V2 data.',
    );
  }
  return auth.account.localAccountId;
};

/**
 * Enforces configured role requirements before module bootstrap completes.
 *
 * @param provider - Roles provider used to load active access roles.
 * @param requiredRoles - Access-role names that must all be active.
 * @throws {RequiredRolesError} When a required role is missing.
 */
const assertRequiredRoles = async (
  provider: IRolesProvider,
  requiredRoles: readonly string[],
): Promise<void> => {
  // Avoid requiring browser-specific account state when no bootstrap roles were configured.
  if (requiredRoles.length === 0) {
    return;
  }
  const activeRoles = await provider.getActiveRoles();
  const activeRoleNames = new Set<string>();
  // Ignore incomplete service records because only explicit access-role names can satisfy the guard.
  for (const assignment of activeRoles) {
    // Only named assignments can satisfy a configured access-role requirement.
    if (assignment.accessRoleName) {
      activeRoleNames.add(assignment.accessRoleName);
    }
  }
  const missingRoles: string[] = [];
  // Report every missing role in one bootstrap error so configuration can be fixed in one pass.
  for (const role of requiredRoles) {
    // Preserve each unmet configured name for the caller-facing bootstrap error.
    if (!activeRoleNames.has(role)) {
      missingRoles.push(role);
    }
  }
  // Any missing required role denies bootstrap; configured roles use all-of semantics.
  if (missingRoles.length > 0) {
    throw new RequiredRolesError(
      `Roles module bootstrap denied. Missing required roles: ${missingRoles.join(', ')}.`,
      missingRoles,
    );
  }
};

/**
 * Module registry key for the Fusion Framework Roles V2 module.
 */
export const moduleKey = 'roles';

/**
 * Fusion Framework module contract for Roles V2.
 */
export type RolesModule = Module<
  typeof moduleKey,
  IRolesProvider,
  IRolesModuleConfigurator,
  [ServiceDiscoveryModule, MsalModule, EventModule, TelemetryModule]
>;

/**
 * Roles V2 module descriptor with host-to-application client inheritance.
 */
export const module: RolesModule = {
  name: moduleKey,
  configure: () => new RolesModuleConfigurator(),
  initialize: async (args) => {
    const config = await (args.config as RolesModuleConfigurator).createConfigAsync(args);
    const parent = args.ref?.roles as IRolesProvider | undefined;
    const auth = args.hasModule('auth') ? await args.requireInstance('auth') : undefined;
    const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
    const telemetry = args.hasModule('telemetry')
      ? await args.requireInstance('telemetry')
      : undefined;
    let provider: IRolesProvider;

    // Custom clients are finalized by the configuration builder before module initialization.
    if (config.client) {
      provider = new RolesProvider({ ...config, client: config.client }, { event, telemetry });
    } else if (parent) {
      // Child app and portal modules reuse the already-initialized host provider.
      provider = parent;
    } else {
      // A host without a parent or custom factory must resolve Roles V2 through service discovery.
      if (!args.hasModule('serviceDiscovery')) {
        throw new Error(
          'Roles module requires the serviceDiscovery module or a configured client.',
        );
      }
      const serviceDiscovery = await args.requireInstance('serviceDiscovery');
      const accountIdentifier = resolveAccountIdentifier(auth);
      const httpClient = await serviceDiscovery.createClient(ROLES_SERVICE_KEY);
      const client = new RolesClient(httpClient, accountIdentifier);
      provider = new RolesProvider({ ...config, client }, { event, telemetry });
    }

    await assertRequiredRoles(provider, config.requiredRoles);
    return provider;
  },
};

/**
 * Callback used to configure the Roles V2 module.
 */
export type RolesModuleBuilderCallback = (
  builder: IRolesModuleConfigurator,
) => void | Promise<void>;

/**
 * Creates a module configuration object for advanced Roles V2 setup.
 *
 * @param configure - Callback that customizes the roles configurator.
 * @returns A roles module configuration accepted by `addConfig`.
 */
export const configureRoles = (
  configure: RolesModuleBuilderCallback,
): IModuleConfigurator<RolesModule, unknown> => ({
  module,
  configure,
});

/**
 * Enables the Roles V2 module on a framework, portal, or application configurator.
 *
 * @param configurator - Module configurator receiving the roles registration.
 * @param configure - Optional callback for supplying a custom client factory.
 */
export const enableRoles = (
  configurator: IModulesConfigurator,
  configure?: RolesModuleBuilderCallback,
): void => {
  configurator.addConfig(configure ? configureRoles(configure) : { module });
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    roles: RolesModule;
  }
}

export default module;
