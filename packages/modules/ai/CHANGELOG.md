# @equinor/fusion-framework-module-ai

## 4.0.0

### Major Changes

- ece8f42: **BREAKING:** Replace direct Azure API key configuration with Fusion service discovery and MSAL authentication.

  The AI module now uses a strategy pattern (`ModelStrategy`, `EmbedStrategy`, `IndexStrategy`) configured via `addStrategy()` on the `AiConfigurator`. The provider exposes `useModel()`, `useEmbed()`, and `useIndex()` methods that resolve strategies by deployment name.

  A new `FusionSearchClient` handles OData path rewriting for the Fusion AI proxy, and factory functions `createFusionAiModelStrategy`, `createFusionAiEmbedStrategy`, and `createFusionAiIndexStrategy` simplify strategy creation with automatic token acquisition and service endpoint resolution.

  ```typescript
  // Before
  configurator.setModel("chat", new AzureOpenAIModel({ apiKey, endpoint }));
  const model = provider.getService("chat", "my-model");

  // After — default Fusion strategies are registered automatically
  const model = provider.useModel("gpt-5.1-chat");
  ```

  Closes: https://github.com/equinor/fusion-framework/issues/1008

### Minor Changes

- ece8f42: Add `schemaFields` to `VectorStoreDocumentMetadata` and direct-write path in `AzureVectorStore`.

  When documents carry `metadata.schemaFields`, the Azure vector store bypasses LangChain's hardcoded document shape and writes promoted fields as top-level Azure Search properties via the search client. Reserved field names (`id`, `content`, `content_vector`, `metadata`) are automatically stripped to prevent collisions. Mixed embedding batches (partially pre-computed) are handled efficiently by only computing embeddings for documents that lack them.

  ref: equinor/fusion-core-tasks#1011

## 3.0.1

### Patch Changes

- 4f71408: Internal: Bump LangChain ecosystem dependencies (`langchain`, `@langchain/core`, `@langchain/community`, `@langchain/textsplitters`).
- ee9c669: Patched transitive security vulnerabilities in LangChain dependency tree:
  - `handlebars` → 4.7.9 (JS injection via AST type confusion — critical)
  - `langsmith` → 0.5.21 (prototype pollution, streaming bypass)
  - `lodash` → 4.18.1 (code injection via `_.template`)
  - `yaml` → 2.8.3 (stack overflow via deeply nested collections)

## 3.0.0

### Major Changes

- abffa53: Major version bump for Fusion Framework React 19 release.

  All packages are bumped to the next major version as part of the React 19 upgrade. This release drops support for React versions below 18 and includes breaking changes across the framework.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React Router upgraded from v6 to v7
  - Navigation module refactored with new history API
  - `renderComponent` and `renderApp` now use `createRoot` API

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading
  - Replace `NavigationProvider.createRouter()` with `@equinor/fusion-framework-react-router`
  - See individual package changelogs for package-specific migration steps

### Patch Changes

- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
  - @equinor/fusion-framework-module@6.0.0
  - @equinor/fusion-framework-module-http@8.0.0

## 2.0.2

### Patch Changes

- [#4157](https://github.com/equinor/fusion-framework/pull/4157) [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581) Thanks [@Noggling](https://github.com/Noggling)! - Internal: patch release to align TypeScript types across packages for consistent type compatibility.

- Updated dependencies [[`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581)]:
  - @equinor/fusion-framework-module-http@7.0.8
  - @equinor/fusion-framework-module@5.0.6

## 2.0.1

### Patch Changes

- [#3960](https://github.com/equinor/fusion-framework/pull/3960) [`2eb7f69`](https://github.com/equinor/fusion-framework/commit/2eb7f6932f6becf965f7773ef065a0ee9f0b80bc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: Updated LangChain dependencies to v1.x (@langchain/community 0.3.59→1.1.8, @langchain/core 1.1.16→1.1.17, langchain 1.2.11→1.2.14) - compatibility update with security fixes

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
            }),
          )
          .setEmbedding(
            "embeddings",
            new AzureOpenAiEmbed({
              apiKey: process.env.AZURE_OPENAI_API_KEY!,
              modelName: "text-embedding-ada-002",
            }),
          )
          .setVectorStore(
            "vector-db",
            new AzureVectorStore({
              endpoint: process.env.AZURE_SEARCH_ENDPOINT!,
              apiKey: process.env.AZURE_SEARCH_API_KEY!,
              indexName: "documents",
            }),
          ),
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
