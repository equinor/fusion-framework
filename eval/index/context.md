# Context

Ensure results reference `@equinor/fusion-framework-module-context` or its subpath exports (`/utils`, `/errors.js`).
Verify that builder methods, provider methods, event names, and hook signatures match real exports.
Reject results that confuse the Fusion context module with React's built-in `useContext` or other unrelated context APIs.

## How to enable and configure the context module

- must mention `enableContext` from `@equinor/fusion-framework-module-context`
- must show `ContextConfigBuilder` with `setContextType` for restricting accepted context types
- must show the builder callback pattern: `enableContext(configurator, (builder) => { ... })`
- should mention `setContextFilter` for post-query filtering of results
- should mention `setContextParameterFn` for custom search API parameter mapping
- should mention `setValidateContext` for custom validation logic

## How to set and read the active context

- must show `currentContext$` observable for subscribing to context changes
- must mention `setCurrentContextAsync` for setting context by item
- must mention `clearCurrentContext` for removing the active context
- should mention `setCurrentContextByIdAsync` for setting context by ID string
- should mention `queryContextAsync` for searching available context items

## How to configure context resolution and validation

- must mention `setResolveContext` builder method for custom context resolution
- must explain that resolution triggers when a context item's type is not in the configured types
- must show `setValidateContext` receiving a function where `this` is the provider
- should mention `onSetContextResolve` and `onSetContextResolved` events
- should mention `onSetContextValidationFailed` and `onSetContextResolveFailed` events

## How to resolve initial context from URL

- must mention `resolveInitialContext` from `@equinor/fusion-framework-module-context/utils`
- must mention `extractContextIdFromPath` for extracting a GUID from the URL path
- must mention `setResolveInitialContext` builder method for overriding the default resolver
- should mention `resolveContextFromPath` for creating a resolver function
- should mention `setContextPathExtractor` and `setContextPathGenerator` for URL ↔ context mapping

## How to sync context between portal and app

- must mention `connectParentContext` builder method
- must explain bi-directional synchronization between parent portal and child app
- must mention `onParentContextChanged` event for intercepting parent changes
- should note `connectParentContext(false)` to opt out of parent sync
- should mention `setContextClient` for providing a fully custom get/query/related client

## How to use context React hooks

- must mention `useCurrentContext` from `@equinor/fusion-framework-react-app/context`
- must show the hook returning `{ currentContext, setCurrentContext }`
- must mention `useModuleCurrentContext` from `@equinor/fusion-framework-react-module-context`
- should mention `useQueryContext` returning `{ value, querying, query }` with default 500ms debounce
- should mention `useModuleQueryContext` variant
- should mention `useFrameworkCurrentContext` for accessing the portal-level context from within an app

## How to handle context events and errors

- must mention `onCurrentContextChange` (cancelable, before) and `onCurrentContextChanged` (after) events
- must show the event detail containing `previous` and `next` context values
- must mention `FusionContextSearchError` from `@equinor/fusion-framework-module-context/errors.js`
- should mention events are dispatched through `@equinor/fusion-framework-module-event`
- should mention `onSetContextResolve`, `onSetContextResolved`, `onSetContextValidationFailed`, `onSetContextResolveFailed`
