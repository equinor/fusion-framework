import { createOption } from 'commander';

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
 * Default export containing all AI-related command options.
 *
 * Provides convenient access to all option definitions for use in CLI commands.
 * Each option can also be imported individually for more granular control.
 */
export default {
  apiKeyOption,
  apiVersionOption,
  apiInstanceOption,
  chatDeploymentOption,
  embeddingDeploymentOption,
  azureSearchEndpointOption,
  azureSearchApiKeyOption,
  azureSearchIndexNameOption,
};
