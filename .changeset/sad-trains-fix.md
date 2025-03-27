---
"@equinor/fusion-framework-module-context": minor
"@equinor/fusion-framework-cli": minor
---

**@equinor/fusion-framework-react:**

- Enhanced `useAppContextNavigation` to support custom context path extraction and generation. This allows for more flexible navigation handling based on application-specific requirements.

**@equinor/fusion-framework-module-context:**

- Added support for custom context path extraction and generation in `ContextConfigBuilder`, `ContextProvider`, and `ContextModuleConfigurator`.
- Introduced `setContextPathExtractor` and `setContextPathGenerator` methods in `ContextConfigBuilder` to allow developers to define custom logic for extracting and generating context paths.
- Updated `ContextProvider` to utilize `extractContextIdFromPath` and `generatePathFromContext` from the configuration, enabling dynamic path handling.
- Enhanced `ContextModuleConfigurator` to include `extractContextIdFromPath` and `generatePathFromContext` in the module configuration.

If you are using `@equinor/fusion-framework-module-context` and need custom logic for context path handling:

1. Use `setContextPathExtractor` to define how to extract context IDs from paths.
2. Use `setContextPathGenerator` to define how to generate paths based on context items.

Example:

```typescript
builder.setContextPathExtractor((path) => {
  // Custom logic to extract context ID from path
  return path.match(/\/custom\/(.+)/)?.[1];
});

builder.setContextPathGenerator((context, path) => {
  // Custom logic to generate path from context
  return path.replace(/^(\/)?custom\/[^/]+(.*)$/, `/app/${item.id}$2`);
});
```

If your portal is generating context paths based on context items, you can now define custom logic for context path handling:

```typescript
contextProvider.currentContext$
  .pipe(
    map((context) => {
      // Custom logic to generate path from context
      const path = contextProvider.generatePathFromContext?.(
        context,
        location.pathname
      );
      return path ?? fallbackPathGenerator(context, location.pathname);
    }),
    filter(Boolean)
  )
  .subscribe((path) => history.push(path));
```
