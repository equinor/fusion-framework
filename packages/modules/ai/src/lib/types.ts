import type { Observable } from 'rxjs';
import type { ChatMessageFieldsWithRole } from '@langchain/core/messages';
import type { Document } from '@langchain/core/documents';

export type VectorStoreDocumentMetadata<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  source: string;
  embedding?: number[];
  attributes?: T;
  rootPath?: string;
};

export type VectorStoreDocument<
  T extends VectorStoreDocumentMetadata = VectorStoreDocumentMetadata<Record<string, unknown>>,
> = Document & {
  id: string;
  pageContent: string;
  metadata: T;
};

export type SearchFilterType = {
  filterExpression?: string;
};

/**
 * Tool call information
 */
export interface ToolCall {
  /** Unique identifier for the tool call */
  id: string;
  /** Name of the tool being called */
  name: string;
  /** Arguments passed to the tool */
  arguments: Record<string, unknown>;
}

/**
 * Response from a chat completion request
 */
export interface ChatResponse {
  /** The generated content */
  content: string | Record<string, unknown>[];
  /** Type of response (text, json, tool_calls, etc.) */
  type?: string;
  /** Role of the response sender */
  role?: string;
  /** Tool calls made by the model */
  toolCalls?: ToolCall[];
  /** Token usage information */
  usage?: {
    /** Total tokens used */
    totalTokens?: number;
  };
  /** Additional metadata from the provider */
  metadata?: Record<string, unknown>;
}

/**
 * A message in an LLM conversation
 */
export type ChatMessage = Pick<ChatMessageFieldsWithRole, 'role' | 'content'>;

export type AddDocumentsOptions = {
  /** Embeddings for the documents */
  embeddings?: number[][];
  /** IDs for the documents */
  ids?: string[];
};

/**
 * Base interface for all LLM service implementations
 * Provides both synchronous and streaming invoke methods
 */
export interface IService<TInput, TOutput> {
  /**
   * Invoke the service with input and return a single result
   * @param input - Input data for the service
   * @returns Promise resolving to the result
   */
  invoke(input: TInput): Promise<TOutput>;

  /**
   * Invoke the service with input and return a streaming result
   * @param input - Input data for the service
   * @returns Observable stream of results
   */
  invoke$(input: TInput): Observable<TOutput>;
}

/**
 * Interface for embedding service implementations
 */
export interface IEmbed extends IService<string[], number[][]> {
  embedQuery(document: string): Promise<number[]>;
  embedDocuments(documents: string[]): Promise<number[][]>;
}

/**
 * Interface for vector store implementations
 */
export interface IVectorStore extends IService<string, unknown[]> {
  addDocuments(documents: VectorStoreDocument[]): Promise<string[]>;
  deleteDocuments(options: {
    ids?: string | string[];
    filter?: { filterExpression?: string };
  }): Promise<void>;
}

/**
 * Interface for model client implementations
 * This is the main interface that concrete model clients should implement
 */
export interface IModel extends IService<ChatMessage[], ChatResponse> {}
