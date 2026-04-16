/**
 * Base options for all Fusion AI CLI commands.
 *
 * When `aiServiceUrl` is omitted the service URL and token are resolved
 * automatically from Fusion service discovery using the provided
 * environment and authentication options.
 */
export interface AiOptions {
  /**
   * Base URL of the Fusion AI service (e.g. `https://ai.fusion-dev.net`).
   * When omitted the URL is resolved from Fusion service discovery.
   */
  aiServiceUrl?: string;
  /** Fusion environment used for service discovery (e.g. `ci`, `fprd`). */
  env?: string;
  /** Bearer token passed directly to the auth module (overrides clientId/tenantId). */
  token?: string;
  /** Azure AD tenant ID for MSAL silent authentication. */
  tenantId?: string;
  /** Azure AD client ID for MSAL silent authentication. */
  clientId?: string;
  /** Azure OpenAI chat model deployment name. Required for chat operations. */
  chatModel?: string;
  /** Azure OpenAI embedding model deployment name. Required for embedding and index operations. */
  embedModel?: string;
  /** Azure AI Search index name. Required for vector search / indexing operations. */
  indexName?: string;
}
