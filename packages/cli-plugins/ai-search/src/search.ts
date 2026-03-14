import { createCommand, createOption } from 'commander';
import type { Document } from '@langchain/core/documents';
import { withAiOptions, type AiOptions } from './options/ai.js';

import { setupFramework } from './utils/setup-framework.js';
import { inspect } from 'node:util';
import type { RetrieverOptions } from '@equinor/fusion-framework-module-ai/lib';

/**
 * Resolved option values for the `ai search` CLI command.
 *
 * Extends {@link AiOptions} with search-specific flags such as result limits,
 * output format toggles, filter expressions, and search-type selection.
 */
type CommandOptions = AiOptions & {
  /** Maximum number of search results to return (default `10`). */
  limit: number;
  /** When `true`, print diagnostic details such as index name and metadata. */
  verbose: boolean;
  /** Optional OData filter expression applied to document metadata before ranking. */
  filter?: string;
  /** When `true`, emit results as JSON objects instead of human-readable text. */
  json: boolean;
  /** When `true`, output the raw Azure Search metadata without flattening attributes. */
  raw: boolean;
  /** Search algorithm: `'similarity'` for cosine similarity or `'mmr'` for Maximum Marginal Relevance diversity re-ranking. */
  searchType: 'mmr' | 'similarity';
};

/**
 * Flatten Azure Cognitive Search metadata attributes into a plain object.
 *
 * Azure Search stores custom metadata as an array of `{ key, value }` pairs
 * under an `attributes` property.  This helper converts that array into a flat
 * key–value map and merges it into the top-level metadata object so consumers
 * can access attributes directly (e.g. `metadata.source` instead of iterating
 * the attributes array).
 *
 * JSON-encoded attribute values are transparently parsed; plain strings are
 * kept as-is.
 *
 * @param metadata - Raw metadata record from an Azure Search document.
 * @returns A shallow copy of `metadata` with the `attributes` array replaced by
 *   its flattened key–value entries.
 */
const normalizeMetadata = (metadata: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...metadata };

  // Azure Search returns attributes as an array of {key, value} pairs
  // Convert this to a flat object structure for easier access
  if (Array.isArray(normalized.attributes)) {
    const attributesObj: Record<string, unknown> = {};
    for (const attr of normalized.attributes) {
      // Validate attribute structure before processing
      if (
        typeof attr === 'object' &&
        attr !== null &&
        'key' in attr &&
        'value' in attr &&
        typeof attr.key === 'string'
      ) {
        // Try to parse JSON values (Azure Search stores complex values as JSON strings)
        // Fall back to raw value if parsing fails (for string values)
        try {
          attributesObj[attr.key] = JSON.parse(attr.value as string);
        } catch {
          attributesObj[attr.key] = attr.value;
        }
      }
    }
    // Merge flattened attributes into the root metadata object
    Object.assign(normalized, attributesObj);
    // Remove the original attributes array to avoid duplication
    delete normalized.attributes;
  }

  return normalized;
};

