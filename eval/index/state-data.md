# State & Data

Ensure results reference `@equinor/fusion-observable`, `@equinor/fusion-query`, `@equinor/fusion-framework-module-context`, or `@equinor/fusion-framework-module-feature-flag` packages.
Verify that returned symbols, operators, and configuration helpers are real exports from these packages.
Reject results that confuse framework-level context with React component context or mix up query cache vs HTTP cache.

## How to manage observable state with FlowSubject

- must mention `FlowSubject` from `@equinor/fusion-observable` as the core state container
- must show `createReducer` with builder pattern using `addCase` for action handling
- must show `createAction` for type-safe action creators
- should mention `createAsyncAction` for actions with request/success/failure lifecycle
- should mention Immer-powered draft mutations inside reducer cases
- should show `useObservableState` from `@equinor/fusion-observable/react` for subscribing in React

## How to select and change the active context

- must mention `enableContext` from `@equinor/fusion-framework-module-context`
- must show `currentContext$` observable for subscribing to context changes
- must mention `setCurrentContextAsync` for changing the active context
- must mention `queryContextAsync` for searching available context items
- should mention `clearCurrentContext` method
- should mention `resolveInitialContext` utility for resolving context from URL path
- should mention `connectParentContext` for syncing context between portal and app

## How to fetch and cache data with Query

- must mention `Query` class from `@equinor/fusion-query`
- must show the `client` option with a `fn` property for the async fetch function
- must show the `key` function for generating cache keys
- must mention `expire` option for cache TTL in milliseconds
- should show `query()` method returning an Observable of results
- should mention `queryAsync()` for promise-based usage
- should mention queue strategies: `switch` (default), `merge`, `concat`

## How to invalidate and mutate query cache

- must mention `invalidate()` method on Query instance
- must show calling `invalidate()` with no arguments to clear entire cache
- must mention `mutate()` for optimistic updates
- should mention the undo function returned by `mutate()`
- should mention `event$` observable for cache events like `query_cache_hit` and `query_cache_miss`

## How to manage feature flags

- must mention `enableFeatureFlagging` from `@equinor/fusion-framework-module-feature-flag`
- must show `features$` observable for subscribing to flag changes
- must mention `toggleFeature` and `getFeature` methods on the provider
- should mention plugin system with `addPlugin` on the configurator
- should reference built-in plugins: `createLocalStoragePlugin`, `createUrlPlugin`, `createApiPlugin`
- should mention `FeatureFlagPlugin` interface with `initial()` and `connect()` methods
