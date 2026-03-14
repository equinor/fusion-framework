# Widget

These queries cover `@equinor/fusion-framework-widget` (widget authoring) and
`@equinor/fusion-framework-module-widget` (widget hosting) — the two packages
that let developers build self-contained UI micro-frontends and load them
dynamically into host applications.

When judging results, verify that:
- Widget **authoring** helpers (`configureWidgetModules`, `WidgetConfigurator`)
  are attributed to `@equinor/fusion-framework-widget`, not the hosting module.
- Widget **hosting** APIs (`enableWidgetModule`, `getWidget`, `initialize`) are
  attributed to `@equinor/fusion-framework-module-widget`.
- The lifecycle sequence (create → load manifest → import script → initialize →
  render → dispose) is described as an observable pipeline, not a simple
  promise chain.
- Results do not confuse widgets with full Fusion apps
  (`@equinor/fusion-framework-react-app`).

## How to build a Fusion widget with configureWidgetModules

- must mention `configureWidgetModules` from `@equinor/fusion-framework-widget` as the main factory
- must show the configuration callback receiving `(configurator, { env })` with `WidgetEnv`
- must mention that core modules (event, HTTP, MSAL auth) are pre-registered automatically
- should mention `configureMsal` and `configureHttpClient` helpers on the widget configurator
- should mention `useFrameworkServiceClient` for service-discovery HTTP clients
- should mention `WidgetModuleInitiator` as the callback type

## How to load and render widgets in a host application

- must mention `enableWidgetModule` from `@equinor/fusion-framework-module-widget` for module registration
- must mention `getWidget(name)` on `WidgetModuleProvider` for creating a widget instance
- must mention `initialize()` returning an Observable of `{ manifest, script, config }`
- must show `renderWidget` from the imported script module for mounting into a DOM element
- should mention `getWidgetManifest` and `getWidgetConfig` for streaming individual parts
- should mention `dispose()` for cleaning up widget subscriptions

## How to handle widget lifecycle events

- must mention `onWidgetInitialized` and `onWidgetScriptLoaded` events on the framework event bus
- must mention `onWidgetManifestLoaded` for manifest fetch completion
- must mention the failure event variants (`onWidgetInitializeFailure`, `onWidgetScriptFailure`, `onWidgetManifestFailure`)
- should mention typed error classes `WidgetManifestLoadError`, `WidgetScriptModuleError` from `/errors.js`
- should mention error `type` discriminator (`not_found`, `unauthorized`, `unknown`) for programmatic branching

## How widgets differ from full Fusion apps

- must mention `@equinor/fusion-framework-widget` for widgets vs `@equinor/fusion-framework-react-app` for apps
- must explain that widgets pre-register event, HTTP, and MSAL modules while apps configure modules explicitly
- must mention that widgets are loaded at runtime by a host via `enableWidgetModule` while apps bootstrap independently
- should mention `WidgetEnv` containing manifest and props from the host
- should mention that widgets expose `renderWidget` or `render` as their script entry point
