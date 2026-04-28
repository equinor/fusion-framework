import { enableAI } from '@equinor/fusion-framework-module-ai';
import type { AIModule } from '@equinor/fusion-framework-module-ai';

import { initializeFramework, FusionEnv } from '@equinor/fusion-framework-cli/bin';
import type { FusionFrameworkSettings, FusionFramework } from '@equinor/fusion-framework-cli/bin';
import type { AiOptions } from './options/index.js';

/** Initialized framework instance with the AI module. */
export type FrameworkInstance = FusionFramework<[AIModule]>;

/**
 * Creates a Fusion Framework instance with the AI module enabled.
 *
 * Uses Azure Identity's `DefaultAzureCredential` by default, which resolves
 * credentials from the environment (OIDC, managed identity, Azure CLI, etc.).
 * When an explicit token is provided via `--token` or `FUSION_TOKEN`, that
 * token is used directly instead.
 *
 * @param options - CLI options resolved by {@link withOptions}.
 * @returns A fully initialised framework instance with the AI module.
 * @throws {Error} When authentication fails after the interactive retry.
 */
export const setupFramework = async (options: AiOptions): Promise<FusionFramework<[AIModule]>> => {
  const debug = options.debug ?? false;

  // Auth strategy:
  // 1. Explicit token (--token / FUSION_TOKEN) → direct token passthrough
  // 2. Everything else → Azure Identity (DefaultAzureCredential)
  const auth: FusionFrameworkSettings['auth'] = options.token
    ? { token: options.token }
    : { defaultCredential: true };

  const env = (options.env as FusionEnv) ?? FusionEnv.ContinuesIntegration;

  if (debug) {
    console.debug('[debug] Environment:', env);
    console.debug('[debug] Auth mode:', options.token ? 'static-token' : 'azure-identity');
  }

  /** Initialise the framework, resolve the AI service, and pre-cache tokens. */
  const initAndSetup = async (): Promise<FusionFramework<[AIModule]>> => {
    if (debug) console.debug('[debug] Initializing framework with AI module…');

    const framework = await initializeFramework<[AIModule]>({ env, auth }, (configurator) => {
      enableAI(configurator);
    });

    // resolveService makes an authenticated HTTP call — will throw
    // NoAccountsError if the user has never logged in.
    const service = await framework.serviceDiscovery.resolveService('ai');
    const scopes = service.scopes ?? service.defaultScopes ?? [];

    if (debug) {
      console.debug('[debug] AI service URL:', service.uri);
      console.debug('[debug] AI service scopes:', scopes);
    }

    // Pre-cache a token for the AI service scopes so strategy callbacks
    // don't attempt (and fail) a silent acquisition later.
    const token = await framework.auth.acquireAccessToken({ request: { scopes } });
    if (!token) throw new Error('Failed to acquire access token for the AI service.');

    if (debug) console.debug('[debug] Token acquired successfully');

    return framework;
  };

  return await initAndSetup();
};

export default setupFramework;
