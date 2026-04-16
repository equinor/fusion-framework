import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';
import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';
import { AzureOpenAIModel } from '../azure/AzureOpenAIModel.js';
import type { IModel } from '../types.js';
import { STRATEGY_TYPE } from './static.js';
import type { ModelStrategy } from './types.js';
import { acquireFusionToken } from './acquire-fusion-token.js';

/** Strategy name for the default Fusion model strategy. */
export const FUSION_MODEL_STRATEGY_NAME = 'fusion-model-strategy' as const;

/** @internal Default Azure OpenAI API version used by the Fusion model strategy. */
const DEFAULT_API_VERSION = '2025-01-01-preview' as const;

/**
 * Creates a {@link ModelStrategy} backed by the Fusion AI service discovered
 * via service discovery.
 *
 * Resolves the AI service endpoint once at creation time so that all clients
 * produced by {@link ModelStrategy.createModel} share the same base URL.
 * Each call to `createModel` returns a new {@link AzureOpenAIModel} instance
 * bound to the requested deployment name.
 *
 * @param modules - The auth and service discovery module instances required to
 *   resolve the AI service endpoint and acquire MSAL tokens.
 * @returns A promise that resolves to the fully configured {@link ModelStrategy}.
 *
 * @example
 * ```typescript
 * const strategy = await createFusionModelStrategy({ auth, serviceDiscovery });
 * const model = strategy.createModel('gpt-4.1');
 * const reply = await model.invoke('Summarise the quarterly report');
 * ```
 */
export const createFusionModelStrategy = async (modules: {
  auth: IMsalProvider;
  serviceDiscovery: IServiceDiscoveryProvider;
}): Promise<ModelStrategy> => {
  // Resolve the AI service once — the resulting endpoint and credentials are
  // shared across all clients created by this strategy instance.
  const service = await modules.serviceDiscovery.resolveService('ai');

  // Service discovery returns a model-scoped URI (e.g. https://ai.test.api.fusion-dev.net/gpt-5.1-chat).
  // LangChain constructs: `${azureOpenAIBasePath}/${deploymentName}` as the baseURL for the openai SDK.
  // The openai@6 AzureOpenAI client prepends `/deployments/${model}` to every request path
  // UNLESS the baseURL already contains '/deployments' (which suppresses the injection).
  // So basePath must end with '/openai/deployments' so the final baseURL becomes
  // `{origin}/openai/deployments/{model}` and the SDK does not double-insert the deployment segment.
  const { origin } = new URL(service.uri);
  const basePath = `${origin}/openai/deployments`;

  return {
    name: FUSION_MODEL_STRATEGY_NAME,
    type: STRATEGY_TYPE.MODEL,
    createModel: (model: string): IModel => {
      return new AzureOpenAIModel({
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
