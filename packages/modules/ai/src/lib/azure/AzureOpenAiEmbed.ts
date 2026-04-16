import { from, type Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AzureOpenAIEmbeddings } from '@langchain/openai';

import { BaseService } from '../BaseService.js';
import { ServiceError } from '../ServiceError.js';

import type { IEmbed } from '../types.js';

/**
 * Base configuration shared by all OpenAI-compatible embedding clients.
 */
type EmbedOpenAiConfig = {
  batchSize?: number;
  stripNewLines?: boolean;
};

/**
 * Configuration for the {@link AzureOpenAiEmbed} client.
 *
 * Combines batching and text-processing options with Azure-specific deployment
 * and authentication settings.  Supply either `azureOpenAIApiKey` **or**
 * `azureADTokenProvider` for authentication.
 */
export type AzureOpenAiEmbedConfig = EmbedOpenAiConfig & {
  azureOpenAIApiDeploymentName?: string;
  azureOpenAIApiInstanceName?: string;
  /** Direct base path for the Azure OpenAI endpoint (e.g. a Fusion AI proxy URI). */
  azureOpenAIBasePath?: string;
  azureOpenAIApiKey?: string;
  azureOpenAIApiVersion?: string;
  azureADTokenProvider?: () => Promise<string>;
};

/**
 * Azure OpenAI text-embedding client built on the LangChain
 * `AzureOpenAIEmbeddings` backend.
 *
 * Converts text strings into dense numeric vectors suitable for semantic
 * similarity search, clustering, and RAG pipelines.
 *
 * @example
 * ```typescript
 * import { AzureOpenAiEmbed } from '@equinor/fusion-framework-module-ai/azure';
 *
 * const embedder = new AzureOpenAiEmbed({
 *   azureOpenAIApiKey: 'your-key',
 *   azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
 * });
 *
 * const vector = await embedder.embedQuery('Fusion Framework documentation');
 * ```
 */
export class AzureOpenAiEmbed extends BaseService<string[], number[][]> implements IEmbed {
  private client: AzureOpenAIEmbeddings;

  /**
   * Create a new Azure OpenAI embedding client.
   *
   * @param config - Azure OpenAI deployment and embedding configuration.
   */
  constructor(config: AzureOpenAiEmbedConfig) {
    super();
    this.client = new AzureOpenAIEmbeddings(config);
  }

  /**
   * Embed a single text document.
   *
   * @param document - The text to embed.
   * @returns Promise resolving to the embedding vector.
   */
  public embedQuery(document: string): Promise<number[]> {
    return this.client.embedQuery(document);
  }

  /**
   * Embed multiple text documents in a single batch.
   *
   * @param documents - Array of texts to embed.
   * @returns Promise resolving to an array of embedding vectors.
   */
  public embedDocuments(documents: string[]): Promise<number[][]> {
    return this.client.embedDocuments(documents);
  }

  /**
   * Embed documents and return the result as an RxJS Observable.
   *
   * @param documents - Array of texts to embed.
   * @returns Observable emitting the embedding vectors.
   * @throws {ServiceError} When the underlying Azure OpenAI request fails.
   */
  public invoke$(documents: string[]): Observable<number[][]> {
    return from(this.client.embedDocuments(documents)).pipe(
      catchError((error) => {
        throw new ServiceError(`Azure OpenAI embedding request failed`, {
          cause: error,
        });
      }),
    );
  }
}
