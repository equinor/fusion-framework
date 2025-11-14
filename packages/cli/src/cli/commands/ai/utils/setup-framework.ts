import {
  enableAI,
  type IAIProvider,
  type IAIConfigurator,
} from '@equinor/fusion-framework-module-ai';

import {
  AzureOpenAiEmbed,
  AzureOpenAIModel,
  AzureVectorStore,
} from '@equinor/fusion-framework-module-ai/azure';

import { configureFramework, type FusionFramework } from '../../../../bin/framework.node.js';
import type { AiOptions } from '../../../options/ai.js';

export const setupFramework = async (
  options: AiOptions,
): Promise<FusionFramework & { ai: IAIProvider }> => {
  // Configure the framework with AI module
  const configurator = configureFramework({
    auth: {
      clientId: 'dummy', // Not needed for AI module
      tenantId: 'dummy', // Not needed for AI module
    },
  });
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
      console.log(
        'Setting embedding deployment',
        `\nazureOpenAIApiKey: ${options.openaiApiKey}`,
        `\nazureOpenAIApiDeploymentName: ${options.openaiEmbeddingDeployment}`,
        `\nazureOpenAIApiInstanceName: ${options.openaiInstance}`,
        `\nazureOpenAIApiVersion: ${options.openaiApiVersion}`,
      );
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
  return framework as FusionFramework & { ai: IAIProvider };
};
