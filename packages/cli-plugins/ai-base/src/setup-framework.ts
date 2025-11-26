import { enableAI, type IAIConfigurator, type AIModule } from '@equinor/fusion-framework-module-ai';

import {
  AzureOpenAiEmbed,
  AzureOpenAIModel,
  AzureVectorStore,
} from '@equinor/fusion-framework-module-ai/azure';

import type { AiOptions } from './options/index.js';
import { ModulesConfigurator, type ModulesInstance } from '@equinor/fusion-framework-module';

/**
 * Framework instance with AI module capabilities.
 *
 * This type represents an initialized Fusion Framework instance that includes
 * the AI module, providing access to chat models, embedding services, and
 * vector stores configured via the setup process.
 */
export type FrameworkInstance = ModulesInstance<[AIModule]>;

/**
 * Initializes and configures the Fusion Framework with AI module capabilities
 * @param options - AI configuration options including API keys, deployments, and vector store settings
 * @returns Promise resolving to an initialized framework instance with AI module
 * @throws {Error} If embedding deployment is required but not provided when configuring vector store
 */
export const setupFramework = async (options: AiOptions): Promise<FrameworkInstance> => {
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

export default setupFramework;
