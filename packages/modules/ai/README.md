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
| `@equinor/fusion-framework-module-msal` | Always (MSAL auth for Fusion services) |
| `@equinor/fusion-framework-module-service-discovery` | Always (resolves AI service endpoint) |

## Key concepts

| Concept | Description |
|---|---|
| **`AiConfigurator`** | Fluent builder that registers `Strategy` implementations. Defaults to three Fusion-backed strategies (model, embed, index). |
| **`AiProvider`** | Runtime provider created during module initialisation. Exposes `useModel`, `useEmbed`, and `useIndex` factory methods. |
| **`Strategy`** | A named, typed factory for one of the three capability types (`model`, `embed`, `index`). |
| **`IModel`** | Interface for language model services — invoke with a prompt, stream responses, or bind tools. |
| **`IEmbed`** | Interface for text-embedding services — convert text to dense vectors. |
| **`IVectorStore`** | Interface for vector-store services — add, delete, and search documents by similarity. |
| **`enableAI`** | Helper that registers the AI module on a Fusion modules configurator. |

## Quick start

### 1. Enable the module

```typescript
import { enableAI } from '@equinor/fusion-framework-module-ai';

export const configure = (config) => {
  // The module resolves the AI service endpoint and credentials automatically
  // from Fusion service discovery and the MSAL auth module.
  enableAI(config);
};
```

### 2. Consume the provider

```typescript
// Inside an initialised Fusion application — all three factories create a
// fresh client bound to the Fusion AI service endpoint.
const model = modules.ai.useModel('gpt-4.1');
const reply = await model.invoke('Summarise the quarterly report');

const embedder = modules.ai.useEmbed('text-embedding-3-large');
const vector = await embedder.embedQuery('Fusion Framework documentation');

const index = modules.ai.useIndex('my-index');
const hits = await index.invoke('module initialisation patterns');
```

## Provider API

| Method | Returns | Default |
|---|---|---|
| `useModel(model?)` | `IModel` | `'gpt-5.1-chat'` |
| `useEmbed(model?)` | `IEmbed` | `'text-embedding-3-large'` |
| `useIndex(indexName, opts?)` | `IVectorStore` | Uses the default embed strategy |

Each factory creates a new client instance bound to the same Fusion AI service endpoint. Cherry-pick a different strategy by passing `{ strategy: strategyName }` as options.

## Strategies

The `AiConfigurator` ships with three default strategies, each backed by Fusion service discovery and MSAL auth:

| Strategy name | Type | Factory |
|---|---|---|
| `'fusion-ai-model-strategy'` | `model` | `createFusionAiModelStrategy` |
| `'fusion-ai-embed-strategy'` | `embed` | `createFusionAiEmbedStrategy` |
| `'fusion-ai-index-strategy'` | `index` | `createFusionAiIndexStrategy` |

Register additional strategies with `addStrategy`:

```typescript
import { enableAI } from '@equinor/fusion-framework-module-ai';

enableAI(config, (ai) => {
  // Add a custom strategy under a different name.
  ai.addStrategy({
    name: 'my-fine-tuned-model',
    type: 'model',
    createModel: (model) => new AzureOpenAIModel({ ... }),
  });
});

// Select it by name at runtime:
const model = modules.ai.useModel('gpt-4', { strategy: 'my-fine-tuned-model' });
```

## Azure implementations

The `@equinor/fusion-framework-module-ai/azure` entry point re-exports concrete Azure service classes:

- **`AzureOpenAIModel`** — chat / completion via Azure OpenAI (LangChain `AzureChatOpenAI`). Supports streaming, tool binding, and AD-token authentication.
- **`AzureOpenAiEmbed`** — text embeddings via Azure OpenAI (LangChain `AzureOpenAIEmbeddings`).
- **`AzureVectorStore`** — document search via Azure AI Search (LangChain `AzureAISearchVectorStore`). Supports similarity and MMR retrieval, document CRUD, and LangChain retriever creation.
- **`FusionSearchClient`** — `SearchClient` subclass pre-wired with the Fusion AI proxy path-rewrite policy.

## Streaming and observables

Every service exposes two invocation modes:

- `invoke(input)` — returns a single `Promise` for request-response usage.
- `invoke$(input)` — returns an RxJS `Observable` for streaming or event-driven usage.

Services also implement the LangChain `RunnableInterface`, so they can be composed into LangChain chains, pipelines, and streaming iterators (`for await...of`).

## Error handling

| Error class | When thrown |
|---|---|
| `AIError` | Module-level failures — initialisation errors, search failures. Includes `code`, `statusCode`, and `details` fields. |
| `ServiceError` | Service-level operation failures (e.g. embedding request failed). Wraps the original provider error as `cause`. |
| `Error` | Strategy not found for the requested name and type. |

## Entry points

| Import path | Contents |
|---|---|
| `@equinor/fusion-framework-module-ai` | Module definition, `enableAI`, `AiConfigurator`, `AiProvider`, core types |
| `@equinor/fusion-framework-module-ai/lib` | `BaseService`, `ServiceError`, service interfaces, utility functions |
| `@equinor/fusion-framework-module-ai/azure` | `AzureOpenAIModel`, `AzureOpenAiEmbed`, `AzureVectorStore`, `FusionSearchClient`, config types |
