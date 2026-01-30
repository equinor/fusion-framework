---
"@equinor/fusion-framework-module-navigation": minor
---

Deprecate `NavigationProvider.createRouter` method in favor of `@equinor/fusion-framework-react-router`.

The `createRouter` method now emits a deprecation warning via telemetry when called. Applications should migrate to using `@equinor/fusion-framework-react-router` for new route definitions.

**Migration:** Replace `navigation.createRouter(routes)` with the React Router DSL from `@equinor/fusion-framework-react-router/routes`.

