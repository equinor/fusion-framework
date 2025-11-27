import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { AiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * Tool definition for searching Fusion Framework markdown documentation.
 * This tool enables semantic search across markdown files, guides, and documentation.
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
 * Tool handler for fusion_search_markdown
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
      filterExpression: "metadata/type eq 'markdown'",
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
