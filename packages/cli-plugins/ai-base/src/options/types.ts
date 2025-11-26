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
