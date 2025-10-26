import { type Command, createOption, InvalidOptionArgumentError } from 'commander';

/**
 * Interface representing the AI-related options available in CLI commands.
 * This interface defines the structure of options that can be passed to AI commands.
 */
export interface AiOptions {
  /** Azure OpenAI API key for authentication */
  openaiApiKey: string;
  /** Azure OpenAI API version */
  openaiApiVersion: string;
  /** Azure OpenAI instance name */
  openaiInstance: string;
  /** Azure OpenAI chat deployment name (optional) */
  openaiChatDeployment?: string;
  /** Azure OpenAI embedding deployment name (optional) */
  openaiEmbeddingDeployment?: string;
  /** Azure Search endpoint URL (optional) */
  azureSearchEndpoint?: string;
  /** Azure Search API key (optional) */
  azureSearchApiKey?: string;
  /** Azure Search index name (optional) */
  azureSearchIndexName?: string;
}

/**
 * Option for specifying the Azure OpenAI API key.
 * Required for authentication with Azure OpenAI services.
 */
export const apiKeyOption = createOption(
  '--openai-api-key <key>',
  'API key for Azure OpenAI services',
).env('AZURE_OPENAI_API_KEY');

/**
 * Option for specifying the Azure OpenAI API version.
 * Defaults to the latest stable version if not provided.
 */
export const apiVersionOption = createOption(
  '--openai-api-version <version>',
  'Azure OpenAI API version',
)
  .env('AZURE_OPENAI_API_VERSION')
  .default('2024-02-15-preview');

/**
 * Option for specifying the Azure OpenAI instance name.
 * Required for Azure OpenAI service endpoint construction.
 */
export const apiInstanceOption = createOption(
  '--openai-instance <name>',
  'Azure OpenAI instance name',
).env('AZURE_OPENAI_INSTANCE_NAME');

/**
 * Option for specifying the Azure OpenAI deployment name for chat models.
 * Required for chat completions API calls.
 */
export const chatDeploymentOption = createOption(
  '--openai-chat-deployment <name>',
  'Azure OpenAI chat deployment name',
).env('AZURE_OPENAI_CHAT_DEPLOYMENT_NAME');

/**
 * Option for specifying the Azure OpenAI deployment name for embedding models.
 * Required for embeddings API calls.
 */
export const embeddingDeploymentOption = createOption(
  '--openai-embedding-deployment <name>',
  'Azure OpenAI embedding deployment name',
).env('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');

/**
 * Option for specifying the Azure Search endpoint URL.
 * Required for Azure Cognitive Search operations.
 */
export const azureSearchEndpointOption = createOption(
  '--azure-search-endpoint <url>',
  'Azure Search endpoint URL',
).env('AZURE_SEARCH_ENDPOINT');

/**
 * Option for specifying the Azure Search API key.
 * Required for authentication with Azure Cognitive Search.
 */
export const azureSearchApiKeyOption = createOption(
  '--azure-search-api-key <key>',
  'Azure Search API key',
).env('AZURE_SEARCH_API_KEY');

/**
 * Option for specifying the Azure Search index name.
 * Required for search operations on a specific index.
 */
export const azureSearchIndexNameOption = createOption(
  '--azure-search-index-name <name>',
  'Azure Search index name',
).env('AZURE_SEARCH_INDEX_NAME');

