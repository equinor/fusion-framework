---
"@equinor/fusion-framework-module-ai": minor
---

Add `setDefaultHeaders` to the AI module configurator. The headers are sent with every request made by the default Fusion model, embed and index strategies, which call the AI service directly rather than through the framework HTTP module.

```typescript
enableAI(config, (ai) => {
  ai.setDefaultHeaders({ 'X-Fusion-CLI-Name': 'my-tool' });
});
```

`AzureOpenAIModel` and `AzureOpenAiEmbed` accept a matching `defaultHeaders` option.

Related: https://github.com/equinor/fusion-core-tasks/issues/2207
