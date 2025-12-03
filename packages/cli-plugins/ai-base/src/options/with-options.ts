import { type Command, InvalidOptionArgumentError } from 'commander';
import {
  apiInstanceOption,
  apiKeyOption,
  apiVersionOption,
  azureSearchApiKeyOption,
  azureSearchEndpointOption,
  azureSearchIndexNameOption,
  chatDeploymentOption,
  embeddingDeploymentOption,
} from './options.js';

/**
 * Enhances a Commander command with AI-related options and validation.
 *
 * This function adds Azure OpenAI and Azure Cognitive Search options to the provided
 * command, along with pre-action validation hooks to ensure required options are provided.
 * The function allows selective inclusion of chat, embedding, and search capabilities
 * based on the command's requirements.
 *
 * Options added:
 * - Core: `openaiApiKey`, `openaiApiVersion`, `openaiInstance` (always included)
 * - Chat: `openaiChatDeployment` (if includeChat is true)
 * - Embedding: `openaiEmbeddingDeployment` (if includeEmbedding is true)
 * - Search: `azureSearchEndpoint`, `azureSearchApiKey`, `azureSearchIndexName` (if includeSearch is true)
 *
 * @param command - The Commander command instance to enhance with AI options
 * @param args - Optional configuration object for selective feature inclusion
 * @param args.includeEmbedding - Whether to include and require embedding deployment option (default: false)
 * @param args.includeChat - Whether to include and require chat deployment option (default: false)
 * @param args.includeSearch - Whether to include and require Azure Search options (default: false)
 * @returns The enhanced command with AI options and validation hooks attached
 * @throws {InvalidOptionArgumentError} During command execution if required options are missing or invalid
 *
 * @example
 * ```ts
 * const chatCommand = createCommand('chat')
 *   .description('Start a chat session');
 *
 * withOptions(chatCommand, { includeChat: true });
 * ```
 */
export const withOptions = (
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
    if (
      !options.openaiApiKey ||
      typeof options.openaiApiKey !== 'string' ||
      options.openaiApiKey.trim() === ''
    ) {
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

export default withOptions;
