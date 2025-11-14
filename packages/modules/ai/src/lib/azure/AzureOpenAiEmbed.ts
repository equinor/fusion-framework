import { from, type Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OpenAIEmbeddings } from '@langchain/openai';

import { BaseService } from '../BaseService.js';
import { ServiceError } from '../ServiceError.js';

import type { IEmbed } from '../types.js';

type EmbedOpenAiConfig = {
  batchSize?: number;
  stripNewLines?: boolean;
};

export type AzureOpenAiEmbedConfig = EmbedOpenAiConfig & {
  azureOpenAIApiDeploymentName?: string;
  azureOpenAIApiInstanceName?: string;
  azureOpenAIApiKey?: string;
  azureOpenAIApiVersion?: string;
  azureADTokenProvider?: () => Promise<string>;
};

/**
 * Azure OpenAI embedding client implementation using LangChain
 */
export class AzureOpenAiEmbed extends BaseService<string[], number[][]> implements IEmbed {
  private client: OpenAIEmbeddings;

  /**
   * Create a new Azure OpenAI embedding client
   * @param config - Client configuration
   */
  constructor(config: AzureOpenAiEmbedConfig) {
    super();
    this.client = new OpenAIEmbeddings(config);
  }

  public embedQuery(document: string): Promise<number[]> {
    return this.client.embedQuery(document);
  }

  public embedDocuments(documents: string[]): Promise<number[][]> {
    return this.client.embedDocuments(documents);
  }

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
