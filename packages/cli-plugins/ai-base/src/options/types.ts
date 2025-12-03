/**
 * Configuration options for AI-related CLI commands.
 *
 * This interface defines all available options for configuring Azure OpenAI services
 * and Azure Cognitive Search integration. Required fields must be provided either
 * via command-line arguments or environment variables. Optional fields enable
 * specific features (chat, embeddings, vector search) when provided.
 *
 * @remarks
 * - All required fields (apiKey, apiVersion, instance) must be provided for any AI operation
 * - Chat operations require `openaiChatDeployment`
 * - Embedding operations require `openaiEmbeddingDeployment`
 * - Vector search requires all three Azure Search fields plus `openaiEmbeddingDeployment`
 */
export interface AiOptions {
  /** Azure OpenAI API key for authentication with Azure OpenAI services */
  openaiApiKey: string;
  /** Azure OpenAI API version (e.g., '2024-02-15-preview') */
  openaiApiVersion: string;
  /** Azure OpenAI instance name (the resource name in Azure) */
  openaiInstance: string;
  /** Azure OpenAI chat model deployment name. Required for chat operations */
  openaiChatDeployment?: string;
  /** Azure OpenAI embedding model deployment name. Required for embedding and vector search operations */
  openaiEmbeddingDeployment?: string;
  /** Azure Cognitive Search endpoint URL. Required for vector search operations */
  azureSearchEndpoint?: string;
  /** Azure Cognitive Search API key. Required for vector search operations */
  azureSearchApiKey?: string;
  /** Azure Cognitive Search index name. Required for vector search operations */
  azureSearchIndexName?: string;
}
