import { concatMap, from, map, type Observable } from 'rxjs';
import {
  AzureAISearchVectorStore,
  type AzureAISearchDocumentMetadata,
  type AzureAISearchConfig,
} from '@langchain/community/vectorstores/azure_aisearch';
import type { BaseRetriever } from '@langchain/core/retrievers';

import type {
  AddDocumentsOptions,
  IEmbed,
  IVectorStore,
  RetrieverOptions,
  SearchFilterType,
  VectorStoreDocument,
} from '../types.js';
import { BaseService } from '../BaseService.js';
import { AIError } from '../../AIError.js';
import type { Document } from '@langchain/core/documents';
import { convertObjectToAttributes } from '../convert-object-to-attributes.js';

/**
 * A LangChain document enriched with Azure AI Search metadata.
 */
export type AzureDocument = Document & {
  metadata: AzureAISearchDocumentMetadata;
};

/**
 * Azure AI Search vector store implementation built on the LangChain
 * `AzureAISearchVectorStore` backend.
 *
 * Persists documents alongside their embedding vectors and exposes
 * similarity-based search, document CRUD, and LangChain retriever
 * creation for RAG pipelines.
 *
 * @example
 * ```typescript
 * import { AzureOpenAiEmbed, AzureVectorStore } from '@equinor/fusion-framework-module-ai/azure';
 *
 * const embed = new AzureOpenAiEmbed({ azureOpenAIApiKey: '...' });
 * const store = new AzureVectorStore(embed, {
 *   endpoint: 'https://my-search.search.windows.net',
 *   key: 'admin-key',
 *   indexName: 'documents',
 * });
 *
 * const results = await store.invoke('quarterly earnings summary');
 * ```
 */
export class AzureVectorStore extends BaseService<string, unknown[]> implements IVectorStore {
  private vectorStore: AzureAISearchVectorStore;

  /**
   * Create a new Azure AI Search vector store client.
   *
   * @param embed - Embedding service used to vectorise documents and queries.
   * @param config - Azure AI Search connection and index configuration.
   * @throws {AIError} When the underlying Azure vector store fails to initialise.
   */
  constructor(embed: IEmbed, config: AzureAISearchConfig) {
    super();
    try {
      this.vectorStore = new AzureAISearchVectorStore(embed, config);
    } catch (error) {
      throw new AIError(
        `Failed to initialize Azure Vector Store: ${error instanceof Error ? error.message : String(error)}`,
        'INITIALIZATION_ERROR',
      );
    }
  }

  /**
   * Add documents to the Azure AI Search index.
   *
   * Custom metadata attributes are flattened to `{ key, value }` pairs using
   * {@link convertObjectToAttributes} before indexing.
   *
   * @param documents - Documents to index; each must include an `id` and `pageContent`.
   * @returns Promise resolving to the IDs of the stored documents.
   */
  public addDocuments(documents: VectorStoreDocument[]): Promise<string[]> {
    const options: AddDocumentsOptions = {
      ids: documents.map((document) => document.id ?? ''),
    };
    const processedDocuments = documents.map((document) => {
      const attributes = document.metadata.attributes
        ? convertObjectToAttributes(document.metadata.attributes)
        : undefined;
      return {
        ...document,
        metadata: {
          ...document.metadata,
          attributes,
        },
      };
    });
    return this.vectorStore.addDocuments(processedDocuments, options);
  }

  /**
   * Delete documents from the Azure AI Search index by ID or filter.
   *
   * @param options - Deletion criteria — specify `ids`, a `filter`, or both.
   * @returns Promise that resolves when the deletion completes.
   */
  deleteDocuments(options: { ids?: string | string[]; filter?: SearchFilterType }): Promise<void> {
    return this.vectorStore.delete(options);
  }

  /**
   * Search for documents synchronously
   * @param query - Search query string
   * @returns Promise resolving to array of search results
   */
  async invoke(query: string): Promise<unknown[]> {
    try {
      return await this.vectorStore.similaritySearch(query, 10);
      // return results.map((doc) => ({
      //   content: doc.pageContent,
      //   metadata: doc.metadata,
      //   score: doc.metadata?.score,
      // }));
    } catch (error) {
      throw new AIError(
        `Azure Vector Store search failed: ${error instanceof Error ? error.message : String(error)}`,
        'SEARCH_ERROR',
      );
    }
  }

  /**
   * Search for documents with streaming results
   * @param query - Search query string
   * @returns Observable stream of search results
   */
  invoke$(query: string): Observable<unknown[]> {
    return from(this.invoke(query)).pipe(
      concatMap((results: unknown[]) => from(results)),
      map((result) => [result]),
    );
  }

  /**
   * Get a LangChain retriever from this vector store
   * This is the proper way to use vector stores in LangChain for RAG applications
   * @param options - Optional retriever configuration
   * @returns LangChain BaseRetriever instance
   */
  asRetriever(options?: RetrieverOptions): BaseRetriever {
    return this.vectorStore.asRetriever(options);
  }
}
