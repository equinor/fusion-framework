import type { Observable } from 'rxjs';
import type { AIMessageChunk, MessageFieldWithRole } from '@langchain/core/messages';
import type { Document } from '@langchain/core/documents';
import type { BaseRetriever } from '@langchain/core/retrievers';
import type { RunnableInterface, RunnableConfig } from '@langchain/core/runnables';
import type { Tool, ToolInterface } from '@langchain/core/tools';
import type {
  BaseLanguageModelInput,
  BaseLanguageModelInterface,
} from '@langchain/core/language_models/base';

/**
 * Metadata associated with a document stored in a vector store.
 *
 * @template T - Shape of custom attribute key-value pairs attached to the document.
 */
export type VectorStoreDocumentMetadata<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** Origin or URI of the document content */
  source: string;
  /** Pre-computed embedding vector for the document */
  embedding?: number[];
  /** Custom key-value attributes for filtering and faceting */
  attributes?: T;
  /** Root path prefix used when resolving relative document references */
  rootPath?: string;
  /**
   * Schema-promoted fields to store as top-level Azure AI Search document
   * properties instead of inside the generic `attributes` array.
   *
   * When present, the vector store backend places these values alongside
   * the standard fields (`id`, `content`, `content_vector`, `metadata`)
   * so they can be filtered and faceted without the `any()` OData operator.
   */
  schemaFields?: Record<string, unknown>;
};

/**
 * A document stored in a vector store, extending the LangChain {@link Document} type
 * with a required `id` and typed metadata.
 *
 * @template T - Shape of the document metadata; defaults to {@link VectorStoreDocumentMetadata}.
 */
export type VectorStoreDocument<
  T extends VectorStoreDocumentMetadata = VectorStoreDocumentMetadata<Record<string, unknown>>,
> = Document & {
  /** Unique identifier for this document within the vector store */
  id: string;
  /** The textual content of the document used for embedding and search */
  pageContent: string;
  /** Metadata associated with the document */
  metadata: T;
};

/**
 * Filter criteria for vector store search queries.
 */
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
 * A single message in an LLM conversation, containing a role (e.g. `'user'`, `'assistant'`) and content.
 *
 * Derived from the LangChain `MessageFieldWithRole` type.
 */
export type ChatMessage = Pick<MessageFieldWithRole, 'role' | 'content'>;

/** Input accepted by language model services — typically a prompt string or array of {@link ChatMessage}. */
export type ModelInput = BaseLanguageModelInput;

/** Output chunk returned by language model services (LangChain `AIMessageChunk`). */
export type ModelOutput = AIMessageChunk;

/** A tool that can be bound to a language model for function-calling workflows. */
export type ModelTool = Tool | ToolInterface;

/**
 * Options for adding documents to a vector store.
 */
export type AddDocumentsOptions = {
  /** Pre-computed embedding vectors for each document (parallel to the document array) */
  embeddings?: number[][];
  /** Explicit IDs to assign; when omitted, the store generates IDs */
  ids?: string[];
};

/**
 * Base interface for all AI service implementations in the Fusion AI module.
 *
 * Every service exposes two invocation modes:
 * - {@link IService.invoke | invoke} — returns a single `Promise` for request-response usage.
 * - {@link IService.invoke$ | invoke$} — returns an RxJS `Observable` for streaming or
 *   event-driven usage.
 *
 * Extends the LangChain {@link RunnableInterface} so services can be composed in
 * LangChain chains and pipelines.
 *
 * @template TInput  - Input type accepted by the service.
 * @template TOutput - Output type produced by the service.
 * @template TOptions - Configuration options forwarded to the underlying runnable.
 */
export interface IService<TInput, TOutput, TOptions extends RunnableConfig = RunnableConfig>
  extends RunnableInterface<TInput, TOutput, TOptions> {
  /**
   * Invoke the service and return a single result.
   *
   * @param input - Input data for the service.
   * @param options - Optional runnable configuration.
   * @returns Promise resolving to the service output.
   */
  invoke(input: TInput, options?: TOptions): Promise<TOutput>;

  /**
   * Invoke the service and return a streaming result as an RxJS Observable.
   *
   * @param input - Input data for the service.
   * @param options - Optional runnable configuration.
   * @returns Observable that emits output chunks.
   */
  invoke$(input: TInput, options?: TOptions): Observable<TOutput>;
}

/**
 * Interface for text embedding service implementations.
 *
 * Embedding services convert text into dense numeric vectors suitable for
 * semantic similarity search, clustering, and other vector-based operations.
 */
export interface IEmbed extends IService<string[], number[][]> {
  /**
   * Embed a single text string.
   *
   * @param document - The text to embed.
   * @returns Promise resolving to the embedding vector.
   */
  embedQuery(document: string): Promise<number[]>;

  /**
   * Embed multiple text strings in a single batch request.
   *
   * @param documents - Array of texts to embed.
   * @returns Promise resolving to an array of embedding vectors (one per input document).
   */
  embedDocuments(documents: string[]): Promise<number[][]>;
}

/**
 * Options for creating a LangChain retriever from a vector store.
 *
 * Supports two search strategies:
 * - `'similarity'` — standard nearest-neighbor search.
 * - `'mmr'` (Maximal Marginal Relevance) — balances relevance with diversity.
 */
export type RetrieverOptions =
  | {
      k?: number;
      filter?: Record<string, unknown>;
      searchType?: 'similarity';
    }
  | {
      k?: number;
      filter?: Record<string, unknown>;
      searchType?: 'mmr';
      searchKwargs?: {
        fetchK?: number;
        lambda?: number;
      };
    };

/**
 * Interface for vector store (document search) service implementations.
 *
 * Vector stores persist documents alongside their embedding vectors and
 * expose similarity-based search and CRUD operations.
 */
export interface IVectorStore extends IService<string, unknown[]> {
  /**
   * Add documents to the vector store.
   *
   * @param documents - Documents to index; each must include an `id` and `pageContent`.
   * @returns Promise resolving to the IDs of the stored documents.
   */
  addDocuments(documents: VectorStoreDocument[]): Promise<string[]>;

  /**
   * Delete documents from the vector store by ID or filter.
   *
   * @param options - Deletion criteria — specify `ids`, a `filter`, or both.
   * @returns Promise that resolves when the deletion completes.
   */
  deleteDocuments(options: {
    ids?: string | string[];
    filter?: { filterExpression?: string };
  }): Promise<void>;
  /**
   * Get a LangChain retriever from this vector store
   * This is the proper way to use vector stores in LangChain for RAG applications
   * @param options - Optional retriever configuration
   * @returns LangChain BaseRetriever instance
   */
  asRetriever(options?: RetrieverOptions): BaseRetriever;
}

/**
 * Interface for language model (LLM / chat model) implementations.
 *
 * Concrete model clients (e.g. {@link AzureOpenAIModel}) implement this interface
 * to expose prompt-based invocation, streaming, and tool-binding capabilities.
 *
 * @template CallOptions - Provider-specific call options forwarded to the underlying model.
 */
export interface IModel<CallOptions extends RunnableConfig = RunnableConfig>
  extends IService<ModelInput, ModelOutput, RunnableConfig> {
  /** The underlying LangChain language model instance. */
  readonly llm: BaseLanguageModelInterface;

  /**
   * Bind tools to the model for function-calling workflows.
   *
   * @param tools - Tools the model may invoke during completion.
   * @param options - Provider-specific call options.
   * @returns A runnable that routes tool calls to the supplied tools.
   */
  bindTools(
    tools: ModelTool[],
    options?: CallOptions,
  ): RunnableInterface<ModelInput, ModelOutput, CallOptions>;
}
