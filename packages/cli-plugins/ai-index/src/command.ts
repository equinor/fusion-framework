import { createCommand, createOption } from 'commander';

import { loadFusionAIConfig, setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { withOptions as withAiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

import { embed } from './bin/embed.js';
import { CommandOptionsSchema, type CommandOptions } from './command.options.js';
import type { FusionAIConfigWithIndex } from './config.js';

/**
 * CLI command: `ai embeddings`
 *
 * Document embedding utilities for Large Language Model processing.
 *
 * Features:
 * - Markdown/MDX document chunking with frontmatter extraction
 * - TypeScript/TSX TSDoc extraction and chunking
 * - Glob pattern support for file collection
 * - Git diff-based processing for workflow integration
 * - Dry-run mode for testing without actual processing
 * - Configurable file patterns via fusion-ai.config.ts
 *
 * Usage:
 *   $ ffc ai embeddings [options] [glob-patterns...]
 *
 * Arguments:
 *   glob-patterns          Glob patterns to match files (optional when using --diff)
 *                          Defaults to patterns from fusion-ai.config.ts if not provided
 *
 * Options:
 *   --dry-run              Show what would be processed without actually doing it
 *   --config <config>      Path to a config file (default: fusion-ai.config)
 *   --diff                 Process only changed files (workflow mode)
 *   --base-ref <ref>       Git reference to compare against (default: HEAD~1)
 *   --clean                Delete all existing documents from the vector store before processing
 *
 * AI Options (required):
 *   --openai-api-key <key>              Azure OpenAI API key (or AZURE_OPENAI_API_KEY env var)
 *   --openai-api-version <version>      Azure OpenAI API version (default: 2024-02-15-preview)
 *   --openai-instance <name>            Azure OpenAI instance name (or AZURE_OPENAI_INSTANCE_NAME env var)
 *   --openai-embedding-deployment <name> Azure OpenAI embedding deployment name (or AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME env var)
 *   --azure-search-endpoint <url>       Azure Search endpoint URL (or AZURE_SEARCH_ENDPOINT env var)
 *   --azure-search-api-key <key>        Azure Search API key (or AZURE_SEARCH_API_KEY env var)
 *   --azure-search-index-name <name>    Azure Search index name (or AZURE_SEARCH_INDEX_NAME env var)
 *
 * Examples:
 *   $ ffc ai embeddings --dry-run ./src
 *   $ ffc ai embeddings "*.ts" "*.md" "*.mdx"
 *   $ ffc ai embeddings --diff
 *   $ ffc ai embeddings --diff --base-ref origin/main
 *   $ ffc ai embeddings --clean "*.ts"
 */
const _command = createCommand('embeddings')
  .description('Document embedding utilities for Large Language Model processing')
  .addOption(
    createOption('--dry-run', 'Show what would be processed without actually doing it').default(
      false,
    ),
  )
  .addOption(
    createOption('--config <config>', 'Path to a config file').default('fusion-ai.config'),
  )
  .addOption(createOption('--diff', 'Process only changed files (workflow mode)').default(false))
  .addOption(createOption('--base-ref <ref>', 'Git reference to compare against').default('HEAD~1'))
  .addOption(
    createOption(
      '--clean',
      'Delete all existing documents from the vector store before processing',
    ).default(false),
  )
  .argument('[glob-patterns...]', 'Glob patterns to match files (optional when using --diff)')
  .action(async (patterns: string[], commandOptions: CommandOptions) => {
    const options = await CommandOptionsSchema.parseAsync(commandOptions);

    // Load configuration
    const config = await loadFusionAIConfig<FusionAIConfigWithIndex>(options.config, {
      baseDir: process.cwd(),
    });

    // CLI args take precedence over config patterns
    const indexConfig = config.index ?? {};
    const allowedFilePatterns = indexConfig.patterns ?? ['**/*.ts', '**/*.md', '**/*.mdx'];
    const filePatterns = patterns.length ? patterns : allowedFilePatterns;

    // Initialize framework
    const framework = await setupFramework(options);

    // Execute embeddings bin with framework and options
    await embed({
      framework,
      options,
      config,
      filePatterns,
    });
  });

export const command = withAiOptions(_command, {
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
