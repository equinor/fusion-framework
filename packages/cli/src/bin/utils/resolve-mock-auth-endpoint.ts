import { resolve } from 'node:path';

import { loadEnv } from 'vite';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

const DEFAULT_MOCK_ENDPOINT = 'http://localhost:4010';

/**
 * Resolves the mock server origin implied by `FUSION_SPA_MSAL_MOCK`, so the dev server can send
 * service discovery to the same mock that issues the tokens.
 *
 * `FUSION_SPA_MSAL_MOCK=true` (from the environment or a `.env` file) makes the SPA sign in with
 * unsigned mock tokens. Real service discovery rejects those tokens, so forwarding discovery
 * requests upstream only produces a stream of `401` responses. Mock auth therefore implies mock
 * discovery, exactly like `--mock` does.
 *
 * @param env - Runtime environment; `mode` and `root` select the `.env` files to read.
 * @param envDir - Optional Vite `envDir`, relative to `root`.
 * @returns `FUSION_SPA_MSAL_MOCK_SERVER_URL`, or `http://localhost:4010` when only
 *   `FUSION_SPA_MSAL_MOCK` is set; `undefined` when mock auth is not enabled.
 */
export function resolveMockAuthEndpoint(
  env: Pick<RuntimeEnv, 'mode' | 'root'>,
  envDir?: string,
): string | undefined {
  const root = env.root ?? process.cwd();
  const vars = loadEnv(env.mode, envDir ? resolve(root, envDir) : root, 'FUSION_SPA_MSAL_MOCK');
  // Mirrors the SPA bootstrap, which only enables mock auth for the literal value `true`
  if (vars.FUSION_SPA_MSAL_MOCK !== 'true') {
    return undefined;
  }
  return vars.FUSION_SPA_MSAL_MOCK_SERVER_URL || DEFAULT_MOCK_ENDPOINT;
}
