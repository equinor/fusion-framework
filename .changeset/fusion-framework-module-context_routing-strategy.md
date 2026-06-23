---
"@equinor/fusion-framework-module-context": patch
---

Move URL-based initial context resolution to the context-navigation plugin.

The context module's `resolveInitialContext` no longer resolves context from the URL path — that responsibility has been moved to `@equinor/fusion-framework-plugin-context-navigation` at the portal level. This decouples URL concerns from the context module.

**Changes:**

- `resolveInitialContext` no longer accepts the `options` parameter with path resolution config.
- URL-based initial context resolution is now handled by the context-navigation plugin.
- Added `version` property to `IContextProvider` interface (non-breaking).
- Improved TypeScript comment directives (`@ts-ignore` → `@ts-expect-error`).

**Migration:** Apps do not need to change their code. Portal hosts should enable the `@equinor/fusion-framework-plugin-context-navigation` plugin to restore URL-based context resolution behavior.
