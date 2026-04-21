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
 * When documents carry {@link VectorStoreDocument.metadata.schemaFields | schemaFields},
 * the store bypasses LangChain's document construction and writes directly via
 * the search client so that promoted fields appear as top-level Azure Search
 * document properties (enabling direct OData filters without `any()`).
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
   * Search client used for direct writes when documents carry
   * schema-promoted fields. Stored from the constructor config.
   */
  private searchClient: AzureAISearchConfig['client'];

  /**
   * Create a new Azure AI Search vector store client.
   *
   * @param embed - Embedding service used to vectorise documents and queries.
   * @param config - Azure AI Search connection and index configuration.
   * @throws {AIError} When the underlying Azure vector store fails to initialise.
   */
  constructor(embed: IEmbed, config: AzureAISearchConfig) {
    super();
    // Retain the search client for the direct write path used when
    // documents carry schema-promoted fields that LangChain would drop.
    this.searchClient = config.client;
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
   * When any document carries `metadata.schemaFields` and a direct search
   * client is available, the method bypasses LangChain and writes documents
   * with promoted fields as top-level Azure Search properties.
   *
   * @param documents - Documents to index; each must include an `id` and `pageContent`.
   * @returns Promise resolving to the IDs of the stored documents.
   */
  public async addDocuments(documents: VectorStoreDocument[]): Promise<string[]> {
    const hasSchemaFields = documents.some((doc) => doc.metadata.schemaFields);

    // Bypass LangChain when schema-promoted fields are present so they
    // appear as top-level Azure Search document properties.
    if (hasSchemaFields && this.searchClient) {
      return this.addDocumentsWithSchemaFields(documents);
    }

    // Standard LangChain path for backward compatibility
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
   * Write documents to Azure AI Search with schema-promoted fields stored as
   * top-level document properties.
   *
   * Bypasses LangChain's `addDocuments`/`addVectors` which hardcode the Azure
   * document shape to `{ id, content, content_vector, metadata }`. Uses the
   * search client directly so promoted fields (e.g. `pkg_name`, `tags`) are
   * persisted alongside the base schema, enabling direct OData filters.
   *
   * Uses pre-computed embeddings from `metadata.embedding` when available
   * (set by the CLI embed pipeline). Falls back to computing embeddings via
   * the LangChain embeddings service otherwise.
   *
   * @param documents - Documents with `metadata.schemaFields` populated.
   * @returns Promise resolving to the IDs of the stored documents.
   */
  private async addDocumentsWithSchemaFields(documents: VectorStoreDocument[]): Promise<string[]> {
    // Use pre-computed embeddings when every document has them (from the
    // CLI embed pipeline), otherwise batch-compute via LangChain
    const allPreComputed = documents.every((doc) => doc.metadata.embedding);
    const vectors = allPreComputed
      ? documents.map((doc) => doc.metadata.embedding as number[])
      : await this.vectorStore.embeddings.embedDocuments(documents.map((doc) => doc.pageContent));

    // Construct Azure Search documents with promoted fields at the top level
    const entities = documents.map((doc, idx) => {
      const attributes = doc.metadata.attributes
        ? convertObjectToAttributes(doc.metadata.attributes as Record<string, unknown>)
        : [];

      return {
        id: doc.id,
        content: doc.pageContent,
        content_vector: vectors[idx],
        metadata: {
          source: doc.metadata.source,
          attributes,
        },
        // Promoted schema fields become top-level Azure Search document
        // properties, enabling direct OData filters (no `any()` needed)
        ...(doc.metadata.schemaFields ?? {}),
      };
    });

    // Schema-promoted fields extend the base Azure Search document shape.
    // The search client is typed for AzureAISearchDocument, but the REST
    // API accepts any fields matching the index schema. This cast is safe
    // because every entity satisfies the base shape and extra fields are
    // handled by the Azure Search service.
    const client = this.searchClient as NonNullable<AzureAISearchConfig['client']>;
    await client.mergeOrUploadDocuments(
      entities as Parameters<typeof client.mergeOrUploadDocuments>[0],
    );

    return documents.map((doc) => doc.id);
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
