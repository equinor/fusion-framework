# @equinor/fusion-framework-module-ai

Fusion Framework module for integrating language models, text embeddings, and vector stores into Fusion applications. Built on [LangChain](https://js.langchain.com/) with first-class Azure OpenAI support.

## When to use this module

Use `@equinor/fusion-framework-module-ai` when your Fusion application needs to:

- Call Azure OpenAI (or other LangChain-compatible) chat / completion models
- Generate text embeddings for semantic search or similarity matching
- Index and search documents in Azure AI Search (or another vector store)
- Compose LangChain chains and RAG pipelines with Fusion-managed services

## Installation

```bash
pnpm add @equinor/fusion-framework-module-ai
```

Peer dependencies you may need depending on your use-case:

| Peer | Required when |
|---|---|
| `@langchain/openai` | Using Azure OpenAI models or embeddings |
| `@azure/search-documents` | Using Azure AI Search vector store |
| `rxjs` | Always (shared with the framework) |
| `@equinor/fusion-framework-module` | Always (module system) |
| `@equinor/fusion-framework-module-http` | Using HTTP-based service clients |

## Key concepts

| Concept | Description |
|---|---|
| **`AIConfigurator`** | Fluent builder for registering models, embeddings, and vector stores by identifier. Supports both direct instances (eager init) and factory functions (lazy init). |
| **`AIProvider`** | Runtime provider created during module initialisation. Exposes `getService(type, id)` to retrieve resolved service instances. |
| **`IModel`** | Interface for language model services — invoke with a prompt, stream responses, or bind tools. |
| **`IEmbed`** | Interface for text-embedding services — convert text to dense vectors. |
| **`IVectorStore`** | Interface for vector-store services — add, delete, and search documents by similarity. |
| **`enableAI`** | Helper that registers the AI module on a Fusion modules configurator. |

## Quick start

### 1. Enable the module

```typescript
import { enableAI } from '@equinor/fusion-framework-module-ai';
import { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/azure';

export const configure = (config) => {
  enableAI(config, (ai) => {
    ai.setModel('gpt-4', new AzureOpenAIModel({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiDeploymentName: 'gpt-4',
    }));
  });
};
```

### 2. Consume the provider

```typescript
// Inside an initialised Fusion application
const model = modules.ai.getService('chat', 'gpt-4');
const reply = await model.invoke('Summarise the quarterly report');
```

## Configuration patterns

### Eager initialisation (direct instances)

Pass ready-to-use service instances to the configurator:

```typescript
enableAI(config, (ai) => {
  ai.setModel('gpt-4', new AzureOpenAIModel({
    azureOpenAIApiKey: 'your-key',
    azureOpenAIApiDeploymentName: 'gpt-4',
  }));

  ai.setEmbedding('ada', new AzureOpenAiEmbed({
    azureOpenAIApiKey: 'your-key',
    azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
  }));

  ai.setVectorStore('docs', new AzureVectorStore(embedInstance, {
    endpoint: 'https://my-search.search.windows.net',
    key: 'admin-key',
    indexName: 'documents',
  }));
});
```

### Lazy initialisation (factory functions)

Supply a factory function when the service depends on environment variables or other modules resolved at startup:

```typescript
enableAI(config, (ai) => {
  ai.setModel('gpt-4', (args) =>
    new AzureOpenAIModel({
      azureOpenAIApiKey: args.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiDeploymentName: 'gpt-4',
    }),
  );
});
```

Factory functions receive `ConfigBuilderCallbackArgs` containing the framework configuration context, environment variables, and resolved module dependencies.

## Retrieving services at runtime

Use `AIProvider.getService(type, identifier)` to look up a registered service:

| `type` | Returns | Registered via |
|---|---|---|
| `'chat'` | `IModel` | `setModel()` |
| `'embeddings'` | `IEmbed` | `setEmbedding()` |
| `'search'` | `IVectorStore` | `setVectorStore()` |

```typescript
const model = modules.ai.getService('chat', 'gpt-4');
const embedder = modules.ai.getService('embeddings', 'ada');
const store = modules.ai.getService('search', 'docs');
```

An `Error` is thrown if no service is found for the given type and identifier.

## Azure implementations

The `@equinor/fusion-framework-module-ai/azure` entry point re-exports concrete Azure service classes:

- **`AzureOpenAIModel`** — chat / completion via Azure OpenAI (LangChain `AzureChatOpenAI`). Supports streaming, tool binding, and AD-token authentication.
- **`AzureOpenAiEmbed`** — text embeddings via Azure OpenAI (LangChain `AzureOpenAIEmbeddings`).
- **`AzureVectorStore`** — document search via Azure AI Search (LangChain `AzureAISearchVectorStore`). Supports similarity and MMR retrieval, document CRUD, and LangChain retriever creation.

## Streaming and observables

Every service exposes two invocation modes:

- `invoke(input)` — returns a single `Promise` for request-response usage.
- `invoke$(input)` — returns an RxJS `Observable` for streaming or event-driven usage.

Services also implement the LangChain `RunnableInterface`, so they can be composed into LangChain chains, pipelines, and streaming iterators.

## Error handling

| Error class | When thrown |
|---|---|
| `AIError` | Module-level failures — initialisation errors, search failures. Includes `code`, `statusCode`, and `details` fields. |
| `ServiceError` | Service-level operation failures (e.g. embedding request failed). Wraps the original provider error as `cause`. |
| `Error` | Unknown service type or identifier passed to `getService()`. |

## Entry points

| Import path | Contents |
|---|---|
| `@equinor/fusion-framework-module-ai` | Module definition, `enableAI`, `AIConfigurator`, `AIProvider`, core types |
| `@equinor/fusion-framework-module-ai/lib` | `BaseService`, `ServiceError`, service interfaces, utility functions |
| `@equinor/fusion-framework-module-ai/azure` | `AzureOpenAIModel`, `AzureOpenAiEmbed`, `AzureVectorStore`, config types |
