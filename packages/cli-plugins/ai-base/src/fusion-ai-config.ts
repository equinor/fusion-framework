/**
 * Base configuration interface for Fusion AI operations.
 *
 * This interface serves as the base type for all Fusion AI configuration objects.
 * Implementations should extend this interface with specific configuration properties
 * relevant to their use case. The configuration is typically created using
 * `configureFusionAI` and loaded via `loadFusionAIConfig`.
 */
export interface FusionAIConfig {
  [key: string]: unknown;
}
