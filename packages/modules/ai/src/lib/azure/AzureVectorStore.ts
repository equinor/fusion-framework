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

export type AzureDocument = Document & {
  metadata: AzureAISearchDocumentMetadata;
};

/**
 * Azure AI Search vector store implementation using LangChain
 */
export class AzureVectorStore extends BaseService<string, unknown[]> implements IVectorStore {
  private vectorStore: AzureAISearchVectorStore;

  /**
   * Create a new Azure Vector Store client
   * @param config - Vector store configuration
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
