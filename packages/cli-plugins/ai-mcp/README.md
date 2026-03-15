# @equinor/fusion-framework-cli-plugin-ai-mcp

CLI plugin that adds a [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server to the Fusion Framework CLI (`ffc`). AI assistants such as Claude Desktop, Cursor, VS Code Copilot, and other MCP-compatible clients can connect to the server and semantically search the Fusion Framework codebase — API reference, cookbooks, markdown docs, and EDS Storybook content — via Azure Cognitive Search.

## Who should use this

- **AI-tool authors** integrating Fusion Framework knowledge into LLM workflows
- **Developers** who want context-aware code assistance inside their editor
- **Platform teams** embedding Fusion search into custom MCP client setups

## Quick start

### 1 — Install

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-mcp
```

### 2 — Register the plugin

```ts
// fusion-cli.config.ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: ['@equinor/fusion-framework-cli-plugin-ai-mcp'],
}));
```

### 3 — Start the server

```sh
ffc ai mcp
```

The server communicates over **stdio** (the standard MCP transport). All diagnostic output is written to **stderr** so it never interferes with the protocol stream.

## CLI options

| Flag | Environment variable | Description | Required |
|------|---------------------|-------------|----------|
| `--openai-api-key` | `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `--openai-api-version` | `AZURE_OPENAI_API_VERSION` | API version (default `2024-02-15-preview`) | No |
| `--openai-instance` | `AZURE_OPENAI_INSTANCE_NAME` | Azure OpenAI instance name | Yes |
| `--openai-embedding-deployment` | `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` | Embedding deployment name | Yes |
| `--azure-search-endpoint` | `AZURE_SEARCH_ENDPOINT` | Azure Cognitive Search endpoint URL | Yes |
| `--azure-search-api-key` | `AZURE_SEARCH_API_KEY` | Azure Cognitive Search API key | Yes |
| `--azure-search-index-name` | `AZURE_SEARCH_INDEX_NAME` | Azure Cognitive Search index name | Yes |
| `--verbose` | — | Write diagnostic messages to stderr | No |

Every flag can also be set via the matching environment variable.

## MCP tools

### `fusion_search`

Unified semantic search across all Fusion Framework documentation.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | `string` | — | Natural-language search query (required) |
| `limit` | `number` | `5` | Maximum results to return (recommended 3–8) |
| `category` | `'all'` | `'all'` | Category filter (currently only `all` is exposed) |

The tool uses **Maximal Marginal Relevance (MMR)** retrieval to balance relevance and diversity, reducing near-duplicate results. Results are returned as MCP `text` content items with `_meta` containing document metadata and source links.

## Integration with AI assistants

### Claude Desktop / Cursor / VS Code Copilot

Add the server to your MCP client configuration:

```jsonc
// Example: Claude Desktop mcp config
{
  "mcpServers": {
    "fusion-framework": {
      "command": "ffc",
      "args": ["ai", "mcp"],
      "env": {
        "AZURE_OPENAI_API_KEY": "<key>",
        "AZURE_OPENAI_INSTANCE_NAME": "<instance>",
        "AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME": "<deployment>",
        "AZURE_SEARCH_ENDPOINT": "https://<service>.search.windows.net",
        "AZURE_SEARCH_API_KEY": "<search-key>",
        "AZURE_SEARCH_INDEX_NAME": "<index>"
      }
    }
  }
}
```

## Architecture

```
src/
├── index.ts               # Plugin registration entry point
├── mcp.ts                 # Commander command, MCP server bootstrap, stdio transport
├── version.ts             # Auto-generated package version
└── tools/
    ├── fusion-search.tool.ts       # Primary `fusion_search` tool (MMR retrieval)
    ├── fusion-search-api.ts        # Category: TSDoc / API reference
    ├── fusion-search-cookbook.ts    # Category: cookbooks & tutorials
    ├── fusion-search-eds.ts        # Category: EDS Storybook stories
    └── fusion-search-markdown.ts   # Category: markdown guides & READMEs
```

### Key exports

| Export | Module | Description |
|--------|--------|-------------|
| `registerAiPlugin` | `index.ts` | Registers the `ai mcp` command with the CLI |
| `command` | `mcp.ts` | Fully-configured Commander command |
| `toolConfig` / `handleTool` | `fusion-search.tool.ts` | MCP tool config and curried handler |
| `FusionSearchCategory` | `fusion-search.tool.ts` | Union type for search category filters |
| `inputSchema` | `fusion-search.tool.ts` | Zod schema for tool input validation |

## License

ISC

