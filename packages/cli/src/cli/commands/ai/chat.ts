import { createCommand, createOption } from 'commander';
import type { ChatMessage } from '@equinor/fusion-framework-module-ai/lib';
import { from } from 'rxjs';
import { withAiOptions, type AiOptions } from '../../options/ai.js';
import { createInterface } from 'readline';

import { setupFramework } from './utils/setup-framework.js';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

/**
 * CLI command: `ai chat`
 *
 * Interactive chat with Large Language Models using inquirer for a smooth CLI experience.
 * Enhanced with vector store context retrieval for more accurate and relevant responses.
 *
 * Features:
 * - Interactive conversation mode with inquirer prompts
 * - Real-time streaming responses from AI models
 * - Intelligent message history compression using AI summarization
 * - Automatic vector store context retrieval for enhanced responses
 * - Special commands: exit, quit, clear, help
 * - Support for Azure OpenAI models and Azure Cognitive Search
 * - Live typing effect for AI responses
 * - Configurable context retrieval limits
 *
 * Usage:
 *   $ ffc ai chat [options]
 *
 * Options:
 *   --openai-api-key <key>              API key for Azure OpenAI
 *   --openai-api-version <version>       API version (default: 2024-02-15-preview)
 *   --openai-instance <name>             Azure OpenAI instance name
 *   --openai-chat-deployment <name>      Azure OpenAI chat deployment name
 *   --openai-embedding-deployment <name> Azure OpenAI embedding deployment name
 *   --azure-search-endpoint <url>        Azure Search endpoint URL
 *   --azure-search-api-key <key>        Azure Search API key
 *   --azure-search-index-name <name>     Azure Search index name
 *   --use-context                        Use vector store context (default: true)
 *   --context-limit <number>             Max context documents to retrieve (default: 5)
 *   --history-limit <number>             Max messages to keep in conversation history (default: 20, auto-compresses at 10)
 *   --verbose                            Enable verbose output
 *
 * Environment Variables:
 *   AZURE_OPENAI_API_KEY                    API key for Azure OpenAI
 *   AZURE_OPENAI_API_VERSION                API version
 *   AZURE_OPENAI_INSTANCE_NAME              Instance name
 *   AZURE_OPENAI_CHAT_DEPLOYMENT_NAME        Chat deployment name
 *   AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME   Embedding deployment name
 *   AZURE_SEARCH_ENDPOINT                    Azure Search endpoint
 *   AZURE_SEARCH_API_KEY                     Azure Search API key
 *   AZURE_SEARCH_INDEX_NAME                  Azure Search index name
 *
 * Interactive Commands:
 *   exit/quit  - End the conversation
 *   clear      - Clear conversation history
 *   help       - Show available commands
 *   Ctrl+C     - Exit immediately
 *
 * Examples:
 *   $ ffc ai chat
 *   $ ffc ai chat --context-limit 10
 *   $ ffc ai chat --history-limit 100
 *   $ ffc ai chat --verbose --azure-search-endpoint https://my-search.search.windows.net
 */
