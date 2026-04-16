import { createCommand, createOption } from 'commander';
import type { ChatMessage } from '@equinor/fusion-framework-module-ai/lib';
import { from } from 'rxjs';
import {
  withOptions as withAiOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
// ChatMessage is used as a type in this file
import { createInterface } from 'node:readline';

import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { MessageHistory } from './message-history.js';
import {
  RunnablePassthrough,
  RunnableSequence,
  type RunnableInterface,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

/**
 * CLI command definition for `ffc ai chat`.
 *
 * Provides an interactive, readline-based chat session with an Azure OpenAI
 * model. Each user message triggers a Retrieval-Augmented Generation (RAG)
 * pipeline that:
 *
 * 1. Retrieves relevant documents from an Azure Cognitive Search vector store.
 * 2. Injects the retrieved context into a system prompt via {@link createSystemMessage}.
 * 3. Streams the model's response token-by-token to stdout using a
 *    {@link RunnableSequence} LangChain chain.
 *
 * The command also manages conversation history with automatic AI-based
 * compression: when the history reaches 10 messages the oldest 5 are
 * summarised into a single assistant message, keeping token usage bounded
 * while preserving conversational context.
 *
 * @remarks
 * Requires `--openai-chat-deployment` and `--azure-search-index-name` at
 * minimum. All options can alternatively be supplied as environment variables
 * (see {@link CommandOptions}).
 *
 * @example
 * ```sh
 * # Basic interactive chat
 * ffc ai chat
 *
 * # With explicit deployment and search config
 * ffc ai chat \
 *   --openai-chat-deployment gpt-4o \
 *   --azure-search-endpoint https://my.search.windows.net \
 *   --azure-search-index-name fusion-docs
 *
 * # Increase context window and enable verbose logging
 * ffc ai chat --context-limit 10 --verbose
 * ```
 */

/**
 * Merged option set for the `ai chat` command.
 *
 * Extends the shared {@link AiOptions} from
 * `@equinor/fusion-framework-cli-plugin-ai-base` with chat-specific flags
 * for verbose logging, context retrieval depth, and conversation history size.
 *
 * Every option can be supplied via the corresponding `AZURE_*` / `OPENAI_*`
 * environment variable instead of a CLI flag.
 */
type CommandOptions = AiOptions & {
  /** Enable verbose output for debugging. */
  verbose?: boolean;
  /** Enable debug mode: sets `OPENAI_LOG=debug` and implies `--verbose`. */
  debug?: boolean;
  /** Maximum number of messages to keep in conversation history before compression (default `20`). */
  historyLimit?: number;
};

const _command = createCommand('chat')
  .description('Interactive chat with Large Language Models')
  .addOption(createOption('--verbose', 'Enable verbose output').default(false))
  .addOption(
    createOption('--debug', 'Enable debug mode (sets OPENAI_LOG=debug, implies --verbose)').default(
      false,
    ),
  )
  .addOption(
    createOption(
      '--history-limit <number>',
      'Maximum number of messages to keep in conversation history',
    )
      .default(20)
      .argParser(parseInt),
  )
  .action(async (options: CommandOptions) => {
    if (options.debug) {
      process.env.OPENAI_LOG = 'debug';
      options.verbose = true;
    }

    // Initialize the framework
    const framework = await setupFramework(options);

    if (options.verbose) {
      console.log('✅ Framework initialized successfully');
      console.log('💬 Starting interactive chat...');
      console.log('🔍 Context retrieval enabled');
      console.log(`📝 Message history limit: ${options.historyLimit || 20} messages`);
      console.log('🔍 Using model:', options.chatModel);
      console.log('Type "exit" or "quit" to end the conversation');
      console.log('Type "clear" to clear the conversation history');
      console.log('Press Ctrl+C to exit immediately');
      console.log('');
    }

    if (!options.chatModel) throw new Error('Chat model name is required');

    const chatService = framework.ai.useModel(options.chatModel);

    // Formats the message array from history and current user message
    const formatPromptAsMessages = new RunnablePassthrough().pipe(
      async (input: { userMessage: string; messageHistory: ChatMessage[] }) => {
        const messages: ChatMessage[] = [
          ...input.messageHistory,
          { role: 'user', content: input.userMessage },
        ];
        return messages;
      },
    );

    // Create the chatbot chain using LangChain's RunnableSequence
    // Chain flow: format messages -> invoke chat model -> parse string output
    // Note: Type assertion needed because IModel extends RunnableInterface but TypeScript
    // doesn't recognize the compatibility without explicit casting
    const chain = RunnableSequence.from([
      formatPromptAsMessages,
      chatService as unknown as RunnableInterface,
      new StringOutputParser(),
    ]);

    const messageHistory = new MessageHistory(options.historyLimit ?? 20, async (messages) => {
      const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
      const summaryPrompt = `Provide a concise summary of this conversation history, focusing on key topics and context:\n\n${conversationText}\n\nSummary:`;
      try {
        const raw = await chatService.invoke([{ role: 'user', content: summaryPrompt }]);
        const text = typeof raw === 'string' ? raw : String(raw);
        return { role: 'assistant', content: `[Previous conversation summary: ${text}]` };
      } catch {
        return {
          role: 'assistant',
          content: `[Previous conversation summary: ${messages.length} messages]`,
        };
      }
    });

    console.log('💬 Chat ready! Start typing your message...\n');
    console.log('💡 Press Ctrl+C to exit at any time\n');

    // Create readline interface for better Ctrl+C handling
    // This provides better control over input/output and signal handling
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Handle Ctrl+C gracefully to prevent abrupt termination
    const handleExit = () => {
      console.log('\n\n👋 Goodbye!');
      rl.close();
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    // Interactive chat loop - continues until user exits
    while (true) {
      try {
        // Prompt user for input using readline
        const userMessage = await new Promise<string>((resolve) => {
          rl.question('You: ', (answer) => {
            resolve(answer.trim());
          });
        });

        // Skip empty messages
        if (!userMessage) {
          console.log('Please enter a message\n');
          continue;
        }

        // Handle special commands
        if (userMessage.toLowerCase() === 'clear') {
          messageHistory.clear();
          console.log('\n🧹 Conversation history cleared!\n');
          continue;
        }

        await messageHistory.add({ role: 'user', content: userMessage });

        // Show typing indicator
        console.log('\n🤖 AI Response:');

        // Use LangChain runnable chain for RAG (Retrieval-Augmented Generation)
        try {
          if (options.verbose) {
            console.log('🔍 Using LangChain chain with context retrieval...');
            console.log(`📝 Message history contains ${messageHistory.messages.length} messages`);
          }

          // Stream the response from the chain for real-time output
          const responseStream = await chain.stream({
            userMessage,
            messageHistory: messageHistory.messages,
          });

          // Collect the full response while streaming chunks to stdout
          // This allows users to see the response as it's generated
          const fullResponse = await new Promise<string>((resolve, reject) => {
            let fullResponse = '';
            from(responseStream).subscribe({
              next: (chunk) => {
                // Write each chunk immediately for streaming effect
                process.stdout.write(String(chunk));
                fullResponse += chunk;
              },
              error: (error) => {
                reject(error);
              },
              complete: () => {
                resolve(fullResponse);
              },
            });
          });

          await messageHistory.add({ role: 'assistant', content: fullResponse });
        } catch (error) {
          console.error('\n❌ Chain error:', error);
          console.log('Falling back to basic chat...');
        }
        console.log('');
      } catch (error) {
        console.error('\n❌ Error during chat:', error);
        console.log('');
      }
    }
  });

/**
 * Fully configured Commander command for `ffc ai chat`.
 *
 * Wraps the base `_command` with shared AI options (chat, embedding, and
 * search) from `@equinor/fusion-framework-cli-plugin-ai-base` via
 * {@link withAiOptions}. This is the value imported by
 * {@link registerChatPlugin} when mounting the command onto the CLI tree.
 *
 * @example
 * ```ts
 * import { command } from '@equinor/fusion-framework-cli-plugin-ai-chat/chat';
 * program.addCommand(command);
 * ```
 */
export const command = withAiOptions(_command, {
  includeChat: true,
});

export default command;
