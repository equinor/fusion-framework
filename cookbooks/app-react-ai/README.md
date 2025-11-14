# AI Module Cookbook

Basic cookbook for demonstrating the AI module in Fusion Framework.

## Environment Variables

Create a `.env` file in this directory with the following variables:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name

# OpenAI Configuration (alternative to Azure)
OPENAI_API_KEY=your-openai-api-key-here

# Azure Search Configuration (optional, for vector search)
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_API_KEY=your-search-api-key
AZURE_SEARCH_INDEX_NAME=your-index-name
```

> **Note:** The `.env` file is loaded automatically by the CLI. Make sure not to commit it to version control.

## Running

```bash
pnpm dev
```

## Building

```bash
pnpm build
```

## Features

- Basic AI module integration
- Uses environment variables from `.env` file
- Environment variables are available in both `app.config.ts` and `config.ts`
