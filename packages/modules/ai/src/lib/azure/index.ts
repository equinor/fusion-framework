/**
 * Azure-specific AI service implementations
 */

export { SearchClient as AzureSearchClient } from '@azure/search-documents';


export { AzureOpenAIModel } from './AzureOpenAIModel.js';
export { AzureOpenAiEmbed } from './AzureOpenAiEmbed.js';
export { AzureVectorStore, type AzureDocument } from './AzureVectorStore.js';

// Export configuration types
export type { AzureOpenAIModelConfig } from './AzureOpenAIModel.js';
export type { AzureOpenAiEmbedConfig } from './AzureOpenAiEmbed.js';

// Re-export AzureAISearchConfig from LangChain for convenience
export type { AzureAISearchConfig } from '@langchain/community/vectorstores/azure_aisearch';
