import { z } from 'zod';
import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { AiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/** Valid documentation categories that can be searched */
export type FusionSearchCategory = 'api' | 'cookbook' | 'markdown' | 'eds' | 'all';

export const inputSchema = z.object({
  query: z
    .string()
    .describe(
      'Ask anything about Fusion Framework in plain English — the more specific, the better the results.',
    ),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe('Maximum number of results to return. Recommended range: 3–8 (default: 5). Lower values help prevent context window overflow.'),
  category: z
    // .enum(['api', 'cookbook', 'markdown', 'eds', 'all'])
    .enum(['all'])
    .optional()
    .default('all')
    // .describe(
    //   [
    //     'Optional filter to narrow search scope:',
    //     '• api      → TypeScript API reference (classes, methods, interfaces)',
    //     '• cookbook → Code examples, tutorials, and practical recipes',
    //     '• markdown → Guides, architecture docs, migration guides',
    //     '• eds      → EDS components (Storybook stories, props, tokens, accessibility)',
    //     '• all      → Search all sources (default)',
    //   ].join('\n'),
    // ),
});

/**
 * Tool configuration for McpServer.registerTool().
 */
export const toolConfig = {
  description: [
    'THE BEST AND FASTEST WAY to get accurate answers about Fusion Framework, modules, configurators, EDS components, and best practices.',
    'Understands natural questions and returns the exact code examples, API docs, cookbooks, or EDS stories you need — always with direct GitHub links.',
    'Covers everything: TypeScript APIs, practical cookbooks, architecture guides, and full EDS component documentation.',
  ].join('\n'),
  inputSchema,
} as const;

/**
 * Azure Cognitive Search OData filter expressions per category
 */
const FILTER_EXPRESSIONS: Readonly<Record<FusionSearchCategory, string | undefined>> = {
  api: "metadata/attributes/any(x: x/key eq 'type' and x/value eq 'tsdoc')",
  cookbook: "metadata/attributes/any(x: x/key eq 'type' and x/value eq 'cookbook')",
  markdown: "metadata/attributes/any(x: x/key eq 'type' and x/value eq 'markdown')",
  eds: "metadata/attributes/any(x: x/key eq 'type' and x/value eq 'storybook')",
  all: undefined,
} as const;

/**
 * Performs a semantic search with Maximal Marginal Relevance (MMR) in a specific category.
 *
 * MMR balances relevance and diversity — perfect for avoiding near-duplicate results
 * when multiple docs describe the same concept.
 *
 * @param category - Documentation category to search within
 * @param query - Natural language search query
 * @param limit - Maximum number of results (final count after MMR)
 * @param framework - Fusion Framework instance with AI module loaded
 * @param options - AI plugin options (must include Azure Search index name)
 * @returns Array of relevant documents with metadata
 */
async function searchWithMMR(
  category: FusionSearchCategory,
  query: string,
  limit: number,
  framework: FrameworkInstance,
  options: AiOptions,
): Promise<VectorStoreDocument[]> {
  const filterExpression = FILTER_EXPRESSIONS[category];

  if (!framework.ai || !options.azureSearchIndexName) {
    throw new Error(
      'Fusion AI module or Azure Search index not configured. ' +
        'Ensure `@equinor/fusion-framework-cli-plugin-ai` is installed and configured.',
    );
  }

  const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);

  const retriever = vectorStoreService.asRetriever({
    k: limit,
    searchType: 'mmr',
    searchKwargs: {
      fetchK: Math.max(60, limit * 6), // Fetch more candidates for better diversity
      lambda: 0.5, // Balance between relevance (1.0) and diversity (0.0)
    },
    filter: filterExpression ? { filterExpression } : undefined,
  });

  const docs = await retriever.invoke(query);
  return Array.isArray(docs) ? (docs as VectorStoreDocument[]) : [];
}

/**
 * Main handler for the `fusion_search` tool.
 *
 * Returns a curried function that takes tool input arguments and returns search results.
 *
 * @param framework - Active Fusion Framework instance
 * @param options - AI plugin options, optionally with `{ verbose: true }`
 * @returns A function that takes validated tool arguments and returns search results
 *
 * @throws {Error} If AI module or Azure Search index is not configured
 */
export function handleTool(
  framework: FrameworkInstance,
  options: AiOptions & { verbose?: boolean },
): ToolCallback<typeof inputSchema> {
  return async (args: Parameters<ToolCallback<typeof inputSchema>>[0]): Promise<CallToolResult> => {
    // ── Preconditions ─────────────────────────────────────────────────────
    if (!framework.ai || !options.azureSearchIndexName) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              error: 'Fusion AI module or Azure Search index not configured',
              message:
                'Ensure `@equinor/fusion-framework-cli-plugin-ai` is installed and configured with Azure Search credentials.',
              required: {
                azureSearchIndexName: 'Azure Search index name',
                azureSearchEndpoint: 'Azure Search endpoint URL',
                azureSearchApiKey: 'Azure Search API key',
                openaiEmbeddingDeployment: 'Azure OpenAI embedding deployment name',
              },
            }),
          },
        ],
        isError: true,
      };
    }
    const query = args.query.trim();
    const limit = args.limit && args.limit > 0 ? Math.floor(args.limit) : 10;
    const category: FusionSearchCategory =
      args.category && args.category in FILTER_EXPRESSIONS ? args.category : 'all';

    if (!query || query === '') {
      throw new Error('Parameter "query" is required and must be a non-empty string.');
    }

    // ── Verbose logging (useful when running in Cursor, VS Code, etc.) ───
    if (options.verbose) {
      console.error(`Fusion Search → "${query}" | Category: ${category} | Limit: ${limit}`);
    }

    // ── Execute search ───────────────────────────────────────────────────
    try {
      const results = await searchWithMMR(category, query, limit, framework, options);
      return {
        content: results.map((doc) => ({
          type: 'text' as const,
          text: doc.pageContent,
          _meta: doc.metadata,
        })),
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
              results: [],
            }),
          },
        ],
        isError: true,
      };
    }
  };
}
