import { createCommand } from 'commander';

import chatCommand from './chat.js';
import { command as embeddingsCommand } from './embeddings.js';
import { command as searchCommand } from './search.js';

/**
 * CLI command: `ai`
 *
 * Manage Large Language Model (ai) integrations and configurations.
 *
 * Features:
 * - Interactive chat with AI models
 * - Document embedding and chunking utilities
 * - Vector store search for validating embeddings
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
 *   search      Search the vector store to validate embeddings
 *
 * Examples:
 *   $ ffc ai chat
 *   $ ffc ai chat --model gpt-4 --api-key sk-...
 *   $ ffc ai embeddings --dry-run ./src
 *   $ ffc ai embeddings --chunk-size 1000 ./docs/readme.md
 *   $ ffc ai search "how to use the framework"
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
      '  search      Search the vector store to validate embeddings',
      '',
      'For details and options for a specific subcommand, run:',
      '  fusion ai <subcommand> --help',
      '',
      'Examples:',
      '  $ ffc ai chat',
      '  $ ffc ai chat --model gpt-4 --api-key sk-...',
      '  $ ffc ai embeddings --dry-run ./src',
      '  $ ffc ai embeddings --chunk-size 1000 ./docs/readme.md',
      '  $ ffc ai search "how to use the framework"',
    ].join('\n'),
  )
  .addCommand(chatCommand)
  .addCommand(embeddingsCommand)
  .addCommand(searchCommand);

export default command;
