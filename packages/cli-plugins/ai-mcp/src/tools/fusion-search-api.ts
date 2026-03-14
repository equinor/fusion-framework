import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { AiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * MCP tool definition for `fusion_search_api`.
 *
 * Enables semantic search scoped to Fusion Framework TypeScript API
 * reference — TSDoc blocks, function signatures, class definitions,
 * and interface declarations indexed as `tsdoc` documents.
 *
 * Registered with the MCP server so that AI assistants can discover
 * and invoke the tool by name.
 */
export const toolDefinition = {
  name: 'fusion_search_api',
  description:
    'Search the Fusion Framework API reference using semantic search. Use this for finding TypeScript/TSDoc code documentation, function signatures, class definitions, and API details.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find relevant API reference documentation',
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
 * Handles invocations of the `fusion_search_api` MCP tool.
 *
 * Queries the Azure Cognitive Search vector store with a `tsdoc` category
 * filter and returns matching documents as JSON text content.
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
    console.error(`🔍 Searching API reference for: ${query}`);
  }

  const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);
  const retriever = vectorStoreService.asRetriever({
    k: limit,
    searchType: 'similarity',
    filter: {
      filterExpression: "metadata/attributes/any(x: x/key eq 'type' and x/value eq 'tsdoc')",
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
            type: 'api',
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
