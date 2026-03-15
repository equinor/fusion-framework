import type { Command } from 'commander';
import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as chatCommand } from './chat.js';

/**
 * Registers the `ai chat` CLI plugin command with the Fusion Framework CLI program.
 *
 * Call this function from a CLI plugin entry point to add the interactive
 * AI chat command (`ffc ai chat`) to the CLI command tree. The function
 * delegates to {@link registerAiPlugin} from `@equinor/fusion-framework-cli-plugin-ai-base`
 * to wire up shared AI options (Azure OpenAI, Azure Cognitive Search) and
 * attach the chat-specific sub-command.
 *
 * @param program - The root `Commander` {@link Command} instance that owns the CLI command tree
 *
 * @example
 * ```ts
 * import { registerChatPlugin } from '@equinor/fusion-framework-cli-plugin-ai-chat';
 * registerChatPlugin(program);
 * ```
 */
export function registerChatPlugin(program: Command): void {
  registerAiPlugin(program, chatCommand);
}

export default registerChatPlugin;
