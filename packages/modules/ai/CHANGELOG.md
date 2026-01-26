# @equinor/fusion-framework-module-ai

## 2.0.1-msal-v5.0

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@7.0.7-msal-v5.0

## 2.0.0

### Major Changes

- [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633) Thanks [@odinr](https://github.com/odinr)! - Introduce new AI module for Fusion Framework providing LLM integration capabilities.

  This module provides a framework-agnostic way to integrate AI/LLM services including Azure OpenAI models, embeddings, and vector stores, enabling semantic search and AI-powered features in Fusion Framework applications.

  **Features:**

  - Language model integration (OpenAI, Azure OpenAI)
  - Text embedding services for semantic search
  - Vector store integration (Azure Cognitive Search)
  - Flexible configuration with eager and lazy initialization
  - Type-safe TypeScript interfaces and exports
  - Fluent configuration API

  **Quick Usage:**

  1. Install the module:

  ```sh
  pnpm add @equinor/fusion-framework-module-ai
  ```

  2. Configure in your Framework:

  ```typescript
  import { Framework } from "@equinor/fusion-framework";
  import { enableAI } from "@equinor/fusion-framework-module-ai";
  import { AzureOpenAIModel } from "@equinor/fusion-framework-module-ai/lib/azure/AzureOpenAIModel";
  import { AzureOpenAiEmbed } from "@equinor/fusion-framework-module-ai/lib/azure/AzureOpenAiEmbed";
  import { AzureVectorStore } from "@equinor/fusion-framework-module-ai/lib/azure/AzureVectorStore";

  const framework = new Framework({
    name: "My AI App",
    modules: [
      enableAI((config) =>
        config
          .setModel(
            "gpt-4",
            new AzureOpenAIModel({
              apiKey: process.env.AZURE_OPENAI_API_KEY!,
              modelName: "gpt-4",
            })
          )
          .setEmbedding(
            "embeddings",
            new AzureOpenAiEmbed({
              apiKey: process.env.AZURE_OPENAI_API_KEY!,
              modelName: "text-embedding-ada-002",
            })
          )
          .setVectorStore(
            "vector-db",
            new AzureVectorStore({
              endpoint: process.env.AZURE_SEARCH_ENDPOINT!,
              apiKey: process.env.AZURE_SEARCH_API_KEY!,
              indexName: "documents",
            })
          )
      ),
    ],
  });
  ```

  3. Use AI services:

  ```typescript
  const frameworkInstance = await framework.initialize();
  const aiProvider = frameworkInstance.modules.ai;

  // Get services
  const chatService = aiProvider.getService("chat", "gpt-4");
  const embeddingService = aiProvider.getService("embeddings", "embeddings");
  const searchService = aiProvider.getService("search", "vector-db");

  // Use services
  const response = await chatService.execute([
    { role: "user", content: "Hello!" },
  ]);
  const embeddings = await embeddingService.execute("text to embed");
  const results = await searchService.execute("search query");
  ```

  The module supports both eager initialization and lazy loading via factory functions for flexible service configuration.

## 1.1.0-cli-search-index.0

### Minor Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`db880d1`](https://github.com/equinor/fusion-framework/commit/db880d1fbdb62ba4667f11229d1e6c3a4cea06fc) Thanks [@odinr](https://github.com/odinr)! - Introduce new AI module for Fusion Framework providing LLM integration capabilities.

  This module provides a framework-agnostic way to integrate AI/LLM services including Azure OpenAI models, embeddings, and vector stores.

  **Features:**

  - AI module configuration and initialization
  - Azure OpenAI integration for models and embeddings
  - Vector store support for document search
  - Service abstraction for extensible AI provider support
  - Type-safe interfaces for AI operations

### Patch Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`db880d1`](https://github.com/equinor/fusion-framework/commit/db880d1fbdb62ba4667f11229d1e6c3a4cea06fc) Thanks [@odinr](https://github.com/odinr)! - preview release

- Updated dependencies [[`db880d1`](https://github.com/equinor/fusion-framework/commit/db880d1fbdb62ba4667f11229d1e6c3a4cea06fc)]:
  - @equinor/fusion-framework-module-http@7.0.6-cli-search-index.0
  - @equinor/fusion-framework-module@5.0.6-cli-search-index.0
