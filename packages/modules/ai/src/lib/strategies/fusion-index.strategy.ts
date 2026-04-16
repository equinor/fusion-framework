import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';
import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';
import { FusionSearchClient } from '../azure/FusionSearchClient.js';
import { AzureVectorStore } from '../azure/AzureVectorStore.js';
import type { IEmbed, IVectorStore } from '../types.js';
import { STRATEGY_TYPE } from './static.js';
import type { IndexStrategy } from './types.js';
import { acquireFusionToken } from './acquire-fusion-token.js';

/** Strategy name for the default Fusion index strategy. */
export const FUSION_INDEX_STRATEGY_NAME = 'fusion-index-strategy' as const;

/**
 * Creates an {@link IndexStrategy} backed by the Fusion AI service discovered
 * via service discovery.
 *
 * Resolves the AI service endpoint once at creation time so that all stores
 * produced by {@link IndexStrategy.createStore} share the same base URL.
 * Each call to `createStore` returns a new {@link AzureVectorStore} instance
 * pre-configured with a {@link FusionSearchClient} that rewrites the OData
 * action paths to match the Fusion AI proxy route structure.
 *
 * @param modules - The auth and service discovery module instances required to
 *   resolve the AI service endpoint and acquire MSAL tokens.
 * @returns A promise that resolves to the fully configured {@link IndexStrategy}.
 *
 * @example
 * ```typescript
 * const strategy = await createFusionIndexStrategy({ auth, serviceDiscovery });
 * const store = strategy.createStore(embedClient, 'my-index');
 * const results = await store.invoke('quarterly earnings summary');
 * ```
 */
export const createFusionIndexStrategy = async (modules: {
  auth: IMsalProvider;
  serviceDiscovery: IServiceDiscoveryProvider;
}): Promise<IndexStrategy> => {
  // Resolve the AI service once — the resulting endpoint and credentials are
  // shared across all stores created by this strategy instance.
  const aiService = await modules.serviceDiscovery.resolveService('ai');
  const { origin } = new URL(aiService.uri);

  return {
    name: FUSION_INDEX_STRATEGY_NAME,
    type: STRATEGY_TYPE.INDEX,
    createStore: (embed: IEmbed, indexName: string): IVectorStore => {
      // FusionSearchClient already embeds the path-rewrite policy that maps
      // OData action paths to the simpler Fusion AI proxy route structure.
      const searchClient = new FusionSearchClient(origin, indexName, {
        getToken: () => acquireFusionToken(modules.auth, aiService),
      });
      return new AzureVectorStore(embed, { client: searchClient, indexName });
    },
  };
};
