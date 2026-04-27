import { useMemo, useRef } from 'react';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useLocalRuntime, type ChatModelAdapter } from '@assistant-ui/react';
import type { AIModule } from '@equinor/fusion-framework-module-ai';
import type { IModelRunnable } from '@equinor/fusion-framework-module-ai/lib';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from '@langchain/core/messages';

const SYSTEM_PROMPT = [
  'You are FusionBot, a helpful assistant for the Fusion Framework platform.',
  'You have access to a Fusion search index:',
  'search_fusion_framework — Fusion Framework documentation, modules, hooks, React patterns, and cookbook examples.',
  'Use it when the user asks about Fusion Framework APIs, modules, hooks, configuration, React patterns, or how to build Fusion apps.',
  'Keep answers concise and informative. Use code examples from the index when available.',
].join(' ');

import { createFusionSearchTool } from './tools/search-fusion-index';

/**
 * Extracts text content from a model output chunk.
 */
function extractText(content: string | Array<Record<string, unknown>>): string {
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

        // Build tool list with provider-dependent tools created at call time
        const frameworkSearchTool = createFusionSearchTool(provider, {
          name: 'search_fusion_framework',
          description:
            'Search the Fusion Framework documentation and source code index. ' +
            'Use this when the user asks about Fusion Framework APIs, modules, hooks, ' +
            'configuration, React patterns, or how to build Fusion apps.',
          indexName: 'fusion-framework-2026-04-21',
        });
        const tools = [frameworkSearchTool];
        const toolMap = new Map<string, (typeof tools)[number]>(tools.map((t) => [t.name, t]));

        // Cast needed: pnpm may resolve separate @langchain/core copies for the cookbook
        // and the AI module, making structurally identical types nominally incompatible.
        // biome-ignore lint/suspicious/noExplicitAny: cross-package type boundary
        const modelWithTools = chatModel.bindTools(tools as any) as IModelRunnable;

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

        /** Execute tool calls (non-streaming) until the model stops requesting tools. */
        let response = await modelWithTools.invoke(langchainMessages, { signal: abortSignal });

        while (response.tool_calls && response.tool_calls.length > 0) {
          langchainMessages.push(new AIMessage(response));

          for (const tc of response.tool_calls) {
            const fn = toolMap.get(tc.name);
            const result = fn ? await fn.invoke(tc.args) : `Unknown tool: ${tc.name}`;
            langchainMessages.push(
              new ToolMessage({ content: String(result), tool_call_id: tc.id ?? tc.name }),
            );
          }

          response = await modelWithTools.invoke(langchainMessages, { signal: abortSignal });
        }

        /** Stream the final text response token-by-token. */
        let text = '';
        const stream = await modelWithTools.stream(langchainMessages, { signal: abortSignal });
        for await (const chunk of stream) {
          const delta = extractText(chunk.content);
          if (delta) {
            text += delta;
            yield { content: [{ type: 'text' as const, text }] };
          }
        }
      },
    };
  }, [model]);

  return useLocalRuntime(adapter);
};
