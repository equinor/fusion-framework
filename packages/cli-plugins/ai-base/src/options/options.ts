import { createOption } from 'commander';

/**
 * Commander option for the Azure OpenAI API key (`--openai-api-key`).
 *
 * @remarks
 * Required for all Azure OpenAI operations. Falls back to the
 * `AZURE_OPENAI_API_KEY` environment variable when the flag is omitted.
 */
export const apiKeyOption = createOption(
  '--openai-api-key <key>',
  'API key for Azure OpenAI services',
).env('AZURE_OPENAI_API_KEY');

/**
 * Commander option for the Azure OpenAI API version (`--openai-api-version`).
 *
 * @remarks
 * Defaults to `2024-02-15-preview`. Falls back to the
 * `AZURE_OPENAI_API_VERSION` environment variable when the flag is omitted.
 */
export const apiVersionOption = createOption(
  '--openai-api-version <version>',
  'Azure OpenAI API version',
)
  .env('AZURE_OPENAI_API_VERSION')
  .default('2024-02-15-preview');

/**
 * Commander option for the Azure OpenAI instance name (`--openai-instance`).
 *
 * @remarks
 * Required for constructing the Azure OpenAI service endpoint. Falls back to
 * the `AZURE_OPENAI_INSTANCE_NAME` environment variable when the flag is omitted.
 */
export const apiInstanceOption = createOption(
  '--openai-instance <name>',
  'Azure OpenAI instance name',
).env('AZURE_OPENAI_INSTANCE_NAME');

/**
 * Commander option for the Azure OpenAI chat deployment (`--openai-chat-deployment`).
 *
 * @remarks
 * Required for chat-completion operations. Falls back to the
 * `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` environment variable when the flag is omitted.
 * Only added to a command when `withOptions` is called with `includeChat: true`.
 */
export const chatDeploymentOption = createOption(
  '--openai-chat-deployment <name>',
  'Azure OpenAI chat deployment name',
).env('AZURE_OPENAI_CHAT_DEPLOYMENT_NAME');

/**
 * Commander option for the Azure OpenAI embedding deployment (`--openai-embedding-deployment`).
 *
 * @remarks
 * Required for embedding and vector-search operations. Falls back to the
 * `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` environment variable when the flag is omitted.
 * Only added to a command when `withOptions` is called with `includeEmbedding: true`.
 */
export const embeddingDeploymentOption = createOption(
  '--openai-embedding-deployment <name>',
  'Azure OpenAI embedding deployment name',
).env('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME');

/**
 * Commander option for the Azure Cognitive Search endpoint (`--azure-search-endpoint`).
 *
 * @remarks
 * Required for vector-search operations. Falls back to the
 * `AZURE_SEARCH_ENDPOINT` environment variable when the flag is omitted.
 * Only added to a command when `withOptions` is called with `includeSearch: true`.
 */
export const azureSearchEndpointOption = createOption(
  '--azure-search-endpoint <url>',
  'Azure Search endpoint URL',
).env('AZURE_SEARCH_ENDPOINT');

/**
 * Commander option for the Azure Cognitive Search API key (`--azure-search-api-key`).
 *
 * @remarks
 * Required for authenticating with Azure Cognitive Search. Falls back to the
 * `AZURE_SEARCH_API_KEY` environment variable when the flag is omitted.
 * Only added to a command when `withOptions` is called with `includeSearch: true`.
 */
export const azureSearchApiKeyOption = createOption(
  '--azure-search-api-key <key>',
  'Azure Search API key',
).env('AZURE_SEARCH_API_KEY');

/**
 * Commander option for the Azure Cognitive Search index name (`--azure-search-index-name`).
 *
 * @remarks
 * Identifies the target search index to query or write to. Falls back to the
 * `AZURE_SEARCH_INDEX_NAME` environment variable when the flag is omitted.
 * Only added to a command when `withOptions` is called with `includeSearch: true`.
 */
export const azureSearchIndexNameOption = createOption(
  '--azure-search-index-name <name>',
  'Azure Search index name',
).env('AZURE_SEARCH_INDEX_NAME');

/**
 * All AI-related Commander option definitions as a single object.
 *
 * @remarks
 * Use this default export for convenient bulk access when you need every option.
 * For selective inclusion prefer importing the named constants directly.
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
