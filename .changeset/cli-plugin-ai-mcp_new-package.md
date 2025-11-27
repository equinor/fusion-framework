---
"@equinor/fusion-framework-cli-plugin-ai-mcp": major
---

Add new MCP server plugin package for Model Context Protocol integration.

This plugin extends the Fusion Framework CLI with MCP server capabilities, enabling AI assistants to search and query Fusion Framework documentation through specialized semantic search tools.

**Features:**
- MCP protocol server implementation (stdio transport)
- Fusion Framework API reference search (TypeScript/TSDoc)
- Cookbook examples and tutorials search
- EDS component search (Storybook)
- Markdown documentation search
- Vector store integration via Azure Cognitive Search

**Quick Usage:**

1. Install the plugin:
```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-mcp
```

2. Configure in `fusion-cli.config.ts`:
```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-mcp',
  ],
}));
```

3. Start the MCP server:
```sh
# Start MCP server (uses stdio by default)
ffc ai mcp

# With verbose output
ffc ai mcp --verbose
```

4. Configure in your AI assistant (e.g., Claude Desktop):
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

The server exposes four specialized search tools: `fusion_search_markdown`, `fusion_search_api`, `fusion_search_cookbook`, and `fusion_search_eds` for semantic search across different documentation types.
