import { concatMap, from, type Observable, type ObservableInput } from 'rxjs';
import { AzureChatOpenAI, type BaseChatOpenAICallOptions } from '@langchain/openai';
import { ChatMessage as LangChainChatMessage } from '@langchain/core/messages';
import type { RunnableInterface } from '@langchain/core/runnables';

import { BaseService } from '../BaseService.js';
import type { IModel, ChatMessage, ModelInput, ModelOutput, ModelTool } from '../types.js';

type ModelOpenAiConfig = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  model?: string;
};

export type AzureOpenAIModelConfig = ModelOpenAiConfig & {
  azureOpenAIApiEndpoint?: string;
  azureOpenAIApiDeploymentName?: string;
  azureOpenAIApiInstanceName?: string;
  azureOpenAIApiKey?: string;
  azureOpenAIApiVersion?: string;
  azureADTokenProvider?: () => Promise<string>;
};

/**
 * OpenAI model client implementation using LangChain
 */
export class AzureOpenAIModel<
    TOptions extends BaseChatOpenAICallOptions = BaseChatOpenAICallOptions,
  >
  extends BaseService<ModelInput, ModelOutput, TOptions>
  implements IModel
{
  #client: AzureChatOpenAI;

  get llm(): AzureChatOpenAI {
    return this.#client;
  }

  bindTools(tools: ModelTool[], options?: TOptions): RunnableInterface<ModelInput, ModelOutput, TOptions> {
    return this.#client.bindTools(tools, options);
  }

  /**
   * Create a new OpenAI model client
   * @param config - Client configuration
   */
  constructor(config: AzureOpenAIModelConfig) {
    super();
    this.#client = new AzureChatOpenAI(config);
  }

  /**
   * Invoke the OpenAI model with messages and return a single completion
   * @param messages - Array of conversation messages
   * @param options - Completion options
   * @returns Promise resolving to the completion response
   */
  async invoke(messages: ModelInput, options?: TOptions): Promise<ModelOutput> {
    return this.#client.invoke(messages, options);
  }

  /**
   * Invoke the OpenAI model with messages and return a streaming response
   * @param messages - Array of conversation messages
   * @returns Observable stream of completion chunks
   */
  invoke$(messages: ModelInput): Observable<ModelOutput> {
    return from(this.#client.stream(messages)).pipe(
      concatMap((stream: ObservableInput<ModelOutput>) => from(stream)),
    );
  }

  protected _prepareMessages(messages: ChatMessage[]): LangChainChatMessage[] {
    return messages.map((x) => new LangChainChatMessage(x));
  }
}
