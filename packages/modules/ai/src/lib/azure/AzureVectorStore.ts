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
    // Any document carrying schema-promoted fields routes through the direct-write path
    const hasSchemaFields = documents.some((doc) => doc.metadata.schemaFields);

    // Bypass LangChain when schema-promoted fields are present so they
    // appear as top-level Azure Search document properties.
    if (hasSchemaFields && this.searchClient) {
      return this.addDocumentsWithSchemaFields(documents);
    }

    // Standard LangChain path for backward compatibility
    const options: AddDocumentsOptions = {
      // Default missing ids to an empty string so LangChain assigns one
      ids: documents.map((document) => document.id ?? ''),
    };
    // Flatten custom metadata attributes into the shape LangChain expects
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
   * Azure Search document property names reserved by the base schema.
   * Schema-promoted fields must not collide with these.
   */
  private static readonly RESERVED_FIELDS = new Set([
    'id',
    'content',
    'content_vector',
    'metadata',
  ]);

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
   * @throws {AIError} When a document's `metadata.embedding` is present but malformed
   *   (not an array, or contains non-finite values).
   */
  private async addDocumentsWithSchemaFields(documents: VectorStoreDocument[]): Promise<string[]> {
    // Resolve embeddings per-document: reuse pre-computed ones and only
    // call the embedding service for documents that lack them, avoiding
    // unnecessary API calls when batches are partially pre-computed.
    const missingIndices: number[] = [];
    // Reuse pre-computed embeddings where present, marking the rest for batch computation
    const vectors: number[][] = documents.map((doc, index) => {
      const embedding = doc.metadata.embedding;

      // No embedding provided — mark for batch computation below
      if (embedding == null) {
        missingIndices.push(index);
        return [];
      }

      // Reject corrupted metadata (e.g. serialised as a string or object)
      if (!Array.isArray(embedding)) {
        throw new AIError(
          `Invalid embedding for document "${doc.id}": expected an array of numbers.`,
        );
      }

      // Empty array is technically truthy but has no dimensions — treat as missing
      if (embedding.length === 0) {
        missingIndices.push(index);
        return [];
      }

      // Guard against NaN / Infinity values that Azure Search would reject
      if (
        !embedding
          // Every dimension must be a finite number for Azure Search to accept it
          .every((value) => typeof value === 'number' && Number.isFinite(value))
      ) {
        throw new AIError(
          `Invalid embedding for document "${doc.id}": expected a non-empty array of finite numbers.`,
        );
      }

      return embedding as number[];
    });

    // Compute embeddings only for the documents that were missing them
    if (missingIndices.length > 0) {
      // Only the texts lacking a pre-computed embedding need to be sent to the service
      const textsToEmbed = missingIndices.map((i) => documents[i].pageContent);
      const computed = await this.vectorStore.embeddings.embedDocuments(textsToEmbed);
      // Write each computed embedding back into its original document position
      for (let j = 0; j < missingIndices.length; j++) {
        vectors[missingIndices[j]] = computed[j];
      }
    }

    // Construct Azure Search documents with promoted fields at the top level
    const entities = documents.map((doc, idx) => {
      const attributes = doc.metadata.attributes
        ? convertObjectToAttributes(doc.metadata.attributes as Record<string, unknown>)
        : [];

      // Strip reserved base-schema keys to prevent schema-promoted fields
      // from accidentally overwriting `id`, `content`, etc.
      const safeSchemaFields: Record<string, unknown> = {};
      // Only promote schema fields when the document actually carries them
      if (doc.metadata.schemaFields) {
        // Copy each schema field over, skipping any that collide with reserved keys
        for (const [key, value] of Object.entries(doc.metadata.schemaFields)) {
          // Reserved keys must never be overwritten by promoted schema fields
          if (!AzureVectorStore.RESERVED_FIELDS.has(key)) {
            safeSchemaFields[key] = value;
          }
        }
      }

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
        ...safeSchemaFields,
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

    // The written documents keep their original ids, in the same order as input
    // Extract just the id from each written document, preserving input order
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
   * @throws {AIError} When the underlying similarity search request fails.
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
    // Run the search and flatten each result array into individual emissions
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
