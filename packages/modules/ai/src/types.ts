/**
 * @packageDocumentation
 * Shared configuration interfaces for AI client setup.
 *
 * These types define the shape of provider-agnostic connection settings
 * used when configuring AI clients programmatically.
 */

/**
 * Base configuration for AI clients.
 *
 * Provides provider-agnostic connection parameters such as endpoint,
 * authentication, timeout, and retry behaviour.
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
 * Provider-specific configuration.
 *
 * Associates a named provider (e.g. `'openai'`, `'azure-openai'`) with
 * arbitrary provider-scoped settings.
 */
export interface AIProviderConfig {
  /** Provider name (e.g., `'openai'`, `'anthropic'`, `'azure-openai'`) */
  provider: string;
  /** Provider-specific settings */
  settings?: Record<string, unknown>;
}

/**
 * Configuration for a named AI client instance.
 *
 * Extends {@link AIConfig} with a unique `name` and optional `provider`
 * discriminator for resolving provider-specific behaviour.
 */
export interface AIClientConfig extends AIConfig {
  /** Unique identifier for this client configuration */
  name: string;
  /** Provider identifier used to select implementation details */
  provider?: string;
}
