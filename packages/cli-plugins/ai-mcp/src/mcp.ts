import { createCommand, createOption } from 'commander';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import {
  type AiOptions,
  withOptions as withAiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import {
  toolDefinition as markdownTool,
  handleTool as handleMarkdownTool,
} from './tools/fusion-search-markdown.js';
import {
  toolDefinition as apiTool,
  handleTool as handleApiTool,
} from './tools/fusion-search-api.js';
import {
  toolDefinition as cookbookTool,
  handleTool as handleCookbookTool,
} from './tools/fusion-search-cookbook.js';
import {
  toolDefinition as edsTool,
  handleTool as handleEdsTool,
} from './tools/fusion-search-eds.js';

/**
 * CLI command: `ai mcp`
 *
 * Starts a Model Context Protocol (MCP) server that provides tools and resources
 * for AI assistants to interact with the Fusion Framework.
 *
 * The MCP server exposes:
 * - Tools for querying and searching the Fusion Framework codebase:
 *   - fusion_search_markdown: Search markdown documentation
 *   - fusion_search_api: Search API reference (TypeScript/TSDoc)
 *   - fusion_search_cookbook: Search cookbook examples and tutorials
 *   - fusion_search_eds: Search EDS components from Storybook
 * - Resources for accessing framework documentation and context
 * - Capabilities for AI assistants to understand and work with Fusion Framework
 *
 * Usage:
 *   $ ffc ai mcp [options]
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
 * Examples:
 *   $ ffc ai mcp
 *   $ ffc ai mcp --verbose
 *   $ ffc ai mcp --azure-search-endpoint https://my-search.search.windows.net
 */
type CommandOptions = AiOptions & {
  /** Enable verbose output for debugging */
  verbose?: boolean;
};

const _command = createCommand('mcp')
  .description('Start a Model Context Protocol (MCP) server for Fusion Framework')
  .addOption(createOption('--verbose', 'Enable verbose output').default(false))
  .action(async (options: CommandOptions) => {
    if (options.verbose) {
      console.error('🚀 Starting MCP server for Fusion Framework...');
    }

    // Initialize the framework
    const framework = await setupFramework(options);

    if (options.verbose) {
      console.error('✅ Framework initialized successfully');
    }

    // Create MCP server instance
    const server = new Server(
      {
        name: 'fusion-framework-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    // Register tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];

      // Add search tools if vector store is configured
      if (options.azureSearchIndexName && framework.ai) {
        tools.push(markdownTool);
        tools.push(apiTool);
        tools.push(cookbookTool);
        tools.push(edsTool);
      }

      return {
        tools,
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'fusion_search_markdown':
            return await handleMarkdownTool(args || {}, framework, options);

          case 'fusion_search_api':
            return await handleApiTool(args || {}, framework, options);

          case 'fusion_search_cookbook':
            return await handleCookbookTool(args || {}, framework, options);

          case 'fusion_search_eds':
            return await handleEdsTool(args || {}, framework, options);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (options.verbose) {
          console.error(`❌ Error executing tool ${name}:`, errorMessage);
        }
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Start the server using stdio transport (standard for MCP)
    const transport = new StdioServerTransport();
    await server.connect(transport);

    if (options.verbose) {
      console.error('✅ MCP server started and ready');
      console.error('📡 Listening on stdio for MCP protocol messages');
    }

    // Keep the process alive
    process.on('SIGINT', async () => {
      if (options.verbose) {
        console.error('\n🛑 Shutting down MCP server...');
      }
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      if (options.verbose) {
        console.error('\n🛑 Shutting down MCP server...');
      }
      await server.close();
      process.exit(0);
    });
  });

// Export the command with AI options
// Note: Search tools require embedding deployment, so we include it
export const command = withAiOptions(_command, {
  includeChat: false,
  includeEmbedding: true,
  includeSearch: true,
});

export default command;
