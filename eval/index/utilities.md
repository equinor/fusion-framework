# Utilities & Tooling

These queries cover the shared infrastructure that Fusion developers interact
with outside of application code: the CLI workflow, the Vite build plugin,
the observable state primitives, and the cross-module event system.

When judging results, verify that:
- CLI results describe **real commands** (`ffc app dev`, `ffc app build`, etc.)
  and reference the correct binary name (`fusion-framework-cli` / `ffc`). Reject
  results that invent sub-commands or confuse the Fusion CLI with generic Vite
  or Node tooling.
- Observable results distinguish the **`@equinor/fusion-observable`** utility
  package from RxJS itself. The package wraps RxJS with action-driven state
  (`FlowSubject`, `createReducer`, `createAction`) — results that only mention
  raw RxJS operators without connecting them to the Fusion abstractions are
  off-topic.
- Event results describe the **module-level event bus**
  (`@equinor/fusion-framework-module-event`), not browser DOM events. Good
  results show `addEventListener` + `dispatchEvent` on the module provider and
  mention `FrameworkEvent` as the event base class.
- Vite plugin results reference `@equinor/fusion-framework-vite-plugin-spa` and
  explain both the plugin factory (`fusionSpaPlugin`) and the template
  environment shape. Reject results that confuse build-time config with runtime
  framework init.

## How to build and develop Fusion apps with the CLI

- must mention `fusion-framework-cli` or `ffc` as the CLI binary name
- must mention `app dev` for starting a local dev server and `app build` for production bundles
- must mention `app.manifest.ts` as the application manifest configuration file
- should mention `defineAppManifest` and `defineAppConfig` from `@equinor/fusion-framework-cli/app`
- should mention `auth login` for authenticating against Azure AD before deployment

## How to manage observable state with FlowSubject and actions

- must mention `FlowSubject` from `@equinor/fusion-observable` as the core state container
- must mention `createReducer` for building Immer-powered reducers with a builder pattern
- must mention `createAction` for defining type-safe action creators
- should mention `filterAction` from `@equinor/fusion-observable/operators` for narrowing action streams
- should mention `useObservableState` from `@equinor/fusion-observable/react` for subscribing in React

## How to use the framework event bus for cross-module communication

- must mention `addEventListener` and `dispatchEvent` on the event module provider
- must mention `FrameworkEvent` as the base event class carrying `detail`, `source`, and cancel flags
- must mention `event$` observable stream for reactive event consumption
- should mention `filterEvent` operator for narrowing the `event$` stream to a single event type
- should mention declaration merging on `FrameworkEventMap` for registering custom event types

## How to configure the Vite SPA plugin for Fusion development

- must mention `fusionSpaPlugin` from `@equinor/fusion-framework-vite-plugin-spa`
- must mention `generateTemplateEnv` for providing portal ID, service discovery URL, and MSAL config
- must mention the service worker for API proxying and token injection
- should mention `FUSION_SPA_` environment variable prefix for `.env` file overrides
- should mention custom bootstrap files via `bootstrap` in `generateTemplateEnv`
