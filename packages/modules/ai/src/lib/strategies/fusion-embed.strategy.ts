import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';
import { AzureOpenAiEmbed } from '../azure/AzureOpenAiEmbed.js';
import type { IEmbed } from '../types.js';
import { STRATEGY_TYPE } from './static.js';
import type { EmbedStrategy } from './types.js';
import { acquireFusionToken, type AuthProvider } from './acquire-fusion-token.js';

/** Strategy name for the default Fusion embed strategy. */
export const FUSION_EMBED_STRATEGY_NAME = 'fusion-ai-embed-strategy' as const;

/** @internal Default Azure OpenAI API version used by the Fusion embed strategy. */
const DEFAULT_API_VERSION = '2025-01-01-preview' as const;

/** @internal Default embedding model when none is specified. */
const DEFAULT_EMBED_MODEL = 'text-embedding-3-large' as const;

/**
 * Creates an {@link EmbedStrategy} backed by the Fusion AI service discovered
 * via service discovery.
 *
 * Resolves the AI service endpoint once at creation time so that all clients
 * produced by {@link EmbedStrategy.createClient} share the same base URL.
 * Each call to `createClient` returns a new {@link AzureOpenAiEmbed} instance
 * bound to the requested (or default) embedding model deployment.
 *
 * @param modules - The auth and service discovery module instances required to
 *   resolve the AI service endpoint and acquire MSAL tokens.
 * @returns A promise that resolves to the fully configured {@link EmbedStrategy}.
 *
 * @example
 * ```typescript
 * const strategy = await createFusionAiEmbedStrategy({ auth, serviceDiscovery });
 * const embedder = strategy.createClient('text-embedding-3-large');
 * const vector = await embedder.embedQuery('Fusion Framework documentation');
 * ```
 */
export const createFusionAiEmbedStrategy = async (modules: {
  auth: AuthProvider;
  serviceDiscovery: IServiceDiscoveryProvider;
}): Promise<EmbedStrategy> => {
  // Resolve the AI service once — the resulting endpoint and credentials are
  // shared across all clients created by this strategy instance.
  const service = await modules.serviceDiscovery.resolveService('ai');

  // Use the full service URI (which may include a proxy path like /@fusion-api/ai
  // in the dev server) so that LangChain can append the deployment name correctly.
  const baseUri = service.uri.replace(/\/+$/, '');
  const basePath = `${baseUri}/openai/deployments`;

  return {
    name: FUSION_EMBED_STRATEGY_NAME,
    type: STRATEGY_TYPE.EMBED,
    createClient: (model: string = DEFAULT_EMBED_MODEL): IEmbed => {
      return new AzureOpenAiEmbed({
        azureOpenAIBasePath: basePath,
        azureOpenAIApiDeploymentName: model,
        azureOpenAIApiVersion: DEFAULT_API_VERSION,
        azureADTokenProvider: async () => {
          const { token } = await acquireFusionToken(modules.auth, service);
          return token;
        },
      });
    },
  };
};
