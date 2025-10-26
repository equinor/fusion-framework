import { createCommand, createOption } from 'commander';
import { configureFramework, type FusionFramework } from '../../../bin/framework.node.js';
import {
  enableAI,
  type IAIProvider,
  type IAIConfigurator,
} from '@equinor/fusion-framework-module-ai';
import { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/azure';
import assert from 'assert';
import inquirer from 'inquirer';
import type { ChatMessage, ChatResponse } from '@equinor/fusion-framework-module-ai/lib';
import { tap, catchError, finalize } from 'rxjs';

/**
 * CLI command: `llm chat`
 *
 * Interactive chat with Large Language Models using inquirer for a smooth CLI experience.
 *
 * Features:
 * - Interactive conversation mode with inquirer prompts
 * - Real-time streaming responses from AI models
 * - Message history and context preservation
 * - Special commands: exit, quit, clear, help
 * - Support for Azure OpenAI models
 * - Live typing effect for AI responses
 *
 * Usage:
 *   $ ffc llm chat [options]
 *
 * Options:
 *   --api-key <key>         API key for Azure OpenAI
 *   --api-version <version> API version (default: 2024-02-15-preview)
 *   --api-instance <name>   Azure OpenAI instance name
 *   --api-deployment <name> Azure OpenAI deployment name
 *   --verbose               Enable verbose output
 *
 * Environment Variables:
 *   AZURE_OPENAI_API_KEY              API key for Azure OpenAI
 *   AZURE_OPENAI_API_VERSION          API version
 *   AZURE_OPENAI_INSTANCE_NAME        Instance name
 *   AZURE_OPENAI_CHAT_DEPLOYMENT_NAME Deployment name
 *
 * Interactive Commands:
 *   exit/quit  - End the conversation
 *   clear      - Clear conversation history
 *   help       - Show available commands
 *
 * Examples:
 *   $ ffc llm chat
 *   $ ffc llm chat --api-key sk-... --api-instance my-instance --api-deployment gpt-4
 *   $ ffc llm chat --verbose
 */
export default createCommand('chat')
  .description('Interactive chat with Large Language Models')
  .addOption(
    createOption('--api-key <key>', 'API key for the model provider').env('AZURE_OPENAI_API_KEY'),
  )
  .addOption(
    createOption('--api-version <version>', 'API version')
      .env('AZURE_OPENAI_API_VERSION')
      .default('2024-02-15-preview'),
  )
  .addOption(
    createOption('--api-instance <name>', 'Azure OpenAI instance name').env(
      'AZURE_OPENAI_INSTANCE_NAME',
    ),
  )
  .addOption(
    createOption('--api-deployment <name>', 'Azure OpenAI deployment name').env(
      'AZURE_OPENAI_CHAT_DEPLOYMENT_NAME',
    ),
  )
  .action(async (options) => {
    // assert(options.apiKey, 'API key is required');
    assert(options.apiVersion, 'API version is required');
    assert(options.apiInstance, 'Instance name is required');
    assert(options.apiDeployment, 'Deployment name is required');
    
    // Configure the framework with AI module
    const configurator = configureFramework({
      auth: {
        clientId: 'dummy', // Not needed for AI module
        tenantId: 'dummy', // Not needed for AI module
      },
    });

    // Add AI module configuration
    enableAI(configurator, (aiConfig: IAIConfigurator) => {
      aiConfig.setModel(
        options.model,
        new AzureOpenAIModel({
          azureOpenAIApiKey: options.apiKey,
          azureOpenAIApiDeploymentName: options.apiDeployment,
          azureOpenAIApiInstanceName: options.apiInstance,
          azureOpenAIApiVersion: options.apiVersion,
        }),
      );
    });

    // Initialize the framework
    const framework = (await configurator.initialize()) as FusionFramework & { ai: IAIProvider };

    // Get the AI provider
    const aiProvider = framework.ai;

    if (options.verbose) {
      console.log('✅ Framework initialized successfully');
      console.log('💬 Starting interactive chat...');
      console.log('Type "exit" or "quit" to end the conversation');
      console.log('Type "clear" to clear the conversation history');
      console.log('');
    }

    // Start interactive chat
    const chatService = aiProvider.getService('chat', options.model);
    const messageHistory: ChatMessage[] = [];

    console.log('💬 Chat ready! Start typing your message...\n');

    // Interactive chat loop
    while (true) {
      try {
        const { message } = await inquirer.prompt([
          {
            type: 'input',
            name: 'message',
            message: 'You:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Please enter a message';
              }
              return true;
            },
          },
        ]);

        const userMessage = message.trim();

        // Handle special commands
        if (userMessage.toLowerCase() === 'exit' || userMessage.toLowerCase() === 'quit') {
          console.log('\n👋 Goodbye!');
          break;
        }

        if (userMessage.toLowerCase() === 'clear') {
          messageHistory.length = 0;
          console.log('\n🧹 Conversation history cleared!\n');
          continue;
        }

        if (userMessage.toLowerCase() === 'help') {
          console.log('\n📖 Available commands:');
          console.log('  exit/quit - End the conversation');
          console.log('  clear     - Clear conversation history');
          console.log('  help      - Show this help message');
          console.log('');
          continue;
        }

        // Add user message to history
        messageHistory.push({ role: 'user', content: userMessage });

        // Show typing indicator
        console.log('\n🤖 AI Response:');

        // Get streaming AI response
        let fullResponse = '';
        const responseStream = chatService.invoke$(messageHistory);
        
        await new Promise<void>((resolve, reject) => {
          responseStream
            .pipe(
              tap((chunk: ChatResponse) => {
                // Stream the content in real-time
                const content = typeof chunk.content === 'string' ? chunk.content : '';
                if (content) {
                  process.stdout.write(content);
                  fullResponse += content;
                }
              }),
              catchError((error) => {
                console.error('\n❌ Streaming error:', error);
                reject(error);
                return [];
              }),
              finalize(() => {
                console.log('\n');
                resolve();
              })
            )
            .subscribe();
        });

        // Add AI response to history
        messageHistory.push({ role: 'assistant', content: fullResponse });
        console.log('');

      } catch (error) {
        console.error('\n❌ Error during chat:', error);
        console.log('');
      }
    }
  });
