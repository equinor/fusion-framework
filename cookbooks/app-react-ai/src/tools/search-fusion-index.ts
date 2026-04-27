import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { IAIProvider } from '@equinor/fusion-framework-module-ai';

/** Configuration for creating a search tool bound to a specific index. */
interface IndexToolConfig {
  /** LangChain tool name (must be unique across all tools). */
  name: string;
  /** Human-readable description the model uses to decide when to invoke this tool. */
  description: string;
  /** Azure AI Search index name to query. */
  indexName: string;
}

const searchSchema = z.object({
  query: z
    .string()
    .describe(
      'Natural language search query — e.g. "how to configure http client", "useModule hook", "app manifest".',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe('Maximum number of results to return (1–20, default 5).'),
});

/**
 * Creates a LangChain tool that performs semantic search against a
 * Fusion AI Search index.
 *
 * The tool uses the AI module's {@link IAIProvider.useIndex} to obtain a
 * vector store for the given index, then runs a similarity search and
 * returns the top results.
 *
 * @param aiProvider - Active Fusion AI provider with index strategy configured.
 * @param config - Index name, tool name, and description for this search tool.
 * @returns A {@link DynamicStructuredTool} ready to be bound to a chat model.
 */
export function createFusionSearchTool(
  aiProvider: IAIProvider,
  config: IndexToolConfig,
): DynamicStructuredTool {
  const { name, description, indexName } = config;
  // @ts-expect-error — DynamicStructuredTool + Zod triggers TS2589 (excessively deep type instantiation)
  return new DynamicStructuredTool({
    name,
    description,
    schema: searchSchema,
    func: async ({ query, limit }: { query: string; limit: number }): Promise<string> => {
      const vectorStore = aiProvider.useIndex(indexName);
      const retriever = vectorStore.asRetriever({
        k: limit,
        searchType: 'similarity',
      });

      const results = await retriever.invoke(query);

      if (!results || results.length === 0) {
        return `No results found for "${query}" in the ${indexName} index.`;
      }

      // Format each result with source path and content excerpt
      return results
        .map((doc, i) => {
          const source = doc.metadata?.source ?? 'unknown';
          const content = doc.pageContent.slice(0, 600);
          return `[${i + 1}] ${source}\n${content}`;
        })
        .join('\n\n---\n\n');
    },
  });
}