type CommandOptions = AiOptions & {
  verbose?: boolean;
  contextLimit?: number;
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
    createOption('--history-limit <number>', 'Maximum number of messages to keep in conversation history')
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
        searchType: 'similarity'
      });
    }

    const retriever = vectorStoreService.asRetriever({
      k: options.contextLimit || 5,
      searchType: 'similarity' // Use similarity search instead of MMR to avoid potential issues
    });

    const retriveContext = async (input: string) => {
      try {
        if (options.verbose) {
          console.log('🔍 Retrieving context for query:', input);
        }
        const docs = await retriever.invoke(input);
        if (options.verbose) {
          console.log('📄 Retrieved documents:', docs?.length || 0);
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
    const formatPromptAsMessages = new RunnablePassthrough().pipe(async (input: { userMessage: string; messageHistory: ChatMessage[] }) => {
      const context = await retriveContext(input.userMessage);
      const systemMessage = `You are a helpful assistant. Use the following context to provide accurate and relevant responses. If the context doesn't contain relevant information, say so clearly.
         
         Context:\n${context}`;

      // Build the complete message array with system message, history, and current user message
      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage },
        ...input.messageHistory,
        { role: 'user', content: input.userMessage }
      ];

      return messages;
    });

    // Create the chatbot chain using the model directly (BaseService now extends Runnable)
    const chain = RunnableSequence.from([
      formatPromptAsMessages,
      chatService,
      new StringOutputParser(),
    ]);

    const messageHistory: ChatMessage[] = [];

    /**
     * Summarizes the oldest messages in the conversation history
     * @param messages - Array of messages to summarize
     * @returns Promise resolving to a summary message
     */
    const summarizeOldMessages = async (messages: ChatMessage[]): Promise<ChatMessage> => {
      const conversationText = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      const summaryPrompt = `Please provide a concise summary of the following conversation history. Focus on key topics, decisions, and important context that should be remembered for the ongoing conversation:

${conversationText}

Summary:`;

      try {
        const summaryResponse = await chatService.invoke([{ role: 'user', content: summaryPrompt }]);
        return { role: 'assistant', content: `[Previous conversation summary: ${summaryResponse}]` };
      } catch (error) {
        console.error('❌ Error summarizing conversation:', error);
        // Fallback to a simple summary if AI summarization fails
        return { 
          role: 'assistant', 
          content: `[Previous conversation summary: ${messages.length} messages about various topics]` 
        };
      }
    };

    /**
     * Manages message history with intelligent compression using AI summarization
     * @param history - Current message history array
     * @param newMessage - New message to add
     * @param limit - Maximum number of messages to keep
     * @returns Updated message history
     */
    const addMessageToHistory = async (history: ChatMessage[], newMessage: ChatMessage, limit: number): Promise<ChatMessage[]> => {
      history.push(newMessage);
      
      // When we reach 10 messages, summarize the oldest 5 and replace them with the summary
      if (history.length >= 10) {
        if (options.verbose) {
          console.log('🔄 Compressing conversation history with AI summarization...');
        }
        
        const oldestMessages = history.splice(0, 5); // Remove oldest 5 messages
        const summary = await summarizeOldMessages(oldestMessages);
        
        // Insert the summary at the beginning
        history.unshift(summary);
        
        if (options.verbose) {
          console.log(`📝 Compressed 5 messages into 1 summary. History now has ${history.length} messages.`);
        }
      }
      
      // If we still exceed the limit after summarization, remove oldest messages
      if (history.length > limit) {
        const messagesToRemove = history.length - limit;
        // Remove oldest messages, but ensure we keep at least 2 for context
        const actualRemoval = Math.min(messagesToRemove, Math.max(0, history.length - 2));
        history.splice(0, actualRemoval);
      }
      
      return history;
    };

    console.log('💬 Chat ready! Start typing your message...\n');
    console.log('💡 Press Ctrl+C to exit at any time\n');

    // Create readline interface for better Ctrl+C handling
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Handle Ctrl+C gracefully
    const handleExit = () => {
      console.log('\n\n👋 Goodbye!');
      rl.close();
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    // Interactive chat loop
    while (true) {
      try {
        const userMessage = await new Promise<string>((resolve) => {
          rl.question('You: ', (answer) => {
            resolve(answer.trim());
          });
        });

        if (!userMessage) {
          console.log('Please enter a message\n');
          continue;
        }
        if (userMessage.toLowerCase() === 'clear') {
          messageHistory.length = 0;
          console.log('\n🧹 Conversation history cleared!\n');
          continue;
        }

        await addMessageToHistory(messageHistory, { role: 'user', content: userMessage }, options.historyLimit || 20);

        // Show typing indicator
        console.log('\n🤖 AI Response:');

        // Use LangChain runnable chain for RAG
        try {
          if (options.verbose) {
            console.log('🔍 Using LangChain chain with context retrieval...');
            console.log(`📝 Message history contains ${messageHistory.length} messages`);
          }

          const responseStream = await chain.stream({ userMessage, messageHistory });
          const fullResponse = await new Promise<string>((resolve, reject) => {
            let fullResponse = '';
            from(responseStream).subscribe({
              next: (chunk) => {
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
          await addMessageToHistory(messageHistory, { role: 'assistant', content: fullResponse }, options.historyLimit || 20);
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

// Export the command with AI options
export const command = withAiOptions(_command, {
  includeChat: true,
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