/**
 * Enhances a given command with AI-related options.
 *
 * This function adds the following options to the provided command:
 * - `openaiApiKey`: Azure OpenAI API key
 * - `openaiApiVersion`: Azure OpenAI API version
 * - `openaiInstance`: Azure OpenAI instance name
 * - `openaiChatDeployment`: Chat model deployment name
 * - `openaiEmbeddingDeployment`: Embedding model deployment name (if includeEmbedding is true)
 * - `azureSearchEndpoint`: Azure Search endpoint URL (if includeSearch is true)
 * - `azureSearchApiKey`: Azure Search API key (if includeSearch is true)
 * - `azureSearchIndexName`: Azure Search index name (if includeSearch is true)
 *
 * @param command - The command to which AI options will be added
 * @param args - Optional configuration for which options to include
 * @param args.includeEmbedding - Whether to include embedding deployment option
 * @param args.includeChat - Whether to include chat deployment option (defaults to true)
 * @param args.includeSearch - Whether to include Azure Search options (defaults to false)
 * @returns The enhanced command with AI options
 *
 * @example
 * ```ts
 * import { createCommand } from 'commander';
 * import { withAiOptions } from './path/to/this/file';
 *
 * const command = withAiOptions(
 *   createCommand('ai-chat')
 *     .description('Chat with AI models')
 *     .action((options) => {
 *       console.log('API Key:', options.openaiApiKey);
 *       console.log('Instance:', options.openaiInstance);
 *       console.log('Chat Deployment:', options.openaiChatDeployment);
 *     })
 * );
 * ```
 */
export const withAiOptions = (
  command: Command,
  args?: Partial<{
    includeEmbedding: boolean;
    includeChat: boolean;
    includeSearch: boolean;
  }>,
): Command => {
  // Core authentication options
  command.addOption(apiKeyOption);
  command.addOption(apiVersionOption);
  command.addOption(apiInstanceOption);

  // Deployment options
  if (args?.includeChat === true) {
    command.addOption(chatDeploymentOption);
  }

  if (args?.includeEmbedding === true) {
    command.addOption(embeddingDeploymentOption);
  }

  // Azure Search options
  if (args?.includeSearch === true) {
    command.addOption(azureSearchEndpointOption);
    command.addOption(azureSearchApiKeyOption);
    command.addOption(azureSearchIndexNameOption);
  }

  // Validation hook
  command.hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();

    // Validate API key
    if (!options.openaiApiKey || typeof options.openaiApiKey !== 'string' || options.openaiApiKey.trim() === '') {
      throw new InvalidOptionArgumentError('API key is required and must be a non-empty string.');
    }

    // Validate API version
    if (!options.openaiApiVersion || typeof options.openaiApiVersion !== 'string') {
      throw new InvalidOptionArgumentError('API version must be a non-empty string.');
    }

    // Validate instance name
    if (
      !options.openaiInstance ||
      typeof options.openaiInstance !== 'string' ||
      options.openaiInstance.trim() === ''
    ) {
      throw new InvalidOptionArgumentError(
        'API instance name is required and must be a non-empty string.',
      );
    }

    if (args?.includeChat === true) {
      if (
        !options.openaiChatDeployment ||
        typeof options.openaiChatDeployment !== 'string' ||
        options.openaiChatDeployment.trim() === ''
      ) {
        throw new InvalidOptionArgumentError(
          'Chat deployment name is required and must be a non-empty string.',
        );
      }
    }

    if (args?.includeEmbedding === true) {
      if (
        !options.openaiEmbeddingDeployment ||
        typeof options.openaiEmbeddingDeployment !== 'string' ||
        options.openaiEmbeddingDeployment.trim() === ''
      ) {
        throw new InvalidOptionArgumentError(
          'Embedding deployment name is required and must be a non-empty string.',
        );
      }
    }

    if (args?.includeSearch === true) {
      if (
        !options.azureSearchEndpoint ||
        typeof options.azureSearchEndpoint !== 'string' ||
        options.azureSearchEndpoint.trim() === ''
      ) {
        throw new InvalidOptionArgumentError(
          'Azure Search endpoint is required and must be a non-empty string.',
        );
      }

      if (
        !options.azureSearchApiKey ||
        typeof options.azureSearchApiKey !== 'string' ||
        options.azureSearchApiKey.trim() === ''
      ) {
        throw new InvalidOptionArgumentError(
          'Azure Search API key is required and must be a non-empty string.',
        );
      }

      if (
        !options.azureSearchIndexName ||
        typeof options.azureSearchIndexName !== 'string' ||
        options.azureSearchIndexName.trim() === ''
      ) {
        throw new InvalidOptionArgumentError(
          'Azure Search index name is required and must be a non-empty string.',
        );
      }
    }
  });

  return command;
};

export default withAiOptions;
