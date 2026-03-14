import { type Command, createOption, InvalidOptionArgumentError } from 'commander';

/**
 * Parsed CLI option values for Azure OpenAI and Azure Cognitive Search commands.
 *
 * Every AI-related CLI command resolves its flags and environment variables into
 * this shape before executing.  Values are supplied via Commander options or the
 * corresponding `AZURE_*` environment variables.
 *
 * Use this interface when you need to type the resolved options object inside a
 * command action handler or when passing configuration to {@link setupFramework}.
 */
export interface AiOptions {
  /** Azure OpenAI API key used to authenticate requests (`AZURE_OPENAI_API_KEY`). */
  openaiApiKey: string;
  /** Azure OpenAI REST API version string, e.g. `"2024-02-15-preview"` (`AZURE_OPENAI_API_VERSION`). */
  openaiApiVersion: string;
  /** Azure OpenAI resource instance name used to build the service URL (`AZURE_OPENAI_INSTANCE_NAME`). */
  openaiInstance: string;
  /** Deployment name of the Azure OpenAI chat model (`AZURE_OPENAI_CHAT_DEPLOYMENT_NAME`). */
  openaiChatDeployment?: string;
  /** Deployment name of the Azure OpenAI embedding model (`AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME`). */
  openaiEmbeddingDeployment?: string;
  /** Full URL of the Azure Cognitive Search endpoint (`AZURE_SEARCH_ENDPOINT`). */
  azureSearchEndpoint?: string;
  /** API key for the Azure Cognitive Search service (`AZURE_SEARCH_API_KEY`). */
  azureSearchApiKey?: string;
  /** Name of the Azure Cognitive Search index to query (`AZURE_SEARCH_INDEX_NAME`). */
  azureSearchIndexName?: string;
}

/**
 * Commander option: `--openai-api-key <key>`.
 *
 * Provides the Azure OpenAI API key.  Falls back to `AZURE_OPENAI_API_KEY`
 * environment variable when the flag is omitted.
 */
export const apiKeyOption = createOption(
  '--openai-api-key <key>',
  'API key for Azure OpenAI services',
).env('AZURE_OPENAI_API_KEY');

/**
 * Commander option: `--openai-api-version <version>`.
 *
 * Azure OpenAI REST API version string.  Defaults to `"2024-02-15-preview"`.
 * Falls back to `AZURE_OPENAI_API_VERSION` environment variable.
 */
export const apiVersionOption = createOption(
  '--openai-api-version <version>',
  'Azure OpenAI API version',
)
  .env('AZURE_OPENAI_API_VERSION')
  .default('2024-02-15-preview');

/**
 * Commander option: `--openai-instance <name>`.
 *
 * Azure OpenAI resource instance name used to construct the service URL.
 * Falls back to `AZURE_OPENAI_INSTANCE_NAME` environment variable.
 */
export const apiInstanceOption = createOption(
  '--openai-instance <name>',
  'Azure OpenAI instance name',
).env('AZURE_OPENAI_INSTANCE_NAME');

/**
 * Commander option: `--openai-chat-deployment <name>`.
 *
 * Names the Azure OpenAI deployment for chat completions.
 * Falls back to `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` environment variable.
 */
export const chatDeploymentOption = createOption(
  '--openai-chat-deployment <name>',
  'Azure OpenAI chat deployment name',
).env('AZURE_OPENAI_CHAT_DEPLOYMENT_NAME');

/**
 * Commander option: `--openai-embedding-deployment <name>`.
 *
 * Names the Azure OpenAI deployment for vector embeddings.
 * Falls back to `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` environment variable.
 */
export const embeddingDeploymentOption = createOption(
  '--openai-embedding-deployment <name>',
  'Azure OpenAI embedding deployment name',
).env('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');

/**
 * Commander option: `--azure-search-endpoint <url>`.
 *
 * Full URL of the Azure Cognitive Search service endpoint.
 * Falls back to `AZURE_SEARCH_ENDPOINT` environment variable.
 */
export const azureSearchEndpointOption = createOption(
  '--azure-search-endpoint <url>',
  'Azure Search endpoint URL',
).env('AZURE_SEARCH_ENDPOINT');

/**
 * Commander option: `--azure-search-api-key <key>`.
 *
 * API key for authenticating with Azure Cognitive Search.
 * Falls back to `AZURE_SEARCH_API_KEY` environment variable.
 */
export const azureSearchApiKeyOption = createOption(
  '--azure-search-api-key <key>',
  'Azure Search API key',
).env('AZURE_SEARCH_API_KEY');

/**
 * Commander option: `--azure-search-index-name <name>`.
 *
 * Name of the Azure Cognitive Search index to query.
 * Falls back to `AZURE_SEARCH_INDEX_NAME` environment variable.
 */
export const azureSearchIndexNameOption = createOption(
  '--azure-search-index-name <name>',
  'Azure Search index name',
).env('AZURE_SEARCH_INDEX_NAME');

/**
 * Decorate a Commander command with Azure OpenAI and Azure Cognitive Search
 * CLI options and pre-action validation.
 *
 * Use this higher-order helper when building new `ffc ai *` subcommands that
 * need Azure OpenAI credentials, embedding deployment names, or Azure Search
 * connection details.  It attaches the relevant `--openai-*` / `--azure-search-*`
 * flags plus a `preAction` hook that validates required values before the action
 * runs.
 *
 * @param command - The Commander {@link Command} to enhance with AI option flags.
 * @param args - Controls which optional option groups are attached.
 * @param args.includeEmbedding - Attach `--openai-embedding-deployment` flag.
 * @param args.includeChat - Attach `--openai-chat-deployment` flag (defaults to `true`).
 * @param args.includeSearch - Attach `--azure-search-endpoint`, `--azure-search-api-key`,
 *   and `--azure-search-index-name` flags (defaults to `false`).
 * @returns The same {@link Command} instance, decorated in-place, for chaining.
 *
 * @throws {InvalidOptionArgumentError} When a required option is missing or
 *   empty at execution time (validated in the `preAction` hook).
 *
 * @example
 * ```ts
 * import { createCommand } from 'commander';
 * import { withAiOptions } from '@equinor/fusion-framework-cli-plugin-ai-search/options/ai';
 *
 * const myCommand = withAiOptions(
 *   createCommand('my-search')
 *     .description('Custom vector search command')
 *     .action((query, options) => { /* ... *\/ }),
 *   { includeEmbedding: true, includeSearch: true },
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

export default withAiOptions;
