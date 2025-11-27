/**
 * Core AI service types and utilities
 */

// Export base classes and utilities
export { BaseService } from './BaseService.js';
export { ServiceError } from './ServiceError.js';

// Export utilities
export { convertObjectToAttributes } from './convert-object-to-attributes.js';

// Export core types
export type {
  IModel,
  IEmbed,
  IVectorStore,
  ChatMessage,
  ChatResponse,
  ToolCall,
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
  RetrieverOptions,
} from './types.js';
