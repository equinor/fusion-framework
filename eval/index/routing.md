# Routing

These queries cover the `@equinor/fusion-framework-react-router` package which
wraps React Router v7 with Fusion-specific behaviour: navigation module wiring,
typed `fusion` context injection, file-style route DSL, and route schema
generation for manifests.

When judging results, verify that:
- Route DSL helpers (`layout`, `route`, `index`, `prefix`) are attributed to
  `@equinor/fusion-framework-react-router/routes`, not generic React Router.
- The `fusion` argument in loaders and actions is the **Fusion-injected context**
  (`FusionRouterContext`) containing `modules` and `context` — not a standard
  React Router feature.
- Schema generation (`handle.route`, `toRouteSchema`) and Vite plugin
  (`fusionRouterPlugin`) are distinguished as separate concerns — one is runtime
  metadata, the other is build-time transformation.
- Results do not confuse this package with the navigation module
  (`@equinor/fusion-framework-module-navigation`) which handles history and
  programmatic navigation at the framework level.

## How to set up client-side routing in a Fusion app with React Router

- must mention `<Router>` component from `@equinor/fusion-framework-react-router` as the top-level provider
- must mention route DSL helpers `layout`, `route`, `index`, `prefix` from `@equinor/fusion-framework-react-router/routes`
- must show that `layout` wraps children with a component that renders `<Outlet />`
- should mention `prefix` for path-only grouping without a component
- should mention that `<Router>` accepts a `routes` prop and optional `loader` for loading state

## How to access Fusion modules and custom context inside route loaders and actions

- must mention `fusion` argument injected into `clientLoader` and `action` functions
- must mention `fusion.modules` for accessing framework modules like HTTP clients
- must mention `fusion.context` for accessing custom app-level context
- must show `RouterContext` module augmentation for extending `fusion.context` with custom types
- should mention `RouteComponentProps` as the typed props for route components receiving `loaderData` and `fusion`
- should mention `ErrorElementProps` for error boundary components receiving `error` and `fusion`

## How to generate route schemas for app manifests from Fusion route definitions

- must mention `handle.route` export with `RouterSchema` containing `description`, `params`, and `search`
- must mention `toRouteSchema` from `@equinor/fusion-framework-react-router/schema` for flat schema extraction
- must explain that `toRouteSchema` walks the route tree and resolves module `handle` exports
- should mention `RouterHandle` type with `satisfies RouterHandle` for type-safe handle definitions
- should mention that route-level schema takes precedence over module-level schema when both exist

## How does the Vite plugin transform Fusion route DSL at build time

- must mention `fusionRouterPlugin` or `reactRouterPlugin` from `@equinor/fusion-framework-react-router/vite-plugin`
- must explain that the plugin transforms DSL calls (`layout`, `route`, `index`, `prefix`) into standard React Router `RouteObject` arrays
- must mention that the plugin inspects referenced module files for exports (`default`, `clientLoader`, `action`, `handle`, `ErrorElement`)
- should mention that the transformation enables code splitting and lazy loading
- should mention `debug` option for verbose build-time logging
