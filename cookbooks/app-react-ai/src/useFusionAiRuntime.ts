import { useMemo, useRef } from 'react';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useLocalRuntime, type ChatModelAdapter } from '@assistant-ui/react';
import type { AIModule } from '@equinor/fusion-framework-module-ai';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
  type AIMessageChunk,
} from '@langchain/core/messages';

const SYSTEM_PROMPT = [
  'You are CryptoBot, a helpful cryptocurrency assistant.',
  'You have access to real-time market data from Binance via the get_crypto_price tool.',
  'When a user asks about a crypto price, use the tool with the correct trading pair (e.g. BTCUSDT, ETHUSDT, SOLUSDT).',
  'If the user mentions a coin name like "Bitcoin" or "Ethereum", map it to the right symbol yourself.',
  'Keep answers concise and informative. Format numbers for readability.',
  'If asked about something outside crypto, politely steer the conversation back to crypto topics.',
].join(' ');

import { getStockPriceTool } from './tools/get-crypto-price';

/** Tools available to the assistant. */
const tools = [getStockPriceTool];

/** Map of tool name → executable tool for resolving tool calls. */
const toolMap = new Map<string, (typeof tools)[number]>(tools.map((t) => [t.name, t]));

/**
 * Extracts text content from a model output chunk.
 */
function extractText(content: AIMessageChunk['content']): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(
        (c): c is { type: 'text'; text: string } =>
          typeof c === 'object' && 'type' in c && c.type === 'text',
      )
      .map((c) => c.text)
      .join('');
  }
  return '';
}

/**
 * Invokes the model and returns the full response.
 */
async function invokeModel(
  runnable: { invoke: (input: BaseMessage[], options?: { signal?: AbortSignal }) => Promise<AIMessageChunk> },
  input: BaseMessage[],
  signal?: AbortSignal,
): Promise<AIMessageChunk> {
  return runnable.invoke(input, { signal });
}

/**
 * Creates an assistant-ui runtime backed by the Fusion AI module.
 *
 * Uses {@link useLocalRuntime} with a {@link ChatModelAdapter} that
 * delegates chat completions to the Fusion AI provider's language model.
 * The model is bound with tools so it can call functions like `get_stock_price`.
 *
 * @param model - Azure OpenAI deployment name (defaults to the module default).
 */
export const useFusionAiRuntime = (model?: string) => {
  const ai = useModule<AIModule>('ai');
  const aiRef = useRef(ai);
  aiRef.current = ai;

  const adapter = useMemo<ChatModelAdapter>(() => {
    return {
      async *run({ messages, abortSignal }) {
        const provider = aiRef.current;
        const chatModel = provider.useModel.bind(provider)(model);
        // Cast needed: pnpm may resolve separate @langchain/core copies for the cookbook
        // and the AI module, making structurally identical types nominally incompatible.
        // biome-ignore lint/suspicious/noExplicitAny: cross-package type boundary
        const modelWithTools = chatModel.bindTools(tools as any);

        const langchainMessages: BaseMessage[] = [
          new SystemMessage(SYSTEM_PROMPT),
          ...messages.map((m) => {
            const text = m.content
              .filter((c): c is Extract<typeof c, { type: 'text' }> => c.type === 'text')
              .map((c) => c.text)
              .join('\n');
            return m.role === 'user' ? new HumanMessage(text) : new AIMessage(text);
          }),
        ];

        /** Run inference, executing tool calls in a loop until the model produces a final text reply. */
        // biome-ignore lint/suspicious/noExplicitAny: cross-package type boundary
        let response = await invokeModel(modelWithTools as any, langchainMessages, abortSignal);

        while (response.tool_calls && response.tool_calls.length > 0) {
          langchainMessages.push(new AIMessage(response));

          for (const tc of response.tool_calls) {
            const fn = toolMap.get(tc.name);
            const result = fn ? await fn.invoke(tc.args) : `Unknown tool: ${tc.name}`;
            langchainMessages.push(new ToolMessage({ content: String(result), tool_call_id: tc.id ?? tc.name }));
          }

          response = await invokeModel(modelWithTools as any, langchainMessages, abortSignal);
        }

        yield {
          content: [{ type: 'text' as const, text: extractText(response.content) }],
        };
      },
    };
  }, [model]);

  return useLocalRuntime(adapter);
};
