---
"@equinor/fusion-framework-module-ai": major
---

**BREAKING:** Replace direct Azure API key configuration with Fusion service discovery and MSAL authentication.

The AI module now uses a strategy pattern (`ModelStrategy`, `EmbedStrategy`, `IndexStrategy`) configured via `addStrategy()` on the `AiConfigurator`. The provider exposes `useModel()`, `useEmbed()`, and `useIndex()` methods that resolve strategies by deployment name.

A new `FusionSearchClient` handles OData path rewriting for the Fusion AI proxy, and factory functions `createFusionAiModelStrategy`, `createFusionAiEmbedStrategy`, and `createFusionAiIndexStrategy` simplify strategy creation with automatic token acquisition and service endpoint resolution.

```typescript
// Before
configurator.setModel('chat', new AzureOpenAIModel({ apiKey, endpoint }));
const model = provider.getService('chat', 'my-model');

// After — default Fusion strategies are registered automatically
const model = provider.useModel('gpt-5.1-chat');
```

Closes: https://github.com/equinor/fusion-framework/issues/1008
