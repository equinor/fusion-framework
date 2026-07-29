import type { FusionAIConfig } from './fusion-ai-config.js';

/**
 * Configuration factory function for Fusion AI operations.
 *
 * This helper function provides type safety and consistency for creating AI configuration
 * functions. It accepts a function that returns configuration (either synchronously or
 * asynchronously) and returns it unchanged, providing a typed interface for consumers.
 *
 * @param fn - Function that returns Fusion AI configuration (sync or async)
 * @returns The same configuration function, typed for use with loadFusionAIConfig
 *
 * @example
 * ```ts
 * // fusion-ai.config.ts
 * export default configureFusionAI(async () => ({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   deployment: 'gpt-4',
 * }));
 * ```
 */
export const configureFusionAI = <T extends FusionAIConfig>(fn: () => Promise<T> | T) => fn;
