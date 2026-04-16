import { createCommand, createOption } from 'commander';

import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { withOptions as withAiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

import { DeleteOptionsSchema, type DeleteOptions } from './delete-command.options.js';

/**
 * Builds an OData filter expression from source paths and/or a raw filter.
 *
 * Source paths are joined with `or`; a raw `--filter` expression is used
 * directly. When both are supplied, source-path filters take precedence
 * to prevent unintentional broad deletions.
 *
 * @param sources - Relative file paths to match against `metadata/source`.
 * @param rawFilter - A raw OData filter expression supplied via `--filter`.
 * @returns The combined OData filter string, or `undefined` when neither
 *   sources nor a raw filter were provided.
 */
function buildFilter(sources: string[], rawFilter?: string): string | undefined {
  if (sources.length > 0) {
    return sources.map((s) => `metadata/source eq '${s}'`).join(' or ');
  }
  return rawFilter;
}

/**
 * CLI command: `ai index remove`
 *
 * Removes documents from the Azure AI Search index by source path or OData filter.
 *
 * Use this when you need to remove stale, renamed, or noisy documents from the
 * vector store without running a full re-index.
 *
 * Usage:
 *   $ ffc ai index remove [options] [source-paths...]
 *
 * Arguments:
 *   source-paths    One or more relative file paths whose indexed chunks should
 *                   be removed (e.g. packages/modules/services/src/foo.ts).
 *
 * Options:
 *   --filter <expr>  Raw OData filter expression for advanced selection
 *                    (e.g. "metadata/source eq 'src/old-file.ts'").
 *   --dry-run        Preview matching documents without deleting them.
 *
 * Examples:
 *   # Remove by source paths
 *   $ ffc ai index remove src/old-module.ts src/legacy/helper.ts
 *
 *   # Preview what would be removed (dry-run)
 *   $ ffc ai index remove --dry-run src/old-module.ts
 *
 *   # Remove using a raw OData filter
 *   $ ffc ai index remove --filter "metadata/source eq 'src/old-module.ts'"
 *
 *   # Remove all chunks from a package
 *   $ ffc ai index remove --filter "metadata/attributes/any(a: a/key eq 'pkg_name' and a/value eq '@equinor/my-pkg')"
 */
const _command = createCommand('remove')
  .description('Remove documents from the search index by source path or OData filter')
  .addOption(
    createOption('--dry-run', 'Preview matching documents without deleting them').default(false),
  )
  .addOption(
    createOption(
      '--filter <expression>',
      'Raw OData filter expression for selecting documents to delete',
    ),
  )
  .argument('[source-paths...]', 'Relative file paths whose indexed chunks should be removed')
  .action(async (sources: string[], commandOptions: DeleteOptions) => {
    const options = await DeleteOptionsSchema.parseAsync(commandOptions);
    const filterExpression = buildFilter(sources, options.filter);

    if (!filterExpression) {
      throw new Error(
        'Nothing to delete. Provide source file paths as arguments or pass a --filter expression.',
      );
    }

    if (sources.length > 0) {
      console.log(`\nTargeting ${sources.length} source path(s):\n`);
      for (const src of sources.sort()) {
        console.log(`  ${src}`);
      }
    } else {
      console.log(`\nFilter: ${filterExpression}`);
    }

    if (options.dryRun) {
      console.log('\n🔍 Dry run — no documents were deleted.');
      console.log(`  Would apply filter: ${filterExpression}`);
      return;
    }

    const framework = await setupFramework(options);
    const vectorStoreService = framework.ai.useIndex(options.indexName);
    await vectorStoreService.deleteDocuments({
      filter: { filterExpression },
    });

    console.log(`\n✅ Deleted chunks matching filter.`);
  });

/**
 * Configured Commander command for the `ai index remove` subcommand.
 *
 * This constant is the fully-configured {@link Command} instance with all
 * AI-specific options (embedding deployment, Azure Search credentials) applied
 * via `withAiOptions`. It is registered with the CLI automatically by
 * {@link registerAiPlugin}.
 */
export const deleteCommand = withAiOptions(_command, {
  includeEmbedding: true,
  includeSearch: true,
});
