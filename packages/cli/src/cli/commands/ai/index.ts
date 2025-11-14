import { createCommand } from 'commander';

import chatCommand from './chat.js';
import { command as embeddingsCommand } from './embeddings.js';

/**
 * CLI command: `ai`
 *
 * Manage Large Language Model (ai) integrations and configurations.
 *
 * Features:
 * - Interactive chat with AI models
 * - Document embedding and chunking utilities
 * - Configure ai clients
 * - Test model connections
 * - Manage API keys and settings
 *
 * Usage:
 *   $ ffc ai <subcommand> [options]
 *
 * Subcommands:
 *   chat        Interactive chat with AI models
 *   embeddings  Document embedding utilities for ai processing
 *
 * Examples:
 *   $ ffc ai chat
 *   $ ffc ai chat --model gpt-4 --api-key sk-...
 *   $ ffc ai embeddings --dry-run ./src
 *   $ ffc ai embeddings --chunk-size 1000 ./docs/readme.md
 */
export const command = createCommand('ai')
  .description('Manage Large Language Model (ai) integrations and configurations')
  .addHelpText(
    'after',
    [
      '',
      'The "ai" command provides tools for managing Large Language Model integrations',
      'and document processing within the Fusion Framework ecosystem.',
      '',
      'Available subcommands:',
      '  chat        Interactive chat with AI models',
      '  embeddings  Document embedding utilities for ai processing',
      '',
      'For details and options for a specific subcommand, run:',
      '  fusion ai <subcommand> --help',
      '',
      'Examples:',
      '  $ ffc ai chat',
      '  $ ffc ai chat --model gpt-4 --api-key sk-...',
      '  $ ffc ai embeddings --dry-run ./src',
      '  $ ffc ai embeddings --chunk-size 1000 ./docs/readme.md',
    ].join('\n'),
  )
  .addCommand(chatCommand)
  .addCommand(embeddingsCommand);

export default command;
