import { enableAI, type IAIConfigurator, AIModule } from '@equinor/fusion-framework-module-ai';

import {
  AzureOpenAiEmbed,
  AzureOpenAIModel,
  AzureVectorStore,
} from '@equinor/fusion-framework-module-ai/azure';

import type { AiOptions } from '../../../options/ai.js';
import { ModulesConfigurator, ModulesInstance } from '@equinor/fusion-framework-module';

export const setupFramework = async (options: AiOptions): Promise<ModulesInstance<[AIModule]>> => {
  // Configure the framework with AI module
  // Create a new module configurator for the framework
  const configurator = new ModulesConfigurator<[AIModule]>();
  // Add AI module configuration
  enableAI(configurator, (aiConfig: IAIConfigurator) => {
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
    if (options.azureSearchEndpoint && options.azureSearchApiKey && options.azureSearchIndexName) {
      if (!options.openaiEmbeddingDeployment) {
        throw new Error('Embedding deployment is required to configure the vector store');
      }

      // Create the embedding service first so we can use it in the vector store
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
  const framework = await configurator.initialize();
  return framework;
};
