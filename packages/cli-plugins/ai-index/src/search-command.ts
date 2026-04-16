import { createCommand, createOption } from 'commander';
import type { Document } from '@langchain/core/documents';
import { inspect } from 'node:util';

import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import {
  withOptions as withAiOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import type { RetrieverOptions } from '@equinor/fusion-framework-module-ai/lib';

/**
 * Resolved option values for the `ai index search` CLI command.
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
 * under an `attributes` property. This helper converts that array into a flat
 * key-value map so consumers can access attributes directly
 * (e.g. `metadata.source` instead of iterating the attributes array).
 *
 * JSON-encoded attribute values are transparently parsed; plain strings are
 * kept as-is.
 *
 * @param metadata - Raw metadata record from an Azure Search document.
 * @returns A shallow copy of `metadata` with the `attributes` array replaced by
 *   its flattened key-value entries.
 */
const normalizeMetadata = (metadata: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...metadata };

  if (Array.isArray(normalized.attributes)) {
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
    Object.assign(normalized, attributesObj);
    delete normalized.attributes;
  }

  return normalized;
};

/**
 * Commander subcommand: **`ai index search`**
 *
 * Performs semantic vector-store search against an Azure Cognitive Search index
 * and displays the matching documents. Use this command to validate that
 * embeddings are indexed correctly, to explore the retrieval corpus, or to
 * test OData filter expressions.
 *
 * Supports two search algorithms:
 * - **`similarity`** (default) — pure cosine-similarity ranking.
 * - **`mmr`** — Maximum Marginal Relevance, which re-ranks results to increase
 *   diversity while staying relevant.
 *
 * Results can be output as human-readable text (default) or as JSON objects
 * (`--json`). The `--raw` flag preserves Azure Search's native metadata
 * structure; without it, metadata attributes are flattened by
 * {@link normalizeMetadata}.
 *
 * @example
 * ```sh
 * # Basic similarity search
 * ffc ai index search "how to configure modules"
 *
 * # Limit results and use MMR for diversity
 * ffc ai index search "authentication" --limit 5 --search-type mmr
 *
 * # Filter by package name
 * ffc ai index search "hooks" --filter "metadata/attributes/any(a: a/key eq 'pkg_name' and a/value eq '@equinor/fusion-framework-react')" --json
 *
 * # Verbose output with raw Azure metadata
 * ffc ai index search "API reference" --verbose --raw
 * ```
 */
const _command = createCommand('search')
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

    if (!options.indexName) {
      throw new Error('Index name is required');
    }

    if (options.verbose) {
      console.log('✅ Framework initialized successfully');
      console.log(`📇 Index: ${options.indexName}`);
      console.log(`🔎 Searching for: "${query}"`);
      console.log(`📊 Limit: ${options.limit}`);
      console.log(`🔍 Search type: ${options.searchType}`);
      if (options.filter) {
        console.log(`🔧 Filter: ${options.filter}`);
      }
      console.log('');
    }

    const vectorStoreService = framework.ai.useIndex(options.indexName);

    try {
      const filter = options.filter ? { filterExpression: options.filter } : undefined;

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

      const retriever = vectorStoreService.asRetriever(retrieverOptions);
      const results = await retriever.invoke(query);

      if (!results || !Array.isArray(results)) {
        throw new Error(
          `Invalid search results: expected array but got ${results === null ? 'null' : typeof results}`,
        );
      }

      if (options.json) {
        for (const doc of results) {
          if (options.raw) {
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
        if (results.length === 0) {
          console.log('❌ No results found');
          return;
        }

        console.log(`✅ Found ${results.length} result${results.length !== 1 ? 's' : ''}:\n`);

        results.forEach((doc: Document, index: number) => {
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

          if (options.verbose) {
            const { source: _, score: __, ...otherMetadata } = metadata;
            if (Object.keys(otherMetadata).length > 0) {
              console.log(`Metadata:`, JSON.stringify(otherMetadata, null, 2));
            }
          }
          console.log('');

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
  });

/**
 * Configured Commander command for the `ai index search` subcommand.
 *
 * Fully-configured {@link Command} instance with all AI-specific options
 * (embedding deployment, Azure Search credentials) applied via `withAiOptions`.
 */
export const searchCommand = withAiOptions(_command, {
  includeEmbedding: true,
  includeSearch: true,
});

export default searchCommand;
