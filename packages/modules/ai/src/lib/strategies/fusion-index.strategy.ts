import type {
  IServiceDiscoveryProvider,
  Service,
} from '@equinor/fusion-framework-module-service-discovery';
import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';
import { AzureKeyCredential } from '@azure/search-documents';
import { FusionSearchClient } from '../azure/FusionSearchClient.js';
import { AzureVectorStore } from '../azure/AzureVectorStore.js';
import type { IEmbed, IVectorStore } from '../types.js';
import { STRATEGY_TYPE } from './static.js';
import type { IndexStrategy } from './types.js';
import { acquireFusionToken } from './acquire-fusion-token.js';

/** Strategy name for the default Fusion index strategy. */
export const FUSION_INDEX_STRATEGY_NAME = 'fusion-ai-index-strategy' as const;

/** Matches endpoints served by the local dev-server proxy. */
const LOCAL_DEV_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

/**
 * Creates a {@link FusionSearchClient} for the given endpoint.
 *
 * For production (HTTPS) endpoints the client uses a standard
 * `TokenCredential`. For local dev-server proxies (HTTP on localhost)
 * the Azure SDK's bearer-token policy rejects non-TLS requests, so we
 * use a dummy `KeyCredential` and inject the real token via a custom
 * pipeline policy instead.
 *
 * @param aiService - Resolved AI service descriptor from service discovery.
 * @param indexName - Azure AI Search index name to target.
 * @param modules - Object containing the MSAL auth provider for token acquisition.
 * @returns A configured {@link FusionSearchClient} with path-rewrite and
 *   authentication policies applied.
 */
function createSearchClient(
  aiService: Service,
  indexName: string,
  modules: { auth: IMsalProvider },
): FusionSearchClient {
  const baseUri = aiService.uri.replace(/\/+$/, '');

  // The Azure SDK's `bearerTokenAuthenticationPolicy` has a hardcoded check
  // that rejects bearer tokens over non-HTTPS URLs. When the dev-server
  // proxies the Fusion AI service via `http://localhost`, we work around
  // this by using a dummy `AzureKeyCredential` (which skips the TLS check)
  // and injecting the real MSAL bearer token through a custom pipeline policy.
  if (LOCAL_DEV_RE.test(baseUri)) {
    return new FusionSearchClient(baseUri, indexName, new AzureKeyCredential('dev-proxy'), {
      allowInsecureConnection: true,
      additionalPolicies: [
        {
          // Manually attach the MSAL bearer token on every request.
          // The SDK's built-in bearer policy is bypassed because we
          // authenticated with a dummy KeyCredential above.
          policy: {
            name: 'FusionDevBearerToken',
            async sendRequest(request, next) {
              const { token } = await acquireFusionToken(modules.auth, aiService);
              request.headers.set('Authorization', `Bearer ${token}`);
              return next(request);
            },
          },
          position: 'perCall',
        },
      ],
    });
  }

  // Production path: use standard TokenCredential over HTTPS.
  return new FusionSearchClient(baseUri, indexName, {
    getToken: () => acquireFusionToken(modules.auth, aiService),
  });
}

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
 * const strategy = await createFusionAiIndexStrategy({ auth, serviceDiscovery });
 * const store = strategy.createStore(embedClient, 'my-index');
 * const results = await store.invoke('quarterly earnings summary');
 * ```
 */
export const createFusionAiIndexStrategy = async (modules: {
  auth: IMsalProvider;
  serviceDiscovery: IServiceDiscoveryProvider;
}): Promise<IndexStrategy> => {
  // Resolve the AI service once — the resulting endpoint and credentials are
  // shared across all stores created by this strategy instance.
  const aiService = await modules.serviceDiscovery.resolveService('ai');

  return {
    name: FUSION_INDEX_STRATEGY_NAME,
    type: STRATEGY_TYPE.INDEX,
    createStore: (embed: IEmbed, indexName: string): IVectorStore => {
      const searchClient = createSearchClient(aiService, indexName, modules);
      return new AzureVectorStore(embed, { client: searchClient, indexName });
    },
  };
};
