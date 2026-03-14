import { enableAI, type IAIConfigurator, type AIModule } from '@equinor/fusion-framework-module-ai';

import {
  AzureOpenAiEmbed,
  AzureOpenAIModel,
  AzureVectorStore,
} from '@equinor/fusion-framework-module-ai/azure';

import type { AiOptions } from '../options/ai.js';
import { ModulesConfigurator, type ModulesInstance } from '@equinor/fusion-framework-module';

/**
 * Bootstrap a headless Fusion Framework instance configured with the AI module.
 *
 * Creates a {@link ModulesConfigurator}, wires up Azure OpenAI chat and/or
 * embedding models based on the supplied {@link AiOptions}, optionally
 * provisions an Azure Cognitive Search vector store, and returns the fully
 * initialised module instance.
 *
 * This is the standard factory used by every `ffc ai *` subcommand to obtain a
 * framework with AI capabilities without running a full application shell.
 *
 * @param options - Resolved CLI option values containing Azure OpenAI
 *   credentials, deployment names, and Azure Search connection details.
 * @returns A promise that resolves to an initialised {@link ModulesInstance}
 *   containing the {@link AIModule}.
 *
 * @throws {Error} When `azureSearchEndpoint`, `azureSearchApiKey`, and
 *   `azureSearchIndexName` are provided but `openaiEmbeddingDeployment` is
 *   missing — the vector store requires an embedding service.
 *
 * @example
 * ```ts
 * import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-search/utils/setup-framework';
 *
 * const framework = await setupFramework(resolvedOptions);
 * const searchService = framework.ai.getService('search', 'my-index');
 * ```
 */
export const setupFramework = async (options: AiOptions): Promise<ModulesInstance<[AIModule]>> => {
  // Create a new module configurator for the framework
  const configurator = new ModulesConfigurator<[AIModule]>();

  // Configure AI module with provided options
  enableAI(configurator, (aiConfig: IAIConfigurator) => {
    // Configure chat model if deployment name is provided
    if (options.openaiChatDeployment) {
      aiConfig.setModel(
        options.openaiChatDeployment,
        new AzureOpenAIModel({
          azureOpenAIApiKey: options.openaiApiKey,
          azureOpenAIApiDeploymentName: options.openaiChatDeployment,
          azureOpenAIApiInstanceName: options.openaiInstance,
          azureOpenAIApiVersion: options.openaiApiVersion,
        }),
      );
    }

    // Configure embedding model if deployment name is provided
    if (options.openaiEmbeddingDeployment) {
      aiConfig.setEmbedding(
        options.openaiEmbeddingDeployment,
        new AzureOpenAiEmbed({
          azureOpenAIApiKey: options.openaiApiKey,
          azureOpenAIApiDeploymentName: options.openaiEmbeddingDeployment,
          azureOpenAIApiInstanceName: options.openaiInstance,
          azureOpenAIApiVersion: options.openaiApiVersion,
        }),
      );
    }

    // Configure vector store if Azure Search options are provided
    // Vector store requires an embedding service to generate embeddings for documents
    if (options.azureSearchEndpoint && options.azureSearchApiKey && options.azureSearchIndexName) {
      if (!options.openaiEmbeddingDeployment) {
        throw new Error('Embedding deployment is required to configure the vector store');
      }

      // Retrieve the embedding service to pass to the vector store
      // The vector store uses embeddings to index and search documents
      const embeddingService = aiConfig.getService('embeddings', options.openaiEmbeddingDeployment);

      aiConfig.setVectorStore(
        options.azureSearchIndexName,
        new AzureVectorStore(embeddingService, {
          endpoint: options.azureSearchEndpoint,
          key: options.azureSearchApiKey,
          indexName: options.azureSearchIndexName,
        }),
      );
    }
  });

  // Initialize the framework with all configured modules
  const framework = await configurator.initialize();
  return framework;
};
