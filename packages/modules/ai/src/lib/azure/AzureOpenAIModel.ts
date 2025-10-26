import { concatMap, from, map, type Observable, type ObservableInput } from 'rxjs';
import { AzureChatOpenAI } from '@langchain/openai';
import { type AIMessageChunk, ChatMessage as LangChainChatMessage } from '@langchain/core/messages';
import type { ToolCall as LangChainToolCall } from '@langchain/core/messages/tool';
import { RunnableLambda } from '@langchain/core/runnables';

import type { IModel, ChatMessage, ChatResponse } from '../types.js';
import { AIError } from '../../AIError.js';
import { BaseService } from '../BaseService.js';

type ModelOpenAiConfig = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
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
export class AzureOpenAIModel extends BaseService<ChatMessage[], ChatResponse> implements IModel {
  #client: AzureChatOpenAI;

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
  async invoke(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const langchainMessages = this._prepareMessages(messages);
      const response = await this.#client.invoke(langchainMessages);

      return {
        content: response.content,
        type: response._getType(),
        role: 'assistant', // LangChain AI messages are always from assistant
        toolCalls: response.tool_calls?.map((tc: LangChainToolCall) => ({
          id: tc.id,
          name: tc.name,
          arguments: tc.args,
        })),
        usage: response.usage_metadata
          ? {
              totalTokens: response.usage_metadata.total_tokens,
            }
          : undefined,
        metadata: response.response_metadata,
      };
    } catch (error) {
      throw new AIError(
        `OpenAI API request failed: ${error instanceof Error ? error.message : String(error)}`,
        'API_ERROR',
      );
    }
  }

  /**
   * Invoke the OpenAI model with messages and return a streaming response
   * @param messages - Array of conversation messages
   * @returns Observable stream of completion chunks
   */
  invoke$(messages: ChatMessage[]): Observable<ChatResponse> {
    const langchainMessages = this._prepareMessages(messages);
    return from(this.#client.stream(langchainMessages)).pipe(
      concatMap((stream: ObservableInput<AIMessageChunk>) => from(stream)),
      map((chunk) => {
        return {
          content: chunk.content,
          type: chunk._getType(),
          role: 'assistant', // LangChain AI chunks are always from assistant
          toolCalls: chunk.tool_calls?.map((tc: LangChainToolCall) => ({
            id: tc.id,
            name: tc.name,
            arguments: tc.args,
          })),
          usage: chunk.usage_metadata
            ? {
                totalTokens: chunk.usage_metadata.total_tokens,
              }
            : undefined,
          metadata: chunk.response_metadata,
        } as ChatResponse;
      }),
    );
  }

  protected _prepareMessages(messages: ChatMessage[]): LangChainChatMessage[] {
    return messages.map((x) => new LangChainChatMessage(x));
  }
}