/**
 * Commander subcommand: **`ai search`**
 *
 * Performs semantic vector-store search against an Azure Cognitive Search index
 * and displays the matching documents.  Use this command to validate that
 * embeddings are indexed correctly, to explore the retrieval corpus, or to
 * test OData filter expressions.
 *
 * The command supports two search algorithms:
 *
 * - **`similarity`** (default) — pure cosine-similarity ranking.
 * - **`mmr`** — Maximum Marginal Relevance, which re-ranks results to increase
 *   diversity while staying relevant.
 *
 * Results can be output as human-readable text (default) or as JSON objects
 * (`--json`).  The `--raw` flag preserves Azure Search's native metadata
 * structure; without it, metadata attributes are flattened by
 * {@link normalizeMetadata}.
 *
 * ### Required environment / flags
 *
 * | Purpose | Flag | Env var |
 * |---|---|---|
 * | OpenAI API key | `--openai-api-key` | `AZURE_OPENAI_API_KEY` |
 * | OpenAI instance | `--openai-instance` | `AZURE_OPENAI_INSTANCE_NAME` |
 * | Embedding deployment | `--openai-embedding-deployment` | `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` |
 * | Search endpoint | `--azure-search-endpoint` | `AZURE_SEARCH_ENDPOINT` |
 * | Search API key | `--azure-search-api-key` | `AZURE_SEARCH_API_KEY` |
 * | Search index name | `--azure-search-index-name` | `AZURE_SEARCH_INDEX_NAME` |
 *
 * @example
 * ```sh
 * # Basic similarity search
 * ffc ai search "how to configure modules"
 *
 * # Limit results and use MMR for diversity
 * ffc ai search "authentication" --limit 5 --search-type mmr
 *
 * # Filter by metadata and output JSON
 * ffc ai search "hooks" --filter "metadata/source eq 'src/index.ts'" --json
 *
 * # Verbose output with raw Azure metadata
 * ffc ai search "API reference" --verbose --raw
 * ```
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
      createOption('--search-type <type>', 'Search type: mmr or similarity')
        .choices(['mmr', 'similarity'])
        .default('similarity'),
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
        console.log(`📇 Index: ${options.azureSearchIndexName}`);
        console.log(`🔎 Searching for: "${query}"`);
        console.log(`📊 Limit: ${options.limit}`);
        console.log(`🔍 Search type: ${options.searchType}`);
        if (options.filter) {
          console.log(`🔧 Filter: ${options.filter}`);
        }
        console.log('');
      }

      const vectorStoreService = framework.ai.getService('search', options.azureSearchIndexName);

      try {
        // Configure retriever options for semantic search
        // The retriever provides more control over search parameters than direct vector store queries
        // RetrieverOptions is a discriminated union, so we construct it based on search type
        const filter = options.filter
          ? {
              filterExpression: options.filter,
            }
          : undefined;

        // Construct retriever options based on search type
        // MMR search requires additional parameters for diversity optimization
        // Similarity search doesn't need these parameters
        const retrieverOptions: RetrieverOptions =
          options.searchType === 'mmr'
            ? {
                k: options.limit,
                searchType: 'mmr',
                ...(filter && { filter: filter as Record<string, unknown> }),
              }
            : {
                k: options.limit,
                searchType: 'similarity',
                ...(filter && { filter: filter as Record<string, unknown> }),
              };

        // Create retriever and execute search query
        const retriever = vectorStoreService.asRetriever(retrieverOptions);
        const results = await retriever.invoke(query);

        // Validate that results is an array
        if (!results || !Array.isArray(results)) {
          throw new Error(
            `Invalid search results: expected array but got ${results === null ? 'null' : typeof results}`,
          );
        }

        if (options.json) {
          // Output as JSON for programmatic use (e.g., piping to other tools)
          for (const doc of results) {
            if (options.raw) {
              // Output raw document structure with full depth inspection
              console.log(inspect(doc, { depth: null, colors: true }));
            } else {
              // Output normalized metadata for cleaner JSON structure
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
            // Raw mode preserves Azure Search's original metadata structure
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

            // Display result header with score if available
            console.log(`${'─'.repeat(80)}`);
            console.log(
              `Result ${index + 1}${score !== undefined ? ` (Score: ${score.toFixed(4)})` : ''}`,
            );
            console.log(`Source: ${source}`);

            // Display additional metadata fields if verbose mode is enabled
            // Exclude source and score from additional metadata to avoid duplication
            if (options.verbose) {
              const { source: _, score: __, ...otherMetadata } = metadata;
              if (Object.keys(otherMetadata).length > 0) {
                console.log(`Metadata:`, JSON.stringify(otherMetadata, null, 2));
              }
            }
            console.log('');

            // Truncate content if too long to keep output readable
            // Full content is still available in JSON mode
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
