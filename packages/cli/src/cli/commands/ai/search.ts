import { createCommand, createOption } from 'commander';
import type { Document } from '@langchain/core/documents';
import { withAiOptions, type AiOptions } from '../../options/ai.js';

import { setupFramework } from './utils/setup-framework.js';
import { inspect } from 'node:util';

type CommandOptions = AiOptions & {
  limit: number;
  verbose: boolean;
  filter?: string;
  json: boolean;
  raw: boolean;
};

/**
 * Normalize metadata attributes from Azure Search format to a flat object
 * Converts array of {key, value} pairs to a simple object
 * @param metadata - Raw metadata object that may contain attributes array
 * @returns Normalized metadata with attributes flattened into the root object
 */
const normalizeMetadata = (metadata: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...metadata };

  // Check if attributes exist and is an array
  if (Array.isArray(normalized.attributes)) {
    // Convert array of {key, value} pairs to object
    const attributesObj: Record<string, unknown> = {};
    for (const attr of normalized.attributes) {
      if (
        typeof attr === 'object' &&
        attr !== null &&
        'key' in attr &&
        'value' in attr &&
        typeof attr.key === 'string'
      ) {
        try {
            attributesObj[attr.key] = JSON.parse(attr.value as string);
        } catch {
            attributesObj[attr.key] = attr.value;
        }
      }
    }
    // Merge attributes into the root metadata object
    Object.assign(normalized, attributesObj);
    // Remove the original attributes array
    delete normalized.attributes;
  }

  return normalized;
};

/**
 * CLI command: `ai search`
 *
 * Search the vector store to validate embeddings and retrieve relevant documents.
 *
 * Features:
 * - Semantic search using vector embeddings
 * - Configurable result limits
 * - Filter support for metadata-based filtering
 * - JSON output option for programmatic use
 * - Detailed result display with scores and metadata
 *
 * Usage:
 *   $ ffc ai search <query> [options]
 *
 * Options:
 *   --limit <number>                    Maximum number of results to return (default: 10)
 *   --filter <expression>               OData filter expression for metadata filtering
 *   --json                              Output results as JSON
 *   --raw                               Output raw metadata without normalization
 *   --verbose                           Enable verbose output
 *   --openai-api-key <key>              API key for Azure OpenAI
 *   --openai-api-version <version>      API version (default: 2024-02-15-preview)
 *   --openai-instance <name>            Azure OpenAI instance name
 *   --openai-embedding-deployment <name> Azure OpenAI embedding deployment name
 *   --azure-search-endpoint <url>       Azure Search endpoint URL
 *   --azure-search-api-key <key>        Azure Search API key
 *   --azure-search-index-name <name>    Azure Search index name
 *
 * Environment Variables:
 *   AZURE_OPENAI_API_KEY                    API key for Azure OpenAI
 *   AZURE_OPENAI_API_VERSION                API version
 *   AZURE_OPENAI_INSTANCE_NAME              Instance name
 *   AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME  Embedding deployment name
 *   AZURE_SEARCH_ENDPOINT                   Azure Search endpoint
 *   AZURE_SEARCH_API_KEY                    Azure Search API key
 *   AZURE_SEARCH_INDEX_NAME                 Azure Search index name
 *
 * Examples:
 *   $ ffc ai search "how to use the framework"
 *   $ ffc ai search "authentication" --limit 5
 *   $ ffc ai search "typescript" --filter "metadata/source eq 'src/index.ts'"
 *   $ ffc ai search "documentation" --json
 *   $ ffc ai search "documentation" --json --raw
 *   $ ffc ai search "API reference" --verbose
 */
export const command = withAiOptions(
  createCommand('search')
    .description('Search the vector store to validate embeddings and retrieve relevant documents')
    .addOption(
      createOption('--limit <number>', 'Maximum number of results to return')
        .default(10)
        .argParser(parseInt),
    )
    .addOption(
      createOption('--filter <expression>', 'OData filter expression for metadata filtering'),
    )
    .addOption(createOption('--json', 'Output results as JSON').default(false))
    .addOption(createOption('--raw', 'Output raw metadata without normalization').default(false))
    .addOption(createOption('--verbose', 'Enable verbose output').default(false))
    .argument('<query>', 'Search query string')
    .action(async (query: string, options: CommandOptions) => {
      if (options.verbose) {
        console.log('🔍 Initializing framework...');
      }

      const framework = await setupFramework(options);

      if (!options.azureSearchIndexName) {
        throw new Error('Azure Search index name is required');
      }

      if (options.verbose) {
        console.log('✅ Framework initialized successfully');
        console.log(`🔎 Searching for: "${query}"`);
        console.log(`📊 Limit: ${options.limit}`);
        if (options.filter) {
          console.log(`🔧 Filter: ${options.filter}`);
        }
        console.log('');
      }

      const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);

      try {
        // Use the retriever for more control over search options
        // Note: Filter support may vary by vector store implementation
        const retrieverOptions: {
          k: number;
          filter?: Record<string, unknown>;
        } = {
          k: options.limit,
        };

        // Add filter if provided (format depends on vector store implementation)
        if (options.filter) {
          // For Azure Search, filters are typically OData expressions
          // The retriever filter format may need to be adapted based on implementation
          retrieverOptions.filter = {
            filterExpression: options.filter,
          } as Record<string, unknown>;
        }

        const retriever = vectorStoreService.asRetriever(retrieverOptions);
        const results = await retriever.invoke(query);

        if (options.json) {
          // Output as JSON for programmatic use
          for (const doc of results) {
            if(options.raw) {
              console.log(inspect(doc, { depth: null, colors: true }));
            } else {
              const metadata = normalizeMetadata(doc.metadata as Record<string, unknown>);
              console.log({
                content: doc.pageContent,
                metadata,
                score: (metadata as { score?: number })?.score,
              });
            }
          }
        } else {
          // Format results for human-readable output
          if (results.length === 0) {
            console.log('❌ No results found');
            return;
          }

          console.log(`✅ Found ${results.length} result${results.length !== 1 ? 's' : ''}:\n`);

          results.forEach((doc: Document, index: number) => {
            // Normalize metadata to flatten attributes array unless --raw flag is set
            const processedMetadata = options.raw
              ? (doc.metadata as Record<string, unknown>)
              : normalizeMetadata(doc.metadata as Record<string, unknown>);
            const metadata = processedMetadata as {
              source?: string;
              score?: number;
              [key: string]: unknown;
            };
            const score = metadata.score;
            const source = metadata.source || 'Unknown source';

            console.log(`${'─'.repeat(80)}`);
            console.log(
              `Result ${index + 1}${score !== undefined ? ` (Score: ${score.toFixed(4)})` : ''}`,
            );
            console.log(`Source: ${source}`);
            // Display additional metadata fields if verbose mode is enabled
            if (options.verbose) {
              const { source: _, score: __, ...otherMetadata } = metadata;
              if (Object.keys(otherMetadata).length > 0) {
                console.log(`Metadata:`, JSON.stringify(otherMetadata, null, 2));
              }
            }
            console.log('');
            // Truncate content if too long
            const content = doc.pageContent;
            const maxLength = 500;
            if (content.length > maxLength) {
              console.log(`${content.substring(0, maxLength)}...`);
              console.log(`\n[Content truncated - ${content.length} characters total]`);
            } else {
              console.log(content);
            }
            console.log('');
          });

          console.log(`${'─'.repeat(80)}`);
        }
      } catch (error) {
        console.error(
          `❌ Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        if (options.verbose && error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    }),
  {
    includeEmbedding: true,
    includeSearch: true,
  },
);

export default command;
