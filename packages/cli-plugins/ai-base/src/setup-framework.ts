import { enableAI } from '@equinor/fusion-framework-module-ai';
import type { AIModule } from '@equinor/fusion-framework-module-ai';

import {
  initializeFramework,
  FusionEnv,
} from '@equinor/fusion-framework-cli/bin';
import type { FusionFrameworkSettings, FusionFramework } from '@equinor/fusion-framework-cli/bin';
import type { AiOptions } from './options/index.js';

import { execFileSync } from 'node:child_process';

/** Initialized framework instance with the AI module. */
export type FrameworkInstance = FusionFramework<[AIModule]>;

/**
 * Check whether an error (possibly wrapped in a cause chain) is an
 * authentication-related failure that may be recoverable via interactive login.
 *
 * @internal
 */
const isAuthError = (error: unknown): boolean => {
  let current: unknown = error;
  while (current) {
    if (current instanceof Error) {
      if (
        current.name === 'NoAccountsError' ||
        current.name === 'SilentTokenAcquisitionError' ||
        current.message.includes('No accounts found')
      ) {
        return true;
      }
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
};

/**
 * Creates a Fusion Framework instance with the AI module enabled.
 *
 * Initialises the Fusion Framework with service discovery and MSAL auth,
 * resolves the `'ai'` service endpoint, and pre-caches a bearer token.
 * If MSAL has no cached credentials, the CLI's interactive `auth login`
 * flow is spawned automatically before retrying.
 *
 * @param options - CLI options resolved by {@link withOptions}.
 * @returns A fully initialised framework instance with the AI module.
 * @throws {Error} When authentication fails after the interactive retry.
 */
export const setupFramework = async (options: AiOptions): Promise<FusionFramework<[AIModule]>> => {
  // Service-discovery mode: resolve URL + scopes from Fusion service registry
  const auth: FusionFrameworkSettings['auth'] = options.token
    ? { token: options.token }
    : {
        tenantId: options.tenantId ?? '3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
        clientId: options.clientId ?? 'a318b8e1-0295-4e17-98d5-35f67dfeba14',
      };

  const env = (options.env as FusionEnv) ?? FusionEnv.ContinuesIntegration;

  /** Initialise the framework, resolve the AI service, and pre-cache tokens. */
  const initAndSetup = async (): Promise<FusionFramework<[AIModule]>> => {
    const framework = await initializeFramework<[AIModule]>(
      { env, auth },
      (configurator) => {
        enableAI(configurator);
      },
    );

    // resolveService makes an authenticated HTTP call — will throw
    // NoAccountsError if the user has never logged in.
    const service = await framework.serviceDiscovery.resolveService('ai');
    const scopes = service.scopes ?? service.defaultScopes ?? [];

    // Pre-cache a token for the AI service scopes so strategy callbacks
    // don't attempt (and fail) a silent acquisition later.
    const token = await framework.auth.acquireAccessToken({ request: { scopes } });
    if (!token) throw new Error('Failed to acquire access token for the AI service.');

    return framework;
  };

  try {
    return await initAndSetup();
  } catch (error: unknown) {
    // If the failure is auth-related and we're not using a static token,
    // spawn the CLI's own `auth login` (starts local server + browser)
    // and retry the full init sequence.
    if (!isAuthError(error) || options.token) throw error;

    const cliEntry = process.argv[1];
    if (!cliEntry) {
      throw new Error(
        'Failed to acquire access token and could not determine CLI path for interactive login.',
      );
    }

    console.log('No cached credentials — launching interactive login…');
    execFileSync(process.execPath, [cliEntry, 'auth', 'login'], {
      stdio: 'inherit',
    });

    return await initAndSetup();
  }
};

export default setupFramework;
