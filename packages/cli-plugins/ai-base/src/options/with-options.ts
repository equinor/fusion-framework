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
