import { type Command, createCommand, createOption } from 'commander';

import { loadFusionAIConfig, setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { withOptions as withAiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

import { embed } from './bin/embed.js';
import { CommandOptionsSchema, type CommandOptions } from './embeddings-command.options.js';
import type { FusionAIConfigWithIndex } from './config.js';

/**
 * CLI command: `ai index add`
 *
 * Add documents to the AI search index via embedding generation.
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
 *   $ ffc ai index add [options] [glob-patterns...]
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
 * Examples:
 *   $ ffc ai index add --dry-run ./src
 *   $ ffc ai index add "*.ts" "*.md" "*.mdx"
 *   $ ffc ai index add --diff
 *   $ ffc ai index add --diff --base-ref origin/main
 *   $ ffc ai index add --clean "*.ts"
 */
const _command = createCommand('add')
  .description('Add documents to the AI search index via embedding generation')
  .addOption(
    createOption('--dry-run', 'Show what would be processed without actually doing it').default(
      false,
    ),
  )
  .addOption(createOption('--config <config>', 'Path to a config file').default('fusion-ai.config'))
  .addOption(createOption('--diff', 'Process only changed files (workflow mode)').default(false))
  .addOption(createOption('--base-ref <ref>', 'Git reference to compare against').default('HEAD~1'))
  .addOption(
    createOption(
      '--clean',
      'Delete all existing documents from the vector store before processing',
    ).default(false),
  )
  .argument('[glob-patterns...]', 'Glob patterns to match files (optional when using --diff)')
  .action(async function (this: Command, patterns: string[], commandOptions: CommandOptions) {
    // Load configuration before validation so config values can fill gaps
    const preOptions = commandOptions as Record<string, unknown>;
    const config = await loadFusionAIConfig<FusionAIConfigWithIndex>(
      (preOptions.config as string) ?? 'fusion-ai.config',
      { baseDir: process.cwd() },
    );
    const indexConfig = config.index ?? {};

    // Config file values override env-var defaults but not explicit CLI flags.
    // Commander merges env vars before the action runs, so we use
    // getOptionValueSource to distinguish "user passed --flag" from "came from env".
    const parentCommand = this.parent ?? this;
    if (indexConfig.name) {
      const source = parentCommand.getOptionValueSource('azureSearchIndexName');
      if (source !== 'cli') {
        preOptions.azureSearchIndexName = indexConfig.name;
      }
    }
    if (indexConfig.model) {
      const source = parentCommand.getOptionValueSource('openaiEmbeddingDeployment');
      if (source !== 'cli') {
        preOptions.openaiEmbeddingDeployment = indexConfig.model;
      }
    }

    const options = await CommandOptionsSchema.parseAsync(preOptions);

    // CLI args take precedence over config patterns
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

/**
 * Configured Commander command for the `ai index add` subcommand.
 *
 * This constant is the fully-configured {@link Command} instance with all
 * AI-specific options (embedding deployment, Azure Search credentials) applied
 * via `withAiOptions`. It is registered with the CLI automatically by
 * {@link registerAiPlugin}.
 */
export const command = withAiOptions(_command, {
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
