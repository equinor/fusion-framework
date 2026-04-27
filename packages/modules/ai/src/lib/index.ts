/**
 * @packageDocumentation
 *
 * Core AI service abstractions, base classes, and utility functions.
 *
 * Import from `@equinor/fusion-framework-module-ai/lib` to access
 * {@link BaseService}, {@link ServiceError}, type interfaces such as
 * {@link IModel}, {@link IEmbed}, and {@link IVectorStore}, and the
 * {@link convertObjectToAttributes} utility.
 *
 * @module @equinor/fusion-framework-module-ai/lib
 */

// Export base classes and utilities
export { BaseService } from './BaseService.js';
export { ServiceError } from './ServiceError.js';

// Export utilities
export { convertObjectToAttributes } from './convert-object-to-attributes.js';

// Export core types
export type {
  IModel,
  IModelRunnable,
  IEmbed,
  IVectorStore,
  ChatMessage,
  ChatResponse,
  ModelInput,
  ModelOutput,
  ModelTool,
  ToolCall,
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
  RetrieverOptions,
} from './types.js';
