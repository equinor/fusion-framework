# @equinor/fusion-framework-cli-plugin-ai-chat

AI chat plugin for Fusion Framework CLI providing interactive chat with AI models.

> [!WARNING]
> **WORK IN PROGRESS - CRUDE VERSION FOR TESTING**
>
> This plugin is currently a work-in-progress, crude version intended for testing the search index functionality. It is not production-ready and may have bugs, incomplete features, or breaking changes.
>
> - Use at your own risk
> - API and behavior may change without notice
> - Not recommended for production use
> - Primarily for internal testing of vector store search capabilities

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-chat
```

## Configuration

After installing the plugin, create a `fusion-cli.config.ts` file in your project root:

```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-chat',
  ],
}));
```

The CLI will automatically discover and load plugins listed in this configuration file. The config file can be `.ts`, `.js`, or `.json`. The `defineFusionCli` helper provides type safety and IntelliSense support.

## Features

This plugin extends the Fusion Framework CLI with AI chat capabilities:

- **Interactive chat** with AI models
- Real-time streaming responses
- Intelligent message history compression
- Vector store context retrieval for enhanced responses

## Usage

Once installed, the chat command is automatically available:

```sh
# Interactive chat with AI models
ffc ai chat
```

## Commands

### `ai chat`

Interactive chat with Large Language Models using readline for a smooth CLI experience. Enhanced with vector store context retrieval for more accurate and relevant responses.

**Features:**
- Interactive conversation mode
- Real-time streaming responses from AI models
- Intelligent message history compression using AI summarization
- Automatic vector store context retrieval for enhanced responses
- Special commands: clear (clear conversation history)
- Support for Azure OpenAI models and Azure Cognitive Search
- Live typing effect for AI responses
- Configurable context retrieval limits

**Options:**
- `--openai-api-key <key>` - API key for Azure OpenAI
- `--openai-api-version <version>` - API version (default: 2024-02-15-preview)
- `--openai-instance <name>` - Azure OpenAI instance name
- `--openai-chat-deployment <name>` - Azure OpenAI chat deployment name (required)
- `--openai-embedding-deployment <name>` - Azure OpenAI embedding deployment name
- `--azure-search-endpoint <url>` - Azure Search endpoint URL (required)
- `--azure-search-api-key <key>` - Azure Search API key (required)
- `--azure-search-index-name <name>` - Azure Search index name (required)
- `--context-limit <number>` - Max context documents to retrieve (default: 5)
- `--history-limit <number>` - Max messages to keep in conversation history (default: 20, auto-compresses at 10)
- `--verbose` - Enable verbose output

**Environment Variables:**
All options can be provided via environment variables:
- `AZURE_OPENAI_API_KEY` - API key for Azure OpenAI
- `AZURE_OPENAI_API_VERSION` - API version
- `AZURE_OPENAI_INSTANCE_NAME` - Instance name
- `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` - Chat deployment name
- `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` - Embedding deployment name
- `AZURE_SEARCH_ENDPOINT` - Azure Search endpoint
- `AZURE_SEARCH_API_KEY` - Azure Search API key
- `AZURE_SEARCH_INDEX_NAME` - Azure Search index name

**Interactive Commands:**
- `clear` - Clear conversation history
- `Ctrl+C` - Exit immediately

**Examples:**
```sh
$ ffc ai chat
$ ffc ai chat --context-limit 10
$ ffc ai chat --history-limit 100
$ ffc ai chat --verbose --azure-search-endpoint https://my-search.search.windows.net
```

## Configuration

The plugin requires Azure OpenAI and Azure Cognitive Search configuration. See the main CLI documentation for details on setting up API keys and endpoints.

## License

ISC