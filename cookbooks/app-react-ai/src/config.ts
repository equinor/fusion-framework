import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAI } from '@equinor/fusion-framework-module-ai';
import {
  AzureSearchClient,
  AzureOpenAIModel,
  AzureOpenAiEmbed,
  AzureVectorStore,
} from '@equinor/fusion-framework-module-ai/azure';
import { z } from 'zod';

/**
 * Configuration type for Azure OpenAI environment variables
 */
export type AzureOpenAIEnvironmentConfig = z.infer<typeof azureOpenAIEnvironmentSchema>;

/**
 * Zod schema for Azure OpenAI environment variables
 */
export const azureOpenAIEnvironmentSchema = z.object({
  /** Azure OpenAI API key for authentication */
  azureOpenAIApiKey: z.string(),
  /** Azure OpenAI API version */
  azureOpenAIApiVersion: z.string(),
  /** Azure OpenAI instance name */
  azureOpenAIApiInstanceName: z.string(),
  /** Azure OpenAI deployment name for chat */
  azureOpenAIApiChatDeploymentName: z.string(),
  /** Azure OpenAI model name for chat */
  azureOpenAIApiChatModelName: z.string().optional(),
  /** Azure OpenAI deployment name for embeddings */
  azureOpenAIApiEmbeddingDeploymentName: z.string(),
  /** Azure Search endpoint URL */
  azureSearchEndpoint: z.string(),
  /** Azure Search API key */
  azureSearchApiKey: z.string(),
  /** Azure Search index name */
  azureSearchIndexName: z.string(),
});

export const configure: AppModuleInitiator = (configurator, { env }) => {
  /** enable AI module */
  enableAI(configurator, (builder) => {
    console.log('environment', env.config?.environment);
    const environment = azureOpenAIEnvironmentSchema.parse(env.config?.environment);

    console.log('configuring AI module with Azure OpenAI');

    const azureOpenAIApiKey = environment.azureOpenAIApiKey;
    const azureOpenAIApiVersion = environment.azureOpenAIApiVersion;
    const azureOpenAIApiInstanceName = environment.azureOpenAIApiInstanceName;

    // Configure a chat model
    builder.setModel('reasoning', async () => {
      return new AzureOpenAIModel({
        azureOpenAIApiKey,
        azureOpenAIApiInstanceName,
        azureOpenAIApiVersion: '2025-01-01-preview',
        azureOpenAIApiDeploymentName: 'gpt-4.1',
        model: 'gpt-4.1',
      });
    });

    builder.setModel('non-reasoning', async () => {
      return new AzureOpenAIModel({
        azureOpenAIApiKey,
        azureOpenAIApiInstanceName,
        azureOpenAIApiVersion: '2025-01-01-preview',
        azureOpenAIApiDeploymentName: 'gpt-4.1-mini',
        model: 'gpt-4.1-mini',
      });
    });

    const embedding = new AzureOpenAiEmbed({
      azureOpenAIApiKey,
      azureOpenAIApiVersion,
      azureOpenAIApiInstanceName,
      azureOpenAIApiDeploymentName: environment.azureOpenAIApiEmbeddingDeploymentName,
    });
    builder.setEmbedding('default', embedding);

    builder.setVectorStore('default', async () => {
      const client = new AzureSearchClient(
        environment.azureSearchEndpoint,
        environment.azureSearchIndexName,
        { key: environment.azureSearchApiKey },
        {
          allowInsecureConnection: true,
        }
      );
      // @ts-expect-error - TODO: fix this
      return new AzureVectorStore(embedding, { client });
    });
  });
};

export default configure;
