import { concatMap, from, type Observable, type ObservableInput } from 'rxjs';
import { AzureChatOpenAI, type BaseChatOpenAICallOptions } from '@langchain/openai';
import { ChatMessage as LangChainChatMessage } from '@langchain/core/messages';
import type { RunnableInterface } from '@langchain/core/runnables';

import { BaseService } from '../BaseService.js';
import type { IModel, ChatMessage, ModelInput, ModelOutput, ModelTool } from '../types.js';

/**
 * Base configuration shared by all OpenAI-compatible model clients.
 */
type ModelOpenAiConfig = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  model?: string;
};

/**
 * Configuration for the {@link AzureOpenAIModel} client.
 *
 * Combines model-level sampling parameters with Azure-specific deployment
 * and authentication settings.  Supply either `azureOpenAIApiKey` **or**
 * `azureADTokenProvider` for authentication.
 */
export type AzureOpenAIModelConfig = ModelOpenAiConfig & {
  azureOpenAIApiEndpoint?: string;
  /** Direct base path for the Azure OpenAI endpoint (e.g. a Fusion AI proxy URI). */
  azureOpenAIBasePath?: string;
  azureOpenAIApiDeploymentName?: string;
  azureOpenAIApiInstanceName?: string;
  azureOpenAIApiKey?: string;
  azureOpenAIApiVersion?: string;
  azureADTokenProvider?: () => Promise<string>;
};

/**
 * Azure OpenAI language model client built on the LangChain `AzureChatOpenAI`
 * backend.
 *
 * Supports both single-response ({@link AzureOpenAIModel.invoke | invoke}) and
 * streaming ({@link AzureOpenAIModel.invoke$ | invoke$}) invocations, as well
 * as {@link AzureOpenAIModel.bindTools | tool binding} for function-calling
 * workflows.
 *
 * @template TOptions - Provider-specific call options; defaults to
 *   `BaseChatOpenAICallOptions`.
 *
 * @example
 * ```typescript
 * import { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/azure';
 *
 * const model = new AzureOpenAIModel({
 *   azureOpenAIApiKey: 'your-key',
 *   azureOpenAIApiDeploymentName: 'gpt-4',
 * });
 *
 * const reply = await model.invoke('Summarise the quarterly report');
 * ```
 */
export class AzureOpenAIModel<
    TOptions extends BaseChatOpenAICallOptions = BaseChatOpenAICallOptions,
  >
  extends BaseService<ModelInput, ModelOutput, TOptions>
  implements IModel
{
  #client: AzureChatOpenAI;

  /** The underlying LangChain `AzureChatOpenAI` instance. */
  get llm(): AzureChatOpenAI {
    return this.#client;
  }

  /**
   * Bind tools to the model so it can make function calls during completion.
   *
   * @param tools - Tools the model may invoke.
   * @param options - Optional call options forwarded to the underlying model.
   * @returns A runnable that routes tool calls to the supplied tools.
   */
  bindTools(
    tools: ModelTool[],
    options?: TOptions,
  ): RunnableInterface<ModelInput, ModelOutput, TOptions> {
    return this.#client.bindTools(tools, options);
  }

  /**
   * Create a new Azure OpenAI model client.
   *
   * @param config - Azure OpenAI deployment and model configuration.
   */
  constructor(config: AzureOpenAIModelConfig) {
    super();
    this.#client = new AzureChatOpenAI(config);
  }

  /**
   * Invoke the Azure OpenAI model and return a single completion.
   *
   * @param messages - Prompt input (string, message array, or LangChain `BaseMessage[]`).
   * @param options - Optional call options.
   * @returns Promise resolving to the completion response chunk.
   */
  async invoke(messages: ModelInput, options?: TOptions): Promise<ModelOutput> {
    return this.#client.invoke(messages, options);
  }

  /**
   * Invoke the Azure OpenAI model and stream completion chunks.
   *
   * @param messages - Prompt input.
   * @returns Observable emitting `AIMessageChunk` values as they arrive.
   */
  invoke$(messages: ModelInput): Observable<ModelOutput> {
    return from(this.#client.stream(messages)).pipe(
      concatMap((stream: ObservableInput<ModelOutput>) => from(stream)),
    );
  }

  /**
   * Convert simple {@link ChatMessage} objects into LangChain message instances.
   *
   * @param messages - Array of role/content message objects.
   * @returns Array of LangChain `ChatMessage` instances.
   */
  protected _prepareMessages(messages: ChatMessage[]): LangChainChatMessage[] {
    return messages.map((x) => new LangChainChatMessage(x));
  }
}
