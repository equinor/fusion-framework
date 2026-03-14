# React App

Ensure results reference `@equinor/fusion-framework-react-app` and its sub-path entry-points.
Verify that hooks, configuration helpers, and sub-path imports are real exports from this package.
Reject results that confuse portal-level framework APIs with app-level hooks.

## How to bootstrap a Fusion React application with renderApp

- must mention `renderApp` from `@equinor/fusion-framework-react-app` for one-line bootstrap
- must show an `AppModuleInitiator` configure callback for setting up modules
- must mention `useAppModule(key)` for type-safe module access from React components
- should mention `makeComponent` for lazy initialization wrapping
- should mention `useAppEnvironmentVariables` for accessing app config at runtime

## How to use MSAL authentication hooks in a Fusion app

- must mention `useCurrentAccount` from `@equinor/fusion-framework-react-app/msal` for getting the signed-in user
- must mention `useAccessToken` from the `/msal` sub-path for acquiring scoped tokens
- must mention that the MSAL module is configured by the host portal, not the app
- should mention `useToken` as a lower-level token hook
- should mention `@equinor/fusion-framework-module-msal` as the required dependency

## How to make HTTP requests from a Fusion React app

- must mention `useHttpClient` from `@equinor/fusion-framework-react-app/http`
- must show configuring a named HTTP client via `configurator.http.configureClient`
- must mention `baseUri` and `defaultScopes` as client configuration options
- should mention `fetchAsync` for promise-based requests
- should mention `fetch$` for observable-based streaming

## How to read and set context in a Fusion app

- must mention `useCurrentContext` from `@equinor/fusion-framework-react-app/context`
- must show how `useCurrentContext` returns the currently selected context object
- should mention `useContextProvider` for advanced context operations
- should mention `useFrameworkCurrentContext` for framework-level context access

## How to use feature flags and bookmarks in a Fusion app

- must mention `enableFeatureFlag` from `@equinor/fusion-framework-react-app/feature-flag` for registering flags
- must mention `useFeature` for reading and toggling a single feature flag
- must mention `useCurrentBookmark` from `@equinor/fusion-framework-react-app/bookmark`
- should mention `enableBookmark` for registering the bookmark module
- should mention `useAppSetting` from `/settings` for persistent key-value app settings
