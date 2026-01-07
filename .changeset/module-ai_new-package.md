---
"@equinor/fusion-framework-module-ai": major
---

Introduce new AI module for Fusion Framework providing LLM integration capabilities.

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
import { Framework } from '@equinor/fusion-framework';
import { enableAI } from '@equinor/fusion-framework-module-ai';
import { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/lib/azure/AzureOpenAIModel';
import { AzureOpenAiEmbed } from '@equinor/fusion-framework-module-ai/lib/azure/AzureOpenAiEmbed';
import { AzureVectorStore } from '@equinor/fusion-framework-module-ai/lib/azure/AzureVectorStore';

const framework = new Framework({
  name: 'My AI App',
  modules: [
    enableAI(config => 
      config
        .setModel('gpt-4', new AzureOpenAIModel({
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          modelName: 'gpt-4'
        }))
        .setEmbedding('embeddings', new AzureOpenAiEmbed({
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          modelName: 'text-embedding-ada-002'
        }))
        .setVectorStore('vector-db', new AzureVectorStore({
          endpoint: process.env.AZURE_SEARCH_ENDPOINT!,
          apiKey: process.env.AZURE_SEARCH_API_KEY!,
          indexName: 'documents'
        }))
    )
  ]
});
```

3. Use AI services:
```typescript
const frameworkInstance = await framework.initialize();
const aiProvider = frameworkInstance.modules.ai;

// Get services
const chatService = aiProvider.getService('chat', 'gpt-4');
const embeddingService = aiProvider.getService('embeddings', 'embeddings');
const searchService = aiProvider.getService('search', 'vector-db');

// Use services
const response = await chatService.execute([
  { role: 'user', content: 'Hello!' }
]);
const embeddings = await embeddingService.execute('text to embed');
const results = await searchService.execute('search query');
```

The module supports both eager initialization and lazy loading via factory functions for flexible service configuration.
