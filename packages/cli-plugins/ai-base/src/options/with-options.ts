import { type Command, InvalidOptionArgumentError } from 'commander';
import { chatModelOption } from './chat-model-option.js';
import { clientIdOption } from './client-id-option.js';
import { debugOption } from './debug-option.js';
import { embedModelOption } from './embed-model-option.js';
import { envOption } from './env-option.js';
import { indexNameOption } from './index-name-option.js';
import { tenantIdOption } from './tenant-id-option.js';
import { tokenOption } from './token-option.js';

/**
 * Enhances a Commander command with Fusion AI options and validation.
 *
 * Core auth options (`--env`, `--token`, `--tenant-id`, `--client-id`) are always
 * added.  When no explicit `--token` is provided, the framework will authenticate
 * via MSAL and resolve the AI service endpoint from Fusion service discovery.
 *
 * Pass flags to include optional chat, embed, or index options and make
 * them required at runtime via the `preAction` validation hook.
 *
 * @param command - The Commander command to decorate with options.
 * @param args - Feature flags controlling which optional options to add.
 * @param args.includeChat - Add `--chat-model` and validate it at runtime.
 * @param args.includeEmbedding - Add `--embed-model` and validate it at runtime.
 * @param args.includeSearch - Add `--index-name` and validate it at runtime.
 * @returns The decorated command.
 */
export const withOptions = (
  command: Command,
  args?: Partial<{
    includeChat: boolean;
    includeEmbedding: boolean;
    includeSearch: boolean;
  }>,
): Command => {
  command.addOption(envOption);
  command.addOption(tokenOption);
  command.addOption(tenantIdOption);
  command.addOption(clientIdOption);
  command.addOption(debugOption);

  // Optional options are only added when the corresponding feature flag is set.
  if (args?.includeChat) command.addOption(chatModelOption);
  // Embed option is opt-in via includeEmbedding.
  if (args?.includeEmbedding) command.addOption(embedModelOption);
  // Search option is opt-in via includeSearch.
  if (args?.includeSearch) command.addOption(indexNameOption);

  command.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();

    // Enforce chat model presence when the chat option was requested.
    if (args?.includeChat && !opts.chatModel?.trim()) {
      throw new InvalidOptionArgumentError(
        'Chat model name is required. Provide --chat-model or set FUSION_AI_CHAT_MODEL.',
      );
    }
    // Enforce embed model presence when the embedding option was requested.
    if (args?.includeEmbedding && !opts.embedModel?.trim()) {
      throw new InvalidOptionArgumentError(
        'Embedding model name is required. Provide --embed-model or set FUSION_AI_EMBED_MODEL.',
      );
    }
    // Enforce index name presence when the search option was requested.
    if (args?.includeSearch && !opts.indexName?.trim()) {
      throw new InvalidOptionArgumentError(
        'Index name is required. Provide --index-name or set FUSION_AI_INDEX_NAME.',
      );
    }
  });

  return command;
};

export default withOptions;
