/**
 * Base AI plugin package for Fusion Framework CLI
 *
 * This package provides shared utilities and options for AI-related CLI plugins.
 * It is an internal package and is not published to npm. Consuming plugins should
 * bundle this package's code into their own output.
 */

export {
  type FusionAIConfig,
  type LoadFusionAIConfigOptions,
  configureFusionAI,
  loadFusionAIConfig,
} from './config.js';
export { setupFramework, FrameworkInstance } from './setup-framework.js';
export { registerAiPlugin } from './register.js';
