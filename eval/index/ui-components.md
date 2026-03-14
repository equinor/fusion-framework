# UI & Components

Ensure results reference `@equinor/fusion-framework-react-app`, `@equinor/fusion-framework-react`, `@equinor/fusion-framework-react-ag-grid`, `@equinor/fusion-framework-react-ag-charts`, or `@equinor/fusion-framework-react-router`.
Verify that mentioned hooks, components, and configuration helpers are real exports from these packages.
Reject results that confuse framework-level module APIs with their React hook wrappers.

## How to bootstrap a Fusion React application

- must mention `renderApp` from `@equinor/fusion-framework-react-app` for one-line bootstrap
- must show an `AppModuleInitiator` configure callback for setting up modules
- must mention `useAppModule(key)` for type-safe module access from React components
- should mention `makeComponent` for lazy initialization wrapping
- should mention the `Framework` component from `@equinor/fusion-framework-react` as a declarative alternative
- should mention `createFrameworkProvider` for factory-based initialization with Suspense

## How to use Fusion React hooks for modules and data

- must mention `useHttpClient` for obtaining an HTTP client instance in React
- must mention `useCurrentContext` from the context sub-path for accessing the active context
- must mention `useCurrentUser` for getting the authenticated user
- should mention `useFramework` for accessing the active Fusion Framework instance
- should mention `useFrameworkModule(name)` for typed module retrieval
- should mention `useObservableState` from `@equinor/fusion-observable/react` for subscribing to observable state

## How to integrate AG Grid with Fusion Framework

- must mention `enableAgGrid` for module registration on the configurator
- must mention `AgGridReact` component from `@equinor/fusion-framework-react-ag-grid`
- must mention `useTheme` hook for accessing the active AG Grid theme
- should mention `fusionTheme` as the pre-built EDS-based theme
- should mention `setLicenseKey` on the configurator for enterprise features
- should mention theme inheritance from portal to apps via `createThemeFromTheme`

## How to use React Router with Fusion Framework

- must mention `Router` component from `@equinor/fusion-framework-react-router`
- must mention `useRouterContext` for accessing `modules` and `context` from routes
- must mention the route DSL helpers `layout`, `index`, `route`, and `prefix` from the `/routes` sub-path
- should mention `toRouteSchema` from `/schema` for converting route DSL to flat entries
- should mention `reactRouterPlugin` from `/vite-plugin` for build-time route transformation
- should mention `FusionRouterContext` type containing `modules` and `context`

## How to integrate AG Charts with Fusion Framework

- must mention `AgCharts` component from `@equinor/fusion-framework-react-ag-charts`
- must mention `AllCommunityModule` and `ModuleRegistry` from the `/community` sub-path
- must show `ModuleRegistry.registerModules` for chart module setup
- should mention `AgChartOptions` type for chart configuration
- should mention `AgChartsEnterpriseModule` from `/enterprise` for premium chart types
