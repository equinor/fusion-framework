---
"@equinor/fusion-framework-module-context-navigation-handler": minor
---

Initial release of the context-navigation-handler module.

Adapter-based, event-driven module that reconciles context selection with the browser URL for portal hosts. Ships with built-in adapters for query-param, path-segment, and custom URL shapes, plus two pre-wired source strategies:

- **app-first** — app sets context, module encodes it to the URL.
- **context-first** — module decodes context from URL on startup, redirects to a configurable null-context URL when no context is resolvable.

```ts
import { enableContextNavigationHandler } from '@equinor/fusion-framework-module-context-navigation-handler';

enableContextNavigationHandler(configurator, (builder) => {
  builder.setSource(createAppFirstSource());
});
```
