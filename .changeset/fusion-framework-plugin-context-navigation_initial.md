---
"@equinor/fusion-framework-plugin-context-navigation": minor
---

Initial release of the context navigation plugin.

Adapter-based, event-driven plugin that reconciles context selection with the browser URL for portal hosts. Ships with built-in adapters for query-param, path-segment, and custom URL shapes, plus two pre-wired source strategies:

- **app-first** — app sets context, the plugin encodes it to the URL.
- **context-first** — the plugin decodes context from the URL on startup, redirects to a configurable null-context URL when no context is resolvable.

```ts
import { enableContextNavigation } from '@equinor/fusion-framework-plugin-context-navigation';
import { createAppFirstSource } from '@equinor/fusion-framework-plugin-context-navigation/sources';

enableContextNavigation(configurator, (builder) => {
  builder.setSourceFactory(createAppFirstSource());
});
```