/**
 * Core types and interfaces for the LLM module
 */




/**
 * Base configuration for AI clients
 */
export interface AIConfig {
  /** API endpoint URL */
  endpoint: string;
  /** API key for authentication */
  apiKey?: string;
  /** Default model to use */
  defaultModel?: string;
  /** Additional headers for requests */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retries */
  maxRetries?: number;
}

/**
 * Provider-specific configuration
 */
export interface AIProviderConfig {
  /** Provider name (e.g., 'openai', 'anthropic', 'azure-openai') */
  provider: string;
  /** Provider-specific settings */
  settings?: Record<string, unknown>;
}

/**
 * Configuration for a specific AI client
 */
export interface AIClientConfig extends AIConfig {
  /** Unique identifier for this client configuration */
  name: string;
  /** Provider-specific configuration */
  provider?: string;
}
