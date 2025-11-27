// Core module components
export { AIConfigurator } from './AIConfigurator.js';
export { AIProvider } from './AIProvider.js';
export { module, enableAI } from './module.js';

// Essential types for consumers
export type {
  ValueOrCallback,
  AIModuleConfig,
  IAIConfigurator,
} from './AIConfigurator.interface.js';
export type { IAIProvider, AIServiceType } from './AIProvider.js';
export type { AIModule, AIModuleKey } from './module.js';
export { AIError } from './AIError.js';
