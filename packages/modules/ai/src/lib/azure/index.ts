/**
 * @packageDocumentation
 *
 * Azure-specific AI service implementations backed by LangChain.
 *
 * Import from `@equinor/fusion-framework-module-ai/azure` to access
 * {@link AzureOpenAIModel}, {@link AzureOpenAiEmbed}, and {@link AzureVectorStore}
 * along with their configuration types.
 *
 * @module @equinor/fusion-framework-module-ai/azure
 */

export { SearchClient as AzureSearchClient } from '@azure/search-documents';

export { AzureOpenAIModel } from './AzureOpenAIModel.js';
export { AzureOpenAiEmbed } from './AzureOpenAiEmbed.js';
export { AzureVectorStore, type AzureDocument } from './AzureVectorStore.js';
export { FusionSearchClient, type FusionSearchCredential } from './FusionSearchClient.js';

// Export configuration types
export type { AzureOpenAIModelConfig } from './AzureOpenAIModel.js';
export type { AzureOpenAiEmbedConfig } from './AzureOpenAiEmbed.js';

// Re-export AzureAISearchConfig from LangChain for convenience
export type { AzureAISearchConfig } from '@langchain/community/vectorstores/azure_aisearch';
