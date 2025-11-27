# @equinor/fusion-framework-cli-plugin-ai-mcp

MCP server plugin for Fusion Framework CLI providing Model Context Protocol server capabilities for AI assistants.

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-mcp
```

## Configuration

After installing the plugin, create a `fusion-cli.config.ts` file in your project root:

```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-mcp',
  ],
}));
```

The CLI will automatically discover and load plugins listed in this configuration file. The config file can be `.ts`, `.js`, or `.json`. The `defineFusionCli` helper provides type safety and IntelliSense support.

## Features

This plugin extends the Fusion Framework CLI with MCP server capabilities:

- **MCP Protocol Server** - Implements the Model Context Protocol for AI assistant integration
- **Fusion Framework Tools** - Exposes tools for searching and querying the Fusion Framework codebase
- **Vector Store Integration** - Uses Azure Cognitive Search for semantic code search
- **Framework Information** - Provides tools to query framework configuration and capabilities

## Usage

Once installed, the MCP server command is automatically available:

```sh
# Start the MCP server (uses stdio by default)
ffc ai mcp
```

## Commands

### `ai mcp`

Starts a Model Context Protocol (MCP) server that provides tools and resources for AI assistants to interact with the Fusion Framework.

**Features:**
- Implements MCP protocol over stdio (standard for MCP servers)
- Exposes tools for semantic search of Fusion Framework codebase
- Provides framework information and configuration details
- Integrates with Azure Cognitive Search for vector-based code search

**Options:**
- `--openai-api-key <key>` - API key for Azure OpenAI (required)
- `--openai-api-version <version>` - API version (default: 2024-02-15-preview)
- `--openai-instance <name>` - Azure OpenAI instance name (required)
- `--openai-embedding-deployment <name>` - Azure OpenAI embedding deployment name (required for search)
- `--azure-search-endpoint <url>` - Azure Search endpoint URL (required for search)
- `--azure-search-api-key <key>` - Azure Search API key (required for search)
- `--azure-search-index-name <name>` - Azure Search index name (required for search)
- `--verbose` - Enable verbose output

**Examples:**
```sh
$ ffc ai mcp
$ ffc ai mcp --verbose
$ ffc ai mcp --azure-search-endpoint https://my-search.search.windows.net
```

## MCP Tools

The server exposes the following tools:

### `fusion_search`

Search the Fusion Framework codebase and documentation using semantic search.

**Parameters:**
- `query` (string, required) - The search query to find relevant code or documentation
- `limit` (number, optional) - Maximum number of results to return (default: 5)

**Returns:**
- JSON object with search results including content and metadata

### `fusion_info`

Get information about the Fusion Framework instance and available modules.

**Parameters:**
- None

**Returns:**
- JSON object with framework version, module status, and service configuration

## Integration with AI Assistants

To use this MCP server with an AI assistant (like Claude Desktop, Cursor, etc.), configure the MCP server in your AI client's configuration file.

**Example configuration for Claude Desktop:**

```json
{
  "mcpServers": {
    "fusion-framework": {
      "command": "ffc",
      "args": ["ai", "mcp"],
      "env": {
        "AZURE_OPENAI_API_KEY": "your-api-key",
        "AZURE_OPENAI_INSTANCE_NAME": "your-instance",
        "AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME": "your-embedding-deployment",
        "AZURE_SEARCH_ENDPOINT": "https://your-search.search.windows.net",
        "AZURE_SEARCH_API_KEY": "your-search-key",
        "AZURE_SEARCH_INDEX_NAME": "your-index-name"
      }
    }
  }
}
```

## Configuration

The plugin requires Azure OpenAI and Azure Cognitive Search configuration for full functionality. See the main CLI documentation for details on setting up API keys and endpoints.

## License

ISC

