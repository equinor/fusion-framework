import { concatMap, from, map, type Observable } from 'rxjs';
import {
  AzureAISearchVectorStore,
  type AzureAISearchConfig,
} from '@langchain/community/vectorstores/azure_aisearch';

import type { IEmbed, IVectorStore } from '../types.js';
import { BaseService } from '../BaseService.js';
import { AIError } from '../../AIError.js';

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

  /**
   * Search for documents synchronously
   * @param query - Search query string
   * @returns Promise resolving to array of search results
   */
  async invoke(query: string): Promise<unknown[]> {
    try {
      const results = await this.vectorStore.similaritySearch(query, 10);
      return results.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score: doc.metadata?.score,
      }));
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
}
