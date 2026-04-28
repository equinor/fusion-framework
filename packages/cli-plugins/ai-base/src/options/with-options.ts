import { type Command, InvalidOptionArgumentError } from 'commander';
import {
  chatModelOption,
  clientIdOption,
  debugOption,
  embedModelOption,
  envOption,
  indexNameOption,
  tenantIdOption,
  tokenOption,
} from './options.js';

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

  if (args?.includeChat) command.addOption(chatModelOption);
  if (args?.includeEmbedding) command.addOption(embedModelOption);
  if (args?.includeSearch) command.addOption(indexNameOption);

  command.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();

    if (args?.includeChat && !opts.chatModel?.trim()) {
      throw new InvalidOptionArgumentError(
        'Chat model name is required. Provide --chat-model or set FUSION_AI_CHAT_MODEL.',
      );
    }
    if (args?.includeEmbedding && !opts.embedModel?.trim()) {
      throw new InvalidOptionArgumentError(
        'Embedding model name is required. Provide --embed-model or set FUSION_AI_EMBED_MODEL.',
      );
    }
    if (args?.includeSearch && !opts.indexName?.trim()) {
      throw new InvalidOptionArgumentError(
        'Index name is required. Provide --index-name or set FUSION_AI_INDEX_NAME.',
      );
    }
  });

  return command;
};

export default withOptions;
