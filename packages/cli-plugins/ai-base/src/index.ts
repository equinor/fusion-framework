/**
 * Base AI plugin package for Fusion Framework CLI
 *
 * @remarks
 * This package provides shared utilities and configuration for AI-related CLI plugins.
 * It is an internal base package and should not be used standalone. Consuming plugins
 * should import from this package as a dependency.
 *
 * @packageDocumentation
 */

export type { FusionAIConfig } from './fusion-ai-config.js';
export { configureFusionAI } from './configure-fusion-ai.js';
export { type LoadFusionAIConfigOptions, loadFusionAIConfig } from './load-fusion-ai-config.js';
export { setupFramework, type FrameworkInstance } from './setup-framework.js';
export { registerAiPlugin } from './register-ai-plugin.js';
