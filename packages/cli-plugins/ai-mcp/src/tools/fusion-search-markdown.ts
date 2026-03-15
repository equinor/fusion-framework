import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { AiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * MCP tool definition for `fusion_search_markdown`.
 *
 * Enables semantic search scoped to Fusion Framework markdown
 * documentation — architecture guides, migration notes, conceptual
 * overviews, and README content indexed as `markdown` documents.
 */
export const toolDefinition = {
  name: 'fusion_search_markdown',
  description:
    'Search the Fusion Framework markdown documentation using semantic search. Use this for finding documentation, guides, and explanatory content.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find relevant markdown documentation',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5)',
        default: 5,
      },
    },
    required: ['query'],
  },
} as const;

/**
 * Handles invocations of the `fusion_search_markdown` MCP tool.
 *
 * Queries the Azure Cognitive Search vector store with a `markdown` category
 * filter and returns matching documentation pages as JSON text content.
 *
 * @param args - Raw tool arguments containing `query` (string) and optional `limit` (number)
 * @param framework - Active {@link FrameworkInstance} with the AI module loaded
 * @param options - AI plugin options including Azure Search index name and optional `verbose` flag
 * @returns MCP-compliant content array with search results, or an error payload
 * @throws {Error} If the vector store is not configured or `query` is missing
 */
export async function handleTool(
  args: Record<string, unknown>,
  framework: FrameworkInstance,
  options: AiOptions & { verbose?: boolean },
): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  if (!options.azureSearchIndexName || !framework.ai) {
    throw new Error(
      'Vector store is not configured. Azure Search is required for search functionality.',
    );
  }

  const query = args?.query as string;
  const limit = (args?.limit as number) || 5;

  if (!query || typeof query !== 'string') {
    throw new Error('Query parameter is required and must be a string');
  }

  if (options.verbose) {
    console.error(`🔍 Searching markdown documentation for: ${query}`);
  }

  const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);
  const retriever = vectorStoreService.asRetriever({
    k: limit,
    searchType: 'similarity',
    filter: {
      filterExpression: "metadata/attributes/any(x: x/key eq 'type' and x/value eq 'markdown')",
    },
  });

  const docs = await retriever.invoke(query);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            query,
            type: 'markdown',
            results: docs.map(
              (doc: { pageContent: string; metadata: Record<string, unknown> }) => ({
                content: doc.pageContent,
                metadata: doc.metadata,
              }),
            ),
            count: docs.length,
          },
          null,
          2,
        ),
      },
    ],
  };
}
