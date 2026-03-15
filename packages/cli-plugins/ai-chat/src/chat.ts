import { createCommand, createOption } from 'commander';
import type { ChatMessage } from '@equinor/fusion-framework-module-ai/lib';
import { from } from 'rxjs';
import {
  withOptions as withAiOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import { createInterface } from 'node:readline';

import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { createSystemMessage } from './system-message-template.js';
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
  /** Maximum number of context documents to retrieve from the vector store (default `5`). */
  contextLimit?: number;
  /** Maximum number of messages to keep in conversation history before compression (default `20`). */
  historyLimit?: number;
};

const _command = createCommand('chat')
  .description('Interactive chat with Large Language Models')
  .addOption(createOption('--verbose', 'Enable verbose output').default(false))
  .addOption(
    createOption('--context-limit <number>', 'Maximum number of context documents to retrieve')
      .default(5)
      .argParser(parseInt),
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
    // Initialize the framework
    const framework = await setupFramework(options);

    // Get the AI provider
    const aiProvider = framework.ai;

    if (options.verbose) {
      console.log('✅ Framework initialized successfully');
      console.log('💬 Starting interactive chat...');
      console.log('🔍 Context retrieval enabled');
      console.log(`📝 Message history limit: ${options.historyLimit || 20} messages`);
      if (options.azureSearchEndpoint) {
        console.log(`📚 Using vector store: ${options.azureSearchIndexName}`);
      } else {
        console.log('⚠️  No vector store configured - context retrieval will be skipped');
      }
      console.log('🔍 Using model:', options.openaiChatDeployment);
      console.log('Type "exit" or "quit" to end the conversation');
      console.log('Type "clear" to clear the conversation history');
      console.log('Press Ctrl+C to exit immediately');
      console.log('');
    }

    // Start interactive chat
    if (!options.openaiChatDeployment) {
      throw new Error('Chat deployment name is required');
    }
    if (!options.azureSearchIndexName) {
      throw new Error('Azure Search index name is required');
    }

    const chatService = framework.ai.getService('chat', options.openaiChatDeployment);
    const vectorStoreService = aiProvider.getService('search', options.azureSearchIndexName);

    if (options.verbose) {
      console.log('🔧 Configuring retriever with options:', {
        k: options.contextLimit || 5,
        searchType: 'similarity',
      });
    }

    // Configure retriever with similarity search (not MMR) for more predictable results
    // MMR (Maximum Marginal Relevance) can sometimes cause issues with Azure Search
    const retriever = vectorStoreService.asRetriever({
      k: options.contextLimit || 5,
      searchType: 'similarity',
    });

    /**
     * Retrieves relevant context documents from the vector store for a given query
     * @param input - The user's query string
     * @returns Promise resolving to formatted context string or error message
     */
    const retrieveContext = async (input: string) => {
      try {
        if (options.verbose) {
          console.log('🔍 Retrieving context for query:', input);
        }
        const docs = await retriever.invoke(input);
        console.log('📄 Retrieved documents:', docs?.length || 0);
        if (options.verbose) {
          for (const doc of docs) {
            console.log('📄 Document:', {
              pageContent: `${doc.pageContent.substring(0, 100)}...`,
              metadata: doc.metadata,
            });
          }
        }
        if (!docs || docs.length === 0) {
          return 'No relevant context found.';
        }
        return docs.map((doc) => doc.pageContent).join('\n');
      } catch (error) {
        console.error('❌ Error retrieving context:', error);
        if (options.verbose) {
          console.error('Full error details:', error);
        }
        return 'Error retrieving context.';
      }
    };

    // Create a custom runnable that formats the prompt as ChatMessage[]
    // This chain step retrieves context and formats it into a proper message array
    const formatPromptAsMessages = new RunnablePassthrough().pipe(
      async (input: { userMessage: string; messageHistory: ChatMessage[] }) => {
        // Retrieve relevant context from vector store based on user's message
        const context = await retrieveContext(input.userMessage);
        // Build system message with retrieved context for RAG (Retrieval-Augmented Generation)
        // Emphasizes using FUSION framework knowledge from the provided context
        const systemMessage = createSystemMessage(context);

        // Build the complete message array with system message, history, and current user message
        // Order: system message (with context) -> conversation history -> current user message
        const messages: ChatMessage[] = [
          { role: 'system', content: systemMessage },
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

    const messageHistory: ChatMessage[] = [];

    /**
     * Summarizes the oldest messages in the conversation history using AI
     * This helps compress long conversation histories while preserving important context
     * @param messages - Array of messages to summarize
     * @returns Promise resolving to a summary message that can replace the original messages
     */
    const summarizeOldMessages = async (messages: ChatMessage[]): Promise<ChatMessage> => {
      // Convert messages to a text format for summarization
      const conversationText = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');

      const summaryPrompt = `Please provide a concise summary of the following conversation history. Focus on key topics, decisions, and important context that should be remembered for the ongoing conversation:

${conversationText}

Summary:`;

      try {
        // Use the chat service to generate a summary of the conversation
        const summaryResponse = await chatService.invoke([
          { role: 'user', content: summaryPrompt },
        ]);
        return {
          role: 'assistant',
          content: `[Previous conversation summary: ${summaryResponse}]`,
        };
      } catch (error) {
        console.error('❌ Error summarizing conversation:', error);
        // Fallback to a simple summary if AI summarization fails
        // This ensures the conversation can continue even if summarization fails
        return {
          role: 'assistant',
          content: `[Previous conversation summary: ${messages.length} messages about various topics]`,
        };
      }
    };

    /**
     * Manages message history with intelligent compression using AI summarization
     * Implements a two-stage compression strategy:
     * 1. When history reaches 10 messages, summarize oldest 5 messages using AI
     * 2. If history still exceeds limit after compression, remove oldest non-summary messages
     * @param history - Current message history array (will be mutated)
     * @param newMessage - New message to add to history
     * @param limit - Maximum number of messages to keep in history
     * @returns Updated message history with compression applied
     */
    const addMessageToHistory = async (
      history: ChatMessage[],
      newMessage: ChatMessage,
      limit: number,
    ): Promise<ChatMessage[]> => {
      history.push(newMessage);

      // Stage 1: AI-based compression when history reaches 10 messages
      // Summarize the oldest 5 messages and replace them with a single summary message
      // This preserves important context while reducing token usage
      let hasSummary = false;
      if (history.length >= 10) {
        if (options.verbose) {
          console.log('🔄 Compressing conversation history with AI summarization...');
        }

        // Remove oldest 5 messages and summarize them
        const oldestMessages = history.splice(0, 5);
        const summary = await summarizeOldMessages(oldestMessages);

        // Insert the summary at the beginning to maintain chronological order
        history.unshift(summary);
        hasSummary = true;

        if (options.verbose) {
          console.log(
            `📝 Compressed 5 messages into 1 summary. History now has ${history.length} messages.`,
          );
        }
      }

      // Stage 2: Hard limit enforcement if history still exceeds limit after compression
      // If we just created a summary, start removing from position 1 to preserve it
      // Otherwise, remove from position 0 as usual
      if (history.length > limit) {
        const messagesToRemove = history.length - limit;
        const startIndex = hasSummary ? 1 : 0;
        // Ensure we don't remove more messages than available (keeping summary if it exists)
        const maxRemovable = hasSummary ? history.length - 2 : history.length - 1;
        const actualRemoval = Math.min(messagesToRemove, Math.max(0, maxRemovable));

        if (actualRemoval > 0) {
          history.splice(startIndex, actualRemoval);

          if (options.verbose) {
            console.log(
              `🗑️  Removed ${actualRemoval} messages. History now has ${history.length} messages.`,
            );
          }
        }
      }

      return history;
    };

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
          messageHistory.length = 0;
          console.log('\n🧹 Conversation history cleared!\n');
          continue;
        }

        // Add user message to history (with automatic compression if needed)
        await addMessageToHistory(
          messageHistory,
          { role: 'user', content: userMessage },
          options.historyLimit || 20,
        );

        // Show typing indicator
        console.log('\n🤖 AI Response:');

        // Use LangChain runnable chain for RAG (Retrieval-Augmented Generation)
        try {
          if (options.verbose) {
            console.log('🔍 Using LangChain chain with context retrieval...');
            console.log(`📝 Message history contains ${messageHistory.length} messages`);
          }

          // Stream the response from the chain for real-time output
          const responseStream = await chain.stream({ userMessage, messageHistory });

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

          // Add AI response to history for context in future messages
          await addMessageToHistory(
            messageHistory,
            { role: 'assistant', content: fullResponse },
            options.historyLimit || 20,
          );
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
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
